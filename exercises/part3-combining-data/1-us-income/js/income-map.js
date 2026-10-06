/**
 * Module for managing the Leaflet map, styles, attribute joins, and layer rendering for US Income.
 */

import 'leaflet';
import * as d3 from 'd3';

import {
  getIncomeRange,
  getStateFipsFromGeoidfq,
  getCountyGeoidFromGeoidfq,
} from './income.js';

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
 * @param {Array<number>} incomeRange - Array of two numbers [minIncome, maxIncome] representing the income range for color scaling.
 * @returns {object} Leaflet path styling options.
 */
function getFeatureStyle(feature, incomeRange) {
  const income = feature.properties?.income ?? null;
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
 * Formats dollar income values for popups and tooltips.
 *
 * @param {number|null} income - Median household income.
 * @returns {string} Formatted string.
 */
function formatIncome(income) {
  if (income === null || income === undefined || isNaN(income) || income <= 0) {
    return 'No data available';
  }
  return `$${income.toLocaleString()}`;
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
    zoomSnap: 0,
    preferCanvas: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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

  /**
   * Display the national-level data on the map, including counties choropleth and state outlines.
   *
   * @param {object} statesGeojson - GeoJSON object containing all US state shapes.
   * @param {object} countiesGeojson - GeoJSON object containing all US county shapes.
   */
  function showNationalData(statesGeojson, countiesGeojson) {
    // Render counties choropleth layer
    const incomeRange = getIncomeRange(countiesGeojson.features);
    const countiesLayer = L.geoJSON(countiesGeojson, {
      style: (feature) => getFeatureStyle(feature, incomeRange),
      onEachFeature: (feature, layer) => {
        const countyName = feature.properties?.NAMELSAD || feature.properties?.NAME || 'County';
        const income = feature.properties?.income;
        const stateFips = getStateFipsFromGeoidfq(feature.properties?.GEOIDFQ);
        const stateFeature = statesGeojson.features.find((f) => getStateFipsFromGeoidfq(f.properties?.GEOIDFQ) === stateFips);
        const stateName = stateFeature?.properties?.NAME || 'State';

        layer.bindTooltip(
          `<strong>${countyName}, ${stateName}</strong><br>Median Income: ${formatIncome(income)}`,
          { sticky: true },
        );

        layer.on('click', () => {
          dataLayerGroup.fire('click:state', {
            stateFips,
            stateName,
          });
        });
      },
    });
    dataLayerGroup.addLayer(countiesLayer);

    // Render state outlines layer (thick borders)
    const statesLayer = L.geoJSON(statesGeojson, {
      style: getStateOutlineStyle,
      interactive: false,
    });
    outlineLayerGroup.addLayer(statesLayer);

    // Reset map view to national extent
    map.setView([38, -96], 4);
  }

  /**
   * Displays the state-level data on the map, including tracts choropleth and county outlines.
   *
   * @param {string} stateName - Name of the state.
   * @param {string} stateFips - Two-digit state FIPS code.
   * @param {object} countiesGeojson - GeoJSON object containing all counties in the state.
   * @param {object} tractsGeojson - GeoJSON object containing all tracts in the state.
   */
  function showStateData(stateName, stateFips, countiesGeojson, tractsGeojson) {
    // Render tracts choropleth layer
    const incomeRange = getIncomeRange(tractsGeojson.features);
    const tractsLayer = L.geoJSON(tractsGeojson, {
      style: (feature) => getFeatureStyle(feature, incomeRange),
      onEachFeature: (feature, layer) => {
        const tractName = feature.properties?.NAMELSAD || `Tract ${feature.properties?.NAME}`;
        const income = feature.properties?.income;
        const countyGeoid = getCountyGeoidFromGeoidfq(feature.properties?.GEOIDFQ);
        const countyFeature = countiesGeojson.features.find((f) => f.properties?.geoid === countyGeoid || f.properties?.GEOIDFQ?.endsWith(countyGeoid));
        const countyName = countyFeature?.properties?.NAMELSAD || countyFeature?.properties?.NAME || `County ${countyGeoid}`;

        layer.bindTooltip(
          `<strong>${tractName}</strong> (${countyName})<br>Median Income: ${formatIncome(income)}`,
          { sticky: true },
        );

        layer.on('click', () => {
          dataLayerGroup.fire('click:county', {
            stateFips,
            stateName,
            countyGeoid,
            countyName,
          });
        });
      },
    });
    dataLayerGroup.addLayer(tractsLayer);

    // Render county outlines within this state
    if (countiesGeojson) {
      const stateCounties = {
        type: 'FeatureCollection',
        features: countiesGeojson.features.filter(
          (f) => getStateFipsFromGeoidfq(f.properties?.GEOIDFQ) === stateFips,
        ),
      };

      const countyOutlinesLayer = L.geoJSON(stateCounties, {
        style: getCountyOutlineStyle,
        interactive: false,
      });
      outlineLayerGroup.addLayer(countyOutlinesLayer);
    }

    // Zoom map to fit the state tracts
    if (tractsLayer.getBounds().isValid()) {
      map.fitBounds(tractsLayer.getBounds(), { padding: [20, 20] });
    }
  }

  /**
   * Displays the county-level data on the map, including tracts choropleth and county boundary.
   *
   * @param {object} countyGeojson - GeoJSON Feature object for the specific county.
   * @param {object} tractsGeojson - GeoJSON FeatureCollection object containing all tracts in the county.
   */
  function showCountyData(countyGeojson, tractsGeojson) {
    // Render county tracts choropleth
    const incomeRange = getIncomeRange(tractsGeojson.features);
    const countyTractsLayer = L.geoJSON(tractsGeojson, {
      style: (feature) => getFeatureStyle(feature, incomeRange),
      onEachFeature: (feature, layer) => {
        const tractName = feature.properties?.NAMELSAD || `Tract ${feature.properties?.NAME}`;
        const income = feature.properties?.income;

        layer.bindTooltip(
          `<strong>${tractName}</strong><br>Median Income: ${formatIncome(income)}`,
          { sticky: true },
        );
      },
    });
    dataLayerGroup.addLayer(countyTractsLayer);

    // Render thick boundary for this county
    if (countyGeojson) {
      const singleCountyLayer = L.geoJSON(countyGeojson, {
        style: () => ({
          fillColor: 'transparent',
          fillOpacity: 0,
          weight: 3,
          color: '#990000', // Highlight county with UPenn red accent
          opacity: 1,
        }),
        interactive: false,
      });
      outlineLayerGroup.addLayer(singleCountyLayer);
    }

    // Zoom map to fit the county
    if (countyTractsLayer.getBounds().isValid()) {
      map.fitBounds(countyTractsLayer.getBounds(), { padding: [20, 20] });
    }
  }

  return {
    map,
    dataLayerGroup,
    outlineLayerGroup,
    legend,
    showNationalData,
    showStateData,
    showCountyData,
  };
}

export {
  initMap,
  getIncomeColor,
  getFeatureStyle,
  getStateOutlineStyle,
  getCountyOutlineStyle,
  updateLegend,
};
