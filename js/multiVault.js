const customVaultEntryStructure = [{
    id: 'coreInvestigation',
    name: 'General',
    icon: 'fas fa-globe-americas',
    children: [
        { id: 'tool', name: 'General Tools', icon: 'fas fa-tools' }, 
        { id: 'keyword', name: 'Keyword & Text Analysis', icon: 'fas fa-font' }, 
        { id: 'ai', name: 'AI & Generative', icon: 'fas fa-brain' }, 
        { id: 'osintSearch', name: 'OSINT-Specific Search', icon: 'fas fa-search-dollar' }, 
        { id: 'archive', name: 'Archiving & Cache', icon: 'fas fa-archive' },
    ]
}, {
    id: 'identityCommunication',
    name: 'Identity/Social',
    icon: 'fas fa-users',
    children: [
        { id: 'username', name: 'Usernames & Handles', icon: 'fas fa-at' },
        { id: 'social', name: 'Social Media Profiles', icon: 'fas fa-users' },
        { id: 'email', name: 'Email Investigations', icon: 'fas fa-envelope' },
        { id: 'phone', name: 'Phone Number Analysis', icon: 'fas fa-phone' },
        { id: 'messaging', name: 'Messaging Apps & Comms', icon: 'fas fa-comment-dots' },
        { id: 'dating', name: 'Dating Apps', icon: 'fas fa-heart' },
        { id: 'persona', name: 'Persona Management', icon: 'fas fa-id-badge' },
        { id: 'facial', name: 'Facial Recognition', icon: 'fas fa-face-id-card' },
    ]
}, {
    id: 'digitalTrace',
    name: 'Footprints',
    icon: 'fas fa-fingerprint',
    children: [
        { id: 'domain', name: 'Domain/IP/URL Analysis', icon: 'fas fa-link' },
        { id: 'location', name: 'GEOINT & Mapping', icon: 'fas fa-map-marker-alt' },
        { id: 'crypto', name: 'Crypto Wallets & Transactions', icon: 'fas fa-coins' },
        { id: 'darkWeb', name: 'DarkWeb & Hidden Services', icon: 'fas fa-mask' },
        { id: 'metadata', name: 'Metadata Extractors', icon: 'fas fa-info' },
        { id: 'network', name: 'Network & System Analysis', icon: 'fas fa-network-wired' },
        { id: 'document', name: 'Document Analysis', icon: 'fas fa-file-alt' },
        { id: 'link', name: 'General Links', icon: 'fas fa-external-link-alt' },
    ]
}, {
    id: 'cyberIntel',
    name: 'Threat Intel',
    icon: 'fas fa-shield-alt',
    children: [
        { id: 'threat', name: 'Threat Intel Platforms', icon: 'fas fa-hand-fist' },
        { id: 'vulnerability', name: 'Vulnerability Research', icon: 'fas fa-bug' },
        { id: 'malware', name: 'File & Malware Analysis', icon: 'fas fa-file-code' },
        { id: 'honeypot', name: 'Honeypot Monitoring', icon: 'fas fa-honey-pot' },
        { id: 'exploit', name: 'Exploit/Market', icon: 'fas fa-bomb' },
    ]
}, {
    id: 'breachAndLeak',
    name: 'Breach/Leaks',
    icon: 'fas fa-database',
    children: [
        { id: 'password', name: 'Password Leaks', icon: 'fas fa-key' },
        { id: 'credential', name: 'Credential Dumps', icon: 'fas fa-cloud-download-alt' },
        { id: 'breach', name: 'Breached Databases', icon: 'fas fa-shield-virus' },
        { id: 'publicrecord', name: 'Public Records & Legal', icon: 'fas fa-scale-balanced' },
    ]
}, {
    id: 'undergroundSource',
    name: 'Forums/Markets',
    icon: 'fas fa-user-ninja',
    children: [
        { id: 'forum', name: 'Hacking & Security Forums', icon: 'fas fa-comments' },
        { id: 'vendor', name: 'Underground Vendor Tracking', icon: 'fas fa-user-tag' },
        { id: 'telegram', name: 'Telegram Channels', icon: 'fab fa-telegram-plane' },
        { id: 'paste', name: 'Paste Sites', icon: 'fas fa-clipboard-list' },
    ]
}, {
    id: 'mediaAnalysis',
    name: 'Media',
    icon: 'fas fa-image',
    children: [
        { id: 'media', name: 'Image & Video Analysis', icon: 'fas fa-camera' },
        { id: 'audio', name: 'Audio Analysis', icon: 'fas fa-volume-up' },
    ]
}, {
    id: 'opsecurity',
    name: 'OpSec',
    icon: 'fas fa-lock',
    children: [
        { id: 'vpn', name: 'Anonymity & VPNs', icon: 'fas fa-mask' },
        { id: 'secureComm', name: 'Secure Communication', icon: 'fas fa-lock-open' },
        { id: 'persona', name: 'Persona Management', icon: 'fas fa-id-badge' },
    ]
}];


