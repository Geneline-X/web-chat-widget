/**
 * HTTP API Client for direct communication with GeniStudio chatbot API
 * Based on https://genistudio-docs.vercel.app/api/messages/
 */

/**
 * Send a message to the GeniStudio API endpoint with streaming support
 * @param {string} apiUrl - API URL (https://message.geneline-x.net/api/v1/message)
 * @param {string} chatbotId - Chatbot ID
 * @param {string} email - User email
 * @param {string} message - Message to send
 * @param {string} apiKey - GeniStudio API Key
 * @param {Function} onChunk - Callback for receiving streaming chunks
 * @param {Function} onComplete - Callback when streaming is complete
 * @param {Function} onError - Callback for errors
 * @param {Function} onTyping - Callback for typing indicators
 * @returns {Promise} - Promise that resolves when request is complete
 */
export async function sendMessageToAPI(
  apiUrl,
  chatbotId,
  email,
  message,
  apiKey,
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

    const response = await fetch("https://message.geneline-x.net/api/v1/message", {
        method: 'POST',
        headers: {
            "accept": "text/plain",
            "X-API-Key": "3ca165529bd1d306269b45d8c6ff50147b80ceca99b3960947478d2125d876d2",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      } catch (e) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    // Handle streamed response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    let accumulatedText = '';
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = new TextDecoder().decode(value);
      accumulatedText += chunk;
      
      // Send chunk to callback
      if (onChunk) {
        onChunk(chunk);
      }
    }

    console.log("Complete response received:", accumulatedText);

    // Stop typing indicator
    if (onTyping) onTyping(false);

    // Call completion callback
    if (onComplete) {
      onComplete({
        text: accumulatedText,
        timestamp: new Date().toISOString()
      });
    }

    return { text: accumulatedText };

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
