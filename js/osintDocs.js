// osintDocs.js

let osintDocsData = {
    docSections: [],
    contentMap: {}
};

/**
 * Initializes the OSINT Docs tab by fetching content and binding event listeners.
 */
async function initOsintDocs() {
    try {
        const response = await fetch('osintDocsData.json'); // Adjust path if your JSON is elsewhere
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        osintDocsData = await response.json();
        // Store fetched data in appState.osintDocsStructure for global access if needed,
        // especially for search functionality that might span multiple modules.
        appState.osintDocsStructure = osintDocsData.docSections; // Ensure appState is updated with the structure
        appState.osintDocsContentMap = osintDocsData.contentMap; // Store content map if global access is desired
        renderOsintDocsContent();
        bindOsintDocsEvents();

        // Load default content on initialization if no specific subsection is active
        if (!appState.currentOsintDocsSection || !appState.currentOsintDocsSubsection) {
            const firstSection = osintDocsData.docSections[0];
            if (firstSection && firstSection.subsections && firstSection.subsections.length > 0) {
                loadOsintDocsContent(firstSection.id, firstSection.subsections[0].id);
                // Highlight the first subsection as active
                const firstSubsectionEl = document.querySelector(`.osint-docs-subsection[data-section="${firstSection.id}"][data-subsection="${firstSection.subsections[0].id}"]`);
                highlightActiveSubsection(firstSubsectionEl);
            }
        } else {
            // Re-render previously active section if state exists
            loadOsintDocsContent(appState.currentOsintDocsSection, appState.currentOsintDocsSubsection);
            const prevActiveEl = document.querySelector(`.osint-docs-subsection[data-section="${appState.currentOsintDocsSection}"][data-subsection="${appState.currentOsintDocsSubsection}"]`);
            highlightActiveSubsection(prevActiveEl);
        }

    } catch (error) {
        console.error("Failed to load OSINT Docs data:", error);
        const osintDocsTab = document.getElementById('osint-docsTab');
        if (osintDocsTab) {
            osintDocsTab.innerHTML = `
                <div class="content-header">
                    <h2 class="content-title">OSINT Documentation & Techniques</h2>
                </div>
                <div class="osint-docs-container">
                    <p style="color: var(--danger); text-align: center; margin-top: 50px;">
                        <i class="fas fa-exclamation-circle"></i> Failed to load documentation. Please check your internet connection or the 'osintDocsData.json' file path.
                    </p>
                </div>
            `;
        }
    }
}

/**
 * Renders the OSINT Docs content structure and initial view.
 */
