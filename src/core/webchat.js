/**
 * GeniStudio Web Chat Widget - Main Module
 * Connects UI components and WebSocket communication
 */
import {
  connectWebSocket,
  sendWebSocketMessage,
  cleanupWebSocket,
} from "./websocket";
import {
  renderMessageBubble,
  renderTypingIndicator,
  renderEmptyState,
  renderDateSeparator,
  renderQuickReplies,
} from "../components/message-bubbles";
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
    apiUrl: "ws://localhost:7001/api",
    chatbotId: "",
    buttonColor: "#007bff",
    position: "bottom-right",
    injectCSS: false,
    ...userConfig,
  };

  if (!config.chatbotName || typeof config.chatbotName !== "string") {
    config.chatbotName = "GeniStudio Support";
  }

  // State variables
  let isOpen = false;
  let messages = [];
  let isLoading = false;
  let websocket = null;
  let isConnected = false;
  let userId = generateUserId();
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

  // Initialize WebSocket connection
  connectWebSocket(
    config.apiUrl,
    config.chatbotId,
    userId,
    handleWebSocketMessage,
    updateConnectionStatus
  )
    .then((ws) => {
      websocket = ws;
      isConnected = true;
    })
    .catch((error) => {
      console.error("Failed to connect WebSocket:", error);

      // Show a connection error message
      handleStreamingError(
        "Could not connect to chat service. Please try again later."
      );
    });

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

      // First remove hidden class
      overlay.classList.remove("hidden");

      // Give the browser a moment to process the display change before adding the visible class
      setTimeout(() => {
        overlay.classList.add("visible");

        // On mobile, add a body class to prevent scrolling
        if (isMobile) {
          document.body.classList.add("webchat-open");
          // Hide the chat button on mobile fullscreen mode if needed
          // chatButton.style.visibility = 'hidden';
        }
      }, 10);

      renderMessages();

      // Update button appearance for "close" state
      if (chatButton) {
        chatButton.innerHTML = "✕"; // Change to an X icon
        chatButton.title = "Close chat";
        chatButton.classList.add("is-open");
      }

      // Emit chat opened event for React integration
      emitEvent("chatOpened");

      // Reconnect WebSocket if needed
      if (!isConnected) {
        connectWebSocket(
          config.apiUrl,
          config.chatbotId,
          userId,
          handleWebSocketMessage,
          updateConnectionStatus
        ).then((ws) => {
          websocket = ws;
          isConnected = true;
        });
      }

      const input = document.getElementById("GeniStudio-input");
      if (input && !input.disabled) input.focus();
    } else {
      // First remove the visible class to trigger animation
      overlay.classList.remove("visible");

      // Check if we're on mobile
      const isMobile = window.innerWidth <= 768;

      // On mobile, remove body class that prevents scrolling
      if (isMobile) {
        document.body.classList.remove("webchat-open");
        // Restore chat button visibility if it was hidden
        // chatButton.style.visibility = 'visible';
      }

      // Wait for animation to complete before hiding the overlay
      setTimeout(() => {
        overlay.classList.add("hidden");
      }, 300); // Match this with the CSS transition duration

      // Update button appearance for "open" state
      if (chatButton) {
        chatButton.innerHTML = "💬"; // Change back to chat icon
        chatButton.title = "Open chat";
        chatButton.classList.remove("is-open");
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

    // First remove the visible class to trigger animation
    overlay.classList.remove("visible");

    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768;

    // On mobile, remove body class that prevents scrolling
    if (isMobile) {
      document.body.classList.remove("webchat-open");
      // Restore chat button visibility if it was hidden
      // const chatButton = document.getElementById('GeniStudio-chat-button');
      // if (chatButton) chatButton.style.visibility = 'visible';
    }

    // Wait for animation to complete before hiding the overlay
    setTimeout(() => {
      overlay.classList.add("hidden");
    }, 300); // Match this with the CSS transition duration

    // Reset the chat button to "open" state
    const chatButton = document.getElementById("GeniStudio-chat-button");
    if (chatButton) {
      chatButton.innerHTML = "💬";
      chatButton.title = "Open chat";
      chatButton.classList.remove("is-open");
    }

    // Emit chat closed event for React integration
    emitEvent("chatClosed");
  }

  function handleWebSocketMessage(data) {
    console.log("WebSocket message received:", data);

    // Log timestamp of message received for performance tracking
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Message type: ${data.type}`);

    switch (data.type) {
      case "auth_success":
        console.log("Authentication successful");
        updateConnectionStatus("authenticated");
        break;

      case "auth_error":
        console.error("Authentication failed:", data.message);
        updateConnectionStatus("auth_failed");
        break;

      case "message_received":
        // Server has received the message, now it's processing
        showTypingIndicator("processing");
        break;

      case "thinking_start":
        // Server is thinking about the response
        showTypingIndicator("thinking");
        break;

      case "typing_start":
        // Server is actively generating the response, show typing indicator
        showTypingIndicator("typing");
        break;

      case "typing_stop":
        hideTypingIndicator();
        break;

      case "ai_typing":
        // Handle ai_typing message type
        if (data.status === true) {
          showTypingIndicator("typing");
        } else {
          hideTypingIndicator();
        }
        break;

      case "message_chunk":
        // While receiving chunks, show typing indicator
        showTypingIndicator("typing");
        handleStreamingChunk(data.chunk);
        break;

      case "message_complete":
        completeStreamingMessage();
        break;

      case "error":
        handleStreamingError(data.message);
        break;

      case "pong":
        // Handle heartbeat response
        break;

      case "message":
        handleBotMessage(data);
        break;

      // Handle any other message type that might contain text
      default:
        handleBotMessage(data);
        break;
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
      // Reset connection status to online when message is received
      updateConnectionStatus("authenticated");
    } else {
      console.warn("Unknown WebSocket message type or missing text:", data);
      // Reset connection status even if no message is found
      updateConnectionStatus("authenticated");
    }
  }

  function handleStreamingChunk(chunk) {
    if (!currentStreamingMessage) {
      // This is the first chunk of the response
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
        firstChunkTime: now, // Record when the first chunk arrived
      };
      messages.push(currentStreamingMessage);
      hideTypingIndicator();
    }
    currentStreamingMessage.text += chunk;
    renderMessages();
  }

  function completeStreamingMessage() {
    if (currentStreamingMessage) {
      // Hide typing indicator when streaming is complete
      hideTypingIndicator();

      // Calculate and log response time
      // Find the last user message to calculate response time
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
        console.log(`Stream completed. Response time: ${formattedTime}`);

        // Clean up the timestamp record to prevent memory leaks
        delete messageTimestamps[lastUserMessage.id];
      }

      currentStreamingMessage.isStreaming = false;
      currentStreamingMessage = null;
      renderMessages();
      enableInput();
      // Reset connection status when streaming is complete
      updateConnectionStatus("authenticated");
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

    // Update status to show error state
    updateConnectionStatus("error");
  }

  /**
   * Show typing indicator with different stages
   * @param {string} [stage='typing'] - The current processing stage ('processing', 'thinking', 'typing')
   */
  function showTypingIndicator(stage = "typing") {
    isLoading = true;
    currentProcessingStage = stage;
    renderMessages();
  }

  function hideTypingIndicator() {
    isLoading = false;
    currentProcessingStage = null;
    renderMessages();
  }

  function updateConnectionStatus(status) {
    const statusElement = document.querySelector(".webchat-status");
    if (!statusElement) return;

    // Reset status element content
    let statusText = "";
    let statusColor = "";

    switch (status) {
      case "connected":
        statusText = "● Connected";
        statusColor = "#90ee90";
        break;
      case "authenticated":
        statusText = "● Online";
        statusColor = "#90ee90";
        break;
      case "disconnected":
        statusText = "● Disconnected";
        statusColor = "#ffa500";
        break;
      case "error":
      case "auth_failed":
        statusText = "● Offline";
        statusColor = "#ff6b6b";
        break;
    }

    // Create or update the status elements
    statusElement.innerHTML = statusText;
    statusElement.style.color = statusColor;

    // Update the footer text
    const footerElement = document.querySelector(".webchat-footer span");
    if (footerElement) {
      footerElement.textContent = "Powered by GeniStudio AI";
    }

    // Re-render messages
    renderMessages();
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

      container.appendChild(renderMessageBubble(message));
    });

    // Show typing indicator with appropriate stage
    if (isLoading) {
      container.appendChild(renderTypingIndicator(currentProcessingStage));
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

    container.scrollTop = container.scrollHeight;
  }

  function sendMessage(event) {
    if (event) event.preventDefault();

    const input = document.getElementById("GeniStudio-input");
    const message = input.value.trim();

    if (!message || isLoading || !isConnected) {
      if (!isConnected) {
        console.warn("Cannot send message: WebSocket not connected");
        // Try to reconnect
        connectWebSocket(
          config.apiUrl,
          config.chatbotId,
          userId,
          handleWebSocketMessage,
          updateConnectionStatus
        ).then((ws) => {
          websocket = ws;
          isConnected = true;
        });
      }
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
    disableInput();

    // Show processing indicator immediately when sending the message
    showTypingIndicator("processing");

    // Force render the messages
    renderMessages();

    // Scroll to bottom
    const messagesContainer = document.getElementById("GeniStudio-messages");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Send via WebSocket
    try {
      const success = sendWebSocketMessage(websocket, message);

      if (!success) {
        handleStreamingError("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending WebSocket message:", error);
      handleStreamingError("Failed to send message. Please try again.");
    }
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

    // Show processing indicator
    showTypingIndicator("processing");

    // Render messages to show the user's selection
    renderMessages();

    // Send the message to the server
    if (isConnected && websocket) {
      const payload = {
        type: "message",
        message: text,
        quickReplyValue: value,
        userId: userId,
        chatbotId: config.chatbotId,
        timestamp: new Date().toISOString(),
      };

      sendWebSocketMessage(websocket, payload);
    }
  }

  function cleanup() {
    cleanupWebSocket(websocket);
    websocket = null;
    isConnected = false;
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
