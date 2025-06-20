// dorkAssistant.js

const dorkAssistantState = {
    keywords: '',
    customInput: '',
    engine: 'google',
    previewQuery: '',
    convertedQuery: '',
    currentDorkSubTab: 'query-playground',
    savedQueries: [],
    savedQuerySearchTerm: '',
    currentTemplateCategory: 'All Templates',
    preTemplateSearchTerm: '',
    conversionJustPerformed: false,
    templates: {} // Initialize templates as an empty object
};

let dorkTemplates = {}; // This will hold the fetched templates, grouped by category

// Define engine colors based on common brand colors
const engineColors = {
    'google': {
        color: '#FFFFFF', // White text
        background: '#4285F4' // Google Blue
    },
    'duckduckgo': {
        color: '#FFFFFF', // White text
        background: '#DE5833' // DuckDuckGo Orange
    },
    'bing': {
        color: '#FFFFFF', // White text
        background: '#008373' // Bing Teal/Green
    },
    'yandex': {
        color: '#FFFFFF', // White text
        background: '#FC3F1D' // Yandex Red
    },
    'shodan': {
        color: '#FFFFFF', // White text
        background: '#AA33BB' // Shodan Purple
    },
    'censys': {
        color: '#FFFFFF', // White text
        background: '#336699' // Censys Blue
    },
    'default': { // Fallback for any unknown engine
        color: 'var(--text-primary)',
        background: 'var(--bg-tertiary)'
    }
};


/**
 * Initializes the Dork Assistant tab by loading saved queries, binding events,
 * and setting up the initial view based on the saved state.
 */
async function initDorkAssistant() { // Made async to await fetching templates
    await loadDorkTemplates(); // Load dork templates from the new JSON file
    loadSavedQueries(); // Load saved queries at init
    bindDorkAssistantEvents(); // Bind events once, using delegation
    switchDorkSubTab(dorkAssistantState.currentDorkSubTab); // Show correct sub-tab on load
    updateDorkQueryPreview(); // Initial preview for Playground
}

/**
 * Fetches dork templates from dorkTemplates.json and organizes them by category.
 */
async function loadDorkTemplates() {
    try {
        // Assuming fetchJsonData is a global utility function that can fetch JSON
        const fetchedTemplates = await fetchJsonData('dorkTemplates.json');

        // Organize templates by category
        dorkTemplates = { "All Templates": [] }; // Ensure 'All Templates' always exists
        fetchedTemplates.forEach(template => {
            // Derive a simple category based on ID or common keywords
            let categoryName = "General OSINT"; // Default category if not derivable
            if (template.id.includes("iot") || template.id.includes("webcam") || template.id.includes("printer") || template.id.includes("router")) {
                categoryName = "IoT / Devices";
            } else if (template.id.includes("linkedin") || template.id.includes("twitter") || template.id.includes("facebook") || template.id.includes("social")) {
                categoryName = "Social Media";
            } else if (template.id.includes("sql") || template.id.includes("phpmyadmin") || template.id.includes("database") || template.id.includes("server")) {
                categoryName = "Database / Server";
            } else if (template.id.includes("cve") || template.id.includes("exploitdb")) {
                categoryName = "Vulnerability Research";
            } else if (template.id.includes("git") || template.id.includes("log_files") || template.id.includes("filetype") || template.id.includes("document")) {
                categoryName = "File / Document Analysis";
            } else if (template.id.includes("shodan") || template.id.includes("censys") || template.id.includes("network") || template.id.includes("ftp") || template.id.includes("ssh") || template.id.includes("rdp") || template.id.includes("vnc")) {
                categoryName = "Network Intelligence";
            } else if (template.id.includes("cloud") || template.id.includes("s3") || template.id.includes("jenkins") || template.id.includes("docker") || template.id.includes("kubernetes") || template.id.includes("elastic")) {
                 categoryName = "Cloud / Infrastructure";
            } else if (template.id.includes("api") || template.id.includes("swagger") || template.id.includes("developer")) {
                 categoryName = "API & Development";
            } else if (template.id.includes("credentials") || template.id.includes("password") || template.id.includes("user_data") || template.id.includes("email_lists")) {
                 categoryName = "Exposed Credentials & Data";
            } else if (template.id.includes("ics") || template.id.includes("scada") || template.id.includes("industrial")) {
                 categoryName = "Industrial Control Systems";
            }
            // Add more specific categorizations based on keywords or other fields if needed

            if (!dorkTemplates[categoryName]) {
                dorkTemplates[categoryName] = [];
            }
            dorkTemplates[categoryName].push(template);
            dorkTemplates["All Templates"].push(template); // Add to All Templates category
        });

        // Sort templates within each category by name
        for (const category in dorkTemplates) {
            dorkTemplates[category].sort((a, b) => a.name.localeCompare(b.name));
        }

        dorkAssistantState.templates = dorkTemplates; // Store for later use if needed.

    } catch (error) {
        console.error("Failed to load dork templates:", error);
        dorkTemplates = { "All Templates": [] };
    }
}


/**
 * Binds all necessary event listeners for the Dork Assistant tab.
 * Uses event delegation where appropriate to handle dynamically added elements.
 */
