# GeniStudio Web Chat Widget

A lightweight, responsive chat widget for easily integrating GeniStudio AI chatbot on any website. This modern web widget provide

## Features

- **Simple Integration** - Just a few lines of code to add to any website
- **Responsive Design** - Works on desktop and mobile devices
- **Real-time Chat** - WebSocket-based communication
- **Typing Indicators** - Shows when AI is typing a response
- **Customizable** - Change colors, position, and appearance
- **Popup Animation** - Smooth animation when opening the chat
- **Full-screen Mode** - Expand button for fullscreen experience (working on it)
- **Mobile Optimization** - Automatically adapts to smaller screens
- **Performance** - Fast loading, minimal dependencies
- **Accessibility** - Built with accessibility in mindfeatured chat interface that works across all devices. (working on it)

## ⚡ Quick Start

Add the GeniStudio web chat widget to any website with just a few lines of code:

```html
<!-- Add this to your HTML file -->
<script>
  window.GeniStudioConfig = {
    chatbotId: 'your-bot-id',
    chatbotName: 'GeniBot'
  };
</script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/genistudio-bot-widget@latest/dist/index.cdn.css">
<script src="https://cdn.jsdelivr.net/npm/genistudio-bot-widget@latest/dist/index.cdn.js"></script>
```

That's it! The chat widget will automatically initialize and add a chat button to your website with a beautiful, responsive interface.

## Configuration Options

Configure the widget by setting properties in the `window.GeniStudioConfig` object:

```js
window.GeniStudioConfig = {
  chatbotId: 'your-bot-id', // Your unique chatbot ID
  
  // Optional configuration
  chatbotName: 'GeniBot',                // Name displayed in chat header
  buttonColor: '#0091ae',                // Chat button color
  position: 'bottom-right',              // Position: 'bottom-right', 'bottom-left', 'top-right', 'top-left'
};
```

## JavaScript API

The widget exposes methods through the `window.GeniStudioWebChat` object:

```js
// Open the chat widget
window.GeniStudioWebChat.open();

// Close the chat widget
window.GeniStudioWebChat.close();

// Toggle the chat widget open/closed
window.GeniStudioWebChat.toggle();

// Send a message programmatically
window.GeniStudioWebChat.sendMessage('Hello, how can you help me?');

// Reset the chat (clear history)
window.GeniStudioWebChat.reset();

// Manual initialization (if not using window.GeniStudioConfig)
const config = { 
  apiUrl: 'ws://your-websocket-api-url',
  chatbotId: 'your-chatbot-id'
};
window.GeniStudioWebChat.initWebChat(config);
```

## Styling Options

### 1. Button and Color Customization

```js
window.GeniStudioConfig = {
  // ...
  buttonColor: '#0091ae',         // Chat button color
  position: 'bottom-right',       // Button position
};
```

## Mobile Support

The widget is fully responsive and optimized for mobile devices:

- Adapts to full-screen on mobile devices for better user experience
- Touch-friendly interface elements
- Optimized for different screen sizes
- Smooth animations and transitions
- Expand button for toggling fullscreen mode on any device

## Privacy and Security

- The widget operates fully within your website's domain
- All communications use secure WebSocket connections
- No user data is stored unless explicitly configured

## 🌐 CDN Usage

The library is available via CDN for simple integration:

```html
<!-- Include the CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/genistudio-bot-widget@latest/dist/index.cdn.css">

<!-- Include the JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/genistudio-bot-widget@latest/dist/index.cdn.js"></script>
```

## ⚙️ Configuration Options

All available options for customizing your chat widget:

| Option | Required | Default | Description |
|--------|----------|---------|-------------|
| `apiUrl` | No | - | Your WebSocket API endpoint |
| `chatbotId` | Yes | - | Your chatbot ID (e.g. 'cm9jc4y3c0001kz046c5vipcl') |
| `chatbotName` | No | 'GeniStudio Support' | Name shown in chat header |
| `buttonColor` | No | '#0091ae' | Chat button color (CSS color) |
| `position` | No | 'bottom-right' | Button position: 'bottom-right', 'bottom-left', 'top-right', 'top-left' |

## 📋 API Reference

The widget exposes the following methods through the global `window.GeniStudioWebChat` object:

| Method | Description |
|--------|-------------|
| `open()` | Opens the chat widget |
| `close()` | Closes the chat widget |
| `toggle()` | Toggles the chat widget open/closed |
| `toggleExpand()` | Toggles fullscreen/expanded mode |
| `sendMessage(text)` | Sends a message programmatically |
| `reset()` | Clears the chat history |


## 🔍 Troubleshooting

### Common Issues

**Widget not appearing?**

- Check browser console for errors
- Verify WebSocket URL and chatbot ID are correct
- Ensure script is loaded after configuration object is set

**WebSocket connection failing?**

- Verify your WebSocket endpoint is accessible
- Check for correct chatbot ID
- Ensure your server supports the required message types

### Console Logging

The widget outputs helpful messages to the browser console, including:

- WebSocket connection status
- Message events
- Response times


## License

MIT License - see LICENSE file for details.
