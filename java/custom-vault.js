// custom-vault.js

/**
 * Renders the main custom vault (Multi-Vault) tabs.
 * Manages the display of custom vault buttons and associated controls.
 */
function renderCustomTabs() {
    const customSubTabsContainer = document.getElementById('customSubTabs');
    const createSubTabBtn = document.getElementById('createSubTabBtn');
    const editSubTabBtn = document.getElementById('editSubTabBtn');
    const deleteSubTabBtn = document.getElementById('deleteSubTabBtn');
    const exportSubTabBtn = document.getElementById('exportSubTabBtn');
    const addEntryBtnCustomVault = document.getElementById('addEntryBtnCustomVault');

    if (!customSubTabsContainer) return; // Safety check

    customSubTabsContainer.innerHTML = '';

    if (appState.customTabs.length === 0) {
        const emptyCustomTabState = document.getElementById('emptyCustomTabState');
        const emptyCurrentCustomTabState = document.getElementById('emptyCurrentCustomTabState');

        if (emptyCustomTabState) emptyCustomTabState.style.display = 'block';
        if (emptyCurrentCustomTabState) emptyCurrentCustomTabState.style.display = 'none';
        customSubTabsContainer.style.display = 'none';
        
        if (editSubTabBtn) editSubTabBtn.style.display = 'none';
        if (deleteSubTabBtn) deleteSubTabBtn.style.display = 'none';
        if (exportSubTabBtn) exportSubTabBtn.style.display = 'none';
        if (addEntryBtnCustomVault) addEntryBtnCustomVault.style.display = 'none';
        
        appState.currentCustomTab = null;
        renderIntelligenceEntries();
        return;
    } else {
        const emptyCustomTabState = document.getElementById('emptyCustomTabState');
        if (emptyCustomTabState) emptyCustomTabState.style.display = 'none';
        customSubTabsContainer.style.display = 'flex';
        
        if (editSubTabBtn) editSubTabBtn.style.display = appState.readOnlyMode ? 'none' : 'inline-flex';
        if (deleteSubTabBtn) deleteSubTabBtn.style.display = appState.readOnlyMode ? 'none' : 'inline-flex';
        if (exportSubTabBtn) exportSubTabBtn.style.display = 'inline-flex';
        if (addEntryBtnCustomVault) addEntryBtnCustomVault.style.display = appState.readOnlyMode ? 'none' : 'inline-flex';
    }

    if (!appState.currentCustomTab || !appState.customTabs.find(tab => tab.id === appState.currentCustomTab)) {
        appState.currentCustomTab = appState.customTabs[0].id;
    }

    appState.customTabs.forEach(tab => {
        const tabButton = document.createElement('button');
        tabButton.classList.add('sub-nav-tab');
        if (tab.id === appState.currentCustomTab) {
            tabButton.classList.add('active');
            tabButton.style.backgroundColor = tab.color;
            tabButton.style.color = 'white';
        } else {
            tabButton.style.color = 'var(--text-secondary)';
        }
        tabButton.dataset.subTabId = tab.id;
        tabButton.innerHTML = `<i class="${tab.icon}"></i> ${tab.name}`;
        customSubTabsContainer.appendChild(tabButton);
    });

    updateShareScopeSelect(); // Assuming this function is available globally or will be imported
    renderIntelligenceEntries();
    saveState();
}

/**
 * Switches the active custom vault (Multi-Vault) tab.
 * Manages the display of entries or timeline based on the selected vault's view mode.
 * @param {string} tabId - The ID of the custom vault tab to activate.
 */
