/**

INSTRUCTIONS
============

In this exercise, you will practice retrieving and manipulating complex real-world data
from the internet. You will query the OpenAQ API (Version 3) through a CORS proxy to:
1. Retrieve paginated global PM2.5 air quality readings.
2. Query monitoring station locations for a selected country.
3. Cross-reference datasets using array methods (`filter`) to isolate country measurements.
4. Identify the single station reporting the highest pollution level using `reduce`.

You will implement the core data fetching and transformation functions in `js/pollution.js`:

1. `fetchCountries` (in `js/pollution.js`):
   Use `fetch` to retrieve the list of countries providing PM2.5 measurements from OpenAQ:
     `https://api.openaq.org/v3/countries?parameters_id=2&limit=1000`
   Route through the CORS proxy (`corsproxy.io`) and include your OpenAQ API key in
   the `X-API-Key` header. Return the array of country objects.

2. `fetchLatestReadings` (in `js/pollution.js`):
   The OpenAQ parameters endpoint provides the latest PM2.5 readings across thousands of
   stations worldwide, split across multiple pages:
     `https://api.openaq.org/v3/parameters/2/latest?limit=1000&page=${page}`
   Implement pagination logic using a loop to fetch each page. After each page finishes
   loading, invoke the `onProgress(page, totalPages)` callback to update the determinate
   progress bar across the page header. Return the full concatenated array of readings.

3. `fetchLocationsByCountry` (in `js/pollution.js`):
   Given an ISO country code (e.g., 'US', 'IN'), fetch all PM2.5 monitoring locations in that
   country:
     `https://api.openaq.org/v3/locations?iso=${encodeURIComponent(countryCode)}&parameters_id=2&limit=1000&page=${page}`
   Implement pagination logic to retrieve and return all location records.

4. `filterReadingsByCountry` (in `js/pollution.js`):
   Use `Array.prototype.filter()` to filter the global readings array so that it only
   includes measurements whose `locationsId` matches the `id` of one of the country's
   locations.

5. `findMostPollutedReading` (in `js/pollution.js`):
   Use `Array.prototype.reduce()` to find the single reading object with the highest `value`.
   Return `null` if the array is empty.

*/

import {
  showApiKeyDialog,
  updateApiKeyDisplay,
  getApiKey,
  getCorsProxyKey,
} from './openaq-key.js';
import {
  fetchCountries,
  fetchLatestReadings,
  fetchLocationsByCountry,
  filterReadingsByCountry,
  findMostPollutedReading,
} from './pollution.js';
import { initMap, updateMap } from './pollution-map.js';
import { htmlToElement } from './html-utils.js';

let map;
let globalReadings = [];
let countries = [];

/**
 * Updates the determinate progress bar across the page header.
 *
 * @param {number} page Current page number fetched.
 * @param {number} totalPages Total estimated pages.
 */
function updateHeaderProgress(page, totalPages) {
  const bar = document.getElementById('header-progress-bar');
  if (bar) {
    const percent = totalPages > 0 ? Math.min(100, Math.round((page / totalPages) * 100)) : 0;
    bar.style.width = `${percent}%`;
    if (percent >= 100) {
      setTimeout(() => {
        bar.style.opacity = '0';
      }, 1000);
    } else {
      bar.style.opacity = '1';
    }
  }
}

/**
 * Toggles the indeterminate loading indicator for fetching country locations.
 *
 * @param {boolean} isLoading Whether data is currently loading.
 */
function indicateCountryLoading(isLoading) {
  const loadingEl = document.getElementById('country-loading');
  if (loadingEl) {
    loadingEl.hidden = !isLoading;
  }
  const selectEl = document.getElementById('country-select');
  if (selectEl) {
    selectEl.disabled = isLoading;
  }
}

/**
 * Updates the summary paragraph in the sidebar using htmlToElement.
 *
 * @param {string} countryName Name of the selected country.
 * @param {number} locationsCount Number of stations found.
 * @param {Object|null} maxReading Most polluted reading object.
 * @param {Object|null} maxLocation Location object corresponding to the most polluted reading.
 */
