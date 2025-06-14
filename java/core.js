// core.js

// --- Main Application State ---
let appState = {
    tools: [],
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
    caseStudies: [],
    selectedEntries: new Set(),
    currentTab: 'dashboard',
    currentIntelligenceVaultParentTab: 'generalAndCore',
    currentIntelligenceVaultChildTab: 'tools',
    currentCustomVaultEntrySubTab: 'tool',
    currentCustomVaultParentTab: 'coreInvestigation',
    customTabs: [],
    filters: {
        category: '',
        search: '',
        sort: 'name',
        searchScope: 'currentTab'
    },
    caseStudyFilters: {
        search: '',
        type: ''
    },
    theme: localStorage.getItem('theme') || 'dark',
    viewMode: localStorage.getItem('viewMode') || 'grid',
    usageStats: {
        toolsUsedToday: 0
    },
    osintTips: [
        "Always use a VPN for anonymity during investigations.",
        "Verify your sources: Cross-reference information from multiple independent channels.",
        "Analyze metadata: Hidden data in images and documents can reveal crucial clues.",
        "Utilize archived web pages with tools like the Wayback Machine.",
        "Be mindful of your digital footprint; everything you do online leaves a trace.",
        "Learn advanced search operators for targeted information retrieval.",
        "Understand your target's OPSEC (Operational Security) to anticipate their moves.",
        "Never compromise your own security for an investigation. Think OPSEC first."
    ],
    threatHuntingScripts: [],
    selectedScripts: new Set(),
    currentThSubTab: 'script-library',
    scriptFilters: {
        search: '',
        language: ''
    },
    timeline: {
        events: [],
        currentTimelineId: null,
        timelines: [],
    },
    readOnlyMode: false,
    sharedTabId: null,
    sharedEntryIds: []
};

// --- GLOBAL STATE OBJECTS (explicitly initialized) ---
// These are separate from appState but need to be globally accessible.
let notesState = { 
    notes: [], 
    currentNote: null, 
    editMode: false, 
    noteSortFilter: localStorage.getItem('noteSortFilter') || 'updated_desc' 
};

