// entry-rendering-and-filters.js

/**
 * Switches the active main tab in the application.
 * @param {string} tabName - The ID of the tab to activate (e.g., 'dashboard', 'intelligence-vault').
 */
function switchTab(tabName) {
    // Update main tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const targetTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetTabBtn) {
        targetTabBtn.classList.add('active');
    }

    // Update tab content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        // Hide specific sub-tab containers when switching main tabs
        if (content.id === 'intelligence-vaultTab') {
            const parentTabs = document.getElementById('intelligenceVaultParentTabs');
            const childTabs = document.getElementById('intelligenceVaultChildTabs');
            if (parentTabs) parentTabs.style.display = 'none';
            if (childTabs) childTabs.style.display = 'none';
            const addToolBtn = document.getElementById('addToolBtnIntelligenceVault');
            if (addToolBtn) addToolBtn.style.display = 'none';
        } else if (content.id === 'custom-tabsTab') {
            const parentEntryTabs = document.getElementById('customVaultEntryParentTabs');
            const childEntryTabs = document.getElementById('customVaultEntryChildTabs');
            if (parentEntryTabs) parentEntryTabs.style.display = 'none';
            if (childEntryTabs) childEntryTabs.style.display = 'none';
            const addEntryBtn = document.getElementById('addEntryBtnCustomVault');
            if (addEntryBtn) addEntryBtn.style.display = 'none';
            const editSubTabBtn = document.getElementById('editSubTabBtn');
            const deleteSubTabBtn = document.getElementById('deleteSubTabBtn');
            const exportSubTabBtn = document.getElementById('exportSubTabBtn');
            if (editSubTabBtn) editSubTabBtn.style.display = 'none';
            if (deleteSubTabBtn) deleteSubTabBtn.style.display = 'none';
            if (exportSubTabBtn) exportSubTabBtn.style.display = 'none';
        }
    });

    const targetTabContent = document.getElementById(`${tabName}Tab`);
    if (targetTabContent) {
        targetTabContent.classList.add('active');
    }

    // Update appState and clear filters for new tab
    appState.currentTab = tabName;
    appState.filters.category = '';
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) categoryFilter.value = '';
    appState.filters.search = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    // Specific logic for each main tab
    if (tabName === 'intelligence-vault') {
        const parentTabs = document.getElementById('intelligenceVaultParentTabs');
        if (parentTabs) parentTabs.style.display = 'flex';
        renderIntelligenceVaultParentTabs();

        const currentIntelParent = intelligenceVaultTabStructure.find(p => p.id === appState.currentIntelligenceVaultParentTab);
        if (!currentIntelParent) {
            appState.currentIntelligenceVaultParentTab = intelligenceVaultTabStructure[0].id;
        }
        switchIntelligenceVaultParentTab(appState.currentIntelligenceVaultParentTab);

        const addToolBtn = document.getElementById('addToolBtnIntelligenceVault');
        if (addToolBtn && !appState.readOnlyMode) {
            addToolBtn.style.display = 'inline-flex';
        }
        renderIntelligenceEntries();

    } else if (tabName === 'custom-tabs') {
        renderCustomTabs();

        if (appState.customTabs.length > 0) {
            const parentEntryTabs = document.getElementById('customVaultEntryParentTabs');
            if (parentEntryTabs) parentEntryTabs.style.display = 'flex';
            renderCustomVaultParentTabs();

            const currentCustomParent = customVaultEntryStructure.find(p => p.id === appState.currentCustomVaultParentTab);
            if (!currentCustomParent) {
                appState.currentCustomVaultParentTab = customVaultEntryStructure[0].id;
            }
            const currentCustomChild = currentCustomParent.children.find(c => c.id === appState.currentCustomVaultEntrySubTab);
            if (!currentCustomChild) {
                appState.currentCustomVaultEntrySubTab = currentCustomParent.children[0]?.id;
            }
            switchCustomVaultParentTab(appState.currentCustomVaultParentTab);

            const addEntryBtn = document.getElementById('addEntryBtnCustomVault');
            if (addEntryBtn && !appState.readOnlyMode) {
                addEntryBtn.style.display = 'inline-flex';
            }
        }
        renderIntelligenceEntries();

    } else if (tabName === 'timeline') {
        renderTimelineEvents();
    } else if (tabName === 'threats') {
        loadThreats();
    } else if (tabName === 'handbook') {
        initHandbookAndNotes();
    } else if (tabName === 'dork-assistant') {
        initDorkAssistant();
    } else if (tabName === 'case-studies') {
        renderCaseStudies();
        appState.caseStudyFilters.search = '';
        appState.caseStudyFilters.type = '';
        const caseStudySearchInput = document.getElementById('caseStudySearchInput');
        if (caseStudySearchInput) caseStudySearchInput.value = '';
        const caseStudyFilterSelect = document.getElementById('caseStudyFilterSelect');
        if (caseStudyFilterSelect) caseStudyFilterSelect.value = '';
    } else if (tabName === 'threat-hunting') {
        initThreatHuntingToolkit();
    }
    saveState();
}

/**
 * Renders the entries (tools/intelligence items) in the active tab's display area.
 * Filters and sorts entries based on current `appState.filters` and `appState.currentTab`.
 */
