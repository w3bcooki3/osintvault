// background.js

// Function to generate a unique ID for collected items
function generateUniqueId() {
  return 'collector_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Function to create context menus when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Main parent context menu item
  chrome.contextMenus.create({
    id: "saveToCollectionVault",
    title: "Save to Collection Vault",
    contexts: ["all"] // Show in all contexts (page, selection, image, link)
  });

  // Sub-menu item for saving selected text
  chrome.contextMenus.create({
    id: "saveText",
    parentId: "saveToCollectionVault",
    title: "Save Selected Text",
    contexts: ["selection"] // Only show when text is selected
  });

  // Sub-menu item for saving an image
  chrome.contextMenus.create({
    id: "saveImage",
    parentId: "saveToCollectionVault",
    title: "Save Image",
    contexts: ["image"] // Only show when an image is right-clicked
  });

  // Sub-menu item for saving a link
  chrome.contextMenus.create({
    id: "saveLink",
    parentId: "saveToCollectionVault",
    title: "Save Link",
    contexts: ["link"] // Only show when a link is right-clicked
  });

  // Sub-menu item for saving the current page's URL
  chrome.contextMenus.create({
    id: "saveCurrentPage",
    parentId: "saveToCollectionVault",
    title: "Save Current Page URL",
    contexts: ["page"] // Always show on the page
  });

  // Sub-menu item for saving all media elements (images, videos, audio) on the current page
  chrome.contextMenus.create({
    id: "saveAllMedia",
    parentId: "saveToCollectionVault",
    title: "Save All Media on Page",
    contexts: ["page"] // Always show on the page
  });

  // Sub-menu item for saving a document link (e.g., PDF)
  chrome.contextMenus.create({
    id: "saveDocument",
    parentId: "saveToCollectionVault",
    title: "Save Document (Link)",
    contexts: ["link"] // Only show when a link is right-clicked
  });
});

// Listener for clicks on any context menu item created by this extension
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("[Background] Context menu clicked:", info.menuItemId, "on tab:", tab.id); // Debug log
  // Determine which context menu item was clicked and execute the appropriate action
  if (info.menuItemId === "saveText") {
    // Execute content script to get selected text
    executeContentScript(tab.id, "getSelectedText", info.selectionText); // Pass selectionText directly
  } else if (info.menuItemId === "saveImage") {
    // Execute content script to get image data using its URL
    executeContentScript(tab.id, "getImageData", info.srcUrl);
  } else if (info.menuItemId === "saveLink") {
    // Execute content script to get link data using its URL and selected text (if any)
    executeContentScript(tab.id, "getLinkData", info.linkUrl, info.selectionText);
  } else if (info.menuItemId === "saveCurrentPage") {
    // Execute content script to get current page's URL and title
    executeContentScript(tab.id, "getCurrentPageData");
  } else if (info.menuItemId === "saveAllMedia") {
    // Execute content script to get all media URLs on the page
    executeContentScript(tab.id, "getAllMediaData");
  } else if (info.menuItemId === "saveDocument") {
    // Execute content script to get document link data
    executeContentScript(tab.id, "getDocumentData", info.linkUrl, info.selectionText);
  }
});

/**
 * Executes a function within the content script context of a specific tab.
 * This is used to extract data directly from the webpage.
 * @param {number} tabId The ID of the tab where the script should execute.
 * @param {string} action A string indicating which content script function to call.
 * @param {...any} args Additional arguments to pass to the content script function.
 */
