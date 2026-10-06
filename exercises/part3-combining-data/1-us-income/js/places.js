import * as d3 from 'd3';

/**
 * Shifts coordinates in the Eastern Hemisphere to the Western Hemisphere by
 * subtracting 360 from the longitude if it is positive.
 *
 * @param {Array} coordinates - Array of [longitude, latitude, ...z] or nested arrays of such coordinates.
 * @returns {Array} Shifted coordinates with longitudes in the Western Hemisphere.
 */
function shiftEasternCoordinates(coordinates) {
  if (coordinates.every((coord) => Array.isArray(coord))) {
    return coordinates.map(shiftEasternCoordinates);
  }

  const [lng, lat, ...z] = coordinates;

  if (lng > 0) {
    return [lng - 360, lat, ...z];
  } else {
    return coordinates;
  }
}

/**
 * Fetches and parses a JSON/GeoJSON resource from a URL or file path.
 *
 * @param {string} url - The URL or local path to fetch.
 * @returns {Promise<object>} Parsed JSON object.
 */
async function fetchPlaceGeojson(url) {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to load ${url}: ${resp.status} ${resp.statusText}`);
  }
  const geojson = await resp.json();

  // Shift coordinates in the Eastern Hemisphere to the Western Hemisphere
  for (const feature of geojson.features) {
    feature.geometry.coordinates = shiftEasternCoordinates(feature.geometry.coordinates);
  }

  return geojson;
}

/**
 * Fetches the simplified US counties GeoJSON file.
 *
 * @returns {Promise<object>} FeatureCollection of US counties.
 */
async function fetchCountiesGeoJSON() {
  return fetchPlaceGeojson('data/us_counties_simplified.geojson');
}

/**
 * Fetches the simplified US states GeoJSON file.
 *
 * @returns {Promise<object>} FeatureCollection of US states.
 */
async function fetchStatesGeoJSON() {
  return fetchPlaceGeojson('data/us_states_simplified.geojson');
}

/**
 * Fetches the simplified census tracts GeoJSON file for a specific state.
 *
 * @param {string} stateFips - Two-digit FIPS code of the state (e.g., "42").
 * @returns {Promise<object>} FeatureCollection of census tracts.
 */
async function fetchStateTractsGeoJSON(stateFips) {
  const fips = String(stateFips).padStart(2, '0');
  return fetchPlaceGeojson(`data/state_${fips}_tracts_simplified.geojson`);
}

/**
 * Extracts 2-digit state FIPS code from a GEOIDFQ string.
 *
 * @param {string} geoidfq - e.g. "0400000US36" or "0500000US42001".
 * @returns {string} 2-digit state FIPS code.
 */
function getStateFipsFromGeoidfq(geoidfq) {
  const match = (geoidfq || '').match(/US(\d{2})/);
  return match ? match[1] : '';
}

/**
 * Extracts 5-digit county GEOID from a GEOIDFQ string.
 *
 * @param {string} geoidfq - e.g. "0500000US42001" or "1400000US42001030101".
 * @returns {string} 5-digit state+county GEOID.
 */
function getCountyGeoidFromGeoidfq(geoidfq) {
  const match = (geoidfq || '').match(/US(\d{5})/);
  return match ? match[1] : '';
}

/**
 * Computes the range of income values (minimum and maximum) from an array of GeoJSON features.
 *
 * @param {Array<object>} features - Array of GeoJSON features.
 * @returns {[number, number]} Array containing the minimum and maximum income values.
 */
function getIncomeRange(features) {
  // Filter out null incomes, just in case.
  const nonNullIncomes = features
    .map((feature) => feature.properties?.income)
    .filter((income) => !!income || income === 0);
  return d3.extent(nonNullIncomes);
}

export {
  fetchStatesGeoJSON,
  fetchCountiesGeoJSON,
  fetchStateTractsGeoJSON,
  getStateFipsFromGeoidfq,
  getCountyGeoidFromGeoidfq,
  getIncomeRange,
};
