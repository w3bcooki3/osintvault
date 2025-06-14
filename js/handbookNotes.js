// handbookNotes.js

// Declare notesState here, as it's part of the notes functionality
let notesState = {
    notes: [],
    currentNote: null,
    editMode: false,
    noteSortFilter: localStorage.getItem('noteSortFilter') || 'updated_desc'
};

// Declare handbookData as a variable to hold fetched data
let handbookData = { sections: [] };

// Utility function to generate a unique ID for notes (if not already global)
function generateNoteId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Initializes both the OSINT Handbook and My Notes functionalities.
 * Assumes `appState` is a globally accessible object.
 */
function initHandbookAndNotes() {
    // Initialize the active subtab based on appState
    const activeSubtab = appState.currentHandbookSubTab || 'handbook'; // Assuming appState.currentHandbookSubTab is defined globally

    // Switch to the appropriate subtab
    switchHandbookSubtab(activeSubtab);

    // Initialize handbook functionality (now asynchronous)
    initHandbook();

    // Initialize notes functionality
    initNotes();
}

/**
 * Switches between the "OSINT Handbook" and "My Notes" subtabs.
 * Assumes `appState` is a globally accessible object and `saveState` is a global function.
 * @param {string} subtabName The ID of the subtab to activate ('handbook' or 'notes').
 */
function switchHandbookSubtab(subtabName) {
    // Store the current subtab in appState
    appState.currentHandbookSubTab = subtabName;

    // Update subtab buttons
    document.querySelectorAll('.handbook-subtab').forEach(tab => {
        tab.classList.remove('active');
    });

    const targetSubTabBtn = document.querySelector(`.handbook-subtab[data-subtab="${subtabName}"]`);
    if (targetSubTabBtn) {
        targetSubTabBtn.classList.add('active');
    }

    // Update content containers
    document.querySelectorAll('.handbook-subtab-content').forEach(content => {
        content.style.display = 'none';
    });

    const targetContent = document.getElementById(`${subtabName}-content`);
    if (targetContent) {
        targetContent.style.display = 'block';
    }

    // Save state
    saveState();
}

/**
 * Initializes the handbook functionality, including fetching data,
 * rendering the sidebar, and displaying the default section.
 * Assumes `fetchJsonData` is a globally accessible async utility function.
 */
async function initHandbook() {
    const handbookSidebar = document.getElementById('handbook-sidebar');
    if (!handbookSidebar) {
        console.error("Handbook sidebar element not found!");
        return;
    }

    // Load handbook data from local storage or fetch from JSON
    const savedHandbookData = localStorage.getItem('osintHandbookData');
    if (savedHandbookData) {
        try {
            handbookData = JSON.parse(savedHandbookData);
        } catch (e) {
            console.error("Error parsing saved handbook data, fetching defaults:", e);
            handbookData.sections = await fetchJsonData('/data/handbookData.json'); // Assumes handbookData.json exists
        }
    } else {
        handbookData.sections = await fetchJsonData('/data/handbookData.json'); // Assumes handbookData.json exists
    }

    // Render the sidebar
    renderHandbookSidebar();

    // Show the first section by default, or the previously active one
    let sectionToDisplay = appState.currentHandbookSection || (handbookData.sections.length > 0 ? handbookData.sections[0].id : null);

    if (sectionToDisplay) {
        const firstSection = findSectionById(sectionToDisplay);
        if (firstSection) {
            showHandbookSection(firstSection.id);
            // Also ensure the corresponding nav item is active
            const activeNavItem = document.querySelector(`.handbook-nav-item[data-section="${firstSection.id}"]`);
            if (activeNavItem) {
                activeNavItem.classList.add('active');
            }
            // If it's a subcategory, ensure parent is expanded
            const parentSubcategories = activeNavItem ? activeNavItem.closest('.handbook-subcategories') : null;
            if (parentSubcategories) {
                const categoryId = parentSubcategories.id.replace('-subcategories', '');
                const categoryHeader = document.querySelector(`.handbook-category-header[data-category="${categoryId}"]`);
                if (categoryHeader) {
                    parentSubcategories.style.maxHeight = parentSubcategories.scrollHeight + "px";
                    categoryHeader.querySelector('.category-toggle').classList.add('rotate');
                }
            }
        }
    }

    // Attach handbook specific controls (like add/edit/delete buttons)
    addHandbookControls();
    initSectionEditor(); // Setup rich text editor for sections
}

/**
 * Renders the navigation sidebar for the OSINT Handbook.
 * This function builds the HTML structure for categories and sections.
 */
function renderHandbookSidebar() {
    const sidebar = document.getElementById('handbook-sidebar');
    if (!sidebar) return; // Safety check

    sidebar.innerHTML = ''; // Clear all content in the sidebar

    let sidebarHTML = '';

    handbookData.sections.forEach(section => {
        if (section.isCategory) {
            sidebarHTML += `
                <div class="handbook-category">
                    <div class="handbook-category-header" data-category="${section.id}">
                        <i class="${section.icon}"></i>
                        <span>${section.title}</span>
                        <i class="fas fa-chevron-down category-toggle"></i>
                    </div>
                    <div class="handbook-subcategories" id="${section.id}-subcategories">
            `;
            section.subcategories.forEach(subcategory => {
                sidebarHTML += `
                    <div class="handbook-nav-item" data-section="${subcategory.id}">
                        <i class="${subcategory.icon}"></i>
                        <span>${subcategory.title}</span>
                    </div>
                `;
            });
            sidebarHTML += `
                    </div>
                </div>
            `;
        } else {
            sidebarHTML += `
                <div class="handbook-nav-item" data-section="${section.id}">
                    <i class="${section.icon}"></i>
                    <span>${section.title}</span>
                </div>
            `;
        }
    });

    sidebar.innerHTML = sidebarHTML; // Set the new content

    // Add event listeners for sidebar navigation (re-add them as content is dynamic)
    addHandbookSidebarListeners();
}


