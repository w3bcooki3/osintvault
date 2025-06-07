// script.js

document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const saveApiKeysBtn = document.getElementById('saveApiKeysBtn');
    const apiKeyStatus = document.getElementById('apiKeyStatus');
    const abuseIpDbApiKeyInput = document.getElementById('abuseIpDbApiKey');
    const greyNoiseApiKeyInput = document.getElementById('greyNoiseApiKey');

    // --- Tab Navigation Logic ---
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' class from all buttons and content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add 'active' class to the clicked button
            button.classList.add('active');

            // Show the corresponding tab content
            const targetTabId = button.dataset.tab;
            document.getElementById(targetTabId).classList.add('active');

            // Specific actions when a tab becomes active (if any)
            if (targetTabId === 'settings') {
                loadApiKeys(); // Load keys when settings tab is opened
            }
            // You can add more initializations here for other tabs if needed
            // e.g., if a module needs to fetch data on tab switch
        });
    });

    // Automatically activate the first tab on load
    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }

    // --- API Key Management Logic ---
    const API_KEYS_STORAGE_KEY = 'defenderBoxApiKeys';

    function saveApiKeys() {
        const keys = {
            abuseIpDb: abuseIpDbApiKeyInput.value.trim(),
            greyNoise: greyNoiseApiKeyInput.value.trim(),
            // Add other API keys here as they are added to the app
        };

        try {
            localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
            apiKeyStatus.textContent = 'API keys saved successfully!';
            apiKeyStatus.className = 'status-message success';
            console.log('API keys saved to localStorage.');
        } catch (e) {
            apiKeyStatus.textContent = 'Error saving API keys. Local storage might be full or unavailable.';
            apiKeyStatus.className = 'status-message error';
            console.error('Error saving API keys:', e);
        }
    }

    function loadApiKeys() {
        try {
            const storedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
            if (storedKeys) {
                const keys = JSON.parse(storedKeys);
                abuseIpDbApiKeyInput.value = keys.abuseIpDb || '';
                greyNoiseApiKeyInput.value = keys.greyNoise || '';
                // Load other API keys here
                apiKeyStatus.textContent = 'API keys loaded.';
                apiKeyStatus.className = 'status-message'; // Neutral
            } else {
                apiKeyStatus.textContent = 'No API keys found in local storage.';
                apiKeyStatus.className = 'status-message';
            }
        } catch (e) {
            apiKeyStatus.textContent = 'Error loading API keys. Data might be corrupted.';
            apiKeyStatus.className = 'status-message error';
            console.error('Error loading API keys:', e);
        }
    }

    // Event listener for the Save API Keys button
    if (saveApiKeysBtn) {
        saveApiKeysBtn.addEventListener('click', saveApiKeys);
    }

    // Expose a function to get API keys for other modules
    window.getApiKeys = () => {
        try {
            const storedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
            return storedKeys ? JSON.parse(storedKeys) : {};
        } catch (e) {
            console.error('Error getting API keys:', e);
            return {};
        }
    };

    // --- Dark Mode Toggle (Optional, but good for UX) ---
    // You can add a button for this in the header, or a simple checkbox in settings
    // For now, let's assume a simple toggle might be added later,
    // and the CSS is already set up for it.
    // Example: document.body.setAttribute('data-theme', 'dark');
});