let dorkAssistantState = { 
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


// --- Default Data & Structures (all constants moved to core.js for early access) ---
const defaultTools = [
    {
        id: 'google-advanced-search',
        type: 'tool',
        name: 'Google Advanced Search',
        url: 'https://www.google.com/advanced_search',
        category: 'search engines',
        intelligenceVaultCategories: ['tools'],
        description: 'Advanced search operators and techniques for comprehensive information gathering',
        tags: ['search', 'google', 'operators'],
        starred: false,
        pinned: false,
        favicon: 'https://www.google.com/favicon.ico',
        lastUsed: 0,
        addedDate: new Date('2023-01-15T10:00:00Z'),
        customTabs: [],
        origin: 'pre-added'
    },
    {
        id: 'shodan',
        type: 'tool',
        name: 'Shodan',
        url: 'https://www.shodan.io',
        category: 'network analysis',
        intelligenceVaultCategories: ['tools'],
        description: 'Search engine for Internet-connected devices and systems',
        tags: ['iot', 'network', 'scanning', 'security'],
        starred: true,
        pinned: false,
        favicon: 'https://www.shodan.io/static/img/favicon.png',
        lastUsed: 0,
        addedDate: new Date('2023-02-20T11:30:00Z'),
        customTabs: [],
        origin: 'pre-added'
    },
    {
        id: 'maltego',
        type: 'tool',
        name: 'Maltego',
        url: 'https://www.maltego.com',
        category: 'network analysis',
        intelligenceVaultCategories: ['tools'],
        description: 'Link analysis and data mining application for gathering and connecting information',
        tags: ['analysis', 'visualization', 'mapping'],
        starred: false,
        pinned: true,
        favicon: 'https://www.maltego.com/favicon.ico',
        lastUsed: 0,
        addedDate: new Date('2023-03-01T14:00:00Z'),
        customTabs: [],
        origin: 'pre-added'
    },
    {
        id: 'have-i-been-pwned',
        type: 'tool',
        name: 'Have I Been Pwned',
        url: 'https://haveibeenpwned.com',
        category: 'email investigation',
        intelligenceVaultCategories: ['emailTools'],
        description: 'Check if email addresses have been compromised in data breaches',
        tags: ['breach', 'email', 'security', 'compromise'],
        starred: true,
        pinned: false,
        favicon: 'https://haveibeenpwned.com/favicon.ico',
        lastUsed: 0,
        addedDate: new Date('2023-04-10T09:00:00Z'),
        customTabs: [],
        origin: 'pre-added'
    },
    {
        id: 'virustotal',
        type: 'tool',
        name: 'VirusTotal',
        url: 'https://www.virustotal.com',
        category: 'threat intelligence',
        intelligenceVaultCategories: ['tools'],
        description: 'Analyze suspicious files and URLs to detect types of malware',
        tags: ['malware', 'analysis', 'threat', 'security'],
        starred: false,
        pinned: false,
        favicon: 'https://www.virustotal.com/gui/images/favicon.png',
        lastUsed: 0,
        addedDate: new Date('2023-05-05T16:00:00Z'),
        customTabs: [],
        origin: 'pre-added'
    },
    {
        id: 'wayback-machine',
        type: 'tool',
        name: 'Wayback Machine',
        url: 'https://web.archive.org',
        category: 'archive',
        intelligenceVaultCategories: ['tools'],
        description: 'Browse historical snapshots of websites',
        tags: ['archive', 'history', 'web', 'research'],
        starred: false,
        pinned: false,
        favicon: 'https://web.archive.org/static/images/favicon.ico',
        lastUsed: 0,
        addedDate: new Date('2023-06-01T08:00:00Z'),
        customTabs: [],
        origin: 'pre-added'
    },
    {
        id: 'whois-lookup',
        type: 'tool',
        name: 'WHOIS Lookup',
        url: 'https://whois.net',
        category: 'domain research',
        intelligenceVaultCategories: ['tools'],
        description: 'Domain registration and ownership information',
        tags: ['domain', 'registration', 'ownership'],
        starred: false,
        pinned: false,
        favicon: 'https://whois.net/favicon.ico',
        lastUsed: 0,
        addedDate: new Date('2023-07-12T13:00:00Z'),
        customTabs: [],
        origin: 'pre-added'
    },
    {
        id: 'tineye',
        type: 'tool',
        name: 'TinEye',
        url: 'https://tineye.com',
        category: 'image analysis',
        intelligenceVaultCategories: ['mediaTools'],
        description: 'Reverse image search engine',
        tags: ['image', 'reverse', 'search', 'verification'],
        starred: false,
        pinned: false,
        favicon: 'https://tineye.com/favicon.ico',
        lastUsed: 0,
        addedDate: new Date('2023-08-20T10:00:00Z'),
        customTabs: [],
        origin: 'pre-added'
    },{
        id: 'tor-browser',
        type: 'tool',
        name: 'Tor Browser',
        url: 'https://www.torproject.org/',
        category: 'anonymity',
        intelligenceVaultCategories: ['darkWebTools'],
        description: 'Free and open-source software for enabling anonymous communication.',
        tags: ['anonymity', 'privacy', 'darkweb', 'browser'],
        starred: false,
        pinned: false,
        favicon: 'https://www.torproject.org/favicon.ico',
        lastUsed: 0,
        addedDate: new Date('2024-01-01T08:00:00Z'),
        customTabs: [],
        origin: 'pre-added'
    },
    {
        id: 'nmap',
        type: 'tool',
        name: 'Nmap (Network Mapper)',
        url: 'https://nmap.org/',
        category: 'network scanning',
        intelligenceVaultCategories: ['vulnerabilityTools'],
        description: 'Free and open-source utility for network discovery and security auditing.',
        tags: ['network', 'scanning', 'vulnerability', 'auditing'],
        starred: false,
        pinned: false,
        favicon: 'https://nmap.org/favicon.ico',
        lastUsed: 0,
        addedDate: new Date('2024-01-05T10:00:00Z'),
        customTabs: [],
        origin: 'pre-added'
    },
    {
        id: 'any-run',
        type: 'tool',
        name: 'Any.Run',
        url: 'https://any.run/',
        category: 'malware analysis',
        intelligenceVaultCategories: ['fileMalwareTools'],
        description: 'Interactive malware analysis service for dynamic investigation of threats.',
        tags: ['malware', 'analysis', 'sandbox', 'threats'],
        starred: false,
        pinned: false,
        favicon: 'https://any.run/favicon.ico',
        lastUsed: 0,
        addedDate: new Date('2024-01-10T12:00:00Z'),
        customTabs: [],
        origin: 'pre-added'
    },
    {
        id: 'splunk-phantom',
        type: 'tool',
        name: 'Splunk SOAR (Phantom)',
        url: 'https://www.splunk.com/en_us/software/security-orchestration-automation-response-phantom.html',
        category: 'security orchestration',
        intelligenceVaultCategories: ['threatIntelligenceTools'],
        description: 'Security Orchestration, Automation, and Response platform.',
        tags: ['soar', 'automation', 'threat-intel', 'security'],
        starred: false,
        pinned: false,
        favicon: 'https://www.splunk.com/etc/designs/splunk-website/clientlibs-all/images/favicon.ico',
        lastUsed: 0,
        addedDate: new Date('2024-01-15T14:00:00Z'),
        customTabs: [],
        origin: 'pre-added'
    },
    {
        id: 'openai-chatgpt',
        type: 'tool',
        name: 'OpenAI ChatGPT',
        url: 'https://chat.openai.com/',
        category: 'ai assistant',
        intelligenceVaultCategories: ['aiTools'],
        description: 'AI-powered chatbot for various tasks including data summarization and idea generation.',
        tags: ['ai', 'chatbot', 'generative-ai', 'research'],
        starred: false,
        pinned: false,
        favicon: 'https://chat.openai.com/favicon.ico',
        lastUsed: 0,
        addedDate: new Date('2024-01-20T16:00:00Z'),
        customTabs: [],
        origin: 'pre-added'
    }
];

const sampleCaseStudies = [{
    id: 'cs-solarwinds-001',
    title: 'SolarWinds Supply Chain Attack (SUNBURST)',
    incidentType: 'apt',
    dateRange: '2020 Q1 - 2021 Q2',
    summary: 'A sophisticated supply chain attack impacting SolarWinds Orion platform, allowing attackers to compromise thousands of organizations worldwide, including government agencies and Fortune 500 companies.',
    attackChain: `
        <h3>Phase 1: Initial Compromise & Supply Chain Injection</h3>
        <p>Attackers injected malicious code (SUNBURST backdoor) into SolarWinds Orion software updates. This was a highly stealthy operation, blending the malicious code with legitimate updates.</p>
        <ul>
            <li><strong>Method:</strong> Supply Chain Attack</li>
            <li><strong>Initial Vector:</strong> Compromised SolarWinds build environment</li>
        </ul>
        <h3>Phase 2: Distribution & Foothold</h3>
        <p>Victim organizations downloaded the trojanized Orion updates, which established a backdoor. The malware remained dormant for up to two weeks before activating.</p>
        <ul>
            <li><strong>Delivery:</strong> Legitimate software update</li>
            <li><strong>Persistence:</strong> Implanted backdoor within Orion software</li>
        </ul>
        <h3>Phase 3: Lateral Movement & Data Exfiltration</h3>
        <p>Once active, SUNBURST allowed attackers to escalate privileges, move laterally within victim networks, and steal sensitive data, including emails and intellectual property. Attackers often used compromised credentials to access cloud environments like Microsoft 365.</p>
        <ul>
            <li><strong>Techniques:</strong> Credential theft, Golden SAML, Lateral Movement, Cloud environment compromise</li>
            <li><strong>Impact:</strong> Data exfiltration, espionage</li>
        </ul>
    `,
    osintTechniquesUsed: ['DNS Recon', 'WHOIS Lookup', 'Public Records', 'Threat Intelligence Platform Analysis', 'Domain Squatting Checks'],
    toolsUsed: ['VirusTotal', 'Shodan', 'Passive DNS tools', 'Public record databases', 'Threat intelligence platforms'],
    lessonsLearned: `
        <p>This case study highlights the severe risks of supply chain attacks and the importance of robust security practices across the entire software development lifecycle.</p>
        <ul>
            <li><strong>Supply Chain Security:</strong> Implement strict vetting and continuous monitoring of third-party software and vendors.</li>
            <li><strong>Zero Trust Architecture:</strong> Adopt a zero-trust model where no entity is inherently trusted, regardless of its location.</li>
            <li><strong>MFA & Endpoint Detection:</strong> Enforce multi-factor authentication everywhere and deploy advanced endpoint detection and response (EDR) solutions.</li>
            <li><strong>Threat Hunting:</strong> Actively hunt for anomalous behavior, even when traditional security alerts are quiet.</li>
            <li><strong>Log Analysis:</strong> Centralize and analyze logs from all systems, including cloud services, for suspicious activity.</li>
        </ul>
    `,
    threatActor: 'APT29 (UNC2452 / Nobelium)',
    difficulty: 'advanced',
    tags: ['apt', 'supply-chain', 'espionage', 'government', 'microsoft', 'orion'],
    starred: true,
    pinned: false,
    addedDate: new Date('2021-03-10T09:00:00Z')
}, {
    id: 'cs-phishing-xyz-002',
    title: 'Phishing Attack on Healthcare Provider',
    incidentType: 'phishing',
    dateRange: '2024-05-15',
    summary: 'A targeted phishing campaign delivered ransomware disguised as urgent medical invoices, impacting a small regional healthcare provider and encrypting patient records.',
    attackChain: `
        <h3>Phase 1: Spear Phishing</h3>
        <p>Attackers crafted highly personalized emails targeting administrative staff, using publicly available information about the healthcare provider.</p>
        <ul>
            <li><strong>Method:</strong> Spear Phishing</li>
            <li><strong>Lure:</strong> Fake medical invoice attached</li>
        </ul>
        <h3>Phase 2: Malware Delivery & Execution</h3>
        <p>An attached malicious PDF (containing embedded malware) was opened by an unsuspecting employee. The malware then executed, initiating the ransomware payload.</p>
        <ul>
            <li><strong>Payload:</strong> Ransomware variant (e.g., Conti, LockBit)</li>
            <li><strong>Execution:</strong> Malicious document macro/exploit</li>
        </ul>
        <h3>Phase 3: Encryption & Extortion</h3>
        <p>The ransomware rapidly encrypted critical patient databases and internal network shares. Attackers demanded a cryptocurrency payment for decryption keys.</p>
        <ul>
            <li><strong>Impact:</strong> Data encryption, operational disruption, extortion</li>
        </ul>
    `,
    osintTechniquesUsed: ['Email Header Analysis', 'Domain Reputation Checks', 'Social Media Scanning (for employee info)', 'Public Records (for business contacts)'],
    toolsUsed: ['MXToolbox', 'VirusTotal', 'Have I Been Pwned', 'URLVoid', 'Email security gateways'],
    lessonsLearled: `
        <p>This case highlights the ongoing threat of phishing, especially against vulnerable sectors like healthcare.</p>
        <ul>
            <li><strong>Employee Training:</strong> Regular and effective cybersecurity awareness training for all staff.</li>
            <li><strong>Email Filtering:</strong> Implement robust email security solutions with advanced threat detection.</li>
            <li><strong>Backup Strategy:</strong> Maintain frequent, offline, and immutable backups of critical data.</li>
            <li><strong>Incident Response Plan:</strong> Have a well-tested incident response plan specifically for ransomware attacks.</li>
            <li><strong>Network Segmentation:</strong> Segment networks to limit lateral movement in case of a breach.</li>
        </ul>
    `,
    threatActor: 'Unattributed Cybercriminal Group',
    difficulty: 'intermediate',
    tags: ['ransomware', 'healthcare', 'phishing', 'cybercrime', 'data-encryption'],
    starred: false,
    pinned: true,
    addedDate: new Date('2024-05-20T14:30:00Z')
}, {
    id: 'cs-insider-003',
    title: 'Insider Threat: Data Exfiltration by Disgruntled Employee',
    incidentType: 'insider-threat',
    dateRange: '2023-11-01 to 2024-01-20',
    summary: 'A disgruntled former employee exfiltrated sensitive customer data before leaving the company, using unauthorized cloud storage services.',
    attackChain: `
        <h3>Phase 1: Unauthorized Access & Data Collection</h3>
        <p>The employee, while still employed, accessed internal databases beyond their normal job function, collecting customer records.</p>
        <ul>
            <li><strong>Method:</strong> Privilege Abuse</li>
            <li><strong>Source:</strong> Internal Database, CRM system</li>
        </ul>
        <h3>Phase 2: Data Staging & Obfuscation</h3>
        <p>Data was copied to local machine, compressed, and sometimes renamed to evade detection before being uploaded to personal cloud accounts.</p>
        <ul>
            <li><strong>Techniques:</strong> Data compression, renaming files</li>
            <li><strong>Tools:</strong> WinRAR, standard OS tools</li>
        </ul>
        <h3>Phase 3: Exfiltration</h3>
        <p>Sensitive data was uploaded to a personal cloud storage service (e.g., Dropbox, Google Drive) over several weeks, often outside business hours.</p>
        <ul>
            <li><strong>Vector:</strong> Cloud storage (e.g., Dropbox, Google Drive)</li>
            <li><strong>Timing:</strong> Off-hours activity</li>
        </ul>
        <h3>Phase 4: Post-Termination Access Attempt</h3>
        <p>Attempts to access internal systems were detected from the former employee's home IP address post-termination, triggering alarms and leading to forensic investigation.</p>
        <ul>
            <li><strong>Detection:</strong> Failed login attempts, IP monitoring</li>
        </ul>
    `,
    osintTechniquesUsed: ['Employee Social Media Monitoring (public info)', 'Email Address Recon (for personal accounts)', 'IP Geolocation', 'Domain/Cloud Provider WHOIS'],
    toolsUsed: ['OSINT Tools for social media search', 'IP lookup tools', 'Cloud service provider terms of service analysis'],
    lessonsLearned: `
        <p>Insider threats are difficult to detect but often leave digital breadcrumbs.</p>
        <ul>
            <li><strong>DLP (Data Loss Prevention):</strong> Implement and configure DLP solutions to monitor and block unauthorized data transfers to cloud services.</li>
            <li><strong>UBA (User Behavior Analytics):</strong> Deploy UBA tools to detect anomalous user behavior (e.g., accessing unusual files, large data transfers).</li>
            <li><strong>Strict Access Controls:</strong> Implement least privilege and role-based access control, regularly reviewing permissions.</li>
            <li><strong>Offboarding Procedures:</strong> Ensure immediate revocation of all access upon employee termination.</li>
            <li><strong>Log Monitoring:</strong> Continuously monitor and alert on unusual login patterns or access attempts from former employees.</li>
        </ul>
    `,
    threatActor: 'Disgruntled Employee (Internal)',
    difficulty: 'intermediate',
    tags: ['insider-threat', 'data-exfiltration', 'cloud-security', 'privilege-abuse', 'forensics'],
    starred: true,
    pinned: true,
    addedDate: new Date('2024-02-01T10:00:00Z')
}];

const timelineCategories = {
    "phishing": { name: "Phishing", icon: "fas fa-fish", color: "#e74c3c" },
    "initial_access": { name: "Initial Access", icon: "fas fa-door-open", color: "#3498db" },
    "lateral_movement": { name: "Lateral Movement", icon: "fas fa-arrows-alt-h", color: "#9b59b6" },
    "exfiltration": { name: "Data Exfiltration", icon: "fas fa-cloud-upload-alt", color: "#f1c40f" },
    "command_control": { name: "Command & Control", icon: "fas fa-satellite-dish", color: "#e67e22" },
    "reconnaissance": { name: "Reconnaissance", icon: "fas fa-binoculars", color: "#1abc9c" },
    "malware_delivery": { name: "Malware Delivery", icon: "fas fa-bug", color: "#d35400" },
    "persistence": { name: "Persistence", icon: "fas fa-redo-alt", color: "#f39c12" },
    "privilege_escalation": { name: "Privilege Escalation", icon: "fas fa-lock-open", color: "#16a085" },
    "defense_evasion": { name: "Defense Evasion", icon: "fas fa-shield-virus", color: "#c0392b" },
    "credential_access": { name: "Credential Access", icon: "fas fa-user-lock", color: "#2980b9" },
    "discovery": { name: "Discovery", icon: "fas fa-compass", color: "#8e44ad" },
    "collection": { name: "Collection", icon: "fas fa-box-open", color: "#27ae60" },
    "impact": { name: "Impact", icon: "fas fa-explosion", color: "#e74c3c" },
    "remediation": { name: "Remediation", icon: "fas fa-wrench", color: "#2ecc71" },
    "fraud": { name: "Financial Fraud", icon: "fas fa-money-check-alt", color: "#f1c40f" },
    "insider_threat": { name: "Insider Threat", icon: "fas fa-user-secret", color: "#c0392b" },
    "other": { name: "Other", icon: "fas fa-info-circle", color: "#7f8c8d" },
};

const availableIcons = [
    'fas fa-globe', 'fas fa-search', 'fas fa-fingerprint', 'fas fa-shield-alt',
    'fas fa-link', 'fas fa-network-wired', 'fas fa-envelope', 'fas fa-image',
    'fas fa-map-marker-alt', 'fas fa-book', 'fas fa-coins', 'fas fa-users',
    'fas fa-camera', 'fas fa-lock', 'fas fa-key', 'fas fa-bug', 'fas fa-cloud',
    'fas fa-mobile-alt', 'fas fa-server', 'fas fa-database', 'fas fa-code',
    'fas fa-chart-line', 'fas fa-user-secret', 'fas fa-lightbulb', 'fas fa-laptop-code',
    'fas fa-phone', 'fas fa-money-bill-wave', 'fas fa-video', 'fas fa-paste', 'fas fa-location-arrow',
    'fas fa-font',
    'fas fa-microscope', 'fab fa-windows', 'fab fa-python', 'fab fa-gofore', 'fas fa-file-code',
    'fas fa-honey-pot', 'fas fa-cogs', 'fas fa-hand-fist', 'fas fa-shield-virus', 'fas fa-dumpster',
    'fas fa-scale-balanced', 'fab fa-telegram-plane', 'fas fa-clipboard-list', 'fas fa-volume-up',
    'fas fa-face-id-card', 'fas fa-id-badge', 'fas fa-user-shield', 'fas fa-lock-open',
    'fas fa-bomb'
];

const availableColors = [
    'var(--tab-color-default)', 'var(--tab-color-red)', 'var(--tab-color-blue)',
    'var(--tab-color-green)', 'var(--tab-color-yellow)', 'var(--tab-color-purple)',
    'var(--tab-color-orange)'
];

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
            { id: 'facialRecognition', name: 'Facial Recognition', icon: 'fas fa-face-id-card' },
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

const customVaultEntryStructure = [{
    id: 'coreInvestigation',
    name: 'General',
    icon: 'fas fa-globe-americas',
    children: [
        { id: 'tool', name: 'General Tools', icon: 'fas fa-tools' },
        { id: 'keyword', name: 'Keyword & Text Analysis', icon: 'fas fa-font' },
        { id: 'ai', name: 'AI & Generative', icon: 'fas fa-brain' },
        { id: 'osintSearch', name: 'OSINT-Specific Search', icon: 'fas fa-search-dollar' },
        { id: 'archive', name: 'Archiving & Cache', icon: 'fas fa-archive' },
    ]
}, {
    id: 'identityCommunication',
    name: 'Identity/Social',
    icon: 'fas fa-users',
    children: [
        { id: 'username', name: 'Usernames & Handles', icon: 'fas fa-at' },
        { id: 'social', name: 'Social Media Profiles', icon: 'fas fa-users' },
        { id: 'email', name: 'Email Investigations', icon: 'fas fa-envelope' },
        { id: 'phone', name: 'Phone Number Analysis', icon: 'fas fa-phone' },
        { id: 'messaging', name: 'Messaging Apps & Comms', icon: 'fas fa-comment-dots' },
        { id: 'dating', name: 'Dating Apps', icon: 'fas fa-heart' },
        { id: 'persona', name: 'Persona Management', icon: 'fas fa-id-badge' },
        { id: 'facial', name: 'Facial Recognition', icon: 'fas fa-face-id-card' },
    ]
}, {
    id: 'digitalTrace',
    name: 'Footprints',
    icon: 'fas fa-fingerprint',
    children: [
        { id: 'domain', name: 'Domain/IP/URL Analysis', icon: 'fas fa-link' },
        { id: 'location', name: 'GEOINT & Mapping', icon: 'fas fa-map-marker-alt' },
        { id: 'crypto', name: 'Crypto Wallets & Transactions', icon: 'fas fa-coins' },
        { id: 'darkWeb', name: 'DarkWeb & Hidden Services', icon: 'fas fa-mask' },
        { id: 'metadata', name: 'Metadata Extractors', icon: 'fas fa-info' },
        { id: 'network', name: 'Network & System Analysis', icon: 'fas fa-network-wired' },
        { id: 'document', name: 'Document Analysis', icon: 'fas fa-file-alt' },
        { id: 'link', name: 'General Links', icon: 'fas fa-external-link-alt' },
    ]
}, {
    id: 'cyberIntel',
    name: 'Threat Intel',
    icon: 'fas fa-shield-alt',
    children: [
        { id: 'threat', name: 'Threat Intel Platforms', icon: 'fas fa-hand-fist' },
        { id: 'vulnerability', name: 'Vulnerability Research', icon: 'fas fa-bug' },
        { id: 'malware', name: 'File & Malware Analysis', icon: 'fas fa-file-code' },
        { id: 'honeypot', name: 'Honeypot Monitoring', icon: 'fas fa-honey-pot' },
        { id: 'exploit', name: 'Exploit/Market', icon: 'fas fa-bomb' },
    ]
}, {
    id: 'breachAndLeak',
    name: 'Breach/Leaks',
    icon: 'fas fa-database',
    children: [
        { id: 'password', name: 'Password Leaks', icon: 'fas fa-key' },
        { id: 'credential', name: 'Credential Dumps', icon: 'fas fa-cloud-download-alt' },
        { id: 'breach', name: 'Breached Databases', icon: 'fas fa-shield-virus' },
        { id: 'publicrecord', name: 'Public Records & Legal', icon: 'fas fa-scale-balanced' },
    ]
}, {
    id: 'undergroundSource',
    name: 'Forums/Markets',
    icon: 'fas fa-user-ninja',
    children: [
        { id: 'forum', name: 'Hacking & Security Forums', icon: 'fas fa-comments' },
        { id: 'vendor', name: 'Underground Vendor Tracking', icon: 'fas fa-user-tag' },
        { id: 'telegram', name: 'Telegram Channels', icon: 'fab fa-telegram-plane' },
        { id: 'paste', name: 'Paste Sites', icon: 'fas fa-clipboard-list' },
    ]
}, {
    id: 'mediaAnalysis',
    name: 'Media',
    icon: 'fas fa-image',
    children: [
        { id: 'media', name: 'Image & Video Analysis', icon: 'fas fa-camera' },
        { id: 'audio', name: 'Audio Analysis', icon: 'fas fa-volume-up' },
    ]
}, {
    id: 'opsecurity',
    name: 'OpSec',
    icon: 'fas fa-lock',
    children: [
        { id: 'vpn', name: 'Anonymity & VPNs', icon: 'fas fa-mask' },
        { id: 'secureComm', name: 'Secure Communication', icon: 'fas fa-lock-open' },
        { id: 'persona', name: 'Persona Management', icon: 'fas fa-id-badge' },
    ]
}, ];

const defaultThreatHuntingScripts = [ // Global constant, accessed by threat-intel-and-hunting.js
    {
        id: 'th-sysmon-proc-creation',
        name: 'Sysmon Process Creation Anomalies',
        description: 'PowerShell script to query Sysmon Event ID 1 (Process Creation) logs for suspicious executables launched from unusual directories (e.g., AppData, Temp) or by unusual parent processes.',
        language: 'powershell',
        code: `
        # Requires Sysmon Event ID 1 logging enabled
        # Searches for suspicious process creations

        $logName = "Microsoft-Windows-Sysmon/Operational"
        $eventName = 1 # Event ID for Process Create

        $suspiciousPaths = @(
            "\\AppData\\Local\\Temp\\",
            "\\Windows\\Temp\\",
            "\\ProgramData\\",
            "\\Users\\Public\\",
            "\\PerfLogs\\"
        )

        $suspiciousParents = @(
            "mshta.exe",
            "wscript.exe",
            "cscript.exe",
            "rundll32.exe",
            "regsvr32.exe",
            "cmd.exe",
            "powershell.exe"
        )

        Write-Host "Searching for Sysmon Event ID 1 (Process Create) with suspicious characteristics..."
        Write-Host "--------------------------------------------------------------------------------"

        Get-WinEvent -LogName $logName -FilterXPath "*[System[(EventID=$eventName)]]" -MaxEvents 5000 | ForEach-Object {
            $event = $_
            $eventData = [xml]$event.ToXml()
            $processName = $eventData.Event.EventData.Data | Where-Object {$_.Name -eq 'Image'} | Select-Object -ExpandProperty '#text'
            $parentProcessName = $eventData.Event.EventData.Data | Where-Object {$_.Name -eq 'ParentImage'} | Select-Object -ExpandProperty '#text'
            $commandLine = $eventData.Event.EventData.Data | Where-Object {$_.Name -eq 'CommandLine'} | Select-Object -ExpandProperty '#text'
            $originalFileName = $eventData.Event.EventData.Data | Where-Object {$_.Name -eq 'OriginalFileName'} | Select-Object -ExpandProperty '#text'

            $isSuspiciousPath = $false
            foreach ($path in $suspiciousPaths) {
                if ($processName -like "*$path*") {
                    $isSuspiciousPath = true
                    break
                }
            }

            $isSuspiciousParent = false
            foreach ($parent in $suspiciousParents) {
                if ($parentProcessName -like "*$parent*") {
                    $isSuspiciousParent = true
                    break
                }
            }
            
            if ($isSuspiciousPath -or $isSuspiciousParent) {
                Write-Host "Timestamp: $($event.TimeCreated)" -ForegroundColor Cyan
                Write-Host "Process:   $processName" -ForegroundColor Yellow
                Write-Host "Parent:    $parentProcessName" -ForegroundColor Yellow
                Write-Host "Command:   $commandLine" -ForegroundColor Green
                Write-Host "Reason:    Possible execution from suspicious path or by suspicious parent." -ForegroundColor Red
                Write-Host "---"
            }
        }
        Write-Host "Search complete."
                `,
        tags: ['sysmon', 'powershell', 'endpoint', 'process', 'anomalies', 'detection'],
        addedDate: new Date('2025-05-15T10:00:00Z'),
        usageCount: 0
    },
    {
        id: 'th-python-ip-reputation',
        name: 'Python IP Reputation Checker',
        description: 'Python script that takes a list of IP addresses and checks their reputation against a public API (e.g., ipinfo.io or VirusTotal, simplified example).',
        language: 'python',
        code: `
        import requests
        import json

        # IMPORTANT: This is a simplified example.
        # For a real-world script, you would use proper API keys
        # and handle rate limiting, errors, and specific API responses.
        # Example: Using ipinfo.io (free tier has limits)

        API_TOKEN = "YOUR_IPINFO_API_TOKEN" # Replace with your actual token
        IP_LIST = [
            "1.1.1.1", # Cloudflare DNS
            "8.8.8.8", # Google DNS
            "185.199.108.153", # Example potentially malicious IP (replace with actual IOCs)
            "92.204.148.169" # Example another IP
        ]

        print("Checking IP Reputation...")
        print("-" * 30)

        for ip in IP_LIST:
            try:
                response = requests.get(f"https://ipinfo.io/{ip}/json?token={API_TOKEN}")
                response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)
                data = response.json()

                print(f"IP: {ip}")
                print(f"  Country: {data.get('country', 'N/A')}")
                print(f"  Org:     {data.get('org', 'N/A')}")
                print(f"  Hostname: {data.get('hostname', 'N/A')}")
                print(f"  Location: {data.get('loc', 'N/A')}")

                # Add more reputation checks here (e.g., against VirusTotal, AbuseIPDB if you have APIs)
                # For demonstration, we'll just flag certain IPs
                if ip == "185.199.108.153": # This is a placeholder for a known bad IP
                    print("  Reputation: !!! SUSPICIOUS - Known Malicious (Example) !!!")
                else:
                    print("  Reputation: No immediate flag (Requires deeper analysis)")
                
                print("-" * 30)

            except requests.exceptions.RequestException as e:
                print(f"Error checking {ip}: {e}")
            except json.JSONDecodeError:
                print(f"Error decoding JSON response for {ip}")
            except Exception as e:
                print(f"An unexpected error occurred for {ip}: {e}")

        print("IP reputation check complete.")
                `,
        tags: ['network', 'ip', 'reputation', 'python', 'api'],
        addedDate: new Date('2025-05-20T14:30:00Z'),
        usageCount: 0
    },
    {
        id: 'th-bash-web-log-parser',
        name: 'Bash Web Log Parser',
        description: 'Bash script to quickly parse Apache/Nginx access logs for unusual HTTP status codes, suspicious user agents, or high request counts from a single IP.',
        language: 'bash',
        code: `
        #!/bin/bash

        LOG_FILE="/var/log/apache2/access.log" # Adjust path for your log file
        THRESHOLD_REQUESTS=500 # IP requests over this threshold
        SUSPICIOUS_STATUS_CODES="400|401|403|404|405|408|429|500|502|503|504" # Common error/client/server errors
        SUSPICIOUS_USER_AGENTS="sqlmap|nmap|curl|wget|nessus|nikto|bot|scanner" # Common scanning tools

        echo "Analyzing web server logs: \${LOG_FILE}"
        echo "-------------------------------------"

        if [[ ! -f "\${LOG_FILE}" ]]; then
            echo "Error: Log file not found at \${LOG_FILE}"
            exit 1
        fi

        echo "--- Top 10 IPs by Request Count ---"
        awk '{print \$1}' "\${LOG_FILE}" | sort | uniq -c | sort -nr | head -n 10
        echo ""

        echo "--- Requests with Suspicious Status Codes ---"
        grep -E "HTTP/1\\\.[01]\" (\${SUSPICIOUS_STATUS_CODES})" "\${LOG_FILE}" | head -n 20 # Show first 20 matches
        echo ""

        echo "--- Requests with Suspicious User Agents ---"
        grep -iE "User-Agent:.*(\${SUSPICIOUS_USER_AGENTS})" "\${LOG_FILE}" | head -n 20 # Show first 20 matches
        echo ""

        echo "--- IPs with High Request Counts (over \${THRESHOLD_REQUESTS}) ---"
        awk '{print \$1}' "\${LOG_FILE}" | sort | uniq -c | sort -nr | awk -v thresh="\$THRESHOLD_REQUESTS" '\$1 > thresh {print \$0}'
        echo ""

        echo "Log analysis complete."
                `,
        tags: ['logs', 'web', 'bash', 'network', 'detection'],
        addedDate: new Date('2025-05-25T09:15:00Z'),
        usageCount: 0
    }
];

// OSINT Handbook main functionality data (global constant, accessed by handbook-and-notes.js)
const handbookData = {
    sections: [
        {
        id: "getting-started",
        title: "Getting Started",
        icon: "fas fa-rocket",
        content: `
            <h2>Getting Started with OSINT</h2>
            <p>Open Source Intelligence (OSINT) is the collection and analysis of information from publicly available sources. This handbook will guide you through essential techniques, tools, and methodologies.</p>
            
            <h3>Basic Principles</h3>
            <p>Remember these fundamental principles when conducting OSINT investigations:</p>
            <ul>
            <li>Use secure, anonymous connections (VPNs, Tor)</li>
            <li>Create separate research personas</li>
            <li>Document everything</li>
            <li>Verify information through multiple sources</li>
            <li>Follow legal and ethical guidelines</li>
            </ul>
        `,
        },
        {
        id: "osint-framework",
        title: "OSINT Framework Overview",
        icon: "fas fa-sitemap",
        content: `
            <h2>OSINT Framework Overview</h2>
            <p>The OSINT Framework provides a structured approach to gathering intelligence across various domains.</p>
            
            <h3>Key Components</h3>
            <ul>
            <li><strong>Reconnaissance</strong>: Initial information gathering</li>
            <li><strong>Identification</strong>: Pinpointing relevant data sources</li>
            <li><strong>Collection</strong>: Systematic gathering of intelligence</li>
            <li><strong>Processing</strong>: Organizing and filtering collected data</li>
            <li><strong>Analysis</strong>: Deriving insights and connections</li>
            <li><strong>Reporting</strong>: Documenting findings in a structured format</li>
            </ul>
            
            <h3>OSINT Cycle</h3>
            <p>The OSINT process is cyclical, with each phase informing the next. As new information is discovered, you may need to revisit earlier phases to refine your search parameters.</p>
            
            <div class="code-block">
            <pre><code>Planning → Collection → Processing → Analysis → Dissemination → Feedback → Planning</code></pre>
            <button class="copy-btn" data-clipboard-target="#osint-cycle-code"><i class="fas fa-copy"></i></button>
            </div>
        `,
        },
        {
        id: "tools-category",
        title: "Tools by Category",
        icon: "fas fa-tools",
        isCategory: true,
        subcategories: [
            {
            id: "people-search",
            title: "People Search",
            icon: "fas fa-user-secret",
            content: `
                <h2>People Search Tools</h2>
                <p>These tools help locate and gather information about individuals through public records, social media, and other sources.</p>
                
                <h3>Essential Tools</h3>
                <ul>
                <li><strong>Pipl</strong>: Comprehensive people search engine</li>
                <li><strong>BeenVerified</strong>: Background check service</li>
                <li><strong>Spokeo</strong>: People search and public records</li>
                <li><strong>PeekYou</strong>: Searches across social networks</li>
                <li><strong>WebMii</strong>: Person-centric web search</li>
                </ul>
                
                <div class="code-block">
                <pre><code>/* Validate a phone number pattern */
    const validatePhone = (phone) => {
        const regex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;
        return regex.test(phone);
    }</code></pre>
                <button class="copy-btn" data-clipboard-target="#phone-validate-code"><i class="fas fa-copy"></i></button>
                </div>
                
                <div class="tag-section">
                <span class="tag">people</span>
                <span class="tag">social</span>
                <span class="tag">identity</span>
                <span class="tag">background</span>
                </div>
            `,
            },
            {
            id: "domain-whois",
            title: "Domain/WHOIS",
            icon: "fas fa-globe",
            content: `
                <h2>Domain & WHOIS Investigation Tools</h2>
                <p>These tools allow investigators to gather information about domain registrations, ownership, and infrastructure.</p>
                
                <h3>Key Tools</h3>
                <ul>
                <li><strong>WHOIS Lookup</strong>: Domain registration information</li>
                <li><strong>DomainTools</strong>: Domain profile and history</li>
                <li><strong>ViewDNS.info</strong>: Multiple DNS research tools</li>
                <li><strong>Shodan</strong>: Internet-connected device search engine</li>
                <li><strong>SecurityTrails</strong>: Historical DNS data</li>
                </ul>
                
                <div class="code-block">
                <pre><code>/* Basic WHOIS lookup using command line */
    whois example.com

    /* Reverse IP lookup using host command */
    host example.com</code></pre>
                <button class="copy-btn" data-clipboard-target="#whois-code"><i class="fas fa-copy"></i></button>
                </div>
                
                <div class="tag-section">
                <span class="tag">domain</span>
                <span class="tag">dns</span>
                <span class="tag">hosting</span>
                <span class="tag">infrastructure</span>
                </div>
            `,
            },
            {
            id: "crypto-tracking",
            title: "Crypto Tracking",
            icon: "fas fa-coins",
            content: `
                <h2>Cryptocurrency Tracking Tools</h2>
                <p>These tools help track and analyze cryptocurrency transactions, wallets, and entities across various blockchains.</p>
                
                <h3>Essential Tools</h3>
                <ul>
                <li><strong>Blockchain.com Explorer</strong>: Bitcoin blockchain analysis</li>
                <li><strong>Etherscan</strong>: Ethereum blockchain explorer</li>
                <li><strong>Chainalysis</strong>: Advanced cryptocurrency investigation</li>
                <li><strong>CipherTrace</strong>: Financial crime tracking in crypto</li>
                <li><strong>Crystal Blockchain</strong>: Crypto AML and analytics</li>
                </ul>
                
                <div class="code-block">
                <pre><code>/* Example API call to get Bitcoin address information */
    curl -X GET "https://blockchain.info/rawaddr/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"</code></pre>
                <button class="copy-btn" data-clipboard-target="#crypto-code"><i class="fas fa-copy"></i></button>
                </div>
                
                <div class="tag-section">
                <span class="tag">crypto</span>
                <span class="tag">blockchain</span>
                <span class="tag">bitcoin</span>
                <span class="tag">ethereum</span>
                </div>
            `,
            }
        ]
        },
        {
        id: "techniques",
        title: "Techniques",
        icon: "fas fa-lightbulb",
        isCategory: true,
        subcategories: [
            {
            id: "pivoting",
            title: "Pivoting",
            icon: "fas fa-network-wired",
            content: `
                <h2>Pivoting Techniques</h2>
                <p>Pivoting is the process of using discovered information to find new leads and expand your investigation.</p>
                
                <h3>Key Pivoting Methods</h3>
                <ul>
                <li><strong>Email Pivoting</strong>: Use email addresses to discover accounts across platforms</li>
                <li><strong>Username Pivoting</strong>: Track usernames across multiple services</li>
                <li><strong>Image Pivoting</strong>: Use reverse image search to find related content</li>
                <li><strong>Network Pivoting</strong>: Map connections between people and organizations</li>
                <li><strong>Domain Pivoting</strong>: Find related websites and infrastructure</li>
                </ul>
                
                <h3>Practical Example</h3>
                <p>Starting with an email address, you might:</p>
                <ol>
                <li>Check email breach databases for password history</li>
                <li>Search for the email in document metadata</li>
                <li>Use the username portion to search social platforms</li>
                <li>Look up the domain for related websites</li>
                <li>Search for the email in forum posts and comments</li>
                </ol>
                
                <div class="tag-section">
                <span class="tag">pivoting</span>
                <span class="tag">methodology</span>
                <span class="tag">investigation</span>
                </div>
            `,
            },
            {
            id: "sock-puppets",
            title: "Sock Puppet Accounts",
            icon: "fas fa-user-secret",
            content: `
                <h2>Sock Puppet Accounts</h2>
                <p>Sock puppets are alternate online identities created for research purposes to protect your real identity during investigations.</p>
                
                <h3>Creation Guidelines</h3>
                <ul>
                <li>Use a dedicated device or VM if possible</li>
                <li>Always access through VPN/Tor</li>
                <li>Create a complete, consistent backstory</li>
                <li>Use generated photos for profiles (never your own)</li>
                <li>Maintain regular activity to build history</li>
                <li>Never connect to personal accounts or information</li>
                </ul>
                
                <div class="code-block">
                <pre><code>/* OPSEC checklist for sock puppets */
    1. Separate email account
    2. Unique username not used elsewhere
    3. Unique password not used elsewhere
    4. 2FA on a dedicated device
    5. Consistent profile details
    6. Regular login patterns
    7. No personal information leakage</code></pre>
                <button class="copy-btn" data-clipboard-target="#sockpuppet-code"><i class="fas fa-copy"></i></button>
                </div>
                
                <div class="tag-section">
                <span class="tag">identity</span>
                <span class="tag">opsec</span>
                <span class="tag">anonymity</span>
                </div>
            `,
            }
        ]
        },
        {
        id: "cheat-sheets",
        title: "Cheat Sheets",
        icon: "fas fa-file-alt",
        isCategory: true,
        subcategories: [
            {
            id: "command-line",
            title: "Command Line Tools",
            icon: "fas fa-terminal",
            content: `
                <h2>Command Line OSINT Tools</h2>
                <p>These command-line tools can significantly enhance your OSINT capabilities and automation.</p>
                
                <h3>Essential CLI Tools</h3>
                <div class="code-block">
                <pre><code># Recon-ng - Full-featured reconnaissance framework
    pip install recon-ng

    # TheHarvester - Email, subdomain and name harvester
    theHarvester -d example.com -b google,linkedin

    # Sherlock - Hunt down social media accounts by username
    python3 sherlock username

    # Amass - In-depth DNS enumeration
    amass enum -d example.com

    # Shodan CLI - Internet device search
    shodan search --fields ip_str,port,org,hostnames apache</code></pre>
                <button class="copy-btn" data-clipboard-target="#cli-tools-code"><i class="fas fa-copy"></i></button>
                </div>
                
                <h3>Quick Reference: Google Dorks</h3>
                <div class="code-block">
                <pre><code># Find specific file types
    filetype:pdf "confidential"

    # Search within a site
    site:example.com password

    # Find exposed directories
    intitle:"index of" "parent directory"

    # Find exposed cameras
    intitle:"webcamXP 5"

    # Find exposed databases
    intitle:"Index of" phpmyadmin</code></pre>
                <button class="copy-btn" data-clipboard-target="#google-dorks-code"><i class="fas fa-copy"></i></button>
                </div>
                
                <div class="tag-section">
                <span class="tag">cli</span>
                <span class="tag">terminal</span>
                <span class="tag">automation</span>
                <span class="tag">dorks</span>
                </div>
            `,
            }
        ]
        }
    ]
};

// dorkTemplates are global, no need to re-declare in each file using them.
const dorkTemplates = { // Global constant, accessed by dork-assistant.js
    "General OSINT": [{
        id: 'exposed_docs',
        name: 'Exposed Documents',
        description: 'Finds publicly accessible PDF, DOCX, or XLSX files containing sensitive terms.',
        keywords: '',
        custom: 'filetype:pdf OR filetype:docx OR filetype:xlsx confidential OR secret',
        engine: 'google'
    }, {
        id: 'login_pages',
        name: 'Admin Login Pages',
        description: 'Discovers common admin login interfaces.',
        keywords: '',
        custom: 'intitle:"Login" inurl:admin OR inurl:auth',
        engine: 'google'
    }, {
        id: 'sensitive_files',
        name: 'Sensitive Filetypes',
        description: 'Identifies configuration files, database backups, or environment files.',
        keywords: '',
        custom: 'inurl:config OR inurl:backup OR inurl:db filetype:sql OR filetype:env',
        engine: 'google'
    }, {
        id: 'pastebin_search',
        name: 'Pastebin Leaks',
        description: 'Searches Pastebin for common sensitive terms or patterns indicating leaks.',
        keywords: 'site:pastebin.com',
        custom: 'password OR "api key" OR "private key"',
        engine: 'google'
    }],
    "IoT / Devices": [{
        id: 'webcams',
        name: 'Open Webcams',
        description: 'Locates publicly accessible webcams and live streams.',
        keywords: '',
        custom: 'intitle:"webcamXP" OR intitle:"live view" inurl:viewerframe.html',
        engine: 'google'
    }, {
        id: 'printers',
        name: 'Network Printers',
        description: 'Finds network-connected printers accessible via web interfaces.',
        keywords: '',
        custom: 'intitle:"printer" inurl:web/guest/en/websys/status/view.htm',
        engine: 'google'
    }, {
        id: 'routers_modems',
        name: 'Router/Modem Interfaces',
        description: 'Discovers common router or modem login pages.',
        keywords: 'intitle:"router setup" OR intitle:"modem config"',
        custom: 'inurl:setup.cgi OR inurl:main.html',
        engine: 'google'
    }],
    "Social Media": [{
        id: 'linkedin_profiles',
        name: 'LinkedIn Profiles',
        description: 'Searches for LinkedIn profiles by job title or keywords within the profile.',
        keywords: '"site:linkedin.com/in"',
        custom: '',
        engine: 'google'
    }, {
        id: 'twitter_emails',
        name: 'Twitter User Emails',
        description: 'Attempts to find email addresses mentioned in public Twitter profiles or tweets.',
        keywords: '"site:twitter.com" "email"',
        custom: '',
        engine: 'google'
    }, {
        id: 'facebook_public',
        name: 'Facebook Public Posts',
        description: 'Searches public Facebook posts for specific terms (limited by Facebook privacy).',
        keywords: 'site:facebook.com/posts',
        custom: '',
        engine: 'google'
    }],
    "Database / Server": [{
        id: 'sql_errors',
        name: 'SQL Injection Errors',
        description: 'Detects common database error messages that may indicate SQL injection vulnerabilities.',
        keywords: '',
        custom: 'intext:"SQL syntax" OR intext:"mysql_fetch_array" OR intext:"Warning: mysql_connect()"',
        engine: 'google'
    }, {
        id: 'phpmyadmin',
        name: 'phpMyAdmin Panels',
        description: 'Discovers publicly accessible phpMyAdmin database management interfaces.',
        keywords: '',
        custom: 'inurl:phpmyadmin intitle:"phpMyAdmin"',
        engine: 'google'
    }, {
        id: 'database_config',
        name: 'Database Config Files',
        description: 'Finds exposed database configuration files that might contain credentials.',
        keywords: 'filetype:sql OR filetype:conf',
        custom: 'intext:"password" OR "username" "database"',
        engine: 'google'
    }],
     "Vulnerability Research": [{
        id: 'cve_poc',
        name: 'CVE PoC/Exploits',
        description: 'Searches for Proof-of-Concept code or exploits related to specific CVEs.',
        keywords: 'github.com',
        custom: 'CVE-202X-XXXXX "PoC" OR "exploit"',
        engine: 'google'
    }, {
        id: 'exploitdb_search',
        name: 'Exploit-DB Search',
        description: 'Finds exploits listed on Exploit-DB for specific software or versions.',
        keywords: 'site:exploit-db.com',
        custom: 'apache OR nginx',
        engine: 'google'
    }],
    "File / Document Analysis": [{
        id: 'git_config',
        name: 'Git Config Files',
        description: 'Discovers exposed Git configuration files that might contain sensitive information.',
        keywords: 'inurl:.git/config',
        custom: '',
        engine: 'google'
    }, {
        id: 'log_files',
        name: 'Exposed Log Files',
        description: 'Identifies publicly accessible server log files.',
        keywords: 'inurl:access.log OR inurl:error.log',
        custom: '',
        engine: 'google'
    }],
    "Network Intelligence": [{
        id: 'open_ports_shodan',
        name: 'Shodan: Open Ports',
        description: 'Shodan query to find hosts with specific open ports (e.g., 22, 80, 443).',
        keywords: '',
        custom: 'port:22 OR port:80 OR port:443',
        engine: 'shodan'
    }, {
        id: 'c2_servers_shodan',
        name: 'Shodan: C2 Servers',
        description: 'Shodan query to identify potential Command and Control servers.',
        keywords: '',
        custom: 'tag:c2 OR "command and control"',
        engine: 'shodan'
    }, {
        id: 'self_signed_certs_censys',
        name: 'Censys: Self-Signed Certs',
        description: 'Censys query to find hosts using self-signed SSL certificates, often found on internal systems.',
        keywords: '',
        custom: 'services.tls.certificates.leaf_data.basic_constraints.is_ca: true and services.tls.certificates.chain.length: 1',
        engine: 'censys'
    }]
};


// --- Core Utility Functions ---

/**
 * Generates a unique ID string.
 * @returns {string} A unique ID.
 */
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Shows a toast notification.
 * @param {string} message - The message to display.
 * @param {string} type - The type of toast ('success', 'error', 'warning', 'info').
 * @param {number} duration - How long the toast should be visible in milliseconds.
 */
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

    toastContainer.appendChild(toast);

    void toast.offsetWidth; // Trigger reflow
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
}