/**
 * Adds event listeners to the handbook sidebar elements.
 * This is called after the sidebar is rendered to ensure listeners are attached to new elements.
 */
function addHandbookSidebarListeners() {
    // Category headers toggle
    document.querySelectorAll('.handbook-category-header').forEach(header => {
        header.addEventListener('click', () => {
            const categoryId = header.dataset.category;
            const subcategoriesEl = document.getElementById(`${categoryId}-subcategories`);

            if (subcategoriesEl) {
                // Toggle the subcategories visibility
                if (subcategoriesEl.style.maxHeight && subcategoriesEl.style.maxHeight !== '0px') {
                    subcategoriesEl.style.maxHeight = null;
                    header.querySelector('.category-toggle').classList.remove('rotate');
                } else {
                    subcategoriesEl.style.maxHeight = subcategoriesEl.scrollHeight + "px";
                    header.querySelector('.category-toggle').classList.add('rotate');
                }
            }
        });
    });

    // Section item clicks
    document.querySelectorAll('.handbook-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            showHandbookSection(sectionId);

            // Update active state
            document.querySelectorAll('.handbook-nav-item').forEach(i => {
                i.classList.remove('active');
            });
            item.classList.add('active');

            // If on mobile, close the sidebar
            if (window.innerWidth < 768) {
                document.getElementById('handbook-sidebar').classList.remove('mobile-open');
                document.body.classList.remove('handbook-overlay-active'); // Remove overlay
            }
        });
    });

    // Mobile sidebar toggle button
    const handbookMobileToggle = document.getElementById('handbook-mobile-toggle');
    if (handbookMobileToggle) {
        handbookMobileToggle.addEventListener('click', toggleHandbookSidebar);
    }
}



/**
 * Finds a handbook section (or sub-section) by its ID.
 * @param {string} sectionId The ID of the section to find.
 * @returns {object|null} The section object if found, otherwise null.
 */
function findSectionById(sectionId) {
    let foundSection = null;

    handbookData.sections.forEach(section => {
        if (section.id === sectionId) {
            foundSection = section;
        } else if (section.isCategory && section.subcategories) {
            section.subcategories.forEach(subsection => {
                if (subsection.id === sectionId) {
                    foundSection = subsection;
                }
            });
        }
    });

    return foundSection;
}

/**
 * Displays the content of a specific handbook section in the main content area.
 * Assumes `appState`, `showToast`, `localStorage` access are globally available.
 * @param {string} sectionId The ID of the section to display.
 */
function showHandbookSection(sectionId) {
    const contentContainer = document.getElementById('handbook-article-area');
    if (!contentContainer) return;

    const sectionData = findSectionById(sectionId);

    if (!sectionData) {
        contentContainer.innerHTML = `<div class="empty-state"><h3>Section Not Found</h3><p>The requested handbook section could not be loaded.</p></div>`;
        return;
    }

    contentContainer.innerHTML = sectionData.content;

    // Add copy button functionality for code blocks
    contentContainer.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const codeBlock = btn.parentElement.querySelector('code');
            if (codeBlock) {
                navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                    btn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 2000);
                    showToast('Code copied to clipboard!', 'success');
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    showToast('Failed to copy code.', 'error');
                });
            }
        });
    });

    // Add event listeners for ALL user notes textareas within the newly added content
    contentContainer.querySelectorAll('textarea[id^="notes-"]').forEach(textarea => {
        // Load initial value from localStorage
        const savedNote = localStorage.getItem(textarea.id);
        if (savedNote) {
            textarea.value = savedNote;
        }
        // Add listener for saving on input
        textarea.addEventListener('input', (e) => {
            localStorage.setItem(e.target.id, e.target.value);
        });
    });

    // Update appState to remember the last viewed section
    appState.currentHandbookSection = sectionId;
    saveState();
    addHandbookControls();
}

/**
 * Initializes controls for adding, editing, and deleting handbook sections.
 * Assumes `appState`, `showModal`, `showToast` are globally available.
 */
