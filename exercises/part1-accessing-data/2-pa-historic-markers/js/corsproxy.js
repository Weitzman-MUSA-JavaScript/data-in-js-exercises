const dialog = document.getElementById('corsproxykey-dialog');
const form = dialog.querySelector('form');
const showDialogButton = document.getElementById('show-corsproxykey-dialog-button');
const corsProxyKeyDisplay = document.getElementById('corsproxykey-display');
const corsproxyInput = form.querySelector('input[name="corsproxykey"]');

function showCorsProxyKeyDialog() {
  corsproxyInput.value = getCorsProxyKey() || '';
  dialog.showModal();
}

function saveCorsProxyKey(key) {
  localStorage.setItem('corsproxykey', key);
}

function getCorsProxyKey() {
  return localStorage.getItem('corsproxykey');
}

function updateCorsProxyKeyDisplay() {
  const key = getCorsProxyKey();
  corsProxyKeyDisplay.textContent = key ? key : '';
}

function onSubmitCorsProxyKeyForm() {
  const data = new FormData(form);
  const key = data.get('corsproxykey');
  saveCorsProxyKey(key);
  updateCorsProxyKeyDisplay();
}

form.addEventListener('submit', onSubmitCorsProxyKeyForm);
showDialogButton.addEventListener('click', showCorsProxyKeyDialog);

export { showCorsProxyKeyDialog, saveCorsProxyKey, getCorsProxyKey, updateCorsProxyKeyDisplay };
