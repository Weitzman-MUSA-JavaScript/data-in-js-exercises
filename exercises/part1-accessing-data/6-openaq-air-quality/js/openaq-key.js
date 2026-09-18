const dialog = document.getElementById('openaqkey-dialog');
const form = dialog.querySelector('form');
const showDialogButton = document.getElementById('show-openaqkey-dialog-button');
const apiKeyDisplay = document.getElementById('openaqkey-display');

function showApiKeyDialog() {
  form.querySelector('input[name="openaqkey"]').value = getApiKey() || '';
  dialog.showModal();
}

function saveApiKey(key) {
  localStorage.setItem('openaq_api_key', key);
}

function getApiKey() {
  return localStorage.getItem('openaq_api_key');
}

function updateApiKeyDisplay() {
  const key = getApiKey();
  apiKeyDisplay.textContent = key ? key : '';
}

function onSubmitApiKeyForm() {
  const data = new FormData(form);
  const key = data.get('openaqkey');
  saveApiKey(key);
  updateApiKeyDisplay();
}

form.addEventListener('submit', onSubmitApiKeyForm);
showDialogButton.addEventListener('click', showApiKeyDialog);

export { showApiKeyDialog, saveApiKey, getApiKey, updateApiKeyDisplay };
