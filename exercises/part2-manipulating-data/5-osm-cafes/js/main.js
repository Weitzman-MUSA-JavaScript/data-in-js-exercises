/**

INSTRUCTIONS
============

In this exercise, you will practice retrieving data in a non-standard format from
the internet and transforming it into standard GeoJSON using array methods
(specifically `map`).

You will query OpenStreetMap's Overpass API for cafes in Rome, Italy, transform
the resulting OSM nodes into a GeoJSON FeatureCollection, and display them on an
interactive Leaflet map.

You will implement the core data functions in `js/cafes.js` and map rendering in
`js/cafes-map.js`:

1. `fetchCafes` (in `js/cafes.js`):
   Use `fetch` to query the OpenStreetMap Overpass API for all nodes tagged with
   `amenity=cafe` in the bounding box of central Rome:
     - South: 41.85, West: 12.43, North: 41.95, East: 12.55

   Consult the Overpass API documentation and test your query:
     - Overpass QL Guide: https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL
     - Overpass Turbo: https://overpass-turbo.eu/
     - Overpass API endpoint: https://overpass-api.de/api/interpreter

   Parse and return the array of OSM elements from the JSON response.

2. `transformToGeoJSON` (in `js/cafes.js`):
   The Overpass API returns a custom JSON format with an array of `elements`,
   each with `id`, `lat`, `lon`, and `tags`.

   Use `Array.prototype.map()` to transform this array of OSM nodes into a valid
   GeoJSON FeatureCollection object. Each element should become a GeoJSON Feature
   with:
     - `type: 'Feature'`
     - `geometry`: a Point geometry with `coordinates: [element.lon, element.lat]`
     - `properties`: an object containing the node's `tags` (and `id`)

3. `updateCafesOnMap` (in `js/cafes-map.js`):
   Clear existing layers and add the GeoJSON FeatureCollection to the map using
   Leaflet's `L.geoJSON()`. Render each cafe as a circle marker with a popup
   displaying its name and address.

*/

import { fetchCafes, transformToGeoJSON } from './cafes.js';
import { initMap, updateCafesOnMap } from './cafes-map.js';

let map;

/**
 * Updates the cafe count display in the sidebar.
 *
 * @param {number} count Total number of cafes loaded.
 */
function updateCount(count) {
  const countSpan = document.getElementById('cafe-count');
  if (countSpan) {
    countSpan.textContent = count;
  }
}

/**
 * Initializes the cafe map application.
 */
async function initApp() {
  try {
    map = initMap({ el: '#map' });

    const body = document.querySelector('body');
    body.classList.add('loading');

    let elements, geojson;
    try {
      elements = await fetchCafes();
      geojson = transformToGeoJSON(elements);
    } finally {
      body.classList.remove('loading');
    }

    updateCount(geojson?.features?.length || 0);
    updateCafesOnMap(map, geojson);
  } catch (error) {
    console.error('Failed to load cafes:', error);
  }
}

document.addEventListener('DOMContentLoaded', initApp);
