// reportGenerator.js

document.addEventListener('DOMContentLoaded', () => {
    // This module primarily exposes functions, it doesn't have much UI
    // So, we'll just define the functions here and make them available globally.

    window.generateHtmlReport = (reportTitle, reportContent) => {
        const timestamp = new Date().toLocaleString();
        const analystName = prompt('Enter Analyst Name for the report:');
        if (!analystName) {
            alert('Analyst name is required for the report.');
            return;
        }

        const fullReportHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${reportTitle}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; }
                    h1 { color: #3498db; border-bottom: 2px solid #3498db; padding-bottom: 5px; }
                    h3 { color: #3498db; margin-top: 20px; }
                    pre { background-color: #f4f4f4; padding: 10px; border: 1px solid #ddd; overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    ul { list-style-type: none; padding: 0; }
                    li { padding: 5px 0; border-bottom: 1px dotted #ddd; }
                    li:last-child { border-bottom: none; }
                </style>
            </head>
            <body>
                <h1>${reportTitle}</h1>
                <p><strong>Timestamp:</strong> ${timestamp}</p>
                <p><strong>Analyst:</strong> ${analystName}</p>
                ${reportContent}
            </body>
            </html>
        `;

        const blob = new Blob([fullReportHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportTitle.replace(/\s+/g, '_')}.html`;
        document.body.appendChild(a); // Required for Firefox
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    window.generatePdfReport = (reportTitle, headers, data) => {
        if (!window.jspdf) {
            alert('jsPDF library is not loaded. PDF export will not work.');
            return;
        }

        const doc = new window.jspdf.jsPDF();
        let yPos = 20;

        // Title and Metadata
        doc.setFontSize(18);
        doc.text(reportTitle, 10, yPos);
        yPos += 10;
        doc.setFontSize(10);
        doc.text(`Date: ${new Date().toLocaleString()}`, 10, yPos);
        yPos += 7;
        const analystName = prompt('Enter Analyst Name for the report:');
        if (!analystName) {
            alert('Analyst name is required for the report.');
            return;
        }
        doc.text(`Analyst: ${analystName}`, 10, yPos);
        yPos += 15;

        // Table (if data is provided)
        if (headers && data && data.length > 0) {
            doc.autoTable({
                head: [headers],
                body: data,
                startY: yPos,
                margin: { top: 10 },
                headStyles: { fillColor: '#3498db', textColor: '#fff', fontStyle: 'bold' },
                columnStyles: { 0: { fontStyle: 'bold' } }, // Make first column bold
                didDrawPage: (data) => {
                    // Reset yPos for new pages
                    yPos = 20;
                    doc.setFontSize(10);
                    doc.text(`Page ${data.pageNumber}`, 10, doc.internal.pageSize.height - 10);
                }
            });
        } else {
            doc.setFontSize(12);
            doc.text('No tabular data to export.', 10, yPos);
            yPos += 10;
        }

        doc.save(`${reportTitle.replace(/\s+/g, '_')}.pdf`);
    };
});