function addHandbookControls() {
    const handbookContent = document.querySelector('.handbook-content-container');
    if (!handbookContent) return;

    // We still want to check if the controls exist, but their *initial* display
    // will be determined below. We only create them once.
    let addBtn = document.getElementById('add-section-btn');
    let editBtn = document.getElementById('edit-section-btn');
    let deleteBtn = document.getElementById('delete-section-btn');

    if (!addBtn) { // If buttons don't exist, create them
        const controlsHtml = `
            <div class="handbook-controls">
                <button id="add-section-btn" class="btn btn-primary handbook-btn">
                    <i class="fas fa-plus"></i> Add New Section
                </button>
                <button id="edit-section-btn" class="btn btn-secondary handbook-btn" style="display: none;">
                    <i class="fas fa-edit"></i> Edit Section
                </button>
                <button id="delete-section-btn" class="btn btn-danger handbook-btn" style="display: none;">
                    <i class="fas fa-trash"></i> Delete Section
                </button>
            </div>
        `;
        handbookContent.insertAdjacentHTML('afterbegin', controlsHtml);

        // Get references to the newly created buttons
        addBtn = document.getElementById('add-section-btn');
        editBtn = document.getElementById('edit-section-btn');
        deleteBtn = document.getElementById('delete-section-btn');

        // Attach event listeners only once during creation
        addBtn.addEventListener('click', openAddSectionModal);
        editBtn.addEventListener('click', openEditSectionModal);
        deleteBtn.addEventListener('click', confirmDeleteSection);
    }

    // Now, control visibility based on read-only mode and whether a section is active
    if (appState.readOnlyMode) {
        // In read-only mode, hide all modification buttons
        if (addBtn) addBtn.style.display = 'none';
        if (editBtn) editBtn.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'none';
        const controls = document.querySelector('.handbook-controls');
        if(controls) controls.style.display = 'none'; // Also hide the container if all buttons are hidden
    } else {
        // In editable mode, "Add New Section" is always visible.
        // "Edit" and "Delete" depend on whether a section is currently selected.
        if (addBtn) addBtn.style.display = 'inline-flex';
        const controls = document.querySelector('.handbook-controls');
        if(controls) controls.style.display = 'flex'; // Ensure container is visible

        // Check if there's an actively selected handbook section
        if (appState.currentHandbookSection) {
            if (editBtn) editBtn.style.display = 'inline-flex';
            if (deleteBtn) deleteBtn.style.display = 'inline-flex';
        } else {
            // No section is active, so hide edit/delete
            if (editBtn) editBtn.style.display = 'none';
            if (deleteBtn) deleteBtn.style.display = 'none';
        }
    }
}


/**
 * Opens the modal for adding a new handbook section.
 */
function openAddSectionModal() {
    if (appState.readOnlyMode) {
        showToast("Cannot add sections in read-only shared view.", "warning");
        return;
    }

    let modal = document.getElementById('section-editor-modal');
    if (!modal) {
        modal = createSectionEditorModal();
        document.body.appendChild(modal);
    }

    document.getElementById('section-editor-form').reset();
    document.getElementById('section-editor-title').textContent = 'Add New Section';
    document.getElementById('section-id').value = generateId(); // Use global generateId
    document.getElementById('section-parent').value = '';
    document.getElementById('section-editor-content').innerHTML = '';

    document.getElementById('section-parent-group').style.display = 'block';
    document.getElementById('section-icon-group').style.display = 'block';

    populateParentCategorySelect();
    populateIconPicker('section-icon-picker', 'section-icon'); // Assumes populateIconPicker is global

    showModal('section-editor-modal');
}

/**
 * Opens the modal for editing an existing handbook section.
 */
function openEditSectionModal() {
    if (appState.readOnlyMode) {
        showToast("Cannot edit sections in read-only shared view.", "warning");
        return;
    }

    const currentSectionId = appState.currentHandbookSection; // Get ID from appState
    if (!currentSectionId) {
        showToast('Please select a section to edit', 'warning');
        return;
    }

    const sectionData = findSectionById(currentSectionId);
    if (!sectionData) {
        showToast('Section not found', 'error');
        return;
    }

    let modal = document.getElementById('section-editor-modal');
    if (!modal) {
        modal = createSectionEditorModal();
        document.body.appendChild(modal);
    }

    document.getElementById('section-editor-title').textContent = 'Edit Section';
    document.getElementById('section-id').value = sectionData.id;
    document.getElementById('section-title').value = sectionData.title;
    document.getElementById('section-icon').value = sectionData.icon || 'fas fa-book';
    document.getElementById('section-editor-content').innerHTML = sectionData.content;

    document.getElementById('section-parent-group').style.display = 'none'; // Cannot change parent on edit

    populateIconPicker('section-icon-picker', 'section-icon', sectionData.icon); // Populate with current icon

    showModal('section-editor-modal');
}

/**
 * Prompts the user to confirm deletion of the current handbook section.
 */
function confirmDeleteSection() {
    if (appState.readOnlyMode) {
        showToast("Cannot delete sections in read-only shared view.", "warning");
        return;
    }

    const currentSectionId = appState.currentHandbookSection;
    if (!currentSectionId) {
        showToast('Please select a section to delete', 'warning');
        return;
    }

    const sectionData = findSectionById(currentSectionId);
    if (!sectionData) {
        showToast('Section not found', 'error');
        return;
    }

    if (confirm(`Are you sure you want to delete the section "${sectionData.title}"? This action cannot be undone.`)) {
        deleteSection(currentSectionId);
    }
}

/**
 * Deletes a handbook section by its ID.
 * @param {string} sectionId The ID of the section to delete.
 */
function deleteSection(sectionId) {
    let deleted = false;

    // Function to recursively find and delete section
    function recursiveDelete(sectionsArray) {
        for (let i = 0; i < sectionsArray.length; i++) {
            if (sectionsArray[i].id === sectionId) {
                sectionsArray.splice(i, 1);
                deleted = true;
                return true; // Found and deleted
            }
            if (sectionsArray[i].isCategory && sectionsArray[i].subcategories) {
                if (recursiveDelete(sectionsArray[i].subcategories)) {
                    deleted = true;
                    return true;
                }
            }
        }
        return false;
    }

    recursiveDelete(handbookData.sections);

    if (deleted) {
        // If the deleted section was the currently viewed one, select the first available section
        if (appState.currentHandbookSection === sectionId) {
            appState.currentHandbookSection = null; // Clear selection
            if (handbookData.sections.length > 0) {
                const firstSection = handbookData.sections[0];
                if (firstSection.isCategory && firstSection.subcategories && firstSection.subcategories.length > 0) {
                    appState.currentHandbookSection = firstSection.subcategories[0].id;
                } else {
                    appState.currentHandbookSection = firstSection.id;
                }
            }
        }
        saveHandbookData();
        renderHandbookSidebar();
        // Re-display content for the new current section, or empty state
        if (appState.currentHandbookSection) {
            showHandbookSection(appState.currentHandbookSection);
        } else {
            document.getElementById('handbook-article-area').innerHTML = `<div class="empty-state"><h3>No Handbook Sections</h3><p>Add your first section to the handbook!</p></div>`;
        }

        showToast('Section deleted successfully', 'success');
    } else {
        showToast('Failed to delete section', 'error');
    }
}


