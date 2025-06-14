// handbook-and-notes.js

// --- OSINT Handbook & Notes JS ---

/**
 * Initializes the OSINT Handbook and My Notes functionalities.
 */
function initHandbookAndNotes() {
    const activeSubtab = appState.currentHandbookSubTab || 'handbook';
    switchHandbookSubtab(activeSubtab);
    initHandbook();
    initNotes();
}

/**
 * Switches between the 'OSINT Handbook' and 'My Notes' subtabs.
 * @param {string} subtabName - The ID of the subtab to activate ('handbook' or 'notes').
 */
function switchHandbookSubtab(subtabName) {
    appState.currentHandbookSubTab = subtabName;

    document.querySelectorAll('.handbook-subtab').forEach(tab => {
        tab.classList.remove('active');
    });

    const targetSubTabBtn = document.querySelector(`.handbook-subtab[data-subtab="${subtabName}"]`);
    if (targetSubTabBtn) {
        targetSubTabBtn.classList.add('active');
    }

    document.querySelectorAll('.handbook-subtab-content').forEach(content => {
        content.style.display = 'none';
    });

    const targetContent = document.getElementById(`${subtabName}-content`);
    if (targetContent) {
        targetContent.style.display = 'block';
    }

    saveState();
}

/**
 * Toggles the visibility of the mobile handbook sidebar and controls body scrolling.
 */
function toggleHandbookSidebar() {
    const sidebar = document.getElementById('handbook-sidebar');
    const body = document.body;

    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
        body.classList.toggle('handbook-overlay-active', sidebar.classList.contains('mobile-open'));
    }
}


// --- OSINT Handbook Functions ---

/**
 * Initializes the handbook display and controls.
 * Renders the sidebar and displays the first section by default.
 */
function initHandbook() {
    const handbookSidebar = document.getElementById('handbook-sidebar');
    if (!handbookSidebar) return;

    renderHandbookSidebar();

    if (handbookData.sections.length > 0) {
        const firstSection = handbookData.sections[0];
        showHandbookSection(firstSection.id);
    }

    addHandbookControls(); // Add section management buttons
    enhanceHandbookSearch(); // Setup search functionality
    initSectionEditor(); // Initialize rich text editor for sections
}

/**
 * Renders the navigation sidebar for the OSINT Handbook based on `handbookData`.
 */
function renderHandbookSidebar() {
    const sidebar = document.getElementById('handbook-sidebar');
    if (!sidebar) return;

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
            
            (section.subcategories || []).forEach(subcategory => { // Ensure subcategories is an array
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

    sidebar.innerHTML = sidebarHTML;

    addHandbookSidebarListeners();
}

/**
 * Attaches event listeners to handbook sidebar elements (category toggles, section clicks, search).
 */
function addHandbookSidebarListeners() {
    document.querySelectorAll('.handbook-category-header').forEach(header => {
        header.addEventListener('click', () => {
            const categoryId = header.dataset.category;
            const subcategoriesEl = document.getElementById(`${categoryId}-subcategories`);
            
            if (subcategoriesEl) { // Safety check
                if (subcategoriesEl.style.maxHeight) {
                    subcategoriesEl.style.maxHeight = null;
                    header.querySelector('.category-toggle').classList.remove('rotate');
                } else {
                    subcategoriesEl.style.maxHeight = subcategoriesEl.scrollHeight + "px";
                    header.querySelector('.category-toggle').classList.add('rotate');
                }
            }
        });
    });
    
    document.querySelectorAll('.handbook-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            showHandbookSection(sectionId);
            
            document.querySelectorAll('.handbook-nav-item').forEach(i => {
                i.classList.remove('active');
            });
            item.classList.add('active');
            
            if (window.innerWidth < 768) {
                const sidebar = document.getElementById('handbook-sidebar');
                if (sidebar) sidebar.classList.remove('mobile-open');
            }
        });
    });
    
    const searchInput = document.getElementById('handbook-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterHandbookSidebar(searchTerm);
        });
    }
}

