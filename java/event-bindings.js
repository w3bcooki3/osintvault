// event-bindings.js

/**
 * Binds all necessary event listeners for the application's UI elements.
 * This function should be called once after the DOM is loaded.
 */
function bindEvents() {
    // --- Global Controls ---
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            appState.filters.search = e.target.value;
            renderIntelligenceEntries();
        });
    }

    const searchScopeSelect = document.getElementById('searchScopeSelect');
    if (searchScopeSelect) {
        searchScopeSelect.addEventListener('change', (e) => {
            appState.filters.searchScope = e.target.value;
            renderIntelligenceEntries();
        });
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }

    const shareOptionsBtn = document.getElementById('shareOptionsBtn');
    if (shareOptionsBtn) {
        shareOptionsBtn.addEventListener('click', showShareOptionsModal);
    }

    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            appState.filters.category = e.target.value;
            renderIntelligenceEntries();
        });
    }

    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            appState.filters.sort = e.target.value;
            renderIntelligenceEntries();
        });
    }

    const showAllBtn = document.getElementById('showAllBtn');
    if (showAllBtn) {
        showAllBtn.addEventListener('click', clearFilters);
    }

    const pinAllBtn = document.getElementById('pinAllBtn');
    if (pinAllBtn) {
        pinAllBtn.addEventListener('click', togglePinFilter);
    }

    const starAllBtn = document.getElementById('starAllBtn');
    if (starAllBtn) {
        starAllBtn.addEventListener('click', toggleStarFilter);
    }

    const reportBtn = document.getElementById('reportBtn');
    if (reportBtn) {
        reportBtn.addEventListener('click', generateReport);
    }

    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', openMobileMenu);
    }

    // --- Tab Navigation ---
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });

    // --- Bulk Actions ---
    const toolsGrid = document.getElementById('toolsGrid');
    const customTabToolsGrid = document.getElementById('customTabToolsGrid');
    const intelligenceVaultEntries = document.getElementById('intelligenceVaultEntries');

    if (toolsGrid) toolsGrid.addEventListener('change', handleBulkSelection);
    if (customTabToolsGrid) customTabToolsGrid.addEventListener('change', handleBulkSelection);
    if (intelligenceVaultEntries) intelligenceVaultEntries.addEventListener('change', handleBulkSelection);

    const bulkStarBtn = document.getElementById('bulkStarBtn');
    if (bulkStarBtn) bulkStarBtn.addEventListener('click', () => bulkAction('star'));
    const bulkPinBtn = document.getElementById('bulkPinBtn');
    if (bulkPinBtn) bulkPinBtn.addEventListener('click', () => bulkAction('pin'));
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    if (bulkDeleteBtn) bulkDeleteBtn.addEventListener('click', () => bulkAction('delete'));


    // --- Intelligence Vault Tab Specific ---
    const addToolBtnIntelligenceVault = document.getElementById('addToolBtnIntelligenceVault');
    if (addToolBtnIntelligenceVault) {
        addToolBtnIntelligenceVault.addEventListener('click', openAddToolOnlyModal);
    }
    const vaultViewToggle = document.getElementById('vaultViewToggle');
    if (vaultViewToggle) {
        vaultViewToggle.addEventListener('click', toggleViewMode);
    }
    const addToolBtnEmptyState = document.getElementById('addToolBtnEmptyState');
    if (addToolBtnEmptyState) {
        addToolBtnEmptyState.addEventListener('click', openAddToolOnlyModal);
    }

    // Intelligence Vault Parent Tabs (Delegation)
    const intelligenceVaultParentTabsContainer = document.getElementById('intelligenceVaultParentTabs');
    if (intelligenceVaultParentTabsContainer) {
        intelligenceVaultParentTabsContainer.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.intelligence-vault-parent-tab');
            if (tabBtn && tabBtn.dataset.parentTab) {
                switchIntelligenceVaultParentTab(tabBtn.dataset.parentTab);
            }
        });
    }

    // Intelligence Vault Child Tabs (Delegation)
    const intelligenceVaultChildTabsContainer = document.getElementById('intelligenceVaultChildTabs');
    if (intelligenceVaultChildTabsContainer) {
        intelligenceVaultChildTabsContainer.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.intelligence-vault-child-tab');
            if (tabBtn && tabBtn.dataset.childTab) {
                switchIntelligenceVaultChildTab(tabBtn.dataset.childTab);
            }
        });
    }

    // --- Multi-Vault (Custom Tabs) Specific ---
    const createSubTabBtn = document.getElementById('createSubTabBtn');
    if (createSubTabBtn) {
        createSubTabBtn.addEventListener('click', showCreateSubTabModal);
    }
    const createSubTabBtnEmptyState = document.getElementById('createSubTabBtnEmptyState');
    if (createSubTabBtnEmptyState) {
        createSubTabBtnEmptyState.addEventListener('click', showCreateSubTabModal);
    }
    const editSubTabBtn = document.getElementById('editSubTabBtn');
    if (editSubTabBtn) {
        editSubTabBtn.addEventListener('click', openEditSubTabModal);
    }
    const deleteSubTabBtn = document.getElementById('deleteSubTabBtn');
    if (deleteSubTabBtn) {
        deleteSubTabBtn.addEventListener('click', handleDeleteSubTab);
    }
    const exportSubTabBtn = document.getElementById('exportSubTabBtn');
    if (exportSubTabBtn) {
        exportSubTabBtn.addEventListener('click', exportCustomTab);
    }
    const addEntryBtnCustomVault = document.getElementById('addEntryBtnCustomVault');
    if (addEntryBtnCustomVault) {
        addEntryBtnCustomVault.addEventListener('click', () => {
            document.getElementById('entryTypeSelect').value = 'tool';
            displayEntryForm();
            showModal('addEntryModal');
        });
    }
    const customVaultTimelineBtn = document.getElementById('customVaultTimelineBtn');
    if (customVaultTimelineBtn) {
        customVaultTimelineBtn.addEventListener('click', () => {
            if (appState.readOnlyMode) {
                showToast("Cannot view timeline in read-only shared view.", "warning");
                return;
            }
            appState.customVaultViewMode = 'timeline';
            saveState();
            document.getElementById('customTabToolsGrid').style.display = 'none';
            document.getElementById('customTabTimelineDisplay').style.display = 'block';
            document.getElementById('addEntryBtnCustomVault').style.display = 'none';
            document.getElementById('customVaultViewToggle').style.display = 'none';
            document.getElementById('bulkActions').style.display = 'none';
            document.querySelectorAll('.custom-vault-entry-child-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.custom-vault-entry-parent-tab').forEach(tab => {
                 tab.classList.remove('active');
            });
            renderCustomVaultTimeline();
            showToast('Viewing Custom Vault Timeline.');
        });
    }
    const customVaultViewToggle = document.getElementById('customVaultViewToggle');
    if (customVaultViewToggle) {
        customVaultViewToggle.addEventListener('click', toggleViewMode);
    }

    // Custom Vault Tab (Main Vaults list) Delegation
    const customSubTabs = document.getElementById('customSubTabs');
    if (customSubTabs) {
        customSubTabs.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.sub-nav-tab');
            if (tabBtn && tabBtn.dataset.subTabId) {
                switchCustomTab(tabBtn.dataset.subTabId);
            }
        });
    }

    // Custom Vault Entry Parent Tabs (Delegation)
    const customVaultEntryParentTabsContainer = document.getElementById('customVaultEntryParentTabs');
    if (customVaultEntryParentTabsContainer) {
        customVaultEntryParentTabsContainer.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.custom-vault-entry-parent-tab');
            if (tabBtn && tabBtn.dataset.parentTab) {
                switchCustomVaultParentTab(tabBtn.dataset.parentTab);
            }
        });
    }

    // Custom Vault Entry Child Tabs (Delegation)
    const customVaultEntryChildTabsContainer = document.getElementById('customVaultEntryChildTabs');
    if (customVaultEntryChildTabsContainer) {
        customVaultEntryChildTabsContainer.addEventListener('click', (e) => {
            const tabBtn = e.target.closest('.custom-vault-entry-child-tab');
            if (tabBtn && tabBtn.dataset.childTab) {
                switchCustomVaultEntrySubTab(tabBtn.dataset.childTab);
            }
        });
    }

    // --- Global Entry Actions (Delegation) ---
    if (toolsGrid) toolsGrid.addEventListener('click', handleEntryAction);
    if (customTabToolsGrid) customTabToolsGrid.addEventListener('click', handleEntryAction);
    if (intelligenceVaultEntries) intelligenceVaultEntries.addEventListener('click', handleEntryAction);


    // --- Modals and Forms Event Listeners ---

    // Add Tool Only Modal
    const cancelAddToolOnlyBtn = document.getElementById('cancelAddToolOnly');
    if (cancelAddToolOnlyBtn) {
        cancelAddToolOnlyBtn.onclick = () => hideModal('addToolOnlyModal');
    }
    const addToolOnlyForm = document.getElementById('addToolOnlyForm');
    if (addToolOnlyForm) {
        addToolOnlyForm.addEventListener('submit', handleAddToolOnly);
    }
    const toolOnlyCategorySelect = document.getElementById('toolOnlyCategory');
    if (toolOnlyCategorySelect) {
        toolOnlyCategorySelect.addEventListener('change', (e) => {
            const newCategoryInput = document.getElementById('newToolOnlyCategoryInput');
            if (newCategoryInput) {
                if (e.target.value === 'custom') {
                    newCategoryInput.style.display = 'block';
                    newCategoryInput.setAttribute('required', 'required');
                } else {
                    newCategoryInput.style.display = 'none';
                    newCategoryInput.removeAttribute('required');
                    newCategoryInput.value = '';
                }
            }
        });
    }
    const intelligenceVaultCategorySearchAdd = document.getElementById('intelligenceVaultCategorySearch');
    if (intelligenceVaultCategorySearchAdd) {
        intelligenceVaultCategorySearchAdd.addEventListener('input', (e) => {
            const currentSelections = Array.from(document.querySelectorAll('#intelligenceVaultCategoriesCheckboxesAddTool input[type="checkbox"]:checked')).map(cb => cb.value);
            populateIntelligenceVaultCategoriesCheckboxesAddTool(currentSelections, e.target.value);
        });
    }

    // Add Entry Modal (for Custom Vault)
    const cancelAddEntryBtn = document.getElementById('cancelAddEntry');
    if (cancelAddEntryBtn) {
        cancelAddEntryBtn.onclick = () => hideModal('addEntryModal');
    }
    const entryTypeSelect = document.getElementById('entryTypeSelect');
    if (entryTypeSelect) {
        entryTypeSelect.addEventListener('change', displayEntryForm);
    }
    const addEntryForm = document.getElementById('addEntryForm');
    if (addEntryForm) {
        addEntryForm.addEventListener('submit', handleAddEntry);
    }
    const toolCategorySelect = document.getElementById('toolCategory');
    if (toolCategorySelect) {
        toolCategorySelect.addEventListener('change', (e) => {
            const newCategoryInput = document.getElementById('newCategoryInput');
            if (newCategoryInput) {
                if (e.target.value === 'custom') {
                    newCategoryInput.style.display = 'block';
                    newCategoryInput.setAttribute('required', 'required');
                } else {
                    newCategoryInput.style.display = 'none';
                    newCategoryInput.removeAttribute('required');
                    newCategoryInput.value = '';
                }
            }
        });
    }

    // Edit Entry Modal
    const cancelEditEntryBtn = document.getElementById('cancelEditEntry');
    if (cancelEditEntryBtn) {
        cancelEditEntryBtn.onclick = () => hideModal('editEntryModal');
    }
    const editToolCategorySelect = document.getElementById('editToolCategory');
    if (editToolCategorySelect) {
        editToolCategorySelect.addEventListener('change', (e) => {
            const editNewCategoryInput = document.getElementById('editNewCategoryInput');
            if (editNewCategoryInput) {
                if (e.target.value === 'custom') {
                    editNewCategoryInput.style.display = 'block';
                    editNewCategoryInput.setAttribute('required', 'required');
                } else {
                    editNewCategoryInput.style.display = 'none';
                    editNewCategoryInput.removeAttribute('required');
                    editNewCategoryInput.value = '';
                }
            }
        });
    }
    const editEntryForm = document.getElementById('editEntryForm');
    if (editEntryForm) {
        editEntryForm.addEventListener('submit', handleEditEntry);
    }
    const intelligenceVaultCategorySearchEdit = document.getElementById('editIntelligenceVaultCategorySearch');
    if (intelligenceVaultCategorySearchEdit) {
        intelligenceVaultCategorySearchEdit.addEventListener('input', (e) => {
            const currentToolId = document.getElementById('editEntryId')?.value;
            const toolToEdit = appState.tools.find(t => t.id === currentToolId);
            if (toolToEdit) {
                populateIntelligenceVaultCategoriesCheckboxesEditTool(toolToEdit.intelligenceVaultCategories || [], e.target.value);
            }
        });
    }

    // Custom Metadata Fields
    const addMetadataBtn = document.getElementById('addMetadataBtn');
    if (addMetadataBtn) addMetadataBtn.addEventListener('click', () => addMetadataField('add'));
    const customMetadataEntries = document.getElementById('customMetadataEntries');
    if (customMetadataEntries) {
        customMetadataEntries.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-metadata-btn')) {
                e.target.closest('.form-group.metadata-entry')?.remove();
            }
        });
    }
    const editAddMetadataBtn = document.getElementById('editAddMetadataBtn');
    if (editAddMetadataBtn) editAddMetadataBtn.addEventListener('click', () => addMetadataField('edit'));
    const editCustomMetadataEntries = document.getElementById('editCustomMetadataEntries');
    if (editCustomMetadataEntries) {
        editCustomMetadataEntries.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-metadata-btn')) {
                e.target.closest('.form-group.metadata-entry')?.remove();
            }
        });
    }

    // Create Subtab Modal
    const cancelCreateSubTabBtn = document.getElementById('cancelCreateSubTab');
    if (cancelCreateSubTabBtn) {
        cancelCreateSubTabBtn.onclick = () => hideModal('createSubTabModal');
    }
    const createSubTabForm = document.getElementById('createSubTabForm');
    if (createSubTabForm) {
        createSubTabForm.addEventListener('submit', handleCreateSubTab);
    }
    const newSubTabIconPicker = document.getElementById('newSubTabIconPicker');
    if (newSubTabIconPicker) {
        newSubTabIconPicker.addEventListener('click', (e) => {
            const iconItem = e.target.closest('.icon-picker-item');
            if (iconItem) {
                document.querySelectorAll('#newSubTabIconPicker .icon-picker-item').forEach(item => item.classList.remove('selected'));
                iconItem.classList.add('selected');
                const newSubTabIcon = document.getElementById('newSubTabIcon');
                if (newSubTabIcon) newSubTabIcon.value = iconItem.dataset.iconClass;
            }
        });
    }
    const newSubTabColorPicker = document.getElementById('newSubTabColorPicker');
    if (newSubTabColorPicker) {
        newSubTabColorPicker.addEventListener('click', (e) => {
            const colorItem = e.target.closest('.color-picker-item');
            if (colorItem) {
                document.querySelectorAll('#newSubTabColorPicker .color-picker-item').forEach(item => item.classList.remove('selected'));
                colorItem.classList.add('selected');
                const newSubTabColor = document.getElementById('newSubTabColor');
                if (newSubTabColor) newSubTabColor.value = colorItem.dataset.colorValue;
            }
        });
    }

    // Edit Subtab Modal
    const cancelEditSubTabBtn = document.getElementById('cancelEditSubTab');
    if (cancelEditSubTabBtn) {
        cancelEditSubTabBtn.onclick = () => hideModal('editSubTabModal');
    }
    const editSubTabForm = document.getElementById('editSubTabForm');
    if (editSubTabForm) {
        editSubTabForm.addEventListener('submit', handleEditSubTab);
    }
    const editedSubTabIconPicker = document.getElementById('editedSubTabIconPicker');
    if (editedSubTabIconPicker) {
        editedSubTabIconPicker.addEventListener('click', (e) => {
            const iconItem = e.target.closest('.icon-picker-item');
            if (iconItem) {
                document.querySelectorAll('#editedSubTabIconPicker .icon-picker-item').forEach(item => item.classList.remove('selected'));
                iconItem.classList.add('selected');
                const editedSubTabIcon = document.getElementById('editedSubTabIcon');
                if (editedSubTabIcon) editedSubTabIcon.value = iconItem.dataset.iconClass;
            }
        });
    }
    const editedSubTabColorPicker = document.getElementById('editedSubTabColorPicker');
    if (editedSubTabColorPicker) {
        editedSubTabColorPicker.addEventListener('click', (e) => {
            const colorItem = e.target.closest('.color-picker-item');
            if (colorItem) {
                document.querySelectorAll('#editedSubTabColorPicker .color-picker-item').forEach(item => item.classList.remove('selected'));
                colorItem.classList.add('selected');
                const editedSubTabColor = document.getElementById('editedSubTabColor');
                if (editedSubTabColor) editedSubTabColor.value = colorItem.dataset.colorValue;
            }
        });
    }

    // Share Options Modal
    const cancelShareOptionsBtn = document.getElementById('cancelShareOptions');
    if (cancelShareOptionsBtn) {
        cancelShareOptionsBtn.onclick = () => hideModal('shareOptionsModal');
    }
    const shareScopeSelect = document.getElementById('shareScopeSelect');
    if (shareScopeSelect) {
        shareScopeSelect.addEventListener('change', handleShareScopeChange);
    }
    const shareForm = document.getElementById('shareForm');
    if (shareForm) {
        shareForm.addEventListener('submit', handleShareFormSubmit);
    }

    // Desktop Recommendation Modal
    const continueAnywayBtn = document.getElementById('continueAnywayBtn');
    if (continueAnywayBtn) {
        continueAnywayBtn.onclick = () => {
            hideModal('desktopRecommendationModal');
            sessionStorage.setItem('desktopRecommendationShown', 'true');
        };
    }

    // --- Timeline Tab Specific ---
    const addTimelineEventBtn = document.getElementById('addTimelineEventBtn');
    if (addTimelineEventBtn) {
        addTimelineEventBtn.addEventListener('click', () => openAddEventModal('add'));
    }
    const addEventBtnEmptyState = document.getElementById('addEventBtnEmptyState');
    if (addEventBtnEmptyState) {
        addEventBtnEmptyState.addEventListener('click', () => openAddEventModal('add'));
    }
    const exportTimelineBtn = document.getElementById('exportTimelineBtn');
    if (exportTimelineBtn) {
        exportTimelineBtn.addEventListener('click', exportTimeline);
    }
    const importTimelineBtn = document.getElementById('importTimelineBtn');
    if (importTimelineBtn) {
        importTimelineBtn.addEventListener('click', () => showModal('importTimelineModal'));
    }

    const cancelAddEventBtn = document.getElementById('cancelAddEvent');
    if (cancelAddEventBtn) {
        cancelAddEventBtn.onclick = () => hideModal('addEventModal');
    }
    const addEventForm = document.getElementById('addEventForm');
    if (addEventForm) {
        addEventForm.addEventListener('submit', handleAddEditEvent);
    }

    const cancelImportTimelineBtn = document.getElementById('cancelImportTimeline');
    if (cancelImportTimelineBtn) {
        cancelImportTimelineBtn.onclick = () => hideModal('importTimelineModal');
    }
    const confirmImportTimelineBtn = document.getElementById('confirmImportTimeline');
    if (confirmImportTimelineBtn) {
        confirmImportTimelineBtn.onclick = importTimeline;
    }

    const timelineEventsDisplay = document.getElementById('timeline-events-display');
    if (timelineEventsDisplay) {
        timelineEventsDisplay.addEventListener('click', handleTimelineEventAction);
    }

    // --- Case Studies Tab Specific ---
    const caseStudySearchInput = document.getElementById('caseStudySearchInput');
    if (caseStudySearchInput) {
        caseStudySearchInput.addEventListener('input', (e) => {
            appState.caseStudyFilters.search = e.target.value;
            renderCaseStudies();
        });
    }
    const caseStudyFilterSelect = document.getElementById('caseStudyFilterSelect');
    if (caseStudyFilterSelect) {
        caseStudyFilterSelect.addEventListener('change', (e) => {
            appState.caseStudyFilters.type = e.target.value;
            renderCaseStudies();
        });
    }
    const addCaseStudyBtn = document.getElementById('addCaseStudyBtn');
    if (addCaseStudyBtn) {
        addCaseStudyBtn.addEventListener('click', () => openAddEditCaseStudyModal('add'));
    }
    const addCaseStudyEmptyStateBtn = document.getElementById('addCaseStudyEmptyStateBtn');
    if (addCaseStudyEmptyStateBtn) {
        addCaseStudyEmptyStateBtn.addEventListener('click', () => openAddEditCaseStudyModal('add'));
    }
    const caseStudiesGrid = document.getElementById('caseStudiesGrid');
    if (caseStudiesGrid) {
        caseStudiesGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.case-study-card');
            const actionBtn = e.target.closest('.action-btn');
            if (card && !actionBtn) {
                const caseStudyId = card.dataset.caseStudyId;
                openCaseStudyDetailModal(caseStudyId);
            } else if (actionBtn) {
                handleCaseStudyAction(e);
            }
        });
    }
    const cancelCaseStudyAddEditBtn = document.getElementById('cancelCaseStudyAddEdit');
    if (cancelCaseStudyAddEditBtn) {
        cancelCaseStudyAddEditBtn.addEventListener('click', () => hideModal('addEditCaseStudyModal'));
    }
    const addEditCaseStudyForm = document.getElementById('addEditCaseStudyForm');
    if (addEditCaseStudyForm) {
        addEditCaseStudyForm.addEventListener('submit', handleCaseStudyFormSubmit);
    }
    const caseStudyIncidentTypeSelect = document.getElementById('caseStudyIncidentType');
    if (caseStudyIncidentTypeSelect) {
        caseStudyIncidentTypeSelect.addEventListener('change', (e) => {
            const newCaseStudyTypeInput = document.getElementById('newCaseStudyTypeInput');
            if (newCaseStudyTypeInput) {
                if (e.target.value === 'custom') {
                    newCaseStudyTypeInput.style.display = 'block';
                    newCaseStudyTypeInput.setAttribute('required', 'required');
                } else {
                    newCaseStudyTypeInput.style.display = 'none';
                    newCaseStudyTypeInput.removeAttribute('required');
                    newCaseStudyTypeInput.value = '';
                }
            }
        });
    }
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#addEditCaseStudyModal .formatting-toolbar .formatting-btn');
        if (!btn) return;

        const command = btn.dataset.command;
        const value = btn.dataset.value || null;
        const activeEditor = document.activeElement;

        if (activeEditor && (activeEditor.id === 'caseStudyAttackChain' || activeEditor.id === 'caseStudyLessons')) {
            if (command === 'createLink') {
                const url = prompt('Enter the URL:');
                if (url) {
                    document.execCommand(command, false, url);
                }
            } else {
                document.execCommand(command, false, value);
            }
            activeEditor.focus();
        }
    });


    // --- Threat Hunting Tab Specific ---
    const threatHuntingTabBtn = document.querySelector('[data-tab="threat-hunting"]');
    if (threatHuntingTabBtn) {
        threatHuntingTabBtn.addEventListener('click', () => {
            switchTab('threat-hunting');
        });
    }
    document.querySelectorAll('.th-subtab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            switchThSubTab(e.target.dataset.thSubtab);
        });
    });
    const scriptSearchInput = document.getElementById('scriptSearchInput');
    if (scriptSearchInput) {
        scriptSearchInput.addEventListener('input', (e) => {
            appState.scriptFilters.search = e.target.value;
            renderThreatHuntingScripts();
        });
    }
    const scriptLanguageFilter = document.getElementById('scriptLanguageFilter');
    if (scriptLanguageFilter) {
        scriptLanguageFilter.addEventListener('change', (e) => {
            appState.scriptFilters.language = e.target.value;
            renderThreatHuntingScripts();
        });
    }
    const addScriptBtn = document.getElementById('addScriptBtn');
    if (addScriptBtn) {
        addScriptBtn.addEventListener('click', () => openAddEditScriptModal('add'));
    }
    const addScriptEmptyStateBtn = document.getElementById('addScriptEmptyStateBtn');
    if (addScriptEmptyStateBtn) {
        addScriptEmptyStateBtn.addEventListener('click', () => openAddEditScriptModal('add'));
    }
    const cancelScriptAddEditBtn = document.getElementById('cancelScriptAddEdit');
    if (cancelScriptAddEditBtn) {
        cancelScriptAddEditBtn.onclick = () => hideModal('addEditScriptModal');
    }
    const addEditScriptForm = document.getElementById('addEditScriptForm');
    if (addEditScriptForm) {
        addEditScriptForm.addEventListener('submit', handleAddEditScriptFormSubmit);
    }
    const scriptLibraryGrid = document.getElementById('scriptLibraryGrid');
    if (scriptLibraryGrid) {
        scriptLibraryGrid.addEventListener('click', handleScriptAction);
    }
    const copyScriptCodeBtn = document.getElementById('copyScriptCodeBtn');
    if (copyScriptCodeBtn) {
        copyScriptCodeBtn.addEventListener('click', () => {
            const displayScriptCode = document.getElementById('displayScriptCode');
            if (displayScriptCode) copyToClipboard(displayScriptCode.textContent);
            hideModal('scriptCodeDisplayModal');
        });
    }


    // --- Threat Intel (Threats Tab) Specific ---
    const refreshThreatsBtn = document.getElementById('refreshThreatsBtn');
    if (refreshThreatsBtn) {
        refreshThreatsBtn.addEventListener('click', loadThreats);
    }


    // --- OSINT Handbook & Notes Specific ---
    document.querySelectorAll('.handbook-subtab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            switchHandbookSubtab(e.target.dataset.subtab);
        });
    });
    const newNoteBtn = document.getElementById('new-note-btn');
    if (newNoteBtn) newNoteBtn.addEventListener('click', createNewNote);
    const backToNotesBtn = document.getElementById('back-to-notes-btn');
    if (backToNotesBtn) backToNotesBtn.addEventListener('click', showNotesList);
    const saveNoteBtn = document.getElementById('save-note-btn');
    if (saveNoteBtn) saveNoteBtn.addEventListener('click', saveCurrentNote);
    const editNoteInEditorBtn = document.getElementById('edit-note-btn');
    if (editNoteInEditorBtn) {
        editNoteInEditorBtn.addEventListener('click', () => {
            notesState.editMode = true;
            showNoteEditor();
            focusEditor();
        });
    }
    const cancelEditNoteBtn = document.getElementById('cancel-edit-note-btn');
    if (cancelEditNoteBtn) {
        cancelEditNoteBtn.addEventListener('click', () => {
            notesState.editMode = false;
            showNoteEditor();
            showToast('Changes discarded.', 'info');
        });
    }
    const searchNotesInput = document.getElementById('search-notes');
    if (searchNotesInput) {
        searchNotesInput.addEventListener('input', (e) => {
            searchNotes(e.target.value);
        });
    }
    const noteSortFilterElement = document.getElementById('noteSortFilter');
    if (noteSortFilterElement) {
        noteSortFilterElement.addEventListener('change', (e) => {
            notesState.noteSortFilter = e.target.value;
            localStorage.setItem('noteSortFilter', notesState.noteSortFilter);
            sortNotes();
            renderNotesList();
        });
    }
    const tagInput = document.getElementById('note-tags-input');
    if (tagInput) {
        tagInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTagToCurrentNote();
            }
        });
    }
    const addTagBtn = document.getElementById('add-tag-btn');
    if (addTagBtn) addTagBtn.addEventListener('click', addTagToCurrentNote);
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#formatting-toolbar .formatting-btn');
        if (!btn) return;

        const command = btn.dataset.command;
        const value = btn.dataset.value || null;
        const editor = document.getElementById('note-content-editor');

        if (!editor || editor.contentEditable !== 'true') return;

        if (command === 'createLink') {
            const url = prompt('Enter the URL:');
            if (url) {
                document.execCommand(command, false, url);
            }
        } else if (command === 'formatBlock') {
            document.execCommand(command, false, value);
        } else {
            document.execCommand(command, false, value);
        }
        editor.focus();
    });

    // Handbook specific controls
    const addSectionBtn = document.getElementById('add-section-btn');
    if (addSectionBtn) addSectionBtn.addEventListener('click', openAddSectionModal);
    const editSectionBtn = document.getElementById('edit-section-btn');
    if (editSectionBtn) editSectionBtn.addEventListener('click', openEditSectionModal);
    const deleteSectionBtn = document.getElementById('delete-section-btn');
    if (deleteSectionBtn) deleteSectionBtn.addEventListener('click', confirmDeleteSection);
    const handbookSearchInput = document.getElementById('handbook-search');
    if (handbookSearchInput) {
        const searchIcon = document.querySelector('.handbook-search-icon');
        if (searchIcon) {
            searchIcon.style.cursor = 'pointer';
            searchIcon.addEventListener('click', () => {
                handbookSearchInput.value = '';
                handbookSearchInput.dispatchEvent(new Event('input'));
                handbookSearchInput.focus();
            });
        }
    }
}

