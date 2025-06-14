// modals-and-forms.js

// --- Universal Modal Functions ---

/**
 * Shows a modal by adding the 'show' class and preventing body scrolling.
 * @param {string} id - The ID of the modal element.
 */
function showModal(id) {
    document.getElementById(id).classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent scrolling background
}

/**
 * Hides a modal by removing the 'show' class and restoring body scrolling.
 * @param {string} id - The ID of the modal element.
 */
function hideModal(id) {
    document.getElementById(id).classList.remove('show');
    document.body.style.overflow = ''; // Restore scrolling
}

// --- Add Tool Only Modal Functions (for Intelligence Vault) ---

/**
 * Opens the 'Add New Tool' modal specifically for the Intelligence Vault.
 * Initializes form fields and category selection.
 */
async function openAddToolOnlyModal() {
    if (appState.readOnlyMode) {
        showToast("Cannot add tools in read-only shared view.", "warning");
        return;
    }
    document.getElementById('addToolOnlyForm').reset();
    populateCategoryFilterForAddToolOnly();

    const intelligenceVaultCategorySearchInput = document.getElementById('intelligenceVaultCategorySearch');
    if (intelligenceVaultCategorySearchInput) {
        intelligenceVaultCategorySearchInput.value = '';
    }
    populateIntelligenceVaultCategoriesCheckboxesAddTool([], '');

    const checkboxes = document.querySelectorAll('#intelligenceVaultCategoriesCheckboxesAddTool input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.value === appState.currentIntelligenceVaultChildTab) {
            checkbox.checked = true;
            checkbox.closest('.custom-tab-checkbox').classList.add('checked');
        } else {
            checkbox.checked = false;
            checkbox.closest('.custom-tab-checkbox').classList.remove('checked');
        }
    });

    document.getElementById('newToolOnlyCategoryInput').style.display = 'none';
    showModal('addToolOnlyModal');
}

/**
 * Populates the category dropdown for the 'Add Tool Only' modal.
 * Includes existing categories and a 'Custom Category' option.
 */
