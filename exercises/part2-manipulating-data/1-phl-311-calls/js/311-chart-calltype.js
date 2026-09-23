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
 * @param {Array} calls - Array of call objects
 * @param {Function} onFilterChange - Callback function when filter changes
 */
function initTypeChart(calls, onFilterChange) {
  const container = document.getElementById('calltype-chart');

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
          onFilterChange(null, 'calltype');
        } else {
          currentCallTypeFilter = clickedType;
          onFilterChange(clickedType, 'calltype');
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
