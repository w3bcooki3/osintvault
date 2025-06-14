// timeline.js

/**
 * Creates a set of sample timeline events for initial application state.
 * @returns {Array<object>} An array of sample timeline event objects.
 */
function createSampleTimelineEvents() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);
    const twoHoursAgo = new Date(now.getTime() - 7200000);
    const sixHoursAgo = new Date(now.getTime() - 21600000);
    const oneDayAgo = new Date(now.getTime() - 86400000);
    const twoDaysAgo = new Date(now.getTime() - (2 * 86400000));

    return [
        {
            id: generateId(), // Assuming generateId is available
            timestamp: twoDaysAgo,
            title: "Phishing Email Delivered to Employee X",
            category: "phishing",
            notes: "Employee X received a suspicious email with a malicious attachment disguised as an invoice. Subject: 'Urgent Invoice Payment #12345'.",
            confidence: "high",
            evidence: "email_id:XYZ789, email_header_analysis.pdf",
            actor: "Attacker (APT28)",
        },
        {
            id: generateId(),
            timestamp: sixHoursAgo,
            title: "Successful Lateral Movement to File Server",
            category: "lateral_movement",
            notes: "Attacker gained access to file server FS-001-B using compromised credentials from workstation WS-001-A.",
            confidence: "high",
            evidence: "file_server_logs:FS-001-B_auth.log",
            actor: "Attacker (APT28)",
        },
        {
            id: generateId(),
            timestamp: twoHoursAgo,
            title: "Suspicious Data Exfiltration Attempt",
            category: "exfiltration",
            notes: "Large volume of data detected transferring from FS-001-B to an external IP address via unusual port.",
            confidence: "critical",
            evidence: "firewall_logs:FW-001, dlp_alert:DLP-005",
            actor: "Attacker (APT28)",
        },
        {
            id: generateId(),
            timestamp: oneHourAgo,
            title: "Incident Response Team Engaged",
            category: "remediation",
            notes: "Security operations center (SOC) alerted. Incident response team initiated containment procedures.",
            confidence: "high",
            evidence: "ir_ticket:IR-2025-001",
            actor: "SOC Team",
        }
    ].sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Opens the 'Add/Edit Timeline Event' modal, populating it for adding or editing.
 * @param {string} mode - 'add' to add a new event, 'edit' to edit an existing one.
 * @param {string} [eventId=null] - The ID of the event to edit (required for 'edit' mode).
 */
function openAddEventModal(mode, eventId = null) {
    if (appState.readOnlyMode) { // Assuming appState is available
        showToast("Cannot add/edit events in read-only shared view.", "warning"); // Assuming showToast is available
        return;
    }

    const modalTitle = document.getElementById('addEventModal')?.querySelector('h3');
    const saveButton = document.getElementById('saveEventBtn');
    const form = document.getElementById('addEventForm');
    if (form) form.reset();
    const editEventIdInput = document.getElementById('editEventId');
    if (editEventIdInput) editEventIdInput.value = '';

    const eventCategorySelect = document.getElementById('eventCategory');
    if (eventCategorySelect) {
        eventCategorySelect.innerHTML = '<option value="">Select Category</option>';
        for (const key in timelineCategories) { // Assuming timelineCategories is available
            const option = document.createElement('option');
            option.value = key;
            option.textContent = timelineCategories[key].name;
            eventCategorySelect.appendChild(option);
        }
    }

    const eventTimestampInput = document.getElementById('eventTimestamp');
    const eventTitleInput = document.getElementById('eventTitle');
    const eventNotesInput = document.getElementById('eventNotes');
    const eventConfidenceSelect = document.getElementById('eventConfidence');
    const eventEvidenceInput = document.getElementById('eventEvidence');
    const eventActorInput = document.getElementById('eventActor');

    if (mode === 'add') {
       if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Add New Timeline Event';
       if (saveButton) {
           saveButton.textContent = 'Add Event';
           saveButton.dataset.mode = 'add';
       }
       const now = new Date();
       if (eventTimestampInput) eventTimestampInput.value = now.toISOString().slice(0, 16);
   } else if (mode === 'edit' && eventId) {
       const eventToEdit = appState.timeline.events.find(event => event.id === eventId);
       if (!eventToEdit) {
           showToast("Event not found for editing.", "error");
           return;
       }
       if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Timeline Event';
       if (saveButton) {
           saveButton.textContent = 'Save Changes';
           saveButton.dataset.mode = 'edit';
       }
       if (editEventIdInput) editEventIdInput.value = eventToEdit.id;

       if (eventTimestampInput) eventTimestampInput.value = eventToEdit.timestamp.toISOString().slice(0, 16);
       if (eventTitleInput) eventTitleInput.value = eventToEdit.title;
       if (eventCategorySelect) eventCategorySelect.value = eventToEdit.category;
       if (eventNotesInput) eventNotesInput.value = eventToEdit.notes;
       if (eventConfidenceSelect) eventConfidenceSelect.value = eventToEdit.confidence;
       if (eventEvidenceInput) eventEvidenceInput.value = eventToEdit.evidence;
       if (eventActorInput) eventActorInput.value = eventToEdit.actor;
   }
   showModal('addEventModal'); // Assuming showModal is available
}

