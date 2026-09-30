/**
 * Module for the Leaflet map visualizing cafes in Rome.
 */

import 'leaflet';

/* globals L */

/**
 * Initializes the Leaflet map centered on Rome.
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

  const map = L.map(mapEl).setView([41.9028, 12.4964], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const cafeLayer = L.layerGroup().addTo(map);
  map.cafeLayer = cafeLayer;

  return map;
}

/**
 * Clears existing markers and adds new circle markers for the cafes GeoJSON FeatureCollection.
 *
 * @param {L.Map} map Leaflet map instance created by initMap.
 * @param {Object} geojson GeoJSON FeatureCollection representing cafes.
 */
function updateCafesOnMap(map, geojson) {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  if (!map.cafeLayer) {
    return;
  }

  map.cafeLayer.clearLayers();

  const geoJsonLayer = L.geoJSON(geojson, {
    pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
      radius: 5,
      fillColor: '#8B4513',
      color: '#fff',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    }),
    onEachFeature: (feature, layer) => {
      const name = feature.properties?.name || 'Unnamed Cafe';
      const street = feature.properties?.['addr:street'] || '';
      const housenumber = feature.properties?.['addr:housenumber'] || '';
      let popupContent = `<strong>${name}</strong>`;
      if (street) {
        popupContent += `<br>${street} ${housenumber}`;
      }
      layer.bindPopup(popupContent);
    },
  });

  map.cafeLayer.addLayer(geoJsonLayer);

  if (geojson?.features && geojson.features.length > 0 && geoJsonLayer.getBounds().isValid()) {
    map.fitBounds(geoJsonLayer.getBounds());
  }
  // === END SAMPLE SOLUTION ===
}

export {
  initMap,
  updateCafesOnMap,
};
