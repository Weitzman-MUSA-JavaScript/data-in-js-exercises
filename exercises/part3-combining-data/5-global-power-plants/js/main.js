/**

INSTRUCTIONS
============

In this exercise, you will practice combining multiple datasets using a spatial
join, handling compressed data in the browser, and aggregating data for map
visualization.

You will implement the data retrieval, spatial join, and aggregation functions
in `js/power-plants.js`:

1. `loadCountries` (in `js/power-plants.js`):
   Use `fetch` to retrieve the Natural Earth world countries GeoJSON
   (`./data/countries.geojson`).
   Return the array of country GeoJSON feature objects.

2. `loadPowerPlants` (in `js/power-plants.js`):
   The Global Power Plant Database is distributed as a compressed zip file
   (`./data/global_power_plants.zip`). Use `fetch` to get the file blob, extract
   the CSV file using `@zip.js/zip.js`, and parse the CSV text into an array of
   objects using `d3.csvParse`. Ensure capacity, latitude, and longitude are
   parsed as numbers.

3. `joinPlantsToCountries` (in `js/power-plants.js`):
   Perform a spatial join between the power plants and the country polygons.
   For each power plant, use `turf.point([lng, lat])` and find which country
   polygon contains it using `turf.booleanPointInPolygon`.
   When a match is found, assign the country identifier (e.g. `sov_a3` or
   `name`) to `plant.country_id`.

   PERFORMANCE TIP: Spatial joins in the browser can be computationally
   expensive! Iterating over ~35,000 points against hundreds of complex
   polygons on every filter change would freeze the interface. By performing
   the spatial join ONCE on load to tag each plant with a `country_id`, subsequent
   user interactions (filtering by fuel and capacity) can run instantaneously
   using fast in-memory array operations. Furthermore, checking if a point is
   inside each country's bounding box (`turf.bbox`) before calling
   `turf.booleanPointInPolygon` eliminates over 99% of expensive polygon tests.

4. `filterPowerPlants` (in `js/power-plants.js`):
   Return an array of power plants that satisfy the active filter criteria:
   - capacity_mw >= minCapacity
   - primary_fuel matches selected fuel (or all fuels)

5. `aggregatePlantsByCountry` (in `js/power-plants.js`):
   Use `Array.prototype.reduce()` to tally the plant count and total capacity
   grouped by `country_id`.
   Return an object mapping each country_id to its aggregated statistics:
   `{ [countryId]: { count: number, capacity: number } }`.

The map rendering (`power-plants-map.js`), UI controls (`power-plants-controls.js`),
and this orchestrator (`main.js`) manage the application state and map updates.

*/

import {
  loadCountries,
  loadPowerPlants,
  joinPlantsToCountries,
  filterPowerPlants,
  aggregatePlantsByCountry,
} from './power-plants.js';
import { initMap } from './power-plants-map.js';
import { initControls } from './power-plants-controls.js';

let allPowerPlants = [];
let allCountries = [];
let currentFilters = {
  fuel: 'all',
  minCapacity: 0,
  metric: 'count',
};

let mapComponent;
let controlsComponent;

/**
 * Filters power plants and updates controls and map choropleth.
 */
function applyFilters() {
  const filtered = filterPowerPlants(allPowerPlants, currentFilters);
  const countryAggregates = aggregatePlantsByCountry(filtered);
  const activeCountriesCount = Object.keys(countryAggregates).length;

  if (controlsComponent) {
    controlsComponent.setCounts(filtered.length, activeCountriesCount);
  }

  if (mapComponent) {
    mapComponent.updateChoropleth(countryAggregates, currentFilters.metric);
  }
}

/**
 * Handles filter change events emitted by controls component.
 *
 * @param {object} filters Current filter state { fuel, minCapacity, metric }.
 */
function handleFilter(filters) {
  currentFilters = filters;
  applyFilters();
}

/**
 * Initializes the global power plants application.
 */
async function initApp() {
  const loadingOverlay = document.querySelector('.loading-overlay');

  try {
    mapComponent = initMap({ el: '#map' });
    controlsComponent = initControls({
      el: '#plant-controls',
      onFilter: handleFilter,
    });

    const [countries, powerPlants] = await Promise.all([
      loadCountries(),
      loadPowerPlants(),
    ]);

    allCountries = countries;
    mapComponent.setCountries(allCountries);

    allPowerPlants = joinPlantsToCountries(powerPlants, allCountries);

    applyFilters();

    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  } catch (error) {
    console.error('Failed to initialize power plants dashboard:', error);
    if (loadingOverlay) {
      const spinner = loadingOverlay.querySelector('.loading-spinner');
      if (spinner) {
        spinner.textContent = 'Error loading data. Please check the console.';
        spinner.style.color = '#990000';
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', initApp);
