// Ensure appState is accessible, assuming it's declared in app.js or a global scope.
// If appState is not global, you might need to adjust how it's imported/exported.

const reportsLocalStorageKey = 'osintReports'; // Key for storing reports in localStorage

/**
 * Loads the reports state from localStorage into appState.
 * Initializes appState.reports if no data is found or parsing fails.
 * Ensures report IDs, creation dates, and update dates are properly set.
 */
function loadReportsState() {
    const savedReports = localStorage.getItem(reportsLocalStorageKey);
    if (savedReports) {
        try {
            appState.reports = JSON.parse(savedReports);
            // Ensure IDs are unique, or generate if missing (for older data)
            appState.reports.forEach(report => {
                if (!report.id) report.id = generateId();
                if (!report.createdAt) report.createdAt = new Date(); // Convert to Date object
                if (!report.updatedAt) report.updatedAt = new Date(); // Convert to Date object
            });
        } catch (e) {
            console.error("Error parsing saved reports, starting fresh:", e);
            appState.reports = [];
        }
    } else {
        appState.reports = [];
    }
    appState.currentReportId = null; // No report loaded by default on app start
}

/**
 * Saves the current reports state from appState to localStorage.
 * Also marks the app as having unsaved changes.
 */
function saveReportsState() {
    localStorage.setItem(reportsLocalStorageKey, JSON.stringify(appState.reports));
    markAsUnsaved(); // Mark app state as having unsaved changes
}

/**
 * Initializes the Report Editor module.
 * Loads existing reports, binds UI events, and sets up the initial editor state.
 */
function initReportEditor() {
    loadReportsState();
    bindReportEditorEvents();
    populateReportLoadDropdown();
    // Initially, clear the editor or load a new blank report if no current one
    newReport();

    // Ensure current tab is set correctly on app load
    if (appState.currentTab === 'report-editor') {
        switchTab('report-editor'); // Re-activates the tab, which should call initReportEditor or re-render
    }

    // Apply read-only mode if necessary
    applyReadOnlyModeToReportEditor();
}

/**
 * Applies read-only mode to the report editor UI elements.
 * Disables inputs, buttons, and contenteditable area if appState.readOnlyMode is true.
 */
function applyReadOnlyModeToReportEditor() {
    const isReadOnly = appState.readOnlyMode;
    const reportTitleInput = document.getElementById('reportTitleInput');
    const reportContentEditor = document.getElementById('reportContentEditor');
    const newReportBtn = document.getElementById('newReportBtn');
    const loadReportSelect = document.getElementById('loadReportSelect');
    const saveReportBtn = document.getElementById('saveReportBtn');
    const exportReportOptionsBtn = document.getElementById('exportReportOptionsBtn');
    const deleteReportBtn = document.getElementById('deleteReportBtn');
    const reportEditorToolbar = document.getElementById('reportEditorToolbar');

    if (reportTitleInput) reportTitleInput.readOnly = isReadOnly;
    if (reportContentEditor) reportContentEditor.contentEditable = !isReadOnly;

    if (newReportBtn) newReportBtn.disabled = isReadOnly;
    if (loadReportSelect) loadReportSelect.disabled = isReadOnly;
    if (saveReportBtn) saveReportBtn.disabled = isReadOnly;
    if (exportReportOptionsBtn) exportReportOptionsBtn.disabled = isReadOnly;
    if (deleteReportBtn) deleteReportBtn.disabled = isReadOnly;

    if (reportEditorToolbar) {
        reportEditorToolbar.querySelectorAll('button, select').forEach(el => {
            el.disabled = isReadOnly;
        });
    }
}

/**
 * Binds event listeners to the report editor's toolbar and controls.
 */
