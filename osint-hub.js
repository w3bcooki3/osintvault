// Global variables
let tools = JSON.parse(localStorage.getItem('osint_tools') || '[]');
let currentVault = localStorage.getItem('osint_currentVault') || 'default'; // Persist current vault
let vaults = JSON.parse(localStorage.getItem('osint_vaults') || '{"default": {"name": "Default Vault", "tools": [], "notes": ""}}');
let editingTool = null;
let currentTags = [];
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let currentIntelligenceVaultCategory = localStorage.getItem('osint_currentIntelliVaultCat') || 'generalAndCore';
let currentIntelligenceVaultSubCategory = localStorage.getItem('osint_currentIntelliVaultSubCat') || 'tools';
let viewMode = localStorage.getItem('viewMode') || 'grid'; // 'grid' or 'list'
let selectedToolIds = new Set(); // For bulk actions

const intelligenceVaultTabStructure = [
    {
        id: 'generalAndCore',
        name: 'General',
        icon: 'fas fa-globe-americas',
        children: [
            { id: 'tools', name: 'General Tools', icon: 'fas fa-tools' },
            { id: 'keywordTools', name: 'Keyword & Text Analysis', icon: 'fas fa-font' },
            { id: 'aiTools', name: 'AI & Generative', icon: 'fas fa-brain' },
            { id: 'osintSearchEngines', name: 'OSINT-Specific Search', icon: 'fas fa-search-dollar' },
            { id: 'archivingTools', name: 'Archiving & Cache', icon: 'fas fa-archive' },
        ]
    },
    {
        id: 'identityAndSocial',
        name: 'Identity/Social',
        icon: 'fas fa-users',
        children: [
            { id: 'peopleSearchTools', name: 'People Search', icon: 'fas fa-id-card' },
            { id: 'usernameTools', name: 'Usernames & Handles', icon: 'fas fa-at' },
            { id: 'socialTools', name: 'Social Media Profiles', icon: 'fas fa-users' },
            { id: 'emailTools', name: 'Email Investigations', icon: 'fas fa-envelope' },
            { id: 'phoneTools', name: 'Phone Number Analysis', icon: 'fas fa-phone' },
            { id: 'messagingApps', name: 'Messaging Apps & Comms', icon: 'fas fa-comment-dots' },
            { id: 'datingApps', name: 'Dating Apps', icon: 'fas fa-heart' },
        ]
    },
    {
        id: 'technicalFootprints',
        name: 'Footprints',
        icon: 'fas fa-fingerprint',
        children: [
            { id: 'domainIpUrlTools', name: 'Domain/IP/URL Analysis', icon: 'fas fa-link' },
            { id: 'geoIntTools', name: 'GEOINT & Mapping', icon: 'fas fa-map-marker-alt' },
            { id: 'cryptoTools', name: 'Crypto Wallets & Transactions', icon: 'fas fa-coins' },
            { id: 'darkWebTools', name: 'DarkWeb & Hidden Services', icon: 'fas fa-mask' },
            { id: 'metadataTools', name: 'Metadata Extractors', icon: 'fas fa-info' },
            { id: 'networkAnalysis', name: 'Network & System Analysis', icon: 'fas fa-network-wired' },
            { id: 'documentAnalysis', name: 'Document Analysis', icon: 'fas fa-file-alt' },
        ]
    },
    {
        id: 'cybersecurityIntel',
        name: 'Threat Intel',
        icon: 'fas fa-shield-alt',
        children: [
            { id: 'threatIntelligenceTools', name: 'Threat Intel Platforms', icon: 'fas fa-hand-fist' },
            { id: 'vulnerabilityTools', name: 'Vulnerability Research', icon: 'fas fa-bug' },
            { id: 'fileMalwareTools', name: 'File & Malware Analysis', icon: 'fas fa-file-code' },
            { id: 'honeypotMonitoring', name: 'Honeypot Monitoring', icon: 'fas fa-honey-pot' },
            { id: 'reverseEngineering', name: 'Reverse Engineering', icon: 'fas fa-cogs' },
        ]
    },
    {
        id: 'breachAndLeaks',
        name: 'Breach/Leaks',
        icon: 'fas fa-database',
        children: [
            { id: 'passwordLeakTools', name: 'Password Leaks', icon: 'fas fa-key' },
            { id: 'credentialLeakTools', name: 'Credential Dumps', icon: 'fas fa-cloud-download-alt' },
            { id: 'dataBreachTools', name: 'Breached Databases', icon: 'fas fa-shield-virus' },
            { id: 'dumpSearchTools', name: 'General Data Dumps', icon: 'fas fa-dumpster' },
            { id: 'publicRecords', name: 'Public Records & Legal', icon: 'fas fa-scale-balanced' },
        ]
    },
    {
        id: 'undergroundSources',
        name: 'Forums/Markets',
        icon: 'fas fa-user-ninja',
        children: [
            { id: 'hackingForums', name: 'Hacking & Security Forums', icon: 'fas fa-user-secret' },
            { id: 'exploitMarkets', name: 'Exploit & Malware Markets', icon: 'fas fa-store-alt' },
            { id: 'vendorTracking', name: 'Underground Vendor Tracking', icon: 'fas fa-user-tag' },
            { id: 'telegramChannels', name: 'Telegram Channels', icon: 'fab fa-telegram-plane' },
            { id: 'pasteSites', name: 'Paste Sites', icon: 'fas fa-clipboard-list' },
        ]
    },
    {
        id: 'mediaAnalysis',
        name: 'Media',
        icon: 'fas fa-image',
        children: [
            { id: 'imageAnalysis', name: 'Image Analysis & Forensics', icon: 'fas fa-camera' },
            { id: 'videoAnalysis', name: 'Video Analysis', icon: 'fas fa-video' },
            { id: 'audioAnalysis', name: 'Audio Analysis', icon: 'fas fa-volume-up' },
            { id: 'facialRecognition', name: 'Facial Recognition', icon: 'fas fa-face-id-card' }, // Assuming fa-face-id-card is available or using fa-user-circle
            { id: 'geolocationMedia', name: 'Geolocation from Media', icon: 'fas fa-map-pin' },
        ]
    },
    {
        id: 'opsec',
        name: 'OpSec',
        icon: 'fas fa-lock',
        children: [
            { id: 'anonymityTools', name: 'Anonymity & VPNs', icon: 'fas fa-mask' },
            { id: 'privacyTools', name: 'Privacy Enhancing Tools', icon: 'fas fa-user-shield' },
            { id: 'secureCommunication', name: 'Secure Communication', icon: 'fas fa-lock-open' },
            { id: 'personaManagement', name: 'Persona Management', icon: 'fas fa-id-badge' },
        ]
    },
];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        updateThemeIcon();
    }
    // Load saved settings on init
    const savedSort = localStorage.getItem('defaultSort');
    const savedToolsPerRow = localStorage.getItem('toolsPerRow');
    const savedViewMode = localStorage.getItem('defaultViewMode');

    if (savedSort) {
        document.getElementById('defaultSort').value = savedSort;
        // The sortFilter for intelligence vault will be updated on renderIntelligenceVaultTools
        // The sortFilter for multi-vault will be handled by its render function
    }

    if (savedToolsPerRow && savedToolsPerRow !== 'auto') {
        document.documentElement.style.setProperty('--tools-per-row', savedToolsPerRow);
        document.getElementById('toolsPerRow').value = savedToolsPerRow;
    }

    if (savedViewMode) {
        viewMode = savedViewMode;
        updateViewModeDisplay();
    }

    // Ensure the correct vault is active on load
    switchVault(currentVault, false); // Pass false to prevent re-rendering tabs on initial load
    // Ensure the correct intelligence vault categories are active on load
    renderIntelligenceVaultTopTabs();
    renderIntelligenceVaultSubTabs(currentIntelligenceVaultCategory);
});