function bindDorkAssistantEvents() {
    // Sub-tab navigation
    document.querySelectorAll('.dork-subtab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            switchDorkSubTab(e.target.dataset.dorkSubtab);
        });
    });

    // Save Query Modal events
    const cancelSaveDorkQueryBtn = document.getElementById('cancelSaveDorkQuery');
    if (cancelSaveDorkQueryBtn) {
        cancelSaveDorkQueryBtn.onclick = () => {
            hideModal('saveDorkQueryModal');
        };
    }
    const saveDorkQueryForm = document.getElementById('saveDorkQueryForm');
    if (saveDorkQueryForm) {
        saveDorkQueryForm.addEventListener('submit', handleSaveDorkQuery);
    }

    // Warning Modal Events
    const convertAndGoToPlaygroundBtn = document.getElementById('convertAndGoToPlayground');
    if (convertAndGoToPlaygroundBtn) {
        convertAndGoToPlaygroundBtn.onclick = () => {
            const currentQuery = document.getElementById('dorkWarningModal').dataset.tempQuery;
            const targetEngine = document.getElementById('dorkWarningModal').dataset.tempEngine;

            if (!currentQuery || !targetEngine) {
                showToast('Error: Missing query or engine for conversion.', "error");
                return;
            }

            const convertedQuery = convertToShodanCensys(currentQuery, targetEngine);

            document.getElementById('editExecuteTemplateQuery').value = convertedQuery;
            document.getElementById('editExecuteTemplateEngine').value = targetEngine;

            dorkAssistantState.conversionJustPerformed = true;
            saveDorkAssistantState();

            hideModal('dorkWarningModal');
            showToast(`Query converted to ${targetEngine.charAt(0).toUpperCase() + targetEngine.slice(1)} in the editor!`, 'info', 3000);
        };
    }

    const cancelDorkWarningBtn = document.getElementById('cancelDorkWarning');
    if (cancelDorkWarningBtn) {
        cancelDorkWarningBtn.onclick = () => {
            hideModal('dorkWarningModal');
            showToast('Execution cancelled by user.', 'info');
        };
    }

    const continueDorkExecutionBtn = document.getElementById('continueDorkExecution');
    if (continueDorkExecutionBtn) {
        continueDorkExecutionBtn.onclick = () => {
            const query = document.getElementById('dorkWarningModal').dataset.tempQuery;
            const engine = document.getElementById('dorkWarningModal').dataset.tempEngine;

            if (!query || !engine) {
                showToast('Error: Missing query or engine for execution.', 'error');
                return;
            }

            hideModal('dorkWarningModal');
            hideModal('editExecuteTemplateModal');
            executeDorkQuery(query, engine);
        };
    }

    // Query Playground events
    document.getElementById('dorkKeywords').addEventListener('input', updateDorkAssistantState);
    document.getElementById('dorkCustomInput').addEventListener('input', updateDorkAssistantState);
    document.getElementById('dorkEngineSelect').addEventListener('change', updateDorkAssistantState);
    document.querySelectorAll('.dork-operator-btn').forEach(button => {
        button.addEventListener('click', handleOperatorButtonClick);
    });
    document.getElementById('executeDorkBtn').addEventListener('click', () => executeDorkQuery());
    document.getElementById('clearDorkBuilderBtn').addEventListener('click', clearDorkBuilder);

    const convertDorkBtn = document.getElementById('convertDorkBtn');
    if (convertDorkBtn) {
        convertDorkBtn.addEventListener('click', convertDorkQuery);
    }

    const executeConvertedDorkBtn = document.getElementById('executeConvertedDorkBtn');
    if (executeConvertedDorkBtn) {
        executeConvertedDorkBtn.addEventListener('click', () => {
            const convertedQuery = document.getElementById('convertedDorkPreview').value;
            const targetEngine = document.getElementById('conversionTarget').value;
            if (convertedQuery && targetEngine) {
                executeDorkQuery(convertedQuery, targetEngine);
            } else {
                showToast('No converted query or target engine selected.', "warning");
            }
        });
    }

    const conversionTargetSelect = document.getElementById('conversionTarget');
    if (conversionTargetSelect) {
        conversionTargetSelect.addEventListener('change', () => {
            const convertedDorkPreview = document.getElementById('convertedDorkPreview');
            const executeConvertedDorkBtn = document.getElementById('executeConvertedDorkBtn');

            if (convertedDorkPreview) convertedDorkPreview.value = '';
            if (convertedDorkPreview) convertedDorkPreview.style.display = 'none';
            if (executeConvertedDorkBtn) executeConvertedDorkBtn.style.display = 'none';
        });
    }

    const saveCurrentDorkBtn = document.getElementById('saveCurrentDorkBtn');
    if (saveCurrentDorkBtn) {
        saveCurrentDorkBtn.addEventListener('click', openSaveDorkQueryModal);
    }

    // Pre-Templates events (delegated to preTemplateCategoriesList)
    const preTemplateCategoriesList = document.getElementById('preTemplateCategoriesList');
    if (preTemplateCategoriesList) {
        preTemplateCategoriesList.addEventListener('click', (e) => {
            const categoryItem = e.target.closest('.category-item');
            if (categoryItem) {
                dorkAssistantState.currentTemplateCategory = categoryItem.dataset.category;
                renderPreTemplates();
            }
        });
    }

    const preTemplateSearchInput = document.getElementById('preTemplateSearchInput');
    if (preTemplateSearchInput) {
        let preTemplateSearchTimeout;
        preTemplateSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value;
            clearTimeout(preTemplateSearchTimeout);
            preTemplateSearchTimeout = setTimeout(() => {
                dorkAssistantState.preTemplateSearchTerm = searchTerm;
                renderPreTemplates();
            }, 300);
        });
    }

    const clearPreTemplateSearchBtn = document.getElementById('clearPreTemplateSearch');
    if (clearPreTemplateSearchBtn) {
        clearPreTemplateSearchBtn.addEventListener('click', () => {
            dorkAssistantState.preTemplateSearchTerm = '';
            const preTemplateSearchInput = document.getElementById('preTemplateSearchInput');
            if (preTemplateSearchInput) preTemplateSearchInput.value = '';
            renderPreTemplates();
        });
    }

    // ************ IMPORTANT FIX: Event Delegation for Dork Templates List ************
    // Attach ONE listener to the parent container, not to individual buttons on each render.
    const dorkTemplatesList = document.getElementById('dorkTemplatesList');
    if (dorkTemplatesList) {
        dorkTemplatesList.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const templateId = btn.closest('.dork-template-card').dataset.templateId; // Get ID from card
            if (btn.classList.contains('apply-template-btn')) {
                applySelectedTemplate(templateId);
            } else if (btn.classList.contains('execute-template-btn')) {
                executeTemplateQuery(templateId);
            } else if (btn.classList.contains('edit-execute-template-btn')) {
                openEditExecuteTemplateModal(templateId);
            }
        });
    }
    // *********************************************************************************

    const cancelEditExecuteTemplateBtn = document.getElementById('cancelEditExecuteTemplate');
    if (cancelEditExecuteTemplateBtn) {
        cancelEditExecuteTemplateBtn.addEventListener('click', () => hideModal('editExecuteTemplateModal'));
    }

    const editExecuteTemplateForm = document.getElementById('editExecuteTemplateForm');
    if (editExecuteTemplateForm) {
        editExecuteTemplateForm.addEventListener('submit', handleEditExecuteTemplate);
    }

    const editExecuteTemplateEngineSelect = document.getElementById('editExecuteTemplateEngine');
    if (editExecuteTemplateEngineSelect) {
        editExecuteTemplateEngineSelect.addEventListener('change', () => {
            const selectedEngine = editExecuteTemplateEngineSelect.value;
            const conversionSection = document.getElementById('editExecuteConversionSection');
            const performConversionBtn = document.getElementById('performEditExecuteConversionBtn');

            if (conversionSection) {
                if (selectedEngine === 'shodan' || selectedEngine === 'censys') {
                    conversionSection.style.display = 'block';
                    if (performConversionBtn) {
                        performConversionBtn.textContent = `Convert to ${selectedEngine.charAt(0).toUpperCase() + selectedEngine.slice(1)}`;
                    }
                } else {
                    conversionSection.style.display = 'none';
                }
            }
        });
    }

    const performEditExecuteConversionBtn = document.getElementById('performEditExecuteConversionBtn');
    if (performEditExecuteConversionBtn) {
        performEditExecuteConversionBtn.addEventListener('click', () => {
            const currentQueryInput = document.getElementById('editExecuteTemplateQuery');
            const currentQuery = currentQueryInput.value.trim();
            const targetEngine = document.getElementById('editExecuteTemplateEngine').value;

            if (!currentQuery) {
                showToast('No query to convert.', "warning");
                return;
            }
            if (!(targetEngine === 'shodan' || targetEngine === 'censys')) {
                showToast('Select Shodan or Censys as the target engine to convert.', "warning");
                return;
            }

            const convertedQuery = convertToShodanCensys(currentQuery, targetEngine);
            currentQueryInput.value = convertedQuery;
            showToast(`Query converted for ${targetEngine.charAt(0).toUpperCase() + targetEngine.slice(1)}!`, 'success');

            dorkAssistantState.conversionJustPerformed = true;
            saveDorkAssistantState();

            const conversionSection = document.getElementById('editExecuteConversionSection');
            if (conversionSection) conversionSection.style.display = 'none';
        });
    }

    // Saved Queries events (delegated)
    const savedQueriesSearchInput = document.getElementById('savedQueriesSearch');
    if (savedQueriesSearchInput) {
        savedQueriesSearchInput.addEventListener('input', (e) => {
            dorkAssistantState.savedQuerySearchTerm = e.target.value;
            renderSavedQueries();
        });
    }

    const clearSavedQueriesSearchBtn = document.getElementById('clearSavedQueriesSearch');
    if (clearSavedQueriesSearchBtn) {
        clearSavedQueriesSearchBtn.addEventListener('click', () => {
            document.getElementById('savedQueriesSearch').value = '';
            dorkAssistantState.savedQuerySearchTerm = '';
            renderSavedQueries();
        });
    }

    const savedQueriesList = document.getElementById('savedQueriesList');
    if (savedQueriesList) {
        savedQueriesList.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const queryId = btn.dataset.queryId;
            if (btn.classList.contains('load-query-btn')) {
                loadSavedQueryToPlayground(queryId);
            } else if (btn.classList.contains('execute-saved-query-btn')) {
                executeSavedQuery(queryId);
            } else if (btn.classList.contains('delete-saved-query-btn')) {
                deleteSavedQuery(queryId);
            }
        });
    }
}

