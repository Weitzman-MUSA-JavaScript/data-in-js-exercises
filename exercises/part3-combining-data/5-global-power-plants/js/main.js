/**

INSTRUCTIONS
============

In this exercise, you will practice combining multiple datasets using a spatial
join, handling compressed data in the browser, and aggregating data for map
visualization.

You will implement the data retrieval, spatial join, and aggregation functions
in `js/power-plants.js`:

1. `loadCountries` (in `js/power-plants.js`):
   Natural Earth (http://www.naturalearthdata.com) "is a public domain map
   dataset available at 1:10m, 1:50m and 1:110 million scales." The vector data
   comes as ESRI shapefiles. For this repository, the `prep_natural_earth.py`
   script was used to convert the shapefiles to GeoJSON (Note: you do not need
   to run this yourself, it has already been run). Use `fetch` to retrieve the
   Natural Earth world countries GeoJSON (`./data/countries.geojson`). Return
   the array of country GeoJSON feature objects.

2. `loadPowerPlants` (in `js/power-plants.js`):
   The Global Power Plant Database
   (https://datasets.wri.org/datasets/global-power-plant-database) is
   distributed as a compressed zip file. FOr this repository, the `prep_power_plants.py` script was used to download that zip file (`./data/global_power_plants.zip`), and to extract the CSV file from it (`./data/global_power_plant_database.csv`).
   You can use `d3.csv` to load the CSV file directly.

   Alternatively, you can use `fetch` to get the zip file data as a "blob"
   (https://developer.mozilla.org/en-US/docs/Web/API/Blob), extract the CSV file
   using `@zip.js/zip.js`, and parse the CSV text into an array of objects using
   `d3.csvParse`. The general approach for extracting data from a zip file is:

     const response = await fetch(url);
     const blob = await response.blob();

     const blobReader = new BlobReader(blob);  // Set up an object to read from the blob
     const zipReader = new ZipReader(blobReader);  // Set up an object to read from the zip
     const entries = await zipReader.getEntries();  // Get an array of entries in the zip file
     const csvEntry = entries.find((entry) => entry.filename.endsWith('.csv'));  // Find the CSV file

     const text = await csvEntry.getData(new TextWriter());  // Extract the CSV text from the entry
     await zipReader.close();  // Close the zip reader

     // Then you can do whatever you need with the text of the CSV file...

   In either case, ensure capacity, latitude, and longitude are parsed from the
   CSV as numbers.

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

NOTE: There is a Leaflet version of this map, and a MapLibre GL JS version as
well. Once you've added data to the map, if you would like to see the MapLibre
GL JS version, you can switch to it by updating line 96 below to:

  import { initMap } from './power-plants-map-gl.js';

Try it out, and consider the pros and cons of this type of map display.

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