function initializeApp() {
    updateDashboard();
    // renderTools is now more specific, will be called by section switch
    // renderTools(); // No longer calling global renderTools here
    updateCategoryFilter(); // Still useful for the general modal dropdown
    renderVaultTabs();
    loadDefaultTools();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            switchSection(section);
        });
    });

    // Search and filters for Intelligence Vault
    document.getElementById('searchInput').addEventListener('input', debounce(filterIntelligenceVaultTools, 300));
    document.getElementById('sortFilter').addEventListener('change', filterIntelligenceVaultTools);

    // Tool form
    document.getElementById('toolForm').addEventListener('submit', handleToolSubmit);
    document.getElementById('tagInput').addEventListener('keypress', handleTagInput);

    // Import file
    document.getElementById('importFile').addEventListener('change', handleFileImport);

    // Drag and drop
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    document.getElementById('dragOverlay').addEventListener('dragleave', handleDragLeave); // Listen on overlay
    document.addEventListener('dragend', handleDragLeave); // In case drag ends outside overlay

    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('toolModal');
        if (e.target === modal) {
            closeModal();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault();
                    document.getElementById('searchInput').focus();
                    break;
                case 'n':
                    e.preventDefault();
                    // Open add tool modal, implicitly to the current active intelligence vault sub-category
                    openAddToolModal('intelligence-vault');
                    break;
            }
        }
        if (e.key === 'Escape') {
            closeModal();
            selectedToolIds.clear(); // Clear selection on modal close
            updateBulkActionsBar();
            renderIntelligenceVaultTools(); // Re-render to clear checkboxes
        }
    });
}

function loadDefaultTools() {
    if (tools.length === 0) {
        const defaultTools = [
            {
                id: generateId(),
                title: "Shodan",
                url: "https://www.shodan.io/",
                description: "Search engine for Internet-connected devices",
                category: "Technical Footprints", // Matches top-level
                subCategory: "networkAnalysis", // Matches sub-category
                tags: ["iot", "devices", "security"],
                dateAdded: new Date().toISOString(),
                favorite: false,
                usage: 0,
                pinned: false
            },
            {
                id: generateId(),
                title: "Have I Been Pwned",
                url: "https://haveibeenpwned.com/",
                description: "Check if email has been compromised in data breaches",
                category: "Breach/Leaks",
                subCategory: "emailTools", // Although primary category for this is Breach/Leaks, emailTools is under Identity/Social
                // For simplicity now, let's adjust this to fit new structure or clarify mapping.
                // Re-mapping for now:
                category: "Identity/Social", // Re-categorized
                subCategory: "emailTools", // Re-categorized
                tags: ["breach", "email", "security"],
                dateAdded: new Date().toISOString(),
                favorite: false,
                usage: 0,
                pinned: false
            },
            {
                id: generateId(),
                title: "Wayback Machine",
                url: "https://web.archive.org/",
                description: "View archived web pages",
                category: "General",
                subCategory: "archivingTools",
                tags: ["archive", "history", "web"],
                dateAdded: new Date().toISOString(),
                favorite: false,
                usage: 0,
                pinned: false
            },
            {
                id: generateId(),
                title: "WhoisDS",
                url: "https://whois.net/",
                description: "Domain and IP address lookup",
                category: "Footprints",
                subCategory: "domainIpUrlTools",
                tags: ["whois", "domain", "ip"],
                dateAdded: new Date().toISOString(),
                favorite: false,
                usage: 0,
                pinned: false
            },
            {
                id: generateId(),
                title: "TinEye",
                url: "https://tineye.com/",
                description: "Reverse image search engine",
                category: "Media",
                subCategory: "imageAnalysis",
                tags: ["reverse", "image", "search"],
                dateAdded: new Date().toISOString(),
                favorite: false,
                usage: 0,
                pinned: false
            }
        ];
        tools = defaultTools;
        saveTools();
        // Add these default tools to the 'default' vault
        vaults['default'].tools = tools.map(tool => tool.id);
        saveVaults();
        // Updated rendering for new structure
        renderIntelligenceVaultTools();
        updateDashboard();
        renderCurrentVault(); // Re-render current vault to show new tools
    }
}

