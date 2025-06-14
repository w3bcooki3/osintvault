// case-studies.js

/**
 * Loads case study data from localStorage, or initializes with sample data if none exists.
 * Ensures Date objects are correctly parsed and 'starred'/'pinned' properties are present.
 * @returns {Array<object>} An array of case study objects.
 */
function loadCaseStudiesData() {
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
            console.error("Error parsing saved case studies, loading sample data:", e);
        }
    }
    return sampleCaseStudies.map(cs => ({
        ...cs,
        addedDate: new Date(cs.addedDate)
    }));
}

/**
 * Renders the list of case studies in the 'Cyber Investigation Case Studies' tab.
 * Filters cases based on current search and type filters.
 */
function renderCaseStudies() {
    const caseStudiesGrid = document.getElementById('caseStudiesGrid');
    const emptyState = document.getElementById('emptyCaseStudiesState');

    if (!caseStudiesGrid || !emptyState) return; // Safety check

    const filteredCaseStudies = filterCaseStudies();

    if (filteredCaseStudies.length === 0) {
        emptyState.style.display = 'block';
        caseStudiesGrid.style.display = 'none';
        if (appState.caseStudyFilters.search || appState.caseStudyFilters.type) {
            emptyState.innerHTML = `<i class="fas fa-search"></i><h3>No matching case studies found</h3><p>Adjust your search or filters.</p><button class="btn btn-primary" id="addCaseStudyEmptyStateBtn"><i class="fas fa-plus"></i> Add First Case Study</button>`;
        } else {
            emptyState.innerHTML = `<i class="fas fa-book-open"></i><h3>No Case Studies Found</h3><p>Add your first cyber investigation case study!</p><button class="btn btn-primary" id="addCaseStudyEmptyStateBtn"><i class="fas fa-plus"></i> Add First Case Study</button>`;
        }
        // Re-attach event listener for the button if it was re-rendered
        document.getElementById('addCaseStudyEmptyStateBtn')?.addEventListener('click', () => openAddEditCaseStudyModal('add'));
    } else {
        emptyState.style.display = 'none';
        caseStudiesGrid.style.display = 'grid';
        caseStudiesGrid.innerHTML = filteredCaseStudies.map(caseStudy => createCaseStudyCard(caseStudy)).join('');
    }
}

/**
 * Filters the list of case studies based on the current search term and incident type.
 * @returns {Array<object>} The filtered and sorted array of case study objects.
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

    filtered.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));

    return filtered;
}

/**
 * Creates the HTML string for a single case study card in the grid/list view.
 * @param {object} caseStudy - The case study object.
 * @returns {string} The HTML string for the case study card.
 */
function createCaseStudyCard(caseStudy) {
    const isStarred = caseStudy.starred;
    const isPinned = caseStudy.pinned;
    const difficultyIcon = {
        'beginner': 'fas fa-leaf',
        'intermediate': 'fas fa-seedling',
        'advanced': 'fas fa-tree'
    }[caseStudy.difficulty] || 'fas fa-info-circle';

    return `
        <div class="case-study-card ${isStarred ? 'starred' : ''} ${isPinned ? 'pinned' : ''}" data-case-study-id="${caseStudy.id}">
            <div class="case-study-header">
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
            </div>
            <p class="case-study-description">${caseStudy.summary}</p>
            <div class="case-study-tags">
                ${caseStudy.tags ? caseStudy.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
            </div>
        </div>
    `;
}

/**
 * Opens the modal to display full details of a specific case study.
 * @param {string} caseStudyId - The ID of the case study to display.
 */
function openCaseStudyDetailModal(caseStudyId) {
    const caseStudy = appState.caseStudies.find(cs => cs.id === caseStudyId);
    if (!caseStudy) {
        showToast("Case study not found.", "error");
        return;
    }

    const detailTitle = document.getElementById('detailCaseStudyTitle');
    const detailType = document.getElementById('detailCaseStudyType');
    const detailDate = document.getElementById('detailCaseStudyDate');
    const detailActor = document.getElementById('detailCaseStudyActor');
    const detailDifficulty = document.getElementById('detailCaseStudyDifficulty');
    const detailSummary = document.getElementById('detailCaseStudySummary');
    const detailAttackChain = document.getElementById('detailCaseStudyAttackChain');
    const detailTechniques = document.getElementById('detailCaseStudyTechniques');
    const detailTools = document.getElementById('detailCaseStudyTools');
    const detailLessons = document.getElementById('detailCaseStudyLessons');
    const detailTags = document.getElementById('detailCaseStudyTags');


    if (detailTitle) detailTitle.textContent = caseStudy.title;
    if (detailType) detailType.textContent = caseStudy.incidentType.charAt(0).toUpperCase() + caseStudy.incidentType.slice(1);
    if (detailDate) detailDate.textContent = caseStudy.dateRange;
    if (detailActor) detailActor.textContent = caseStudy.threatActor || 'N/A';
    if (detailDifficulty) detailDifficulty.textContent = caseStudy.difficulty.charAt(0).toUpperCase() + caseStudy.difficulty.slice(1);
    if (detailSummary) detailSummary.textContent = caseStudy.summary;
    if (detailAttackChain) detailAttackChain.innerHTML = caseStudy.attackChain;
    if (detailTechniques) detailTechniques.innerHTML = caseStudy.osintTechniquesUsed ? caseStudy.osintTechniquesUsed.map(t => `<li>${t}</li>`).join('') : '<li>No specific techniques listed.</li>';
    if (detailTools) detailTools.innerHTML = caseStudy.toolsUsed ? caseStudy.toolsUsed.map(t => `<li>${t}</li>`).join('') : '<li>No specific tools listed.</li>';
    if (detailLessons) detailLessons.innerHTML = caseStudy.lessonsLearned;
    if (detailTags) detailTags.innerHTML = caseStudy.tags ? caseStudy.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';

    showModal('caseStudyDetailModal');
}

