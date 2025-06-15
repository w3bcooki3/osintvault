// intelligenceVault.js

// This array defines the structure and categories for the Intelligence Vault.
// It's crucial for populating the parent and child tabs.
const intelligenceVaultTabStructure = [{
    id: 'generalAndCore',
    name: 'General',
    icon: 'fas fa-globe-americas',
    children: [
        { id: 'tools', name: 'General Tools', icon: 'fas fa-tools' },
        { id: 'keywordTools', name: 'Keyword & Text Analysis', icon: 'fas fa-font' },
        { id: 'aiTools', name: 'AI & Generative', icon: 'fas fa-brain' },
        { id: 'osintSearchEngines', name: 'OSINT-Specific Search', icon: 'fas fa-search-dollar' },
        { id: 'archivingTools', name: 'Archiving & Cache', icon: 'fas fa-archive' },
    ]
}, {
    id: 'identityAndSocial',
    name: 'Identity/Social',
    icon: 'fas fa-users',
    children: [
        { id: 'peopleSearchTools', name: 'People Search', icon: 'fas fa-id-card' },
        { id: 'usernameTools', name: 'Usernames & Handles', icon: 'fas fa-at' },
        { id: 'socialTools', name: 'Social Media Profiles', icon: 'fas fa-users' },
        { id: 'emailTools', name: 'Email Investigations', icon: 'fas fa-envelope' },
        { id: 'phoneTools', name: 'Phone Number Analysis', icon: 'fas fa-phone' },
        { id: 'messagingApps', name: 'Messaging Apps & Comms', icon: 'fas fa-comment-dots' },
        { id: 'datingApps', name: 'Dating Apps', icon: 'fas fa-heart' },
    ]
}, {
    id: 'technicalFootprints',
    name: 'Footprints',
    icon: 'fas fa-fingerprint',
    children: [
        { id: 'domainIpUrlTools', name: 'Domain/IP/URL Analysis', icon: 'fas fa-link' },
        { id: 'geoIntTools', name: 'GEOINT & Mapping', icon: 'fas fa-map-marker-alt' },
        { id: 'cryptoTools', name: 'Crypto Wallets & Transactions', icon: 'fas fa-coins' },
        { id: 'darkWebTools', name: 'DarkWeb & Hidden Services', icon: 'fas fa-mask' },
        { id: 'metadataTools', name: 'Metadata Extractors', icon: 'fas fa-info' },
        { id: 'networkAnalysis', name: 'Network & System Analysis', icon: 'fas fa-network-wired' },
        { id: 'documentAnalysis', name: 'Document Analysis', icon: 'fas fa-file-alt' },
    ]
}, {
    id: 'cybersecurityIntel',
    name: 'Threat Intel',
    icon: 'fas fa-shield-alt',
    children: [
        { id: 'threatIntelligenceTools', name: 'Threat Intel Platforms', icon: 'fas fa-hand-fist' },
        { id: 'vulnerabilityTools', name: 'Vulnerability Research', icon: 'fas fa-bug' },
        { id: 'fileMalwareTools', name: 'File & Malware Analysis', icon: 'fas fa-file-code' },
        { id: 'honeypotMonitoring', name: 'Honeypot Monitoring', icon: 'fas fa-honey-pot' },
        { id: 'reverseEngineering', name: 'Reverse Engineering', icon: 'fas fa-cogs' },
    ]
}, {
    id: 'breachAndLeaks',
    name: 'Breach/Leaks',
    icon: 'fas fa-database',
    children: [
        { id: 'passwordLeakTools', name: 'Password Leaks', icon: 'fas fa-key' },
        { id: 'credentialLeakTools', name: 'Credential Dumps', icon: 'fas fa-cloud-download-alt' },
        { id: 'dataBreachTools', name: 'Breached Databases', icon: 'fas fa-shield-virus' },
        { id: 'dumpSearchTools', name: 'General Data Dumps', icon: 'fas fa-dumpster' },
        { id: 'publicRecords', name: 'Public Records & Legal', icon: 'fas fa-scale-balanced' },
    ]
}, {
    id: 'undergroundSources',
    name: 'Forums/Markets',
    icon: 'fas fa-user-ninja',
    children: [
        { id: 'hackingForums', name: 'Hacking & Security Forums', icon: 'fas fa-user-secret' },
        { id: 'exploitMarkets', name: 'Exploit & Malware Markets', icon: 'fas fa-store-alt' },
        { id: 'vendorTracking', name: 'Underground Vendor Tracking', icon: 'fas fa-user-tag' },
        { id: 'telegramChannels', name: 'Telegram Channels', icon: 'fab fa-telegram-plane' },
        { id: 'pasteSites', name: 'Paste Sites', icon: 'fas fa-clipboard-list' },
    ]
}, {
    id: 'mediaAnalysis',
    name: 'Media',
    icon: 'fas fa-image',
    children: [
        { id: 'imageAnalysis', name: 'Image Analysis & Forensics', icon: 'fas fa-camera' },
        { id: 'videoAnalysis', name: 'Video Analysis', icon: 'fas fa-video' },
        { id: 'audioAnalysis', name: 'Audio Analysis', icon: 'fas fa-volume-up' },
        { id: 'facialRecognition', name: 'Facial Recognition', icon: 'fas fa-face-id-card' },
        { id: 'geolocationMedia', name: 'Geolocation from Media', icon: 'fas fa-map-pin' },
    ]
}, {
    id: 'opsec',
    name: 'OpSec',
    icon: 'fas fa-lock',
    children: [
        { id: 'anonymityTools', name: 'Anonymity & VPNs', icon: 'fas fa-mask' },
        { id: 'privacyTools', name: 'Privacy Enhancing Tools', icon: 'fas fa-user-shield' },
        { id: 'secureCommunication', name: 'Secure Communication', icon: 'fas fa-lock-open' },
        { id: 'personaManagement', name: 'Persona Management', icon: 'fas fa-id-badge' },
    ]
}, ];