/**
 * Creates the HTML structure for the section editor modal.
 * This modal allows adding or editing handbook sections.
 * @returns {HTMLElement} The created modal element.
 */
function createSectionEditorModal() {
    const modal = document.createElement('div');
    modal.id = 'section-editor-modal';
    modal.className = 'modal';

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <button type="button" class="close-modal-btn" onclick="hideModal('section-editor-modal')">&times;</button>
            <h3 id="section-editor-title" style="margin-bottom: 20px; color: var(--primary);">Add New Section</h3>

            <form id="section-editor-form">
                <input type="hidden" id="section-id">

                <div class="form-group">
                    <label for="section-title">Section Title</label>
                    <input type="text" id="section-title" required placeholder="Enter section title">
                </div>

                <div class="form-group" id="section-parent-group">
                    <label for="section-parent">Parent Category</label>
                    <select id="section-parent">
                        <option value="">None (Top-level section)</option>
                    </select>
                </div>

                <div class="form-group" id="section-icon-group">
                    <label for="section-icon">Section Icon</label>
                    <input type="text" id="section-icon" placeholder="e.g., fas fa-book" value="fas fa-book">
                    <div class="icon-picker-grid" id="section-icon-picker"></div>
                </div>

                <div class="form-group">
                    <label for="section-editor-content">Content</label>
                    <div class="formatting-toolbar">
                        <button type="button" class="formatting-btn" data-command="bold" title="Bold">
                            <i class="fas fa-bold"></i>
                        </button>
                        <button type="button" class="formatting-btn" data-command="italic" title="Italic">
                            <i class="fas fa-italic"></i>
                        </button>
                        <button type="button" class="formatting-btn" data-command="formatBlock" data-value="h2" title="Heading 2">
                            <i class="fas fa-heading"></i>2
                        </button>
                        <button type="button" class="formatting-btn" data-command="formatBlock" data-value="h3" title="Heading 3">
                            <i class="fas fa-heading"></i>3
                        </button>
                        <button type="button" class="formatting-btn" data-command="insertUnorderedList" title="Bullet List">
                            <i class="fas fa-list-ul"></i>
                        </button>
                        <button type="button" class="formatting-btn" data-command="insertOrderedList" title="Numbered List">
                            <i class="fas fa-list-ol"></i>
                        </button>
                        <button type="button" class="formatting-btn" data-command="createLink" title="Insert Link">
                            <i class="fas fa-link"></i>
                        </button>
                        <button type="button" class="formatting-btn" data-command="insertHTML" data-value="code-block" title="Insert Code Block">
                            <i class="fas fa-code"></i>
                        </button>
                    </div>
                    <div id="section-editor-content" class="note-content-editor" contenteditable="true"></div>
                </div>

                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" id="cancel-section-edit">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Section</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Now that the modal is in the DOM, populate the icon picker
    populateIconPicker('section-icon-picker', 'section-icon'); // Assumes populateIconPicker is global

    // Add event listeners
    modal.querySelector('#cancel-section-edit').addEventListener('click', () => {
        hideModal('section-editor-modal'); // Assumes hideModal is global
    });

    modal.querySelector('#section-editor-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveSection();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal('section-editor-modal');
        }
    });

    return modal;
}

/**
 * Populates the "Parent Category" dropdown in the section editor modal
 * with existing handbook categories.
 */
function populateParentCategorySelect() {
    const parentSelect = document.getElementById('section-parent');

    // Clear existing options except the first one ("None")
    while (parentSelect.options.length > 1) {
        parentSelect.remove(1);
    }

    // Add current top-level categories as options
    handbookData.sections.forEach(section => {
        if (section.isCategory) {
            const option = document.createElement('option');
            option.value = section.id;
            option.textContent = section.title;
            parentSelect.appendChild(option);
        }
    });
}

/**
 * Initializes rich text editor functionality for handbook section content.
 * This includes handling toolbar commands.
 * Assumes `showToast` is global.
 */