function switchCustomTab(tabId) {
    appState.currentCustomTab = tabId;

    const parentEntryTabs = document.getElementById('customVaultEntryParentTabs');
    const childEntryTabs = document.getElementById('customVaultEntryChildTabs');
    if (parentEntryTabs) parentEntryTabs.style.display = 'flex';
    if (childEntryTabs) childEntryTabs.style.display = 'flex';

    renderCustomTabs();

    if (!appState.customVaultViewMode) {
        appState.customVaultViewMode = 'entries';
    }

    const customTabToolsGrid = document.getElementById('customTabToolsGrid');
    const customTabTimelineDisplay = document.getElementById('customTabTimelineDisplay');
    if (customTabToolsGrid) customTabToolsGrid.style.display = 'none';
    if (customTabTimelineDisplay) customTabTimelineDisplay.style.display = 'none';

    const addEntryBtn = document.getElementById('addEntryBtnCustomVault');
    const customVaultViewToggle = document.getElementById('customVaultViewToggle');
    const bulkActions = document.getElementById('bulkActions');

    if (addEntryBtn) addEntryBtn.style.display = 'none';
    if (customVaultViewToggle) customVaultViewToggle.style.display = 'none';
    if (bulkActions) bulkActions.style.display = 'none';

    if (appState.customVaultViewMode === 'timeline') {
        if (customTabTimelineDisplay) customTabTimelineDisplay.style.display = 'block';
        const emptyState = document.getElementById('emptyCurrentCustomTabState');
        if (emptyState) emptyState.style.display = 'none';
        renderCustomVaultTimeline();
    } else {
        if (customTabToolsGrid) customTabToolsGrid.style.display = appState.viewMode === 'grid' ? 'grid' : 'flex';
        if (addEntryBtn && !appState.readOnlyMode) {
            addEntryBtn.style.display = 'inline-flex';
        }
        if (customVaultViewToggle) customVaultViewToggle.style.display = 'inline-flex';
        if (bulkActions) bulkActions.style.display = appState.selectedEntries.size > 0 && !appState.readOnlyMode ? 'flex' : 'none';
        renderIntelligenceEntries();
    }

    renderCustomVaultParentTabs();
    const currentCustomParent = customVaultEntryStructure.find(p => p.id === appState.currentCustomVaultParentTab);
    if (currentCustomParent) {
        const currentCustomChild = currentCustomParent.children.find(c => c.id === appState.currentCustomVaultEntrySubTab);
        if (!currentCustomChild) {
            appState.currentCustomVaultEntrySubTab = currentCustomParent.children[0]?.id;
        }
        switchCustomVaultEntrySubTab(appState.currentCustomVaultEntrySubTab);
    }

    saveState();
}

/**
 * Displays the modal for creating a new custom vault.
 */
function showCreateSubTabModal() {
    if (appState.readOnlyMode) {
        showToast("Cannot create custom vaults in read-only shared view.", "warning");
        return;
    }
    document.getElementById('createSubTabForm').reset();
    document.getElementById('newSubTabIcon').value = '';
    document.getElementById('newSubTabColor').value = '';

    populateIconPicker('newSubTabIconPicker', 'newSubTabIcon'); // Assuming populateIconPicker is available
    populateColorPicker('newSubTabColorPicker', 'newSubTabColor'); // Assuming populateColorPicker is available
    populateNewCustomVaultToolSelection();

    showModal('createSubTabModal'); // Assuming showModal is available
}

/**
 * Handles the form submission for creating a new custom vault.
 * Adds the new vault to `appState.customTabs` and updates assigned entries.
 * @param {Event} e - The submit event.
 */
