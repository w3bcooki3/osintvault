// emailThreatAnalyzer.js

document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('emailInput');
    const analyzeEmailBtn = document.getElementById('analyzeEmailBtn');
    const emailMetadataOutput = document.getElementById('emailMetadata');
    const emailUrlsIpsList = document.getElementById('emailUrlsIps');
    const emailAuthSummaryOutput = document.getElementById('emailAuthSummary');
    const emailSuspicionScoreOutput = document.getElementById('emailSuspicionScore');
    const exportEmailHtmlBtn = document.getElementById('exportEmailHtmlBtn');
    const exportEmailPdfBtn = document.getElementById('exportEmailPdfBtn');

    analyzeEmailBtn.addEventListener('click', () => {
        const rawEmail = emailInput.value.trim();

        if (!rawEmail) {
            alert('Please paste the raw email content to analyze.');
            return;
        }

        clearEmailResults(); // Clear previous results

        try {
            const { headers, body } = parseEmailHeadersAndBody(rawEmail);
            const metadata = extractEmailMetadata(headers);
            const { urls, ips } = extractUrlsAndIps(headers, body);
            const authSummary = parseEmailAuthentication(headers);
            const suspicionScore = calculateSuspicionScore(metadata, urls, ips, authSummary, body);

            // Display Results
            emailMetadataOutput.textContent = JSON.stringify(metadata, null, 2);

            if (urls.length > 0 || ips.length > 0) {
                emailUrlsIpsList.innerHTML = '';
                urls.forEach(url => {
                    const li = document.createElement('li');
                    li.textContent = `URL: ${url}`;
                    emailUrlsIpsList.appendChild(li);
                });
                ips.forEach(ip => {
                    const li = document.createElement('li');
                    li.textContent = `IP: ${ip}`;
                    emailUrlsIpsList.appendChild(li);
                });
            } else {
                emailUrlsIpsList.innerHTML = '<li>No URLs or IPs found.</li>';
            }


            emailAuthSummaryOutput.textContent = authSummary;
            emailSuspicionScoreOutput.innerHTML = `<strong>Score: ${suspicionScore.score}/10</strong><br>${suspicionScore.reasons.join('<br>')}`;

            // Enable export buttons
            exportEmailHtmlBtn.disabled = false;
            exportEmailPdfBtn.disabled = false;

        } catch (error) {
            console.error('Error analyzing email:', error);
            emailMetadataOutput.textContent = `Error analyzing email: ${error.message}. Please ensure the email format is correct.`;
            clearEmailResults(true); // Clear all except error message
        }
    });

    function clearEmailResults(keepErrorMessage = false) {
        if (!keepErrorMessage) {
            emailMetadataOutput.textContent = '';
        }
        emailUrlsIpsList.innerHTML = '';
        emailAuthSummaryOutput.textContent = '';
        emailSuspicionScoreOutput.textContent = '';
        exportEmailHtmlBtn.disabled = true;
        exportEmailPdfBtn.disabled = true;
    }

    // --- Core Parsing Functions ---

    function parseEmailHeadersAndBody(rawEmail) {
        const headerBodySeparator = /\r?\n\r?\n/; // Common email header/body separator
        const parts = rawEmail.split(headerBodySeparator);
        const headersRaw = parts[0];
        const bodyRaw = parts.slice(1).join('\n\n'); // Join remaining parts as body

        const headers = {};
        headersRaw.split(/\r?\n/).forEach(line => {
            const match = line.match(/^([^:]+):\s*(.*)$/);
            if (match) {
                const name = match[1].trim();
                const value = match[2].trim();
                // Handle folded headers (lines starting with whitespace)
                if (headers[name]) {
                    headers[name] += ' ' + value;
                } else {
                    headers[name] = value;
                }
            } else if (line.match(/^\s/)) { // Continuation of a folded header
                const lastHeaderName = Object.keys(headers).pop();
                if (lastHeaderName) {
                    headers[lastHeaderName] += ' ' + line.trim();
                }
            }
        });

        return { headers, body: decodeBase64IfNecessary(bodyRaw, headers['Content-Transfer-Encoding']) };
    }

    function decodeBase64IfNecessary(body, encodingHeader) {
        if (encodingHeader && encodingHeader.toLowerCase().includes('base64')) {
            try {
                // Remove any non-base64 characters like whitespace
                const cleanBody = body.replace(/[^A-Za-z0-9+/=]/g, "");
                return atob(cleanBody);
            } catch (e) {
                console.warn('Base64 decoding failed, returning raw body:', e);
                return body; // Return original body if decoding fails
            }
        }
        return body;
    }


    function extractEmailMetadata(headers) {
        return {
            From: headers['From'] || 'N/A',
            To: headers['To'] || 'N/A',
            Subject: headers['Subject'] || 'N/A',
            'X-Mailer': headers['X-Mailer'] || 'N/A',
            'Date': headers['Date'] || 'N/A',
            'Message-ID': headers['Message-ID'] || 'N/A',
            'Content-Type': headers['Content-Type'] || 'N/A',
            'MIME-Version': headers['MIME-Version'] || 'N/A',
            // Add more common headers as needed
        };
    }

    function extractUrlsAndIps(headers, body) {
        const urls = new Set();
        const ips = new Set();

        // Regex for URLs (simple, not exhaustive)
        const urlRegex = /(https?:\/\/[^\s"<>]+)/g;
        // Regex for IPv4 addresses (simple)
        const ipV4Regex = /(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?![0-9])/g;
        // Basic Regex for IPv6 addresses (complex, this is simplified)
        const ipV6Regex = /([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:([0-9a-fA-F]{1,4}){1,7}/g;


        // Search in headers
        for (const key in headers) {
            const headerValue = headers[key];
            let match;
            while ((match = urlRegex.exec(headerValue)) !== null) {
                urls.add(match[0]);
            }
            while ((match = ipV4Regex.exec(headerValue)) !== null) {
                ips.add(match[0]);
            }
             while ((match = ipV6Regex.exec(headerValue)) !== null) {
                ips.add(match[0]);
            }
        }

        // Search in body
        let match;
        while ((match = urlRegex.exec(body)) !== null) {
            urls.add(match[0]);
        }
        while ((match = ipV4Regex.exec(body)) !== null) {
            ips.add(match[0]);
        }
        while ((match = ipV6Regex.exec(body)) !== null) {
            ips.add(match[0]);
        }

        return { urls: Array.from(urls), ips: Array.from(ips) };
    }

    function parseEmailAuthentication(headers) {
        let summary = [];

        // SPF
        const receivedSpf = headers['Received-SPF'];
        if (receivedSpf) {
            summary.push(`SPF: ${receivedSpf}`);
        }

        // DKIM (Authentication-Results header is common)
        const authResults = headers['Authentication-Results'];
        if (authResults) {
            summary.push(`Authentication-Results: ${authResults}`);
            if (authResults.toLowerCase().includes('dkim=pass')) {
                summary.push('DKIM: PASS');
            } else if (authResults.toLowerCase().includes('dkim=fail')) {
                summary.push('DKIM: FAIL');
            }
        }
        const dkimSignature = headers['DKIM-Signature'];
        if (dkimSignature) {
            summary.push(`DKIM-Signature present`);
        }

        // DMARC (often indicated by Authentication-Results or a dedicated header)
        // DMARC usually involves parsing 'Authentication-Results' or checking for 'DMARC-Report-URI' (less common in received emails)
        if (authResults && authResults.toLowerCase().includes('dmarc=pass')) {
            summary.push('DMARC: PASS');
        } else if (authResults && authResults.toLowerCase().includes('dmarc=fail')) {
            summary.push('DMARC: FAIL');
        } else if (authResults && authResults.toLowerCase().includes('dmarc=temperror')) {
            summary.push('DMARC: TempError');
        } else if (authResults && authResults.toLowerCase().includes('dmarc=permerror')) {
            summary.push('DMARC: PermError');
        } else if (authResults && authResults.toLowerCase().includes('dmarc=none')) {
            summary.push('DMARC: NONE');
        }

        if (summary.length === 0) {
            return 'No explicit SPF/DKIM/DMARC headers found or parsed.';
        }
        return summary.join('\n');
    }

    function calculateSuspicionScore(metadata, urls, ips, authSummary, body) {
        let score = 0;
        const reasons = [];

        // --- Metadata based checks ---
        // 1. Missing or unusual From/Subject
        if (metadata.From === 'N/A' || metadata.Subject === 'N/A') {
            score += 2;
            reasons.push('Missing From or Subject header.');
        }
        // Very basic check for suspicious sender domains (e.g., free email domains pretending to be corporate)
        if (metadata.From.includes('@gmail.com') && !metadata.From.includes('gmail.com>')) {
            // This is a simplistic check for a display name trying to hide a real email address
            // e.g. "CEO Name <malicious@gmail.com>"
            // More advanced: check if sender domain differs from declared sender domain in 'From'
        }

        // 2. Presence of X-Mailer (sometimes legitimate, sometimes absent in spam)
        if (metadata['X-Mailer'] === 'N/A' || metadata['X-Mailer'].toLowerCase().includes('phpmailer')) {
             // Too broad, but as an example
            // score += 0.5; reasons.push('Unusual or missing X-Mailer.');
        }

        // --- URL/IP based checks ---
        // 3. High number of URLs
        if (urls.length > 5) {
            score += 1;
            reasons.push(`High number of URLs (${urls.length}) detected.`);
        }
        // 4. URL obfuscation (very basic: presence of IP in URL, excessive encoding, or mixed case)
        const hasObfuscatedUrl = urls.some(url =>
            url.includes('%') || // URL encoding
            url.includes('&#') || // HTML entities
            /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/.test(new URL(url).hostname || '') // IP in hostname
        );
        if (hasObfuscatedUrl) {
            score += 2;
            reasons.push('Potential URL obfuscation detected.');
        }
        // 5. Direct IP in email (less common for legitimate communication)
        if (ips.length > 0 && !urls.some(url => ips.some(ip => url.includes(ip)))) {
            score += 1;
            reasons.push(`Direct IP addresses (${ips.length}) found without associated domains.`);
        }


        // --- Authentication Results based checks ---
        // 6. SPF/DKIM/DMARC failures
        if (authSummary.toLowerCase().includes('dkim: fail') || authSummary.toLowerCase().includes('spf: fail') || authSummary.toLowerCase().includes('dmarc: fail')) {
            score += 3;
            reasons.push('Email authentication (SPF/DKIM/DMARC) failed.');
        } else if (authSummary.toLowerCase().includes('dkim: none') || authSummary.toLowerCase().includes('spf: none') || authSummary.toLowerCase().includes('dmarc: none')) {
            score += 1;
            reasons.push('Email authentication (SPF/DKIM/DMARC) not found or not enforced.');
        }

        // --- Body content checks ---
        // 7. Base64 encoding in body (if not expected, could be suspicious)
        if (body.match(/^[A-Za-z0-9+/=\s]+$/) && body.includes('=')) { // Simple check for base64-like content
            if (metadata['Content-Transfer-Encoding'] && !metadata['Content-Transfer-Encoding'].toLowerCase().includes('base64')) {
                score += 1;
                reasons.push('Unusual base64-like encoding in body without header.');
            }
        }
        // 8. Large email size (can indicate embedded content or obfuscation) - not directly implementable without full body size
        // 9. Common phishing keywords (simple example)
        const phishingKeywords = ['invoice', 'payment', 'urgent', 'account', 'verify', 'password', 'suspicious activity'];
        const lowerBody = body.toLowerCase();
        const foundKeywords = phishingKeywords.filter(keyword => lowerBody.includes(keyword));
        if (foundKeywords.length > 0) {
            score += 0.5 * foundKeywords.length; // Minor increase per keyword
            reasons.push(`Contains suspicious keywords: ${foundKeywords.join(', ')}`);
        }


        // Cap score at 10 for simplicity
        score = Math.min(score, 10);
        // Ensure reasons array is not empty if score is > 0
        if (score > 0 && reasons.length === 0) {
            reasons.push('General suspicious indicators detected.');
        } else if (score === 0) {
            reasons.push('No obvious suspicious indicators found (score 0).');
        }

        return { score: score.toFixed(1), reasons: reasons };
    }

    // --- Report Generation Integration (Delegated to reportGenerator.js) ---
    exportEmailHtmlBtn.addEventListener('click', () => {
        const reportTitle = 'Email Threat Analysis Report';
        let reportContent = `
            <h3>Extracted Metadata:</h3>
            <pre>${emailMetadataOutput.textContent}</pre>
            <h3>URLs & IPs:</h3>
            <ul>${emailUrlsIpsList.innerHTML}</ul>
            <h3>SPF/DKIM/DMARC Summary:</h3>
            <pre>${emailAuthSummaryOutput.textContent}</pre>
            <h3>Suspicion Score:</h3>
            <p>${emailSuspicionScoreOutput.innerHTML}</p>
        `;
        if (window.generateHtmlReport) {
            window.generateHtmlReport(reportTitle, reportContent);
        } else {
            alert('Report generator not loaded.');
        }
    });

    exportEmailPdfBtn.addEventListener('click', () => {
        if (window.generatePdfReport) {
            const doc = new window.jspdf.jsPDF();
            let yPos = 20;

            doc.setFontSize(18);
            doc.text('Email Threat Analysis Report', 10, yPos);
            yPos += 10;
            doc.setFontSize(10);
            doc.text(`Date: ${new Date().toLocaleString()}`, 10, yPos);
            yPos += 15;

            doc.setFontSize(12);
            doc.text('Extracted Metadata:', 10, yPos);
            yPos += 7;
            doc.setFontSize(10);
            doc.text(emailMetadataOutput.textContent, 15, yPos, { maxWidth: 180, lineHeightFactor: 1.2 });
            yPos += emailMetadataOutput.textContent.split('\n').length * 4; // Estimate height
            yPos += 10;

            doc.setFontSize(12);
            doc.text('URLs & IPs:', 10, yPos);
            yPos += 7;
            emailUrlsIpsList.querySelectorAll('li').forEach(li => {
                doc.setFontSize(10);
                doc.text(li.textContent, 15, yPos);
                yPos += 7;
            });
            yPos += 10;

            doc.setFontSize(12);
            doc.text('SPF/DKIM/DMARC Summary:', 10, yPos);
            yPos += 7;
            doc.setFontSize(10);
            doc.text(emailAuthSummaryOutput.textContent, 15, yPos, { maxWidth: 180, lineHeightFactor: 1.2 });
            yPos += emailAuthSummaryOutput.textContent.split('\n').length * 4;
            yPos += 10;

            doc.setFontSize(12);
            doc.text('Suspicion Score:', 10, yPos);
            yPos += 7;
            doc.setFontSize(10);
            doc.text(emailSuspicionScoreOutput.innerText, 15, yPos, { maxWidth: 180, lineHeightFactor: 1.2 });

            doc.save('email_analysis_report.pdf');
        } else {
            alert('Report generator (jsPDF) not loaded.');
        }
    });

    // Initial state: disable export buttons
    exportEmailHtmlBtn.disabled = true;
    exportEmailPdfBtn.disabled = true;
});