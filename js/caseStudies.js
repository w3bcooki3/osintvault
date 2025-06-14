// caseStudies.js


/**
 * Loads case studies data. It first attempts to load from local storage.
 * If no data is found in local storage, or if parsing fails, it fetches
 * the default/sample data from the `caseStudies.json` file.
 *
 * @returns {Promise<Array>} A promise that resolves with the loaded case studies array.
 */
async function loadCaseStudiesData() {
    const savedCaseStudies = localStorage.getItem('osintCaseStudies');
    if (savedCaseStudies) {
        try {
            const parsed = JSON.parse(savedCaseStudies);
            if (Array.isArray(parsed)) {
                return parsed.map(cs => ({
                    ...cs,
                    addedDate: cs.addedDate ? new Date(cs.addedDate) : null,
                    starred: typeof cs.starred === 'undefined' ? false : cs.starred,
                    pinned: typeof cs.pinned === 'undefined' ? false : cs.pinned
                }));
            }
        } catch (e) {
            console.error("Error parsing saved case studies from localStorage, attempting to load from file:", e);
        }
    }
    // If no saved data, or parsing failed, load from file (which contains the samples).
    // Assumes fetchJsonData is a globally available utility function for fetching JSON files.
    const fetchedCaseStudies = await fetchJsonData('caseStudies.json');
    return fetchedCaseStudies.map(cs => ({
        ...cs,
        addedDate: new Date(cs.addedDate) // Ensure dates are Date objects upon loading
    }));
}

/**
 * Renders the list of case studies in either grid or list view.
 * Dynamically updates the content of `caseStudiesGrid` or `caseStudiesList`.
 */
function renderCaseStudies() {
    const caseStudiesGrid = document.getElementById('caseStudiesGrid');
    const caseStudiesList = document.getElementById('caseStudiesList');
    const emptyState = document.getElementById('emptyCaseStudiesState');
    const caseStudyViewToggleButton = document.getElementById('caseStudyViewToggle');

    const filteredCaseStudies = filterCaseStudies();

    // Update the view toggle button text based on the current view mode
    if (caseStudyViewToggleButton) {
        if (appState.caseStudyViewMode === 'grid') {
            caseStudyViewToggleButton.innerHTML = '<i class="fas fa-list"></i> List View';
            caseStudyViewToggleButton.title = 'Switch to List View';
        } else {
            caseStudyViewToggleButton.innerHTML = '<i class="fas fa-th"></i> Grid View';
            caseStudyViewToggleButton.title = 'Switch to Grid View';
        }
    }

    if (filteredCaseStudies.length === 0) {
        emptyState.style.display = 'block';
        caseStudiesGrid.style.display = 'none';
        caseStudiesList.style.display = 'none';
    } else {
        emptyState.style.display = 'none';

        if (appState.caseStudyViewMode === 'grid') {
            caseStudiesGrid.style.display = 'grid';
            caseStudiesList.style.display = 'none';
            caseStudiesGrid.innerHTML = filteredCaseStudies.map(caseStudy => createCaseStudyCard(caseStudy, 'grid')).join('');
        } else { // list view
            caseStudiesGrid.style.display = 'none';
            caseStudiesList.style.display = 'flex';
            caseStudiesList.innerHTML = filteredCaseStudies.map(caseStudy => createCaseStudyCard(caseStudy, 'list')).join('');
        }
    }
}

/**
 * Filters case studies based on current search term and incident type filter.
 * Assumes `appState` is a globally accessible object.
 * @returns {Array} An array of filtered and sorted case study objects.
 */
function filterCaseStudies() {
    let filtered = [...appState.caseStudies];

    const searchTerm = appState.caseStudyFilters.search.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(cs => {
            const searchFields = [
                cs.title, cs.summary, cs.incidentType, cs.threatActor,
                cs.osintTechniquesUsed ? cs.osintTechniquesUsed.join(' ') : '',
                cs.toolsUsed ? cs.toolsUsed.join(' ') : '',
                cs.lessonsLearned, cs.attackChain,
                cs.tags ? cs.tags.join(' ') : ''
            ].map(field => String(field || '').toLowerCase());
            return searchFields.some(field => field.includes(searchTerm));
        });
    }

    const selectedType = appState.caseStudyFilters.type;
    if (selectedType) {
        filtered = filtered.filter(cs => cs.incidentType === selectedType);
    }

    // Sort by addedDate descending (most recent first)
    filtered.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));

    return filtered;
}

