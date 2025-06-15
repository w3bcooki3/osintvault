// caseStudies.js

// Data structure for default case studies (can be moved to a separate JSON file like tools.json)
const defaultCaseStudies = [
    {
        id: 'cs_1',
        title: 'APT28\'s Spear-Phishing Tactics Exposed',
        source: 'Mandiant Blog',
        author: 'Security Research Team',
        link: 'https://www.mandiant.com/resources/blog/apt28-spear-phishing-tactics',
        category: 'threat-intelligence',
        previewContent: 'Detailed analysis of recent spear-phishing campaigns attributed to APT28, focusing on their evolving TTPs and targeting vectors. Includes IOCs and recommendations.',
        tags: ['apt', 'phishing', 'russia', 'threat intelligence'],
        notes: 'Good overview of their recent activities. Check out the custom malware mentioned.',
        publishedDate: '2024-03-15T10:00:00Z',
        lastModified: '2024-03-15T10:00:00Z',
        starred: false,
        pinned: false,
        origin: 'pre-added'
    },
    {
        id: 'cs_2',
        title: 'Understanding Ransomware Attack Chains: A Case Study',
        source: 'CISA',
        author: 'Cybersecurity & Infrastructure Security Agency',
        link: 'https://www.cisa.gov/uscert/ncas/alerts/aa22-110a',
        category: 'malware-analysis',
        previewContent: 'This alert details the typical stages of a ransomware attack, using recent incidents as examples. It provides guidance for organizations to defend against and respond to ransomware.',
        tags: ['ransomware', 'cybersecurity', 'incident response'],
        notes: 'Solid, actionable advice. Useful for tabletop exercises.',
        publishedDate: '2023-08-01T14:30:00Z',
        lastModified: '2023-08-01T14:30:00Z',
        starred: true,
        pinned: false,
        origin: 'pre-added'
    },
    {
        id: 'cs_3',
        title: 'OSINT for Financial Investigations: Following the Money Trail',
        source: 'OSINT Today',
        author: 'Jane Analyst',
        link: 'https://www.osint.today/financial-investigations-money-trail',
        category: 'financial-osint',
        previewContent: 'Exploration of open-source intelligence techniques for tracking financial flows, including cryptocurrency analysis, corporate registry lookups, and public records.',
        tags: ['osint', 'finance', 'cryptocurrency', 'investigation'],
        notes: 'Excellent practical tips for tracing illicit funds. Need to explore the recommended tools further.',
        publishedDate: '2024-01-20T09:00:00Z',
        lastModified: '2024-01-20T09:00:00Z',
        starred: false,
        pinned: true,
        origin: 'pre-added'
    }
];

// Structure for categories (similar to intelligenceVaultTabStructure)
const caseStudyCategories = [
    { id: 'all', name: 'All Case Studies', icon: 'fas fa-globe' },
    { id: 'threat-intelligence', name: 'Threat Intelligence', icon: 'fas fa-shield-alt' },
    { id: 'breach-analysis', name: 'Breach Analysis', icon: 'fas fa-database' },
    { id: 'malware-analysis', name: 'Malware Analysis', icon: 'fas fa-bug' },
    { id: 'social-engineering', name: 'Social Engineering', icon: 'fas fa-users-slash' },
    { id: 'digital-forensics', name: 'Digital Forensics', icon: 'fas fa-magnifying-glass' },
    { id: 'reconnaissance', name: 'Reconnaissance', icon: 'fas fa-binoculars' },
    { id: 'vulnerability-research', name: 'Vulnerability Research', icon: 'fas fa-vial' },
    { id: 'legal-ethical', name: 'Legal & Ethical OSINT', icon: 'fas fa-balance-scale-right' },
    { id: 'financial-osint', name: 'Financial OSINT', icon: 'fas fa-money-bill-wave' },
    { id: 'other', name: 'Other', icon: 'fas fa-ellipsis-h' },
];