async function executeContentScript(tabId, action, ...args) {
  try {
    const pageDetails = await new Promise(resolve => {
        chrome.tabs.get(tabId, (tab) => {
            resolve({ title: tab.title, url: tab.url });
        });
    });

    console.log("[Background] Executing content script for action:", action, "with args:", args, "on page:", pageDetails.url); // Debug log

    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: (action, currentTabTitle, currentTabUrl, scriptSpecificArgs) => {
        // This inner function runs inside the webpage's isolated world.
        // It directly accesses DOM elements or browser APIs available there.

        // Helper to get all image/video/audio URLs on the page
        const getAllMedia = () => {
          const media = [];
          document.querySelectorAll('img, video, audio').forEach(el => {
            // Ensure the src is an absolute URL
            const src = el.currentSrc || el.src;
            if (src && src.startsWith('http')) { // Only collect http(s) URLs
              media.push({
                type: el.tagName.toLowerCase(), // 'img', 'video', 'audio'
                url: src,
                alt: el.alt || '', // For images
              });
            }
          });
          return media;
        };

        let dataToReturn = null;
        // Dispatch based on the action requested by background.js
        if (action === "getSelectedText") {
          const selectedText = scriptSpecificArgs[0]; // Passed from info.selectionText
          dataToReturn = {
            type: 'text',
            value: selectedText,
            url: currentTabUrl, // The URL of the page where text was selected
            source: currentTabTitle // The title of the page
          };
        } else if (action === "getImageData") {
          const imageUrl = scriptSpecificArgs[0];
          dataToReturn = {
            type: 'image',
            url: imageUrl,
            source: currentTabUrl,
            pageTitle: currentTabTitle
          };
        } else if (action === "getLinkData") {
          const linkUrl = scriptSpecificArgs[0];
          const linkText = scriptSpecificArgs[1];
          dataToReturn = {
            type: 'link',
            url: linkUrl,
            text: linkText || linkUrl,
            source: currentTabUrl,
            pageTitle: currentTabTitle
          };
        } else if (action === "getCurrentPageData") {
          dataToReturn = {
            type: 'page',
            url: currentTabUrl,
            title: currentTabTitle
          };
        } else if (action === "getAllMediaData") {
          // This returns an array of media objects
          dataToReturn = getAllMedia().map(mediaItem => ({
            ...mediaItem,
            source: currentTabUrl,
            pageTitle: currentTabTitle
          }));
        } else if (action === "getDocumentData") {
          const docUrl = scriptSpecificArgs[0];
          const docText = scriptSpecificArgs[1];
          dataToReturn = {
            type: 'document',
            url: docUrl,
            title: docText || docUrl.split('/').pop() || 'Document',
            fileType: docUrl.split('.').pop().split('?')[0].toLowerCase(),
            source: currentTabUrl,
            pageTitle: currentTabTitle
          };
        }
        return dataToReturn;
      },
      // Arguments passed to the function above.
      args: [action, pageDetails.title, pageDetails.url, args] // Pass all dynamic arguments in an array
    });

    const data = results[0].result; // The result from the content script execution
    console.log("[Background] Data received from content script:", data); // Debug log

    if (data) {
      if (Array.isArray(data)) { // If it's an array (e.g., from getAllMediaData)
        for (const item of data) {
          await saveCollectedItem(item.type, item);
        }
        sendRuntimeMessage(tabId, { action: "showToast", message: `Saved ${data.length} media items to Collection Vault!` });
      } else {
        // Save the single collected item
        await saveCollectedItem(data.type, data);
        sendRuntimeMessage(tabId, { action: "showToast", message: `Saved ${data.type} to Collection Vault!` });
      }
    } else {
      sendRuntimeMessage(tabId, { action: "showToast", message: "Failed to collect data.", type: "error" });
    }
  } catch (error) {
    console.error("[Background] Error executing content script or saving data:", error); // Debug log
    sendRuntimeMessage(tabId, { action: "showToast", message: "Error collecting data: " + error.message, type: "error" });
  }
}

/**
 * Saves a collected item into the extension's local storage.
 * Items are mapped to OSINTVault's internal data types for future compatibility.
 * @param {string} itemType The raw type of item collected (e.g., 'text', 'image').
 * @param {object} data The raw data collected from the content script.
 */