function populateCategoryFilterForAddToolOnly() {
    const toolCategorySelect = document.getElementById('toolOnlyCategory');
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
 * Populates the checkboxes for assigning tools to Intelligence Vault categories in the Add Tool modal.
 * @param {string[]} assignedCategories - IDs of categories already assigned to the tool.
 * @param {string} searchTerm - Optional search term to filter categories.
 */
function populateIntelligenceVaultCategoriesCheckboxesAddTool(assignedCategories = [], searchTerm = '') {
    const checkboxesContainer = document.getElementById('intelligenceVaultCategoriesCheckboxesAddTool');
    if (!checkboxesContainer) return;
    checkboxesContainer.innerHTML = '';

    const intelligenceVaultCategories = [
        { id: 'tools', name: 'General Tools', icon: 'fas fa-tools' },
        { id: 'keywordTools', name: 'Keyword & Text Analysis', icon: 'fas fa-font' },
        { id: 'aiTools', name: 'AI & Generative Tools', icon: 'fas fa-brain' },
        { id: 'osintSearchEngines', name: 'OSINT-Specific Search', icon: 'fas fa-search-dollar' },
        { id: 'archivingTools', name: 'Archiving & Cache', icon: 'fas fa-archive' },
        { id: 'peopleSearchTools', name: 'People Search', icon: 'fas fa-id-card' },
        { id: 'usernameTools', name: 'Usernames & Handles', icon: 'fas fa-at' },
        { id: 'socialTools', name: 'Social Media Profiles', icon: 'fas fa-users' },
        { id: 'emailTools', name: 'Email Investigations', icon: 'fas fa-envelope' },
        { id: 'phoneTools', name: 'Phone Number Analysis', icon: 'fas fa-phone' },
        { id: 'messagingApps', name: 'Messaging Apps & Comms', icon: 'fas fa-comment-dots' },
        { id: 'datingApps', name: 'Dating Apps', icon: 'fas fa-heart' },
        { id: 'domainIpUrlTools', name: 'Domain/IP/URL Analysis', icon: 'fas fa-link' },
        { id: 'geoIntTools', name: 'GEOINT & Mapping', icon: 'fas fa-map-marker-alt' },
        { id: 'cryptoTools', name: 'Crypto Wallets & Transactions', icon: 'fas fa-coins' },
        { id: 'darkWebTools', name: 'DarkWeb & Hidden Services', icon: 'fas fa-mask' },
        { id: 'metadataTools', name: 'Metadata Extractors', icon: 'fas fa-info' },
        { id: 'networkAnalysis', name: 'Network & System Analysis', icon: 'fas fa-network-wired' },
        { id: 'documentAnalysis', name: 'Document Analysis', icon: 'fas fa-file-alt' },
        { id: 'threatIntelligenceTools', name: 'Threat Intel Platforms', icon: 'fas fa-hand-fist' },
        { id: 'vulnerabilityTools', name: 'Vulnerability Research', icon: 'fas fa-bug' },
        { id: 'fileMalwareTools', name: 'File & Malware Analysis', icon: 'fas fa-file-code' },
        { id: 'honeypotMonitoring', name: 'Honeypot Monitoring', icon: 'fas fa-honey-pot' },
        { id: 'reverseEngineering', name: 'Reverse Engineering', icon: 'fas fa-cogs' },
        { id: 'passwordLeakTools', name: 'Password Leaks', icon: 'fas fa-key' },
        { id: 'credentialLeakTools', name: 'Credential Dumps', icon: 'fas fa-cloud-download-alt' },
        { id: 'dataBreachTools', name: 'Breached Databases', icon: 'fas fa-shield-virus' },
        { id: 'dumpSearchTools', name: 'General Data Dumps', icon: 'fas fa-dumpster' },
        { id: 'publicRecords', name: 'Public Records & Legal', icon: 'fas fa-scale-balanced' },
        { id: 'hackingForums', name: 'Hacking & Security Forums', icon: 'fas fa-user-secret' },
        { id: 'exploitMarkets', name: 'Exploit & Malware Markets', icon: 'fas fa-store-alt' },
        { id: 'vendorTracking', name: 'Underground Vendor Tracking', icon: 'fas fa-user-tag' },
        { id: 'telegramChannels', name: 'Telegram Channels', icon: 'fab fa-telegram-plane' },
        { id: 'pasteSites', name: 'Paste Sites', icon: 'fas fa-clipboard-list' },
        { id: 'imageAnalysis', name: 'Image Analysis & Forensics', icon: 'fas fa-camera' },
        { id: 'videoAnalysis', name: 'Video Analysis', icon: 'fas fa-video' },
        { id: 'audioAnalysis', name: 'Audio Analysis', icon: 'fas fa-volume-up' },
        { id: 'facialRecognition', name: 'Facial Recognition', icon: 'fas fa-face-id-card' },
        { id: 'geolocationMedia', name: 'Geolocation from Media', icon: 'fas fa-map-pin' },
        { id: 'anonymityTools', name: 'Anonymity & VPNs', icon: 'fas fa-mask' },
        { id: 'privacyTools', name: 'Privacy Enhancing Tools', icon: 'fas fa-user-shield' },
        { id: 'secureCommunication', name: 'Secure Communication', icon: 'fas fa-lock-open' },
        { id: 'personaManagement', name: 'Persona Management', icon: 'fas fa-id-badge' },
    ];

    const filteredCategories = intelligenceVaultCategories.filter(category =>
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
 * Handles the form submission for adding a new tool to the Intelligence Vault.
 * Creates a new tool entry and saves the state.
 * @param {Event} e - The submit event.
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
        id: generateId(),
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
        customTabs: [],
        intelligenceVaultCategories: selectedIntelligenceVaultCategories
    };

    appState.tools.push(newTool);
    hideModal('addToolOnlyModal');
    document.getElementById('addToolOnlyForm').reset();
    showToast('Tool added successfully!');
    updateStats(); // Assuming updateStats is in core.js or will be imported
    populateCategoryFilter(); // Assuming populateCategoryFilter is in core.js or will be imported
    renderIntelligenceEntries(); // Assuming renderIntelligenceEntries is in core.js or will be imported
    saveState();
}

// --- Generic Add/Edit Entry Modal Functions (for Multi-Vault) ---

/**
 * Displays the appropriate form fields in the Add Entry modal based on the selected entry type.
 */
function displayEntryForm() {
    const entryType = document.getElementById('entryTypeSelect').value;
    document.querySelectorAll('.entry-fields').forEach(fieldSet => {
        fieldSet.style.display = 'none';
    });
    document.getElementById('entrySourceGroup').style.display = 'none';
    document.getElementById('customMetadataGroup').style.display = 'none';

    let fieldsToShow = [];
    switch (entryType) {
        case 'tool': fieldsToShow = ['addToolFields']; break;
        case 'email': fieldsToShow = ['addEmailFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'phone': fieldsToShow = ['addPhoneFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'crypto': fieldsToShow = ['addCryptoFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'location': fieldsToShow = ['addLocationFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'link': fieldsToShow = ['addLinkFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'media': fieldsToShow = ['addMediaFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'password': fieldsToShow = ['addPasswordFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'keyword': fieldsToShow = ['addKeywordFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'social': fieldsToShow = ['addSocialFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'domain': fieldsToShow = ['addDomainFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'username': fieldsToShow = ['addUsernameFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'threat': fieldsToShow = ['addThreatFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'vulnerability': fieldsToShow = ['addVulnerabilityFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'malware': fieldsToShow = ['addMalwareFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'breach': fieldsToShow = ['addBreachFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'credential': fieldsToShow = ['addCredentialFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'forum': fieldsToShow = ['addForumFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'vendor': fieldsToShow = ['addVendorFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'telegram': fieldsToShow = ['addTelegramFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'paste': fieldsToShow = ['addPasteFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'document': fieldsToShow = ['addDocumentFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'network': fieldsToShow = ['addNetworkFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'metadata': fieldsToShow = ['addMetadataEntryFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'archive': fieldsToShow = ['addArchiveFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'messaging': fieldsToShow = ['addMessagingFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'dating': fieldsToShow = ['addDatingFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'facial': fieldsToShow = ['addFacialFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'persona': fieldsToShow = ['addPersonaFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'vpn': fieldsToShow = ['addVpnFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'honeypot': fieldsToShow = ['addHoneypotFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'exploit': fieldsToShow = ['addExploitFields', 'entrySourceGroup', 'customMetadataGroup']; break;
        case 'publicrecord': fieldsToShow = ['addPublicRecordFields', 'entrySourceGroup', 'customMetadataGroup']; break;
    }

    fieldsToShow.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'block';
        }
    });

    if (entryType === 'tool') {
        populateCategoryFilter(); // Assuming this is defined globally or imported
    }
}

/**
 * Handles the form submission for adding a new entry (of any type).
 * Collects form data, creates a new entry, and updates app state.
 * @param {Event} e - The submit event.
 */
async function handleAddEntry(e) {
    e.preventDefault();
    if (appState.readOnlyMode) {
        showToast("Cannot add entries in read-only shared view.", "warning");
        return;
    }

    const entryType = document.getElementById('entryTypeSelect').value;
    let newEntry = {
        id: generateId(),
        type: entryType,
        starred: false,
        pinned: false,
        lastUsed: 0,
        addedDate: new Date(),
        customTabs: [],
        origin: 'user-added'
    };

    const customMetadata = [];
    document.querySelectorAll('#customMetadataEntries .metadata-entry').forEach(row => {
        const keyInput = row.querySelector('.metadata-key');
        const valueInput = row.querySelector('.metadata-value');
        const key = keyInput ? keyInput.value.trim() : '';
        const value = valueInput ? valueInput.value.trim() : '';
        if (key && value) {
            customMetadata.push({ key, value });
        }
    });
    if (customMetadata.length > 0) {
        newEntry.metadata = customMetadata;
    }

    const entrySourceInput = document.getElementById('entrySource');
    if (entrySourceInput && entrySourceInput.value.trim()) {
        newEntry.source = entrySourceInput.value.trim();
    }


    switch (entryType) {
        case 'tool':
            newEntry.name = document.getElementById('toolName').value.trim();
            newEntry.url = document.getElementById('toolUrl').value.trim();
            let toolCategory = document.getElementById('toolCategory').value;
            const newCategoryInput = document.getElementById('newCategoryInput').value.trim();
            newEntry.description = document.getElementById('toolDescription').value.trim();
            newEntry.tags = document.getElementById('toolTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
            newEntry.notes = document.getElementById('toolInvestigationNotes').value.trim();

            if (!newEntry.name || !newEntry.url || !toolCategory) { showToast('Please fill in all required tool fields (Name, URL, Category).', 'error'); return; }
            if (toolCategory === 'custom') {
                if (!newCategoryInput) { showToast('Please enter a custom category name.', 'error'); return; }
                toolCategory = newCategoryInput.toLowerCase();
            }
            newEntry.category = toolCategory;
            newEntry.favicon = `https://www.google.com/s2/favicons?domain=${new URL(newEntry.url).hostname}`;
            appState.tools.push(newEntry);
            break;
        case 'email':
            newEntry.email = document.getElementById('emailAddress').value.trim();
            newEntry.linkedPlatforms = document.getElementById('emailLinkedPlatforms').value.split(',').map(p => p.trim()).filter(p => p);
            newEntry.breachResults = document.getElementById('emailBreachResults').value.trim();
            newEntry.description = document.getElementById('emailDescription').value.trim();
            newEntry.notes = document.getElementById('emailNotes').value.trim();
            if (!newEntry.email) { showToast('Please enter an email address.', 'error'); return; }
            appState.emails.push(newEntry);
            break;
        case 'phone':
            newEntry.number = document.getElementById('phoneNumber').value.trim();
            newEntry.phoneType = document.getElementById('phoneType').value;
            newEntry.location = document.getElementById('phoneLocation').value.trim();
            newEntry.description = document.getElementById('phoneDescription').value.trim();
            newEntry.notes = document.getElementById('phoneNotes').value.trim();
            if (!newEntry.number) { showToast('Please enter a phone number.', 'error'); return; }
            appState.phones.push(newEntry);
            break;
        case 'crypto':
            newEntry.address = document.getElementById('cryptoAddress').value.trim();
            newEntry.txid = document.getElementById('cryptoTxid').value.trim();
            newEntry.amount = parseFloat(document.getElementById('cryptoAmount').value);
            newEntry.source = document.getElementById('cryptoSource').value.trim();
            newEntry.tags = document.getElementById('cryptoTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
            newEntry.description = document.getElementById('cryptoDescription').value.trim();
            newEntry.notes = document.getElementById('cryptoNotes').value.trim();
            if (!newEntry.address || !newEntry.txid || isNaN(newEntry.amount)) { showToast('Please fill in all required crypto fields (Address, TXID, Amount).', 'error'); return; }
            appState.crypto.push(newEntry);
            break;
        case 'location':
            newEntry.name = document.getElementById('locationName').value.trim();
            newEntry.coordinates = document.getElementById('locationCoordinates').value.trim();
            newEntry.mapLink = document.getElementById('locationMapLink').value.trim();
            newEntry.ipGeoIntel = document.getElementById('locationIpGeoIntel').value.trim();
            newEntry.description = document.getElementById('locationDescription').value.trim();
            newEntry.notes = document.getElementById('locationNotes').value.trim();
            if (!newEntry.name || !newEntry.coordinates) { showToast('Please fill in all required location fields (Name, Coordinates).', 'error'); return; }
            appState.locations.push(newEntry);
            break;
        case 'link':
            newEntry.url = document.getElementById('linkUrl').value.trim();
            newEntry.platform = document.getElementById('linkPlatform').value.trim();
            newEntry.tags = document.getElementById('linkTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
            newEntry.description = document.getElementById('linkDescription').value.trim();
            newEntry.notes = document.getElementById('linkNotes').value.trim();
            if (!newEntry.url) { showToast('Please enter a URL.', 'error'); return; }
            appState.links.push(newEntry);
            break;
        case 'media':
            newEntry.title = document.getElementById('mediaTitle').value.trim();
            newEntry.mediaType = document.getElementById('mediaType').value;
            const mediaFile = document.getElementById('mediaFile').files[0];
            newEntry.description = document.getElementById('mediaDescription').value.trim();
            newEntry.notes = document.getElementById('mediaNotes').value.trim();
            
            if (!newEntry.title) { showToast('Please enter a title for the media.', 'error'); return; }
            if (mediaFile) {
                newEntry.base64Data = await readFileAsBase64(mediaFile);
            } else {
                showToast('Please upload a file for media entry.', 'error');
                return;
            }
            appState.media.push(newEntry);
            break;
        case 'password':
            newEntry.service = document.getElementById('passwordService').value.trim();
            newEntry.username = document.getElementById('passwordUsername').value.trim();
            newEntry.password = document.getElementById('passwordValue').value.trim();
            newEntry.strength = document.getElementById('passwordStrength').value.trim();
            newEntry.description = document.getElementById('passwordDescription').value.trim();
            newEntry.notes = document.getElementById('passwordNotes').value.trim();
            if (!newEntry.service || !newEntry.password) { showToast('Please fill in all required password fields (Service, Password).', 'error'); return; }
            appState.passwords.push(newEntry);
            break;
        case 'keyword':
            newEntry.value = document.getElementById('keywordValue').value.trim();
            newEntry.context = document.getElementById('keywordContext').value.trim();
            newEntry.description = document.getElementById('keywordDescription').value.trim();
            newEntry.notes = document.getElementById('keywordNotes').value.trim();
            if (!newEntry.value) { showToast('Please enter a keyword/phrase.', 'error'); return; }
            appState.keywords.push(newEntry);
            break;
        case 'social':
            newEntry.platform = document.getElementById('socialPlatform').value.trim();
            newEntry.url = document.getElementById('socialUrl').value.trim();
            newEntry.username = document.getElementById('socialUsername').value.trim();
            newEntry.followCounts = document.getElementById('socialFollowCounts').value.trim();
            newEntry.description = document.getElementById('socialDescription').value.trim();
            newEntry.notes = document.getElementById('socialNotes').value.trim();
            if (!newEntry.platform || !newEntry.url || !newEntry.username) { showToast('Please fill in all required social profile fields (Platform, URL, Username).', 'error'); return; }
            appState.socials.push(newEntry);
            break;
        case 'domain':
            newEntry.value = document.getElementById('domainValue').value.trim();
            newEntry.domainType = document.getElementById('domainType').value;
            newEntry.registrar = document.getElementById('domainRegistrar').value.trim();
            newEntry.location = document.getElementById('domainLocation').value.trim();
            newEntry.status = document.getElementById('domainStatus').value;
            newEntry.whois = document.getElementById('domainWhois').value.trim();
            newEntry.dns = document.getElementById('domainDns').value.trim();
            newEntry.tags = document.getElementById('domainTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
            newEntry.description = document.getElementById('domainDescription').value.trim();
            newEntry.notes = document.getElementById('domainNotes').value.trim();
            if (!newEntry.value || !newEntry.domainType) { showToast('Please fill in all required domain fields (Domain/IP/URL, Type).', 'error'); return; }
            appState.domains.push(newEntry);
            break;
        case 'username':
            newEntry.value = document.getElementById('usernameValue').value.trim();
            newEntry.platformsFound = document.getElementById('usernamePlatforms').value.trim();
            newEntry.emails = document.getElementById('usernameEmails').value.trim();
            newEntry.realName = document.getElementById('usernameRealName').value.trim();
            newEntry.activity = document.getElementById('usernameActivity').value;
            newEntry.description = document.getElementById('usernameDescription').value.trim();
            newEntry.notes = document.getElementById('usernameNotes').value.trim();
            if (!newEntry.value) { showToast('Please enter a username/handle.', 'error'); return; }
            appState.usernames.push(newEntry);
            break;
        case 'threat':
            newEntry.threatType = document.getElementById('threatType').value;
            newEntry.name = document.getElementById('threatName').value.trim();
            newEntry.severity = document.getElementById('threatSeverity').value;
            newEntry.iocs = document.getElementById('threatIocs').value.trim();
            newEntry.targets = document.getElementById('threatTargets').value.trim();
            newEntry.attribution = document.getElementById('threatAttribution').value.trim();
            newEntry.description = document.getElementById('threatDescription').value.trim();
            newEntry.source = document.getElementById('threatSource').value.trim();
            newEntry.notes = document.getElementById('threatNotes').value.trim();
            if (!newEntry.name || !newEntry.threatType) { showToast('Please fill in all required threat fields (Name/ID, Type).', 'error'); return; }
            appState.threats.push(newEntry);
            break;
        case 'vulnerability':
            newEntry.cve = document.getElementById('vulnCve').value.trim();
            newEntry.cvss = parseFloat(document.getElementById('vulnCvss').value);
            newEntry.software = document.getElementById('vulnSoftware').value.trim();
            newEntry.vulnType = document.getElementById('vulnType').value;
            newEntry.exploit = document.getElementById('vulnExploit').value;
            newEntry.description = document.getElementById('vulnDescription').value.trim();
            newEntry.mitigation = document.getElementById('vulnMitigation').value.trim();
            newEntry.notes = document.getElementById('vulnNotes').value.trim();
            if (!newEntry.cve) { showToast('Please enter a CVE ID.', 'error'); return; }
            appState.vulnerabilities.push(newEntry);
            break;
        case 'malware':
            newEntry.filename = document.getElementById('malwareFilename').value.trim();
            newEntry.hash = document.getElementById('malwareHash').value.trim();
            newEntry.fileType = document.getElementById('malwareType').value;
            newEntry.family = document.getElementById('malwareFamily').value.trim();
            newEntry.detection = document.getElementById('malwareDetection').value.trim();
            newEntry.behavior = document.getElementById('malwareBehavior').value.trim();
            newEntry.source = document.getElementById('malwareSource').value.trim();
            newEntry.tools = document.getElementById('malwareTools').value.trim();
            newEntry.notes = document.getElementById('malwareNotes').value.trim();
            if (!newEntry.filename || !newEntry.hash) { showToast('Please fill in all required malware fields (File Name, File Hash).', 'error'); return; }
            appState.malware.push(newEntry);
            break;
        case 'breach':
            newEntry.company = document.getElementById('breachCompany').value.trim();
            newEntry.date = document.getElementById('breachDate').value;
            newEntry.records = parseInt(document.getElementById('breachRecords').value);
            newEntry.dataTypes = document.getElementById('breachDataTypes').value.trim();
            newEntry.vector = document.getElementById('breachVector').value;
            newEntry.status = document.getElementById('breachStatus').value;
            newEntry.source = document.getElementById('breachSource').value.trim();
            newEntry.description = document.getElementById('breachDescription').value.trim();
            newEntry.notes = document.getElementById('breachNotes').value.trim();
            if (!newEntry.company || !newEntry.date) { showToast('Please fill in all required breach fields (Company/Organization, Breach Date).', 'error'); return; }
            appState.breaches.push(newEntry);
            break;
        case 'credential':
            newEntry.credentialType = document.getElementById('credentialType').value;
            newEntry.credentialValue = document.getElementById('credentialValue').value.trim();
            newEntry.credentialService = document.getElementById('credentialService').value.trim();
            newEntry.breachSource = document.getElementById('credentialBreachSource').value.trim();
            newEntry.dateFound = document.getElementById('credentialDateFound').value;
            newEntry.description = document.getElementById('credentialDescription').value.trim();
            newEntry.notes = document.getElementById('credentialNotes').value.trim();
            if (!newEntry.credentialValue) { showToast('Please enter the credential value.', 'error'); return; }
            appState.credentials.push(newEntry);
            break;
        case 'forum':
            newEntry.forumName = document.getElementById('forumName').value.trim();
            newEntry.forumUrl = document.getElementById('forumUrl').value.trim();
            newEntry.forumType = document.getElementById('forumType').value;
            newEntry.forumStatus = document.getElementById('forumStatus').value;
            newEntry.forumLanguage = document.getElementById('forumLanguage').value.trim();
            newEntry.description = document.getElementById('forumDescription').value.trim();
            newEntry.notes = document.getElementById('forumNotes').value.trim();
            if (!newEntry.forumName || !newEntry.forumUrl) { showToast('Please fill in all required forum fields (Name, URL).', 'error'); return; }
            appState.forums.push(newEntry);
            break;
        case 'vendor':
            newEntry.vendorAlias = document.getElementById('vendorAlias').value.trim();
            newEntry.vendorPlatforms = document.getElementById('vendorPlatforms').value.trim();
            newEntry.vendorProducts = document.getElementById('vendorProducts').value.trim();
            newEntry.vendorReputation = document.getElementById('vendorReputation').value.trim();
            newEntry.description = document.getElementById('vendorDescription').value.trim();
            newEntry.notes = document.getElementById('vendorNotes').value.trim();
            if (!newEntry.vendorAlias) { showToast('Please enter a vendor name/alias.', 'error'); return; }
            appState.vendors.push(newEntry);
            break;
        case 'telegram':
            newEntry.name = document.getElementById('telegramName').value.trim();
            newEntry.url = document.getElementById('telegramUrl').value.trim();
            newEntry.telegramType = document.getElementById('telegramType').value;
            newEntry.subscribers = parseInt(document.getElementById('telegramSubscribers').value);
            newEntry.language = document.getElementById('telegramLanguage').value.trim();
            newEntry.activity = document.getElementById('telegramActivity').value;
            newEntry.content = document.getElementById('telegramContent').value.trim();
            newEntry.admin = document.getElementById('telegramAdmin').value.trim();
            newEntry.tags = document.getElementById('telegramTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
            newEntry.notes = document.getElementById('telegramNotes').value.trim();
            if (!newEntry.name || !newEntry.url) { showToast('Please fill in all required Telegram fields (Channel Name, URL).', 'error'); return; }
            appState.telegramChannels.push(newEntry);
            break;
        case 'paste':
            newEntry.url = document.getElementById('pasteUrl').value.trim();
            newEntry.sourceSite = document.getElementById('pasteSourceSite').value.trim();
            newEntry.contentSummary = document.getElementById('pasteContentSummary').value.trim();
            newEntry.keywords = document.getElementById('pasteKeywords').value.trim();
            newEntry.description = document.getElementById('pasteDescription').value.trim();
            newEntry.notes = document.getElementById('pasteNotes').value.trim();
            if (!newEntry.url) { showToast('Please enter a Paste URL.', 'error'); return; }
            appState.pastes.push(newEntry);
            break;
        case 'document':
            newEntry.title = document.getElementById('documentTitle').value.trim();
            newEntry.fileType = document.getElementById('documentFileType').value.trim();
            newEntry.hash = document.getElementById('documentHash').value.trim();
            newEntry.contentSummary = document.getElementById('documentContentSummary').value.trim();
            newEntry.source = document.getElementById('documentSource').value.trim();
            newEntry.description = document.getElementById('documentDescription').value.trim();
            newEntry.notes = document.getElementById('documentNotes').value.trim();
            if (!newEntry.title || !newEntry.hash) { showToast('Please fill in all required document fields (Title, File Hash).', 'error'); return; }
            appState.documents.push(newEntry);
            break;
        case 'network':
            newEntry.subject = document.getElementById('networkSubject').value.trim();
            newEntry.networkType = document.getElementById('networkType').value;
            newEntry.findings = document.getElementById('networkFindings').value.trim();
            newEntry.associatedIpsDomains = document.getElementById('networkAssociated').value.trim();
            newEntry.toolsUsed = document.getElementById('networkTools').value.trim();
            newEntry.description = document.getElementById('networkDescription').value.trim();
            newEntry.notes = document.getElementById('networkNotes').value.trim();
            if (!newEntry.subject || !newEntry.networkType) { showToast('Please fill in all required network fields (Analysis Subject, Type).', 'error'); return; }
            appState.networks.push(newEntry);
            break;
        case 'metadata':
            newEntry.title = document.getElementById('metadataTitle').value.trim();
            newEntry.description = document.getElementById('metadataDescription').value.trim();
            newEntry.fileSource = document.getElementById('metadataFileSource').value.trim();
            newEntry.notes = document.getElementById('metadataNotes').value.trim();
            if (!newEntry.title) { showToast('Please enter a Metadata Title/Context.', 'error'); return; }
            appState.metadataEntries.push(newEntry);
            break;
        case 'archive':
            newEntry.originalUrl = document.getElementById('archiveOriginalUrl').value.trim();
            newEntry.url = document.getElementById('archiveUrl').value.trim();
            newEntry.service = document.getElementById('archiveService').value.trim();
            newEntry.timestamp = document.getElementById('archiveTimestamp').value;
            newEntry.contentSummary = document.getElementById('archiveContentSummary').value.trim();
            newEntry.description = document.getElementById('archiveDescription').value.trim();
            newEntry.notes = document.getElementById('archiveNotes').value.trim();
            if (!newEntry.originalUrl || !newEntry.url) { showToast('Please fill in all required archive fields (Original URL, Archived URL).', 'error'); return; }
            if (newEntry.timestamp) {
                newEntry.timestamp = new Date(newEntry.timestamp).getTime();
            }
            appState.archives.push(newEntry);
            break;
        case 'messaging':
            newEntry.messagingApp = document.getElementById('messagingApp').value;
            newEntry.username = document.getElementById('messagingUsername').value.trim();
            newEntry.chatId = document.getElementById('messagingChatId').value.trim();
            newEntry.content = document.getElementById('messagingContent').value.trim();
            newEntry.description = document.getElementById('messagingDescription').value.trim();
            newEntry.notes = document.getElementById('messagingNotes').value.trim();
            if (!newEntry.messagingApp || !newEntry.username) { showToast('Please fill in all required messaging fields (App, Username/ID).', 'error'); return; }
            appState.messagingApps.push(newEntry);
            break;
        case 'dating':
            newEntry.platform = document.getElementById('datingPlatform').value;
            newEntry.username = document.getElementById('datingUsername').value.trim();
            newEntry.displayName = document.getElementById('datingDisplayName').value.trim();
            newEntry.age = parseInt(document.getElementById('datingAge').value);
            newEntry.location = document.getElementById('datingLocation').value.trim();
            newEntry.photos = document.getElementById('datingPhotos').value.trim();
            newEntry.bio = document.getElementById('datingBio').value.trim();
            newEntry.verified = document.getElementById('datingVerified').value;
            newEntry.suspicious = document.getElementById('datingSuspicious').value.trim();
            newEntry.notes = document.getElementById('datingNotes').value.trim();
            if (!newEntry.platform || !newEntry.username) { showToast('Please fill in all required dating profile fields (Platform, Username).', 'error'); return; }
            appState.datingProfiles.push(newEntry);
            break;
        case 'audio':
            newEntry.title = document.getElementById('audioTitle').value.trim();
            newEntry.format = document.getElementById('audioFormat').value;
            newEntry.duration = document.getElementById('audioDuration').value.trim();
            newEntry.quality = document.getElementById('audioQuality').value;
            newEntry.language = document.getElementById('audioLanguage').value.trim();
            newEntry.transcript = document.getElementById('audioTranscript').value.trim();
            newEntry.speakers = document.getElementById('audioSpeakers').value.trim();
            newEntry.background = document.getElementById('audioBackground').value.trim();
            newEntry.tools = document.getElementById('audioTools').value.trim();
            newEntry.description = document.getElementById('audioDescription').value.trim();
            newEntry.notes = document.getElementById('audioNotes').value.trim();
            const audioFile = document.getElementById('audioFile').files[0];
            if (!newEntry.title || !newEntry.format) { showToast('Please fill in all required audio fields (Title, Format).', 'error'); return; }
            if (audioFile) {
                newEntry.base64Data = await readFileAsBase64(audioFile);
            } else {
                showToast('Please upload an audio file.', 'error');
                return;
            }
            appState.audioEntries.push(newEntry);
            break;
        case 'facial':
            newEntry.subject = document.getElementById('facialSubject').value.trim();
            newEntry.sourceDescription = document.getElementById('facialSourceDescription').value.trim();
            newEntry.identifiedProfiles = document.getElementById('facialIdentifiedProfiles').value.trim();
            newEntry.confidence = document.getElementById('facialConfidence').value.trim();
            newEntry.toolsUsed = document.getElementById('facialToolsUsed').value.trim();
            newEntry.description = document.getElementById('facialDescription').value.trim();
            newEntry.notes = document.getElementById('facialNotes').value.trim();
            if (!newEntry.subject) { showToast('Please enter a subject/person identified.', 'error'); return; }
            appState.facialRecognition.push(newEntry);
            break;
        case 'persona':
            newEntry.name = document.getElementById('personaName').value.trim();
            newEntry.realName = document.getElementById('personaRealName').value.trim();
            newEntry.associatedAccounts = document.getElementById('personaAssociatedAccounts').value.trim();
            newEntry.bio = document.getElementById('personaBio').value.trim();
            newEntry.platformsUsed = document.getElementById('personaPlatforms').value.trim();
            newEntry.origin = document.getElementById('personaOrigin').value.trim();
            newEntry.notes = document.getElementById('personaNotes').value.trim();
            if (!newEntry.name) { showToast('Please enter a persona name/alias.', 'error'); return; }
            appState.personas.push(newEntry);
            break;
        case 'vpn':
            newEntry.name = document.getElementById('vpnName').value.trim();
            newEntry.vpnType = document.getElementById('vpnType').value;
            newEntry.jurisdiction = document.getElementById('vpnJurisdiction').value.trim();
            newEntry.logs = document.getElementById('vpnLogs').value;
            newEntry.payment = document.getElementById('vpnPayment').value.trim();
            newEntry.locations = document.getElementById('vpnLocations').value.trim();
            newEntry.issues = document.getElementById('vpnIssues').value.trim();
            newEntry.useCase = document.getElementById('vpnUseCase').value;
            newEntry.description = document.getElementById('vpnDescription').value.trim();
            newEntry.notes = document.getElementById('vpnNotes').value.trim();
            if (!newEntry.name || !newEntry.vpnType) { showToast('Please fill in all required VPN fields (Service Name, Type).', 'error'); return; }
            appState.vpns.push(newEntry);
            break;
        case 'honeypot':
            newEntry.honeypotType = document.getElementById('honeypotType').value;
            newEntry.location = document.getElementById('honeypotLocation').value.trim();
            newEntry.purpose = document.getElementById('honeypotPurpose').value.trim();
            newEntry.dataSummary = document.getElementById('honeypotDataSummary').value.trim();
            newEntry.alerts = document.getElementById('honeypotAlerts').value.trim();
            newEntry.description = document.getElementById('honeypotDescription').value.trim();
            newEntry.notes = document.getElementById('honeypotNotes').value.trim();
            if (!newEntry.honeypotType || !newEntry.location) { showToast('Please fill in all required honeypot fields (Type, Deployment Location/IP).', 'error'); return; }
            appState.honeypots.push(newEntry);
            break;
        case 'exploit':
            newEntry.name = document.getElementById('exploitName').value.trim();
            newEntry.targetVuln = document.getElementById('exploitTargetVuln').value.trim();
            newEntry.exploitType = document.getElementById('exploitType').value;
            newEntry.marketSource = document.getElementById('exploitMarketSource').value.trim();
            newEntry.price = document.getElementById('exploitPrice').value.trim();
            newEntry.description = document.getElementById('exploitDescription').value.trim();
            newEntry.notes = document.getElementById('exploitNotes').value.trim();
            if (!newEntry.name || !newEntry.targetVuln) { showToast('Please fill in all required exploit fields (Name/ID, Target Vulnerability).', 'error'); return; }
            appState.exploits.push(newEntry);
            break;
        case 'publicrecord':
            newEntry.recordType = document.getElementById('publicRecordType').value;
            newEntry.subjectName = document.getElementById('publicRecordSubjectName').value.trim();
            newEntry.refId = document.getElementById('publicRecordRefId').value.trim();
            newEntry.jurisdiction = document.getElementById('publicRecordJurisdiction').value.trim();
            newEntry.date = document.getElementById('publicRecordDate').value;
            newEntry.summary = document.getElementById('publicRecordSummary').value.trim();
            newEntry.sourceUrl = document.getElementById('publicRecordSourceUrl').value.trim();
            newEntry.description = document.getElementById('publicRecordDescription').value.trim();
            newEntry.notes = document.getElementById('publicRecordNotes').value.trim();
            if (!newEntry.recordType || !newEntry.subjectName) { showToast('Please fill in all required public record fields (Record Type, Subject Name).', 'error'); return; }
            appState.publicRecords.push(newEntry);
            break;
    }

    if (appState.currentTab === 'custom-tabs' && appState.currentCustomTab) {
        const activeCustomTab = appState.customTabs.find(tab => tab.id === appState.currentCustomTab);
        if (activeCustomTab && !activeCustomTab.toolIds.includes(newEntry.id)) {
            activeCustomTab.toolIds.push(newEntry.id);
            newEntry.customTabs.push(activeCustomTab.id);
        }
    }

    hideModal('addEntryModal');
    document.getElementById('addEntryForm').reset();
    document.getElementById('customMetadataEntries').innerHTML = '';
    showToast('Entry added successfully!');
    updateStats();
    populateCategoryFilter();
    renderIntelligenceEntries();
    renderCustomTabs();
    saveState();
}

/**
 * Opens the 'Edit Entry' modal, populating it with data from the selected entry.
 * Adjusts visible fields based on entry type.
 * @param {object} entry - The entry object to edit.
 */
function openEditEntryModal(entry) {
    if (appState.readOnlyMode) {
        showToast("Cannot edit entries in read-only shared view.", "warning");
        return;
    }

    document.getElementById('editEntryId').value = entry.id;
    document.getElementById('editEntryType').value = entry.type;

    document.querySelectorAll('#editEntryModal .entry-fields').forEach(fieldSet => {
        fieldSet.style.display = 'none';
        fieldSet.querySelectorAll('[required]').forEach(input => {
            input.removeAttribute('required');
        });
    });

    const editEntrySourceGroup = document.getElementById('editEntrySourceGroup');
    const editEntrySource = document.getElementById('editEntrySource');
    if (editEntrySourceGroup) editEntrySourceGroup.style.display = 'block';
    if (editEntrySource) editEntrySource.value = entry.source || '';

    const editCustomMetadataEntries = document.getElementById('editCustomMetadataEntries');
    const editCustomMetadataGroup = document.getElementById('editCustomMetadataGroup');
    if (editCustomMetadataEntries) editCustomMetadataEntries.innerHTML = '';
    if (entry.metadata && entry.metadata.length > 0) {
        entry.metadata.forEach(meta => addMetadataField('edit', meta.key, meta.value));
    }
    if (editCustomMetadataGroup) editCustomMetadataGroup.style.display = 'block';


    let fieldsToShow = [];
    const setFieldValue = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.value = value || '';
    };
    const setRequired = (id, isRequired) => {
        const element = document.getElementById(id);
        if (element) {
            if (isRequired) element.setAttribute('required', 'required');
            else element.removeAttribute('required');
        }
    };


    switch (entry.type) {
        case 'tool':
            fieldsToShow = ['editToolFields'];
            setFieldValue('editToolName', entry.name);
            setFieldValue('editToolUrl', entry.url);
            setFieldValue('editToolCategory', entry.category);
            setFieldValue('editToolDescription', entry.description);
            setFieldValue('editToolTags', entry.tags ? entry.tags.join(', ') : '');
            setFieldValue('editToolInvestigationNotes', entry.notes);

            const editVaultCategorySearchInput = document.getElementById('editIntelligenceVaultCategorySearch');
            if (editVaultCategorySearchInput) {
                editVaultCategorySearchInput.value = '';
            }
            populateIntelligenceVaultCategoriesCheckboxesEditTool(entry.intelligenceVaultCategories || [], '');

            const editNewCategoryInput = document.getElementById('editNewCategoryInput');
            const editToolCategorySelect = document.getElementById('editToolCategory');
            if (editToolCategorySelect && !editToolCategorySelect.querySelector(`option[value="${entry.category}"]`)) {
                editToolCategorySelect.value = 'custom';
                if (editNewCategoryInput) {
                    editNewCategoryInput.style.display = 'block';
                    editNewCategoryInput.value = entry.category;
                }
            } else if (editNewCategoryInput) {
                editNewCategoryInput.style.display = 'none';
                editNewCategoryInput.value = '';
            }

            setRequired('editToolName', true);
            setRequired('editToolUrl', true);
            setRequired('editToolCategory', true);
            if (editNewCategoryInput && editNewCategoryInput.style.display === 'block') {
                setRequired('editNewCategoryInput', true);
            }
            break;
        case 'email':
            fieldsToShow = ['editEmailFields'];
            setFieldValue('editEmailAddress', entry.email);
            setFieldValue('editEmailLinkedPlatforms', entry.linkedPlatforms ? entry.linkedPlatforms.join(', ') : '');
            setFieldValue('editEmailBreachResults', entry.breachResults);
            setFieldValue('editEmailDescription', entry.description);
            setFieldValue('editEmailNotes', entry.notes);
            setRequired('editEmailAddress', true);
            break;
        case 'phone':
            fieldsToShow = ['editPhoneFields'];
            setFieldValue('editPhoneNumber', entry.number);
            setFieldValue('editPhoneType', entry.phoneType);
            setFieldValue('editPhoneLocation', entry.location);
            setFieldValue('editPhoneDescription', entry.description);
            setFieldValue('editPhoneNotes', entry.notes);
            setRequired('editPhoneNumber', true);
            break;
        case 'crypto':
            fieldsToShow = ['editCryptoFields'];
            setFieldValue('editCryptoAddress', entry.address);
            setFieldValue('editCryptoTxid', entry.txid);
            setFieldValue('editCryptoAmount', entry.amount);
            setFieldValue('editCryptoSource', entry.source);
            setFieldValue('editCryptoTags', entry.tags ? entry.tags.join(', ') : '');
            setFieldValue('editCryptoDescription', entry.description);
            setFieldValue('editCryptoNotes', entry.notes);
            setRequired('editCryptoAddress', true);
            setRequired('editCryptoTxid', true);
            setRequired('editCryptoAmount', true);
            break;
        case 'location':
            fieldsToShow = ['editLocationFields'];
            setFieldValue('editLocationName', entry.name);
            setFieldValue('editLocationCoordinates', entry.coordinates);
            setFieldValue('editLocationMapLink', entry.mapLink);
            setFieldValue('editLocationIpGeoIntel', entry.ipGeoIntel);
            setFieldValue('editLocationDescription', entry.description);
            setFieldValue('editLocationNotes', entry.notes);
            setRequired('editLocationName', true);
            setRequired('editLocationCoordinates', true);
            break;
        case 'link':
            fieldsToShow = ['editLinkFields'];
            setFieldValue('editLinkUrl', entry.url);
            setFieldValue('editLinkPlatform', entry.platform);
            setFieldValue('editLinkTags', entry.tags ? entry.tags.join(', ') : '');
            setFieldValue('editLinkDescription', entry.description);
            setFieldValue('editLinkNotes', entry.notes);
            setRequired('editLinkUrl', true);
            break;
        case 'media':
            fieldsToShow = ['editMediaFields'];
            setFieldValue('editMediaTitle', entry.title);
            setFieldValue('editMediaType', entry.mediaType);
            setFieldValue('editMediaBase64Data', entry.base64Data);
            setFieldValue('editMediaDescription', entry.description);
            setFieldValue('editMediaNotes', entry.notes);
            setRequired('editMediaTitle', true);
            break;
        case 'password':
            fieldsToShow = ['editPasswordFields'];
            setFieldValue('editPasswordService', entry.service);
            setFieldValue('editPasswordUsername', entry.username);
            setFieldValue('editPasswordValue', entry.password);
            setFieldValue('editPasswordStrength', entry.strength);
            setFieldValue('editPasswordDescription', entry.description);
            setFieldValue('editPasswordNotes', entry.notes);
            setRequired('editPasswordService', true);
            setRequired('editPasswordValue', true);
            break;
        case 'keyword':
            fieldsToShow = ['editKeywordFields'];
            setFieldValue('editKeywordValue', entry.value);
            setFieldValue('editKeywordContext', entry.context);
            setFieldValue('editKeywordDescription', entry.description);
            setFieldValue('editKeywordNotes', entry.notes);
            setRequired('editKeywordValue', true);
            break;
        case 'social':
            fieldsToShow = ['editSocialFields'];
            setFieldValue('editSocialPlatform', entry.platform);
            setFieldValue('editSocialUrl', entry.url);
            setFieldValue('editSocialUsername', entry.username);
            setFieldValue('editSocialFollowCounts', entry.followCounts);
            setFieldValue('editSocialDescription', entry.description);
            setFieldValue('editSocialNotes', entry.notes);
            setRequired('editSocialPlatform', true);
            setRequired('editSocialUrl', true);
            setRequired('editSocialUsername', true);
            break;
        case 'domain':
            fieldsToShow = ['editDomainFields'];
            setFieldValue('editDomainValue', entry.value);
            setFieldValue('editDomainType', entry.domainType);
            setFieldValue('editDomainRegistrar', entry.registrar);
            setFieldValue('editDomainLocation', entry.location);
            setFieldValue('editDomainStatus', entry.status);
            setFieldValue('editDomainWhois', entry.whois);
            setFieldValue('editDomainDns', entry.dns);
            setFieldValue('editDomainTags', entry.tags ? entry.tags.join(', ') : '');
            setFieldValue('editDomainDescription', entry.description);
            setFieldValue('editDomainNotes', entry.notes);
            setRequired('editDomainValue', true);
            setRequired('editDomainType', true);
            break;
        case 'username':
            fieldsToShow = ['editUsernameFields'];
            setFieldValue('editUsernameValue', entry.value);
            setFieldValue('editUsernamePlatforms', entry.platformsFound);
            setFieldValue('editUsernameEmails', entry.emails);
            setFieldValue('editUsernameRealName', entry.realName);
            setFieldValue('editUsernameActivity', entry.activity);
            setFieldValue('editUsernameDescription', entry.description);
            setFieldValue('editUsernameNotes', entry.notes);
            setRequired('editUsernameValue', true);
            break;
        case 'threat':
            fieldsToShow = ['editThreatFields'];
            setFieldValue('editThreatType', entry.threatType);
            setFieldValue('editThreatName', entry.name);
            setFieldValue('editThreatSeverity', entry.severity);
            setFieldValue('editThreatIocs', entry.iocs);
            setFieldValue('editThreatTargets', entry.targets);
            setFieldValue('editThreatAttribution', entry.attribution);
            setFieldValue('editThreatDescription', entry.description);
            setFieldValue('editThreatSource', entry.source);
            setFieldValue('editThreatNotes', entry.notes);
            setRequired('editThreatName', true);
            setRequired('editThreatType', true);
            break;
        case 'vulnerability':
            fieldsToShow = ['editVulnerabilityFields'];
            setFieldValue('editVulnCve', entry.cve);
            setFieldValue('editVulnCvss', entry.cvss);
            setFieldValue('editVulnSoftware', entry.software);
            setFieldValue('editVulnType', entry.vulnType);
            setFieldValue('editVulnExploit', entry.exploit);
            setFieldValue('editVulnDescription', entry.description);
            setFieldValue('editVulnMitigation', entry.mitigation);
            setFieldValue('editVulnNotes', entry.notes);
            setRequired('editVulnCve', true);
            break;
        case 'malware':
            fieldsToShow = ['editMalwareFields'];
            setFieldValue('editMalwareFilename', entry.filename);
            setFieldValue('editMalwareHash', entry.hash);
            setFieldValue('editMalwareType', entry.fileType);
            setFieldValue('editMalwareFamily', entry.family);
            setFieldValue('editMalwareDetection', entry.detection);
            setFieldValue('editMalwareBehavior', entry.behavior);
            setFieldValue('editMalwareSource', entry.malwareSource);
            setFieldValue('editMalwareTools', entry.tools);
            setFieldValue('editMalwareNotes', entry.notes);
            setRequired('editMalwareFilename', true);
            break;
        case 'breach':
            fieldsToShow = ['editBreachFields'];
            setFieldValue('editBreachCompany', entry.company);
            setFieldValue('editBreachDate', entry.date);
            setFieldValue('editBreachRecords', entry.records);
            setFieldValue('editBreachDataTypes', entry.dataTypes);
            setFieldValue('editBreachVector', entry.vector);
            setFieldValue('editBreachStatus', entry.status);
            setFieldValue('editBreachSource', entry.source);
            setFieldValue('editBreachDescription', entry.description);
            setFieldValue('editBreachNotes', entry.notes);
            setRequired('editBreachCompany', true);
            break;
        case 'credential':
            fieldsToShow = ['editCredentialFields'];
            setFieldValue('editCredentialType', entry.credentialType);
            setFieldValue('editCredentialValue', entry.credentialValue);
            setFieldValue('editCredentialService', entry.credentialService);
            setFieldValue('editCredentialBreachSource', entry.breachSource);
            setFieldValue('editCredentialDateFound', entry.dateFound);
            setFieldValue('editCredentialDescription', entry.description);
            setFieldValue('editCredentialNotes', entry.notes);
            setRequired('editCredentialValue', true);
            break;
        case 'forum':
            fieldsToShow = ['editForumFields'];
            setFieldValue('editForumName', entry.forumName);
            setFieldValue('editForumUrl', entry.forumUrl);
            setFieldValue('editForumType', entry.forumType);
            setFieldValue('editForumStatus', entry.forumStatus);
            setFieldValue('editForumLanguage', entry.forumLanguage);
            setFieldValue('editForumDescription', entry.description);
            setFieldValue('editForumNotes', entry.notes);
            setRequired('editForumName', true);
            setRequired('editForumUrl', true);
            break;
        case 'vendor':
            fieldsToShow = ['editVendorFields'];
            setFieldValue('editVendorAlias', entry.vendorAlias);
            setFieldValue('editVendorPlatforms', entry.vendorPlatforms);
            setFieldValue('editVendorProducts', entry.vendorProducts);
            setFieldValue('editVendorReputation', entry.vendorReputation);
            setFieldValue('editVendorDescription', entry.description);
            setFieldValue('editVendorNotes', entry.notes);
            setRequired('editVendorAlias', true);
            break;
        case 'telegram':
            fieldsToShow = ['editTelegramFields'];
            setFieldValue('editTelegramName', entry.name);
            setFieldValue('editTelegramUrl', entry.url);
            setFieldValue('editTelegramType', entry.telegramType);
            setFieldValue('editTelegramSubscribers', entry.subscribers);
            setFieldValue('editTelegramLanguage', entry.language);
            setFieldValue('editTelegramActivity', entry.activity);
            setFieldValue('editTelegramContent', entry.content);
            setFieldValue('editTelegramAdmin', entry.admin);
            setFieldValue('editTelegramTags', entry.tags ? entry.tags.join(', ') : '');
            setFieldValue('editTelegramNotes', entry.notes);
            setRequired('editTelegramName', true);
            setRequired('editTelegramUrl', true);
            break;
        case 'paste':
            fieldsToShow = ['editPasteFields'];
            setFieldValue('editPasteUrl', entry.url);
            setFieldValue('editPasteSourceSite', entry.sourceSite);
            setFieldValue('editPasteContentSummary', entry.contentSummary);
            setFieldValue('editPasteKeywords', entry.keywords);
            setFieldValue('editPasteDescription', entry.description);
            setFieldValue('editPasteNotes', entry.notes);
            setRequired('editPasteUrl', true);
            break;
        case 'document':
            fieldsToShow = ['editDocumentFields'];
            setFieldValue('editDocumentTitle', entry.title);
            setFieldValue('editDocumentFileType', entry.fileType);
            setFieldValue('editDocumentHash', entry.hash);
            setFieldValue('editDocumentContentSummary', entry.contentSummary);
            setFieldValue('editDocumentSource', entry.source);
            setFieldValue('editDocumentDescription', entry.description);
            setFieldValue('editDocumentNotes', entry.notes);
            setRequired('editDocumentTitle', true);
            setRequired('editDocumentHash', true);
            break;
        case 'network':
            fieldsToShow = ['editNetworkFields'];
            setFieldValue('editNetworkSubject', entry.subject);
            setFieldValue('editNetworkType', entry.networkType);
            setFieldValue('editNetworkFindings', entry.findings);
            setFieldValue('editNetworkAssociated', entry.associatedIpsDomains);
            setFieldValue('editNetworkTools', entry.toolsUsed);
            setFieldValue('editNetworkDescription', entry.description);
            setFieldValue('editNetworkNotes', entry.notes);
            setRequired('editNetworkSubject', true);
            break;
        case 'metadata':
            fieldsToShow = ['editMetadataEntryFields'];
            setFieldValue('editMetadataTitle', entry.title);
            setFieldValue('editMetadataDescription', entry.description);
            setFieldValue('editMetadataFileSource', entry.fileSource);
            setFieldValue('editMetadataNotes', entry.notes);
            setRequired('editMetadataTitle', true);
            break;
        case 'archive':
            fieldsToShow = ['editArchiveFields'];
            setFieldValue('editArchiveOriginalUrl', entry.originalUrl);
            setFieldValue('editArchiveUrl', entry.url);
            setFieldValue('editArchiveService', entry.service);
            setFieldValue('editArchiveTimestamp', entry.timestamp ? new Date(entry.timestamp).toISOString().slice(0, 16) : '');
            setFieldValue('editArchiveContentSummary', entry.contentSummary);
            setFieldValue('editArchiveDescription', entry.description);
            setFieldValue('editArchiveNotes', entry.notes);
            setRequired('editArchiveOriginalUrl', true);
            setRequired('editArchiveUrl', true);
            break;
        case 'messaging':
            fieldsToShow = ['editMessagingFields'];
            setFieldValue('editMessagingApp', entry.messagingApp);
            setFieldValue('editMessagingUsername', entry.username);
            setFieldValue('editMessagingChatId', entry.chatId);
            setFieldValue('editMessagingContent', entry.content);
            setFieldValue('editMessagingDescription', entry.description);
            setFieldValue('editMessagingNotes', entry.notes);
            setRequired('editMessagingUsername', true);
            setRequired('editMessagingApp', true);
            break;
        case 'dating':
            fieldsToShow = ['editDatingFields'];
            setFieldValue('editDatingPlatform', entry.platform);
            setFieldValue('editDatingUsername', entry.username);
            setFieldValue('editDatingDisplayName', entry.displayName);
            setFieldValue('editDatingAge', entry.age);
            setFieldValue('editDatingLocation', entry.location);
            setFieldValue('editDatingPhotos', entry.photos);
            setFieldValue('editDatingBio', entry.bio);
            setFieldValue('editDatingVerified', entry.verified);
            setFieldValue('editDatingSuspicious', entry.suspicious);
            setFieldValue('editDatingNotes', entry.notes);
            setRequired('editDatingPlatform', true);
            setRequired('editDatingUsername', true);
            break;
        case 'audio':
            fieldsToShow = ['editAudioFields'];
            setFieldValue('editAudioTitle', entry.title);
            setFieldValue('editAudioFormat', entry.format);
            setFieldValue('editAudioDuration', entry.duration);
            setFieldValue('editAudioQuality', entry.quality);
            setFieldValue('editAudioLanguage', entry.language);
            setFieldValue('editAudioTranscript', entry.transcript);
            setFieldValue('editAudioSpeakers', entry.speakers);
            setFieldValue('editAudioBackground', entry.background);
            setFieldValue('editAudioTools', entry.tools);
            setFieldValue('editAudioDescription', entry.description);
            setFieldValue('editAudioNotes', entry.notes);
            setRequired('editAudioTitle', true);
            setRequired('editAudioFormat', true);
            break;
        case 'facial':
            fieldsToShow = ['editFacialFields'];
            setFieldValue('editFacialSubject', entry.subject);
            setFieldValue('editFacialSourceDescription', entry.sourceDescription);
            setFieldValue('editFacialIdentifiedProfiles', entry.identifiedProfiles);
            setFieldValue('editFacialConfidence', entry.confidence);
            setFieldValue('editFacialToolsUsed', entry.toolsUsed);
            setFieldValue('editFacialDescription', entry.description);
            setFieldValue('editFacialNotes', entry.notes);
            setRequired('editFacialSubject', true);
            break;
        case 'persona':
            fieldsToShow = ['editPersonaFields'];
            setFieldValue('editPersonaName', entry.name);
            setFieldValue('editPersonaRealName', entry.realName);
            setFieldValue('editPersonaAssociatedAccounts', entry.associatedAccounts);
            setFieldValue('editPersonaBio', entry.bio);
            setFieldValue('editPersonaPlatforms', entry.platformsUsed);
            setFieldValue('editPersonaOrigin', entry.origin);
            setFieldValue('editPersonaNotes', entry.notes);
            setRequired('editPersonaName', true);
            break;
        case 'vpn':
            fieldsToShow = ['editVpnFields'];
            setFieldValue('editVpnName', entry.name);
            setFieldValue('editVpnType', entry.vpnType);
            setFieldValue('editVpnJurisdiction', entry.jurisdiction);
            setFieldValue('editVpnLogs', entry.logs);
            setFieldValue('editVpnPayment', entry.payment);
            setFieldValue('editVpnLocations', entry.locations);
            setFieldValue('editVpnIssues', entry.issues);
            setFieldValue('editVpnUseCase', entry.useCase);
            setFieldValue('editVpnDescription', entry.description);
            setFieldValue('editVpnNotes', entry.notes);
            setRequired('editVpnName', true);
            break;
        case 'honeypot':
            fieldsToShow = ['editHoneypotFields'];
            setFieldValue('editHoneypotType', entry.honeypotType);
            setFieldValue('editHoneypotLocation', entry.location);
            setFieldValue('editHoneypotPurpose', entry.purpose);
            setFieldValue('editHoneypotDataSummary', entry.dataSummary);
            setFieldValue('editHoneypotAlerts', entry.alerts);
            setFieldValue('editHoneypotDescription', entry.description);
            setFieldValue('editHoneypotNotes', entry.notes);
            setRequired('editHoneypotType', true);
            break;
        case 'exploit':
            fieldsToShow = ['editExploitFields'];
            setFieldValue('editExploitName', entry.name);
            setFieldValue('editExploitTargetVuln', entry.targetVuln);
            setFieldValue('editExploitType', entry.exploitType);
            setFieldValue('editExploitMarketSource', entry.marketSource);
            setFieldValue('editExploitPrice', entry.price);
            setFieldValue('editExploitDescription', entry.description);
            setFieldValue('editExploitNotes', entry.notes);
            setRequired('editExploitName', true);
            break;
        case 'publicrecord':
            fieldsToShow = ['editPublicRecordFields'];
            setFieldValue('editPublicRecordType', entry.recordType);
            setFieldValue('editPublicRecordSubjectName', entry.subjectName);
            setFieldValue('editPublicRecordRefId', entry.refId);
            setFieldValue('editPublicRecordJurisdiction', entry.jurisdiction);
            setFieldValue('editPublicRecordDate', entry.date);
            setFieldValue('editPublicRecordSummary', entry.summary);
            setFieldValue('editPublicRecordSourceUrl', entry.sourceUrl);
            setFieldValue('editPublicRecordDescription', entry.description);
            setFieldValue('editPublicRecordNotes', entry.notes);
            setRequired('editPublicRecordSubjectName', true);
            setRequired('editPublicRecordType', true);
            break;
    }

    fieldsToShow.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'block';
        }
    });

    populateCustomTabAssignmentCheckboxes(entry.customTabs || []);

    showModal('editEntryModal');
}

/**
 * Populates checkboxes for assigning entries to custom tabs in the Edit Entry modal.
 * @param {string[]} assignedTabIds - IDs of custom tabs currently assigned to the entry.
 */
function populateCustomTabAssignmentCheckboxes(assignedTabIds) {
    const container = document.getElementById('assignCustomTabsCheckboxes');
    container.innerHTML = '';

    if (appState.customTabs.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 10px;">No custom vaults created yet.</p>';
        document.getElementById('assignCustomTabs').style.display = 'none';
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

/**
 * Handles the form submission for editing an existing entry.
 * Updates the entry data and its custom tab assignments.
 * @param {Event} e - The submit event.
 */
async function handleEditEntry(e) {
    e.preventDefault();
    if (appState.readOnlyMode) {
        showToast("Cannot edit entries in read-only shared view.", "warning");
        return;
    }

    const entryId = document.getElementById('editEntryId').value;
    const entryType = document.getElementById('editEntryType').value;

    let entryToEdit = null;
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
        case 'audio': entryArray = appState.audioEntries; break;
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
        entryToEdit = entryArray.find(t => t.id === entryId);
    }

    if (!entryToEdit) {
        showToast('Error: Entry not found for editing.', 'error');
        return;
    }

    const customMetadata = [];
    document.querySelectorAll('#editCustomMetadataEntries .metadata-entry').forEach(row => {
        const keyInput = row.querySelector('.metadata-key');
        const valueInput = row.querySelector('.metadata-value');
        const key = keyInput ? keyInput.value.trim() : '';
        const value = valueInput ? valueInput.value.trim() : '';
        if (key && value) {
            customMetadata.push({ key, value });
        }
    });
    entryToEdit.metadata = customMetadata.length > 0 ? customMetadata : undefined;

    const entrySourceInput = document.getElementById('editEntrySource');
    entryToEdit.source = entrySourceInput ? entrySourceInput.value.trim() || undefined : undefined;


    switch (entryType) {
        case 'tool':
            entryToEdit.name = document.getElementById('editToolName').value.trim();
            entryToEdit.url = document.getElementById('editToolUrl').value.trim();
            let editToolCategory = document.getElementById('editToolCategory').value;
            const editNewCategoryInput = document.getElementById('editNewCategoryInput').value.trim();
            entryToEdit.description = document.getElementById('editToolDescription').value.trim();
            entryToEdit.tags = document.getElementById('editToolTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
            entryToEdit.notes = document.getElementById('editToolInvestigationNotes').value.trim();

            const editedIntelligenceVaultCategories = Array.from(document.querySelectorAll('#intelligenceVaultCategoriesCheckboxesEditTool input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
            entryToEdit.intelligenceVaultCategories = editedIntelligenceVaultCategories;

            if (editToolCategory === 'custom') {
                if (!editNewCategoryInput) { showToast('Please enter a custom category name.', 'error'); return; }
                editToolCategory = editNewCategoryInput.toLowerCase();
            }
            entryToEdit.category = editToolCategory;
            entryToEdit.favicon = `https://www.google.com/s2/favicons?domain=${new URL(entryToEdit.url).hostname}`;
            break;
        case 'email':
            entryToEdit.email = document.getElementById('editEmailAddress').value.trim();
            entryToEdit.linkedPlatforms = document.getElementById('editEmailLinkedPlatforms').value.split(',').map(p => p.trim()).filter(p => p);
            entryToEdit.breachResults = document.getElementById('editEmailBreachResults').value.trim();
            entryToEdit.description = document.getElementById('editEmailDescription').value.trim();
            entryToEdit.notes = document.getElementById('editEmailNotes').value.trim();
            break;
        case 'phone':
            entryToEdit.number = document.getElementById('editPhoneNumber').value.trim();
            entryToEdit.phoneType = document.getElementById('editPhoneType').value;
            entryToEdit.location = document.getElementById('editPhoneLocation').value.trim();
            entryToEdit.description = document.getElementById('editPhoneDescription').value.trim();
            entryToEdit.notes = document.getElementById('editPhoneNotes').value.trim();
            break;
        case 'crypto':
            entryToEdit.address = document.getElementById('editCryptoAddress').value.trim();
            entryToEdit.txid = document.getElementById('editCryptoTxid').value.trim();
            entryToEdit.amount = parseFloat(document.getElementById('editCryptoAmount').value);
            entryToEdit.source = document.getElementById('editCryptoSource').value.trim();
            entryToEdit.tags = document.getElementById('editCryptoTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
            entryToEdit.description = document.getElementById('editCryptoDescription').value.trim();
            entryToEdit.notes = document.getElementById('editCryptoNotes').value.trim();
            break;
        case 'location':
            entryToEdit.name = document.getElementById('editLocationName').value.trim();
            entryToEdit.coordinates = document.getElementById('editLocationCoordinates').value.trim();
            entryToEdit.mapLink = document.getElementById('editLocationMapLink').value.trim();
            entryToEdit.ipGeoIntel = document.getElementById('editLocationIpGeoIntel').value.trim();
            entryToEdit.description = document.getElementById('editLocationDescription').value.trim();
            entryToEdit.notes = document.getElementById('editLocationNotes').value.trim();
            break;
        case 'link':
            entryToEdit.url = document.getElementById('editLinkUrl').value.trim();
            entryToEdit.platform = document.getElementById('editLinkPlatform').value.trim();
            entryToEdit.tags = document.getElementById('editLinkTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
            entryToEdit.description = document.getElementById('editLinkDescription').value.trim();
            entryToEdit.notes = document.getElementById('editLinkNotes').value.trim();
            break;
        case 'media':
            entryToEdit.title = document.getElementById('editMediaTitle').value.trim();
            entryToEdit.mediaType = document.getElementById('editMediaType').value;
            const editMediaFile = document.getElementById('editMediaFile').files[0];
            if (editMediaFile) {
                entryToEdit.base64Data = await readFileAsBase64(editMediaFile);
            }
            entryToEdit.description = document.getElementById('editMediaDescription').value.trim();
            entryToEdit.notes = document.getElementById('editMediaNotes').value.trim();
            break;
        case 'password':
            entryToEdit.service = document.getElementById('editPasswordService').value.trim();
            entryToEdit.username = document.getElementById('editPasswordUsername').value.trim();
            entryToEdit.password = document.getElementById('editPasswordValue').value.trim();
            entryToEdit.strength = document.getElementById('editPasswordStrength').value.trim();
            entryToEdit.description = document.getElementById('editPasswordDescription').value.trim();
            entryToEdit.notes = document.getElementById('editPasswordNotes').value.trim();
            break;
        case 'keyword':
            entryToEdit.value = document.getElementById('editKeywordValue').value.trim();
            entryToEdit.context = document.getElementById('editKeywordContext').value.trim();
            entryToEdit.description = document.getElementById('editKeywordDescription').value.trim();
            entryToEdit.notes = document.getElementById('editKeywordNotes').value.trim();
            break;
        case 'social':
            entryToEdit.platform = document.getElementById('editSocialPlatform').value.trim();
            entryToEdit.url = document.getElementById('editSocialUrl').value.trim();
            entryToEdit.username = document.getElementById('editSocialUsername').value.trim();
            entryToEdit.followCounts = document.getElementById('editSocialFollowCounts').value.trim();
            entryToEdit.description = document.getElementById('editSocialDescription').value.trim();
            entryToEdit.notes = document.getElementById('editSocialNotes').value.trim();
            break;
        case 'domain':
            entryToEdit.value = document.getElementById('editDomainValue').value.trim();
            entryToEdit.domainType = document.getElementById('editDomainType').value;
            entryToEdit.registrar = document.getElementById('editDomainRegistrar').value.trim();
            entryToEdit.location = document.getElementById('editDomainLocation').value.trim();
            entryToEdit.status = document.getElementById('editDomainStatus').value;
            entryToEdit.whois = document.getElementById('editDomainWhois').value.trim();
            entryToEdit.dns = document.getElementById('editDomainDns').value.trim();
            entryToEdit.tags = document.getElementById('editDomainTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
            entryToEdit.description = document.getElementById('editDomainDescription').value.trim();
            entryToEdit.notes = document.getElementById('editDomainNotes').value.trim();
            break;
        case 'username':
            entryToEdit.value = document.getElementById('editUsernameValue').value.trim();
            entryToEdit.platformsFound = document.getElementById('editUsernamePlatforms').value.trim();
            entryToEdit.emails = document.getElementById('editUsernameEmails').value.trim();
            entryToEdit.realName = document.getElementById('editUsernameRealName').value.trim();
            entryToEdit.activity = document.getElementById('editUsernameActivity').value;
            entryToEdit.description = document.getElementById('editUsernameDescription').value.trim();
            entryToEdit.notes = document.getElementById('editUsernameNotes').value.trim();
            break;
        case 'threat':
            entryToEdit.threatType = document.getElementById('editThreatType').value;
            entryToEdit.name = document.getElementById('editThreatName').value.trim();
            entryToEdit.severity = document.getElementById('editThreatSeverity').value;
            entryToEdit.iocs = document.getElementById('editThreatIocs').value.trim();
            entryToEdit.targets = document.getElementById('editThreatTargets').value.trim();
            entryToEdit.attribution = document.getElementById('editThreatAttribution').value.trim();
            entryToEdit.description = document.getElementById('editThreatDescription').value.trim();
            entryToEdit.source = document.getElementById('editThreatSource').value.trim();
            entryToEdit.notes = document.getElementById('editThreatNotes').value.trim();
            break;
        case 'vulnerability':
            entryToEdit.cve = document.getElementById('editVulnCve').value.trim();
            entryToEdit.cvss = parseFloat(document.getElementById('editVulnCvss').value);
            entryToEdit.software = document.getElementById('editVulnSoftware').value.trim();
            entryToEdit.vulnType = document.getElementById('editVulnType').value;
            entryToEdit.exploit = document.getElementById('editVulnExploit').value;
            entryToEdit.description = document.getElementById('editVulnDescription').value.trim();
            entryToEdit.mitigation = document.getElementById('editVulnMitigation').value.trim();
            entryToEdit.notes = document.getElementById('editVulnNotes').value.trim();
            break;
        case 'malware':
            entryToEdit.filename = document.getElementById('editMalwareFilename').value.trim();
            entryToEdit.hash = document.getElementById('editMalwareHash').value.trim();
            entryToEdit.fileType = document.getElementById('editMalwareType').value;
            entryToEdit.family = document.getElementById('editMalwareFamily').value.trim();
            entryToEdit.detection = document.getElementById('editMalwareDetection').value.trim();
            entryToEdit.behavior = document.getElementById('editMalwareBehavior').value.trim();
            entryToEdit.malwareSource = document.getElementById('editMalwareSource').value.trim();
            entryToEdit.tools = document.getElementById('editMalwareTools').value.trim();
            entryToEdit.notes = document.getElementById('editMalwareNotes').value.trim();
            break;
        case 'breach':
            entryToEdit.company = document.getElementById('editBreachCompany').value.trim();
            entryToEdit.date = document.getElementById('editBreachDate').value;
            entryToEdit.records = parseInt(document.getElementById('editBreachRecords').value);
            entryToEdit.dataTypes = document.getElementById('editBreachDataTypes').value.trim();
            entryToEdit.vector = document.getElementById('editBreachVector').value;
            entryToEdit.status = document.getElementById('editBreachStatus').value;
            entryToEdit.source = document.getElementById('editBreachSource').value.trim();
            entryToEdit.description = document.getElementById('editBreachDescription').value.trim();
            entryToEdit.notes = document.getElementById('editBreachNotes').value.trim();
            break;
        case 'credential':
            entryToEdit.credentialType = document.getElementById('editCredentialType').value;
            entryToEdit.credentialValue = document.getElementById('editCredentialValue').value.trim();
            entryToEdit.credentialService = document.getElementById('editCredentialService').value.trim();
            entryToEdit.breachSource = document.getElementById('editCredentialBreachSource').value.trim();
            entryToEdit.dateFound = document.getElementById('editCredentialDateFound').value;
            entryToEdit.description = document.getElementById('editCredentialDescription').value.trim();
            entryToEdit.notes = document.getElementById('editCredentialNotes').value.trim();
            break;
        case 'forum':
            entryToEdit.forumName = document.getElementById('editForumName').value.trim();
            entryToEdit.forumUrl = document.getElementById('editForumUrl').value.trim();
            entryToEdit.forumType = document.getElementById('editForumType').value;
            entryToEdit.forumStatus = document.getElementById('editForumStatus').value;
            entryToEdit.forumLanguage = document.getElementById('editForumLanguage').value.trim();
            entryToEdit.description = document.getElementById('editForumDescription').value.trim();
            entryToEdit.notes = document.getElementById('editForumNotes').value.trim();
            break;
        case 'vendor':
            entryToEdit.vendorAlias = document.getElementById('editVendorAlias').value.trim();
            entryToEdit.vendorPlatforms = document.getElementById('editVendorPlatforms').value.trim();
            entryToEdit.vendorProducts = document.getElementById('editVendorProducts').value.trim();
            entryToEdit.vendorReputation = document.getElementById('editVendorReputation').value.trim();
            entryToEdit.description = document.getElementById('editVendorDescription').value.trim();
            entryToEdit.notes = document.getElementById('editVendorNotes').value.trim();
            break;
        case 'telegram':
            entryToEdit.name = document.getElementById('editTelegramName').value.trim();
            entryToEdit.url = document.getElementById('editTelegramUrl').value.trim();
            entryToEdit.telegramType = document.getElementById('editTelegramType').value;
            entryToEdit.subscribers = parseInt(document.getElementById('editTelegramSubscribers').value);
            entryToEdit.language = document.getElementById('editTelegramLanguage').value.trim();
            entryToEdit.activity = document.getElementById('editTelegramActivity').value;
            entryToEdit.content = document.getElementById('editTelegramContent').value.trim();
            entryToEdit.admin = document.getElementById('editTelegramAdmin').value.trim();
            entryToEdit.tags = document.getElementById('editTelegramTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
            entryToEdit.notes = document.getElementById('editTelegramNotes').value.trim();
            break;
        case 'paste':
            entryToEdit.url = document.getElementById('editPasteUrl').value.trim();
            entryToEdit.sourceSite = document.getElementById('editPasteSourceSite').value.trim();
            entryToEdit.contentSummary = document.getElementById('editPasteContentSummary').value.trim();
            entryToEdit.keywords = document.getElementById('editPasteKeywords').value.trim();
            entryToEdit.description = document.getElementById('editPasteDescription').value.trim();
            entryToEdit.notes = document.getElementById('editPasteNotes').value.trim();
            break;
        case 'document':
            entryToEdit.title = document.getElementById('editDocumentTitle').value.trim();
            entryToEdit.fileType = document.getElementById('editDocumentFileType').value.trim();
            entryToEdit.hash = document.getElementById('editDocumentHash').value.trim();
            entryToEdit.contentSummary = document.getElementById('editDocumentContentSummary').value.trim();
            entryToEdit.source = document.getElementById('editDocumentSource').value.trim();
            entryToEdit.description = document.getElementById('editDocumentDescription').value.trim();
            entryToEdit.notes = document.getElementById('editDocumentNotes').value.trim();
            break;
        case 'network':
            entryToEdit.subject = document.getElementById('editNetworkSubject').value.trim();
            entryToEdit.networkType = document.getElementById('editNetworkType').value;
            entryToEdit.findings = document.getElementById('editNetworkFindings').value.trim();
            entryToEdit.associatedIpsDomains = document.getElementById('editNetworkAssociated').value.trim();
            entryToEdit.toolsUsed = document.getElementById('editNetworkTools').value.trim();
            entryToEdit.description = document.getElementById('editNetworkDescription').value.trim();
            entryToEdit.notes = document.getElementById('editNetworkNotes').value.trim();
            break;
        case 'metadata':
            entryToEdit.title = document.getElementById('editMetadataTitle').value.trim();
            entryToEdit.description = document.getElementById('editMetadataDescription').value.trim();
            entryToEdit.fileSource = document.getElementById('editMetadataFileSource').value.trim();
            entryToEdit.notes = document.getElementById('editMetadataNotes').value.trim();
            break;
        case 'archive':
            entryToEdit.originalUrl = document.getElementById('editArchiveOriginalUrl').value.trim();
            entryToEdit.url = document.getElementById('editArchiveUrl').value.trim();
            entryToEdit.service = document.getElementById('editArchiveService').value.trim();
            entryToEdit.timestamp = document.getElementById('editArchiveTimestamp').value ? new Date(document.getElementById('editArchiveTimestamp').value).getTime() : null;
            entryToEdit.contentSummary = document.getElementById('editArchiveContentSummary').value.trim();
            entryToEdit.description = document.getElementById('editArchiveDescription').value.trim();
            entryToEdit.notes = document.getElementById('editArchiveNotes').value.trim();
            break;
        case 'messaging':
            entryToEdit.messagingApp = document.getElementById('editMessagingApp').value;
            entryToEdit.username = document.getElementById('editMessagingUsername').value.trim();
            entryToEdit.chatId = document.getElementById('editMessagingChatId').value.trim();
            entryToEdit.content = document.getElementById('editMessagingContent').value.trim();
            entryToEdit.description = document.getElementById('editMessagingDescription').value.trim();
            entryToEdit.notes = document.getElementById('editMessagingNotes').value.trim();
            break;
        case 'dating':
            entryToEdit.platform = document.getElementById('editDatingPlatform').value;
            entryToEdit.username = document.getElementById('editDatingUsername').value.trim();
            entryToEdit.displayName = document.getElementById('editDatingDisplayName').value.trim();
            entryToEdit.age = parseInt(document.getElementById('editDatingAge').value);
            entryToEdit.location = document.getElementById('editDatingLocation').value.trim();
            entryToEdit.photos = document.getElementById('editDatingPhotos').value.trim();
            entryToEdit.bio = document.getElementById('editDatingBio').value.trim();
            entryToEdit.verified = document.getElementById('editDatingVerified').value;
            entryToEdit.suspicious = document.getElementById('editDatingSuspicious').value.trim();
            entryToEdit.notes = document.getElementById('editDatingNotes').value.trim();
            break;
        case 'audio':
            entryToEdit.title = document.getElementById('editAudioTitle').value.trim();
            entryToEdit.format = document.getElementById('editAudioFormat').value;
            entryToEdit.duration = document.getElementById('editAudioDuration').value.trim();
            entryToEdit.quality = document.getElementById('editAudioQuality').value;
            entryToEdit.language = document.getElementById('editAudioLanguage').value.trim();
            entryToEdit.transcript = document.getElementById('editAudioTranscript').value.trim();
            entryToEdit.speakers = document.getElementById('editAudioSpeakers').value.trim();
            entryToEdit.background = document.getElementById('editAudioBackground').value.trim();
            entryToEdit.tools = document.getElementById('editAudioTools').value.trim();
            entryToEdit.description = document.getElementById('editAudioDescription').value.trim();
            entryToEdit.notes = document.getElementById('editAudioNotes').value.trim();
            const editAudioFile = document.getElementById('editAudioFile').files[0];
            if (editAudioFile) {
                entryToEdit.base64Data = await readFileAsBase64(editAudioFile);
            }
            break;
        case 'facial':
            entryToEdit.subject = document.getElementById('editFacialSubject').value.trim();
            entryToEdit.sourceDescription = document.getElementById('editFacialSourceDescription').value.trim();
            entryToEdit.identifiedProfiles = document.getElementById('editFacialIdentifiedProfiles').value.trim();
            entryToEdit.confidence = document.getElementById('editFacialConfidence').value.trim();
            entryToEdit.toolsUsed = document.getElementById('editFacialToolsUsed').value.trim();
            entryToEdit.description = document.getElementById('editFacialDescription').value.trim();
            entryToEdit.notes = document.getElementById('editFacialNotes').value.trim();
            break;
        case 'persona':
            entryToEdit.name = document.getElementById('editPersonaName').value.trim();
            entryToEdit.realName = document.getElementById('editPersonaRealName').value.trim();
            entryToEdit.associatedAccounts = document.getElementById('editPersonaAssociatedAccounts').value.trim();
            entryToEdit.bio = document.getElementById('editPersonaBio').value.trim();
            entryToEdit.platformsUsed = document.getElementById('editPersonaPlatforms').value.trim();
            entryToEdit.origin = document.getElementById('editPersonaOrigin').value.trim();
            entryToEdit.notes = document.getElementById('editPersonaNotes').value.trim();
            break;
        case 'vpn':
            entryToEdit.name = document.getElementById('editVpnName').value.trim();
            entryToEdit.vpnType = document.getElementById('editVpnType').value;
            entryToEdit.jurisdiction = document.getElementById('editVpnJurisdiction').value.trim();
            entryToEdit.logs = document.getElementById('editVpnLogs').value;
            entryToEdit.payment = document.getElementById('editVpnPayment').value.trim();
            entryToEdit.locations = document.getElementById('editVpnLocations').value.trim();
            entryToEdit.issues = document.getElementById('editVpnIssues').value.trim();
            entryToEdit.useCase = document.getElementById('editVpnUseCase').value;
            entryToEdit.description = document.getElementById('editVpnDescription').value.trim();
            entryToEdit.notes = document.getElementById('editVpnNotes').value.trim();
            break;
        case 'honeypot':
            entryToEdit.honeypotType = document.getElementById('editHoneypotType').value;
            entryToEdit.location = document.getElementById('editHoneypotLocation').value.trim();
            entryToEdit.purpose = document.getElementById('editHoneypotPurpose').value.trim();
            entryToEdit.dataSummary = document.getElementById('editHoneypotDataSummary').value.trim();
            entryToEdit.alerts = document.getElementById('editHoneypotAlerts').value.trim();
            entryToEdit.description = document.getElementById('editHoneypotDescription').value.trim();
            entryToEdit.notes = document.getElementById('editHoneypotNotes').value.trim();
            break;
        case 'exploit':
            entryToEdit.name = document.getElementById('editExploitName').value.trim();
            entryToEdit.targetVuln = document.getElementById('editExploitTargetVuln').value.trim();
            entryToEdit.exploitType = document.getElementById('editExploitType').value;
            entryToEdit.marketSource = document.getElementById('editExploitMarketSource').value.trim();
            entryToEdit.price = document.getElementById('editExploitPrice').value.trim();
            entryToEdit.description = document.getElementById('editExploitDescription').value.trim();
            entryToEdit.notes = document.getElementById('editExploitNotes').value.trim();
            break;
        case 'publicrecord':
            entryToEdit.recordType = document.getElementById('editPublicRecordType').value;
            entryToEdit.subjectName = document.getElementById('editPublicRecordSubjectName').value.trim();
            entryToEdit.refId = document.getElementById('editPublicRecordRefId').value.trim();
            entryToEdit.jurisdiction = document.getElementById('editPublicRecordJurisdiction').value.trim();
            entryToEdit.date = document.getElementById('editPublicRecordDate').value;
            entryToEdit.summary = document.getElementById('editPublicRecordSummary').value.trim();
            entryToEdit.sourceUrl = document.getElementById('editPublicRecordSourceUrl').value.trim();
            entryToEdit.description = document.getElementById('editPublicRecordDescription').value.trim();
            entryToEdit.notes = document.getElementById('editPublicRecordNotes').value.trim();
            break;
    }

    const assignedCustomTabs = Array.from(document.querySelectorAll('#assignCustomTabsCheckboxes input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);

    appState.customTabs.forEach(tab => {
        tab.toolIds = tab.toolIds.filter(id => id !== entryId);
    });
    entryToEdit.customTabs = [];

    assignedCustomTabs.forEach(tabId => {
        const tab = appState.customTabs.find(t => t.id === tabId);
        if (tab) {
            tab.toolIds.push(entryId);
            entryToEdit.customTabs.push(tabId);
        }
    });

    hideModal('editEntryModal');
    showToast('Entry updated successfully!');
    updateStats();
    populateCategoryFilter();
    renderIntelligenceEntries();
    renderCustomTabs();
    saveState();
}

/**
 * Adds a new row for custom metadata key-value pairs in a form.
 * @param {string} formType - 'add' for the Add Entry modal, 'edit' for the Edit Entry modal.
 * @param {string} [key=''] - Initial key for the metadata field.
 * @param {string} [value=''] - Initial value for the metadata field.
 */
function addMetadataField(formType, key = '', value = '') {
    const containerId = formType === 'add' ? 'customMetadataEntries' : 'editCustomMetadataEntries';
    const container = document.getElementById(containerId);
    const newRow = document.createElement('div');
    newRow.classList.add('form-group', 'metadata-entry');
    newRow.innerHTML = `
        <input type="text" class="metadata-key" name="${formType}_metadata_key_${Date.now()}" placeholder="Key" value="${key}" required>
        <input type="text" class="metadata-value" name="${formType}_metadata_value_${Date.now()}" placeholder="Value" value="${value}" required>
        <button type="button" class="remove-metadata-btn"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(newRow);
}

/**
 * Helper function to get the primary display name for an entry, for sorting/listing.
 * @param {object} entry - The entry object.
 * @returns {string} The primary display name.
 */
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

/**
 * Helper function to get the Font Awesome icon class for a given entry type.
 * @param {string} type - The type of the entry.
 * @returns {string} The Font Awesome icon class.
 */
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

/**
 * Populates a grid with available Font Awesome icons for selection.
 * @param {string} containerId - The ID of the HTML element to populate.
 * @param {string} inputId - The ID of the input field to update with the selected icon class.
 * @param {string} [selectedIcon=''] - The icon class that should be initially selected.
 */
function populateIconPicker(containerId, inputId, selectedIcon = '') {
    const container = document.getElementById(containerId);
    if (!container) return; // Safety check
    container.innerHTML = '';

    availableIcons.forEach(iconClass => {
        const iconItem = document.createElement('div');
        iconItem.classList.add('icon-picker-item');
        iconItem.dataset.iconClass = iconClass;
        iconItem.innerHTML = `<i class="${iconClass}"></i>`;
        if (iconClass === selectedIcon) {
            iconItem.classList.add('selected');
        }
        container.appendChild(iconItem);
    });

    if (selectedIcon && !availableIcons.includes(selectedIcon)) {
        const customIconItem = document.createElement('div');
        customIconItem.classList.add('icon-picker-item', 'selected');
        customIconItem.dataset.iconClass = selectedIcon;
        customIconItem.innerHTML = `<i class="${selectedIcon}"></i>`;
        container.prepend(customIconItem);
    }
}

/**
 * Populates a grid with available color options for selection.
 * @param {string} containerId - The ID of the HTML element to populate.
 * @param {string} inputId - The ID of the hidden input field to update with the selected color value.
 * @param {string} [selectedColor=''] - The color value that should be initially selected.
 */
function populateColorPicker(containerId, inputId, selectedColor = '') {
    const container = document.getElementById(containerId);
    if (!container) return; // Safety check
    container.innerHTML = '';

    availableColors.forEach(colorValue => {
        const colorItem = document.createElement('div');
        colorItem.classList.add('color-picker-item');
        colorItem.dataset.colorValue = colorValue;
        colorItem.style.backgroundColor = colorValue;
        if (colorValue === selectedColor) {
            colorItem.classList.add('selected');
        }
        container.appendChild(colorItem);
    });

    if (selectedColor && !availableColors.includes(selectedColor)) {
        const customColorItem = document.createElement('div');
        customColorItem.classList.add('color-picker-item', 'selected');
        customColorItem.dataset.colorValue = selectedColor;
        customColorItem.style.backgroundColor = selectedColor;
        container.prepend(customColorItem);
    }
}