function updateSummary(countryName, locationsCount, maxReading, maxLocation) {
  const container = document.getElementById('pollution-summary');
  if (!container) return;
  container.innerHTML = '';

  if (!countryName) {
    const el = htmlToElement(`
      <p class="summary-placeholder">Select a country to view PM2.5 monitoring stations and identify the most polluted station.</p>
    `);
    container.appendChild(el);
    return;
  }

  if (locationsCount === 0) {
    const el = htmlToElement(`
      <p>No PM2.5 monitoring stations found for <strong>${countryName}</strong>.</p>
    `);
    container.appendChild(el);
    return;
  }

  if (!maxReading || !maxLocation) {
    const el = htmlToElement(`
      <p>Found <strong>${locationsCount}</strong> monitoring stations in <strong>${countryName}</strong>, but no recent PM2.5 readings are currently available.</p>
    `);
    container.appendChild(el);
    return;
  }

  const dateStr = maxReading.datetime?.local || maxReading.datetime?.utc || 'recently';
  const el = htmlToElement(`
    <div>
      <p>In <strong>${countryName}</strong>, there are <strong>${locationsCount}</strong> PM2.5 monitoring stations.</p>
      <p>The highest reading is at station <span class="station-highlight">${maxLocation.name}</span> with a measurement of <span class="value-highlight">${maxReading.value.toLocaleString({ minimumFractionDigits: 0, maximumFractionDigits: 3 })} µg/m³</span> (reported ${dateStr}).</p>
    </div>
  `);
  container.appendChild(el);
}

/**
 * Populates the country <select> element with countries fetched from OpenAQ.
 *
 * @param {Array<Object>} countryList Array of country objects.
 */
function populateCountrySelect(countryList = []) {
  const select = document.getElementById('country-select');
  if (!select) return;

  select.innerHTML = '<option value="">-- Choose a country --</option>';

  const sortedCountries = [...countryList].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  for (const country of sortedCountries) {
    if (!country.code) continue;
    const option = document.createElement('option');
    option.value = country.code;
    option.textContent = `${country.name} (${country.code})`;
    select.appendChild(option);
  }

  select.disabled = false;
}

/**
 * Handles selection of a country from the dropdown.
 *
 * @param {string} countryCode The selected country ISO code.
 */
async function onSelectCountry(countryCode) {
  if (!countryCode) {
    updateSummary('', 0, null, null);
    if (map) updateMap(map, [], null);
    return;
  }

  const selectedCountry = countries.find((c) => c.code === countryCode);
  const countryName = selectedCountry ? selectedCountry.name : countryCode;

  const apiKey = getApiKey();
  const corsproxykey = getCorsProxyKey();

  indicateCountryLoading(true);
  try {
    const locations = await fetchLocationsByCountry(corsproxykey, apiKey, countryCode);
    const countryReadings = filterReadingsByCountry(globalReadings, locations);
    const maxReading = findMostPollutedReading(countryReadings);
    const maxLocation = maxReading
      ? locations.find((loc) => loc.id === maxReading.locationsId)
      : null;

    updateMap(map, locations, maxReading);
    updateSummary(countryName, locations.length, maxReading, maxLocation);
  } catch (err) {
    console.error(`Failed to load data for country ${countryCode}:`, err);
    alert(`Failed to load monitoring stations for ${countryName}.`);
  } finally {
    indicateCountryLoading(false);
  }
}

/**
 * Loads the initial dataset and sets up the application.
 */
async function initApp() {
  map = initMap({ el: '#map' });

  updateApiKeyDisplay();

  const apiKey = getApiKey();
  const corsproxykey = getCorsProxyKey();

  if (!apiKey || !corsproxykey) {
    showApiKeyDialog();
    return;
  }

  try {
    countries = await fetchCountries(corsproxykey, apiKey);
    populateCountrySelect(countries);
  } catch (err) {
    console.error('Failed to fetch countries:', err);
    const select = document.getElementById('country-select');
    if (select) {
      select.innerHTML = '<option value="">Failed to load countries</option>';
    }
  }

  try {
    globalReadings = await fetchLatestReadings(corsproxykey, apiKey, updateHeaderProgress);
  } catch (err) {
    console.error('Failed to fetch latest global readings:', err);
  }
}

const countrySelect = document.getElementById('country-select');
if (countrySelect) {
  countrySelect.addEventListener('change', (e) => {
    onSelectCountry(e.target.value);
  });
}

const openaqDialogForm = document.querySelector('#openaqkey-dialog form');
if (openaqDialogForm) {
  openaqDialogForm.addEventListener('submit', () => {
    initApp();
  });
}

document.addEventListener('DOMContentLoaded', initApp);