function switchSection(sectionName) {
    // Clear selections when switching sections
    selectedToolIds.clear();
    updateBulkActionsBar();

    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');

    // Update header actions visibility
    if (sectionName === 'intelligence-vault') {
        document.getElementById('addToolHeaderBtn').style.display = 'block';
        document.getElementById('addToolHeaderBtn').onclick = () => openAddToolModal('intelligence-vault');
    } else {
        document.getElementById('addToolHeaderBtn').style.display = 'none';
    }


    // Update header
    const sectionData = {
        'dashboard': {
            icon: 'fas fa-tachometer-alt',
            title: 'Dashboard',
            subtitle: 'Welcome to your OSINT command center'
        },
        'intelligence-vault': {
            icon: 'fas fa-database',
            title: 'Intelligence Vault',
            subtitle: 'Manage your OSINT tools and resources'
        },
        'multi-vault': {
            icon: 'fas fa-folder-open',
            title: 'Multi-Vault',
            subtitle: 'Organize tools into custom collections'
        },
        'cheatsheet': {
            icon: 'fas fa-book',
            title: 'Cheatsheet',
            subtitle: 'Quick reference for OSINT techniques'
        },
        'settings': {
            icon: 'fas fa-cog',
            title: 'Settings',
            subtitle: 'Configure your OSINT Hub'
        }
    };

    const section = sectionData[sectionName];
    document.getElementById('page-icon').className = section.icon;
    document.getElementById('page-title-text').textContent = section.title;
    document.getElementById('page-subtitle').textContent = section.subtitle;

    // Load section-specific data
    if (sectionName === 'multi-vault') {
        renderCurrentVault();
    } else if (sectionName === 'intelligence-vault') {
        renderIntelligenceVaultTopTabs();
        renderIntelligenceVaultSubTabs(currentIntelligenceVaultCategory);
        filterIntelligenceVaultTools(); // Render tools with current filters
    }
    // Any other section specific render calls
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveTools() {
    localStorage.setItem('osint_tools', JSON.stringify(tools));
    updateDashboard();
}

function saveVaults() {
    localStorage.setItem('osint_vaults', JSON.stringify(vaults));
    localStorage.setItem('osint_currentVault', currentVault); // Save current vault
}

function updateDashboard() {
    const totalTools = tools.length;
    const favoriteTools = tools.filter(tool => tool.favorite).length;
    // Categories are now more complex due to nested structure. For dashboard, let's count unique top-level categories.
    const uniqueTopCategories = new Set();
    tools.forEach(tool => {
        const topCat = intelligenceVaultTabStructure.find(cat =>
            cat.children.some(child => child.id === tool.subCategory)
        );
        if (topCat) {
            uniqueTopCategories.add(topCat.name);
        }
    });
    const totalCategories = uniqueTopCategories.size;
    const totalUsage = tools.reduce((sum, tool) => sum + (tool.usage || 0), 0);

    document.getElementById('totalTools').textContent = totalTools;
    document.getElementById('favoriteTools').textContent = favoriteTools;
    document.getElementById('totalCategories').textContent = totalCategories;
    document.getElementById('totalUsage').textContent = totalUsage;

    // Update navigation badges
    document.getElementById('dashboard-badge').textContent = totalTools;
    document.getElementById('vault-badge').textContent = favoriteTools;
    document.getElementById('multi-vault-badge').textContent = Object.keys(vaults).length;

    // Update popular tools
    const popularTools = tools
        .filter(tool => (tool.usage || 0) > 0) // Ensure usage is a number and greater than 0
        .sort((a, b) => (b.usage || 0) - (a.usage || 0))
        .slice(0, 5);

    const popularToolsEl = document.getElementById('popularTools');
    if (popularTools.length > 0) {
        popularToolsEl.innerHTML = popularTools.map(tool =>
            `<div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--light-border);">
                <span>${escapeHtml(tool.title)}</span>
                <span style="color: var(--text-secondary);">${tool.usage} uses</span>
            </div>`
        ).join('');
    } else {
        popularToolsEl.innerHTML = 'No usage data yet. Start using tools to see statistics!';
    }
}

function renderTools(toolsToRender = null, targetGridId = 'intelligenceVaultToolsGrid') {
    const toolsGrid = document.getElementById(targetGridId);
    const toolsArray = toolsToRender || tools; // Default to all tools if no specific list is provided

    // Apply view mode to the grid
    toolsGrid.classList.remove('list-view', 'grid-view');
    toolsGrid.classList.add(viewMode === 'list' ? 'list-view' : 'grid-view');

    const toolsForCurrentGrid = targetGridId === 'intelligenceVaultToolsGrid' ?
                                toolsArray.filter(tool =>
                                    tool.category === getTopCategoryName(currentIntelligenceVaultCategory) &&
                                    tool.subCategory === currentIntelligenceVaultSubCategory
                                ) :
                                toolsArray; // For multi-vault or dashboard, render all passed tools

    if (toolsForCurrentGrid.length === 0) {
        toolsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <i class="fas fa-database" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3>No tools found</h3>
                <p>Add your first OSINT tool to get started!</p>
                ${targetGridId === 'intelligenceVaultToolsGrid' ?
                    `<button class="btn btn-primary" onclick="openAddToolModal('intelligence-vault')" style="margin-top: 20px;">
                        <i class="fas fa-plus"></i>
                        Add Tool to this Sub-Category
                    </button>` :
                    `<button class="btn btn-primary" onclick="openAddToolModal('default')" style="margin-top: 20px;">
                        <i class="fas fa-plus"></i>
                        Add Tool
                    </button>`
                }
            </div>
        `;
        return;
    }

    toolsGrid.innerHTML = toolsForCurrentGrid.map(tool => `
        <div class="tool-card" data-tool-id="${tool.id}">
            <input type="checkbox" class="tool-checkbox" onchange="toggleToolSelection('${tool.id}', this.checked)" ${selectedToolIds.has(tool.id) ? 'checked' : ''}>
            ${tool.pinned ? '<i class="fas fa-thumbtack pin-icon" title="Pinned"></i>' : ''}
            <div class="tool-header">
                <div class="tool-favicon">
                    <i class="fas fa-link"></i>
                </div>
                <div class="tool-info">
                    <div class="tool-title">${escapeHtml(tool.title)}</div>
                    <div class="tool-url">${escapeHtml(tool.url)}</div>
                </div>
                <button class="star-btn ${tool.favorite ? 'starred' : ''}" onclick="toggleFavorite('${tool.id}')">
                    <i class="fas fa-star"></i>
                </button>
            </div>
            <div class="tool-description">${escapeHtml(tool.description || 'No description available')}</div>
            <div class="tool-tags">
                ${(tool.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                ${tool.category && tool.subCategory ? `<span class="tag" style="background: var(--success-color);">${escapeHtml(getDisplayCategoryName(tool.subCategory))}</span>` : ''}
            </div>
            <div class="tool-actions">
                <div class="tool-buttons">
                    <button class="tool-btn btn-launch" onclick="launchTool('${tool.id}')" title="Open tool">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                    <button class="tool-btn btn-copy" onclick="copyToolUrl('${tool.id}')" title="Copy URL">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="tool-btn btn-edit" onclick="editTool('${tool.id}')" title="Edit tool">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="tool-btn btn-delete" onclick="deleteTool('${tool.id}')" title="Delete tool">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div style="font-size: 12px; color: var(--text-secondary);">
                    ${tool.usage || 0} uses
                </div>
            </div>
        </div>
    `).join('');

    // Load favicons
    toolsForCurrentGrid.forEach(tool => {
        loadFavicon(tool.id, tool.url);
    });
}


function loadFavicon(toolId, url) {
    try {
        const domain = new URL(url).hostname;
        const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        const toolCard = document.querySelector(`[data-tool-id="${toolId}"]`);
        if (toolCard) {
            const faviconEl = toolCard.querySelector('.tool-favicon');
            const img = document.createElement('img');
            img.src = favicon;
            img.width = 20;
            img.height = 20;
            img.style.borderRadius = '4px';
            img.onerror = function() {
                this.style.display = 'none';
                const defaultIcon = faviconEl.querySelector('.fas.fa-link');
                if (defaultIcon) defaultIcon.style.display = 'block';
            };
            faviconEl.innerHTML = '';
            faviconEl.appendChild(img);
            const defaultIcon = document.createElement('i');
            defaultIcon.className = 'fas fa-link';
            defaultIcon.style.display = 'none';
            faviconEl.appendChild(defaultIcon);
        }
    } catch (e) {
        const toolCard = document.querySelector(`[data-tool-id="${toolId}"]`);
        if (toolCard) {
            const faviconEl = toolCard.querySelector('.tool-favicon');
            faviconEl.innerHTML = '<i class="fas fa-link"></i>';
        }
    }
}

// Function to get the display name for a sub-category ID
function getDisplayCategoryName(subCategoryId) {
    for (const topCat of intelligenceVaultTabStructure) {
        const subCat = topCat.children.find(child => child.id === subCategoryId);
        if (subCat) {
            return subCat.name;
        }
    }
    return ''; // Or return the ID if not found
}

// Function to get the top-level category name for a top-level category ID
function getTopCategoryName(topCategoryId) {
    const topCat = intelligenceVaultTabStructure.find(cat => cat.id === topCategoryId);
    return topCat ? topCat.name : '';
}


function filterIntelligenceVaultTools() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortFilterValue = document.getElementById('sortFilter').value;

    let filteredTools = tools.filter(tool => {
        const matchesCategory = tool.category === getTopCategoryName(currentIntelligenceVaultCategory) &&
                                tool.subCategory === currentIntelligenceVaultSubCategory;

        const matchesSearch = !searchTerm ||
            tool.title.toLowerCase().includes(searchTerm) ||
            tool.url.toLowerCase().includes(searchTerm) ||
            (tool.description && tool.description.toLowerCase().includes(searchTerm)) ||
            (tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(searchTerm)));

        return matchesCategory && matchesSearch;
    });

    // Apply sorting
    switch (sortFilterValue) {
        case 'alphabetical':
            filteredTools.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'newest':
            filteredTools.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            break;
        case 'popular':
            filteredTools.sort((a, b) => (b.usage || 0) - (a.usage || 0));
            break;
        case 'favorites':
            filteredTools.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
            break;
        case 'pinned':
             filteredTools.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
             break;
    }

    renderTools(filteredTools, 'intelligenceVaultToolsGrid');
}


function updateCategoryFilter() {
    // This function is still used to populate the category dropdown in the modal for ADD/EDIT tool
    const toolCategorySelect = document.getElementById('toolCategory');
    toolCategorySelect.innerHTML = '<option value="">Select Main Category</option>';
    intelligenceVaultTabStructure.forEach(category => {
        toolCategorySelect.innerHTML += `<option value="${category.id}">${escapeHtml(category.name)}</option>`;
    });
    // This old 'categoryFilter' (for intelligence-vault) is now hidden and no longer updated/used
}

function populateSubCategories(mainCategoryId, selectedSubCategory = '') {
    const subCategoryGroup = document.getElementById('subCategoryGroup');
    const toolSubCategorySelect = document.getElementById('toolSubCategory');
    toolSubCategorySelect.innerHTML = '<option value="">Select Sub-Category</option>';

    const mainCategory = intelligenceVaultTabStructure.find(cat => cat.id === mainCategoryId);
    if (mainCategory && mainCategory.children && mainCategory.children.length > 0) {
        mainCategory.children.forEach(subCat => {
            const option = document.createElement('option');
            option.value = subCat.id;
            option.textContent = escapeHtml(subCat.name);
            toolSubCategorySelect.appendChild(option);
        });
        subCategoryGroup.style.display = 'block';
        if (selectedSubCategory) {
            toolSubCategorySelect.value = selectedSubCategory;
        }
    } else {
        subCategoryGroup.style.display = 'none';
        toolSubCategorySelect.value = '';
    }
}


function openAddToolModal(sourceSection = 'default') {
    editingTool = null;
    currentTags = [];
    document.getElementById('modalTitle').textContent = 'Add New Tool';
    document.getElementById('toolForm').reset();
    document.getElementById('toolModal').classList.add('active');
    renderTagsInModal();

    // Populate main categories
    updateCategoryFilter(); // Populates 'toolCategory'

    // Pre-select categories based on source section
    if (sourceSection === 'intelligence-vault') {
        document.getElementById('toolCategory').value = currentIntelligenceVaultCategory;
        populateSubCategories(currentIntelligenceVaultCategory, currentIntelligenceVaultSubCategory);
    } else {
        // For other sections or general add, ensure sub-category is hidden/reset
        document.getElementById('toolCategory').value = '';
        document.getElementById('subCategoryGroup').style.display = 'none';
        document.getElementById('toolSubCategory').value = '';
    }
}

function editTool(toolId) {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) return;

    editingTool = tool;
    currentTags = [...(tool.tags || [])];

    document.getElementById('modalTitle').textContent = 'Edit Tool';
    document.getElementById('toolTitle').value = tool.title;
    document.getElementById('toolUrl').value = tool.url;
    document.getElementById('toolDescription').value = tool.description || '';

    // Set main category and populate sub-categories
    // Need to get the category ID from the display name or map it
    const topCategory = intelligenceVaultTabStructure.find(cat => cat.name === tool.category);
    if (topCategory) {
        document.getElementById('toolCategory').value = topCategory.id;
        populateSubCategories(topCategory.id, tool.subCategory || '');
    } else {
         document.getElementById('toolCategory').value = '';
         document.getElementById('subCategoryGroup').style.display = 'none';
    }


    renderTagsInModal();
    document.getElementById('toolModal').classList.add('active');
}

function renderTagsInModal() {
    const container = document.getElementById('tagContainer');
    const existingTagInput = document.getElementById('tagInput');
    if (existingTagInput) {
        existingTagInput.remove();
    }

    container.innerHTML = currentTags.map(tag =>
        `<span class="tag-item">
            ${escapeHtml(tag)}
            <button type="button" class="tag-remove" onclick="removeTag(event, '${tag}')">&times;</button>
        </span>`
    ).join('');

    const tagInput = document.createElement('input');
    tagInput.type = 'text';
    tagInput.className = 'tag-input';
    tagInput.id = 'tagInput';
    tagInput.placeholder = 'Add tags...';
    tagInput.addEventListener('keypress', handleTagInput);
    container.appendChild(tagInput);
}

function handleTagInput(e) {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const input = e.target;
        const tag = input.value.trim().replace(',', '');
        if (tag && !currentTags.includes(tag)) {
            currentTags.push(tag);
            input.value = '';
            renderTagsInModal();
        }
    }
}

function removeTag(event, tagToRemove) {
    event.stopPropagation();
    currentTags = currentTags.filter(tag => tag !== tagToRemove);
    renderTagsInModal();
}

function handleToolSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('toolTitle').value.trim();
    const url = document.getElementById('toolUrl').value.trim();
    const description = document.getElementById('toolDescription').value.trim();
    const categoryId = document.getElementById('toolCategory').value; // This is now category ID
    const subCategory = document.getElementById('toolSubCategory').value;

    if (!title || !url || !categoryId || !subCategory) {
        showNotification('Please fill in all required fields (Title, URL, Main Category, Sub-Category)', 'error');
        return;
    }

    if (!isValidUrl(url)) {
        showNotification('Please enter a valid URL (e.g., https://example.com)', 'error');
        return;
    }

    // Get the display name for the main category
    const mainCategoryObject = intelligenceVaultTabStructure.find(cat => cat.id === categoryId);
    const categoryName = mainCategoryObject ? mainCategoryObject.name : 'Other'; // Fallback

    const toolData = {
        id: editingTool ? editingTool.id : generateId(),
        title,
        url,
        description,
        category: categoryName, // Store display name
        subCategory: subCategory, // Store sub-category ID
        tags: currentTags,
        dateAdded: editingTool ? editingTool.dateAdded : new Date().toISOString(),
        favorite: editingTool ? editingTool.favorite : false,
        usage: editingTool ? editingTool.usage : 0,
        pinned: editingTool ? editingTool.pinned : false // Retain or set default
    };

    if (editingTool) {
        const index = tools.findIndex(t => t.id === editingTool.id);
        tools[index] = toolData;
        showNotification('Tool updated successfully!', 'success');
    } else {
        tools.push(toolData);
        // If adding a new tool, add it to the current active vault (if not already there)
        if (vaults[currentVault] && !vaults[currentVault].tools.includes(toolData.id)) {
            vaults[currentVault].tools.push(toolData.id);
        }
        showNotification('Tool added successfully!', 'success');
    }

    saveTools();
    saveVaults();
    filterIntelligenceVaultTools(); // Re-render tools for intelligence vault
    renderCurrentVault(); // Re-render multi-vault content
    closeModal();
}

function closeModal() {
    document.getElementById('toolModal').classList.remove('active');
    editingTool = null;
    currentTags = [];
    selectedToolIds.clear(); // Clear selection on modal close
    updateBulkActionsBar();
}

function deleteTool(toolId) {
    if (confirm('Are you sure you want to delete this tool? This will remove it from all vaults as well.')) {
        tools = tools.filter(t => t.id !== toolId);
        // Also remove the tool from all vaults
        for (const vaultId in vaults) {
            vaults[vaultId].tools = vaults[vaultId].tools.filter(id => id !== toolId);
        }
        saveTools();
        saveVaults();
        filterIntelligenceVaultTools(); // Re-render for intelligence vault
        renderCurrentVault(); // Re-render multi-vault content
        selectedToolIds.delete(toolId); // Remove from selection if deleted
        updateBulkActionsBar();
        showNotification('Tool deleted successfully!', 'success');
    }
}

function toggleFavorite(toolId) {
    const tool = tools.find(t => t.id === toolId);
    if (tool) {
        tool.favorite = !tool.favorite;
        saveTools();
        filterIntelligenceVaultTools(); // Re-render to update star icon
        renderCurrentVault(); // For multi-vault
        showNotification(tool.favorite ? 'Added to favorites!' : 'Removed from favorites!', 'success');
    }
}

function togglePinned(toolId) {
    const tool = tools.find(t => t.id === toolId);
    if (tool) {
        tool.pinned = !tool.pinned;
        saveTools();
        filterIntelligenceVaultTools(); // Re-render to update pin icon
        renderCurrentVault(); // For multi-vault
        showNotification(tool.pinned ? 'Tool pinned!' : 'Tool unpinned!', 'success');
    }
}


function launchTool(toolId) {
    const tool = tools.find(t => t.id === toolId);
    if (tool) {
        tool.usage = (tool.usage || 0) + 1;
        saveTools();
        updateDashboard();
        window.open(tool.url, '_blank');
        showNotification('Tool launched!', 'info');
    }
}

function copyToolUrl(toolId) {
    const tool = tools.find(t => t.id === toolId);
    if (tool) {
        navigator.clipboard.writeText(tool.url).then(() => {
            showNotification('URL copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Failed to copy URL', 'error');
        });
    }
}

function showRandomTool() {
    if (tools.length === 0) {
        showNotification('No tools available to pick a random one!', 'error');
        document.getElementById('randomToolContent').innerHTML = `<p>No tools available. Add some tools to use this feature!</p>`;
        return;
    }

    const randomTool = tools[Math.floor(Math.random() * tools.length)];
    const randomToolContent = document.getElementById('randomToolContent');

    randomToolContent.innerHTML = `
        <div style="background: var(--light-bg); padding: 20px; border-radius: 8px; margin: 15px 0; color: var(--text-primary);">
            <h4 style="margin: 0 0 10px 0; color: var(--primary-color);">${escapeHtml(randomTool.title)}</h4>
            <p style="margin: 0 0 10px 0; color: var(--text-secondary);">${escapeHtml(randomTool.description || 'No description available')}</p>
            <div style="margin: 10px 0;">
                ${(randomTool.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                 ${randomTool.category && randomTool.subCategory ? `<span class="tag" style="background: var(--success-color);">${escapeHtml(getDisplayCategoryName(randomTool.subCategory))}</span>` : ''}
            </div>
            <button class="btn btn-primary" onclick="launchTool('${randomTool.id}')" style="margin-top: 10px;">
                <i class="fas fa-external-link-alt"></i>
                Open Tool
            </button>
        </div>
    `;
}

// Intelligence Vault Specific Functions
function renderIntelligenceVaultTopTabs() {
    const topTabsContainer = document.getElementById('intelligenceVaultTopTabs');
    topTabsContainer.innerHTML = intelligenceVaultTabStructure.map(category => `
        <div class="intelligence-vault-tab ${category.id === currentIntelligenceVaultCategory ? 'active' : ''}" data-category-id="${category.id}">
            <i class="${category.icon}"></i>
            <span>${escapeHtml(category.name)}</span>
        </div>
    `).join('');

    document.querySelectorAll('.intelligence-vault-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const categoryId = this.dataset.categoryId;
            switchIntelligenceVaultCategory(categoryId);
        });
    });
}

function switchIntelligenceVaultCategory(categoryId) {
    if (currentIntelligenceVaultCategory === categoryId) return; // Already active

    currentIntelligenceVaultCategory = categoryId;
    localStorage.setItem('osint_currentIntelliVaultCat', currentIntelligenceVaultCategory);

    // Set default sub-category for the new top category
    const topCategory = intelligenceVaultTabStructure.find(cat => cat.id === categoryId);
    if (topCategory && topCategory.children && topCategory.children.length > 0) {
        currentIntelligenceVaultSubCategory = topCategory.children[0].id;
        localStorage.setItem('osint_currentIntelliVaultSubCat', currentIntelligenceVaultSubCategory);
    } else {
        currentIntelligenceVaultSubCategory = ''; // No sub-category
        localStorage.removeItem('osint_currentIntelliVaultSubCat');
    }
    
    renderIntelligenceVaultTopTabs(); // Re-render to update active state
    renderIntelligenceVaultSubTabs(currentIntelligenceVaultCategory); // Render sub-tabs for new category
    filterIntelligenceVaultTools(); // Filter tools based on new category/sub-category
    clearToolSelection(); // Clear selection when changing categories
}

function renderIntelligenceVaultSubTabs(topCategoryId) {
    const subTabsContainer = document.getElementById('intelligenceVaultSubTabs');
    const topCategory = intelligenceVaultTabStructure.find(cat => cat.id === topCategoryId);

    if (topCategory && topCategory.children && topCategory.children.length > 0) {
        subTabsContainer.innerHTML = topCategory.children.map(subCat => `
            <div class="intelligence-vault-sub-tab ${subCat.id === currentIntelligenceVaultSubCategory ? 'active' : ''}" data-subcategory-id="${subCat.id}">
                <i class="${subCat.icon}"></i>
                <span>${escapeHtml(subCat.name)}</span>
            </div>
        `).join('');
        subTabsContainer.style.display = 'flex'; // Show sub-tabs
    } else {
        subTabsContainer.innerHTML = '';
        subTabsContainer.style.display = 'none'; // Hide sub-tabs if no children
    }

    document.querySelectorAll('.intelligence-vault-sub-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const subCategoryId = this.dataset.subcategoryId;
            switchIntelligenceVaultSubCategory(subCategoryId);
        });
    });
}

function switchIntelligenceVaultSubCategory(subCategoryId) {
    if (currentIntelligenceVaultSubCategory === subCategoryId) return; // Already active

    currentIntelligenceVaultSubCategory = subCategoryId;
    localStorage.setItem('osint_currentIntelliVaultSubCat', currentIntelligenceVaultSubCategory);

    renderIntelligenceVaultSubTabs(currentIntelligenceVaultCategory); // Re-render to update active state
    filterIntelligenceVaultTools(); // Filter tools based on new sub-category
    clearToolSelection(); // Clear selection when changing sub-categories
}

function toggleListView() {
    viewMode = (viewMode === 'grid' ? 'list' : 'grid');
    localStorage.setItem('viewMode', viewMode);
    updateViewModeDisplay();
    filterIntelligenceVaultTools(); // Re-render tools to apply new view mode
}

function updateViewModeDisplay() {
    const viewModeIcon = document.getElementById('viewModeIcon');
    const viewModeText = document.getElementById('viewModeText');
    if (viewMode === 'list') {
        viewModeIcon.className = 'fas fa-th-large';
        viewModeText.textContent = 'Grid View';
    } else {
        viewModeIcon.className = 'fas fa-list';
        viewModeText.textContent = 'List View';
    }
    // Also apply to multi-vault if it's currently active
    const multiVaultGrid = document.getElementById('currentVaultTools');
    if (multiVaultGrid) {
         multiVaultGrid.classList.remove('list-view', 'grid-view');
         multiVaultGrid.classList.add(viewMode === 'list' ? 'list-view' : 'grid-view');
    }
}

function filterByStarred() {
    clearAllFilters(false); // Clear other filters but don't re-render yet
    const starredTools = tools.filter(tool =>
        tool.favorite &&
        tool.category === getTopCategoryName(currentIntelligenceVaultCategory) &&
        tool.subCategory === currentIntelligenceVaultSubCategory
    );
    renderTools(starredTools, 'intelligenceVaultToolsGrid');
    showNotification('Showing starred tools!', 'info');
}

function filterByPinned() {
    clearAllFilters(false); // Clear other filters but don't re-render yet
    const pinnedTools = tools.filter(tool =>
        tool.pinned &&
        tool.category === getTopCategoryName(currentIntelligenceVaultCategory) &&
        tool.subCategory === currentIntelligenceVaultSubCategory
    );
    renderTools(pinnedTools, 'intelligenceVaultToolsGrid');
    showNotification('Showing pinned tools!', 'info');
}

function clearAllFilters(doRender = true) {
    document.getElementById('searchInput').value = '';
    document.getElementById('sortFilter').value = localStorage.getItem('defaultSort') || 'alphabetical'; // Reset to default sort

    if (doRender) {
        filterIntelligenceVaultTools();
        showNotification('All filters cleared!', 'info');
    }
}

// Tool Selection and Bulk Actions
function toggleToolSelection(toolId, isChecked) {
    if (isChecked) {
        selectedToolIds.add(toolId);
    } else {
        selectedToolIds.delete(toolId);
    }
    updateBulkActionsBar();
}

function updateBulkActionsBar() {
    const bulkActionsBar = document.getElementById('bulkActionsBar');
    const selectedCountSpan = document.getElementById('selectedToolsCount');

    if (selectedToolIds.size > 0) {
        selectedCountSpan.textContent = `${selectedToolIds.size} tool${selectedToolIds.size > 1 ? 's' : ''} selected`;
        bulkActionsBar.classList.add('active');
    } else {
        bulkActionsBar.classList.remove('active');
    }
}

function bulkStarToggle() {
    if (selectedToolIds.size === 0) {
        showNotification('No tools selected for this action.', 'warning');
        return;
    }

    const firstSelectedToolIsStarred = tools.find(t => t.id === Array.from(selectedToolIds)[0])?.favorite;
    const newState = !firstSelectedToolIsStarred; // Toggle based on the first selected item's state

    selectedToolIds.forEach(toolId => {
        const tool = tools.find(t => t.id === toolId);
        if (tool) {
            tool.favorite = newState;
        }
    });
    saveTools();
    filterIntelligenceVaultTools(); // Re-render to update star icons
    showNotification(`${selectedToolIds.size} tool${selectedToolIds.size > 1 ? 's' : ''} ${newState ? 'starred' : 'unstarred'}!`, 'success');
    clearToolSelection();
}

function bulkPinToggle() {
     if (selectedToolIds.size === 0) {
        showNotification('No tools selected for this action.', 'warning');
        return;
    }

    const firstSelectedToolIsPinned = tools.find(t => t.id === Array.from(selectedToolIds)[0])?.pinned;
    const newState = !firstSelectedToolIsPinned;

    selectedToolIds.forEach(toolId => {
        const tool = tools.find(t => t.id === toolId);
        if (tool) {
            tool.pinned = newState;
        }
    });
    saveTools();
    filterIntelligenceVaultTools();
    showNotification(`${selectedToolIds.size} tool${selectedToolIds.size > 1 ? 's' : ''} ${newState ? 'pinned' : 'unpinned'}!`, 'success');
    clearToolSelection();
}

function bulkDeleteSelected() {
    if (selectedToolIds.size === 0) {
        showNotification('No tools selected for deletion.', 'warning');
        return;
    }

    if (confirm(`Are you sure you want to delete ${selectedToolIds.size} selected tool(s)? This will remove them from all vaults as well.`)) {
        tools = tools.filter(t => !selectedToolIds.has(t.id));
        // Also remove from all vaults
        for (const vaultId in vaults) {
            vaults[vaultId].tools = vaults[vaultId].tools.filter(id => !selectedToolIds.has(id));
        }
        saveTools();
        saveVaults();
        filterIntelligenceVaultTools();
        renderCurrentVault(); // Update multi-vault
        showNotification(`${selectedToolIds.size} tool${selectedToolIds.size > 1 ? 's' : ''} deleted successfully!`, 'success');
        clearToolSelection();
    }
}

function clearToolSelection() {
    selectedToolIds.clear();
    document.querySelectorAll('.tool-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    updateBulkActionsBar();
}


// Vault Management (Multi-Vault) - Existing functions with minor adjustments
function renderVaultTabs() {
    const vaultTabs = document.getElementById('vaultTabs');
    const sortedVaultIds = Object.keys(vaults).sort((a, b) => {
        if (a === 'default') return -1;
        if (b === 'default') return 1;
        return vaults[a].name.localeCompare(vaults[b].name);
    });

    vaultTabs.innerHTML = sortedVaultIds.map(vaultId => {
        const isActive = vaultId === currentVault ? 'active' : '';
        const deleteButton = vaultId !== 'default' ? `<button class="vault-delete" onclick="deleteVault(event, '${vaultId}')">&times;</button>` : '';
        return `
            <div class="vault-tab ${isActive}" data-vault="${vaultId}">
                <span>${escapeHtml(vaults[vaultId].name)}</span>
                ${deleteButton}
            </div>
        `;
    }).join('') + `
        <button class="btn btn-primary" onclick="createNewVault()">
            <i class="fas fa-plus"></i>
            New Vault
        </button>
    `;

    document.querySelectorAll('.vault-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchVault(this.dataset.vault);
        });
    });
}

function switchVault(vaultId, renderTabs = true) {
    currentVault = vaultId;
    saveVaults();
    if (renderTabs) {
        renderVaultTabs();
    }
    renderCurrentVault();
}

function renderCurrentVault() {
    const vault = vaults[currentVault];
    if (!vault) {
        currentVault = 'default';
        saveVaults();
        renderVaultTabs();
        renderCurrentVault();
        return;
    }

    const vaultTools = tools.filter(tool => vault.tools.includes(tool.id));

    document.getElementById('vaultNotes').value = vault.notes || '';

    const currentVaultToolsEl = document.getElementById('currentVaultTools');
    // Apply view mode to multi-vault grid
    currentVaultToolsEl.classList.remove('list-view', 'grid-view');
    currentVaultToolsEl.classList.add(viewMode === 'list' ? 'list-view' : 'grid-view');

    if (vaultTools.length === 0) {
        currentVaultToolsEl.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <i class="fas fa-folder-open" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3>No tools in this vault</h3>
                <p>Add tools from the Intelligence Vault (drag & drop, or edit tool and assign to vault) to organize them here!</p>
            </div>
        `;
        return;
    }

    currentVaultToolsEl.innerHTML = vaultTools.map(tool => `
        <div class="tool-card" data-tool-id="${tool.id}" draggable="true">
            ${tool.pinned ? '<i class="fas fa-thumbtack pin-icon" title="Pinned"></i>' : ''}
            <div class="tool-header">
                <div class="tool-favicon">
                    <i class="fas fa-link"></i>
                </div>
                <div class="tool-info">
                    <div class="tool-title">${escapeHtml(tool.title)}</div>
                    <div class="tool-url">${escapeHtml(tool.url)}</div>
                </div>
                <button class="tool-btn btn-remove" onclick="removeFromVault('${tool.id}')" title="Remove from vault">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="tool-description">${escapeHtml(tool.description || 'No description available')}</div>
            <div class="tool-tags">
                ${(tool.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                ${tool.category && tool.subCategory ? `<span class="tag" style="background: var(--success-color);">${escapeHtml(getDisplayCategoryName(tool.subCategory))}</span>` : ''}
            </div>
            <div class="tool-actions">
                <button class="tool-btn btn-launch" onclick="launchTool('${tool.id}')" title="Open tool">
                    <i class="fas fa-external-link-alt"></i>
                </button>
                <button class="tool-btn btn-copy" onclick="copyToolUrl('${tool.id}')" title="Copy URL">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        </div>
    `).join('');

    vaultTools.forEach(tool => {
        loadFavicon(tool.id, tool.url);
    });
}

function createNewVault() {
    let name = prompt('Enter the name for your new vault:');
    if (name && name.trim()) {
        name = name.trim();
        const nameExists = Object.values(vaults).some(vault => vault.name.toLowerCase() === name.toLowerCase());
        if (nameExists) {
            showNotification('A vault with this name already exists. Please choose a different name.', 'error');
            return;
        }

        const vaultId = generateId();
        vaults[vaultId] = {
            name: name,
            tools: [],
            notes: ''
        };
        saveVaults();
        renderVaultTabs();
        switchVault(vaultId);
        showNotification('Vault created successfully!', 'success');
    } else if (name !== null) {
        showNotification('Vault name cannot be empty.', 'error');
    }
}

function deleteVault(event, vaultId) {
    event.stopPropagation();
    if (vaultId === 'default') {
        showNotification('Cannot delete the Default Vault.', 'error');
        return;
    }
    if (confirm(`Are you sure you want to delete the vault "${vaults[vaultId].name}"? This action cannot be undone.`)) {
        delete vaults[vaultId];
        if (currentVault === vaultId) {
            currentVault = 'default';
        }
        saveVaults();
        renderVaultTabs();
        renderCurrentVault();
        showNotification('Vault deleted successfully!', 'success');
    }
}

function saveVaultNotes() {
    const notes = document.getElementById('vaultNotes').value;
    if (vaults[currentVault]) {
        vaults[currentVault].notes = notes;
        saveVaults();
        showNotification('Notes saved!', 'success');
    } else {
        showNotification('Error: Current vault not found.', 'error');
    }
}

function removeFromVault(toolId) {
    const vault = vaults[currentVault];
    if (vault) {
        vault.tools = vault.tools.filter(id => id !== toolId);
        saveVaults();
        renderCurrentVault();
        showNotification('Tool removed from vault!', 'success');
    }
}

// Utility Functions
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Theme Management
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    if (isDarkMode) {
        icon.className = 'fas fa-sun';
        text.textContent = 'Light Mode';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark Mode';
    }
}

// Data Management
function exportData() {
    const data = {
        tools,
        vaults,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osint-tools-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Data exported successfully!', 'success');
}

function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.tools && Array.isArray(data.tools)) {
                if (confirm('This will replace all existing data. Continue?')) {
                    tools = data.tools;
                    // Ensure default vault exists and is populated with imported tools
                    if (!data.vaults || !data.vaults.default) {
                        vaults = {"default": {"name": "Default Vault", "tools": tools.map(t => t.id), "notes": ""}};
                    } else {
                        vaults = data.vaults;
                        // Make sure all imported tools are in at least the default vault if they aren't in any other
                        const allVaultTools = new Set();
                        for (const vaultId in vaults) {
                            vaults[vaultId].tools.forEach(toolId => allVaultTools.add(toolId));
                        }
                        tools.forEach(tool => {
                            if (!allVaultTools.has(tool.id)) {
                                vaults['default'].tools.push(tool.id);
                            }
                        });
                    }

                    currentVault = 'default'; // Reset current vault to default after import
                    saveTools();
                    saveVaults();
                    initializeApp();
                    // Re-render the intelligence vault correctly after import
                    renderIntelligenceVaultTopTabs();
                    renderIntelligenceVaultSubTabs(currentIntelligenceVaultCategory);
                    filterIntelligenceVaultTools();
                    showNotification('Data imported successfully!', 'success');
                }
            } else {
                showNotification('Invalid file format: "tools" array not found or invalid.', 'error');
            }
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Error reading or parsing file. Please ensure it\'s a valid JSON export.', 'error');
        }
    };
    reader.readAsText(file);
}


