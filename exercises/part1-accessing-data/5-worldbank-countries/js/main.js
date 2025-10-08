/*

INSTRUCTIONS
============

1.  Update the getCountriesData function to fetch country data from the World 
    Bank API. Use the base URL: http://api.worldbank.org/v2/country?format=json
    For a specific region, use: http://api.worldbank.org/v2/region/{REGION_CODE}/country?format=json
    where {REGION_CODE} is one of: EAS, ECS, LCN, MEA, NAC, SAS, SSF

2.  The World Bank API returns paginated results. The first element of the 
    response contains metadata including pagination info (page, per_page, total).
    The second element contains the actual data array. You'll need to access 
    both parts of the response.

3.  Add pagination support by including a ?page= query parameter to load 
    additional pages of results.

4.  Optional: Add error handling for API failures and loading states.

*/

import { htmlToElement } from './html-utils.js';

// Get references to DOM elements
const regionSelect = document.getElementById('region-select');
const loadButton = document.getElementById('load-countries');
const loadingElement = document.getElementById('loading');
const dataInfoElement = document.getElementById('data-info');
const errorMessageElement = document.getElementById('error-message');
const countryCountElement = document.getElementById('country-count');
const countriesListElement = document.getElementById('countries-list');
const loadMoreElement = document.getElementById('load-more');

// Pagination state
let currentPage = 1;
let totalPages = 1;
let currentRegion = '';
let isLoading = false;
let shownCountries = 0;

/**
 * Data representing information gleaned from a page of countries
 * @typedef {Object} CountriesPageInfo
 * @property {Array<Object>} countries - The list of countries on the current page
 * @property {number} page - The current page number
 * @property {number} totalPages - The total number of pages
 * @property {number} perPage - The number of countries per page
 * @property {number} total - The total number of countries
 */

/**
 * Fetches country data from the World Bank API with pagination support
 * @param {string} regionCode - The region code (optional, if empty gets all countries)
 * @param {number} page - The page number to fetch (default: 1)
 * @returns {Promise<CountriesPageInfo>} Object containing countries array and pagination metadata
 */
async function getCountriesData(regionCode = '', page = 1) {
  // ABOUT THE API:
  //
  // The World Bank Indicators API, like many APIs, uses "pagination" to limit
  // the amount of data returned in a single request. With pagination, a single
  // request will return a subset of the total data along with metadata that
  // describes the pagination state, such as the current page number, total
  // number of pages, and total number of records. This allows clients to
  // request data in manageable chunks rather than retrieving the entire dataset
  // at once, which can be a lot to download on the client's end, and can take a
  // long time to generate on the server's end. As a trade off for more
  // manageable requests, clients need to make multiple requests to get all the
  // data if there are many pages. This is a common pattern in APIs to improve
  // performance and user experience.
  //
  // You will need to include the `page=...` query parameter to request specific
  // pages of results. The API returns 50 records per page by default.
  //
  // The API will give you back an array of two elements. The first element is
  // an object containing metadata about the request, including pagination info.
  // The second element is an array of the actual country data objects. Take a
  // look at https://api.worldbank.org/v2/country/all?format=json in your
  // browser to see an example of the response format.
  //
  // RETURN VALUE:
  //
  // From this function, you should return a new object with the following
  // structure:
  //
  // {
  //   countries: [ ... ],  // Array of country objects from the API
  //   page: 1,             // Current page number
  //   perPage: 50,         // Number of countries per page
  //   total: 300,          // Total number of countries
  //   totalPages: 6        // Total number of pages
  // }

  // ... Your code here ...

  // === BEGIN SAMPLE SOLUTION ===
  let url;
  if (regionCode) {
    url = `https://api.worldbank.org/v2/region/${regionCode}/country?format=json&page=${page}`;
  } else {
    url = `https://api.worldbank.org/v2/country?format=json&page=${page}`;
  }

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  
  // World Bank API returns [metadata, data]
  const metadata = data[0] || {};
  const countries = data[1] || [];
  
  return {
    countries,
    page: metadata.page || 1,
    perPage: metadata.per_page || 50,
    total: metadata.total || 0,
    totalPages: metadata.pages || 1,
  };
  // === END SAMPLE SOLUTION ===
}

/**
 * Creates a list item element for a country using template literals
 * @param {Object} country - The country data object
 * @returns {HTMLElement} The created list item element
 */