/**
 * Switches the active sub-tab within the Dork Assistant section.
 * @param {string} subtabName The ID of the sub-tab to activate ('query-playground', 'pre-templates', 'saved-queries').
 */
function switchDorkSubTab(subtabName) {
    dorkAssistantState.currentDorkSubTab = subtabName;

    document.querySelectorAll('.dork-subtab').forEach(tab => {
        tab.classList.remove('active');
    });
    const targetSubTabBtn = document.querySelector(`.dork-subtab[data-dork-subtab="${subtabName}"]`);
    if (targetSubTabBtn) {
        targetSubTabBtn.classList.add('active');
    }

    document.querySelectorAll('.dork-subtab-content').forEach(content => {
        content.style.display = 'none';
    });
    const targetContent = document.getElementById(`${subtabName}-content`);
    if (targetContent) {
        targetContent.style.display = 'block';
    }

    // Reset conversion flag if leaving 'query-playground'
    if (subtabName !== 'query-playground') {
        dorkAssistantState.conversionJustPerformed = false;
        saveDorkAssistantState();
    }

    // Render content specific to the sub-tab
    if (subtabName === 'pre-templates') {
        renderPreTemplates();
    } else if (subtabName === 'saved-queries') {
        renderSavedQueries();
    }
    saveDorkAssistantState();
}

/**
 * Updates the dorkAssistantState based on current input values from the Query Playground,
 * and then refreshes the live query preview.
 */
function updateDorkAssistantState() {
    dorkAssistantState.keywords = document.getElementById('dorkKeywords').value.trim();
    dorkAssistantState.customInput = document.getElementById('dorkCustomInput').value.trim();
    dorkAssistantState.engine = document.getElementById('dorkEngineSelect').value;
    updateDorkQueryPreview();
    saveDorkAssistantState();
}

/**
 * Handles clicks on operator buttons in the Query Playground, appending them to the custom input.
 * @param {Event} event The click event.
 */
function handleOperatorButtonClick(event) {
    const operator = event.target.dataset.operator;
    const customInputEl = document.getElementById('dorkCustomInput');
    let currentInput = customInputEl.value.trim();

    if (currentInput && !currentInput.endsWith(' ') && !operator.startsWith(':') && !operator.startsWith('-') && operator !== 'OR' && operator !== 'AND') {
        currentInput += ' ';
    }
    customInputEl.value = currentInput + operator;
    updateDorkAssistantState();
}

