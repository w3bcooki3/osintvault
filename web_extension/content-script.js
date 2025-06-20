// content_script.js

// Function to inject CSS styles for the toast messages.
// This ensures the toasts look consistent and appear correctly on any page.
function injectToastStyles() {
  // Check if the style element already exists to prevent duplicate injections
  if (document.getElementById('osintvault-collector-toast-style')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'osintvault-collector-toast-style';
  style.textContent = `
    /* Container for toast messages to stack them nicely */
    #osintvault-collector-toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px; /* Space between multiple toasts */
      z-index: 10000; /* High z-index to ensure visibility above page content */
      pointer-events: none; /* Allows clicks to pass through the container */
    }
    /* Individual toast message styling */
    .osintvault-collector-toast {
      background-color: #333; /* Dark background */
      color: #fff; /* White text */
      padding: 10px 15px;
      border-radius: 5px;
      font-family: sans-serif;
      font-size: 14px;
      opacity: 0; /* Initially hidden */
      transform: translateY(20px); /* Start slightly below */
      transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out; /* Smooth fade-in and slide-up */
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      min-width: 200px;
      text-align: center;
      pointer-events: auto; /* Re-enable pointer events on the toast itself */
    }
    /* State for showing the toast */
    .osintvault-collector-toast.show {
      opacity: 1;
      transform: translateY(0);
    }
    /* Specific styles for different toast types */
    .osintvault-collector-toast.success { background-color: #28a745; } /* Green for success */
    .osintvault-collector-toast.info { background-color: #17a2b8; }    /* Blue for information */
    .osintvault-collector-toast.warning { background-color: #ffc107; color: #333; } /* Yellow for warning */
    .osintvault-collector-toast.error { background-color: #dc3545; }  /* Red for error */
  `;
  document.head.appendChild(style); // Append styles to the document's head
}

/**
 * Displays a toast notification on the current webpage.
 * @param {string} message The text message to display in the toast.
 * @param {string} [type='success'] The type of toast ('success', 'info', 'warning', 'error').
 * @param {number} [duration=3000] How long the toast should be visible in milliseconds.
 */
function showToast(message, type = 'success', duration = 3000) {
  injectToastStyles(); // Ensure styles are present

  let toastContainer = document.getElementById('osintvault-collector-toast-container');
  // Create the toast container if it doesn't exist
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'osintvault-collector-toast-container';
    document.body.appendChild(toastContainer); // Append to the body
  }

  const toast = document.createElement('div');
  toast.classList.add('osintvault-collector-toast', type);
  toast.textContent = message;

  toastContainer.appendChild(toast); // Add the new toast to the container

  // Force a reflow to ensure the CSS transition plays correctly
  void toast.offsetWidth;

  // Add the 'show' class to make the toast visible
  toast.classList.add('show');

  // Set a timeout to hide and remove the toast after the specified duration
  setTimeout(() => {
    toast.classList.remove('show'); // Hide the toast
    // Remove the toast from the DOM after its exit animation completes
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

// Listen for messages sent from the background script.
// This is how the background script tells the content script to display a toast.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showToast") {
    showToast(request.message, request.type);
  }
  // If you needed to send a response back, you'd call sendResponse(responseObject);
});