function renderCustomTabs() {
    const customSubTabsContainer = document.getElementById('customSubTabs');
    const createSubTabBtn = document.getElementById('createSubTabBtn');
    const editSubTabBtn = document.getElementById('editSubTabBtn');
    const deleteSubTabBtn = document.getElementById('deleteSubTabBtn');
    const exportSubTabBtn = document.getElementById('exportSubTabBtn');
    const addEntryBtnCustomVault = document.getElementById('addEntryBtnCustomVault'); 

    customSubTabsContainer.innerHTML = ''; 

    if (appState.customTabs.length === 0) {
        document.getElementById('emptyCustomTabState').style.display = 'block';
        document.getElementById('emptyCurrentCustomTabState').style.display = 'none';
        customSubTabsContainer.style.display = 'none';
        editSubTabBtn.style.display = 'none';
        deleteSubTabBtn.style.display = 'none';
        exportSubTabBtn.style.display = 'none';
        addEntryBtnCustomVault.style.display = 'none';
        appState.currentCustomTab = null;
        renderIntelligenceEntries(); 
        return;
    } else {
        document.getElementById('emptyCustomTabState').style.display = 'none';
        customSubTabsContainer.style.display = 'flex';
        editSubTabBtn.style.display = appState.readOnlyMode ? 'none' : 'inline-flex'; 
        deleteSubTabBtn.style.display = appState.readOnlyMode ? 'none' : 'inline-flex'; 
        exportSubTabBtn.style.display = 'inline-flex';
        addEntryBtnCustomVault.style.display = appState.readOnlyMode ? 'none' : 'inline-flex';
    }

    // Ensure a custom tab is selected if there are any
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

    updateShareScopeSelect();

    renderIntelligenceEntries(); 
    saveState();
}

