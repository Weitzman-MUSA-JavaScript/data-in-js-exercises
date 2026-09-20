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
 * Offsets a given date by a specified number of days..
 * @param {Date} dt The original date.
 * @param {number} days The number of days to offset. Positive moves forward, negative moves backward.
 * @returns {Date} The new date after applying the offset.
 */
function offsetDays(dt, days) {
  const copyDT = new Date(dt);
  copyDT.setDate(copyDT.getDate() + days);
  return copyDT;
}

/**
 * Checks if a given date is between two other dates.
 * @param {Date} dt  The date to check.
 * @param {Date} early The start of the date range.
 * @param {Date} late The end of the date range.
 * @returns {boolean} True if the date is between early and late, false otherwise.
 */
function isBetween(dt, early, late) {
  const copyDT = new Date(dt);
  return copyDT >= early && copyDT < late;
}

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

  // === BEGIN SAMPLE SOLUTION ===
  const sensorId = 246; // London - Westminster Marylebone Road (PM2.5 sensor)
  const dateFrom = offsetDays(new Date(), -180);
  const targetUrl = `https://api.openaq.org/v3/sensors/${sensorId}/measurements/daily?datetime_from=${dateFrom.toISOString()}&limit=100`;
  const url = `https://corsproxy.io/?key=${corsproxykey}&url=${encodeURIComponent(targetUrl)}`;
  const response = await fetch(url, {
    headers: {
      'X-API-Key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`OpenAQ API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
  // === END SAMPLE SOLUTION ===
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

  // === BEGIN SAMPLE SOLUTION ===
  // Measurements in OpenAQ V3 are newest first; reverse so chart displays chronologically
  const results = aqData.results ? [...aqData.results].reverse() : [];

  const timestamps = ['x', ...results.map((m) => m.period.datetimeFrom.local)];
  const pm25Values = ['PM 2.5', ...results.map((m) => m.value)];
  const pm25RunningAverage = ['PM 2.5 (30-day avg)', ...results.map((refM, _, arr, window = 30) => {
    const midpoint = new Date(refM.period.datetimeFrom.utc);
    const earliest = offsetDays(midpoint, -Math.floor(window / 2));
    const latest = offsetDays(midpoint, Math.ceil(window / 2));
    const values = arr.filter((m) => isBetween(m.period.datetimeFrom.utc, earliest, latest));
    const sum = values.reduce((acc, y) => acc + y.value, 0);
    return sum / values.length;
  })];

  // Update the chart with the following options:
  // {
  //   line: {
  //     point: ['PM 2.5'],
  //   },
  //   axis: {
  //     x: {
  //       tick: {
  //         count: 4,
  //       },
  //       forceAsSingle: true,
  //     },
  //   },
  //   tooltip: {
  //     format: {
  //       title: (x) => (new Date(x)).toDateString(),
  //       value: (y) => y.toFixed(2),
  //     },
  //   },
  // }
  chart.config('line.point', ['PM 2.5']);
  chart.config('axis.x.tick.count', 4);
  chart.config('axis.x.forceAsSingle', true);
  chart.config('tooltip.format.title', (x) => (new Date(x)).toDateString());
  chart.config('tooltip.format.value', (y) => y.toFixed(2));

  // Load the data into the chart
  chart.load({
    columns: [
      timestamps,
      pm25Values,
      pm25RunningAverage,
    ],
    types: {
      'PM 2.5': 'scatter',
      'PM 2.5 (30-day avg)': 'spline', // for ESM specify as: spline()
    },
  });
  // === END SAMPLE SOLUTION ===
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
