// dashboard.js

/**
 * Updates all statistics, charts, and lists displayed on the Dashboard tab.
 */
function updateDashboard() {
    const allEntries = [
        ...(appState.tools || []),
        ...(appState.emails || []),
        ...(appState.phones || []),
        ...(appState.crypto || []),
        ...(appState.locations || []),
        ...(appState.links || []),
        ...(appState.media || []),
        ...(appState.passwords || []),
        ...(appState.keywords || []),
        ...(appState.socials || []),
        ...(appState.domains || []),
        ...(appState.usernames || []),
        ...(appState.threats || []),
        ...(appState.vulnerabilities || []),
        ...(appState.malware || []),
        ...(appState.breaches || []),
        ...(appState.credentials || []),
        ...(appState.forums || []),
        ...(appState.vendors || []),
        ...(appState.telegramChannels || []),
        ...(appState.pastes || []),
        ...(appState.documents || []),
        ...(appState.networks || []),
        ...(appState.metadataEntries || []),
        ...(appState.archives || []),
        ...(appState.messagingApps || []),
        ...(appState.datingProfiles || []),
        ...(appState.audioEntries || []),
        ...(appState.facialRecognition || []),
        ...(appState.personas || []),
        ...(appState.vpns || []),
        ...(appState.honeypots || []),
        ...(appState.exploits || []),
        ...(appState.publicRecords || []),
        ...(appState.caseStudies || [])
    ];

    document.getElementById('totalToolsCount').textContent = allEntries.length;
    document.getElementById('activeVaultsCount').textContent = appState.customTabs.length;
    document.getElementById('usedToolsTodayCount').textContent = appState.usageStats.toolsUsedToday;
    document.getElementById('notesCount').textContent = notesState.notes.length;


    const starredPinnedBreakdownList = document.getElementById('starredPinnedBreakdownList');
    if (starredPinnedBreakdownList) {
        let breakdownHtml = '';
        const entryTypes = [
            'tool', 'email', 'phone', 'crypto', 'location', 'link', 'media', 'password',
            'keyword', 'social', 'domain', 'username', 'threat', 'vulnerability', 'malware',
            'breach', 'credential', 'forum', 'vendor', 'telegram', 'paste', 'document',
            'network', 'metadata', 'archive', 'messaging', 'dating', 'audio', 'facial',
            'persona', 'vpn', 'honeypot', 'exploit', 'publicrecord', 'caseStudy'
        ];

        const typeCounts = {};
        allEntries.forEach(entry => {
            let typeKey = entry.type;
            if (typeKey === 'telegram') typeKey = 'telegramChannels';
            if (typeKey === 'metadata') typeKey = 'metadataEntries';
            if (typeKey === 'messaging') typeKey = 'messagingApps';
            if (typeKey === 'dating') typeKey = 'datingProfiles';
            if (typeKey === 'audio') typeKey = 'audioEntries';
            if (typeKey === 'facial') typeKey = 'facialRecognition';
            if (typeKey === 'persona') typeKey = 'personas';
            if (typeKey === 'vpn') typeKey = 'vpns';
            if (typeKey === 'caseStudy') typeKey = 'caseStudies';

            if (!typeCounts[typeKey]) {
                typeCounts[typeKey] = {
                    starred: 0,
                    pinned: 0
                };
            }
            if (entry.starred) {
                typeCounts[typeKey].starred++;
            }
            if (entry.pinned) {
                typeCounts[typeKey].pinned++;
            }
        });

        breakdownHtml += `<li><span>Total Starred Entries:</span> <span class="stat-value">${allEntries.filter(e => e.starred).length}</span></li>`;
        breakdownHtml += `<li><span>Total Pinned Entries:</span> <span class="stat-value">${allEntries.filter(e => e.pinned).length}</span></li>`;
        breakdownHtml += `<li><hr style="border: 0; height: 1px; background: var(--border-light); margin: 10px 0;"></li>`;

        entryTypes.forEach(type => {
            let pluralType = type + 's';
            if (type === 'telegram') pluralType = 'telegramChannels';
            if (type === 'metadata') pluralType = 'metadataEntries';
            if (type === 'messaging') pluralType = 'messagingApps';
            if (type === 'dating') pluralType = 'datingProfiles';
            if (type === 'audio') pluralType = 'audioEntries';
            if (type === 'facial') pluralType = 'facialRecognition';
            if (type === 'persona') pluralType = 'personas';
            if (type === 'vpn') pluralType = 'vpns';
            if (type === 'caseStudy') pluralType = 'caseStudies';

            const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
            if (typeCounts[pluralType] && (typeCounts[pluralType].starred > 0 || typeCounts[pluralType].pinned > 0)) {
                if (typeCounts[pluralType].starred > 0) {
                    breakdownHtml += `<li><span>Starred ${capitalizedType}s:</span> <span class="stat-value">${typeCounts[pluralType].starred}</span></li>`;
                }
                if (typeCounts[pluralType].pinned > 0) {
                    breakdownHtml += `<li><span>Pinned ${capitalizedType}s:</span> <span class="stat-value">${typeCounts[pluralType].pinned}</span></li>`;
                }
            }
        });
        starredPinnedBreakdownList.innerHTML = breakdownHtml;
    }


    const intelVaultCategories = new Set((appState.tools || []).map(tool => tool.category));
    document.getElementById('intelVaultTotalTools').textContent = (appState.tools || []).length;
    document.getElementById('intelVaultStarredTools').textContent = (appState.tools || []).filter(tool => tool.starred).length;
    document.getElementById('intelVaultPinnedTools').textContent = (appState.tools || []).filter(tool => tool.pinned).length;
    document.getElementById('intelVaultCategoriesCount').textContent = intelVaultCategories.size;

    let totalEntriesInCustomVaults = 0;
    (appState.customTabs || []).forEach(tab => {
        totalEntriesInCustomVaults += (tab.toolIds || []).length;
    });
    const totalCustomVaults = (appState.customTabs || []).length;
    document.getElementById('customVaultsTotal').textContent = totalCustomVaults;
    document.getElementById('customVaultsTotalEntries').textContent = totalEntriesInCustomVaults;
    document.getElementById('customVaultsAvgEntries').textContent = totalCustomVaults > 0 ? (totalEntriesInCustomVaults / totalCustomVaults).toFixed(1) : '0';

    renderEntriesPerCustomVaultChart();


    const totalTemplates = Object.values(dorkTemplates).flat().length;
    document.getElementById('notesSummaryTotal').textContent = (notesState.notes || []).length;
    document.getElementById('notesSummaryPinned').textContent = (notesState.notes || []).filter(n => n.pinned).length;
    document.getElementById('dorksSummaryTotal').textContent = (dorkAssistantState.savedQueries || []).length;
    document.getElementById('dorksSummaryTemplates').textContent = totalTemplates;


    renderMostUsedTools();
    renderNeverUsedTools();
    renderToolsAddedPerWeek();

    renderEntriesByTypeChart();
    renderUsageTrendChart();
    renderTopCategoriesChart();
    renderPinnedStarredDonutChart();
    renderEntryGrowthOverTimeChart();
    renderTaggingOverviewChart();
}