function handleCreateSubTab(e) {
    e.preventDefault();
    if (appState.readOnlyMode) {
        showToast("Cannot create custom vaults in read-only shared view.", "warning");
        return;
    }

    const newSubTabName = document.getElementById('newSubTabName').value.trim();
    const newSubTabIcon = document.getElementById('newSubTabIcon').value.trim() || 'fas fa-folder';
    const newSubTabColor = document.getElementById('newSubTabColor').value.trim() || 'var(--tab-color-default)';

    if (!newSubTabName) {
        showToast('Please enter a vault name.', 'error');
        return;
    }

    const selectedToolIds = Array.from(document.querySelectorAll('#newCustomVaultToolSelection input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    const newCustomTab = {
        id: generateId(), // Assuming generateId is available
        name: newSubTabName,
        icon: newSubTabIcon,
        color: newSubTabColor,
        toolIds: selectedToolIds
    };
    appState.customTabs.push(newCustomTab);

    selectedToolIds.forEach(entryId => {
        const entry = findEntryById(entryId, getEntryTypeById(entryId)); // Assuming findEntryById and getEntryTypeById are available
        if (entry && !entry.customTabs.includes(newCustomTab.id)) {
            entry.customTabs.push(newCustomTab.id);
        }
    });

    appState.currentCustomTab = newCustomTab.id;
    hideModal('createSubTabModal');
    showToast('Custom Vault created successfully!');
    renderCustomTabs();
    saveState(); // Assuming saveState is available
}

/**
 * Displays the modal for editing an existing custom vault.
 * Populates form fields with current vault data.
 */
function openEditSubTabModal() {
    if (appState.readOnlyMode) {
        showToast("Cannot edit custom vaults in read-only shared view.", "warning");
        return;
    }

    const activeCustomTab = appState.customTabs.find(tab => tab.id === appState.currentCustomTab);
    if (!activeCustomTab) {
        showToast('No custom vault selected to edit.', 'warning');
        return;
    }

    document.getElementById('editSubTabId').value = activeCustomTab.id;
    document.getElementById('editedSubTabName').value = activeCustomTab.name;
    document.getElementById('editedSubTabIcon').value = activeCustomTab.icon;
    document.getElementById('editedSubTabColor').value = activeCustomTab.color;

    populateIconPicker('editedSubTabIconPicker', 'editedSubTabIcon', activeCustomTab.icon);
    populateColorPicker('editedSubTabColorPicker', 'editedSubTabColor', activeCustomTab.color);
    populateEditCustomVaultToolSelection(activeCustomTab.toolIds);

    showModal('editSubTabModal');
}

/**
 * Handles the form submission for editing an existing custom vault.
 * Updates vault properties and re-assigns entries.
 * @param {Event} e - The submit event.
 */
function handleEditSubTab(e) {
    e.preventDefault();
    if (appState.readOnlyMode) {
        showToast("Cannot edit custom vaults in read-only shared view.", "warning");
        return;
    }

    const editedSubTabId = document.getElementById('editSubTabId').value;
    const editedSubTabName = document.getElementById('editedSubTabName').value.trim();
    const editedSubTabIcon = document.getElementById('editedSubTabIcon').value.trim() || 'fas fa-folder';
    const editedSubTabColor = document.getElementById('editedSubTabColor').value.trim() || 'var(--tab-color-default)';

    if (!editedSubTabName) {
        showToast('Please enter a vault name.', 'error');
        return;
    }

    const tabToEdit = appState.customTabs.find(tab => tab.id === editedSubTabId);
    if (tabToEdit) {
        tabToEdit.name = editedSubTabName;
        tabToEdit.icon = editedSubTabIcon;
        tabToEdit.color = editedSubTabColor;

        const selectedEntryIds = Array.from(document.querySelectorAll('#editCustomVaultToolSelection input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);

        // Update customTabs property on all relevant entries
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
            entry.customTabs = (entry.customTabs || []).filter(tabId => tabId !== editedSubTabId);
            if (selectedEntryIds.includes(entry.id)) {
                entry.customTabs.push(editedSubTabId);
            }
        });

        tabToEdit.toolIds = selectedEntryIds;

        hideModal('editSubTabModal');
        showToast('Custom Vault updated successfully!');
        renderCustomTabs();
        saveState();
    } else {
        showToast('Error: Custom Vault not found.', 'error');
    }
}

/**
 * Handles the deletion of the currently active custom vault.
 * Removes the vault and updates entry assignments.
 */
function handleDeleteSubTab() {
    if (appState.readOnlyMode) {
        showToast("Cannot delete custom vaults in read-only shared view.", "warning");
        return;
    }

    const activeCustomTab = appState.customTabs.find(tab => tab.id === appState.currentCustomTab);
    if (!activeCustomTab) {
        showToast('No custom vault selected to delete.', 'warning');
        return;
    }

    if (confirm(`Are you sure you want to delete the custom vault "${activeCustomTab.name}"? This will NOT delete the entries themselves, only remove them from this vault.`)) {
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
            entry.customTabs = (entry.customTabs || []).filter(tabId => tabId !== activeCustomTab.id);
        });

        appState.customTabs = appState.customTabs.filter(tab => tab.id !== activeCustomTab.id);
        appState.currentCustomTab = appState.customTabs.length > 0 ? appState.customTabs[0].id : null;

        showToast('Custom Vault deleted successfully!', 'error');
        renderCustomTabs();
        saveState();
    }
}