/**
 * Filters the handbook sidebar navigation based on a search term.
 * @param {string} searchTerm - The search query.
 */
function filterHandbookSidebar(searchTerm) {
    if (!searchTerm || searchTerm.length < 2) {
        document.querySelectorAll('.handbook-nav-item, .handbook-category').forEach(item => {
            item.style.display = 'flex';
        });
        document.querySelectorAll('.handbook-subcategories').forEach(sub => {
            sub.style.maxHeight = null;
        });
        const noResultsEl = document.getElementById('handbook-search-no-results');
        if (noResultsEl) noResultsEl.style.display = 'none';
        return;
    }
    
    let matchFound = false;
    
    document.querySelectorAll('.handbook-nav-item').forEach(item => {
        const sectionId = item.dataset.section;
        let sectionData = findSectionById(sectionId);
        
        if (sectionData) {
            const titleMatch = sectionData.title.toLowerCase().includes(searchTerm);
            const contentMatch = sectionData.content && sectionData.content.toLowerCase().includes(searchTerm);
            
            if (titleMatch || contentMatch) {
                item.style.display = 'flex';
                matchFound = true;
                item.classList.add('search-highlight');
                
                const parentSubcategories = item.closest('.handbook-subcategories');
                if (parentSubcategories) {
                    const categoryId = parentSubcategories.id.replace('-subcategories', '');
                    const categoryHeader = document.querySelector(`.handbook-category-header[data-category="${categoryId}"]`);
                    const categoryContainer = categoryHeader ? categoryHeader.closest('.handbook-category') : null;
                    
                    if (categoryContainer) {
                        categoryContainer.style.display = 'block';
                        parentSubcategories.style.maxHeight = parentSubcategories.scrollHeight + "px";
                        const toggleIcon = categoryHeader ? categoryHeader.querySelector('.category-toggle') : null;
                        if (toggleIcon) toggleIcon.classList.add('rotate');
                    }
                }
            } else {
                item.style.display = 'none';
                item.classList.remove('search-highlight');
            }
        }
    });
    
    document.querySelectorAll('.handbook-category').forEach(category => {
        const visibleItems = category.querySelectorAll('.handbook-nav-item[style*="display: flex"]'); // Check for explicit 'display: flex'
        if (visibleItems.length === 0) {
            category.style.display = 'none';
        } else {
            category.style.display = 'block';
        }
    });

    const noResultsEl = document.getElementById('handbook-search-no-results');
    if (!matchFound) {
        const searchContainer = document.querySelector('.handbook-search-container');
        if (!noResultsEl && searchContainer) {
            searchContainer.insertAdjacentHTML('afterend', `
                <div id="handbook-search-no-results" class="handbook-no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${searchTerm}"</p>
                </div>
            `);
        } else if (noResultsEl) {
            noResultsEl.style.display = 'block';
            noResultsEl.querySelector('p').textContent = `No results found for "${searchTerm}"`;
        }
    } else if (noResultsEl) {
        noResultsEl.style.display = 'none';
    }
}

/**
 * Searches handbook sections for a given term and updates visibility.
 * @param {string} searchTerm - The term to search for.
 */