function bindReportEditorEvents() {
    const toolbar = document.getElementById('reportEditorToolbar');
    const editor = document.getElementById('reportContentEditor');
    const reportTitleInput = document.getElementById('reportTitleInput');

    if (!toolbar || !editor || !reportTitleInput) {
        console.error("Report editor elements not found. Check HTML structure.");
        return;
    }

    // Toolbar formatting commands
    toolbar.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button && button.dataset.command) {
            const command = button.dataset.command;
            handleEditorCommand(command);
        }
    });

    toolbar.addEventListener('change', (e) => {
        const select = e.target.closest('select');
        if (select && select.dataset.command) {
            const command = select.dataset.command;
            const value = select.value;
            handleEditorCommand(command, value);
            select.value = ''; // Reset select to default/placeholder
        }
    });

    // Basic Save/Load/New/Delete events
    document.getElementById('newReportBtn').addEventListener('click', newReport);
    document.getElementById('saveReportBtn').addEventListener('click', saveCurrentReport);
    document.getElementById('loadReportSelect').addEventListener('change', loadSelectedReport);
    document.getElementById('deleteReportBtn').addEventListener('click', deleteCurrentReport);
    document.getElementById('exportReportOptionsBtn').addEventListener('click', () => showModal('exportReportOptionsModal'));

    // Export/Print modal buttons
    document.getElementById('exportReportHtmlBtn').addEventListener('click', () => exportCurrentReport('html'));
    document.getElementById('exportReportTxtBtn').addEventListener('click', () => exportCurrentReport('txt'));
    document.getElementById('printReportBtn').addEventListener('click', printCurrentReport);

    // Editor input listener for unsaved changes
    editor.addEventListener('input', () => markAsUnsaved());
    reportTitleInput.addEventListener('input', () => markAsUnsaved());

    // Handle image paste and drag-and-drop
    editor.addEventListener('paste', handleEditorPaste);
    editor.addEventListener('dragover', handleEditorDragOver);
    editor.addEventListener('drop', handleEditorDrop);
}

/**
 * Executes a formatting command on the contenteditable editor.
 * @param {string} command - The document.execCommand command name.
 * @param {string} [value=null] - The value argument for the command.
 */
function handleEditorCommand(command, value = null) {
    const editor = document.getElementById('reportContentEditor');
    if (appState.readOnlyMode || editor.contentEditable === 'false') {
        showToast("Editor is in read-only mode.", "warning");
        return;
    }

    editor.focus(); // Ensure editor is focused before executing command

    if (command === 'createLink') {
        let url = prompt('Enter the URL:');
        if (url) {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url; // Prepend https for convenience
            }
            document.execCommand(command, false, url);
        }
    } else if (command === 'insertImage') {
        let imageUrl = prompt('Enter the image URL:');
        if (imageUrl) {
            document.execCommand('insertImage', false, imageUrl);
        }
    } else if (command === 'createCodeBlock') {
        wrapSelectionInTag('pre', 'code');
    } else if (command === 'createQuoteBlock') {
        wrapSelectionInTag('blockquote');
    } else if (command === 'createCommandLine') {
        wrapSelectionInTag('pre', 'cli');
    } else if (command === 'insertTable') {
        insertTablePrompt();
    } else if (command === 'fontSize' || command === 'foreColor' || command === 'backColor') {
         document.execCommand(command, false, value);
    }
    else {
        document.execCommand(command, false, value);
    }
    markAsUnsaved(); // Mark as unsaved after any editor command
}

/**
 * Wraps the current selection in a new HTML tag with an optional class.
 * If no text is selected, inserts an empty block for the user to type into.
 * @param {string} tag - The HTML tag name (e.g., 'pre', 'blockquote').
 * @param {string} [className=''] - An optional CSS class to add to the new element.
 */
function wrapSelectionInTag(tag, className = '') {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedContent = range.extractContents();
        const element = document.createElement(tag);
        if (className) {
            element.classList.add(className);
        }
        element.appendChild(selectedContent);
        range.insertNode(element);
        // Re-select the new element for easier continued typing within it
        const newRange = document.createRange();
        newRange.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(newRange);
    } else {
         // If no text is selected, insert an empty block for the user to type into
        const element = document.createElement(tag);
        if (className) {
            element.classList.add(className);
        }
        element.innerHTML = '<br>'; // Placeholder for cursor
        document.getElementById('reportContentEditor').appendChild(element);
        const newRange = document.createRange();
        newRange.setStart(element, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }
    markAsUnsaved();
}

/**
 * Prompts the user for table dimensions and inserts an HTML table into the editor.
 */