/**
 * Copies text to the clipboard.
 * @param {string} text - The text to copy.
 */
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('Copied to clipboard!', 'success', 1500);
    } catch (err) {
        console.error('Failed to copy text: ', err);
        showToast('Failed to copy to clipboard.', 'error');
    }
    document.body.removeChild(textarea);
}


/**
 * Formats a timestamp into a human-readable relative time string.
 * @param {number|Date} timestamp - The timestamp to format.
 * @returns {string} The formatted time string.
 */
function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44);
    const years = Math.floor(days / 365.25);

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

/**
 * Reads a File object as a Base64 encoded string.
 * @param {File} file - The file to read.
 * @returns {Promise<string>} A promise that resolves with the Base64 string.
 */
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

/**
 * Loads the application state from localStorage.
 */
function loadState() {
    const savedState = localStorage.getItem('osintArsenalState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);

        // Explicitly initialize all array properties with empty arrays first,
        // so they are never undefined, even if not present in older savedState.
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
        appState.caseStudies = [];
        appState.threatHuntingScripts = [];


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

        appState.threatHuntingScripts = (parsedState.threatHuntingScripts || []).map(script => ({
            ...script,
            addedDate: script.addedDate ? new Date(script.addedDate) : null,
            usageCount: script.usageCount || 0
        }));

        // Load case studies data (from case-studies.js)
        // Assumes loadCaseStudiesData is globally available (e.g., loaded before core.js or defined directly in core.js)
        appState.caseStudies = loadCaseStudiesData();

        // Timeline Events
        appState.timeline = parsedState.timeline || { events: [] };
        appState.timeline.events.forEach(event => {
            if (typeof event.timestamp === 'string') {
                event.timestamp = new Date(event.timestamp);
            }
        });

        // Ensure other appState properties are loaded/initialized safely
        appState.selectedEntries = new Set(Array.isArray(parsedState.selectedEntries) ? parsedState.selectedEntries : []);
        appState.filters = parsedState.filters || {
            category: '',
            search: '',
            sort: 'name',
            searchScope: 'currentTab'
        };
        appState.caseStudyFilters = parsedState.caseStudyFilters || {
            search: '',
            type: ''
        };
        appState.scriptFilters = parsedState.scriptFilters || {
            search: '',
            language: ''
        };
        appState.theme = parsedState.theme || 'dark';
        appState.viewMode = parsedState.viewMode || 'grid';
        appState.usageStats = parsedState.usageStats || { toolsUsedToday: 0 };
        appState.customTabs = parsedState.customTabs || [];
        appState.currentCustomTab = parsedState.currentCustomTab && appState.customTabs.some(t => t.id === parsedState.currentCustomTab) ? parsedState.currentCustomTab : (appState.customTabs.length > 0 ? appState.customTabs[0].id : null);
        appState.currentIntelligenceVaultParentTab = parsedState.currentIntelligenceVaultParentTab || 'generalAndCore';
        appState.currentIntelligenceVaultChildTab = parsedState.dorkAssistantState?.currentIntelligenceVaultChildTab || 'tools'; // Fixed to use dorkAssistantState
        appState.currentCustomVaultParentTab = parsedState.currentCustomVaultParentTab || 'coreInvestigation';
        appState.currentCustomVaultEntrySubTab = parsedState.currentCustomVaultEntrySubTab || 'tool';
        appState.currentThSubTab = parsedState.currentThSubTab || 'script-library';

        // Load notesState (from handbook-and-notes.js data structure)
        if (parsedState.notesState) {
            Object.assign(notesState, parsedState.notesState);
            notesState.notes.forEach(note => {
                note.createdAt = new Date(note.createdAt);
                note.updatedAt = new Date(note.updatedAt);
                if (typeof note.pinned === 'undefined') {
                    note.pinned = false;
                }
            });
        }

        // Load dorkAssistantState (from dork-assistant.js data structure)
        if (parsedState.dorkAssistantState) {
            Object.assign(dorkAssistantState, parsedState.dorkAssistantState);
            if (dorkAssistantState.savedQueries) {
                dorkAssistantState.savedQueries.forEach(query => {
                    if (query.createdAt && typeof query.createdAt === 'string') {
                        query.createdAt = new Date(query.createdAt);
                    }
                });
            }
        }

        appState.customVaultViewMode = parsedState.customVaultViewMode || 'entries';

        // Merge default tools after loading saved state
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
        appState.currentThSubTab = 'script-library';

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
        appState.threatHuntingScripts = [];

        // Load sample case studies only on first-time use
        // Assumes loadCaseStudiesData is globally available (e.g., loaded before core.js or defined directly in core.js)
        appState.caseStudies = loadCaseStudiesData();

        // Assumes createSampleTimelineEvents is globally available (e.g., loaded before core.js or defined directly in core.js)
        appState.timeline = {
            events: createSampleTimelineEvents()
        };

        // Initialize global state objects if no saved state
        Object.assign(notesState, { notes: [], currentNote: null, editMode: false, noteSortFilter: 'updated_desc' });
        Object.assign(dorkAssistantState, {
            keywords: '',
            customInput: '',
            engine: 'google',
            previewQuery: '',
            convertedQuery: '',
            currentDorkSubTab: 'query-playground',
            savedQueries: [],
            properties: parsedState.dorkAssistantState?.properties || {}, // Preserve properties if they exist
            savedQuerySearchTerm: '',
            currentTemplateCategory: 'All Templates',
            preTemplateSearchTerm: '',
            conversionJustPerformed: false
        });

        appState.caseStudyFilters = { search: '', type: '' };
        appState.scriptFilters = { search: '', language: '' };
        appState.customVaultViewMode = 'entries';
    }
}