/**
 * Renders the parent tabs for the Intelligence Vault section.
 * These tabs represent major categories of OSINT tools.
 */
function renderIntelligenceVaultParentTabs() {
    const parentTabsContainer = document.getElementById('intelligenceVaultParentTabs');
    if (!parentTabsContainer) {
        console.error("renderIntelligenceVaultParentTabs: Parent tabs container not found.");
        return;
    }

    parentTabsContainer.innerHTML = ''; // Clear previous content

    intelligenceVaultTabStructure.forEach(parentTab => {
        const button = document.createElement('button');
        button.classList.add('nav-tab', 'intelligence-vault-parent-tab');
        button.dataset.parentTab = parentTab.id;
        button.innerHTML = `<i class="${parentTab.icon}"></i> ${parentTab.name}`;
        parentTabsContainer.appendChild(button);
    });

    // Activate the currently selected parent tab
    const activeParentBtn = parentTabsContainer.querySelector(`.intelligence-vault-parent-tab[data-parent-tab="${appState.currentIntelligenceVaultParentTab}"]`);
    if (activeParentBtn) {
        activeParentBtn.classList.add('active');
    }
}

/**
 * Switches the active parent tab in the Intelligence Vault and updates the child tabs accordingly.
 * @param {string} parentId The ID of the parent tab to activate.
 */