function insertTablePrompt() {
    const rows = prompt("Enter number of rows (e.g., 3):");
    const cols = prompt("Enter number of columns (e.g., 3):");

    if (rows && cols && !isNaN(rows) && !isNaN(cols) && rows > 0 && cols > 0) {
        let tableHtml = '<table><thead><tr>';
        for (let i = 0; i < cols; i++) {
            tableHtml += `<th>Header ${i + 1}</th>`;
        }
        tableHtml += '</tr></thead><tbody>';
        for (let i = 0; i < rows; i++) {
            tableHtml += '<tr>';
            for (let j = 0; j < cols; j++) {
                tableHtml += `<td>Cell ${i + 1}-${j + 1}</td>`;
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table>';
        document.execCommand('insertHTML', false, tableHtml);
        markAsUnsaved();
    } else {
        showToast("Invalid row or column count for table.", "error");
    }
}

/**
 * Handles paste events in the editor, allowing image and formatted text pasting.
 * Converts pasted images to Data URLs for local storage.
 * @param {ClipboardEvent} e - The paste event.
 */
async function handleEditorPaste(e) {
    if (appState.readOnlyMode) return;

    e.preventDefault();
    const clipboardData = e.clipboardData;

    // Handle image paste
    for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];
        if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                document.execCommand('insertHTML', false, img.outerHTML);
                markAsUnsaved();
            };
            reader.readAsDataURL(blob);
            return;
        }
    }

    // Handle text paste
    const text = clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    markAsUnsaved();
}

/**
 * Handles dragover event for the editor, allowing drag-and-drop operations.
 * @param {DragEvent} e - The drag event.
 */
function handleEditorDragOver(e) {
    if (appState.readOnlyMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

/**
 * Handles drop events for the editor, allowing image files and URLs to be dropped.
 * Converts dropped image files to Data URLs.
 * Embeds video and GIF URLs if recognized.
 * @param {DragEvent} e - The drop event.
 */
async function handleEditorDrop(e) {
    if (appState.readOnlyMode) return;
    e.preventDefault();
    const files = e.dataTransfer.files;

    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    document.execCommand('insertHTML', false, img.outerHTML);
                    markAsUnsaved();
                };
                reader.readAsDataURL(file);
            }
            // Could add video/audio handling here if needed for local files, similar to image
        }
    } else {
        // Handle dropped text/URLs from other applications
        const text = e.dataTransfer.getData('text/plain');
        if (text) {
            // Attempt to embed YouTube, MP4, GIF if it's a URL
            if (text.startsWith('http')) {
                if (text.includes('youtube.com/watch?v=')) {
                    const videoId = new URLSearchParams(new URL(text).search).get('v');
                    const embedHtml = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                    document.execCommand('insertHTML', false, embedHtml);
                } else if (text.endsWith('.mp4') || text.endsWith('.webm') || text.endsWith('.ogg')) {
                    const videoHtml = `<video controls src="${text}" style="max-width: 100%; height: auto;"></video>`;
                    document.execCommand('insertHTML', false, videoHtml);
                } else if (text.endsWith('.gif')) {
                    const gifHtml = `<img src="${text}" style="max-width: 100%; height: auto;">`;
                    document.execCommand('insertHTML', false, gifHtml);
                } else {
                    // Fallback for general URLs (insert as link or plain text)
                    if (document.getSelection().toString()) {
                        document.execCommand('createLink', false, text);
                    } else {
                        document.execCommand('insertText', false, text);
                    }
                }
                markAsUnsaved();
            }
        }
    }
}

/**
 * Clears the editor and prepares for a new report.
 * Prompts user to confirm if there are unsaved changes.
 */
function newReport() {
    if (!appState.readOnlyMode && appState.hasUnsavedChanges && !confirm('You have unsaved changes. Discard and create new report?')) {
        return;
    }
    document.getElementById('reportTitleInput').value = '';
    document.getElementById('reportContentEditor').innerHTML = '';
    appState.currentReportId = null; // No report selected
    populateReportLoadDropdown(); // Clear selection in dropdown
    document.getElementById('deleteReportBtn').disabled = true; // Disable delete for new report
    document.getElementById('saveReportBtn').disabled = false; // Enable save for new report
    showToast('New report created. Start typing!');
    appState.hasUnsavedChanges = false;
    document.getElementById('reportTitleInput').focus();
}

/**
 * Saves the current report's content and title to appState.reports and localStorage.
 * If no report is currently loaded, creates a new one.
 * Prompts for a title if none is provided.
 */