/**
 * Saves the entire application state to localStorage.
 */
function saveState() {
    const stateToSave = JSON.parse(JSON.stringify(appState));

    // Convert Date objects within the timeline events to ISO strings for storage
    if (stateToSave.timeline && stateToSave.timeline.events) {
        stateToSave.timeline.events.forEach(event => {
            if (event.timestamp && typeof event.timestamp.toISOString === 'function') {
                event.timestamp = event.timestamp.toISOString();
            }
        });
    }

    // Convert Date objects for tools
    if (stateToSave.tools) {
        stateToSave.tools.forEach(tool => {
            if (tool.addedDate && typeof tool.addedDate.toISOString === 'function') {
                tool.addedDate = tool.addedDate.toISOString();
            }
        });
    }

    // Attach the *current* state of the global notesState and dorkAssistantState objects
    // directly to the `stateToSave` object before stringifying.
    stateToSave.notesState = JSON.parse(JSON.stringify(notesState));
    if (stateToSave.notesState.notes) {
        stateToSave.notesState.notes.forEach(note => {
            if (note.createdAt && typeof note.createdAt.toISOString === 'function') {
                note.createdAt = note.createdAt.toISOString();
            }
            if (note.updatedAt && typeof note.updatedAt.toISOString === 'function') {
                note.updatedAt = note.updatedAt.toISOString();
            }
        });
    }

    stateToSave.dorkAssistantState = JSON.parse(JSON.stringify(dorkAssistantState));
    if (stateToSave.dorkAssistantState.savedQueries) {
        stateToSave.dorkAssistantState.savedQueries.forEach(query => {
            if (query.createdAt && typeof query.createdAt.toISOString === 'function') {
                query.createdAt = query.createdAt.toISOString();
            }
        });
    }

    // Convert Date objects for case studies
    if (stateToSave.caseStudies) {
        stateToSave.caseStudies.forEach(cs => {
            if (cs.addedDate && typeof cs.addedDate.toISOString === 'function') {
                cs.addedDate = cs.addedDate.toISOString();
            }
        });
    }

    if (stateToSave.threatHuntingScripts) {
        stateToSave.threatHuntingScripts.forEach(script => {
            if (script.addedDate && typeof script.addedDate.toISOString === 'function') {
                script.addedDate = script.addedDate.toISOString();
            }
        });
    }

    localStorage.setItem('osintArsenalState', JSON.stringify(stateToSave));
}

