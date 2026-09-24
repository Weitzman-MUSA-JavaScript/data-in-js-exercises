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
   * @param {number} binnedData.untransformedMinDepth Minimum transformed depth value before log transformation.
   * @param {number} binnedData.depthBinSize Depth bin size in log-transformed space.
   * @param {number} binnedData.magBinSize Magnitude bin size.
   */
  function update(binnedData) {
    currentCounts = binnedData.counts || [];
    const [minCount, maxCount] = d3.extent(currentCounts);
    const range = maxCount - minCount;

    // === BEGIN SAMPLE SOLUTION ===
    // Since I added a log transformation for the depth values, I will point out
    // below where I modified the chart configuration to handle the
    // log-transformed depth values correctly.

    // On the next three lines, I extract a few values that I'm returning from
    // the binning function so that I can (1) untranform depth values, and (2)
    // provide the value rages in the chart tooltips.
    const untransformedMinDepth = binnedData.untransformedMinDepth;
    const depthBinSize = binnedData.depthBinSize;
    const magBinSize = binnedData.magBinSize;

    const chartData = {
      xs: {
        magnitude: 'depth',
      },
      columns: [
        // Because we can't have positive and negative values on a log scale, we
        // will only exponentiate the log-transformed values when rendering the
        // chart, but avoid adding the untransformed minimum depth to keep the
        // values as positive. We will adjust the tick labels and popup labels
        // to show the actual depth values.
        ['depth', ...binnedData.depths.map(Math.exp)],
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
              count: 5,
              rotate: 90,
            },
            // Updated the x-axis configuration to use a log scale for the depth
            // values. The default linear scale would not correctly represent
            // the log-transformed bins correctly.
            type: 'log',
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
            name: (name, ratio, id, index) => '',
          },
        },
      });
    } else {
      chart.load(chartData);
    }

    // Added the following lines to update dynamic chart configuration options,
    // as these may change depending on the current bin sizes, which may change
    // with the filters.

    chart.config('axis.x.tick.format', (x) => {
      // The x values have been exponentiated above, but we need to adjust them
      // to reflect the actual depth range.
      x = x - 1 + untransformedMinDepth;
      return x.toLocaleString(undefined, { maximumSignificantDigits: 1 });
    });

    chart.config('tooltip.format.title', (x) => {
      // Shift the x value to reflect the actual depth range here as well.
      const lower = x - 1 + untransformedMinDepth;
      const upper = Math.exp(Math.log(x) + depthBinSize) - 1 + untransformedMinDepth;
      return `Depth: ${lower.toLocaleString(undefined, { maximumSignificantDigits: 2 })} to ${upper.toLocaleString(undefined, { maximumSignificantDigits: 2 })} km`;
    });

    chart.config('tooltip.format.value', (y, ratio, id, index) => {
      const count = currentCounts[index] || 0;
      const lower = y;
      const upper = y + magBinSize;
      return `Mag ${lower.toLocaleString(undefined, { maximumFractionDigits: 2 })} to ${upper.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${count} quake${count === 1 ? '' : 's'})`;
    });
  }
  // === END SAMPLE SOLUTION ===

  return {
    el: container,
    update,
  };
}

export { initChart };
