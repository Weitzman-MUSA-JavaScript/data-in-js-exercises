/**

INSTRUCTIONS
============

This exercise demonstrates:
- Using D3 to fetch and parse CSV data from an API
- Creating DOM elements dynamically

1. Update the fetchCallsData function to use D3 to fetch and parse the CSV data
   from the Philadelphia 311 calls API. One of the many useful features of D3 is
   its ability to handle various data formats, including CSV. You can find docs
   at https://d3js.org/d3-fetch#csv. (NOTE: You can use the API_URL defined
   below to get the data.)

2. Update the createCallListItem function to create a list item element for a
   311 call. You can create HTML elements to add to the page using the
   htmlToElement function I've provided in the html-utils.js module. For
   example:

      const title = data.title;
      const status = data.status;
      const statusClass = getStatusClass(status);
      const html = `
        <h2>${title}</h2>
        <p class="call-status ${statusClass}">Status: ${status}</p>
      `;
      const listItem = htmlToElement(html);

   Some tips:
   * Use template literals to create the HTML string; they allow you to do
     things like create multi-line strings and use variables in-line.
   * Include service name, address, requested date, and status with appropriate
     classes (see the `call-...` classes in styles.css)
     - Use the `call-item` class for the list item itself.
     - Use the formatDate function provided to format the requested date
     - Use the getStatusClass function provided to get the appropriate CSS class
       for the status
   * Handle missing data gracefully

   Remember to return the created element.

*/

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { htmlToElement } from "./html-utils.js";

// API endpoint for Philadelphia 311 calls
// This URL gets the 100 most recent calls in CSV format
const API_URL =
  "https://phl.carto.com/api/v2/sql?filename=public_cases_fc&format=csv&skipfields=cartodb_id,the_geom,the_geom_webmercator&q=SELECT * FROM public_cases_fc ORDER BY requested_datetime DESC LIMIT 100";

// Get references to DOM elements
const loadingElement = document.getElementById("loading");
const dataInfoElement = document.getElementById("data-info");
const callCountElement = document.getElementById("call-count");
const callsListElement = document.getElementById("calls-list");

/**
 * Fetch and parse the CSV data from the API using D3
 * @returns {Array} Array of call objects
 */
async function fetchCallsData() {
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
 * Format a date string to be more readable
 * @param {string} dateString - The date string from the API
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
}

/**
 * Get CSS class for status styling
 * @param {string} status - The status from the API
 * @returns {string} CSS class name
 */
function getStatusClass(status) {
  const statusLower = status.toLowerCase();
  if (statusLower.includes("open")) return "status-open";
  if (statusLower.includes("closed")) return "status-closed";
  if (statusLower.includes("progress")) return "status-in-progress";
  return "status-open"; // default
}

/**
 * Create a list item element for a 311 call using template literals
 * @param {Object} call - The call data object
 * @returns {HTMLElement} The created list item element
 */
function createCallListItem(call) {
  // ... Your code here ...
  // === BEGIN SAMPLE SOLUTION ===
  const serviceName = call.service_name || "Service Request";
  const address = call.address || "";
  const requestedDate = call.requested_datetime ? formatDate(call.requested_datetime) : "";
  const status = call.status || "";
  const statusClass = status ? getStatusClass(status) : "status-open";

  const html = `
    <li class="call-item">
      <div>
        <div class="call-service-name">${serviceName}</div>
        ${ address ? `<div class="call-address">📍 ${address}</div>` : "" }
        ${ requestedDate ? `<div class="call-date">Requested: ${requestedDate}</div>` : "" }
        ${ status ? `<span class="call-status ${statusClass}">${status}</span>` : "" }
      </div>
    </li>
    `;

  return htmlToElement(html);
  // === END SAMPLE SOLUTION ===
}

/**
 * Display the 311 calls data in the list
 * @param {Array} calls - Array of call objects
 */
function displayCalls(calls) {
  // Clear the existing list
  callsListElement.innerHTML = "";

  // Update the count
  callCountElement.textContent = calls.length;

  // Create and append list items for each call
  for (const call of calls) {
    const listItem = createCallListItem(call);
    callsListElement.appendChild(listItem);
  }

  // Hide loading, show data info
  loadingElement.classList.add('hidden');
  dataInfoElement.classList.remove('hidden');
}

/**
 * Fetch and display 311 calls data using D3
 */
async function load311CallsData() {
  try {
    console.log("Fetching 311 calls data with D3...");
    const calls = await fetchCallsData();
    displayCalls(calls);
  } catch (error) {
    console.error("Error loading 311 calls data:", error);

    // Show error message to user
    alert("Error loading data. Please try again later.");
  }
}

// Load the data when the page loads
document.addEventListener("DOMContentLoaded", load311CallsData);
