/**
 * Module for Leaflet map operations for the air quality monitoring stations exercise.
 */

import 'leaflet';

/* globals L */

/**
 * Initializes the Leaflet map.
 *
 * @param {Object} options Configuration options.
 * @param {HTMLElement|string} options.el Container element or selector.
 * @returns {L.Map} Leaflet map instance.
 */
function initMap(options = {}) {
  const mapEl = typeof options.el === 'string'
    ? document.querySelector(options.el)
    : options.el;

  if (!mapEl) {
    throw new Error('A valid DOM element or selector must be provided for the map.');
  }

  const map = L.map(mapEl, { preferCanvas: true }).setView([20, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const markersLayer = L.layerGroup().addTo(map);
  map.markersLayer = markersLayer;

  return map;
}

/**
 * Updates the map with markers for all stations in a country, highlighting the most polluted station.
 *
 * @param {L.Map} map Leaflet map instance.
 * @param {Array<Object>} locations Array of location objects for the selected country.
 * @param {Object|null} maxReading The reading object with the highest PM2.5 value.
 */
function updateMap(map, locations = [], maxReading = null) {
  if (!map || !map.markersLayer) return;

  map.markersLayer.clearLayers();

  let maxMarker = null;

  for (const loc of locations) {
    const lat = loc.coordinates?.latitude;
    const lon = loc.coordinates?.longitude;

    if (typeof lat !== 'number' || typeof lon !== 'number') {
      continue;
    }

    const isMax = maxReading && loc.id === maxReading.locationsId;

    if (isMax) {
      maxMarker = L.circleMarker([lat, lon], {
        radius: 9,
        color: '#990000',
        fillColor: '#990000',
        fillOpacity: 0.9,
        weight: 2,
      }).bindPopup(`
        <strong>${loc.name || 'Monitoring Station'}</strong><br>
        PM2.5: <strong>${maxReading.value} µg/m³</strong><br>
        <em>Highest reading in selected country</em>
      `);
      maxMarker.addTo(map.markersLayer);
    } else {
      const marker = L.circleMarker([lat, lon], {
        radius: 4,
        color: '#011f5b',
        fillColor: '#011f5b',
        fillOpacity: 0.5,
        weight: 1,
      }).bindPopup(`<strong>${loc.name || 'Monitoring Station'}</strong>`);
      marker.addTo(map.markersLayer);
    }
  }

  const layers = map.markersLayer.getLayers();
  if (layers.length > 0) {
    const group = L.featureGroup(layers);
    map.fitBounds(group.getBounds(), { padding: [30, 30], maxZoom: 10 });
    if (maxMarker) {
      maxMarker.bringToFront().openPopup();
    }
  }
}

export {
  initMap,
  updateMap,
};