/**
 * Renders a bar chart showing the number of entries per custom vault.
 */
function renderEntriesPerCustomVaultChart() {
    const ctx = document.getElementById('entriesPerCustomVaultChart');
    if (!ctx) return; // Ensure element exists
    const canvasContext = ctx.getContext('2d');
    
    const customVaultNames = appState.customTabs.map(tab => tab.name);
    const entriesPerVault = appState.customTabs.map(tab => tab.toolIds.length);

    if (window.entriesPerCustomVaultChartInstance) {
        window.entriesPerCustomVaultChartInstance.destroy();
    }

    window.entriesPerCustomVaultChartInstance = new Chart(canvasContext, {
        type: 'bar',
        data: {
            labels: customVaultNames,
            datasets: [{
                label: 'Entries per Custom Vault',
                data: entriesPerVault,
                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                borderColor: '#8b5cf6',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Entries in Custom Vaults',
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
                    font: { size: 16 }
                },
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim(),
                        callback: function(value) {
                            if (Number.isInteger(value)) {
                                return value;
                            }
                        }
                    },
                    grid: { color: 'rgba(128, 128, 128, 0.1)' }
                },
                x: {
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() },
                    grid: { display: false }
                }
            }
        }
    });
}

/**
 * Renders a doughnut chart showing the proportion of tagged vs. untagged entries.
 */
