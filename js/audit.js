// audit.js

let auditState = {
    dateRange: 'all',
    actionType: 'all',
    category: 'all',
    searchTerm: ''
};

/**
 * Initializes the Audit Log tab by binding events and rendering the initial log.
 */
function initAudit() {
    bindAuditEvents();
    renderAuditLog();
    populateAuditCategoryFilter();
}

/**
 * Binds all necessary event listeners for the Audit Log tab.
 */
function bindAuditEvents() {
    // Export Logs button
    document.getElementById('exportAuditLogsBtn')?.addEventListener('click', exportAuditLogs);

    // Clear Logs button
    document.getElementById('clearAuditLogsBtn')?.addEventListener('click', confirmClearAuditLogs);

    // Filter controls
    document.getElementById('auditDateRangeFilter')?.addEventListener('change', (e) => {
        auditState.dateRange = e.target.value;
        renderAuditLog();
    });
    document.getElementById('auditActionTypeFilter')?.addEventListener('change', (e) => {
        auditState.actionType = e.target.value;
        renderAuditLog();
    });
    document.getElementById('auditCategoryFilter')?.addEventListener('change', (e) => {
        auditState.category = e.target.value;
        renderAuditLog();
    });
    document.getElementById('auditSearchInput')?.addEventListener('input', (e) => {
        auditState.searchTerm = e.target.value.toLowerCase();
        renderAuditLog();
    });

    // Clear Filters button (within empty state)
    document.getElementById('clearAuditFiltersBtn')?.addEventListener('click', clearAuditFilters);
}

/**
 * Renders the audit log entries and updates summary statistics based on current filters.
 */
function renderAuditLog() {
    const logListContainer = document.getElementById('auditLogList');
    const emptyState = document.getElementById('auditLogEmptyState');
    if (!logListContainer || !emptyState) return;

    let filteredLogs = filterAuditLogs(appState.auditLogs);

    // Update summary statistics
    updateAuditSummaryStats(filteredLogs);

    // Display log entries
    logListContainer.innerHTML = '';
    if (filteredLogs.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        filteredLogs.forEach(log => {
            logListContainer.appendChild(createAuditLogEntryElement(log));
        });
    }
}

/**
 * Filters the raw audit log data based on current auditState filters.
 * @param {Array<Object>} logs The raw audit log array from appState.
 * @returns {Array<Object>} The filtered and sorted array of log entries.
 */
function filterAuditLogs(logs) {
    let filtered = [...logs];

    // Apply date range filter
    const now = new Date();
    if (auditState.dateRange === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filtered = filtered.filter(log => new Date(log.timestamp).setHours(0, 0, 0, 0) === today.getTime());
    } else if (auditState.dateRange === 'last7days') {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        filtered = filtered.filter(log => new Date(log.timestamp) >= sevenDaysAgo);
    } else if (auditState.dateRange === 'last30days') {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        filtered = filtered.filter(log => new Date(log.timestamp) >= thirtyDaysAgo);
    }

    // Apply action type filter
    if (auditState.actionType !== 'all') {
        filtered = filtered.filter(log => log.action === auditState.actionType);
    }

    // Apply category filter
    if (auditState.category !== 'all') {
        filtered = filtered.filter(log => log.category === auditState.category);
    }

    // Apply search term filter
    if (auditState.searchTerm) {
        const searchTerm = auditState.searchTerm.toLowerCase();
        filtered = filtered.filter(log =>
            (log.description || '').toLowerCase().includes(searchTerm) ||
            (log.category || '').toLowerCase().includes(searchTerm) ||
            (log.action || '').toLowerCase().includes(searchTerm) ||
            (log.userId || '').toLowerCase().includes(searchTerm) ||
            JSON.stringify(log.details || {}).toLowerCase().includes(searchTerm)
        );
    }

    // Sort by timestamp (most recent first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return filtered;
}

/**
 * Updates the summary statistics displayed at the top of the Audit Log tab.
 * @param {Array<Object>} logs The currently filtered log entries.
 */
function updateAuditSummaryStats(logs) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalActivities = logs.length;
    let todaysActivities = 0;
    let createdCount = 0;
    let updatedCount = 0;
    let deletedCount = 0;

    logs.forEach(log => {
        if (new Date(log.timestamp).setHours(0, 0, 0, 0) === today.getTime()) {
            todaysActivities++;
        }
        if (log.action === 'created') createdCount++;
        else if (log.action === 'updated') updatedCount++;
        else if (log.action === 'deleted') deletedCount++;
    });

    document.getElementById('auditTotalActivities').textContent = totalActivities;
    document.getElementById('auditTodaysActivities').textContent = todaysActivities;
    document.getElementById('auditCreatedCount').textContent = createdCount;
    document.getElementById('auditUpdatedCount').textContent = updatedCount;
    document.getElementById('auditDeletedCount').textContent = deletedCount;
}