function switchIntelligenceVaultParentTab(parentId) {
    if (appState.readOnlyMode) {
        showToast("Cannot switch categories in read-only shared view.", "warning");
        return;
    }

    // Deactivate all parent tabs
    document.querySelectorAll('#intelligenceVaultParentTabs .intelligence-vault-parent-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Activate the clicked parent tab
    const activeParentBtn = document.querySelector(`#intelligenceVaultParentTabs .intelligence-vault-parent-tab[data-parent-tab="${parentId}"]`);
    if (activeParentBtn) {
        activeParentBtn.classList.add('active');
    }

    appState.currentIntelligenceVaultParentTab = parentId;

    // Find the selected parent tab's children
    const selectedParent = intelligenceVaultTabStructure.find(p => p.id === parentId);
    const childTabsContainer = document.getElementById('intelligenceVaultChildTabs');

    if (selectedParent && childTabsContainer) {
        childTabsContainer.style.display = 'flex'; // Show the child tabs container
        childTabsContainer.innerHTML = selectedParent.children.map(childTab => `
            <button class="sub-nav-tab intelligence-vault-child-tab" data-child-tab="${childTab.id}">
                <i class="${childTab.icon}"></i> ${childTab.name}
            </button>
        `).join('');

        // Automatically activate the first child tab or the previously selected child tab under this parent
        let childToActivate = appState.currentIntelligenceVaultChildTab;
        if (!selectedParent.children.some(c => c.id === childToActivate)) {
            childToActivate = selectedParent.children[0]?.id; // Default to first child if current is not in this parent
        }
        if (childToActivate) {
            switchIntelligenceVaultChildTab(childToActivate);
        } else {
            // No child tabs for this parent, clear display and entries
            appState.currentIntelligenceVaultChildTab = null;
            appState.filters.category = ''; // Clear category filter
            renderIntelligenceEntries();
        }

    } else {
        // Hide child tabs if no selected parent or no children
        if (childTabsContainer) {
            childTabsContainer.style.display = 'none';
        }
        appState.currentIntelligenceVaultChildTab = null;
        appState.filters.category = ''; // Clear category filter
        renderIntelligenceEntries();
    }

    saveState(); // Save the parent tab state
}

/**
 * Switches the active child sub-tab in the Intelligence Vault and re-renders entries.
 * @param {string} childId The ID of the child tab to activate (e.g., 'tools', 'emailTools').
 */
function switchIntelligenceVaultChildTab(childId) {
    if (appState.readOnlyMode) {
        showToast("Cannot switch categories in read-only shared view.", "warning");
        return;
    }

    // Deactivate all child tabs
    document.querySelectorAll('#intelligenceVaultChildTabs .intelligence-vault-child-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Activate the clicked child tab
    const targetChildTabBtn = document.querySelector(`#intelligenceVaultChildTabs .intelligence-vault-child-tab[data-child-tab="${childId}"]`);
    if (targetChildTabBtn) {
        targetChildTabBtn.classList.add('active');
    }

    appState.currentIntelligenceVaultChildTab = childId;
    appState.filters.category = ''; // Clear the main category filter when changing intel vault sub-tabs
    const categoryFilterElement = document.getElementById('categoryFilter');
    if (categoryFilterElement) {
        categoryFilterElement.value = '';
    }
    renderIntelligenceEntries(); // Re-render entries based on the new child tab filter
    saveState(); // Save the child tab state
}

/**
 * Populates the category dropdown for adding a new tool to the Intelligence Vault.
 * This is used specifically by the 'Add New Tool' modal in the Intelligence Vault tab.
 */
function populateCategoryFilterForAddToolOnly() {
    const toolCategorySelect = document.getElementById('toolOnlyCategory');
    if (!toolCategorySelect) return;

    const existingCategories = new Set(appState.tools.map(tool => tool.category.toLowerCase()));

    const defaultCategories = [
        'Search Engines', 'Social Media', 'Network Analysis', 'Email Investigation',
        'Domain Research', 'Image Analysis', 'GEOINT', 'Threat Intelligence', 'Archive', 'Other',
        'Phone Investigation', 'Telecom', 'Cryptocurrency Analysis', 'Geospatial Intelligence',
        'OSINT Mapping', 'Link Analysis', 'URL Analysis', 'Media Analysis', 'Video Analysis',
        'Password Analysis', 'Credential Analysis', 'Keyword Analysis', 'Text Analysis',
        'Social Media Analysis', 'Social Engineering'
    ];

    const allCategories = new Set([...defaultCategories.map(cat => cat.toLowerCase()), ...existingCategories]);

    toolCategorySelect.innerHTML = '<option value="">Select Category</option>';

    Array.from(allCategories)
        .sort((a, b) => a.localeCompare(b))
        .forEach(category => {
            const toolOption = document.createElement('option');
            toolOption.value = category;
            toolOption.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            toolCategorySelect.appendChild(toolOption);
        });

    const customOptionAdd = document.createElement('option');
    customOptionAdd.value = 'custom';
    customOptionAdd.textContent = 'Custom Category';
    toolCategorySelect.appendChild(customOptionAdd);
}

/**
 * Populates the checkboxes for assigning a tool to Intelligence Vault categories
 * when adding a new tool from the dedicated Intelligence Vault tab's 'Add Tool' modal.
 * @param {Array<string>} assignedCategories An array of category IDs already assigned to the tool.
 * @param {string} searchTerm An optional search term to filter the displayed categories.
 */
function populateIntelligenceVaultCategoriesCheckboxesAddTool(assignedCategories = [], searchTerm = '') {
    const checkboxesContainer = document.getElementById('intelligenceVaultCategoriesCheckboxesAddTool');
    if (!checkboxesContainer) return;

    checkboxesContainer.innerHTML = ''; // Clear previous checkboxes

    // All available Intelligence Vault child categories
    const allIntelVaultCategories = intelligenceVaultTabStructure.flatMap(parent => parent.children);

    const filteredCategories = allIntelVaultCategories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredCategories.length === 0) {
        checkboxesContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 10px;">No matching categories.</p>';
        return;
    }

    filteredCategories.forEach(category => {
        const isChecked = assignedCategories.includes(category.id);
        const checkboxContainer = document.createElement('label');
        checkboxContainer.classList.add('custom-tab-checkbox');
        if (isChecked) checkboxContainer.classList.add('checked');

        checkboxContainer.innerHTML = `
            <input type="checkbox" class="intelligence-vault-category-checkbox-add-tool" value="${category.id}" ${isChecked ? 'checked' : ''}>
            <i class="${category.icon}" style="margin-right: 5px;"></i>
            <span>${category.name}</span>
        `;
        checkboxesContainer.appendChild(checkboxContainer);
    });

    // Attach event listener using delegation to the container (if not already added)
    const containerWrapper = document.getElementById('intelligenceVaultCategoriesAssignmentAddTool');
    if (containerWrapper && !containerWrapper.dataset.listenerAdded) {
        containerWrapper.addEventListener('change', (e) => {
            if (e.target.classList.contains('intelligence-vault-category-checkbox-add-tool')) {
                const checkbox = e.target;
                const label = checkbox.closest('.custom-tab-checkbox');
                if (label) {
                    label.classList.toggle('checked', checkbox.checked);
                }
            }
        });
        containerWrapper.dataset.listenerAdded = 'true';
    }
}

/**
 * Populates the checkboxes for assigning a tool to Intelligence Vault categories
 * when editing an existing tool.
 * @param {Array<string>} assignedCategories An array of category IDs already assigned to the tool.
 * @param {string} searchTerm An optional search term to filter the displayed categories.
 */
function populateIntelligenceVaultCategoriesCheckboxesEditTool(assignedCategories = [], searchTerm = '') {
    const container = document.getElementById('intelligenceVaultCategoriesAssignmentEditTool');
    if (!container) return; // Safety check
    container.style.display = 'block';

    const checkboxesContainer = document.getElementById('intelligenceVaultCategoriesCheckboxesEditTool');
    if (!checkboxesContainer) return;
    checkboxesContainer.innerHTML = ''; // Clear previous checkboxes

    // All available Intelligence Vault child categories
    const allIntelVaultCategories = intelligenceVaultTabStructure.flatMap(parent => parent.children);

    const filteredCategories = allIntelVaultCategories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredCategories.length === 0) {
        checkboxesContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 10px;">No matching categories.</p>';
        return;
    }

    filteredCategories.forEach(category => {
        const isChecked = assignedCategories.includes(category.id);
        const checkboxContainer = document.createElement('label');
        checkboxContainer.classList.add('custom-tab-checkbox');
        if (isChecked) checkboxContainer.classList.add('checked');

        checkboxContainer.innerHTML = `
            <input
                type="checkbox"
                class="intelligence-vault-category-checkbox-edit-tool"
                value="${category.id}"
                ${isChecked ? 'checked' : ''}
            >
            <i class="${category.icon}" style="margin-right: 5px;"></i>
            <span>${category.name}</span>
        `;
        checkboxesContainer.appendChild(checkboxContainer);
    });

    // Attach event listener directly to the checkboxesContainer, ensures only one listener
    checkboxesContainer.addEventListener('change', (e) => {
        if (e.target.classList.contains('intelligence-vault-category-checkbox-edit-tool')) {
            const checkbox = e.target;
            const label = checkbox.closest('.custom-tab-checkbox');
            if (label) {
                label.classList.toggle('checked', checkbox.checked);
            }
        }
    });
}