function renderTaggingOverviewChart() {
    const ctx = document.getElementById('taggingOverviewChart');
    if (!ctx) return;
    const canvasContext = ctx.getContext('2d');
    
    const allEntries = [
        ...(appState.tools || []), ...(appState.emails || []), ...(appState.phones || []), ...(appState.crypto || []),
        ...(appState.locations || []), ...(appState.links || []), ...(appState.media || []), ...(appState.passwords || []),
        ...(appState.keywords || []), ...(appState.socials || []), ...(appState.domains || []), ...(appState.usernames || []),
        ...(appState.threats || []), ...(appState.vulnerabilities || []), ...(appState.malware || []), ...(appState.breaches || []),
        ...(appState.credentials || []), ...(appState.forums || []), ...(appState.vendors || []), ...(appState.telegramChannels || []),
        ...(appState.pastes || []), ...(appState.documents || []), ...(appState.networks || []), ...(appState.metadataEntries || []),
        ...(appState.archives || []), ...(appState.messagingApps || []), ...(appState.datingProfiles || []), ...(appState.facialRecognition || []),
        ...(appState.personas || []), ...(appState.vpns || []), ...(appState.honeypots || []), ...(appState.exploits || []),
        ...(appState.publicRecords || [])
    ];

    let taggedEntriesCount = 0;
    let untaggedEntriesCount = 0;

    allEntries.forEach(entry => {
        if (entry.tags && entry.tags.length > 0) {
            taggedEntriesCount++;
        } else {
            untaggedEntriesCount++;
        }
    });

    const data = [taggedEntriesCount, untaggedEntriesCount];
    const labels = ['Tagged Entries', 'Untagged Entries'];

    if (window.taggingOverviewChartInstance) {
        window.taggingOverviewChartInstance.destroy();
    }

    window.taggingOverviewChartInstance = new Chart(canvasContext, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#28a745',
                    '#dc3545'
                ],
                borderColor: 'var(--bg-primary)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Entry Tagging Overview',
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
                    font: { size: 16 }
                },
                legend: {
                    position: 'right',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    }
                }
            }
        }
    });
}

/**
 * Renders a bar chart showing the distribution of tools by category.
 */
function renderTopCategoriesChart() {
    const ctx = document.getElementById('topCategoriesChart');
    if (!ctx) return;
    const canvasContext = ctx.getContext('2d');

    const categoryCounts = {};
    appState.tools.forEach(tool => {
        const category = tool.category.charAt(0).toUpperCase() + tool.category.slice(1);
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const labels = Object.keys(categoryCounts);
    const data = Object.values(categoryCounts);

    if (window.topCategoriesChartInstance) {
        window.topCategoriesChartInstance.destroy();
    }
    window.topCategoriesChartInstance = new Chart(canvasContext, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tools per Category',
                data: data,
                backgroundColor: 'rgba(0, 123, 255, 0.7)',
                borderColor: '#007bff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Tools by Category', color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() },
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() }, grid: { color: 'rgba(128, 128, 128, 0.1)' } },
                x: { ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() }, grid: { display: false } }
            }
        }
    });
}

