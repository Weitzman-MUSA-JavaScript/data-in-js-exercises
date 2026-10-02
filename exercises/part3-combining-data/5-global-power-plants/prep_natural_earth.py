import pathlib

import geopandas as gpd

# This script download the Natural Earth data from the NACIS CDN, which is not
# explicitly documented but is publicly accessible. See
# https://github.com/nvkelso/natural-earth-vector/issues/903 to follow the issue.
NATURAL_EARTH_COUNTRIES_URL = 'https://naciscdn.org/naturalearth/110m/cultural/ne_110m_admin_0_countries.zip'

# Load Natural Earth countries data
world = gpd.read_file(NATURAL_EARTH_COUNTRIES_URL)

# Lowercase column names
world.columns = world.columns.str.lower()

# Keep only necessary columns, to reduce file size
world = world[['geometry', 'sov_a3', 'adm0_a3', 'name', 'name_long', 'admin']]

# Save the countries data as a geojson file
output_path = pathlib.Path(__file__).parent / 'data' / 'countries.geojson'
world.to_file(output_path, driver='GeoJSON', layer_options={'COORDINATE_PRECISION': '5'})