function searchHandbookSections(searchTerm) {
    let matchFound = false;
    
    document.querySelectorAll('.handbook-nav-item').forEach(item => {
        const sectionId = item.dataset.section;
        let sectionData = findSectionById(sectionId);
        
        if (sectionData) {
            const titleMatch = sectionData.title.toLowerCase().includes(searchTerm);
            const contentMatch = sectionData.content && sectionData.content.toLowerCase().includes(searchTerm);
            
            if (titleMatch || contentMatch) {
                item.style.display = 'flex';
                matchFound = true;
                item.classList.add('search-highlight');
                
                const parentSubcategories = item.closest('.handbook-subcategories');
                if (parentSubcategories) {
                    const categoryId = parentSubcategories.id.replace('-subcategories', '');
                    const categoryHeader = document.querySelector(`.handbook-category-header[data-category="${categoryId}"]`);
                    const categoryContainer = categoryHeader ? categoryHeader.closest('.handbook-category') : null;
                    
                    if (categoryContainer) {
                        categoryContainer.style.display = 'block';
                        parentSubcategories.style.maxHeight = parentSubcategories.scrollHeight + "px";
                        const toggleIcon = categoryHeader ? categoryHeader.querySelector('.category-toggle') : null;
                        if (toggleIcon) toggleIcon.classList.add('rotate');
                    }
                }
            } else {
                item.style.display = 'none';
                item.classList.remove('search-highlight');
            }
        }
    });
    
    document.querySelectorAll('.handbook-category').forEach(category => {
        const visibleItems = category.querySelectorAll('.handbook-nav-item[style*="display: flex"]');
        if (visibleItems.length === 0) {
            category.style.display = 'none';
        } else {
            category.style.display = 'block';
        }
    });

    const noResultsEl = document.getElementById('handbook-search-no-results');
    if (!matchFound) {
        const searchContainer = document.querySelector('.handbook-search-container');
        if (!noResultsEl && searchContainer) {
            searchContainer.insertAdjacentHTML('afterend', `
                <div id="handbook-search-no-results" class="handbook-no-results">
                    <i class="fas fa-search"></i>
                    <p>No results found for "${searchTerm}"</p>
                </div>
            `);
        } else if (noResultsEl) {
            noResultsEl.style.display = 'block';
            noResultsEl.querySelector('p').textContent = `No results found for "${searchTerm}"`;
        }
    } else if (noResultsEl) {
        noResultsEl.style.display = 'none';
    }
}


/**
 * Highlights occurrences of the search term within the handbook content.
 * @param {string} searchTerm - The term to highlight.
 */
function highlightContentMatches(searchTerm) {
    const contentArea = document.getElementById('handbook-article-area');
    if (!contentArea) return;
    
    const highlighted = contentArea.innerHTML;
    const cleaned = highlighted.replace(/<mark class="search-highlight">(.*?)<\/mark>/gi, '$1');
    contentArea.innerHTML = cleaned;
    
    if (searchTerm.length < 2) return;
    
    const contentNodes = Array.from(contentArea.querySelectorAll('p, h2, h3, h4, li, code'));
    
    contentNodes.forEach(node => {
        const originalText = node.innerHTML;
        if (!originalText.includes('<mark class="search-highlight">')) {
            const newText = originalText.replace(
                new RegExp(searchTerm, 'gi'),
                match => `<mark class="search-highlight">${match}</mark>`
            );
            if (originalText !== newText) {
                node.innerHTML = newText;
            }
        }
    });
}

/**
 * Finds a handbook section or subcategory by its ID.
 * @param {string} sectionId - The ID of the section to find.
 * @returns {object|null} The section object if found, otherwise null.
 */
function findSectionById(sectionId) {
    let foundSection = null;
    
    handbookData.sections.forEach(section => {
        if (section.id === sectionId) {
            foundSection = section;
        } else if (section.isCategory && section.subcategories) {
            (section.subcategories || []).forEach(subsection => { // Ensure subcategories is an array
                if (subsection.id === sectionId) {
                    foundSection = subsection;
                }
            });
        }
    });
    
    return foundSection;
}

/**
 * Opens the modal for adding a new handbook section.
 */
function openAddSectionModal() {
    let modal = document.getElementById('section-editor-modal');
    if (!modal) {
        modal = createSectionEditorModal();
        document.body.appendChild(modal);
    }
    
    document.getElementById('section-editor-form').reset();
    const sectionEditorTitle = document.getElementById('section-editor-title');
    const sectionIdInput = document.getElementById('section-id');
    const sectionParentGroup = document.getElementById('section-parent-group');
    const sectionIconGroup = document.getElementById('section-icon-group');
    const sectionEditorContent = document.getElementById('section-editor-content');

    if (sectionEditorTitle) sectionEditorTitle.textContent = 'Add New Section';
    if (sectionIdInput) sectionIdInput.value = generateSectionId();
    if (sectionEditorContent) sectionEditorContent.innerHTML = '';
    
    if (sectionParentGroup) sectionParentGroup.style.display = 'block';
    if (sectionIconGroup) sectionIconGroup.style.display = 'block';
    
    populateParentCategorySelect();
    
    if (modal) showModal('section-editor-modal'); // Assuming showModal is available
}

