// js/timelineVault.js

/**
 * Transforms an appState entry into a standardized timeline event object.
 * @param {object} entry - The entry object from appState (e.g., tool, email, threat, caseStudy).
 * @returns {object} A timeline event object suitable for rendering.
 */
function entryToTimelineEvent(entry) {
    let timestamp;
    let title;
    let notes = entry.description || entry.notes || 'No notes available.';
    let confidence = 'info'; // Default confidence for user-added entries
    let evidence = entry.url || entry.link || entry.source || ''; // URL, link, or general source

    // Determine the primary timestamp for the event
    // Prioritize specific date fields first, then fallback to addedDate.
    if (entry.type === 'breach' && entry.date) {
        timestamp = new Date(entry.date);
        title = `Data Breach: ${entry.company}`;
        confidence = 'critical';
    } else if (entry.type === 'credential' && entry.dateFound) {
        timestamp = new Date(entry.dateFound);
        title = `Credential Dump: ${entry.credentialService || entry.credentialType}`;
        confidence = 'high';
    } else if (entry.type === 'archive' && entry.timestamp) { // Assuming timestamp is stored as a valid date string or number
        timestamp = new Date(entry.timestamp);
        title = `Archived Page: ${entry.originalUrl}`;
        confidence = 'info';
    } else if (entry.type === 'caseStudy' && entry.publishedDate) { // For case studies
        timestamp = new Date(entry.publishedDate);
        title = `Case Study: ${entry.title}`;
        confidence = 'info';
    } else if (entry.type === 'publicrecord' && entry.date) {
        timestamp = new Date(entry.date);
        title = `Public Record: ${entry.recordType}`;
        confidence = 'info';
    } else if (entry.type === 'threat' && entry.addedDate) { // Threats usually don't have a 'date' field, use added date
        timestamp = new Date(entry.addedDate); // Or a specific event date if added to threat object later
        title = `Threat Intel: ${entry.name}`;
        confidence = entry.severity || 'medium'; // Use threat severity as confidence
    } else if (entry.type === 'malware' && entry.addedDate) {
        timestamp = new Date(entry.addedDate);
        title = `Malware: ${entry.filename}`;
        confidence = 'high';
    }
    // General fallback for most entries using addedDate
    else if (entry.addedDate) {
        timestamp = new Date(entry.addedDate);
        title = getEntryName(entry); // Helper from multiVault.js
        if (!title || title === 'Unknown Entry') {
             // Fallback for cases where getEntryName might return generic or empty
            title = `New ${entry.type} entry`;
        }
    } else {
        // Ultimate fallback if no useful date can be found (should ideally not happen with 'addedDate')
        timestamp = new Date();
        title = getEntryName(entry) || `Untimed ${entry.type} entry`;
    }

    return {
        id: entry.id, // Keep the original entry ID
        timestamp: timestamp,
        title: title,
        category: entry.type, // Store original entry type as category
        notes: notes,
        confidence: confidence,
        evidence: evidence, // This can be a URL or a string reference
        actor: 'System/Investigator', // Default actor for timeline events derived from entries
        originalEntryType: entry.type // Store original type to facilitate opening correct edit modal
    };
}

/**
 * Renders the timeline for the currently active custom vault.
 * This function is called when switching to a custom vault's timeline view.
 */
