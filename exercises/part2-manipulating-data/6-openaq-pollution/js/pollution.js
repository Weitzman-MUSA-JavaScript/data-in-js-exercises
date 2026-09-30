/**
 * Module for fetching and manipulating OpenAQ air quality data.
 */

/**
 * Helper to construct the proxied URL for OpenAQ API requests.
 *
 * @param {string} targetUrl The target OpenAQ API URL.
 * @param {string} corsproxykey The corsproxy.io API key.
 * @returns {string} The complete URL routed through the CORS proxy.
 */
function getProxiedUrl(targetUrl, corsproxykey) {
  return `https://corsproxy.io/?key=${corsproxykey}&url=${encodeURIComponent(targetUrl)}`;
}

/**
 * Fetches the list of countries providing PM2.5 data from OpenAQ.
 *
 * @param {string} corsproxykey The corsproxy.io API key.
 * @param {string} apiKey The OpenAQ API key.
 * @returns {Promise<Array<Object>>} Array of country objects.
 */
async function fetchCountries(corsproxykey, apiKey) {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  const targetUrl = 'https://api.openaq.org/v3/countries?parameters_id=2&limit=1000';
  const proxyUrl = getProxiedUrl(targetUrl, corsproxykey);

  const response = await fetch(proxyUrl, {
    headers: { 'X-API-Key': apiKey },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch countries: ${response.status} ${response.statusText}. ${errorText}`);
  }

  const data = await response.json();
  return data.results || [];
  // === END SAMPLE SOLUTION ===
}

/**
 * Fetches all pages of global latest PM2.5 measurements from OpenAQ,
 * invoking an onProgress callback as each page is fetched.
 *
 * @param {string} corsproxykey The corsproxy.io API key.
 * @param {string} apiKey The OpenAQ API key.
 * @param {Function} [onProgress] Callback receiving (currentPage, totalPages).
 * @returns {Promise<Array<Object>>} Array of reading objects.
 */
async function fetchLatestReadings(corsproxykey, apiKey, onProgress) {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  const allReadings = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const targetUrl = `https://api.openaq.org/v3/parameters/2/latest?limit=1000&page=${page}`;
    const proxyUrl = getProxiedUrl(targetUrl, corsproxykey);

    const response = await fetch(proxyUrl, {
      headers: { 'X-API-Key': apiKey },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch latest readings (page ${page}): ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    const results = data.results || [];
    allReadings.push(...results);

    if (page === 1) {
      const found = data.meta?.found || results.length;
      const limit = data.meta?.limit || 1000;
      totalPages = Math.ceil(found / limit) || 1;
    }

    if (typeof onProgress === 'function') {
      onProgress(page, totalPages);
    }

    page += 1;
  }

  return allReadings;
  // === END SAMPLE SOLUTION ===
}

/**
 * Fetches all pages of monitoring station locations for a given country that report PM2.5.
 *
 * @param {string} corsproxykey The corsproxy.io API key.
 * @param {string} apiKey The OpenAQ API key.
 * @param {string} countryCode Two-letter ISO country code.
 * @returns {Promise<Array<Object>>} Array of location objects for the country.
 */
async function fetchLocationsByCountry(corsproxykey, apiKey, countryCode) {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  const allLocations = [];
  let page = 1;

  while (true) {
    const targetUrl = `https://api.openaq.org/v3/locations?iso=${encodeURIComponent(countryCode)}&parameters_id=2&limit=500&page=${page}`;
    const proxyUrl = getProxiedUrl(targetUrl, corsproxykey);

    const response = await fetch(proxyUrl, {
      headers: { 'X-API-Key': apiKey },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch locations for ${countryCode} (page ${page}): ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    const results = data.results || [];
    allLocations.push(...results);

    const limit = data.meta?.limit || 500;
    const found = results.length;

    if (found < limit) {
      break;
    }

    page += 1;
  }

  return allLocations;
  // === END SAMPLE SOLUTION ===
}

/**
 * Filters an array of global readings to only include those belonging to the given country's locations.
 *
 * @param {Array<Object>} readings Array of global reading objects.
 * @param {Array<Object>} locations Array of location objects for a specific country.
 * @returns {Array<Object>} Array of reading objects associated with the country's locations.
 */
function filterReadingsByCountry(readings = [], locations = []) {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  const locationIds = new Set(locations.map((loc) => loc.id));
  return readings.filter((reading) => locationIds.has(reading.locationsId));
  // === END SAMPLE SOLUTION ===
}

/**
 * Finds the reading with the highest PM2.5 value using reduce.
 *
 * @param {Array<Object>} readings Array of reading objects.
 * @returns {Object|null} The reading object with the highest value, or null if none.
 */
function findMostPollutedReading(readings = []) {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  return readings.reduce((highest, current) => {
    if (!highest || (typeof current.value === 'number' && current.value > highest.value)) {
      return current;
    }
    return highest;
  }, null);
  // === END SAMPLE SOLUTION ===
}

export {
  fetchCountries,
  fetchLatestReadings,
  fetchLocationsByCountry,
  filterReadingsByCountry,
  findMostPollutedReading,
};