/**
 * Opens the 'Add New Tool' modal specifically for the Intelligence Vault tab.
 * This modal allows adding a new tool and assigning it to Intelligence Vault categories.
 */
function openAddToolOnlyModal() {
    if (appState.readOnlyMode) {
        showToast("Cannot add tools in read-only shared view.", "warning");
        return;
    }
    document.getElementById('addToolOnlyForm').reset();
    populateCategoryFilterForAddToolOnly(); // Populate the main category dropdown

    // Clear search input and populate with no search term for the intelligence vault categories checkboxes
    const intelligenceVaultCategorySearchInput = document.getElementById('intelligenceVaultCategorySearch');
    if (intelligenceVaultCategorySearchInput) {
        intelligenceVaultCategorySearchInput.value = '';
    }
    // Populate the Intelligence Vault category checkboxes, pre-selecting the current active child tab
    const preselectedCategories = appState.currentIntelligenceVaultChildTab ? [appState.currentIntelligenceVaultChildTab] : [];
    populateIntelligenceVaultCategoriesCheckboxesAddTool(preselectedCategories, '');

    document.getElementById('newToolOnlyCategoryInput').style.display = 'none'; // Hide custom category input by default
    showModal('addToolOnlyModal');
}

/**
 * Handles the submission of the 'Add New Tool' form within the Intelligence Vault tab.
 * It creates a new tool entry and assigns it to selected Intelligence Vault categories.
 * @param {Event} e The form submission event.
 */
