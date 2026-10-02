import maplibregl from 'maplibre-gl';

/**
 * Returns a hex color for a given count or capacity value based on thresholds.
 *
 * @param {number} value The aggregated metric value.
 * @param {string} metric 'count' or 'capacity'
 * @returns {string} Hex color string.
 */
function getColor(value, metric = 'count') {
  if (metric === 'capacity') {
    if (value > 50000) return '#011f5b';
    if (value > 20000) return '#1d428a';
    if (value > 5000) return '#4172c2';
    if (value > 1000) return '#7ea8e6';
    if (value > 0) return '#c4d7f5';
    return '#f0f0f0';
  }

  if (value > 500) return '#011f5b';
  if (value > 200) return '#1d428a';
  if (value > 50) return '#4172c2';
  if (value > 10) return '#7ea8e6';
  if (value > 0) return '#c4d7f5';
  return '#f0f0f0';
}

/**
 * Updates the legend DOM container to display appropriate threshold intervals.
 *
 * @param {HTMLElement} container The legend container element.
 * @param {string} metric 'count' or 'capacity'
 */
function updateLegend(container, metric = 'count') {
  if (!container) return;

  const thresholds = metric === 'capacity'
    ? [0, 1, 1000, 5000, 20000, 50000]
    : [0, 1, 10, 50, 200, 500];

  const labels = [];
  const title = metric === 'capacity' ? 'Total Capacity (MW)' : 'Power Plants';

  for (let i = 0; i < thresholds.length; i++) {
    const from = thresholds[i];
    const to = thresholds[i + 1];
    const color = getColor(from === 0 ? 0 : from + 0.1, metric);

    let labelText;
    if (from === 0) {
      labelText = '0';
    } else if (to) {
      labelText = `${from} &ndash; ${to}`;
    } else {
      labelText = `${from}+`;
    }

    labels.push(
      `<div class="legend-row">
        <i class="legend-color" style="background:${color}"></i>
        <span>${labelText}</span>
      </div>`,
    );
  }

  container.innerHTML = `<h4>${title}</h4>${labels.join('')}`;
}

/**
 * Initializes the MapLibre GL map with a globe projection and base layers.
 *
 * @param {object} options Configuration options including target element selector.
 * @returns {object} The mapComponent API with setCountries and updateChoropleth methods.
 */
function initMap(options = {}) {
  const { el = '#map' } = options;
  const container = typeof el === 'string' ? document.querySelector(el) : el;

  const map = new maplibregl.Map({
    container,
    style: {version: 8, sources: {}, layers: []},
    center: [0, 20],
    zoom: 1.5,
  });

  let countriesCollection = null;
  let currentStats = {};
  let currentMetric = 'count';
  let legendElement = null;

  class LegendControl {
    onAdd(mapInstance) {
      this._map = mapInstance;
      this._container = document.createElement('div');
      this._container.className = 'maplibregl-ctrl legend';
      legendElement = this._container;
      updateLegend(legendElement, currentMetric);
      return this._container;
    }

    onRemove() {
      if (this._container && this._container.parentNode) {
        this._container.parentNode.removeChild(this._container);
      }
      this._map = null;
      legendElement = null;
    }
  }

  map.addControl(new LegendControl(), 'bottom-right');
  map.addControl(new maplibregl.NavigationControl(), 'top-right');

  function setupInteraction() {
    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true,
    });

    map.on('click', 'countries-fill', (e) => {
      if (!e.features || !e.features.length) return;
      const props = e.features[0].properties;
      const countryName = props.name || props.admin || 'Unknown Country';
      const count = Number(props.plant_count || 0).toLocaleString();
      const capacity = Number(props.plant_capacity || 0).toLocaleString();

      popup
        .setLngLat(e.lngLat)
        .setHTML(`
          <strong>${countryName}</strong><br>
          Power Plants: <strong>${count}</strong><br>
          Total Capacity: <strong>${capacity} MW</strong>
        `)
        .addTo(map);
    });

    map.on('mouseenter', 'countries-fill', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'countries-fill', () => {
      map.getCanvas().style.cursor = '';
    });
  }

  function applyChoroplethPaint() {
    if (!map.isStyleLoaded() || !map.getSource('countries') || !countriesCollection) return;

    for (const feature of countriesCollection.features) {
      const props = feature.properties || {};
      const countryId = props.sov_a3 || props.adm0_a3 || props.name;
      const stats = currentStats[countryId] || { count: 0, capacity: 0 };
      props.plant_count = stats.count;
      props.plant_capacity = Math.round(stats.capacity);
      props.metric_value = stats[currentMetric] || 0;
    }

    map.getSource('countries').setData(countriesCollection);

    const thresholds = currentMetric === 'capacity'
      ? [0, 1, 1000, 5000, 20000, 50000]
      : [0, 1, 10, 50, 200, 500];

    const fillColorExpr = [
      'step',
      ['coalesce', ['get', 'metric_value'], 0],
      '#f0f0f0',
      thresholds[1], getColor(thresholds[1] + 0.1, currentMetric),
      thresholds[2], getColor(thresholds[2] + 0.1, currentMetric),
      thresholds[3], getColor(thresholds[3] + 0.1, currentMetric),
      thresholds[4], getColor(thresholds[4] + 0.1, currentMetric),
      thresholds[5], getColor(thresholds[5] + 0.1, currentMetric),
    ];

    map.setPaintProperty('countries-fill', 'fill-color', fillColorExpr);
    map.setPaintProperty('countries-fill', 'fill-opacity', [
      'case',
      ['>', ['coalesce', ['get', 'metric_value'], 0], 0],
      0.75,
      0.15,
    ]);

    updateLegend(legendElement, currentMetric);
  }

  function setupCountriesLayer() {
    if (!map.isStyleLoaded() || !countriesCollection) return;

    if (!map.getSource('countries')) {
      map.addSource('countries', {
        type: 'geojson',
        data: countriesCollection,
      });

      map.addLayer({
        id: 'countries-fill',
        type: 'fill',
        source: 'countries',
        paint: {
          'fill-color': '#f0f0f0',
          'fill-opacity': 0.15,
        },
      });

      map.addLayer({
        id: 'countries-stroke',
        type: 'line',
        source: 'countries',
        paint: {
          'line-color': '#555555',
          'line-width': 1,
        },
      });

      setupInteraction();
    }

    applyChoroplethPaint();
  }

  map.on('style.load', () => {
    map.setProjection({ type: 'globe' });
    map.fitBounds([[-180, -90], [180, 90]]);
    setupCountriesLayer();
  });

  map.on('sourcedata', () => {
    applyChoroplethPaint();
  });

  return {
    map,
    setCountries(countriesFeatures) {
      countriesCollection = {
        type: 'FeatureCollection',
        features: countriesFeatures,
      };

      if (map.isStyleLoaded()) {
        setupCountriesLayer();
      }

      return countriesCollection;
    },
    updateChoropleth(countryStats = {}, metric = 'count') {
      currentStats = countryStats;
      currentMetric = metric;

      if (map.isStyleLoaded()) {
        applyChoroplethPaint();
      }
    },
  };
}

export { initMap };