/**
 * Renders a doughnut chart showing the proportion of pinned, starred, and other entries.
 */
function renderPinnedStarredDonutChart() {
    const ctx = document.getElementById('pinnedStarredDonutChart');
    if (!ctx) return;
    const canvasContext = ctx.getContext('2d');

    const allEntries = [
        ...(appState.tools || []), ...(appState.emails || []), ...(appState.phones || []), ...(appState.crypto || []),
        ...(appState.locations || []), ...(appState.links || []), ...(appState.media || []), ...(appState.passwords || []),
        ...(appState.keywords || []), ...(appState.socials || []), ...(appState.domains || []), ...(appState.usernames || []),
        ...(appState.threats || []), ...(appState.vulnerabilities || []), ...(appState.malware || []), ...(appState.breaches || []),
        ...(appState.credentials || []), ...(appState.forums || []), ...(appState.vendors || []), ...(appState.telegramChannels || []),
        ...(appState.pastes || []), ...(appState.documents || []), ...(appState.networks || []), ...(appState.metadataEntries || []),
        ...(appState.archives || []), ...(appState.messagingApps || []), ...(appState.datingProfiles || []), ...(appState.facialRecognition || []),
        ...(appState.personas || []), ...(appState.vpns || []), ...(appState.honeypots || []), ...(appState.exploits || []),
        ...(appState.publicRecords || [])
    ];

    const pinnedCount = allEntries.filter(entry => entry.pinned).length;
    const starredCount = allEntries.filter(entry => entry.starred).length;

    const bothCount = allEntries.filter(entry => entry.pinned && entry.starred).length;
    const uniquePinnedOrStarredCount = pinnedCount + starredCount - bothCount;
    const othersCount = allEntries.length - uniquePinnedOrStarredCount;

    const data = [pinnedCount, starredCount, othersCount];
    const labels = ['Pinned', 'Starred', 'Other Entries'];

    if (window.pinnedStarredDonutChartInstance) {
        window.pinnedStarredDonutChartInstance.destroy();
    }
    window.pinnedStarredDonutChartInstance = new Chart(canvasContext, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#28a745', '#ffc107', '#6c757d'],
                borderColor: 'var(--bg-primary)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Pinned & Starred Entries', color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() },
                legend: { position: 'right', labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() } }
            }
        }
    });
}

/**
 * Renders a line chart showing the cumulative growth of entries over time.
 */