// Helper functions that were embedded within bindEvents, now moved here
// as they are needed for binding.

/**
 * Opens the mobile sidebar menu, populating it with cloned navigation and controls.
 */
function openMobileMenu() {
    const mobileSidebarMenu = document.getElementById('mobileSidebarMenu');
    const mobileMenuContent = mobileSidebarMenu?.querySelector('.mobile-menu-content');
    const mainNavTabs = document.querySelector('.main-nav-tabs');

    if (!mobileSidebarMenu || !mobileMenuContent || !mainNavTabs) return;

    const mobileMenuOverlay = document.createElement('div');
    mobileMenuOverlay.classList.add('mobile-menu-overlay');
    document.body.appendChild(mobileMenuOverlay);

    mobileMenuContent.innerHTML = ''; // Clear existing content

    const navClonedContainer = document.createElement('div');
    navClonedContainer.classList.add('mobile-nav-cloned');
    mobileMenuContent.appendChild(navClonedContainer);

    mainNavTabs.querySelectorAll('.nav-tab').forEach(originalTab => {
        const newTabButton = document.createElement('button');
        newTabButton.classList.add('nav-tab');
        newTabButton.dataset.tab = originalTab.dataset.tab;
        newTabButton.innerHTML = originalTab.innerHTML;
        newTabButton.addEventListener('click', () => {
            switchTab(originalTab.dataset.tab);
            closeMobileMenu();
        });
        navClonedContainer.appendChild(newTabButton);
    });

    const controlsClonedContainer = document.createElement('div');
    controlsClonedContainer.classList.add('mobile-controls-cloned');
    mobileMenuContent.appendChild(controlsClonedContainer);

    const searchContainerHtml = `
        <div class="search-container">
            <input type="text" class="search-input" id="mobileSearchInput" placeholder="Search...">
            <i class="fas fa-search search-icon"></i>
            <select id="mobileSearchScopeSelect">
                <option value="currentTab">Current Tab</option>
                <option value="allVault">All Intelligence Vault</option>
                <option value="allData">All Data</option>
            </select>
        </div>
    `;
    controlsClonedContainer.insertAdjacentHTML('beforeend', searchContainerHtml);

    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        const mobileExportBtn = document.createElement('button');
        mobileExportBtn.className = exportBtn.className + ' mobile-btn';
        mobileExportBtn.innerHTML = exportBtn.innerHTML;
        mobileExportBtn.addEventListener('click', () => { exportData(); closeMobileMenu(); });
        controlsClonedContainer.appendChild(mobileExportBtn);
    }

    const shareOptionsBtn = document.getElementById('shareOptionsBtn');
    if (shareOptionsBtn) {
        const mobileShareOptionsBtn = document.createElement('button');
        mobileShareOptionsBtn.className = shareOptionsBtn.className + ' mobile-btn';
        mobileShareOptionsBtn.innerHTML = shareOptionsBtn.innerHTML;
        mobileShareOptionsBtn.addEventListener('click', () => { showShareOptionsModal(); closeMobileMenu(); });
        controlsClonedContainer.appendChild(mobileShareOptionsBtn);
    }

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const mobileThemeToggle = document.createElement('button');
        mobileThemeToggle.className = themeToggle.className + ' mobile-btn';
        mobileThemeToggle.innerHTML = themeToggle.innerHTML;
        mobileThemeToggle.addEventListener('click', toggleTheme);
        controlsClonedContainer.appendChild(mobileThemeToggle);
    }

    const mobileSearchInput = mobileMenuContent.querySelector('#mobileSearchInput');
    if (mobileSearchInput) {
        mobileSearchInput.value = appState.filters.search;
        mobileSearchInput.addEventListener('input', (e) => {
            appState.filters.search = e.target.value;
            renderIntelligenceEntries();
        });
    }

    const mobileSearchScopeSelect = mobileMenuContent.querySelector('#mobileSearchScopeSelect');
    if (mobileSearchScopeSelect) {
        mobileSearchScopeSelect.value = appState.filters.searchScope;
        mobileSearchScopeSelect.addEventListener('change', (e) => {
            appState.filters.searchScope = e.target.value;
            renderIntelligenceEntries();
        });
    }

    mobileSidebarMenu.classList.add('active');
    document.body.classList.add('no-scroll');

    const closeMenuBtn = mobileSidebarMenu.querySelector('.close-menu-btn');
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileMenu);
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
}