// --- Theme Management ---
function initTheme() {
    document.documentElement.setAttribute('data-theme', appState.theme);
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        if (appState.theme === 'dark') {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggleBtn.title = 'Switch to Light Theme';
        } else {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            themeToggleBtn.title = 'Switch to Dark Theme';
        }
    }
}

function toggleTheme() {
    if (appState.readOnlyMode) {
        showToast("Cannot change theme in read-only shared view.", "warning");
        return;
    }
    appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', appState.theme);
    initTheme();
    showToast(`Switched to ${appState.theme} theme.`);
}

// --- Shareable Link Logic ---
function parseShareableLink() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedScope = urlParams.get('scope');
    const sharedTab = urlParams.get('tab');
    const sharedIds = urlParams.get('ids');

    if (sharedScope && sharedTab && sharedIds) {
        appState.readOnlyMode = true;
        appState.sharedTabId = sharedTab;
        appState.sharedEntryIds = sharedIds.split(',');

        showToast("You are viewing a shared, read-only version of OSINTVault. Functionality is limited.", "info", 10000);

        disableAllInputsAndButtons();
    }
}

function disableAllInputsAndButtons() {
    document.querySelectorAll('input, select, textarea, button').forEach(element => {
        if (element.id !== 'themeToggle' && element.id !== 'continueAnywayBtn' &&
            element.id !== 'searchInput' && element.id !== 'searchScopeSelect' &&
            !element.classList.contains('nav-tab') && !element.classList.contains('mobile-menu-toggle') &&
            element.id !== 'mobileSearchInput' && element.id !== 'mobileSearchScopeSelect' &&
            !element.classList.contains('close-menu-btn')) {
            
            element.disabled = true;
            element.style.pointerEvents = 'none';
            element.style.opacity = '0.7';
        }
    });

    const mainSearchInput = document.getElementById('searchInput');
    if (mainSearchInput) {
        mainSearchInput.disabled = false;
        mainSearchInput.style.pointerEvents = 'auto';
        mainSearchInput.style.opacity = '1';
    }

    const mainSearchScopeSelect = document.getElementById('searchScopeSelect');
    if (mainSearchScopeSelect) {
        mainSearchScopeSelect.disabled = false;
        mainSearchScopeSelect.style.pointerEvents = 'auto';
        mainSearchScopeSelect.style.opacity = '1';
    }

    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.disabled = false;
        tab.style.pointerEvents = 'auto';
        tab.style.opacity = '1';
    });

    const elementsToHideInReadOnly = [
        'addToolBtnIntelligenceVault', 'addEntryBtnCustomVault', 'createSubTabBtn', 'editSubTabBtn',
        'deleteSubTabBtn', 'exportSubTabBtn', 'bulkActions', 'reportBtn', 'exportBtn',
        'refreshThreatsBtn', 'newRandomBtn', 'clearFiltersBtn', 'pinAllBtn', 'starAllBtn',
        'viewToggle', 'vaultViewToggle', 'customVaultViewToggle',
        'new-note-btn', 'noteSortFilter', 'search-notes', 'edit-note-btn', 'save-note-btn',
        'cancel-edit-note-btn', 'back-to-notes-btn', 'formatting-toolbar', 'tag-input-container',
        'add-section-btn', 'edit-section-btn', 'delete-section-btn',
        'addCaseStudyBtn', 'addCaseStudyEmptyStateBtn',
        'addScriptBtn', 'addScriptEmptyStateBtn',
        'addTimelineEventBtn', 'exportTimelineBtn', 'importTimelineBtn', 'addEventBtnEmptyState',
        'saveCurrentDorkBtn'
    ];

    elementsToHideInReadOnly.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'none';
        }
    });

    document.querySelectorAll('.tool-card .tool-actions .action-btn, .note-card .note-actions .note-action-btn, .timeline-event-actions .action-btn').forEach(btn => {
        btn.style.display = 'none';
    });

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

    const conversionSection = document.getElementById('editExecuteConversionSection');
    if (conversionSection) {
        conversionSection.style.display = 'none';
    }

    const saveDorkQueryBtnInModal = document.querySelector('#saveDorkQueryModal button[type="submit"]');
    if (saveDorkQueryBtnInModal) {
        saveDorkQueryBtnInModal.disabled = true;
        saveDorkQueryBtnInModal.style.pointerEvents = 'none';
        saveDorkQueryBtnInModal.style.opacity = '0.7';
    }
}