function renderCustomVaultTimeline() {
    const timelineContainer = document.getElementById('customTabTimelineDisplay');
    const emptyState = document.getElementById('emptyCustomVaultTimelineState');

    // Ensure container and empty state exist before proceeding
    if (!timelineContainer || !emptyState) {
        console.error("renderCustomVaultTimeline: Required DOM elements (customTabTimelineDisplay or emptyCustomVaultTimelineState) not found.");
        return;
    }

    // Clear previous content and hide empty state
    timelineContainer.innerHTML = '';
    emptyState.style.display = 'none';

    // Get the currently active custom vault
    const activeCustomTab = appState.customTabs.find(tab => tab.id === appState.currentCustomTab);

    // If no custom tab is active or it has no entries, show the empty state.
    if (!activeCustomTab || activeCustomTab.toolIds.length === 0) {
        emptyState.style.display = 'block';
        timelineContainer.style.display = 'none'; // Ensure timeline container is hidden
        return;
    }

    // Combine all entries from all appState arrays
    // NOTE: This array should contain ALL possible entry types in appState
    const allEntriesCombined = [
        ...appState.tools, ...appState.emails, ...appState.phones, ...appState.crypto,
        ...appState.locations, ...appState.links, ...appState.media, ...appState.passwords,
        ...appState.keywords, ...appState.socials, ...appState.domains, ...appState.usernames,
        ...appState.threats, ...appState.vulnerabilities, ...appState.malware, ...appState.breaches,
        ...appState.credentials, ...appState.forums, ...appState.vendors, ...appState.telegramChannels,
        ...appState.pastes, ...appState.documents, ...appState.networks, ...appState.metadataEntries,
        ...appState.archives, ...appState.messagingApps, ...appState.datingProfiles, ...appState.audioEntries,
        ...appState.facialRecognition, ...appState.personas, ...appState.vpns, ...appState.honeypots,
        ...appState.exploits, ...appState.publicRecords, ...appState.caseStudies // IMPORTANT: Include caseStudies here
    ];

    // Filter to get only entries belonging to the current custom tab
    const vaultEntries = allEntriesCombined.filter(entry =>
        (entry.customTabs || []).includes(activeCustomTab.id)
    );

    // Map these entries to a timeline event structure
    const customVaultTimelineEvents = vaultEntries.map(entry => entryToTimelineEvent(entry))
        .filter(event => event.timestamp instanceof Date && !isNaN(event.timestamp.getTime())) // Filter out invalid dates
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Sort by timestamp

    // If after mapping and filtering, there are no valid events, show empty state
    if (customVaultTimelineEvents.length === 0) {
        emptyState.style.display = 'block';
        timelineContainer.style.display = 'none';
        return;
    }

    // Now, render these generated events into the custom vault timeline display.
    const fragment = document.createDocumentFragment();

    customVaultTimelineEvents.forEach(event => {
        // Map internal entry type to a more general timeline category for icon/color if desired
        // Or directly use entry.type for fine-grained category display.
        // For simplicity, let's map to existing `timelineCategories` in multiVault.js or a default 'other'.
        const mappedTimelineCategory = {
            'email': 'phishing', 'phone': 'reconnaissance', 'crypto': 'fraud', 'location': 'discovery',
            'link': 'collection', 'media': 'collection', 'password': 'credential_access', 'keyword': 'reconnaissance',
            'social': 'reconnaissance', 'domain': 'reconnaissance', 'username': 'reconnaissance',
            'threat': 'malware_delivery', 'vulnerability': 'malware_delivery', 'malware': 'malware_delivery',
            'breach': 'impact', 'credential': 'credential_access', 'forum': 'other', 'vendor': 'other',
            'telegram': 'other', 'paste': 'collection', 'document': 'collection', 'network': 'discovery',
            'metadata': 'collection', 'archive': 'collection', 'messaging': 'collection', 'dating': 'collection',
            'audio': 'collection', 'facial': 'collection', 'persona': 'reconnaissance', 'vpn': 'defense_evasion',
            'honeypot': 'other', 'exploit': 'malware_delivery', 'publicrecord': 'collection',
            'tool': 'other', // Tools added to timeline
            'caseStudy': 'reconnaissance' // NEW: Case studies in timeline
        }[event.category] || 'other';

        const categoryInfo = timelineCategories[mappedTimelineCategory] || { name: mappedTimelineCategory, icon: "fas fa-question-circle", color: "var(--primary)" };

        const eventDate = event.timestamp.toLocaleDateString();
        const eventTime = event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const eventCardDiv = document.createElement('div');
        eventCardDiv.classList.add('timeline-event-card');
        eventCardDiv.dataset.category = mappedTimelineCategory; // Use the mapped category for styling
        eventCardDiv.dataset.confidence = event.confidence; // Still use original confidence
        eventCardDiv.dataset.eventId = event.id; // Original entry ID
        eventCardDiv.dataset.originalEntryType = event.originalEntryType; // Original entry type for editing
        eventCardDiv.style.borderLeft = `5px solid ${categoryInfo.color || 'var(--primary)'}`;

        eventCardDiv.innerHTML = `
            <div class="timeline-event-header">
                <div class="timeline-event-title">
                    <i class="${categoryInfo.icon}" style="color: ${categoryInfo.color || 'var(--primary)'};"></i> ${event.title}
                </div>
                <span class="timeline-event-timestamp">${eventDate} ${eventTime}</span>
                <div class="timeline-event-actions">
                    <button class="action-btn edit-entry-from-timeline" data-entry-id="${event.id}" data-entry-type="${event.originalEntryType}" title="Edit Entry">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete-entry-from-timeline" data-entry-id="${event.id}" data-entry-type="${event.originalEntryType}" title="Delete Entry">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            <p class="timeline-event-notes">${event.notes || 'No notes.'}</p>
            <div class="timeline-event-meta">
                <span><i class="fas fa-certificate"></i> Confidence: <strong style="color: var(--${event.confidence});">${event.confidence.charAt(0).toUpperCase() + event.confidence.slice(1)}</strong></span>
                <span><i class="fas fa-tag"></i> Original Type: ${event.originalEntryType}</span>
                ${event.actor && event.actor !== 'System/Investigator' ? `<span><i class="fas fa-user-circle"></i> Actor: ${event.actor}</span>` : ''}
                ${event.evidence ? `<span><i class="fas fa-paperclip"></i> Evidence: <a href="${event.evidence}" target="_blank" style="color: var(--primary); text-decoration: none;">${event.evidence.length > 30 ? event.evidence.substring(0, 27) + '...' : event.evidence}</a></span>` : ''}
            </div>
        `;
        fragment.appendChild(eventCardDiv);
    });

    timelineContainer.appendChild(fragment);
    timelineContainer.style.display = 'flex'; // Ensure flex layout for timeline

    // Add event listeners for edit/delete buttons on timeline cards using delegation
    timelineContainer.addEventListener('click', handleTimelineEntryAction);

    // Force a reflow
    void timelineContainer.offsetHeight;
}

