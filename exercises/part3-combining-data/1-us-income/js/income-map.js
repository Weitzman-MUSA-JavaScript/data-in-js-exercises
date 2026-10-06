/**
 * Module for managing the Leaflet map, styles, attribute joins, and layer rendering for US Income.
 */

import 'leaflet';
import * as d3 from 'd3';

/* global L */

/**
 * Returns a color for a given median household income value.
 * Use D3's color interpolation or sequential scales (such as d3.interpolateBlues
 * or d3.scaleSequential) to map income values to colors, returning '#e0e0e0'
 * if income is null, undefined, NaN, or non-positive.
 *
 * @param {number|null} income - Median household income in dollars.
 * @param {Array<number>} incomeRange - Array of two numbers [minIncome, maxIncome] representing the income range for color scaling.
 * @returns {string} Hex or RGB color string.
 */
function getIncomeColor(income, incomeRange) {
  // ... Your code here ...
}

/**
 * Styles a polygon feature based on its median income property.
 *
 * @param {object} feature - GeoJSON feature.
 * @param {Array<object>} allFeatures - Array of all GeoJSON features in the current layer, used to determine the income range for color scaling.
 * @returns {object} Leaflet path styling options.
 */
function getFeatureStyle(feature, allFeatures) {
  const income = feature.properties?.income ?? null;
  const incomeRange = d3.extent(allFeatures, (f) => f.properties?.income ?? null);
  return {
    fillColor: getIncomeColor(income, incomeRange),
    fillOpacity: 0.8,
    stroke: false,
  };
}

/**
 * Style for the thick state boundary outlines.
 *
 * @returns {object} Leaflet path styling options.
 */
function getStateOutlineStyle() {
  return {
    fillColor: 'transparent',
    fillOpacity: 0,
    weight: 2.5,
    color: '#011f5b',
    opacity: 0.9,
  };
}

/**
 * Style for county boundary outlines when viewing tracts inside a state.
 *
 * @returns {object} Leaflet path styling options.
 */
function getCountyOutlineStyle() {
  return {
    fillColor: 'transparent',
    fillOpacity: 0,
    weight: 1.75,
    color: '#444444',
    opacity: 0.85,
  };
}

/**
 * Creates a Map lookup of median income by geography ID from Census API results.
 *
 * @param {Array<Array<string>>} censusRows - Array of Census API rows (including header).
 * @returns {Map<string, number|null>} Map where key is the GEOID and value is income.
 */
function createIncomeLookup(censusRows) {
  // ... Your code here ...
}

/**
 * Updates a GeoJSON FeatureCollection by joining income data into each feature's properties.
 *
 * @param {object} geojson - GeoJSON FeatureCollection.
 * @param {Map<string, number|null>} incomeLookup - Map of GEOID to income.
 * @returns {object} The mutated GeoJSON FeatureCollection with `income` added to properties.
 */
function joinIncomeData(geojson, incomeLookup) {
  // ... Your code here ...
}

/**
 * Updates the legend control with income ranges.
 *
 * @param {L.Control} legendControl - Leaflet legend control instance.
 */
function updateLegend(legendControl) {
  if (!legendControl || !legendControl.container) return;

  const grades = [20000, 40000, 60000, 80000, 100000, 120000];
  const labels = [];

  labels.push(`
    <div class="legend-item">
      <i class="legend-color" style="background: #e0e0e0;"></i>
      <span>No data</span>
    </div>
  `);

  for (let i = 0; i < grades.length; i++) {
    const from = grades[i];
    const to = grades[i + 1];
    const sampleValue = to ? (from + to) / 2 : from;
    const color = getIncomeColor(sampleValue, [grades[0], grades[grades.length - 1]]);

    const labelText = to
      ? `$${(from / 1000).toFixed(0)}k &ndash; $${(to / 1000).toFixed(0)}k`
      : `&gt; $${(from / 1000).toFixed(0)}k`;

    labels.push(`
      <div class="legend-item">
        <i class="legend-color" style="background: ${color};"></i>
        <span>${labelText}</span>
      </div>
    `);
  }

  legendControl.container.innerHTML = `
    <h4>Median Income</h4>
    <div class="legend-scale">
      ${labels.join('')}
    </div>
  `;
}

/**
 * Initializes the Leaflet map and base controls.
 *
 * @param {object} options - Options for map initialization.
 * @param {string|HTMLElement} [options.el='#map'] - Container element or selector.
 * @returns {object} Controller object containing the map and layer helpers.
 */
function initMap(options = {}) {
  const { el = '#map' } = options;
  const container = typeof el === 'string' ? document.querySelector(el) : el;

  const map = L.map(container, {
    center: [38, -96],
    zoom: 4,
    minZoom: 3,
    maxZoom: 15,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map);

  const dataLayerGroup = L.layerGroup().addTo(map);
  const outlineLayerGroup = L.layerGroup().addTo(map);

  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend');
    legend.container = div;
    updateLegend(legend);
    return div;
  };
  legend.addTo(map);

  return {
    map,
    dataLayerGroup,
    outlineLayerGroup,
    legend,
    getIncomeColor,
    getFeatureStyle,
    getStateOutlineStyle,
    getCountyOutlineStyle,
    createIncomeLookup,
    joinIncomeData,
  };
}

export {
  initMap,
  getIncomeColor,
  getFeatureStyle,
  getStateOutlineStyle,
  getCountyOutlineStyle,
  createIncomeLookup,
  joinIncomeData,
  updateLegend,
};