/**
 * Creates the HTML for a single case study card, adapting to grid or list view.
 * @param {object} caseStudy The case study object.
 * @param {string} viewMode 'grid' or 'list'.
 * @returns {string} The HTML string for the case study card.
 */
function createCaseStudyCard(caseStudy, viewMode) {
    const isStarred = caseStudy.starred;
    const isPinned = caseStudy.pinned;
    const difficultyIcon = {
        'beginner': 'fas fa-leaf',
        'intermediate': 'fas fa-seedling',
        'advanced': 'fas fa-tree'
    }[caseStudy.difficulty] || 'fas fa-info-circle';

    const headerHtml = `
        <div>
            <div class="case-study-title">
                <i class="fas fa-microscope case-study-icon" style="color: #6c5ce7;"></i>
                <span>${caseStudy.title}</span>
            </div>
            <div class="case-study-meta">
                <span><i class="fas fa-tags"></i> ${caseStudy.incidentType.charAt(0).toUpperCase() + caseStudy.incidentType.slice(1)}</span>
                <span><i class="${difficultyIcon}"></i> ${caseStudy.difficulty.charAt(0).toUpperCase() + caseStudy.difficulty.slice(1)}</span>
                <span><i class="fas fa-calendar-alt"></i> ${caseStudy.dateRange}</span>
            </div>
        </div>
        <div class="case-study-actions">
            <button class="action-btn" data-action="edit-case-study" title="Edit Case Study">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn ${isStarred ? 'starred' : ''}" data-action="star-case-study" title="Star Case Study">
                <i class="fas fa-star"></i>
            </button>
            <button class="action-btn ${isPinned ? 'pinned' : ''}" data-action="pin-case-study" title="Pin Case Study">
                <i class="fas fa-thumbtack"></i>
            </button>
            <button class="action-btn" data-action="delete-case-study" title="Delete Case Study">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    if (viewMode === 'list') {
        return `
            <div class="case-study-card list-view ${isStarred ? 'starred' : ''} ${isPinned ? 'pinned' : ''}" data-case-study-id="${caseStudy.id}">
                <div class="case-study-header">
                    ${headerHtml}
                </div>
                <p class="case-study-description">${caseStudy.summary}</p>
                <div class="case-study-tags">
                    ${caseStudy.tags ? caseStudy.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
            </div>
        `;
    } else { // default to grid view
        return `
            <div class="case-study-card grid-view ${isStarred ? 'starred' : ''} ${isPinned ? 'pinned' : ''}" data-case-study-id="${caseStudy.id}">
                <div class="case-study-header">
                    ${headerHtml}
                </div>
                <p class="case-study-description">${caseStudy.summary}</p>
                <div class="case-study-tags">
                    ${caseStudy.tags ? caseStudy.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
            </div>
        `;
    }
}

/**
 * Opens the modal to display full details of a specific case study.
 * Assumes `showModal` and `showToast` are globally available functions.
 * @param {string} caseStudyId The ID of the case study to display.
 */
function openCaseStudyDetailModal(caseStudyId) {
    const caseStudy = appState.caseStudies.find(cs => cs.id === caseStudyId);
    if (!caseStudy) {
        showToast("Case study not found.", "error");
        return;
    }

    document.getElementById('detailCaseStudyTitle').textContent = caseStudy.title;
    document.getElementById('detailCaseStudyType').textContent = caseStudy.incidentType.charAt(0).toUpperCase() + caseStudy.incidentType.slice(1);
    document.getElementById('detailCaseStudyDate').textContent = caseStudy.dateRange;
    document.getElementById('detailCaseStudyActor').textContent = caseStudy.threatActor || 'N/A';
    document.getElementById('detailCaseStudyDifficulty').textContent = caseStudy.difficulty.charAt(0).toUpperCase() + caseStudy.difficulty.slice(1);
    document.getElementById('detailCaseStudySummary').textContent = caseStudy.summary;
    document.getElementById('detailCaseStudyAttackChain').innerHTML = caseStudy.attackChain;
    document.getElementById('detailCaseStudyTechniques').innerHTML = caseStudy.osintTechniquesUsed ? caseStudy.osintTechniquesUsed.map(t => `<li>${t}</li>`).join('') : '<li>No specific techniques listed.</li>';
    document.getElementById('detailCaseStudyTools').innerHTML = caseStudy.toolsUsed ? caseStudy.toolsUsed.map(t => `<li>${t}</li>`).join('') : '<li>No specific tools listed.</li>';
    document.getElementById('detailCaseStudyLessons').innerHTML = caseStudy.lessonsLearned;
    document.getElementById('detailCaseStudyTags').innerHTML = caseStudy.tags ? caseStudy.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';

    showModal('caseStudyDetailModal');
}

/**
 * Opens the "Add/Edit Case Study" modal for adding a new case study or editing an existing one.
 * Assumes `appState`, `showToast`, `showModal`, `generateId`, and `setupCaseStudyRichTextEditors` are global.
 * @param {'add'|'edit'} mode The mode of the modal.
 * @param {string} [caseStudyId=null] The ID of the case study to edit (only applicable in 'edit' mode).
 */
function openAddEditCaseStudyModal(mode, caseStudyId = null) { //
    if (appState.readOnlyMode) { //
        showToast("Cannot add/edit case studies in read-only shared view.", "warning"); //
        return; //
    }

    const form = document.getElementById('addEditCaseStudyForm'); //
    form.reset(); //
    document.getElementById('caseStudyId').value = ''; //

    document.getElementById('caseStudyAttackChain').innerHTML = ''; //
    document.getElementById('caseStudyLessons').innerHTML = ''; //

    const incidentTypeSelect = document.getElementById('caseStudyIncidentType'); //
    const newCaseStudyTypeInput = document.getElementById('newCaseStudyTypeInput'); //

    incidentTypeSelect.value = ''; //
    newCaseStudyTypeInput.style.display = 'none'; //
    newCaseStudyTypeInput.value = ''; //

    incidentTypeSelect.onchange = () => { //
        if (incidentTypeSelect.value === 'custom') { //
            newCaseStudyTypeInput.style.display = 'block'; //
            newCaseStudyTypeInput.setAttribute('required', 'required'); //
        } else {
            newCaseStudyTypeInput.style.display = 'none'; //
            newCaseStudyTypeInput.removeAttribute('required'); //
            newCaseStudyTypeInput.value = ''; //
        }
    };


    if (mode === 'add') { //
        document.getElementById('addEditCaseStudyModalTitle').textContent = 'Add New Case Study'; //
        document.getElementById('saveCaseStudyBtn').textContent = 'Add Case Study'; //
        document.getElementById('saveCaseStudyBtn').dataset.mode = 'add'; //
        document.getElementById('caseStudyDifficulty').value = 'intermediate'; //
        // No 'caseStudyId' assignment here, as it's a new entry.
        // The new ID will be generated in handleCaseStudyFormSubmit.
    } else if (mode === 'edit' && caseStudyId) { //
        const caseStudyToEdit = appState.caseStudies.find(cs => cs.id === caseStudyId); //
        if (!caseStudyToEdit) { //
            showToast("Case study not found for editing.", "error"); //
            return; //
        }

        document.getElementById('addEditCaseStudyModalTitle').textContent = 'Edit Case Study'; //
        document.getElementById('saveCaseStudyBtn').textContent = 'Save Changes'; //
        document.getElementById('saveCaseStudyBtn').dataset.mode = 'edit'; //

        // Populate fields with data from caseStudyToEdit
        document.getElementById('caseStudyId').value = caseStudyToEdit.id; //
        document.getElementById('caseStudyTitle').value = caseStudyToEdit.title; //

        if (Array.from(incidentTypeSelect.options).some(opt => opt.value === caseStudyToEdit.incidentType)) { //
            incidentTypeSelect.value = caseStudyToEdit.incidentType; //
        } else {
            incidentTypeSelect.value = 'custom'; //
            newCaseStudyTypeInput.style.display = 'block'; //
            newCaseStudyTypeInput.value = caseStudyToEdit.incidentType; //
        }

        document.getElementById('caseStudyDateRange').value = caseStudyToEdit.dateRange; //
        document.getElementById('caseStudyActor').value = caseStudyToEdit.threatActor || ''; //
        document.getElementById('caseStudyDifficulty').value = caseStudyToEdit.difficulty; //
        document.getElementById('caseStudySummary').value = caseStudyToEdit.summary; //
        document.getElementById('caseStudyAttackChain').innerHTML = caseStudyToEdit.attackChain; //
        document.getElementById('caseStudyOsintTechniques').value = caseStudyToEdit.osintTechniquesUsed ? caseStudyToEdit.osintTechniquesUsed.join(', ') : ''; //
        document.getElementById('caseStudyToolsUsed').value = caseStudyToEdit.toolsUsed ? caseStudyToEdit.toolsUsed.join(', ') : ''; //
        document.getElementById('caseStudyLessons').innerHTML = caseStudyToEdit.lessonsLearned; //
        document.getElementById('caseStudyTags').value = caseStudyToEdit.tags ? caseStudyToEdit.tags.join(', ') : ''; //
    }

    showModal('addEditCaseStudyModal'); //
    setupCaseStudyRichTextEditors(); //
}

/**
 * Handles the form submission for adding or editing a case study.
 * Adds new case studies or updates existing ones in the `appState.caseStudies` array.
 * Assumes `appState`, `showToast`, `hideModal`, `generateId`, `saveCaseStudies`,
 * `renderCaseStudies`, and `updateStats` are globally available functions.
 * @param {Event} e The form submission event.
 */
function handleCaseStudyFormSubmit(e) {
    e.preventDefault();
    if (appState.readOnlyMode) {
        showToast("Cannot save case studies in read-only shared view.", "warning");
        return;
    }

    const mode = document.getElementById('saveCaseStudyBtn').dataset.mode;
    const caseStudyId = document.getElementById('caseStudyId').value;

    const title = document.getElementById('caseStudyTitle').value.trim();
    let incidentType = document.getElementById('caseStudyIncidentType').value;
    const newCaseStudyTypeInput = document.getElementById('newCaseStudyTypeInput').value.trim();

    const dateRange = document.getElementById('caseStudyDateRange').value.trim();
    const actor = document.getElementById('caseStudyActor').value.trim();
    const difficulty = document.getElementById('caseStudyDifficulty').value;
    const summary = document.getElementById('caseStudySummary').value.trim();
    const attackChain = document.getElementById('caseStudyAttackChain').innerHTML.trim();
    const osintTechniques = document.getElementById('caseStudyOsintTechniques').value.split(',').map(t => t.trim()).filter(t => t);
    const toolsUsed = document.getElementById('caseStudyToolsUsed').value.split(',').map(t => t.trim()).filter(t => t);
    const lessonsLearned = document.getElementById('caseStudyLessons').innerHTML.trim();
    const tags = document.getElementById('caseStudyTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

    if (!title || !incidentType || !dateRange || !summary || !difficulty) {
        showToast('Please fill in all required fields (Title, Incident Type, Date, Summary, Difficulty).', 'error');
        return;
    }

    if (incidentType === 'custom') {
        if (!newCaseStudyTypeInput) {
            showToast('Please enter a custom incident type name.', 'error');
            return;
        }
        incidentType = newCaseStudyTypeInput.toLowerCase();
    }

    const newCaseStudy = {
        id: mode === 'add' ? generateId() : caseStudyId,
        title: title,
        incidentType: incidentType,
        dateRange: dateRange,
        summary: summary,
        attackChain: attackChain,
        osintTechniquesUsed: osintTechniques,
        toolsUsed: toolsUsed,
        lessonsLearned: lessonsLearned,
        threatActor: actor,
        difficulty: difficulty,
        tags: tags,
        starred: false,
        pinned: false,
        addedDate: new Date()
    };

    if (mode === 'add') {
        appState.caseStudies.push(newCaseStudy);
        showToast('Case study added successfully!');
    } else if (mode === 'edit') {
        const index = appState.caseStudies.findIndex(cs => cs.id === caseStudyId);
        if (index > -1) {
            newCaseStudy.starred = appState.caseStudies[index].starred;
            newCaseStudy.pinned = appState.caseStudies[index].pinned;
            appState.caseStudies[index] = newCaseStudy;
            showToast('Case study updated successfully!');
        } else {
            showToast('Error: Case study not found for update.', 'error');
        }
    }

    hideModal('addEditCaseStudyModal');
    saveCaseStudies();
    renderCaseStudies();
    updateDashboard();
}

/**
 * Saves the current `appState.caseStudies` array to local storage.
 */
function saveCaseStudies() {
    localStorage.setItem('osintCaseStudies', JSON.stringify(appState.caseStudies));
}

/**
 * Sets up the rich text editor functionality for the Attack Chain and Lessons Learned
 * fields in the Add/Edit Case Study modal. This includes handling contenteditable status
 * based on read-only mode and attaching toolbar button listeners.
 * Assumes `appState` and `document.execCommand` are globally available.
 */
function setupCaseStudyRichTextEditors() {
    const attackChainEditor = document.getElementById('caseStudyAttackChain');
    const lessonsEditor = document.getElementById('caseStudyLessons');

    if (!appState.readOnlyMode) {
        if (attackChainEditor) attackChainEditor.contentEditable = true;
        if (lessonsEditor) lessonsEditor.contentEditable = true;
    } else {
        if (attackChainEditor) attackChainEditor.contentEditable = false;
        if (lessonsEditor) lessonsEditor.contentEditable = false;
    }

    // The event listener for toolbar buttons (`formatting-btn`) is expected to be
    // delegated globally in the main script's `bindEvents` function, applying commands
    // to `document.activeElement`. So, no specific listener is added here directly to these editors.
}

/**
 * Handles actions (star, pin, edit, delete) on individual case study cards.
 * @param {Event} e The event object from the click.
 * @returns {void}
 */
function handleCaseStudyAction(e) {
    if (appState.readOnlyMode) {
        showToast("Cannot perform actions in read-only shared view.", "warning");
        return;
    }

    const targetBtn = e.target.closest('.action-btn');
    if (!targetBtn) return;

    e.stopPropagation(); // Prevent the card click from opening the detail modal
    const action = targetBtn.dataset.action;
    const caseStudyId = targetBtn.dataset.caseStudyId || targetBtn.closest('.case-study-card').dataset.caseStudyId;

    const caseStudy = appState.caseStudies.find(cs => cs.id === caseStudyId);
    if (!caseStudy) return;

    switch (action) {
        case 'edit-case-study':
            openAddEditCaseStudyModal('edit', caseStudy.id);
            break;
        case 'star-case-study':
            caseStudy.starred = !caseStudy.starred;
            showToast(caseStudy.starred ? 'Case study starred!' : 'Case study unstarred!');
            break;
        case 'pin-case-study':
            caseStudy.pinned = !caseStudy.pinned;
            showToast(caseStudy.pinned ? 'Case study pinned!' : 'Case study unpinned!');
            break;
        case 'delete-case-study':
            if (confirm('Are you sure you want to delete this case study?')) {
                appState.caseStudies = appState.caseStudies.filter(cs => cs.id !== caseStudyId);
                showToast('Case study deleted!', 'error');
            }
            break;
    }

    saveCaseStudies();
    renderCaseStudies();
    updateDashboard();
}


// Export the functions and data that need to be accessible from `index.html` or other modules.
// Assuming global functions like `fetchJsonData`, `appState`, `showToast`, `hideModal`,
// `generateId`, `updateStats` are available in the global scope or imported where needed.
window.loadCaseStudiesData = loadCaseStudiesData;
window.renderCaseStudies = renderCaseStudies;
window.filterCaseStudies = filterCaseStudies;
window.createCaseStudyCard = createCaseStudyCard;
window.openCaseStudyDetailModal = openCaseStudyDetailModal;
window.openAddEditCaseStudyModal = openAddEditCaseStudyModal;
window.handleCaseStudyFormSubmit = handleCaseStudyFormSubmit;
window.saveCaseStudies = saveCaseStudies;
window.setupCaseStudyRichTextEditors = setupCaseStudyRichTextEditors;
window.handleCaseStudyAction = handleCaseStudyAction;
