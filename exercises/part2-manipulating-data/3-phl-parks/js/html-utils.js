/**
 * Converts an HTML string into a DOM element
 * @param {string} html - The HTML string to convert
 * @returns {HTMLElement} The resulting DOM element
 */
function htmlToElement(html) {
  const template = document.createElement('template');
  html = html.trim(); // Avoid a text node of whitespace
  template.innerHTML = html;
  return template.content.firstChild;
}

export { htmlToElement };