/**
 * Handles the submission of the Add/Edit Timeline Event form.
 * Creates a new event or updates an existing one, then re-renders the timeline.
 * @param {Event} e - The submit event.
 */
function handleAddEditEvent(e) {
    e.preventDefault();
    if (appState.readOnlyMode) {
        showToast("Cannot add/edit events in read-only shared view.", "warning");
        return;
    }

    const saveButton = document.getElementById('saveEventBtn');
    const mode = saveButton ? saveButton.dataset.mode : null;
    const eventId = document.getElementById('editEventId')?.value;

    const timestampInput = document.getElementById('eventTimestamp')?.value;
    const timestamp = timestampInput ? new Date(timestampInput) : null;

    const title = document.getElementById('eventTitle')?.value.trim();
    const category = document.getElementById('eventCategory')?.value;
    const notes = document.getElementById('eventNotes')?.value.trim();
    const confidence = document.getElementById('eventConfidence')?.value;
    const evidence = document.getElementById('eventEvidence')?.value.trim();
    const actor = document.getElementById('eventActor')?.value.trim();
    
    if (!timestampInput || !timestamp || isNaN(timestamp.getTime()) || !title || !category || !confidence) {
        showToast("Please enter a valid date/time and fill in all required event fields.", "error");
        return;
    }

    if (mode === 'add') {
        const newEvent = {
            id: generateId(), // Assuming generateId is available
            timestamp: timestamp, 
            title: title,
            category: category,
            notes: notes,
            confidence: confidence,
            evidence: evidence,
            actor: actor,
        };
        appState.timeline.events.push(newEvent);
        showToast("Event added successfully!");
    } else if (mode === 'edit') {
        const eventToUpdate = appState.timeline.events.find(event => event.id === eventId);
        if (eventToUpdate) {
            eventToUpdate.timestamp = timestamp; 
            eventToUpdate.title = title;
            eventToUpdate.category = category;
            eventToUpdate.notes = notes;
            eventToUpdate.confidence = confidence;
            eventToUpdate.evidence = evidence;
            eventToUpdate.actor = actor;
            showToast("Event updated successfully!");
        } else {
            showToast("Error: Event not found for update.", "error");
        }
    }

    hideModal('addEventModal'); // Assuming hideModal is available
    saveState(); // Assuming saveState is available
    renderTimelineEvents();
}

/**
 * Renders the timeline events on the 'TraceLink' tab.
 */
