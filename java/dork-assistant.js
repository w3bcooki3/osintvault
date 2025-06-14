// dork-assistant.js

// --- Dork Assistant JS ---

/**
 * Initializes the Dork Assistant tab, loading saved queries and setting up default view.
 */
function initDorkAssistant() {
    loadSavedQueries();
    // bindDorkAssistantEvents(); // Event binding will be done in main bindEvents.js
    switchDorkSubTab(dorkAssistantState.currentDorkSubTab);
    updateDorkQueryPreview();
}

/**
 * Switches between the Dork Assistant subtabs ('Query Playground', 'Pre-Templates', 'Saved Queries').
 * @param {string} subtabName - The ID of the subtab to activate.
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

    if (subtabName !== 'query-playground') {
        dorkAssistantState.conversionJustPerformed = false;
        saveDorkAssistantState();
    }

    if (subtabName === 'pre-templates') {
        renderPreTemplates();
    } else if (subtabName === 'saved-queries') {
        renderSavedQueries();
    }
    saveDorkAssistantState();
}

/**
 * Updates the Dork Assistant state variables and the query preview based on user input.
 */
function updateDorkAssistantState() {
    const dorkKeywords = document.getElementById('dorkKeywords');
    const dorkCustomInput = document.getElementById('dorkCustomInput');
    const dorkEngineSelect = document.getElementById('dorkEngineSelect');

    if (dorkKeywords) dorkAssistantState.keywords = dorkKeywords.value.trim();
    if (dorkCustomInput) dorkAssistantState.customInput = dorkCustomInput.value.trim();
    if (dorkEngineSelect) dorkAssistantState.engine = dorkEngineSelect.value;
    
    updateDorkQueryPreview();
    saveDorkAssistantState();
}

/**
 * Handles clicks on operator buttons in the Query Playground, appending them to the custom input.
 * @param {Event} event - The click event.
 */
function handleOperatorButtonClick(event) {
    const operator = event.target.dataset.operator;
    const customInputEl = document.getElementById('dorkCustomInput');
    if (!customInputEl) return;

    let currentInput = customInputEl.value.trim();

    if (currentInput && !currentInput.endsWith(' ') && !operator.startsWith(':') && !operator.startsWith('-') && operator !== 'OR' && operator !== 'AND') {
        currentInput += ' ';
    }
    customInputEl.value = currentInput + operator;
    updateDorkAssistantState();
}

/**
 * Updates the live preview of the generated dork query.
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

    const dorkQueryPreview = document.getElementById('dorkQueryPreview');
    if (dorkQueryPreview) dorkQueryPreview.value = finalQuery;
    dorkAssistantState.previewQuery = finalQuery;
}

/**
 * Executes the given dork query in a new browser tab using the specified search engine.
 * If no query/engine is provided, uses the current playground query/engine.
 * @param {string} [queryToExecute=null] - The query string to execute.
 * @param {string} [engineToUse=null] - The search engine to use ('google', 'shodan', etc.).
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
 * Clears all input fields in the Query Playground.
 */
function clearDorkBuilder() {
    const dorkKeywords = document.getElementById('dorkKeywords');
    const dorkCustomInput = document.getElementById('dorkCustomInput');
    const dorkEngineSelect = document.getElementById('dorkEngineSelect');
    const convertedDorkPreview = document.getElementById('convertedDorkPreview');
    const executeConvertedDorkBtn = document.getElementById('executeConvertedDorkBtn');

    if (dorkKeywords) dorkKeywords.value = '';
    if (dorkCustomInput) dorkCustomInput.value = '';
    if (dorkEngineSelect) dorkEngineSelect.value = 'google';
    if (convertedDorkPreview) convertedDorkPreview.style.display = 'none';
    if (executeConvertedDorkBtn) executeConvertedDorkBtn.style.display = 'none';

    dorkAssistantState.keywords = '';
    dorkAssistantState.customInput = '';
    dorkAssistantState.engine = 'google';
    updateDorkQueryPreview();
    showToast('Query Playground cleared!');
    saveDorkAssistantState();
}

/**
 * Converts the current query in the playground to Shodan or Censys syntax.
 * @param {string} [targetEngineOverride=null] - Optional target engine to use for conversion.
 */