/**
 * Creates a DOM element for a single audit log entry.
 * @param {Object} log The log entry object.
 * @returns {HTMLElement} The created div element for the log entry.
 */
function createAuditLogEntryElement(log) {
    const logElement = document.createElement('div');
    logElement.classList.add('audit-log-entry');

    let iconClass = 'fas fa-info-circle';
    let iconColor = 'var(--text-secondary)';
    switch (log.action) {
        case 'created':
            iconClass = 'fas fa-plus-circle';
            iconColor = 'var(--success)';
            break;
        case 'updated':
            iconClass = 'fas fa-edit';
            iconColor = 'var(--warning)';
            break;
        case 'deleted':
            iconClass = 'fas fa-trash';
            iconColor = 'var(--danger)';
            break;
        case 'imported':
            iconClass = 'fas fa-upload';
            iconColor = 'var(--primary)';
            break;
        case 'exported':
            iconClass = 'fas fa-download';
            iconColor = 'var(--primary)';
            break;
        case 'initialized':
            iconClass = 'fas fa-cogs';
            iconColor = 'var(--info)';
            break;
        default:
            iconClass = 'fas fa-info-circle';
            iconColor = 'var(--text-secondary)';
            break;
    }

    const timeAgo = formatTime(log.timestamp); // Assuming formatTime is globally available from main.js

    let detailsHtml = '';
    if (log.details && Object.keys(log.details).length > 0) {
        detailsHtml += '<div class="audit-log-details">';
        for (const key in log.details) {
            detailsHtml += `<p><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${JSON.stringify(log.details[key])}</p>`;
        }
        detailsHtml += '</div>';
    }

    logElement.innerHTML = `
        <div class="log-header">
            <div class="log-icon" style="color: ${iconColor};"><i class="${iconClass}"></i></div>
            <div class="log-title">
                <span class="log-action">${log.action.charAt(0).toUpperCase() + log.action.slice(1)}</span>
                <span class="log-category">${log.category.charAt(0).toUpperCase() + log.category.slice(1)}</span>
                <span class="log-description">${log.description}</span>
            </div>
            <span class="log-timestamp">${timeAgo}</span>
        </div>
        ${detailsHtml}
        <div class="log-footer">
            <span class="log-user">Session: ${log.userId || 'N/A'}</span>
            <span class="log-id">ID: ${log.id}</span>
            <span class="log-full-timestamp" style="display:none;">${new Date(log.timestamp).toLocaleString()}</span>
        </div>
    `;

    return logElement;
}

/**
 * Populates the audit category filter dropdown with unique categories from existing logs.
 */
function populateAuditCategoryFilter() {
    const categoryFilter = document.getElementById('auditCategoryFilter');
    if (!categoryFilter) return;

    const uniqueCategories = new Set(appState.auditLogs.map(log => log.category));

    // Preserve 'All Categories' option
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    Array.from(uniqueCategories).sort().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });

    categoryFilter.value = auditState.category; // Set selected value
}

/**
 * Exports the current filtered audit logs to a JSON file.
 */
function exportAuditLogs() {
    if (appState.readOnlyMode) {
        showToast("Cannot export logs in read-only shared view.", "warning");
        return;
    }
    const logsToExport = filterAuditLogs(appState.auditLogs);
    const dataStr = JSON.stringify(logsToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osintvault_audit_log_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Audit logs exported successfully!', 'success');
    logActivity('exported', 'system', 'Audit logs exported');
}

/**
 * Prompts user to confirm clearing of audit logs and performs the action.
 */
function confirmClearAuditLogs() {
    if (appState.readOnlyMode) {
        showToast("Cannot clear logs in read-only shared view.", "warning");
        return;
    }
    if (confirm('Are you sure you want to clear ALL audit logs? This action cannot be undone.')) {
        clearAuditLogs();
    }
}

/**
 * Clears all audit logs from appState and local storage.
 */
function clearAuditLogs() {
    if (appState.readOnlyMode) return;

    appState.auditLogs = [];
    saveState();
    renderAuditLog();
    showToast('Audit logs cleared!', 'info');
    logActivity('deleted', 'system', 'All audit logs cleared');
}

/**
 * Resets all audit log filters to their default values.
 */
function clearAuditFilters() {
    auditState.dateRange = 'all';
    auditState.actionType = 'all';
    auditState.category = 'all';
    auditState.searchTerm = '';

    document.getElementById('auditDateRangeFilter').value = 'all';
    document.getElementById('auditActionTypeFilter').value = 'all';
    document.getElementById('auditCategoryFilter').value = 'all';
    document.getElementById('auditSearchInput').value = '';

    renderAuditLog();
    showToast('Audit log filters cleared!');
}


// Expose to global scope
window.initAudit = initAudit;
window.renderAuditLog = renderAuditLog;
window.exportAuditLogs = exportAuditLogs;
window.clearAuditLogs = clearAuditLogs;
window.logActivity = logActivity; // Re-export for clarity if needed by other modules