function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone!')) {
        tools = [];
        vaults = {"default": {"name": "Default Vault", "tools": [], "notes": ""}};
        currentVault = 'default';
        localStorage.removeItem('osint_tools');
        localStorage.removeItem('osint_vaults');
        localStorage.removeItem('osint_currentVault');
        localStorage.removeItem('osint_currentIntelliVaultCat');
        localStorage.removeItem('osint_currentIntelliVaultSubCat');
        localStorage.removeItem('defaultSort');
        localStorage.removeItem('toolsPerRow');
        localStorage.removeItem('defaultViewMode');

        initializeApp();
        // Re-render the intelligence vault correctly after clearing
        renderIntelligenceVaultTopTabs();
        renderIntelligenceVaultSubTabs(currentIntelligenceVaultCategory);
        filterIntelligenceVaultTools();
        showNotification('All data cleared!', 'success');
    }
}

function saveSettings() {
    const defaultSort = document.getElementById('defaultSort').value;
    const toolsPerRow = document.getElementById('toolsPerRow').value;
    const defaultViewMode = document.getElementById('defaultViewMode').value;

    localStorage.setItem('defaultSort', defaultSort);
    localStorage.setItem('toolsPerRow', toolsPerRow);
    localStorage.setItem('defaultViewMode', defaultViewMode);

    // Apply settings instantly
    document.getElementById('sortFilter').value = defaultSort; // Apply to current intelligence vault filter
    document.documentElement.style.setProperty('--tools-per-row', toolsPerRow === 'auto' ? 'auto-fit' : toolsPerRow);

    viewMode = defaultViewMode; // Update global view mode
    updateViewModeDisplay(); // Update button text and class for intelligence vault

    filterIntelligenceVaultTools(); // Re-render tools with new sort/view
    renderCurrentVault(); // Re-render multi-vault to apply view mode

    showNotification('Settings saved!', 'success');
}