/**
 * Opens the modal for adding a new case study or editing an existing one.
 * Populates fields if in 'edit' mode.
 * @param {string} mode - 'add' or 'edit'.
 * @param {string} [caseStudyId=null] - The ID of the case study to edit (only for 'edit' mode).
 */
function openAddEditCaseStudyModal(mode, caseStudyId = null) {
    if (appState.readOnlyMode) {
        showToast("Cannot add/edit case studies in read-only shared view.", "warning");
        return;
    }

    const form = document.getElementById('addEditCaseStudyForm');
    if (form) form.reset();
    const caseStudyIdInput = document.getElementById('caseStudyId');
    if (caseStudyIdInput) caseStudyIdInput.value = '';

    const caseStudyAttackChain = document.getElementById('caseStudyAttackChain');
    const caseStudyLessons = document.getElementById('caseStudyLessons');
    if (caseStudyAttackChain) caseStudyAttackChain.innerHTML = '';
    if (caseStudyLessons) caseStudyLessons.innerHTML = '';

    const incidentTypeSelect = document.getElementById('caseStudyIncidentType');
    const newCaseStudyTypeInput = document.getElementById('newCaseStudyTypeInput');

    if (incidentTypeSelect) incidentTypeSelect.value = '';
    if (newCaseStudyTypeInput) {
        newCaseStudyTypeInput.style.display = 'none';
        newCaseStudyTypeInput.value = '';
    }

    if (incidentTypeSelect) {
        incidentTypeSelect.onchange = () => {
            if (incidentTypeSelect.value === 'custom') {
                if (newCaseStudyTypeInput) {
                    newCaseStudyTypeInput.style.display = 'block';
                    newCaseStudyTypeInput.setAttribute('required', 'required');
                }
            } else {
                if (newCaseStudyTypeInput) {
                    newCaseStudyTypeInput.style.display = 'none';
                    newCaseStudyTypeInput.removeAttribute('required');
                    newCaseStudyTypeInput.value = '';
                }
            }
        };
    }

    const addEditCaseStudyModalTitle = document.getElementById('addEditCaseStudyModalTitle');
    const saveCaseStudyBtn = document.getElementById('saveCaseStudyBtn');
    const caseStudyDifficulty = document.getElementById('caseStudyDifficulty');

    if (mode === 'add') {
        if (addEditCaseStudyModalTitle) addEditCaseStudyModalTitle.textContent = 'Add New Case Study';
        if (saveCaseStudyBtn) {
            saveCaseStudyBtn.textContent = 'Add Case Study';
            saveCaseStudyBtn.dataset.mode = 'add';
        }
        if (caseStudyDifficulty) caseStudyDifficulty.value = 'intermediate';
    } else if (mode === 'edit' && caseStudyId) {
        const caseStudyToEdit = appState.caseStudies.find(cs => cs.id === caseStudyId);
        if (!caseStudyToEdit) {
            showToast("Case study not found for editing.", "error");
            return;
        }

        if (addEditCaseStudyModalTitle) addEditCaseStudyModalTitle.textContent = 'Edit Case Study';
        if (saveCaseStudyBtn) {
            saveCaseStudyBtn.textContent = 'Save Changes';
            saveCaseStudyBtn.dataset.mode = 'edit';
        }

        if (caseStudyIdInput) caseStudyIdInput.value = caseStudyToEdit.id;
        if (document.getElementById('caseStudyTitle')) document.getElementById('caseStudyTitle').value = caseStudyToEdit.title;
        
        if (incidentTypeSelect) {
            if (Array.from(incidentTypeSelect.options).some(opt => opt.value === caseStudyToEdit.incidentType)) {
                incidentTypeSelect.value = caseStudyToEdit.incidentType;
            } else {
                incidentTypeSelect.value = 'custom';
                if (newCaseStudyTypeInput) {
                    newCaseStudyTypeInput.style.display = 'block';
                    newCaseStudyTypeInput.value = caseStudyToEdit.incidentType;
                }
            }
        }

        if (document.getElementById('caseStudyDateRange')) document.getElementById('caseStudyDateRange').value = caseStudyToEdit.dateRange;
        if (document.getElementById('caseStudyActor')) document.getElementById('caseStudyActor').value = caseStudyToEdit.threatActor || '';
        if (caseStudyDifficulty) caseStudyDifficulty.value = caseStudyToEdit.difficulty;
        if (document.getElementById('caseStudySummary')) document.getElementById('caseStudySummary').value = caseStudyToEdit.summary;
        if (caseStudyAttackChain) caseStudyAttackChain.innerHTML = caseStudyToEdit.attackChain;
        if (document.getElementById('caseStudyOsintTechniques')) document.getElementById('caseStudyOsintTechniques').value = caseStudyToEdit.osintTechniquesUsed ? caseStudyToEdit.osintTechniquesUsed.join(', ') : '';
        if (document.getElementById('caseStudyToolsUsed')) document.getElementById('caseStudyToolsUsed').value = caseStudyToEdit.toolsUsed ? caseStudyToEdit.toolsUsed.join(', ') : '';
        if (caseStudyLessons) caseStudyLessons.innerHTML = caseStudyToEdit.lessonsLearned;
        if (document.getElementById('caseStudyTags')) document.getElementById('caseStudyTags').value = caseStudyToEdit.tags ? caseStudyToEdit.tags.join(', ') : '';
    }

    showModal('addEditCaseStudyModal');
    setupCaseStudyRichTextEditors();
}

