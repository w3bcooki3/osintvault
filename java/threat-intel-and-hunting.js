// threat-intel-and-hunting.js

// --- Threat Intelligence (Threats Tab) Functions ---

/**
 * Loads and displays mock threat intelligence entries.
 */
function loadThreats() {
    const threatsList = document.getElementById('threatsList');
    if (!threatsList) return; // Safety check

    const mockThreats = [
        {
            id: 1,
            title: 'New Phishing Campaign Detected',
            description: 'Targeting financial institutions with COVID-19 themed lures. Be cautious of emails resembling official health advisories.',
            severity: 'high',
            tags: ['phishing', 'covid-19', 'financial', 'email'],
            timestamp: new Date(Date.now() - 3600000)
        },
        {
            id: 2,
            title: 'Malware Sample Analysis: Xylos Variant',
            description: 'New variant of banking trojan "Xylos" discovered in the wild. It employs obfuscation techniques and targets online banking portals. Update your antivirus signatures immediately.',
            severity: 'medium',
            tags: ['malware', 'banking', 'trojan', 'xylos', 'analysis'],
            timestamp: new Date(Date.now() - 7200000)
        },
        {
            id: 3,
            title: 'Data Breach Alert: Gaming Platform',
            description: 'Credentials leak detected on underground forums originating from a popular gaming platform. Users are advised to change passwords and enable multi-factor authentication.',
            severity: 'high',
            tags: ['breach', 'credentials', 'darkweb', 'gaming'],
            timestamp: new Date(Date.now() - 10800000)
        },
        {
            id: 4,
            title: 'Ransomware Attack on Healthcare Provider',
            description: 'A critical ransomware attack impacted a regional healthcare provider, compromising patient data. Incident response teams are engaged, and data recovery efforts are underway. Backups are crucial!',
            severity: 'high',
            tags: ['ransomware', 'healthcare', 'data-loss', 'cyberattack'],
            timestamp: new Date(Date.now() - 86400000 * 2)
        },
        {
            id: 5,
            title: 'Zero-Day Exploit in Popular Web Server',
            description: 'A zero-day vulnerability has been identified in a widely used web server software. Patches are not yet available. Organizations are advised to implement temporary mitigation strategies and monitor their logs closely.',
            severity: 'medium',
            tags: ['zero-day', 'vulnerability', 'web-server', 'exploit'],
            timestamp: new Date(Date.now() - 86400000 * 5)
        }
    ];

    mockThreats.sort((a, b) => b.timestamp - a.timestamp);

    threatsList.innerHTML = mockThreats.map(threat => `
        <div class="threat-item">
            <div class="threat-header">
                <h4>${threat.title}</h4> <div class="threat-level threat-${threat.severity}">${threat.severity}</div> </div>
            <p>${threat.description}</p> <div class="threat-tags">
                ${threat.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="threat-time">${formatTime(threat.timestamp)}</div>
        </div>
    `).join('');
}


// --- Cyber Threat Hunting Toolkit Functions ---

/**
 * Initializes the Threat Hunting Toolkit tab.
 * Populates the language filter and renders the scripts.
 */
function initThreatHuntingToolkit() {
    populateScriptLanguageFilter();
    renderThreatHuntingScripts();
    switchThSubTab(appState.currentThSubTab);
}

/**
 * Switches between Threat Hunting sub-tabs (Script Library, Dashboards, Playbooks).
 * @param {string} subtabName - The ID of the subtab to activate.
 */
function switchThSubTab(subtabName) {
    appState.currentThSubTab = subtabName;

    document.querySelectorAll('.th-subtab').forEach(tab => {
        tab.classList.remove('active');
    });
    const targetSubTabBtn = document.querySelector(`.th-subtab[data-th-subtab="${subtabName}"]`);
    if (targetSubTabBtn) {
        targetSubTabBtn.classList.add('active');
    }

    document.querySelectorAll('.th-subtab-content').forEach(content => {
        content.style.display = 'none';
    });
    const targetContent = document.getElementById(`${subtabName}-content`);
    if (targetContent) {
        targetContent.style.display = 'block';
    }

    if (subtabName === 'script-library') {
        renderThreatHuntingScripts();
    }
    saveState();
}

/**
 * Populates the language filter dropdown for threat hunting scripts.
 */
function populateScriptLanguageFilter() {
    const languageFilterSelect = document.getElementById('scriptLanguageFilter');
    if (!languageFilterSelect) return;

    const existingLanguages = new Set(appState.threatHuntingScripts.map(script => script.language.toLowerCase()));

    const defaultLanguages = ['powershell', 'python', 'bash', 'cmd', 'c#', 'go', 'other'];

    const allLanguages = new Set([...defaultLanguages.map(lang => lang.toLowerCase()), ...Array.from(existingLanguages)]);

    languageFilterSelect.innerHTML = '<option value="">All Languages</option>';

    Array.from(allLanguages)
        .sort((a, b) => a.localeCompare(b))
        .forEach(language => {
            const option = document.createElement('option');
            option.value = language;
            option.textContent = language.charAt(0).toUpperCase() + language.slice(1);
            languageFilterSelect.appendChild(option);
        });

    languageFilterSelect.value = appState.scriptFilters.language;
}