function checkBrokenLinks() {
    if (tools.length === 0) {
        showNotification('No tools to check!', 'error');
        return;
    }

    showNotification('Checking links... This may take a moment. Note: Due to browser security, this check might not detect all broken links on external sites.', 'info', 5000); // Extended notification time
    let checkedCount = 0;
    const brokenLinks = [];

    tools.forEach(tool => {
        // Using fetch with no-cors will only check for network connectivity, not HTTP status codes for cross-origin requests.
        // For a more accurate check of broken links on external sites, a server-side proxy or a browser extension is required.
        fetch(tool.url, { method: 'HEAD', mode: 'no-cors' })
            .then(response => {
                // Even for a successful network request with no-cors, response.ok will be false.
                // We primarily rely on the .catch() for network errors.
            })
            .catch(() => {
                brokenLinks.push(tool);
            })
            .finally(() => {
                checkedCount++;
                if (checkedCount === tools.length) {
                    if (brokenLinks.length === 0) {
                        showNotification('All checked links appear to be working (no network errors detected)!', 'success');
                    } else {
                        const brokenTitles = brokenLinks.map(tool => tool.title).join(', ');
                        showNotification(`Found ${brokenLinks.length} potentially broken links: ${brokenTitles}.`, 'warning', 7000);
                    }
                }
            });
    });
}