function createCountryListItem(country) {
  // ... Your code here ...

  // === BEGIN SAMPLE SOLUTION ===
  const countryName = country.name || 'Unknown Country';
  const countryCode = country.iso2Code || '';
  const capitalCity = country.capitalCity || '';
  
  const html = `
    <li>
      <div class="country-name">
        ${countryName}
        ${countryCode ? `<span class="country-code">(${countryCode})</span>` : ''}
      </div>
      ${capitalCity ? `<div class="country-capital">Capital: ${capitalCity}</div>` : ''}
    </li>
  `;
  
  return htmlToElement(html);
  // === END SAMPLE SOLUTION ===
}

/**
 * Display the countries data in the list
 * @param {Array} countries - Array of country objects
 * @param {boolean} append - Whether to append to existing list or replace it
 */
function displayCountries(countries, append = false) {
  // Filter out non-country entities (like regions, aggregates)
  const actualCountries = countries.filter(country => 
    country.region && 
    country.region.id !== 'NA' && 
    country.incomeLevel && 
    country.incomeLevel.id !== 'NA'
  );
  
  // Clear the existing list if not appending
  if (!append) {
    countriesListElement.innerHTML = '';
    shownCountries = 0;
  }
  
  // Create and append list items for each country
  for (const country of actualCountries) {
    const listItem = createCountryListItem(country);
    countriesListElement.appendChild(listItem);
  }

  // Update the count
  shownCountries += actualCountries.length;
  countryCountElement.textContent = shownCountries;
}

/**
 * Show loading state
 * @param {boolean} isInitialLoad - Whether this is the initial load or loading more
 */
function showLoading(isInitialLoad = true) {
  isLoading = true;
  if (isInitialLoad) {
    loadingElement.classList.remove('hidden');
    dataInfoElement.classList.add('hidden');
    errorMessageElement.classList.add('hidden');
    loadButton.disabled = true;
  } else {
    loadMoreElement.classList.remove('hidden');
  }
}

/**
 * Hide loading state and show data info
 */
function hideLoading() {
  isLoading = false;
  loadingElement.classList.add('hidden');
  loadMoreElement.classList.add('hidden');
  dataInfoElement.classList.remove('hidden');
  loadButton.disabled = false;
}

/**
 * Show error message
 */
function showError() {
  isLoading = false;
  loadingElement.classList.add('hidden');
  loadMoreElement.classList.add('hidden');
  dataInfoElement.classList.add('hidden');
  errorMessageElement.classList.remove('hidden');
  loadButton.disabled = false;
}

/**
 * Load and display countries for the selected region
 * @param {boolean} isNewRegion - Whether this is a new region selection or loading more pages
 */
async function loadCountries(isNewRegion = true) {
  try {
    const selectedRegion = regionSelect.value;
    
    // Reset pagination state for new region
    if (isNewRegion) {
      currentPage = 0;
      currentRegion = selectedRegion;
      showLoading(true);
      console.log('Loading countries for region:', selectedRegion || 'All Regions');
    } else {
      // Loading more pages
      if (currentPage >= totalPages || isLoading) {
        return; // No more pages or already loading
      }
      showLoading(false);
      console.log(`Loading page ${currentPage} for region:`, currentRegion || 'All Regions');
    }
    
    const result = await getCountriesData(currentRegion, currentPage + 1);
    
    // Update pagination state
    currentPage = result.page;
    totalPages = result.totalPages;
    
    // Display countries (append if loading more pages)
    displayCountries(result.countries, !isNewRegion);
    hideLoading();
    
  } catch (error) {
    console.error('Error loading countries:', error);
    showError();
  }
}

/**
 * Load more countries (next page)
 */
async function loadMoreCountries() {
  await loadCountries(false);
}

/**
 * Check if user has scrolled to bottom and load more countries
 */
function handleScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  
  // Check if user is near bottom (within 100px) and there are more pages
  if (scrollTop + clientHeight >= scrollHeight - 100 && 
      currentPage < totalPages && 
      !isLoading) {
    loadMoreCountries();
  }
}

// Add event listeners
loadButton.addEventListener('click', () => loadCountries(true));

// Load countries when the region selection changes
regionSelect.addEventListener('change', () => loadCountries(true));

// Add infinite scroll functionality
window.addEventListener('scroll', handleScroll);

// Load all countries on page load
document.addEventListener('DOMContentLoaded', () => loadCountries(true));
