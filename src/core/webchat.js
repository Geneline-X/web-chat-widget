/**
 * GeniStudio Web Chat Widget - Main Module
 * Connects UI components and GeniStudio HTTP API communication
 */
import {
  sendMessageToAPI,
} from "./api-client";
import {
  renderMessageBubble,
  renderTypingIndicator,
  renderEmptyState,
  renderDateSeparator,
  renderQuickReplies,
} from "../components/message-bubbles";
import { parseMarkdown } from "../utils/markdown";
import {
  createChatButton,
  createChatContainer,
} from "../components/chat-container";
import { generateUserId, groupMessagesBySender } from "../utils/ui-helpers";

/**
 * Create and initialize the chat widget
 * @param {Object} userConfig - Widget configuration
 * @returns {Object} - Widget API
 */
export function initWebChat(userConfig = {}) {
  let config = {
    apiUrl: "http://localhost:3000/api/chatbot/stream",
    chatbotId: "",
    userEmail: "",
    buttonColor: "",
    injectCSS: false,
    ...userConfig,
  };

  if (!config.chatbotName || typeof config.chatbotName !== "string") {
    config.chatbotName = "GeniStudio Support";
  }

  // Validate required configuration
  if (!config.chatbotId) {
    console.error("GeniStudio: chatbotId is required");
    return null;
  }

  // Generate user email if not provided
  if (!config.userEmail) {
    const userId = generateUserId();
    config.userEmail = `${userId}@webchat.genistudio.com`;
  }

  // State variables
  let isOpen = false;
  let messages = [];
  let isLoading = false;
  let currentStreamingMessage = null;

  // Timing variables for response time measurement
  let messageTimestamps = {};

  // Create UI components - don't pass toggleChat here to prevent duplicate handlers
  const chatButton = createChatButton(config, null);
  document.body.appendChild(chatButton);

  // Add a single, direct event handler to the button
  chatButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(
      "Chat button clicked, current state:",
      isOpen ? "open" : "closed"
    );
    toggleChat();
  });

  const chatContainerAPI = {
    sendMessage: (event) => sendMessage(event),
    close: () => close(),
    toggleExpand: () => toggleExpand(),
  };

  const chatContainer = createChatContainer(config, chatContainerAPI);
  document.body.appendChild(chatContainer);

  // Set up page unload handler
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", cleanup);

    // Add resize listener to handle responsive behavior
    window.addEventListener(
      "resize",
      debounce(() => {
        if (isOpen) positionChatContainer();
      }, 250)
    );
  }

  // Debounce function to limit rapid resize events
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Core functions
  function toggleChat() {
    isOpen = !isOpen;
    const overlay = document.getElementById("GeniStudio-chat-overlay");
    const chatButton = document.getElementById("GeniStudio-chat-button");

    if (isOpen) {
      // Check if we're on mobile
      const isMobile = window.innerWidth <= 768;

      // Position the chat container based on button position
      positionChatContainer();

      // Show the overlay
      overlay.classList.remove("hidden");
      overlay.classList.add("visible");

      // On mobile, add a body class to prevent scrolling
      if (isMobile) {
        document.body.classList.add("webchat-open");
      }

      renderMessages();

      // Update button appearance for "close" state
      if (chatButton) {
        chatButton.classList.add("is-open");
        chatButton.title = "Close chat";
      }

      // Emit chat opened event for React integration
      emitEvent("chatOpened");

      const input = document.getElementById("GeniStudio-input");
      if (input && !input.disabled) input.focus();
    } else {
      // Hide the overlay
      overlay.classList.remove("visible");
      overlay.classList.add("hidden");

      // Check if we're on mobile
      const isMobile = window.innerWidth <= 768;

      // On mobile, remove body class that prevents scrolling
      if (isMobile) {
        document.body.classList.remove("webchat-open");
      }

      // Update button appearance for "open" state
      if (chatButton) {
        chatButton.classList.remove("is-open");
        chatButton.title = "Open chat";
      }

      // Emit chat closed event for React integration
      emitEvent("chatClosed");
    }
  }

  // Function to position the chat container based on button position
  function positionChatContainer() {
    const chatButton = document.getElementById("GeniStudio-chat-button");
    const overlay = document.getElementById("GeniStudio-chat-overlay");
    const container = overlay.querySelector(".webchat-container");

    if (chatButton && container) {
      // Check if we're on mobile
      const isMobile = window.innerWidth <= 768;

      // On mobile, the container is full screen
      if (isMobile) {
        // Remove any position styles to allow the mobile CSS to take over
        container.style.right = "";
        container.style.left = "";
        container.style.bottom = "";
        container.style.top = "";

        // Add a class to help with mobile styling
        container.classList.add("mobile-fullscreen");
      } else {
        // On desktop, position based on button
        const buttonRect = chatButton.getBoundingClientRect();
        const position = config.position || "bottom-right";

        // Remove the mobile class if it exists
        container.classList.remove("mobile-fullscreen");

        // Set chat container position based on button position
        if (position.includes("right")) {
          container.style.right = "20px";
          container.style.left = "auto";
        } else {
          container.style.left = "20px";
          container.style.right = "auto";
        }

        if (position.includes("bottom")) {
          container.style.bottom =
            window.innerHeight - buttonRect.top + 10 + "px";
          container.style.top = "auto";
        } else {
          container.style.top = buttonRect.bottom + 10 + "px";
          container.style.bottom = "auto";
        }
      }
    }
  }

  function close() {
    isOpen = false;
    const overlay = document.getElementById("GeniStudio-chat-overlay");

    // Hide the overlay
    overlay.classList.remove("visible");
    overlay.classList.add("hidden");

    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768;

    // On mobile, remove body class that prevents scrolling
    if (isMobile) {
      document.body.classList.remove("webchat-open");
    }

    // Reset the chat button to "open" state
    const chatButton = document.getElementById("GeniStudio-chat-button");
    if (chatButton) {
      chatButton.classList.remove("is-open");
      chatButton.title = "Open chat";
    }

    // Emit chat closed event for React integration
    emitEvent("chatClosed");
  }

  function handleAPIStreamingChunk(chunk) {
    console.log("Received API streaming chunk:", chunk);
    if (!currentStreamingMessage) {
      // Create a new streaming message if one doesn't exist
      const now = new Date();

      // Find the last user message to calculate time to first chunk
      const lastUserMessage = [...messages]
        .reverse()
        .find((m) => m.sender === "user");
      if (lastUserMessage && messageTimestamps[lastUserMessage.id]) {
        const sentAt = messageTimestamps[lastUserMessage.id].sentAt;
        const timeToFirstChunkMs = now - sentAt;
        const timeToFirstChunkSec = (timeToFirstChunkMs / 1000).toFixed(2);
        const formattedTime = formatResponseTime(timeToFirstChunkSec);

        // Log time to first response to console
        console.log(`Time to first response: ${formattedTime}`);
      }

      currentStreamingMessage = {
        id: Date.now(),
        text: "",
        sender: "bot",
        timestamp: now,
        isStreaming: true,
      };
      messages.push(currentStreamingMessage);
      hideTypingIndicator();
      
      // Add the new bot message with animation for the first chunk
      addNewMessageWithAnimation(currentStreamingMessage);
    }

    // Append the chunk to the current streaming message
    currentStreamingMessage.text += chunk;
    
    // For subsequent chunks, just re-render without full page refresh
    const container = document.getElementById("GeniStudio-messages");
    const lastMessage = container?.lastElementChild;
    if (lastMessage && currentStreamingMessage) {
      const textContent = lastMessage.querySelector('.message-text');
      if (textContent) {
        textContent.innerHTML = parseMarkdown(currentStreamingMessage.text || "");
        if (currentStreamingMessage.isStreaming) {
          textContent.innerHTML += '<span class="cursor">|</span>';
        }
      }
    }
    
    // Scroll to bottom with improved timing for streaming updates
    forceScrollToBottom();
  }

  function handleAPIStreamingComplete(data) {
    console.log("API streaming complete received:", data);
    if (currentStreamingMessage) {
      // Calculate and log response time
      const lastUserMessage = [...messages]
        .reverse()
        .find((m) => m.sender === "user");
      if (lastUserMessage && messageTimestamps[lastUserMessage.id]) {
        const sentAt = messageTimestamps[lastUserMessage.id].sentAt;
        const completedAt = new Date();
        const totalTimeMs = completedAt - sentAt;
        const totalTimeSec = (totalTimeMs / 1000).toFixed(2);
        const formattedTime = formatResponseTime(totalTimeSec);

        console.log(`Total response time: ${formattedTime}`);
      }

      currentStreamingMessage.isStreaming = false;
      currentStreamingMessage = null;
    }
    
    hideTypingIndicator();
    enableInput();
    
    // Re-render to remove streaming indicator
    renderMessages();
    
    console.log("API streaming complete:", data);
  }

  function handleAPIError(errorMessage) {
    console.error("API error:", errorMessage);
    handleStreamingError(errorMessage);
    
    // Enable input after error
    enableInput();
  }

  function handleAPITyping(isTyping) {
    if (isTyping) {
      showTypingIndicator("typing");
    } else {
      hideTypingIndicator();
    }
  }

  function handleBotMessage(data) {
    // Hide typing indicator when message is received
    hideTypingIndicator();

    // Finalize any streaming message
    if (currentStreamingMessage) {
      currentStreamingMessage.isStreaming = false;
      currentStreamingMessage = null;
    }

    // Remove any incomplete streaming messages
    messages = messages.filter((m) => !(m.sender === "bot" && m.isStreaming));

    // Extract text from various possible fields
    let botText = data.text || data.message;
    if (!botText) {
      for (const key in data) {
        if (typeof data[key] === "string" && key !== "type") {
          botText = data[key];
          break;
        }
      }
    }

    // Find the last user message to calculate response time
    if (messages.length > 0) {
      // Find the last user message
      const lastUserMessage = [...messages]
        .reverse()
        .find((m) => m.sender === "user");

      if (lastUserMessage && messageTimestamps[lastUserMessage.id]) {
        const now = new Date();
        const sentAt = messageTimestamps[lastUserMessage.id].sentAt;
        const responseTimeMs = now - sentAt;
        const responseTimeSec = (responseTimeMs / 1000).toFixed(2);
        const formattedTime = formatResponseTime(responseTimeSec);

        // Log response time to console
        console.log(`Response time: ${formattedTime}`);

        // Clean up the timestamp record to prevent memory leaks
        delete messageTimestamps[lastUserMessage.id];
      }
    }

    // Emit message received event for React integration
    emitEvent("messageReceived", {
      text: botText,
      sender: "bot",
      timestamp: new Date(),
      ...data,
    });

    if (botText) {
      // Find the last message from the bot, if it exists
      const lastBotMessageIndex = [...messages]
        .reverse()
        .findIndex((m) => m.sender === "bot" && !m.isStreaming);
      const lastBotMessage =
        lastBotMessageIndex !== -1
          ? messages[messages.length - 1 - lastBotMessageIndex]
          : null;

      // If the last message was from the bot and it wasn't too long ago, append to it
      const messageTimeDiff = lastBotMessage
        ? new Date() - lastBotMessage.timestamp
        : null;
      if (lastBotMessage && messageTimeDiff && messageTimeDiff < 5000) {
        // 5 seconds threshold
        // Append the new text to the existing message without breaking the line
        lastBotMessage.text += botText;
        lastBotMessage.timestamp = new Date(); // Update timestamp
      } else {
        // Create a new message
        messages.push({
          id: Date.now(),
          text: botText,
          sender: "bot",
          timestamp: new Date(),
          isStreaming: false,
        });
      }

      renderMessages();
      enableInput();
    } else {
      console.warn("Unknown API message format or missing text:", data);
    }
  }

  function handleStreamingError(errorMessage) {
    hideTypingIndicator();

    const errorMsg = {
      id: Date.now(),
      text:
        errorMessage ||
        "Sorry, I'm having trouble connecting right now. Please try again later.",
      sender: "bot",
      timestamp: new Date(),
      isError: true,
    };

    messages.push(errorMsg);
    renderMessages();
    enableInput();
    currentStreamingMessage = null;
  }

  /**
   * Show typing indicator with different stages
   * @param {string} [stage='typing'] - The current processing stage ('processing', 'thinking', 'typing')
   */
  /**
   * Add a typing indicator with animation
   * @param {string} stage - The processing stage
   */
  function addTypingIndicatorWithAnimation(stage = "typing") {
    const container = document.getElementById("GeniStudio-messages");
    if (!container) return;

    // Remove any existing typing indicator first
    const existingTyping = container.querySelector('.typing-wrapper');
    if (existingTyping) {
      existingTyping.remove();
    }

    // Create and append the new typing indicator with animation
    const typingElement = renderTypingIndicator(stage, true);
    container.appendChild(typingElement);

    // Auto-scroll to the new typing indicator with improved timing
    forceScrollToBottom();
  }

  function showTypingIndicator(stage = "typing") {
    isLoading = true;
    currentProcessingStage = stage;
    addTypingIndicatorWithAnimation(stage);
  }

  function hideTypingIndicator() {
    isLoading = false;
    currentProcessingStage = null;
    
    // Remove the typing indicator with animation
    const container = document.getElementById("GeniStudio-messages");
    if (container) {
      const existingTyping = container.querySelector('.typing-wrapper');
      if (existingTyping) {
        existingTyping.style.opacity = '0';
        existingTyping.style.transform = 'translateX(-30px) scale(0.9)';
        setTimeout(() => {
          if (existingTyping.parentNode) {
            existingTyping.remove();
          }
        }, 300);
      }
    }
  }

  function enableInput() {
    const input = document.getElementById("GeniStudio-input");
    const sendButton = document.getElementById("GeniStudio-send-btn");

    if (input) input.disabled = false;
    if (sendButton) sendButton.disabled = false;
    if (input) input.focus();
  }

  function disableInput() {
    const input = document.getElementById("GeniStudio-input");
    const sendButton = document.getElementById("GeniStudio-send-btn");

    if (input) input.disabled = true;
    if (sendButton) sendButton.disabled = true;
  }

  // Track current processing stage
  let currentProcessingStage = null;

  /**
   * Scroll to the bottom of the messages container with better timing
   */
  function scrollToBottom() {
    const messagesContainer = document.getElementById("GeniStudio-messages");
    if (messagesContainer) {
      // Use requestAnimationFrame to ensure DOM updates are complete
      requestAnimationFrame(() => {
        // Double requestAnimationFrame to ensure all layouts are complete
        requestAnimationFrame(() => {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
      });
    }
  }

  /**
   * Force scroll to bottom with smooth behavior (alternative method)
   */
  function forceScrollToBottom() {
    const messagesContainer = document.getElementById("GeniStudio-messages");
    if (messagesContainer) {
      // Try multiple methods to ensure scrolling works
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      // Also try scrollIntoView on the last message
      const lastMessage = messagesContainer.lastElementChild;
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      
      // Final fallback with setTimeout
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 100);
    }
  }

  /**
   * Add a new message to the chat with animation
   * @param {Object} message - The message object to add
   */
  function addNewMessageWithAnimation(message) {
    const container = document.getElementById("GeniStudio-messages");
    if (!container) return;

    // Add the bot's name for avatar display
    if (message.sender === "bot") {
      message.botName = config.chatbotName;
      message.avatar = config.avatarUrl;
    }

    // Create and append the new message with animation
    const messageElement = renderMessageBubble(message, true);
    container.appendChild(messageElement);

    // Auto-scroll to the new message with improved timing
    forceScrollToBottom();
  }

  function renderMessages() {
    const container = document.getElementById("GeniStudio-messages");
    if (!container) return;

    container.innerHTML = "";

    if (messages.length === 0 && !isLoading) {
      container.appendChild(renderEmptyState());
      return;
    }

    // Group messages by sender and add date separators
    const groupedMessages = groupMessagesBySender(messages);

    // Render all messages with date separators
    groupedMessages.forEach((message) => {
      if (message.isStreaming && currentStreamingMessage !== message) return;

      // Add date separator if needed
      if (message.needsDateSeparator) {
        const separatorDate = new Date(message.timestamp);
        container.appendChild(renderDateSeparator(separatorDate));
      }

      // Add CSS classes for message grouping
      message.isFirstInGroup = message.isFirstInGroup || false;
      message.isLastInGroup = message.isLastInGroup || false;

      // Add the bot's name for avatar display
      if (message.sender === "bot") {
        message.botName = config.chatbotName;
        message.avatar = config.avatarUrl;
      }

      // Don't animate existing messages when re-rendering
      container.appendChild(renderMessageBubble(message, false));
    });

    // Show typing indicator with appropriate stage
    if (isLoading) {
      // Always animate typing indicators since they're always new
      container.appendChild(renderTypingIndicator(currentProcessingStage, true));
    }

    // Render quick reply options if available
    const quickRepliesContainer = document.getElementById(
      "GeniStudio-quick-replies"
    );
    if (quickRepliesContainer) {
      quickRepliesContainer.innerHTML = "";

      const lastMessage = groupedMessages[groupedMessages.length - 1];
      if (
        lastMessage &&
        lastMessage.quickReplies &&
        lastMessage.quickReplies.length > 0
      ) {
        const quickRepliesElement = renderQuickReplies(
          lastMessage.quickReplies,
          (value, text) => {
            // Handle quick reply selection
            sendQuickReply(value, text);
          }
        );
        quickRepliesContainer.appendChild(quickRepliesElement);
      }
    }

    // Ensure we scroll to bottom after all content is rendered
    forceScrollToBottom();
  }

  function sendMessage(event) {
    if (event) event.preventDefault();

    const input = document.getElementById("GeniStudio-input");
    const message = input.value.trim();

    if (!message || isLoading) {
      return;
    }

    // Generate a unique message ID
    const messageId = Date.now();

    // Record the timestamp when the message is sent
    messageTimestamps[messageId] = {
      sentAt: new Date(),
      message: message,
    };

    // Add user message first so we can reference it
    const userMessage = {
      id: messageId,
      text: message,
      sender: "user",
      timestamp: new Date(),
    };

    messages.push(userMessage);
    input.value = "";
    
    // Reset textarea height to default size
    const initialHeight = input.getAttribute('data-initial-height') || '47px';
    input.style.height = initialHeight;
    
    // Reset form border radius to default
    const form = document.querySelector(".chat-form");
    if (form) {
      form.style.borderRadius = "25px";
    }
    
    disableInput();

    // Add the new user message with animation instead of re-rendering all
    addNewMessageWithAnimation(userMessage);

    // Show processing indicator immediately when sending the message
    showTypingIndicator("processing");

    // Scroll to bottom
    const messagesContainer = document.getElementById("GeniStudio-messages");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Send via GeniStudio HTTP API
    sendMessageToAPI(
      config.apiUrl,
      config.chatbotId,
      config.userEmail,
      message,
      handleAPIStreamingChunk,
      handleAPIStreamingComplete,
      handleAPIError,
      handleAPITyping
    ).catch((error) => {
      console.error("Error sending message to GeniStudio API:", error);
      handleStreamingError("Failed to send message. Please try again.");
    });
  }

  /**
   * Send a quick reply message
   * @param {string} value - The value of the quick reply
   * @param {string} text - The display text of the quick reply
   */
  function sendQuickReply(value, text) {
    // Add user message with the quick reply text
    const userMessage = {
      id: Date.now(),
      text: text,
      sender: "user",
      timestamp: new Date(),
      isQuickReply: true,
    };

    messages.push(userMessage);

    // Clear quick replies
    const quickRepliesContainer = document.getElementById(
      "GeniStudio-quick-replies"
    );
    if (quickRepliesContainer) {
      quickRepliesContainer.innerHTML = "";
    }

    // Disable input during processing
    disableInput();

    // Add the new user message with animation instead of re-rendering all
    addNewMessageWithAnimation(userMessage);

    // Show processing indicator
    showTypingIndicator("processing");

    // Send the message to the server
    sendMessageToAPI(
      config.apiUrl,
      config.chatbotId,
      config.userEmail,
      text, // Use text instead of value for the message content
      handleAPIStreamingChunk,
      handleAPIStreamingComplete,
      handleAPIError,
      handleAPITyping
    ).catch((error) => {
      console.error("Error sending quick reply to GeniStudio API:", error);
      handleStreamingError("Failed to send message. Please try again.");
    });
  }

  function cleanup() {
    // Clean up any ongoing streaming messages
    currentStreamingMessage = null;
    
    // Clean up event listeners if needed
    // No WebSocket to cleanup since we're using HTTP API
    console.log("Chat widget cleanup completed");
  }

  // CSS injection is handled by the main index.js file

  // Helper function to emit events for React integration
  function emitEvent(eventName, data = {}) {
    if (typeof window !== "undefined") {
      const event = new CustomEvent(`geniStudio:${eventName}`, {
        detail: data,
      });
      document.dispatchEvent(event);
    }
  }

  /**
   * Format response time for display
   * @param {number} seconds - Response time in seconds
   * @returns {string} - Formatted response time string
   */
  function formatResponseTime(seconds) {
    // Convert string to number if needed
    const secs = parseFloat(seconds);

    if (secs < 0.1) {
      return `${Math.round(secs * 1000)}ms`;
    } else if (secs < 1) {
      return `${(secs * 1000).toFixed(0)}ms`;
    } else if (secs < 60) {
      return `${secs.toFixed(2)}s`;
    }
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = (secs % 60).toFixed(1);
    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Toggle the expanded/fullscreen state of the chat container
   */
  function toggleExpand() {
    const container = document.querySelector(".webchat-container");
    const expandBtn = document.getElementById("GeniStudio-expand-btn");

    if (container) {
      // Toggle the expanded class
      container.classList.toggle("expanded");

      // Update the expand button icon based on current state
      if (expandBtn) {
        if (container.classList.contains("expanded")) {
          // Change to collapse icon when expanded
          expandBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 12L12 4M6 4H12M12 4V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(180 8 8)"/>
            </svg>
          `;
          expandBtn.title = "Collapse";
        } else {
          // Change back to expand icon when collapsed
          expandBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          `;
          expandBtn.title = "Expand";
        }
      }

      // Adjust messages container to ensure proper scrolling in both states
      const messagesContainer = document.getElementById("GeniStudio-messages");
      if (messagesContainer) {
        setTimeout(() => {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
      }
    }
  }

  // Public API
  return {
    open: () => {
      if (!isOpen) toggleChat();
    },
    close: () => {
      if (isOpen) close();
    },
    toggle: () => {
      toggleChat(); // Always toggle regardless of state
    },
    toggleExpand: () => {
      toggleExpand(); // Toggle expanded/fullscreen mode
    },
    sendMessage: (message) => {
      if (typeof message === "string" && message.trim()) {
        const input = document.getElementById("GeniStudio-input");
        if (input) {
          input.value = message;
          sendMessage();
        }
      }
    },
    // Reset chat history
    reset: () => {
      messages = [];
      renderMessages();
      return true;
    },
    cleanup: cleanup,
  };
}