function renderIntelligenceEntries() {
    const toolsContainer = document.getElementById('toolsGrid');
    const customTabToolsContainer = document.getElementById('customTabToolsGrid');
    const intelligenceVaultEntriesContainer = document.getElementById('intelligenceVaultEntries');
    const emptyState = document.getElementById('emptyState');
    const emptyCustomTabState = document.getElementById('emptyCustomTabState');
    const emptyCurrentCustomTabState = document.getElementById('emptyCurrentCustomTabState');
    const emptyIntelligenceVaultState = document.getElementById('emptyIntelligenceVaultState');

    const intelligenceVaultParentTabs = document.getElementById('intelligenceVaultParentTabs');
    const intelligenceVaultChildTabs = document.getElementById('intelligenceVaultChildTabs');
    const customVaultEntryParentTabs = document.getElementById('customVaultEntryParentTabs');
    const customVaultEntryChildTabs = document.getElementById('customVaultEntryChildTabs');


    // Hide all empty states and containers initially
    if (toolsContainer) toolsContainer.style.display = 'none';
    if (customTabToolsContainer) customTabToolsContainer.style.display = 'none';
    if (intelligenceVaultEntriesContainer) intelligenceVaultEntriesContainer.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
    if (emptyCustomTabState) emptyCustomTabState.style.display = 'none';
    if (emptyCurrentCustomTabState) emptyCurrentCustomTabState.style.display = 'none';
    if (emptyIntelligenceVaultState) emptyIntelligenceVaultState.style.display = 'none';

    if (intelligenceVaultParentTabs) intelligenceVaultParentTabs.style.display = 'none';
    if (intelligenceVaultChildTabs) intelligenceVaultChildTabs.style.display = 'none';
    if (customVaultEntryParentTabs) customVaultEntryParentTabs.style.display = 'none';
    if (customVaultEntryChildTabs) customVaultEntryChildTabs.style.display = 'none';


    let filteredEntries = filterEntries();

    let targetContainer = null;
    let currentEmptyState = null;

    if (appState.currentTab === 'intelligence-vault') {
        targetContainer = intelligenceVaultEntriesContainer;
        currentEmptyState = emptyIntelligenceVaultState;

        if (intelligenceVaultParentTabs) intelligenceVaultParentTabs.style.display = 'flex';
        if (appState.currentIntelligenceVaultChildTab && intelligenceVaultChildTabs) {
             intelligenceVaultChildTabs.style.display = 'flex';
        }

        if (filteredEntries.length === 0) {
            if (currentEmptyState) currentEmptyState.style.display = 'block';
            if (targetContainer) targetContainer.style.display = 'none';
        } else {
            if (currentEmptyState) currentEmptyState.style.display = 'none';
            if (targetContainer) targetContainer.style.display = appState.viewMode === 'grid' ? 'grid' : 'flex';
        }

    } else if (appState.currentTab === 'custom-tabs') {
        targetContainer = customTabToolsContainer;

        if (appState.customTabs.length === 0) {
            if (emptyCustomTabState) emptyCustomTabState.style.display = 'block';
            const addEntryBtn = document.getElementById('addEntryBtnCustomVault');
            if (addEntryBtn) addEntryBtn.style.display = 'none';
            return;
        } else {
            if (emptyCustomTabState) emptyCustomTabState.style.display = 'none';
        }

        if (appState.currentCustomTab) {
            if (customVaultEntryParentTabs) customVaultEntryParentTabs.style.display = 'flex';
            if (appState.currentCustomVaultEntrySubTab && customVaultEntryChildTabs) {
                customVaultEntryChildTabs.style.display = 'flex';
            }
            const addEntryBtn = document.getElementById('addEntryBtnCustomVault');
            if (addEntryBtn) addEntryBtn.style.display = appState.readOnlyMode ? 'none' : 'inline-flex';


            if (filteredEntries.length === 0) {
                if (emptyCurrentCustomTabState) emptyCurrentCustomTabState.style.display = 'block';
                if (targetContainer) targetContainer.style.display = 'none';
            } else {
                if (emptyCurrentCustomTabState) emptyCurrentCustomTabState.style.display = 'none';
                if (targetContainer) targetContainer.style.display = appState.viewMode === 'grid' ? 'grid' : 'flex';
            }
        } else {
            if (emptyCurrentCustomTabState) emptyCurrentCustomTabState.style.display = 'block';
            if (targetContainer) targetContainer.style.display = 'none';
        }
    } else if (appState.currentTab === 'tools') {
        targetContainer = toolsContainer;
        currentEmptyState = emptyState;
        if (filteredEntries.length === 0) {
            if (currentEmptyState) currentEmptyState.style.display = 'block';
            if (targetContainer) targetContainer.style.display = 'none';
        } else {
            if (currentEmptyState) currentEmptyState.style.display = 'none';
            if (targetContainer) targetContainer.style.display = appState.viewMode === 'grid' ? 'grid' : 'flex';
        }
    }

    if (targetContainer) {
        if (appState.viewMode === 'grid') {
            targetContainer.classList.remove('tools-list');
            targetContainer.classList.add('tools-grid');
        } else {
            targetContainer.classList.remove('tools-grid');
            targetContainer.classList.add('tools-list');
        }
        targetContainer.innerHTML = filteredEntries.map(entry => createEntryCard(entry)).join('');
    }

    const viewToggleButton = document.getElementById('viewToggle');
    const vaultViewToggleButton = document.getElementById('vaultViewToggle');
    const customVaultViewToggleButton = document.getElementById('customVaultViewToggle');

    if (appState.viewMode === 'grid') {
        if (viewToggleButton) viewToggleButton.innerHTML = '<i class="fas fa-list"></i> List View';
        if (vaultViewToggleButton) vaultViewToggleButton.innerHTML = '<i class="fas fa-list"></i> List View';
        if (customVaultViewToggleButton) customVaultViewToggleButton.innerHTML = '<i class="fas fa-list"></i> List View';
    } else {
        if (viewToggleButton) viewToggleButton.innerHTML = '<i class="fas fa-th"></i> Grid View';
        if (vaultViewToggleButton) vaultViewToggleButton.innerHTML = '<i class="fas fa-th"></i> Grid View';
        if (customVaultViewToggleButton) customVaultViewToggleButton.innerHTML = '<i class="fas fa-th"></i> Grid View';
    }
    
    if (appState.readOnlyMode && appState.sharedEntryIds.length > 0) {
        let shouldHighlight = false;
        if (appState.sharedTabId === 'allData' || appState.sharedTabId === 'allVault') {
            shouldHighlight = true;
        } else if (appState.currentTab === 'custom-tabs' && appState.currentCustomTab === appState.sharedTabId) {
            shouldHighlight = true;
        } else if (appState.currentTab === 'intelligence-vault' && appState.currentIntelligenceVaultChildTab === appState.sharedTabId) {
            shouldHighlight = true;
        }

        if (shouldHighlight) {
            appState.sharedEntryIds.forEach(id => {
                const entryCard = document.querySelector(`.tool-card[data-entry-id="${id}"]`);
                if (entryCard) {
                    entryCard.classList.add('shared-highlight');
                }
            });
        }
    }

    saveState();
}

/**
 * Filters and sorts entries based on current appState filters and tab.
 * @returns {Array<object>} The filtered and sorted list of entries.
 */