/**
 * Opens the modal for editing an existing handbook section.
 */
function openEditSectionModal() {
    const currentSectionId = getCurrentSectionId();
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
    
    const sectionEditorTitle = document.getElementById('section-editor-title');
    const sectionIdInput = document.getElementById('section-id');
    const sectionTitleInput = document.getElementById('section-title');
    const sectionIconInput = document.getElementById('section-icon');
    const sectionEditorContent = document.getElementById('section-editor-content');
    const sectionParentGroup = document.getElementById('section-parent-group');

    if (sectionEditorTitle) sectionEditorTitle.textContent = 'Edit Section';
    if (sectionIdInput) sectionIdInput.value = sectionData.id;
    if (sectionTitleInput) sectionTitleInput.value = sectionData.title;
    if (sectionIconInput) sectionIconInput.value = sectionData.icon || 'fas fa-book';
    if (sectionEditorContent) sectionEditorContent.innerHTML = sectionData.content;
    
    if (sectionParentGroup) sectionParentGroup.style.display = 'none'; // Hide parent category selector for editing
    
    if (modal) showModal('section-editor-modal');
}

/**
 * Prompts the user to confirm deletion of the current handbook section.
 */
function confirmDeleteSection() {
    const currentSectionId = getCurrentSectionId();
    if (!currentSectionId) {
        showToast('Please select a section to delete', 'warning');
        return;
    }
    
    const sectionData = findSectionById(currentSectionId);
    if (!sectionData) {
        showToast('Section not found', 'error');
        return;
    }
    
    if (confirm(`Are you sure you want to delete the section "${sectionData.title}"?`)) {
        deleteSection(currentSectionId);
    }
}

/**
 * Deletes a handbook section or subcategory.
 * @param {string} sectionId - The ID of the section to delete.
 */
function deleteSection(sectionId) {
    let deleted = false;
    
    handbookData.sections = handbookData.sections.filter(section => {
        if (section.id === sectionId) {
            deleted = true;
            return false;
        }
        
        if (section.isCategory && section.subcategories) {
            section.subcategories = section.subcategories.filter(subsection => {
                if (subsection.id === sectionId) {
                    deleted = true;
                    return false;
                }
                return true;
            });
        }
        
        return true;
    });
    
    if (deleted) {
        renderHandbookSidebar();
        if (handbookData.sections.length > 0) {
            const firstSection = handbookData.sections[0];
            if (firstSection.isCategory && firstSection.subcategories && firstSection.subcategories.length > 0) {
                showHandbookSection(firstSection.subcategories[0].id);
            } else {
                showHandbookSection(firstSection.id);
            }
        } else {
            document.getElementById('handbook-article-area').innerHTML = '<p>No sections available in the handbook.</p>';
        }
        
        saveHandbookData();
        showToast('Section deleted successfully', 'success');
    } else {
        showToast('Failed to delete section', 'error');
    }
}

/**
 * Creates the HTML structure for the section editor modal.
 * @returns {HTMLElement} The created modal element.
 */
function createSectionEditorModal() {
    const modal = document.createElement('div');
    modal.id = 'section-editor-modal';
    modal.className = 'modal';

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
        <h3 id="section-editor-title" style="margin-bottom: 20px; color: var(--primary);">Add New Section</h3>

        <form id="section-editor-form">
            <input type="hidden" id="section-id">

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

    populateIconPicker('section-icon-picker', 'section-icon');

    const cancelEditBtn = modal.querySelector('#cancel-section-edit');
    if(cancelEditBtn) cancelEditBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    const sectionEditorForm = modal.querySelector('#section-editor-form');
    if(sectionEditorForm) sectionEditorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveSection();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    return modal;
}