function renderTimelineEvents() {
    const timelineDisplay = document.getElementById('timeline-events-display');
    const emptyState = document.getElementById('emptyTimelineState');

    if (!timelineDisplay || !emptyState) {
        console.error("renderTimelineEvents: Required DOM elements (timeline-events-display or emptyTimelineState) not found.");
        return;
    }

    const fragment = document.createDocumentFragment();

    if (appState.timeline.events.length === 0) {
        emptyState.style.display = 'block';
        timelineDisplay.innerHTML = '';
    } else {
        emptyState.style.display = 'none';
        
        const sortedEvents = [...appState.timeline.events].sort((a, b) => {
            const aTime = (a.timestamp instanceof Date) ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
            const bTime = (b.timestamp instanceof Date) ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
            return aTime - bTime;
        });

        sortedEvents.forEach(event => {
            const categoryInfo = timelineCategories[event.category] || { name: event.category, icon: "fas fa-question-circle", color: "var(--primary)" };

            if (!(event.timestamp instanceof Date) || isNaN(event.timestamp.getTime())) {
                console.error("Invalid timestamp found for event, skipping rendering:", event);
                return;
            }

            const eventDate = event.timestamp.toLocaleDateString();
            const eventTime = event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const eventCardDiv = document.createElement('div');
            eventCardDiv.classList.add('timeline-event-card');
            if (event.category) eventCardDiv.dataset.category = event.category;
            if (event.confidence) eventCardDiv.dataset.confidence = event.confidence;
            eventCardDiv.dataset.eventId = event.id;
            eventCardDiv.style.borderLeft = `5px solid ${categoryInfo.color || 'var(--primary)'}`;

            eventCardDiv.innerHTML = `
                <div class="timeline-event-header">
                    <div class="timeline-event-title">
                        <i class="${categoryInfo.icon}" style="color: ${categoryInfo.color || 'var(--primary)'};"></i> ${event.title}
                    </div>
                    <span class="timeline-event-timestamp">${eventDate} ${eventTime}</span>
                    <div class="timeline-event-actions">
                        <button class="action-btn edit-event-btn" data-event-id="${event.id}" title="Edit Event">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-event-btn" data-event-id="${event.id}" title="Delete Event">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="timeline-event-notes">${event.notes || 'No notes.'}</p>
                <div class="timeline-event-meta">
                    <span><i class="fas fa-certificate"></i> Confidence: <strong style="color: var(--${event.confidence});">${event.confidence.charAt(0).toUpperCase() + event.confidence.slice(1)}</strong></span>
                    <span><i class="fas fa-tag"></i> Category: ${categoryInfo.name}</span>
                    ${event.actor ? `<span><i class="fas fa-user-circle"></i> Actor: ${event.actor}</span>` : ''}
                    ${event.evidence ? `<span><i class="fas fa-paperclip"></i> Evidence: <a href="${event.evidence}" target="_blank" style="color: var(--primary); text-decoration: none;">${event.evidence.length > 30 ? event.evidence.substring(0, 27) + '...' : event.evidence}</a></span>` : ''}
                </div>
            `;
            fragment.appendChild(eventCardDiv);
        });

        timelineDisplay.innerHTML = '';
        timelineDisplay.appendChild(fragment);

        void timelineDisplay.offsetHeight;
    }
}

/**
 * Handles click actions on timeline event cards (edit, delete).
 * @param {Event} e - The click event.
 */
function handleTimelineEventAction(e) {
    if (appState.readOnlyMode) {
        showToast("Cannot perform actions in read-only shared view.", "warning");
        return;
    }

    const targetBtn = e.target.closest('.action-btn');
    if (!targetBtn) return;

    e.preventDefault();
    const action = targetBtn.classList.contains('edit-event-btn') ? 'edit' : 'delete';
    const eventId = targetBtn.dataset.eventId || targetBtn.closest('.timeline-event-card')?.dataset.eventId;

    if (!eventId) return;

    if (action === 'edit') {
        openAddEventModal('edit', eventId);
    } else if (action === 'delete') {
        if (confirm('Are you sure you want to delete this timeline event?')) {
            appState.timeline.events = appState.timeline.events.filter(event => event.id !== eventId);
            showToast("Event deleted!", "error");
            saveState();
            renderTimelineEvents();
        }
    }
}

/**
 * Exports all timeline events to a JSON file.
 */
function exportTimeline() {
    if (appState.readOnlyMode) {
        showToast("Cannot export timeline in read-only shared view.", "warning");
        return;
    }

    const dataToExport = JSON.parse(JSON.stringify(appState.timeline));
    dataToExport.events.forEach(event => {
        event.timestamp = new Date(event.timestamp).toISOString();
    });

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'osintvault_timeline.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Timeline exported successfully!', 'success');
}

/**
 * Imports timeline events from a JSON file.
 * Replaces existing events with the imported data.
 */
function importTimeline() {
    if (appState.readOnlyMode) {
        showToast("Cannot import timeline in read-only shared view.", "warning");
        return;
    }

    const fileInput = document.getElementById('importTimelineFile');
    const file = fileInput ? fileInput.files[0] : null;

    if (!file) {
        showToast('Please select a JSON file to import.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            if (importedData.events && Array.isArray(importedData.events)) {
                const validEvents = importedData.events.map(event => {
                    if (!event.id || !event.timestamp || !event.title || !event.category || !event.confidence) {
                        throw new Error("Invalid event format in imported file.");
                    }
                    const parsedDate = new Date(event.timestamp);
                    if (isNaN(parsedDate.getTime())) throw new Error("Invalid timestamp in imported event.");
                    event.timestamp = parsedDate;
                    return event;
                });

                appState.timeline.events = validEvents;
                hideModal('importTimelineModal');
                showToast('Timeline imported successfully!', 'success');
                renderTimelineEvents();
                saveState();
            } else {
                throw new Error("Invalid timeline data format. Expected an 'events' array.");
            }
        } catch (e) {
            showToast(`Error importing timeline: ${e.message}`, 'error');
            console.error("Timeline import error:", e);
        }
    };
    reader.readAsText(file);
}