function filterEntries() {
    let entriesToSearch = [];

    const allKnownEntries = [
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
        ...(appState.publicRecords || [])
    ];

    if (appState.filters.searchScope === 'allData' || appState.filters.searchScope === 'allVault') {
        entriesToSearch = allKnownEntries;
    } else {
        if (appState.currentTab === 'intelligence-vault') {
            entriesToSearch = appState.tools.filter(tool =>
                (tool.intelligenceVaultCategories || []).includes(appState.currentIntelligenceVaultChildTab)
            );
        } else if (appState.currentTab === 'custom-tabs' && appState.currentCustomTab) {
            const activeCustomTab = appState.customTabs.find(tab => tab.id === appState.currentCustomTab);
            if (activeCustomTab) {
                let entriesInActiveCustomTab = allKnownEntries.filter(entry =>
                    (entry.customTabs || []).includes(activeCustomTab.id)
                );

                if (appState.currentCustomVaultEntrySubTab) {
                    entriesToSearch = entriesInActiveCustomTab.filter(entry =>
                        entry.type === appState.currentCustomVaultEntrySubTab
                    );
                } else {
                    entriesToSearch = entriesInActiveCustomTab;
                }
            } else {
                entriesToSearch = [];
            }
        } else {
            entriesToSearch = [];
        }
    }

    let filtered = [...entriesToSearch];

    if (appState.filters.search) {
        const searchTerm = appState.filters.search.toLowerCase();
        filtered = filtered.filter(entry => {
            const searchableFields = [
                entry.name, entry.title, entry.description, entry.notes, entry.url, entry.value,
                entry.category,
                entry.source,
                entry.email, entry.number, entry.address, entry.txid,
                entry.linkedPlatforms, entry.breachResults,
                entry.phoneType, entry.location, entry.mapLink, entry.ipGeoIntel,
                entry.mediaType,
                entry.service, entry.username, entry.password, entry.strength,
                entry.context,
                entry.platform, entry.followCounts,
                entry.domainType, entry.registrar, entry.status, entry.whois, entry.dns,
                entry.platformsFound, entry.emails, entry.realName, entry.activity,
                entry.threatType, entry.threatName, entry.severity, entry.iocs, entry.targets, entry.attribution, entry.threatSource,
                entry.cve, entry.cvss, entry.software, entry.vulnType, entry.exploit, entry.mitigation,
                entry.filename, entry.hash, entry.fileType, entry.family, entry.detection, entry.behavior, entry.malwareSource, entry.tools,
                entry.company, entry.date, entry.records, entry.dataTypes, entry.vector, entry.breachStatus, entry.breachSource,
                entry.credentialType, entry.credentialValue, entry.credentialService, entry.dateFound,
                entry.forumName, entry.forumUrl, entry.forumType, entry.forumStatus, entry.forumLanguage,
                entry.vendorAlias, entry.vendorPlatforms, entry.vendorProducts, entry.vendorReputation,
                entry.telegramName, entry.telegramUrl, entry.telegramType, entry.subscribers, entry.language, entry.telegramActivity, entry.content, entry.admin,
                entry.pasteUrl, entry.sourceSite, entry.contentSummary, entry.keywords,
                entry.documentTitle, entry.documentFileType, entry.documentHash, entry.documentContentSummary, entry.documentSource,
                entry.networkSubject, entry.networkType, entry.networkFindings, entry.associatedIpsDomains, entry.toolsUsed,
                entry.metadataTitle, entry.fileSource,
                entry.originalUrl, entry.archiveUrl, entry.service, entry.timestamp,
                entry.messagingApp, entry.chatId,
                entry.datingPlatform, entry.displayName, entry.age, entry.photos, entry.bio, entry.verified, entry.suspicious,
                entry.format, entry.duration, entry.quality, entry.audioLanguage, entry.transcript, entry.speakers, entry.background,
                entry.subject, entry.sourceDescription, entry.identifiedProfiles, entry.confidence, entry.facialToolsUsed,
                entry.realName, entry.associatedAccounts, entry.platformsUsed, entry.origin,
                entry.vpnName, entry.vpnType, entry.jurisdiction, entry.logs, entry.payment, entry.locations, entry.issues, entry.useCase,
                entry.honeypotType, entry.honeypotLocation, entry.honeypotPurpose, entry.honeypotDataSummary, entry.honeypotAlerts,
                entry.exploitName, entry.targetVuln, entry.exploitType, entry.marketSource, entry.price,
                entry.recordType, entry.subjectName, entry.refId, entry.jurisdiction, entry.date, entry.summary, entry.sourceUrl
            ].map(field => String(field || '').toLowerCase());

            if (entry.tags) {
                searchableFields.push(...entry.tags.map(tag => tag.toLowerCase()));
            }

            if (entry.metadata) {
                searchableFields.push(...entry.metadata.flatMap(meta => [String(meta.key || '').toLowerCase(), String(meta.value || '').toLowerCase()]));
            }

            return searchableFields.some(field => field.includes(searchTerm));
        });
    }

    if (appState.filters.category === 'pinned') {
        filtered = filtered.filter(entry => entry.pinned);
    } else if (appState.filters.category === 'starred') {
        filtered = filtered.filter(entry => entry.starred);
    } else if (appState.filters.category) {
        if (appState.currentTab === 'intelligence-vault' || (appState.currentTab === 'custom-tabs' && appState.currentCustomVaultEntrySubTab === 'tool')) {
            filtered = filtered.filter(entry => entry.type === 'tool' && entry.category === appState.filters.category);
        } else {
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) categoryFilter.value = '';
            appState.filters.category = '';
        }
    }

    filtered.sort((a, b) => {
        switch (appState.filters.sort) {
            case 'recent':
                return new Date(b.addedDate || 0) - new Date(a.addedDate || 0);
            case 'popular':
                return (b.lastUsed || 0) - (a.lastUsed || 0);
            default:
                const nameA = getEntryName(a);
                const nameB = getEntryName(b);
                return nameA.localeCompare(nameB);
        }
    });

    return filtered;
}

/**
 * Creates the HTML string for a single entry card (tool, email, etc.).
 * @param {object} entry - The entry object.
 * @returns {string} The HTML string for the entry card.
 */
