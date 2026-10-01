import 'leaflet';

/* global L */

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
 * Updates the map's legend control to display appropriate threshold intervals.
 *
 * @param {object} legendControl Leaflet control instance.
 * @param {string} metric 'count' or 'capacity'
 */
function updateLegend(legendControl, metric = 'count') {
  if (!legendControl || !legendControl.container) return;

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

  legendControl.container.innerHTML = `<h4>${title}</h4>${labels.join('')}`;
}

/**
 * Initializes the Leaflet map and base layers.
 *
 * @param {object} options Configuration options including target element ID.
 * @returns {object} The map instance and helper controllers.
 */
function initMap(options = {}) {
  const { el = '#map' } = options;
  const container = typeof el === 'string' ? document.querySelector(el) : el;

  const map = L.map(container, {
    center: [20, 0],
    zoom: 2,
    minZoom: 1,
    maxZoom: 10,
    zoomSnap: 0,
    worldCopyJump: true,
  });

  // This map uses no base tiles; this allows us to focus on the country
  // polygons themselves.

  let geojsonLayer = null;
  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend');
    legend.container = div;
    updateLegend(legend, 'count');
    return div;
  };
  legend.addTo(map);

  return {
    map,
    setCountries(countriesFeatures, onEachFeatureCallback) {
      if (geojsonLayer) {
        map.removeLayer(geojsonLayer);
      }

      geojsonLayer = L.geoJSON(countriesFeatures, {
        style: () => ({
          fillColor: '#f0f0f0',
          weight: 1,
          opacity: 1,
          color: '#888',
          fillOpacity: 0.2,
        }),
        onEachFeature: onEachFeatureCallback,
      }).addTo(map);

      map.fitBounds(geojsonLayer.getBounds());

      return geojsonLayer;
    },
    updateChoropleth(countryStats = {}, metric = 'count') {
      if (!geojsonLayer) return;

      geojsonLayer.eachLayer((layer) => {
        const props = layer.feature?.properties || {};
        const countryId = props.sov_a3 || props.adm0_a3 || props.name;
        const stats = countryStats[countryId] || { count: 0, capacity: 0 };
        const value = stats[metric] || 0;

        layer.setStyle({
          fillColor: getColor(value, metric),
          fillOpacity: value > 0 ? 0.75 : 0.15,
          weight: 1,
          color: '#555',
        });

        const countryName = props.name || props.admin || 'Unknown Country';
        const formattedCapacity = Math.round(stats.capacity).toLocaleString();

        layer.bindPopup(`
          <strong>${countryName}</strong><br>
          Power Plants: <strong>${stats.count}</strong><br>
          Total Capacity: <strong>${formattedCapacity} MW</strong>
        `);
      });

      updateLegend(legend, metric);
    },
  };
}

export { initMap };