function convertDorkQuery(targetEngineOverride = null) {
    const originalQuery = dorkAssistantState.previewQuery;
    const conversionTargetSelect = document.getElementById('conversionTarget');
    const targetEngine = targetEngineOverride || (conversionTargetSelect ? conversionTargetSelect.value : null);
    const convertedPreviewEl = document.getElementById('convertedDorkPreview');
    const executeConvertedDorkBtn = document.getElementById('executeConvertedDorkBtn');


    if (!originalQuery) {
        showToast('No query to convert. Please build a query first.', 'warning');
        return;
    }
    if (!targetEngine) {
        showToast('Please select a target engine for conversion.', 'warning');
        return;
    }

    const convertedQuery = convertToShodanCensys(originalQuery, targetEngine);
    if (convertedPreviewEl) {
        convertedPreviewEl.value = convertedQuery;
        convertedPreviewEl.style.display = 'block';
    }
    if (executeConvertedDorkBtn) executeConvertedDorkBtn.style.display = 'block';
    dorkAssistantState.convertedQuery = convertedQuery;
    showToast(`Query converted for ${targetEngine.charAt(0).toUpperCase() + targetEngine.slice(1)}!`, 'success');
}

/**
 * Converts a given query string to Shodan or Censys query syntax.
 * @param {string} query - The original query string (Google-like).
 * @param {string} targetEngine - The target engine ('shodan' or 'censys').
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

    converted = converted.replace(/HOST:/gi, '');
    converted = converted.replace(/TITLE:/gi, '');
    converted = converted.replace(/URL:/gi, '');
    converted = converted.replace(/BODY:/gi, '');
    converted = converted.replace(/FILETYPE:/gi, '');

    return converted.replace(/\s+/g, ' ').trim();
}

/**
 * Renders the list of pre-defined dork templates based on category and search term.
 */
