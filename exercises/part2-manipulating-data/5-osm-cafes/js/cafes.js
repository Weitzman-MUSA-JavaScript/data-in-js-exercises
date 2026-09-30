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
  // === BEGIN SAMPLE SOLUTION ===
  const query = `
    [out:json];
    node["amenity"="cafe"](41.85,12.43,41.95,12.55);
    out;
  `;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query.trim())}`;
  const response = await fetch(url);
  if (!response.ok) {
    const message = `Failed to fetch cafes from Overpass API: ${response.status} ${response.statusText}`;
    const errorText = await response.text();
    alert(`${message}. Check the terminal for more details, or try reloading the page.`);
    throw new Error(`${message}. Response: ${errorText}`);
  }
  const data = await response.json();
  return data.elements || [];
  // === END SAMPLE SOLUTION ===
}

/**
 * Transforms an array of OSM node elements into a GeoJSON FeatureCollection.
 *
 * @param {Array<Object>} osmElements Array of OSM node objects from the Overpass API.
 * @returns {Object} A GeoJSON FeatureCollection object.
 */
function transformToGeoJSON(osmElements = []) {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  const features = osmElements.map((element) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [element.lon, element.lat],
    },
    properties: {
      id: element.id,
      ...element.tags,
    },
  }));

  return {
    type: 'FeatureCollection',
    features,
  };
  // === END SAMPLE SOLUTION ===
}

export {
  fetchCafes,
  transformToGeoJSON,
};