async function saveCollectedItem(itemType, data) {
  const itemId = generateUniqueId(); // Generate a unique ID for the new item
  const timestamp = new Date().toISOString(); // Current timestamp

  // Base structure for any collected entry
  let entry = {
    id: itemId,
    addedDate: timestamp,
    sourceUrl: data.url, // URL of the item itself (image src, link href etc.)
    pageUrl: data.source || data.url, // URL of the page where the item was found
    pageTitle: data.pageTitle || 'Unknown Page', // Title of the source page
    starred: false, // Default to not starred
    pinned: false,   // Default to not pinned
    customTabs: []   // Placeholder for OSINTVault custom vault assignment
  };

  // Map the collected data to OSINTVault's appState types and structures
  switch (itemType) {
    case 'text':
      entry.type = 'keyword'; // Maps to OSINTVault's 'keyword' type
      entry.value = data.value;
      entry.context = 'Web page selection';
      entry.description = data.value.substring(0, 150) + (data.value.length > 150 ? '...' : ''); // Short description
      break;
    case 'image':
      entry.type = 'media'; // Maps to OSINTVault's 'media' type
      entry.mediaType = 'image';
      entry.title = `Image from: ${data.pageTitle}`;
      entry.url = data.url; // Store the original image URL
      entry.altText = data.alt || '';
      entry.description = `Image collected from ${data.pageTitle}. Original URL: ${data.url}`;
      break;
    case 'video': // From `getAllMediaData`
      entry.type = 'media';
      entry.mediaType = 'video';
      entry.title = `Video from: ${data.pageTitle}`;
      entry.url = data.url;
      entry.description = `Video collected from ${data.pageTitle}. Original URL: ${data.url}`;
      break;
    case 'audio': // From `getAllMediaData`
      entry.type = 'audioEntries'; // Maps to OSINTVault's 'audioEntries' type
      entry.title = `Audio from: ${data.pageTitle}`;
      entry.url = data.url; // Store the original audio URL
      entry.format = data.url.split('.').pop().split('?')[0].toLowerCase() || 'unknown'; // Infer format
      entry.description = `Audio collected from ${data.pageTitle}. Original URL: ${data.url}`;
      entry.notes = `This is an audio file collected from: ${data.pageUrl}`; // Adding notes for context
      break;
    case 'link':
      entry.type = 'link'; // Maps to OSINTVault's 'link' type
      entry.url = data.url;
      entry.platform = 'Web Link';
      entry.title = data.text || data.url; // Use link text as title, fallback to URL
      entry.description = `Link to ${data.text || data.url} from page "${data.pageTitle}"`;
      break;
    case 'page': // Current page URL (collected as a 'link' type)
      entry.type = 'link'; // Maps to OSINTVault's 'link' type for a page
      entry.url = data.url;
      entry.platform = 'Web Page';
      entry.title = data.title;
      entry.description = `Saved current page: ${data.title}`;
      break;
    case 'document':
      entry.type = 'document'; // Maps to OSINTVault's 'document' type
      entry.url = data.url;
      entry.title = data.title || `Document from: ${data.pageTitle}`;
      entry.fileType = data.fileType || 'unknown';
      entry.contentSummary = `Document file collected from ${data.pageTitle}.`;
      entry.description = `Document link: ${data.url}`;
      break;
    default:
      console.warn(`[Background] Unknown item type collected: ${itemType}. Storing as generic.`); // Debug log
      entry.type = 'other'; // A fallback type for anything unmapped
      entry.value = JSON.stringify(data); // Store raw data for 'other'
      entry.title = `Collected: ${itemType}`;
      entry.description = `Raw data collected: ${JSON.stringify(data).substring(0, 150)}...`;
      break;
  }

  // Retrieve current collected items from Chrome's local storage
  let { collectedItems } = await chrome.storage.local.get('collectedItems');
  collectedItems = collectedItems || []; // Initialize if empty

  collectedItems.push(entry); // Add the new entry

  // Save the updated collection back to storage
  try {
    await chrome.storage.local.set({ collectedItems });
    console.log("[Background] Item saved to storage:", entry.id, entry.type); // Debug log
  } catch (storageError) {
    console.error("[Background] Error saving item to chrome.storage.local:", storageError); // Debug log
    // You might want to send a toast message here too if storage fails
    sendRuntimeMessage(tab.id, { action: "showToast", message: "Failed to save item to local storage.", type: "error" });
  }
}

/**
 * Sends a message to the active tab's content script to display a toast notification.
 * @param {number} tabId The ID of the target tab.
 * @param {object} message The message object containing action, message text, and type.
 */
function sendRuntimeMessage(tabId, message) {
  // Use chrome.tabs.sendMessage to send messages to content scripts.
  // The content script must have a runtime.onMessage listener.
  chrome.tabs.sendMessage(tabId, message).catch(error => {
    // This catch block handles errors if the content script is not injected
    // (e.g., on a browser's internal page like chrome://extensions)
    // or if there are issues communicating with it.
    console.warn("[Background] Could not send message to content script (likely not injected or has issues):", error);
  });
}