/**
 * Generates and updates the live preview of the dork query in the Query Playground.
 */
function updateDorkQueryPreview() {
    let queryParts = [];

    const keywords = dorkAssistantState.keywords.split(',').map(k => k.trim()).filter(k => k);
    if (keywords.length > 0) {
        queryParts.push(keywords.map(k => {
            return k.includes(' ') && !k.startsWith('"') && !k.startsWith('site:') && !k.startsWith('filetype:') && !k.startsWith('intitle:') && !k.startsWith('inurl:') && !k.startsWith('intext:') && !k.startsWith('related:') && !k.startsWith('cache:') ? `"${k}"` : k;
        }).join(' '));
    }

    if (dorkAssistantState.customInput) {
        queryParts.push(dorkAssistantState.customInput);
    }

    let finalQuery = queryParts.join(' ').trim();

    document.getElementById('dorkQueryPreview').value = finalQuery;
    dorkAssistantState.previewQuery = finalQuery;
}

/**
 * Executes a dork query by opening a new tab with the selected search engine.
 * @param {string} [queryToExecute=null] The query string to execute. Defaults to the current preview query.
 * @param {string} [engineToUse=null] The search engine to use. Defaults to the currently selected engine.
 */
function executeDorkQuery(queryToExecute = null, engineToUse = null) {
    const query = queryToExecute || dorkAssistantState.previewQuery;
    const engine = engineToUse || dorkAssistantState.engine;

    if (!query) {
        showToast('Query is empty. Please build a query or select a template/saved query first.', 'warning');
        return;
    }

    let searchUrl = '';
    switch (engine) {
        case 'google':
            searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            break;
        case 'duckduckgo':
            searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
            break;
        case 'bing':
            searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
            break;
        case 'yandex':
            searchUrl = `https://yandex.com/search/?text=${encodeURIComponent(query)}`;
            break;
        case 'shodan':
            searchUrl = `https://www.shodan.io/search?query=${encodeURIComponent(query)}`;
            break;
        case 'censys':
            searchUrl = `https://search.censys.io/search?query=${encodeURIComponent(query)}&resource=hosts`;
            break;
        default:
            showToast('Unsupported search engine selected for execution.', 'error');
            return;
    }

    window.open(searchUrl, '_blank');
    showToast(`Executing query on ${engine.charAt(0).toUpperCase() + engine.slice(1)}...`);
}

/**
 * Clears all input fields in the Dork Playground and resets the state.
 */
function clearDorkBuilder() {
    document.getElementById('dorkKeywords').value = '';
    document.getElementById('dorkCustomInput').value = '';
    document.getElementById('dorkEngineSelect').value = 'google';
    document.getElementById('convertedDorkPreview').style.display = 'none';
    dorkAssistantState.keywords = '';
    dorkAssistantState.customInput = '';
    dorkAssistantState.engine = 'google';
    updateDorkQueryPreview();
    showToast('Query Playground cleared!');
    saveDorkAssistantState();
}

/**
 * Converts the current query in the playground to Shodan or Censys syntax
 * and displays it in the converted preview area.
 * @param {string} [targetEngineOverride=null] Optional: The target engine to convert to.
 */
function convertDorkQuery(targetEngineOverride = null) {
    const originalQuery = dorkAssistantState.previewQuery;

    // Ensure targetEngine is a string before calling charAt()
    let targetEngine = String(targetEngineOverride || document.getElementById('conversionTarget').value);

    const convertedPreviewEl = document.getElementById('convertedDorkPreview');

    if (!originalQuery) {
        showToast('No query to convert. Please build a query first.', 'warning');
        return;
    }
    if (!targetEngine) {
        showToast('Please select a target engine for conversion.', 'warning');
        return;
    }

    const convertedQuery = convertToShodanCensys(originalQuery, targetEngine);
    convertedPreviewEl.value = convertedQuery;
    convertedPreviewEl.style.display = 'block';
    document.getElementById('executeConvertedDorkBtn').style.display = 'block';
    dorkAssistantState.convertedQuery = convertedQuery;
    showToast(`Query converted for ${targetEngine.charAt(0).toUpperCase() + targetEngine.slice(1)}!`, 'success');
}

/**
 * Converts a given query from general syntax to Shodan or Censys specific syntax.
 * @param {string} query The query string to convert.
 * @param {string} targetEngine 'shodan' or 'censys'.
 * @returns {string} The converted query string.
 */
