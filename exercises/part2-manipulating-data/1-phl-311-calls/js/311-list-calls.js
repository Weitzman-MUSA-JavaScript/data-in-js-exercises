import { htmlToElement } from "./html-utils.js";

// Get references to DOM elements
const loadingElement = document.getElementById("loading");
const dataInfoElement = document.getElementById("data-info");
const callCountElement = document.getElementById("call-count");
const callsListElement = document.getElementById("calls-list");

// ... Paste copied code here ...

// === BEGIN SAMPLE SOLUTION ===
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
// === END SAMPLE SOLUTION ===

export {
  displayCalls,
};