/**
 * Module for creating and managing the status pie chart
 */

import { Chart } from "chart.js/auto";

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
 * @param {Array} calls - Array of call objects
 * @param {Function} onFilterChange - Callback function when filter changes
 */
function initStatusChart(calls, onFilterChange) {
  const canvas = document.getElementById('status-chart');

  // Aggregate the data
  const statusData = aggregateCallsByStatus(calls);
  const labels = Object.keys(statusData);
  const data = Object.values(statusData);

  // Define colors for each status
  const baseColors = {
    'Open': '#dc3545',
    'Closed': '#28a745', 
    'In Progress': '#ffc107',
    'Assigned': '#17a2b8',
    'Unknown': '#6c757d'
  };

  // Generate colors array
  const colors = labels.map(label => baseColors[label] || '#6c757d');
  const highlightColors = labels.map(label => 
    label === currentStatusFilter ? '#ff6b6b' : (baseColors[label] || '#6c757d')
  );

  // Destroy existing chart if it exists
  if (statusChart) {
    statusChart.destroy();
  }

  // Create the pie chart
  statusChart = new Chart(canvas, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: highlightColors,
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${context.parsed} calls (${percentage}%)`;
            }
          }
        }
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const elementIndex = elements[0].index;
          const clickedStatus = labels[elementIndex];
          
          // Toggle filter
          if (currentStatusFilter === clickedStatus) {
            // Remove filter
            currentStatusFilter = null;
            onFilterChange(null, 'status');
          } else {
            // Apply filter
            currentStatusFilter = clickedStatus;
            onFilterChange(clickedStatus, 'status');
          }
          
          // Update chart colors
          updateChartColors();
        }
      }
    }
  });
}

/**
 * Update chart colors to highlight selected filter
 */
function updateChartColors() {
  if (statusChart) {
    const labels = statusChart.data.labels;
    const baseColors = {
      'Open': '#dc3545',
      'Closed': '#28a745', 
      'In Progress': '#ffc107',
      'Assigned': '#17a2b8',
      'Unknown': '#6c757d'
    };

    statusChart.data.datasets[0].backgroundColor = labels.map(label => 
      label === currentStatusFilter ? '#ff6b6b' : (baseColors[label] || '#6c757d')
    );
    statusChart.update();
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
  getCurrentStatusFilter
};