/**
 * Renders the list of threat hunting scripts based on current filters.
 */
function renderThreatHuntingScripts() {
    const scriptLibraryGrid = document.getElementById('scriptLibraryGrid');
    const emptyState = document.getElementById('emptyScriptLibraryState');

    if (!scriptLibraryGrid || !emptyState) return;

    const filteredScripts = filterThreatHuntingScripts();

    if (filteredScripts.length === 0) {
        emptyState.style.display = 'block';
        scriptLibraryGrid.style.display = 'none';
        if (appState.scriptFilters.search || appState.scriptFilters.language) {
            emptyState.innerHTML = `<i class="fas fa-search"></i><h3>No matching scripts found</h3><p>Adjust your search or filters.</p>`;
        } else {
            emptyState.innerHTML = `<i class="fas fa-code"></i><h3>No Scripts Found</h3><p>Add your first threat hunting script to get started!</p><button class="btn btn-primary" id="addScriptEmptyStateBtn"><i class="fas fa-plus"></i> Add First Script</button>`;
            document.getElementById('addScriptEmptyStateBtn')?.addEventListener('click', () => openAddEditScriptModal('add'));
        }
    } else {
        emptyState.style.display = 'none';
        scriptLibraryGrid.style.display = 'grid';
        scriptLibraryGrid.innerHTML = filteredScripts.map(script => createScriptCard(script)).join('');
    }
    saveState();
}

/**
 * Filters the list of threat hunting scripts based on search term and language.
 * @returns {Array<object>} The filtered array of script objects.
 */
function filterThreatHuntingScripts() {
    let filtered = [...appState.threatHuntingScripts];

    const searchTerm = appState.scriptFilters.search.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(script => {
            const searchFields = [
                script.name, script.description, script.language, script.code,
                script.tags ? script.tags.join(' ') : ''
            ].map(field => String(field || '').toLowerCase());
            return searchFields.some(field => field.includes(searchTerm));
        });
    }

    const selectedLanguage = appState.scriptFilters.language;
    if (selectedLanguage) {
        filtered = filtered.filter(script => script.language.toLowerCase() === selectedLanguage.toLowerCase());
    }

    filtered.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));

    return filtered;
}

/**
 * Creates the HTML string for a single threat hunting script card.
 * @param {object} script - The script object.
 * @returns {string} The HTML string for the script card.
 */
function createScriptCard(script) {
    const languageIcon = {
        'powershell': 'fab fa-windows',
        'python': 'fab fa-python',
        'bash': 'fas fa-terminal',
        'cmd': 'fas fa-terminal',
        'c#': 'fas fa-code',
        'go': 'fab fa-gofore',
        'other': 'fas fa-file-code'
    }[script.language.toLowerCase()] || 'fas fa-file-code';

    return `
        <div class="tool-card" data-script-id="${script.id}" data-script-language="${script.language}">
            <div class="tool-header">
                <div>
                    <div class="tool-title">
                        <i class="${languageIcon}" style="color: var(--accent); margin-right: 8px;"></i>
                        <span>${script.name}</span>
                        <span class="script-language">${script.language}</span>
                    </div>
                    <div class="tool-url" style="display: none;"></div>
                </div>
                <div class="tool-actions">
                    <button class="action-btn" data-action="view-code" title="View Script Code">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" data-action="edit-script" title="Edit Script">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn" data-action="copy-code" title="Copy Script Code">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="action-btn" data-action="delete-script" title="Delete Script">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 10px;">
                ${script.description || 'No description available.'}
            </p>
            <div class="tool-tags">
                ${script.tags ? script.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
            </div>
        </div>
    `;
}

/**
 * Opens the 'Add/Edit Script' modal, populating it for adding or editing.
 * @param {string} mode - 'add' to add a new script, 'edit' to edit an existing one.
 * @param {string} [scriptId=null] - The ID of the script to edit (required for 'edit' mode).
 */
