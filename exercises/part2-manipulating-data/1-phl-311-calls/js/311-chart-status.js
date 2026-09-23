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
}

/**
 * Initialize and render the status pie chart
 * @param {Array} calls - Array of call objects
 * @param {Function} onFilterChange - Callback function when filter changes
 */
function initStatusChart(calls, onFilterChange) {
  const container = document.getElementById('status-chart');

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
          onFilterChange(null, 'status');
        } else {
          currentStatusFilter = clickedStatus;
          onFilterChange(clickedStatus, 'status');
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