function renderOsintDocsContent() {
    const osintDocsTab = document.getElementById('osint-docsTab');
    if (!osintDocsTab) return;

    osintDocsTab.innerHTML = `
        <div class="content-header">
            <h2 class="content-title">OSINT Documentation & Techniques</h2>
        </div>

        <div class="osint-docs-container">
            <div class="osint-docs-sidebar" id="osint-docs-sidebar">
                <div class="search-container">
                    <input type="text" id="osint-docs-search" class="search-input" placeholder="Search documentation...">
                    <i class="fas fa-search search-icon"></i>
                </div>
                <div class="osint-docs-toc" id="osint-docs-toc">
                    </div>
            </div>
            
            <div class="osint-docs-content" id="osint-docs-content">
                <div class="osint-docs-welcome">
                    <h2>Welcome to the OSINT Handbook</h2>
                    <p>Select a topic from the sidebar to get started with Open Source Intelligence techniques and best practices.</p>
                    <div class="osint-docs-featured">
                        <h3>Featured Topics</h3>
                        <div class="osint-docs-featured-grid">
                            <div class="osint-docs-featured-item" data-section="reconnaissance">
                                <i class="fas fa-binoculars"></i>
                                <h4>Reconnaissance</h4>
                                <p>Learn effective techniques for gathering initial intelligence</p>
                            </div>
                            <div class="osint-docs-featured-item" data-section="social-media">
                                <i class="fas fa-users"></i>
                                <h4>Social Media Intelligence</h4>
                                <p>Extract valuable information from social platforms</p>
                            </div>
                            <div class="osint-docs-featured-item" data-section="advanced-search">
                                <i class="fas fa-search-plus"></i>
                                <h4>Advanced Search Techniques</h4>
                                <p>Master search operators and dorks for precision</p>
                            </div>
                            <div class="osint-docs-featured-item" data-section="opsec">
                                <i class="fas fa-user-shield"></i>
                                <h4>OPSEC for Investigators</h4>
                                <p>Protect yourself while conducting investigations</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    populateTableOfContents();
}

/**
 * Populates the table of contents with OSINT documentation sections.
 */
function populateTableOfContents() {
    const tocContainer = document.getElementById('osint-docs-toc');
    if (!tocContainer || !osintDocsData.docSections) return;

    let tocHtml = '';
    osintDocsData.docSections.forEach(section => {
        tocHtml += `
            <div class="osint-docs-section">
                <div class="osint-docs-section-header" data-section="${section.id}">
                    <i class="${section.icon}"></i>
                    <span>${section.title}</span>
                    <i class="fas fa-chevron-down toggle-icon"></i>
                </div>
                <div class="osint-docs-subsections" id="subsections-${section.id}">
                    ${section.subsections.map(subsection =>
                        `<div class="osint-docs-subsection" data-section="${section.id}" data-subsection="${subsection.id}">
                            ${subsection.title}
                        </div>`
                    ).join('')}
                </div>
            </div>
        `;
    });
    tocContainer.innerHTML = tocHtml;
}

/**
 * Binds event listeners for the OSINT Docs tab.
 */
function bindOsintDocsEvents() {
    // Event delegation for section headers (expand/collapse)
    document.getElementById('osint-docs-toc')?.addEventListener('click', (e) => {
        const sectionHeader = e.target.closest('.osint-docs-section-header');
        if (sectionHeader) {
            const section = sectionHeader.dataset.section;
            const subsectionsEl = document.getElementById(`subsections-${section}`);
            const toggleIcon = sectionHeader.querySelector('.toggle-icon');
            
            if (subsectionsEl) {
                const isExpanded = subsectionsEl.classList.toggle('expanded');
                if (toggleIcon) {
                    toggleIcon.classList.toggle('fa-chevron-down', !isExpanded);
                    toggleIcon.classList.toggle('fa-chevron-up', isExpanded);
                }
            }
            
            // If section header is clicked, load the first subsection content
            const firstSubsection = document.querySelector(`.osint-docs-subsection[data-section="${section}"]`);
            if (firstSubsection) {
                loadOsintDocsContent(section, firstSubsection.dataset.subsection);
                highlightActiveSubsection(firstSubsection);
            }
        }
    });

    // Event delegation for subsection selection
    document.getElementById('osint-docs-toc')?.addEventListener('click', (e) => {
        const subsection = e.target.closest('.osint-docs-subsection');
        if (subsection) {
            const section = subsection.dataset.section;
            const subsectionId = subsection.dataset.subsection;
            
            loadOsintDocsContent(section, subsectionId);
            highlightActiveSubsection(subsection);
        }
    });

    // Event listener for featured topics
    document.querySelectorAll('.osint-docs-featured-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            if (section) {
                // Expand the section and load its first subsection
                const sectionHeader = document.querySelector(`.osint-docs-section-header[data-section="${section}"]`);
                if (sectionHeader) {
                    // Simulate a click on the header to expand it and load the first subsection
                    sectionHeader.click();
                } else {
                    // Fallback to just loading the first subsection if header not found/clickable
                    const firstSubsection = document.querySelector(`.osint-docs-subsection[data-section="${section}"]`);
                    if (firstSubsection) {
                        loadOsintDocsContent(section, firstSubsection.dataset.subsection);
                        highlightActiveSubsection(firstSubsection);
                    }
                }
            }
        });
    });

    // Search functionality
    document.getElementById('osint-docs-search')?.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        searchOsintDocs(searchTerm);
    });
}

/**
 * Highlights the active subsection in the table of contents.
 * @param {HTMLElement} activeSubsection - The subsection element to highlight.
 */
function highlightActiveSubsection(activeSubsection) {
    // Remove highlight from all subsections
    document.querySelectorAll('.osint-docs-subsection').forEach(el => {
        el.classList.remove('active');
    });
    
    // Add highlight to the active subsection
    if (activeSubsection) {
        activeSubsection.classList.add('active');
        
        // Ensure the parent section is expanded
        const section = activeSubsection.dataset.section;
        const subsectionsEl = document.getElementById(`subsections-${section}`);
        const toggleIcon = document.querySelector(`.osint-docs-section-header[data-section="${section}"] .toggle-icon`);
        
        if (subsectionsEl && !subsectionsEl.classList.contains('expanded')) {
            subsectionsEl.classList.add('expanded');
            if (toggleIcon) {
                toggleIcon.classList.remove('fa-chevron-down');
                toggleIcon.classList.add('fa-chevron-up');
            }
        }
    }
}

/**
 * Searches the OSINT documentation content.
 * @param {string} searchTerm - The term to search for.
 */
function searchOsintDocs(searchTerm) {
    if (!osintDocsData.docSections) return;
    
    // If search term is empty, reset the view
    if (!searchTerm) {
        document.querySelectorAll('.osint-docs-section').forEach(section => {
            section.style.display = 'block';
        });
        document.querySelectorAll('.osint-docs-subsection').forEach(subsection => {
            subsection.style.display = 'block';
        });
        document.getElementById('osint-docs-content').innerHTML = `
            <div class="osint-docs-welcome">
                <h2>Welcome to the OSINT Handbook</h2>
                <p>Select a topic from the sidebar to get started with Open Source Intelligence techniques and best practices.</p>
                <div class="osint-docs-featured">
                    <h3>Featured Topics</h3>
                    <div class="osint-docs-featured-grid">
                        <div class="osint-docs-featured-item" data-section="reconnaissance">
                            <i class="fas fa-binoculars"></i>
                            <h4>Reconnaissance</h4>
                            <p>Learn effective techniques for gathering initial intelligence</p>
                        </div>
                        <div class="osint-docs-featured-item" data-section="social-media">
                            <i class="fas fa-users"></i>
                            <h4>Social Media Intelligence</h4>
                            <p>Extract valuable information from social platforms</p>
                        </div>
                        <div class="osint-docs-featured-item" data-section="advanced-search">
                            <i class="fas fa-search-plus"></i>
                            <h4>Advanced Search Techniques</h4>
                            <p>Master search operators and dorks for precision</p>
                        </div>
                        <div class="osint-docs-featured-item" data-section="opsec">
                            <i class="fas fa-user-shield"></i>
                            <h4>OPSEC for Investigators</h4>
                            <p>Protect yourself while conducting investigations</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        // Rebind featured item events because innerHTML was reset
        document.querySelectorAll('.osint-docs-featured-item').forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                if (section) {
                    const sectionHeader = document.querySelector(`.osint-docs-section-header[data-section="${section}"]`);
                    if (sectionHeader) {
                        sectionHeader.click();
                    } else {
                        const firstSubsection = document.querySelector(`.osint-docs-subsection[data-section="${section}"]`);
                        if (firstSubsection) {
                            loadOsintDocsContent(section, firstSubsection.dataset.subsection);
                            highlightActiveSubsection(firstSubsection);
                        }
                    }
                }
            });
        });
        return;
    }
    
    // Search through sections and subsections
    let hasResults = false;
    osintDocsData.docSections.forEach(section => {
        const sectionEl = document.querySelector(`.osint-docs-section-header[data-section="${section.id}"]`)?.closest('.osint-docs-section');
        const sectionMatch = section.title.toLowerCase().includes(searchTerm);
        let subsectionMatches = false;
        
        section.subsections.forEach(subsection => {
            const subsectionEl = document.querySelector(`.osint-docs-subsection[data-section="${section.id}"][data-subsection="${subsection.id}"]`);
            const subsectionMatch = subsection.title.toLowerCase().includes(searchTerm);
            
            if (subsectionEl) {
                if (subsectionMatch) {
                    subsectionEl.style.display = 'block';
                    subsectionMatches = true;
                    hasResults = true;
                } else {
                    subsectionEl.style.display = 'none';
                }
            }
        });
        
        if (sectionEl) {
            if (sectionMatch || subsectionMatches) {
                sectionEl.style.display = 'block';
                if (subsectionMatches) {
                    const subsectionsEl = document.getElementById(`subsections-${section.id}`);
                    const toggleIcon = sectionEl.querySelector('.toggle-icon');
                    if (subsectionsEl && !subsectionsEl.classList.contains('expanded')) {
                        subsectionsEl.classList.add('expanded');
                        if (toggleIcon) {
                            toggleIcon.classList.remove('fa-chevron-down');
                            toggleIcon.classList.add('fa-chevron-up');
                        }
                    }
                }
            } else {
                sectionEl.style.display = 'none';
            }
        }
    });
    
    const contentContainer = document.getElementById('osint-docs-content');
    if (contentContainer) {
        if (!hasResults) {
            contentContainer.innerHTML = `
                <div class="osint-docs-no-results">
                    <i class="fas fa-search"></i>
                    <h3>No Results Found</h3>
                    <p>No documentation topics match your search term: "${searchTerm}"</p>
                    <p>Try using different keywords or browse the topics in the sidebar.</p>
                </div>
            `;
        } else {
            // If there are results, don't clear the content. The content area should still show the last loaded document,
            // or we could load the first matching document. For now, leave it as last loaded.
            // A more advanced search could involve searching the content itself and displaying excerpts.
            // For simplicity, we're just filtering the TOC here.
        }
    }
}

