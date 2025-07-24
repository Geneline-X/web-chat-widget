# Changelog

All notable changes to the GeniStudio Web Chat Widget will be documented in this file.


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
