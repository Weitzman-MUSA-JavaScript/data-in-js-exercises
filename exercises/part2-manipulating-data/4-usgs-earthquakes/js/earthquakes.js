/**
 * Module for fetching, filtering, and manipulating USGS Earthquakes data.
 */

// D3 may come in handy for things like binning or scaling.
import * as d3 from 'd3';

// URL for the USGS all earthquakes in the past 7 days GeoJSON feed
const DATA_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

/**
 * Fetches the USGS earthquake GeoJSON feed for the past 7 days.
 *
 * @returns {Promise<Array<Object>>} Array of GeoJSON feature objects.
 */
async function fetchEarthquakes() {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch earthquake data: ${response.status} ${response.statusText}`);
  }
  const geojson = await response.json();
  return geojson.features || [];
  // === END SAMPLE SOLUTION ===
}

/**
 * Filters an array of earthquake features based on magnitude and depth constraints.
 *
 * @param {Array<Object>} earthquakes Array of GeoJSON feature objects.
 * @param {Object} filters Filter parameters.
 * @param {number} filters.minMag Minimum magnitude (inclusive).
 * @param {number} filters.minDepth Minimum depth in km (inclusive).
 * @param {number} filters.maxDepth Maximum depth in km (inclusive).
 * @returns {Array<Object>} Filtered array of earthquake features.
 */
function filterEarthquakes(earthquakes, filters = {}) {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  const { minMag = 0, minDepth = 0, maxDepth = Infinity } = filters;

  return earthquakes.filter((feature) => {
    const mag = feature.properties?.mag ?? 0;
    const depth = feature.geometry?.coordinates?.[2] ?? 0;

    return mag >= minMag && depth >= minDepth && depth <= maxDepth;
  });
  // === END SAMPLE SOLUTION ===
}

/**
 * Bins earthquakes by magnitude and depth to prepare data for a heatmap scatter plot.
 * Groups features into discrete bins and calculates the earthquake count in each bin.
 *
 * @param {Array<Object>} earthquakes Array of GeoJSON feature objects.
 * @param {number} [magBinCount=10] Number of magnitude bins.
 * @param {number} [depthBinCount=10] Number of depth bins in km.
 * @returns {{ depths: Array<number>, magnitudes: Array<number>, counts: Array<number>, maxCount: number }}
 */
function binEarthquakes(earthquakes, magBinCount = 10, depthBinCount = 10) {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  if (!earthquakes || earthquakes.length === 0) {
    return { depths: [], magnitudes: [], counts: [], maxCount: 0 };
  }

  const [minMag, maxMag] = d3.extent(earthquakes, (d) => d.properties.mag);
  const [minDepth, maxDepth] = d3.extent(earthquakes, (d) => d.geometry.coordinates[2]);

  const magStep = (maxMag - minMag) / magBinCount || 1;
  const depthStep = (maxDepth - minDepth) / depthBinCount || 1;

  const bins = {};
  for (const eq of earthquakes) {
    const mag = eq.properties.mag;
    const depth = eq.geometry.coordinates[2];

    const magBin = Math.floor(mag / magStep) * magStep;
    const depthBin = Math.floor(depth / depthStep) * depthStep;
    const key = `${depthBin}:${magBin}`;

    if (!bins[key]) {
      bins[key] = { depth: depthBin, mag: magBin, count: 0 };
    }
    bins[key].count += 1;
  }

  const binnedValues = Object.values(bins);
  const depths = binnedValues.map((b) => b.depth);
  const magnitudes = binnedValues.map((b) => b.mag);
  const counts = binnedValues.map((b) => b.count);
  const maxCount = counts.reduce((max, count) => Math.max(max, count), 0);

  return { depths, magnitudes, counts, maxCount };
  // === END SAMPLE SOLUTION ===
}

export {
  fetchEarthquakes,
  filterEarthquakes,
  binEarthquakes,
};
