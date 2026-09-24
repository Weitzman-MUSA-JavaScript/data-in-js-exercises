/**
 * Module for displaying the Philadelphia Parks acreage card.
 */

/**
 * Initializes the park sites acreage card component.
 *
 * @param {Object} options Configuration options for the card.
 * @param {HTMLElement|string} options.el Container element or query selector for the card.
 * @returns {HTMLElement} The card element, augmented with an updateAcreage method.
 */
function initCard(options = {}) {
  const cardEl = typeof options.el === 'string'
    ? document.querySelector(options.el)
    : options.el;

  if (!cardEl) {
    throw new Error('A valid DOM element or selector must be provided for the card.');
  }

  const valueEl = cardEl.querySelector('#total-acreage')
    || cardEl.querySelector('.acreage-value');

  /**
   * Updates the displayed acreage formatted to two decimal places with commas.
   *
   * @param {number} acreage Total acreage number to display.
   */
  function updateAcreage(acreage) {
    if (valueEl) {
      const formatted = Number(acreage).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      valueEl.textContent = formatted;
    }
  }

  cardEl.updateAcreage = updateAcreage;
  return cardEl;
}

export { initCard };
