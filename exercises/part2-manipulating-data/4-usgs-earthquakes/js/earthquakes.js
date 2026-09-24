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
 * @returns {{ depths: Array<number>, magnitudes: Array<number>, counts: Array<number>, untransformedMinDepth: number, depthBinSize: number, magBinSize: number }}
 */
function binEarthquakes(earthquakes, magBinCount = 10, depthBinCount = 10) {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  const magRange = d3.extent(earthquakes, (eq) => eq.properties.mag);
  const [minMag, maxMag] = magRange;
  const magBinSize = (maxMag - minMag) / magBinCount;

  const untransformedMinDepth = d3.min(earthquakes, (eq) => eq.geometry.coordinates[2]);
  const depthRange = d3.extent(earthquakes, (eq) => Math.log(eq.geometry.coordinates[2] - untransformedMinDepth + 1));
  const [minDepth, maxDepth] = depthRange;
  const depthBinSize = (maxDepth - minDepth) / depthBinCount;

  // Create a magBinCount x depthBinCount two-dimensional array of bins to hold
  // earthquakes.
  const earthquakeBins = [];
  for (let m = 0; m < magBinCount; m++) {
    earthquakeBins[m] = [];
    for (let d = 0; d < depthBinCount; d++) {
      earthquakeBins[m][d] = [];
    }
  }

  // Loop through each earthquake and assign it to the appropriate bin.
  for (const eq of earthquakes) {
    const mag = eq.properties.mag;
    const depth = Math.log(eq.geometry.coordinates[2] - untransformedMinDepth + 1);

    // Determine which bin the earthquake belongs to. The bin indices are
    // calculated based on the magnitude and depth of the earthquake. The bins
    // are generally inclusive of their lower bounds, but exclusive of their
    // upper bounds, so we have to treat the maximum magnitude and depth as
    // special cases to ensure they fall into the last bin.
    const m = mag === maxMag
      ? magBinCount - 1
      : Math.floor((mag - minMag) / magBinSize);
    const d = depth === maxDepth
      ? depthBinCount - 1
      : Math.floor((depth - minDepth) / depthBinSize);

    earthquakeBins[m][d].push(eq);
  }

  const magThresholds = [];
  for (let m = 0; m < magBinCount; m++) {
    magThresholds.push(minMag + m * magBinSize);
  }

  const depthThresholds = [];
  for (let d = 0; d < depthBinCount; d++) {
    depthThresholds.push(minDepth + d * depthBinSize);
  }

  const magnitudes = [];
  const depths = [];
  const counts = [];

  for (let m = 0; m < magBinCount; m++) {
    for (let d = 0; d < depthBinCount; d++) {
      const count = earthquakeBins[m][d].length;
      if (count) {
        magnitudes.push(magThresholds[m]);
        depths.push(depthThresholds[d]);
        counts.push(count);
      }
    }
  }

  return { depths, magnitudes, counts, untransformedMinDepth, depthBinSize, magBinSize };
  // === END SAMPLE SOLUTION ===
}

export {
  fetchEarthquakes,
  filterEarthquakes,
  binEarthquakes,
};
