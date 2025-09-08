/**
 * UI components for the chat container
 */

/**
 * Helper function to darken a color
 * @param {string} color - The color to darken (hex, rgb, or named color)
 * @param {number} amount - Amount to darken (0-1)
 * @returns {string} - Darkened color
 */
function darkenColor(color, amount) {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
    const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
  
  // Handle rgb/rgba colors
  if (color.startsWith('rgb')) {
    const matches = color.match(/\d+/g);
    if (matches) {
      const r = Math.max(0, Math.floor(parseInt(matches[0]) * (1 - amount)));
      const g = Math.max(0, Math.floor(parseInt(matches[1]) * (1 - amount)));
      const b = Math.max(0, Math.floor(parseInt(matches[2]) * (1 - amount)));
      const a = matches[3] ? parseFloat(matches[3]) : 1;
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
  }
  
  // For named colors or other formats, return a darker fallback
  return color === '#007bff' ? '#0056b3' : '#3d39ac';
}

/**
 * Chat Container Component - Creates the main chat interface
 */

/**
 * Create chat button
 * @param {Object} config - Widget configuration
 * @param {Function} toggleChat - Function to toggle chat visibility
 * @returns {HTMLElement} - Chat button element
 */
export function createChatButton(config, toggleChat) {
  const button = document.createElement("button");
  button.id = "GeniStudio-chat-button";
  button.className = "webchat-button";
  button.innerHTML = `
    <span class="chat-icon">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
        <path d="M160-240q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720L720-240H160Z"/>
      </svg>
    </span>
    <span class="close-icon">
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
      </svg>
    </span>
  `;
  button.title = "Open chat";

  // Apply custom button color if provided - set as CSS variables for the entire widget
  if (config.buttonColor) {
    // Set CSS custom properties on the document root so the entire widget can use them
    document.documentElement.style.setProperty('--webchat-primary-color', config.buttonColor);
    
    // Calculate a darker version for hover states
    const hoverColor = darkenColor(config.buttonColor, 0.15);
    document.documentElement.style.setProperty('--webchat-primary-hover', hoverColor);
  }

  // Add custom styles from config
  if (config.buttonStyles) {
    Object.assign(button.style, config.buttonStyles);
  }

  // Apply position
  const position = config.position || "bottom-right";
  if (position.includes("left")) {
    button.style.left = "35px";
    button.style.right = "auto";
  } else {
    button.style.right = "35px";
  }
  if (position.includes("top")) {
    button.style.top = "30px";
    button.style.bottom = "auto";
  } else {
    button.style.bottom = "30px";
  }

  return button;
}

/**
 * Create the full chat container
 * @param {Object} config - Widget configuration
 * @param {Object} api - API object with event handlers
 * @returns {HTMLElement} - Chat container DOM element
 */
export function createChatContainer(config, api) {
  // Apply custom button color as CSS variables if provided
  if (config.buttonColor) {
    document.documentElement.style.setProperty('--webchat-primary-color', config.buttonColor);
    const hoverColor = darkenColor(config.buttonColor, 0.15);
    document.documentElement.style.setProperty('--webchat-primary-hover', hoverColor);
  }

  const overlay = document.createElement("div");
  overlay.id = "GeniStudio-chat-overlay";
  overlay.className = "webchat-overlay hidden";

  // Apply position-based transform origin
  const position = config.position || "bottom-right";
  if (position.includes("left")) {
    overlay.style.transformOrigin = position.includes("top") ? "top left" : "bottom left";
  } else {
    overlay.style.transformOrigin = position.includes("top") ? "top right" : "bottom right";
  }

  overlay.innerHTML = `
    <div class="webchat-container">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="header-info">
          <svg class="chatbot-logo" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
            <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"/>
          </svg>
          <h2 class="logo-text">${config.chatbotName || 'Chatbot'}</h2>
        </div>
        <button id="GeniStudio-close-btn" class="close-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
      </div>
      
      <!-- Chat Body -->
      <div class="chat-body">
        <div id="GeniStudio-messages" class="webchat-messages">
          <!-- Messages will be rendered here -->
        </div>
      </div>
      
      <!-- Chat Footer -->
      <div class="chat-footer">
        <form class="chat-form" id="GeniStudio-input-form">
          <textarea 
            id="GeniStudio-input"
            class="message-input" 
            placeholder="Type your message..."
            required
            rows="1"
          ></textarea>
          <div class="chat-controls">
            <button type="submit" id="GeniStudio-send-btn" class="send-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"/>
              </svg>
            </button>
          </div>
        </form>
        
        <!-- Powered by GeniStudio -->
        <div class="webchat-powered-by">
          <span class="powered-text">Powered by</span>
          <span class="geni-studio">GeniStudio</span>
        </div>
      </div>
    </div>
  `;

  // Add event handlers after DOM insertion
  setTimeout(() => {
    const form = document.getElementById("GeniStudio-input-form");
    if (form) form.addEventListener("submit", api.sendMessage);

    const closeBtn = document.getElementById("GeniStudio-close-btn");
    if (closeBtn) closeBtn.addEventListener("click", api.close);

    // Auto-resize textarea
    const messageInput = document.getElementById("GeniStudio-input");
    if (messageInput) {
      const initialHeight = messageInput.scrollHeight;
      // Store initial height for later use when resetting
      messageInput.setAttribute('data-initial-height', `${initialHeight}px`);
      
      messageInput.addEventListener("input", () => {
        messageInput.style.height = `${initialHeight}px`;
        messageInput.style.height = `${messageInput.scrollHeight}px`;
        
        // Adjust form border radius based on height
        const form = document.querySelector(".chat-form");
        if (form) {
          form.style.borderRadius = messageInput.scrollHeight > initialHeight ? "15px" : "25px";
        }
      });

      // Handle Enter key for sending messages
      messageInput.addEventListener("keydown", (e) => {
        const userMessage = e.target.value.trim();
        if (e.key === "Enter" && !e.shiftKey && userMessage && window.innerWidth > 768) {
          e.preventDefault();
          api.sendMessage(e);
        }
      });
    }
  }, 0);

  return overlay;
}
