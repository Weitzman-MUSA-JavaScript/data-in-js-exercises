/**

INSTRUCTIONS
============

In this exercise, you will create an interactive choropleth map of median
household income across the United States. You will practice performing an
attribute join between non-spatial data from the US Census Bureau API and
spatial geometries loaded from GeoJSON files.

The application framework is already set up to manage geographic drill-downs
(National -> State -> County) and breadcrumb navigation. Your task is to
implement the key data fetching, joining, and styling functions:

1. `fetchCountyIncomeData` (in `js/income.js`):
   Use `fetch` to retrieve median household income (`B06011_001E`) for all US
   counties from the Census API:
     `https://api.census.gov/data/2023/acs/acs5?get=NAME,B06011_001E&for=county:*&key=${apiKey}`
   Parse and return the JSON array of rows.

2. `fetchTractIncomeData` (in `js/income.js`):
   Use `fetch` to retrieve median household income (`B06011_001E`) for all census
   tracts in a given state from the Census API:
     `https://api.census.gov/data/2023/acs/acs5?get=NAME,B06011_001E&for=tract:*&in=state:${stateFips}&key=${apiKey}`
   Parse and return the JSON array of rows.

3. `createIncomeLookup` (in `js/income.js`):
   Convert the Census API rows array into a JavaScript `Map` where:
   - Key: The geographic ID string (5-digit GEOID `${state}${county}` for counties,
     or 11-digit GEOID `${state}${county}${tract}` for tracts).
   - Value: The median household income as a number.
   Note: Census API uses negative numbers (e.g. -666666666) or null/empty strings
   for suppressed or missing data; convert these to `null`.

4. `joinIncomeData` (in `js/income.js`):
   Perform the attribute join! Iterate over the features of the GeoJSON
   FeatureCollection. Extract the numeric GEOID from each feature's `GEOIDFQ`
   property (e.g., `"0500000US42001"` -> `"42001"`, or `"1400000US42001030101"` ->
   `"42001030101"`), look up the corresponding income value from the `incomeLookup`
   Map, and assign it to `feature.properties.income`. Return the GeoJSON object.

5. `getIncomeColor` (in `js/income-map.js`):
   Return a color string for a given median household income value using D3's color
   interpolation functions (such as `d3.interpolateBlues` or a sequential scale like
   `d3.scaleSequential(d3.interpolateBlues).domain(incomeRange)`) rather than hardcoding
   color thresholds. Return a neutral gray (`#e0e0e0`) if the income value is null, undefined,
   or missing.

Once you have implemented these functions, you will have a fully functioning,
interactive choropleth map where you can explore wealth distribution across the
entire US and click into individual states and counties!

*/

import {
  initMap,
  getFeatureStyle,
  getStateOutlineStyle,
  getCountyOutlineStyle,
} from './income-map.js';

import {
  fetchCountiesGeoJSON,
  fetchStatesGeoJSON,
  fetchStateTractsGeoJSON,
  fetchCountyIncomeData,
  fetchTractIncomeData,
  createIncomeLookup,
  joinIncomeData,
  getIncomeRange,
} from './income.js';

import {
  getCensusApiKey,
  initCensusKey,
  showCensusApiKeyDialog,
} from './census-key.js';

import {
  htmlToElement,
} from './html-utils.js';

/* global L */

// Application State
const app = {
  currentLevel: 'national', // 'national' | 'state' | 'county'
  currentStateFips: null,
  currentStateName: null,
  currentCountyGeoid: null,
  currentCountyName: null,

  // Cache
  countiesGeojson: null,
  statesGeojson: null,
  countyIncomeLookup: null,
  stateTractsGeojson: new Map(),
  stateTractIncomeLookup: new Map(),
};

// UI Elements
const breadcrumbsList = document.getElementById('breadcrumbs');
const loadingOverlay = document.getElementById('loading-overlay');

// Initialize Map
const mapController = initMap();
const { map, dataLayerGroup, outlineLayerGroup } = mapController;

/**
 * Shows or hides the loading overlay spinner.
 *
 * @param {boolean} isLoading - Whether to show the loading overlay.
 */
function setLoading(isLoading) {
  if (!loadingOverlay) return;
  if (isLoading) {
    loadingOverlay.classList.remove('hidden');
  } else {
    loadingOverlay.classList.add('hidden');
  }
}