function initSectionEditor() {
    // We delegate the event listener to the document body or a higher stable parent
    // to handle clicks on dynamically created formatting buttons within modals.
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.formatting-btn');
        // Ensure the clicked button is part of the section editor's toolbar
        if (!btn || !btn.closest('#section-editor-modal .formatting-toolbar')) return;

        const command = btn.dataset.command;
        const value = btn.dataset.value || null;
        const editor = document.getElementById('section-editor-content');

        if (!editor || editor.contentEditable === 'false') return; // Ensure editor is editable

        editor.focus(); // Focus the editor before executing command

        if (command === 'createLink') {
            const url = prompt('Enter the URL:');
            if (url) {
                document.execCommand(command, false, url);
            }
        } else if (command === 'insertHTML' && value === 'code-block') {
            const codeContent = prompt('Enter code content:');
            if (codeContent !== null) { // Allow empty string, but not cancelled prompt
                const codeBlockHtml = `
                    <div class="code-block">
                        <pre><code>${escapeHtml(codeContent)}</code></pre>
                        <button class="copy-btn" data-clipboard-target="#code-${Date.now()}"><i class="fas fa-copy"></i></button>
                    </div>
                `;
                document.execCommand('insertHTML', false, codeBlockHtml);
            }
        } else if (command === 'formatBlock') {
            document.execCommand(command, false, value);
        } else {
            document.execCommand(command, false, value);
        }
        // After command, re-attach copy button listeners to any newly inserted code blocks
        contentContainer.querySelectorAll('.copy-btn').forEach(btn => { // Re-select all copy buttons
            if (!btn.dataset.listenerAttached) { // Only attach if not already
                btn.addEventListener('click', () => {
                    const codeBlock = btn.parentElement.querySelector('code');
                    if (codeBlock) {
                        navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                            btn.innerHTML = '<i class="fas fa-check"></i>';
                            setTimeout(() => {
                                btn.innerHTML = '<i class="fas fa-copy"></i>';
                            }, 2000);
                            showToast('Code copied to clipboard!', 'success');
                        }).catch(err => {
                            console.error('Failed to copy text: ', err);
                            showToast('Failed to copy code.', 'error');
                        });
                    }
                });
                btn.dataset.listenerAttached = 'true'; // Mark as attached
            }
        });
    });

    // Add icon picker functionality (delegated for modal)
    document.addEventListener('click', (e) => {
        const iconItem = e.target.closest('.icon-picker-item');
        // Ensure the clicked item is part of the section editor's icon picker
        if (!iconItem || !iconItem.closest('#section-editor-modal .icon-picker-grid')) return;

        const iconPicker = iconItem.closest('.icon-picker-grid');

        iconPicker.querySelectorAll('.icon-picker-item').forEach(item => {
            item.classList.remove('selected');
        });

        iconItem.classList.add('selected');

        const iconInput = document.getElementById('section-icon');
        if (iconInput) {
            iconInput.value = iconItem.dataset.iconClass;
        }
    });
}

/**
 * Saves a new or edited handbook section to `handbookData` and local storage.
 * Assumes `appState`, `showToast`, `renderHandbookSidebar`, `showHandbookSection`, and `saveState` are global.
 */
function saveSection() {
    if (appState.readOnlyMode) {
        showToast("Cannot save sections in read-only shared view.", "warning");
        return;
    }

    const sectionId = document.getElementById('section-id').value;
    const sectionTitle = document.getElementById('section-title').value.trim();
    const sectionParent = document.getElementById('section-parent').value;
    const sectionIcon = document.getElementById('section-icon').value.trim();
    const sectionContent = document.getElementById('section-editor-content').innerHTML.trim();

    if (!sectionTitle) {
        showToast('Section title is required', 'error');
        return;
    }

    const existingSection = findSectionById(sectionId);

    if (existingSection) {
        existingSection.title = sectionTitle;
        existingSection.icon = sectionIcon;
        existingSection.content = sectionContent;
    } else {
        const newSection = {
            id: sectionId,
            title: sectionTitle,
            icon: sectionIcon,
            content: sectionContent
        };

        if (sectionParent) {
            const parentCategory = handbookData.sections.find(section => section.id === sectionParent);
            if (parentCategory) {
                if (!parentCategory.isCategory) {
                    parentCategory.isCategory = true;
                }
                if (!parentCategory.subcategories) {
                    parentCategory.subcategories = [];
                }
                parentCategory.subcategories.push(newSection);
            }
        } else {
            handbookData.sections.push(newSection);
        }
    }

    saveHandbookData();
    renderHandbookSidebar();
    showHandbookSection(sectionId); // Re-display the (newly added/edited) section

    hideModal('section-editor-modal');
    showToast('Section saved successfully', 'success');
}

/**
 * Saves the current `handbookData` object to local storage.
 */
function saveHandbookData() {
    localStorage.setItem('osintHandbookData', JSON.stringify(handbookData));
}

/**
 * Escapes HTML characters in a given string to prevent XSS.
 * @param {string} text The string to escape.
 * @returns {string} The HTML-escaped string.
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// --- Notes Specific Functions ---

/**
 * Initializes the notes functionality: loads notes, renders the list, and sets up event listeners.
 */
function initNotes() {
    loadNotes();
    renderNotesList();
    setupNotesEventListeners();
}

/**
 * Loads notes from local storage into `notesState.notes`.
 */
function loadNotes() {
    const savedNotes = localStorage.getItem('osintNotes');
    if (savedNotes) {
        notesState.notes = JSON.parse(savedNotes);
        notesState.notes.forEach(note => {
            note.createdAt = new Date(note.createdAt);
            note.updatedAt = new Date(note.updatedAt);
            if (typeof note.pinned === 'undefined') {
                note.pinned = false;
            }
        });
        sortNotes();
    }
    const noteSortFilterElement = document.getElementById('noteSortFilter');
    if (noteSortFilterElement) {
        noteSortFilterElement.value = notesState.noteSortFilter;
    }
}

/**
 * Sorts `notesState.notes` based on pinned status (pinned first) and the selected sort filter.
 */
function sortNotes() {
    const currentSort = notesState.noteSortFilter;

    notesState.notes.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        switch (currentSort) {
            case 'updated_desc':
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            case 'updated_asc':
                return new Date(a.updatedAt) - new Date(b.updatedAt);
            case 'created_desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'created_asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'title_asc':
                return a.title.localeCompare(b.title);
            case 'title_desc':
                return b.title.localeCompare(a.title);
            default:
                return 0;
        }
    });
    saveNotes();
}

