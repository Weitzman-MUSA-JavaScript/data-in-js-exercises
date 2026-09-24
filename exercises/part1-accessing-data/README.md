# Data in JS Exercises

## Part 1 - Accessing Data

Work with local and global datasets that are immediately visual and cover different parts of the world. This part focuses on the fundamentals: fetching data from a URL and getting it onto the screen. The manipulations are minimal, focusing on loops and basic property access.

> **Note on API Keys**: Some of these exercises require API keys. When they do, there will be places in the interface for you to enter your API keys. You should generally avoid checking these keys into git unless they are explicitly called out as public keys.


### **Local Data Sources**

* **Philadelphia Polling Places ([GeoJSON](https://opendataphilly.org/datasets/polling-places/)):** Locations of polling places in the city.
* **Pennsylvania Historic Markers ([JSON API](https://share.phmc.pa.gov/markers/)):** Locations and descriptions of state historical markers.
* **Philly 311 Calls ([CSV API](https://opendataphilly.org/datasets/311-service-and-information-requests/)):** A classic urban dataset showing citizen service requests. A pre-cleaned and smaller JSON version might be best to start with.

### **Global Data Sources**

* **USGS Earthquake Catalog:** Real-time [GeoJSON feed](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php) of earthquakes worldwide.
* **OpenAQ Platform:** Provides a free [API](https://api.openaq.org/) for global air quality data from monitoring stations.
* **World Bank Indicators API:** A vast [repository](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation) of country-level development data.

### **Exercise Ideas**

1. **Map of Polling Places in Philadelphia:**

    [1-phl-polling-places/](1-phl-polling-places/)

    * **Goal:** Fetch the Polling Places GeoJSON and display each location as a marker on a Leaflet map.
    * **Skills:** Use the `fetch` API to get the GeoJSON. Use a GEOJSON layer in Leaflet (`L.geoJSON()`) to add the data to the map. Access properties like the polling place name from `feature.properties`.
    * **Result:** A map of Philadelphia with a marker for every polling place. Add a popup to each marker that shows the polling place's name when clicked (`L.marker().bindPopup()`).

2. **Map of Historic Markers:**

    [2-pa-historic-markers/](2-pa-historic-markers/)

    Pennsylvania has a process whereby communities can apply to have a historic marker placed at a significant site -- you may have seen these blue and gold signs around, as there are many in Philadelphia (they look like this: ![MOVE Bombing Historic Marker](../../images/pa_historic_marker_move.jpg)). The Pennsylvania Historical and Museum Commission (PHMC) provides a [search interface](https://share.phmc.pa.gov/markers/) for these markers, which is built on top of a JSON API.

    * **Goal:** Fetch the Historic Markers for a given set of filters and display each marker as a circle marker on a Leaflet map.
    * **Skills:** Use the `fetch` API to get the JSON. Use a `for` loop or `forEach` loop on the array of the resulting objects. For each object, access the coordinates from `latitude` and `longitude`, and properties like `markerTitle` and `markerText`.
    * **Result:** A map of Philadelphia with a marker for every historic marker. Add a popup to each marker that shows the marker's title and text when clicked (`L.marker().bindPopup()`).

3. **List of Most Recent 311 Calls:**

    [3-phl-311-calls/](3-phl-311-calls/)

    The City of Philadelphia makes a feed of 311 calls available in CSV format. For example, you can download the 100 most recent calls with this URL: [https://phl.carto.com/api/v2/sql?filename=public_cases_fc&format=csv&skipfields=cartodb_id,the_geom,the_geom_webmercator&q=SELECT * FROM public_cases_fc ORDER BY requested_datetime DESC LIMIT 100](https://phl.carto.com/api/v2/sql?filename=public_cases_fc&format=csv&skipfields=cartodb_id,the_geom,the_geom_webmercator&q=SELECT+*+FROM+public_cases_fc+ORDER+BY+requested_datetime+DESC+LIMIT+100)

    * **Goal:** Fetch a CSV dataset containing an array of the most recent 311 calls. Dynamically create an ordered list in the HTML.
    * **Skills:** `fetch` a CSV file. Use `forEach` or a `for...of` loop to iterate through the array. For each call, use `document.createElement('li')` and `element.textContent` to create a list item, then `appendChild` to add it to an existing `<ol>` in the DOM.
    * **Result:** A simple webpage displaying a numbered list of the most recent 311 calls.

4. **Map of Recent Earthquakes:** 🗺️

    [4-usgs-earthquakes/](4-usgs-earthquakes/)

    The United States Geological Survey (USGS) provides a real-time GeoJSON feed of earthquakes worldwide. You can find the feeds at <https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php>. Note that points in these GeoJSON feeds are comprised of three coordinates: longitude, latitude, and [depth](https://earthquake.usgs.gov/data/comcat/index.php#depth) (in kilometers). The GeoJSON specification allows for [three-dimensional points](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.1), even though many mapping libraries only use the first two dimensions (longitude and latitude).

    * **Goal:** Fetch the GeoJSON feed for all earthquakes in the past 7 days from the USGS and display them on a world map.
    * **Skills:** Use `fetch` to get the real-time GeoJSON feed. Loop through the `features` array. For each earthquake, use its magnitude (`feature.properties.mag`) to determine the radius of a `L.circleMarker`, use its depth (`feature.geometry.coordinates[2]`) to determine the color, and display its `title` (and any other useful information) in a popup.
    * **Result:** A dynamic map showing the planet's recent seismic activity, with larger circles for stronger quakes.

5. **List of Countries by Region:**

    [5-worldbank-countries/](5-worldbank-countries/)

    The World Bank provides [several APIs](https://datahelpdesk.worldbank.org/knowledgebase/articles/889386-developer-information-overview) for accessing country-level data. The [Indicators API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation) in particular allows access to various data points about each country (as measured by the World Bank). One simple API endpoint returns a list of all countries in a specified region. For example, to get all countries in "Latin America & Caribbean", you can use this URL: [http://api.worldbank.org/v2/region/LCN/country?format=json](http://api.worldbank.org/v2/region/LCN/country?format=json), or to get the countries across all regions, you can use [http://api.worldbank.org/v2/country?format=json](http://api.worldbank.org/v2/country?format=json). You can find detailed information about the API call structure at <https://datahelpdesk.worldbank.org/knowledgebase/articles/898581>.

    * **Goal:** Use the World Bank API to fetch all countries in a specific region (e.g., "Latin America & Caribbean") and display their names in an HTML list.
    * **Skills:** `fetch` data from a JSON-based API. The World Bank API returns an array where the first element contains metadata and the second contains the data array, so you will need to access the correct part of the response (`data[1]`). You'll then loop through this array to create and append `<li>` elements to the DOM.
    * **Result:** A simple webpage listing the countries of a selected world region.

6. **Chart of Air Quality in a Major City:**

    [6-openaq-air-quality/](6-openaq-air-quality/)

    * **Goal:** Pick a major world location (e.g., Delhi, São Paulo, Lagos). Use the OpenAQ V3 API (which requires an API key passed via the `X-API-Key` header) via a CORS proxy (`corsproxy.io`, requiring a free CORS proxy key) to get the latest PM2.5 measurements and display them on a time-series line chart.
    * **Skills:** Route API requests through a CORS proxy with URL encoding (`encodeURIComponent`) and pass custom authentication headers in `fetch` (`X-API-Key`). Process the resulting JSON to format two arrays/columns for Billboard.js: one for timestamps (e.g., `["x", ...]`) and one for values (e.g., `["pm25", ...]`). Use Billboard.js to render a timeseries line chart.
    * **Result:** A time-series line chart showing recent air pollution trends in a specific city rendered with Billboard.js.
