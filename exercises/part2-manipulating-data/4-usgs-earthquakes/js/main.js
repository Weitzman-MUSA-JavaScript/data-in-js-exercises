/**

INSTRUCTIONS
============

In this exercise, you will practice data manipulation techniques using array
methods (e.g. `filter`, `reduce`) to work with USGS Earthquake data from the
past week.

You will implement the core data manipulation functions in `js/earthquakes.js`
and map rendering in `js/earthquakes-map.js`:

1.  `fetchEarthquakes` (in `js/earthquakes.js`):
    Use `fetch` to retrieve the GeoJSON feed for all earthquakes in the past
    week from USGS:
    https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson
    Return the array of earthquake feature objects.

2.  `filterEarthquakes` (in `js/earthquakes.js`):
    Return an array of earthquakes that satisfy the filter criteria:
    - magnitude >= minMag
    - depth >= minDepth
    - depth <= maxDepth

    Note: The USGS GeoJSON uses three dimensional coordinates in the feature
    geometries, and depth is stored in kilometers as the third element of the
    coordinates array: `feature.geometry.coordinates[2]`.

3.  `binEarthquakes` (in `js/earthquakes.js`):
    Group earthquakes into discrete bins by depth and magnitude (e.g., a 2D
    10x10 matrix of earthquake counts where the magnitudes are distributed
    across the rows, and the depths are distributed across the columns). Return
    an object containing parallel arrays (`depths`, `magnitudes`, `counts`) and
    the `maxCount` to feed into the Billboard.js scatter plot heatmap.

4.  `updateEarthquakesOnMap` (in `js/earthquakes-map.js`):
    Clear existing map markers and iterate over the filtered earthquakes array
    to create and add Leaflet circle markers with popups displaying each
    earthquake's title, magnitude, and depth.

5.  [STRETCH GOAL] If you want an additional challenge, update the heatmap chart
    to use a logarithmic scale for the depth axis and/or for the color scale for
    greater distinction between different magnitudes/depths bins.

The UI controls (`earthquakes-controls.js`), chart renderer (`earthquakes-chart.js`),
and this orchestrator (`main.js`) manage the state synchronization across the dashboard.

*/

import {
  fetchEarthquakes,
  filterEarthquakes,
  binEarthquakes,
} from './earthquakes.js';
import { initControls } from './earthquakes-controls.js';
import { initMap, updateEarthquakesOnMap } from './earthquakes-map.js';
import { initChart } from './earthquakes-chart.js';

let allEarthquakes = [];
let currentFilters = {
  minMag: 0,
  minDepth: 0,
  maxDepth: 700,
};

let controlsComponent;
let mapComponent;
let chartComponent;

/**
 * Filters earthquakes and updates the controls count, map markers, and chart.
 */
function applyFilters() {
  const filtered = filterEarthquakes(allEarthquakes, currentFilters) || [];

  if (controlsComponent) {
    controlsComponent.setCount(filtered.length);
  }

  if (mapComponent) {
    updateEarthquakesOnMap(mapComponent, filtered);
  }

  if (chartComponent) {
    const binnedData = binEarthquakes(filtered);
    chartComponent.update(binnedData);
  }
}

/**
 * Handles filter events emitted by the controls component.
 *
 * @param {CustomEvent} evt Custom event with detail containing { minMag, minDepth, maxDepth }.
 */
function handleFilter(evt) {
  currentFilters = evt.detail;
  applyFilters();
}

/**
 * Initializes the earthquake dashboard application.
 */
async function initApp() {
  try {
    controlsComponent = initControls({
      el: '#earthquake-controls',
      onFilter: handleFilter,
    });

    mapComponent = initMap({
      el: '#map',
    });

    chartComponent = initChart({
      el: '#earthquake-chart',
    });

    allEarthquakes = await fetchEarthquakes();

    applyFilters();
  } catch (error) {
    console.error('Failed to initialize earthquake dashboard:', error);
  }
}

document.addEventListener('DOMContentLoaded', initApp);