/**
 * Closes the mobile sidebar menu and removes the overlay.
 */
function closeMobileMenu() {
    const mobileSidebarMenu = document.getElementById('mobileSidebarMenu');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');

    if (mobileSidebarMenu) {
        mobileSidebarMenu.classList.remove('active');
    }
    if (mobileMenuOverlay) {
        mobileMenuOverlay.remove();
    }
    document.body.classList.remove('no-scroll');
}

/**
 * Displays the modal with sharing options for various data scopes.
 * Populates the custom vault selection dropdown dynamically.
 */
function showShareOptionsModal() {
    if (appState.readOnlyMode) {
        showToast("Cannot generate new shared links in read-only view.", "warning");
        return;
    }
    updateShareScopeSelect();
    showModal('shareOptionsModal');
}

/**
 * Updates the dropdowns in the share options modal with available custom vaults.
 */
function updateShareScopeSelect() {
    const shareScopeSelect = document.getElementById('shareScopeSelect');
    const selectCustomTabForSharing = document.getElementById('selectCustomTabForSharing');

    if (!shareScopeSelect || !selectCustomTabForSharing) return;

    for (let i = shareScopeSelect.options.length - 1; i >= 0; i--) {
        const option = shareScopeSelect.options[i];
        if (option.value.startsWith('custom-')) {
            shareScopeSelect.remove(i);
        }
    }

    selectCustomTabForSharing.innerHTML = '';

    if (appState.customTabs.length > 0) {
        appState.customTabs.forEach(tab => {
            const option = document.createElement('option');
            option.value = tab.id;
            option.textContent = `Custom Vault: ${tab.name}`;
            selectCustomTabForSharing.appendChild(option);
        });
        selectCustomTabForSharing.disabled = false;
    } else {
        const noVaultsOption = document.createElement('option');
        noVaultsOption.value = '';
        noVaultsOption.textContent = 'No custom vaults available';
        selectCustomTabForSharing.appendChild(noVaultsOption);
        selectCustomTabForSharing.disabled = true;
    }

    handleShareScopeChange();
}

