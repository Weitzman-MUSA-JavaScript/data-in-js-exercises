/*

INSTRUCTIONS
============

1.  Update the getPollingPlaces function to get the Philadelphia Polling Places
    GeoJSON data from OpenDataPhilly using the `fetch` function, AND COMBINE
    DUPLICATE POLLING PLACES. Keep a list of unique polling places and the
    precincts that correspond to each place. The data is available at
    https://opendataphilly.org/datasets/polling-places/.

2.  Update the initPollingPlaceLayer function to add a popup to each marker
    that shows the name (`placename`), address (`street_address`), and the list
    of precincts that vote at the polling place.

*/

// === BEGIN SAMPLE SOLUTION ===
import _ from 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/+esm';
// === END SAMPLE SOLUTION ===

/**
 * Creates a polling places Leaflet map object.
 * @param {string|HTMLElement} elementOrId The DOM element where the map will live
 * @returns {L.Map} The constructed Leaflet Map
 */
function initPollingPlaceMap(elementOrId) {
  const map = L.map(elementOrId).setView([39.9526, -75.1652], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  return map;
}

/**
 * Fetches the polling place data from OpenDataPhilly AND 
 * AGGREGATES IT BASED ON UNIQUE STREET ADDRESSES.
 * @returns {Promise<GeoJSON.FeatureCollection>} The deduplicated polling place data.
 */
async function getPollingPlaceData() {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  const resp = await fetch('https://phl.carto.com/api/v2/sql?q=SELECT+*+FROM+polling_places&filename=polling_places&format=geojson&skipfields=cartodb_id');
  const data = await resp.json();

  const dedupedData = {
    'type': 'FeatureCollection',
    'features': data.features.reduce((pollingPlaces, precinct) => {
      const address = precinct.properties.street_address;
      let pollingPlace = pollingPlaces.find(pp => pp.properties.street_address == address);

      if (!pollingPlace) {
        pollingPlace = {
          'type': 'Feature',
          'properties': {
            placename: precinct.properties.placename,
            street_address: precinct.properties.street_address,
            zip_code: precinct.properties.zip_code,
            accessibility_code: precinct.properties.accessibiilty_code,
            parking_code: precinct.properties.parking_code,
            coords: [precinct.geometry.coordinates],
            precincts: [{
              ward: precinct.properties.ward,
              division: precinct.properties.division,
              precinct: precinct.properties.precinct,
            }],
          },
          'geometry': { ...precinct.geometry },
        };
        pollingPlaces.push(pollingPlace);
      }

      else {
        pollingPlace.properties.coords.push(precinct.geometry.coordinates);
        pollingPlace.properties.precincts.push({
          ward: precinct.properties.ward,
          division: precinct.properties.division,
          precinct: precinct.properties.precinct,
        });
        pollingPlace.geometry.coordinates = [
          _.sum(pollingPlace.properties.coords.map(c => c[0])) / pollingPlace.properties.coords.length,
          _.sum(pollingPlace.properties.coords.map(c => c[1])) / pollingPlace.properties.coords.length,
        ];
      }
      return pollingPlaces;
    }, []),
  };

  return dedupedData;
  // === END SAMPLE SOLUTION ===
}

/**
 * Creates a Leaflet GeoJSON layer for polling places and adds it to the map.
 * @param {L.Map} map The Leaflet map where the layer will be added.
 * @returns {Promise<L.GeoJSON>} The constructed Leaflet GeoJSON layer.
 */
async function initPollingPlaceLayer(map) {
  const pollingPlaceData = await getPollingPlaceData();

  // Create a custom icon for polling places.
  const icon = L.icon({
    iconUrl: 'img/polling-place-marker.png',
    iconSize: [30, 36],
    iconAnchor: [15, 36],
    popupAnchor: [0, -36],
    shadowUrl: 'img/polling-place-marker-shadow.png',
    shadowSize: [40, 48],
    shadowAnchor: [20, 48],
  });

  // Create a GeoJSON layer with the polling place data. Override the default
  // pointToLayer function to construct markers with the custom icon.
  const layer = L.geoJSON(pollingPlaceData, {
    pointToLayer: function (feature, latlng) {
      return L.marker(latlng, { icon: icon });
    },
    onEachFeature: function (feature, layer) {
      // layer.bindPopup(`... Your code here ...`);
      // === BEGIN SAMPLE SOLUTION ===
      layer.bindPopup(`
        ${feature.properties['placename']}<br>
        ${feature.properties['street_address']}<br>
        Precincts: ${feature.properties['precincts'].map(p => p.precinct).join(', ')}
      `);
      // === END SAMPLE SOLUTION ===
    }
  }).addTo(map);

  return layer;
}

window.pollingPlaceMap = initPollingPlaceMap('map');
window.pollingPlaceLayer = await initPollingPlaceLayer(window.pollingPlaceMap);

