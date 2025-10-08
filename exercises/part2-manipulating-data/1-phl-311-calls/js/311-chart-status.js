/**
 * Module for creating and managing the status pie chart
 */

import bb, { pie } from 'billboard.js';

let statusChart = null;
let currentStatusFilter = null;

/**
 * Aggregate calls data by status (using Array.reduce() or _.groupBy())
 * @param {Array} calls - Array of call objects
 * @returns {Object} Object with status as keys and counts as values
 */
function aggregateCallsByStatus(calls) {
  // ... Your code here ...

  // === BEGIN SAMPLE SOLUTION ===
  return calls.reduce((acc, call) => {
    const status = call.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  // === END SAMPLE SOLUTION ===
}

/**
 * Initialize and render the status pie chart
 * @param {string|HTMLElement} el - The CSS selector or DOM element for the container element of the chart
 * @param {Array} calls - Array of call objects
 * @param {Function} [onFilterChange] - Callback function when filter changes; receives custom event with detail containing the filter { type, value }.
 * @returns {HTMLElement} The container element for the chart
 */
function initStatusChart(el, calls, onFilterChange = null) {
  const container = typeof el === 'string' ? document.querySelector(el) : el;

  // Aggregate the data
  const statusData = aggregateCallsByStatus(calls);
  const labels = Object.keys(statusData);
  const columns = Object.entries(statusData);

  // Define colors for each status
  const baseColors = {
    'Open': '#990000',
    'Closed': '#2e7d32',
    'In Progress': '#d97706',
    'Assigned': '#011f5b',
    'Unknown': '#6c757d',
  };

  const colors = {};
  for (const label of labels) {
    colors[label] = baseColors[label] || '#6c757d';
  }

  // Destroy existing chart if it exists
  if (statusChart) {
    statusChart.destroy();
  }

  // Create the pie chart using Billboard.js
  statusChart = bb.generate({
    bindto: container,
    data: {
      columns: columns,
      type: pie(),
      colors: colors,
      onclick: (d) => {
        const clickedStatus = d.name || d.id;

        // Toggle filter
        if (currentStatusFilter === clickedStatus) {
          currentStatusFilter = null;
          const event = new CustomEvent('filterChange', { detail: { type: 'status', value: null } });
          container.dispatchEvent(event);
        } else {
          currentStatusFilter = clickedStatus;
          const event = new CustomEvent('filterChange', { detail: { type: 'status', value: clickedStatus } });
          container.dispatchEvent(event);
        }

        updateChartColors();
      },
    },
    tooltip: {
      format: {
        value: (value, ratio) => `${value} calls (${(ratio * 100).toFixed(1)}%)`,
      },
    },
    legend: {
      position: 'bottom',
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
    container.addEventListener('filterChange', onFilterChange, signal);
  }

  return container;
}

/**
 * Update chart colors to highlight selected filter
 */
function updateChartColors() {
  if (statusChart) {
    statusChart.flush();
  }
}

/**
 * Clear the current filter
 */
function clearStatusFilter() {
  currentStatusFilter = null;
  updateChartColors();
}

/**
 * Get the current filter
 * @returns {string|null} Current filter value or null
 */
function getCurrentStatusFilter() {
  return currentStatusFilter;
}

export {
  initStatusChart,
  clearStatusFilter,
  getCurrentStatusFilter,
};
