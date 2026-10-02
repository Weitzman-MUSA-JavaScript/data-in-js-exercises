import * as turf from '@turf/turf';
import * as d3 from 'd3';
import { BlobReader, ZipReader, TextWriter } from '@zip.js/zip.js';

const COUNTRIES_DATA_URL = './data/countries.geojson';
const POWER_PLANTS_CSV_DATA_URL = './data/global_power_plant_database.csv';
const POWER_PLANTS_ZIP_DATA_URL = './data/global_power_plants.zip';

/**
 * Loads the Natural Earth world countries GeoJSON dataset.
 *
 * @returns {Promise<Array<object>>} An array of country GeoJSON features.
 */
async function loadCountries() {
  // ... Your code here ...
}

/**
 * Loads and extracts the Global Power Plant Database CSV from a zip archive.
 *
 * @returns {Promise<Array<object>>} An array of parsed power plant objects.
 */
async function loadPowerPlants() {
  // ... Your code here ...
}

/**
 * Performs a one-time spatial join attaching country_id to each power plant.
 *
 * Checks bounding boxes first to avoid unnecessary point-in-polygon checks.
 *
 * @param {Array<object>} powerPlants Array of power plant objects.
 * @param {Array<object>} countries Array of country GeoJSON features.
 * @returns {Array<object>} The joined power plants with country_id assigned.
 */
function joinPlantsToCountries(powerPlants, countries) {
  // ... Your code here ...
}

/**
 * Filters power plants by fuel type and minimum capacity.
 *
 * @param {Array<object>} powerPlants Array of power plant objects.
 * @param {object} filters Object with `fuel` and `minCapacity` properties.
 * @returns {Array<object>} Filtered array of power plants.
 */
function filterPowerPlants(powerPlants, filters = {}) {
  // ... Your code here ...
}

/**
 * Aggregates filtered power plants by country_id using Array.prototype.reduce().
 *
 * @param {Array<object>} filteredPlants Array of filtered power plant objects.
 * @returns {Record<string, { count: number, capacity: number }>} Aggregated stats keyed by country_id.
 */
function aggregatePlantsByCountry(filteredPlants) {
  // ... Your code here ...
}

export {
  loadCountries,
  loadPowerPlants,
  joinPlantsToCountries,
  filterPowerPlants,
  aggregatePlantsByCountry,
};
