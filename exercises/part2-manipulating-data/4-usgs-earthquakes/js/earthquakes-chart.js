/**
 * Module for the billboard.js heatmap scatter plot chart.
 */

import bb, { scatter } from 'billboard.js';
import * as d3 from 'd3';

/**
 * Initializes the billboard.js earthquake scatter plot chart.
 *
 * @param {Object} options Configuration options.
 * @param {HTMLElement|string} options.el Element or selector for the chart container.
 * @returns {Object} Chart controller object with an update method.
 */
function initChart(options = {}) {
  const container = typeof options.el === 'string'
    ? document.querySelector(options.el)
    : options.el;

  if (!container) {
    throw new Error('A valid DOM element or selector must be provided for the chart.');
  }

  let chart = null;
  let currentCounts = [];

  /**
   * Updates the chart with binned earthquake data.
   *
   * @param {Object} binnedData Aggregated data object.
   * @param {Array<number>} binnedData.depths Array of binned depth values.
   * @param {Array<number>} binnedData.magnitudes Array of binned magnitude values.
   * @param {Array<number>} binnedData.counts Array of earthquake counts for each bin.
   * @param {number} binnedData.maxCount Maximum count across all bins.
   */
  function update(binnedData = { depths: [], magnitudes: [], counts: [], maxCount: 0 }) {
    currentCounts = binnedData.counts || [];
    const minCount = currentCounts.length > 0
      ? currentCounts.reduce((min, c) => Math.min(min, c), currentCounts[0])
      : 0;
    const maxCount = binnedData.maxCount || 1;
    const range = maxCount - minCount;

    const chartData = {
      xs: {
        magnitude: 'depth',
      },
      columns: [
        ['depth', ...binnedData.depths],
        ['magnitude', ...binnedData.magnitudes],
      ],
      type: scatter(),
      colors: {
        magnitude: (d) => {
          const count = currentCounts[d.index];
          const t = range > 0 ? (count - minCount) / range : 0.5;
          // Use D3 color interpolator for a continuous yellow-to-red heatmap ramp
          return d3.interpolateYlOrRd(0.2 + 0.8 * t);
        },
      },
    };

    if (!chart) {
      chart = bb.generate({
        bindto: container,
        data: chartData,
        point: {
          type: 'rectangle',
          r: 6,
        },
        transition: {
          duration: null,
        },
        axis: {
          x: {
            label: 'Depth (km)',
            tick: {
              fit: false,
            },
          },
          y: {
            label: 'Magnitude',
          },
        },
        legend: {
          show: false,
        },
        tooltip: {
          format: {
            title: (x) => `Depth: ${x.toLocaleString(undefined, { maximumFractionDigits: 2 })} km`,
            value: (value, ratio, id, index) => {
              const count = currentCounts[index] || 1;
              return `Mag ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${count} quake${count === 1 ? '' : 's'})`;
            },
          },
        },
      });
    } else {
      chart.load(chartData);
    }
  }

  return {
    el: container,
    update,
  };
}

export { initChart };