function saveCurrentReport() {
    if (appState.readOnlyMode) return;

    const reportTitleInput = document.getElementById('reportTitleInput');
    const editor = document.getElementById('reportContentEditor');
    let title = reportTitleInput.value.trim();
    const content = editor.innerHTML;

    if (!title) {
        title = prompt('Please enter a title for your report:');
        if (!title) {
            showToast('Report not saved. Title is required.', 'error');
            return;
        }
        reportTitleInput.value = title;
    }

    const now = new Date();
    if (appState.currentReportId) {
        // Update existing report
        const reportIndex = appState.reports.findIndex(r => r.id === appState.currentReportId);
        if (reportIndex !== -1) {
            appState.reports[reportIndex].title = title;
            appState.reports[reportIndex].content = content;
            appState.reports[reportIndex].updatedAt = now;
            showToast('Report updated successfully!');
        }
    } else {
        // Create new report
        const newReportEntry = {
            id: generateId(),
            title: title,
            content: content,
            createdAt: now,
            updatedAt: now
        };
        appState.reports.push(newReportEntry);
        appState.currentReportId = newReportEntry.id;
        showToast('Report saved successfully!');
    }
    saveReportsState();
    populateReportLoadDropdown();
    document.getElementById('deleteReportBtn').disabled = false; // Enable delete after saving
    appState.hasUnsavedChanges = false;
}

/**
 * Loads a selected report into the editor from appState.reports.
 * Prompts user to confirm discarding unsaved changes if any.
 */
function loadSelectedReport() {
    if (appState.readOnlyMode) return;

    if (appState.hasUnsavedChanges && !confirm('You have unsaved changes. Discard and load new report?')) {
        document.getElementById('loadReportSelect').value = appState.currentReportId || ''; // Revert dropdown
        return;
    }

    const selectedId = document.getElementById('loadReportSelect').value;
    if (!selectedId) {
        newReport(); // If "Load Report..." is selected, treat as new report
        return;
    }

    const report = appState.reports.find(r => r.id === selectedId);
    if (report) {
        document.getElementById('reportTitleInput').value = report.title;
        document.getElementById('reportContentEditor').innerHTML = report.content;
        appState.currentReportId = report.id;
        document.getElementById('deleteReportBtn').disabled = false;
        document.getElementById('saveReportBtn').disabled = false;
        showToast(`Report "${report.title}" loaded.`);
        appState.hasUnsavedChanges = false;
    } else {
        showToast('Report not found!', 'error');
        newReport(); // Fallback to new report if not found
    }
}

/**
 * Deletes the currently loaded report from appState.reports and localStorage.
 * Prompts for user confirmation.
 */
function deleteCurrentReport() {
    if (appState.readOnlyMode) return;
    if (!appState.currentReportId) {
        showToast('No report selected to delete.', 'info');
        return;
    }
    if (confirm(`Are you sure you want to delete "${document.getElementById('reportTitleInput').value}"? This cannot be undone.`)) {
        appState.reports = appState.reports.filter(r => r.id !== appState.currentReportId);
        appState.currentReportId = null;
        saveReportsState();
        newReport(); // Load a blank new report after deletion
        showToast('Report deleted successfully!', 'error');
    }
}

/**
 * Populates the "Load Report" dropdown with existing report titles.
 * Sorts reports by last updated date, newest first.
 */
