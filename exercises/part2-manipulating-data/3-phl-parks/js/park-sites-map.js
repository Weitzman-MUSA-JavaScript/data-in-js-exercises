/**
 * Module for the Leaflet map visualizing Philadelphia park sites.
 */

import 'leaflet';

/* globals L */

const DEFAULT_STYLE = {
  color: '#011f5b',
  weight: 1.5,
  fillColor: '#011f5b',
  fillOpacity: 0.25,
};

const SELECTED_STYLE = {
  color: '#990000',
  weight: 3,
  fillColor: '#990000',
  fillOpacity: 0.65,
};

/**
 * Initializes the park sites Leaflet map.
 *
 * @param {Object} options Configuration options.
 * @param {HTMLElement|string} options.el Element or element ID for the map container.
 * @param {Array<Object>} options.sites GeoJSON features for park sites.
 * @param {Function} [options.onSelect] Callback fired when a polygon is clicked: (evt.detail=Array<string> selectedSiteNames) => void.
 * @returns {L.Map} Leaflet map instance augmented with a setSelectedSites method.
 */
function initMap(options = {}) {
  const mapEl = typeof options.el === 'string'
    ? document.querySelector(options.el)
    : options.el;

  if (!mapEl) {
    throw new Error('A valid DOM element or selector must be provided for the map.');
  }

  const map = L.map(mapEl).setView([39.9526, -75.1652], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  let selectedNames = new Set();
  const sites = options.sites || [];

  const geojsonLayer = L.geoJSON(sites, {
    style: () => DEFAULT_STYLE,
    onEachFeature: (feature, layer) => {
      const siteName = feature.properties?.site_name || 'Park Site';
      const parkName = feature.properties?.park_name || '';
      const acreage = Number(feature.properties?.acreage || 0).toFixed(2);

      const tooltipContent = `
        <strong>${siteName}</strong><br>
        ${parkName ? `<em>${parkName}</em><br>` : ''}
        ${acreage} acres
      `;

      layer.bindTooltip(tooltipContent, {
        sticky: true,
        direction: 'auto',
      });

      layer.on('click', () => {
        if (!siteName) return;

        if (selectedNames.has(siteName)) {
          selectedNames.delete(siteName);
        } else {
          selectedNames.add(siteName);
        }

        setSelectedSites(Array.from(selectedNames));

        map.fire('select', { detail: Array.from(selectedNames) });
      });
    },
  }).addTo(map);

  if (sites.length > 0 && geojsonLayer.getBounds().isValid()) {
    map.fitBounds(geojsonLayer.getBounds());
  }

  /**
   * Updates map feature styles according to the current selection.
   *
   * @param {Array<string>} newSelectedNames Array of selected site names.
   */
  function setSelectedSites(newSelectedNames = []) {
    selectedNames = new Set(newSelectedNames);
    geojsonLayer.eachLayer((layer) => {
      const name = layer.feature?.properties?.site_name;
      const isSelected = selectedNames.has(name);
      layer.setStyle(isSelected ? SELECTED_STYLE : DEFAULT_STYLE);
    });
  }

  // Attach event handlers
  if (typeof options.onSelect === 'function') {
    map.addEventListener('select', options.onSelect);
  }

  map.setSelectedSites = setSelectedSites;
  return map;
}

export { initMap };
