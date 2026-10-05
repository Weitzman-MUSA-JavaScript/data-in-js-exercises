/**
 * Module for fetching Census GeoJSON and demographic data from the US Census API.
 */

const CENSUS_API_BASE = 'https://api.census.gov/data/2023/acs/acs5';

/**
 * Fetches and parses a JSON/GeoJSON resource from a URL or file path.
 *
 * @param {string} url - The URL or local path to fetch.
 * @returns {Promise<object>} Parsed JSON object.
 */
async function fetchJson(url) {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to load ${url}: ${resp.status} ${resp.statusText}`);
  }
  return resp.json();
}

/**
 * Fetches the simplified US counties GeoJSON file.
 *
 * @returns {Promise<object>} FeatureCollection of US counties.
 */
async function fetchCountiesGeoJSON() {
  return fetchJson('data/us_counties_simplified.geojson');
}

/**
 * Fetches the simplified US states GeoJSON file.
 *
 * @returns {Promise<object>} FeatureCollection of US states.
 */
async function fetchStatesGeoJSON() {
  return fetchJson('data/us_states_simplified.geojson');
}

/**
 * Fetches the simplified census tracts GeoJSON file for a specific state.
 *
 * @param {string} stateFips - Two-digit FIPS code of the state (e.g., "42").
 * @returns {Promise<object>} FeatureCollection of census tracts.
 */
async function fetchStateTractsGeoJSON(stateFips) {
  const fips = String(stateFips).padStart(2, '0');
  return fetchJson(`data/state_${fips}_tracts_simplified.geojson`);
}

/**
 * Fetches median household income (B06011_001E) for all US counties from the Census API.
 *
 * @param {string} apiKey - US Census API key.
 * @returns {Promise<Array<Array<string>>>} 2D array of Census API rows.
 */
async function fetchCountyIncomeData(apiKey) {
  // ... Your code here ...
}

/**
 * Fetches median household income (B06011_001E) for all census tracts in a state from the Census API.
 *
 * @param {string} stateFips - Two-digit state FIPS code (e.g., "42").
 * @param {string} apiKey - US Census API key.
 * @returns {Promise<Array<Array<string>>>} 2D array of Census API rows.
 */
async function fetchTractIncomeData(stateFips, apiKey) {
  // ... Your code here ...
}

export {
  fetchJson,
  fetchCountiesGeoJSON,
  fetchStatesGeoJSON,
  fetchStateTractsGeoJSON,
  fetchCountyIncomeData,
  fetchTractIncomeData,
};