/**
 * Updates the breadcrumb navigation in the header.
 *
 * @param {Array<{label: string, level?: string}>} items - List of breadcrumb steps.
 */
function updateBreadcrumbs(items) {
  if (!breadcrumbsList) return;
  breadcrumbsList.innerHTML = '';

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const html = isLast
      ? `<li aria-current="page">${item.label}</li>`
      : `<li><a href="#" data-level="${item.level}">${item.label}</a></li>`;

    const li = htmlToElement(html);
    const a = li.querySelector('a');

    if (a) {
      a.addEventListener('click', (evt) => {
        evt.preventDefault();
        handleBreadcrumbClick(item.level);
      });
    }

    breadcrumbsList.appendChild(li);
  });
}

/**
 * Handles navigation clicks on the breadcrumb trail.
 *
 * @param {string} level - Geographic level to return to ('national' | 'state').
 */
function handleBreadcrumbClick(level) {
  if (level === 'national') {
    showNationalView();
  } else if (level === 'state' && app.currentStateFips) {
    showStateView(app.currentStateFips, app.currentStateName);
  }
}

/**
 * Extracts 2-digit state FIPS code from a GEOIDFQ string.
 *
 * @param {string} geoidfq - e.g. "0400000US36" or "0500000US42001".
 * @returns {string} 2-digit state FIPS code.
 */
function getStateFipsFromGeoidfq(geoidfq) {
  const match = (geoidfq || '').match(/US(\d{2})/);
  return match ? match[1] : '';
}

/**
 * Extracts 5-digit county GEOID from a GEOIDFQ string.
 *
 * @param {string} geoidfq - e.g. "0500000US42001" or "1400000US42001030101".
 * @returns {string} 5-digit state+county GEOID.
 */
function getCountyGeoidFromGeoidfq(geoidfq) {
  const match = (geoidfq || '').match(/US(\d{5})/);
  return match ? match[1] : '';
}

/**
 * Finds the state name for a given 2-digit state FIPS code.
 *
 * @param {string} fips - Two-digit state FIPS code.
 * @returns {string} State name or fallback.
 */
function getStateNameByFips(fips) {
  if (!app.statesGeojson) return `State ${fips}`;
  const feat = app.statesGeojson.features.find((f) => getStateFipsFromGeoidfq(f.properties?.GEOIDFQ) === fips);
  return feat?.properties?.NAME || `State ${fips}`;
}

/**
 * Finds the county name for a given 5-digit county GEOID.
 *
 * @param {string} countyGeoid - 5-digit county GEOID.
 * @returns {string} County name or fallback.
 */
function getCountyNameByGeoid(countyGeoid) {
  if (!app.countiesGeojson) return `County ${countyGeoid}`;
  const feat = app.countiesGeojson.features.find((f) => f.properties?.geoid === countyGeoid || f.properties?.GEOIDFQ?.endsWith(countyGeoid));
  return feat?.properties?.NAMELSAD || feat?.properties?.NAME || `County ${countyGeoid}`;
}

/**
 * Formats dollar income values for popups and tooltips.
 *
 * @param {number|null} income - Median household income.
 * @returns {string} Formatted string.
 */
function formatIncome(income) {
  if (income === null || income === undefined || isNaN(income) || income <= 0) {
    return 'No data available';
  }
  return `$${income.toLocaleString()}`;
}

/**
 * Loads and displays the National level view (US counties + state outlines).
 */