function initCaseStudies() {
    // Ensure default case studies are loaded if appState.caseStudies is empty or only contains user-added ones
    if (appState.caseStudies.filter(cs => cs.origin === 'pre-added').length === 0 && defaultCaseStudies.length > 0) {
        defaultCaseStudies.forEach(defaultCs => {
            if (!appState.caseStudies.some(cs => cs.id === defaultCs.id)) {
                appState.caseStudies.push({
                    ...defaultCs,
                    publishedDate: new Date(defaultCs.publishedDate),
                    lastModified: new Date(defaultCs.lastModified),
                });
            }
        });
        saveState(); // Save after potentially adding default case studies
    }

    // Bind event listeners for case study specific buttons
    document.getElementById('addCaseStudyBtn').addEventListener('click', () => {
        if (appState.readOnlyMode) {
            showToast("Cannot add case studies in read-only shared view.", "warning");
            return;
        }
        resetCaseStudyForm('add');
        // Populate category dropdown for the Add modal
        populateCaseStudyCategoryDropdown('caseStudyCategory');
        showModal('addCaseStudyModal');
    });
    document.getElementById('addCaseStudyBtnEmptyState').addEventListener('click', () => {
        if (appState.readOnlyMode) {
            showToast("Cannot add case studies in read-only shared view.", "warning");
            return;
        }
        resetCaseStudyForm('add');
        populateCaseStudyCategoryDropdown('caseStudyCategory');
        showModal('addCaseStudyModal');
    });
    document.getElementById('cancelAddCaseStudy').addEventListener('click', () => hideModal('addCaseStudyModal'));
    document.getElementById('addCaseStudyForm').addEventListener('submit', handleAddCaseStudy);
    document.getElementById('grabContentBtn').addEventListener('click', () => grabCaseStudyContent(false));

    document.getElementById('cancelEditCaseStudy').addEventListener('click', () => hideModal('editCaseStudyModal'));
    document.getElementById('editCaseStudyForm').addEventListener('submit', handleEditCaseStudy);
    document.getElementById('editGrabContentBtn').addEventListener('click', () => grabCaseStudyContent(true));

    document.getElementById('caseStudyViewToggle').addEventListener('click', toggleCaseStudyViewMode);

    // Event listener for custom category input in Add modal
    document.getElementById('caseStudyCategory').addEventListener('change', (e) => {
        const newCategoryInput = document.getElementById('newCaseStudyCategoryInput');
        if (e.target.value === 'custom') {
            newCategoryInput.style.display = 'block';
            newCategoryInput.setAttribute('required', 'required');
        } else {
            newCategoryInput.style.display = 'none';
            newCategoryInput.removeAttribute('required');
            newCategoryInput.value = '';
        }
    });

    // Event listener for custom category input in Edit modal
    document.getElementById('editCaseStudyCategory').addEventListener('change', (e) => {
        const editNewCategoryInput = document.getElementById('editNewCaseStudyCategoryInput');
        if (e.target.value === 'custom') {
            editNewCategoryInput.style.display = 'block';
            editNewCategoryInput.setAttribute('required', 'required');
        } else {
            editNewCategoryInput.style.display = 'none';
            editNewCategoryInput.removeAttribute('required');
            editNewCategoryInput.value = '';
        }
    });

    // Removed any listeners related to custom metadata or collection source
    // as these elements are no longer part of the case study modals.


    // Populate and render categories
    populateCaseStudyCategories();
    renderCaseStudies();
}

// Removed the addCaseStudyMetadataField function entirely, as it's no longer used.


// MODIFIED: resetCaseStudyForm to only clear category custom input
function resetCaseStudyForm(mode) {
    const form = mode === 'add' ? document.getElementById('addCaseStudyForm') : document.getElementById('editCaseStudyForm');
    form.reset();
    const newCategoryInput = document.getElementById('newCaseStudyCategoryInput');
    const editNewCategoryInput = document.getElementById('editNewCaseStudyCategoryInput');

    if (newCategoryInput) {
        newCategoryInput.style.display = 'none';
        newCategoryInput.removeAttribute('required');
        newCategoryInput.value = '';
    }
    if (editNewCategoryInput) {
        editNewCategoryInput.style.display = 'none';
        editNewCategoryInput.removeAttribute('required');
        editNewCategoryInput.value = '';
    }

    // Reset dropdown to default "Select Category"
    const addCategorySelect = document.getElementById('caseStudyCategory');
    if(addCategorySelect) addCategorySelect.value = '';

    const editCategorySelect = document.getElementById('editCaseStudyCategory');
    if(editCategorySelect) editCategorySelect.value = '';

    // No longer clearing custom metadata fields, as they are not part of these forms.
}


