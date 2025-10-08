/**

INSTRUCTIONS
============

This exercise builds on the phl-311-calls exercise from Part 1 to demonstrate:
- Summarizing/aggregating data with Array.reduce()
- Creating interactive charts that cross-filter other page components
- Using Chart.js for data visualization

The dashboard framework is already set up with interactive charts and cross-filtering.
Your task is to implement the key data manipulation functions:

0.  From your code in the exercises/part1-accessing-data/3-phl-311-calls directory,
    copy the following functions from main.js into the js/311-list-calls.js module
    (replacing the existing sample solution code):
    - createCallListItem
    - formatDate  
    - getStatusClass
    These functions are already imported and used by the dashboard.

1.  In this main.js file, implement the fetchCallsData function to fetch CSV data
    from the Philadelphia 311 API using D3. Copy the implementation from your
    exercises/part1-accessing-data/3-phl-311-calls exercise.

2.  In this main.js file, implement the filterCalls function to filter the array
    of calls based on the current filter state. Use Array.prototype.filter() to
    return only calls that match the active filters (service type and/or status).

3.  In the 311-chart-calltype.js module, implement the aggregateCallsByType 
    function using Array.prototype.reduce() to count the number of calls for 
    each service type.

4.  In the 311-chart-status.js module, implement the aggregateCallsByStatus 
    function using Array.prototype.reduce() to count the number of calls for 
    each status.

The interactive charts and cross-filtering logic are already implemented. Once you
complete these functions, you'll have a fully working dashboard where:
- Clicking chart elements filters the data
- The list and other chart update automatically
- The "Clear Filter" button resets all filters

*/

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { displayCalls } from "./311-list-calls.js";
import { initTypeChart, clearTypeFilter, getCurrentTypeFilter } from "./311-chart-calltype.js";
import { initStatusChart, clearStatusFilter, getCurrentStatusFilter } from "./311-chart-status.js";

// Global state
let allCalls = [];
let filteredCalls = [];

// DOM elements
const filterInfoElement = document.getElementById('filter-info');
const filterDescriptionElement = document.getElementById('filter-description');
const clearFilterButton = document.getElementById('clear-filter');

/**
 * Fetch and parse the CSV data from the API using D3
 * @param {number} callsToFetch Number of calls to fetch (default: 200)
 * @param {number} callsToSkip Number of calls to skip (default: 0)
 * @returns {Array} Array of call objects
 */
async function fetchCallsData(callsToFetch = 200, callsToSkip = 0) {
  const API_URL = `https://phl.carto.com/api/v2/sql?`
    + `filename=public_cases_fc&format=csv&skipfields=cartodb_id,the_geom,the_geom_webmercator&`
    + `q=SELECT * FROM public_cases_fc `
    + `ORDER BY requested_datetime DESC `
    + `LIMIT ${callsToFetch} OFFSET ${callsToSkip}`;
  
  // In this exercise, we want to be able to load more data on demand, so we
  // parameterize the number of 311 calls to fetch and skip. That way, we can
  // fetch the first 200 calls, then the next 200, and so on.

  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  try {
    // Use D3 to fetch and parse the CSV data
    const data = await d3.csv(API_URL);
    return data;
  } catch (error) {
    console.error("Error fetching calls data:", error);
    alert("Error loading data. Please try again later.");
    throw error;
  }
  // === END SAMPLE SOLUTION ===
}

/**
 * Filter calls based on current filter state
 * @param {Array} calls - Array of all calls
 * @returns {Array} Filtered array of calls
 */
function filterCalls(calls) {
  const typeFilter = getCurrentTypeFilter();
  const statusFilter = getCurrentStatusFilter();

  // ... Your code here ...

  // === BEGIN SAMPLE SOLUTION ===
  let filtered = calls;

  if (typeFilter) {
    filtered = filtered.filter(call => call.service_name === typeFilter);
  }

  if (statusFilter) {
    filtered = filtered.filter(call => call.status === statusFilter);
  }

  return filtered;
  // === END SAMPLE SOLUTION ===
}

/**
 * Update the filter info display
 */
function updateFilterInfo() {
  const typeFilter = getCurrentTypeFilter();
  const statusFilter = getCurrentStatusFilter();
  
  if (typeFilter || statusFilter) {
    let description = [];
    if (typeFilter) description.push(`Service Type: ${typeFilter}`);
    if (statusFilter) description.push(`Status: ${statusFilter}`);
    
    filterDescriptionElement.textContent = description.join(', ');
    filterInfoElement.classList.remove('hidden');
  } else {
    filterInfoElement.classList.add('hidden');
  }
}

/**
 * Handle filter changes from charts
 * @param {string|null} filterValue - The filter value or null to clear
 * @param {string} filterType - Type of filter ('calltype' or 'status')
 */
function handleFilterChange(filterValue, filterType) {
  console.log(`Filter changed: ${filterType} = ${filterValue}`);
  
  // Update filtered data
  filteredCalls = filterCalls(allCalls);
  
  // Update displays
  displayCalls(filteredCalls);
  updateFilterInfo();
  
  // Update both charts with filtered data
  // This allows for cross-filtering between charts
  initTypeChart(filteredCalls, handleFilterChange);
  initStatusChart(filteredCalls, handleFilterChange);
}

/**
 * Clear all filters
 */
function clearAllFilters() {
  clearTypeFilter();
  clearStatusFilter();
  
  filteredCalls = allCalls;
  displayCalls(filteredCalls);
  updateFilterInfo();
  
  // Reinitialize charts with all data
  initTypeChart(filteredCalls, handleFilterChange);
  initStatusChart(filteredCalls, handleFilterChange);
}

/**
 * Initialize the dashboard with data
 * @param {Array} calls - Array of call objects
 */
function initializeDashboard(calls) {
  allCalls = calls;
  filteredCalls = calls;
  
  // Initialize all components
  displayCalls(filteredCalls);
  initTypeChart(filteredCalls, handleFilterChange);
  initStatusChart(filteredCalls, handleFilterChange);
  updateFilterInfo();
  
  // Add clear filter button event listener
  clearFilterButton.addEventListener('click', clearAllFilters);
}

/**
 * Fetch and display 311 calls data using D3
 */
async function load311CallsData() {
  try {
    console.log("Fetching 311 calls data with D3...");
    const calls = await fetchCallsData();
    console.log(`Loaded ${calls.length} calls`);
    
    initializeDashboard(calls);
  } catch (error) {
    console.error("Error loading 311 calls data:", error);

    // Show error message to user
    alert("Error loading data. Please try again later.");
  }
}

// Load the data when the page loads
document.addEventListener("DOMContentLoaded", load311CallsData);