async function showNationalView() {
  app.currentLevel = 'national';
  app.currentStateFips = null;
  app.currentStateName = null;
  app.currentCountyGeoid = null;
  app.currentCountyName = null;

  updateBreadcrumbs([{ label: 'United States' }]);

  dataLayerGroup.clearLayers();
  outlineLayerGroup.clearLayers();
  setLoading(true);

  try {
    const apiKey = getCensusApiKey();
    if (!apiKey) {
      setLoading(false);
      showCensusApiKeyDialog();
      return;
    }

    // 1. Fetch geometries if not already cached
    if (!app.countiesGeojson) {
      app.countiesGeojson = await fetchCountiesGeoJSON();
    }
    if (!app.statesGeojson) {
      app.statesGeojson = await fetchStatesGeoJSON();
    }

    // 2. Fetch Census county income data if not already cached
    if (!app.countyIncomeLookup) {
      const rawRows = await fetchCountyIncomeData(apiKey);
      app.countyIncomeLookup = createIncomeLookup(rawRows);
      joinIncomeData(app.countiesGeojson, app.countyIncomeLookup);
    }

    // 3. Render counties choropleth layer
    const incomeRange = getIncomeRange(app.countiesGeojson.features);
    const countiesLayer = L.geoJSON(app.countiesGeojson, {
      style: (feature) => getFeatureStyle(feature, incomeRange),
      onEachFeature: (feature, layer) => {
        const countyName = feature.properties?.NAMELSAD || feature.properties?.NAME || 'County';
        const income = feature.properties?.income;
        const stateFips = getStateFipsFromGeoidfq(feature.properties?.GEOIDFQ);
        const stateName = getStateNameByFips(stateFips);

        layer.bindTooltip(
          `<strong>${countyName}, ${stateName}</strong><br>Median Income: ${formatIncome(income)}`,
          { sticky: true },
        );

        layer.on('click', () => {
          showStateView(stateFips, stateName);
        });
      },
    });
    dataLayerGroup.addLayer(countiesLayer);

    // 4. Render state outlines layer (thick borders)
    const statesLayer = L.geoJSON(app.statesGeojson, {
      style: getStateOutlineStyle,
      interactive: true,
      onEachFeature: (feature, layer) => {
        const stateName = feature.properties?.NAME || 'State';
        const stateFips = getStateFipsFromGeoidfq(feature.properties?.GEOIDFQ);

        layer.on('click', (evt) => {
          L.DomEvent.stopPropagation(evt);
          showStateView(stateFips, stateName);
        });
      },
    });
    outlineLayerGroup.addLayer(statesLayer);

    // Reset map view to national extent
    map.setView([38, -96], 4);
  } catch (error) {
    console.error('Error rendering national view:', error);
    // alert(`Error loading US income data: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

/**
 * Loads and displays the State level view (tracts + county outlines).
 *
 * @param {string} stateFips - 2-digit state FIPS code (e.g., "42").
 * @param {string} [stateName] - State display name.
 */
async function showStateView(stateFips, stateName) {
  app.currentLevel = 'state';
  app.currentStateFips = stateFips;
  app.currentStateName = stateName || getStateNameByFips(stateFips);
  app.currentCountyGeoid = null;
  app.currentCountyName = null;

  updateBreadcrumbs([
    { label: 'United States', level: 'national' },
    { label: app.currentStateName },
  ]);

  dataLayerGroup.clearLayers();
  outlineLayerGroup.clearLayers();
  setLoading(true);

  try {
    const apiKey = getCensusApiKey();
    if (!apiKey) {
      setLoading(false);
      showCensusApiKeyDialog();
      return;
    }

    // 1. Fetch state tracts GeoJSON if not cached
    if (!app.stateTractsGeojson.has(stateFips)) {
      const tractsGeojson = await fetchStateTractsGeoJSON(stateFips);
      app.stateTractsGeojson.set(stateFips, tractsGeojson);
    }
    const tractsGeojson = app.stateTractsGeojson.get(stateFips);

    // 2. Fetch Census tract income data if not cached
    if (!app.stateTractIncomeLookup.has(stateFips)) {
      const rawRows = await fetchTractIncomeData(stateFips, apiKey);
      const lookup = createIncomeLookup(rawRows);
      app.stateTractIncomeLookup.set(stateFips, lookup);
      joinIncomeData(tractsGeojson, lookup);
    }

    // 3. Render tracts choropleth layer
    const incomeRange = getIncomeRange(tractsGeojson.features);
    const tractsLayer = L.geoJSON(tractsGeojson, {
      style: (feature) => getFeatureStyle(feature, incomeRange),
      onEachFeature: (feature, layer) => {
        const tractName = feature.properties?.NAMELSAD || `Tract ${feature.properties?.NAME}`;
        const income = feature.properties?.income;
        const countyGeoid = getCountyGeoidFromGeoidfq(feature.properties?.GEOIDFQ);
        const countyName = getCountyNameByGeoid(countyGeoid);

        layer.bindTooltip(
          `<strong>${tractName}</strong> (${countyName})<br>Median Income: ${formatIncome(income)}`,
          { sticky: true },
        );

        layer.on('click', () => {
          showCountyView(stateFips, app.currentStateName, countyGeoid, countyName);
        });
      },
    });
    dataLayerGroup.addLayer(tractsLayer);

    // 4. Render county outlines within this state
    if (app.countiesGeojson) {
      const stateCounties = {
        type: 'FeatureCollection',
        features: app.countiesGeojson.features.filter(
          (f) => getStateFipsFromGeoidfq(f.properties?.GEOIDFQ) === stateFips,
        ),
      };

      const countyOutlinesLayer = L.geoJSON(stateCounties, {
        style: getCountyOutlineStyle,
        interactive: true,
        onEachFeature: (feature, layer) => {
          const countyGeoid = getCountyGeoidFromGeoidfq(feature.properties?.GEOIDFQ);
          const countyName = feature.properties?.NAMELSAD || feature.properties?.NAME || 'County';

          layer.on('click', (evt) => {
            L.DomEvent.stopPropagation(evt);
            showCountyView(stateFips, app.currentStateName, countyGeoid, countyName);
          });
        },
      });
      outlineLayerGroup.addLayer(countyOutlinesLayer);
    }

    // Zoom map to fit the state tracts
    if (tractsLayer.getBounds().isValid()) {
      map.fitBounds(tractsLayer.getBounds(), { padding: [20, 20] });
    }
  } catch (error) {
    console.error('Error rendering state view:', error);
    alert(`Error loading state data: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

/**
 * Loads and displays the County level view (tracts within the selected county).
 *
 * @param {string} stateFips - 2-digit state FIPS code.
 * @param {string} stateName - State display name.
 * @param {string} countyGeoid - 5-digit county GEOID.
 * @param {string} countyName - County display name.
 */
function showCountyView(stateFips, stateName, countyGeoid, countyName) {
  app.currentLevel = 'county';
  app.currentCountyGeoid = countyGeoid;
  app.currentCountyName = countyName;

  updateBreadcrumbs([
    { label: 'United States', level: 'national' },
    { label: stateName, level: 'state' },
    { label: countyName },
  ]);

  dataLayerGroup.clearLayers();
  outlineLayerGroup.clearLayers();

  const stateTracts = app.stateTractsGeojson.get(stateFips);
  if (!stateTracts) {
    showStateView(stateFips, stateName);
    return;
  }

  // Filter tracts to just this county
  const countyTracts = {
    type: 'FeatureCollection',
    features: stateTracts.features.filter(
      (f) => getCountyGeoidFromGeoidfq(f.properties?.GEOIDFQ) === countyGeoid,
    ),
  };

  // Render county tracts choropleth
  const incomeRange = getIncomeRange(countyTracts.features);
  const countyTractsLayer = L.geoJSON(countyTracts, {
    style: (feature) => getFeatureStyle(feature, incomeRange),
    onEachFeature: (feature, layer) => {
      const tractName = feature.properties?.NAMELSAD || `Tract ${feature.properties?.NAME}`;
      const income = feature.properties?.income;

      layer.bindTooltip(
        `<strong>${tractName}</strong><br>Median Income: ${formatIncome(income)}`,
        { sticky: true },
      );
    },
  });
  dataLayerGroup.addLayer(countyTractsLayer);

  // Render thick boundary for this county
  if (app.countiesGeojson) {
    const singleCounty = {
      type: 'FeatureCollection',
      features: app.countiesGeojson.features.filter(
        (f) => getCountyGeoidFromGeoidfq(f.properties?.GEOIDFQ) === countyGeoid,
      ),
    };

    const singleCountyLayer = L.geoJSON(singleCounty, {
      style: () => ({
        fillColor: 'transparent',
        fillOpacity: 0,
        weight: 3,
        color: '#990000', // Highlight county with UPenn red accent
        opacity: 1,
      }),
      interactive: false,
    });
    outlineLayerGroup.addLayer(singleCountyLayer);
  }

  // Zoom map to fit the county
  if (countyTractsLayer.getBounds().isValid()) {
    map.fitBounds(countyTractsLayer.getBounds(), { padding: [20, 20] });
  }
}

// Initialize API key handlers and initial view
initCensusKey((newKey) => {
  if (newKey) {
    if (app.currentLevel === 'county') {
      showCountyView(app.currentStateFips, app.currentStateName, app.currentCountyGeoid, app.currentCountyName);
    } else if (app.currentLevel === 'state') {
      showStateView(app.currentStateFips, app.currentStateName);
    } else {
      showNationalView();
    }
  }
});

// Load the national view on initial load
showNationalView();

export {
  showNationalView,
  showStateView,
  showCountyView,
};
