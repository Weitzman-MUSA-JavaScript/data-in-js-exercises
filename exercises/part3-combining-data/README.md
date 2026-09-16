# Data in JS Exercises

## Part 3 - Combining Data

This is the most advanced part, where you must perform a "join" by combining two different datasets based on a common key or spatial relationship.

### **Local Data Sources**

* **Philadelphia Neighborhoods (GeoJSON):** A polygon dataset defining neighborhood boundaries.
* **Census Data by Tract (CSV):** A non-spatial file from the US Census with demographic data (e.g., median income, population) for each census tract in Philadelphia. Use a file with a `TRACTCE` or `GEOID` column that can be used as a key.
* **Farmers Markets (CSV):** A simple list of farmers' markets with latitude and longitude columns.

### **Global Data Sources**

* **Natural Earth Countries (GeoJSON):** A standard, public domain GeoJSON file of world country boundaries.
* **World Bank Indicators API:** To get non-spatial, country-level data.
* **Global Power Plants Database:** A CSV or JSON dataset from the World Resources Institute listing thousands of power plants globally with their location, fuel type, and capacity.

### **Exercise Ideas**

1. **Choropleth Map of Median Income:**
    * **Goal:** Create a choropleth map showing the median household income at different US Census geography levels. 🗺️

      The map should start showing the entire US, with income data by county and with each state outlined with a thick outline (i.e., use the `us_counties_simplified.geojson` file and the `us_states_simplified.geojson` file). When you click on a state, the map should zoom in to that state and update to show income by census tract (using the relevant `state_{state_fips_code}_tracts_simplified.geojson` file for that state, with each of the counties outlined with a thick outline).
      
    * **Skills:** This requires an **attribute join**. You'll fetch the Census geographies GeoJSON files that I've added to this repository, and the income data from the Census API (using a URLs such as <https://api.census.gov/data/2023/acs/acs5?get=NAME,B06011_001E&for=tract:*&in=state:42> where `state:42` refers to PA, and `B06011_001E` refers to the median household income variable as documented in the [Census ACS API](https://api.census.gov/data/2023/acs/acs5/variables.html)). Convert the array of data into a JavaScript `Map`, or a simple object, for easy lookup, where the key is the state, county, or tract GeoID. Then, update the GeoJSON `features` with the corresponding income from the data map you created. Finally, use this new income property to style the color of each polygon on the Leaflet map.
    * **Result:** A classic color-coded map showing wealth distribution across the county, state, or country.

2. **Counting Farmers' Markets in Neighborhoods:**
    * **Goal:** Create a list or table that shows each neighborhood and the number of farmers' markets located within it.
    * **Skills:** This requires a **spatial join**. Load the Neighborhoods GeoJSON and the Farmers' Markets CSV. Loop through each farmers' market. For each market, create a `turf.js` point feature from its lat/lon. Then, loop through all the neighborhood polygons and use `turf.booleanPointInPolygon(point, polygon)` to see which neighborhood it falls inside. You'll need to keep a running count for each neighborhood.
    * **Result:** A table in the HTML showing neighborhood names and their corresponding market count. You could also make the neighborhood polygons clickable, and the popup could report the count.

3. **Building a Neighborhood Profile Tool:**
    * **Goal:** Combine the previous exercises into a single interface. A user selects a neighborhood from a dropdown. The page then updates to show:
        1. The map zoomed to that neighborhood's boundary.
        2. A list of all 311 calls that have occurred within its boundary (spatial join).
        3. Key demographic stats like population and median income (attribute join).
    * **Skills:** This synthesizes everything: DOM manipulation for the dropdown, fetching multiple data sources, filtering, spatial joins with `turf.js`, and attribute joins. It's a great capstone project.
    * **Result:** A dynamic, data-driven tool for exploring Philadelphia at the neighborhood level.

4. **Global Choropleth of CO₂ Emissions:**
    * **Goal:** Create a world choropleth map showing CO₂ emissions per capita for each country.
    * **Skills:** The core task is an **attribute join**. Fetch the Natural Earth countries GeoJSON. Separately, fetch CO₂ emissions data from the World Bank API. Create a JavaScript `Map` or object from the World Bank data, using the 3-letter country ISO code as the key. Then, iterate through each country feature in the GeoJSON. Use its `id` or `iso_a3` property to look up the corresponding emissions value from your data map. Finally, write a function that styles each country's fill color based on its emissions value.
    * **Result:** A powerful visualization of global inequality in carbon emissions.

5. **Counting Power Plants by Country (Spatial Join):** ⚡
    * **Goal:** Determine how many power plants from the Global Power Plant Database are located within each country.
    * **Skills:** This is a classic **spatial join**. Load the countries GeoJSON and the power plants data. Initialize a `count` property (e.g., `feature.properties.plant_count = 0;`) for each country feature. Then, loop through every power plant, create a `turf.point` from its latitude and longitude, and loop through the countries to find which polygon the point falls inside using `turf.booleanPointInPolygon()`. When a match is found, increment the `plant_count` for that country.
    * **Result:** A map where clicking on any country displays a popup with the total number of power plants located within its borders.

6. **Country Development Profile Dashboard:**
    * **Goal:** Create a simple dashboard. The user selects a country from a dropdown list. The page then updates to show:
        1. The map zoomed to that country's borders.
        2. Key development indicators from the World Bank (e.g., Population, GDP, Life Expectancy) displayed in an info panel.
        3. A list or map of all earthquakes from the USGS feed that have occurred within that country's boundary (a spatial filter).
    * **Skills:** This capstone combines everything: UI event handling, attribute joins for the stats, and spatial filtering/joining with `turf.js`. It mirrors the work of international development and risk analysis professionals.
    * **Result:** A dynamic, multi-source dashboard for exploring the status and risks of any country in the world.
