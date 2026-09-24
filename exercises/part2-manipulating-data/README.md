# Data in JS Exercises

## Part 2 - Manipulating Data

Here, you'll move beyond simple display to transforming data. We introduce array methods like `filter`, `map`, and `reduce` to create new data structures and insights from the source data.

### **Local Data Sources**

* Continue with the 311 Calls and Polling Places data.
* **Philadelphia Parks (GeoJSON):** A polygon dataset of park properties from OpenDataPhilly.

### **Global Data Sources**

* Continue with the USGS Earthquake and OpenAQ data.
* **OpenStreetMap Overpass API:** A powerful tool to query the massive OpenStreetMap database for specific features (like hospitals, schools, etc.) anywhere in the world.

### **Exercise Ideas**

1. **Filtering 311 Calls by Type:**

    [1-phl-311-calls/](1-phl-311-calls/)

    Here we will build on the 311 calls list from Part 1. Instead of just displaying the most recent calls, we will display charts with certain aggregated metrics, and allow the user to filter by type of service.

    * **Goal:** Display most recent 311 calls in a list, and two charts: one showing the number of calls by type, and another showing the share of calls for each status. Allow the user to filter what's visible. For example, clicking a bar in the "calls by type" chart should filter the list and the "status" chart to only show calls of that type. Clicking on the same bar again should remove the filter.
    * **Skills:** Use the `Array.prototype.filter()` method. When a user clicks a button, filter the master array of 311 calls to create a *new* array containing only requests of that type (e.g., `where service_name === 'Pothole Repair'`). Then, clear the existing items from the list and add new ones from the filtered array.
    * **Result:** An interactive chart where a user can toggle different categories of service requests.

2. **Deduplicating Polling Places:**

    [2-phl-polling-places/](2-phl-polling-places/)

    * **Goal:** In the data, since multiple precincts may vote at a given polling place, there are duplicate entries for many polling places (e.g. precincts 0107, 3927, and 3932 all vote at the Bok building, but each have separate features in the download data). Ensure that each polling place is represented only once.
    * **Skills:** Use `Array.prototype.reduce()` to build a new array of unique polling places. The reducer function can check if the current polling place's address is already in a new array. If not, add it; if so, append the precinct information to a `precincts` array in that polling place's properties. This teaches how to build complex objects from simpler ones.
    * **Result:** A map where each popup gives more useful information, including the list of all precincts that vote there.

3. **Calculating Total Park Acreage:**

    [3-phl-parks/](3-phl-parks/)

    * **Goal:** Use the Parks GeoJSON to calculate the total acreage of parkland managed by Philadelphia Parks & Recreation.
    * **Skills:** This is a perfect use case for `Array.prototype.reduce()`. First, you might need to `filter` the dataset to only include properties owned by the correct department. Then, use `reduce` to iterate over the filtered array, summing the values from the `ACREAGE` property into a single number. Display this number on the page.
    * **Result:** An interactive map and form where a user can select park sites around Philadelphia and see the total acreage covered by those sites.

4. **Filtering Earthquakes by Magnitude and Depth:**
    * **Goal:** Enhance the earthquake map from Part 1. Add UI controls (buttons or a slider) that allow a user to **filter** the displayed earthquakes by magnitude (e.g., > 4.5) or depth.
    * **Skills:** Use `Array.prototype.filter()` based on user input to create new, smaller arrays from the master earthquake list. Introduce the concept of a "render" function that clears the map and draws a new set of markers based on the currently filtered data. This is a key pattern in interactive web mapping.
    * **Result:** An interactive global earthquake map where users can explore relationships between magnitude, depth, and location.

5. **Mapping Cafes in Rome:** ☕
    * **Goal:** Use the OpenStreetMap Overpass API to query for all nodes tagged with `amenity=cafe` within the bounding box of Rome, Italy. Display them on a map.
    * **Skills:** Learn to construct an Overpass API query URL. The API returns a custom JSON format, not GeoJSON. Students must use `Array.prototype.map()` to transform the array of OSM nodes into a valid GeoJSON FeatureCollection that Leaflet can easily read and render. This teaches them how to adapt to non-standard data formats.
    * **Result:** A map of Rome dotted with the locations of its many cafes, pulled from live OpenStreetMap data.

6. **Finding the Most Polluted Monitoring Station:**
    * **Goal:** Fetch all PM2.5 monitoring stations from OpenAQ for a country like India. Use data manipulation to find the single station with the **highest** current reading.
    * **Skills:** This is a great task for `Array.prototype.reduce()`. The reducer function can iterate through the list of stations, keeping track of the one with the highest `value` seen so far. Once found, highlight that specific station on a map and display its name and reading.
    * **Result:** A map of India showing all air quality stations, with the one reporting the worst air quality specially highlighted.