function createEntryCard(entry) {
    const isSelected = appState.selectedEntries.has(entry.id);
    let title, subtitle, description, icon, faviconHtml = '', extraContent = '';

    let originTagHtml = '';
    if (entry.origin === 'pre-added') {
        originTagHtml = `<span class="tag" style="background-color: var(--primary); color: white; margin-left: 10px;">Pre-added</span>`;
    } else if (entry.origin === 'user-added') {
        originTagHtml = `<span class="tag" style="background-color: var(--accent); color: white; margin-left: 10px;">User-added</span>`;
    }

    const investigationNotes = entry.notes ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Notes:</strong> ${entry.notes}</p>` : '';

    switch (entry.type) {
        case 'tool':
            title = entry.name;
            subtitle = entry.url;
            description = entry.description;
            icon = 'fas fa-tools';
            faviconHtml = `<img src="${entry.favicon}" alt="" class="tool-favicon" onerror="this.src='https://www.google.com/s2/favicons?domain=${new URL(entry.url).hostname}'">`;
            extraContent += investigationNotes;
            break;
        case 'email':
            title = entry.email;
            subtitle = entry.linkedPlatforms.join(', ') || 'No linked platforms';
            description = entry.description || entry.notes;
            icon = 'fas fa-envelope';
            extraContent = entry.breachResults ? `<p style="color: var(--danger); font-size: 12px; margin-top: 5px;"><i class="fas fa-exclamation-triangle"></i> Breach: ${entry.breachResults}</p>` : '';
            extraContent += investigationNotes;
            break;
        case 'phone':
            title = entry.number;
            subtitle = `Type: ${entry.phoneType}`;
            description = entry.description || entry.notes;
            icon = 'fas fa-phone';
            extraContent = entry.location ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><i class="fas fa-map-marker-alt"></i> ${entry.location}</p>` : '';
            extraContent += investigationNotes;
            break;
        case 'crypto':
            title = entry.address;
            subtitle = `TXID: ${entry.txid}`;
            description = entry.description || `Amount: ${entry.amount} | Source: ${entry.source}`;
            icon = 'fas fa-coins';
            extraContent += investigationNotes;
            break;
        case 'location':
            title = entry.name;
            subtitle = `Coordinates: ${entry.coordinates}`;
            description = entry.description || entry.notes;
            icon = 'fas fa-map-marker-alt';
            extraContent = entry.mapLink ? `<p style="font-size: 12px; margin-top: 5px;"><a href="${entry.mapLink}" target="_blank" style="color: var(--primary); text-decoration: none;"><i class="fas fa-external-link-alt"></i> View Map</a></p>` : '';
            extraContent += entry.ipGeoIntel ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;">IP/Geo: ${entry.ipGeoIntel}</p>` : '';
            extraContent += investigationNotes;
            break;
        case 'link':
            title = entry.url;
            subtitle = entry.platform || 'General Link';
            description = entry.description || entry.notes;
            icon = 'fas fa-link';
            try {
                faviconHtml = `<img src="https://www.google.com/s2/favicons?domain=${new URL(entry.url).hostname}" alt="" class="tool-favicon">`;
            } catch (e) {
                faviconHtml = '';
            }
            extraContent += investigationNotes;
            break;
        case 'media':
            title = entry.title;
            subtitle = entry.mediaType === 'image' ? 'Image' : 'Video';
            description = entry.description || entry.notes;
            icon = entry.mediaType === 'image' ? 'fas fa-image' : 'fas fa-video';
            extraContent = entry.base64Data ? (entry.mediaType === 'image' ? `<img src="${entry.base64Data}" alt="Media thumbnail" style="max-width: 100%; height: auto; border-radius: 8px; margin-top: 10px;">` : `<video controls style="max-width: 100%; height: auto; border-radius: 8px; margin-top: 10px;"><source src="${entry.base64Data}" type="video/mp4"></video>`) : '';
            extraContent += investigationNotes;
            break;
        case 'password':
            title = entry.service;
            subtitle = `Username: ${entry.username || 'N/A'}`;
            description = entry.description || `Password: ${entry.password} | Strength: ${entry.strength || 'N/A'}`;
            icon = 'fas fa-key';
            extraContent += investigationNotes;
            break;
        case 'keyword':
            title = entry.value;
            subtitle = `Context: ${entry.context || 'General'}`;
            description = entry.description || entry.notes;
            icon = 'fas fa-font';
            extraContent += investigationNotes;
            break;
        case 'social':
            title = entry.username;
            subtitle = `Platform: ${entry.platform}`;
            description = entry.description || `URL: ${entry.url}\nFollowers/Following: ${entry.followCounts || 'N/A'}`;
            icon = 'fas fa-users';
            try {
                faviconHtml = `<img src="https://www.google.com/s2/favicons?domain=${new URL(entry.url).hostname}" alt="" class="tool-favicon">`;
            } catch (e) {
                faviconHtml = '';
            }
            extraContent += investigationNotes;
            break;
        case 'domain':
            title = entry.value;
            subtitle = `Type: ${entry.domainType} | Status: ${entry.status || 'N/A'}`;
            description = entry.description || `Registrar: ${entry.registrar || 'N/A'}\nLocation: ${entry.location || 'N/A'}`;
            icon = 'fas fa-globe';
            extraContent = entry.whois ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>WHOIS:</strong> ${entry.whois}</p>` : '';
            extraContent += entry.dns ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>DNS:</strong> ${entry.dns}</p>` : '';
            extraContent += investigationNotes;
            break;
        case 'username':
            title = entry.value;
            subtitle = `Real Name: ${entry.realName || 'N/A'}`;
            description = entry.description || `Platforms: ${entry.platformsFound || 'N/A'}\nEmails: ${entry.emails || 'N/A'}\nActivity: ${entry.activity || 'N/A'}`;
            icon = 'fas fa-user';
            extraContent += investigationNotes;
            break;
        case 'threat':
            title = entry.name;
            subtitle = `Type: ${entry.threatType} | Severity: ${entry.severity}`;
            description = entry.description;
            icon = 'fas fa-skull-crossbones';
            extraContent = entry.iocs ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>IOCs:</strong> ${entry.iocs}</p>` : '';
            extraContent += entry.targets ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Targets:</strong> ${entry.targets}</p>` : '';
            extraContent += entry.attribution ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Attribution:</strong> ${entry.attribution}</p>` : '';
            extraContent += investigationNotes;
            break;
        case 'vulnerability':
            title = entry.cve;
            subtitle = `CVSS: ${entry.cvss} | Type: ${entry.vulnType}`;
            description = entry.description || `Affected: ${entry.software || 'N/A'}\nExploit: ${entry.exploit || 'N/A'}`;
            icon = 'fas fa-bug';
            extraContent = entry.mitigation ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Mitigation:</strong> ${entry.mitigation}</p>` : '';
            extraContent += investigationNotes;
            break;
        case 'malware':
            title = entry.filename;
            subtitle = `Type: ${entry.fileType} | Hash: ${entry.hash}`;
            description = entry.behavior || `Family: ${entry.family || 'N/A'}\nDetection: ${entry.detection || 'N/A'}`;
            icon = 'fas fa-biohazard';
            extraContent = entry.malwareSource ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Source:</strong> ${entry.malwareSource}</p>` : '';
            extraContent += entry.tools ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Tools:</strong> ${entry.tools}</p>` : '';
            extraContent += investigationNotes;
            break;
        case 'breach':
            title = entry.company;
            subtitle = `Date: ${entry.date || 'N/A'} | Records: ${entry.records || 'N/A'}`;
            description = entry.description || `Data Types: ${entry.dataTypes || 'N/A'}\nVector: ${entry.vector || 'N/A'}\nStatus: ${entry.status || 'N/A'}`;
            icon = 'fas fa-database';
            extraContent = entry.source ? `<p style="font-size: 12px; margin-top: 5px;"><a href="${entry.source}" target="_blank" style="color: var(--primary); text-decoration: none;"><i class="fas fa-external-link-alt"></i> Source</a></p>` : '';
            extraContent += investigationNotes;
            break;
        case 'credential':
            title = entry.credentialService || 'N/A';
            subtitle = `Type: ${entry.credentialType}`;
            description = entry.description || `Value: ${entry.credentialValue.substring(0, 50)}${entry.credentialValue.length > 50 ? '...' : ''}\nBreach Source: ${entry.breachSource || 'N/A'}`;
            icon = 'fas fa-user-lock';
            extraContent += investigationNotes;
            break;
        case 'forum':
            title = entry.forumName;
            subtitle = `Type: ${entry.forumType} | Status: ${entry.forumStatus}`;
            description = entry.description || `URL: ${entry.forumUrl}\nLanguage: ${entry.forumLanguage || 'N/A'}`;
            icon = 'fas fa-comments';
            try {
                faviconHtml = entry.forumUrl ? `<img src="https://www.google.com/s2/favicons?domain=${new URL(entry.forumUrl).hostname}" alt="" class="tool-favicon">` : '';
            } catch (e) {
                faviconHtml = '';
            }
            extraContent += investigationNotes;
            break;
        case 'vendor':
            title = entry.vendorAlias;
            subtitle = `Reputation: ${entry.vendorReputation || 'N/A'}`;
            description = entry.description || `Products: ${entry.vendorProducts || 'N/A'}\nPlatforms: ${entry.vendorPlatforms || 'N/A'}`;
            icon = 'fas fa-store';
            extraContent += investigationNotes;
            break;
        case 'telegram':
            title = entry.name;
            subtitle = `Type: ${entry.telegramType} | Subs: ${entry.subscribers || 'N/A'}`;
            description = entry.content || `URL: ${entry.url}\nLanguage: ${entry.language || 'N/A'}\nActivity: ${entry.activity || 'N/A'}\nAdmin: ${entry.admin || 'N/A'}`;
            icon = 'fab fa-telegram-plane';
            try {
                faviconHtml = entry.url ? `<img src="https://www.google.com/s2/favicons?domain=${new URL(entry.url).hostname}" alt="" class="tool-favicon">` : '';
            } catch (e) {
                faviconHtml = '';
            }
            extraContent += investigationNotes;
            break;
        case 'paste':
            title = entry.url;
            subtitle = `Source: ${entry.sourceSite || 'N/A'}`;
            description = entry.contentSummary || entry.description || `Keywords: ${entry.keywords || 'N/A'}`;
            icon = 'fas fa-paste';
            try {
                faviconHtml = entry.url ? `<img src="https://www.google.com/s2/favicons?domain=${new URL(entry.url).hostname}" alt="" class="tool-favicon">` : '';
            } catch (e) {
                faviconHtml = '';
            }
            extraContent += investigationNotes;
            break;
        case 'document':
            title = entry.title;
            subtitle = `Type: ${entry.fileType} | Hash: ${entry.hash || 'N/A'}`;
            description = entry.contentSummary || entry.description;
            icon = 'fas fa-file-alt';
            extraContent = entry.source ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Source:</strong> ${entry.source}</p>` : '';
            extraContent += investigationNotes;
            break;
        case 'network':
            title = entry.subject;
            subtitle = `Analysis Type: ${entry.networkType}`;
            description = entry.findings || entry.description;
            icon = 'fas fa-network-wired';
            extraContent = entry.associatedIpsDomains ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Associated:</strong> ${entry.associatedIpsDomains}</p>` : '';
            extraContent += entry.toolsUsed ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Tools:</strong> ${entry.toolsUsed}</p>` : '';
            extraContent += investigationNotes;
            break;
        case 'metadata':
            title = entry.title;
            subtitle = `File/Source: ${entry.fileSource || 'N/A'}`;
            description = entry.description;
            icon = 'fas fa-info-circle';
            extraContent += investigationNotes;
            break;
        case 'archive':
            title = `Archived: ${entry.originalUrl}`;
            subtitle = `Service: ${entry.service || 'N/A'} | Timestamp: ${entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A'}`;
            description = entry.contentSummary || entry.description;
            icon = 'fas fa-archive';
            try {
                faviconHtml = entry.url ? `<img src="https://www.google.com/s2/favicons?domain=${new URL(entry.url).hostname}" alt="" class="tool-favicon">` : '';
            } catch (e) {
                faviconHtml = '';
            }
            extraContent += investigationNotes;
            break;
        case 'messaging':
            title = entry.username;
            subtitle = `App: ${entry.messagingApp} | Chat: ${entry.chatId || 'N/A'}`;
            description = entry.content || entry.description;
            icon = 'fas fa-comment-dots';
            extraContent += investigationNotes;
            break;
        case 'dating':
            title = entry.username;
            subtitle = `Platform: ${entry.platform} | Age: ${entry.age || 'N/A'}`;
            description = entry.bio || entry.description || `Location: ${entry.location || 'N/A'}\nVerified: ${entry.verified || 'N/A'}\nSuspicious: ${entry.suspicious || 'N/A'}`;
            icon = 'fas fa-heart';
            extraContent = entry.photos ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Photos:</strong> ${entry.photos}</p>` : '';
            extraContent += investigationNotes;
            break;
        case 'audio':
            title = entry.title;
            subtitle = `Format: ${entry.format} | Duration: ${entry.duration || 'N/A'}`;
            description = entry.description || `Quality: ${entry.quality || 'N/A'}\nLanguage: ${entry.language || 'N/A'}\nTranscript: ${entry.transcript || 'N/A'}`;
            icon = 'fas fa-volume-up';
            extraContent = entry.base64Data ? `<audio controls style="max-width: 100%; margin-top: 10px;"><source src="${entry.base64Data}" type="audio/${entry.format}"></audio>` : '';
            extraContent += `Speakers: ${entry.speakers || 'N/A'}<br>Background Noise: ${entry.background || 'N/A'}<br>Tools: ${entry.tools || 'N/A'}`;
            extraContent += investigationNotes;
            break;
        case 'facial':
            title = entry.subject;
            subtitle = `Confidence: ${entry.confidence || 'N/A'}`;
            description = entry.description || `Source: ${entry.sourceDescription || 'N/A'}\nProfiles: ${entry.identifiedProfiles || 'N/A'}\nTools: ${entry.toolsUsed || 'N/A'}`;
            icon = 'fas fa-face-id-card';
            extraContent += investigationNotes;
            break;
        case 'persona':
            title = entry.name;
            subtitle = `Real Name: ${entry.realName || 'N/A'}`;
            description = entry.bio || entry.description || `Accounts: ${entry.associatedAccounts || 'N/A'}\nPlatforms: ${entry.platformsUsed || 'N/A'}\nOrigin: ${entry.origin || 'N/A'}`;
            icon = 'fas fa-id-badge';
            extraContent += investigationNotes;
            break;
        case 'vpn':
            title = entry.name;
            subtitle = `Type: ${entry.vpnType} | Jurisdiction: ${entry.jurisdiction || 'N/A'}`;
            description = entry.description || `Logging: ${entry.logs || 'N/A'}\nPayment: ${entry.payment || 'N/A'}\nIssues: ${entry.issues || 'N/A'}`;
            icon = 'fas fa-shield-alt';
            extraContent += investigationNotes;
            break;
        case 'honeypot':
            title = `Honeypot: ${entry.honeypotType}`;
            subtitle = `Location: ${entry.location || 'N/A'}`;
            description = entry.dataSummary || entry.description || `Purpose: ${entry.purpose || 'N/A'}\nAlerts: ${entry.alerts || 'N/A'}`;
            icon = 'fas fa-honey-pot';
            extraContent += investigationNotes;
            break;
        case 'exploit':
            title = entry.name;
            subtitle = `Target: ${entry.targetVuln} | Type: ${entry.exploitType}`;
            description = entry.description || `Source: ${entry.marketSource || 'N/A'}\nPrice: ${entry.price || 'N/A'}`;
            icon = 'fas fa-bomb';
            extraContent += investigationNotes;
            break;
        case 'publicrecord':
            title = `Record: ${entry.recordType}`;
            subtitle = `Subject: ${entry.subjectName} | ID: ${entry.refId || 'N/A'}`;
            description = entry.summary || entry.description || `Jurisdiction: ${entry.jurisdiction || 'N/A'}\nDate: ${entry.date || 'N/A'}`;
            icon = 'fas fa-scale-balanced';
            extraContent = entry.sourceUrl ? `<p style="font-size: 12px; margin-top: 5px;"><a href="${entry.sourceUrl}" target="_blank" style="color: var(--primary); text-decoration: none;"><i class="fas fa-external-link-alt"></i> Source</a></p>` : '';
            extraContent += investigationNotes;
            break;
        default:
            title = entry.name || entry.title || entry.value || 'Unknown Entry';
            subtitle = `Type: ${entry.type}`;
            description = entry.description || entry.notes || 'No description available.';
            icon = 'fas fa-question-circle';
            break;
    }

    if (entry.source) {
        extraContent += `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><i class="fas fa-satellite-dish"></i> Source: ${entry.source}</p>`;
    }
    if (entry.metadata && entry.metadata.length > 0) {
        extraContent += `<div style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Metadata:</strong>`;
        entry.metadata.forEach(meta => {
            extraContent += `<p style="margin-left: 10px;">- ${meta.key}: ${meta.value}</p>`;
        });
        extraContent += `</div>`;
    }

    return `
        <div class="tool-card ${entry.starred ? 'starred' : ''} ${entry.pinned ? 'pinned' : ''} ${isSelected ? 'selected' : ''}"
        data-entry-id="${entry.id}" data-entry-type="${entry.type}">
            <div class="tool-header">
                <div>
                    <div class="tool-title">
                        <input type="checkbox" class="bulk-checkbox" ${isSelected ? 'checked' : ''}>
                        ${faviconHtml} <i class="${icon}" style="margin-right: 5px;"></i> <span>${title}</span>
                        ${originTagHtml} </div>
                    <div class="tool-url">
                        <span>${subtitle}</span> ${entry.url ? '<i class="fas fa-external-link-alt external-link-icon"></i>' : ''}
                    </div>
                </div>
                <div class="tool-actions">
                    <button class="action-btn" data-action="edit" title="Edit Entry">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn ${entry.starred ? 'starred' : ''}" data-action="star" title="Star Entry">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="action-btn ${entry.pinned ? 'pinned' : ''}" data-action="pin" title="Pin Entry">
                        <i class="fas fa-thumbtack"></i>
                    </button>
                    ${entry.url ? `<button class="action-btn" data-action="visit" title="Visit Link">
                        <i class="fas fa-external-link-alt"></i>
                    </button>` : ''}
                    <button class="action-btn" data-action="delete" title="Delete Entry">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 10px;">
                ${description}
            </p>
            ${extraContent}
            <div class="tool-tags">
                ${entry.tags ? entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
            </div>
        </div>
    `;
}

/**
 * Populates the main category filter dropdown and tool modals with available categories.
 */
function populateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    const toolCategorySelect = document.getElementById('toolCategory');
    const editToolCategorySelect = document.getElementById('editToolCategory');
    const toolOnlyCategorySelect = document.getElementById('toolOnlyCategory');

    const existingCategories = new Set(appState.tools.map(tool => tool.category.toLowerCase()));

    const defaultCategories = [
        'Search Engines', 'Social Media', 'Network Analysis', 'Email Investigation',
        'Domain Research', 'Image Analysis', 'GEOINT', 'Threat Intelligence', 'Archive', 'Other'
    ];

    const allCategories = new Set([...defaultCategories.map(cat => cat.toLowerCase()), ...Array.from(existingCategories)]);

    if (categoryFilter) categoryFilter.innerHTML = '<option value="">All Categories</option>';
    if (toolCategorySelect) toolCategorySelect.innerHTML = '<option value="">Select Category</option>';
    if (editToolCategorySelect) editToolCategorySelect.innerHTML = '<option value="">Select Category</option>';
    if (toolOnlyCategorySelect) toolOnlyCategorySelect.innerHTML = '<option value="">Select Category</option>';


    const sortedCategories = Array.from(allCategories).sort((a, b) => a.localeCompare(b));

    sortedCategories.forEach(category => {
        const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
        if (categoryFilter) {
            const filterOption = document.createElement('option');
            filterOption.value = category;
            filterOption.textContent = capitalizedCategory;
            categoryFilter.appendChild(filterOption);
        }
        if (toolCategorySelect) {
            const toolOption = document.createElement('option');
            toolOption.value = category;
            toolOption.textContent = capitalizedCategory;
            toolCategorySelect.appendChild(toolOption);
        }
        if (editToolCategorySelect) {
            const editToolOption = document.createElement('option');
            editToolOption.value = category;
            editToolOption.textContent = capitalizedCategory;
            editToolCategorySelect.appendChild(editToolOption);
        }
        if (toolOnlyCategorySelect) {
            const toolOnlyOption = document.createElement('option');
            toolOnlyOption.value = category;
            toolOnlyOption.textContent = capitalizedCategory;
            toolOnlyCategorySelect.appendChild(toolOnlyOption);
        }
    });

    const customOptionAdd = document.createElement('option');
    customOptionAdd.value = 'custom';
    customOptionAdd.textContent = 'Custom Category';
    if (toolCategorySelect) toolCategorySelect.appendChild(customOptionAdd);

    const customOptionAddToolOnly = document.createElement('option');
    customOptionAddToolOnly.value = 'custom';
    customOptionAddToolOnly.textContent = 'Custom Category';
    if (toolOnlyCategorySelect) toolOnlyCategorySelect.appendChild(customOptionAddToolOnly);

    const customOptionEdit = document.createElement('option');
    customOptionEdit.value = 'custom';
    customOptionEdit.textContent = 'Custom Category';
    if (editToolCategorySelect) editToolCategorySelect.appendChild(customOptionEdit);


    if (categoryFilter) categoryFilter.value = appState.filters.category;
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) sortFilter.value = appState.filters.sort;
}

/**
 * Renders the parent tab buttons for the Intelligence Vault section.
 */
function renderIntelligenceVaultParentTabs() {
    const parentTabsContainer = document.getElementById('intelligenceVaultParentTabs');
    if (!parentTabsContainer) return;

    parentTabsContainer.innerHTML = '';

    intelligenceVaultTabStructure.map(parentTab => {
        const button = document.createElement('button');
        button.classList.add('nav-tab', 'intelligence-vault-parent-tab');
        button.dataset.parentTab = parentTab.id;
        button.innerHTML = `<i class="${parentTab.icon}"></i> ${parentTab.name}`;
        parentTabsContainer.appendChild(button);
    });

    const activeParentBtn = parentTabsContainer.querySelector(`.intelligence-vault-parent-tab[data-parent-tab="${appState.currentIntelligenceVaultParentTab}"]`);
    if (activeParentBtn) {
        activeParentBtn.classList.add('active');
    }
}

/**
 * Switches the active parent tab within the Intelligence Vault and updates child tabs.
 * @param {string} parentId - The ID of the parent tab to activate.
 */
function switchIntelligenceVaultParentTab(parentId) {
    if (appState.readOnlyMode) {
        showToast("Cannot switch categories in read-only shared view.", "warning");
        return;
    }

    document.querySelectorAll('#intelligenceVaultParentTabs .intelligence-vault-parent-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    const activeParentBtn = document.querySelector(`#intelligenceVaultParentTabs .intelligence-vault-parent-tab[data-parent-tab="${parentId}"]`);
    if (activeParentBtn) {
        activeParentBtn.classList.add('active');
    }

    appState.currentIntelligenceVaultParentTab = parentId;

    const selectedParent = intelligenceVaultTabStructure.find(p => p.id === parentId);
    const childTabsContainer = document.getElementById('intelligenceVaultChildTabs');

    if (selectedParent && childTabsContainer) {
        childTabsContainer.style.display = 'flex';
        childTabsContainer.innerHTML = selectedParent.children.map(childTab => `
            <button class="sub-nav-tab intelligence-vault-child-tab" data-child-tab="${childTab.id}">
                <i class="${childTab.icon}"></i> ${childTab.name}
            </button>
        `).join('');

        let childToActivate = appState.currentIntelligenceVaultChildTab;
        if (!selectedParent.children.some(c => c.id === childToActivate)) {
            childToActivate = selectedParent.children[0]?.id;
        }
        if (childToActivate) {
            switchIntelligenceVaultChildTab(childToActivate);
        } else {
            appState.currentIntelligenceVaultChildTab = null;
            appState.filters.category = '';
            renderIntelligenceEntries();
        }

    } else {
        if (childTabsContainer) childTabsContainer.style.display = 'none';
        appState.currentIntelligenceVaultChildTab = null;
        appState.filters.category = '';
        renderIntelligenceEntries();
    }

    saveState();
}

/**
 * Switches the active child sub-tab within the Intelligence Vault and re-renders entries.
 * @param {string} childId - The ID of the child tab to activate (maps to a tool category).
 */
function switchIntelligenceVaultChildTab(childId) {
    if (appState.readOnlyMode) {
        showToast("Cannot switch categories in read-only shared view.", "warning");
        return;
    }

    document.querySelectorAll('#intelligenceVaultChildTabs .intelligence-vault-child-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    const targetChildTabBtn = document.querySelector(`#intelligenceVaultChildTabs .intelligence-vault-child-tab[data-child-tab="${childId}"]`);
    if (targetChildTabBtn) {
        targetChildTabBtn.classList.add('active');
    }

    appState.currentIntelligenceVaultChildTab = childId;
    appState.filters.category = '';
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) categoryFilter.value = '';
    renderIntelligenceEntries();
    saveState();
}


/**
 * Handles actions performed on individual entry cards (edit, star, pin, visit, delete).
 * @param {Event} e - The click event.
 */
function handleEntryAction(e) {
    if (appState.readOnlyMode) {
        showToast("Cannot perform actions in read-only shared view.", "warning");
        return;
    }

    const targetBtn = e.target.closest('.action-btn');
    if (!targetBtn) return;

    e.preventDefault();
    const action = targetBtn.dataset.action;
    const entryCard = e.target.closest('.tool-card');
    const entryId = entryCard.dataset.entryId;
    const entryType = entryCard.dataset.entryType;

    let entry = null;
    let entryArray = null;

    switch (entryType) {
        case 'tool': entryArray = appState.tools; break;
        case 'email': entryArray = appState.emails; break;
        case 'phone': entryArray = appState.phones; break;
        case 'crypto': entryArray = appState.crypto; break;
        case 'location': entryArray = appState.locations; break;
        case 'link': entryArray = appState.links; break;
        case 'media': entryArray = appState.media; break;
        case 'password': entryArray = appState.passwords; break;
        case 'keyword': entryArray = appState.keywords; break;
        case 'social': entryArray = appState.socials; break;
        case 'domain': entryArray = appState.domains; break;
        case 'username': entryArray = appState.usernames; break;
        case 'threat': entryArray = appState.threats; break;
        case 'vulnerability': entryArray = appState.vulnerabilities; break;
        case 'malware': entryArray = appState.malware; break;
        case 'breach': entryArray = appState.breaches; break;
        case 'credential': entryArray = appState.credentials; break;
        case 'forum': entryArray = appState.forums; break;
        case 'vendor': entryArray = appState.vendors; break;
        case 'telegram': entryArray = appState.telegramChannels; break;
        case 'paste': entryArray = appState.pastes; break;
        case 'document': entryArray = appState.documents; break;
        case 'network': entryArray = appState.networks; break;
        case 'metadata': entryArray = appState.metadataEntries; break;
        case 'archive': entryArray = appState.archives; break;
        case 'messaging': entryArray = appState.messagingApps; break;
        case 'dating': entryArray = appState.datingProfiles; break;
        case 'facial': entryArray = appState.facialRecognition; break;
        case 'persona': entryArray = appState.personas; break;
        case 'vpn': entryArray = appState.vpns; break;
        case 'honeypot': entryArray = appState.honeypots; break;
        case 'exploit': entryArray = appState.exploits; break;
        case 'publicrecord': entryArray = appState.publicRecords; break;
        default:
            console.warn(`Unknown entry type for action: ${entryType}`);
            return;
    }

    if (entryArray) {
        entry = entryArray.find(t => t.id === entryId);
    }

    if (!entry) return;

    switch (action) {
        case 'edit':
            openEditEntryModal(entry);
            break;
        case 'star':
            entry.starred = !entry.starred;
            showToast(entry.starred ? 'Entry starred!' : 'Entry unstarred!');
            break;
        case 'pin':
            entry.pinned = !entry.pinned;
            showToast(entry.pinned ? 'Entry pinned!' : 'Entry unpinned!');
            break;
        case 'visit':
            if (entry.url) {
                entry.lastUsed = Date.now();
                appState.usageStats.toolsUsedToday++;
                updateDashboard();
                window.open(entry.url, '_blank');
                showToast('Opening link...');
            } else {
                showToast('No URL available for this entry type.', 'info');
            }
            break;
        case 'delete':
            if (confirm('Are you sure you want to delete this entry?')) {
                appState.customTabs.forEach(tab => {
                    tab.toolIds = tab.toolIds.filter(id => id !== entryId);
                });

                if (entryArray) {
                    const index = entryArray.findIndex(e => e.id === entryId);
                    if (index > -1) {
                        entryArray.splice(index, 1);
                    }
                }
                appState.selectedEntries.delete(entryId);
                showToast('Entry deleted!', 'error');
                updateStats();
                populateCategoryFilter();
                renderCustomTabs();
            }
            break;
    }

    renderIntelligenceEntries();
    updateStats();
    saveState();
}

/**
 * Handles the selection/deselection of individual entry checkboxes for bulk actions.
 * @param {Event} e - The change event from the checkbox.
 */
function handleBulkSelection(e) {
    if (appState.readOnlyMode) {
        e.target.checked = !e.target.checked;
        showToast("Cannot select entries in read-only shared view.", "warning");
        return;
    }

    if (!e.target.classList.contains('bulk-checkbox')) return;
    
    const entryCard = e.target.closest('.tool-card');
    const entryId = entryCard.dataset.entryId;
    
    if (e.target.checked) {
        appState.selectedEntries.add(entryId);
    } else {
        appState.selectedEntries.delete(entryId);
    }
    
    updateBulkActions();
    entryCard.classList.toggle('selected', e.target.checked);
}

/**
 * Updates the visibility and count of the bulk actions bar.
 */
function updateBulkActions() {
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.getElementById('selectedCount');
    
    if (appState.readOnlyMode) {
        if (bulkActions) bulkActions.classList.remove('active');
        return;
    }

    if (appState.selectedEntries.size > 0) {
        if (bulkActions) bulkActions.classList.add('active');
        if (selectedCount) selectedCount.textContent = appState.selectedEntries.size;
    } else {
        if (bulkActions) bulkActions.classList.remove('active');
    }
}

/**
 * Performs a bulk action (star, pin, or delete) on all selected entries.
 * @param {string} action - The action to perform ('star', 'pin', 'delete').
 */
function bulkAction(action) {
    if (appState.readOnlyMode) {
        showToast("Cannot perform bulk actions in read-only shared view.", "warning");
        return;
    }

    const selectedIds = Array.from(appState.selectedEntries);

    if (selectedIds.length === 0) {
        showToast(`No entries selected for ${action} action.`, 'warning');
        return;
    }

    if (action === 'delete' && !confirm('Are you sure you want to delete all selected entries?')) {
        return;
    }

    let allStarred = true;
    let allPinned = true;

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
    const selectedEntriesArray = allEntries.filter(entry => selectedIds.includes(entry.id));

    if (action === 'star' || action === 'pin') {
        allStarred = selectedEntriesArray.every(entry => entry.starred);
        allPinned = selectedEntriesArray.every(entry => entry.pinned);
    }

    selectedIds.forEach(id => {
        const entry = allEntries.find(e => e.id === id);
        if (!entry) return;

        switch (action) {
            case 'star':
                entry.starred = !allStarred;
                break;
            case 'pin':
                entry.pinned = !allPinned;
                break;
            case 'delete':
                appState.customTabs.forEach(tab => {
                    tab.toolIds = tab.toolIds.filter(entryIdInTab => entryIdInTab !== id);
                });

                const targetArrayKey = Object.keys(appState).find(key => Array.isArray(appState[key]) && appState[key].some(e => e.id === id));
                if (targetArrayKey) {
                    appState[targetArrayKey] = appState[targetArrayKey].filter(e => e.id !== id);
                }
                break;
        }
    });

    appState.selectedEntries.clear();
    updateBulkActions();
    renderIntelligenceEntries();
    updateStats();
    populateCategoryFilter();
    renderCustomTabs();
    showToast(`Bulk ${action} completed!`);
    saveState();
}

/**
 * Clears all active filters (search, category, sort).
 */
function clearFilters() {
    if (appState.readOnlyMode) {
        showToast("Cannot clear filters in read-only shared view.", "warning");
        return;
    }
    appState.filters.category = '';
    appState.filters.search = '';
    appState.filters.sort = 'name';
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) categoryFilter.value = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) sortFilter.value = 'name';
    renderIntelligenceEntries();
    showToast('Filters cleared!');
}