function renderEntryGrowthOverTimeChart() {
    const ctx = document.getElementById('entryGrowthOverTimeChart');
    if (!ctx) return;
    const canvasContext = ctx.getContext('2d');
    const cumulativeData = {};
    const allEntries = [
        ...(appState.tools || []), ...(appState.emails || []), ...(appState.phones || []), ...(appState.crypto || []),
        ...(appState.locations || []), ...(appState.links || []), ...(appState.media || []), ...(appState.passwords || []),
        ...(appState.keywords || []), ...(appState.socials || []), ...(appState.domains || []), ...(appState.usernames || []),
        ...(appState.threats || []), ...(appState.vulnerabilities || []), ...(appState.malware || []), ...(appState.breaches || []),
        ...(appState.credentials || []), ...(appState.forums || []), ...(appState.vendors || []), ...(appState.telegramChannels || []),
        ...(appState.pastes || []), ...(appState.documents || []), ...(appState.networks || []), ...(appState.metadataEntries || []),
        ...(appState.archives || []), ...(appState.messagingApps || []), ...(appState.datingProfiles || []), ...(appState.facialRecognition || []),
        ...(appState.personas || []), ...(appState.vpns || []), ...(appState.honeypots || []), ...(appState.exploits || []),
        ...(appState.publicRecords || [])
    ];

    allEntries.sort((a, b) => new Date(a.addedDate) - new Date(b.addedDate));

    let count = 0;
    allEntries.forEach(entry => {
        if (entry.addedDate) {
            const date = new Date(entry.addedDate);
            const key = date.toISOString().slice(0, 10);
            cumulativeData[key] = ++count;
        }
    });

    const sortedDates = Object.keys(cumulativeData).sort();
    
    let fullLabels = [];
    let fullData = [];

    if (sortedDates.length > 0) {
        let currentDate = new Date(sortedDates[0]);
        let lastCount = 0;
        currentDate.setHours(0, 0, 0, 0);

        const lastDate = new Date(sortedDates[sortedDates.length - 1]);
        lastDate.setHours(0, 0, 0, 0);

        let dateIndex = 0;

        while (currentDate.getTime() <= lastDate.getTime()) {
            const key = currentDate.toISOString().slice(0, 10);
            if (dateIndex < sortedDates.length && sortedDates[dateIndex] === key) {
                lastCount = cumulativeData[key];
                dateIndex++;
            }
            fullLabels.push(currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            fullData.push(lastCount);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }


    if (window.entryGrowthOverTimeChartInstance) {
        window.entryGrowthOverTimeChartInstance.destroy();
    }
    window.entryGrowthOverTimeChartInstance = new Chart(canvasContext, {
        type: 'line',
        data: {
            labels: fullLabels,
            datasets: [{
                label: 'Total Entries Over Time',
                data: fullData,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Total Entries Growth', color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() },
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() }, grid: { color: 'rgba(128, 128, 128, 0.1)' } },
                x: { ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() }, grid: { color: 'rgba(128, 128, 128, 0.1)' } }
            }
        }
    });
}

/**
 * Renders a pie chart showing the distribution of entries by type.
 */
function renderEntriesByTypeChart() {
    const ctx = document.getElementById('entriesByTypeChart');
    if (!ctx) return;
    const canvasContext = ctx.getContext('2d');

    const entryTypeCounts = {};
    const allEntries = [
        ...(appState.tools || []),
        ...(appState.emails || []),
        ...(appState.phones || []),
        ...(appState.crypto || []),
        ...(appState.locations || []),
        ...(appState.links || []),
        ...(appState.media || []),
        ...(appState.passwords || []),
        ...(appState.keywords || []),
        ...(appState.socials || []),
        ...(appState.domains || []),
        ...(appState.usernames || []),
        ...(appState.threats || []),
        ...(appState.vulnerabilities || []),
        ...(appState.malware || []),
        ...(appState.breaches || []),
        ...(appState.credentials || []),
        ...(appState.forums || []),
        ...(appState.vendors || []),
        ...(appState.telegramChannels || []),
        ...(appState.pastes || []),
        ...(appState.documents || []),
        ...(appState.networks || []),
        ...(appState.metadataEntries || []),
        ...(appState.archives || []),
        ...(appState.messagingApps || []),
        ...(appState.datingProfiles || []),
        ...(appState.audioEntries || []),
        ...(appState.facialRecognition || []),
        ...(appState.personas || []),
        ...(appState.vpns || []),
        ...(appState.honeypots || []),
        ...(appState.exploits || []),
        ...(appState.publicRecords || []),
        ...(appState.caseStudies || [])
    ];

    allEntries.forEach(entry => {
        const type = (typeof entry.type === 'string' && entry.type) ?
                     entry.type.charAt(0).toUpperCase() + entry.type.slice(1) :
                     'Unknown';
        entryTypeCounts[type] = (entryTypeCounts[type] || 0) + 1;
    });

    const labels = Object.keys(entryTypeCounts);
    const data = Object.values(entryTypeCounts);

    if (window.entriesByTypeChartInstance) {
        window.entriesByTypeChartInstance.destroy();
    }

    window.entriesByTypeChartInstance = new Chart(canvasContext, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d',
                    '#17a2b8', '#6610f2', '#fd7e14', '#e83e8c', '#20c997',
                    '#6f42c1', '#e0f2f1', '#e3f2fd', '#fff3e0', '#fce4ec',
                    '#e1f5fe', '#c8e6c9', '#ffe0b2', '#f8bbd0', '#bbdefb'
                ],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Entries by Type',
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
                    font: { size: 16 }
                },
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    }
                }
            }
        }
    });
}