/**
 * Saves the current `notesState.notes` array to local storage.
 */
function saveNotes() {
    localStorage.setItem('osintNotes', JSON.stringify(notesState.notes));
}

/**
 * Renders the list of notes in a grid format.
 * Assumes `formatDate` is a globally available utility function.
 */
function renderNotesList() {
    const notesListContainer = document.getElementById('notes-list');
    if (!notesListContainer) return;

    if (notesState.notes.length === 0) {
        notesListContainer.innerHTML = `
            <div class="notes-empty-state">
                <i class="fas fa-sticky-note"></i>
                <h3>No Notes Yet</h3>
                <p>Create your first note to get started!</p>
            </div>
        `;
        return;
    }

    let notesHTML = '<div class="notes-grid">';

    notesState.notes.forEach(note => {
        let previewContent = note.content;
        previewContent = previewContent.replace(/<[^>]*>/g, '');
        const lines = previewContent.split('\n').slice(0, 5).join('\n');
        previewContent = lines.length > 150 ? lines.substring(0, 147) + '...' : lines;

        const dateFormatted = formatDate(note.updatedAt);
        notesHTML += `
            <div class="note-card ${note.pinned ? 'pinned' : ''}" data-note-id="${note.id}">
                <div class="note-card-header">
                    <h3 class="note-title">${note.title}</h3>
                    <div class="note-actions">
                        <button class="note-action-btn pin-note ${note.pinned ? 'pinned' : ''}" data-note-id="${note.id}" title="${note.pinned ? 'Unpin Note' : 'Pin Note'}">
                            <i class="fas fa-thumbtack"></i>
                        </button>
                        <button class="note-action-btn edit-note" data-note-id="${note.id}" title="Edit Note">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="note-action-btn delete-note" data-note-id="${note.id}" title="Delete Note">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-preview">${previewContent}</div>
                <div class="note-footer">
                    <span class="note-date">Last updated: ${dateFormatted}</span>
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    });

    notesHTML += '</div>';
    notesListContainer.innerHTML = notesHTML;
    addNoteCardListeners();
}

/**
 * Formats a given Date object into a human-readable string (e.g., "Today at...", "Yesterday", "Monday", "1/1/2025").
 * Assumes `Date` object and its methods are available.
 * @param {Date} date The date object to format.
 * @returns {string} The formatted date string.
 */
function formatDate(date) {
    const now = new Date();
    const noteDate = new Date(date);
    const diffTime = Math.abs(now - noteDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return `Today at ${noteDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[noteDate.getDay()];
    } else {
        return noteDate.toLocaleDateString();
    }
}


/**
 * Adds event listeners to individual note cards (for opening, editing, deleting, and pinning).
 */
function addNoteCardListeners() {
    document.querySelectorAll('.note-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.note-actions')) {
                const noteId = card.dataset.noteId;
                openNote(noteId);
            }
        });
    });

    document.querySelectorAll('.edit-note').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const noteId = btn.dataset.noteId;
            editNote(noteId);
        });
    });

    document.querySelectorAll('.delete-note').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const noteId = btn.dataset.noteId;
            deleteNote(noteId);
        });
    });

    document.querySelectorAll('.pin-note').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const noteId = btn.dataset.noteId;
            togglePinNote(noteId);
        });
    });
}

/**
 * Sets up global event listeners for the notes interface (new note, save, edit, search, sort, tags).
 */
function setupNotesEventListeners() {
    const newNoteBtn = document.getElementById('new-note-btn');
    if (newNoteBtn) {
        newNoteBtn.addEventListener('click', createNewNote);
    }

    const backToNotesBtn = document.getElementById('back-to-notes-btn');
    if (backToNotesBtn) {
        backToNotesBtn.addEventListener('click', () => {
            showNotesList();
        });
    }

    const saveNoteBtn = document.getElementById('save-note-btn');
    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', saveCurrentNote);
    }

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
    if (addTagBtn) {
        addTagBtn.addEventListener('click', addTagToCurrentNote);
    }
}

/**
 * Toggles the 'pinned' status of a note and re-renders the note list.
 * @param {string} noteId The ID of the note to toggle.
 */
function togglePinNote(noteId) {
    const note = notesState.notes.find(n => n.id === noteId);
    if (!note) return;

    note.pinned = !note.pinned;
    note.updatedAt = new Date();

    showToast(note.pinned ? 'Note pinned!' : 'Note unpinned!');

    sortNotes();
    renderNotesList();
}

/**
 * Creates a new blank note and opens it in the editor.
 */
function createNewNote() {
    const newNote = {
        id: generateNoteId(),
        title: 'Untitled Note',
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        pinned: false
    };

    notesState.notes.unshift(newNote);
    notesState.currentNote = newNote.id;
    notesState.editMode = true;

    saveNotes();
    showNoteEditor();
    focusEditor();
}

/**
 * Opens an existing note in the editor view (read-only mode).
 * @param {string} noteId The ID of the note to open.
 */
function openNote(noteId) {
    const note = notesState.notes.find(n => n.id === noteId);
    if (!note) return;

    notesState.currentNote = noteId;
    notesState.editMode = false;

    showNoteEditor();
}

/**
 * Opens an existing note in the editor view (edit mode).
 * @param {string} noteId The ID of the note to edit.
 */
function editNote(noteId) {
    const note = notesState.notes.find(n => n.id === noteId);
    if (!note) return;

    notesState.currentNote = noteId;
    notesState.editMode = true;

    showNoteEditor();
    focusEditor();
}

/**
 * Deletes a note from `notesState.notes`.
 * @param {string} noteId The ID of the note to delete.
 */
