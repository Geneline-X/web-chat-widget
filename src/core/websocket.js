/**
 * WebSocket connection and messaging
 */
import { getWebSocketUrl } from "../utils/ui-helpers";

/**
 * Connect to WebSocket and set up handlers
 * @param {string} apiUrl - API URL
 * @param {string} chatbotId - Chatbot ID
 * @param {string} userId - User ID
 * @param {Function} handleMessage - Message handler function
 * @param {Function} updateStatus - Status update function
 * @returns {Promise<WebSocket>} - WebSocket connection
 */
export function connectWebSocket(
  apiUrl,
  chatbotId,
  userId,
  handleMessage,
  updateStatus
) {
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  return new Promise((resolve, reject) => {
    try {
      const wsUrl = getWebSocketUrl(apiUrl);
      console.log("Connecting to WebSocket:", wsUrl);

      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log("WebSocket connected");
        reconnectAttempts = 0;
        updateStatus("connected");

        // Send authentication
        const authMessage = {
          type: "auth",
          email: `${userId}@webchat.com`,
          chatbotId: chatbotId,
        };

        websocket.send(JSON.stringify(authMessage));
        resolve(websocket);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      websocket.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        updateStatus("disconnected");

        // Auto-reconnect if not intentionally closed
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttempts++;
            console.log(
              `Reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts}`
            );
            connectWebSocket(
              apiUrl,
              chatbotId,
              userId,
              handleMessage,
              updateStatus
            )
              .then(resolve)
              .catch(reject);
          }, 1000 * Math.pow(2, reconnectAttempts));
        }
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        updateStatus("error");
        reject(error);
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      reject(error);
    }
  });
}

/**
 * Send a message via WebSocket
 * @param {WebSocket} websocket - WebSocket connection
 * @param {string} message - Message to send
 */
export function sendWebSocketMessage(websocket, message) {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    const chatMessage = {
      type: "chat",
      message: message,
    };

    websocket.send(JSON.stringify(chatMessage));
    console.log("Message sent via WebSocket:", message);
    return true;
  }
  return false;
}

/**
 * Clean up WebSocket connection
 * @param {WebSocket} websocket - WebSocket to close
 */
export function cleanupWebSocket(websocket) {
  if (websocket) {
    websocket.close(1000, "Client disconnect");
  }
}
