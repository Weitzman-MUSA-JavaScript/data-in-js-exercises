/**

INSTRUCTIONS
============

In this exercise, you will practice data manipulation techniques using array
methods (`filter`, `reduce`) to work with Philadelphia Parks & Recreation (PPR)
properties data.

You will implement the core data manipulation functions in `js/park-sites.js`:

1.  `fetchParkSites`:
    Use `fetch` to retrieve the Philadelphia Parks & Recreation properties GeoJSON
    dataset from OpenDataPhilly. Return the array of feature objects.

2.  `filterParkSites`:
    Use `Array.prototype.filter()` to return park sites whose `site_name` or
    `park_name` contains the search query string (case-insensitively).

3.  `groupByParkName`:
    Use `Array.prototype.reduce()` to group the array of park sites into an object
    keyed by each site's parent `park_name` (e.g., `{ 'Schuylkill River Park': [...] }`).
    This is used to construct organized `<optgroup>` lists in the sidebar `<select>`.

4.  `calcTotalAcreage`:
    Use `Array.prototype.reduce()` to sum the `acreage` of the selected park sites.
    To avoid double-counting: If a site has `nested === 'Y'` and its parent park
    (`nested === 'N'` with matching `park_name`) is also selected, DO NOT count the
    nested site's acreage.

The UI components (`park-sites-card.js`, `park-sites-form.js`, `park-sites-map.js`)
and orchestrator (`main.js`) handle map rendering, form interactions, and
state synchronization. When no park sites are selected, the application calculates
and displays the total acreage across all park sites.

*/

import { fetchParkSites, calcTotalAcreage } from './park-sites.js';
import { initCard } from './park-sites-card.js';
import { initForm } from './park-sites-form.js';
import { initMap } from './park-sites-map.js';

let allSites = [];
let selectedSiteNames = [];

let cardComponent;
let formComponent;
let mapComponent;

/**
 * Returns the array of sites that should be factored into the acreage calculation.
 * If no sites are explicitly selected, all sites are considered selected.
 *
 * @returns {Array<Object>} Array of GeoJSON feature objects.
 */
function getEffectiveSelectedSites() {
  if (selectedSiteNames.length === 0) {
    return allSites;
  }
  const nameSet = new Set(selectedSiteNames);
  return allSites.filter((site) => nameSet.has(site.properties?.site_name));
}

/**
 * Recalculates total acreage and synchronizes selection states across components.
 */
function syncState() {
  const effectiveSites = getEffectiveSelectedSites();
  const totalAcreage = calcTotalAcreage(effectiveSites);

  if (cardComponent) {
    cardComponent.updateAcreage(totalAcreage);
  }

  if (formComponent) {
    formComponent.setSelectedSites(selectedSiteNames);
  }

  if (mapComponent) {
    mapComponent.setSelectedSites(selectedSiteNames);
  }
}

/**
 * Handles selection changes originating from either the map or the form.
 *
 * @param {CustomEvent} evt The custom event containing the updated selection in `evt.detail`.
 * @param {Array<string>} evt.detail Updated array of selected site names.
 */
function handleSelectChange(evt) {
  selectedSiteNames = evt.detail;
  syncState();
}

/**
 * Handles reset actions originating from the form.
 */
function handleReset() {
  selectedSiteNames = [];
  syncState();
}

/**
 * Initializes the entire Philadelphia Parks dashboard.
 */
async function initApp() {
  try {
    allSites = await fetchParkSites();

    cardComponent = initCard('#acreage-card');

    formComponent = initForm(
      '#park-sites-controls',
      allSites,
    );
    formComponent.addEventListener('select', handleSelectChange);
    formComponent.addEventListener('reset', handleReset);

    mapComponent = initMap(
      '#map',
      allSites,
    );
    mapComponent.addEventListener('select', handleSelectChange);

    syncState();
  } catch (error) {
    console.error('Failed to initialize Philadelphia Parks app:', error);
  }
}

document.addEventListener('DOMContentLoaded', initApp);
