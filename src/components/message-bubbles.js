/**
 * Message bubble component
 */
import { parseMarkdown } from "../utils/markdown";
import { formatTime } from "../utils/ui-helpers";

/**
 * Render a message bubble for the chat
 * @param {Object} message - Message object
 * @param {boolean} [isNewMessage=true] - Whether this is a new message being added
 * @returns {HTMLElement} - Message bubble DOM element
 */
export function renderMessageBubble(message, isNewMessage = true) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${message.sender === 'bot' ? 'bot-message' : 'user-message'}`;
  
  // Add animation class for new messages
  if (isNewMessage) {
    wrapper.classList.add('message-entering');
    
    // Remove the animation class after animation completes
    setTimeout(() => {
      wrapper.classList.remove('message-entering');
    }, 500);
  }

  if (message.sender === "bot") {
    // Bot message with avatar and bubble
    wrapper.innerHTML = `
      <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
        <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"/>
      </svg>
      <div class="message-text">${parseMarkdown(message.text || "")}</div>
    `;
  } else {
    // User message (no avatar needed)
    wrapper.innerHTML = `
      <div class="message-text">${parseMarkdown(message.text || "")}</div>
    `;
  }

  // Add streaming cursor for bot messages
  if (message.isStreaming && message.sender === "bot") {
    const textContent = wrapper.querySelector('.message-text');
    if (textContent) {
      textContent.innerHTML += '<span class="cursor">|</span>';
    }
  }

  return wrapper;
}

/**
 * Render typing indicator
 * @param {string} [stage='typing'] - The processing stage ('processing', 'typing', 'thinking')
 * @param {boolean} [isNewMessage=true] - Whether this is a new typing indicator
 * @returns {HTMLElement} - Typing indicator DOM element
 */
export function renderTypingIndicator(stage = "typing", isNewMessage = true) {
  const wrapper = document.createElement("div");
  wrapper.className = "message bot-message thinking typing-wrapper";
  
  // Add animation class for new indicators
  if (isNewMessage) {
    wrapper.classList.add('message-entering');
    
    // Remove the animation class after animation completes
    setTimeout(() => {
      wrapper.classList.remove('message-entering');
    }, 500);
  }

  wrapper.innerHTML = `
    <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
      <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"/>
    </svg>
    <div class="message-text">
      <div class="thinking-indicator">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
  `;

  return wrapper;
}

/**
 * Render empty state when no messages are present
 * @returns {HTMLElement} - Empty state DOM element
 */
/**
 * Render empty state with welcome message
 * @returns {HTMLElement} - Empty state DOM element
 */
export function renderEmptyState() {
  const emptyState = document.createElement("div");
  emptyState.className = "webchat-empty-state";
  
  // Create a welcome message
  const welcomeMessage = {
    id: 'welcome',
    text: 'Hey there 👋\nHow can I help you today?',
    sender: 'bot',
    timestamp: new Date(),
    isStreaming: false
  };
  
  return renderMessageBubble(welcomeMessage, false);
}

/**
 * Render a date separator
 * @param {Date} date - The date to display
 * @returns {HTMLElement} - Date separator DOM element
 */
export function renderDateSeparator(date) {
  const separator = document.createElement("div");
  separator.className = "webchat-date-separator";

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let dateText;
  if (date.toDateString() === today.toDateString()) {
    dateText = "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    dateText = "Yesterday";
  } else {
    dateText = date.toLocaleDateString();
  }

  separator.innerHTML = `<span>${dateText}</span>`;
  return separator;
}

/**
 * Render quick reply buttons
 * @param {Array} quickReplies - Array of quick reply options
 * @param {Function} onQuickReply - Callback function when a quick reply is clicked
 * @returns {HTMLElement} - Quick replies DOM element
 */
export function renderQuickReplies(quickReplies, onQuickReply) {
  const container = document.createElement("div");
  container.className = "webchat-quick-replies-container";

  quickReplies.forEach((reply) => {
    const button = document.createElement("button");
    button.className = "webchat-quick-reply-button";
    button.textContent = reply.text || reply.title;
    button.onclick = () => onQuickReply(reply.value || reply.payload, reply.text || reply.title);
    container.appendChild(button);
  });

  return container;
}