function convertToShodanCensys(query, targetEngine) {
    let converted = query;

    converted = converted.replace(/site:([^\s]+)/gi, 'HOST:$1');
    converted = converted.replace(/intitle:"([^"]+)"/gi, 'TITLE:"$1"');
    converted = converted.replace(/intitle:([^\s]+)/gi, 'TITLE:$1');
    converted = converted.replace(/inurl:([^\s]+)/gi, 'URL:$1');
    converted = converted.replace(/intext:"([^"]+)"/gi, 'BODY:"$1"');
    converted = converted.replace(/intext:([^\s]+)/gi, 'BODY:$1');
    converted = converted.replace(/filetype:([^\s]+)/gi, 'FILETYPE:$1');

    if (targetEngine === 'shodan') {
        converted = converted.replace(/HOST:/gi, 'hostname:');
        converted = converted.replace(/TITLE:/gi, 'title:');
        converted = converted.replace(/URL:/gi, '443.url:');
        converted = converted.replace(/BODY:/gi, 'http.html:');
        converted = converted.replace(/FILETYPE:(pdf|docx|xlsx)/gi, 'http.content_type:$1');
        if (query.toLowerCase().includes('webcam') || query.toLowerCase().includes('camera')) {
            converted += ' port:8080 OR port:80 OR port:443 webcam';
        }
        if (query.toLowerCase().includes('printer')) {
            converted += ' product:printer';
        }
        if (query.toLowerCase().includes('apache')) {
            converted += ' product:apache';
        }
        if (query.toLowerCase().includes('nginx')) {
            converted += ' product:nginx';
        }
    } else if (targetEngine === 'censys') {
        converted = converted.replace(/HOST:/gi, 'services.dns.names:');
        converted = converted.replace(/TITLE:/gi, 'services.http.response.html.title:');
        converted = converted.replace(/URL:/gi, 'services.http.response.request.url:');
        converted = converted.replace(/BODY:/gi, 'services.http.response.html.body:');
        converted = converted.replace(/FILETYPE:(pdf|docx|xlsx)/gi, 'services.http.response.headers.content_type:$1');
        if (query.toLowerCase().includes('webcam') || query.toLowerCase().includes('camera')) {
            converted += ' services.http.tags:webcam';
        }
        if (query.toLowerCase().includes('printer')) {
            converted += ' services.fingerprint.product:printer';
        }
        if (query.toLowerCase().includes('apache')) {
            converted += ' services.http.metadata.product:Apache';
        }
    }

    // Clean up any remaining generic operators that aren't native to Shodan/Censys after conversion
    // This is a crude cleanup, advanced conversion would require more sophisticated parsing.
    converted = converted.replace(/HOST:/gi, '');
    converted = converted.replace(/TITLE:/gi, '');
    converted = converted.replace(/URL:/gi, '');
    converted = converted.replace(/BODY:/gi, '');
    converted = converted.replace(/FILETYPE:/gi, '');

    return converted.replace(/\s+/g, ' ').trim();
}

/**
 * Renders the list of pre-defined dork templates based on the current category and search term.
 */
function renderPreTemplates() {
    const templatesList = document.getElementById('dorkTemplatesList');
    const preTemplatesEmptyState = document.getElementById('preTemplatesEmptyState');
    const categoriesListContainer = document.getElementById('preTemplateCategoriesList');
    const categoriesEmptyState = document.getElementById('preTemplateCategoriesEmptyState');
    const currentTemplateCategoryTitle = document.getElementById('currentTemplateCategoryTitle');
    const preTemplateSearchInput = document.getElementById('preTemplateSearchInput');

    templatesList.innerHTML = ''; // Clear existing templates
    categoriesListContainer.innerHTML = ''; // Clear existing categories

    const categories = Object.keys(dorkTemplates);

    if (categories.length === 0) {
        categoriesEmptyState.style.display = 'block';
        templatesList.style.display = 'none';
        preTemplatesEmptyState.style.display = 'none';
        return;
    }

    categoriesEmptyState.style.display = 'none';
    templatesList.style.display = 'grid';
    preTemplatesEmptyState.style.display = 'none';

    // Render "All Templates" category first, calculating total count dynamically
    let allTemplatesCount = 0;
    for (const categoryName in dorkTemplates) {
        if (categoryName !== "All Templates") { // Exclude "All Templates" itself from this count
            allTemplatesCount += dorkTemplates[categoryName].length;
        }
    }
    const allCategoryItem = document.createElement('div');
    allCategoryItem.classList.add('category-item');
    allCategoryItem.dataset.category = 'All Templates';
    allCategoryItem.innerHTML = `<i class="fas fa-layer-group"></i> <span>All Templates</span> <span class="template-count">${allTemplatesCount}</span>`;
    categoriesListContainer.appendChild(allCategoryItem);


    // Render other categories
    categories.sort((a, b) => {
        if (a === "All Templates") return -1;
        if (b === "All Templates") return 1;
        return a.localeCompare(b);
    }).forEach(categoryName => {
        if (categoryName === "All Templates") return; // Skip "All Templates" as it's already added

        const categoryTemplates = dorkTemplates[categoryName] || [];
        const categoryItem = document.createElement('div');
        categoryItem.classList.add('category-item');
        categoryItem.dataset.category = categoryName;
        // Use a default icon if one isn't specified or infer from category name
        let iconClass = 'fas fa-folder-open'; 
        if (categoryName.includes('IoT')) iconClass = 'fas fa-wifi';
        if (categoryName.includes('Social Media')) iconClass = 'fas fa-share-alt';
        if (categoryName.includes('Database')) iconClass = 'fas fa-database';
        if (categoryName.includes('Vulnerability')) iconClass = 'fas fa-bug';
        if (categoryName.includes('File')) iconClass = 'fas fa-file';
        if (categoryName.includes('Network')) iconClass = 'fas fa-network-wired';
        if (categoryName.includes('Cloud')) iconClass = 'fas fa-cloud';
        if (categoryName.includes('API')) iconClass = 'fas fa-code';
        if (categoryName.includes('Credentials')) iconClass = 'fas fa-key';
        if (categoryName.includes('Industrial')) iconClass = 'fas fa-industry';


        categoryItem.innerHTML = `<i class="${iconClass}"></i> <span>${categoryName}</span> <span class="template-count">${categoryTemplates.length}</span>`;
        categoriesListContainer.appendChild(categoryItem);
    });

    document.querySelectorAll('#preTemplateCategoriesList .category-item').forEach(item => {
        if (item.dataset.category === dorkAssistantState.currentTemplateCategory) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
        // Listener for category items is delegated in bindDorkAssistantEvents, no need to re-add here
    });

    currentTemplateCategoryTitle.textContent = dorkAssistantState.currentTemplateCategory;

    preTemplateSearchInput.value = dorkAssistantState.preTemplateSearchTerm;

    let templatesToRender = [];
    if (dorkAssistantState.currentTemplateCategory === 'All Templates') {
        templatesToRender = dorkTemplates["All Templates"] || [];
    } else {
        templatesToRender = dorkTemplates[dorkAssistantState.currentTemplateCategory] || [];
    }

    if (dorkAssistantState.preTemplateSearchTerm) {
        const searchTerm = dorkAssistantState.preTemplateSearchTerm.toLowerCase();
        templatesToRender = templatesToRender.filter(template => {
            const fullQuery = `${template.keywords ? template.keywords + ' ' : ''}${template.custom}`;
            return template.name.toLowerCase().includes(searchTerm) ||
                   template.description.toLowerCase().includes(searchTerm) ||
                   fullQuery.toLowerCase().includes(searchTerm) ||
                   template.engine.toLowerCase().includes(searchTerm);
        });
    }

    templatesToRender.sort((a, b) => a.name.localeCompare(b.name));

    if (templatesToRender.length === 0) {
        preTemplatesEmptyState.style.display = 'block';
        templatesList.style.display = 'none';
    } else {
        preTemplatesEmptyState.style.display = 'none';
        templatesList.style.display = 'grid';
        templatesToRender.forEach(template => {
            const fullQuery = `${template.keywords ? template.keywords + ' ' : ''}${template.custom}`;
            const engineStyle = engineColors[template.engine.toLowerCase()] || engineColors['default']; // Get colors based on engine
            templatesList.innerHTML += `
                <div class="dork-template-card" data-template-id="${template.id}">
                    <div class="template-header">
                        <span>${template.name}</span>
                        <span class="template-engine" style="background-color: ${engineStyle.background}; color: ${engineStyle.color};">${template.engine.charAt(0).toUpperCase() + template.engine.slice(1)}</span>
                    </div>
                    <div class="template-query">${fullQuery.trim()}</div>
                    <div class="template-description">${template.description}</div>
                    <div class="template-actions">
                        <button class="btn btn-primary btn-sm apply-template-btn" data-template-id="${template.id}">
                            <i class="fas fa-magic"></i> Apply
                        </button>
                        <button class="btn btn-secondary btn-sm execute-template-btn" data-template-id="${template.id}">
                            <i class="fas fa-play"></i> Execute
                        </button>
                        <button class="btn btn-secondary btn-sm edit-execute-template-btn" data-template-id="${template.id}">
                            <i class="fas fa-edit"></i> Edit & Run
                        </button>
                    </div>
                </div>
            `;
        });
    }

    // No need to re-attach button listeners here, as they are handled by delegation in bindDorkAssistantEvents

    const preTemplateSearchInputElement = document.getElementById('preTemplateSearchInput');
    if (preTemplateSearchInputElement) {
        preTemplateSearchInputElement.addEventListener('input', (e) => {
            const searchTerm = e.target.value;
            clearTimeout(preTemplateSearchTimeout);
            preTemplateSearchTimeout = setTimeout(() => {
                dorkAssistantState.preTemplateSearchTerm = searchTerm;
                renderPreTemplates();
            }, 300);
        });
    }

    const clearPreTemplateSearchButton = document.getElementById('clearPreTemplateSearch');
    if (clearPreTemplateSearchButton) {
        clearPreTemplateSearchButton.addEventListener('click', () => {
            dorkAssistantState.preTemplateSearchTerm = '';
            const preTemplateSearchInputElement = document.getElementById('preTemplateSearchInput');
            if (preTemplateSearchInputElement) {
                preTemplateSearchInputElement.value = '';
            }
            renderPreTemplates();
        });
    }

    // Removed individual button listeners here, as they are handled by delegation in bindDorkAssistantEvents
    // Removed specific event listener re-attachments as they are now handled by delegation
    // The relevant modal event listeners are attached once in bindDorkAssistantEvents
}

