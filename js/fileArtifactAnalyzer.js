// fileArtifactAnalyzer.js

document.addEventListener('DOMContentLoaded', () => {
    const fileUploadInput = document.getElementById('fileUpload');
    const analyzeFileBtn = document.getElementById('analyzeFileBtn');
    const fileHashMd5 = document.getElementById('fileHashMd5');
    const fileHashSha1 = document.getElementById('fileHashSha1');
    const fileHashSha256 = document.getElementById('fileHashSha256');
    const fileMetadataOutput = document.getElementById('fileMetadataOutput');
    const fileStringsOutput = document.getElementById('fileStringsOutput');
    const fileIocsList = document.getElementById('fileIocs');
    const exportFileHtmlBtn = document.getElementById('exportFileHtmlBtn');
    const exportFilePdfBtn = document.getElementById('exportFilePdfBtn');

    let currentFileAnalysisResults = null; // To store data for report generation

    analyzeFileBtn.addEventListener('click', async () => {
        const file = fileUploadInput.files[0];

        if (!file) {
            alert('Please select a file to analyze.');
            return;
        }

        clearFileResults();
        analyzeFileBtn.disabled = true;
        analyzeFileBtn.textContent = 'Analyzing...';

        try {
            const arrayBuffer = await file.arrayBuffer(); // Read file as ArrayBuffer

            // --- Hashing ---
            const hashes = await calculateHashes(arrayBuffer);
            fileHashMd5.textContent = hashes.md5;
            fileHashSha1.textContent = hashes.sha1;
            fileHashSha256.textContent = hashes.sha256;

            // --- String Extraction ---
            const fileContent = new TextDecoder('utf-8', { fatal: true }).decode(arrayBuffer)
                                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ''); // Remove non-printable ASCII (control characters)
            const printableStrings = extractPrintableStrings(fileContent);
            fileStringsOutput.textContent = printableStrings.join('\n');

            // --- File Metadata & IOC Extraction ---
            const fileInfo = {
                name: file.name,
                size: `${(file.size / (1024 * 1024)).toFixed(2)} MB (${file.size} bytes)`,
                type: file.type || 'Unknown',
                lastModified: new Date(file.lastModified).toLocaleString(),
                detectedFileType: detectFileSignature(arrayBuffer.slice(0, 512)), // Pass first 512 bytes for signature
                mimeType: file.type // Browser-detected MIME type
            };
            
            // Attempt to extract specific metadata based on detected type
            let specificMetadata = {};
            if (fileInfo.detectedFileType.includes('PE')) {
                specificMetadata = extractPeMetadata(arrayBuffer); // Placeholder for PE parsing
            } else if (fileInfo.detectedFileType.includes('PDF')) {
                specificMetadata = extractPdfMetadata(fileContent); // Placeholder for PDF parsing
            } else if (fileInfo.detectedFileType.includes('DOCX')) {
                specificMetadata = extractDocxMetadata(arrayBuffer); // Placeholder for DOCX parsing
            }

            fileMetadataOutput.textContent = JSON.stringify({ ...fileInfo, ...specificMetadata }, null, 2);

            // Basic IOC Extraction from strings
            const extractedIocs = extractIocsFromStrings(printableStrings);
            if (extractedIocs.length > 0) {
                fileIocsList.innerHTML = extractedIocs.map(ioc => `<li>${ioc.type}: ${ioc.value}</li>`).join('');
            } else {
                fileIocsList.innerHTML = '<li>No common IOCs found in strings.</li>';
            }

            // Store results for reporting
            currentFileAnalysisResults = {
                fileInfo,
                hashes,
                printableStrings,
                extractedIocs,
                specificMetadata,
                rawFileContent: fileContent // For comprehensive report if needed
            };

            // Enable export buttons
            exportFileHtmlBtn.disabled = false;
            exportFilePdfBtn.disabled = false;

        } catch (error) {
            console.error('File analysis failed:', error);
            fileMetadataOutput.textContent = `Error analyzing file: ${error.message}`;
            alert(`File analysis failed: ${error.message}. Check console for details.`);
        } finally {
            analyzeFileBtn.disabled = false;
            analyzeFileBtn.textContent = 'Analyze File';
        }
    });

    function clearFileResults() {
        fileHashMd5.textContent = '';
        fileHashSha1.textContent = '';
        fileHashSha256.textContent = '';
        fileMetadataOutput.textContent = '';
        fileStringsOutput.textContent = '';
        fileIocsList.innerHTML = '';
        exportFileHtmlBtn.disabled = true;
        exportFilePdfBtn.disabled = true;
        currentFileAnalysisResults = null;
    }

    // --- Hashing Functions (using Web Crypto API) ---
    async function calculateHashes(arrayBuffer) {
        const md5Buffer = await crypto.subtle.digest('MD5', arrayBuffer); // MD5 is not standard, might need polyfill or helper
        const sha1Buffer = await crypto.subtle.digest('SHA-1', arrayBuffer);
        const sha256Buffer = await crypto.subtle.digest('SHA-256', arrayBuffer);

        return {
            md5: bufferToHex(md5Buffer),
            sha1: bufferToHex(sha1Buffer),
            sha256: bufferToHex(sha256Buffer)
        };
    }

    function bufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // --- String Extraction ---
    function extractPrintableStrings(text) {
        // Regex to find sequences of 4 or more printable ASCII characters
        // \x20-\x7E covers standard printable ASCII
        const stringRegex = /[\x20-\x7E]{4,}/g;
        const matches = text.match(stringRegex);
        return matches || [];
    }

    // --- File Type Detection (Basic Signature Check) ---
    function detectFileSignature(headerBuffer) {
        const headerView = new Uint8Array(headerBuffer);
        const headerHex = bufferToHex(headerBuffer);

        if (headerView[0] === 0x4D && headerView[1] === 0x5A) { // 'MZ'
            return 'PE (Windows Executable)';
        }
        if (headerView[0] === 0x25 && headerView[1] === 0x50 && headerView[2] === 0x44 && headerView[3] === 0x46) { // '%PDF'
            return 'PDF Document';
        }
        if (headerView[0] === 0x50 && headerView[1] === 0x4B && headerView[2] === 0x03 && headerView[3] === 0x04) { // 'PK\x03\x04' - ZIP archive
            // DOCX, XLSX, PPTX are ZIP files. Need to check for specific internal files.
            // This is a heuristic. A proper check would involve unzipping and looking for [Content_Types].xml or _rels/.rels
            if (headerHex.includes('5b436f6e74656e745f54797065735d2e786d6c') || // [Content_Types].xml
                headerHex.includes('5f72656c732f2e72656c73')) { // _rels/.rels
                // This is a very weak heuristic as ZIP header doesn't contain these directly
                // A better approach requires JSZip library or similar for unzipping.
                // For now, if it's a ZIP and looks like it might contain Office XML, we suggest DOCX/XLSX/PPTX
                return 'Office Document (DOCX/XLSX/PPTX) or other ZIP';
            }
            return 'ZIP Archive';
        }
        // Add more signatures as needed
        return 'Unknown or Generic Binary';
    }

    // --- Placeholder functions for specific file metadata extraction ---
    // These functions represent where more advanced parsing would go.
    // Full implementation requires significant effort or specialized libraries.
    function extractPeMetadata(arrayBuffer) {
        const metadata = {};
        // Placeholder: In a real tool, you'd parse DOS header, NT headers, Section Table etc.
        // Example: Check for simple strings like 'This program cannot be run in DOS mode.'
        try {
            const decoder = new TextDecoder('ascii');
            const headerText = decoder.decode(arrayBuffer.slice(0, 512));
            if (headerText.includes('This program cannot be run in DOS mode.')) {
                metadata.isPe = true;
                metadata.peWarning = 'Requires advanced PE parsing for full details.';
            }
        } catch (e) { /* ignore */ }
        return metadata;
    }

    function extractPdfMetadata(fileContent) {
        const metadata = {};
        // Placeholder: Search for /Creator, /Producer, /Title keywords in the PDF header
        const creatorMatch = fileContent.match(/\/Creator\s*\((.*?)\)/i);
        if (creatorMatch) metadata.Creator = creatorMatch[1];
        const titleMatch = fileContent.match(/\/Title\s*\((.*?)\)/i);
        if (titleMatch) metadata.Title = titleMatch[1];
        const producerMatch = fileContent.match(/\/Producer\s*\((.*?)\)/i);
        if (producerMatch) metadata.Producer = producerMatch[1];
        if (Object.keys(metadata).length > 0) {
            metadata.pdfInfo = 'Basic PDF metadata extracted.';
        } else {
            metadata.pdfInfo = 'Requires advanced PDF parsing for full details.';
        }
        return metadata;
    }

    function extractDocxMetadata(arrayBuffer) {
        const metadata = {};
        // DOCX is a ZIP file. To get real metadata (author, creation time),
        // you need to unzip it and parse 'docProps/core.xml'.
        // This is not feasible in pure vanilla JS without a ZIP library.
        // As a very basic heuristic, if the file is detected as a ZIP, we can say it's likely an Office file.
        // A proper solution would use something like JSZip library for unzipping.
        metadata.docxWarning = 'Requires ZIP decompression and XML parsing for full DOCX metadata. Vanilla JS limitations apply.';
        return metadata;
    }

    // --- Basic IOC Extraction from Strings ---
    function extractIocsFromStrings(strings) {
        const iocs = new Set();
        // Regex for IPs (IPv4 only for simplicity)
        const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
        // Regex for simple domains
        const domainRegex = /\b(?:[a-zA-Z0-9-]+\.){1,}[a-zA-Z]{2,}(?::\d{1,5})?\b/g;
        // Regex for SHA256, SHA1, MD5 (basic, case-insensitive)
        const sha256Regex = /\b[a-f0-9]{64}\b/gi;
        const sha1Regex = /\b[a-f0-9]{40}\b/gi;
        const md5Regex = /\b[a-f0-9]{32}\b/gi;


        strings.forEach(s => {
            let match;
            while ((match = ipRegex.exec(s)) !== null) {
                // Exclude common local/private IPs and loopbacks from 'IOC'
                if (!match[0].startsWith('127.') && !match[0].startsWith('192.168.') &&
                    !match[0].startsWith('10.') && !match[0].startsWith('172.16.') &&
                    !match[0].startsWith('172.31.')) {
                    iocs.add(JSON.stringify({ type: 'IPv4', value: match[0] }));
                }
            }
            while ((match = domainRegex.exec(s)) !== null) {
                // Simple domain validation (e.g., exclude single words, common filenames)
                if (match[0].includes('.') && !match[0].endsWith('.exe') && !match[0].endsWith('.dll')) {
                    iocs.add(JSON.stringify({ type: 'Domain', value: match[0] }));
                }
            }
            while ((match = sha256Regex.exec(s)) !== null) {
                iocs.add(JSON.stringify({ type: 'SHA256', value: match[0].toLowerCase() }));
            }
            while ((match = sha1Regex.exec(s)) !== null) {
                iocs.add(JSON.stringify({ type: 'SHA1', value: match[0].toLowerCase() }));
            }
            while ((match = md5Regex.exec(s)) !== null) {
                iocs.add(JSON.stringify({ type: 'MD5', value: match[0].toLowerCase() }));
            }
        });
        return Array.from(iocs).map(s => JSON.parse(s));
    }

    // --- Report Generation Integration (Delegated to reportGenerator.js) ---
    exportFileHtmlBtn.addEventListener('click', () => {
        if (!currentFileAnalysisResults || !window.generateHtmlReport) {
            alert('No file analysis results to export or report generator not loaded.');
            return;
        }

        const { fileInfo, hashes, printableStrings, extractedIocs, specificMetadata } = currentFileAnalysisResults;
        const reportTitle = 'File Artifact Analysis Report';
        let reportContent = `
            <h3>File Information:</h3>
            <pre>${JSON.stringify(fileInfo, null, 2)}</pre>
            ${Object.keys(specificMetadata).length > 0 ? `<h3>Specific Metadata:</h3><pre>${JSON.stringify(specificMetadata, null, 2)}</pre>` : ''}
            <h3>File Hashes:</h3>
            <p><strong>MD5:</strong> ${hashes.md5}</p>
            <p><strong>SHA1:</strong> ${hashes.sha1}</p>
            <p><strong>SHA256:</strong> ${hashes.sha256}</p>
            <h3>Printable Strings:</h3>
            <pre style="max-height: 300px; overflow-y: auto;">${printableStrings.join('\n')}</pre>
            <h3>IOCs Found:</h3>
            <ul>${extractedIocs.map(ioc => `<li>${ioc.type}: ${ioc.value}</li>`).join('') || '<li>No common IOCs found.</li>'}</ul>
        `;
        window.generateHtmlReport(reportTitle, reportContent);
    });

    exportFilePdfBtn.addEventListener('click', () => {
        if (!currentFileAnalysisResults || !window.generatePdfReport) {
            alert('No file analysis results to export or report generator not loaded.');
            return;
        }

        const { fileInfo, hashes, printableStrings, extractedIocs, specificMetadata } = currentFileAnalysisResults;
        const doc = new window.jspdf.jsPDF();
        let yPos = 20;

        doc.setFontSize(18);
        doc.text('File Artifact Analysis Report', 10, yPos);
        yPos += 10;
        doc.setFontSize(10);
        doc.text(`Date: ${new Date().toLocaleString()}`, 10, yPos);
        yPos += 15;

        // File Information
        doc.setFontSize(12);
        doc.text('File Information:', 10, yPos);
        yPos += 7;
        doc.setFontSize(10);
        let fileInfoText = JSON.stringify(fileInfo, null, 2);
        doc.text(fileInfoText, 15, yPos, { maxWidth: 180, lineHeightFactor: 1.2 });
        yPos += fileInfoText.split('\n').length * 4;
        yPos += 10;

        // Specific Metadata (if any)
        if (Object.keys(specificMetadata).length > 0) {
            doc.setFontSize(12);
            doc.text('Specific Metadata:', 10, yPos);
            yPos += 7;
            doc.setFontSize(10);
            let specificMetadataText = JSON.stringify(specificMetadata, null, 2);
            doc.text(specificMetadataText, 15, yPos, { maxWidth: 180, lineHeightFactor: 1.2 });
            yPos += specificMetadataText.split('\n').length * 4;
            yPos += 10;
        }


        // Hashes
        doc.setFontSize(12);
        doc.text('File Hashes:', 10, yPos);
        yPos += 7;
        doc.setFontSize(10);
        doc.text(`MD5: ${hashes.md5}`, 15, yPos); yPos += 7;
        doc.text(`SHA1: ${hashes.sha1}`, 15, yPos); yPos += 7;
        doc.text(`SHA256: ${hashes.sha256}`, 15, yPos); yPos += 10;

        // Printable Strings (truncated for PDF)
        doc.setFontSize(12);
        doc.text('Printable Strings (first 100 lines):', 10, yPos);
        yPos += 7;
        doc.setFontSize(8);
        let stringsForPdf = printableStrings.slice(0, 100).join('\n'); // Limit for PDF
        if (printableStrings.length > 100) stringsForPdf += '\n... (truncated)';
        doc.text(stringsForPdf, 15, yPos, { maxWidth: 180, lineHeightFactor: 1.1 });
        yPos += (stringsForPdf.split('\n').length * 3); // Estimate height
        yPos += 10;

        // IOCs Found
        doc.setFontSize(12);
        doc.text('IOCs Found:', 10, yPos);
        yPos += 7;
        doc.setFontSize(10);
        if (extractedIocs.length > 0) {
            extractedIocs.forEach(ioc => {
                doc.text(`${ioc.type}: ${ioc.value}`, 15, yPos);
                yPos += 7;
            });
        } else {
            doc.text('No common IOCs found.', 15, yPos);
            yPos += 7;
        }

        doc.save('file_analysis_report.pdf');
    });

    // Initial state: disable export buttons
    exportFileHtmlBtn.disabled = true;
    exportFilePdfBtn.disabled = true;
});