function deleteNote(noteId) {
    if (appState.readOnlyMode) {
        showToast("Cannot delete notes in read-only shared view.", "warning");
        return;
    }

    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }

    notesState.notes = notesState.notes.filter(note => note.id !== noteId);

    if (notesState.currentNote === noteId) {
        notesState.currentNote = null;
        showNotesList();
    } else {
        sortNotes();
        renderNotesList();
    }

    saveNotes();
    updateStats(); // Assuming updateStats is global
}

/**
 * Shows the notes list view and hides the editor.
 */
function showNotesList() {
    document.getElementById('notes-list-view').style.display = 'block';
    document.getElementById('note-editor-view').style.display = 'none';

    renderNotesList();
}

/**
 * Shows the note editor view and populates it with the current note's data.
 * Toggles editor elements based on `notesState.editMode`.
 */
function showNoteEditor() {
    document.getElementById('notes-list-view').style.display = 'none';
    document.getElementById('note-editor-view').style.display = 'block';

    const note = notesState.notes.find(n => n.id === notesState.currentNote);
    if (!note) return;

    document.getElementById('note-title-input').value = note.title;
    document.getElementById('note-content-editor').innerHTML = note.content;

    document.getElementById('note-title-input').readOnly = !notesState.editMode;
    document.getElementById('note-content-editor').contentEditable = notesState.editMode;

    const saveNoteBtn = document.getElementById('save-note-btn');
    const editNoteBtn = document.getElementById('edit-note-btn');
    const cancelEditNoteBtn = document.getElementById('cancel-edit-note-btn');
    const tagInputContainer = document.getElementById('tag-input-container');
    const formattingToolbar = document.getElementById('formatting-toolbar');

    if (notesState.editMode) {
        saveNoteBtn.style.display = 'inline-flex';
        cancelEditNoteBtn.style.display = 'inline-flex';
        editNoteBtn.style.display = 'none';
        tagInputContainer.style.display = 'flex';
        formattingToolbar.style.display = 'flex';
    } else {
        saveNoteBtn.style.display = 'none';
        cancelEditNoteBtn.style.display = 'none';
        editNoteBtn.style.display = 'inline-flex';
        tagInputContainer.style.display = 'none';
        formattingToolbar.style.display = 'none';
    }

    renderNoteTags();

    if (notesState.editMode) {
        setupRichTextEditor();
    }
}

/**
 * Renders the tags for the currently active note in the editor view.
 * Displays remove buttons if in edit mode.
 */
function renderNoteTags() {
    const tagsContainer = document.getElementById('note-tags-container');
    const note = notesState.notes.find(n => n.id === notesState.currentNote);

    if (!note || !tagsContainer) return;

    tagsContainer.innerHTML = note.tags.map(tag => `
        <div class="note-tag">
            <span>${tag}</span>
            ${notesState.editMode ? `<button type="button" class="remove-tag-btn" data-tag="${tag}"><i class="fas fa-times"></i></button>` : ''}
        </div>
    `).join('');

    if (notesState.editMode) {
        document.querySelectorAll('.remove-tag-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tagToRemove = btn.dataset.tag;
                removeTagFromCurrentNote(tagToRemove);
            });
        });
    }
}

/**
 * Adds a new tag to the current note.
 */
function addTagToCurrentNote() {
    const tagInput = document.getElementById('note-tags-input');
    if (!tagInput) return; // Safety check

    const tagValue = tagInput.value.trim();

    if (!tagValue) return;

    const note = notesState.notes.find(n => n.id === notesState.currentNote);
    if (!note) return;

    if (!note.tags.includes(tagValue)) {
        note.tags.push(tagValue);
        note.updatedAt = new Date();
        saveNotes();
        renderNoteTags();
    }

    tagInput.value = '';
}

/**
 * Removes a tag from the current note.
 * @param {string} tag The tag to remove.
 */
function removeTagFromCurrentNote(tag) {
    const note = notesState.notes.find(n => n.id === notesState.currentNote);
    if (!note) return;

    note.tags = note.tags.filter(t => t !== tag);
    note.updatedAt = new Date();
    saveNotes();
    renderNoteTags();
}

/**
 * Saves the changes made to the current note.
 * Prompts for confirmation before saving.
 */
function saveCurrentNote() {
    if (appState.readOnlyMode) {
        showToast("Cannot save notes in read-only shared view.", "warning");
        return;
    }

    const note = notesState.notes.find(n => n.id === notesState.currentNote);
    if (!note) return;

    if (!confirm('Are you sure you want to save changes to this note?')) {
        showToast('Save cancelled.', 'info');
        return;
    }

    note.title = document.getElementById('note-title-input').value || 'Untitled Note';
    note.content = document.getElementById('note-content-editor').innerHTML;
    note.updatedAt = new Date();

    saveNotes();
    sortNotes();

    notesState.editMode = false;
    showNoteEditor();

    showToast('Note saved successfully!');
}

/**
 * Searches notes by title, content, or tags and updates the displayed list.
 * @param {string} searchTerm The term to search for.
 */