/**
 * Applies a selected dork template to the Query Playground.
 * @param {string} templateId The ID of the template to apply.
 */
function applySelectedTemplate(templateId) {
    let template = null;
    // Iterate through all categories including "All Templates"
    for (const category in dorkTemplates) {
        template = dorkTemplates[category].find(t => t.id === templateId);
        if (template) break;
    }

    if (template) {
        switchDorkSubTab('query-playground');

        document.getElementById('dorkKeywords').value = template.keywords;
        document.getElementById('dorkCustomInput').value = template.custom;
        document.getElementById('dorkEngineSelect').value = template.engine;

        updateDorkAssistantState();
        showToast(`Template "${template.name}" applied to playground!`, 'success');
    }
}

/**
 * Executes a dork query directly from a selected template.
 * @param {string} templateId The ID of the template to execute.
 */
function executeTemplateQuery(templateId) {
    let template = null;
    for (const category in dorkTemplates) {
        template = dorkTemplates[category].find(t => t.id === templateId);
        if (template) break;
    }

    if (template) {
        const query = `${template.keywords ? template.keywords + ' ' : ''}${template.custom}`.trim();
        executeDorkQuery(query, template.engine);
    }
}

/**
 * Opens the "Edit & Execute Template" modal, populating it with the selected template's data.
 * @param {string} templateId The ID of the template to edit/execute.
 */
function openEditExecuteTemplateModal(templateId) {
    let template = null;
    for (const category in dorkTemplates) {
        template = dorkTemplates[category].find(t => t.id === templateId);
        if (template) break;
    }

    if (template) {
        dorkAssistantState.conversionJustPerformed = false;
        saveDorkAssistantState();

        document.getElementById('editExecuteTemplateId').value = template.id;
        document.getElementById('editExecuteTemplateName').value = template.name;
        const fullQuery = `${template.keywords ? template.keywords + ' ' : ''}${template.custom}`;
        document.getElementById('editExecuteTemplateQuery').value = fullQuery.trim();
        document.getElementById('editExecuteTemplateEngine').value = template.engine;

        const conversionSection = document.getElementById('editExecuteConversionSection');
        if (conversionSection) {
            conversionSection.style.display = 'none';
        }

        showModal('editExecuteTemplateModal');
    } else {
        showToast('Template not found!', 'error');
    }
}

/**
 * Handles the submission from the "Edit & Execute Template" modal.
 * Includes logic for displaying a warning if the query format doesn't match the selected engine.
 * @param {Event} e The form submission event.
 */
