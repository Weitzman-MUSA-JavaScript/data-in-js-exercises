/*

INSTRUCTIONS
============

1.  Update the getHistoricMarkerData function to get the markers that match the
    given filters from the Pennsylvania Historical and Museum Commission. The
    data comes in JSON format, and even through it is from an API, we still use
    the `fetch` function to retrieve it.

2.  Update the updateHistoricMarkerLayer function to add each marker to the
    map and bind a popup to each marker that shows the title (`title`) and
    description (`description`) of the historic marker.

*/

/* globals L */

import { populateCategorySelect } from './phmc.js';
import { showCorsProxyKeyDialog, updateCorsProxyKeyDisplay, getCorsProxyKey } from './corsproxy.js';

/**
 * Creates a historic markers Leaflet map object.
 * @param {string|HTMLElement} elementOrId The DOM element where the map will live
 * @returns {L.Map} The constructed Leaflet Map
 */
function initHistoricMarkerMap(elementOrId) {
  const map = L.map(elementOrId).setView([39.9526, -75.1652], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const layer = L.layerGroup().addTo(map);

  return { map, layer };
}

/**
 * Fetches the historic marker data from the Pennsylvania Historical and Museum Commission.
 * @param {string} keyword Keywords to search for in the marker titles/descriptions.
 * @param {Array<number>} categories An array of category IDs to filter the markers.
 * @returns {Promise<Array<Object>>} The historic marker data.
 */
async function getHistoricMarkerData(corsproxykey, keyword, categories) {
  const philadelphiaCountyCode = 101; // FIPS code for Philadelphia County
  const philadelphiaMunicipalityCode = 1711; // Code for Philadelphia city

  // Marker data URLs look like:
  // `https://corsproxy.io/?key=${corsproxykey}&url=https://share.phmc.pa.gov/server/api/search/phmcmarkers?keyword=...&countyCode=...&municipalities=...&markerCategories=...&markerMissing=`
  //
  // Two important notes:
  // 1. We use a CORS Proxy (https://corsproxy.io/) to avoid cross-origin
  //    resource sharing (CORS) issues. While this is acceptible for learning
  //    and prototyping, it's not recommended for production applications.
  // 2. The `markerCategories` parameter can be repeated for multiple
  //    categories, e.g.: &markerCategories=2&markerCategories=3

  // ... Your code here ...
}

/**
 * Updates the historic marker layer with new data.
 * @param {L.LayerGroup} layer The Leaflet layer group to update
 * @param {string} keyword A search keyword, if provided
 * @param {Array<number>} categories Any marker category IDs, if provided
 */
async function updateHistoricMarkerLayer(layer, keyword, categories) {
  const historicMarkers = await getHistoricMarkerData(getCorsProxyKey(), keyword, categories);

  // ... Your code here ...
}

/** Handles the form submission event to update the historic marker layer.
 * @param {Event} evt The form submission event
 * @param {L.LayerGroup} layer The Leaflet layer group to update
 */
function onHistoricMarkerFormSubmit(evt, layer) {
  evt.preventDefault();

  const form = evt.target;
  const formData = new FormData(form);
  const keyword = formData.get('phmc-keyword');
  const categories = Array.from(formData.getAll('phmc-categories'));

  updateHistoricMarkerLayer(layer, keyword, categories);
}

if (!getCorsProxyKey()) {
  showCorsProxyKeyDialog();
}
updateCorsProxyKeyDisplay();

const phmcCategorySelect = document.getElementById('phmc-categories');
populateCategorySelect(phmcCategorySelect);

const { map: phmcMap, layer: phmcLayer } = initHistoricMarkerMap('map');
const phmcFiltersForm = document.getElementById('phmc-filters');
phmcFiltersForm.addEventListener('submit', (evt) => onHistoricMarkerFormSubmit(evt, phmcLayer));

Object.assign(window, { phmcMap, phmcLayer, phmcFiltersForm });
