import {
  showApiKeyDialog,
  updateApiKeyDisplay,
  getApiKey,
  getCorsProxyKey,
} from './openaq-key.js';

/*

INSTRUCTIONS
============

1.  Update the getAirQualityData function to get the latest PM2.5 measurements
    for a location using the OpenAQ API (Version 3) and the `fetch` function.
    Because the OpenAQ API does not allow direct browser requests with custom headers,
    you will need to route the request through a CORS proxy (corsproxy.io):
      `https://corsproxy.io/?key=${corsproxykey}&url=${encodeURIComponent(targetUrl)}`

    And pass your OpenAQ API key via the `X-API-Key` header:
      fetch(proxyUrl, { headers: { 'X-API-Key': apiKey } })

    For example, you can query measurements for a specific PM2.5 sensor ID (e.g., London Marylebone Road: 246):
      `https://api.openaq.org/v3/sensors/${sensor_id}/measurements?limit=100`

2.  Update the plotAirQualityData function to process the fetched measurements into
    two column arrays for Billboard.js:
    - An array for timestamps starting with 'x':
        ['x', timestamp1, timestamp2, ...]
    - An array for PM2.5 values starting with 'pm25':
        ['pm25', value1, value2, ...]

    Then load these columns into the chart using:
      chart.load({
        columns: [
          // ['x', ...],
          // ['pm25', ...]
        ]
      });

*/

/* globals bb */

/**
 * Creates a Billboard.js chart for air quality data.
 * @param {string} elementId The DOM ID where the chart will live
 * @returns {object} The Billboard chart instance
 */
function initChart(elementId) {
  return bb.generate({
    bindto: `#${elementId}`,
    data: {
      x: 'x',
      columns: [],
    },
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          format: '%Y-%m-%d %H:%M',
        },
      },
      y: {
        label: 'PM 2.5 (µg/m³)',
      },
    },
  });
}

/**
 * Fetches air quality measurements from the OpenAQ API via the CORS proxy.
 * @param {string} corsproxykey The corsproxy.io API key
 * @param {string} apiKey The OpenAQ API key
 * @returns {Promise<object>} The air quality data
 */
async function getAirQualityData(corsproxykey, apiKey) {
  // ... Your code here ...
}

/**
 * Processes air quality data and updates the Billboard.js chart.
 * @param {object} chart The Billboard chart instance
 */
async function plotAirQualityData(chart) {
  const apiKey = getApiKey();
  const corsproxykey = getCorsProxyKey();
  const aqData = await getAirQualityData(corsproxykey, apiKey);

  // ... Your code here ...
}

/**
 * Indicates that the data loading process has started by showing the loading
 * overlay.
 */
function indicateStartLoading() {
  const container = document.querySelector('.visualization-container');
  if (container) {
    container.classList.add('loading');
  }
}

/**
 * Indicates that the data loading process has ended by hiding the loading
 * overlay.
 */
function indicateEndLoading() {
  const container = document.querySelector('.visualization-container');
  if (container) {
    container.classList.remove('loading');
  }
}

// Set up the API Keys
if (!getApiKey() || !getCorsProxyKey()) {
  showApiKeyDialog();
}

updateApiKeyDisplay();

// Set up the chart and its data
window.aqChart = initChart('aqi-chart');
try {
  indicateStartLoading();
  await plotAirQualityData(window.aqChart);
} finally {
  indicateEndLoading();
}

const openaqDialogForm = document.querySelector('#openaqkey-dialog form');
if (openaqDialogForm) {
  openaqDialogForm.addEventListener('submit', async () => {
    try {
      indicateStartLoading();
      await plotAirQualityData(window.aqChart);
    } finally {
      indicateEndLoading();
    }
  });
}