// Drag and Drop functionality
function handleDragEnter(e) {
    e.preventDefault();
    const isURL = e.dataTransfer.types.includes('text/uri-list') || e.dataTransfer.types.includes('text/plain');
    if (isURL) {
        document.getElementById('dragOverlay').classList.add('drag-active');
    }
}

function handleDragOver(e) {
    e.preventDefault();
    const isURL = e.dataTransfer.types.includes('text/uri-list') || e.dataTransfer.types.includes('text/plain');
    if (isURL) {
        document.getElementById('dragOverlay').classList.add('drag-active');
    }
}

function handleDrop(e) {
    e.preventDefault();
    document.getElementById('dragOverlay').classList.remove('drag-active');

    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (url && isValidUrl(url)) {
        const existingTool = tools.find(tool => tool.url === url);
        if (existingTool) {
            // If the tool exists, add it to the current active intelligence vault sub-category
            // if it belongs to that main category and not already in sub-category
            const topCategoryName = getTopCategoryName(currentIntelligenceVaultCategory);
            if (existingTool.category !== topCategoryName || existingTool.subCategory !== currentIntelligenceVaultSubCategory) {
                existingTool.category = topCategoryName;
                existingTool.subCategory = currentIntelligenceVaultSubCategory;
                saveTools();
                filterIntelligenceVaultTools();
                showNotification(`"${existingTool.title}" moved to current sub-category!`, 'success');
            } else {
                 showNotification('This tool already exists in this sub-category.', 'info');
            }
            return;
        }

        // Pre-fill the add tool modal with the dropped URL
        openAddToolModal('intelligence-vault'); // Open modal for intelligence vault context
        document.getElementById('toolUrl').value = url;

        // Try to extract title from URL
        try {
            const urlObj = new URL(url);
            let title = urlObj.hostname.replace('www.', ''); // Basic attempt
            title = title.split('.')[0]; // Get just the main part of the domain
            title = title.charAt(0).toUpperCase() + title.slice(1); // Capitalize first letter
            document.getElementById('toolTitle').value = title;
        } catch (e) {
            // Ignore error, title can be manually entered
        }

        showNotification('URL detected! Fill in the details to add the tool.', 'info');
    } else {
        showNotification('Dropped item is not a valid URL.', 'error');
    }
}

function handleDragLeave(e) {
    const relatedTarget = e.relatedTarget;
    const dragOverlay = document.getElementById('dragOverlay');

    if (!relatedTarget || (relatedTarget !== dragOverlay && !dragOverlay.contains(relatedTarget))) {
         document.getElementById('dragOverlay').classList.remove('drag-active');
    }
}

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}