function handleEditExecuteTemplate(e) {
    e.preventDefault();
    const query = document.getElementById('editExecuteTemplateQuery').value.trim();
    const engine = document.getElementById('editExecuteTemplateEngine').value;

    if (!query) {
        showToast('Query cannot be empty.', 'warning');
        return;
    }

    if (dorkAssistantState.conversionJustPerformed) {
        dorkAssistantState.conversionJustPerformed = false;
        saveDorkAssistantState();
        hideModal('editExecuteTemplateModal');
        executeDorkQuery(query, engine);
        return;
    }

    const looksLikeShodan = (q) => {
        const lowerQ = q.toLowerCase();
        return lowerQ.includes('hostname:') || lowerQ.includes('product:') ||
            lowerQ.includes('http.html:') || lowerQ.includes('ssl.cert.issuer.cn:') ||
            lowerQ.includes('port:') || lowerQ.includes('org:') || lowerQ.includes('vuln:');
    };

    const looksLikeCensys = (q) => {
        const lowerQ = q.toLowerCase();
        return lowerQ.includes('services.dns.names:') || lowerQ.includes('services.http.response.html.title:') ||
            lowerQ.includes('services.http.response.request.url:') || lowerQ.includes('services.http.response.html.body:') ||
            lowerQ.includes('services.tls.certificates.leaf_data.') || lowerQ.includes('services.http.tags:') ||
            lowerQ.includes('vulnerability.id:');
    };

    let showWarning = false;
    let warningMessage = '';

    if (engine === 'shodan' && !looksLikeShodan(query)) {
        showWarning = true;
        warningMessage = `The selected engine is Shodan, but the query does not appear to be in Shodan format. ` +
                        `It might not work correctly. You can convert it now or continue execution anyway.`;
    } else if (engine === 'censys' && !looksLikeCensys(query)) {
        showWarning = true;
        warningMessage = `The selected engine is Censys, but the query does not appear to be in Censys format. ` +
                        `It might not work correctly. You can convert it now or continue execution anyway.`;
    }
    else if ((engine === 'google' || engine === 'duckduckgo' || engine === 'bing' || engine === 'yandex') &&
            (looksLikeShodan(query) || looksLikeCensys(query))) {
        showWarning = true;
        warningMessage = `This query appears to be in Shodan or Censys format, but the selected engine is '${engine}'. ` +
                        `It might not work correctly. You can convert it to a general search query or continue execution anyway.`;
    }

    if (showWarning) {
        document.getElementById('dorkWarningMessage').innerText = warningMessage;
        document.getElementById('dorkWarningModal').dataset.tempQuery = query;
        document.getElementById('dorkWarningModal').dataset.tempEngine = engine;

        showModal('dorkWarningModal');
    } else {
        hideModal('editExecuteTemplateModal');
        executeDorkQuery(query, engine);
    }
}

/**
 * Loads saved dork queries from local storage into the dorkAssistantState.
 */
function loadSavedQueries() {
    const saved = localStorage.getItem('osintDorkSavedQueries');
    if (saved) {
        dorkAssistantState.savedQueries = JSON.parse(saved);
        // Ensure dates are parsed back to Date objects if needed later (currently stored as string)
        dorkAssistantState.savedQueries.forEach(query => {
            if (query.createdAt && typeof query.createdAt === 'string') {
                query.createdAt = new Date(query.createdAt);
            }
        });
    }
}

/**
 * Saves the current dorkAssistantState (specifically saved queries) to local storage.
 */
function saveSavedQueries() {
    localStorage.setItem('osintDorkSavedQueries', JSON.stringify(dorkAssistantState.savedQueries));
}

/**
 * Opens the modal to save the current query from the Query Playground.
 */
function openSaveDorkQueryModal() {
    const currentQuery = dorkAssistantState.previewQuery;
    const currentEngine = dorkAssistantState.engine;

    if (!currentQuery) {
        showToast('No query in playground to save.', 'warning');
        return;
    }

    document.getElementById('saveDorkQueryForm').reset();
    document.getElementById('savedQueryGenerated').value = currentQuery;
    document.getElementById('savedQueryEngine').value = currentEngine.charAt(0).toUpperCase() + currentEngine.slice(1);
    showModal('saveDorkQueryModal');
}

/**
 * Handles the submission of the save dork query form.
 * Creates a new saved query entry and adds it to the list.
 * @param {Event} e The form submission event.
 */
