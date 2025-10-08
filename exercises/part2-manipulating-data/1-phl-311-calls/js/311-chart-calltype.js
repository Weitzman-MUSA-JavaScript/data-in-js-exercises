/**
 * Module for creating and managing the call type bar chart
 */

import { Chart } from "chart.js/auto";

let callTypeChart = null;
let currentCallTypeFilter = null;

/**
 * Aggregate calls data by service type (using Array.reduce() or _.groupBy())
 * @param {Array} calls - Array of call objects
 * @returns {Object} Object with service types as keys and counts as values
 */
function aggregateCallsByType(calls) {
  // ... Your code here ...

  // === BEGIN SAMPLE SOLUTION ===
  return calls.reduce((acc, call) => {
    const serviceType = call.service_name || 'Unknown';
    acc[serviceType] = (acc[serviceType] || 0) + 1;
    return acc;
  }, {});
  // === END SAMPLE SOLUTION ===
}

/**
 * Initialize and render the call type bar chart
 * @param {Array} calls - Array of call objects
 * @param {Function} onFilterChange - Callback function when filter changes
 */
function initTypeChart(calls, onFilterChange) {
  const canvas = document.getElementById('calltype-chart');

  // Aggregate the data
  const typeData = aggregateCallsByType(calls);
  const labels = Object.keys(typeData);
  const data = Object.values(typeData);

  // Destroy existing chart if it exists
  if (callTypeChart) {
    callTypeChart.destroy();
  }

  // Create the bar chart
  callTypeChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Number of Calls',
        data: data,
        backgroundColor: labels.map(label => 
          label === currentCallTypeFilter ? '#ff6b6b' : '#4ecdc4'
        ),
        borderColor: '#2c3e50',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            title: (context) => context[0].label,
            label: (context) => `${context.parsed.y} calls`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        }
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const elementIndex = elements[0].index;
          const clickedType = labels[elementIndex];
          
          // Toggle filter
          if (currentCallTypeFilter === clickedType) {
            // Remove filter
            currentCallTypeFilter = null;
            onFilterChange(null, 'calltype');
          } else {
            // Apply filter
            currentCallTypeFilter = clickedType;
            onFilterChange(clickedType, 'calltype');
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
  if (callTypeChart) {
    const labels = callTypeChart.data.labels;
    callTypeChart.data.datasets[0].backgroundColor = labels.map(label => 
      label === currentCallTypeFilter ? '#ff6b6b' : '#4ecdc4'
    );
    callTypeChart.update();
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
  getCurrentTypeFilter
};
