# Changelog

All notable changes to the GeniStudio Web Chat Widget will be documented in this file.

## [1.0.5] - 2025-07-24

### Added
- New expand/fullscreen button in chat header
- Fullscreen mode with smooth animation
- Improved mobile fullscreen experience
- Animation for expanding/collapsing chat window
- Response time measurement for chatbot replies (console logging)

### Changed
- Chat window now appears above the button with smooth animation
- Button now toggles the chat open/closed
- Enhanced expand button styling and functionality
- Improved z-index handling for overlays and buttons
- Updated CSS for better mobile responsiveness
- Better accessibility for expand/collapse buttons
- Updated example files to demonstrate new features

### Fixed
- Fixed CSS syntax errors and duplicate styles
- Fixed event handling for expand button
- Improved handling of mobile viewport changes

## [1.0.4] - 2025-07-23

### Added
- Support for WebSocket message type `ai_typing` to show typing indicator
- Full mobile responsiveness with proper viewport handling
- Button icon changes to X when chat is open
- Smooth popup animation when opening chat window

### Changed
- Refactored build system for CDN-only usage
- Simplified code structure by removing React/TypeScript
- Updated chat window positioning to appear above button
- Modified overlay z-index and pointer-events for better interaction
- Improved event handling to prevent duplicate listeners

### Fixed
- Fixed missing import in message-bubbles.js
- Fixed chat button click event handling
- Improved transition animations for smoother experience

## [1.0.3] - 2025-07-23

### Added
- CDN examples (examples/cdn/index.html, simple.html) 
- New serve script for local testing
- Simple Node.js server for demo purposes

### Changed
- Removed demo mode from webchat.js
- Updated styling for more professional appearance
- Streamlined package.json dependencies
- Improved button hover effects

### Fixed
- Fixed inconsistencies in chat container structure
- Improved mobile device detection

## [1.0.2] - 2025-07-22

### Added
- Single IIFE build for CDN usage
- Improved documentation for CDN integration
- Better handling of avatar positioning and styling

### Changed
- Updated README.md with clear CDN usage instructions
- Simplified exports in package.json
- Improved chat container styling
- Enhanced message bubble layout

### Removed
- Removed React/TypeScript dependencies
- Removed unnecessary demo code

## [1.0.1] - 2025-07-22

### Changed
- Improved and clarified README documentation:
  - Explicitly states widget is for GeniStudio chatbot only (not Saful Pay or others)
  - Clear separation: CDN usage for HTML only, npm package for frameworks (React, etc.)
  - Concise configuration table and usage examples
- Added watermark in chat window when there are no messages
- Avatar abbreviation and chatbot name now set from config only (no prompt)
- Minor code and documentation cleanups for easier integration

---

## [1.0.0] - 2025-07-21

### Added
- Initial release of the GeniStudio Web Chat Widget
- React components: `WebChatButton` and `WebChatWidget`
- Vanilla JavaScript widget with auto-initialization
- Full-screen chat interface with mobile responsiveness
- Real-time streaming AI responses
- Markdown support for rich text formatting
- Customizable themes (light/dark/auto)
- TypeScript support with full type definitions
- Multiple positioning options for chat button
- CORS support for web integration
- Auto-generated user IDs for session management

### Features
- 🎨 **Customizable UI** - Colors, themes, positioning
- 📱 **Mobile responsive** - Works on all device sizes
- 🚀 **Easy integration** - npm package or CDN
- 💬 **Rich messaging** - Markdown rendering support
- ⚡ **Real-time streaming** - Live AI response generation
- 🔒 **Secure** - All data through your API
- 🎯 **Zero dependencies** - Vanilla JS version is standalone
- 📦 **Multiple formats** - React components + vanilla JS

### Technical
- Built with TypeScript
- Rollup bundling for optimal size
- CSS-in-JS for component styling
- Supports both CommonJS and ES modules
- Full React 18+ compatibility
- No external runtime dependencies (vanilla version)