/**
 * Loads content for a specific OSINT documentation section and subsection.
 * @param {string} sectionId - The section ID.
 * @param {string} subsectionId - The subsection ID.
 */
function loadOsintDocsContent(sectionId, subsectionId) {
    const contentContainer = document.getElementById('osint-docs-content');
    if (!contentContainer || !osintDocsData.contentMap) return;
    
    const contentKey = `${sectionId}-${subsectionId}`;
    const contentHtml = osintDocsData.contentMap[contentKey];
    
    if (contentHtml) {
        contentContainer.innerHTML = contentHtml;
    } else {
        contentContainer.innerHTML = `
            <h2>Content Under Development</h2>
            <div class="osint-docs-content-section">
                <div class="osint-docs-callout">
                    <h4><i class="fas fa-tools"></i> Under Construction</h4>
                    <p>The content for this section (${sectionId}-${subsectionId}) is currently being developed. Please check back later or explore other sections of the OSINT Handbook.</p>
                </div>
                
                <p>In the meantime, you might want to explore these related topics:</p>
                <ul id="related-topics-suggestions">
                    <li>Introduction to OSINT</li>
                    <li>Advanced Search Techniques</li>
                    <li>Social Media Intelligence</li>
                    <li>OPSEC for Investigators</li>
                </ul>
            </div>
        `;
    }
    
    // Update the current section and subsection in appState
    appState.currentOsintDocsSection = sectionId;
    appState.currentOsintDocsSubsection = subsectionId;
    saveState();
}

// Export functions to make them available globally
window.initOsintDocs = initOsintDocs;
window.renderOsintDocsContent = renderOsintDocsContent;
window.bindOsintDocsEvents = bindOsintDocsEvents;
window.loadOsintDocsContent = loadOsintDocsContent;