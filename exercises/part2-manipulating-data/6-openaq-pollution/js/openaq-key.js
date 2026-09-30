const dialog = document.getElementById('openaqkey-dialog');
const form = dialog.querySelector('form');
const showDialogButton = document.getElementById('show-openaqkey-dialog-button');
const openaqKeyDisplay = document.getElementById('openaqkey-display');
const corsProxyKeyDisplay = document.getElementById('corsproxykey-display');

function getApiKey() {
  return localStorage.getItem('openaq_api_key');
}

function getCorsProxyKey() {
  return localStorage.getItem('corsproxykey');
}

function saveApiKey(key) {
  localStorage.setItem('openaq_api_key', key);
}

function saveCorsProxyKey(key) {
  localStorage.setItem('corsproxykey', key);
}

function showApiKeyDialog() {
  const openaqInput = form.querySelector('input[name="openaqkey"]');
  const corsproxyInput = form.querySelector('input[name="corsproxykey"]');

  if (openaqInput) {
    openaqInput.value = getApiKey() || '';
  }
  if (corsproxyInput) {
    corsproxyInput.value = getCorsProxyKey() || '';
  }

  dialog.showModal();
}

function updateApiKeyDisplay() {
  const openaqKey = getApiKey();
  const corsKey = getCorsProxyKey();

  if (openaqKeyDisplay) {
    openaqKeyDisplay.textContent = openaqKey || '';
  }
  if (corsProxyKeyDisplay) {
    corsProxyKeyDisplay.textContent = corsKey || '';
  }
}

function onSubmitApiKeyForm() {
  const data = new FormData(form);
  const openaqKey = data.get('openaqkey');
  const corsKey = data.get('corsproxykey');

  if (openaqKey) {
    saveApiKey(openaqKey);
  }
  if (corsKey) {
    saveCorsProxyKey(corsKey);
  }
  updateApiKeyDisplay();
}

form.addEventListener('submit', onSubmitApiKeyForm);
if (showDialogButton) {
  showDialogButton.addEventListener('click', showApiKeyDialog);
}

export {
  showApiKeyDialog,
  saveApiKey,
  saveCorsProxyKey,
  getApiKey,
  getCorsProxyKey,
  updateApiKeyDisplay,
};