/**
 * Renders a line chart showing entry activity or additions over time.
 * Currently uses `addedDate` as a proxy for activity.
 */
function renderUsageTrendChart() {
    const ctx = document.getElementById('usageTrendChart');
    if (!ctx) return;
    const canvasContext = ctx.getContext('2d');
    const usageData = {};

    const allEntries = [
        ...(appState.tools || []), ...(appState.emails || []), ...(appState.phones || []), ...(appState.crypto || []),
        ...(appState.locations || []), ...(appState.links || []), ...(appState.media || []), ...(appState.passwords || []),
        ...(appState.keywords || []), ...(appState.socials || []), ...(appState.domains || []), ...(appState.usernames || []),
        ...(appState.threats || []), ...(appState.vulnerabilities || []), ...(appState.malware || []), ...(appState.breaches || []),
        ...(appState.credentials || []), ...(appState.forums || []), ...(appState.vendors || []), ...(appState.telegramChannels || []),
        ...(appState.pastes || []), ...(appState.documents || []), ...(appState.networks || []), ...(appState.metadataEntries || []),
        ...(appState.archives || []), ...(appState.messagingApps || []), ...(appState.datingProfiles || []), ...(appState.facialRecognition || []),
        ...(appState.personas || []), ...(appState.vpns || []), ...(appState.honeypots || []), ...(appState.exploits || []),
        ...(appState.publicRecords || [])
    ];

    allEntries.forEach(entry => {
        if (entry.addedDate) {
            const date = new Date(entry.addedDate);
            const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
            const key = weekStart.toISOString().slice(0, 10);
            usageData[key] = (usageData[key] || 0) + 1;
        }
    });

    const sortedDates = Object.keys(usageData).sort();
    const labels = sortedDates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const data = sortedDates.map(date => usageData[date]);

    if (window.usageTrendChartInstance) {
        window.usageTrendChartInstance.destroy();
    }

    window.usageTrendChartInstance = new Chart(canvasContext, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Entries Added Over Time',
                data: data,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Entry Activity Trend',
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
                    font: { size: 16 }
                },
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() },
                    grid: { color: 'rgba(128, 128, 128, 0.1)' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() },
                    grid: { color: 'rgba(128, 128, 128, 0.1)' }
                }
            }
        }
    });
}

/**
 * Renders a list of the 5 most recently used entries.
 */
function renderMostUsedTools() {
    const mostUsedToolsList = document.getElementById('mostUsedToolsList');
    const noMostUsedTools = document.getElementById('noMostUsedTools');
    
    if (!mostUsedToolsList || !noMostUsedTools) return; // Safety check

    const allUsedEntries = [
        ...(appState.tools || []), ...(appState.emails || []), ...(appState.phones || []), ...(appState.crypto || []),
        ...(appState.locations || []), ...(appState.links || []), ...(appState.media || []), ...(appState.passwords || []),
        ...(appState.keywords || []), ...(appState.socials || [])
    ].filter(entry => entry.lastUsed > 0);

    const usedTools = allUsedEntries.sort((a, b) => b.lastUsed - a.lastUsed)
                                    .slice(0, 5);
    mostUsedToolsList.innerHTML = '';
    if (usedTools.length === 0) {
        noMostUsedTools.style.display = 'block';
    } else {
        noMostUsedTools.style.display = 'none';
        usedTools.forEach(entry => {
            const listItem = document.createElement('li');
            let name = getEntryName(entry); // Assuming getEntryName is available
            listItem.innerHTML = `<span>${name}</span><span>${formatTime(entry.lastUsed)}</span>`; // Assuming formatTime is available
            mostUsedToolsList.appendChild(listItem);
        });
    }
}

