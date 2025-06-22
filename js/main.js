let appState = {
    tools: [], // Will be loaded from tools.json or localStorage
    emails: [],
    phones: [],
    crypto: [],
    locations: [],
    links: [],
    media: [],
    passwords: [],
    keywords: [],
    socials: [],
    domains: [],
    usernames: [],
    threats: [],
    vulnerabilities: [],
    malware: [],
    breaches: [],
    credentials: [],
    forums: [],
    vendors: [],
    telegramChannels: [],
    pastes: [],
    documents: [],
    networks: [],
    metadataEntries: [],
    archives: [],
    messagingApps: [],
    datingProfiles: [],
    audioEntries: [],
    facialRecognition: [],
    personas: [],
    vpns: [],
    honeypots: [],
    exploits: [],
    publicRecords: [],
    caseStudies: [], // Will be loaded from caseStudies.json or localStorage
    selectedEntries: new Set(),
    currentTab: 'welcome',
    currentIntelligenceVaultParentTab: 'generalAndCore',
    currentIntelligenceVaultChildTab: 'tools',
    currentCustomVaultEntrySubTab: 'tool',
    currentCustomVaultParentTab: 'coreInvestigation',
    currentCaseStudyCategory: 'all',
    customTabs: [],
    filters: {
        category: '',
        search: '',
        sort: 'name',
        searchScope: 'currentTab'
    },
    theme: localStorage.getItem('theme') || 'dark',
    viewMode: localStorage.getItem('viewMode') || 'grid',
    caseStudyViewMode: localStorage.getItem('caseStudyViewMode') || 'grid',

    usageStats: {
        toolsUsedToday: 0
    },
    readOnlyMode: false,
    sharedTabId: null,
    sharedEntryIds: [],
    hasUnsavedChanges: false,
    handbookData: { sections: [] }, // Will be loaded from handbookData.json or localStorage
    osintDocsStructure: [], // Will be loaded from osintDocsData.json or localStorage
    osintDocsContentMap: {},
    currentOsintDocsSection: null,
    currentOsintDocsSubsection: null,
    auditLogs: [], // Audit logs will be loaded from localStorage, or initialized on first run.
};
        // --- End of appState definition --- //

        const availableIcons = [
            'fas fa-globe', 'fas fa-search', 'fas fa-fingerprint', 'fas fa-shield-alt',
            'fas fa-link', 'fas fa-network-wired', 'fas fa-envelope', 'fas fa-image',
            'fas fa-map-marker-alt', 'fas fa-book', 'fas fa-coins', 'fas fa-users',
            'fas fa-camera', 'fas fa-lock', 'fas fa-key', 'fas fa-bug', 'fas fa-cloud',
            'fas fa-mobile-alt', 'fas fa-server', 'fas fa-database', 'fas fa-code',
            'fas fa-chart-line', 'fas fa-user-secret', 'fas fa-lightbulb', 'fas fa-laptop-code',
            'fas fa-phone', 'fas fa-money-bill-wave', 'fas fa-video', 'fas fa-paste', 'fas fa-location-arrow',
            'fas fa-font',
            'fas fa-microscope'
        ];

        const availableColors = [
            'var(--tab-color-default)', 'var(--tab-color-red)', 'var(--tab-color-blue)',
            'var(--tab-color-green)', 'var(--tab-color-yellow)', 'var(--tab-color-purple)',
            'var(--tab-color-orange)'
        ];




        function initApp() {
            loadDorkAssistantState();
            loadState();
            parseShareableLink();
            updateDashboard();
            bindEvents();
            initTheme();

            checkAndShowDesktopRecommendation();

            const validTabs = ['dashboard', 'intelligence-vault', 'custom-tabs', 'handbook', 'dork-assistant', 'case-studies'];
            if (!validTabs.includes(appState.currentTab)) {
                appState.currentTab = 'dashboard';
            }

            switchTab(appState.currentTab); // This will call renderIntelligenceEntries, renderCaseStudies, etc.

            
            populateCategoryFilter();
            updateDashboard(); // Calls all dashboard rendering functions, including charts
            applyReadOnlyMode();
            

            const viewToggleButtons = document.querySelectorAll('#viewToggle, #vaultViewToggle, #customVaultViewToggle');
            viewToggleButtons.forEach(btn => {
                if (appState.viewMode === 'grid') {
                    btn.innerHTML = '<i class="fas fa-list"></i> List View';
                    btn.title = 'Switch to List View';
                } else {
                    btn.innerHTML = '<i class="fas fa-th"></i> Grid View';
                    btn.title = 'Switch to Grid View';
                }
            });
        }
        // --- End of initApp (full code block) ---


        // --- Start of loadState (full code block) ---
        function loadState() {
            const savedState = localStorage.getItem('osintArsenalState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);

                // Explicitly initialize all array properties with empty arrays first,
                // so they are never undefined, even if not present in older savedState.
                // This block ensures all properties are present before assignment from parsedState
                // to avoid issues with older state versions missing properties.
                appState.tools = [];
                appState.emails = [];
                appState.phones = [];
                appState.crypto = [];
                appState.locations = [];
                appState.links = [];
                appState.media = [];
                appState.passwords = [];
                appState.keywords = [];
                appState.socials = [];
                appState.domains = [];
                appState.usernames = [];
                appState.threats = [];
                appState.vulnerabilities = [];
                appState.malware = [];
                appState.breaches = [];
                appState.credentials = [];
                appState.forums = [];
                appState.vendors = [];
                appState.telegramChannels = [];
                appState.pastes = [];
                appState.documents = [];
                appState.networks = [];
                appState.metadataEntries = [];
                appState.archives = [];
                appState.messagingApps = [];
                appState.datingProfiles = [];
                appState.audioEntries = [];
                appState.facialRecognition = [];
                appState.personas = [];
                appState.vpns = [];
                appState.honeypots = [];
                appState.exploits = [];
                appState.publicRecords = [];
                appState.caseStudies = []; // Ensure caseStudies is initialized
                appState.auditLogs = []; // Initialize auditLogs as empty array


                // Now, populate from parsedState, safely falling back to empty arrays if null/undefined
                appState.tools = (parsedState.tools || []).map(entry => ({
                    ...entry,
                    addedDate: entry.addedDate ? new Date(entry.addedDate) : null,
                    lastUsed: entry.lastUsed || 0,
                    customTabs: entry.customTabs || [],
                    intelligenceVaultCategories: entry.intelligenceVaultCategories || [],
                    origin: entry.origin || 'user-added'
                }));

                appState.emails = (parsedState.emails || []).map(entry => ({
                    ...entry,
                    linkedPlatforms: entry.linkedPlatforms || []
                }));

                appState.phones = parsedState.phones || [];

                appState.crypto = (parsedState.crypto || []).map(entry => ({
                    ...entry,
                    amount: parseFloat(entry.amount) || 0
                }));

                appState.locations = parsedState.locations || [];

                appState.links = parsedState.links || [];

                appState.media = (parsedState.media || []).map(entry => ({
                    ...entry,
                    base64Data: entry.base64Data || ''
                }));

                appState.passwords = parsedState.passwords || [];

                appState.keywords = parsedState.keywords || [];

                appState.socials = parsedState.socials || [];

                appState.domains = parsedState.domains || [];

                appState.usernames = parsedState.usernames || [];

                appState.threats = parsedState.threats || [];

                appState.vulnerabilities = (parsedState.vulnerabilities || []).map(entry => ({
                    ...entry,
                    cvss: parseFloat(entry.cvss) || 0
                }));

                appState.malware = parsedState.malware || [];

                appState.breaches = (parsedState.breaches || []).map(entry => ({
                    ...entry,
                    records: parseInt(entry.records) || 0
                }));

                appState.credentials = parsedState.credentials || [];

                appState.forums = parsedState.forums || [];

                appState.vendors = parsedState.vendors || [];

                appState.telegramChannels = (parsedState.telegramChannels || []).map(entry => ({
                    ...entry,
                    subscribers: parseInt(entry.subscribers) || 0
                }));

                appState.pastes = parsedState.pastes || [];

                appState.documents = parsedState.documents || [];

                appState.networks = parsedState.networks || [];

                appState.metadataEntries = parsedState.metadataEntries || [];

                appState.archives = (parsedState.archives || []).map(entry => ({
                    ...entry,
                    timestamp: entry.timestamp ? new Date(entry.timestamp).getTime() : null
                }));

                appState.messagingApps = (parsedState.messagingApps || []);

                appState.datingProfiles = (parsedState.datingProfiles || []).map(entry => ({
                    ...entry,
                    age: parseInt(entry.age) || null
                }));

                appState.audioEntries = (parsedState.audioEntries || []).map(entry => ({
                    ...entry,
                    base64Data: entry.base64Data || ''
                }));

                appState.facialRecognition = parsedState.facialRecognition || [];

                appState.personas = parsedState.personas || [];

                appState.vpns = parsedState.vpns || [];

                appState.honeypots = parsedState.honeypots || [];

                appState.exploits = parsedState.exploits || [];

                appState.publicRecords = parsedState.publicRecords || [];
                
                // Load Case Studies - similar logic as tools
                appState.caseStudies = (parsedState.caseStudies || []).map(entry => ({
                    ...entry,
                    publishedDate: entry.publishedDate ? new Date(entry.publishedDate) : null,
                    lastModified: entry.lastModified ? new Date(entry.lastModified) : null,
                    tags: entry.tags || [],
                    starred: entry.starred || false,
                    pinned: entry.pinned || false
                }));

                // Load audit logs
                appState.auditLogs = (parsedState.auditLogs || []).map(log => ({
                    ...log,
                    timestamp: log.timestamp ? new Date(log.timestamp) : null,
                }));


                // Ensure other appState properties are loaded/initialized safely
                appState.selectedEntries = new Set(Array.isArray(parsedState.selectedEntries) ? parsedState.selectedEntries : []);
                appState.filters = parsedState.filters || {
                    category: '',
                    search: '',
                    sort: 'name',
                    searchScope: 'currentTab'
                };

                appState.theme = parsedState.theme || 'dark';
                appState.viewMode = parsedState.viewMode || 'grid';
                appState.usageStats = parsedState.usageStats || { toolsUsedToday: 0 };
                appState.customTabs = parsedState.customTabs || [];
                appState.currentCustomTab = parsedState.currentCustomTab && appState.customTabs.some(t => t.id === parsedState.currentCustomTab) ? parsedState.currentCustomTab : (appState.customTabs.length > 0 ? appState.customTabs[0].id : null);
                appState.currentIntelligenceVaultParentTab = parsedState.currentIntelligenceVaultParentTab || 'generalAndCore';
                appState.currentIntelligenceVaultChildTab = parsedState.currentIntelligenceVaultChildTab || 'tools';
                appState.currentCustomVaultParentTab = parsedState.currentCustomVaultParentTab || 'coreInvestigation';
                appState.currentCustomVaultEntrySubTab = parsedState.currentCustomVaultEntrySubTab || 'tool';


                // Notes State
                appState.notesState = parsedState.notesState || { notes: [], currentNote: null, editMode: false, noteSortFilter: 'updated_desc' };
                appState.notesState.notes.forEach(note => {
                    note.createdAt = new Date(note.createdAt);
                    note.updatedAt = new Date(note.updatedAt);
                    if (typeof note.pinned === 'undefined') {
                        note.pinned = false;
                    }
                });

                // Dork Assistant State
                appState.dorkAssistantState = parsedState.dorkAssistantState || {
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
                    conversionJustPerformed: false
                };
                if (appState.dorkAssistantState.savedQueries) {
                    appState.dorkAssistantState.savedQueries.forEach(query => {
                        if (query.createdAt && typeof query.createdAt === 'string') {
                            query.createdAt = new Date(query.createdAt);
                        }
                    });
                }

                appState.customVaultViewMode = parsedState.customVaultViewMode || 'entries';
                
                appState.currentHandbookSubTab = parsedState.currentHandbookSubTab || 'handbook';
                appState.currentHandbookSection = parsedState.currentHandbookSection || null;
                appState.currentOsintDocsSection = parsedState.currentOsintDocsSection || null;
                appState.currentOsintDocsSubsection = parsedState.currentOsintDocsSubsection || null;

                // Merge default tools AFTER loading saved state
                defaultTools.forEach(defaultTool => {
                    const exists = appState.tools.some(tool => tool.id === defaultTool.id);
                    if (!exists) {
                        appState.tools.push({
                            ...defaultTool,
                            addedDate: new Date(defaultTool.addedDate),
                            origin: 'pre-added'
                        });
                    }
                });

            } else {
                // If no saved state exists (first-time user), initialize with default values
                appState.tools = defaultTools.map(tool => ({ ...tool, addedDate: new Date(tool.addedDate), origin: 'pre-added' }));
                appState.customTabs = [{
                    id: generateId(),
                    name: 'My First Vault',
                    toolIds: [],
                    icon: 'fas fa-folder',
                    color: 'var(--tab-color-default)'
                }];
                appState.currentCustomTab = appState.customTabs[0]?.id || null;

                appState.currentIntelligenceVaultParentTab = 'generalAndCore';
                appState.currentIntelligenceVaultChildTab = 'tools';
                appState.currentCustomVaultParentTab = 'coreInvestigation';
                appState.currentCustomVaultEntrySubTab = 'tool';
                appState.currentHandbookSubTab = 'handbook';
                appState.currentHandbookSection = null;
                appState.currentCaseStudyCategory = 'all';


                // Initialize all other arrays as empty for a fresh start (Crucial for first-time load)
                appState.emails = [];
                appState.phones = [];
                appState.crypto = [];
                appState.locations = [];
                appState.links = [];
                appState.media = [];
                appState.passwords = [];
                appState.keywords = [];
                appState.socials = [];
                appState.domains = [];
                appState.usernames = [];
                appState.threats = [];
                appState.vulnerabilities = [];
                appState.malware = [];
                appState.breaches = [];
                appState.credentials = [];
                appState.forums = [];
                appState.vendors = [];
                appState.telegramChannels = [];
                appState.pastes = [];
                appState.documents = [];
                appState.networks = [];
                appState.metadataEntries = [];
                appState.archives = [];
                appState.messagingApps = [];
                appState.datingProfiles = [];
                appState.audioEntries = [];
                appState.facialRecognition = [];
                appState.personas = [];
                appState.vpns = [];
                appState.honeypots = [];
                appState.exploits = [];
                appState.publicRecords = [];
                appState.caseStudies = []; // Initialize caseStudies as empty for fresh start

                appState.notesState = { notes: [], currentNote: null, editMode: false, noteSortFilter: 'updated_desc' };
                appState.auditLogs = [{ // Initial system log entry for a fresh start
                    id: generateId(),
                    timestamp: new Date(),
                    action: 'initialized',
                    category: 'system',
                    description: 'OSINTVault application initialized.',
                    details: { version: '3.0', method: 'fresh_start', session: 'New Session' },
                    userId: 'system' // or a generated session ID
                }];

                appState.dorkAssistantState = {
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
                    conversionJustPerformed: false
                };
                appState.customVaultViewMode = 'entries';

                // Set default handbookData and osintDocsStructure to empty, they will be loaded by their respective init functions
                appState.handbookData = { sections: [] };
                appState.osintDocsStructure = [];
                appState.osintDocsContentMap = {};
                appState.currentOsintDocsSection = null;
                appState.currentOsintDocsSubsection = null;
            }
        }
        // --- End of loadState (full code block) ---

        function openMobileMenu() {
            const mobileSidebarMenu = document.getElementById('mobileSidebarMenu');
            const mobileMenuContent = mobileSidebarMenu.querySelector('.mobile-menu-content');
            const mainNavTabs = document.querySelector('.main-nav-tabs');
            const headerControls = document.querySelector('.controls');
            mobileMenuContent.innerHTML = '';

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

            // Create container for cloned controls
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

            // Export Button
            const exportBtn = document.getElementById('exportBtn');
            if (exportBtn) {
                const mobileExportBtn = document.createElement('button');
                mobileExportBtn.className = exportBtn.className + ' mobile-btn';
                mobileExportBtn.innerHTML = exportBtn.innerHTML;
                mobileExportBtn.addEventListener('click', () => { exportData(); closeMobileMenu(); });
                controlsClonedContainer.appendChild(mobileExportBtn);
            }

            // Share Button
            const shareOptionsBtn = document.getElementById('shareOptionsBtn');
            if (shareOptionsBtn) {
                const mobileShareOptionsBtn = document.createElement('button');
                mobileShareOptionsBtn.className = shareOptionsBtn.className + ' mobile-btn';
                mobileShareOptionsBtn.innerHTML = shareOptionsBtn.innerHTML;
                mobileShareOptionsBtn.addEventListener('click', () => { showShareOptionsModal(); closeMobileMenu(); });
                controlsClonedContainer.appendChild(mobileShareOptionsBtn);
            }

            // Theme Toggle
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

            mobileSidebarMenu.querySelector('.close-menu-btn').addEventListener('click', closeMobileMenu);
        }

        function saveState() {
            const stateToSave = JSON.parse(JSON.stringify(appState));

            if (stateToSave.tools) {
                stateToSave.tools.forEach(tool => {
                    if (tool.addedDate && typeof tool.addedDate.toISOString === 'function') {
                        tool.addedDate = tool.addedDate.toISOString();
                    }
                });
            }

            if (stateToSave.notesState && stateToSave.notesState.notes) {
                stateToSave.notesState.notes.forEach(note => {
                    if (note.createdAt && typeof note.createdAt.toISOString === 'function') {
                        note.createdAt = note.createdAt.toISOString();
                    }
                    if (note.updatedAt && typeof note.updatedAt.toISOString === 'function') {
                        note.updatedAt = note.updatedAt.toISOString();
                    }
                });
            }

            if (stateToSave.dorkAssistantState && stateToSave.dorkAssistantState.savedQueries) {
                stateToSave.dorkAssistantState.savedQueries.forEach(query => {
                    if (query.createdAt && typeof query.createdAt.toISOString === 'function') {
                        query.createdAt = query.createdAt.toISOString();
                    }
                });
            }


            if (stateToSave.archives) {
                stateToSave.archives.forEach(entry => {
                    if (entry.timestamp) {
                        entry.timestamp = new Date(entry.timestamp).toISOString();
                    }
                });
            }

            if (stateToSave.caseStudies) { 
                stateToSave.caseStudies.forEach(cs => {
                    if (cs.publishedDate && typeof cs.publishedDate.toISOString === 'function') {
                        cs.publishedDate = cs.publishedDate.toISOString();
                    }
                    if (cs.lastModified && typeof cs.lastModified.toISOString === 'function') {
                        cs.lastModified = cs.lastModified.toISOString();
                    }
                });
            }

            // Convert audit log timestamps to ISO strings for saving
            if (stateToSave.auditLogs) {
                stateToSave.auditLogs.forEach(log => {
                    if (log.timestamp && typeof log.timestamp.toISOString === 'function') {
                        log.timestamp = log.timestamp.toISOString();
                    }
                });
            }

            localStorage.setItem('osintArsenalState', JSON.stringify(stateToSave));
            appState.hasUnsavedChanges = false;
        }


        // MODIFIED: populateCategoryFilter to include case study categories in the main filter
        function populateCategoryFilter() {
            const categoryFilter = document.getElementById('categoryFilter');
            const toolCategorySelect = document.getElementById('toolCategory');
            const editToolCategorySelect = document.getElementById('editToolCategory');
            const toolOnlyCategorySelect = document.getElementById('toolOnlyCategory');

            const existingToolCategories = new Set(appState.tools.map(tool => tool.category.toLowerCase()));
            const existingCaseStudyCategories = new Set(appState.caseStudies.map(cs => cs.category.toLowerCase())); 

            // Add static options
            const defaultCategories = [
                'Search Engines', 'Social Media', 'Network Analysis', 'Email Investigation',
                'Domain Research', 'Image Analysis', 'GEOINT', 'Threat Intelligence', 'Archive', 'Other',
                // Specific default categories for case studies are now dynamically added from the caseStudyCategories array in caseStudies.js
            ];

            // Combine all categories from tools and case studies, then add default ones.
            const allCategories = new Set([
                ...defaultCategories.map(cat => cat.toLowerCase()),
                ...Array.from(existingToolCategories),
                ...Array.from(existingCaseStudyCategories) 
            ]);

            // Clear existing options
            categoryFilter.innerHTML = '<option value="">All Categories</option>';
            toolCategorySelect.innerHTML = '<option value="">Select Category</option>';
            editToolCategorySelect.innerHTML = '<option value="">Select Category</option>';
            toolOnlyCategorySelect.innerHTML = '<option value="">Select Category</option>';


            // Sort categories alphabetically for dropdowns
            const sortedCategories = Array.from(allCategories).sort((a, b) => a.localeCompare(b));

            sortedCategories.forEach(category => {
                // Filter dropdown
                const filterOption = document.createElement('option');
                filterOption.value = category;
                filterOption.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                categoryFilter.appendChild(filterOption);

                // Add Tool dropdowns (for tool type specific categories)
                const toolOption = document.createElement('option');
                toolOption.value = category;
                toolOption.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                toolCategorySelect.appendChild(toolOption);

                const editToolOption = document.createElement('option');
                editToolOption.value = category;
                editToolOption.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                editToolCategorySelect.appendChild(editToolOption);

                const toolOnlyOption = document.createElement('option');
                toolOnlyOption.value = category;
                toolOnlyOption.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                toolOnlyCategorySelect.appendChild(toolOnlyOption);
            });

            // Add "Custom" option to tool category select
            const customOptionAdd = document.createElement('option');
            customOptionAdd.value = 'custom';
            customOptionAdd.textContent = 'Custom Category';
            toolCategorySelect.appendChild(customOptionAdd);

            const customOptionAddToolOnly = document.createElement('option');
            customOptionAddToolOnly.value = 'custom';
            customOptionAddToolOnly.textContent = 'Custom Category';
            toolOnlyCategorySelect.appendChild(customOptionAddToolOnly);

            const customOptionEdit = document.createElement('option');
            customOptionEdit.value = 'custom';
            customOptionEdit.textContent = 'Custom Category';
            editToolCategorySelect.appendChild(customOptionEdit);


            // Set selected values for filters
            categoryFilter.value = appState.filters.category;
            document.getElementById('sortFilter').value = appState.filters.sort;

            // No need to populate case study category dropdown here anymore, it's handled by populateCaseStudyCategories in caseStudies.js
        }

        function renderIntelligenceEntries() {
            const toolsContainer = document.getElementById('toolsGrid');
            const customTabToolsContainer = document.getElementById('customTabToolsGrid');
            const intelligenceVaultEntriesContainer = document.getElementById('intelligenceVaultEntries');
            const caseStudiesGridContainer = document.getElementById('caseStudiesGrid');
            const emptyState = document.getElementById('emptyState'); // General empty state
            const emptyCustomTabState = document.getElementById('emptyCustomTabState'); // Empty state for custom-tabs (if no custom vaults exist)
            const emptyCurrentCustomTabState = document.getElementById('emptyCurrentCustomTabState'); // Empty state for a specific custom vault (if it has no entries)
            const emptyIntelligenceVaultState = document.getElementById('emptyIntelligenceVaultState'); // Empty state for Intelligence Vault
            const emptyCaseStudyState = document.getElementById('emptyCaseStudyState');

            // Hide all empty states and containers initially
            toolsContainer.style.display = 'none';
            customTabToolsContainer.style.display = 'none';
            intelligenceVaultEntriesContainer.style.display = 'none';
            if (caseStudiesGridContainer) caseStudiesGridContainer.style.display = 'none';
            emptyState.style.display = 'none';
            emptyCustomTabState.style.display = 'none';
            emptyCurrentCustomTabState.style.display = 'none';
            emptyIntelligenceVaultState.style.display = 'none';
            if (emptyCaseStudyState) emptyCaseStudyState.style.display = 'none';


            // Also hide all tab containers by default, they will be explicitly shown below
            const intelligenceVaultParentTabs = document.getElementById('intelligenceVaultParentTabs');
            const intelligenceVaultChildTabs = document.getElementById('intelligenceVaultChildTabs');
            const customVaultEntryParentTabs = document.getElementById('customVaultEntryParentTabs');
            const customVaultEntryChildTabs = document.getElementById('customVaultEntryChildTabs');
            const caseStudyParentTabs = document.getElementById('caseStudyParentTabs');

            if (intelligenceVaultParentTabs) intelligenceVaultParentTabs.style.display = 'none';
            if (intelligenceVaultChildTabs) intelligenceVaultChildTabs.style.display = 'none';
            if (customVaultEntryParentTabs) customVaultEntryParentTabs.style.display = 'none';
            if (customVaultEntryChildTabs) customVaultEntryChildTabs.style.display = 'none';
            if (caseStudyParentTabs) caseStudyParentTabs.style.display = 'none';

            let filteredEntries = filterEntries();

            let targetContainer = null;
            let currentEmptyState = null;
            let currentViewMode = appState.viewMode; // Default to general view mode
            let currentCaseStudyViewMode = appState.caseStudyViewMode; // Specific for case studies

            // Force to grid on mobile
            if (isMobileScreen()) {
                currentViewMode = 'grid';
                currentCaseStudyViewMode = 'grid';
            }


            if (appState.currentTab === 'intelligence-vault') {
                targetContainer = intelligenceVaultEntriesContainer;
                currentEmptyState = emptyIntelligenceVaultState;

                // Ensure intelligence vault parent and child tabs are visible
                if (intelligenceVaultParentTabs) intelligenceVaultParentTabs.style.display = 'flex';
                if (appState.currentIntelligenceVaultChildTab && intelligenceVaultChildTabs) {
                    intelligenceVaultChildTabs.style.display = 'flex';
                }

                if (filteredEntries.length === 0) {
                    currentEmptyState.style.display = 'block';
                    targetContainer.style.display = 'none';
                } else {
                    currentEmptyState.style.display = 'none';
                    // Use the determined viewMode here
                    targetContainer.style.display = currentViewMode === 'grid' ? 'grid' : 'flex';
                }

            } else if (appState.currentTab === 'custom-tabs') {
                targetContainer = customTabToolsContainer;

                if (appState.customTabs.length === 0) {
                    emptyCustomTabState.style.display = 'block';
                    document.getElementById('addEntryBtnCustomVault').style.display = 'none';
                    return;
                } else {
                    emptyCustomTabState.style.display = 'none';
                }

                if (appState.currentCustomTab) {
                    if (customVaultEntryParentTabs) customVaultEntryParentTabs.style.display = 'flex';
                    if (appState.currentCustomVaultEntrySubTab && customVaultEntryChildTabs) {
                        customVaultEntryChildTabs.style.display = 'flex';
                    }
                    document.getElementById('addEntryBtnCustomVault').style.display = appState.readOnlyMode ? 'none' : 'inline-flex';


                    if (filteredEntries.length === 0) {
                        emptyCurrentCustomTabState.style.display = 'block';
                        targetContainer.style.display = 'none';
                    } else {
                        emptyCurrentCustomTabState.style.display = 'none';
                        // Use the determined viewMode here
                        targetContainer.style.display = currentViewMode === 'grid' ? 'grid' : 'flex';
                    }
                } else {
                    emptyCurrentCustomTabState.style.display = 'block';
                    targetContainer.style.display = 'none';
                }


            } else if (appState.currentTab === 'case-studies') {
                targetContainer = caseStudiesGridContainer;
                currentEmptyState = emptyCaseStudyState;
                if (caseStudyParentTabs) caseStudyParentTabs.style.display = 'flex';

                if (filteredEntries.length === 0) {
                    currentEmptyState.style.display = 'block';
                    targetContainer.style.display = 'none';
                } else {
                    currentEmptyState.style.display = 'none';
                    // Use the determined caseStudyViewMode here
                    targetContainer.style.display = currentCaseStudyViewMode === 'grid' ? 'grid' : 'flex';
                }
            }

            if (targetContainer) {
                if (appState.currentTab === 'case-studies') {
                    if (currentCaseStudyViewMode === 'grid') { // Use currentCaseStudyViewMode
                        targetContainer.classList.remove('tools-list');
                        targetContainer.classList.add('tools-grid');
                    } else {
                        targetContainer.classList.remove('tools-grid');
                        targetContainer.classList.add('tools-list');
                    }
                    targetContainer.innerHTML = filteredEntries.map(entry => createEntryCard(entry)).join(''); // MODIFIED: Use createEntryCard as it's now universal
                } else {
                    if (currentViewMode === 'grid') { // Use currentViewMode
                        targetContainer.classList.remove('tools-list');
                        targetContainer.classList.add('tools-grid');
                    } else {
                        targetContainer.classList.remove('tools-grid');
                        targetContainer.classList.add('tools-list');
                    }
                    targetContainer.innerHTML = filteredEntries.map(entry => createEntryCard(entry)).join('');
                }
            }

            // Update view toggle button text based on appState.viewMode (they might be hidden by CSS but still update for consistency)
            const viewToggleButton = document.getElementById('viewToggle');
            const vaultViewToggleButton = document.getElementById('vaultViewToggle');
            const customVaultViewToggleButton = document.getElementById('customVaultViewToggle');
            const caseStudyViewToggleButton = document.getElementById('caseStudyViewToggle');

            if (viewToggleButton) {
                // Force text to "List View" if mobile (meaning it will only show grid)
                if (isMobileScreen()) {
                    viewToggleButton.innerHTML = '<i class="fas fa-list"></i> List View';
                    viewToggleButton.title = 'Switch to List View';
                } else if (appState.viewMode === 'grid') {
                    viewToggleButton.innerHTML = '<i class="fas fa-list"></i> List View';
                    viewToggleButton.title = 'Switch to List View';
                } else {
                    viewToggleButton.innerHTML = '<i class="fas fa-th"></i> Grid View';
                    viewToggleButton.title = 'Switch to Grid View';
                }
            }
            if (vaultViewToggleButton) {
                if (isMobileScreen()) {
                    vaultViewToggleButton.innerHTML = '<i class="fas fa-list"></i> List View';
                    vaultViewToggleButton.title = 'Switch to List View';
                } else if (appState.viewMode === 'grid') {
                    vaultViewToggleButton.innerHTML = '<i class="fas fa-list"></i> List View';
                    vaultViewToggleButton.title = 'Switch to List View';
                } else {
                    vaultViewToggleButton.innerHTML = '<i class="fas fa-th"></i> Grid View';
                    vaultViewToggleButton.title = 'Switch to Grid View';
                }
            }
            if (customVaultViewToggleButton) {
                if (isMobileScreen()) {
                    customVaultViewToggleButton.innerHTML = '<i class="fas fa-list"></i> List View';
                    customVaultViewToggleButton.title = 'Switch to List View';
                } else if (appState.viewMode === 'grid') {
                    customVaultViewToggleButton.innerHTML = '<i class="fas fa-list"></i> List View';
                    customVaultViewToggleButton.title = 'Switch to List View';
                } else {
                    customVaultViewToggleButton.innerHTML = '<i class="fas fa-th"></i> Grid View';
                    customVaultViewToggleButton.title = 'Switch to Grid View';
                }
            }
            if (caseStudyViewToggleButton) {
                if (isMobileScreen()) {
                    caseStudyViewToggleButton.innerHTML = '<i class="fas fa-list"></i> List View';
                    caseStudyViewToggleButton.title = 'Switch to List View';
                } else if (appState.caseStudyViewMode === 'grid') { // Use caseStudyViewMode
                    caseStudyViewToggleButton.innerHTML = '<i class="fas fa-list"></i> List View';
                    caseStudyViewToggleButton.title = 'Switch to List View';
                } else {
                    caseStudyViewToggleButton.innerHTML = '<i class="fas fa-th"></i> Grid View';
                    caseStudyViewToggleButton.title = 'Switch to Grid View';
                }
            }


            // New: Apply shared-highlight if in read-only mode and relevant entries are found
            if (appState.readOnlyMode && appState.sharedEntryIds.length > 0) {
                let shouldHighlight = false;
                if (appState.sharedTabId === 'allData' || appState.sharedTabId === 'allVault') {
                    shouldHighlight = true;
                } else if (appState.currentTab === 'custom-tabs' && appState.currentCustomTab === appState.sharedTabId) {
                    shouldHighlight = true;
                } else if (appState.currentTab === 'intelligence-vault' && appState.currentIntelligenceVaultChildTab === appState.sharedTabId) {
                    shouldHighlight = true;
                } else if (appState.currentTab === 'case-studies' && appState.currentCaseStudyCategory === appState.sharedTabId) {
                    shouldHighlight = true;
                }

                if (shouldHighlight) {
                    let containerToHighlight = null;
                    if (appState.currentTab === 'intelligence-vault') {
                        containerToHighlight = intelligenceVaultEntriesContainer;
                    } else if (appState.currentTab === 'custom-tabs') {
                        containerToHighlight = customTabToolsContainer;
                    } else if (appState.currentTab === 'case-studies') {
                        containerToHighlight = caseStudiesGridContainer;
                    }

                    if (containerToHighlight) {
                        appState.sharedEntryIds.forEach(id => {
                            const entryCard = containerToHighlight.querySelector(`.tool-card[data-entry-id="${id}"]`);
                            if (entryCard) {
                                entryCard.classList.add('shared-highlight');
                            }
                        });
                    }
                }
            }

            saveState();
        }

        function filterEntries() {
            let entriesToSearch = [];

            // Combine all entries from all types for the base set
            const allKnownEntries = [
                ...appState.tools,
                ...appState.emails,
                ...appState.phones,
                ...appState.crypto,
                ...appState.locations,
                ...appState.links,
                ...appState.media,
                ...appState.passwords,
                ...appState.keywords,
                ...appState.socials,
                ...appState.domains,
                ...appState.usernames,
                ...appState.threats,
                ...appState.vulnerabilities,
                ...appState.malware,
                ...appState.breaches,
                ...appState.credentials,
                ...appState.forums,
                ...appState.vendors,
                ...appState.telegramChannels,
                ...appState.pastes,
                ...appState.documents,
                ...appState.networks,
                ...appState.metadataEntries,
                ...appState.archives,
                ...appState.messagingApps,
                ...appState.datingProfiles,
                ...appState.audioEntries,
                ...appState.facialRecognition,
                ...appState.personas,
                ...appState.vpns,
                ...appState.honeypots,
                ...appState.exploits,
                ...appState.publicRecords,
                ...appState.caseStudies, 
            ];

            if (appState.filters.searchScope === 'allData' || appState.filters.searchScope === 'allVault') {
                entriesToSearch = allKnownEntries;
            } else {
                // For 'currentTab' scope within intelligence-vault or custom-tabs
                if (appState.currentTab === 'intelligence-vault') {
                    entriesToSearch = appState.tools.filter(tool =>
                        (tool.intelligenceVaultCategories || []).includes(appState.currentIntelligenceVaultChildTab)
                    );
                } else if (appState.currentTab === 'custom-tabs' && appState.currentCustomTab) {
                    const activeCustomTab = appState.customTabs.find(tab => tab.id === appState.currentCustomTab);
                    if (activeCustomTab) {
                        let entriesInActiveCustomTab = allKnownEntries.filter(entry =>
                            (entry.customTabs || []).includes(activeCustomTab.id)
                        );

                        if (appState.currentCustomVaultEntrySubTab) {
                            entriesToSearch = entriesInActiveCustomTab.filter(entry =>
                                entry.type === appState.currentCustomVaultEntrySubTab
                            );
                        } else {
                            entriesToSearch = entriesInActiveCustomTab;
                        }

                    } else {
                        entriesToSearch = [];
                    }
                } else if (appState.currentTab === 'case-studies') { 
                    entriesToSearch = appState.caseStudies;
                    if (appState.currentCaseStudyCategory && appState.currentCaseStudyCategory !== 'all') {
                        entriesToSearch = entriesToSearch.filter(cs => cs.category === appState.currentCaseStudyCategory);
                    }
                } else {
                    entriesToSearch = []; // No specific entries to filter for other tabs like analytics, threats, handbook
                }
            }

            let filtered = [...entriesToSearch]; // Start filtering from this base set

            // Apply search filter
            if (appState.filters.search) {
                const searchTerm = appState.filters.search.toLowerCase();
                filtered = filtered.filter(entry => {
                    const searchableFields = [
                        // Core fields common across many types
                        entry.name, entry.title, entry.description, entry.notes, entry.url, entry.value,
                        entry.category, // Only for tools, and case studies
                        entry.source,

                        // Specific fields for each type (check for existence to prevent errors)
                        entry.email, entry.number, entry.address, entry.txid,
                        entry.linkedPlatforms, entry.breachResults,
                        entry.phoneType, entry.location, entry.mapLink, entry.ipGeoIntel,
                        entry.mediaType,
                        entry.service, entry.username, entry.password, entry.strength,
                        entry.context,
                        entry.platform, entry.followCounts,

                        // New fields for all the added types
                        entry.domainType, entry.registrar, entry.status, entry.whois, entry.dns,
                        entry.platformsFound, entry.emails, entry.realName, entry.activity,
                        entry.threatType, entry.threatName, entry.severity, entry.iocs, entry.targets, entry.attribution, entry.threatSource,
                        entry.cve, entry.cvss, entry.software, entry.vulnType, entry.exploit, entry.mitigation,
                        entry.filename, entry.hash, entry.fileType, entry.family, entry.detection, entry.behavior, entry.malwareSource, entry.tools,
                        entry.company, entry.date, entry.records, entry.dataTypes, entry.vector, entry.breachStatus, entry.breachSource,
                        entry.credentialType, entry.credentialValue, entry.credentialService, entry.dateFound,
                        entry.forumName, entry.forumUrl, entry.forumType, entry.forumStatus, entry.forumLanguage,
                        entry.vendorAlias, entry.vendorPlatforms, entry.vendorProducts, entry.vendorReputation,
                        entry.telegramName, entry.telegramUrl, entry.telegramType, entry.subscribers, entry.language, entry.telegramActivity, entry.content, entry.admin,
                        entry.pasteUrl, entry.sourceSite, entry.contentSummary, entry.keywords,
                        entry.documentTitle, entry.documentFileType, entry.documentHash, entry.documentContentSummary, entry.documentSource,
                        entry.networkSubject, entry.networkType, entry.networkFindings, entry.associatedIpsDomains, entry.toolsUsed,
                        entry.metadataTitle, entry.fileSource, // For metadata entry type itself
                        entry.originalUrl, entry.archiveUrl, entry.service, entry.timestamp, // For archives
                        entry.messagingApp, entry.chatId, // For messaging
                        entry.datingPlatform, entry.displayName, entry.age, entry.photos, entry.bio, entry.verified, entry.suspicious,
                        entry.format, entry.duration, entry.quality, entry.audioLanguage, entry.transcript, entry.speakers, entry.background,
                        entry.subject, entry.sourceDescription, entry.identifiedProfiles, entry.confidence, entry.facialToolsUsed,
                        entry.realName, entry.associatedAccounts, entry.platformsUsed, entry.origin, // For persona
                        entry.vpnName, entry.vpnType, entry.jurisdiction, entry.logs, entry.payment, entry.locations, entry.issues, entry.useCase, // For VPN
                        entry.honeypotType, entry.honeypotLocation, entry.honeypotPurpose, entry.honeypotDataSummary, entry.honeypotAlerts,
                        entry.exploitName, entry.targetVuln, entry.exploitType, entry.marketSource, entry.price,
                        entry.recordType, entry.subjectName, entry.refId, entry.jurisdiction, entry.date, entry.summary, entry.sourceUrl,
                        entry.author, entry.previewContent 
                    ].map(field => String(field || '').toLowerCase());

                    if (entry.tags) {
                        searchableFields.push(...entry.tags.map(tag => tag.toLowerCase()));
                    }

                    if (entry.metadata) {
                        searchableFields.push(...entry.metadata.flatMap(meta => [String(meta.key || '').toLowerCase(), String(meta.value || '').toLowerCase()]));
                    }

                    return searchableFields.some(field => field.includes(searchTerm));
                });
            }

            // Apply universal "category" filters for pinned/starred
            if (appState.filters.category === 'pinned') {
                filtered = filtered.filter(entry => entry.pinned);
            } else if (appState.filters.category === 'starred') {
                filtered = filtered.filter(entry => entry.starred);
            } else if (appState.filters.category) {
                // This 'else if' block handles actual categories, only apply if the current view is for tools or case studies
                if (appState.currentTab === 'intelligence-vault' || (appState.currentTab === 'custom-tabs' && appState.currentCustomVaultEntrySubTab === 'tool')) { // Changed to 'tool'
                    filtered = filtered.filter(entry => entry.type === 'tool' && entry.category === appState.filters.category);
                } else if (appState.currentTab === 'case-studies' && appState.filters.category !== 'all') { 
                    // If the global category filter is used while on the case studies tab, apply it.
                    filtered = filtered.filter(entry => entry.type === 'caseStudy' && entry.category === appState.filters.category);
                } else {
                    // If a category filter is applied while not on a 'tools' or 'case-studies' tab, clear it visually.
                    document.getElementById('categoryFilter').value = '';
                    appState.filters.category = ''; // Ensure state is reset too
                }
            }

            // Apply sorting
            filtered.sort((a, b) => {
                switch (appState.filters.sort) {
                    case 'recent':
                        // Use publishedDate for case studies, addedDate for tools, etc.
                        const dateA = (a.type === 'caseStudy' ? a.publishedDate : a.addedDate) || 0; // MODIFIED
                        const dateB = (b.type === 'caseStudy' ? b.publishedDate : b.addedDate) || 0; // MODIFIED
                        return new Date(dateB) - new Date(dateA);
                    case 'popular': // Sort by lastUsed (most recent first)
                        return (b.lastUsed || 0) - (a.lastUsed || 0);
                    default: // 'name' (or primary identifier, which is often the first significant field)
                        // Use a more comprehensive list of potential name fields including 'title' for case studies
                        const nameA = a.name || a.title || a.email || a.number || a.address || a.value || a.username || a.filename || a.company || a.credentialValue || a.forumName || a.vendorAlias || a.telegramName || a.pasteUrl || a.documentTitle || a.networkSubject || a.metadataTitle || a.originalUrl || a.messagingUsername || a.facialSubject || a.personaName || a.vpnName || a.exploitName || a.publicRecordSubjectName || '';
                        const nameB = b.name || b.title || b.email || b.number || b.address || b.value || b.username || b.filename || b.company || b.credentialValue || b.forumName || b.vendorAlias || b.telegramName || b.pasteUrl || b.documentTitle || b.networkSubject || b.metadataTitle || b.originalUrl || b.messagingUsername || b.facialSubject || b.personaName || b.vpnName || b.exploitName || b.publicRecordSubjectName || '';
                        return nameA.localeCompare(nameB);
                }
            });

            return filtered;
        }

        // Create a generic entry card HTML
        function createEntryCard(entry) {
            const isSelected = appState.selectedEntries.has(entry.id);
            let title, subtitle, description, icon, faviconHtml = '', extraContent = '';

            // Determine the origin tag HTML
            let originTagHtml = '';
            if (entry.origin === 'pre-added') {
                originTagHtml = `<span class="tag" style="background-color: var(--primary); color: white; margin-left: 10px;">Pre-added</span>`;
            } else if (entry.origin === 'user-added') {
                originTagHtml = `<span class="tag" style="background-color: var(--accent); color: white; margin-left: 10px;">User-added</span>`;
            }

            // Default notes if not specified for a type
            const investigationNotes = entry.notes ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Notes:</strong> ${entry.notes}</p>` : '';

            switch (entry.type) {
                case 'tool':
                    title = entry.name;
                    subtitle = entry.url;
                    description = entry.description;
                    icon = 'fas fa-tools';
                    faviconHtml = `<img src="${entry.favicon}" alt="" class="tool-favicon" onerror="this.src='https://www.google.com/s2/favicons?domain=${new URL(entry.url).hostname}'">`;
                    extraContent += investigationNotes;
                    break;
                case 'email':
                    title = entry.email;
                    subtitle = entry.linkedPlatforms.join(', ') || 'No linked platforms';
                    description = entry.description || entry.notes;
                    icon = 'fas fa-envelope';
                    extraContent = entry.breachResults ? `<p style="color: var(--danger); font-size: 12px; margin-top: 5px;"><i class="fas fa-exclamation-triangle"></i> Breach: ${entry.breachResults}</p>` : '';
                    extraContent += investigationNotes;
                    break;
                case 'phone':
                    title = entry.number;
                    subtitle = `Type: ${entry.phoneType}`;
                    description = entry.description || entry.notes;
                    icon = 'fas fa-phone';
                    extraContent = entry.location ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><i class="fas fa-map-marker-alt"></i> ${entry.location}</p>` : '';
                    extraContent += investigationNotes;
                    break;
                case 'crypto':
                    title = entry.address;
                    subtitle = `TXID: ${entry.txid}`;
                    description = entry.description || `Amount: ${entry.amount} | Source: ${entry.source}`;
                    icon = 'fas fa-coins';
                    extraContent += investigationNotes;
                    break;
                case 'location':
                    title = entry.name;
                    subtitle = `Coordinates: ${entry.coordinates}`;
                    description = entry.description || entry.notes;
                    icon = 'fas fa-map-marker-alt';
                    extraContent = entry.mapLink ? `<p style="font-size: 12px; margin-top: 5px;"><a href="${entry.mapLink}" target="_blank" style="color: var(--primary); text-decoration: none;"><i class="fas fa-external-link-alt"></i> View Map</a></p>` : '';
                    extraContent += entry.ipGeoIntel ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;">IP/Geo: ${entry.ipGeoIntel}</p>` : '';
                    extraContent += investigationNotes;
                    break;
                case 'link':
                    title = entry.url;
                    subtitle = entry.platform || 'General Link';
                    description = entry.description || entry.notes;
                    icon = 'fas fa-link';
                    try {
                        faviconHtml = `<img src="https://www.google.com/s2/favicons?domain=${new URL(entry.url).hostname}" alt="" class="tool-favicon" onerror="this.src='./favicon.png'">`;
                    } catch (e) {
                        faviconHtml = '';
                    }
                    extraContent += investigationNotes;
                    break;
                case 'media':
                    title = entry.title;
                    subtitle = entry.mediaType === 'image' ? 'Image' : 'Video';
                    description = entry.description || entry.notes;
                    icon = entry.mediaType === 'image' ? 'fas fa-image' : 'fas fa-video';
                    extraContent = entry.base64Data ? (entry.mediaType === 'image' ? `<img src="${entry.base64Data}" alt="Media thumbnail" style="max-width: 100%; height: auto; border-radius: 8px; margin-top: 10px;">` : `<video controls style="max-width: 100%; height: auto; border-radius: 8px; margin-top: 10px;"><source src="${entry.base64Data}" type="video/mp4"></video>`) : '';
                    extraContent += investigationNotes;
                    break;
                case 'password':
                    title = entry.service;
                    subtitle = `Username: ${entry.username || 'N/A'}`;
                    description = entry.description || `Password: ${entry.password} | Strength: ${entry.strength || 'N/A'}`;
                    icon = 'fas fa-key';
                    extraContent += investigationNotes;
                    break;
                case 'keyword':
                    title = entry.value;
                    subtitle = `Context: ${entry.context || 'General'}`;
                    description = entry.description || entry.notes;
                    icon = 'fas fa-font';
                    extraContent += investigationNotes;
                    break;
                case 'social':
                    title = entry.username;
                    subtitle = `Platform: ${entry.platform}`;
                    description = entry.description || `URL: ${entry.url}\nFollowers/Following: ${entry.followCounts || 'N/A'}`;
                    icon = 'fas fa-users';
                    try {
                        faviconHtml = `<img src="https://www.google.com/s2/favicons?domain=${new URL(entry.url).hostname}" alt="" class="tool-favicon" onerror="this.src='./favicon.png'">`;
                    } catch (e) {
                        faviconHtml = '';
                    }
                    extraContent += investigationNotes;
                    break;
                case 'domain':
                    title = entry.value;
                    subtitle = `Type: ${entry.domainType} | Status: ${entry.status || 'N/A'}`;
                    description = entry.description || `Registrar: ${entry.registrar || 'N/A'}\nLocation: ${entry.location || 'N/A'}`;
                    icon = 'fas fa-globe';
                    extraContent = entry.whois ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>WHOIS:</strong> ${entry.whois}</p>` : '';
                    extraContent += entry.dns ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>DNS:</strong> ${entry.dns}</p>` : '';
                    extraContent += investigationNotes;
                    break;
                case 'username':
                    title = entry.value;
                    subtitle = `Real Name: ${entry.realName || 'N/A'}`;
                    description = entry.description || `Platforms: ${entry.platformsFound || 'N/A'}\nEmails: ${entry.emails || 'N/A'}\nActivity: ${entry.activity || 'N/A'}`;
                    icon = 'fas fa-user';
                    extraContent += investigationNotes;
                    break;
                case 'threat':
                    title = entry.name;
                    subtitle = `Type: ${entry.threatType} | Severity: ${entry.severity}`;
                    description = entry.description;
                    icon = 'fas fa-skull-crossbones';
                    extraContent = entry.iocs ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>IOCs:</strong> ${entry.iocs}</p>` : '';
                    extraContent += entry.targets ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Targets:</strong> ${entry.targets}</p>` : '';
                    extraContent += entry.attribution ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Attribution:</strong> ${entry.attribution}</p>` : '';
                    extraContent += investigationNotes;
                    break;
                case 'vulnerability':
                    title = entry.cve;
                    subtitle = `CVSS: ${entry.cvss} | Type: ${entry.vulnType}`;
                    description = entry.description || `Affected: ${entry.software || 'N/A'}\nExploit: ${entry.exploit || 'N/A'}`;
                    icon = 'fas fa-bug';
                    extraContent = entry.mitigation ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Mitigation:</strong> ${entry.mitigation}</p>` : '';
                    extraContent += investigationNotes;
                    break;
                case 'malware':
                    title = entry.filename;
                    subtitle = `Type: ${entry.fileType} | Hash: ${entry.hash}`;
                    description = entry.behavior || `Family: ${entry.family || 'N/A'}\nDetection: ${entry.detection || 'N/A'}`;
                    icon = 'fas fa-biohazard'; // More distinct malware icon
                    extraContent = entry.malwareSource ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Source:</strong> ${entry.malwareSource}</p>` : '';
                    extraContent += entry.tools ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Tools:</strong> ${entry.tools}</p>` : '';
                    extraContent += investigationNotes;
                    break;
                case 'breach':
                    title = entry.company;
                    subtitle = `Date: ${entry.date || 'N/A'} | Records: ${entry.records || 'N/A'}`;
                    description = entry.description || `Data Types: ${entry.dataTypes || 'N/A'}\nVector: ${entry.vector || 'N/A'}\nStatus: ${entry.status || 'N/A'}`;
                    icon = 'fas fa-database';
                    extraContent = entry.source ? `<p style="font-size: 12px; margin-top: 5px;"><a href="${entry.source}" target="_blank" style="color: var(--primary); text-decoration: none;"><i class="fas fa-external-link-alt"></i> Source</a></p>` : '';
                    extraContent += investigationNotes;
                    break;
                case 'credential':
                    title = entry.credentialService || 'N/A';
                    subtitle = `Type: ${entry.credentialType}`;
                    description = entry.description || `Value: ${entry.credentialValue.substring(0, 50)}${entry.credentialValue.length > 50 ? '...' : ''}\nBreach Source: ${entry.breachSource || 'N/A'}`;
                    icon = 'fas fa-user-lock'; // Specific for credentials
                    extraContent += investigationNotes;
                    break;
                case 'forum':
                    title = entry.forumName;
                    subtitle = `Type: ${entry.forumType} | Status: ${entry.forumStatus}`;
                    description = entry.description || `URL: ${entry.forumUrl}\nLanguage: ${entry.forumLanguage || 'N/A'}`;
                    icon = 'fas fa-comments';
                    try {
                        faviconHtml = entry.forumUrl ? `<img src="https://www.google.com/s2/favicons?domain=${new URL(entry.forumUrl).hostname}" alt="" class="tool-favicon" onerror="this.src='./favicon.png'">` : '';
                    } catch (e) {
                        faviconHtml = '';
                    }
                    extraContent += investigationNotes;
                    break;
                case 'vendor':
                    title = entry.vendorAlias;
                    subtitle = `Reputation: ${entry.vendorReputation || 'N/A'}`;
                    description = entry.description || `Products: ${entry.vendorProducts || 'N/A'}\nPlatforms: ${entry.vendorPlatforms || 'N/A'}`;
                    icon = 'fas fa-store';
                    extraContent += investigationNotes;
                    break;
                case 'telegram':
                    title = entry.name;
                    subtitle = `Type: ${entry.telegramType} | Subs: ${entry.subscribers || 'N/A'}`;
                    description = entry.content || `URL: ${entry.url}\nLanguage: ${entry.language || 'N/A'}\nActivity: ${entry.activity || 'N/A'}\nAdmin: ${entry.admin || 'N/A'}`;
                    icon = 'fab fa-telegram-plane';
                    try {
                        faviconHtml = entry.url ? `<img src="https://www.google.com/s2/favicons?domain=${new URL(entry.url).hostname}" alt="" class="tool-favicon" onerror="this.src='./favicon.png'">` : '';
                    } catch (e) {
                        faviconHtml = '';
                    }
                    extraContent += investigationNotes;
                    break;
                case 'paste':
                    title = entry.url;
                    subtitle = `Source: ${entry.sourceSite || 'N/A'}`;
                    description = entry.contentSummary || entry.description || `Keywords: ${entry.keywords || 'N/A'}`;
                    icon = 'fas fa-paste';
                    try {
                        faviconHtml = entry.url ? `<img src="https://www.google.com/s2/favicons?domain=${new URL(entry.url).hostname}" alt="" class="tool-favicon" onerror="this.src='./favicon.png'">` : '';
                    } catch (e) {
                        faviconHtml = '';
                    }
                    extraContent += investigationNotes;
                    break;
                case 'document':
                    title = entry.title;
                    subtitle = `Type: ${entry.fileType} | Hash: ${entry.hash || 'N/A'}`;
                    description = entry.contentSummary || entry.description;
                    icon = 'fas fa-file-alt';
                    extraContent = entry.source ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Source:</strong> ${entry.source}</p>` : '';
                    extraContent += investigationNotes;
                    break;
                case 'network':
                    title = entry.subject;
                    subtitle = `Analysis Type: ${entry.networkType}`;
                    description = entry.findings || entry.description;
                    icon = 'fas fa-network-wired';
                    extraContent = entry.associatedIpsDomains ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Associated:</strong> ${entry.associatedIpsDomains}</p>` : '';
                    extraContent += entry.toolsUsed ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Tools:</strong> ${entry.toolsUsed}</p>` : '';
                    extraContent += investigationNotes;
                    break;
                case 'metadata':
                    title = entry.title;
                    subtitle = `File/Source: ${entry.fileSource || 'N/A'}`;
                    description = entry.description; // Description specifically for metadata entry
                    icon = 'fas fa-info-circle'; // General info icon
                    extraContent += investigationNotes;
                    break;
                case 'archive':
                    title = `Archived: ${entry.originalUrl}`;
                    subtitle = `Service: ${entry.service || 'N/A'} | Timestamp: ${entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A'}`;
                    description = entry.contentSummary || entry.description;
                    icon = 'fas fa-archive';
                    try {
                        faviconHtml = entry.url ? `<img src="https://www.google.com/s2/favicons?domain=${new URL(entry.url).hostname}" alt="" class="tool-favicon" onerror="this.src='./favicon.png'">` : '';
                    } catch (e) {
                        faviconHtml = '';
                    }
                    extraContent += investigationNotes;
                    break;
                case 'messaging':
                    title = entry.username;
                    subtitle = `App: ${entry.messagingApp} | Chat: ${entry.chatId || 'N/A'}`;
                    description = entry.content || entry.description;
                    icon = 'fas fa-comment-dots';
                    extraContent += investigationNotes;
                    break;
                case 'dating':
                    title = entry.username;
                    subtitle = `Platform: ${entry.platform} | Age: ${entry.age || 'N/A'}`;
                    description = entry.bio || entry.description || `Location: ${entry.location || 'N/A'}\nVerified: ${entry.verified || 'N/A'}\nSuspicious: ${entry.suspicious || 'N/A'}`;
                    icon = 'fas fa-heart';
                    extraContent = entry.photos ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Photos:</strong> ${entry.photos}</p>` : '';
                    extraContent += investigationNotes;
                    break;
                case 'audio':
                    title = entry.title;
                    subtitle = `Format: ${entry.format} | Duration: ${entry.duration || 'N/A'}`;
                    description = entry.description || `Quality: ${entry.quality || 'N/A'}\nLanguage: ${entry.language || 'N/A'}\nTranscript: ${entry.transcript || 'N/A'}`;
                    icon = 'fas fa-volume-up';
                    extraContent = entry.base64Data ? `<audio controls style="max-width: 100%; margin-top: 10px;"><source src="${entry.base64Data}" type="audio/${entry.format}"></audio>` : '';
                    extraContent += `Speakers: ${entry.speakers || 'N/A'}<br>Background Noise: ${entry.background || 'N/A'}<br>Tools: ${entry.tools || 'N/A'}`;
                    extraContent += investigationNotes;
                    break;
                case 'facial':
                    title = entry.subject;
                    subtitle = `Confidence: ${entry.confidence || 'N/A'}`;
                    description = entry.description || `Source: ${entry.sourceDescription || 'N/A'}\nProfiles: ${entry.identifiedProfiles || 'N/A'}\nTools: ${entry.toolsUsed || 'N/A'}`;
                    icon = 'fas fa-face-id-card'; // Font Awesome 6
                    extraContent += investigationNotes;
                    break;
                case 'persona':
                    title = entry.name;
                    subtitle = `Real Name: ${entry.realName || 'N/A'}`;
                    description = entry.bio || entry.description || `Accounts: ${entry.associatedAccounts || 'N/A'}\nPlatforms: ${entry.platformsUsed || 'N/A'}\nOrigin: ${entry.origin || 'N/A'}`;
                    icon = 'fas fa-id-badge';
                    extraContent += investigationNotes;
                    break;
                case 'vpn':
                    title = entry.name;
                    subtitle = `Type: ${entry.vpnType} | Jurisdiction: ${entry.jurisdiction || 'N/A'}`;
                    description = entry.description || `Logging: ${entry.logs || 'N/A'}\nPayment: ${entry.payment || 'N/A'}\nIssues: ${entry.issues || 'N/A'}`;
                    icon = 'fas fa-shield-alt';
                    extraContent += investigationNotes;
                    break;
                case 'honeypot':
                    title = `Honeypot: ${entry.honeypotType}`;
                    subtitle = `Location: ${entry.location || 'N/A'}`;
                    description = entry.dataSummary || entry.description || `Purpose: ${entry.purpose || 'N/A'}\nAlerts: ${entry.alerts || 'N/A'}`;
                    icon = 'fas fa-honey-pot'; // Font Awesome 6
                    extraContent += investigationNotes;
                    break;
                case 'exploit':
                    title = entry.name;
                    subtitle = `Target: ${entry.targetVuln} | Type: ${entry.exploitType}`;
                    description = entry.description || `Source: ${entry.marketSource || 'N/A'}\nPrice: ${entry.price || 'N/A'}`;
                    icon = 'fas fa-bomb';
                    extraContent += investigationNotes;
                    break;
                case 'publicrecord':
                    title = `Record: ${entry.recordType}`;
                    subtitle = `Subject: ${entry.subjectName} | ID: ${entry.refId || 'N/A'}`;
                    description = entry.summary || entry.description || `Jurisdiction: ${entry.jurisdiction || 'N/A'}\nDate: ${entry.date || 'N/A'}`;
                    icon = 'fas fa-scale-balanced'; // Font Awesome 6
                    extraContent = entry.sourceUrl ? `<p style="font-size: 12px; margin-top: 5px;"><a href="${entry.sourceUrl}" target="_blank" style="color: var(--primary); text-decoration: none;"><i class="fas fa-external-link-alt"></i> Source</a></p>` : '';
                    extraContent += investigationNotes;
                    break;
                case 'caseStudy': 
                    title = entry.title;
                    subtitle = entry.source || 'N/A';
                    description = entry.previewContent || 'No preview content available.'; // Use previewContent as main description
                    icon = 'fas fa-newspaper'; // Icon for articles/blogs
                    faviconHtml = `<img src="https://www.google.com/s2/favicons?domain=${new URL(entry.link).hostname}" alt="" class="tool-favicon" onerror="this.src='./favicon.png'">`; // Use link for favicon, fallback to a local default
                    extraContent = entry.author ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><i class="fas fa-user-edit"></i> Author: ${entry.author}</p>` : '';
                    extraContent += entry.publishedDate ? `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><i class="fas fa-calendar-alt"></i> Published: ${new Date(entry.publishedDate).toLocaleDateString()}</p>` : '';
                    extraContent += investigationNotes; // Consistent notes handling
                    break;
                default:
                    title = entry.name || entry.title || entry.value || 'Unknown Entry';
                    subtitle = `Type: ${entry.type}`;
                    description = entry.description || entry.notes || 'No description available.';
                    icon = 'fas fa-question-circle';
                    extraContent += investigationNotes; // Ensure notes are added for unknown types too
                    break;
            }

            // Add source and metadata to card if they exist (applies to ALL types, including case study)
            // Avoid duplicating 'Source' for caseStudy as it's already in subtitle/description
            if (entry.source && entry.type !== 'caseStudy' && !extraContent.includes(`Source: ${entry.source}`)) {
                extraContent += `<p style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><i class="fas fa-satellite-dish"></i> Source: ${entry.source}</p>`;
            }
            if (entry.metadata && entry.metadata.length > 0) {
                extraContent += `<div style="font-size: 12px; color: var(--text-muted); margin-top: 5px;"><strong>Metadata:</strong>`;
                entry.metadata.forEach(meta => {
                    extraContent += `<p style="margin-left: 10px;">- ${meta.key}: ${meta.value}</p>`;
                });
                extraContent += `</div>`;
            }

            return `
                <div class="tool-card ${entry.starred ? 'starred' : ''} ${entry.pinned ? 'pinned' : ''} ${isSelected ? 'selected' : ''}"
                data-entry-id="${entry.id}" data-entry-type="${entry.type}">
                    <div class="tool-header">
                        <div>
                            <div class="tool-title">
                                <input type="checkbox" class="bulk-checkbox" ${isSelected ? 'checked' : ''}>
                                ${faviconHtml} <i class="${icon}" style="margin-right: 5px;"></i> <span>${title}</span>
                                ${originTagHtml} </div>
                            <div class="tool-url">
                                <span>${subtitle}</span> ${entry.url || entry.link ? '<i class="fas fa-external-link-alt external-link-icon"></i>' : ''} </div>
                        </div>
                        <div class="tool-actions">
                            <button class="action-btn" data-action="edit" title="Edit Entry">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn ${entry.starred ? 'starred' : ''}" data-action="star" title="Star Entry">
                                <i class="fas fa-star"></i>
                            </button>
                            <button class="action-btn ${entry.pinned ? 'pinned' : ''}" data-action="pin" title="Pin Entry">
                                <i class="fas fa-thumbtack"></i>
                            </button>
                            ${entry.url || entry.link ? `<button class="action-btn" data-action="visit" title="Visit Link">
                                <i class="fas fa-external-link-alt"></i>
                            </button>` : ''}
                            <button class="action-btn" data-action="delete" title="Delete Entry">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 10px;">
                        ${description}
                    </p>
                    ${extraContent}
                    <div class="tool-tags">
                        ${entry.tags ? entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                </div>
            `;
        }


        function bindEvents() {

            // Search functionality
            document.getElementById('searchInput').addEventListener('input', (e) => {
                appState.filters.search = e.target.value;
                renderIntelligenceEntries();
                // If on case studies tab, also re-render case studies
                if (appState.currentTab === 'case-studies') {
                    renderCaseStudies();
                }
            });

            // Search Scope Select
            document.getElementById('searchScopeSelect').addEventListener('change', (e) => {
                appState.filters.searchScope = e.target.value;
                renderIntelligenceEntries(); // Re-render with new scope
            });

            // Event listener for Desktop Recommendation Modal's "Continue Anyway" button
            const continueAnywayBtn = document.getElementById('continueAnywayBtn');
            if (continueAnywayBtn) {
                continueAnywayBtn.onclick = () => {
                    hideModal('desktopRecommendationModal');
                    sessionStorage.setItem('desktopRecommendationShown', 'true');
                };
            }

            // Filter controls
            document.getElementById('categoryFilter').addEventListener('change', (e) => {
                appState.filters.category = e.target.value;
                renderIntelligenceEntries();
                if (appState.currentTab === 'case-studies') {
                    renderCaseStudies();
                }
            });

            document.getElementById('sortFilter').addEventListener('change', (e) => {
                appState.filters.sort = e.target.value;
                renderIntelligenceEntries();
                if (appState.currentTab === 'case-studies') {
                    renderCaseStudies();
                }
            });

            // Handbook and Notes subtab events
            document.querySelectorAll('.handbook-subtab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const subtab = e.target.dataset.subtab;
                    switchHandbookSubtab(subtab);
                });
            });

            document.getElementById('addToolBtnEmptyState').addEventListener('click', () => {
                openAddToolOnlyModal();
            });

            document.getElementById('addToolBtnIntelligenceVault').addEventListener('click', () => {
                openAddToolOnlyModal();
            });

            // Add event listeners for the new modal (Add Tool Only)
            const cancelAddToolOnlyBtn = document.getElementById('cancelAddToolOnly');
            if (cancelAddToolOnlyBtn) {
                cancelAddToolOnlyBtn.onclick = () => hideModal('addToolOnlyModal');
            }
            document.getElementById('addToolOnlyForm').addEventListener('submit', handleAddToolOnly);

            // Add custom category input for the new modal (Add Tool Only)
            document.getElementById('toolOnlyCategory').addEventListener('change', (e) => {
                const newCategoryInput = document.getElementById('newToolOnlyCategoryInput');
                if (e.target.value === 'custom') {
                    newCategoryInput.style.display = 'block';
                    newCategoryInput.setAttribute('required', 'required');
                } else {
                    newCategoryInput.style.display = 'none';
                    newCategoryInput.removeAttribute('required');
                    newCategoryInput.value = '';
                }
            });

            // Main tab navigation
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    switchTab(e.target.dataset.tab);
                });
            });

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

            // Case Study Parent Tabs (Delegation)
            const caseStudyParentTabsContainer = document.getElementById('caseStudyParentTabs');
            if (caseStudyParentTabsContainer) {
                caseStudyParentTabsContainer.addEventListener('click', (e) => {
                    const tabBtn = e.target.closest('.case-study-category-tab');
                    if (tabBtn && tabBtn.dataset.category) {
                        switchCaseStudyCategory(tabBtn.dataset.category);
                    }
                });
            }


            // Tool actions (now generic for all entries) - Event delegation on the main content containers
            document.getElementById('toolsGrid').addEventListener('click', handleEntryAction);
            document.getElementById('customTabToolsGrid').addEventListener('click', handleEntryAction);
            document.getElementById('intelligenceVaultEntries').addEventListener('click', handleEntryAction);
            document.getElementById('caseStudiesGrid').addEventListener('click', handleEntryAction);

            // Event delegation for bulk selection checkboxes
            document.getElementById('toolsGrid').addEventListener('change', handleBulkSelection);
            document.getElementById('customTabToolsGrid').addEventListener('change', handleBulkSelection);
            document.getElementById('intelligenceVaultEntries').addEventListener('change', handleBulkSelection);
            document.getElementById('caseStudiesGrid').addEventListener('change', handleBulkSelection);

            // Modal controls (Add New Entry) - specific to Multi-Vault now
            document.getElementById('addEntryBtnCustomVault').addEventListener('click', () => {
                document.getElementById('entryTypeSelect').value = 'tool';
                displayEntryForm();
                showModal('addEntryModal');
            });
            const cancelAddEntryBtn = document.getElementById('cancelAddEntry');
            if (cancelAddEntryBtn) {
                cancelAddEntryBtn.onclick = () => hideModal('addEntryModal');
            }

            // Dynamic form display for Add Entry modal
            document.getElementById('entryTypeSelect').addEventListener('change', displayEntryForm);

            // Custom category input (Add Tool)
            document.getElementById('toolCategory').addEventListener('change', (e) => {
                const newCategoryInput = document.getElementById('newCategoryInput');
                if (e.target.value === 'custom') {
                    newCategoryInput.style.display = 'block';
                    newCategoryInput.setAttribute('required', 'required');
                } else {
                    newCategoryInput.style.display = 'none';
                    newCategoryInput.removeAttribute('required');
                    newCategoryInput.value = '';
                }
            });

            // Intelligence Vault Category Search (for Add Tool modal)
            const intelligenceVaultCategorySearchInputAdd = document.getElementById('intelligenceVaultCategorySearch');
            if (intelligenceVaultCategorySearchInputAdd) {
                intelligenceVaultCategorySearchInputAdd.addEventListener('input', (e) => {
                    const currentSelections = Array.from(document.querySelectorAll('#intelligenceVaultCategoriesCheckboxesAddTool input[type="checkbox"]:checked')).map(cb => cb.value);
                    populateIntelligenceVaultCategoriesCheckboxesAddTool(currentSelections, e.target.value);
                });
            }

            // Intelligence Vault Category Search (for EDIT Tool modal, using unique ID)
            const intelligenceVaultCategorySearchInputEdit = document.getElementById('editIntelligenceVaultCategorySearch');
            if (intelligenceVaultCategorySearchInputEdit) {
                intelligenceVaultCategorySearchInputEdit.addEventListener('input', (e) => {
                    const currentToolId = document.getElementById('editEntryId').value;
                    const toolToEdit = appState.tools.find(t => t.id === currentToolId);
                    if (toolToEdit) {
                        populateIntelligenceVaultCategoriesCheckboxesEditTool(toolToEdit.intelligenceVaultCategories || [], e.target.value);
                    }
                });
            }

            // Form submission (Add Entry)
            document.getElementById('addEntryForm').addEventListener('submit', handleAddEntry);

            // Modal controls (Edit Entry)
            const cancelEditEntryBtn = document.getElementById('cancelEditEntry');
            if (cancelEditEntryBtn) {
                cancelEditEntryBtn.onclick = () => hideModal('editEntryModal');
            }
            // Custom category input (Edit Tool)
            document.getElementById('editToolCategory').addEventListener('change', (e) => {
                const editNewCategoryInput = document.getElementById('editNewCategoryInput');
                if (e.target.value === 'custom') {
                    editNewCategoryInput.style.display = 'block';
                    editNewCategoryInput.setAttribute('required', 'required');
                } else {
                    editNewCategoryInput.style.display = 'none';
                    editNewCategoryInput.removeAttribute('required');
                    editNewCategoryInput.value = '';
                }
            });
            // Form submission (Edit Entry)
            document.getElementById('editEntryForm').addEventListener('submit', handleEditEntry);

            document.getElementById('addMetadataBtn').addEventListener('click', () => addMetadataField('add'));
            document.getElementById('customMetadataEntries').addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-metadata-btn')) {
                    e.target.closest('.form-group.metadata-entry').remove();
                }
            });
            document.getElementById('editAddMetadataBtn').addEventListener('click', () => addMetadataField('edit'));
            document.getElementById('editCustomMetadataEntries').addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-metadata-btn')) {
                    e.target.closest('.form-group.metadata-entry').remove();
                }
            });

            // Theme toggle
            document.getElementById('themeToggle').addEventListener('click', toggleTheme);

            // Quick actions
            document.getElementById('pinAllBtn').addEventListener('click', togglePinFilter);
            document.getElementById('starAllBtn').addEventListener('click', toggleStarFilter);
            document.getElementById('showAllBtn').addEventListener('click', clearFilters);
            document.getElementById('reportBtn').addEventListener('click', generateReport);

            // Clear filters (from empty state button)
            document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);

            // Bulk actions
            document.getElementById('bulkStarBtn').addEventListener('click', () => bulkAction('star'));
            document.getElementById('bulkPinBtn').addEventListener('click', () => bulkAction('pin'));
            document.getElementById('bulkDeleteBtn').addEventListener('click', () => bulkAction('delete'));

            // Export
            document.getElementById('exportBtn').addEventListener('click', exportData);

            // View toggle (Grid/List)
            // --- START OF MODIFICATION for hiding/disabling view toggles on mobile ---
            const viewToggleButtons = document.querySelectorAll('#viewToggle, #vaultViewToggle, #customVaultViewToggle, #caseStudyViewToggle');
            viewToggleButtons.forEach(btn => {
                // Initially hide list view buttons if on mobile.
                // The CSS will also handle this, but this adds a JS layer of control.
                if (isMobileScreen()) {
                    if (btn.id === 'viewToggle' || btn.id === 'vaultViewToggle' || btn.id === 'customVaultViewToggle' || btn.id === 'caseStudyViewToggle') {
                        // If it's a list view button (e.g. current text shows "List View" means it's offering to switch to list)
                        // Or if it's explicitly named to toggle to list
                        if (btn.textContent.includes('List View') || btn.dataset.view === 'list') { // Check both text content and potential data attribute
                            btn.style.display = 'none';
                        }
                        // Ensure grid view button is visible if it exists and offers grid
                        if (btn.textContent.includes('Grid View') || btn.dataset.view === 'grid') { // Check both text content and potential data attribute
                            btn.style.display = 'inline-flex'; // Or 'block' depending on its default display
                        }
                    }
                }
                btn.addEventListener('click', toggleViewMode); // Keep click listener to handle changes
            });
            // --- END OF MODIFICATION ---

            // Custom Sub-tab buttons
            document.getElementById('createSubTabBtn').addEventListener('click', () => showCreateSubTabModal());
            document.getElementById('createSubTabBtnEmptyState').addEventListener('click', () => showCreateSubTabModal());
            const cancelCreateSubTabBtn = document.getElementById('cancelCreateSubTab');
            if (cancelCreateSubTabBtn) {
                cancelCreateSubTabBtn.onclick = () => hideModal('createSubTabModal');
            }
            document.getElementById('createSubTabForm').addEventListener('submit', handleCreateSubTab);

            document.getElementById('editSubTabBtn').addEventListener('click', () => openEditSubTabModal());
            const cancelEditSubTabBtn = document.getElementById('cancelEditSubTab');
            if (cancelEditSubTabBtn) {
                cancelEditSubTabBtn.onclick = () => hideModal('editSubTabModal');
            }
            document.getElementById('editSubTabForm').addEventListener('submit', handleEditSubTab);

            document.getElementById('deleteSubTabBtn').addEventListener('click', handleDeleteSubTab);
            document.getElementById('exportSubTabBtn').addEventListener('click', exportCustomTab);

            // New: Share options button and modal events
            document.getElementById('shareOptionsBtn').addEventListener('click', showShareOptionsModal);
            const cancelShareOptionsBtn = document.getElementById('cancelShareOptions');
            if (cancelShareOptionsBtn) {
                cancelShareOptionsBtn.onclick = () => hideModal('shareOptionsModal');
            }
            document.getElementById('shareScopeSelect').addEventListener('change', handleShareScopeChange);
            document.getElementById('shareForm').addEventListener('submit', handleShareFormSubmit);


            // Click listener for custom sub-tabs (delegated)
            document.getElementById('customSubTabs').addEventListener('click', (e) => {
                const tabBtn = e.target.closest('.sub-nav-tab');
                if (tabBtn && tabBtn.dataset.subTabId) {
                    switchCustomTab(tabBtn.dataset.subTabId);
                }
            });

            // Event listener for custom tab checkboxes in Edit Tool Modal
            document.getElementById('assignCustomTabsCheckboxes').addEventListener('change', (e) => {
                if (e.target.classList.contains('custom-tab-assign-checkbox')) {
                    const checkbox = e.target;
                    const label = checkbox.closest('.custom-tab-checkbox');
                    if (label) {
                        label.classList.toggle('checked', checkbox.checked);
                    }
                }
            });

            // Icon picker click handler (Create Sub-tab Modal)
            document.getElementById('newSubTabIconPicker').addEventListener('click', (e) => {
                const iconItem = e.target.closest('.icon-picker-item');
                if (iconItem) {
                    document.querySelectorAll('#newSubTabIconPicker .icon-picker-item').forEach(item => item.classList.remove('selected'));
                    iconItem.classList.add('selected');
                    document.getElementById('newSubTabIcon').value = iconItem.dataset.iconClass;
                }
            });

            // Icon picker click handler (Edit Sub-tab Modal)
            document.getElementById('editedSubTabIconPicker').addEventListener('click', (e) => {
                const iconItem = e.target.closest('.icon-picker-item');
                if (iconItem) {
                    document.querySelectorAll('#editedSubTabIconPicker .icon-picker-item').forEach(item => item.classList.remove('selected'));
                    iconItem.classList.add('selected');
                    document.getElementById('editedSubTabIcon').value = iconItem.dataset.iconClass;
                }
            });

            // Color picker click handler (Create Sub-tab Modal)
            document.getElementById('newSubTabColorPicker').addEventListener('click', (e) => {
                const colorItem = e.target.closest('.color-picker-item');
                if (colorItem) {
                    document.querySelectorAll('#newSubTabColorPicker .color-picker-item').forEach(item => item.classList.remove('selected'));
                    colorItem.classList.add('selected');
                    document.getElementById('newSubTabColor').value = colorItem.dataset.colorValue;
                }
            });

            // Color picker click handler (Edit Sub-tab Modal)
            document.getElementById('editedSubTabColorPicker').addEventListener('click', (e) => {
                const colorItem = e.target.closest('.color-picker-item');
                if (colorItem) {
                    document.querySelectorAll('#editedSubTabColorPicker .color-picker-item').forEach(item => item.classList.remove('selected'));
                    colorItem.classList.add('selected');
                    document.getElementById('editedSubTabColor').value = colorItem.dataset.colorValue;
                }
            });

            const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
            if (mobileMenuToggle) {
                mobileMenuToggle.addEventListener('click', () => {
                    const mobileMenuOverlay = document.createElement('div');
                    mobileMenuOverlay.classList.add('mobile-menu-overlay');
                    document.body.appendChild(mobileMenuOverlay);

                    const mobileSidebarMenu = document.getElementById('mobileSidebarMenu');
                    if (!mobileSidebarMenu) {
                        console.error("Mobile sidebar menu element not found. Please ensure #mobileSidebarMenu is in HTML.");
                        return;
                    }

                    const mobileMenuContent = mobileSidebarMenu.querySelector('.mobile-menu-content');
                    mobileMenuContent.innerHTML = '';

                    const navClonedContainer = document.createElement('div');
                    navClonedContainer.classList.add('mobile-nav-cloned');
                    mobileMenuContent.appendChild(navClonedContainer);

                    document.querySelectorAll('.main-nav-tabs .nav-tab').forEach(originalTab => { // Select from main tabs
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
                        mobileExportBtn.addEventListener('click', () => {
                            exportData();
                            closeMobileMenu();
                        });
                        controlsClonedContainer.appendChild(mobileExportBtn);
                    }

                    const shareOptionsBtn = document.getElementById('shareOptionsBtn');
                    if (shareOptionsBtn) {
                        const mobileShareOptionsBtn = document.createElement('button');
                        mobileShareOptionsBtn.className = shareOptionsBtn.className + ' mobile-btn';
                        mobileShareOptionsBtn.innerHTML = shareOptionsBtn.innerHTML;
                        mobileShareOptionsBtn.addEventListener('click', () => {
                            showShareOptionsModal();
                            closeMobileMenu();
                        });
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

                    mobileSidebarMenu.querySelector('.close-menu-btn').addEventListener('click', closeMobileMenu);
                    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
                });
            }
        }

        function closeMobileMenu() {
            const mobileSidebarMenu = document.getElementById('mobileSidebarMenu');
            const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay'); // Assuming you add this overlay for better UX

            if (mobileSidebarMenu) {
                mobileSidebarMenu.classList.remove('active'); // CSS to slide out
            }
            if (mobileMenuOverlay) {
                mobileMenuOverlay.remove(); // Remove the overlay from DOM
            }
            document.body.classList.remove('no-scroll');
        }

        function handleEntryAction(e) {
            if (appState.readOnlyMode) {
                showToast("Cannot perform actions in read-only shared view.", "warning");
                return;
            }

            const target = e.target;
            const entryCard = target.closest('.tool-card');
            if (!entryCard) return;

            const entryId = entryCard.dataset.entryId;
            const entryType = entryCard.dataset.entryType; // This is the key!

            let entry = null;
            let entryArray = null;

            // Determine which array to look into based on entryType
            switch (entryType) {
                case 'tool': entryArray = appState.tools; break;
                case 'email': entryArray = appState.emails; break;
                case 'phone': entryArray = appState.phones; break;
                case 'crypto': entryArray = appState.crypto; break;
                case 'location': entryArray = appState.locations; break;
                case 'link': entryArray = appState.links; break;
                case 'media': entryArray = appState.media; break;
                case 'password': entryArray = appState.passwords; break;
                case 'keyword': entryArray = appState.keywords; break;
                case 'social': entryArray = appState.socials; break;
                case 'domain': entryArray = appState.domains; break;
                case 'username': entryArray = appState.usernames; break;
                case 'threat': entryArray = appState.threats; break;
                case 'vulnerability': entryArray = appState.vulnerabilities; break;
                case 'malware': entryArray = appState.malware; break;
                case 'breach': entryArray = appState.breaches; break;
                case 'credential': entryArray = appState.credentials; break;
                case 'forum': entryArray = appState.forums; break;
                case 'vendor': entryArray = appState.vendors; break;
                case 'telegram': entryArray = appState.telegramChannels; break;
                case 'paste': entryArray = appState.pastes; break;
                case 'document': entryArray = appState.documents; break;
                case 'network': entryArray = appState.networks; break;
                case 'metadata': entryArray = appState.metadataEntries; break;
                case 'archive': entryArray = appState.archives; break;
                case 'messaging': entryArray = appState.messagingApps; break;
                case 'dating': entryArray = appState.datingProfiles; break;
                case 'facial': entryArray = appState.facialRecognition; break;
                case 'persona': entryArray = appState.personas; break;
                case 'vpn': entryArray = appState.vpns; break;
                case 'honeypot': entryArray = appState.honeypots; break;
                case 'exploit': entryArray = appState.exploits; break;
                case 'publicrecord': entryArray = appState.publicRecords; break;
                case 'caseStudy': entryArray = appState.caseStudies; break; // Ensure this is explicitly listed
                default:
                    console.warn(`Unknown entry type for action: ${entryType}`);
                    return;
            }

            if (entryArray) {
                entry = entryArray.find(t => t.id === entryId);
            }
            if (!entry) return;

            // Determine the action based on the clicked element or the card itself
            let action = null;
            const targetBtn = target.closest('.action-btn');
            if (targetBtn) {
                action = targetBtn.dataset.action; // Action from a specific button
            } else if (entryCard.dataset.action === 'preview' && !target.classList.contains('bulk-checkbox')) {
                // If the click is on the card itself (and not the checkbox), and it's a caseStudy
                if (entryType === 'caseStudy') {
                    action = 'previewCaseStudy'; // New custom action for card click
                }
            } else if (target.classList.contains('bulk-checkbox')) { // Handle checkbox clicks separately
                action = 'select'; // Custom action for checkbox
            }

            switch (action) {
                case 'edit':
                    // THIS IS THE CRITICAL AND ONLY CHANGE NEEDED IN handleEntryAction:
                    // Explicitly route to case study edit modal if entryType is 'caseStudy'.
                    if (entryType === 'caseStudy') { // Use entryType directly for this check
                        openEditCaseStudyModal(entry); // Call the dedicated function from caseStudies.js
                    } else {
                        openEditEntryModal(entry); // Call the general function from app.js
                    }
                    break;
                case 'star':
                    entry.starred = !entry.starred;
                    showToast(entry.starred ? 'Entry starred!' : 'Entry unstarred!');
                    logActivity('updated', entry.type, `${entry.starred ? 'Starred' : 'Unstarred'} ${entry.type}: ${getEntryName(entry)}`, { itemId: entry.id, starred: entry.starred });
                    break;
                case 'pin':
                    entry.pinned = !entry.pinned;
                    showToast(entry.pinned ? 'Entry pinned!' : 'Entry unpinned!');
                    logActivity('updated', entry.type, `${entry.pinned ? 'Pinned' : 'Unpinned'} ${entry.type}: ${getEntryName(entry)}`, { itemId: entry.id, pinned: entry.pinned });
                    break;
                case 'visit': // This action is specifically for the `fas fa-external-link-alt` icon on other entry types
                    if (entry.url || entry.link) {
                        entry.lastUsed = Date.now();
                        appState.usageStats.toolsUsedToday++;
                        updateDashboard();
                        window.open(entry.url || entry.link, '_blank');
                        showToast('Opening link...');
                        logActivity('visited', entry.type, `Visited link for ${entry.type}: ${getEntryName(entry)}`, { itemId: entry.id, url: entry.url || entry.link });
                    } else {
                        showToast('No URL available for this entry type.', 'info');
                    }
                    break;
                case 'previewCaseStudy': // Handle card click for case studies to open preview modal
                    openCaseStudyPreviewModal(entry);
                    logActivity('viewed', 'caseStudy', `Previewed case study: ${getEntryName(entry)}`, { caseStudyId: entry.id });
                    break;
                case 'redirectLink': // Handle direct redirect icon click for case studies
                    if (entry.link) { // Case studies exclusively use 'link' for the article URL
                        window.open(entry.link, '_blank');
                        showToast('Opening full article...');
                        logActivity('visited', 'caseStudy', `Redirected to full article: ${getEntryName(entry)}`, { caseStudyId: entry.id, url: entry.link });
                    } else {
                        showToast('No link available for this case study.', 'info');
                    }
                    break;
                case 'select': // Handle checkbox selection
                    // The handleBulkSelection function already takes care of state for checkboxes
                    // We just need to make sure this action doesn't fall through to other behaviors.
                    break;
                case 'delete':
                    if (confirm('Are you sure you want to delete this entry?')) {
                        // Remove entry from any custom tabs it belongs to
                        appState.customTabs.forEach(tab => {
                            tab.toolIds = tab.toolIds.filter(id => id !== entryId);
                        });

                        if (entryArray) {
                            const index = entryArray.findIndex(e => e.id === entryId);
                            if (index > -1) {
                                entryArray.splice(index, 1);
                            }
                        }
                        appState.selectedEntries.delete(entryId);
                        showToast('Entry deleted!', 'error');
                        logActivity('deleted', entryType, `Deleted ${entryType}: ${getEntryName(entry)}`, { itemId: entryId });
                        updateDashboard();
                        populateCategoryFilter();
                        renderCustomTabs();
                        // Ensure case studies are re-rendered if a case study was deleted
                        if (entryType === 'caseStudy') { // Use entryType directly for this check
                            populateCaseStudyCategories();
                            renderCaseStudies();
                        }
                    }
                    break;
            }

            // After any action, re-render the appropriate view
            if (appState.currentTab === 'case-studies') {
                renderCaseStudies(); // Re-render if on case studies tab
            } else {
                renderIntelligenceEntries(); // Otherwise, re-render general entries
            }
            updateDashboard();
            saveState();
        }

        // Handle bulk selection checkbox
        function handleBulkSelection(e) {
            if (appState.readOnlyMode) { // New: Prevent bulk selection in read-only mode
                e.target.checked = !e.target.checked; // Revert checkbox state
                showToast("Cannot select entries in read-only shared view.", "warning");
                return;
            }

            if (!e.target.classList.contains('bulk-checkbox')) return;
            
            const entryCard = e.target.closest('.tool-card');
            const entryId = entryCard.dataset.entryId;
            
            if (e.target.checked) {
                appState.selectedEntries.add(entryId);
            } else {
                appState.selectedEntries.delete(entryId);
            }
            
            updateBulkActions();
            entryCard.classList.toggle('selected', e.target.checked); // Visually mark selected
        }

        // Update bulk actions visibility and count
        function updateBulkActions() {
            const bulkActions = document.getElementById('bulkActions');
            const selectedCount = document.getElementById('selectedCount');
            
            if (appState.readOnlyMode) { // New: Always hide bulk actions in read-only
                bulkActions.classList.remove('active');
                return;
            }

            if (appState.selectedEntries.size > 0) {
                bulkActions.classList.add('active');
                selectedCount.textContent = appState.selectedEntries.size;
            } else {
                bulkActions.classList.remove('active');
            }
        }

        // MODIFIED: bulkAction to include case studies in the allEntries array
        function bulkAction(action) {
            if (appState.readOnlyMode) {
                showToast("Cannot perform bulk actions in read-only shared view.", "warning");
                return;
            }

            const selectedIds = Array.from(appState.selectedEntries);

            if (selectedIds.length === 0) {
                showToast(`No entries selected for ${action} action.`, 'warning');
                return;
            }

            if (action === 'delete' && !confirm('Are you sure you want to delete all selected entries?')) {
                return;
            }

            // Determine if all selected are already starred/pinned for toggling
            let allStarred = true;
            let allPinned = true;

            // Aggregate all entries from ALL appState arrays
            const allEntries = [
                ...appState.tools, ...appState.emails, ...appState.phones, ...appState.crypto,
                ...appState.locations, ...appState.links, ...appState.media, ...appState.passwords,
                ...appState.keywords, ...appState.socials, ...appState.domains, ...appState.usernames,
                ...appState.threats, ...appState.vulnerabilities, ...appState.malware, ...appState.breaches,
                ...appState.credentials, ...appState.forums, ...appState.vendors, ...appState.telegramChannels,
                ...appState.pastes, ...appState.documents, ...appState.networks, ...appState.metadataEntries,
                ...appState.archives, ...appState.messagingApps, ...appState.datingProfiles, ...appState.facialRecognition,
                ...appState.personas, ...appState.vpns, ...appState.honeypots, ...appState.exploits,
                ...appState.publicRecords,
                ...appState.caseStudies 
            ];
            const selectedEntriesArray = allEntries.filter(entry => selectedIds.includes(entry.id));

            if (action === 'star' || action === 'pin') {
                allStarred = selectedEntriesArray.every(entry => entry.starred);
                allPinned = selectedEntriesArray.every(entry => entry.pinned);
            }

            selectedIds.forEach(id => {
                const entry = allEntries.find(e => e.id === id); // Find the actual entry object
                if (!entry) return;

                switch (action) {
                    case 'star':
                        entry.starred = !allStarred; // Toggle based on current state of all
                        break;
                    case 'pin':
                        entry.pinned = !allPinned; // Toggle based on current state of all
                        break;
                    case 'delete':
                        // Remove entry from any custom tabs it belongs to before deleting
                        appState.customTabs.forEach(tab => {
                            tab.toolIds = tab.toolIds.filter(entryIdInTab => entryIdInTab !== id);
                        });

                        // Remove from its respective appState array based on its type
                        const targetArrayKey = Object.keys(appState).find(key => Array.isArray(appState[key]) && appState[key].some(e => e.id === id));
                        if (targetArrayKey) {
                            appState[targetArrayKey] = appState[targetArrayKey].filter(e => e.id !== id);
                        }
                        break;
                }
            });

            appState.selectedEntries.clear();
            updateBulkActions();
            renderIntelligenceEntries();
            updateDashboard();
            populateCategoryFilter();
            renderCustomTabs(); // Update custom tabs if entries were deleted
            if (appState.currentTab === 'case-studies') { 
                populateCaseStudyCategories(); // Update categories if a case study was deleted
                renderCaseStudies();
            }
            showToast(`Bulk ${action} completed!`);
            saveState();
        }


        // Quick actions (UPDATED)
        function togglePinFilter() {
            if (appState.readOnlyMode) { // New: Prevent actions in read-only mode
                showToast("Cannot apply filters in read-only shared view.", "warning");
                return;
            }

            if (appState.filters.category === 'pinned') { // If already filtering by pinned, clear it
                appState.filters.category = '';
            } else {
                appState.filters.category = 'pinned'; // Set filter to show only pinned
            }
            appState.filters.search = ''; // Clear search when applying this filter
            document.getElementById('searchInput').value = '';
            document.getElementById('categoryFilter').value = appState.filters.category;
            renderIntelligenceEntries();
            showToast(appState.filters.category === 'pinned' ? 'Showing only pinned entries!' : 'Cleared pinned entries filter!');
        }

        function toggleStarFilter() {
            if (appState.readOnlyMode) { // New: Prevent actions in read-only mode
                showToast("Cannot apply filters in read-only shared view.", "warning");
                return;
            }

            if (appState.filters.category === 'starred') { // If already filtering by starred, clear it
                appState.filters.category = '';
            } else {
                appState.filters.category = 'starred'; // Set filter to show only starred
            }
            appState.filters.search = ''; // Clear search when applying this filter
            document.getElementById('searchInput').value = '';
            document.getElementById('categoryFilter').value = appState.filters.category;
            renderIntelligenceEntries();
            showToast(appState.filters.category === 'starred' ? 'Showing only starred entries!' : 'Cleared starred entries filter!');
        }


        function switchTab(tabName) {
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            const targetTabBtn = document.querySelector(`[data-tab="${tabName}"]`);
            if (targetTabBtn) {
                targetTabBtn.classList.add('active');
            }

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
                if (content.id === 'intelligence-vaultTab') {
                    document.getElementById('intelligenceVaultParentTabs').style.display = 'none';
                    document.getElementById('intelligenceVaultChildTabs').style.display = 'none';
                    document.getElementById('addToolBtnIntelligenceVault').style.display = 'none';
                } else if (content.id === 'custom-tabsTab') {
                    document.getElementById('customVaultEntryParentTabs').style.display = 'none';
                    document.getElementById('customVaultEntryChildTabs').style.display = 'none';
                    document.getElementById('addEntryBtnCustomVault').style.display = 'none';
                } else if (content.id === 'case-studiesTab') { 
                    document.getElementById('caseStudyParentTabs').style.display = 'none'; // Hide category tabs when not active
                    document.getElementById('addCaseStudyBtn').style.display = 'none'; // Hide add button when not active
                    document.getElementById('caseStudyViewToggle').style.display = 'none'; // Hide view toggle when not active
                }
            });

            const targetTabContent = document.getElementById(`${tabName}Tab`);
            if (targetTabContent) {
                targetTabContent.classList.add('active');
            }

            appState.currentTab = tabName;
            appState.filters.category = '';
            const categoryFilterElement = document.getElementById('categoryFilter');
            if (categoryFilterElement) {
                categoryFilterElement.value = '';
            }
            appState.filters.search = '';
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = '';
            }

            if (tabName === 'intelligence-vault') {
                document.getElementById('intelligenceVaultParentTabs').style.display = 'flex';
                renderIntelligenceVaultParentTabs();

                const currentIntelParent = intelligenceVaultTabStructure.find(p => p.id === appState.currentIntelligenceVaultParentTab);
                if (!currentIntelParent) {
                    appState.currentIntelligenceVaultParentTab = intelligenceVaultTabStructure[0].id;
                }
                switchIntelligenceVaultParentTab(appState.currentIntelligenceVaultParentTab);

                if (!appState.readOnlyMode) {
                    document.getElementById('addToolBtnIntelligenceVault').style.display = 'inline-flex';
                }
                renderIntelligenceEntries();

            } else if (tabName === 'custom-tabs') {
                renderCustomTabs();

                if (appState.customTabs.length > 0) {
                    document.getElementById('customVaultEntryParentTabs').style.display = 'flex';
                    renderCustomVaultParentTabs();

                    const currentCustomParent = customVaultEntryStructure.find(p => p.id === appState.currentCustomVaultParentTab);
                    if (!currentCustomParent) {
                        appState.currentCustomVaultParentTab = customVaultEntryStructure[0].id;
                    }
                    const currentCustomChild = currentCustomParent.children.find(c => c.id === appState.currentCustomVaultEntrySubTab);
                    if (!currentCustomChild) {
                        appState.currentCustomVaultEntrySubTab = currentCustomParent.children[0]?.id;
                    }
                    switchCustomVaultParentTab(appState.currentCustomVaultParentTab);

                    if (!appState.readOnlyMode) {
                        document.getElementById('addEntryBtnCustomVault').style.display = 'inline-flex';
                    }
                }
                renderIntelligenceEntries();

            } else if (tabName === 'handbook') {
                initHandbookAndNotes();
            } else if (tabName === 'dork-assistant') {
                initDorkAssistant();
            } else if (tabName === 'case-studies') { 
                document.getElementById('caseStudyParentTabs').style.display = 'flex'; // Show category tabs
                populateCaseStudyCategories(); // Ensure categories are rendered
                switchCaseStudyCategory(appState.currentCaseStudyCategory); // Activate current category tab
                if (!appState.readOnlyMode) {
                    document.getElementById('addCaseStudyBtn').style.display = 'inline-flex';
                    document.getElementById('caseStudyViewToggle').style.display = 'inline-flex'; // Show view toggle
                }
                renderCaseStudies(); // Render entries for case studies
            } else if (tabName === 'audit') {
                renderAuditLog(); // Render the audit log when the tab is switched to it
            } else if (tabName === 'welcome') {
                const resetVaultButton = document.getElementById('resetVaultButton');
                const openExportFromWelcome = document.getElementById('openExportFromWelcome');
                if (resetVaultButton) resetVaultButton.disabled = appState.readOnlyMode;
                if (openExportFromWelcome) openExportFromWelcome.disabled = appState.readOnlyMode;
            } 

            saveState();
        }

        // --- New: logActivity function ---
        /**
         * Logs an activity to the audit log.
         * @param {string} action The type of action (e.g., 'created', 'updated', 'deleted', 'imported', 'exported', 'visited').
         * @param {string} category The category of the item involved (e.g., 'tool', 'note', 'vault', 'caseStudy', 'system').
         * @param {string} description A brief description of the action.
         * @param {object} [details={}] Optional: additional details about the action (e.g., item ID, old/new values).
         */
        function logActivity(action, category, description, details = {}) {
            if (appState.readOnlyMode) {
                // Do not log activities if in read-only mode, as no actual changes are persisted.
                return;
            }

            const newLogEntry = {
                id: generateId(),
                timestamp: new Date(),
                action: action,
                category: category,
                description: description,
                details: details,
                // You might add a userId here if you implement user authentication later.
                userId: 'session' // Placeholder for current session or 'system'
            };
            appState.auditLogs.unshift(newLogEntry); // Add to the beginning for most recent first
            saveState(); // Persist the logs
            // Re-render audit log if the audit tab is currently active
            if (appState.currentTab === 'audit') {
                renderAuditLog();
            }
        }




        // Switch Intelligence Vault Sub-tabs (now show tools)
        function switchIntelligenceVaultSubTab(subTabName) {
            document.querySelectorAll('.intelligence-vault-sub-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            const targetSubTabBtn = document.querySelector(`.intelligence-vault-sub-tab[data-sub-tab="${subTabName}"]`);
            if (targetSubTabBtn) {
                targetSubTabBtn.classList.add('active');
            }
            appState.currentIntelligenceVaultSubTab = subTabName;
            appState.filters.category = '';
            document.getElementById('categoryFilter').value = '';
            renderIntelligenceEntries();
            saveState();
        }

        // Format time for display
        function formatTime(timestamp) {
            const now = Date.now();
            const diff = now - timestamp; // Difference in milliseconds

            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            const weeks = Math.floor(days / 7);
            const months = Math.floor(days / 30.44); // Average days in a month
            const years = Math.floor(days / 365.25); // Average days in a year

            if (seconds < 60) {
                return seconds === 0 ? 'Just now' : `${seconds} second${seconds === 1 ? '' : 's'} ago`;
            } else if (minutes < 60) {
                return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
            } else if (hours < 24) {
                return `${hours} hour${hours === 1 ? '' : 's'} ago`;
            } else if (days < 7) {
                return `${days} day${days === 1 ? '' : 's'} ago`;
            } else if (weeks < 4) {
                return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
            } else if (months < 12) {
                return `${months} month${months === 1 ? '' : 's'} ago`;
            } else {
                return `${years} year${years === 1 ? '' : 's'} ago`;
            }
        }


        // Universal Modal Functions
        function showModal(id) {
            document.getElementById(id).classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
        }

        function hideModal(id) {
            document.getElementById(id).classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
        }

        // Display appropriate form fields based on selected entry type
        function displayEntryForm() {
            const entryType = document.getElementById('entryTypeSelect').value;
            document.querySelectorAll('.entry-fields').forEach(fieldSet => {
                fieldSet.style.display = 'none';
            });
            document.getElementById('entrySourceGroup').style.display = 'none'; // Hide by default
            document.getElementById('customMetadataGroup').style.display = 'none'; // Hide by default

            let fieldsToShow = [];
            switch (entryType) {
                case 'tool':
                    fieldsToShow = ['addToolFields'];
                    break;
                case 'email':
                    fieldsToShow = ['addEmailFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'phone':
                    fieldsToShow = ['addPhoneFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'crypto':
                    fieldsToShow = ['addCryptoFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'location':
                    fieldsToShow = ['addLocationFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'link':
                    fieldsToShow = ['addLinkFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'media':
                    fieldsToShow = ['addMediaFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'password':
                    fieldsToShow = ['addPasswordFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'keyword':
                    fieldsToShow = ['addKeywordFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'social':
                    fieldsToShow = ['addSocialFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'domain':
                    fieldsToShow = ['addDomainFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'username':
                    fieldsToShow = ['addUsernameFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'threat':
                    fieldsToShow = ['addThreatFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'vulnerability':
                    fieldsToShow = ['addVulnerabilityFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'malware':
                    fieldsToShow = ['addMalwareFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'breach':
                    fieldsToShow = ['addBreachFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'credential':
                    fieldsToShow = ['addCredentialFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'forum':
                    fieldsToShow = ['addForumFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'vendor':
                    fieldsToShow = ['addVendorFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'telegram':
                    fieldsToShow = ['addTelegramFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'paste':
                    fieldsToShow = ['addPasteFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'document':
                    fieldsToShow = ['addDocumentFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'network':
                    fieldsToShow = ['addNetworkFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'metadata':
                    fieldsToShow = ['addMetadataEntryFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'archive':
                    fieldsToShow = ['addArchiveFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'messaging':
                    fieldsToShow = ['addMessagingFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'dating':
                    fieldsToShow = ['addDatingFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'facial':
                    fieldsToShow = ['addFacialFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'persona':
                    fieldsToShow = ['addPersonaFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'vpn':
                    fieldsToShow = ['addVpnFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'honeypot':
                    fieldsToShow = ['addHoneypotFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'exploit':
                    fieldsToShow = ['addExploitFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                case 'publicrecord':
                    fieldsToShow = ['addPublicRecordFields', 'entrySourceGroup', 'customMetadataGroup'];
                    break;
                default:
                    // This case should ideally not be hit if all options are covered
                    console.warn(`No form fields defined for entry type: ${entryType}`);
                    break;
            }

            fieldsToShow.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.style.display = 'block';
                }
            });

            // Populate category dropdown for tools (if 'tool' is selected)
            if (entryType === 'tool') {
                populateCategoryFilter();
            }
        }

        // MODIFIED: handleAddEntry (ensure new array names are used)
        async function handleAddEntry(e) {
            e.preventDefault();
            if (appState.readOnlyMode) {
                showToast("Cannot add entries in read-only shared view.", "warning");
                return;
            }

            const entryType = document.getElementById('entryTypeSelect').value;
            let newEntry = {
                id: generateId(),
                type: entryType,
                starred: false,
                pinned: false,
                lastUsed: 0,
                addedDate: new Date(),
                customTabs: [],
                origin: 'user-added'
            };

            const customMetadata = [];
            document.querySelectorAll('#customMetadataEntries .metadata-entry').forEach(row => {
                const keyInput = row.querySelector('.metadata-key');
                const valueInput = row.querySelector('.metadata-value');
                const key = keyInput ? keyInput.value.trim() : '';
                const value = valueInput ? valueInput.value.trim() : '';
                if (key && value) {
                    customMetadata.push({ key, value });
                }
            });
            if (customMetadata.length > 0) {
                newEntry.metadata = customMetadata;
            }

            const entrySourceInput = document.getElementById('entrySource');
            if (entrySourceInput && entrySourceInput.value.trim()) {
                newEntry.source = entrySourceInput.value.trim();
            }


            switch (entryType) {
                case 'tool':
                    newEntry.name = document.getElementById('toolName').value.trim();
                    newEntry.url = document.getElementById('toolUrl').value.trim();
                    let toolCategory = document.getElementById('toolCategory').value;
                    const newCategoryInput = document.getElementById('newCategoryInput').value.trim();
                    newEntry.description = document.getElementById('toolDescription').value.trim();
                    newEntry.tags = document.getElementById('toolTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    newEntry.notes = document.getElementById('toolInvestigationNotes').value.trim();

                    if (!newEntry.name || !newEntry.url || !toolCategory) { showToast('Please fill in all required tool fields (Name, URL, Category).', 'error'); return; }
                    if (toolCategory === 'custom') {
                        if (!newCategoryInput) { showToast('Please enter a custom category name.', 'error'); return; }
                        toolCategory = newCategoryInput.toLowerCase();
                    }
                    newEntry.category = toolCategory;
                    newEntry.favicon = `https://www.google.com/s2/favicons?domain=${new URL(newEntry.url).hostname}`;
                    appState.tools.push(newEntry);
                    break;
                case 'email':
                    newEntry.email = document.getElementById('emailAddress').value.trim();
                    newEntry.linkedPlatforms = document.getElementById('emailLinkedPlatforms').value.split(',').map(p => p.trim()).filter(p => p);
                    newEntry.breachResults = document.getElementById('emailBreachResults').value.trim();
                    newEntry.description = document.getElementById('emailDescription').value.trim();
                    newEntry.notes = document.getElementById('emailNotes').value.trim();
                    if (!newEntry.email) { showToast('Please enter an email address.', 'error'); return; }
                    appState.emails.push(newEntry);
                    break;
                case 'phone':
                    newEntry.number = document.getElementById('phoneNumber').value.trim();
                    newEntry.phoneType = document.getElementById('phoneType').value;
                    newEntry.location = document.getElementById('phoneLocation').value.trim();
                    newEntry.description = document.getElementById('phoneDescription').value.trim();
                    newEntry.notes = document.getElementById('phoneNotes').value.trim();
                    if (!newEntry.number) { showToast('Please enter a phone number.', 'error'); return; }
                    appState.phones.push(newEntry);
                    break;
                case 'crypto':
                    newEntry.address = document.getElementById('cryptoAddress').value.trim();
                    newEntry.txid = document.getElementById('cryptoTxid').value.trim();
                    newEntry.amount = parseFloat(document.getElementById('cryptoAmount').value);
                    newEntry.source = document.getElementById('cryptoSource').value.trim();
                    newEntry.tags = document.getElementById('cryptoTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    newEntry.description = document.getElementById('cryptoDescription').value.trim();
                    newEntry.notes = document.getElementById('cryptoNotes').value.trim();
                    if (!newEntry.address || !newEntry.txid || isNaN(newEntry.amount)) { showToast('Please fill in all required crypto fields (Address, TXID, Amount).', 'error'); return; }
                    appState.crypto.push(newEntry);
                    break;
                case 'location':
                    newEntry.name = document.getElementById('locationName').value.trim();
                    newEntry.coordinates = document.getElementById('locationCoordinates').value.trim();
                    newEntry.mapLink = document.getElementById('locationMapLink').value.trim();
                    newEntry.ipGeoIntel = document.getElementById('locationIpGeoIntel').value.trim();
                    newEntry.description = document.getElementById('locationDescription').value.trim();
                    newEntry.notes = document.getElementById('locationNotes').value.trim();
                    if (!newEntry.name || !newEntry.coordinates) { showToast('Please fill in all required location fields (Name, Coordinates).', 'error'); return; }
                    appState.locations.push(newEntry);
                    break;
                case 'link':
                    newEntry.url = document.getElementById('linkUrl').value.trim();
                    newEntry.platform = document.getElementById('linkPlatform').value.trim();
                    newEntry.tags = document.getElementById('linkTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    newEntry.description = document.getElementById('linkDescription').value.trim();
                    newEntry.notes = document.getElementById('linkNotes').value.trim();
                    if (!newEntry.url) { showToast('Please enter a URL.', 'error'); return; }
                    appState.links.push(newEntry);
                    break;
                case 'media':
                    newEntry.title = document.getElementById('mediaTitle').value.trim();
                    newEntry.mediaType = document.getElementById('mediaType').value;
                    const mediaFile = document.getElementById('mediaFile').files[0];
                    newEntry.description = document.getElementById('mediaDescription').value.trim();
                    newEntry.notes = document.getElementById('mediaNotes').value.trim();
                    
                    if (!newEntry.title) { showToast('Please enter a title for the media.', 'error'); return; }
                    if (mediaFile) {
                        newEntry.base64Data = await readFileAsBase64(mediaFile);
                    } else {
                        showToast('Please upload a file for media entry.', 'error');
                        return;
                    }
                    appState.media.push(newEntry);
                    break;
                case 'password':
                    newEntry.service = document.getElementById('passwordService').value.trim();
                    newEntry.username = document.getElementById('passwordUsername').value.trim();
                    newEntry.password = document.getElementById('passwordValue').value.trim();
                    newEntry.strength = document.getElementById('passwordStrength').value.trim();
                    newEntry.description = document.getElementById('passwordDescription').value.trim();
                    newEntry.notes = document.getElementById('passwordNotes').value.trim();
                    if (!newEntry.service || !newEntry.password) { showToast('Please fill in all required password fields (Service, Password).', 'error'); return; }
                    appState.passwords.push(newEntry);
                    break;
                case 'keyword':
                    newEntry.value = document.getElementById('keywordValue').value.trim();
                    newEntry.context = document.getElementById('keywordContext').value.trim();
                    newEntry.description = document.getElementById('keywordDescription').value.trim();
                    newEntry.notes = document.getElementById('keywordNotes').value.trim();
                    if (!newEntry.value) { showToast('Please enter a keyword/phrase.', 'error'); return; }
                    appState.keywords.push(newEntry);
                    break;
                case 'social':
                    newEntry.platform = document.getElementById('socialPlatform').value.trim();
                    newEntry.url = document.getElementById('socialUrl').value.trim();
                    newEntry.username = document.getElementById('socialUsername').value.trim();
                    newEntry.followCounts = document.getElementById('socialFollowCounts').value.trim();
                    newEntry.description = document.getElementById('socialDescription').value.trim();
                    newEntry.notes = document.getElementById('socialNotes').value.trim();
                    if (!newEntry.platform || !newEntry.url || !newEntry.username) { showToast('Please fill in all required social profile fields (Platform, URL, Username).', 'error'); return; }
                    appState.socials.push(newEntry);
                    break;
                case 'domain':
                    newEntry.value = document.getElementById('domainValue').value.trim();
                    newEntry.domainType = document.getElementById('domainType').value;
                    newEntry.registrar = document.getElementById('domainRegistrar').value.trim();
                    newEntry.location = document.getElementById('domainLocation').value.trim();
                    newEntry.status = document.getElementById('domainStatus').value;
                    newEntry.whois = document.getElementById('domainWhois').value.trim();
                    newEntry.dns = document.getElementById('domainDns').value.trim();
                    newEntry.tags = document.getElementById('domainTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    newEntry.description = document.getElementById('domainDescription').value.trim();
                    newEntry.notes = document.getElementById('domainNotes').value.trim();
                    if (!newEntry.value || !newEntry.domainType) { showToast('Please fill in all required domain fields (Domain/IP/URL, Type).', 'error'); return; }
                    appState.domains.push(newEntry);
                    break;
                case 'username':
                    newEntry.value = document.getElementById('usernameValue').value.trim();
                    newEntry.platformsFound = document.getElementById('usernamePlatforms').value.trim();
                    newEntry.emails = document.getElementById('usernameEmails').value.trim();
                    newEntry.realName = document.getElementById('usernameRealName').value.trim();
                    newEntry.activity = document.getElementById('usernameActivity').value;
                    newEntry.description = document.getElementById('usernameDescription').value.trim();
                    newEntry.notes = document.getElementById('usernameNotes').value.trim();
                    if (!newEntry.value) { showToast('Please enter a username/handle.', 'error'); return; }
                    appState.usernames.push(newEntry);
                    break;
                case 'threat':
                    newEntry.threatType = document.getElementById('threatType').value;
                    newEntry.name = document.getElementById('threatName').value.trim();
                    newEntry.severity = document.getElementById('threatSeverity').value;
                    newEntry.iocs = document.getElementById('threatIocs').value.trim();
                    newEntry.targets = document.getElementById('threatTargets').value.trim();
                    newEntry.attribution = document.getElementById('threatAttribution').value.trim();
                    newEntry.description = document.getElementById('threatDescription').value.trim();
                    newEntry.source = document.getElementById('threatSource').value.trim();
                    newEntry.notes = document.getElementById('threatNotes').value.trim();
                    if (!newEntry.name || !newEntry.threatType) { showToast('Please fill in all required threat fields (Name/ID, Type).', 'error'); return; }
                    appState.threats.push(newEntry);
                    break;
                case 'vulnerability':
                    newEntry.cve = document.getElementById('vulnCve').value.trim();
                    newEntry.cvss = parseFloat(document.getElementById('vulnCvss').value);
                    newEntry.software = document.getElementById('vulnSoftware').value.trim();
                    newEntry.vulnType = document.getElementById('vulnType').value;
                    newEntry.exploit = document.getElementById('vulnExploit').value;
                    newEntry.description = document.getElementById('vulnDescription').value.trim();
                    newEntry.mitigation = document.getElementById('vulnMitigation').value.trim();
                    newEntry.notes = document.getElementById('vulnNotes').value.trim();
                    if (!newEntry.cve) { showToast('Please enter a CVE ID.', 'error'); return; }
                    appState.vulnerabilities.push(newEntry);
                    break;
                case 'malware':
                    newEntry.filename = document.getElementById('malwareFilename').value.trim();
                    newEntry.hash = document.getElementById('malwareHash').value.trim();
                    newEntry.fileType = document.getElementById('malwareType').value;
                    newEntry.family = document.getElementById('malwareFamily').value.trim();
                    newEntry.detection = document.getElementById('malwareDetection').value.trim();
                    newEntry.behavior = document.getElementById('malwareBehavior').value.trim();
                    newEntry.source = document.getElementById('malwareSource').value.trim();
                    newEntry.tools = document.getElementById('malwareTools').value.trim();
                    newEntry.notes = document.getElementById('malwareNotes').value.trim();
                    if (!newEntry.filename || !newEntry.hash) { showToast('Please fill in all required malware fields (File Name, File Hash).', 'error'); return; }
                    appState.malware.push(newEntry);
                    break;
                case 'breach':
                    newEntry.company = document.getElementById('breachCompany').value.trim();
                    newEntry.date = document.getElementById('breachDate').value;
                    newEntry.records = parseInt(document.getElementById('breachRecords').value);
                    newEntry.dataTypes = document.getElementById('breachDataTypes').value.trim();
                    newEntry.vector = document.getElementById('breachVector').value;
                    newEntry.status = document.getElementById('breachStatus').value;
                    newEntry.source = document.getElementById('breachSource').value.trim();
                    newEntry.description = document.getElementById('breachDescription').value.trim();
                    newEntry.notes = document.getElementById('breachNotes').value.trim();
                    if (!newEntry.company || !newEntry.date) { showToast('Please fill in all required breach fields (Company/Organization, Breach Date).', 'error'); return; }
                    appState.breaches.push(newEntry);
                    break;
                case 'credential':
                    newEntry.credentialType = document.getElementById('credentialType').value;
                    newEntry.credentialValue = document.getElementById('credentialValue').value.trim();
                    newEntry.credentialService = document.getElementById('credentialService').value.trim();
                    newEntry.breachSource = document.getElementById('credentialBreachSource').value.trim();
                    newEntry.dateFound = document.getElementById('credentialDateFound').value;
                    newEntry.description = document.getElementById('credentialDescription').value.trim();
                    newEntry.notes = document.getElementById('credentialNotes').value.trim();
                    if (!newEntry.credentialValue) { showToast('Please enter the credential value.', 'error'); return; }
                    appState.credentials.push(newEntry);
                    break;
                case 'forum':
                    newEntry.forumName = document.getElementById('forumName').value.trim();
                    newEntry.forumUrl = document.getElementById('forumUrl').value.trim();
                    newEntry.forumType = document.getElementById('forumType').value;
                    newEntry.forumStatus = document.getElementById('forumStatus').value;
                    newEntry.forumLanguage = document.getElementById('forumLanguage').value.trim();
                    newEntry.description = document.getElementById('forumDescription').value.trim();
                    newEntry.notes = document.getElementById('forumNotes').value.trim();
                    if (!newEntry.forumName || !newEntry.forumUrl) { showToast('Please fill in all required forum fields (Name, URL).', 'error'); return; }
                    appState.forums.push(newEntry);
                    break;
                case 'vendor':
                    newEntry.vendorAlias = document.getElementById('vendorAlias').value.trim();
                    newEntry.vendorPlatforms = document.getElementById('vendorPlatforms').value.trim();
                    newEntry.vendorProducts = document.getElementById('vendorProducts').value.trim();
                    newEntry.vendorReputation = document.getElementById('vendorReputation').value.trim();
                    newEntry.description = document.getElementById('vendorDescription').value.trim();
                    newEntry.notes = document.getElementById('vendorNotes').value.trim();
                    if (!newEntry.vendorAlias) { showToast('Please enter a vendor name/alias.', 'error'); return; }
                    appState.vendors.push(newEntry);
                    break;
                case 'telegram':
                    newEntry.name = document.getElementById('telegramName').value.trim();
                    newEntry.url = document.getElementById('telegramUrl').value.trim();
                    newEntry.telegramType = document.getElementById('telegramType').value;
                    newEntry.subscribers = parseInt(document.getElementById('telegramSubscribers').value);
                    newEntry.language = document.getElementById('telegramLanguage').value.trim();
                    newEntry.activity = document.getElementById('telegramActivity').value;
                    newEntry.content = document.getElementById('telegramContent').value.trim();
                    newEntry.admin = document.getElementById('telegramAdmin').value.trim();
                    newEntry.tags = document.getElementById('telegramTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    newEntry.notes = document.getElementById('telegramNotes').value.trim();
                    if (!newEntry.name || !newEntry.url) { showToast('Please fill in all required Telegram fields (Channel Name, URL).', 'error'); return; }
                    appState.telegramChannels.push(newEntry);
                    break;
                case 'paste':
                    newEntry.url = document.getElementById('pasteUrl').value.trim();
                    newEntry.sourceSite = document.getElementById('pasteSourceSite').value.trim();
                    newEntry.contentSummary = document.getElementById('pasteContentSummary').value.trim();
                    newEntry.keywords = document.getElementById('pasteKeywords').value.trim();
                    newEntry.description = document.getElementById('pasteDescription').value.trim();
                    newEntry.notes = document.getElementById('pasteNotes').value.trim();
                    if (!newEntry.url) { showToast('Please enter a Paste URL.', 'error'); return; }
                    appState.pastes.push(newEntry);
                    break;
                case 'document':
                    newEntry.title = document.getElementById('documentTitle').value.trim();
                    newEntry.fileType = document.getElementById('documentFileType').value.trim();
                    newEntry.hash = document.getElementById('documentHash').value.trim();
                    newEntry.contentSummary = document.getElementById('documentContentSummary').value.trim();
                    newEntry.source = document.getElementById('documentSource').value.trim();
                    newEntry.description = document.getElementById('documentDescription').value.trim();
                    newEntry.notes = document.getElementById('documentNotes').value.trim();
                    if (!newEntry.title || !newEntry.hash) { showToast('Please fill in all required document fields (Title, File Hash).', 'error'); return; }
                    appState.documents.push(newEntry);
                    break;
                case 'network':
                    newEntry.subject = document.getElementById('networkSubject').value.trim();
                    newEntry.networkType = document.getElementById('networkType').value;
                    newEntry.findings = document.getElementById('networkFindings').value.trim();
                    newEntry.associatedIpsDomains = document.getElementById('networkAssociated').value.trim();
                    newEntry.toolsUsed = document.getElementById('networkTools').value.trim();
                    newEntry.description = document.getElementById('networkDescription').value.trim();
                    newEntry.notes = document.getElementById('networkNotes').value.trim();
                    if (!newEntry.subject || !newEntry.networkType) { showToast('Please fill in all required network fields (Analysis Subject, Type).', 'error'); return; }
                    appState.networks.push(newEntry);
                    break;
                case 'metadata':
                    newEntry.title = document.getElementById('metadataTitle').value.trim();
                    newEntry.description = document.getElementById('metadataDescription').value.trim();
                    newEntry.fileSource = document.getElementById('metadataFileSource').value.trim();
                    newEntry.notes = document.getElementById('metadataNotes').value.trim();
                    if (!newEntry.title) { showToast('Please enter a Metadata Title/Context.', 'error'); return; }
                    appState.metadataEntries.push(newEntry);
                    break;
                case 'archive':
                    newEntry.originalUrl = document.getElementById('archiveOriginalUrl').value.trim();
                    newEntry.url = document.getElementById('archiveUrl').value.trim();
                    newEntry.service = document.getElementById('archiveService').value.trim();
                    newEntry.timestamp = document.getElementById('archiveTimestamp').value; // Keep as string or convert to Date/timestamp
                    newEntry.contentSummary = document.getElementById('archiveContentSummary').value.trim();
                    newEntry.description = document.getElementById('archiveDescription').value.trim();
                    newEntry.notes = document.getElementById('archiveNotes').value.trim();
                    if (!newEntry.originalUrl || !newEntry.url) { showToast('Please fill in all required archive fields (Original URL, Archived URL).', 'error'); return; }
                    // Convert to timestamp if needed for consistency with other dates
                    if (newEntry.timestamp) {
                        newEntry.timestamp = new Date(newEntry.timestamp).getTime();
                    }
                    appState.archives.push(newEntry);
                    break;
                case 'messaging':
                    newEntry.messagingApp = document.getElementById('messagingApp').value;
                    newEntry.username = document.getElementById('messagingUsername').value.trim();
                    newEntry.chatId = document.getElementById('messagingChatId').value.trim();
                    newEntry.content = document.getElementById('messagingContent').value.trim();
                    newEntry.description = document.getElementById('messagingDescription').value.trim();
                    newEntry.notes = document.getElementById('messagingNotes').value.trim();
                    if (!newEntry.messagingApp || !newEntry.username) { showToast('Please fill in all required messaging fields (App, Username/ID).', 'error'); return; }
                    appState.messagingApps.push(newEntry);
                    break;
                case 'dating':
                    newEntry.platform = document.getElementById('datingPlatform').value;
                    newEntry.username = document.getElementById('datingUsername').value.trim();
                    newEntry.displayName = document.getElementById('datingDisplayName').value.trim();
                    newEntry.age = parseInt(document.getElementById('datingAge').value);
                    newEntry.location = document.getElementById('datingLocation').value.trim();
                    newEntry.photos = document.getElementById('datingPhotos').value.trim();
                    newEntry.bio = document.getElementById('datingBio').value.trim();
                    newEntry.verified = document.getElementById('datingVerified').value;
                    newEntry.suspicious = document.getElementById('datingSuspicious').value.trim();
                    newEntry.notes = document.getElementById('datingNotes').value.trim();
                    if (!newEntry.platform || !newEntry.username) { showToast('Please fill in all required dating profile fields (Platform, Username).', 'error'); return; }
                    appState.datingProfiles.push(newEntry);
                    break;
                case 'audio':
                    newEntry.title = document.getElementById('audioTitle').value.trim();
                    newEntry.format = document.getElementById('audioFormat').value;
                    newEntry.duration = document.getElementById('audioDuration').value.trim();
                    newEntry.quality = document.getElementById('audioQuality').value;
                    newEntry.language = document.getElementById('audioLanguage').value.trim();
                    newEntry.transcript = document.getElementById('audioTranscript').value.trim();
                    newEntry.speakers = document.getElementById('audioSpeakers').value.trim();
                    newEntry.background = document.getElementById('audioBackground').value.trim();
                    newEntry.tools = document.getElementById('audioTools').value.trim();
                    newEntry.description = document.getElementById('audioDescription').value.trim();
                    newEntry.notes = document.getElementById('audioNotes').value.trim();
                    const audioFile = document.getElementById('audioFile').files[0];
                    if (!newEntry.title || !newEntry.format) { showToast('Please fill in all required audio fields (Title, Format).', 'error'); return; }
                    if (audioFile) {
                        newEntry.base64Data = await readFileAsBase64(audioFile);
                    } else {
                        showToast('Please upload an audio file.', 'error');
                        return;
                    }
                    appState.audioEntries.push(newEntry);
                    break;
                case 'facial':
                    newEntry.subject = document.getElementById('facialSubject').value.trim();
                    newEntry.sourceDescription = document.getElementById('facialSourceDescription').value.trim();
                    newEntry.identifiedProfiles = document.getElementById('facialIdentifiedProfiles').value.trim();
                    newEntry.confidence = document.getElementById('facialConfidence').value.trim();
                    newEntry.toolsUsed = document.getElementById('facialToolsUsed').value.trim();
                    newEntry.description = document.getElementById('facialDescription').value.trim();
                    newEntry.notes = document.getElementById('facialNotes').value.trim();
                    if (!newEntry.subject) { showToast('Please enter a subject/person identified.', 'error'); return; }
                    appState.facialRecognition.push(newEntry);
                    break;
                case 'persona':
                    newEntry.name = document.getElementById('personaName').value.trim();
                    newEntry.realName = document.getElementById('personaRealName').value.trim();
                    newEntry.associatedAccounts = document.getElementById('personaAssociatedAccounts').value.trim();
                    newEntry.bio = document.getElementById('personaBio').value.trim();
                    newEntry.platformsUsed = document.getElementById('personaPlatforms').value.trim();
                    newEntry.origin = document.getElementById('personaOrigin').value.trim();
                    newEntry.notes = document.getElementById('personaNotes').value.trim();
                    if (!newEntry.name) { showToast('Please enter a persona name/alias.', 'error'); return; }
                    appState.personas.push(newEntry);
                    break;
                case 'vpn':
                    newEntry.name = document.getElementById('vpnName').value.trim();
                    newEntry.vpnType = document.getElementById('vpnType').value;
                    newEntry.jurisdiction = document.getElementById('vpnJurisdiction').value.trim();
                    newEntry.logs = document.getElementById('vpnLogs').value;
                    newEntry.payment = document.getElementById('vpnPayment').value.trim();
                    newEntry.locations = document.getElementById('vpnLocations').value.trim();
                    newEntry.issues = document.getElementById('vpnIssues').value.trim();
                    newEntry.useCase = document.getElementById('vpnUseCase').value;
                    newEntry.description = document.getElementById('vpnDescription').value.trim();
                    newEntry.notes = document.getElementById('vpnNotes').value.trim();
                    if (!newEntry.name || !newEntry.vpnType) { showToast('Please fill in all required VPN fields (Service Name, Type).', 'error'); return; }
                    appState.vpns.push(newEntry);
                    break;
                case 'honeypot':
                    newEntry.honeypotType = document.getElementById('honeypotType').value;
                    newEntry.location = document.getElementById('honeypotLocation').value.trim();
                    newEntry.purpose = document.getElementById('honeypotPurpose').value.trim();
                    newEntry.dataSummary = document.getElementById('honeypotDataSummary').value.trim();
                    newEntry.alerts = document.getElementById('honeypotAlerts').value.trim();
                    newEntry.description = document.getElementById('honeypotDescription').value.trim();
                    newEntry.notes = document.getElementById('honeypotNotes').value.trim();
                    if (!newEntry.honeypotType || !newEntry.location) { showToast('Please fill in all required honeypot fields (Type, Deployment Location/IP).', 'error'); return; }
                    appState.honeypots.push(newEntry);
                    break;
                case 'exploit':
                    newEntry.name = document.getElementById('exploitName').value.trim();
                    newEntry.targetVuln = document.getElementById('exploitTargetVuln').value.trim();
                    newEntry.exploitType = document.getElementById('exploitType').value;
                    newEntry.marketSource = document.getElementById('exploitMarketSource').value.trim();
                    newEntry.price = document.getElementById('exploitPrice').value.trim();
                    newEntry.description = document.getElementById('exploitDescription').value.trim();
                    newEntry.notes = document.getElementById('exploitNotes').value.trim();
                    if (!newEntry.name || !newEntry.targetVuln) { showToast('Please fill in all required exploit fields (Name/ID, Target Vulnerability).', 'error'); return; }
                    appState.exploits.push(newEntry);
                    break;
                case 'publicrecord':
                    newEntry.recordType = document.getElementById('publicRecordType').value;
                    newEntry.subjectName = document.getElementById('publicRecordSubjectName').value.trim();
                    newEntry.refId = document.getElementById('publicRecordRefId').value.trim();
                    newEntry.jurisdiction = document.getElementById('publicRecordJurisdiction').value.trim();
                    newEntry.date = document.getElementById('publicRecordDate').value;
                    newEntry.summary = document.getElementById('publicRecordSummary').value.trim();
                    newEntry.sourceUrl = document.getElementById('publicRecordSourceUrl').value.trim();
                    newEntry.description = document.getElementById('publicRecordDescription').value.trim();
                    newEntry.notes = document.getElementById('publicRecordNotes').value.trim();
                    if (!newEntry.recordType || !newEntry.subjectName) { showToast('Please fill in all required public record fields (Record Type, Subject Name).', 'error'); return; }
                    appState.publicRecords.push(newEntry);
                    break;
            }

            if (appState.currentTab === 'custom-tabs' && appState.currentCustomTab) {
                const activeCustomTab = appState.customTabs.find(tab => tab.id === appState.currentCustomTab);
                if (activeCustomTab && !activeCustomTab.toolIds.includes(newEntry.id)) {
                    activeCustomTab.toolIds.push(newEntry.id);
                    newEntry.customTabs.push(activeCustomTab.id);
                }
            }

            hideModal('addEntryModal');
            document.getElementById('addEntryForm').reset();
            document.getElementById('customMetadataEntries').innerHTML = '';
            showToast('Entry added successfully!');
            logActivity('created', newEntry.type, `Added new ${newEntry.type}: ${getEntryName(newEntry)}`, { itemId: newEntry.id, assignedTabs: newEntry.customTabs });
            updateDashboard();
            populateCategoryFilter();
            renderIntelligenceEntries();
            renderCustomTabs();
            saveState();
        }

        // MODIFIED: handleEditEntry function to include all new entry types
        async function handleEditEntry(e) {
            e.preventDefault();
            if (appState.readOnlyMode) {
                showToast("Cannot edit entries in read-only shared view.", "warning");
                return;
            }

            const entryId = document.getElementById('editEntryId').value;
            const entryType = document.getElementById('editEntryType').value;

            let entryToEdit = null;
            let entryArray = null;

            // Determine which array to look into based on entryType
            switch (entryType) {
                case 'tool': entryArray = appState.tools; break;
                case 'email': entryArray = appState.emails; break;
                case 'phone': entryArray = appState.phones; break;
                case 'crypto': entryArray = appState.crypto; break;
                case 'location': entryArray = appState.locations; break;
                case 'link': entryArray = appState.links; break;
                case 'media': entryArray = appState.media; break;
                case 'password': entryArray = appState.passwords; break;
                case 'keyword': entryArray = appState.keywords; break;
                case 'social': entryArray = appState.socials; break;
                case 'domain': entryArray = appState.domains; break;
                case 'username': entryArray = appState.usernames; break;
                case 'threat': entryArray = appState.threats; break;
                case 'vulnerability': entryArray = appState.vulnerabilities; break;
                case 'malware': entryArray = appState.malware; break;
                case 'breach': entryArray = appState.breaches; break;
                case 'credential': entryArray = appState.credentials; break;
                case 'forum': entryArray = appState.forums; break;
                case 'vendor': entryArray = appState.vendors; break;
                case 'telegram': entryArray = appState.telegramChannels; break;
                case 'paste': entryArray = appState.pastes; break;
                case 'document': entryArray = appState.documents; break;
                case 'network': entryArray = appState.networks; break;
                case 'metadata': entryArray = appState.metadataEntries; break;
                case 'archive': entryArray = appState.archives; break;
                case 'messaging': entryArray = appState.messagingApps; break;
                case 'dating': entryArray = appState.datingProfiles; break;
                case 'audio': entryArray = appState.audioEntries; break;
                case 'facial': entryArray = appState.facialRecognition; break;
                case 'persona': entryArray = appState.personas; break;
                case 'vpn': entryArray = appState.vpns; break;
                case 'honeypot': entryArray = appState.honeypots; break;
                case 'exploit': entryArray = appState.exploits; break;
                case 'publicrecord': entryArray = appState.publicRecords; break;
                default:
                    console.warn(`Unknown entry type for action: ${entryType}`);
                    return;
            }

            if (entryArray) {
                entryToEdit = entryArray.find(t => t.id === entryId);
            }

            if (!entryToEdit) {
                showToast('Error: Entry not found for editing.', 'error');
                return;
            }

            // Collect custom metadata
            const customMetadata = [];
            document.querySelectorAll('#editCustomMetadataEntries .metadata-entry').forEach(row => {
                const keyInput = row.querySelector('.metadata-key');
                const valueInput = row.querySelector('.metadata-value');
                const key = keyInput ? keyInput.value.trim() : '';
                const value = valueInput ? valueInput.value.trim() : '';
                if (key && value) {
                    customMetadata.push({ key, value });
                }
            });
            entryToEdit.metadata = customMetadata.length > 0 ? customMetadata : undefined;

            // Collect source (general source for all types)
            const entrySourceInput = document.getElementById('editEntrySource');
            entryToEdit.source = entrySourceInput ? entrySourceInput.value.trim() || undefined : undefined;


            switch (entryType) {
                case 'tool':
                    entryToEdit.name = document.getElementById('editToolName').value.trim();
                    entryToEdit.url = document.getElementById('editToolUrl').value.trim();
                    let editToolCategory = document.getElementById('editToolCategory').value;
                    const editNewCategoryInput = document.getElementById('editNewCategoryInput').value.trim();
                    entryToEdit.description = document.getElementById('editToolDescription').value.trim();
                    entryToEdit.tags = document.getElementById('editToolTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    entryToEdit.notes = document.getElementById('editToolInvestigationNotes').value.trim();

                    const editedIntelligenceVaultCategories = Array.from(document.querySelectorAll('#intelligenceVaultCategoriesCheckboxesEditTool input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
                    entryToEdit.intelligenceVaultCategories = editedIntelligenceVaultCategories;

                    if (editToolCategory === 'custom') {
                        if (!editNewCategoryInput) { showToast('Please enter a custom category name.', 'error'); return; }
                        editToolCategory = editNewCategoryInput.toLowerCase();
                    }
                    entryToEdit.category = editToolCategory;
                    entryToEdit.favicon = `https://www.google.com/s2/favicons?domain=${new URL(entryToEdit.url).hostname}`;
                    break;
                case 'email':
                    entryToEdit.email = document.getElementById('editEmailAddress').value.trim();
                    entryToEdit.linkedPlatforms = document.getElementById('editEmailLinkedPlatforms').value.split(',').map(p => p.trim()).filter(p => p);
                    entryToEdit.breachResults = document.getElementById('editEmailBreachResults').value.trim();
                    entryToEdit.description = document.getElementById('editEmailDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editEmailNotes').value.trim();
                    break;
                case 'phone':
                    entryToEdit.number = document.getElementById('editPhoneNumber').value.trim();
                    entryToEdit.phoneType = document.getElementById('editPhoneType').value;
                    entryToEdit.location = document.getElementById('editPhoneLocation').value.trim();
                    entryToEdit.description = document.getElementById('editPhoneDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editPhoneNotes').value.trim();
                    break;
                case 'crypto':
                    entryToEdit.address = document.getElementById('editCryptoAddress').value.trim();
                    entryToEdit.txid = document.getElementById('editCryptoTxid').value.trim();
                    entryToEdit.amount = parseFloat(document.getElementById('editCryptoAmount').value);
                    entryToEdit.source = document.getElementById('editCryptoSource').value.trim();
                    entryToEdit.tags = document.getElementById('editCryptoTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    entryToEdit.description = document.getElementById('editCryptoDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editCryptoNotes').value.trim();
                    break;
                case 'location':
                    entryToEdit.name = document.getElementById('editLocationName').value.trim();
                    entryToEdit.coordinates = document.getElementById('editLocationCoordinates').value.trim();
                    entryToEdit.mapLink = document.getElementById('editLocationMapLink').value.trim();
                    entryToEdit.ipGeoIntel = document.getElementById('editLocationIpGeoIntel').value.trim();
                    entryToEdit.description = document.getElementById('editLocationDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editLocationNotes').value.trim();
                    break;
                case 'link':
                    entryToEdit.url = document.getElementById('editLinkUrl').value.trim();
                    entryToEdit.platform = document.getElementById('editLinkPlatform').value.trim();
                    entryToEdit.tags = document.getElementById('editLinkTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    entryToEdit.description = document.getElementById('editLinkDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editLinkNotes').value.trim();
                    break;
                case 'media':
                    entryToEdit.title = document.getElementById('editMediaTitle').value.trim();
                    entryToEdit.mediaType = document.getElementById('editMediaType').value;
                    const editMediaFile = document.getElementById('editMediaFile').files[0];
                    if (editMediaFile) {
                        entryToEdit.base64Data = await readFileAsBase64(editMediaFile);
                    }
                    entryToEdit.description = document.getElementById('editMediaDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editMediaNotes').value.trim();
                    break;
                case 'password':
                    entryToEdit.service = document.getElementById('editPasswordService').value.trim();
                    entryToEdit.username = document.getElementById('editPasswordUsername').value.trim();
                    entryToEdit.password = document.getElementById('editPasswordValue').value.trim();
                    entryToEdit.strength = document.getElementById('editPasswordStrength').value.trim();
                    entryToEdit.description = document.getElementById('editPasswordDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editPasswordNotes').value.trim();
                    break;
                case 'keyword':
                    entryToEdit.value = document.getElementById('editKeywordValue').value.trim();
                    entryToEdit.context = document.getElementById('editKeywordContext').value.trim();
                    entryToEdit.description = document.getElementById('editKeywordDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editKeywordNotes').value.trim();
                    break;
                case 'social':
                    entryToEdit.platform = document.getElementById('editSocialPlatform').value.trim();
                    entryToEdit.url = document.getElementById('editSocialUrl').value.trim();
                    entryToEdit.username = document.getElementById('editSocialUsername').value.trim();
                    entryToEdit.followCounts = document.getElementById('editSocialFollowCounts').value.trim();
                    entryToEdit.description = document.getElementById('editSocialDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editSocialNotes').value.trim();
                    break;
                case 'domain':
                    entryToEdit.value = document.getElementById('editDomainValue').value.trim();
                    entryToEdit.domainType = document.getElementById('editDomainType').value;
                    entryToEdit.registrar = document.getElementById('editDomainRegistrar').value.trim();
                    entryToEdit.location = document.getElementById('editDomainLocation').value.trim();
                    entryToEdit.status = document.getElementById('editDomainStatus').value;
                    entryToEdit.whois = document.getElementById('editDomainWhois').value.trim();
                    entryToEdit.dns = document.getElementById('editDomainDns').value.trim();
                    entryToEdit.tags = document.getElementById('editDomainTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    entryToEdit.description = document.getElementById('editDomainDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editDomainNotes').value.trim();
                    break;
                case 'username':
                    entryToEdit.value = document.getElementById('editUsernameValue').value.trim();
                    entryToEdit.platformsFound = document.getElementById('editUsernamePlatforms').value.trim();
                    entryToEdit.emails = document.getElementById('editUsernameEmails').value.trim();
                    entryToEdit.realName = document.getElementById('editUsernameRealName').value.trim();
                    entryToEdit.activity = document.getElementById('editUsernameActivity').value;
                    entryToEdit.description = document.getElementById('editUsernameDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editUsernameNotes').value.trim();
                    break;
                case 'threat':
                    entryToEdit.threatType = document.getElementById('editThreatType').value;
                    entryToEdit.name = document.getElementById('editThreatName').value.trim();
                    entryToEdit.severity = document.getElementById('editThreatSeverity').value;
                    entryToEdit.iocs = document.getElementById('editThreatIocs').value.trim();
                    entryToEdit.targets = document.getElementById('editThreatTargets').value.trim();
                    entryToEdit.attribution = document.getElementById('editThreatAttribution').value.trim();
                    entryToEdit.description = document.getElementById('editThreatDescription').value.trim();
                    entryToEdit.source = document.getElementById('editThreatSource').value.trim();
                    entryToEdit.notes = document.getElementById('editThreatNotes').value.trim();
                    break;
                case 'vulnerability':
                    entryToEdit.cve = document.getElementById('editVulnCve').value.trim();
                    entryToEdit.cvss = parseFloat(document.getElementById('editVulnCvss').value);
                    entryToEdit.software = document.getElementById('editVulnSoftware').value.trim();
                    entryToEdit.vulnType = document.getElementById('editVulnType').value;
                    entryToEdit.exploit = document.getElementById('editVulnExploit').value;
                    entryToEdit.description = document.getElementById('editVulnDescription').value.trim();
                    entryToEdit.mitigation = document.getElementById('editVulnMitigation').value.trim();
                    entryToEdit.notes = document.getElementById('editVulnNotes').value.trim();
                    break;
                case 'malware':
                    entryToEdit.filename = document.getElementById('editMalwareFilename').value.trim();
                    entryToEdit.hash = document.getElementById('editMalwareHash').value.trim();
                    entryToEdit.fileType = document.getElementById('editMalwareType').value;
                    entryToEdit.family = document.getElementById('editMalwareFamily').value.trim();
                    entryToEdit.detection = document.getElementById('editMalwareDetection').value.trim();
                    entryToEdit.behavior = document.getElementById('editMalwareBehavior').value.trim();
                    entryToEdit.malwareSource = document.getElementById('editMalwareSource').value.trim();
                    entryToEdit.tools = document.getElementById('editMalwareTools').value.trim();
                    entryToEdit.notes = document.getElementById('editMalwareNotes').value.trim();
                    break;
                case 'breach':
                    entryToEdit.company = document.getElementById('editBreachCompany').value.trim();
                    entryToEdit.date = document.getElementById('editBreachDate').value;
                    entryToEdit.records = parseInt(document.getElementById('editBreachRecords').value);
                    entryToEdit.dataTypes = document.getElementById('editBreachDataTypes').value.trim();
                    entryToEdit.vector = document.getElementById('editBreachVector').value;
                    entryToEdit.status = document.getElementById('editBreachStatus').value;
                    entryToEdit.source = document.getElementById('editBreachSource').value.trim();
                    entryToEdit.description = document.getElementById('editBreachDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editBreachNotes').value.trim();
                    break;
                case 'credential':
                    entryToEdit.credentialType = document.getElementById('editCredentialType').value;
                    entryToEdit.credentialValue = document.getElementById('editCredentialValue').value.trim();
                    entryToEdit.credentialService = document.getElementById('editCredentialService').value.trim();
                    entryToEdit.breachSource = document.getElementById('editCredentialBreachSource').value.trim();
                    entryToEdit.dateFound = document.getElementById('editCredentialDateFound').value;
                    entryToEdit.description = document.getElementById('editCredentialDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editCredentialNotes').value.trim();
                    break;
                case 'forum':
                    entryToEdit.forumName = document.getElementById('editForumName').value.trim();
                    entryToEdit.forumUrl = document.getElementById('editForumUrl').value.trim();
                    entryToEdit.forumType = document.getElementById('editForumType').value;
                    entryToEdit.forumStatus = document.getElementById('editForumStatus').value;
                    entryToEdit.forumLanguage = document.getElementById('editForumLanguage').value.trim();
                    entryToEdit.description = document.getElementById('editForumDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editForumNotes').value.trim();
                    break;
                case 'vendor':
                    entryToEdit.vendorAlias = document.getElementById('editVendorAlias').value.trim();
                    entryToEdit.vendorPlatforms = document.getElementById('editVendorPlatforms').value.trim();
                    entryToEdit.vendorProducts = document.getElementById('editVendorProducts').value.trim();
                    entryToEdit.vendorReputation = document.getElementById('editVendorReputation').value.trim();
                    entryToEdit.description = document.getElementById('editVendorDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editVendorNotes').value.trim();
                    break;
                case 'telegram':
                    entryToEdit.name = document.getElementById('editTelegramName').value.trim();
                    entryToEdit.url = document.getElementById('editTelegramUrl').value.trim();
                    entryToEdit.telegramType = document.getElementById('editTelegramType').value;
                    entryToEdit.subscribers = parseInt(document.getElementById('editTelegramSubscribers').value);
                    entryToEdit.language = document.getElementById('editTelegramLanguage').value.trim();
                    entryToEdit.activity = document.getElementById('editTelegramActivity').value;
                    entryToEdit.content = document.getElementById('editTelegramContent').value.trim();
                    entryToEdit.admin = document.getElementById('editTelegramAdmin').value.trim();
                    entryToEdit.tags = document.getElementById('editTelegramTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
                    entryToEdit.notes = document.getElementById('editTelegramNotes').value.trim();
                    break;
                case 'paste':
                    entryToEdit.url = document.getElementById('editPasteUrl').value.trim();
                    entryToEdit.sourceSite = document.getElementById('editPasteSourceSite').value.trim();
                    entryToEdit.contentSummary = document.getElementById('editPasteContentSummary').value.trim();
                    entryToEdit.keywords = document.getElementById('editPasteKeywords').value.trim();
                    entryToEdit.description = document.getElementById('editPasteDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editPasteNotes').value.trim();
                    break;
                case 'document':
                    entryToEdit.title = document.getElementById('editDocumentTitle').value.trim();
                    entryToEdit.fileType = document.getElementById('editDocumentFileType').value.trim();
                    entryToEdit.hash = document.getElementById('editDocumentHash').value.trim();
                    entryToEdit.contentSummary = document.getElementById('editDocumentContentSummary').value.trim();
                    entryToEdit.source = document.getElementById('editDocumentSource').value.trim();
                    entryToEdit.description = document.getElementById('editDocumentDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editDocumentNotes').value.trim();
                    break;
                case 'network':
                    entryToEdit.subject = document.getElementById('editNetworkSubject').value.trim();
                    entryToEdit.networkType = document.getElementById('editNetworkType').value;
                    entryToEdit.findings = document.getElementById('editNetworkFindings').value.trim();
                    entryToEdit.associatedIpsDomains = document.getElementById('editNetworkAssociated').value.trim();
                    entryToEdit.toolsUsed = document.getElementById('editNetworkTools').value.trim();
                    entryToEdit.description = document.getElementById('editNetworkDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editNetworkNotes').value.trim();
                    break;
                case 'metadata':
                    entryToEdit.title = document.getElementById('editMetadataTitle').value.trim();
                    entryToEdit.description = document.getElementById('editMetadataDescription').value.trim();
                    entryToEdit.fileSource = document.getElementById('editMetadataFileSource').value.trim();
                    entryToEdit.notes = document.getElementById('editMetadataNotes').value.trim();
                    break;
                case 'archive':
                    entryToEdit.originalUrl = document.getElementById('editArchiveOriginalUrl').value.trim();
                    entryToEdit.url = document.getElementById('editArchiveUrl').value.trim();
                    entryToEdit.service = document.getElementById('editArchiveService').value.trim();
                    entryToEdit.timestamp = document.getElementById('editArchiveTimestamp').value ? new Date(document.getElementById('editArchiveTimestamp').value).getTime() : null;
                    entryToEdit.contentSummary = document.getElementById('editArchiveContentSummary').value.trim();
                    entryToEdit.description = document.getElementById('editArchiveDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editArchiveNotes').value.trim();
                    break;
                case 'messaging':
                    entryToEdit.messagingApp = document.getElementById('editMessagingApp').value;
                    entryToEdit.username = document.getElementById('editMessagingUsername').value.trim();
                    entryToEdit.chatId = document.getElementById('editMessagingChatId').value.trim();
                    entryToEdit.content = document.getElementById('editMessagingContent').value.trim();
                    entryToEdit.description = document.getElementById('editMessagingDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editMessagingNotes').value.trim();
                    break;
                case 'dating':
                    entryToEdit.platform = document.getElementById('editDatingPlatform').value;
                    entryToEdit.username = document.getElementById('editDatingUsername').value.trim();
                    entryToEdit.displayName = document.getElementById('editDatingDisplayName').value.trim();
                    entryToEdit.age = parseInt(document.getElementById('editDatingAge').value);
                    entryToEdit.location = document.getElementById('editDatingLocation').value.trim();
                    entryToEdit.photos = document.getElementById('editDatingPhotos').value.trim();
                    entryToEdit.bio = document.getElementById('editDatingBio').value.trim();
                    entryToEdit.verified = document.getElementById('editDatingVerified').value;
                    entryToEdit.suspicious = document.getElementById('editDatingSuspicious').value.trim();
                    entryToEdit.notes = document.getElementById('editDatingNotes').value.trim();
                    break;
                case 'audio':
                    entryToEdit.title = document.getElementById('editAudioTitle').value.trim();
                    entryToEdit.format = document.getElementById('editAudioFormat').value;
                    entryToEdit.duration = document.getElementById('editAudioDuration').value.trim();
                    entryToEdit.quality = document.getElementById('editAudioQuality').value;
                    entryToEdit.language = document.getElementById('editAudioLanguage').value.trim();
                    entryToEdit.transcript = document.getElementById('editAudioTranscript').value.trim();
                    entryToEdit.speakers = document.getElementById('editAudioSpeakers').value.trim();
                    entryToEdit.background = document.getElementById('editAudioBackground').value.trim();
                    entryToEdit.tools = document.getElementById('editAudioTools').value.trim();
                    entryToEdit.description = document.getElementById('editAudioDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editAudioNotes').value.trim();
                    const editAudioFile = document.getElementById('editAudioFile').files[0];
                    if (editAudioFile) {
                        entryToEdit.base64Data = await readFileAsBase64(editAudioFile);
                    }
                    break;
                case 'facial':
                    entryToEdit.subject = document.getElementById('editFacialSubject').value.trim();
                    entryToEdit.sourceDescription = document.getElementById('editFacialSourceDescription').value.trim();
                    entryToEdit.identifiedProfiles = document.getElementById('editFacialIdentifiedProfiles').value.trim();
                    entryToEdit.confidence = document.getElementById('editFacialConfidence').value.trim();
                    entryToEdit.toolsUsed = document.getElementById('editFacialToolsUsed').value.trim();
                    entryToEdit.description = document.getElementById('editFacialDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editFacialNotes').value.trim();
                    break;
                case 'persona':
                    entryToEdit.name = document.getElementById('editPersonaName').value.trim();
                    entryToEdit.realName = document.getElementById('editPersonaRealName').value.trim();
                    entryToEdit.associatedAccounts = document.getElementById('editPersonaAssociatedAccounts').value.trim();
                    entryToEdit.bio = document.getElementById('editPersonaBio').value.trim();
                    entryToEdit.platformsUsed = document.getElementById('editPersonaPlatforms').value.trim();
                    entryToEdit.origin = document.getElementById('editPersonaOrigin').value.trim();
                    entryToEdit.notes = document.getElementById('editPersonaNotes').value.trim();
                    break;
                case 'vpn':
                    entryToEdit.name = document.getElementById('editVpnName').value.trim();
                    entryToEdit.vpnType = document.getElementById('editVpnType').value;
                    entryToEdit.jurisdiction = document.getElementById('editVpnJurisdiction').value.trim();
                    entryToEdit.logs = document.getElementById('editVpnLogs').value;
                    entryToEdit.payment = document.getElementById('editVpnPayment').value.trim();
                    entryToEdit.locations = document.getElementById('editVpnLocations').value.trim();
                    entryToEdit.issues = document.getElementById('editVpnIssues').value.trim();
                    entryToEdit.useCase = document.getElementById('editVpnUseCase').value;
                    entryToEdit.description = document.getElementById('editVpnDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editVpnNotes').value.trim();
                    break;
                case 'honeypot':
                    entryToEdit.honeypotType = document.getElementById('editHoneypotType').value;
                    entryToEdit.location = document.getElementById('editHoneypotLocation').value.trim();
                    entryToEdit.purpose = document.getElementById('editHoneypotPurpose').value.trim();
                    entryToEdit.dataSummary = document.getElementById('editHoneypotDataSummary').value.trim();
                    entryToEdit.alerts = document.getElementById('editHoneypotAlerts').value.trim();
                    entryToEdit.description = document.getElementById('editHoneypotDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editHoneypotNotes').value.trim();
                    break;
                case 'exploit':
                    entryToEdit.name = document.getElementById('editExploitName').value.trim();
                    entryToEdit.targetVuln = document.getElementById('editExploitTargetVuln').value.trim();
                    entryToEdit.exploitType = document.getElementById('editExploitType').value;
                    entryToEdit.marketSource = document.getElementById('editExploitMarketSource').value.trim();
                    entryToEdit.price = document.getElementById('editExploitPrice').value.trim();
                    entryToEdit.description = document.getElementById('editExploitDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editExploitNotes').value.trim();
                    break;
                case 'publicrecord':
                    entryToEdit.recordType = document.getElementById('editPublicRecordType').value;
                    entryToEdit.subjectName = document.getElementById('editPublicRecordSubjectName').value.trim();
                    entryToEdit.refId = document.getElementById('editPublicRecordRefId').value.trim();
                    entryToEdit.jurisdiction = document.getElementById('editPublicRecordJurisdiction').value.trim();
                    entryToEdit.date = document.getElementById('editPublicRecordDate').value;
                    entryToEdit.summary = document.getElementById('editPublicRecordSummary').value.trim();
                    entryToEdit.sourceUrl = document.getElementById('editPublicRecordSourceUrl').value.trim();
                    entryToEdit.description = document.getElementById('editPublicRecordDescription').value.trim();
                    entryToEdit.notes = document.getElementById('editPublicRecordNotes').value.trim();
                    break;
            }

            // Update custom tab assignments for this entry
            const assignedCustomTabs = Array.from(document.querySelectorAll('#assignCustomTabsCheckboxes input[type="checkbox"]:checked'))
                .map(checkbox => checkbox.value);

            // Clear existing custom tab assignments for this entry
            appState.customTabs.forEach(tab => {
                tab.toolIds = tab.toolIds.filter(id => id !== entryId);
            });
            entryToEdit.customTabs = []; // Reset the entry's customTabs array

            // Add back selected assignments
            assignedCustomTabs.forEach(tabId => {
                const tab = appState.customTabs.find(t => t.id === tabId);
                if (tab) {
                    tab.toolIds.push(entryId);
                    entryToEdit.customTabs.push(tabId); // Also update the entry itself
                }
            });

            hideModal('editEntryModal');
            showToast('Entry updated successfully!');
            logActivity('updated', entryToEdit.type, `Updated ${entryToEdit.type}: ${getEntryName(entryToEdit)}`, { itemId: entryToEdit.id, newAssignedTabs: entryToEdit.customTabs });
            updateDashboard();
            populateCategoryFilter();
            renderIntelligenceEntries();
            renderCustomTabs(); // Re-render custom tabs to update counts/content
            saveState();
        }

        // MODIFIED: openEditEntryModal to correctly pass entry to openEditCaseStudyModal
        function openEditEntryModal(entry) {
            if (appState.readOnlyMode) {
                showToast("Cannot edit entries in read-only shared view.", "warning");
                return;
            }

            if (entry.type === 'caseStudy') {
                openEditCaseStudyModal(entry);
                return;
            }

            document.getElementById('editEntryId').value = entry.id;
            document.getElementById('editEntryType').value = entry.type;

            // Hide all entry-specific field sets and remove their 'required' attributes
            document.querySelectorAll('#editEntryModal .entry-fields').forEach(fieldSet => {
                fieldSet.style.display = 'none';
                fieldSet.querySelectorAll('[required]').forEach(input => {
                    input.removeAttribute('required');
                });
            });

            // Handle general source and metadata groups, ensuring they are always visible for edit if applicable
            const editEntrySourceGroup = document.getElementById('editEntrySourceGroup');
            const editEntrySource = document.getElementById('editEntrySource');
            if (editEntrySourceGroup) editEntrySourceGroup.style.display = 'block';
            if (editEntrySource) editEntrySource.value = entry.source || '';

            const editCustomMetadataEntries = document.getElementById('editCustomMetadataEntries');
            const editCustomMetadataGroup = document.getElementById('editCustomMetadataGroup');
            if (editCustomMetadataEntries) editCustomMetadataEntries.innerHTML = ''; // Clear previous entries
            if (entry.metadata && entry.metadata.length > 0) {
                entry.metadata.forEach(meta => addMetadataField('edit', meta.key, meta.value));
            }
            if (editCustomMetadataGroup) editCustomMetadataGroup.style.display = 'block';


            let fieldsToShow = [];
            // Centralized function to set field values safely
            const setFieldValue = (id, value) => {
                const element = document.getElementById(id);
                if (element) element.value = value || '';
            };
            const setRequired = (id, isRequired) => {
                const element = document.getElementById(id);
                if (element) {
                    if (isRequired) element.setAttribute('required', 'required');
                    else element.removeAttribute('required');
                }
            };


            switch (entry.type) {
                case 'tool':
                    fieldsToShow = ['editToolFields'];
                    setFieldValue('editToolName', entry.name);
                    setFieldValue('editToolUrl', entry.url);
                    setFieldValue('editToolCategory', entry.category);
                    setFieldValue('editToolDescription', entry.description);
                    setFieldValue('editToolTags', entry.tags ? entry.tags.join(', ') : '');
                    setFieldValue('editToolInvestigationNotes', entry.notes);

                    const editVaultCategorySearchInput = document.getElementById('editIntelligenceVaultCategorySearch');
                    if (editVaultCategorySearchInput) {
                        editVaultCategorySearchInput.value = '';
                    }
                    populateIntelligenceVaultCategoriesCheckboxesEditTool(entry.intelligenceVaultCategories || [], '');

                    const editNewCategoryInput = document.getElementById('editNewCategoryInput');
                    const editToolCategorySelect = document.getElementById('editToolCategory');
                    if (editToolCategorySelect && !editToolCategorySelect.querySelector(`option[value="${entry.category}"]`)) {
                        editToolCategorySelect.value = 'custom';
                        if (editNewCategoryInput) {
                            editNewCategoryInput.style.display = 'block';
                            editNewCategoryInput.value = entry.category;
                        }
                    } else if (editNewCategoryInput) {
                        editNewCategoryInput.style.display = 'none';
                        editNewCategoryInput.value = '';
                    }

                    setRequired('editToolName', true);
                    setRequired('editToolUrl', true);
                    setRequired('editToolCategory', true);
                    if (editNewCategoryInput && editNewCategoryInput.style.display === 'block') {
                        setRequired('editNewCategoryInput', true);
                    }
                    break;
                case 'email':
                    fieldsToShow = ['editEmailFields'];
                    setFieldValue('editEmailAddress', entry.email);
                    setFieldValue('editEmailLinkedPlatforms', entry.linkedPlatforms ? entry.linkedPlatforms.join(', ') : '');
                    setFieldValue('editEmailBreachResults', entry.breachResults);
                    setFieldValue('editEmailDescription', entry.description);
                    setFieldValue('editEmailNotes', entry.notes);
                    setRequired('editEmailAddress', true);
                    break;
                case 'phone':
                    fieldsToShow = ['editPhoneFields'];
                    setFieldValue('editPhoneNumber', entry.number);
                    setFieldValue('editPhoneType', entry.phoneType);
                    setFieldValue('editPhoneLocation', entry.location);
                    setFieldValue('editPhoneDescription', entry.description);
                    setFieldValue('editPhoneNotes', entry.notes);
                    setRequired('editPhoneNumber', true);
                    break;
                case 'crypto':
                    fieldsToShow = ['editCryptoFields'];
                    setFieldValue('editCryptoAddress', entry.address);
                    setFieldValue('editCryptoTxid', entry.txid);
                    setFieldValue('editCryptoAmount', entry.amount);
                    setFieldValue('editCryptoSource', entry.source);
                    setFieldValue('editCryptoTags', entry.tags ? entry.tags.join(', ') : '');
                    setFieldValue('editCryptoDescription', entry.description);
                    setFieldValue('editCryptoNotes', entry.notes);
                    setRequired('editCryptoAddress', true);
                    setRequired('editCryptoTxid', true);
                    setRequired('editCryptoAmount', true);
                    break;
                case 'location':
                    fieldsToShow = ['editLocationFields'];
                    setFieldValue('editLocationName', entry.name);
                    setFieldValue('editLocationCoordinates', entry.coordinates);
                    setFieldValue('editLocationMapLink', entry.mapLink);
                    setFieldValue('editLocationIpGeoIntel', entry.ipGeoIntel);
                    setFieldValue('editLocationDescription', entry.description);
                    setFieldValue('editLocationNotes', entry.notes);
                    setRequired('editLocationName', true);
                    setRequired('editLocationCoordinates', true);
                    break;
                case 'link':
                    fieldsToShow = ['editLinkFields'];
                    setFieldValue('editLinkUrl', entry.url);
                    setFieldValue('editLinkPlatform', entry.platform);
                    setFieldValue('editLinkTags', entry.tags ? entry.tags.join(', ') : '');
                    setFieldValue('editLinkDescription', entry.description);
                    setFieldValue('editLinkNotes', entry.notes);
                    setRequired('editLinkUrl', true);
                    break;
                case 'media':
                    fieldsToShow = ['editMediaFields'];
                    setFieldValue('editMediaTitle', entry.title);
                    setFieldValue('editMediaType', entry.mediaType);
                    setFieldValue('editMediaBase64Data', entry.base64Data);
                    setFieldValue('editMediaDescription', entry.description);
                    setFieldValue('editMediaNotes', entry.notes);
                    setRequired('editMediaTitle', true);
                    break;
                case 'password':
                    fieldsToShow = ['editPasswordFields'];
                    setFieldValue('editPasswordService', entry.service);
                    setFieldValue('editPasswordUsername', entry.username);
                    setFieldValue('editPasswordValue', entry.password);
                    setFieldValue('editPasswordStrength', entry.strength);
                    setFieldValue('editPasswordDescription', entry.description);
                    setFieldValue('editPasswordNotes', entry.notes);
                    setRequired('editPasswordService', true);
                    setRequired('editPasswordValue', true);
                    break;
                case 'keyword':
                    fieldsToShow = ['editKeywordFields'];
                    setFieldValue('editKeywordValue', entry.value);
                    setFieldValue('editKeywordContext', entry.context);
                    setFieldValue('editKeywordDescription', entry.description);
                    setFieldValue('editKeywordNotes', entry.notes);
                    setRequired('editKeywordValue', true);
                    break;
                case 'social':
                    fieldsToShow = ['editSocialFields'];
                    setFieldValue('editSocialPlatform', entry.platform);
                    setFieldValue('editSocialUrl', entry.url);
                    setFieldValue('editSocialUsername', entry.username);
                    setFieldValue('editSocialFollowCounts', entry.followCounts);
                    setFieldValue('editSocialDescription', entry.description);
                    setFieldValue('editSocialNotes', entry.notes);
                    setRequired('editSocialPlatform', true);
                    setRequired('editSocialUrl', true);
                    setRequired('editSocialUsername', true);
                    break;
                case 'domain':
                    fieldsToShow = ['editDomainFields'];
                    setFieldValue('editDomainValue', entry.value);
                    setFieldValue('editDomainType', entry.domainType);
                    setFieldValue('editDomainRegistrar', entry.registrar);
                    setFieldValue('editDomainLocation', entry.location);
                    setFieldValue('editDomainStatus', entry.status);
                    setFieldValue('editDomainWhois', entry.whois);
                    setFieldValue('editDomainDns', entry.dns);
                    setFieldValue('editDomainTags', entry.tags ? entry.tags.join(', ') : '');
                    setFieldValue('editDomainDescription', entry.description);
                    setFieldValue('editDomainNotes', entry.notes);
                    setRequired('editDomainValue', true);
                    setRequired('editDomainType', true);
                    break;
                case 'username':
                    fieldsToShow = ['editUsernameFields'];
                    setFieldValue('editUsernameValue', entry.value);
                    setFieldValue('editUsernamePlatforms', entry.platformsFound);
                    setFieldValue('editUsernameEmails', entry.emails);
                    setFieldValue('editUsernameRealName', entry.realName);
                    setFieldValue('editUsernameActivity', entry.activity);
                    setFieldValue('editUsernameDescription', entry.description);
                    setFieldValue('editUsernameNotes', entry.notes);
                    setRequired('editUsernameValue', true);
                    break;
                case 'threat':
                    fieldsToShow = ['editThreatFields'];
                    setFieldValue('editThreatType', entry.threatType);
                    setFieldValue('editThreatName', entry.name);
                    setFieldValue('editThreatSeverity', entry.severity);
                    setFieldValue('editThreatIocs', entry.iocs);
                    setFieldValue('editThreatTargets', entry.targets);
                    setFieldValue('editThreatAttribution', entry.attribution);
                    setFieldValue('editThreatDescription', entry.description);
                    setFieldValue('editThreatSource', entry.source);
                    setFieldValue('editThreatNotes', entry.notes);
                    setRequired('editThreatName', true);
                    setRequired('editThreatType', true);
                    break;
                case 'vulnerability':
                    fieldsToShow = ['editVulnerabilityFields'];
                    setFieldValue('editVulnCve', entry.cve);
                    setFieldValue('editVulnCvss', entry.cvss);
                    setFieldValue('editVulnSoftware', entry.software);
                    setFieldValue('editVulnType', entry.vulnType);
                    setFieldValue('editVulnExploit', entry.exploit);
                    setFieldValue('editVulnDescription', entry.description);
                    setFieldValue('editVulnMitigation', entry.mitigation);
                    setFieldValue('editVulnNotes', entry.notes);
                    setRequired('editVulnCve', true);
                    break;
                case 'malware':
                    fieldsToShow = ['editMalwareFields'];
                    setFieldValue('editMalwareFilename', entry.filename);
                    setFieldValue('editMalwareHash', entry.hash);
                    setFieldValue('editMalwareType', entry.fileType);
                    setFieldValue('editMalwareFamily', entry.family);
                    setFieldValue('editMalwareDetection', entry.detection);
                    setFieldValue('editMalwareBehavior', entry.behavior);
                    setFieldValue('editMalwareSource', entry.malwareSource);
                    setFieldValue('editMalwareTools', entry.tools);
                    setFieldValue('editMalwareNotes', entry.notes);
                    setRequired('editMalwareFilename', true);
                    break;
                case 'breach':
                    fieldsToShow = ['editBreachFields'];
                    setFieldValue('editBreachCompany', entry.company);
                    setFieldValue('editBreachDate', entry.date);
                    setFieldValue('editBreachRecords', entry.records);
                    setFieldValue('editBreachDataTypes', entry.dataTypes);
                    setFieldValue('editBreachVector', entry.vector);
                    setFieldValue('editBreachStatus', entry.status);
                    setFieldValue('editBreachSource', entry.source);
                    setFieldValue('editBreachDescription', entry.description);
                    setFieldValue('editBreachNotes', entry.notes);
                    setRequired('editBreachCompany', true);
                    break;
                case 'credential':
                    fieldsToShow = ['editCredentialFields'];
                    setFieldValue('editCredentialType', entry.credentialType);
                    setFieldValue('editCredentialValue', entry.credentialValue);
                    setFieldValue('editCredentialService', entry.credentialService);
                    setFieldValue('editCredentialBreachSource', entry.breachSource);
                    setFieldValue('editCredentialDateFound', entry.dateFound);
                    setFieldValue('editCredentialDescription', entry.description);
                    setFieldValue('editCredentialNotes', entry.notes);
                    setRequired('editCredentialValue', true);
                    break;
                case 'forum':
                    fieldsToShow = ['editForumFields'];
                    setFieldValue('editForumName', entry.forumName);
                    setFieldValue('editForumUrl', entry.forumUrl);
                    setFieldValue('editForumType', entry.forumType);
                    setFieldValue('editForumStatus', entry.forumStatus);
                    setFieldValue('editForumLanguage', entry.forumLanguage);
                    setFieldValue('editForumDescription', entry.description);
                    setFieldValue('editForumNotes', entry.notes);
                    setRequired('editForumName', true);
                    setRequired('editForumUrl', true);
                    break;
                case 'vendor':
                    fieldsToShow = ['editVendorFields'];
                    setFieldValue('editVendorAlias', entry.vendorAlias);
                    setFieldValue('editVendorPlatforms', entry.vendorPlatforms);
                    setFieldValue('editVendorProducts', entry.vendorProducts);
                    setFieldValue('editVendorReputation', entry.vendorReputation);
                    setFieldValue('editVendorDescription', entry.description);
                    setFieldValue('editVendorNotes', entry.notes);
                    setRequired('editVendorAlias', true);
                    break;
                case 'telegram':
                    fieldsToShow = ['editTelegramFields'];
                    setFieldValue('editTelegramName', entry.name);
                    setFieldValue('editTelegramUrl', entry.url);
                    setFieldValue('editTelegramType', entry.telegramType);
                    setFieldValue('editTelegramSubscribers', entry.subscribers);
                    setFieldValue('editTelegramLanguage', entry.language);
                    setFieldValue('editTelegramActivity', entry.activity);
                    setFieldValue('editTelegramContent', entry.content);
                    setFieldValue('editTelegramAdmin', entry.admin);
                    setFieldValue('editTelegramTags', entry.tags ? entry.tags.join(', ') : '');
                    setFieldValue('editTelegramNotes', entry.notes);
                    setRequired('editTelegramName', true);
                    setRequired('editTelegramUrl', true);
                    break;
                case 'paste':
                    fieldsToShow = ['editPasteFields'];
                    setFieldValue('editPasteUrl', entry.url);
                    setFieldValue('editPasteSourceSite', entry.sourceSite);
                    setFieldValue('editPasteContentSummary', entry.contentSummary);
                    setFieldValue('editPasteKeywords', entry.keywords);
                    setFieldValue('editPasteDescription', entry.description);
                    setFieldValue('editPasteNotes', entry.notes);
                    setRequired('editPasteUrl', true);
                    break;
                case 'document':
                    fieldsToShow = ['editDocumentFields'];
                    setFieldValue('editDocumentTitle', entry.title);
                    setFieldValue('editDocumentFileType', entry.fileType);
                    setFieldValue('editDocumentHash', entry.hash);
                    setFieldValue('editDocumentContentSummary', entry.contentSummary);
                    setFieldValue('editDocumentSource', entry.source);
                    setFieldValue('editDocumentDescription', entry.description);
                    setFieldValue('editDocumentNotes', entry.notes);
                    setRequired('editDocumentTitle', true);
                    setRequired('editDocumentHash', true);
                    break;
                case 'network':
                    fieldsToShow = ['editNetworkFields'];
                    setFieldValue('editNetworkSubject', entry.subject);
                    setFieldValue('editNetworkType', entry.networkType);
                    setFieldValue('editNetworkFindings', entry.findings);
                    setFieldValue('editNetworkAssociated', entry.associatedIpsDomains);
                    setFieldValue('editNetworkTools', entry.toolsUsed);
                    setFieldValue('editNetworkDescription', entry.description);
                    setFieldValue('editNetworkNotes', entry.notes);
                    setRequired('editNetworkSubject', true);
                    break;
                case 'metadata':
                    fieldsToShow = ['editMetadataEntryFields'];
                    setFieldValue('editMetadataTitle', entry.title);
                    setFieldValue('editMetadataDescription', entry.description);
                    setFieldValue('editMetadataFileSource', entry.fileSource);
                    setFieldValue('editMetadataNotes', entry.notes);
                    setRequired('editMetadataTitle', true);
                    break;
                case 'archive':
                    fieldsToShow = ['editArchiveFields'];
                    setFieldValue('editArchiveOriginalUrl', entry.originalUrl);
                    setFieldValue('editArchiveUrl', entry.url);
                    setFieldValue('editArchiveService', entry.service);
                    setFieldValue('editArchiveTimestamp', entry.timestamp ? new Date(entry.timestamp).toISOString().slice(0, 16) : '');
                    setFieldValue('editArchiveContentSummary', entry.contentSummary);
                    setFieldValue('editArchiveDescription', entry.description);
                    setFieldValue('editArchiveNotes', entry.notes);
                    setRequired('editArchiveOriginalUrl', true);
                    setRequired('editArchiveUrl', true);
                    break;
                case 'messaging':
                    fieldsToShow = ['editMessagingFields'];
                    setFieldValue('editMessagingApp', entry.messagingApp);
                    setFieldValue('editMessagingUsername', entry.username);
                    setFieldValue('editMessagingChatId', entry.chatId);
                    setFieldValue('editMessagingContent', entry.content);
                    setFieldValue('editMessagingDescription', entry.description);
                    setFieldValue('editMessagingNotes', entry.notes);
                    setRequired('editMessagingUsername', true);
                    setRequired('editMessagingApp', true);
                    break;
                case 'dating':
                    fieldsToShow = ['editDatingFields'];
                    setFieldValue('editDatingPlatform', entry.platform);
                    setFieldValue('editDatingUsername', entry.username);
                    setFieldValue('editDatingDisplayName', entry.displayName);
                    setFieldValue('editDatingAge', entry.age);
                    setFieldValue('editDatingLocation', entry.location);
                    setFieldValue('editDatingPhotos', entry.photos);
                    setFieldValue('editDatingBio', entry.bio);
                    setFieldValue('editDatingVerified', entry.verified);
                    setFieldValue('editDatingSuspicious', entry.suspicious);
                    setFieldValue('editDatingNotes', entry.notes);
                    setRequired('editDatingPlatform', true);
                    setRequired('editDatingUsername', true);
                    break;
                case 'audio':
                    fieldsToShow = ['editAudioFields'];
                    setFieldValue('editAudioTitle', entry.title);
                    setFieldValue('editAudioFormat', entry.format);
                    setFieldValue('editAudioDuration', entry.duration);
                    setFieldValue('editAudioQuality', entry.quality);
                    setFieldValue('editAudioLanguage', entry.language);
                    setFieldValue('editAudioTranscript', entry.transcript);
                    setFieldValue('editAudioSpeakers', entry.speakers);
                    setFieldValue('editAudioBackground', entry.background);
                    setFieldValue('editAudioTools', entry.tools);
                    setFieldValue('editAudioDescription', entry.description);
                    setFieldValue('editAudioNotes', entry.notes);
                    setRequired('editAudioTitle', true);
                    setRequired('editAudioFormat', true);
                    break;
                case 'facial':
                    fieldsToShow = ['editFacialFields'];
                    setFieldValue('editFacialSubject', entry.subject);
                    setFieldValue('editFacialSourceDescription', entry.sourceDescription);
                    setFieldValue('editFacialIdentifiedProfiles', entry.identifiedProfiles);
                    setFieldValue('editFacialConfidence', entry.confidence);
                    setFieldValue('editFacialToolsUsed', entry.toolsUsed);
                    setFieldValue('editFacialDescription', entry.description);
                    setFieldValue('editFacialNotes', entry.notes);
                    setRequired('editFacialSubject', true);
                    break;
                case 'persona':
                    fieldsToShow = ['editPersonaFields'];
                    setFieldValue('editPersonaName', entry.name);
                    setFieldValue('editPersonaRealName', entry.realName);
                    setFieldValue('editPersonaAssociatedAccounts', entry.associatedAccounts);
                    setFieldValue('editPersonaBio', entry.bio);
                    setFieldValue('editPersonaPlatforms', entry.platformsUsed);
                    setFieldValue('editPersonaOrigin', entry.origin);
                    setFieldValue('editPersonaNotes', entry.notes);
                    setRequired('editPersonaName', true);
                    break;
                case 'vpn':
                    fieldsToShow = ['editVpnFields'];
                    setFieldValue('editVpnName', entry.name);
                    setFieldValue('editVpnType', entry.vpnType);
                    setFieldValue('editVpnJurisdiction', entry.jurisdiction);
                    setFieldValue('editVpnLogs', entry.logs);
                    setFieldValue('editVpnPayment', entry.payment);
                    setFieldValue('editVpnLocations', entry.locations);
                    setFieldValue('editVpnIssues', entry.issues);
                    setFieldValue('editVpnUseCase', entry.useCase);
                    setFieldValue('editVpnDescription', entry.description);
                    setFieldValue('editVpnNotes', entry.notes);
                    setRequired('editVpnName', true);
                    break;
                case 'honeypot':
                    fieldsToShow = ['editHoneypotFields'];
                    setFieldValue('editHoneypotType', entry.honeypotType);
                    setFieldValue('editHoneypotLocation', entry.location);
                    setFieldValue('editHoneypotPurpose', entry.purpose);
                    setFieldValue('editHoneypotDataSummary', entry.dataSummary);
                    setFieldValue('editHoneypotAlerts', entry.alerts);
                    setFieldValue('editHoneypotDescription', entry.description);
                    setFieldValue('editHoneypotNotes', entry.notes);
                    setRequired('editHoneypotType', true);
                    break;
                case 'exploit':
                    fieldsToShow = ['editExploitFields'];
                    setFieldValue('editExploitName', entry.name);
                    setFieldValue('editExploitTargetVuln', entry.targetVuln);
                    setFieldValue('editExploitType', entry.exploitType);
                    setFieldValue('editExploitMarketSource', entry.marketSource);
                    setFieldValue('editExploitPrice', entry.price);
                    setFieldValue('editExploitDescription', entry.description);
                    setFieldValue('editExploitNotes', entry.notes);
                    setRequired('editExploitName', true);
                    break;
                case 'publicrecord':
                    fieldsToShow = ['editPublicRecordFields'];
                    setFieldValue('editPublicRecordType', entry.recordType);
                    setFieldValue('editPublicRecordSubjectName', entry.subjectName);
                    setFieldValue('editPublicRecordRefId', entry.refId);
                    setFieldValue('editPublicRecordJurisdiction', entry.jurisdiction);
                    setFieldValue('editPublicRecordDate', entry.date);
                    setFieldValue('editPublicRecordSummary', entry.summary);
                    setFieldValue('editPublicRecordSourceUrl', entry.sourceUrl);
                    setFieldValue('editPublicRecordDescription', entry.description);
                    setFieldValue('editPublicRecordNotes', entry.notes);
                    setRequired('editPublicRecordSubjectName', true);
                    setRequired('editPublicRecordType', true);
                    break;
            }

            fieldsToShow.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.style.display = 'block';
                }
            });

            // Populate custom tab assignment checkboxes
            populateCustomTabAssignmentCheckboxes(entry.customTabs || []);

            showModal('editEntryModal');
        }

        function populateIntelligenceVaultCategoriesCheckboxesEditTool(assignedCategories) {
            const container = document.getElementById('intelligenceVaultCategoriesAssignmentAddTool');
            container.style.display = 'block'; // Ensure it's visible in the edit modal

            const checkboxesContainer = document.getElementById('intelligenceVaultCategoriesCheckboxesEditTool');
            checkboxesContainer.innerHTML = ''; // Clear previous checkboxes

            const intelligenceVaultCategories = [
                { id: 'tools', name: 'General Tools', icon: 'fas fa-tools' },
                { id: 'emailTools', name: 'Email Tools', icon: 'fas fa-envelope' },
                { id: 'phoneTools', name: 'Phone Tools', icon: 'fas fa-phone' },
                { id: 'cryptoTools', name: 'Crypto Tools', icon: 'fas fa-coins' },
                { id: 'locationTools', name: 'Location Tools', icon: 'fas fa-map-marker-alt' },
                { id: 'linkTools', name: 'Link Tools', icon: 'fas fa-link' },
                { id: 'mediaTools', name: 'Media Tools', icon: 'fas fa-camera' },
                { id: 'passwordTools', name: 'Password Tools', icon: 'fas fa-key' },
                { id: 'keywordTools', name: 'Keyword Tools', icon: 'fas fa-font' },
                { id: 'socialTools', name: 'Social Tools', icon: 'fas fa-users' },
                { id: 'darkWebTools', name: 'DarkWeb Tools', icon: 'fas fa-mask' },
                { id: 'vulnerabilityTools', name: 'Vulnerability Tools', icon: 'fas fa-bug' },
                { id: 'fileMalwareTools', name: 'File/Malware Tools', icon: 'fas fa-file-code' },
                { id: 'threatIntelligenceTools', name: 'Threat Intelligence Tools', icon: 'fas fa-shield-alt' },
                { id: 'aiTools', name: 'AI Tools', icon: 'fas fa-brain' }
            ];

            intelligenceVaultCategories.forEach(category => {
                const isChecked = assignedCategories.includes(category.id);
                const checkboxContainer = document.createElement('label');
                checkboxContainer.classList.add('custom-tab-checkbox');
                if (isChecked) checkboxContainer.classList.add('checked');

                checkboxContainer.innerHTML = `
                    <input 
                        type="checkbox" 
                        class="intelligence-vault-category-checkbox-edit-tool" 
                        value="${category.id}" 
                        ${isChecked ? 'checked' : ''}
                    >
                    <i class="${category.icon}" style="margin-right: 5px;"></i>
                    <span>${category.name}</span>
                `;
                checkboxesContainer.appendChild(checkboxContainer);
            });

            // Avoid attaching multiple listeners
            checkboxesContainer.addEventListener('change', (e) => {
                if (e.target.classList.contains('intelligence-vault-category-checkbox-edit-tool')) {
                    const checkbox = e.target;
                    const label = checkbox.closest('.custom-tab-checkbox');
                    if (label) {
                        label.classList.toggle('checked', checkbox.checked);
                    }
                }
            }, 
        ); // Ensures this listener is attached only once
        }


        // Add a new metadata field row to the form
        function addMetadataField(formType, key = '', value = '') {
            const containerId = formType === 'add' ? 'customMetadataEntries' : 'editCustomMetadataEntries';
            const container = document.getElementById(containerId);
            const newRow = document.createElement('div');
            newRow.classList.add('form-group', 'metadata-entry');
            newRow.innerHTML = `
                <input type="text" class="metadata-key" name="${formType}_metadata_key_${Date.now()}" placeholder="Key" value="${key}" required>
                <input type="text" class="metadata-value" name="${formType}_metadata_value_${Date.now()}" placeholder="Value" value="${value}" required>
                <button type="button" class="remove-metadata-btn"><i class="fas fa-times"></i></button>
            `;
            container.appendChild(newRow);
        }


        // Generate a unique ID
        function generateId() {
            return '_' + Math.random().toString(36).substr(2, 9);
        }

        // Show toast notifications - MODIFIED TO STACK
        function showToast(message, type = 'success', duration = 3000) {
            let toastContainer = document.getElementById('toast-container');
            if (!toastContainer) {
                toastContainer = document.createElement('div');
                toastContainer.id = 'toast-container';
                document.body.appendChild(toastContainer);
            }

            const toast = document.createElement('div');
            toast.classList.add('toast', type);
            toast.textContent = message;

            // Append to the container instead of body directly
            toastContainer.appendChild(toast);

            // Trigger reflow to ensure animation plays
            void toast.offsetWidth;

            toast.classList.add('show');

            setTimeout(() => {
                toast.classList.remove('show');
                // Remove toast from DOM after its exit animation
                toast.addEventListener('transitionend', () => toast.remove(), { once: true });
            }, duration);
        }

        // Clear all filters
        function clearFilters() {
            if (appState.readOnlyMode) { // New: Prevent actions in read-only mode
                showToast("Cannot clear filters in read-only shared view.", "warning");
                return;
            }
            appState.filters.category = '';
            appState.filters.search = '';
            appState.filters.sort = 'name';
            document.getElementById('categoryFilter').value = '';
            document.getElementById('searchInput').value = '';
            document.getElementById('sortFilter').value = 'name';
            renderIntelligenceEntries();
            showToast('Filters cleared!');
        }

        // Generate a report (mock function)
        function generateReport() {
            if (appState.readOnlyMode) { // New: Prevent actions in read-only mode
                showToast("Cannot generate reports in read-only shared view.", "warning");
                return;
            }
            showToast('Generating report... (Feature in development)', 'info');
            // In a real application, this would trigger a backend process or generate a downloadable file
        }

        // exportData function to include all data types and offer format choice
        function exportData() {
            if (appState.readOnlyMode) {
                showToast("Cannot export data in read-only shared view.", "warning");
                return;
            }

            // Show a modal with export options (JSON, HTML, TXT)
            const exportOptionsModal = document.createElement('div');
            exportOptionsModal.id = 'exportOptionsModal';
            exportOptionsModal.classList.add('modal');
            exportOptionsModal.innerHTML = `
                <div class="modal-content">
                    <button type="button" class="close-modal-btn" onclick="hideModal('exportOptionsModal')">&times;</button>
                    <h3 style="margin-bottom: 20px; color: var(--primary);"><i class="fas fa-download"></i> Export All Your Data</h3>
                    <p style="margin-bottom: 15px; color: var(--text-primary);">
                        Choose the format to export all your OSINTVault data (tools, custom vaults, dorks, notes, case studies).
                    </p>
                    <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
                        <button type="button" class="btn btn-primary" id="exportJsonBtn">
                            <i class="fas fa-file-code"></i> Export as JSON
                        </button>
                        <button type="button" class="btn btn-secondary" id="exportHtmlBtn">
                            <i class="fas fa-file-alt"></i> Export as HTML
                        </button>
                        <button type="button" class="btn btn-secondary" id="exportTxtBtn">
                            <i class="fas fa-file-alt"></i> Export as TXT
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(exportOptionsModal);
            showModal('exportOptionsModal');

            document.getElementById('exportJsonBtn').onclick = () => {
                performExport('json');
                hideModal('exportOptionsModal');
                exportOptionsModal.remove();
            };
            document.getElementById('exportHtmlBtn').onclick = () => {
                performExport('html');
                hideModal('exportOptionsModal');
                exportOptionsModal.remove();
            };
            document.getElementById('exportTxtBtn').onclick = () => {
                performExport('txt');
                hideModal('exportOptionsModal');
                exportOptionsModal.remove();
            };
        }

        // --- performExport function (modify this in app.js) ---
        function performExport(format, dataToExport) { // Now accepts dataToExport as argument
            if (!dataToExport) { // Fallback if dataToExport is not explicitly provided (e.g., from old calls)
                dataToExport = JSON.parse(JSON.stringify(appState));
            }

            if (dataToExport.tools) {
                dataToExport.tools.forEach(tool => {
                    if (tool.addedDate && typeof tool.addedDate.toISOString === 'function') {
                        tool.addedDate = tool.addedDate.toISOString();
                    }
                });
            }
            if (dataToExport.notesState && dataToExport.notesState.notes) {
                dataToExport.notesState.notes.forEach(note => {
                    if (note.createdAt && typeof note.createdAt.toISOString === 'function') {
                        note.createdAt = note.createdAt.toISOString();
                    }
                    if (note.updatedAt && typeof note.updatedAt.toISOString === 'function') {
                        note.updatedAt = note.updatedAt.toISOString();
                    }
                });
            }
            if (dataToExport.dorkAssistantState && dataToExport.dorkAssistantState.savedQueries) {
                dataToExport.dorkAssistantState.savedQueries.forEach(query => {
                    if (query.createdAt && typeof query.createdAt.toISOString === 'function') {
                        query.createdAt = query.createdAt.toISOString();
                    }
                });
            }

            if (dataToExport.archives) {
                dataToExport.archives.forEach(entry => {
                    if (entry.timestamp) {
                        entry.timestamp = new Date(entry.timestamp).toISOString();
                    }
                });
            }


            let fileContent;
            let fileName = `osintvault_export_${new Date().toISOString().slice(0, 10)}`;
            let fileType;

            switch (format) {
                case 'json':
                    fileContent = JSON.stringify(dataToExport, null, 2);
                    fileName += '.json';
                    fileType = 'application/json';
                    break;
                case 'html':
                    fileContent = generateHtmlExport(dataToExport);
                    fileName += '.html';
                    fileType = 'text/html';
                    break;
                case 'txt':
                    fileContent = generateTxtExport(dataToExport);
                    fileName += '.txt';
                    fileType = 'text/plain';
                    break;
                default:
                    showToast('Unsupported export format.', 'error');
                    return;
            }

            const blob = new Blob([fileContent], { type: fileType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast(`Data exported as ${format.toUpperCase()} successfully!`, 'success');
            logActivity('exported', 'system', `Exported all data as ${format.toUpperCase()}`, { format: format, fileName: fileName });
        }

        function generateHtmlExport(data) {
            let html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>OSINTVault Data Export</title>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
                <style>
                    body { font-family: sans-serif; line-height: 1.6; color: #333; margin: 20px; background-color: #f4f4f4; }
                    .container { max-width: 900px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                    h1, h2, h3, h4 { color: #0056b3; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 20px; }
                    .section { margin-bottom: 30px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9; }
                    .item { margin-bottom: 15px; padding: 10px; border: 1px solid #eee; border-radius: 5px; background-color: #fff; }
                    .item strong { color: #007bff; }
                    .item p { margin: 5px 0; }
                    .tags span { background-color: #e0e0e0; padding: 3px 8px; border-radius: 12px; font-size: 0.8em; margin-right: 5px; display: inline-block; }
                    .notes, .description { font-style: italic; color: #555; }
                    .code-block { background-color: #e8e8e8; padding: 10px; border-radius: 5px; overflow-x: auto; margin-top: 10px; }
                    pre { margin: 0; white-space: pre-wrap; word-break: break-all; }
                    ul { list-style: disc; margin-left: 20px; }
                    ol { list-style: decimal; margin-left: 20px; }
                    .entry-card { border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
                    .entry-card h4 { margin: 0 0 5px 0; color: #333; }
                    .entry-card p { margin: 0 0 5px 0; font-size: 0.9em; }
                    .entry-card a { color: #007bff; text-decoration: none; }
                    .entry-card .tags span { background-color: #e9ecef; color: #495057; padding: 2px 6px; border-radius: 3px; font-size: 0.75em; margin-right: 5px; }
                    .metadata-item { margin-left: 15px; font-size: 0.9em; }
                    .image-preview, .audio-preview { max-width: 100%; height: auto; margin-top: 10px; border-radius: 4px; }
                    
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>OSINTVault Data Export - ${new Date().toLocaleString()}</h1>
                    <p>This document contains all your exported OSINTVault data. It is a snapshot of your local browser storage at the time of export.</p>
            `;

            // Function to safely get a property, returning empty string if undefined
            const safeGet = (obj, prop) => obj && obj[prop] !== undefined ? obj[prop] : '';

            // Helper to format tags
            const formatTags = (tags) => tags && tags.length > 0 ? `<div class="tags">${tags.map(tag => `<span>${tag}</span>`).join('')}</div>` : '';

            // Helper to format metadata
            const formatMetadata = (metadata) => {
                if (!metadata || metadata.length === 0) return '';
                return `
                    <h4>Metadata:</h4>
                    <div style="font-size: 0.9em; margin-top: 5px;">
                        ${metadata.map(m => `<p class="metadata-item"><strong>${safeGet(m, 'key')}</strong>: ${safeGet(m, 'value')}</p>`).join('')}
                    </div>
                `;
            };

            // --- Intelligence Vault (Tools) ---
            if (data.tools && data.tools.length > 0) {
                html += `
                    <div class="section">
                        <h2>Intelligence Vault (Tools)</h2>
                        ${data.tools.map(item => `
                            <div class="item">
                                <h3>${safeGet(item, 'name')} (${safeGet(item, 'type')})</h3>
                                <p><strong>URL:</strong> <a href="${safeGet(item, 'url')}" target="_blank">${safeGet(item, 'url')}</a></p>
                                <p><strong>Category:</strong> ${safeGet(item, 'category')}</p>
                                <p class="description"><strong>Description:</strong> ${safeGet(item, 'description')}</p>
                                <p class="notes"><strong>Notes:</strong> ${safeGet(item, 'notes')}</p>
                                <p><strong>Added:</strong> ${new Date(safeGet(item, 'addedDate')).toLocaleString()}</p>
                                <p><strong>Last Used:</strong> ${item.lastUsed ? new Date(item.lastUsed).toLocaleString() : 'Never'}</p>
                                ${formatTags(item.tags)}
                                ${formatMetadata(item.metadata)}
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            // --- Custom Vaults ---
            if (data.customTabs && data.customTabs.length > 0) {
                html += `<div class="section"><h2>Custom Vaults</h2>`;
                data.customTabs.forEach(vault => {
                    html += `<h3>Vault: ${safeGet(vault, 'name')} <i class="${safeGet(vault, 'icon')}" style="color:${safeGet(vault, 'color')};"></i></h3>`;
                    html += `<div style="margin-left: 20px;">`;

                    // Collect all entries belonging to this custom vault
                    const vaultEntries = Object.keys(data).filter(key => Array.isArray(data[key]) && key !== 'customTabs' && key !== 'tools' && key !== 'dorkAssistantState' && key !== 'notesState').flatMap(key => {
                        return data[key].filter(entry => (safeGet(entry, 'customTabs') || []).includes(vault.id));
                    });

                    // Re-include tools that are specifically part of this custom vault and were not caught by the flatMap
                    if (data.tools) {
                        const toolsInVault = data.tools.filter(tool => (safeGet(tool, 'customTabs') || []).includes(vault.id));
                        vaultEntries.push(...toolsInVault);
                    }

                    if (vaultEntries.length > 0) {
                        html += `<h4>Entries in this Vault:</h4>`;
                        html += `<ul>`;
                        vaultEntries.forEach(entry => {
                            html += `<li class="entry-card">`;
                            html += `<h4>${safeGet(entry, 'name') || safeGet(entry, 'title') || safeGet(entry, 'value') || safeGet(entry, 'email') || 'Untitled Entry'} (${safeGet(entry, 'type')})</h4>`;
                            if (safeGet(entry, 'url')) html += `<p><strong>URL:</strong> <a href="${safeGet(entry, 'url')}" target="_blank">${safeGet(entry, 'url')}</a></p>`;
                            if (safeGet(entry, 'description')) html += `<p class="description"><strong>Description:</strong> ${safeGet(entry, 'description')}</p>`;
                            if (safeGet(entry, 'notes')) html += `<p class="notes"><strong>Notes:</strong> ${safeGet(entry, 'notes')}</p>`;
                            if (safeGet(entry, 'addedDate')) html += `<p><strong>Added:</strong> ${new Date(safeGet(entry, 'addedDate')).toLocaleString()}</p>`;
                            if (safeGet(entry, 'lastUsed')) html += `<p><strong>Last Used:</strong> ${new Date(safeGet(entry, 'lastUsed')).toLocaleString()}</p>`;
                            if (safeGet(entry, 'tags')) html += formatTags(safeGet(entry, 'tags'));
                            html += formatMetadata(safeGet(entry, 'metadata'));
                            if (safeGet(entry, 'base64Data') && entry.type === 'media') html += `<img src="${safeGet(entry, 'base64Data')}" alt="Media Preview" class="image-preview">`;
                            if (safeGet(entry, 'base64Data') && entry.type === 'audio') html += `<audio controls class="audio-preview"><source src="${safeGet(entry, 'base64Data')}" type="audio/${safeGet(entry, 'format')}"></audio>`;
                            html += `</li>`;
                        });
                        html += `</ul>`;
                    } else {
                        html += `<p>No entries assigned to this custom vault.</p>`;
                    }
                    html += `</div>`;
                });
                html += `</div>`;
            }

            // --- OSINT Handbook & Notes ---
            if (data.notesState && data.notesState.notes && data.notesState.notes.length > 0) {
                html += `
                    <div class="section">
                        <h2>My Notes</h2>
                        ${data.notesState.notes.map(note => `
                            <div class="item">
                                <h3>${safeGet(note, 'title')} ${note.pinned ? '<i class="fas fa-thumbtack" style="margin-left: 5px;"></i>' : ''}</h3>
                                <p><strong>Created:</strong> ${new Date(safeGet(note, 'createdAt')).toLocaleString()}</p>
                                <p><strong>Last Updated:</strong> ${new Date(safeGet(note, 'updatedAt')).toLocaleString()}</p>
                                <h4>Content:</h4>
                                <div style="border: 1px dashed #ccc; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
                                    ${safeGet(note, 'content')}
                                </div>
                                ${formatTags(note.tags)}
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            // --- Dork Queries ---
            if (data.dorkAssistantState && data.dorkAssistantState.savedQueries && data.dorkAssistantState.savedQueries.length > 0) {
                html += `
                    <div class="section">
                        <h2>Saved Dork Queries</h2>
                        ${data.dorkAssistantState.savedQueries.map(query => `
                            <div class="item">
                                <h3>${safeGet(query, 'name')}</h3>
                                <p><strong>Engine:</strong> ${safeGet(query, 'engine')}</p>
                                <p><strong>Query:</strong> <span class="code-block">${safeGet(query, 'query')}</span></p>
                                <p class="description"><strong>Description:</strong> ${safeGet(query, 'description')}</p>
                                <p><strong>Saved:</strong> ${new Date(safeGet(query, 'createdAt')).toLocaleString()}</p>
                                ${formatTags(query.tags)}
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            html += `
                    <div class="section">
                        <h2>Raw App State (for debugging/advanced users)</h2>
                        <pre class="code-block">${JSON.stringify(data, null, 2)}</pre>
                    </div>
                </div>
            </body>
            </html>
            `;
            return html;
        }

        function generateTxtExport(data) {
            let text = `OSINTVault Data Export - ${new Date().toLocaleString()}\n`;
            text += `=================================================\n\n`;

            const safeGet = (obj, prop) => obj && obj[prop] !== undefined ? obj[prop] : 'N/A';
            const formatTags = (tags) => tags && tags.length > 0 ? `Tags: ${tags.join(', ')}\n` : '';
            const formatMetadata = (metadata) => {
                if (!metadata || metadata.length === 0) return '';
                let metaStr = 'Metadata:\n';
                metadata.forEach(m => {
                    metaStr += `  - ${safeGet(m, 'key')}: ${safeGet(m, 'value')}\n`;
                });
                return metaStr;
            };

            // --- Intelligence Vault (Tools) ---
            if (data.tools && data.tools.length > 0) {
                text += `INTELLIGENCE VAULT (TOOLS)\n`;
                text += `--------------------------\n\n`;
                data.tools.forEach(item => {
                    text += `Name: ${safeGet(item, 'name')} (${safeGet(item, 'type')})\n`;
                    text += `URL: ${safeGet(item, 'url')}\n`;
                    text += `Category: ${safeGet(item, 'category')}\n`;
                    text += `Description: ${safeGet(item, 'description')}\n`;
                    text += `Notes: ${safeGet(item, 'notes')}\n`;
                    text += `Added: ${new Date(safeGet(item, 'addedDate')).toLocaleString()}\n`;
                    text += `Last Used: ${item.lastUsed ? new Date(item.lastUsed).toLocaleString() : 'Never'}\n`;
                    text += formatTags(item.tags);
                    text += formatMetadata(item.metadata);
                    text += `\n---\n\n`;
                });
            }

            // --- Custom Vaults ---
            if (data.customTabs && data.customTabs.length > 0) {
                text += `CUSTOM VAULTS\n`;
                text += `-------------\n\n`;
                data.customTabs.forEach(vault => {
                    text += `Vault Name: ${safeGet(vault, 'name')}\n`;
                    text += `Vault Icon: ${safeGet(vault, 'icon')}\n`;
                    text += `Vault Color: ${safeGet(vault, 'color')}\n`;
                    text += `  Entries in this Vault:\n`;

                    const vaultEntries = Object.keys(data).filter(key => Array.isArray(data[key]) && key !== 'customTabs' && key !== 'tools' && key !== 'dorkAssistantState' && key !== 'notesState').flatMap(key => {
                        return data[key].filter(entry => (safeGet(entry, 'customTabs') || []).includes(vault.id));
                    });
                    if (data.tools) {
                        const toolsInVault = data.tools.filter(tool => (safeGet(tool, 'customTabs') || []).includes(vault.id));
                        vaultEntries.push(...toolsInVault);
                    }

                    if (vaultEntries.length > 0) {
                        vaultEntries.forEach(entry => {
                            text += `    - Type: ${safeGet(entry, 'type')}\n`;
                            text += `      Name/Title: ${safeGet(entry, 'name') || safeGet(entry, 'title') || safeGet(entry, 'value') || safeGet(entry, 'email') || 'Untitled Entry'}\n`;
                            if (safeGet(entry, 'url')) text += `      URL: ${safeGet(entry, 'url')}\n`;
                            if (safeGet(entry, 'description')) text += `      Description: ${safeGet(entry, 'description')}\n`;
                            if (safeGet(entry, 'notes')) text += `      Notes: ${safeGet(entry, 'notes')}\n`;
                            if (safeGet(entry, 'addedDate')) text += `      Added: ${new Date(safeGet(entry, 'addedDate')).toLocaleString()}\n`;
                            if (safeGet(entry, 'lastUsed')) text += `      Last Used: ${new Date(safeGet(entry, 'lastUsed')).toLocaleString()}\n`;
                            if (safeGet(entry, 'tags')) text += `      ${formatTags(safeGet(entry, 'tags'))}`;
                            text += formatMetadata(safeGet(entry, 'metadata')).split('\n').map(line => `      ${line}`).join('\n'); // Indent metadata
                            text += `\n`;
                        });
                    } else {
                        text += `    No entries assigned to this custom vault.\n`;
                    }
                    text += `\n`;
                });
            }

            // --- My Notes ---
            if (data.notesState && data.notesState.notes && data.notesState.notes.length > 0) {
                text += `MY NOTES\n`;
                text += `--------\n\n`;
                data.notesState.notes.forEach(note => {
                    text += `Title: ${safeGet(note, 'title')}${note.pinned ? ' (Pinned)' : ''}\n`;
                    text += `Created: ${new Date(safeGet(note, 'createdAt')).toLocaleString()}\n`;
                    text += `Last Updated: ${new Date(safeGet(note, 'updatedAt')).toLocaleString()}\n`;
                    text += `Content:\n`;
                    text += `${safeGet(note, 'content').replace(/<[^>]*>/g, '')}\n`; // Strip HTML
                    text += formatTags(note.tags);
                    text += `\n---\n\n`;
                });
            }

            // --- Saved Dork Queries ---
            if (data.dorkAssistantState && data.dorkAssistantState.savedQueries && data.dorkAssistantState.savedQueries.length > 0) {
                text += `SAVED DORK QUERIES\n`;
                text += `------------------\n\n`;
                data.dorkAssistantState.savedQueries.forEach(query => {
                    text += `Name: ${safeGet(query, 'name')}\n`;
                    text += `Engine: ${safeGet(query, 'engine')}\n`;
                    text += `Query: ${safeGet(query, 'query')}\n`;
                    text += `Description: ${safeGet(query, 'description')}\n`;
                    text += `Saved: ${new Date(safeGet(query, 'createdAt')).toLocaleString()}\n`;
                    text += formatTags(query.tags);
                    text += `\n---\n\n`;
                });
            }


            text += `\n=================================================\n`;
            text += `RAW APP STATE (JSON for advanced users):\n`;
            text += `=================================================\n\n`;
            text += JSON.stringify(data, null, 2);

            return text;
        }

        // Toggle Grid/List View for intelligence vault and custom vault entries
        function toggleViewMode() {
            if (appState.readOnlyMode) {
                showToast("Cannot change view mode in read-only shared view.", "warning");
                return;
            }
            // If on a mobile screen, always force grid and show a message
            if (isMobileScreen()) {
                appState.viewMode = 'grid'; // Ensure appState is set to grid
                localStorage.setItem('viewMode', 'grid');
                showToast("List View is not available on mobile. Displaying Grid View.", "info");
                renderIntelligenceEntries(); // Re-render to ensure grid is active
                return; // Exit the function to prevent further logic
            }

            // Original desktop logic:
            appState.viewMode = appState.viewMode === 'grid' ? 'list' : 'grid';
            localStorage.setItem('viewMode', appState.viewMode); // Save view mode preference

            // Update text and icon for all relevant toggle buttons
            const viewToggleButtons = document.querySelectorAll('#viewToggle, #vaultViewToggle, #customVaultViewToggle');
            viewToggleButtons.forEach(btn => {
                if (appState.viewMode === 'grid') {
                    btn.innerHTML = '<i class="fas fa-list"></i> List View';
                    btn.title = 'Switch to List View';
                } else {
                    btn.innerHTML = '<i class="fas fa-th"></i> Grid View';
                    btn.title = 'Switch to Grid View';
                }
            });

            renderIntelligenceEntries();
            showToast(`Switched to ${appState.viewMode} view.`);
        }

        // Theme Toggle
        function initTheme() {
            document.documentElement.setAttribute('data-theme', appState.theme);
            const themeToggleBtn = document.getElementById('themeToggle');
            if (appState.theme === 'dark') {
                themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
                themeToggleBtn.title = 'Switch to Light Theme';
            } else {
                themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
                themeToggleBtn.title = 'Switch to Dark Theme';
            }
        }

        function toggleTheme() {
            if (appState.readOnlyMode) { // New: Prevent actions in read-only mode
                showToast("Cannot change theme in read-only shared view.", "warning");
                return;
            }
            appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', appState.theme); // Save theme preference
            initTheme(); // Apply new theme
            showToast(`Switched to ${appState.theme} theme.`);
        }


        // Populate icon picker grid
        function populateIconPicker(containerId, inputId, selectedIcon = '') {
            const container = document.getElementById(containerId);
            container.innerHTML = '';

            availableIcons.forEach(iconClass => {
                const iconItem = document.createElement('div');
                iconItem.classList.add('icon-picker-item');
                iconItem.dataset.iconClass = iconClass;
                iconItem.innerHTML = `<i class="${iconClass}"></i>`;
                if (iconClass === selectedIcon) {
                    iconItem.classList.add('selected');
                }
                container.appendChild(iconItem);
            });

            // If a selectedIcon is provided but not in availableIcons, add it as selected
            if (selectedIcon && !availableIcons.includes(selectedIcon)) {
                const customIconItem = document.createElement('div');
                customIconItem.classList.add('icon-picker-item', 'selected');
                customIconItem.dataset.iconClass = selectedIcon;
                customIconItem.innerHTML = `<i class="${selectedIcon}"></i>`;
                container.prepend(customIconItem); // Add to the beginning
            }
        }

        // Populate color picker grid
        function populateColorPicker(containerId, inputId, selectedColor = '') {
            const container = document.getElementById(containerId);
            container.innerHTML = '';

            availableColors.forEach(colorValue => {
                const colorItem = document.createElement('div');
                colorItem.classList.add('color-picker-item');
                colorItem.dataset.colorValue = colorValue;
                colorItem.style.backgroundColor = colorValue;
                if (colorValue === selectedColor) {
                    colorItem.classList.add('selected');
                }
                container.appendChild(colorItem);
            });

            // If a selectedColor is provided but not in availableColors, add it as selected
            if (selectedColor && !availableColors.includes(selectedColor)) {
                const customColorItem = document.createElement('div');
                customColorItem.classList.add('color-picker-item', 'selected');
                customColorItem.dataset.colorValue = selectedColor;
                customColorItem.style.backgroundColor = selectedColor;
                container.prepend(customColorItem); // Add to the beginning
            }
        }

        // File reader for base64 encoding (for media entries)
        function readFileAsBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(file);
            });
        }

        function parseShareableLink() {
            const urlParams = new URLSearchParams(window.location.search);
            const sharedScope = urlParams.get('scope');
            const sharedTab = urlParams.get('tab'); // Can be 'allVault', 'allData', or a custom tab ID
            const sharedIds = urlParams.get('ids'); // Comma-separated list of IDs

            if (sharedScope && sharedTab && sharedIds) {
                appState.readOnlyMode = true;
                appState.sharedTabId = sharedTab;
                appState.sharedEntryIds = sharedIds.split(',');

                showToast("You are viewing a shared, read-only version of OSINTVault. Functionality is limited.", "info", 10000);

                // Disable all input fields and buttons
                disableAllInputsAndButtons();

                // Automatically switch to the correct tab and sub-tab based on the shared link
                if (sharedTab === 'allVault' || sharedTab === 'allData') {
                    // These scopes are not direct tabs, but influence what's shown.
                    // We'll default to intelligence-vault and let renderIntelligenceEntries handle the scope.
                    switchTab('intelligence-vault');
                    appState.filters.searchScope = sharedTab; // Set the search scope
                } else if (sharedTab.startsWith('custom-')) { // Assuming custom tab IDs start with 'custom-'
                    switchTab('custom-tabs');
                    switchCustomTab(sharedTab);
                } else { // Assume it's an intelligence vault sub-tab
                    switchTab('intelligence-vault');
                    switchIntelligenceVaultSubTab(sharedTab);
                }
            }
        }

        // MODIFIED: disableAllInputsAndButtons to disable new case study elements
        function disableAllInputsAndButtons() {
            document.querySelectorAll('input, select, textarea, button').forEach(element => {
                if (element.id !== 'themeToggle' && element.id !== 'continueAnywayBtn' && element.id !== 'searchInput' && element.id !== 'searchScopeSelect' && !element.classList.contains('nav-tab')) {
                    element.disabled = true;
                    element.style.pointerEvents = 'none';
                    element.style.opacity = '0.7';
                }
            });
            // Specific overrides for search and main tabs
            document.getElementById('searchInput').disabled = false;
            document.getElementById('searchInput').style.pointerEvents = 'auto';
            document.getElementById('searchInput').style.opacity = '1';

            document.getElementById('searchScopeSelect').disabled = false;
            document.getElementById('searchScopeSelect').style.pointerEvents = 'auto';
            document.getElementById('searchScopeSelect').style.opacity = '1';

            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.disabled = false;
                tab.style.pointerEvents = 'auto';
                tab.style.opacity = '1';
            });

            // Hide add/edit/delete buttons in custom tabs
            document.getElementById('createSubTabBtn').style.display = 'none';
            document.getElementById('editSubTabBtn').style.display = 'none';
            document.getElementById('deleteSubTabBtn').style.display = 'none';
            document.getElementById('addEntryBtnCustomVault').style.display = 'none';
            document.getElementById('addToolBtnIntelligenceVault').style.display = 'none';
            document.getElementById('addToolBtnEmptyState').style.display = 'none';
            document.getElementById('new-note-btn').style.display = 'none'; // Hide new note button
            document.getElementById('edit-note-btn').style.display = 'none'; // Hide edit note button
            document.getElementById('save-note-btn').style.display = 'none'; // Hide save note button
            document.getElementById('cancel-edit-note-btn').style.display = 'none'; // Hide cancel edit note button
            document.getElementById('back-to-notes-btn').style.display = 'none'; // Hide back to notes button
            document.getElementById('formatting-toolbar').style.display = 'none'; // Hide notes formatting toolbar
            document.getElementById('tag-input-container').style.display = 'none'; // Hide notes tag input
            document.getElementById('notes-list').querySelectorAll('.note-action-btn').forEach(btn => btn.style.display = 'none'); // Hide note action buttons

            // Hide bulk actions
            document.getElementById('bulkActions').style.display = 'none';
            document.getElementById('reportBtn').style.display = 'none';
            document.getElementById('exportBtn').style.display = 'none';
            document.getElementById('exportSubTabBtn').style.display = 'none';

            const addCaseStudyBtn = document.getElementById('addCaseStudyBtn');
            if (addCaseStudyBtn) addCaseStudyBtn.style.display = 'none';
            const addCaseStudyBtnEmptyState = document.getElementById('addCaseStudyBtnEmptyState');
            if (addCaseStudyBtnEmptyState) addCaseStudyBtnEmptyState.style.display = 'none';
            const caseStudyViewToggle = document.getElementById('caseStudyViewToggle');
            if (caseStudyViewToggle) caseStudyViewToggle.style.display = 'none';

            // New: Disable audit log buttons
            const exportAuditLogsBtn = document.getElementById('exportAuditLogsBtn');
            if (exportAuditLogsBtn) exportAuditLogsBtn.disabled = true;
            const clearAuditLogsBtn = document.getElementById('clearAuditLogsBtn');
            if (clearAuditLogsBtn) clearAuditLogsBtn.disabled = true;
            const clearAuditFiltersBtn = document.getElementById('clearAuditFiltersBtn');
            if (clearAuditFiltersBtn) clearAuditFiltersBtn.disabled = true;

            document.querySelectorAll('.case-study-category-tab').forEach(btn => { // Disable case study category tabs
                btn.disabled = true;
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '0.7';
            });
        }


        function applyReadOnlyMode() {
            if (appState.readOnlyMode) {
                disableAllInputsAndButtons();
                // Ensure specific elements are hidden or disabled if they are part of the UI but not directly covered
                document.getElementById('addToolBtnIntelligenceVault').style.display = 'none';
                document.getElementById('addEntryBtnCustomVault').style.display = 'none';
                document.getElementById('createSubTabBtn').style.display = 'none';
                document.getElementById('editSubTabBtn').style.display = 'none';
                document.getElementById('deleteSubTabBtn').style.display = 'none';
                document.getElementById('exportSubTabBtn').style.display = 'none';
                document.getElementById('bulkActions').style.display = 'none';
                document.getElementById('reportBtn').style.display = 'none';
                document.getElementById('exportBtn').style.display = 'none';
                document.getElementById('clearFiltersBtn').style.display = 'none'; // Hide clear filters button
                document.getElementById('pinAllBtn').style.display = 'none'; // Hide pin all button
                document.getElementById('starAllBtn').style.display = 'none'; // Hide star all button
                document.getElementById('viewToggle').style.display = 'none'; // Hide view toggle
                document.getElementById('vaultViewToggle').style.display = 'none'; // Hide vault view toggle
                document.getElementById('new-note-btn').style.display = 'none'; // Hide new note button
                document.getElementById('noteSortFilter').style.display = 'none'; // Hide note sort filter
                document.getElementById('search-notes').style.display = 'none'; // Hide note search

                // Ensure notes editor is read-only
                const noteContentEditor = document.getElementById('note-content-editor');
                if (noteContentEditor) {
                    noteContentEditor.setAttribute('contenteditable', 'false');
                    noteContentEditor.style.cursor = 'default';
                }
                const noteTitleInput = document.getElementById('note-title-input');
                if (noteTitleInput) {
                    noteTitleInput.readOnly = true;
                    noteTitleInput.style.cursor = 'default';
                }
            }
        }


        function showShareOptionsModal() {
            if (appState.readOnlyMode) { // New: Prevent actions in read-only mode
                showToast("Cannot generate new shared links in read-only view.", "warning");
                return;
            }
            // Populate the dropdown with custom tabs
            updateShareScopeSelect();
            showModal('shareOptionsModal');
        }

        // MODIFIED: updateShareScopeSelect and handleShareFormSubmit to include case studies
        function updateShareScopeSelect() {
            const shareScopeSelect = document.getElementById('shareScopeSelect');
            const selectCustomTabForSharing = document.getElementById('selectCustomTabForSharing');

            for (let i = shareScopeSelect.options.length - 1; i >= 0; i--) {
                const option = shareScopeSelect.options[i];
                if (option.value.startsWith('custom-') || option.value === 'allCaseStudies') { // MODIFIED: also remove allCaseStudies
                    shareScopeSelect.remove(i);
                }
            }

            // Add option for 'All Case Studies' in the main share scope select 
            const allCaseStudiesOption = document.createElement('option');
            allCaseStudiesOption.value = 'allCaseStudies';
            allCaseStudiesOption.textContent = 'All Case Studies (Read-Only View)';
            // Find the correct insertion point (before 'Specific Custom Vault...')
            const specificCustomTabPlaceholder = shareScopeSelect.querySelector('option[value="specificCustomTabPlaceholder"]');
            if (specificCustomTabPlaceholder) {
                shareScopeSelect.insertBefore(allCaseStudiesOption, specificCustomTabPlaceholder);
            } else {
                // Fallback if placeholder is missing
                shareScopeSelect.appendChild(allCaseStudiesOption);
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



        function handleShareScopeChange() {
            const shareScopeSelect = document.getElementById('shareScopeSelect');
            const specificCustomTabSelectorDiv = document.getElementById('specificCustomTabSelector'); // The div containing the secondary dropdown

            // Only show the secondary dropdown if "Specific Custom Vault..." is selected
            if (shareScopeSelect.value === 'specificCustomTabPlaceholder') {
                specificCustomTabSelectorDiv.style.display = 'block';
            } else {
                specificCustomTabSelectorDiv.style.display = 'none';
            }
        }

        // MODIFIED: handleShareFormSubmit to include case studies sharing logic
        function handleShareFormSubmit(e) {
            e.preventDefault();
            if (appState.readOnlyMode) {
                showToast("Cannot generate new shared links in read-only view.", "warning");
                return;
            }

            const shareScope = document.getElementById('shareScopeSelect').value;
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
                } else if (targetTabId === 'case-studies') { 
                    targetTabId = appState.currentCaseStudyCategory; // Share based on the currently active case study category
                    sharedEntries = appState.caseStudies.filter(cs => cs.category === appState.currentCaseStudyCategory); // Get only case studies for current category
                } else {
                    sharedEntries = filterEntries();
                }
            } else if (shareScope === 'allVault') {
                targetTabId = 'allVault';
                sharedEntries = [...appState.tools];
            } else if (shareScope === 'allCaseStudies') { 
                targetTabId = 'allCaseStudies';
                sharedEntries = [...appState.caseStudies];
            } else if (shareScope === 'allData') {
                targetTabId = 'allData';
                sharedEntries = [
                    ...appState.tools, ...appState.emails, ...appState.phones, ...appState.crypto,
                    ...appState.locations, ...appState.links, ...appState.media, ...appState.passwords,
                    ...appState.keywords, ...appState.socials, ...appState.domains, ...appState.usernames,
                    ...appState.threats, ...appState.vulnerabilities, ...appState.malware, ...appState.breaches,
                    ...appState.credentials, ...appState.forums, ...appState.vendors, ...appState.telegramChannels,
                    ...appState.pastes, ...appState.documents, ...appState.networks, ...appState.metadataEntries,
                    ...appState.archives, ...appState.messagingApps, ...appState.datingProfiles, ...appState.facialRecognition,
                    ...appState.personas, ...appState.vpns, ...appState.honeypots, ...appState.exploits,
                    ...appState.publicRecords,
                    ...appState.caseStudies 
                ];
            } else if (shareScope === 'specificCustomTabPlaceholder') {
                const selectedCustomVaultId = document.getElementById('selectCustomTabForSharing').value;
                if (!selectedCustomVaultId) {
                    showToast('Please select a specific custom vault to share.', 'error');
                    return;
                }
                targetTabId = selectedCustomVaultId;
                const customTab = appState.customTabs.find(tab => tab.id === targetTabId);
                if (customTab) {
                    const allEntriesCombined = [
                        ...appState.tools, ...appState.emails, ...appState.phones, ...appState.crypto,
                        ...appState.locations, ...appState.links, ...appState.media, ...appState.passwords,
                        ...appState.keywords, ...appState.socials, ...appState.domains, ...appState.usernames,
                        ...appState.threats, ...appState.vulnerabilities, ...appState.malware, ...appState.breaches,
                        ...appState.credentials, ...appState.forums, ...appState.vendors, ...appState.telegramChannels,
                        ...appState.pastes, ...appState.documents, ...appState.networks, ...appState.metadataEntries,
                        ...appState.archives, ...appState.messagingApps, ...appState.datingProfiles, ...appState.facialRecognition,
                        ...appState.personas, ...appState.vpns, ...appState.honeypots, ...appState.exploits,
                        ...appState.publicRecords,
                        ...appState.caseStudies 
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

            document.getElementById('copyShareLinkBtn').addEventListener('click', () => {
                copyToClipboard(link);
                showToast('Link copied to clipboard!');
                hideModal('shareLinkDisplayModal');
                shareLinkModal.remove();
            });

            document.getElementById('closeShareLinkModal').addEventListener('click', () => {
                hideModal('shareLinkDisplayModal');
                shareLinkModal.remove();
            });
        }

        function copyToClipboard(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed'; // Avoid scrolling to bottom
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
            document.body.removeChild(textarea);
        }

        function checkAndShowDesktopRecommendation() {
            // Only show if not in read-only mode and hasn't been shown this session
            if (!appState.readOnlyMode && !sessionStorage.getItem('desktopRecommendationShown')) {
                if (window.innerWidth < 1024) { // Adjust breakpoint as needed
                    showModal('desktopRecommendationModal');
                }
            }
        }



        function markAsUnsaved() {
            if (!appState.readOnlyMode) {
                appState.hasUnsavedChanges = true;
            }
        }

        function handleBeforeUnload(event) {
            if (appState.hasUnsavedChanges && !appState.readOnlyMode) {
                event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
                // The following line is mostly for older browsers or specific configurations
                return "You have unsaved changes. Are you sure you want to leave?";
            }
        }

        // This isn't directly hooked into browser's native exit, but can be triggered by custom exit buttons
        function showExitWarningModal() {
            if (appState.hasUnsavedChanges && !appState.readOnlyMode) {
                showModal('exitWarningModal');
            } else {
                // No unsaved changes, or in read-only mode, safe to exit
                window.location.reload(); // Or window.close() depending on context
            }
        }

        async function performReset() {
            if (appState.readOnlyMode) return;
            logActivity('reset', 'system', 'User initiated full application data reset.');

            localStorage.removeItem('osintArsenalState');
            localStorage.removeItem('osintNotes');
            localStorage.removeItem('osintDorkSavedQueries');
            localStorage.removeItem('osintCaseStudies');
            localStorage.removeItem('osintDocsData'); // ADD THIS LINE for OSINT Docs data

            localStorage.removeItem('viewMode');
            localStorage.removeItem('theme');
            localStorage.removeItem('noteSortFilter');
            localStorage.removeItem('caseStudyViewMode');
            localStorage.removeItem('osintDocsCurrentSection'); // Consider if you want to save/restore the last viewed doc section
            localStorage.removeItem('osintDocsCurrentSubsection'); // Consider if you want to save/restore the last viewed doc subsection
            localStorage.removeItem('osintAuditLogs'); // New: Remove audit logs from local storage


            hideModal('resetConfirmModal');
            showToast('Intelligence Vault has been reset to default!', 'success');

            // MODIFIED: Include fetchedOsintDocsData in the Promise.all for resetting
            const [fetchedDefaultTools, fetchedHandbookData, fetchedCaseStudies, fetchedDorkTemplates, fetchedOsintDocsData] = await Promise.all([
                fetchJsonData('tools.json'),
                fetchJsonData('handbookData.json'),
                fetchJsonData('caseStudies.json'),
                fetchJsonData('dorkTemplates.json'),
                fetchJsonData('osintDocsData.json')
            ]);

            appState = {
                tools: fetchedDefaultTools.map(tool => ({ ...tool, addedDate: new Date(tool.addedDate), origin: 'pre-added' })),

                emails: [],
                phones: [],
                crypto: [],
                locations: [],
                links: [],
                media: [],
                passwords: [],
                keywords: [],
                socials: [],
                domains: [],
                usernames: [],
                threats: [],
                vulnerabilities: [],
                malware: [],
                breaches: [],
                credentials: [],
                forums: [],
                vendors: [],
                telegramChannels: [],
                pastes: [],
                documents: [],
                networks: [],
                metadataEntries: [],
                archives: [],
                messagingApps: [],
                datingProfiles: [],
                audioEntries: [],
                facialRecognition: [],
                personas: [],
                vpns: [],
                honeypots: [],
                exploits: [],
                publicRecords: [],
                caseStudies: fetchedCaseStudies.map(cs => ({
                    ...cs,
                    id: cs.id || generateId(),
                    publishedDate: new Date(cs.publishedDate),
                    lastModified: new Date(cs.lastModified),
                    origin: 'pre-added',
                    starred: false,
                    pinned: false
                })),

                customTabs: [{
                    id: generateId(),
                    name: 'My First Vault',
                    toolIds: [],
                    icon: 'fas fa-folder',
                    color: 'var(--tab-color-default)'
                }],
                currentCustomTab: null,

                notesState: { notes: [], currentNote: null, editMode: false, noteSortFilter: 'updated_desc' },
                dorkAssistantState: {
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
                    conversionJustPerformed: false
                },
                selectedEntries: new Set(),
                filters: { category: '', search: '', sort: 'name', searchScope: 'currentTab' },
                theme: 'dark',
                viewMode: 'grid', // General viewMode
                caseStudyViewMode: 'grid',
                usageStats: { toolsUsedToday: 0 },
                currentTab: 'welcome',
                currentIntelligenceVaultParentTab: 'generalAndCore',
                currentIntelligenceVaultChildTab: 'tools',
                currentCustomVaultParentTab: 'coreInvestigation',
                currentCustomVaultEntrySubTab: 'tool',
                currentHandbookSubTab: 'handbook',
                currentHandbookSection: null,
                currentCaseStudyCategory: 'all',
                readOnlyMode: false,
                sharedTabId: null,
                sharedEntryIds: [],
                hasUnsavedChanges: false,
                // MODIFIED: Reset osintDocs related appState properties
                osintDocsStructure: fetchedOsintDocsData.docSections || [],
                osintDocsContentMap: fetchedOsintDocsData.contentMap || {},
                currentOsintDocsSection: null,
                currentOsintDocsSubsection: null,
                auditLogs: [{ // Re-add initial system log entry after reset
                    id: generateId(),
                    timestamp: new Date(),
                    action: 'initialized',
                    category: 'system',
                    description: 'OSINTVault application initialized after reset.',
                    details: { version: '3.0', method: 'reset_function', session: 'New Session' },
                    userId: 'system'
                }],
            };

            saveState();

            parseShareableLink();
            updateDashboard();
            initTheme();
            checkAndShowDesktopRecommendation();
            switchTab(appState.currentTab);
            populateCategoryFilter();
            updateDashboard();
            applyReadOnlyMode();

            initHandbookAndNotes();
            initDorkAssistant();
            initCaseStudies();
            initOsintDocs(); // Re-initialize OSINT Docs after reset
            initAudit();
        }


        // MODIFIED: fetchJsonData to fetch caseStudies.json
        async function fetchJsonData(filePath) {
            try {
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error(`Could not fetch ${filePath}:`, error);
                return []; // Return an empty array on error to prevent app crash
            }
        }

        // Function to check if it's a mobile screen (using the same breakpoint as CSS)
        function isMobileScreen() {
            return window.matchMedia("(max-width: 768px)").matches;
        }

        // --- Start of initApp ---
        async function initApp() {
            // Load the dork assistant state first
            loadDorkAssistantState();

            // Fetch all necessary JSON data concurrently
            const [fetchedDefaultTools, fetchedHandbookData, fetchedCaseStudies, fetchedDorkTemplates, fetchedOsintDocsData] = await Promise.all([
                fetchJsonData('tools.json'),
                fetchJsonData('handbookData.json'),
                fetchJsonData('caseStudies.json'),
                fetchJsonData('dorkTemplates.json'),
                fetchJsonData('osintDocsData.json')
            ]);

            const savedState = localStorage.getItem('osintArsenalState');
            let parsedState = {};
            if (savedState) {
                try {
                    parsedState = JSON.parse(savedState);
                } catch (e) {
                    console.error("Error parsing localStorage 'osintArsenalState', starting fresh:", e);
                }
            }

            // Initialize all appState properties with their defaults or saved values
            Object.assign(appState, {
                tools: (parsedState.tools || []).map(entry => ({
                    ...entry,
                    addedDate: entry.addedDate ? new Date(entry.addedDate) : null,
                    lastUsed: entry.lastUsed || 0,
                    customTabs: entry.customTabs || [],
                    intelligenceVaultCategories: entry.intelligenceVaultCategories || [],
                    origin: entry.origin || 'user-added'
                })).concat(
                    fetchedDefaultTools.filter(defaultTool =>
                        !(parsedState.tools || []).some(savedTool => savedTool.id === defaultTool.id)
                    ).map(tool => ({
                        ...tool,
                        addedDate: new Date(tool.addedDate),
                        origin: 'pre-added'
                    }))
                ),
                emails: parsedState.emails || [],
                phones: parsedState.phones || [],
                crypto: (parsedState.crypto || []).map(entry => ({
                    ...entry,
                    amount: parseFloat(entry.amount) || 0
                })),
                locations: parsedState.locations || [],
                links: parsedState.links || [],
                media: (parsedState.media || []).map(entry => ({
                    ...entry,
                    base64Data: entry.base64Data || ''
                })),
                passwords: parsedState.passwords || [],
                keywords: parsedState.keywords || [],
                socials: parsedState.socials || [],
                domains: parsedState.domains || [],
                usernames: parsedState.usernames || [],
                threats: parsedState.threats || [],
                vulnerabilities: (parsedState.vulnerabilities || []).map(entry => ({
                    ...entry,
                    cvss: parseFloat(entry.cvss) || 0
                })),
                malware: parsedState.malware || [],
                breaches: (parsedState.breaches || []).map(entry => ({
                    ...entry,
                    records: parseInt(entry.records) || 0
                })),
                credentials: parsedState.credentials || [],
                forums: parsedState.forums || [],
                vendors: parsedState.vendors || [],
                telegramChannels: (parsedState.telegramChannels || []).map(entry => ({
                    ...entry,
                    subscribers: parseInt(entry.subscribers) || 0
                })),
                pastes: parsedState.pastes || [],
                documents: parsedState.documents || [],
                networks: parsedState.networks || [],
                metadataEntries: parsedState.metadataEntries || [],
                archives: (parsedState.archives || []).map(entry => ({
                    ...entry,
                    timestamp: entry.timestamp ? new Date(entry.timestamp).getTime() : null
                })),
                messagingApps: parsedState.messagingApps || [],
                datingProfiles: (parsedState.datingProfiles || []).map(entry => ({
                    ...entry,
                    age: parseInt(entry.age) || null
                })),
                audioEntries: (parsedState.audioEntries || []).map(entry => ({
                    ...entry,
                    base64Data: entry.base64Data || ''
                })),
                facialRecognition: parsedState.facialRecognition || [],
                personas: parsedState.personas || [],
                vpns: parsedState.vpns || [],
                honeypots: parsedState.honeypots || [],
                exploits: parsedState.exploits || [],
                publicRecords: parsedState.publicRecords || [],
                caseStudies: (parsedState.caseStudies || []).map(entry => ({
                    ...entry,
                    publishedDate: entry.publishedDate ? new Date(entry.publishedDate) : null,
                    lastModified: entry.lastModified ? new Date(entry.lastModified) : null,
                    tags: entry.tags || [],
                    starred: entry.starred || false,
                    pinned: entry.pinned || false
                })).concat(
                    fetchedCaseStudies.filter(defaultCaseStudy =>
                        !(parsedState.caseStudies || []).some(savedCaseStudy => savedCaseStudy.id === defaultCaseStudy.id)
                    ).map(cs => ({
                        ...cs,
                        id: cs.id || generateId(),
                        publishedDate: new Date(cs.publishedDate),
                        lastModified: new Date(cs.lastModified),
                        origin: 'pre-added',
                        starred: false,
                        pinned: false
                    }))
                ),
                currentCaseStudyCategory: parsedState.currentCaseStudyCategory || 'all',
                caseStudyViewMode: localStorage.getItem('caseStudyViewMode') || 'grid',

                notesState: {
                    notes: (parsedState.notesState && parsedState.notesState.notes || []).map(note => ({
                        ...note,
                        createdAt: new Date(note.createdAt),
                        updatedAt: new Date(note.updatedAt),
                        pinned: typeof note.pinned === 'undefined' ? false : note.pinned
                    })),
                    currentNote: parsedState.notesState ? parsedState.notesState.currentNote : null,
                    editMode: parsedState.notesState ? parsedState.notesState.editMode : false,
                    noteSortFilter: parsedState.notesState ? parsedState.notesState.noteSortFilter : 'updated_desc'
                },
                dorkAssistantState: {
                    keywords: parsedState.dorkAssistantState ? parsedState.dorkAssistantState.keywords : '',
                    customInput: parsedState.dorkAssistantState ? parsedState.dorkAssistantState.customInput : '',
                    engine: parsedState.dorkAssistantState ? parsedState.dorkAssistantState.engine : 'google',
                    previewQuery: parsedState.dorkAssistantState ? parsedState.dorkAssistantState.previewQuery : '',
                    convertedQuery: parsedState.dorkAssistantState ? parsedState.dorkAssistantState.convertedQuery : '',
                    currentDorkSubTab: parsedState.dorkAssistantState ? parsedState.dorkAssistantState.currentDorkSubTab : 'query-playground',
                    savedQueries: (parsedState.dorkAssistantState && parsedState.dorkAssistantState.savedQueries || []).map(query => ({
                        ...query,
                        createdAt: new Date(query.createdAt)
                    })),
                    savedQuerySearchTerm: parsedState.dorkAssistantState ? parsedState.dorkAssistantState.savedQuerySearchTerm : '',
                    currentTemplateCategory: parsedState.dorkAssistantState ? parsedState.dorkAssistantState.currentTemplateCategory : 'All Templates',
                    preTemplateSearchTerm: parsedState.dorkAssistantState ? parsedState.dorkAssistantState.preTemplateSearchTerm : '',
                    conversionJustPerformed: parsedState.dorkAssistantState ? parsedState.dorkAssistantState.conversionJustPerformed : false
                },


                handbookData: {
                    sections: (parsedState.handbookData && parsedState.handbookData.sections || []).map(savedSection => {
                        const defaultSection = fetchedHandbookData.find(fs => fs.id === savedSection.id);
                        if (defaultSection) {
                            return {
                                ...defaultSection,
                                ...savedSection,
                                subcategories: savedSection.isCategory && savedSection.subcategories && defaultSection.isCategory && defaultSection.subcategories ?
                                    defaultSection.subcategories.map(defaultSub => {
                                        const savedSub = savedSection.subcategories.find(ss => ss.id === defaultSub.id);
                                        return savedSub ? { ...defaultSub, ...savedSub } : defaultSub;
                                    }).concat(savedSection.subcategories.filter(savedSub =>
                                        !defaultSection.subcategories.some(defaultSub => defaultSub.id === savedSub.id)
                                    )) :
                                    savedSection.subcategories
                            };
                        }
                        return savedSection;
                    }).concat(
                        fetchedHandbookData.filter(defaultSection =>
                            !(parsedState.handbookData && parsedState.handbookData.sections || []).some(savedSection => savedSection.id === defaultSection.id)
                        )
                    )
                },
                osintDocsStructure: fetchedOsintDocsData.docSections || [],
                osintDocsContentMap: fetchedOsintDocsData.contentMap || {},

                // Other top-level properties
                selectedEntries: new Set(Array.isArray(parsedState.selectedEntries) ? parsedState.selectedEntries : []),
                filters: parsedState.filters || {
                    category: '',
                    search: '',
                    sort: 'name',
                    searchScope: 'currentTab'
                },
                theme: parsedState.theme || 'dark',
                viewMode: parsedState.viewMode || 'grid', // General viewMode
                usageStats: parsedState.usageStats || {
                    toolsUsedToday: 0
                },
                customTabs: parsedState.customTabs || [],
                currentCustomTab: parsedState.currentCustomTab,
                currentIntelligenceVaultParentTab: parsedState.currentIntelligenceVaultParentTab || 'generalAndCore',
                currentIntelligenceVaultChildTab: parsedState.currentIntelligenceVaultChildTab || 'tools',
                currentCustomVaultParentTab: parsedState.currentCustomVaultParentTab || 'coreInvestigation',
                currentCustomVaultEntrySubTab: parsedState.currentCustomVaultEntrySubTab || 'tool',
                currentHandbookSubTab: parsedState.currentHandbookSubTab || 'handbook',
                currentHandbookSection: parsedState.currentHandbookSection || null,
                readOnlyMode: parsedState.readOnlyMode || false,
                sharedTabId: parsedState.sharedTabId || null,
                sharedEntryIds: parsedState.sharedEntryIds || [],
                hasUnsavedChanges: parsedState.hasUnsavedChanges || false
            });


            // If no saved state exists (first-time user), ensure default customTabs and other states are set for a clean start.
            if (!savedState) {
                if (!appState.customTabs || appState.customTabs.length === 0) {
                    appState.customTabs = [{
                        id: generateId(),
                        name: 'My First Vault',
                        toolIds: [],
                        icon: 'fas fa-folder',
                        color: 'var(--tab-color-default)'
                    }];
                    appState.currentCustomTab = appState.customTabs[0]?.id || null;
                }

                // Initialize default handbookData IF no saved data
                if (!appState.handbookData || !appState.handbookData.sections || appState.handbookData.sections.length === 0) {
                    appState.handbookData.sections = fetchedHandbookData;
                }
                // Initialize default notes if no saved notes
                if (!appState.notesState || !appState.notesState.notes || appState.notesState.notes.length === 0) {
                    appState.notesState = {
                        notes: [],
                        currentNote: null,
                        editMode: false,
                        noteSortFilter: 'updated_desc'
                    };
                }
                // Initialize default dork assistant state if no saved data
                if (!appState.dorkAssistantState || !appState.dorkAssistantState.savedQueries || appState.dorkAssistantState.savedQueries.length === 0) {
                    appState.dorkAssistantState = {
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
                        conversionJustPerformed: false
                    };
                }
                // Initialize default caseStudies if no saved data
                if (!appState.caseStudies || appState.caseStudies.length === 0) {
                    appState.caseStudies = fetchedCaseStudies.map(cs => ({
                        ...cs,
                        id: cs.id || generateId(),
                        publishedDate: new Date(cs.publishedDate),
                        lastModified: new Date(cs.lastModified),
                        origin: 'pre-added',
                        starred: false,
                        pinned: false
                    }));
                }


                // Set default current tabs
                appState.currentIntelligenceVaultParentTab = 'generalAndCore';
                appState.currentIntelligenceVaultChildTab = 'tools';
                appState.currentCustomVaultParentTab = 'coreInvestigation';
                appState.currentCustomVaultEntrySubTab = 'tool';
                appState.currentHandbookSubTab = 'handbook';
                appState.currentHandbookSection = null;
                appState.currentCaseStudyCategory = 'all';
            }

            parseShareableLink();
            updateDashboard();
            bindEvents();
            initTheme();

            const resetVaultButton = document.getElementById('resetVaultButton');
            if (resetVaultButton) {
                resetVaultButton.addEventListener('click', () => {
                    if (appState.readOnlyMode) {
                        showToast("Cannot reset vault in read-only shared view.", "warning");
                        return;
                    }
                    showModal('resetConfirmModal');
                });
            }

            const openExportFromWelcome = document.getElementById('openExportFromWelcome');
            if (openExportFromWelcome) {
                openExportFromWelcome.addEventListener('click', () => {
                    exportData();
                });
            }

            const cancelResetButton = document.getElementById('cancelReset');
            if (cancelResetButton) {
                cancelResetButton.addEventListener('click', () => hideModal('resetConfirmModal'));
            }

            const confirmResetButton = document.getElementById('confirmReset');
            if (confirmResetButton) {
                confirmResetButton.addEventListener('click', performReset);
            }

            checkAndShowDesktopRecommendation();

            const validTabs = ['welcome', 'dashboard', 'intelligence-vault', 'custom-tabs', 'handbook', 'dork-assistant', 'case-studies', 'osint-docs', 'audit'];
            if (!validTabs.includes(appState.currentTab)) {
                appState.currentTab = 'welcome';
            }

            // Force viewMode to 'grid' if on mobile. This will affect what renderIntelligenceEntries uses.
            if (isMobileScreen()) {
                appState.viewMode = 'grid';
                appState.caseStudyViewMode = 'grid'; // Also force case study view to grid
                localStorage.setItem('viewMode', 'grid'); // Persist this mobile preference
                localStorage.setItem('caseStudyViewMode', 'grid');
            }

            // Call init functions for each main module AFTER global appState is fully loaded
            switchTab(appState.currentTab); // This will trigger rendering for current tab
            initDorkAssistant(); // Always init Dork Assistant
            initHandbookAndNotes(); // Always init Handbook and Notes
            initCaseStudies();
            initOsintDocs(); // CALL THIS AFTER THE INITIAL switchTab
            initAudit();

            populateCategoryFilter();
            updateDashboard();
            applyReadOnlyMode();

            // Update view toggle buttons based on their respective viewMode states
            // These buttons will be hidden on mobile by CSS, but this ensures their internal state is correct if they appear
            const viewToggleButtons = document.querySelectorAll('#viewToggle, #vaultViewToggle, #customVaultViewToggle, #caseStudyViewToggle');
            viewToggleButtons.forEach(btn => {
                let currentMode = appState.viewMode; // Default to general viewMode
                if (btn.id === 'caseStudyViewToggle') {
                    currentMode = appState.caseStudyViewMode; // Use specific mode for case studies
                }

                if (currentMode === 'grid') { // If the current mode is grid, the button text should offer 'List View'
                    btn.innerHTML = '<i class="fas fa-list"></i> List View';
                    btn.title = 'Switch to List View';
                } else { // If the current mode is list, the button text should offer 'Grid View'
                    btn.innerHTML = '<i class="fas fa-th"></i> Grid View';
                    btn.title = 'Switch to Grid View';
                }
            });

            const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
            if (mobileMenuToggle) {
                mobileMenuToggle.addEventListener('click', () => {
                    const mobileMenuOverlay = document.createElement('div');
                    mobileMenuOverlay.classList.add('mobile-menu-overlay');
                    document.body.appendChild(mobileMenuOverlay);

                    const mobileSidebarMenu = document.getElementById('mobileSidebarMenu');
                    if (!mobileSidebarMenu) {
                        console.error("Mobile sidebar menu element not found. Please ensure #mobileSidebarMenu is in HTML.");
                        return;
                    }

                    const mobileMenuContent = mobileSidebarMenu.querySelector('.mobile-menu-content');
                    mobileMenuContent.innerHTML = '';

                    const navClonedContainer = document.createElement('div');
                    navClonedContainer.classList.add('mobile-nav-cloned');
                    mobileMenuContent.appendChild(navClonedContainer);

                    document.querySelectorAll('.main-nav-tabs .nav-tab').forEach(originalTab => { // Select from main tabs
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
                        mobileExportBtn.addEventListener('click', () => {
                            exportData();
                            closeMobileMenu();
                        });
                        controlsClonedContainer.appendChild(mobileExportBtn);
                    }

                    const shareOptionsBtn = document.getElementById('shareOptionsBtn');
                    if (shareOptionsBtn) {
                        const mobileShareOptionsBtn = document.createElement('button');
                        mobileShareOptionsBtn.className = shareOptionsBtn.className + ' mobile-btn';
                        mobileShareOptionsBtn.innerHTML = shareOptionsBtn.innerHTML;
                        mobileShareOptionsBtn.addEventListener('click', () => {
                            showShareOptionsModal();
                            closeMobileMenu();
                        });
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

                    mobileSidebarMenu.querySelector('.close-menu-btn').addEventListener('click', closeMobileMenu);
                    mobileMenuOverlay.addEventListener('click', closeMobileMenu);
                });
            }

            window.addEventListener('beforeunload', handleBeforeUnload);
        }
        // --- End of initApp ---

        // MODIFIED: setupExportOptions to include case studies in export categories
        function setupExportOptions() {
            const exportAllCheckbox = document.getElementById('exportAllData');
            const categoryCheckboxesContainer = document.getElementById('exportCategoriesCheckboxes');

            // Manually add checkbox for Intelligence Blogs here if you want granular export control
            // If not, ensure it's handled by "Export All Data"
            if (categoryCheckboxesContainer && !categoryCheckboxesContainer.querySelector('input[value="intelligenceBlogs"]')) {
                const blogCheckboxLabel = document.createElement('label');
                blogCheckboxLabel.innerHTML = `<input type="checkbox" class="export-category-checkbox" value="intelligenceBlogs" disabled> Intelligence Blogs`;
                categoryCheckboxesContainer.appendChild(blogCheckboxLabel);
            }

            if (categoryCheckboxesContainer && !categoryCheckboxesContainer.querySelector('input[value="caseStudies"]')) {
                const caseStudyCheckboxLabel = document.createElement('label');
                caseStudyCheckboxLabel.innerHTML = `<input type="checkbox" class="export-category-checkbox" value="caseStudies" disabled> Case Studies`;
                categoryCheckboxesContainer.appendChild(caseStudyCheckboxLabel);
            }


            const categoryCheckboxes = document.querySelectorAll('.export-category-checkbox');

            if (exportAllCheckbox) {
                exportAllCheckbox.addEventListener('change', () => {
                    const isChecked = exportAllCheckbox.checked;
                    categoryCheckboxes.forEach(checkbox => {
                        checkbox.checked = isChecked; // Check all if "Export All" is checked
                        checkbox.disabled = isChecked; // Disable if "Export All" is checked
                    });
                });
            }

            document.getElementById('exportBtn').addEventListener('click', () => {
                // Reset state of checkboxes when modal opens
                exportAllCheckbox.checked = true; // Default to "Export All" selected
                categoryCheckboxes.forEach(checkbox => {
                    checkbox.checked = true; // All categories checked
                    checkbox.disabled = true; // All categories disabled
                });
                showModal('exportOptionsModal');
            });

            // Capture the original function reference
            const originalPerformExport = performExport;

            // Override the global performExport function
            window.performExport = (format) => { // Use window.performExport to override the global one
                let dataToExport = {};
                const selectedCategories = Array.from(categoryCheckboxes)
                                            .filter(cb => cb.checked && !cb.disabled)
                                            .map(cb => cb.value);

                if (exportAllCheckbox.checked) {
                    dataToExport = JSON.parse(JSON.stringify(appState));
                } else if (selectedCategories.length > 0) {
                    selectedCategories.forEach(category => {
                        switch (category) {
                            case 'intelligenceVault':
                                dataToExport.tools = JSON.parse(JSON.stringify(appState.tools));
                                break;
                            case 'customVaults':
                                dataToExport.customTabs = JSON.parse(JSON.stringify(appState.customTabs));
                                const allCustomVaultEntries = [];
                                const allKnownEntries = [
                                    ...appState.emails, ...appState.phones, ...appState.crypto,
                                    ...appState.locations, ...appState.links, ...appState.media, ...appState.passwords,
                                    ...appState.keywords, ...appState.socials, ...appState.domains, ...appState.usernames,
                                    ...appState.threats, ...appState.vulnerabilities, ...appState.malware, ...appState.breaches,
                                    ...appState.credentials, ...appState.forums, ...appState.vendors, ...appState.telegramChannels,
                                    ...appState.pastes, ...appState.documents, ...appState.networks, ...appState.metadataEntries,
                                    ...appState.archives, ...appState.messagingApps, ...appState.datingProfiles, ...appState.audioEntries,
                                    ...appState.facialRecognition, ...appState.personas, ...appState.vpns, ...appState.honeypots,
                                    ...appState.exploits, ...appState.publicRecords,
                                    ...appState.caseStudies 
                                ];
                                const allTools = [...appState.tools];
                                const customVaultToolIds = new Set();
                                appState.customTabs.forEach(vault => {
                                    vault.toolIds.forEach(id => customVaultToolIds.add(id));
                                });
                                const toolsInCustomVaults = allTools.filter(tool => customVaultToolIds.has(tool.id));

                                dataToExport.customVaultEntries = JSON.parse(JSON.stringify(toolsInCustomVaults.concat(allKnownEntries.filter(entry => {
                                    return appState.customTabs.some(vault => (entry.customTabs || []).includes(vault.id));
                                }))));
                                break;
                            case 'notes':
                                dataToExport.notesState = JSON.parse(JSON.stringify(appState.notesState));
                                break;
                            case 'dorks':
                                dataToExport.dorkAssistantState = JSON.parse(JSON.stringify(appState.dorkAssistantState));
                                break;
                            case 'caseStudies': 
                                dataToExport.caseStudies = JSON.parse(JSON.stringify(appState.caseStudies));
                                break;
                        }
                    });
                } else {
                    showToast('Please select at least one data category to export, or choose "Export All Data".', 'warning');
                    return;
                }
                originalPerformExport(format, dataToExport);
            };
        }

        // Call setupExportOptions() in your initApp function or after DOMContentLoaded
        setupExportOptions();



        // MODIFIED: setupImportOptions to include case studies in import options
        function setupImportOptions() {
            document.getElementById('importBtn').addEventListener('click', () => {
                // Reset import options when modal opens
                document.getElementById('importOption').value = 'all'; // Default to 'all'
                document.getElementById('importFile').value = ''; // Clear selected file

                showModal('importOptionsModal');
            });

            document.getElementById('cancelImport').addEventListener('click', () => {
                hideModal('importOptionsModal');
            });

            document.getElementById('confirmImport').addEventListener('click', handleImport);

            // Manually add option for Intelligence Blogs if not already present in HTML
            const importOptionSelect = document.getElementById('importOption');
            if (importOptionSelect && !importOptionSelect.querySelector('option[value="intelligenceBlogs"]')) {
                const blogOption = document.createElement('option');
                blogOption.value = 'intelligenceBlogs';
                blogOption.textContent = 'Intelligence Blogs';
                importOptionSelect.appendChild(blogOption);
            }

            if (importOptionSelect && !importOptionSelect.querySelector('option[value="caseStudies"]')) {
                const caseStudyOption = document.createElement('option');
                caseStudyOption.value = 'caseStudies';
                caseStudyOption.textContent = 'Case Studies';
                importOptionSelect.appendChild(caseStudyOption);
            }
        }
        setupImportOptions();

        // MODIFIED: handleImport to handle case studies data
        async function handleImport() {
            if (appState.readOnlyMode) {
                showToast("Cannot import data in read-only shared view.", "warning");
                return;
            }

            const fileInput = document.getElementById('importFile');
            const importOption = document.getElementById('importOption').value;
            const file = fileInput.files[0];

            if (!file) {
                showToast('Please select a JSON file to import.', 'error');
                return;
            }

            try {
                const fileContent = await readFileAsText(file);
                const importedData = JSON.parse(fileContent);

                if (typeof importedData !== 'object' || importedData === null) {
                    showToast('Invalid JSON file format. Expected an object.', 'error');
                    return;
                }

                let importedCount = 0;
                let errorsDetected = false;

                if (importOption === 'all') {
                    const importedTypes = [
                        'tools', 'emails', 'phones', 'crypto', 'locations', 'links', 'media', 'passwords',
                        'keywords', 'socials', 'domains', 'usernames', 'threats', 'vulnerabilities', 'malware',
                        'breaches', 'credentials', 'forums', 'vendors', 'telegramChannels', 'pastes', 'documents',
                        'networks', 'metadataEntries', 'archives', 'messagingApps', 'datingProfiles', 'audioEntries',
                        'facialRecognition', 'personas', 'vpns', 'honeypots', 'exploits', 'publicRecords',
                        'customTabs',
                        'caseStudies' 
                    ];

                    importedTypes.forEach(type => {
                        if (importedData[type] && Array.isArray(importedData[type])) {
                            importedData[type].forEach(item => {
                                // Attempt to parse dates
                                if (item.addedDate && typeof item.addedDate === 'string') item.addedDate = new Date(item.addedDate);
                                if (item.createdAt && typeof item.createdAt === 'string') item.createdAt = new Date(item.createdAt);
                                if (item.updatedAt && typeof item.updatedAt === 'string') item.updatedAt = new Date(item.updatedAt);
                                if (item.publishedDate && typeof item.publishedDate === 'string') item.publishedDate = new Date(item.publishedDate);
                                if (item.lastModified && typeof item.lastModified === 'string') item.lastModified = new Date(item.lastModified);
                                if (item.timestamp && typeof item.timestamp === 'string') item.timestamp = new Date(item.timestamp);
                                if (item.lastUsed && typeof item.lastUsed === 'number') item.lastUsed = parseInt(item.lastUsed);

                                const existingIndex = appState[type].findIndex(extItem => extItem.id === item.id);
                                if (existingIndex !== -1) {
                                    Object.assign(appState[type][existingIndex], item);
                                    importedCount++;
                                } else {
                                    appState[type].push(item);
                                    importedCount++;
                                }
                            });
                        }
                    });

                    if (importedData.notesState && typeof importedData.notesState === 'object') {
                        if (importedData.notesState.notes && Array.isArray(importedData.notesState.notes)) {
                            importedData.notesState.notes.forEach(note => {
                                if (note.createdAt && typeof note.createdAt === 'string') note.createdAt = new Date(note.createdAt);
                                if (note.updatedAt && typeof note.updatedAt === 'string') note.updatedAt = new Date(note.updatedAt);
                                const existingIndex = appState.notesState.notes.findIndex(extNote => extNote.id === note.id);
                                if (existingIndex !== -1) {
                                    Object.assign(appState.notesState.notes[existingIndex], note);
                                } else {
                                    appState.notesState.notes.push(note);
                                }
                                importedCount++;
                            });
                        }
                        if (importedData.notesState.noteSortFilter) {
                            appState.notesState.noteSortFilter = importedData.notesState.noteSortFilter;
                        }
                    }
                    if (importedData.dorkAssistantState && typeof importedData.dorkAssistantState === 'object') {
                        if (importedData.dorkAssistantState.savedQueries && Array.isArray(importedData.dorkAssistantState.savedQueries)) {
                            importedData.dorkAssistantState.savedQueries.forEach(query => {
                                if (query.createdAt && typeof query.createdAt === 'string') query.createdAt = new Date(query.createdAt);
                                const existingIndex = appState.dorkAssistantState.savedQueries.findIndex(extQuery => extQuery.id === query.id);
                                if (existingIndex !== -1) {
                                    Object.assign(appState.dorkAssistantState.savedQueries[existingIndex], query);
                                } else {
                                    appState.dorkAssistantState.savedQueries.push(query);
                                }
                                importedCount++;
                            });
                        }
                    }
                    if (importedData.customTabs && Array.isArray(importedData.customTabs)) {
                        importedData.customTabs.forEach(importedTab => {
                            const existingTabIndex = appState.customTabs.findIndex(tab => tab.id === importedTab.id);
                            if (existingTabIndex !== -1) {
                                Object.assign(appState.customTabs[existingTabIndex], importedTab);
                            } else {
                                appState.customTabs.push(importedTab);
                            }
                            importedCount++;
                        });
                    }

                } else {
                    let targetArrayName;
                    let expectedIdField;

                    switch (importOption) {
                        case 'intelligenceVault': targetArrayName = 'tools'; expectedIdField = 'id'; break;
                        case 'customVaults': targetArrayName = 'customTabs'; expectedIdField = 'id'; break;
                        case 'notes': targetArrayName = 'notesState.notes'; expectedIdField = 'id'; break;
                        case 'dorks': targetArrayName = 'dorkAssistantState.savedQueries'; expectedIdField = 'id'; break;
                        case 'caseStudies': targetArrayName = 'caseStudies'; expectedIdField = 'id'; break; 
                        default:
                            showToast('Invalid import option selected.', 'error');
                            return;
                    }

                    let targetCollection;
                    if (targetArrayName.includes('.')) {
                        const parts = targetArrayName.split('.');
                        targetCollection = appState;
                        for (const part of parts) {
                            targetCollection = targetCollection[part];
                            if (!targetCollection) break;
                        }
                    } else {
                        targetCollection = appState[targetArrayName];
                    }

                    if (!targetCollection || !Array.isArray(targetCollection)) {
                        showToast(`Cannot import into "${importOption}". Expected a list.`, 'error');
                        errorsDetected = true;
                        return;
                    }

                    let dataToImport = importedData[targetArrayName] || importedData[targetArrayName.split('.')[0]];
                    if (!Array.isArray(dataToImport)) {
                        if (targetArrayName === 'notesState.notes') {
                            dataToImport = importedData.notesState && importedData.notesState.notes;
                        } else if (targetArrayName === 'dorkAssistantState.savedQueries') {
                            dataToImport = importedData.dorkAssistantState && importedData.dorkAssistantState.savedQueries;
                        } else {
                            showToast('Invalid data structure for selected import option.', 'error');
                            errorsDetected = true;
                            return;
                        }
                        if (!Array.isArray(dataToImport)) {
                            showToast('Invalid data structure for selected import option.', 'error');
                            errorsDetected = true;
                            return;
                        }
                    }


                    for (const item of dataToImport) {
                        if (!item[expectedIdField]) {
                            showToast(`Skipping invalid item in ${importOption}: Missing ID.`, 'warning');
                            errorsDetected = true;
                            continue;
                        }

                        if (item.addedDate && typeof item.addedDate === 'string') item.addedDate = new Date(item.addedDate);
                        if (item.createdAt && typeof item.createdAt === 'string') item.createdAt = new Date(item.createdAt);
                        if (item.updatedAt && typeof item.updatedAt === 'string') item.updatedAt = new Date(item.updatedAt);
                        if (item.publishedDate && typeof item.publishedDate === 'string') item.publishedDate = new Date(item.publishedDate);
                        if (item.lastModified && typeof item.lastModified === 'string') item.lastModified = new Date(item.lastModified);
                        if (item.timestamp && typeof item.timestamp === 'string') item.timestamp = new Date(item.timestamp);
                        if (item.lastUsed && typeof item.lastUsed === 'number') item.lastUsed = parseInt(item.lastUsed);

                        const existingIndex = targetCollection.findIndex(extItem => extItem[expectedIdField] === item[expectedIdField]);

                        if (existingIndex !== -1) {
                            Object.assign(targetCollection[existingIndex], item);
                        } else {
                            targetCollection.push(item);
                        }
                        importedCount++;
                    }
                }

                if (errorsDetected) {
                    showToast(`Import completed with some errors. Imported ${importedCount} items.`, 'warning');
                    logActivity('imported', importOption, `Imported ${importedCount} items of type: ${importOption} (with warnings)`, { details: { importedCount, type: importOption, errors: true } });
                } else {
                    showToast(`Successfully imported ${importedCount} items!`, 'success');
                    logActivity('imported', importOption, `Successfully imported ${importedCount} items of type: ${importOption}`, { details: { importedCount, type: importOption } });
                }

                hideModal('importOptionsModal');
                saveState();

                renderIntelligenceEntries();
                renderCustomTabs();
                renderNotesList();
                renderSavedQueries();
                renderCaseStudies(); 
                updateDashboard();
                populateCategoryFilter();
                populateCaseStudyCategories(); 
            } catch (e) {
                showToast(`Error during import: ${e.message}`, 'error');
                console.error("Import error:", e);
                logActivity('failed', 'import', `Failed to import data: ${e.message}`, { error: e.message });
            }
        }

        // Utility function to read file content as text
        function readFileAsText(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsText(file);
            });
        }


        
        // Add loadDorkAssistantState to the very beginning of initApp
        const originalInitApp = initApp;
        initApp = function() {
            loadDorkAssistantState(); // Load the dork assistant state first
            originalInitApp(); // Call the original initApp
            initDorkAssistant(); // Initialize the new dork assistant
            // The switchDorkSubTab call in initDorkAssistant handles showing the correct tab
        };
        

        document.addEventListener('DOMContentLoaded', initApp);
        // Add this to your global scope if not already there, for use by logActivity
        window.logActivity = logActivity;