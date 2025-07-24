/**
 * UI components for the chat container
 */
import { getAbbreviation } from "../utils/ui-helpers";

/**
 * Create a chat button
 * @param {Object} config - Widget configuration
 * @param {Function} toggleChat - Function to toggle chat visibility
 * @returns {HTMLElement} - Chat button DOM element
 */
export function createChatButton(config, toggleChat) {
  const button = document.createElement("div");
  button.id = "GeniStudio-chat-button";
  button.innerHTML = "💬";

  const position = config.position;
  const styles = {
    position: "fixed",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: config.buttonColor,
    color: "white",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,123,255,0.3)",
    zIndex: "9999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s",
  };

  if (position.includes("bottom")) styles.bottom = "20px";
  else styles.top = "20px";

  if (position.includes("right")) styles.right = "20px";
  else styles.left = "20px";

  Object.assign(button.style, styles);

  button.addEventListener("mouseenter", () => {
    button.style.transform = "scale(1.1)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "scale(1)";
  });

  // Only add click handler if the function is provided
  if (toggleChat) {
    button.addEventListener("click", toggleChat);
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
  const overlay = document.createElement("div");
  overlay.id = "GeniStudio-chat-overlay";
  overlay.className = "webchat-overlay hidden";

  const avatarAbbr = getAbbreviation(config.chatbotName);
  const avatarUrl = config.avatarUrl || "";
  const avatarContent = avatarUrl
    ? `<img src="${avatarUrl}" alt="${config.chatbotName}" class="webchat-avatar-img">`
    : `<span>${avatarAbbr}</span>`;

  overlay.innerHTML = `
    <div class="webchat-container">
      <div class="webchat-header">
        <div class="webchat-header-info">
          <div class="webchat-avatar">
            ${avatarContent}
          </div>
          <div class="webchat-header-text">
            <h3 class="webchat-header-title">${config.chatbotName}</h3>
            <span class="webchat-status">● Connecting...</span>
          </div>
        </div>
        <div class="webchat-header-actions">
          <!-- <button class="webchat-expand-btn" id="GeniStudio-expand-btn" title="Expand">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button> -->
          <button class="webchat-minimize-btn" id="GeniStudio-minimize-btn" title="Minimize">
            <svg width="16" height="2" viewBox="0 0 16 2" fill="none">
              <path d="M1 1H15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="webchat-messages-wrapper">
        <div class="webchat-messages" id="GeniStudio-messages"></div>
      </div>
      <div class="webchat-quick-replies" id="GeniStudio-quick-replies"></div>
      <form class="webchat-input-form" id="GeniStudio-input-form">
        <div class="webchat-input-container">
          <input
            type="text"
            id="GeniStudio-input"
            placeholder="Type your message..."
            class="webchat-input"
          />
          <button type="submit" id="GeniStudio-send-btn" class="webchat-send-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </form>
      <div class="webchat-footer">
        <span>Powered by GeniStudio AI</span>
      </div>
    </div>
  `;

  // Add event handlers after DOM insertion
  setTimeout(() => {
    const form = document.getElementById("GeniStudio-input-form");
    if (form) form.addEventListener("submit", api.sendMessage);

    const closeBtn = document.getElementById("GeniStudio-close-btn");
    if (closeBtn) closeBtn.addEventListener("click", api.close);

    const minimizeBtn = document.getElementById("GeniStudio-minimize-btn");
    if (minimizeBtn) minimizeBtn.addEventListener("click", api.close);

    const expandBtn = document.getElementById("GeniStudio-expand-btn");
    if (expandBtn) expandBtn.addEventListener("click", api.toggleExpand);
  }, 0);

  return overlay;
}
