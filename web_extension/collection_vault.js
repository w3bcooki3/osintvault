// collection_vault.js

let collectedItems = []; // Array to hold all items loaded from extension storage
let currentTabType = 'all'; // Tracks the currently active tab (e.g., 'all', 'keyword', 'media')

// Utility function to display small toast notifications within the popup itself
function showPopupToast(message, type = 'success', duration = 3000) {
    let toastContainer = document.querySelector('.collector-popup-toast-container');
    // Create the toast container if it doesn't exist in the popup's DOM
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'collector-popup-toast-container';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `collector-popup-toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Force a reflow to ensure the CSS transition plays correctly
    void toast.offsetWidth;
    toast.classList.add('show');

    // Set a timeout to hide and remove the toast
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
}

/**
 * Loads collected items from Chrome's local storage.
 * Updates the global `collectedItems` array and re-renders the UI.
 */
async function loadCollectedItems() {
    const result = await chrome.storage.local.get('collectedItems');
    collectedItems = result.collectedItems || []; // Get the stored array, or an empty array if none
    console.log("[Popup] Loaded items from storage:", collectedItems); // Debug log
    renderItems(); // Render items for the current active tab
    updateCounts(); // Update the counts displayed on tab buttons
}

/**
 * Saves the current `collectedItems` array back to Chrome's local storage.
 */
async function saveCollectedItems() {
    await chrome.storage.local.set({ collectedItems });
    console.log("[Popup] Saved items to storage. Current count:", collectedItems.length); // Debug log
    updateCounts(); // Update counts after saving (e.g., after a deletion)
}

/**
 * Renders the collected items in the UI based on the `currentTabType` filter.
 */
function renderItems() {
    const container = document.getElementById('collectedItemsContainer');
    container.innerHTML = ''; // Clear existing items to re-render
    const filteredItems = filterItemsByType(currentTabType); // Get items relevant to the active tab

    // Display empty state message if no items match the current filter
    if (filteredItems.length === 0) {
        let emptyMessage = "No items collected yet in this category. Right-click on a webpage to start collecting!";
        if (currentTabType !== 'all') {
            emptyMessage = `No ${currentTabType} items collected yet.`;
        }
        container.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
        return;
    }

    // Iterate through filtered items and create a card for each
    filteredItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.dataset.itemId = item.id; // Store item ID for easy deletion

        let iconClass = '';
        let title = '';
        let contentHtml = ''; // HTML content specific to the item type

        // Determine icon, title, and content based on the item's type
        switch (item.type) {
            case 'keyword':
                iconClass = 'fas fa-font';
                title = `Text: ${item.description || item.value.substring(0, 50) + (item.value.length > 50 ? '...' : '')}`;
                contentHtml = `<p>${item.value}</p>`;
                break;
            case 'media':
                iconClass = item.mediaType === 'image' ? 'fas fa-image' : (item.mediaType === 'video' ? 'fas fa-video' : 'fas fa-volume-up');
                title = `${item.mediaType.charAt(0).toUpperCase() + item.mediaType.slice(1)}: ${item.title || item.url.split('/').pop()}`;
                contentHtml = `<p><a href="${item.url}" target="_blank" class="source-link">${item.url}</a></p>`;
                // Embed media directly if it's an image or video
                if (item.mediaType === 'image') {
                    contentHtml += `<img src="${item.url}" alt="${item.altText || item.title}">`;
                } else if (item.mediaType === 'video') {
                    contentHtml += `<video controls src="${item.url}" style="max-width:100%;"></video>`;
                } else if (item.mediaType === 'audio') { // Although audio maps to `audioEntries` for export, it arrives here as `media` type from collector
                    contentHtml += `<audio controls src="${item.url}" style="max-width:100%;"></audio>`;
                }
                break;
            case 'link':
                iconClass = 'fas fa-link';
                title = `Link: ${item.title || item.description || item.url}`;
                contentHtml = `<p>${item.description || item.url}</p><p><a href="${item.url}" target="_blank" class="source-link">${item.url}</a></p>`;
                break;
            case 'document':
                iconClass = 'fas fa-file-alt';
                title = `Document: ${item.title || item.url.split('/').pop()}`;
                contentHtml = `<p>File Type: ${item.fileType}</p><p>${item.contentSummary}</p><p><a href="${item.url}" target="_blank" class="source-link">${item.url}</a></p>`;
                break;
            default: // Catch-all for 'other' or unmapped types
                iconClass = 'fas fa-question';
                title = `Other: ${item.type}`;
                contentHtml = `<pre>${JSON.stringify(item, null, 2)}</pre>`; // Display raw JSON for unknown types
                break;
        }

        // Construct the full HTML for the item card
        itemCard.innerHTML = `
            <h3><i class="${iconClass}"></i> ${title}</h3>
            ${contentHtml}
            <p class="source-link">Source Page: <a href="${item.pageUrl}" target="_blank">${item.pageTitle}</a></p>
            <p style="font-size: 0.7em; color: #777;">Collected: ${new Date(item.addedDate).toLocaleString()}</p>
            <button class="delete-btn" title="Delete this item"><i class="fas fa-trash-alt"></i></button>
        `;
        container.appendChild(itemCard);
    });

    // Attach event listeners to the dynamically created delete buttons
    container.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', deleteItem);
    });
}

/**
 * Filters the `collectedItems` array based on the given type.
 * @param {string} type The type to filter by ('all', 'keyword', 'media', 'link', 'document', 'other').
 * @returns {Array} A new array containing only the filtered items.
 */
function filterItemsByType(type) {
    if (type === 'all') {
        return collectedItems;
    }
    // Define the types that have dedicated tabs
    const knownHandledTypes = ['keyword', 'media', 'link', 'document', 'audioEntries']; // 'audioEntries' is a destination type, not a collector type from background.js directly.
                                                                                       // Need to include it here if `media` items with `mediaType='audio'` are to be filtered out of 'other'
    if (type === 'other') {
        // Filter for items not matching any of the explicitly handled types
        return collectedItems.filter(item => !knownHandledTypes.includes(item.type) && item.type !== 'audioEntries');
    }

    // Handle the specific collector types
    if (type === 'media') {
      return collectedItems.filter(item => item.type === 'media' && item.mediaType !== 'audio');
    }
    if (type === 'audioEntries') { // This tab is not in the HTML, but including for completeness if it were
      return collectedItems.filter(item => item.type === 'audioEntries');
    }
    return collectedItems.filter(item => item.type === type);
}


/**
 * Updates the item counts displayed on each tab button.
 */
function updateCounts() {
    // Total count
    document.getElementById('allCount').textContent = collectedItems.length;

    // Counts for specific types, matching the OSINTVault data structure
    document.getElementById('keywordCount').textContent = collectedItems.filter(item => item.type === 'keyword').length;
    // For media, count images and videos specifically (from collector's `media` type)
    document.getElementById('mediaCount').textContent = collectedItems.filter(item => item.type === 'media' && item.mediaType !== 'audio').length;
    document.getElementById('linkCount').textContent = collectedItems.filter(item => item.type === 'link').length;
    document.getElementById('documentCount').textContent = collectedItems.filter(item => item.type === 'document').length;

    // Count for 'other' which includes unmapped types (e.g., if we added a new, unhandled capture type)
    // Also include `audioEntries` here if the `media` filter above excludes `audio`
    const explicitlyTabbedTypes = ['keyword', 'link', 'document'];
    const otherCount = collectedItems.filter(item =>
        !explicitlyTabbedTypes.includes(item.type) &&
        !(item.type === 'media' && item.mediaType !== 'audio') && // Exclude non-audio media already counted
        !(item.type === 'audioEntries') // Exclude explicit audio entries if they were separate
    ).length;
    document.getElementById('otherCount').textContent = otherCount;
}

/**
 * Handles switching between tabs in the Collection Vault UI.
 * @param {Event} event The click event from a tab button.
 */
function switchTab(event) {
    // Remove 'active' class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    // Add 'active' class to the clicked tab button
    const clickedTab = event.currentTarget;
    clickedTab.classList.add('active');
    // Update the global `currentTabType` and re-render items
    currentTabType = clickedTab.dataset.tabType;
    renderItems();
}

/**
 * Deletes a single item from the collected items.
 * @param {Event} event The click event from a delete button.
 */
function deleteItem(event) {
    // Get the item ID from the closest parent card element
    const itemId = event.currentTarget.closest('.item-card').dataset.itemId;
    // Filter out the item to be deleted from the `collectedItems` array
    collectedItems = collectedItems.filter(item => item.id !== itemId);
    saveCollectedItems(); // Save the updated array to storage
    renderItems();      // Re-render to reflect the deletion
    showPopupToast('Item deleted!', 'error');
}

/**
 * Exports all collected items as a JSON file, formatted for import into OSINTVault's custom vaults.
 */
async function exportAllItems() {
    if (collectedItems.length === 0) {
        showPopupToast('No items to export!', 'warning');
        return;
    }

    // Initialize the export data structure to match OSINTVault's appState format
    const exportData = {
        customTabs: [],
        tools: [], emails: [], phones: [], crypto: [], locations: [], links: [], media: [],
        passwords: [], keywords: [], socials: [], domains: [], usernames: [], threats: [],
        vulnerabilities: [], malware: [], breaches: [], credentials: [], forums: [],
        vendors: [], telegramChannels: [], pastes: [], documents: [], networks: [],
        metadataEntries: [], archives: [], messagingApps: [], datingProfiles: [],
        audioEntries: [], facialRecognition: [], personas: [], vpns: [],
        honeypots: [], exploits: [], publicRecords: [],
        caseStudies: [], // Include if OSINTVault expects this even if empty
        collected_other_entries: [] // For any items that don't map to standard OSINTVault types
    };

    // Create a new custom vault entry within the export data
    const vaultId = `collector_vault_${Date.now()}`; // Unique ID for the new vault
    const vaultName = `Collected Data (${new Date().toLocaleString()})`; // Name based on timestamp
    const vaultIcon = 'fas fa-box-archive';
    const vaultColor = 'var(--tab-color-blue)'; // A nice blue color for the vault

    exportData.customTabs.push({
        id: vaultId,
        name: vaultName,
        icon: vaultIcon,
        color: vaultColor,
        toolIds: [] // This array will hold the IDs of all items belonging to this vault
    });

    // Process each collected item for export
    collectedItems.forEach(item => {
        const itemCopy = { ...item }; // Create a copy to modify for export compatibility
        itemCopy.customTabs = [vaultId]; // Assign the item to the new custom vault
        exportData.customTabs[0].toolIds.push(itemCopy.id); // Add item's ID to the vault's contents

        // Distribute items into the correct OSINTVault appState arrays based on their mapped type
        switch (itemCopy.type) {
            case 'keyword':
                exportData.keywords.push(itemCopy);
                break;
            case 'media':
                // Check for mediaType to push to the correct OSINTVault array
                if (itemCopy.mediaType === 'audio') {
                    // This is for audio that was captured as 'media' type in collector, but
                    // should map to 'audioEntries' in OSINTVault.
                    exportData.audioEntries.push({
                        id: itemCopy.id,
                        type: 'audio', // The type for audioEntries in OSINTVault
                        title: itemCopy.title || 'Collected Audio',
                        format: itemCopy.url.split('.').pop().split('?')[0].toLowerCase() || 'unknown',
                        url: itemCopy.url, // Store the URL, not base64 directly from extension
                        base64Data: '', // OSINTVault will not have base64 from this export, it can fetch if desired
                        duration: '', // Collector doesn't parse this, user can fill
                        quality: '',
                        language: '',
                        transcript: itemCopy.description, // Re-purpose description as transcript summary
                        speakers: '',
                        background: '',
                        tools: '',
                        description: itemCopy.description,
                        notes: `Collected from: ${itemCopy.pageUrl} on ${new Date(itemCopy.addedDate).toLocaleString()}`,
                        source: itemCopy.pageUrl,
                        addedDate: itemCopy.addedDate,
                        starred: itemCopy.starred,
                        pinned: itemCopy.pinned,
                        customTabs: itemCopy.customTabs
                    });
                } else {
                    // Images and Videos from collector's 'media' type map to OSINTVault's 'media'
                    exportData.media.push({
                        id: itemCopy.id,
                        type: 'media',
                        title: itemCopy.title || 'Collected Media',
                        mediaType: itemCopy.mediaType,
                        url: itemCopy.url, // Store the URL
                        base64Data: '', // OSINTVault can potentially fetch this if configured
                        altText: itemCopy.altText,
                        description: itemCopy.description,
                        notes: `Collected from: ${itemCopy.pageUrl} on ${new Date(itemCopy.addedDate).toLocaleString()}`,
                        source: itemCopy.pageUrl,
                        addedDate: itemCopy.addedDate,
                        starred: itemCopy.starred,
                        pinned: itemCopy.pinned,
                        customTabs: itemCopy.customTabs
                    });
                }
                break;
            case 'link':
                exportData.links.push({
                    id: itemCopy.id,
                    type: 'link',
                    url: itemCopy.url,
                    platform: itemCopy.platform,
                    title: itemCopy.title,
                    description: itemCopy.description,
                    notes: `Collected from: ${itemCopy.pageUrl} on ${new Date(itemCopy.addedDate).toLocaleString()}`,
                    source: itemCopy.pageUrl,
                    addedDate: itemCopy.addedDate,
                    starred: itemCopy.starred,
                    pinned: itemCopy.pinned,
                    customTabs: itemCopy.customTabs
                });
                break;
            case 'document':
                exportData.documents.push({
                    id: itemCopy.id,
                    type: 'document',
                    title: itemCopy.title || 'Collected Document',
                    url: itemCopy.url,
                    fileType: itemCopy.fileType,
                    contentSummary: itemCopy.contentSummary,
                    description: itemCopy.description,
                    notes: `Collected from: ${itemCopy.pageUrl} on ${new Date(itemCopy.addedDate).toLocaleString()}`,
                    source: itemCopy.pageUrl,
                    addedDate: itemCopy.addedDate,
                    starred: itemCopy.starred,
                    pinned: itemCopy.pinned,
                    customTabs: itemCopy.customTabs
                });
                break;
            case 'other':
                // For unmapped/generic types, put them in a specific 'collected_other_entries' array.
                // User might need to manually process these in OSINTVault.
                exportData.collected_other_entries.push(itemCopy);
                break;
            // No default for other core OSINTVault types (e.g., tools, emails, phones) because
            // this collector specifically maps captured content to these existing types.
            // If new collection types are added in background.js, they should be mapped here.
        }
    });

    // Convert the export data object to a JSON string
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `osintvault_collection_${new Date().toISOString().slice(0, 10)}.json`; // Suggested filename
    document.body.appendChild(a);
    a.click(); // Programmatically click the link to start download
    document.body.removeChild(a); // Clean up the temporary link
    URL.revokeObjectURL(url); // Release the object URL

    showPopupToast('Collection exported as JSON!', 'success');
}

/**
 * Clears all collected items from the extension's storage after user confirmation.
 */
async function clearAllItems() {
    if (confirm('Are you sure you want to clear ALL collected items? This action cannot be undone.')) {
        collectedItems = []; // Empty the array
        await saveCollectedItems(); // Save the empty array to storage
        renderItems(); // Re-render to show empty state
        showPopupToast('All collected items cleared!', 'info');
    }
}

// --- Event Listeners ---
// Load items when the popup HTML is fully loaded
document.addEventListener('DOMContentLoaded', loadCollectedItems);

// Attach click listeners to all tab buttons using event delegation
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', switchTab);
});

// Attach click listeners to Export and Clear buttons
document.getElementById('exportAllBtn').addEventListener('click', exportAllItems);
document.getElementById('clearAllBtn').addEventListener('click', clearAllItems);

// Initial render call (also called by loadCollectedItems, but good to have a direct one for first load)
renderItems();
updateCounts();