/**
 * Populates the dropdown list of parent categories for a new handbook section.
 */
function populateParentCategorySelect() {
    const parentSelect = document.getElementById('section-parent');
    if (!parentSelect) return;
    
    while (parentSelect.options.length > 1) {
        parentSelect.remove(1);
    }
    
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
 * Initializes the rich text editor functionality for handbook sections.
 */
function initSectionEditor() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.formatting-btn');
        if (!btn) return;
        
        const command = btn.dataset.command;
        const value = btn.dataset.value || null;
        const editor = document.getElementById('section-editor-content');
        
        if (!editor || editor.contentEditable !== 'true') return; // Only act if editable
        
        if (command === 'createLink') {
            const url = prompt('Enter the URL:');
            if (url) {
                document.execCommand(command, false, url);
            }
        } else if (command === 'insertHTML' && value === 'code-block') {
            const codeContent = prompt('Enter code content:');
            if (codeContent) {
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
    });
    
    document.addEventListener('click', (e) => {
        const iconItem = e.target.closest('.icon-picker-item');
        if (!iconItem) return;
        
        const iconPicker = iconItem.closest('.icon-picker-grid');
        if (!iconPicker) return;
        
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
 * Saves a new or updated handbook section.
 * Updates `handbookData` and re-renders the handbook UI.
 */
function saveSection() {
    const sectionId = document.getElementById('section-id').value;
    const sectionTitle = document.getElementById('section-title').value;
    const sectionParent = document.getElementById('section-parent').value;
    const sectionIcon = document.getElementById('section-icon').value;
    const sectionContent = document.getElementById('section-editor-content').innerHTML;
    
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
    showHandbookSection(sectionId);
    
    const modal = document.getElementById('section-editor-modal');
    if (modal) {
        hideModal('section-editor-modal'); // Assuming hideModal is available
    }
    
    showToast('Section saved successfully', 'success');
}

/**
 * Saves the entire handbook data to localStorage.
 */
function saveHandbookData() {
    localStorage.setItem('osintHandbookData', JSON.stringify(handbookData));
}

/**
 * Gets the ID of the currently active handbook section from the UI.
 * @returns {string|null} The ID of the active section, or null if none.
 */
function getCurrentSectionId() {
    const activeNavItem = document.querySelector('.handbook-nav-item.active');
    return activeNavItem ? activeNavItem.dataset.section : null;
}

/**
 * Generates a unique ID for a new handbook section.
 * @returns {string} A unique section ID.
 */
function generateSectionId() {
    return 'section-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Escapes HTML characters in a string to prevent XSS.
 * @param {string} text - The text to escape.
 * @returns {string} The HTML-escaped string.
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Displays a specific handbook section's content.
 * @param {string} sectionId - The ID of the section to display.
 */
function showHandbookSection(sectionId) {
    const contentContainer = document.getElementById('handbook-article-area');
    if (!contentContainer) return;

    let sectionData = findSectionById(sectionId);

    if (!sectionData) {
        contentContainer.innerHTML = '<p>Section not found.</p>';
        return;
    }

    contentContainer.innerHTML = sectionData.content;

    contentContainer.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const codeBlock = btn.parentElement.querySelector('code');
            if (codeBlock) {
                copyToClipboard(codeBlock.textContent); // Assuming copyToClipboard is available
                btn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            }
        });
    });

    const editSectionBtn = document.getElementById('edit-section-btn');
    const deleteSectionBtn = document.getElementById('delete-section-btn');
    
    if (editSectionBtn && deleteSectionBtn) {
        if (sectionData) {
            editSectionBtn.style.display = 'inline-flex';
            deleteSectionBtn.style.display = 'inline-flex';
        } else {
            editSectionBtn.style.display = 'none';
            deleteSectionBtn.style.display = 'none';
        }
    }
}

// --- My Notes Functions ---

/**
 * Initializes the My Notes functionality, loading notes and rendering the list.
 */
function initNotes() {
    loadNotes();
    renderNotesList();
    setupNotesEventListeners();
}