function handleSaveDorkQuery(e) {
    e.preventDefault();
    const queryName = document.getElementById('savedQueryName').value.trim();
    const queryDescription = document.getElementById('savedQueryDescription').value.trim();
    const queryTags = document.getElementById('savedQueryTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    const generatedQuery = document.getElementById('savedQueryGenerated').value;
    const targetEngine = document.getElementById('savedQueryEngine').value.toLowerCase();

    if (!queryName) {
        showToast('Please enter a name for the query.', 'error');
        return;
    }

    const newSavedQuery = {
        id: `dork-${Date.now()}`,
        name: queryName,
        description: queryDescription,
        query: generatedQuery,
        engine: targetEngine,
        tags: queryTags,
        createdAt: new Date().toISOString()
    };

    dorkAssistantState.savedQueries.push(newSavedQuery);
    saveSavedQueries();
    hideModal('saveDorkQueryModal');
    showToast('Query saved successfully!', 'success');
    logActivity('created', 'dorkQuery', `Saved new dork query: ${newSavedQuery.name}`, { queryId: newSavedQuery.id, engine: newSavedQuery.engine });

    renderSavedQueries();
    switchDorkSubTab('saved-queries');
}

/**
 * Renders the list of saved dork queries, applying search filters if present.
 */
function renderSavedQueries() {
    const savedQueriesList = document.getElementById('savedQueriesList');
    const savedQueriesEmptyState = document.getElementById('savedQueriesEmptyState');
    savedQueriesList.innerHTML = '';

    const searchTerm = dorkAssistantState.savedQuerySearchTerm.toLowerCase();
    const filteredQueries = dorkAssistantState.savedQueries.filter(q => {
        const nameMatch = q.name.toLowerCase().includes(searchTerm);
        const descMatch = q.description.toLowerCase().includes(searchTerm);
        const queryMatch = q.query.toLowerCase().includes(searchTerm);
        const tagMatch = q.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        return nameMatch || descMatch || queryMatch || tagMatch;
    });

    if (filteredQueries.length === 0) {
        savedQueriesEmptyState.style.display = 'block';
        savedQueriesList.style.display = 'none';
        if (searchTerm) {
            savedQueriesEmptyState.innerHTML = `<i class="fas fa-search"></i><h3>No matching saved queries found</h3><p>Try a different search term.</p>`;
        } else {
            savedQueriesEmptyState.innerHTML = `<i class="fas fa-bookmark"></i><h3>No Saved Queries Yet</h3><p>Save your favorite dork queries from the Query Playground!</p>`;
        }
        return;
    }

    savedQueriesEmptyState.style.display = 'none';
    savedQueriesList.style.display = 'grid';

    filteredQueries.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(query => {
        const engineStyle = engineColors[query.engine.toLowerCase()] || engineColors['default'];
        savedQueriesList.innerHTML += `
            <div class="saved-query-card" data-query-id="${query.id}">
                <div class="query-header">
                    <span>${query.name}</span>
                    <span class="query-engine" style="background-color: ${engineStyle.background}; color: ${engineStyle.color};">${query.engine.charAt(0).toUpperCase() + query.engine.slice(1)}</span>
                </div>
                <div class="query-string">${query.query}</div>
                <div class="query-description">${query.description || 'No description.'}</div>
                <div class="saved-query-tags">
                    ${query.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="query-actions">
                    <button class="btn btn-primary btn-sm load-query-btn" data-query-id="${query.id}">
                        <i class="fas fa-file-import"></i> Load
                    </button>
                    <button class="btn btn-secondary btn-sm execute-saved-query-btn" data-query-id="${query.id}">
                        <i class="fas fa-play"></i> Execute
                    </button>
                    <button class="btn btn-danger btn-sm delete-saved-query-btn" data-query-id="${query.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });

    // Event listeners for individual saved query action buttons (delegated in bindDorkAssistantEvents)
}

/**
 * Loads a saved query into the Query Playground for modification.
 * @param {string} queryId The ID of the saved query to load.
 */
function loadSavedQueryToPlayground(queryId) {
    const queryToLoad = dorkAssistantState.savedQueries.find(q => q.id === queryId);
    if (queryToLoad) {
        switchDorkSubTab('query-playground');

        document.getElementById('dorkKeywords').value = '';
        document.getElementById('dorkCustomInput').value = queryToLoad.query;
        document.getElementById('dorkEngineSelect').value = queryToLoad.engine;

        updateDorkAssistantState();
        showToast(`Saved query "${queryToLoad.name}" loaded to playground!`, 'success');
    }
}

/**
 * Executes a saved dork query directly.
 * @param {string} queryId The ID of the saved query to execute.
 */
function executeSavedQuery(queryId) {
    const queryToExecute = dorkAssistantState.savedQueries.find(q => q.id === queryId);
    if (queryToExecute) {
        executeDorkQuery(queryToExecute.query, queryToExecute.engine);
    }
}

/**
 * Deletes a saved dork query from storage.
 * @param {string} queryId The ID of the saved query to delete.
 */
function deleteSavedQuery(queryId) {
    // Find the query to get its name before deletion
    const queryToDelete = dorkAssistantState.savedQueries.find(q => q.id === queryId);

    if (confirm('Are you sure you want to delete this saved query?')) {
        dorkAssistantState.savedQueries = dorkAssistantState.savedQueries.filter(q => q.id !== queryId);
        saveSavedQueries();
        showToast('Saved query deleted!', 'error');
        // ADD THIS LINE:
        if (queryToDelete) {
            logActivity('deleted', 'dorkQuery', `Deleted saved dork query: ${queryToDelete.name}`, { queryId: queryId });
        } else {
            logActivity('deleted', 'dorkQuery', `Deleted unknown dork query with ID: ${queryId}`);
        }
        renderSavedQueries();
        updateDashboard();
    }
}

/**
 * Saves the current state of the dork assistant to local storage.
 */
function saveDorkAssistantState() {
    localStorage.setItem('osintDorkAssistantState', JSON.stringify(dorkAssistantState));
}

/**
 * Loads the saved state of the dork assistant from local storage.
 */
function loadDorkAssistantState() {
    const savedState = localStorage.getItem('osintDorkAssistantState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Safely assign properties, ensuring proper Date object conversion for 'createdAt'
        Object.assign(dorkAssistantState, {
            ...parsedState,
            savedQueries: (parsedState.savedQueries || []).map(query => ({
                ...query,
                createdAt: query.createdAt ? new Date(query.createdAt) : null
            }))
        });
    }
}


// Ensure these functions are accessible globally by attaching them to `window`
window.initDorkAssistant = initDorkAssistant;
window.switchDorkSubTab = switchDorkSubTab;
window.updateDorkAssistantState = updateDorkAssistantState;
window.handleOperatorButtonClick = handleOperatorButtonClick;
window.executeDorkQuery = executeDorkQuery;
window.clearDorkBuilder = clearDorkBuilder;
window.convertDorkQuery = convertDorkQuery;
window.convertToShodanCensys = convertToShodanCensys;
window.applySelectedTemplate = applySelectedTemplate;
window.executeTemplateQuery = executeTemplateQuery;
window.openEditExecuteTemplateModal = openEditExecuteTemplateModal;
window.handleEditExecuteTemplate = handleEditExecuteTemplate;
window.loadSavedQueries = loadSavedQueries;
window.saveSavedQueries = saveSavedQueries;
window.openSaveDorkQueryModal = openSaveDorkQueryModal;
window.handleSaveDorkQuery = handleSaveDorkQuery;
window.deleteSavedQuery = deleteSavedQuery;
window.loadSavedQueryToPlayground = loadSavedQueryToPlayground;
window.renderPreTemplates = renderPreTemplates;
window.renderSavedQueries = renderSavedQueries;
window.saveDorkAssistantState = saveDorkAssistantState; // Export save for initApp
window.loadDorkAssistantState = loadDorkAssistantState; // Export load for initApp
window.dorkTemplates = dorkTemplates; // Export dorkTemplates so dashboard can access total count