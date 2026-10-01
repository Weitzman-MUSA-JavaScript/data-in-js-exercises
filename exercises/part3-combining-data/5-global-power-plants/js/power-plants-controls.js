/**
 * Initializes the sidebar filter controls and binds event listeners.
 *
 * @param {object} options Configuration object with element selector and onFilter callback.
 * @returns {object} Controller instance with `setCounts` method.
 */
function initControls(options = {}) {
  const { el = '#plant-controls', onFilter = () => {} } = options;
  const form = typeof el === 'string' ? document.querySelector(el) : el;

  const fuelSelect = form.querySelector('#fuel-select');
  const capacitySlider = form.querySelector('#min-capacity-slider');
  const capacityValue = form.querySelector('#capacity-value');
  const metricSelect = form.querySelector('#metric-select');
  const plantCountEl = form.querySelector('#plant-count');
  const countryCountEl = form.querySelector('#country-count');

  function emitCurrentState() {
    onFilter({
      fuel: fuelSelect ? fuelSelect.value : 'all',
      minCapacity: capacitySlider ? Number(capacitySlider.value) : 0,
      metric: metricSelect ? metricSelect.value : 'count',
    });
  }

  if (capacitySlider && capacityValue) {
    capacitySlider.addEventListener('input', () => {
      capacityValue.textContent = Number(capacitySlider.value).toLocaleString();
      emitCurrentState();
    });
  }

  if (fuelSelect) {
    fuelSelect.addEventListener('change', () => {
      emitCurrentState();
    });
  }

  if (metricSelect) {
    metricSelect.addEventListener('change', () => {
      emitCurrentState();
    });
  }

  return {
    setCounts(plantCount, countryCount) {
      if (plantCountEl) {
        plantCountEl.textContent = Number(plantCount).toLocaleString();
      }
      if (countryCountEl) {
        countryCountEl.textContent = Number(countryCount).toLocaleString();
      }
    },
  };
}

export { initControls };