function applyReadOnlyMode() {
    if (appState.readOnlyMode) {
        disableAllInputsAndButtons();
    }
}

// --- Dashboard Functions (MOVED HERE from dashboard.js) ---

/**
 * Updates all statistics, charts, and lists displayed on the Dashboard tab.
 */
function updateDashboard() {
    const allEntries = [
        ...(appState.tools || []),
        ...(appState.emails || []),
        ...(appState.phones || []),
        ...(appState.crypto || []),
        ...(appState.locations || []),
        ...(appState.links || []),
        ...(appState.media || []),
        ...(appState.passwords || []),
        ...(appState.keywords || []),
        ...(appState.socials || []),
        ...(appState.domains || []),
        ...(appState.usernames || []),
        ...(appState.threats || []),
        ...(appState.vulnerabilities || []),
        ...(appState.malware || []),
        ...(appState.breaches || []),
        ...(appState.credentials || []),
        ...(appState.forums || []),
        ...(appState.vendors || []),
        ...(appState.telegramChannels || []),
        ...(appState.pastes || []),
        ...(appState.documents || []),
        ...(appState.networks || []),
        ...(appState.metadataEntries || []),
        ...(appState.archives || []),
        ...(appState.messagingApps || []),
        ...(appState.datingProfiles || []),
        ...(appState.audioEntries || []),
        ...(appState.facialRecognition || []),
        ...(appState.personas || []),
        ...(appState.vpns || []),
        ...(appState.honeypots || []),
        ...(appState.exploits || []),
        ...(appState.publicRecords || []),
        ...(appState.caseStudies || [])
    ];

    document.getElementById('totalToolsCount').textContent = allEntries.length;
    document.getElementById('activeVaultsCount').textContent = appState.customTabs.length;
    document.getElementById('usedToolsTodayCount').textContent = appState.usageStats.toolsUsedToday;
    document.getElementById('notesCount').textContent = notesState.notes.length;


    const starredPinnedBreakdownList = document.getElementById('starredPinnedBreakdownList');
    if (starredPinnedBreakdownList) {
        let breakdownHtml = '';
        const entryTypes = [
            'tool', 'email', 'phone', 'crypto', 'location', 'link', 'media', 'password',
            'keyword', 'social', 'domain', 'username', 'threat', 'vulnerability', 'malware',
            'breach', 'credential', 'forum', 'vendor', 'telegram', 'paste', 'document',
            'network', 'metadata', 'archive', 'messaging', 'dating', 'audio', 'facial',
            'persona', 'vpn', 'honeypot', 'exploit', 'publicrecord', 'caseStudy'
        ];

        const typeCounts = {};
        allEntries.forEach(entry => {
            let typeKey = entry.type;
            if (typeKey === 'telegram') typeKey = 'telegramChannels';
            if (typeKey === 'metadata') typeKey = 'metadataEntries';
            if (typeKey === 'messaging') typeKey = 'messagingApps';
            if (typeKey === 'dating') typeKey = 'datingProfiles';
            if (typeKey === 'audio') typeKey = 'audioEntries';
            if (typeKey === 'facial') typeKey = 'facialRecognition';
            if (typeKey === 'persona') typeKey = 'personas';
            if (typeKey === 'vpn') typeKey = 'vpns';
            if (typeKey === 'caseStudy') typeKey = 'caseStudies';

            if (!typeCounts[typeKey]) {
                typeCounts[typeKey] = {
                    starred: 0,
                    pinned: 0
                };
            }
            if (entry.starred) {
                typeCounts[typeKey].starred++;
            }
            if (entry.pinned) {
                typeCounts[typeKey].pinned++;
            }
        });

        breakdownHtml += `<li><span>Total Starred Entries:</span> <span class="stat-value">${allEntries.filter(e => e.starred).length}</span></li>`;
        breakdownHtml += `<li><span>Total Pinned Entries:</span> <span class="stat-value">${allEntries.filter(e => e.pinned).length}</span></li>`;
        breakdownHtml += `<li><hr style="border: 0; height: 1px; background: var(--border-light); margin: 10px 0;"></li>`;

        entryTypes.forEach(type => {
            let pluralType = type + 's';
            if (type === 'telegram') pluralType = 'telegramChannels';
            if (type === 'metadata') pluralType = 'metadataEntries';
            if (type === 'messaging') pluralType = 'messagingApps';
            if (type === 'dating') pluralType = 'datingProfiles';
            if (type === 'audio') pluralType = 'audioEntries';
            if (type === 'facial') pluralType = 'facialRecognition';
            if (type === 'persona') pluralType = 'personas';
            if (type === 'vpn') pluralType = 'vpns';
            if (type === 'caseStudy') pluralType = 'caseStudies';

            const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
            if (typeCounts[pluralType] && (typeCounts[pluralType].starred > 0 || typeCounts[pluralType].pinned > 0)) {
                if (typeCounts[pluralType].starred > 0) {
                    breakdownHtml += `<li><span>Starred ${capitalizedType}s:</span> <span class="stat-value">${typeCounts[pluralType].starred}</span></li>`;
                }
                if (typeCounts[pluralType].pinned > 0) {
                    breakdownHtml += `<li><span>Pinned ${capitalizedType}s:</span> <span class="stat-value">${typeCounts[pluralType].pinned}</span></li>`;
                }
            }
        });
        starredPinnedBreakdownList.innerHTML = breakdownHtml;
    }


    const intelVaultCategories = new Set((appState.tools || []).map(tool => tool.category));
    document.getElementById('intelVaultTotalTools').textContent = (appState.tools || []).length;
    document.getElementById('intelVaultStarredTools').textContent = (appState.tools || []).filter(tool => tool.starred).length;
    document.getElementById('intelVaultPinnedTools').textContent = (appState.tools || []).filter(tool => tool.pinned).length;
    document.getElementById('intelVaultCategoriesCount').textContent = intelVaultCategories.size;

    let totalEntriesInCustomVaults = 0;
    (appState.customTabs || []).forEach(tab => {
        totalEntriesInCustomVaults += (tab.toolIds || []).length;
    });
    const totalCustomVaults = (appState.customTabs || []).length;
    document.getElementById('customVaultsTotal').textContent = totalCustomVaults;
    document.getElementById('customVaultsTotalEntries').textContent = totalEntriesInCustomVaults;
    document.getElementById('customVaultsAvgEntries').textContent = totalCustomVaults > 0 ? (totalEntriesInCustomVaults / totalCustomVaults).toFixed(1) : '0';

    renderEntriesPerCustomVaultChart();


    const totalTemplates = Object.values(dorkTemplates).flat().length;
    document.getElementById('notesSummaryTotal').textContent = (notesState.notes || []).length;
    document.getElementById('notesSummaryPinned').textContent = (notesState.notes || []).filter(n => n.pinned).length;
    document.getElementById('dorksSummaryTotal').textContent = (dorkAssistantState.savedQueries || []).length;
    document.getElementById('dorksSummaryTemplates').textContent = totalTemplates;


    renderMostUsedTools();
    renderNeverUsedTools();
    renderToolsAddedPerWeek();

    renderEntriesByTypeChart();
    renderUsageTrendChart();
    renderTopCategoriesChart();
    renderPinnedStarredDonutChart();
    renderEntryGrowthOverTimeChart();
    renderTaggingOverviewChart();
}

/**
 * Renders a bar chart showing the number of entries per custom vault.
 */
function renderEntriesPerCustomVaultChart() {
    const ctx = document.getElementById('entriesPerCustomVaultChart');
    if (!ctx) return;
    const canvasContext = ctx.getContext('2d');
    
    const customVaultNames = appState.customTabs.map(tab => tab.name);
    const entriesPerVault = appState.customTabs.map(tab => tab.toolIds.length);

    if (window.entriesPerCustomVaultChartInstance) {
        window.entriesPerCustomVaultChartInstance.destroy();
    }

    window.entriesPerCustomVaultChartInstance = new Chart(canvasContext, {
        type: 'bar',
        data: {
            labels: customVaultNames,
            datasets: [{
                label: 'Entries per Custom Vault',
                data: entriesPerVault,
                backgroundColor: 'rgba(139, 92, 246, 0.7)',
                borderColor: '#8b5cf6',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Entries in Custom Vaults',
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
                    font: { size: 16 }
                },
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim(),
                        callback: function(value) {
                            if (Number.isInteger(value)) {
                                return value;
                            }
                        }
                    },
                    grid: { color: 'rgba(128, 128, 128, 0.1)' }
                },
                x: {
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() },
                    grid: { display: false }
                }
            }
        }
    });
}

/**
 * Renders a doughnut chart showing the proportion of tagged vs. untagged entries.
 */