/**
 * Loads notes from localStorage into `notesState.notes`.
 * Converts dates and ensures `pinned` property exists.
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
 * Sorts notes based on pinned status and the currently selected sort filter.
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
 * Saves the current state of `notesState.notes` to localStorage.
 */
function saveNotes() {
    localStorage.setItem('osintNotes', JSON.stringify(notesState.notes));
}

/**
 * Renders the list of notes in the notes list view.
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

        const dateFormatted = formatDate(note.updatedAt); // Assuming formatDate is available
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
 * Formats a Date object into a human-readable relative date/time string.
 * @param {Date} date - The date to format.
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
 * Adds event listeners to dynamically created note cards for interaction.
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
 * Sets up event listeners for the notes interface (buttons, search, sort, tags).
 */
function setupNotesEventListeners() {
    const newNoteBtn = document.getElementById('new-note-btn');
    if (newNoteBtn) newNoteBtn.addEventListener('click', createNewNote);

    const backToNotesBtn = document.getElementById('back-to-notes-btn');
    if (backToNotesBtn) backToNotesBtn.addEventListener('click', showNotesList);

    const saveNoteBtn = document.getElementById('save-note-btn');
    if (saveNoteBtn) saveNoteBtn.addEventListener('click', saveCurrentNote);

    const editNoteInEditorBtn = document.getElementById('edit-note-btn');
    if (editNoteInEditorBtn) editNoteInEditorBtn.addEventListener('click', () => {
        notesState.editMode = true;
        showNoteEditor();
        focusEditor();
    });

    const cancelEditNoteBtn = document.getElementById('cancel-edit-note-btn');
    if (cancelEditNoteBtn) cancelEditNoteBtn.addEventListener('click', () => {
        notesState.editMode = false;
        showNoteEditor();
        showToast('Changes discarded.', 'info');
    });

    const searchNotesInput = document.getElementById('search-notes');
    if (searchNotesInput) searchNotesInput.addEventListener('input', (e) => {
        searchNotes(e.target.value);
    });

    const noteSortFilterElement = document.getElementById('noteSortFilter');
    if (noteSortFilterElement) noteSortFilterElement.addEventListener('change', (e) => {
        notesState.noteSortFilter = e.target.value;
        localStorage.setItem('noteSortFilter', notesState.noteSortFilter);
        sortNotes();
        renderNotesList();
    });

    const tagInput = document.getElementById('note-tags-input');
    if (tagInput) tagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTagToCurrentNote();
        }
    });

    const addTagBtn = document.getElementById('add-tag-btn');
    if (addTagBtn) addTagBtn.addEventListener('click', addTagToCurrentNote);
}

/**
 * Toggles the 'pinned' status of a note.
 * @param {string} noteId - The ID of the note to pin/unpin.
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
 * Creates a new, untitled note and opens it in the editor.
 */
