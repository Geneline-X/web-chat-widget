<div align="center">

# GeniStudio Web Chat Widget

[![npm version](https://badge.fury.io/js/genistudio-bot-widget.svg)](https://badge.fury.io/js/genistudio-bot-widget)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CDN](https://img.shields.io/badge/CDN-jsDelivr-orange.svg)](https://www.jsdelivr.com/package/npm/genistudio-bot-widget)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/genistudio-bot-widget.svg)](https://bundlephobia.com/package/genistudio-bot-widget)

**A lightweight, responsive chat widget for easily integrating GeniStudio AI chatbot on any website.**

*This modern web widget provides a featured chat interface that works across all devices.*

</div>

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
- **Accessibility** - Built with accessibility in mind (working on it)

## Quick Start

Add the GeniStudio web chat widget to any website with just a few lines of code:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
  <!-- Include the CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/genistudio-bot-widget@latest/dist/index.cdn.css">
</head>
<body>
  <!-- Your website content -->
  
  <!-- Configure the widget before loading the script -->
  <script>
    window.GeniStudioConfig = {
      chatbotId: 'your-chatbot-id',             // Your chatbot ID
      chatbotName: 'Your Bot Name',             // Name displayed in chat header
      userEmail: 'user@example.com',           // Optional - auto-generated if not provided
      buttonColor: '#your-color'               // This color themes the entire widget
    };
  </script>
  
  <!-- Load the GeniStudio script -->
  <script src="https://cdn.jsdelivr.net/npm/genistudio-bot-widget@latest/dist/index.cdn.js"></script>
</body>
</html>
```

That's it! The chat widget will automatically initialize and add a chat button to your website with a beautiful, responsive interface.

## Configuration Options

Configure the widget by setting properties in the `window.GeniStudioConfig` object **before** loading the script:

```js
window.GeniStudioConfig = {
  chatbotId: 'your-chatbot-id',           // Your unique chatbot ID (required)
  chatbotName: 'Your Bot Name',           // Name displayed in chat header
  userEmail: 'user@example.com',          // Optional - will be auto-generated if not provided
  buttonColor: '#your-color',             // Chat button color (themes entire widget)
  position: 'bottom-right'                // Position: 'bottom-right', 'bottom-left', 'top-right', 'top-left'
};
```

## CDN Usage

The library is available via CDN for simple integration:

```html
<!-- Include the CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/genistudio-bot-widget@latest/dist/index.cdn.css">

<!-- Include the JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/genistudio-bot-widget@latest/dist/index.cdn.js"></script>
```

## Configuration Reference

All available options for customizing your chat widget:

| Option | Required | Default | Description |
|--------|----------|---------|-------------|
| `chatbotId` | Yes | - | Your chatbot ID (e.g. 'cm9jc4y3c0001kz046c5vipcl') |
| `chatbotName` | No | 'GeniStudio Support' | Name shown in chat header |
| `userEmail` | No | auto-generated | User identifier for the chat session |
| `buttonColor` | No | '#0091ae' | Chat button color (CSS color) |
| `position` | No | 'bottom-right' | Button position: 'bottom-right', 'bottom-left', 'top-right', 'top-left' |

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

## License

MIT License - see LICENSE file for details.
