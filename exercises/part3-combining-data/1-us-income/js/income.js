/**
 * Module for fetching Census GeoJSON and demographic data from the US Census API.
 */

import * as d3 from 'd3';

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
  // === BEGIN SAMPLE SOLUTION ===
  if (!apiKey) {
    throw new Error('A valid Census API key is required.');
  }

  const url = `${CENSUS_API_BASE}?get=NAME,B06011_001E&for=county:*&key=${apiKey}`;
  return fetchJson(url);
  // === END SAMPLE SOLUTION ===
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
  // === BEGIN SAMPLE SOLUTION ===
  if (!apiKey) {
    throw new Error('A valid Census API key is required.');
  }

  const fips = String(stateFips).padStart(2, '0');
  const url = `${CENSUS_API_BASE}?get=NAME,B06011_001E&for=tract:*&in=state:${fips}&key=${apiKey}`;
  return fetchJson(url);
  // === END SAMPLE SOLUTION ===
}

/**
 * Creates a Map lookup of median income by geography ID from Census API
 * results. Rearranging data in this way allows us to much more quickly and
 * efficiently access income values for specific geographies. Note that we could
 * use a plain JavaScript object instead of a Map, but a Map provides a number
 * of benefits for this type of use:
 *
 * - Objects can only use strings or symbols as keys, whereas Maps can use any
 *   value type as a key.
 * - Maps maintain the insertion order of keys.
 * - Maps allow you to check the number of entries in "constant time" using the
 *   `size` property, unlike plain objects.
 * - Map provides a `groupBy` function for for grouping elements of an array by
 *   key function.
 *
 * In this specific case, either Map or a simple object will do, but in general
 * it's worthwhile to be familiar with the API of Map objects.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#constructor
 *
 * @param {Array<Array<string>>} censusRows - Array of Census API rows (including header).
 * @returns {Map<string, number|null>} Map where key is the GEOID and value is income.
 */
function createIncomeLookup(censusRows) {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  const lookup = new Map();
  if (!Array.isArray(censusRows) || censusRows.length < 2) {
    return lookup;
  }

  // Row 0 is header: ['NAME', 'B06011_001E', 'state', 'county', ...]
  const dataRows = censusRows.slice(1);

  for (const row of dataRows) {
    const rawIncome = row[1];
    const incomeValue = rawIncome !== null && rawIncome !== undefined && rawIncome !== ''
      ? Number(rawIncome)
      : null;

    // Filter out negative sentinel values used by Census for missing/suppressed data
    const validIncome = (incomeValue !== null && incomeValue > 0) ? incomeValue : null;

    // Construct the GEOID depending on whether it's county or tract level
    let geoid = '';
    if (row.length === 4) {
      // County: state + county
      geoid = `${row[2]}${row[3]}`;
    } else if (row.length >= 5) {
      // Tract: state + county + tract
      geoid = `${row[2]}${row[3]}${row[4]}`;
    }

    if (geoid) {
      lookup.set(geoid, validIncome);
    }
  }

  return lookup;
  // === END SAMPLE SOLUTION ===
}

/**
 * Updates a GeoJSON FeatureCollection by joining income data into each
 * feature's properties. Since both datasets have a consistent key available
 * (the GEOID), we can efficiently join the income data to the GeoJSON features
 * without having to resort to more complex spatial joins or lookups.
 *
 * @param {object} geojson - GeoJSON FeatureCollection.
 * @param {Map<string, number|null>} incomeLookup - Map of GEOID to income.
 * @returns {object} The mutated GeoJSON FeatureCollection with `income` added to properties.
 */
function joinIncomeData(geojson, incomeLookup) {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  if (!geojson || !Array.isArray(geojson.features)) {
    return geojson;
  }

  for (const feature of geojson.features) {
    const geoidfq = feature.properties?.GEOIDFQ || '';
    const match = geoidfq.match(/US(\d+)$/);
    const geoid = match ? match[1] : geoidfq;

    const income = incomeLookup.get(geoid) ?? null;
    feature.properties = {
      ...feature.properties,
      income,
      geoid,
    };
  }

  return geojson;
  // === END SAMPLE SOLUTION ===
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

export {
  fetchJson,
  fetchCountiesGeoJSON,
  fetchStatesGeoJSON,
  fetchStateTractsGeoJSON,
  fetchCountyIncomeData,
  fetchTractIncomeData,
  createIncomeLookup,
  joinIncomeData,
  getIncomeRange,
  getStateFipsFromGeoidfq,
  getCountyGeoidFromGeoidfq,
};