/**
 * Toggles the filter to show only pinned entries.
 */
function togglePinFilter() {
    if (appState.readOnlyMode) {
        showToast("Cannot apply filters in read-only shared view.", "warning");
        return;
    }

    if (appState.filters.category === 'pinned') {
        appState.filters.category = '';
    } else {
        appState.filters.category = 'pinned';
    }
    appState.filters.search = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) categoryFilter.value = appState.filters.category;
    renderIntelligenceEntries();
    showToast(appState.filters.category === 'pinned' ? 'Showing only pinned entries!' : 'Cleared pinned entries filter!');
}

/**
 * Toggles the filter to show only starred entries.
 */
function toggleStarFilter() {
    if (appState.readOnlyMode) {
        showToast("Cannot apply filters in read-only shared view.", "warning");
        return;
    }

    if (appState.filters.category === 'starred') {
        appState.filters.category = '';
    } else {
        appState.filters.category = 'starred';
    }
    appState.filters.search = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) categoryFilter.value = appState.filters.category;
    renderIntelligenceEntries();
    showToast(appState.filters.category === 'starred' ? 'Showing only starred entries!' : 'Cleared starred entries filter!');
}

/**
 * Toggles the view mode between 'grid' and 'list' for entry display.
 */
function toggleViewMode() {
    if (appState.readOnlyMode) {
        showToast("Cannot change view mode in read-only shared view.", "warning");
        return;
    }
    appState.viewMode = appState.viewMode === 'grid' ? 'list' : 'grid';
    localStorage.setItem('viewMode', appState.viewMode);

    const viewToggleButton = document.getElementById('viewToggle');
    const vaultViewToggleButton = document.getElementById('vaultViewToggle');
    const customVaultViewToggleButton = document.getElementById('customVaultViewToggle');

    if (appState.viewMode === 'grid') {
        if (viewToggleButton) {
            viewToggleButton.innerHTML = '<i class="fas fa-list"></i> List View';
            viewToggleButton.title = 'Switch to List View';
        }
        if (vaultViewToggleButton) {
            vaultViewToggleButton.innerHTML = '<i class="fas fa-list"></i> List View';
            vaultViewToggleButton.title = 'Switch to List View';
        }
        if (customVaultViewToggleButton) {
            customVaultViewToggleButton.innerHTML = '<i class="fas fa-list"></i> List View';
            customVaultViewToggleButton.title = 'Switch to List View';
        }
    } else {
        if (viewToggleButton) {
            viewToggleButton.innerHTML = '<i class="fas fa-th"></i> Grid View';
            viewToggleButton.title = 'Switch to Grid View';
        }
        if (vaultViewToggleButton) {
            vaultViewToggleButton.innerHTML = '<i class="fas fa-th"></i> Grid View';
            vaultViewToggleButton.title = 'Switch to Grid View';
        }
        if (customVaultViewToggleButton) {
            customVaultViewToggleButton.innerHTML = '<i class="fas fa-th"></i> Grid View';
            customVaultViewToggleButton.title = 'Switch to Grid View';
        }
    }

    renderIntelligenceEntries();
    showToast(`Switched to ${appState.viewMode} view.`);
}

/**
 * Exports all application data to a JSON file.
 */
function exportData() {
    if (appState.readOnlyMode) {
        showToast("Cannot export data in read-only shared view.", "warning");
        return;
    }
    const dataStr = JSON.stringify(appState, null, 2);
    const blob = new Blob([dataStr], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'osintvault_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
}