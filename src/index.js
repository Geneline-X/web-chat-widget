/**
 * GeniStudio Web Chat Widget
 * Main entry point for the library
 *
 * This file exports:
 * 1. initWebChat - Vanilla JS function to initialize the chat widget
 * Simplified for CDN-only usage
 */

import { initWebChat } from "./core/webchat";
import { injectStyles, createShadowContainer } from "./utils/style-injector";

// CSS will be imported by the build process
import "./styles/webchat.css";

// Enhanced initWebChat with style handling
function enhancedInitWebChat(config = {}) {
  // Handle CSS injection options
  if (config.injectCSS) {
    injectStyles();
  }

  // Handle Shadow DOM option
  if (config.useShadowDOM) {
    // Create a shadow DOM for complete isolation
    const shadowRoot = createShadowContainer();
    config._shadowRoot = shadowRoot;
  }

  // Initialize the actual widget
  return initWebChat(config);
}

// Export the public API - named exports for specific imports
export { enhancedInitWebChat as initWebChat };

// Auto-initialize if config is provided in window and attach to window.GeniStudioWebChat
if (typeof window !== "undefined") {
  // Create the API object on window
  window.GeniStudioWebChat = window.GeniStudioWebChat || {};

  // Add the initialization function
  window.GeniStudioWebChat.initWebChat = enhancedInitWebChat;

  // Auto-initialize if config is provided
  if (window.GeniStudioConfig) {
    // Store the returned API on window.GeniStudioWebChat
    const api = enhancedInitWebChat(window.GeniStudioConfig);

    // Copy all API methods to the global object
    Object.keys(api).forEach((key) => {
      window.GeniStudioWebChat[key] = api[key];
    });
  }
}

// Define a default export with the vanilla JS API
export default { initWebChat: enhancedInitWebChat };