function renderTaggingOverviewChart() {
    const ctx = document.getElementById('taggingOverviewChart');
    if (!ctx) return;
    const canvasContext = ctx.getContext('2d');
    
    const allEntries = [
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

    let taggedEntriesCount = 0;
    let untaggedEntriesCount = 0;

    allEntries.forEach(entry => {
        if (entry.tags && entry.tags.length > 0) {
            taggedEntriesCount++;
        } else {
            untaggedEntriesCount++;
        }
    });

    const data = [taggedEntriesCount, untaggedEntriesCount];
    const labels = ['Tagged Entries', 'Untagged Entries'];

    if (window.taggingOverviewChartInstance) {
        window.taggingOverviewChartInstance.destroy();
    }

    window.taggingOverviewChartInstance = new Chart(canvasContext, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#28a745',
                    '#dc3545'
                ],
                borderColor: 'var(--bg-primary)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Entry Tagging Overview',
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
                    font: { size: 16 }
                },
                legend: {
                    position: 'right',
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    }
                }
            }
        }
    });
}

/**
 * Renders a bar chart showing the distribution of tools by category.
 */
function renderTopCategoriesChart() {
    const ctx = document.getElementById('topCategoriesChart');
    if (!ctx) return;
    const canvasContext = ctx.getContext('2d');

    const categoryCounts = {};
    appState.tools.forEach(tool => {
        const category = tool.category.charAt(0).toUpperCase() + tool.category.slice(1);
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const labels = Object.keys(categoryCounts);
    const data = Object.values(categoryCounts);

    if (window.topCategoriesChartInstance) {
        window.topCategoriesChartInstance.destroy();
    }
    window.topCategoriesChartInstance = new Chart(canvasContext, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tools per Category',
                data: data,
                backgroundColor: 'rgba(0, 123, 255, 0.7)',
                borderColor: '#007bff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Tools by Category', color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() },
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() }, grid: { color: 'rgba(128, 128, 128, 0.1)' } },
                x: { ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() }, grid: { display: false } }
            }
        }
    });
}

/**
 * Renders a doughnut chart showing the proportion of pinned, starred, and other entries.
 */
function renderPinnedStarredDonutChart() {
    const ctx = document.getElementById('pinnedStarredDonutChart');
    if (!ctx) return;
    const canvasContext = ctx.getContext('2d');

    const allEntries = [
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

    const pinnedCount = allEntries.filter(entry => entry.pinned).length;
    const starredCount = allEntries.filter(entry => entry.starred).length;

    const bothCount = allEntries.filter(entry => entry.pinned && entry.starred).length;
    const uniquePinnedOrStarredCount = pinnedCount + starredCount - bothCount;
    const othersCount = allEntries.length - uniquePinnedOrStarredCount;

    const data = [pinnedCount, starredCount, othersCount];
    const labels = ['Pinned', 'Starred', 'Other Entries'];

    if (window.pinnedStarredDonutChartInstance) {
        window.pinnedStarredDonutChartInstance.destroy();
    }
    window.pinnedStarredDonutChartInstance = new Chart(canvasContext, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#28a745', '#ffc107', '#6c757d'],
                borderColor: 'var(--bg-primary)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Pinned & Starred Entries', color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() },
                legend: { position: 'right', labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() } }
            }
        }
    });
}

/**
 * Renders a line chart showing the cumulative growth of entries over time.
 */
function renderEntryGrowthOverTimeChart() {
    const ctx = document.getElementById('entryGrowthOverTimeChart');
    if (!ctx) return;
    const canvasContext = ctx.getContext('2d');
    const cumulativeData = {};
    const allEntries = [
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

    allEntries.sort((a, b) => new Date(a.addedDate) - new Date(b.addedDate));

    let count = 0;
    allEntries.forEach(entry => {
        if (entry.addedDate) {
            const date = new Date(entry.addedDate);
            const key = date.toISOString().slice(0, 10);
            cumulativeData[key] = ++count;
        }
    });

    const sortedDates = Object.keys(cumulativeData).sort();
    
    let fullLabels = [];
    let fullData = [];

    if (sortedDates.length > 0) {
        let currentDate = new Date(sortedDates[0]);
        let lastCount = 0;
        currentDate.setHours(0, 0, 0, 0);

        const lastDate = new Date(sortedDates[sortedDates.length - 1]);
        lastDate.setHours(0, 0, 0, 0);

        let dateIndex = 0;

        while (currentDate.getTime() <= lastDate.getTime()) {
            const key = currentDate.toISOString().slice(0, 10);
            if (dateIndex < sortedDates.length && sortedDates[dateIndex] === key) {
                lastCount = cumulativeData[key];
                dateIndex++;
            }
            fullLabels.push(currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            fullData.push(lastCount);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }


    if (window.entryGrowthOverTimeChartInstance) {
        window.entryGrowthOverTimeChartInstance.destroy();
    }
    window.entryGrowthOverTimeChartInstance = new Chart(canvasContext, {
        type: 'line',
        data: {
            labels: fullLabels,
            datasets: [{
                label: 'Total Entries Over Time',
                data: fullData,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Total Entries Growth', color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() },
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true, ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() }, grid: { color: 'rgba(128, 128, 128, 0.1)' } },
                x: { ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() }, grid: { color: 'rgba(128, 128, 128, 0.1)' } }
            }
        }
    });
}

/**
 * Renders a pie chart showing the distribution of entries by type.
 */
function renderEntriesByTypeChart() {
    const ctx = document.getElementById('entriesByTypeChart');
    if (!ctx) return;
    const canvasContext = ctx.getContext('2d');

    const entryTypeCounts = {};
    const allEntries = [
        ...(appState.tools || []),
        ...(appState.emails || []),
        ...(appState.phones || []),
        ...(appState.crypto || []),
        ...(appState.locations || []),
        ...(appState.links || []),
        ...(appState.media || []),
        ...(appState.passwords || []),
        ...(appState.keywords || []),
        ...(appState.socials || []),
        ...(appState.domains || []),
        ...(appState.usernames || []),
        ...(appState.threats || []),
        ...(appState.vulnerabilities || []),
        ...(appState.malware || []),
        ...(appState.breaches || []),
        ...(appState.credentials || []),
        ...(appState.forums || []),
        ...(appState.vendors || []),
        ...(appState.telegramChannels || []),
        ...(appState.pastes || []),
        ...(appState.documents || []),
        ...(appState.networks || []),
        ...(appState.metadataEntries || []),
        ...(appState.archives || []),
        ...(appState.messagingApps || []),
        ...(appState.datingProfiles || []),
        ...(appState.audioEntries || []),
        ...(appState.facialRecognition || []),
        ...(appState.personas || []),
        ...(appState.vpns || []),
        ...(appState.honeypots || []),
        ...(appState.exploits || []),
        ...(appState.publicRecords || []),
        ...(appState.caseStudies || [])
    ];

    allEntries.forEach(entry => {
        const type = (typeof entry.type === 'string' && entry.type) ?
                     entry.type.charAt(0).toUpperCase() + entry.type.slice(1) :
                     'Unknown';
        entryTypeCounts[type] = (entryTypeCounts[type] || 0) + 1;
    });

    const labels = Object.keys(entryTypeCounts);
    const data = Object.values(entryTypeCounts);

    if (window.entriesByTypeChartInstance) {
        window.entriesByTypeChartInstance.destroy();
    }

    window.entriesByTypeChartInstance = new Chart(canvasContext, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d',
                    '#17a2b8', '#6610f2', '#fd7e14', '#e83e8c', '#20c997',
                    '#6f42c1', '#e0f2f1', '#e3f2fd', '#fff3e0', '#fce4ec',
                    '#e1f5fe', '#c8e6c9', '#ffe0b2', '#f8bbd0', '#bbdefb'
                ],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Entries by Type',
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
                    font: { size: 16 }
                },
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    }
                }
            }
        }
    });
}

/**
 * Renders a line chart showing entry activity or additions over time.
 * Currently uses `addedDate` as a proxy for activity.
 */
function renderUsageTrendChart() {
    const ctx = document.getElementById('usageTrendChart');
    if (!ctx) return;
    const canvasContext = ctx.getContext('2d');
    const usageData = {};

    const allEntries = [
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

    allEntries.forEach(entry => {
        if (entry.addedDate) {
            const date = new Date(entry.addedDate);
            const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
            const key = weekStart.toISOString().slice(0, 10);
            usageData[key] = (usageData[key] || 0) + 1;
        }
    });

    const sortedDates = Object.keys(usageData).sort();
    const labels = sortedDates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const data = sortedDates.map(date => usageData[date]);

    if (window.usageTrendChartInstance) {
        window.usageTrendChartInstance.destroy();
    }

    window.usageTrendChartInstance = new Chart(canvasContext, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Entries Added Over Time',
                data: data,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Entry Activity Trend',
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
                    font: { size: 16 }
                },
                legend: {
                    labels: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim()
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() },
                    grid: { color: 'rgba(128, 128, 128, 0.1)' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() },
                    grid: { color: 'rgba(128, 128, 128, 0.1)' }
                }
            }
        }
    });
}

/**
 * Renders a list of the 5 most recently used entries.
 */
function renderMostUsedTools() {
    const mostUsedToolsList = document.getElementById('mostUsedToolsList');
    const noMostUsedTools = document.getElementById('noMostUsedTools');
    
    if (!mostUsedToolsList || !noMostUsedTools) return;

    const allUsedEntries = [
        ...(appState.tools || []), ...(appState.emails || []), ...(appState.phones || []), ...(appState.crypto || []),
        ...(appState.locations || []), ...(appState.links || []), ...(appState.media || []), ...(appState.passwords || []),
        ...(appState.keywords || []), ...(appState.socials || [])
    ].filter(entry => entry.lastUsed > 0);

    const usedTools = allUsedEntries.sort((a, b) => b.lastUsed - a.lastUsed)
                                    .slice(0, 5);
    mostUsedToolsList.innerHTML = '';
    if (usedTools.length === 0) {
        noMostUsedTools.style.display = 'block';
    } else {
        noMostUsedTools.style.display = 'none';
        usedTools.forEach(entry => {
            const listItem = document.createElement('li');
            let name = getEntryName(entry);
            listItem.innerHTML = `<span>${name}</span><span>${formatTime(entry.lastUsed)}</span>`;
            mostUsedToolsList.appendChild(listItem);
        });
    }
}

/**
 * Renders a list of entries that have never been used.
 */
function renderNeverUsedTools() {
    const neverUsedToolsList = document.getElementById('neverUsedToolsList');
    const noNeverUsedTools = document.getElementById('noNeverUsedTools');

    if (!neverUsedToolsList || !noNeverUsedTools) return;

    const allEntries = [
        ...(appState.tools || []), ...(appState.emails || []), ...(appState.phones || []), ...(appState.crypto || []),
        ...(appState.locations || []), ...(appState.links || []), ...(appState.media || []), ...(appState.passwords || []),
        ...(appState.keywords || []), ...(appState.socials || [])
    ];

    const neverUsed = allEntries.filter(entry => !entry.lastUsed || entry.lastUsed === 0)
                                .sort((a, b) => {
                                    const nameA = getEntryName(a);
                                    const nameB = getEntryName(b);
                                    return nameA.localeCompare(nameB);
                                });

    neverUsedToolsList.innerHTML = '';
    if (neverUsed.length === 0) {
        noNeverUsedTools.style.display = 'block';
    } else {
        noNeverUsedTools.style.display = 'none';
        neverUsed.forEach(entry => {
            const listItem = document.createElement('li');
            let name = getEntryName(entry);
            listItem.innerHTML = `<span>${name}</span><span>Never Used</span>`;
            neverUsedToolsList.appendChild(listItem);
        });
    }
}

/**
 * Renders a list of entries added per week.
 */