/**
 * Handles the change event on the 'What would you like to share?' dropdown in the share modal.
 * Toggles the visibility of the 'Select a Custom Vault' dropdown.
 */
function handleShareScopeChange() {
    const shareScopeSelect = document.getElementById('shareScopeSelect');
    const specificCustomTabSelectorDiv = document.getElementById('specificCustomTabSelector');

    if (!shareScopeSelect || !specificCustomTabSelectorDiv) return;

    if (shareScopeSelect.value === 'specificCustomTabPlaceholder') {
        specificCustomTabSelectorDiv.style.display = 'block';
    } else {
        specificCustomTabSelectorDiv.style.display = 'none';
    }
}

/**
 * Handles the form submission for generating a shareable link.
 * Constructs the URL based on selected scope and entries, then displays it.
 * @param {Event} e - The submit event.
 */
function handleShareFormSubmit(e) {
    e.preventDefault();
    if (appState.readOnlyMode) {
        showToast("Cannot generate new shared links in read-only view.", "warning");
        return;
    }

    const shareScope = document.getElementById('shareScopeSelect')?.value;
    let targetTabId = '';
    let sharedEntries = [];

    if (shareScope === 'currentTab') {
        targetTabId = appState.currentTab;
        if (targetTabId === 'intelligence-vault') {
            targetTabId = appState.currentIntelligenceVaultChildTab;
            sharedEntries = filterEntries();
        } else if (targetTabId === 'custom-tabs') {
            if (!appState.currentCustomTab) {
                showToast('No custom vault selected in Multi-Vault to share.', 'error');
                return;
            }
            targetTabId = appState.currentCustomTab;
            sharedEntries = filterEntries();
        } else {
            sharedEntries = filterEntries();
        }
    } else if (shareScope === 'allVault') {
        targetTabId = 'allVault';
        sharedEntries = [...(appState.tools || [])];
    } else if (shareScope === 'allData') {
        targetTabId = 'allData';
        sharedEntries = [
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
    } else if (shareScope === 'specificCustomTabPlaceholder') {
        const selectedCustomVaultId = document.getElementById('selectCustomTabForSharing')?.value;
        if (!selectedCustomVaultId) {
            showToast('Please select a specific custom vault to share.', 'error');
            return;
        }
        targetTabId = selectedCustomVaultId;
        const customTab = appState.customTabs.find(tab => tab.id === targetTabId);
        if (customTab) {
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
            sharedEntries = allEntriesCombined.filter(entry => (entry.customTabs || []).includes(customTab.id));
        }
    }

    if (sharedEntries.length === 0) {
        showToast('No entries found to share in the selected scope. Please add entries to your vault(s).', 'warning');
        return;
    }

    const sharedIds = sharedEntries.map(entry => entry.id).join(',');
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('scope', shareScope === 'specificCustomTabPlaceholder' ? 'customTab' : shareScope);
    currentUrl.searchParams.set('tab', targetTabId);
    currentUrl.searchParams.set('ids', sharedIds);

    const shareableLink = currentUrl.toString();

    promptForCopyLink(shareableLink);
    hideModal('shareOptionsModal');
}

/**
 * Displays a modal with the generated shareable link and a copy button.
 * @param {string} link - The shareable URL to display.
 */
function promptForCopyLink(link) {
    const modalContent = `
        <h3 style="margin-bottom: 20px; color: var(--primary);"><i class="fas fa-share-alt"></i> Shareable Link Generated</h3>
        <p style="margin-bottom: 15px; color: var(--text-primary);">
            Copy this link to share a read-only view of your selected intelligence:
        </p>
        <div style="background: var(--bg-tertiary); padding: 15px; border-radius: 8px; border: 1px solid var(--border); word-break: break-all; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; font-size: 0.9em;">
            ${link}
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" class="btn btn-secondary" id="closeShareLinkModal">Close</button>
            <button type="button" class="btn btn-primary" id="copyShareLinkBtn">
                <i class="fas fa-copy"></i> Copy Link
            </button>
        </div>
    `;
    const shareLinkModal = document.createElement('div');
    shareLinkModal.classList.add('modal');
    shareLinkModal.id = 'shareLinkDisplayModal';
    shareLinkModal.innerHTML = `<div class="modal-content">${modalContent}</div>`;
    document.body.appendChild(shareLinkModal);
    showModal('shareLinkDisplayModal');

    document.getElementById('copyShareLinkBtn')?.addEventListener('click', () => {
        copyToClipboard(link);
        hideModal('shareLinkDisplayModal');
        shareLinkModal.remove();
    });

    document.getElementById('closeShareLinkModal')?.addEventListener('click', () => {
        hideModal('shareLinkDisplayModal');
        shareLinkModal.remove();
    });
}