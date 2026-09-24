/**
 * Module for the earthquake filter controls component.
 */

/**
 * Initializes the earthquake filter controls.
 *
 * @param {Object} options Configuration options.
 * @param {HTMLElement|string} options.el Element or selector for the form container.
 * @param {Function} [options.onFilter] Callback fired when filters change: (evt) => void.
 * @returns {HTMLFormElement} The controls form element (an EventTarget).
 */
function initControls(options = {}) {
  const form = typeof options.el === 'string'
    ? document.querySelector(options.el)
    : options.el;

  if (!form) {
    throw new Error('A valid DOM element or selector must be provided for controls.');
  }

  const magSlider = form.querySelector('#mag-slider');
  const magValue = form.querySelector('#mag-value');
  const minDepthSlider = form.querySelector('#min-depth-slider');
  const minDepthValue = form.querySelector('#min-depth-value');
  const maxDepthSlider = form.querySelector('#max-depth-slider');
  const maxDepthValue = form.querySelector('#max-depth-value');
  const countEl = form.querySelector('#earthquake-count');

  function emitFilter() {
    const minMag = Number(magSlider.value);
    const minDepth = Number(minDepthSlider.value);
    const maxDepth = Number(maxDepthSlider.value);

    const event = new CustomEvent('filter', {
      detail: { minMag, minDepth, maxDepth },
    });
    form.dispatchEvent(event);
  }

  magSlider.addEventListener('input', () => {
    magValue.textContent = Number(magSlider.value).toFixed(1);
    emitFilter();
  });

  minDepthSlider.addEventListener('input', () => {
    const minDepth = Number(minDepthSlider.value);
    const maxDepth = Number(maxDepthSlider.value);

    if (minDepth > maxDepth) {
      maxDepthSlider.value = minDepth;
      maxDepthValue.textContent = minDepth;
    }
    minDepthValue.textContent = minDepth;
    emitFilter();
  });

  maxDepthSlider.addEventListener('input', () => {
    const minDepth = Number(minDepthSlider.value);
    const maxDepth = Number(maxDepthSlider.value);

    if (maxDepth < minDepth) {
      minDepthSlider.value = maxDepth;
      minDepthValue.textContent = maxDepth;
    }
    maxDepthValue.textContent = maxDepth;
    emitFilter();
  });

  if (typeof options.onFilter === 'function') {
    form.addEventListener('filter', options.onFilter);
  }

  form.setCount = (count) => {
    if (countEl) {
      countEl.textContent = Number(count).toLocaleString();
    }
  };

  return form;
}

export { initControls };