function searchNotes(searchTerm) {
    searchTerm = searchTerm.toLowerCase();

    const filteredNotes = notesState.notes.filter(note => {
        const titleMatch = note.title.toLowerCase().includes(searchTerm);
        const contentMatch = note.content.toLowerCase().includes(searchTerm);
        const tagMatch = note.tags.some(tag => tag.toLowerCase().includes(searchTerm));

        return titleMatch || contentMatch || tagMatch;
    });

    const notesListContainer = document.getElementById('notes-list');
    if (!notesListContainer) return;

    const originalNotes = notesState.notes;
    notesState.notes = filteredNotes; // Temporarily set to filtered for sorting
    sortNotes();
    const sortedFilteredNotes = notesState.notes;
    notesState.notes = originalNotes; // Revert to original full array

    if (sortedFilteredNotes.length === 0) {
        notesListContainer.innerHTML = `
            <div class="notes-empty-state">
                <i class="fas fa-search"></i>
                <h3>No matching notes found</h3>
                <p>Try a different search term</p>
            </div>
        `;
        return;
    }

    let notesHTML = '<div class="notes-grid">';

    sortedFilteredNotes.forEach(note => {
        let previewContent = note.content;
        previewContent = previewContent.replace(/<[^>]*>/g, '');
        const lines = previewContent.split('\n').slice(0, 5).join('\n');
        previewContent = lines.length > 150 ? lines.substring(0, 147) + '...' : lines;

        const dateFormatted = formatDate(note.updatedAt);

        notesHTML += `
            <div class="note-card ${note.pinned ? 'pinned' : ''}" data-note-id="${note.id}">
                <div class="note-card-header">
                    <h3 class="note-title">${note.title}</h3>
                    <div class="note-actions">
                        <button class="note-action-btn pin-note ${note.pinned ? 'pinned' : ''}" data-note-id="${note.id}" title="${note.pinned ? 'Unpin Note' : 'Pin Note'}">
                            <i class="fas fa-thumbtack"></i>
                        </button>
                        <button class="note-action-btn edit-note" data-note-id="${note.id}" title="Edit Note">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="note-action-btn delete-note" data-note-id="${note.id}" title="Delete Note">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-preview">${previewContent}</div>
                <div class="note-footer">
                    <span class="note-date">${dateFormatted}</span>
                    <div class="note-tags">
                        ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    });

    notesHTML += '</div>';
    notesListContainer.innerHTML = notesHTML;

    addNoteCardListeners();
}

/**
 * Sets up the rich text editor for note content editing.
 * Assumes `document.execCommand` and `escapeHtml` are global.
 */
function setupRichTextEditor() {
    const editor = document.getElementById('note-content-editor');
    const toolbar = document.getElementById('formatting-toolbar');

    if (!editor || !toolbar) return;

    toolbar.querySelectorAll('.formatting-btn').forEach(btn => {
        btn.onclick = () => { // Use onclick directly to prevent multiple listeners on re-render
            const command = btn.dataset.command;
            const value = btn.dataset.value || null;

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
        };
    });
}


/**
 * Sets focus to the note title input.
 */
function focusEditor() {
    setTimeout(() => {
        const titleInput = document.getElementById('note-title-input');
        if (titleInput) {
            titleInput.focus();
            titleInput.select();
        }
    }, 100);
}

/**
 * Toggles the visibility of the mobile handbook sidebar.
 */
function toggleHandbookSidebar() {
    const sidebar = document.getElementById('handbook-sidebar');
    const body = document.body;

    sidebar.classList.toggle('mobile-open');
    body.classList.toggle('handbook-overlay-active', sidebar.classList.contains('mobile-open'));
}


// Export the functions and data that need to be accessible from `index.html` or other modules.
// Assuming global dependencies like `appState`, `showToast`, `hideModal`, `generateId`,
// `updateStats`, `fetchJsonData`, `populateIconPicker` are available.

window.notesState = notesState; // Export notesState directly if needed by global appState access
window.handbookData = handbookData; // Export handbookData directly if needed by global appState access

window.initHandbookAndNotes = initHandbookAndNotes;
window.switchHandbookSubtab = switchHandbookSubtab;
window.initHandbook = initHandbook;
window.renderHandbookSidebar = renderHandbookSidebar;
window.addHandbookSidebarListeners = addHandbookSidebarListeners;
window.findSectionById = findSectionById;
window.showHandbookSection = showHandbookSection;
window.addHandbookControls = addHandbookControls;
window.openAddSectionModal = openAddSectionModal;
window.openEditSectionModal = openEditSectionModal;
window.confirmDeleteSection = confirmDeleteSection;
window.deleteSection = deleteSection;
window.createSectionEditorModal = createSectionEditorModal;
window.populateParentCategorySelect = populateParentCategorySelect;
window.initSectionEditor = initSectionEditor;
window.saveSection = saveSection;
window.saveHandbookData = saveHandbookData;
window.escapeHtml = escapeHtml; // Utility function

window.initNotes = initNotes;
window.loadNotes = loadNotes;
window.sortNotes = sortNotes;
window.saveNotes = saveNotes;
window.renderNotesList = renderNotesList;
window.formatDate = formatDate; // Utility function
window.addNoteCardListeners = addNoteCardListeners;
window.setupNotesEventListeners = setupNotesEventListeners;
window.togglePinNote = togglePinNote;
window.createNewNote = createNewNote;
window.openNote = openNote;
window.editNote = editNote;
window.deleteNote = deleteNote;
window.showNotesList = showNotesList;
window.showNoteEditor = showNoteEditor;
window.renderNoteTags = renderNoteTags;
window.addTagToCurrentNote = addTagToCurrentNote;
window.removeTagFromCurrentNote = removeTagFromCurrentNote;
window.saveCurrentNote = saveCurrentNote;
window.searchNotes = searchNotes;
window.setupRichTextEditor = setupRichTextEditor;
window.focusEditor = focusEditor;
window.toggleHandbookSidebar = toggleHandbookSidebar; // Export mobile toggle