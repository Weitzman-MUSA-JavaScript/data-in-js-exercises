/**
 * Module for fetching, filtering, and manipulating Philadelphia Park Sites data.
 */

// URL for the Philadelphia Parks and Recreation (PPR) Properties dataset
// GeoJSON file. See https://opendataphilly.org/datasets/ppr-properties/.
const DATA_URL = 'https://opendata.arcgis.com/datasets/d52445160ab14380a673e5849203eb64_0.geojson';

/**
 * Fetches the Philadelphia Parks and Recreation (PPR) properties GeoJSON dataset.
 *
 * @returns {Promise<Array<Object>>} Array of GeoJSON feature objects.
 */
async function fetchParkSites() {
  // ... Your code here ...
}

/**
 * Filters an array of park sites based on a search query string matching
 * either the site_name or park_name.
 *
 * @param {Array<Object>} sites Array of GeoJSON feature objects.
 * @param {string} searchString Query text to filter against.
 * @returns {Array<Object>} Filtered array of GeoJSON feature objects.
 */
function filterParkSites(sites, searchString) {
  // ... Your code here ...
}

/**
 * Groups park site features by their park_name property using Array.prototype.reduce().
 *
 * @param {Array<Object>} sites Array of GeoJSON feature objects.
 * @returns {Object.<string, Array<Object>>} Object mapping park names to arrays of site features.
 */
function groupByParkName(sites) {
  // ... Your code here ...
}

/**
 * Calculates the total acreage for an array of selected park sites.
 *
 * Avoids double-counting: If a site is nested within a park (nested === 'Y')
 * and the parent park itself (nested === 'N' with the same park_name) is also
 * selected, the nested site's acreage is omitted from the sum.
 *
 * @param {Array<Object>} selectedSites Array of selected GeoJSON feature objects.
 * @returns {number} Total acreage summed across the selected sites.
 */
function calcTotalAcreage(selectedSites) {
  // ... Your code here ...
}

export {
  fetchParkSites,
  filterParkSites,
  groupByParkName,
  calcTotalAcreage,
};
