/**
 * Module for managing the Census API key storage and dialog UI.
 */

const dialog = document.getElementById('censuskey-dialog');
const form = document.getElementById('censuskey-form');
const showDialogButton = document.getElementById('show-censuskey-dialog-button');
const censusKeyDisplay = document.getElementById('censuskey-display');

/**
 * Gets the stored Census API key from localStorage.
 * @returns {string|null} The stored API key or null.
 */
function getCensusApiKey() {
  return localStorage.getItem('census_api_key');
}

/**
 * Saves the Census API key to localStorage.
 * @param {string} key - The Census API key.
 */
function saveCensusApiKey(key) {
  localStorage.setItem('census_api_key', key);
}

/**
 * Shows the API key modal dialog.
 */
function showCensusApiKeyDialog() {
  if (!dialog || !form) return;
  const input = form.querySelector('input[name="censuskey"]');
  if (input) {
    input.value = getCensusApiKey() || '';
  }
  dialog.showModal();
}

/**
 * Updates the API key display in the page footer.
 */
function updateCensusApiKeyDisplay() {
  const key = getCensusApiKey();
  if (censusKeyDisplay) {
    censusKeyDisplay.textContent = key || '(none)';
  }
}

/**
 * Handles submission of the API key form.
 */
function onSubmitCensusApiKeyForm() {
  const data = new FormData(form);
  const key = data.get('censuskey');
  if (key) {
    saveCensusApiKey(key.trim());
  }
  updateCensusApiKeyDisplay();
}

/**
 * Initializes the Census key UI handlers.
 * @param {Function} [onKeySaved] - Callback invoked when a key is saved.
 */
function initCensusKey(onKeySaved) {
  if (showDialogButton) {
    showDialogButton.addEventListener('click', showCensusApiKeyDialog);
  }
  if (form) {
    form.addEventListener('submit', () => {
      onSubmitCensusApiKeyForm();
      if (typeof onKeySaved === 'function') {
        onKeySaved(getCensusApiKey());
      }
    });
  }
  updateCensusApiKeyDisplay();
}

export {
  getCensusApiKey,
  saveCensusApiKey,
  showCensusApiKeyDialog,
  updateCensusApiKeyDisplay,
  initCensusKey,
};