function renderToolsAddedPerWeek() {
    const toolsAddedPerWeekList = document.getElementById('toolsAddedPerWeekList');
    const noToolsAdded = document.getElementById('noToolsAdded');

    if (!toolsAddedPerWeekList || !noToolsAdded) return;

    const allEntries = [
        ...(appState.tools || []), ...(appState.emails || []), ...(appState.phones || []), ...(appState.crypto || []),
        ...(appState.locations || []), ...(appState.links || []), ...(appState.media || []), ...(appState.passwords || []),
        ...(appState.keywords || []), ...(appState.socials || [])
    ];

    const weeklyStats = {};
    allEntries.forEach(entry => {
        if (entry.addedDate) {
            const date = new Date(entry.addedDate);
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            const startOfWeek = new Date(date.setDate(diff));
            startOfWeek.setHours(0, 0, 0, 0);

            const weekKey = startOfWeek.toISOString().split('T')[0];
            weeklyStats[weekKey] = (weeklyStats[weekKey] || 0) + 1;
        }
    });

    const sortedWeeks = Object.keys(weeklyStats).sort((a, b) => new Date(b) - new Date(a));

    toolsAddedPerWeekList.innerHTML = '';
    if (sortedWeeks.length === 0) {
        noToolsAdded.style.display = 'block';
    } else {
        noToolsAdded.style.display = 'none';
        sortedWeeks.forEach(weekKey => {
            const count = weeklyStats[weekKey];
            const weekStartDate = new Date(weekKey);
            const options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            };
            const formattedWeek = weekStartDate.toLocaleDateString(undefined, options);
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span>Week of ${formattedWeek}</span><span>${count} entries</span>`;
            toolsAddedPerWeekList.appendChild(listItem);
        });
    }
}


/**
 * Displays a random OSINT tool recommendation or tip of the day.
 */
function showRandomDiscovery() {
    const randomDiscoverySection = document.getElementById('randomDiscovery');
    const randomItemDisplay = document.getElementById('randomItemDisplay');
    const newRandomBtn = document.getElementById('newRandomBtn');

    if (!randomDiscoverySection || !randomItemDisplay || !newRandomBtn) {
        console.error("Random discovery elements not found. Ensure #randomDiscovery, #randomItemDisplay, and #newRandomBtn exist in HTML.");
        return;
    }

    if (appState.readOnlyMode) {
        newRandomBtn.style.display = 'none';
        randomItemDisplay.innerHTML = `
            <div class="random-content-card placeholder">
                <i class="fas fa-lock"></i>
                <h4 class="card-title">Read-Only Mode</h4>
                <p class="card-description">Discovery is disabled in shared view.</p>
            </div>
        `;
        randomDiscoverySection.classList.remove('two-rows', 'two-columns', 'single-centered');
        randomDiscoverySection.classList.add('single-centered');
        
        if (randomDiscoveryInterval) {
            clearInterval(randomDiscoveryInterval);
            randomDiscoveryInterval = null;
        }
        return;
    }

    newRandomBtn.disabled = true;
    randomItemDisplay.innerHTML = `
        <div class="random-content-card placeholder">
            <div class="loading" style="margin-bottom: 10px;"></div>
            <p>Loading discovery...</p>
        </div>
    `;

    randomDiscoverySection.classList.remove('single-centered', 'two-columns', 'two-rows');

    setTimeout(() => {
        const allTools = appState.tools.filter(tool => tool.url);
        const allTips = appState.osintTips;
        const allCaseStudies = appState.caseStudies;

        if (allCaseStudies.length === 0 && allTools.length === 0 && allTips.length === 0) {
            randomItemDisplay.innerHTML = `
                <div class="random-content-card placeholder">
                    <i class="fas fa-exclamation-circle"></i>
                    <h4 class="card-title">No Content Available</h4>
                    <p class="card-description">Add some tools, tips, or case studies to get amazing discoveries!</p>
                </div>
            `;
            randomDiscoverySection.classList.add('single-centered');
            newRandomBtn.disabled = false;
            return;
        }

        const selectedLayout = 'two-rows'; // Force the 2-rows layout
        randomDiscoverySection.classList.add(selectedLayout);

        const generatedCards = [];

        // 1. Generate the left column card (Always a Case Study if available, otherwise a fallback)
        if (allCaseStudies.length > 0) {
            generatedCards.push(generateRandomContentCard(getRandomItem(allCaseStudies), 'case-study'));
        } else {
            // Fallback if no case studies: pick a random tool or tip
            const fallbackTypes = [];
            if (allTools.length > 0) fallbackTypes.push('tool');
            if (allTips.length > 0) fallbackTypes.push('tip');
            if (fallbackTypes.length > 0) {
                const randomFallbackType = getRandomItem(fallbackTypes);
                generatedCards.push(generateRandomContentCard(randomFallbackType === 'tool' ? getRandomItem(allTools) : getRandomItem(allTips), randomFallbackType));
            } else {
                generatedCards.push(generateRandomContentCard(null, null)); // Add a generic placeholder
            }
        }

        // 2. Generate the right-top card (Always a Random Tool if available)
        if (allTools.length > 0) {
            generatedCards.push(generateRandomContentCard(getRandomItem(allTools), 'tool'));
        } else {
            // Fallback if no tools: pick a random tip or case study
            const fallbackTypes = [];
            if (allTips.length > 0) fallbackTypes.push('tip');
            if (allCaseStudies.length > 0) fallbackTypes.push('case-study');
            if (fallbackTypes.length > 0) {
                const randomFallbackType = getRandomItem(fallbackTypes);
                generatedCards.push(generateRandomContentCard(randomFallbackType === 'tip' ? getRandomItem(allTips) : getRandomItem(allCaseStudies), randomFallbackType));
            } else {
                generatedCards.push(generateRandomContentCard(null, null)); // Add a generic placeholder
            }
        }

        // 3. Generate the right-bottom card (Always a Random Tip if available)
        if (allTips.length > 0) {
            generatedCards.push(generateRandomContentCard(getRandomItem(allTips), 'tip'));
        } else {
            const fallbackTypes = [];
            if (allTools.length > 0) fallbackTypes.push('tool');
            if (allCaseStudies.length > 0) fallbackTypes.push('case-study');
            if (fallbackTypes.length > 0) {
                const randomFallbackType = getRandomItem(fallbackTypes);
                generatedCards.push(generateRandomContentCard(randomFallbackType === 'tool' ? getRandomItem(allTools) : getRandomItem(allCaseStudies), randomFallbackType));
            } else {
                generatedCards.push(generateRandomContentCard(null, null)); // Add a generic placeholder
            }
        }

        const contentCardsHtml = `
            ${generatedCards[0]}
            ${generatedCards[1]}
            ${generatedCards[2]}
        `;

        randomItemDisplay.innerHTML = contentCardsHtml;
        
        randomItemDisplay.classList.add(`layout-${selectedLayout}`);
        randomItemDisplay.classList.remove('layout-single', 'layout-two-columns');

        newRandomBtn.disabled = false;
    }, 500);
}

// Helper to get a random item (utility)
function getRandomItem(array) {
    if (!array || array.length === 0) {
        return null;
    }
    return array[Math.floor(Math.random() * array.length)];
}

// Helper to generate a random content card HTML (utility)
function generateRandomContentCard(item, type) {
    let title, description, url, icon, faviconHtml = '', extraClass = '';

    if (!item) {
        return `
            <div class="random-content-card placeholder">
                <i class="fas fa-question-circle"></i>
                <h4 class="card-title">No Discovery Available</h4>
                <p class="card-description">Add more tools, tips, or case studies to get a random discovery!</p>
            </div>
        `;
    }

    switch (type) {
        case 'tool':
            title = item.name;
            description = item.description;
            url = item.url;
            icon = 'fas fa-tools';
            faviconHtml = `<img src="${item.favicon}" alt="" class="tool-favicon" onerror="this.onerror=null; this.src='https://www.google.com/s2/favicons?domain=${new URL(item.url).hostname}'">`;
            extraClass = 'random-tool-card';
            break;
        case 'tip':
            title = "OSINT Tip";
            description = item;
            url = null;
            icon = 'fas fa-lightbulb';
            extraClass = 'random-tip-card';
            break;
        case 'case-study':
            title = item.title;
            description = item.summary;
            url = null;
            icon = 'fas fa-microscope';
            extraClass = 'random-case-study-card';
            break;
        default:
            title = "Unknown Discovery";
            description = "Could not load content.";
            url = null;
            icon = 'fas fa-question-circle';
            break;
    }

    return `
        <div class="random-content-card ${extraClass}">
            <div class="card-header">
                ${faviconHtml || `<i class="${icon}"></i>`}
                <h4 class="card-title">${title}</h4>
            </div>
            <p class="card-description">${description}</p>
            ${url ? `<a href="${url}" target="_blank" class="card-link btn-sm btn-primary">Visit <i class="fas fa-external-link-alt"></i></a>` : ''}
        </div>
    `;
}

// Global variable to hold the interval ID for auto-rotation
let randomDiscoveryInterval = null;

// Function to start the automatic rotation
function startRandomDiscoveryRotation() {
    if (randomDiscoveryInterval) {
        clearInterval(randomDiscoveryInterval);
    }
    randomDiscoveryInterval = setInterval(showRandomDiscovery, 10000);
}

// Function to stop the automatic rotation
function stopRandomDiscoveryRotation() {
    if (randomDiscoveryInterval) {
        clearInterval(randomDiscoveryInterval);
        randomDiscoveryInterval = null;
    }
}

/**
 * Checks if the current screen size is small and displays a desktop recommendation modal if needed.
 */
function checkAndShowDesktopRecommendation() {
    if (!appState.readOnlyMode && !sessionStorage.getItem('desktopRecommendationShown')) {
        if (window.innerWidth < 1024) {
            showModal('desktopRecommendationModal');
        }
    }
}

/**
 * Creates floating particle elements for background animation.
 */
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = window.innerWidth < 768 ? 15 : 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particle.style.width = particle.style.height = (Math.random() * 4 + 2) + 'px';
        particlesContainer.appendChild(particle);
    }
}

/**
 * Creates connecting line elements for background animation.
 */
function createConnectingLines() {
    const linesContainer = document.getElementById('connecting-lines');
    if (!linesContainer) return;

    const lineCount = window.innerWidth < 768 ? 3 : 6;
    
    for (let i = 0; i < lineCount; i++) {
        const line = document.createElement('div');
        line.className = 'connection-line';
        line.style.top = Math.random() * 100 + '%';
        line.style.left = Math.random() * 50 + '%';
        line.style.width = Math.random() * 200 + 100 + 'px';
        line.style.animationDelay = Math.random() * 4 + 's';
        line.style.animationDuration = (Math.random() * 2 + 3) + 's';
        linesContainer.appendChild(line);
    }
}

// Ensure particles and lines are created on DOMContentLoaded and remade on resize
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    createConnectingLines();
    
    const cards = document.querySelectorAll('.evidence-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = (index * 0.1) + 's';
        card.style.animation = 'slideIn 0.8s ease forwards';
    });
});

let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        const particlesContainer = document.getElementById('particles');
        const linesContainer = document.getElementById('connecting-lines');
        if (particlesContainer) particlesContainer.innerHTML = '';
        if (linesContainer) linesContainer.innerHTML = '';
        createParticles();
        createConnectingLines();
    }, 250);
});


/**
 * Orchestrates the initial loading and setup of the application.
 */
function initApp() {
    // These specific "load" functions are defined in their respective files,
    // so they will be available as long as those files are loaded before initApp is called.
    loadState(); // Defined in core.js
    
    parseShareableLink(); // Defined in core.js
    
    bindEvents(); // Defined in event-bindings.js
    updateStats(); // Defined in core.js (after moving content from dashboard.js)

    initTheme(); // Defined in core.js

    checkAndShowDesktopRecommendation(); // Defined in core.js

    const validTabs = ['dashboard', 'intelligence-vault', 'custom-tabs', 'timeline', 'threats', 'handbook', 'dork-assistant', 'case-studies', 'threat-hunting'];
    if (!validTabs.includes(appState.currentTab)) {
        appState.currentTab = 'dashboard';
    }

    switchTab(appState.currentTab); // Defined in entry-rendering-and-filters.js
    
    // These init functions will be called by switchTab when their respective tabs are activated,
    // or manually if they need to run globally at startup.
    initDorkAssistant(); // Defined in dork-assistant.js
    showRandomDiscovery(); // Defined in core.js (moved from dashboard.js)
    populateCategoryFilter(); // Defined in entry-rendering-and-filters.js
    updateDashboard(); // Defined in core.js (moved from dashboard.js)

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