function createNewNote() {
    const newNote = {
        id: generateId(), // Assuming generateId is available
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
 * Opens a specific note in read-only view.
 * @param {string} noteId - The ID of the note to open.
 */
function openNote(noteId) {
    const note = notesState.notes.find(n => n.id === noteId);
    if (!note) return;
    
    notesState.currentNote = noteId;
    notesState.editMode = false;
    
    showNoteEditor();
}


/**
 * Opens a specific note in editable mode.
 * @param {string} noteId - The ID of the note to edit.
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
 * Deletes a note after user confirmation.
 * @param {string} noteId - The ID of the note to delete.
 */
function deleteNote(noteId) {
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
}

/**
 * Displays the notes list view and hides the editor.
 */
function showNotesList() {
    document.getElementById('notes-list-view').style.display = 'block';
    document.getElementById('note-editor-view').style.display = 'none';
    
    renderNotesList();
}

/**
 * Displays the note editor view, populating it with the current note's data.
 * Toggles edit/read-only mode for the editor controls.
 */
function showNoteEditor() {
    document.getElementById('notes-list-view').style.display = 'none';
    document.getElementById('note-editor-view').style.display = 'block';

    const note = notesState.notes.find(n => n.id === notesState.currentNote);
    if (!note) return;

    const noteTitleInput = document.getElementById('note-title-input');
    const noteContentEditor = document.getElementById('note-content-editor');

    if (noteTitleInput) noteTitleInput.value = note.title;
    if (noteContentEditor) noteContentEditor.innerHTML = note.content;

    if (noteTitleInput) noteTitleInput.readOnly = !notesState.editMode;
    if (noteContentEditor) noteContentEditor.contentEditable = notesState.editMode;

    const saveNoteBtn = document.getElementById('save-note-btn');
    const editNoteBtn = document.getElementById('edit-note-btn');
    const cancelEditNoteBtn = document.getElementById('cancel-edit-note-btn');
    const tagInputContainer = document.getElementById('tag-input-container');
    const formattingToolbar = document.getElementById('formatting-toolbar');

    if (notesState.editMode) {
        if (saveNoteBtn) saveNoteBtn.style.display = 'inline-flex';
        if (cancelEditNoteBtn) cancelEditNoteBtn.style.display = 'inline-flex';
        if (editNoteBtn) editNoteBtn.style.display = 'none';
        if (tagInputContainer) tagInputContainer.style.display = 'flex';
        if (formattingToolbar) formattingToolbar.style.display = 'flex';
    } else {
        if (saveNoteBtn) saveNoteBtn.style.display = 'none';
        if (cancelEditNoteBtn) cancelEditNoteBtn.style.display = 'none';
        if (editNoteBtn) editNoteBtn.style.display = 'inline-flex';
        if (tagInputContainer) tagInputContainer.style.display = 'none';
        if (formattingToolbar) formattingToolbar.style.display = 'none';
    }

    renderNoteTags();

    if (notesState.editMode) {
        setupRichTextEditor();
    }
}

/**
 * Renders the tags for the currently displayed note in the editor.
 */
function renderNoteTags() {
    const tagsContainer = document.getElementById('note-tags-container');
    const note = notesState.notes.find(n => n.id === notesState.currentNote);
    
    if (!tagsContainer || !note) return;
    
    tagsContainer.innerHTML = note.tags.map(tag => `
        <div class="note-tag">
        <span>${tag}</span>
        ${notesState.editMode ? `<button class="remove-tag-btn" data-tag="${tag}"><i class="fas fa-times"></i></button>` : ''}
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
    if (!tagInput) return;
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
 * @param {string} tag - The tag to remove.
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
 * Saves the current note's title and content.
 */
function saveCurrentNote() {
    const note = notesState.notes.find(n => n.id === notesState.currentNote);
    if (!note) return;

    if (!confirm('Are you sure you want to save changes to this note?')) {
        showToast('Save cancelled.', 'info');
        return;
    }

    const noteTitleInput = document.getElementById('note-title-input');
    const noteContentEditor = document.getElementById('note-content-editor');

    note.title = noteTitleInput ? noteTitleInput.value.trim() || 'Untitled Note' : 'Untitled Note';
    note.content = noteContentEditor ? noteContentEditor.innerHTML : '';
    note.updatedAt = new Date();

    saveNotes();
    sortNotes();

    notesState.editMode = false;
    showNoteEditor();

    showToast('Note saved successfully!');
}

/**
 * Searches notes by title, content, or tags and re-renders the filtered list.
 * @param {string} searchTerm - The search query.
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
    notesState.notes = filteredNotes;
    sortNotes();
    const sortedFilteredNotes = notesState.notes;
    notesState.notes = originalNotes;

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
 * Sets up the rich text editor for note content using `document.execCommand`.
 */
function setupRichTextEditor() {
    const editor = document.getElementById('note-content-editor');
    const toolbar = document.getElementById('formatting-toolbar');
    
    if (!editor || !toolbar) return;
    
    toolbar.querySelectorAll('.formatting-btn').forEach(btn => {
        btn.addEventListener('click', () => {
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
        });
    });
}

/**
 * Sets focus to the note title input, selecting its content.
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