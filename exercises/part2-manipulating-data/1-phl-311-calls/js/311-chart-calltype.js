/**
 * Module for creating and managing the call type bar chart
 */

import bb, { bar } from 'billboard.js';

let callTypeChart = null;
let currentCallTypeFilter = null;

/**
 * Aggregate calls data by service type (using Array.reduce() or _.groupBy())
 * @param {Array} calls - Array of call objects
 * @returns {Object} Object with service types as keys and counts as values
 */
function aggregateCallsByType(calls) {
  // ... Your code here ...
}

/**
 * Initialize and render the call type bar chart
 * @param {string|HTMLElement} el - The CSS selector or DOM element for the container element of the chart
 * @param {Array} calls - Array of call objects
 * @param {Function|null} onFilterChange - Callback function when filter changes
 * @returns {HTMLElement} The container element for the chart
 */
function initTypeChart(el, calls, onFilterChange = null) {
  const container = typeof el === 'string' ? document.querySelector(el) : el;

  // Aggregate the data
  const typeData = aggregateCallsByType(calls);
  const labels = Object.keys(typeData);
  const data = Object.values(typeData);

  // Destroy existing chart if it exists
  if (callTypeChart) {
    callTypeChart.destroy();
  }

  // Create the bar chart
  callTypeChart = bb.generate({
    bindto: container,
    data: {
      x: 'Call Types',
      columns: [
        ['Call Types', ...labels],
        ['Calls', ...data],
      ],
      type: bar(),
      colors: Object.fromEntries(labels.map((label) =>
        [label, label === currentCallTypeFilter ? '#990000' : '#011f5b'],
      )),
      onclick: (d) => {
        const clickedType = labels[d.index];

        // Toggle filter
        if (currentCallTypeFilter === clickedType) {
          currentCallTypeFilter = null;
          const event = new CustomEvent('filterChange', { detail: { type: 'calltype', value: null } });
          container.dispatchEvent(event);
        } else {
          currentCallTypeFilter = clickedType;
          const event = new CustomEvent('filterChange', { detail: { type: 'calltype', value: clickedType } });
          container.dispatchEvent(event);
        }

        updateChartColors();
      },
    },
    axis: {
      x: {
        type: 'category',
        tick: {
          rotate: -60,
          multiline: false,
          culling: false,
        },
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      format: {
        title: (x) => labels[x] || x,
        value: (value) => `${value} calls`,
      },
    },
  });

  // We may initialize this chart multiple times, so we use an AbortController
  // to clear any previous event listeners. For why this is necessary, see:
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#memory_issues
  if (!container.abortController) {
    container.abortController = new AbortController();
  }

  container.abortController.abort();
  const signal = container.abortController.signal;

  // Add event listener for filter changes
  if (typeof onFilterChange === 'function') {
    container.addEventListener('filterChange', onFilterChange, { signal });
  }

  return container;
}

/**
 * Update chart colors to highlight selected filter
 */
function updateChartColors() {
  if (callTypeChart) {
    callTypeChart.flush();
  }
}

/**
 * Clear the current filter
 */
function clearTypeFilter() {
  currentCallTypeFilter = null;
  updateChartColors();
}

/**
 * Get the current filter
 * @returns {string|null} Current filter value or null
 */
function getCurrentTypeFilter() {
  return currentCallTypeFilter;
}

export {
  initTypeChart,
  clearTypeFilter,
  getCurrentTypeFilter,
};
