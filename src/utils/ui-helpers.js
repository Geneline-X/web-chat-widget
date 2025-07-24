/**
 * Chat UI component utilities
 */

/**
 * Get an abbreviation for a name (for avatar)
 * @param {string} name - Name to abbreviate
 * @returns {string} - Two letter abbreviation
 */
export function getAbbreviation(name) {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Format a timestamp to a readable time
 * @param {Date} timestamp - Timestamp to format
 * @returns {string} - Formatted time string
 */
export function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Generate a unique user ID
 * @returns {string} - Random ID with web_ prefix
 */
export function generateUserId() {
  return "web_" + Math.random().toString(36).substring(2, 15);
}

/**
 * Convert HTTP(S) URL to WebSocket URL if needed
 * @param {string} baseUrl - API URL
 * @returns {string} - WebSocket URL
 */
export function getWebSocketUrl(baseUrl) {
  const wsUrl = baseUrl.replace(/^http/, "ws");
  return `${wsUrl}/webchat/ws`;
}

/**
 * Check if two dates are on the same day
 * @param {Date} date1 - First date to compare
 * @param {Date} date2 - Second date to compare
 * @returns {boolean} - True if same day, false otherwise
 */
export function isSameDay(date1, date2) {
  if (!date1 || !date2) return false;

  date1 = new Date(date1);
  date2 = new Date(date2);

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a message needs a date separator above it
 * @param {Object} message - Current message
 * @param {Object} prevMessage - Previous message
 * @returns {boolean} - True if date separator needed
 */
export function needsDateSeparator(message, prevMessage) {
  if (!prevMessage) return true;

  const messageDate = new Date(message.timestamp);
  const prevMessageDate = new Date(prevMessage.timestamp);

  return !isSameDay(messageDate, prevMessageDate);
}

/**
 * Group messages by sender for consecutive messages from the same sender
 * @param {Array} messages - Array of message objects
 * @returns {Array} - Grouped message objects with additional properties
 */
export function groupMessagesBySender(messages) {
  if (!messages || !messages.length) return [];

  return messages.map((message, index) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;

    // Add grouping information
    const isFirstInGroup =
      !prevMessage ||
      prevMessage.sender !== message.sender ||
      needsDateSeparator(message, prevMessage);

    const isLastInGroup =
      index === messages.length - 1 ||
      messages[index + 1].sender !== message.sender ||
      needsDateSeparator(messages[index + 1], message);

    // Add date separator flag
    const needsSeparator = needsDateSeparator(message, prevMessage);

    return {
      ...message,
      isFirstInGroup,
      isLastInGroup,
      needsDateSeparator: needsSeparator,
    };
  });
}