/**
 * Renders a list of entries that have never been used.
 */
function renderNeverUsedTools() {
    const neverUsedToolsList = document.getElementById('neverUsedToolsList');
    const noNeverUsedTools = document.getElementById('noNeverUsedTools');

    if (!neverUsedToolsList || !noNeverUsedTools) return; // Safety check

    const allEntries = [
        ...(appState.tools || []), ...(appState.emails || []), ...(appState.phones || []), ...(appState.crypto || []),
        ...(appState.locations || []), ...(appState.links || []), ...(appState.media || []), ...(appState.passwords || []),
        ...(appState.keywords || []), ...(appState.socials || [])
    ];

    const neverUsed = allEntries.filter(entry => !entry.lastUsed || entry.lastUsed === 0)
                                .sort((a, b) => {
                                    const nameA = getEntryName(a); // Assuming getEntryName is available
                                    const nameB = getEntryName(b);
                                    return nameA.localeCompare(nameB);
                                });

    neverUsedToolsList.innerHTML = '';
    if (neverUsed.length === 0) {
        noNeverUsedTools.style.display = 'block';
    } else {
        noNeverUsedTools.style.display = 'none';
        neverUsed.forEach(entry => {
            const listItem = document.createElement('li');
            let name = getEntryName(entry); // Assuming getEntryName is available
            listItem.innerHTML = `<span>${name}</span><span>Never Used</span>`;
            neverUsedToolsList.appendChild(listItem);
        });
    }
}

/**
 * Renders a list of entries added per week.
 */
function renderToolsAddedPerWeek() {
    const toolsAddedPerWeekList = document.getElementById('toolsAddedPerWeekList');
    const noToolsAdded = document.getElementById('noToolsAdded');

    if (!toolsAddedPerWeekList || !noToolsAdded) return; // Safety check

    const allEntries = [
        ...(appState.tools || []), ...(appState.emails || []), ...(appState.phones || []), ...(appState.crypto || []),
        ...(appState.locations || []), ...(appState.links || []), ...(appState.media || []), ...(appState.passwords || []),
        ...(appState.keywords || []), ...(appState.socials || [])
    ];

    const weeklyStats = {};
    allEntries.forEach(entry => {
        if (entry.addedDate) {
            const date = new Date(entry.addedDate);
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            const startOfWeek = new Date(date.setDate(diff));
            startOfWeek.setHours(0, 0, 0, 0);

            const weekKey = startOfWeek.toISOString().split('T')[0];
            weeklyStats[weekKey] = (weeklyStats[weekKey] || 0) + 1;
        }
    });

    const sortedWeeks = Object.keys(weeklyStats).sort((a, b) => new Date(b) - new Date(a));

    toolsAddedPerWeekList.innerHTML = '';
    if (sortedWeeks.length === 0) {
        noToolsAdded.style.display = 'block';
    } else {
        noToolsAdded.style.display = 'none';
        sortedWeeks.forEach(weekKey => {
            const count = weeklyStats[weekKey];
            const weekStartDate = new Date(weekKey);
            const options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            };
            const formattedWeek = weekStartDate.toLocaleDateString(undefined, options);
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span>Week of ${formattedWeek}</span><span>${count} entries</span>`;
            toolsAddedPerWeekList.appendChild(listItem);
        });
    }
}


/**
 * Displays a random OSINT tool recommendation or tip of the day.
 */
function showRandomDiscovery() {
    const randomItemDisplay = document.getElementById('randomItemDisplay');
    const randomBtn = document.getElementById('newRandomBtn');

    if (!randomItemDisplay || !randomBtn) return; // Safety check

    randomBtn.disabled = true;
    randomItemDisplay.innerHTML = '<div class="loading"></div> Loading discovery...';

    setTimeout(() => {
        const allTools = appState.tools;
        const allTips = appState.osintTips;

        const hasTools = allTools.length > 0;
        const hasTips = allTips.length > 0;

        let content = '';

        if (hasTools && (!hasTips || Math.random() < 0.7)) {
            const randomTool = allTools[Math.floor(Math.random() * allTools.length)];
            const favicon = `https://www.google.com/s2/favicons?domain=${new URL(randomTool.url).hostname}`;
            content = `
                <p style="font-size: 1.1em; color: var(--text-primary); font-weight: 500;">Tool Recommendation:</p>
                <a href="${randomTool.url}" target="_blank" class="random-tool-link" title="Visit ${randomTool.name}">
                    <img src="${favicon}" alt="" class="tool-favicon" onerror="this.src='https://placehold.co/18x18/cccccc/000000?text=?'">
                    <span>${randomTool.name}</span>
                    <i class="fas fa-external-link-alt" style="font-size: 0.7em; margin-left: 5px;"></i>
                </a>
                <p style="font-size: 0.85em; color: var(--text-secondary); margin-top: 10px;">${randomTool.description}</p>
            `;
        } else if (hasTips) {
            const randomTip = allTips[Math.floor(Math.random() * allTips.length)];
            content = `
                <p style="font-size: 1.1em; color: var(--text-primary); font-weight: 500;">OSINT Tip of the Day:</p>
                <p style="font-size: 0.9em; color: var(--text-secondary); margin-top: 10px;">"${randomTip}"</p>
            `;
        } else {
            content = `
                <p style="font-size: 0.9em; color: var(--text-secondary);">No tools or tips available yet. Add some to get started!</p>
            `;
        }

        randomItemDisplay.innerHTML = content;
        randomBtn.disabled = false;
    }, 500);
}