function switchCustomTab(tabId) {
    appState.currentCustomTab = tabId;

    document.getElementById('customVaultEntryParentTabs').style.display = 'flex';
    document.getElementById('customVaultEntryChildTabs').style.display = 'flex';


    renderCustomTabs();


    document.getElementById('customTabToolsGrid').style.display = 'none';


    document.getElementById('addEntryBtnCustomVault').style.display = 'none';
    document.getElementById('customVaultViewToggle').style.display = 'none';
    document.getElementById('bulkActions').style.display = 'none';


    document.getElementById('customTabToolsGrid').style.display = appState.viewMode === 'grid' ? 'grid' : 'flex';

    if (!appState.readOnlyMode) { 
        document.getElementById('addEntryBtnCustomVault').style.display = 'inline-flex';
    }
    document.getElementById('customVaultViewToggle').style.display = 'inline-flex';
    document.getElementById('bulkActions').style.display = appState.selectedEntries.size > 0 && !appState.readOnlyMode ? 'flex' : 'none';
    renderIntelligenceEntries(); 

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
function showCreateSubTabModal() {
    if (appState.readOnlyMode) { // New: Prevent actions in read-only mode
        showToast("Cannot create custom vaults in read-only shared view.", "warning");
        return;
    }
    document.getElementById('createSubTabForm').reset();
    document.getElementById('newSubTabIcon').value = '';
    document.getElementById('newSubTabColor').value = '';

    populateIconPicker('newSubTabIconPicker', 'newSubTabIcon');
    populateColorPicker('newSubTabColorPicker', 'newSubTabColor');
    populateNewCustomVaultToolSelection(); // Populate tools for initial assignment

    showModal('createSubTabModal');
}

function handleCreateSubTab(e) {
    e.preventDefault();
    if (appState.readOnlyMode) { // New: Prevent actions in read-only mode
        showToast("Cannot create custom vaults in read-only shared view.", "warning");
        return;
    }

    const newSubTabName = document.getElementById('newSubTabName').value.trim();
    const newSubTabIcon = document.getElementById('newSubTabIcon').value.trim() || 'fas fa-folder'; // Default icon
    const newSubTabColor = document.getElementById('newSubTabColor').value.trim() || 'var(--tab-color-default)'; // Default color

    if (!newSubTabName) {
        showToast('Please enter a vault name.', 'error');
        return;
    }

    const selectedToolIds = Array.from(document.querySelectorAll('#newCustomVaultToolSelection input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    const newCustomTab = {
        id: generateId(),
        name: newSubTabName,
        icon: newSubTabIcon,
        color: newSubTabColor,
        toolIds: selectedToolIds // Assign selected tools
    };
    appState.customTabs.push(newCustomTab);

    // Update the customTabs property of the entries themselves
    selectedToolIds.forEach(entryId => {
        const entry = findEntryById(entryId); // Assuming you have a helper to find entry by ID
        if (entry && !entry.customTabs.includes(newCustomTab.id)) {
            entry.customTabs.push(newCustomTab.id);
        }
    });

    appState.currentCustomTab = newCustomTab.id; // Switch to the newly created tab
    hideModal('createSubTabModal');
    showToast('Custom Vault created successfully!');
    logActivity('created', 'customVault', `Created new custom vault: ${newCustomTab.name}`, { vaultId: newCustomTab.id, icon: newCustomTab.icon, color: newCustomTab.color });
    renderCustomTabs();
    saveState();
}

function openEditSubTabModal() {
    if (appState.readOnlyMode) { // New: Prevent actions in read-only mode
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

function handleEditSubTab(e) {
    e.preventDefault();
    if (appState.readOnlyMode) { // New: Prevent actions in read-only mode
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

        // Update customTabs property on all entries
        // Aggregate all entries from ALL appState arrays
        const allEntries = [
            ...appState.tools, ...appState.emails, ...appState.phones, ...appState.crypto,
            ...appState.locations, ...appState.links, ...appState.media, ...appState.passwords,
            ...appState.keywords, ...appState.socials, ...appState.domains, ...appState.usernames,
            ...appState.threats, ...appState.vulnerabilities, ...appState.malware, ...appState.breaches,
            ...appState.credentials, ...appState.forums, ...appState.vendors, ...appState.telegramChannels,
            ...appState.pastes, ...appState.documents, ...appState.networks, ...appState.metadataEntries,
            ...appState.archives, ...appState.messagingApps, ...appState.datingProfiles, ...appState.audioEntries,
            ...appState.facialRecognition, ...appState.personas, ...appState.vpns, ...appState.honeypots,
            ...appState.exploits, ...appState.publicRecords
        ];

        allEntries.forEach(entry => {
            // Remove this tab's ID if it was previously assigned
            entry.customTabs = (entry.customTabs || []).filter(tabId => tabId !== editedSubTabId);
            // Add it back if it's currently selected for this entry
            if (selectedEntryIds.includes(entry.id)) {
                entry.customTabs.push(editedSubTabId);
            }
        });

        tabToEdit.toolIds = selectedEntryIds; // Update the tab's toolIds array

        hideModal('editSubTabModal');
        showToast('Custom Vault updated successfully!');
        logActivity('updated', 'customVault', `Updated custom vault: ${tabToEdit.name}`, { vaultId: tabToEdit.id, newName: tabToEdit.name, newIcon: tabToEdit.icon, newColor: tabToEdit.color });
        renderCustomTabs();
        saveState();
    } else {
        showToast('Error: Custom Vault not found.', 'error');
        logActivity('failed', 'customVault', `Attempted to update non-existent custom vault with ID: ${editedSubTabId}`);
    }
}

function handleDeleteSubTab() {
    if (appState.readOnlyMode) { // New: Prevent actions in read-only mode
        showToast("Cannot delete custom vaults in read-only shared view.", "warning");
        return;
    }

    const activeCustomTab = appState.customTabs.find(tab => tab.id === appState.currentCustomTab);
    if (!activeCustomTab) {
        showToast('No custom vault selected to delete.', 'warning');
        return;
    }

    if (confirm(`Are you sure you want to delete the custom vault "${activeCustomTab.name}"? This will NOT delete the entries within it, only remove them from this vault.`)) {
        // Remove this tab's ID from all entries that had it assigned
        // Aggregate all entries from ALL appState arrays
        const allEntries = [
            ...appState.tools, ...appState.emails, ...appState.phones, ...appState.crypto,
            ...appState.locations, ...appState.links, ...appState.media, ...appState.passwords,
            ...appState.keywords, ...appState.socials, ...appState.domains, ...appState.usernames,
            ...appState.threats, ...appState.vulnerabilities, ...appState.malware, ...appState.breaches,
            ...appState.credentials, ...appState.forums, ...appState.vendors, ...appState.telegramChannels,
            ...appState.pastes, ...appState.documents, ...appState.networks, ...appState.metadataEntries,
            ...appState.archives, ...appState.messagingApps, ...appState.datingProfiles, ...appState.audioEntries,
            ...appState.facialRecognition, ...appState.personas, ...appState.vpns, ...appState.honeypots,
            ...appState.exploits, ...appState.publicRecords
        ];

        allEntries.forEach(entry => {
            entry.customTabs = (entry.customTabs || []).filter(tabId => tabId !== activeCustomTab.id);
        });

        appState.customTabs = appState.customTabs.filter(tab => tab.id !== activeCustomTab.id);
        appState.currentCustomTab = appState.customTabs.length > 0 ? appState.customTabs[0].id : null; // Select first tab or null

        showToast('Custom Vault deleted successfully!', 'error');
        logActivity('deleted', 'customVault', `Deleted custom vault: ${activeCustomTab.name}`, { vaultId: activeCustomTab.id });
        renderCustomTabs();
        saveState();
    }
}

function exportCustomTab() {
    if (appState.readOnlyMode) { // New: Prevent actions in read-only mode
        showToast("Cannot export custom vaults in read-only shared view.", "warning");
        return;
    }
    const activeCustomTab = appState.customTabs.find(tab => tab.id === appState.currentCustomTab);
    if (!activeCustomTab) {
        showToast('No custom vault selected to export.', 'warning');
        return;
    }

    // Aggregate all entries from ALL appState arrays
    const allEntries = [
        ...appState.tools, ...appState.emails, ...appState.phones, ...appState.crypto,
        ...appState.locations, ...appState.links, ...appState.media, ...appState.passwords,
        ...appState.keywords, ...appState.socials, ...appState.domains, ...appState.usernames,
        ...appState.threats, ...appState.vulnerabilities, ...appState.malware, ...appState.breaches,
        ...appState.credentials, ...appState.forums, ...appState.vendors, ...appState.telegramChannels,
        ...appState.pastes, ...appState.documents, ...appState.networks, ...appState.metadataEntries,
        ...appState.archives, ...appState.messagingApps, ...appState.datingProfiles, ...appState.audioEntries,
        ...appState.facialRecognition, ...appState.personas, ...appState.vpns, ...appState.honeypots,
        ...appState.exploits, ...appState.publicRecords
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

// Populate entry selection checkboxes for new custom vault
function populateNewCustomVaultToolSelection() {
    const container = document.getElementById('newCustomVaultToolSelection');
    container.innerHTML = ''; // Clear previous selections

    // Aggregate all entries from ALL appState arrays
    const allEntries = [
        ...appState.tools, ...appState.emails, ...appState.phones, ...appState.crypto,
        ...appState.locations, ...appState.links, ...appState.media, ...appState.passwords,
        ...appState.keywords, ...appState.socials, ...appState.domains, ...appState.usernames,
        ...appState.threats, ...appState.vulnerabilities, ...appState.malware, ...appState.breaches,
        ...appState.credentials, ...appState.forums, ...appState.vendors, ...appState.telegramChannels,
        ...appState.pastes, ...appState.documents, ...appState.networks, ...appState.metadataEntries,
        ...appState.archives, ...appState.messagingApps, ...appState.datingProfiles, ...appState.audioEntries,
        ...appState.facialRecognition, ...appState.personas, ...appState.vpns, ...appState.honeypots,
        ...appState.exploits, ...appState.publicRecords
    ];

    if (allEntries.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 10px;">No entries available to add.</p>';
        return;
    }

    allEntries.sort((a, b) => {
        // Use the getEntryName helper for consistent sorting
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

// Populate entry selection checkboxes for editing custom vault
function populateEditCustomVaultToolSelection(currentToolIds) {
    const container = document.getElementById('editCustomVaultToolSelection');
    container.innerHTML = ''; // Clear previous selections

    // Aggregate all entries from ALL appState arrays
    const allEntries = [
        ...appState.tools, ...appState.emails, ...appState.phones, ...appState.crypto,
        ...appState.locations, ...appState.links, ...appState.media, ...appState.passwords,
        ...appState.keywords, ...appState.socials, ...appState.domains, ...appState.usernames,
        ...appState.threats, ...appState.vulnerabilities, ...appState.malware, ...appState.breaches,
        ...appState.credentials, ...appState.forums, ...appState.vendors, ...appState.telegramChannels,
        ...appState.pastes, ...appState.documents, ...appState.networks, ...appState.metadataEntries,
        ...appState.archives, ...appState.messagingApps, ...appState.datingProfiles, ...appState.audioEntries,
        ...appState.facialRecognition, ...appState.personas, ...appState.vpns, ...appState.honeypots,
        ...appState.exploits, ...appState.publicRecords
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

// Function to render Custom Vault Parent Tabs (e.g., General, Identity/Social)
function renderCustomVaultParentTabs() {
    const parentTabsContainer = document.getElementById('customVaultEntryParentTabs');
    if (!parentTabsContainer) return;

    parentTabsContainer.innerHTML = customVaultEntryStructure.map(parentTab => `
        <button class="nav-tab custom-vault-entry-parent-tab" data-parent-tab="${parentTab.id}">
            <i class="${parentTab.icon}"></i>
            ${parentTab.name}
        </button>
    `).join('');

    // Activate the currently selected parent tab
    const activeParentBtn = document.querySelector(`.custom-vault-entry-parent-tab[data-parent-tab="${appState.currentCustomVaultParentTab}"]`);
    if (activeParentBtn) {
        activeParentBtn.classList.add('active');
    }
}

// Function to switch Custom Vault Parent Tab (e.g., clicking 'General' or 'Identity/Social')
function switchCustomVaultParentTab(parentId) {
    if (appState.readOnlyMode) {
        showToast("Cannot switch categories in read-only shared view.", "warning");
        return;
    }

    // Deactivate all parent tabs
    document.querySelectorAll('.custom-vault-entry-parent-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Activate the clicked parent tab
    const activeParentBtn = document.querySelector(`.custom-vault-entry-parent-tab[data-parent-tab="${parentId}"]`);
    if (activeParentBtn) {
        activeParentBtn.classList.add('active');
    }

    appState.currentCustomVaultParentTab = parentId;

    // Find the selected parent tab's children
    const selectedParent = customVaultEntryStructure.find(p => p.id === parentId);
    const childTabsContainer = document.getElementById('customVaultEntryChildTabs');

    if (selectedParent && childTabsContainer) {
        childTabsContainer.style.display = 'flex'; // Show the child tabs container
        childTabsContainer.innerHTML = selectedParent.children.map(childTab => `
            <button class="sub-nav-tab custom-vault-entry-child-tab" data-child-tab="${childTab.id}">
                <i class="${childTab.icon}"></i> ${childTab.name}
            </button>
        `).join('');

        // Automatically activate the first child tab or the previously selected child tab under this parent
        let childToActivate = appState.currentCustomVaultEntrySubTab;
        if (!selectedParent.children.some(c => c.id === childToActivate)) {
            childToActivate = selectedParent.children[0]?.id; // Default to first child if current is not in this parent
        }
        if (childToActivate) {
            switchCustomVaultEntrySubTab(childToActivate);
        } else {
            // No child tabs for this parent, clear display
            appState.currentCustomVaultEntrySubTab = null;
            appState.filters.category = '';
            renderIntelligenceEntries();
        }

    } else {
        childTabsContainer.style.display = 'none'; // Hide if no children or container not found
        appState.currentCustomVaultEntrySubTab = null;
        appState.filters.category = '';
        renderIntelligenceEntries();
    }

    saveState(); // Save the parent tab state
}

// Function to switch Custom Vault Entry Child Sub-tabs (e.g., clicking 'General Tools', 'Email Investigations')
function switchCustomVaultEntrySubTab(childTabName) {
    if (appState.readOnlyMode) {
        showToast("Cannot switch categories in read-only shared view.", "warning");
        return;
    }
    appState.customVaultViewMode = 'entries'; // Always switch to entries view when clicking a sub-tab
    saveState(); // Persist this preference
    document.querySelectorAll('.custom-vault-entry-child-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const targetChildTabBtn = document.querySelector(`.custom-vault-entry-child-tab[data-child-tab="${childTabName}"]`);
    if (targetChildTabBtn) {
        targetChildTabBtn.classList.add('active');
    }
    appState.currentCustomVaultEntrySubTab = childTabName;
    appState.filters.category = ''; // Clear category filter when switching sub-tabs
    document.getElementById('categoryFilter').value = '';
    

    document.getElementById('customTabToolsGrid').style.display = appState.viewMode === 'grid' ? 'grid' : 'flex';

    // Show/Hide relevant action buttons
    if (!appState.readOnlyMode) {
        document.getElementById('addEntryBtnCustomVault').style.display = 'inline-flex';
    }
    document.getElementById('customVaultViewToggle').style.display = 'inline-flex';
    document.getElementById('bulkActions').style.display = appState.selectedEntries.size > 0 && !appState.readOnlyMode ? 'flex' : 'none';

    renderIntelligenceEntries(); // Re-render entries based on the new child tab filter
    saveState();
}



function populateCustomTabAssignmentCheckboxes(assignedTabIds) {
    const container = document.getElementById('assignCustomTabsCheckboxes');
    container.innerHTML = ''; // Clear previous checkboxes

    if (appState.customTabs.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 10px;">No custom vaults created yet.</p>';
        document.getElementById('assignCustomTabs').style.display = 'none'; // Hide section if no custom tabs
        return;
    } else {
        document.getElementById('assignCustomTabs').style.display = 'block';
    }

    appState.customTabs.forEach(tab => {
        const isChecked = assignedTabIds.includes(tab.id);
        const checkboxContainer = document.createElement('label');
        checkboxContainer.classList.add('custom-tab-checkbox');
        if (isChecked) {
            checkboxContainer.classList.add('checked');
        }
        checkboxContainer.innerHTML = `
            <input type="checkbox" class="custom-tab-assign-checkbox" value="${tab.id}" ${isChecked ? 'checked' : ''}>
            <i class="${tab.icon}" style="margin-right: 5px; color: ${tab.color};"></i>
            <span>${tab.name}</span>
        `;
        container.appendChild(checkboxContainer);
    });
}


function findEntryById(id) {
    const allEntries = [
        ...appState.tools, ...appState.emails, ...appState.phones, ...appState.crypto,
        ...appState.locations, ...appState.links, ...appState.media, ...appState.passwords,
        ...appState.keywords, ...appState.socials, ...appState.domains, ...appState.usernames,
        ...appState.threats, ...appState.vulnerabilities, ...appState.malware, ...appState.breaches,
        ...appState.credentials, ...appState.forums, ...appState.vendors, ...appState.telegramChannels,
        ...appState.pastes, ...appState.documents, ...appState.networks, ...appState.metadataEntries,
        ...appState.archives, ...appState.messagingApps, ...appState.datingProfiles, ...appState.audioEntries,
        ...appState.facialRecognition, ...appState.personas, ...appState.vpns, ...appState.honeypots,
        ...appState.exploits, ...appState.publicRecords
    ];
    return allEntries.find(entry => entry.id === id);
}


function getEntryName(entry) {
    switch (entry.type) {
        case 'tool': return entry.name;
        case 'email': return entry.email;
        case 'phone': return entry.number;
        case 'crypto': return entry.address;
        case 'location': return entry.name;
        case 'link': return entry.url;
        case 'media': return entry.title;
        case 'password': return entry.service;
        case 'keyword': return entry.value;
        case 'social': return entry.username;
        case 'domain': return entry.value;
        case 'username': return entry.value;
        case 'threat': return entry.name;
        case 'vulnerability': return entry.cve;
        case 'malware': return entry.filename;
        case 'breach': return entry.company;
        case 'credential': return entry.credentialService || entry.credentialValue;
        case 'forum': return entry.forumName;
        case 'vendor': return entry.vendorAlias;
        case 'telegram': return entry.name;
        case 'paste': return entry.url;
        case 'document': return entry.title;
        case 'network': return entry.subject;
        case 'metadata': return entry.title;
        case 'archive': return entry.originalUrl;
        case 'messaging': return entry.username;
        case 'dating': return entry.username;
        case 'audio': return entry.title;
        case 'facial': return entry.subject;
        case 'persona': return entry.name;
        case 'vpn': return entry.name;
        case 'honeypot': return entry.honeypotType;
        case 'exploit': return entry.name;
        case 'publicrecord': return entry.subjectName || entry.refId;
        default: return 'Unknown Entry';
    }
}

function getEntryIcon(type) {
    switch (type) {
        case 'tool': return 'fas fa-tools';
        case 'email': return 'fas fa-envelope';
        case 'phone': return 'fas fa-phone';
        case 'crypto': return 'fas fa-coins';
        case 'location': return 'fas fa-map-marker-alt';
        case 'link': return 'fas fa-link';
        case 'media': return 'fas fa-camera';
        case 'password': return 'fas fa-key';
        case 'keyword': return 'fas fa-font';
        case 'social': return 'fas fa-users';
        case 'domain': return 'fas fa-globe';
        case 'username': return 'fas fa-user';
        case 'threat': return 'fas fa-skull-crossbones';
        case 'vulnerability': return 'fas fa-bug';
        case 'malware': return 'fas fa-biohazard'; 
        case 'breach': return 'fas fa-database';
        case 'credential': return 'fas fa-user-lock';
        case 'forum': return 'fas fa-comments';
        case 'vendor': return 'fas fa-store';
        case 'telegram': return 'fab fa-telegram-plane';
        case 'paste': return 'fas fa-paste';
        case 'document': return 'fas fa-file-alt';
        case 'network': return 'fas fa-network-wired';
        case 'metadata': return 'fas fa-info-circle';
        case 'archive': return 'fas fa-archive';
        case 'messaging': return 'fas fa-comment-dots';
        case 'dating': return 'fas fa-heart';
        case 'audio': return 'fas fa-volume-up';
        case 'facial': return 'fas fa-face-id-card';
        case 'persona': return 'fas fa-id-badge';
        case 'vpn': return 'fas fa-shield-alt';
        case 'honeypot': return 'fas fa-honey-pot';
        case 'exploit': return 'fas fa-bomb';
        case 'publicrecord': return 'fas fa-scale-balanced';
        default: return 'fas fa-question-circle';
    }
}