/**
 * Handles the form submission for adding or editing a case study.
 * Validates input, updates `appState.caseStudies`, and saves the state.
 * @param {Event} e - The submit event.
 */
function handleCaseStudyFormSubmit(e) {
    e.preventDefault();
    if (appState.readOnlyMode) {
        showToast("Cannot save case studies in read-only shared view.", "warning");
        return;
    }

    const saveCaseStudyBtn = document.getElementById('saveCaseStudyBtn');
    const mode = saveCaseStudyBtn ? saveCaseStudyBtn.dataset.mode : null;
    const caseStudyId = document.getElementById('caseStudyId')?.value;

    const title = document.getElementById('caseStudyTitle')?.value.trim();
    let incidentType = document.getElementById('caseStudyIncidentType')?.value;
    const newCaseStudyTypeInput = document.getElementById('newCaseStudyTypeInput')?.value.trim();

    const dateRange = document.getElementById('caseStudyDateRange')?.value.trim();
    const actor = document.getElementById('caseStudyActor')?.value.trim();
    const difficulty = document.getElementById('caseStudyDifficulty')?.value;
    const summary = document.getElementById('caseStudySummary')?.value.trim();
    const attackChain = document.getElementById('caseStudyAttackChain')?.innerHTML.trim();
    const osintTechniques = (document.getElementById('caseStudyOsintTechniques')?.value || '').split(',').map(t => t.trim()).filter(t => t);
    const toolsUsed = (document.getElementById('caseStudyToolsUsed')?.value || '').split(',').map(t => t.trim()).filter(t => t);
    const lessonsLearned = document.getElementById('caseStudyLessons')?.innerHTML.trim();
    const tags = (document.getElementById('caseStudyTags')?.value || '').split(',').map(tag => tag.trim()).filter(tag => tag);

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
        id: mode === 'add' ? generateId() : caseStudyId, // Assuming generateId is available
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
    updateStats(); // Assuming updateStats is available
}

/**
 * Saves the current `appState.caseStudies` to localStorage.
 */
function saveCaseStudies() {
    localStorage.setItem('osintCaseStudies', JSON.stringify(appState.caseStudies));
}

/**
 * Sets up the rich text editor for attack chain and lessons learned sections in the case study modal.
 * Makes them contenteditable if not in read-only mode.
 */
function setupCaseStudyRichTextEditors() {
    const attackChainEditor = document.getElementById('caseStudyAttackChain');
    const lessonsEditor = document.getElementById('caseStudyLessons');

    if (attackChainEditor) attackChainEditor.contentEditable = !appState.readOnlyMode;
    if (lessonsEditor) lessonsEditor.contentEditable = !appState.readOnlyMode;
}

/**
 * Handles actions on individual case study cards (edit, star, pin, delete).
 * @param {Event} e - The click event.
 */
function handleCaseStudyAction(e) {
    if (appState.readOnlyMode) {
        showToast("Cannot perform actions in read-only shared view.", "warning");
        return;
    }

    const targetBtn = e.target.closest('.action-btn');
    if (!targetBtn) return;

    e.stopPropagation();
    const action = targetBtn.dataset.action;
    const caseStudyId = targetBtn.dataset.caseStudyId || targetBtn.closest('.case-study-card')?.dataset.caseStudyId;

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
    updateStats();
}