/**
 * Module for managing the park sites sidebar controls (search filter, select, reset).
 */

import { htmlToElement } from './html-utils.js';
import { filterParkSites, groupByParkName } from './park-sites.js';

/**
 * Initializes the park sites selection and filter form component.
 *
 * @param {HTMLElement|string} el Container element or selector for the form controls.
 * @param {Array<Object>} sites Complete list of park site GeoJSON feature objects.
 * @param {Function} [onSelect] Callback fired when selection changes: (evt.detail=Array<string> selectedSiteNames) => void.
 * @param {Function} [onFilter] Callback fired when search filter text changes: (evt.detail=Array<Object> filteredSites) => void.
 * @param {Function} [onReset] Callback fired when the reset button is clicked: () => void.
 * @returns {HTMLElement} The controls container element augmented with helper methods.
 */
function initForm(el, sites, onSelect = null, onFilter = null, onReset = null) {
  const containerEl = typeof el === 'string'
    ? document.querySelector(el)
    : el;

  if (!containerEl) {
    throw new Error('A valid DOM element or selector must be provided for the form.');
  }

  const allSites = sites || [];
  let currentSites = allSites;
  let selectedNames = new Set();

  const filterInput = containerEl.querySelector('[name="park-sites-filter"]');
  const selectEl = containerEl.querySelector('[name="park-sites-select"]');

  /**
   * Renders the optgroups and options into the select element based on current filtered sites.
   */
  function renderOptions() {
    if (!selectEl) return;

    selectEl.innerHTML = '';
    const grouped = groupByParkName(currentSites) || {};
    const sortedParkNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    for (const parkName of sortedParkNames) {
      const optgroup = htmlToElement(`<optgroup label="${parkName}"></optgroup>`);

      const sitesInPark = grouped[parkName].slice().sort((a, b) => {
        const nameA = a.properties?.site_name || '';
        const nameB = b.properties?.site_name || '';
        return nameA.localeCompare(nameB);
      });

      for (const site of sitesInPark) {
        const siteName = site.properties?.site_name;
        if (!siteName) continue;

        const acreage = Number(site.properties?.acreage || 0).toFixed(1);
        const option = htmlToElement(`
          <option value="${siteName}" ${selectedNames.has(siteName) ? 'selected' : ''}>
            ${siteName} (${acreage} ac)
          </option>
        `);
        optgroup.appendChild(option);
      }

      selectEl.appendChild(optgroup);
    }
  }

  // Handle select change
  selectEl?.addEventListener('change', () => {
    selectedNames = new Set(
      Array.from(selectEl.selectedOptions).map((opt) => opt.value),
    );
    containerEl.dispatchEvent(new CustomEvent('select', { detail: Array.from(selectedNames) }));
  });

  // Handle filter input typing
  filterInput?.addEventListener('input', () => {
    const query = filterInput.value;
    currentSites = filterParkSites(allSites, query);
    renderOptions();
    containerEl.dispatchEvent(new CustomEvent('filter', { detail: currentSites }));
  });

  // Handle reset button click
  containerEl.addEventListener('reset', () => {
    selectedNames.clear();
    console.log('reset');
    currentSites = allSites;
    renderOptions();

    // The `reset` event is built-in for `form` elements, so we don't need to
    // manually dispatch it here; any listeners for the `reset` event will be
    // triggered automatically.
  });

  /**
   * Updates the form's selected options from an external selection array.
   *
   * @param {Array<string>} newSelectedNames Array of selected site_name strings.
   */
  function setSelectedSites(newSelectedNames = []) {
    selectedNames = new Set(newSelectedNames);
    if (!selectEl) return;

    for (const option of selectEl.options) {
      option.selected = selectedNames.has(option.value);
    }
  }

  // Initial render
  renderOptions();

  // Attach event handlers
  if (typeof onSelect === 'function') {
    containerEl.addEventListener('select', onSelect);
  }
  if (typeof onFilter === 'function') {
    containerEl.addEventListener('filter', onFilter);
  }
  if (typeof onReset === 'function') {
    containerEl.addEventListener('reset', onReset);
  }

  containerEl.setSelectedSites = setSelectedSites;
  return containerEl;
}

export { initForm };