// Function to populate the category dropdowns in Add/Edit modals
function populateCaseStudyCategoryDropdown(selectElementId, selectedCategory = '') {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) return;

    // Preserve the first "Select Category" option
    const defaultOption = selectElement.querySelector('option[value=""]');
    selectElement.innerHTML = ''; // Clear all other options

    if (defaultOption) {
        selectElement.appendChild(defaultOption);
    } else {
        const newDefaultOption = document.createElement('option');
        newDefaultOption.value = '';
        newDefaultOption.textContent = 'Select Category';
        selectElement.appendChild(newDefaultOption);
    }

    // Get all existing categories (default + user-added)
    const allExistingCategories = new Set(caseStudyCategories.map(cat => cat.id));
    appState.caseStudies.forEach(cs => {
        if (cs.category && !caseStudyCategories.some(cat => cat.id === cs.category)) {
            allExistingCategories.add(cs.category);
        }
    });

    // Sort categories (exclude 'all' from this dropdown, it's for filtering only)
    const sortedCategories = Array.from(allExistingCategories)
        .filter(catId => catId !== 'all')
        .sort((a, b) => {
            const nameA = (caseStudyCategories.find(c => c.id === a) || { name: a }).name;
            const nameB = (caseStudyCategories.find(c => c.id === b) || { name: b }).name;
            return nameA.localeCompare(nameB);
        });

    sortedCategories.forEach(categoryId => {
        const option = document.createElement('option');
        option.value = categoryId;
        option.textContent = (caseStudyCategories.find(c => c.id === categoryId) || { name: categoryId }).name; // Use friendly name if available, otherwise ID
        selectElement.appendChild(option);
    });

    // Add the "Custom Category" option at the end
    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = 'Custom Category';
    selectElement.appendChild(customOption);

    // Set the selected value if provided
    if (selectedCategory) {
        // If selectedCategory is not in the default options, but is a custom one, set 'custom' and populate custom input
        const isDefault = caseStudyCategories.some(cat => cat.id === selectedCategory);
        if (isDefault) {
            selectElement.value = selectedCategory;
        } else if (selectedCategory) { // It's a custom category
            selectElement.value = 'custom';
            // Show custom input and set its value
            const customInput = document.getElementById(selectElementId.includes('edit') ? 'editNewCaseStudyCategoryInput' : 'newCaseStudyCategoryInput');
            if (customInput) {
                customInput.style.display = 'block';
                customInput.setAttribute('required', 'required');
                customInput.value = selectedCategory;
            }
        }
    }
}