function renderPreTemplates() {
    const templatesList = document.getElementById('dorkTemplatesList');
    const preTemplatesEmptyState = document.getElementById('preTemplatesEmptyState');
    const categoriesListContainer = document.getElementById('preTemplateCategoriesList');
    const categoriesEmptyState = document.getElementById('preTemplateCategoriesEmptyState');
    const currentTemplateCategoryTitle = document.getElementById('currentTemplateCategoryTitle');
    const preTemplateSearchInput = document.getElementById('preTemplateSearchInput');

    if (!templatesList || !preTemplatesEmptyState || !categoriesListContainer || !categoriesEmptyState || !currentTemplateCategoryTitle || !preTemplateSearchInput) return;


    templatesList.innerHTML = '';
    categoriesListContainer.innerHTML = '';

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

    let allTemplatesCount = 0;
    const allCategoryItem = document.createElement('div');
    allCategoryItem.classList.add('category-item');
    allCategoryItem.dataset.category = 'All Templates';
    allCategoryItem.innerHTML = `<i class="fas fa-layer-group"></i> <span>All Templates</span> <span class="template-count">0</span>`;
    categoriesListContainer.appendChild(allCategoryItem);

    categories.forEach(categoryName => {
        const categoryTemplates = dorkTemplates[categoryName] || [];
        allTemplatesCount += categoryTemplates.length;

        const categoryItem = document.createElement('div');
        categoryItem.classList.add('category-item');
        categoryItem.dataset.category = categoryName;
        categoryItem.innerHTML = `<i class="fas fa-folder-open"></i> <span>${categoryName}</span> <span class="template-count">${categoryTemplates.length}</span>`;
        categoriesListContainer.appendChild(categoryItem);
    });

    const allCountSpan = allCategoryItem.querySelector('.template-count');
    if (allCountSpan) {
        allCountSpan.textContent = allTemplatesCount;
    }

    document.querySelectorAll('#preTemplateCategoriesList .category-item').forEach(item => {
        if (item.dataset.category === dorkAssistantState.currentTemplateCategory) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    currentTemplateCategoryTitle.textContent = dorkAssistantState.currentTemplateCategory;

    preTemplateSearchInput.value = dorkAssistantState.preTemplateSearchTerm;

    let templatesToRender = [];
    if (dorkAssistantState.currentTemplateCategory === 'All Templates') {
        Object.values(dorkTemplates).forEach(templateArray => {
            templatesToRender = templatesToRender.concat(templateArray);
        });
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
            templatesList.innerHTML += `
                <div class="dork-template-card" data-template-id="${template.id}">
                    <div class="template-header">
                        <span>${template.name}</span>
                        <span class="template-engine">${template.engine.charAt(0).toUpperCase() + template.engine.slice(1)}</span>
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
}

/**
 * Applies a selected pre-template's query and engine to the Query Playground.
 * @param {string} templateId - The ID of the template to apply.
 */
function applySelectedTemplate(templateId) {
    let template = null;
    for (const category in dorkTemplates) {
        template = dorkTemplates[category].find(t => t.id === templateId);
        if (template) break;
    }

    if (template) {
        switchDorkSubTab('query-playground');

        const dorkKeywords = document.getElementById('dorkKeywords');
        const dorkCustomInput = document.getElementById('dorkCustomInput');
        const dorkEngineSelect = document.getElementById('dorkEngineSelect');

        if (dorkKeywords) dorkKeywords.value = template.keywords;
        if (dorkCustomInput) dorkCustomInput.value = template.custom;
        if (dorkEngineSelect) dorkEngineSelect.value = template.engine;

        updateDorkAssistantState();
        showToast(`Template "${template.name}" applied to playground!`, 'success');
    }
}

/**
 * Executes a pre-template's query directly without applying it to the playground first.
 * @param {string} templateId - The ID of the template to execute.
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
 * Opens the 'Edit & Execute Template' modal, populating it with the selected template's data.
 * @param {string} templateId - The ID of the template to edit.
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

        const editExecuteTemplateId = document.getElementById('editExecuteTemplateId');
        const editExecuteTemplateName = document.getElementById('editExecuteTemplateName');
        const editExecuteTemplateQuery = document.getElementById('editExecuteTemplateQuery');
        const editExecuteTemplateEngine = document.getElementById('editExecuteTemplateEngine');
        const conversionSection = document.getElementById('editExecuteConversionSection');

        if (editExecuteTemplateId) editExecuteTemplateId.value = template.id;
        if (editExecuteTemplateName) editExecuteTemplateName.value = template.name;
        const fullQuery = `${template.keywords ? template.keywords + ' ' : ''}${template.custom}`;
        if (editExecuteTemplateQuery) editExecuteTemplateQuery.value = fullQuery.trim();
        if (editExecuteTemplateEngine) editExecuteTemplateEngine.value = template.engine;

        if (conversionSection) {
            conversionSection.style.display = 'none';
        }

        showModal('editExecuteTemplateModal');
    } else {
        showToast('Template not found!', 'error');
    }
}

/**
 * Handles the submission of the 'Edit & Execute Template' form.
 * Performs validation and may show a warning before executing the query.
 * @param {Event} e - The submit event.
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
    } else if ((engine === 'google' || engine === 'duckduckgo' || engine === 'bing' || engine === 'yandex') &&
               (looksLikeShodan(query) || looksLikeCensys(query))) {
        showWarning = true;
        warningMessage = `This query appears to be in Shodan or Censys format, but the selected engine is '${engine}'. ` +
                        `It might not work correctly. You can convert it to a general search query or continue execution anyway.`;
    }

    if (showWarning) {
        const dorkWarningMessage = document.getElementById('dorkWarningMessage');
        const dorkWarningModal = document.getElementById('dorkWarningModal');

        if (dorkWarningMessage) dorkWarningMessage.innerText = warningMessage;
        if (dorkWarningModal) {
            dorkWarningModal.dataset.tempQuery = query;
            dorkWarningModal.dataset.tempEngine = engine;
        }

        showModal('dorkWarningModal');
    } else {
        hideModal('editExecuteTemplateModal');
        executeDorkQuery(query, engine);
    }
}


// --- Saved Queries Logic ---

/**
 * Loads saved dork queries from localStorage into `dorkAssistantState.savedQueries`.
 */
function loadSavedQueries() {
    const saved = localStorage.getItem('osintDorkSavedQueries');
    if (saved) {
        dorkAssistantState.savedQueries = JSON.parse(saved);
        dorkAssistantState.savedQueries.forEach(query => {
            if (query.createdAt && typeof query.createdAt === 'string') {
                query.createdAt = new Date(query.createdAt);
            }
        });
    }
}

/**
 * Saves the current `dorkAssistantState.savedQueries` to localStorage.
 */
function saveSavedQueries() {
    localStorage.setItem('osintDorkSavedQueries', JSON.stringify(dorkAssistantState.savedQueries));
}

/**
 * Opens the 'Save Dork Query' modal, pre-populating it with the current playground query.
 */
function openSaveDorkQueryModal() {
    const currentQuery = dorkAssistantState.previewQuery;
    const currentEngine = dorkAssistantState.engine;

    if (!currentQuery) {
        showToast('No query in playground to save.', 'warning');
        return;
    }

    const saveDorkQueryForm = document.getElementById('saveDorkQueryForm');
    const savedQueryGenerated = document.getElementById('savedQueryGenerated');
    const savedQueryEngine = document.getElementById('savedQueryEngine');

    if (saveDorkQueryForm) saveDorkQueryForm.reset();
    if (savedQueryGenerated) savedQueryGenerated.value = currentQuery;
    if (savedQueryEngine) savedQueryEngine.value = currentEngine.charAt(0).toUpperCase() + currentEngine.slice(1);
    
    showModal('saveDorkQueryModal');
}

/**
 * Handles the form submission for saving a new dork query.
 * Adds the query to `dorkAssistantState.savedQueries` and re-renders the list.
 * @param {Event} e - The submit event.
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

    renderSavedQueries();
    switchDorkSubTab('saved-queries');
}

/**
 * Renders the list of saved dork queries, applying search and sorting.
 */
function renderSavedQueries() {
    const savedQueriesList = document.getElementById('savedQueriesList');
    const savedQueriesEmptyState = document.getElementById('savedQueriesEmptyState');
    if (!savedQueriesList || !savedQueriesEmptyState) return;

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
        savedQueriesList.innerHTML += `
            <div class="saved-query-card" data-query-id="${query.id}">
                <div class="query-header">
                    <span>${query.name}</span>
                    <span class="query-engine">${query.engine.charAt(0).toUpperCase() + query.engine.slice(1)}</span>
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
}

/**
 * Loads a saved query into the Query Playground.
 * @param {string} queryId - The ID of the saved query to load.
 */
function loadSavedQueryToPlayground(queryId) {
    const queryToLoad = dorkAssistantState.savedQueries.find(q => q.id === queryId);
    if (queryToLoad) {
        switchDorkSubTab('query-playground');

        const dorkKeywords = document.getElementById('dorkKeywords');
        const dorkCustomInput = document.getElementById('dorkCustomInput');
        const dorkEngineSelect = document.getElementById('dorkEngineSelect');

        if (dorkKeywords) dorkKeywords.value = '';
        if (dorkCustomInput) dorkCustomInput.value = queryToLoad.query;
        if (dorkEngineSelect) dorkEngineSelect.value = queryToLoad.engine;

        updateDorkAssistantState();
        showToast(`Saved query "${queryToLoad.name}" loaded to playground!`, 'success');
    }
}

/**
 * Executes a saved query directly.
 * @param {string} queryId - The ID of the saved query to execute.
 */
function executeSavedQuery(queryId) {
    const queryToExecute = dorkAssistantState.savedQueries.find(q => q.id === queryId);
    if (queryToExecute) {
        executeDorkQuery(queryToExecute.query, queryToExecute.engine);
    }
}

/**
 * Deletes a saved query after user confirmation.
 * @param {string} queryId - The ID of the saved query to delete.
 */
function deleteSavedQuery(queryId) {
    if (confirm('Are you sure you want to delete this saved query?')) {
        dorkAssistantState.savedQueries = dorkAssistantState.savedQueries.filter(q => q.id !== queryId);
        saveSavedQueries();
        showToast('Saved query deleted!', 'error');
        renderSavedQueries();
    }
}

/**
 * Saves the current state of `dorkAssistantState` to localStorage.
 */
function saveDorkAssistantState() {
    localStorage.setItem('osintDorkAssistantState', JSON.stringify(dorkAssistantState));
}

/**
 * Loads the Dork Assistant state from localStorage into `dorkAssistantState`.
 */
function loadDorkAssistantState() {
    const savedState = localStorage.getItem('osintDorkAssistantState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        Object.assign(dorkAssistantState, parsedState);
    }
}