async function handleAddToolOnly(e) {
    e.preventDefault();
    if (appState.readOnlyMode) {
        showToast("Cannot add tools in read-only shared view.", "warning");
        return;
    }

    const toolName = document.getElementById('toolOnlyName').value.trim();
    const toolUrl = document.getElementById('toolOnlyUrl').value.trim();
    let toolCategory = document.getElementById('toolOnlyCategory').value;
    const newCategoryInput = document.getElementById('newToolOnlyCategoryInput').value.trim();
    const toolDescription = document.getElementById('toolOnlyDescription').value.trim();
    const toolTags = document.getElementById('toolOnlyTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

    // Get selected Intelligence Vault categories
    const selectedIntelligenceVaultCategories = Array.from(document.querySelectorAll('#intelligenceVaultCategoriesCheckboxesAddTool input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    if (!toolName || !toolUrl || !toolCategory) {
        showToast('Please fill in all required tool fields (Name, URL, Category).', 'error');
        return;
    }

    if (toolCategory === 'custom') {
        if (!newCategoryInput) {
            showToast('Please enter a custom category name.', 'error');
            return;
        }
        toolCategory = newCategoryInput.toLowerCase();
    }

    if (selectedIntelligenceVaultCategories.length === 0) {
        showToast('Please select at least one Intelligence Vault category for the tool.', 'error');
        return;
    }

    const newTool = {
        id: generateId(), // Assuming generateId() is globally accessible
        type: 'tool',
        name: toolName,
        url: toolUrl,
        category: toolCategory,
        description: toolDescription,
        tags: toolTags,
        starred: false,
        pinned: false,
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(toolUrl).hostname}`,
        lastUsed: 0,
        addedDate: new Date(),
        customTabs: [], // New tools are not assigned to custom tabs by default here
        intelligenceVaultCategories: selectedIntelligenceVaultCategories, // Store assigned categories
        origin: 'user-added'
    };

    appState.tools.push(newTool); // Assuming appState is globally accessible
    hideModal('addToolOnlyModal'); // Assuming hideModal() is globally accessible
    document.getElementById('addToolOnlyForm').reset(); // Reset form for next use
    showToast('Tool added successfully!', 'success'); // Assuming showToast() is globally accessible
    updateDashboard(); // Assuming updateStats() is globally accessible
    populateCategoryFilter(); // Re-populate category filter as a new category might have been added
    renderIntelligenceEntries(); // Re-render the tool list
    saveState(); // Assuming saveState() is globally accessible
}

// Ensure these functions are accessible globally by attaching them to `window`
// or exporting them if you use a module bundler.
// For a simple refactor, attaching to `window` might be the easiest.
window.renderIntelligenceVaultParentTabs = renderIntelligenceVaultParentTabs;
window.switchIntelligenceVaultParentTab = switchIntelligenceVaultParentTab;
window.switchIntelligenceVaultChildTab = switchIntelligenceVaultChildTab;
window.populateCategoryFilterForAddToolOnly = populateCategoryFilterForAddToolOnly;
window.populateIntelligenceVaultCategoriesCheckboxesAddTool = populateIntelligenceVaultCategoriesCheckboxesAddTool;
window.populateIntelligenceVaultCategoriesCheckboxesEditTool = populateIntelligenceVaultCategoriesCheckboxesEditTool;
window.openAddToolOnlyModal = openAddToolOnlyModal;
window.handleAddToolOnly = handleAddToolOnly;