function renderCaseStudies() {
    const container = document.getElementById('caseStudiesGrid');
    const emptyState = document.getElementById('emptyCaseStudyState');
    const categoryTabsContainer = document.getElementById('caseStudyParentTabs');

    if (!container || !emptyState || !categoryTabsContainer) {
        console.error("Missing DOM elements for case studies. Aborting render.");
        return;
    }

    // Filter case studies based on current category
    let filteredCaseStudies = appState.caseStudies;
    if (appState.currentCaseStudyCategory && appState.currentCaseStudyCategory !== 'all') {
        filteredCaseStudies = filteredCaseStudies.filter(cs => cs.category === appState.currentCaseStudyCategory);
    }

    // Apply global search filter if present (main search input impacts all active tabs)
    if (appState.filters.search) {
        const searchTerm = appState.filters.search.toLowerCase();
        filteredCaseStudies = filteredCaseStudies.filter(cs =>
            (cs.title || '').toLowerCase().includes(searchTerm) ||
            (cs.source || '').toLowerCase().includes(searchTerm) ||
            (cs.author || '').toLowerCase().includes(searchTerm) ||
            (cs.link || '').toLowerCase().includes(searchTerm) ||
            (cs.previewContent || '').toLowerCase().includes(searchTerm) ||
            (cs.notes || '').toLowerCase().includes(searchTerm) ||
            (cs.category || '').toLowerCase().includes(searchTerm) ||
            (cs.tags || []).some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    // Apply global pinned/starred filters if active (main filter input impacts all active tabs)
    if (appState.filters.category === 'pinned') {
        filteredCaseStudies = filteredCaseStudies.filter(cs => cs.pinned);
    } else if (appState.filters.category === 'starred') {
        filteredCaseStudies = filteredCaseStudies.filter(cs => cs.starred);
    }

    // Apply global sorting (main sort input impacts all active tabs)
    filteredCaseStudies.sort((a, b) => {
        switch (appState.filters.sort) {
            case 'recent':
                return new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0);
            case 'popular': // Not directly applicable without 'usageCount' for case studies, default to name
            case 'name':
            default:
                return (a.title || '').localeCompare(b.title || '');
        }
    });

    if (filteredCaseStudies.length === 0) {
        emptyState.style.display = 'block';
        container.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        container.style.display = appState.caseStudyViewMode === 'grid' ? 'grid' : 'flex';
        container.innerHTML = filteredCaseStudies.map(createCaseStudyCard).join('');
    }

    // Update view toggle button text based on appState.caseStudyViewMode
    const caseStudyViewToggleButton = document.getElementById('caseStudyViewToggle');
    if (caseStudyViewToggleButton) {
        if (appState.caseStudyViewMode === 'grid') {
            caseStudyViewToggleButton.innerHTML = '<i class="fas fa-list"></i> List View';
            caseStudyViewToggleButton.title = 'Switch to List View';
            container.classList.remove('tools-list'); // Use tools-list/grid for styling
            container.classList.add('tools-grid');
        } else {
            caseStudyViewToggleButton.innerHTML = '<i class="fas fa-th"></i> Grid View';
            caseStudyViewToggleButton.title = 'Switch to Grid View';
            container.classList.remove('tools-grid');
            container.classList.add('tools-list');
        }
    }

    // Highlight shared entries if in read-only mode and this is the target tab
    if (appState.readOnlyMode && appState.sharedEntryIds.length > 0 && appState.currentTab === 'case-studies') {
        // If shared scope is 'allCaseStudies' OR current category matches sharedTabId
        if (appState.sharedTabId === 'allCaseStudies' || appState.currentCaseStudyCategory === appState.sharedTabId) {
            appState.sharedEntryIds.forEach(id => {
                const entryCard = container.querySelector(`.tool-card[data-entry-id="${id}"]`);
                if (entryCard) {
                    entryCard.classList.add('shared-highlight');
                }
            });
        }
    }
}

// MODIFIED: createCaseStudyCard to ensure 'link' property is consistently used and no extra fields are displayed.
function createCaseStudyCard(caseStudy) {
    const isSelected = appState.selectedEntries.has(caseStudy.id);
    let faviconUrl = './favicon.png'; // Default fallback
    try {
        // Use caseStudy.link directly for favicon
        if (caseStudy.link) {
            faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(caseStudy.link).hostname}`;
        }
    } catch (e) {
        console.warn("Invalid URL for favicon:", caseStudy.link, e);
        faviconUrl = './favicon.png';
    }

    // Ensure only caseStudy.notes is used here for extraContent
    const extraContent = caseStudy.notes ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Notes:</strong> ${caseStudy.notes}</p>` : '';

    return `
        <div class="tool-card ${caseStudy.starred ? 'starred' : ''} ${caseStudy.pinned ? 'pinned' : ''} ${isSelected ? 'selected' : ''}"
        data-entry-id="${caseStudy.id}" data-entry-type="caseStudy" data-action="preview">
            <div class="tool-header">
                <div>
                    <div class="tool-title">
                        <input type="checkbox" class="bulk-checkbox" data-action="select" ${isSelected ? 'checked' : ''}>
                        <img src="${faviconUrl}" alt="Favicon" class="tool-favicon" onerror="this.src='./favicon.png'">
                        <i class="fas fa-newspaper" style="margin-right: 5px;"></i> <span>${caseStudy.title}</span>
                        ${caseStudy.origin === 'pre-added' ? '<span class="tag" style="background-color: var(--primary); color: white; margin-left: 10px;">Pre-added</span>' : ''}
                    </div>
                    <div class="tool-url">
                        <span>${caseStudy.source || 'N/A'}</span> ${caseStudy.link ? '<i class="fas fa-external-link-alt external-link-icon"></i>' : ''}
                    </div>
                </div>
                <div class="tool-actions">
                    ${caseStudy.link ? ` <button class="action-btn" data-action="redirectLink" title="Go to Article">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                    ` : ''}
                    <button class="action-btn" data-action="edit" title="Edit Case Study">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn ${caseStudy.starred ? 'starred' : ''}" data-action="star" title="Star Case Study">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="action-btn ${caseStudy.pinned ? 'pinned' : ''}" data-action="pin" title="Pin Case Study">
                        <i class="fas fa-thumbtack"></i>
                    </button>
                    <button class="action-btn" data-action="delete" title="Delete Case Study">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 5px;">
                ${caseStudy.previewContent ? `${caseStudy.previewContent.substring(0, 150)}...` : 'Click to preview content.'}
            </p>
            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 5px;">
                ${caseStudy.author ? `<i class="fas fa-user-edit"></i> Author: ${caseStudy.author}` : ''}
                ${caseStudy.publishedDate ? ` | <i class="fas fa-calendar-alt"></i> Published: ${new Date(caseStudy.publishedDate).toLocaleDateString()}` : ''}
            </p>
            ${extraContent}
            <div class="tool-tags">
                ${caseStudy.tags ? caseStudy.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
            </div>
        </div>
    `;
}



// NEW FUNCTION: openCaseStudyPreviewModal - ensure link property is used for redirection
// No changes here; it correctly uses caseStudy properties.
function openCaseStudyPreviewModal(caseStudy) {
    const modal = document.getElementById('caseStudyPreviewModal');
    if (!modal) return;

    document.getElementById('previewCaseStudyTitle').value = caseStudy.title || 'N/A';
    document.getElementById('previewCaseStudySourceAuthor').value = `${caseStudy.source || 'N/A'}${caseStudy.author ? ` by ${caseStudy.author}` : ''}`;
    document.getElementById('previewCaseStudyPublishedDate').value = caseStudy.publishedDate ? new Date(caseStudy.publishedDate).toLocaleDateString() : 'N/A';
    document.getElementById('previewCaseStudyCategoryTags').value = `${caseStudy.category ? caseStudy.category.charAt(0).toUpperCase() + caseStudy.category.slice(1) : 'N/A'}${caseStudy.tags && caseStudy.tags.length > 0 ? ` | Tags: ${caseStudy.tags.join(', ')}` : ''}`;
    document.getElementById('previewCaseStudyContent').value = caseStudy.previewContent || 'No preview content was grabbed or entered for this case study.';
    document.getElementById('previewCaseStudyNotes').value = caseStudy.notes || 'No personal notes for this case study.';

    const redirectToLinkBtn = document.getElementById('redirectToCaseStudyLink');
    if (redirectToLinkBtn) {
        if (caseStudy.link) {
            redirectToLinkBtn.onclick = () => {
                window.open(caseStudy.link, '_blank');
                hideModal('caseStudyPreviewModal');
                showToast('Opening full article...');
            };
            redirectToLinkBtn.disabled = false;
            redirectToLinkBtn.style.pointerEvents = 'auto';
            redirectToLinkBtn.style.opacity = '1';
        } else {
            redirectToLinkBtn.disabled = true;
            redirectToLinkBtn.style.pointerEvents = 'none';
            redirectToLinkBtn.style.opacity = '0.7';
            showToast('No link available for this case study.', 'warning');
        }
    }

    showModal('caseStudyPreviewModal');
}


function populateCaseStudyCategories() {
    const container = document.getElementById('caseStudyParentTabs');
    container.innerHTML = ''; // Clear existing tabs

    // Get all unique categories from existing case studies
    const existingCategories = new Set(appState.caseStudies.map(cs => cs.category));

    // Combine default categories with unique existing ones, ensuring 'all' is first
    const allCategoriesToShow = [];
    caseStudyCategories.forEach(cat => allCategoriesToShow.push(cat)); // Add all predefined categories

    // Add any existing custom categories that are not predefined
    existingCategories.forEach(catId => {
        if (!caseStudyCategories.some(predefinedCat => predefinedCat.id === catId)) {
            allCategoriesToShow.push({ id: catId, name: catId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '), icon: 'fas fa-tag' }); // Create a basic structure for custom categories
        }
    });

    // Sort remaining categories alphabetically (keeping 'all' first)
    allCategoriesToShow.sort((a, b) => {
        if (a.id === 'all') return -1;
        if (b.id === 'all') return 1;
        return a.name.localeCompare(b.name);
    });

    allCategoriesToShow.forEach(category => {
        const tabButton = document.createElement('button');
        tabButton.classList.add('nav-tab', 'case-study-category-tab');
        tabButton.dataset.category = category.id;
        tabButton.innerHTML = `<i class="${category.icon}"></i> ${category.name}`;

        if (appState.currentCaseStudyCategory === category.id) {
            tabButton.classList.add('active');
        }
        container.appendChild(tabButton);
    });

    // Event listener for category tab clicks (delegation on parent) - ensure it's not added multiple times
    // This listener is typically bound once in initCaseStudies.
    // If this function is called multiple times (e.g., after add/edit),
    // ensure this part is defensive or handled by init.
    // For now, let's assume this is called once during init.
}

function switchCaseStudyCategory(categoryId) {
    if (appState.readOnlyMode) {
        showToast("Cannot switch categories in read-only shared view.", "warning");
        return;
    }

    document.querySelectorAll('.case-study-category-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    const targetTabBtn = document.querySelector(`.case-study-category-tab[data-category="${categoryId}"]`);
    if (targetTabBtn) {
        targetTabBtn.classList.add('active');
    }

    appState.currentCaseStudyCategory = categoryId;
    appState.filters.search = ''; // Clear search when switching categories
    document.getElementById('searchInput').value = '';

    renderCaseStudies();
    saveState();
}

// MODIFIED: handleAddCaseStudy to REMOVE saving of collectionSource and metadata
async function handleAddCaseStudy(e) {
    e.preventDefault();
    if (appState.readOnlyMode) {
        showToast("Cannot add case studies in read-only shared view.", "warning");
        return;
    }

    const title = document.getElementById('caseStudyTitle').value.trim();
    const source = document.getElementById('caseStudySource').value.trim();
    const author = document.getElementById('caseStudyAuthor').value.trim();
    const link = document.getElementById('caseStudyLink').value.trim();
    let category = document.getElementById('caseStudyCategory').value;
    const newCategoryInput = document.getElementById('newCaseStudyCategoryInput').value.trim();
    const previewContent = document.getElementById('caseStudyPreviewContent').value.trim();
    const tags = document.getElementById('caseStudyTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    const notes = document.getElementById('caseStudyNotes').value.trim();

    // Removed collectionSource and customMetadata handling from here.


    if (!title || !link || !category) {
        showToast('Please fill in all required fields (Title, Link, Category).', 'error');
        return;
    }

    if (category === 'custom') {
        if (!newCategoryInput) {
            showToast('Please enter a custom category name.', 'error');
            return;
        }
        category = newCategoryInput.toLowerCase();
    }

    const newCaseStudy = {
        id: generateId(),
        type: 'caseStudy', // Important for generic handling
        title,
        source,
        author,
        link,
        category,
        previewContent,
        tags,
        notes,
        publishedDate: new Date(),
        lastModified: new Date(),
        starred: false,
        pinned: false,
        origin: 'user-added'
        // No collectionSource or metadata fields added here.
    };

    appState.caseStudies.push(newCaseStudy);
    hideModal('addCaseStudyModal');
    resetCaseStudyForm('add');
    showToast('Case study added successfully!');
    populateCaseStudyCategories(); // Update categories in case a new one was added
    renderCaseStudies();
    updateDashboard(); // Update counts
    saveState();
}

// MODIFIED: openEditCaseStudyModal to remove loading of collectionSource and metadata
function openEditCaseStudyModal(caseStudy) {
    if (appState.readOnlyMode) {
        showToast("Cannot edit case studies in read-only shared view.", "warning");
        return;
    }

    document.getElementById('editCaseStudyId').value = caseStudy.id;
    document.getElementById('editCaseStudyTitle').value = caseStudy.title;
    document.getElementById('editCaseStudySource').value = caseStudy.source;
    document.getElementById('editCaseStudyAuthor').value = caseStudy.author;
    document.getElementById('editCaseStudyLink').value = caseStudy.link;

    // Populate the category dropdown for the Edit modal
    populateCaseStudyCategoryDropdown('editCaseStudyCategory', caseStudy.category);

    document.getElementById('editCaseStudyPreviewContent').value = caseStudy.previewContent;
    document.getElementById('editCaseStudyTags').value = caseStudy.tags ? caseStudy.tags.join(', ') : '';
    document.getElementById('editCaseStudyNotes').value = caseStudy.notes;

    // Removed loading of collectionSource and custom metadata here.

    showModal('editCaseStudyModal');
}

// MODIFIED: handleEditCaseStudy to remove saving of collectionSource and metadata
async function handleEditCaseStudy(e) {
    e.preventDefault();
    if (appState.readOnlyMode) {
        showToast("Cannot edit case studies in read-only shared view.", "warning");
        return;
    }

    const id = document.getElementById('editCaseStudyId').value;
    const caseStudyToEdit = appState.caseStudies.find(cs => cs.id === id);

    if (!caseStudyToEdit) {
        showToast('Error: Case study not found.', 'error');
        return;
    }

    caseStudyToEdit.title = document.getElementById('editCaseStudyTitle').value.trim();
    caseStudyToEdit.source = document.getElementById('editCaseStudySource').value.trim();
    caseStudyToEdit.author = document.getElementById('editCaseStudyAuthor').value.trim();
    caseStudyToEdit.link = document.getElementById('editCaseStudyLink').value.trim();
    let category = document.getElementById('editCaseStudyCategory').value;
    const newCategoryInput = document.getElementById('editNewCaseStudyCategoryInput').value.trim();
    caseStudyToEdit.previewContent = document.getElementById('editCaseStudyPreviewContent').value.trim();
    caseStudyToEdit.tags = document.getElementById('editCaseStudyTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    caseStudyToEdit.notes = document.getElementById('editCaseStudyNotes').value.trim();
    caseStudyToEdit.lastModified = new Date(); // Update last modified date

    // Removed saving of collectionSource and custom metadata here.

    if (category === 'custom') {
        if (!newCategoryInput) {
            showToast('Please enter a custom category name.', 'error');
            return;
        }
        category = newCategoryInput.toLowerCase();
    }
    caseStudyToEdit.category = category;

    hideModal('editCaseStudyModal');
    showToast('Case study updated successfully!');
    populateCaseStudyCategories(); // Update categories in case a new one was added/changed
    renderCaseStudies();
    updateDashboard();
    saveState();
}

async function grabCaseStudyContent(isEditMode) {
    const linkInputId = isEditMode ? 'editCaseStudyLink' : 'caseStudyLink';
    const contentOutputId = isEditMode ? 'editCaseStudyPreviewContent' : 'caseStudyPreviewContent';

    const link = document.getElementById(linkInputId).value.trim();
    const contentOutput = document.getElementById(contentOutputId);

    if (!link) {
        showToast('Please enter a link first.', 'warning');
        return;
    }

    contentOutput.value = 'Attempting to grab content...';
    showToast('Attempting to fetch content...', 'info');

    try {
        const proxyUrl = 'https://api.allorigins.win/get?url=';
        const response = await fetch(proxyUrl + encodeURIComponent(link));

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const contents = data.contents;

        if (!contents) {
            contentOutput.value = 'Could not grab content. Site might block scraping or proxy failed.';
            showToast('Failed to grab content. Try manually pasting a summary.', 'error');
            return;
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(contents, 'text/html');

        let preview = '';

        const metaDescription = doc.querySelector('meta[name="description"]');
        if (metaDescription && metaDescription.content) {
            preview = metaDescription.content;
        } else {
            const ogDescription = doc.querySelector('meta[property="og:description"]');
            if (ogDescription && ogDescription.content) {
                preview = ogDescription.content;
            } else {
                const paragraphs = doc.querySelectorAll('p');
                if (paragraphs.length > 0) {
                    for (let i = 0; i < Math.min(paragraphs.length, 3); i++) {
                        const text = paragraphs[i].textContent.trim();
                        if (text.length > 50) {
                            preview += text + ' ';
                        }
                    }
                    preview = preview.substring(0, 500) + (preview.length > 500 ? '...' : '');
                }
            }
        }

        if (preview) {
            contentOutput.value = preview;
            showToast('Content preview grabbed successfully!', 'success');
        } else {
            contentOutput.value = 'No significant text or meta description found. Try manually pasting a summary.';
            showToast('No content preview found. Try manually pasting a summary.', 'warning');
        }

    } catch (error) {
        console.error('Error grabbing content:', error);
        contentOutput.value = `Error: ${error.message}. Could not retrieve content. Check link or manually paste summary.`;
        showToast(`Error grabbing content: ${error.message}.`, 'error');
    }
}


function toggleCaseStudyViewMode() {
    if (appState.readOnlyMode) {
        showToast("Cannot change view mode in read-only shared view.", "warning");
        return;
    }
    appState.caseStudyViewMode = appState.caseStudyViewMode === 'grid' ? 'list' : 'grid';
    localStorage.setItem('caseStudyViewMode', appState.caseStudyViewMode);
    renderCaseStudies();
    showToast(`Switched Case Studies to ${appState.caseStudyViewMode} view.`);
}