function openAddEditScriptModal(mode, scriptId = null) {
    if (appState.readOnlyMode) {
        showToast("Cannot add/edit scripts in read-only shared view.", "warning");
        return;
    }

    const form = document.getElementById('addEditScriptForm');
    if (form) form.reset();
    const scriptIdInput = document.getElementById('scriptId');
    if (scriptIdInput) scriptIdInput.value = '';

    const addEditScriptModalTitle = document.getElementById('addEditScriptModalTitle');
    const saveScriptBtn = document.getElementById('saveScriptBtn');
    const scriptLanguageSelect = document.getElementById('scriptLanguage');

    if (mode === 'add') {
        if (addEditScriptModalTitle) addEditScriptModalTitle.textContent = 'Add New Script';
        if (saveScriptBtn) {
            saveScriptBtn.textContent = 'Save Script';
            saveScriptBtn.dataset.mode = 'add';
        }
        if (scriptLanguageSelect) scriptLanguageSelect.value = '';
    } else if (mode === 'edit' && scriptId) {
        const scriptToEdit = appState.threatHuntingScripts.find(s => s.id === scriptId);
        if (!scriptToEdit) {
            showToast("Script not found for editing.", "error");
            return;
        }

        if (addEditScriptModalTitle) addEditScriptModalTitle.textContent = 'Edit Script';
        if (saveScriptBtn) {
            saveScriptBtn.textContent = 'Save Changes';
            saveScriptBtn.dataset.mode = 'edit';
        }

        if (scriptIdInput) scriptIdInput.value = scriptToEdit.id;
        if (document.getElementById('scriptName')) document.getElementById('scriptName').value = scriptToEdit.name;
        if (document.getElementById('scriptDescription')) document.getElementById('scriptDescription').value = scriptToEdit.description;
        if (scriptLanguageSelect) scriptLanguageSelect.value = scriptToEdit.language;
        if (document.getElementById('scriptCode')) document.getElementById('scriptCode').value = scriptToEdit.code;
        if (document.getElementById('scriptTags')) document.getElementById('scriptTags').value = scriptToEdit.tags ? scriptToEdit.tags.join(', ') : '';
    }
    showModal('addEditScriptModal');
}

/**
 * Handles the form submission for adding or editing a threat hunting script.
 * @param {Event} e - The submit event.
 */
function handleAddEditScriptFormSubmit(e) {
    e.preventDefault();
    if (appState.readOnlyMode) {
        showToast("Cannot save scripts in read-only shared view.", "warning");
        return;
    }

    const saveScriptBtn = document.getElementById('saveScriptBtn');
    const mode = saveScriptBtn ? saveScriptBtn.dataset.mode : null;
    const scriptId = document.getElementById('scriptId')?.value;

    const name = document.getElementById('scriptName')?.value.trim();
    const description = document.getElementById('scriptDescription')?.value.trim();
    const language = document.getElementById('scriptLanguage')?.value;
    const code = document.getElementById('scriptCode')?.value.trim();
    const tags = (document.getElementById('scriptTags')?.value || '').split(',').map(tag => tag.trim()).filter(tag => tag);

    if (!name || !language || !code) {
        showToast('Please fill in all required fields (Name, Language, Code).', 'error');
        return;
    }

    const newScript = {
        id: mode === 'add' ? generateId() : scriptId, // Assuming generateId is available
        name: name,
        description: description,
        language: language,
        code: code,
        tags: tags,
        addedDate: new Date(),
        usageCount: 0
    };

    if (mode === 'add') {
        appState.threatHuntingScripts.push(newScript);
        showToast('Script added successfully!');
    } else if (mode === 'edit') {
        const index = appState.threatHuntingScripts.findIndex(s => s.id === scriptId);
        if (index > -1) {
            newScript.usageCount = appState.threatHuntingScripts[index].usageCount;
            appState.threatHuntingScripts[index] = newScript;
            showToast('Script updated successfully!');
        } else {
            showToast('Error: Script not found for update.', 'error');
        }
    }

    hideModal('addEditScriptModal');
    renderThreatHuntingScripts();
    populateScriptLanguageFilter();
    saveState();
}

/**
 * Handles actions on individual threat hunting script cards (view code, edit, copy code, delete).
 * @param {Event} e - The click event.
 */
function handleScriptAction(e) {
    if (appState.readOnlyMode) {
        showToast("Cannot perform actions in read-only shared view.", "warning");
        return;
    }

    const targetBtn = e.target.closest('.action-btn');
    if (!targetBtn) return;

    e.preventDefault();
    const action = targetBtn.dataset.action;
    const scriptCard = e.target.closest('.tool-card');
    const scriptId = scriptCard ? scriptCard.dataset.scriptId : null;

    const script = appState.threatHuntingScripts.find(s => s.id === scriptId);
    if (!script) return;

    const displayScriptName = document.getElementById('displayScriptName');
    const displayScriptCode = document.getElementById('displayScriptCode');

    switch (action) {
        case 'view-code':
            if (displayScriptName) displayScriptName.textContent = script.name;
            if (displayScriptCode) displayScriptCode.textContent = script.code;
            showModal('scriptCodeDisplayModal');
            script.usageCount = (script.usageCount || 0) + 1;
            break;
        case 'edit-script':
            openAddEditScriptModal('edit', script.id);
            break;
        case 'copy-code':
            copyToClipboard(script.code);
            script.usageCount = (script.usageCount || 0) + 1;
            break;
        case 'delete-script':
            if (confirm(`Are you sure you want to delete the script "${script.name}"?`)) {
                appState.threatHuntingScripts = appState.threatHuntingScripts.filter(s => s.id !== scriptId);
                showToast('Script deleted!', 'error');
                populateScriptLanguageFilter();
            }
            break;
    }
    renderThreatHuntingScripts();
    saveState();
}