function populateReportLoadDropdown() {
    const select = document.getElementById('loadReportSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Load Report...</option>'; // Default option

    if (appState.reports.length > 0) {
        // Sort reports by last updated date, newest first
        const sortedReports = [...appState.reports].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        sortedReports.forEach(report => {
            const option = document.createElement('option');
            option.value = report.id;
            option.textContent = report.title;
            select.appendChild(option);
        });
        select.value = appState.currentReportId || ''; // Set current selection
    }
}

/**
 * Exports the current report's content as an HTML or TXT file.
 * @param {string} format - The desired export format ('html' or 'txt').
 */
function exportCurrentReport(format) {
    if (appState.readOnlyMode) return;

    const title = document.getElementById('reportTitleInput').value.trim() || 'Untitled Report';
    const content = document.getElementById('reportContentEditor').innerHTML;

    if (!content && !title) {
        showToast("No content to export.", "warning");
        return;
    }

    let fileContent;
    let fileName = `${title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}`;
    let fileType;

    if (format === 'html') {
        fileContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
                <style>
                    body { font-family: sans-serif; line-height: 1.6; color: #333; margin: 20px; background-color: #fff; }
                    .container { max-width: 900px; margin: auto; padding: 20px; }
                    h1, h2, h3, h4 { color: #0056b3; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px; }
                    p { margin: 10px 0; }
                    ul, ol { margin: 10px 0 10px 20px; }
                    a { color: #007bff; text-decoration: none; }
                    img, video { max-width: 100%; height: auto; display: block; margin: 10px 0; }
                    blockquote { border-left: 4px solid #ccc; margin: 15px 0; padding-left: 10px; color: #555; font-style: italic; }
                    pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; margin: 10px 0; }
                    pre code { font-family: 'Courier New', Courier, monospace; display: block; }
                    pre.cli { background-color: #222; color: #0f0; padding: 15px; border-radius: 5px; }
                    pre.cli::before { content: '$ '; color: #0a0; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    /* Print specific styles */
                    @media print {
                        body { background-color: #fff; margin: 0; }
                        .container { box-shadow: none; border: none; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>${title}</h1>
                    <p style="font-size: 0.9em; color: #666;">Generated by OSINTVault on ${new Date().toLocaleString()}</p>
                    <hr>
                    ${content}
                </div>
            </body>
            </html>
        `;
        fileName += '.html';
        fileType = 'text/html';
    } else if (format === 'txt') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        let textContent = tempDiv.innerText; // Converts HTML to plain text

        // Basic Markdown-like conversion for common elements (optional, can be expanded)
        textContent = textContent.replace(/[\n\r]+/g, '\n'); // Normalize line breaks
        textContent = textContent.replace(/\t/g, '    '); // Replace tabs with spaces

        fileContent = `Report Title: ${title}\n`;
        fileContent += `Generated by OSINTVault on ${new Date().toLocaleString()}\n\n`;
        fileContent += `---------------------------------------------------\n\n`;
        fileContent += textContent;
        fileName += '.txt';
        fileType = 'text/plain';
    }

    const blob = new Blob([fileContent], { type: fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Report exported as ${format.toUpperCase()} successfully!`, 'success');
    hideModal('exportReportOptionsModal');
}

/**
 * Opens the current report in a new window with print-friendly styling,
 * allowing the user to print or save as PDF via the browser's print dialog.
 */
function printCurrentReport() {
    if (appState.readOnlyMode) return;

    const title = document.getElementById('reportTitleInput').value.trim() || 'Untitled Report';
    const content = document.getElementById('reportContentEditor').innerHTML;

    if (!content && !title) {
        showToast("No content to print.", "warning");
        return;
    }

    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
            <style>
                body { font-family: sans-serif; line-height: 1.6; color: #000; margin: 20mm; background-color: #fff; }
                .container { max-width: 100%; margin: auto; padding: 0; }
                h1, h2, h3, h4 { color: #000; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px; page-break-after: avoid; }
                p { margin: 10px 0; }
                ul, ol { margin: 10px 0 10px 20px; }
                a { color: #007bff; text-decoration: underline; }
                img, video { max-width: 100%; height: auto; display: block; margin: 10px auto; }
                blockquote { border-left: 4px solid #ccc; margin: 15px 0; padding-left: 10px; color: #555; font-style: italic; }
                pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; margin: 10px 0; page-break-inside: avoid; }
                pre code { font-family: 'Courier New', Courier, monospace; display: block; }
                pre.cli { background-color: #222; color: #0f0; padding: 15px; border-radius: 5px; }
                pre.cli::before { content: '$ '; color: #0a0; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; page-break-inside: avoid; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                /* Ensure images and blocks don't break across pages awkwardly */
                img, pre, blockquote, table { page-break-inside: avoid; }
                .page-break { page-break-before: always; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>${title}</h1>
                <p style="font-size: 0.9em; color: #666;">Generated by OSINTVault on ${new Date().toLocaleString()}</p>
                <hr>
                ${content}
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    hideModal('exportReportOptionsModal');
}

// Call initReportEditor on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initReportEditor);