/**
 * Handles clicks on edit/delete buttons within timeline event cards.
 * @param {Event} e - The click event.
 */
function handleTimelineEntryAction(e) {
    if (appState.readOnlyMode) {
        showToast("Cannot perform actions in read-only shared view.", "warning");
        return;
    }

    const targetBtn = e.target.closest('.action-btn');
    if (!targetBtn) return;

    e.preventDefault();
    const entryId = targetBtn.dataset.entryId;
    const entryType = targetBtn.dataset.originalEntryType; // Get the original entry type

    const entry = findEntryById(entryId); // Use the global helper from app.js/multiVault.js

    if (!entry) {
        showToast("Error: Entry not found.", "error");
        return;
    }

    if (targetBtn.classList.contains('edit-entry-from-timeline')) {
        // Use the appropriate edit modal based on the original entry type
        if (entry.type === 'caseStudy') {
            openEditCaseStudyModal(entry); // From caseStudies.js
        } else {
            openEditEntryModal(entry); // From app.js
        }
    } else if (targetBtn.classList.contains('delete-entry-from-timeline')) {
        if (confirm('Are you sure you want to delete this entry from your custom vault and overall data?')) {
            // Remove from custom tab's toolIds
            const activeCustomTab = appState.customTabs.find(tab => tab.id === appState.currentCustomTab);
            if (activeCustomTab) {
                activeCustomTab.toolIds = activeCustomTab.toolIds.filter(id => id !== entryId);
            }

            // Remove from the entry's own customTabs array
            entry.customTabs = (entry.customTabs || []).filter(tabId => tabId !== activeCustomTab.id);

            // Remove from its main appState array (e.g., appState.tools, appState.emails)
            const targetArrayKey = Object.keys(appState).find(key => Array.isArray(appState[key]) && appState[key].some(e => e.id === entryId));
            if (targetArrayKey) {
                appState[targetArrayKey] = appState[targetArrayKey].filter(e => e.id !== entryId);
            }

            appState.selectedEntries.delete(entryId); // Deselect if it was selected

            showToast('Entry deleted!', 'error');
            saveState();
            renderCustomVaultTimeline(); // Re-render the timeline
            renderCustomTabs(); // Re-render custom tabs (to update counts)
            updateDashboard(); // Update dashboard stats
            populateCategoryFilter(); // Update filters if a category disappeared
        }
    }
}