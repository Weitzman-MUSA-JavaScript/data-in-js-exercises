/**
 * Module for fetching and transforming OpenStreetMap data.
 */

// Bounding box for central Rome: South 41.85, West 12.43, North 41.95, East 12.55
// Overpass QL documentation: https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL
// Overpass Turbo (test your query here): https://overpass-turbo.eu/
// Overpass API interpreter endpoint: https://overpass-api.de/api/interpreter

/**
 * Fetches cafe nodes in Rome from the OpenStreetMap Overpass API.
 *
 * @returns {Promise<Array<Object>>} Array of OSM element objects.
 */
async function fetchCafes() {
  // ... Your code here ...
}

/**
 * Transforms an array of OSM node elements into a GeoJSON FeatureCollection.
 *
 * @param {Array<Object>} osmElements Array of OSM node objects from the Overpass API.
 * @returns {Object} A GeoJSON FeatureCollection object.
 */
function transformToGeoJSON(osmElements) {
  // ... Your code here ...
}

export {
  fetchCafes,
  transformToGeoJSON,
};
