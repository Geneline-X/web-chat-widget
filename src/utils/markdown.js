/**
 * Utility for parsing markdown to HTML
 */

/**
 * Simple markdown parser for vanilla JS
 * @param {string} text - Markdown text to parse
 * @returns {string} HTML string
 */
export function parseMarkdown(text) {
  if (!text) return "";

  return (
    text
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Italic text
      .replace(/\*((?!\*)(.*?))\*/g, "<em>$1</em>")
      // Links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      // Inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // Convert bullet lists
      .replace(/^\*\s+(.+)$/gm, "<li>$1</li>")
      // Convert numbered lists
      .replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>")
      // Wrap consecutive list items in ul tags
      .replace(/(<li>.*<\/li>)/gs, function (match) {
        return "<ul>" + match + "</ul>";
      })
      // Fix nested ul tags
      .replace(/<\/ul>\s*<ul>/g, "")
      // Convert line breaks to paragraphs
      .replace(/\n\n/g, "</p><p>")
      // Convert single line breaks to br
      .replace(/\n/g, "<br>")
      // Wrap in paragraph tags if not already wrapped
      .replace(/^(?!<[uo]l>|<li>)(.+)$/gm, function (match) {
        if (match.startsWith("<") || match.trim() === "") return match;
        return "<p>" + match + "</p>";
      })
      // Clean up empty paragraphs
      .replace(/<p><\/p>/g, "")
      // Fix paragraph tags around lists
      .replace(/<p>(<[uo]l>.*<\/[uo]l>)<\/p>/gs, "$1")
  );
}
