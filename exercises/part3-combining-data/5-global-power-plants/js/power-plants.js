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
  // === BEGIN SAMPLE SOLUTION ===
  const response = await fetch(COUNTRIES_DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load countries: ${response.status} ${response.statusText}`);
  }
  const geojson = await response.json();
  return geojson.features || [];
  // === END SAMPLE SOLUTION ===
}

/**
 * Loads and extracts the Global Power Plant Database CSV from a zip archive.
 *
 * @returns {Promise<Array<object>>} An array of parsed power plant objects.
 */
async function loadPowerPlants() {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  const response = await fetch(POWER_PLANTS_ZIP_DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load power plants zip: ${response.status} ${response.statusText}`);
  }
  const blob = await response.blob();
  const zipReader = new ZipReader(new BlobReader(blob));
  const entries = await zipReader.getEntries();
  const csvEntry = entries.find((entry) => entry.filename.endsWith('.csv'));

  if (!csvEntry) {
    await zipReader.close();
    throw new Error('No CSV file found in power plants zip archive');
  }

  const text = await csvEntry.getData(new TextWriter());
  await zipReader.close();

  const parsed = d3.csvParse(text, (row) => ({
    name: row.name,
    country: row.country,
    country_long: row.country_long,
    capacity_mw: +row.capacity_mw || 0,
    latitude: +row.latitude,
    longitude: +row.longitude,
    primary_fuel: row.primary_fuel,
  }));

  return parsed.filter((plant) => !isNaN(plant.latitude) && !isNaN(plant.longitude));
  // === END SAMPLE SOLUTION ===
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
  // === BEGIN SAMPLE SOLUTION ===
  const countryBoxes = countries.map((country) => ({
    country,
    bbox: turf.bbox(country),
    id: country.properties.sov_a3 || country.properties.adm0_a3 || country.properties.name,
  }));

  for (const plant of powerPlants) {
    const pt = turf.point([plant.longitude, plant.latitude]);

    const match = countryBoxes.find(({ country, bbox }) => {
      if (
        plant.longitude < bbox[0]
        || plant.latitude < bbox[1]
        || plant.longitude > bbox[2]
        || plant.latitude > bbox[3]
      ) {
        return false;
      }
      return turf.booleanPointInPolygon(pt, country);
    });

    if (match) {
      plant.country_id = match.id;
    }
  }

  return powerPlants;
  // === END SAMPLE SOLUTION ===
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
  // === BEGIN SAMPLE SOLUTION ===
  const { fuel = 'all', minCapacity = 0 } = filters;

  return powerPlants.filter((plant) => {
    const matchesCapacity = plant.capacity_mw >= minCapacity;
    const matchesFuel = fuel === 'all' || plant.primary_fuel?.toLowerCase() === fuel.toLowerCase();

    return matchesCapacity && matchesFuel;
  });
  // === END SAMPLE SOLUTION ===
}

/**
 * Aggregates filtered power plants by country_id using Array.prototype.reduce().
 *
 * @param {Array<object>} filteredPlants Array of filtered power plant objects.
 * @returns {Record<string, { count: number, capacity: number }>} Aggregated stats keyed by country_id.
 */
function aggregatePlantsByCountry(filteredPlants) {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  return filteredPlants.reduce((acc, plant) => {
    const id = plant.country_id;
    if (!id) return acc;

    if (!acc[id]) {
      acc[id] = { count: 0, capacity: 0 };
    }
    acc[id].count += 1;
    acc[id].capacity += plant.capacity_mw;

    return acc;
  }, {});
  // === END SAMPLE SOLUTION ===
}

export {
  loadCountries,
  loadPowerPlants,
  joinPlantsToCountries,
  filterPowerPlants,
  aggregatePlantsByCountry,
};
