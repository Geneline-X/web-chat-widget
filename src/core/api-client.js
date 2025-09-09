/**
 * HTTP API Client for direct communication with GeniStudio chatbot API
 * Based on https://genistudio-docs.vercel.app/api/messages/
 */

/**
 * Send a message to the GeniStudio API endpoint with streaming support
 * @param {string} apiUrl - API URL (defaults to https://genistud.io/api/message)
 * @param {string} chatbotId - Chatbot ID
 * @param {string} email - User email
 * @param {string} message - Message to send
 * @param {Function} onChunk - Callback for receiving streaming chunks
 * @param {Function} onComplete - Callback when streaming is complete
 * @param {Function} onError - Callback for errors
 * @param {Function} onTyping - Callback for typing indicators
 * @returns {Promise} - Promise that resolves when request is complete
 */
export async function sendMessageToAPI(
  apiUrl = 'https://genistud.io/api/message',
  chatbotId,
  email,
  message,
  onChunk,
  onComplete,
  onError,
  onTyping
) {
  try {
    // Start typing indicator
    if (onTyping) onTyping(true);

    const requestBody = {
      chatbotId: chatbotId,
      email: email,
      message: message
    };

    console.log("Sending message to GeniStudio API:", apiUrl, requestBody);

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        timeout: 15000
    });

    console.log("API Response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API response error:", response.status, errorText);
      let errorMessage;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    // Handle streamed response - process chunk by chunk like axios stream
    const reader = response.body?.getReader();
    if (!reader) {
      // If no streaming support, read the whole response
      const responseText = await response.text();
      console.log("Non-streaming response received:", responseText);
      
      // Stop typing indicator
      if (onTyping) onTyping(false);
      
      // Process the complete response
      let messageContent = responseText;
      try {
        const jsonResponse = JSON.parse(responseText);
        if (jsonResponse.message) {
          messageContent = jsonResponse.message;
        }
      } catch (e) {
        console.warn("Failed to parse JSON response, using raw text:", e);
      }
      
      // Call completion callback
      if (onComplete) {
        onComplete({
          text: messageContent,
          timestamp: new Date().toISOString()
        });
      }
      
      return { text: messageContent };
    }

    let botResponse = '';
    
    // Process streaming chunks similar to axios stream handling
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = new TextDecoder().decode(value);
      botResponse += chunk;
      
      // Send raw chunk content to callback for real-time display
      if (onChunk) {
        console.log("Sending chunk to callback:", chunk);
        onChunk(chunk);
      }
    }

    console.log("Complete response received:", botResponse);

    // Parse the complete response like the axios implementation
    let messageContent = botResponse;
    try {
      const jsonResponse = JSON.parse(botResponse);
      if (jsonResponse.message) {
        messageContent = jsonResponse.message;
      }
    } catch (e) {
      // If parsing fails, use the raw response (for plain text responses)
      console.warn("Response is not JSON, using raw text:", e);
    }

    // Stop typing indicator
    if (onTyping) onTyping(false);

    // Call completion callback with extracted message
    if (onComplete) {
      onComplete({
        text: messageContent,
        timestamp: new Date().toISOString()
      });
    }

    return { text: messageContent };

  } catch (error) {
    console.error("GeniStudio API request failed:", error);
    
    // Stop typing indicator
    if (onTyping) onTyping(false);
    
    // Handle error with user-friendly messages
    if (onError) {
      let errorMessage;
      if (error.message.includes('Failed to fetch')) {
        errorMessage = "Unable to connect to chat service. Please check your internet connection and try again.";
      } else if (error.message.includes('CORS')) {
        errorMessage = "Unable to connect to chat service due to security restrictions.";
      } else {
        errorMessage = `Failed to communicate with chat service: ${error.message}`;
      }
      
      onError(errorMessage);
    }
    
    throw error;
  }
}
