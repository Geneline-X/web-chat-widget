/**
 * Utility function to dynamically inject scoped CSS styles
 * This ensures widget styles don't leak into the parent application
 */

// In CDN mode, we don't need to inject CSS content directly
// as we're loading the CSS file separately

/**
 * Generate a unique ID for the style tag
 * @returns {string} Unique ID
 */
function generateStyleId() {
  return (
    "genistudio-webchat-styles-" + Math.random().toString(36).substring(2, 9)
  );
}

// CSS scoping is now handled by the CSS file itself

/**
 * Injects the CSS for the webchat widget into the document head
 * @returns {Element} The created link element for CDN or style element for inline
 */
export function injectStyles() {
  // Check if styles are already injected
  const existingStyle = document.getElementById("genistudio-webchat-styles");
  if (existingStyle) {
    return existingStyle;
  }

  // Generate ID for the style element
  const styleId = generateStyleId();

  // In CDN mode, we link to the external CSS file
  const link = document.createElement("link");
  link.id = styleId;
  link.rel = "stylesheet";
  link.href = "dist/index.cdn.css"; // Path relative to where script is loaded

  // Add to document head
  document.head.appendChild(link);
  return link;
}

/**
 * Creates a shadow DOM container for complete CSS isolation
 * @returns {ShadowRoot} The shadow root
 */
export function createShadowContainer() {
  // Create a container for the shadow DOM
  const container = document.createElement("div");
  container.id = "genistudio-webchat-container";
  document.body.appendChild(container);

  // Attach shadow DOM
  const shadowRoot = container.attachShadow({ mode: "open" });

  // Add styles to shadow DOM by linking to the CSS file
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "dist/index.cdn.css"; // Path relative to where script is loaded
  shadowRoot.appendChild(link);

  return shadowRoot;
}

/**
 * Remove injected styles
 */
export function removeStyles() {
  const style = document.getElementById("genistudio-webchat-styles");
  if (style) {
    style.remove();
  }

  // Also check for shadow DOM container
  const container = document.getElementById("genistudio-webchat-container");
  if (container) {
    container.remove();
  }
}

export default {
  injectStyles,
  createShadowContainer,
  removeStyles,
};