/**
 * Generates a mock report (placeholder for future functionality).
 */
function generateReport() {
    if (appState.readOnlyMode) {
        showToast("Cannot generate reports in read-only shared view.", "warning");
        return;
    }
    showToast('Generating report... (Feature in development)', 'info');
}

/**
 * Checks if the current screen size is small and displays a desktop recommendation modal if needed.
 */
function checkAndShowDesktopRecommendation() {
    if (!appState.readOnlyMode && !sessionStorage.getItem('desktopRecommendationShown')) {
        if (window.innerWidth < 1024) {
            showModal('desktopRecommendationModal');
        }
    }
}

/**
 * Creates floating particle elements for background animation.
 */
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = window.innerWidth < 768 ? 15 : 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particle.style.width = particle.style.height = (Math.random() * 4 + 2) + 'px';
        particlesContainer.appendChild(particle);
    }
}

/**
 * Creates connecting line elements for background animation.
 */
function createConnectingLines() {
    const linesContainer = document.getElementById('connecting-lines');
    if (!linesContainer) return;

    const lineCount = window.innerWidth < 768 ? 3 : 6;
    
    for (let i = 0; i < lineCount; i++) {
        const line = document.createElement('div');
        line.className = 'connection-line';
        line.style.top = Math.random() * 100 + '%';
        line.style.left = Math.random() * 50 + '%';
        line.style.width = Math.random() * 200 + 100 + 'px';
        line.style.animationDelay = Math.random() * 4 + 's';
        line.style.animationDuration = (Math.random() * 2 + 3) + 's';
        linesContainer.appendChild(line);
    }
}

// Ensure particles and lines are created on DOMContentLoaded and remade on resize
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    createConnectingLines();
    
    // Stagger card animations for the investigation wall section
    const cards = document.querySelectorAll('.evidence-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = (index * 0.1) + 's';
        card.style.animation = 'slideIn 0.8s ease forwards';
    });
});

let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        const particlesContainer = document.getElementById('particles');
        const linesContainer = document.getElementById('connecting-lines');
        if (particlesContainer) particlesContainer.innerHTML = '';
        if (linesContainer) linesContainer.innerHTML = '';
        createParticles();
        createConnectingLines();
    }, 250);
});