/**
 * Exports the currently active custom vault and its associated entries to a JSON file.
 */
function exportCustomTab() {
    if (appState.readOnlyMode) {
        showToast("Cannot export custom vaults in read-only shared view.", "warning");
        return;
    }
    const activeCustomTab = appState.customTabs.find(tab => tab.id === appState.currentCustomTab);
    if (!activeCustomTab) {
        showToast('No custom vault selected to export.', 'warning');
        return;
    }

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
    const entriesInCustomTab = allEntries.filter(entry => activeCustomTab.toolIds.includes(entry.id));

    const exportData = {
        vaultName: activeCustomTab.name,
        vaultIcon: activeCustomTab.icon,
        vaultColor: activeCustomTab.color,
        entries: entriesInCustomTab
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osintvault_custom_vault_${activeCustomTab.name.replace(/\s/g, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Custom Vault "${activeCustomTab.name}" exported successfully!`, 'success');
}

/**
 * Populates the checkboxes for selecting entries to add to a new custom vault.
 * Uses `getEntryName` and `getEntryIcon` helpers for consistent display.
 */
function populateNewCustomVaultToolSelection() {
    const container = document.getElementById('newCustomVaultToolSelection');
    if (!container) return; // Safety check
    container.innerHTML = '';

    const allEntries = [
        ...(appState.tools || []), ...(appState.emails || []), ...(appState.phones || []), ...(appState.crypto || []),
        ...(appState.locations || []), ...(appState.links || []), ...(appState.media || []), ...(appState.passwords || []),
        ...(appState.keywords || []), ...(appState.socials || []), ...(appState.domains || []), ...(appState.usernames || []),
        ...(appState.threats || []), ...(appState.vulnerabilities || []), ...(appState.malware || []), ...(appState.breaches || []),
        ...(appState.credentials || []), ...(appState.forums || []), ...(appState.vendors || []), ...(appState.telegramChannels || []),
        ...(appState.pastes || []), ...(appState.documents || []), ...(appState.networks || []), ...(appState.metadataEntries || []),
        ...(appState.archives || []), ...(appState.messagingApps || []), ...(appState.datingProfiles || []), ...(appState.audioEntries || []),
        ...(appState.facialRecognition || []), ...(appState.personas || []), ...(appState.vpns || []), ...(appState.honeypots || []),
        ...(appState.exploits || []), ...(appState.publicRecords || [])
    ];

    if (allEntries.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 10px;">No entries available to add.</p>';
        return;
    }

    allEntries.sort((a, b) => {
        const nameA = getEntryName(a);
        const nameB = getEntryName(b);
        return nameA.localeCompare(nameB);
    }).forEach(entry => {
        const checkboxContainer = document.createElement('label');
        checkboxContainer.classList.add('custom-tab-checkbox');
        checkboxContainer.innerHTML = `
            <input type="checkbox" class="custom-vault-tool-checkbox" value="${entry.id}">
            <i class="${getEntryIcon(entry.type)}" style="margin-right: 5px;"></i>
            <span>${getEntryName(entry)} (${entry.type})</span>
        `;
        container.appendChild(checkboxContainer);
    });
}

/**
 * Populates the checkboxes for selecting entries to edit an existing custom vault.
 * Marks currently assigned entries as checked.
 * Uses `getEntryName` and `getEntryIcon` helpers.
 * @param {string[]} currentToolIds - IDs of entries currently assigned to the vault being edited.
 */
function populateEditCustomVaultToolSelection(currentToolIds) {
    const container = document.getElementById('editCustomVaultToolSelection');
    if (!container) return; // Safety check
    container.innerHTML = '';

    const allEntries = [
        ...(appState.tools || []), ...(appState.emails || []), ...(appState.phones || []), ...(appState.crypto || []),
        ...(appState.locations || []), ...(appState.links || []), ...(appState.media || []), ...(appState.passwords || []),
        ...(appState.keywords || []), ...(appState.socials || []), ...(appState.domains || []), ...(appState.usernames || []),
        ...(appState.threats || []), ...(appState.vulnerabilities || []), ...(appState.malware || []), ...(appState.breaches || []),
        ...(appState.credentials || []), ...(appState.forums || []), ...(appState.vendors || []), ...(appState.telegramChannels || []),
        ...(appState.pastes || []), ...(appState.documents || []), ...(appState.networks || []), ...(appState.metadataEntries || []),
        ...(appState.archives || []), ...(appState.messagingApps || []), ...(appState.datingProfiles || []), ...(appState.audioEntries || []),
        ...(appState.facialRecognition || []), ...(appState.personas || []), ...(appState.vpns || []), ...(appState.honeypots || []),
        ...(appState.exploits || []), ...(appState.publicRecords || [])
    ];

    if (allEntries.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 10px;">No entries available to add.</p>';
        return;
    }

    allEntries.sort((a, b) => {
        const nameA = getEntryName(a);
        const nameB = getEntryName(b);
        return nameA.localeCompare(nameB);
    }).forEach(entry => {
        const isChecked = currentToolIds.includes(entry.id);
        const checkboxContainer = document.createElement('label');
        checkboxContainer.classList.add('custom-tab-checkbox');
        if (isChecked) {
            checkboxContainer.classList.add('checked');
        }
        checkboxContainer.innerHTML = `
            <input type="checkbox" class="custom-vault-tool-checkbox" value="${entry.id}" ${isChecked ? 'checked' : ''}>
            <i class="${getEntryIcon(entry.type)}" style="margin-right: 5px;"></i>
            <span>${getEntryName(entry)} (${entry.type})</span>
        `;
        container.appendChild(checkboxContainer);
    });
}

/**
 * Renders the timeline view for the currently active custom vault.
 * Aggregates all entries within the vault and displays them as chronological events.
 */
function renderCustomVaultTimeline() {
    const timelineContainer = document.getElementById('customTabTimelineDisplay');
    const emptyState = document.getElementById('emptyCustomVaultTimelineState');

    if (!timelineContainer || !emptyState) {
        console.error("renderCustomVaultTimeline: Required DOM elements (customTabTimelineDisplay or emptyCustomVaultTimelineState) not found.");
        return;
    }

    timelineContainer.innerHTML = '';
    timelineContainer.style.display = 'block';

    const activeCustomTab = appState.customTabs.find(tab => tab.id === appState.currentCustomTab);

    if (!activeCustomTab || activeCustomTab.toolIds.length === 0) {
        emptyState.style.display = 'block';
        timelineContainer.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';

    const allEntriesCombined = [
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

    const vaultEntries = allEntriesCombined.filter(entry =>
        (entry.customTabs || []).includes(activeCustomTab.id)
    );

    const customVaultTimelineEvents = vaultEntries.map(entry => {
        let title = getEntryName(entry);
        let category = entry.type;
        let notes = entry.description || entry.notes || 'No description available.';
        let confidence = 'info';
        let evidence = entry.url || entry.source || '';
        let actor = 'System/Investigator';

        let timestamp = entry.addedDate;
        if (entry.lastUsed && entry.lastUsed !== 0 && new Date(entry.lastUsed).getTime() > new Date(entry.addedDate || 0).getTime()) {
            timestamp = new Date(entry.lastUsed);
        }
        if (entry.date) {
            timestamp = new Date(entry.date);
        }
        if (entry.timestamp) {
            timestamp = new Date(entry.timestamp);
        }

        let detailedNotes = notes;
        if (entry.platform) detailedNotes += ` (Platform: ${entry.platform})`;
        if (entry.username) detailedNotes += ` (Username: ${entry.username})`;
        if (entry.filename) detailedNotes += ` (File: ${entry.filename})`;

        return {
            id: entry.id,
            timestamp: timestamp || new Date(),
            title: title,
            category: category,
            notes: detailedNotes,
            confidence: confidence,
            evidence: evidence,
            actor: actor
        };
    }).sort((a, b) => a.timestamp - b.timestamp);

    const fragment = document.createDocumentFragment();

    if (customVaultTimelineEvents.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        timelineContainer.innerHTML = '';
        return;
    }

    customVaultTimelineEvents.forEach(event => {
        const defaultCategoryMap = {
            'tool': 'other',
            'email': 'phishing',
            'phone': 'other',
            'crypto': 'other',
            'location': 'discovery',
            'link': 'collection',
            'media': 'collection',
            'password': 'credential_access',
            'keyword': 'reconnaissance',
            'social': 'reconnaissance',
            'domain': 'reconnaissance',
            'username': 'reconnaissance',
            'threat': 'malware_delivery',
            'vulnerability': 'malware_delivery',
            'malware': 'malware_delivery',
            'breach': 'impact',
            'credential': 'credential_access',
            'forum': 'other',
            'vendor': 'other',
            'telegram': 'other',
            'paste': 'collection',
            'document': 'collection',
            'network': 'discovery',
            'metadata': 'collection',
            'archive': 'collection',
            'messaging': 'collection',
            'dating': 'collection',
            'audio': 'collection',
            'facial': 'collection',
            'persona': 'reconnaissance',
            'vpn': 'other',
            'honeypot': 'other',
            'exploit': 'malware_delivery',
            'publicrecord': 'collection'
        };

        const timelineCategory = defaultCategoryMap[event.category] || 'other';
        const categoryInfo = timelineCategories[timelineCategory] || { name: timelineCategory, icon: "fas fa-question-circle", color: "var(--primary)" };

        if (!(event.timestamp instanceof Date) || isNaN(event.timestamp.getTime())) {
            console.error("Invalid timestamp found for event in custom vault timeline, skipping rendering:", event);
            return;
        }

        const eventDate = event.timestamp.toLocaleDateString();
        const eventTime = event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const eventCardDiv = document.createElement('div');
        eventCardDiv.classList.add('timeline-event-card');
        eventCardDiv.dataset.category = timelineCategory;
        eventCardDiv.dataset.confidence = event.confidence;
        eventCardDiv.dataset.eventId = event.id;
        eventCardDiv.style.borderLeft = `5px solid ${categoryInfo.color || 'var(--primary)'}`;

        eventCardDiv.innerHTML = `
            <div class="timeline-event-header">
                <div class="timeline-event-title">
                    <i class="${categoryInfo.icon}" style="color: ${categoryInfo.color || 'var(--primary)'};"></i> ${event.title}
                </div>
                <span class="timeline-event-timestamp">${eventDate} ${eventTime}</span>
                <div class="timeline-event-actions">
                    <button class="action-btn" onclick="openEditEntryModal(findEntryById('${event.id}', '${event.category}'))" title="Edit Entry">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" onclick="handleEntryAction({ target: { closest: () => ({ dataset: { entryId: '${event.id}', entryType: '${event.category}' } }) }, preventDefault: () => {} }, 'delete')" title="Delete Entry">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p class="timeline-event-notes">${event.notes || 'No notes.'}</p>
            <div class="timeline-event-meta">
                <span><i class="fas fa-certificate"></i> Confidence: <strong style="color: var(--${event.confidence});">${event.confidence.charAt(0).toUpperCase() + event.confidence.slice(1)}</strong></span>
                <span><i class="fas fa-tag"></i> Original Type: ${event.category}</span>
                ${event.actor ? `<span><i class="fas fa-user-circle"></i> Actor: ${event.actor}</span>` : ''}
                ${event.evidence ? `<span><i class="fas fa-paperclip"></i> Evidence: <a href="${event.evidence}" target="_blank" style="color: var(--primary); text-decoration: none;">${event.evidence.length > 30 ? event.evidence.substring(0, 27) + '...' : event.evidence}</a></span>` : ''}
            </div>
        `;
        fragment.appendChild(eventCardDiv);
    });

    timelineContainer.innerHTML = '';
    timelineContainer.appendChild(fragment);

    void timelineContainer.offsetHeight;

    // Define findEntryById globally if it's not already
    // This allows the `onclick` attributes in the dynamically generated HTML to work.
    if (typeof window.findEntryById === 'undefined') {
        window.findEntryById = function(id, type) {
            let entryArray;
            switch (type) {
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
                case 'audio': entryArray = appState.audioEntries; break;
                case 'facial': entryArray = appState.facialRecognition; break;
                case 'persona': entryArray = appState.personas; break;
                case 'vpn': entryArray = appState.vpns; break;
                case 'honeypot': entryArray = appState.honeypots; break;
                case 'exploit': entryArray = appState.exploits; break;
                case 'publicrecord': entryArray = appState.publicRecords; break;
                default: return null;
            }
            return entryArray ? entryArray.find(entry => entry.id === id) : null;
        };
    }
    // Also define getEntryTypeById if it's needed here and not in core.js
    if (typeof window.getEntryTypeById === 'undefined') {
        window.getEntryTypeById = function(id) {
            const allEntryArrays = [
                appState.tools, appState.emails, appState.phones, appState.crypto,
                appState.locations, appState.links, appState.media, appState.passwords,
                appState.keywords, appState.socials, appState.domains, appState.usernames,
                appState.threats, appState.vulnerabilities, appState.malware, appState.breaches,
                appState.credentials, appState.forums, appState.vendors, appState.telegramChannels,
                appState.pastes, appState.documents, appState.networks, appState.metadataEntries,
                appState.archives, appState.messagingApps, appState.datingProfiles, appState.audioEntries,
                appState.facialRecognition, appState.personas, appState.vpns, appState.honeypots,
                appState.exploits, appState.publicRecords
            ];
            for (const arr of allEntryArrays) {
                const entry = arr.find(e => e.id === id);
                if (entry) return entry.type;
            }
            return null;
        };
    }
}


/**
 * Renders the parent tab buttons for entries within a custom vault.
 */
function renderCustomVaultParentTabs() {
    const parentTabsContainer = document.getElementById('customVaultEntryParentTabs');
    if (!parentTabsContainer) return;

    parentTabsContainer.innerHTML = customVaultEntryStructure.map(parentTab => `
        <button class="nav-tab custom-vault-entry-parent-tab" data-parent-tab="${parentTab.id}">
            <i class="${parentTab.icon}"></i>
            ${parentTab.name}
        </button>
    `).join('');

    const activeParentBtn = document.querySelector(`.custom-vault-entry-parent-tab[data-parent-tab="${appState.currentCustomVaultParentTab}"]`);
    if (activeParentBtn) {
        activeParentBtn.classList.add('active');
    }
}

/**
 * Switches the active parent tab within a custom vault's entry display.
 * Updates child tabs and re-renders entries.
 * @param {string} parentId - The ID of the parent tab to activate.
 */
function switchCustomVaultParentTab(parentId) {
    if (appState.readOnlyMode) {
        showToast("Cannot switch categories in read-only shared view.", "warning");
        return;
    }

    document.querySelectorAll('.custom-vault-entry-parent-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    const activeParentBtn = document.querySelector(`.custom-vault-entry-parent-tab[data-parent-tab="${parentId}"]`);
    if (activeParentBtn) {
        activeParentBtn.classList.add('active');
    }

    appState.currentCustomVaultParentTab = parentId;

    const selectedParent = customVaultEntryStructure.find(p => p.id === parentId);
    const childTabsContainer = document.getElementById('customVaultEntryChildTabs');

    if (selectedParent && childTabsContainer) {
        childTabsContainer.style.display = 'flex';
        childTabsContainer.innerHTML = selectedParent.children.map(childTab => `
            <button class="sub-nav-tab custom-vault-entry-child-tab" data-child-tab="${childTab.id}">
                <i class="${childTab.icon}"></i> ${childTab.name}
            </button>
        `).join('');

        let childToActivate = appState.currentCustomVaultEntrySubTab;
        if (!selectedParent.children.some(c => c.id === childToActivate)) {
            childToActivate = selectedParent.children[0]?.id;
        }
        if (childToActivate) {
            switchCustomVaultEntrySubTab(childToActivate);
        } else {
            appState.currentCustomVaultEntrySubTab = null;
            appState.filters.category = '';
            renderIntelligenceEntries();
        }

    } else {
        if (childTabsContainer) childTabsContainer.style.display = 'none';
        appState.currentCustomVaultEntrySubTab = null;
        appState.filters.category = '';
        renderIntelligenceEntries();
    }

    saveState();
}

/**
 * Switches the active child sub-tab for entries within a custom vault.
 * Updates filtered entries based on the selected entry type.
 * @param {string} childTabName - The ID of the child tab (e.g., 'tool', 'email', 'phone').
 */
function switchCustomVaultEntrySubTab(childTabName) {
    if (appState.readOnlyMode) {
        showToast("Cannot switch categories in read-only shared view.", "warning");
        return;
    }
    appState.customVaultViewMode = 'entries';
    saveState();
    document.querySelectorAll('.custom-vault-entry-child-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const targetChildTabBtn = document.querySelector(`.custom-vault-entry-child-tab[data-child-tab="${childTabName}"]`);
    if (targetChildTabBtn) {
        targetChildTabBtn.classList.add('active');
    }
    appState.currentCustomVaultEntrySubTab = childTabName;
    appState.filters.category = '';
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) categoryFilter.value = '';
    const customTabTimelineDisplay = document.getElementById('customTabTimelineDisplay');
    const customTabToolsGrid = document.getElementById('customTabToolsGrid');
    if (customTabTimelineDisplay) customTabTimelineDisplay.style.display = 'none';
    if (customTabToolsGrid) customTabToolsGrid.style.display = appState.viewMode === 'grid' ? 'grid' : 'flex';
    
    const addEntryBtn = document.getElementById('addEntryBtnCustomVault');
    const customVaultViewToggle = document.getElementById('customVaultViewToggle');
    const bulkActions = document.getElementById('bulkActions');

    if (addEntryBtn && !appState.readOnlyMode) {
        addEntryBtn.style.display = 'inline-flex';
    }
    if (customVaultViewToggle) customVaultViewToggle.style.display = 'inline-flex';
    if (bulkActions) bulkActions.style.display = appState.selectedEntries.size > 0 && !appState.readOnlyMode ? 'flex' : 'none';
    
    renderIntelligenceEntries();
    saveState();
}