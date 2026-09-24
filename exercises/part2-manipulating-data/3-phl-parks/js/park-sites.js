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
  // === BEGIN SAMPLE SOLUTION ===
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch park sites: ${response.status} ${response.statusText}`);
  }
  const geojson = await response.json();
  return geojson.features || [];
  // === END SAMPLE SOLUTION ===
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
  // === BEGIN SAMPLE SOLUTION ===
  if (!searchString || searchString.trim() === '') {
    return sites;
  }

  const query = searchString.trim().toLowerCase();
  return sites.filter((site) => {
    const siteName = (site.properties?.site_name || '').toLowerCase();
    const parkName = (site.properties?.park_name || '').toLowerCase();
    return siteName.includes(query) || parkName.includes(query);
  });
  // === END SAMPLE SOLUTION ===
}

/**
 * Groups park site features by their park_name property using Array.prototype.reduce().
 *
 * @param {Array<Object>} sites Array of GeoJSON feature objects.
 * @returns {Object.<string, Array<Object>>} Object mapping park names to arrays of site features.
 */
function groupByParkName(sites) {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  return sites.reduce((grouped, site) => {
    const parkName = site.properties?.park_name || 'Other';
    if (!grouped[parkName]) {
      grouped[parkName] = [];
    }
    grouped[parkName].push(site);
    return grouped;
  }, {});
  // === END SAMPLE SOLUTION ===
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
  // === BEGIN SAMPLE SOLUTION ===
  const selectedParentParks = new Set(
    selectedSites
      .filter((site) => site.properties?.nested !== 'Y' && site.properties?.park_name)
      .map((site) => site.properties.park_name),
  );

  return selectedSites.reduce((total, site) => {
    const isNested = site.properties?.nested === 'Y';
    const parentPark = site.properties?.park_name;

    if (isNested && selectedParentParks.has(parentPark)) {
      return total;
    }

    const acreage = Number(site.properties?.acreage) || 0;
    return total + acreage;
  }, 0);
  // === END SAMPLE SOLUTION ===
}

export {
  fetchParkSites,
  filterParkSites,
  groupByParkName,
  calcTotalAcreage,
};
