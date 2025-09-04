/**
 * Message bubble component
 */
import { parseMarkdown } from "../utils/markdown";
import { formatTime, getAbbreviation } from "../utils/ui-helpers";

/**
 * Render a message bubble for the chat
 * @param {Object} message - Message object
 * @param {boolean} [isNewMessage=true] - Whether this is a new message being added
 * @returns {HTMLElement} - Message bubble DOM element
 */
export function renderMessageBubble(message, isNewMessage = true) {
  const wrapper = document.createElement("div");
  wrapper.className = `webchat-message-bubble-wrapper ${message.sender}-wrapper`;
  
  // Add animation class for new messages
  if (isNewMessage) {
    wrapper.classList.add('message-entering');
    
    // Remove the animation class after animation completes
    setTimeout(() => {
      wrapper.classList.remove('message-entering');
    }, 500);
  }

  // For bot messages, create a container with avatar and message side by side
  if (message.sender === "bot") {
    const bubbleContainer = document.createElement("div");
    bubbleContainer.className = "webchat-bubble-container";

    // Create avatar for bot messages
    const avatar = document.createElement("div");
    avatar.className = "webchat-message-avatar";

    // Use the bot avatar if provided in the message or fallback to default
    if (message.avatar) {
      avatar.innerHTML = `<img src="${message.avatar}" alt="Bot" class="webchat-avatar-img-small">`;
    } else {
      const initials = message.botName
        ? getAbbreviation(message.botName)
        : "AI";
      avatar.innerHTML = `<span>${initials}</span>`;
    }

    bubbleContainer.appendChild(avatar);

    // Create message bubble
    const messageBubble = document.createElement("div");
    messageBubble.className = `webchat-message-bubble ${message.sender}`;
    if (message.isError) messageBubble.classList.add("error");

    // Create message content
    const textContent = document.createElement("div");
    textContent.className = "message-text";
    textContent.innerHTML = parseMarkdown(message.text || "");
    if (message.isStreaming) {
      textContent.innerHTML += '<span class="cursor">|</span>';
    }

    // Create timestamp
    const timestamp = document.createElement("div");
    timestamp.className = "message-timestamp";
    timestamp.innerText = formatTime(message.timestamp);

    messageBubble.appendChild(textContent);
    messageBubble.appendChild(timestamp);

    bubbleContainer.appendChild(messageBubble);
    wrapper.appendChild(bubbleContainer);
  } else {
    // For user messages, just create the bubble
    const messageBubble = document.createElement("div");
    messageBubble.className = `webchat-message-bubble ${message.sender}`;
    if (message.isError) messageBubble.classList.add("error");

    // Create message content
    const textContent = document.createElement("div");
    textContent.className = "message-text";
    textContent.textContent = message.text;

    // Create timestamp
    const timestamp = document.createElement("div");
    timestamp.className = "message-timestamp";
    timestamp.innerText = formatTime(message.timestamp);

    messageBubble.appendChild(textContent);
    messageBubble.appendChild(timestamp);
    wrapper.appendChild(messageBubble);
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
  // Create wrapper with avatar for HubSpot-style layout
  const wrapper = document.createElement("div");
  wrapper.className =
    "webchat-message-bubble-wrapper bot-wrapper typing-wrapper";

  // Add animation class for new typing indicators
  if (isNewMessage) {
    wrapper.classList.add('message-entering');
    
    // Remove the animation class after animation completes
    setTimeout(() => {
      wrapper.classList.remove('message-entering');
    }, 400);
  }

  // Create bubble container to align avatar and typing bubble side by side
  const bubbleContainer = document.createElement("div");
  bubbleContainer.className = "webchat-bubble-container";

  // Add avatar for the bot typing indicator
  const avatar = document.createElement("div");
  avatar.className = "webchat-message-avatar";

  // Get the bot avatar from the window config or use default
  const botName =
    window.GeniStudioWebChat && window.GeniStudioWebChat.config
      ? window.GeniStudioWebChat.config.chatbotName
      : "AI";
  const initials = getAbbreviation(botName);
  avatar.innerHTML = `<span>${initials}</span>`;

  bubbleContainer.appendChild(avatar);

  // Create the typing indicator bubble
  const typing = document.createElement("div");
  typing.className = "webchat-message-bubble bot typing-bubble";

  // Different bubble styles based on processing stage
  switch (stage) {
    case "processing":
      typing.classList.add("processing-bubble");
      break;
    case "thinking":
      typing.classList.add("thinking-bubble");
      break;
    default:
      break;
  }

  // Create a container with typing text and animated dots
  const indicatorContainer = document.createElement("div");
  indicatorContainer.className = "typing-indicator";

  // Add typing text based on stage
  const typingText = document.createElement("span");
  typingText.className = "typing-text";

  // Different messages based on processing stage
  switch (stage) {
    case "processing":
      typingText.textContent = "Processing your message";
      break;
    case "thinking":
      typingText.textContent = "GeniStudio is thinking";
      break;
    case "typing":
    default:
      typingText.textContent = "GeniStudio is typing";
      break;
  }

  indicatorContainer.appendChild(typingText);

  // Add animated dots
  const dotsContainer = document.createElement("span");
  dotsContainer.className = "typing-dots";

  // Add pulsing dots with wave effect
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("span");
    dot.className = "typing-dot";
    // Add delay to each dot for wave effect
    dot.style.animationDelay = `${i * 0.15}s`;

    // Add different colors based on stage
    if (stage === "processing") {
      dot.classList.add("processing-dot");
    } else if (stage === "thinking") {
      dot.classList.add("thinking-dot");
    }

    dotsContainer.appendChild(dot);
  }

  indicatorContainer.appendChild(dotsContainer);
  typing.appendChild(indicatorContainer);
  bubbleContainer.appendChild(typing);

  wrapper.appendChild(bubbleContainer);

  return wrapper;
}

/**
 * Render empty state for chat with no messages
 * @returns {HTMLElement} - Empty state DOM element
 */
export function renderEmptyState() {
  const empty = document.createElement("div");
  empty.className = "webchat-empty-watermark";

  empty.innerHTML = `
    <div class="webchat-empty-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <span class="webchat-empty-title">Start a Conversation</span>
    <p class="webchat-empty-text">Ask a question or send a message to start chatting</p>
  `;
  return empty;
}

/**
 * Render a date separator for the chat
 * @param {Date} date - Date object to format and display
 * @returns {HTMLElement} - Date separator DOM element
 */
export function renderDateSeparator(date) {
  const separator = document.createElement("div");
  separator.className = "webchat-date-separator";

  const dateText = formatDate(date);
  separator.innerHTML = `<span class="webchat-date-text">${dateText}</span>`;

  return separator;
}

/**
 * Format a date for the date separator
 * @param {Date} date - Date object to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if the date is today
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  // Check if the date is yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  // Otherwise format as Month Day, Year
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Render quick reply buttons
 * @param {Array} options - Array of quick reply options
 * @param {Function} onSelect - Callback when an option is selected
 * @returns {HTMLElement} - Quick reply DOM element
 */
export function renderQuickReplies(options, onSelect) {
  const container = document.createElement("div");
  container.className = "webchat-quick-replies";

  options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "webchat-quick-reply-btn";
    button.textContent = option.text || option;
    button.setAttribute("data-value", option.value || option);

    button.addEventListener("click", () => {
      if (typeof onSelect === "function") {
        onSelect(option.value || option, option.text || option);
      }
    });

    container.appendChild(button);
  });

  return container;
}
