/**
 * Module for the Leaflet map visualizing USGS earthquakes.
 */

import 'leaflet';

/* globals L */

/**
 * Gets a marker color based on earthquake depth in km.
 *
 * @param {number} depth Depth in kilometers.
 * @returns {string} Hex color string.
 */
function getColorFromDepth(depth) {
  if (depth < 70) return '#e63946';
  if (depth < 300) return '#f4a261';
  return '#e76f51';
}

/**
 * Initializes the Leaflet earthquake map.
 *
 * @param {Object} options Configuration options.
 * @param {HTMLElement|string} options.el Element or selector for the map container.
 * @returns {L.Map} The initialized Leaflet map instance.
 */
function initMap(options = {}) {
  const mapEl = typeof options.el === 'string'
    ? document.querySelector(options.el)
    : options.el;

  if (!mapEl) {
    throw new Error('A valid DOM element or selector must be provided for the map.');
  }

  const map = L.map(mapEl).setView([20, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const markerLayer = L.layerGroup().addTo(map);
  map.markerLayer = markerLayer;

  return map;
}

/**
 * Clears existing markers and adds new circle markers for the filtered earthquakes.
 *
 * @param {L.Map} map Leaflet map instance created by initMap.
 * @param {Array<Object>} earthquakes Array of GeoJSON feature objects.
 */
function updateEarthquakesOnMap(map, earthquakes = []) {
  // ... Your code here ...
}

export {
  initMap,
  updateEarthquakesOnMap,
};
