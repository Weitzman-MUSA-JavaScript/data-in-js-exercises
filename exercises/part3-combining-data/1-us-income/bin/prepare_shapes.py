import geopandas as gpd
import pathlib
import requests

COUNTY_SHAPEFILE_URL = 'https://www2.census.gov/geo/tiger/TIGER2025/COUNTY/tl_2025_us_county.zip'
STATE_SHAPEFILE_URL = 'https://www2.census.gov/geo/tiger/TIGER2025/STATE/tl_2025_us_state.zip'
TRACT_SHAPEFILE_URL_T = 'https://www2.census.gov/geo/tiger/TIGER2025/TRACT/tl_2025_{state_fips_code}_tract.zip'

STATE_FIPS_CODES = ['01', '02', '04', '05', '06', '08', '09', '10', '11', '12', '13', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '44', '45', '46', '47', '48', '49', '50', '51', '53', '54', '55', '56', '60', '66', '69', '72', '78']

DATA_DIR = pathlib.Path(__file__).parent.parent / 'data'
DATA_DIR.mkdir(exist_ok=True)

TMP_DIR = pathlib.Path(__file__).parent.parent / 'tmp'
TMP_DIR.mkdir(exist_ok=True)

US_METERS_CRS = 'EPSG:3857'
WGS84_CRS = 'EPSG:4326'

RELEVANT_COLUMNS = ['NAME', 'NAMELSAD', 'GEOIDFQ', 'geometry']


def download_and_simplify_state_shapes(output_filepath='us_states_simplified.geojson', tolerance=2000):
    tmp_download_path = TMP_DIR / 'us_states.zip'

    if not tmp_download_path.exists():
      response = requests.get(STATE_SHAPEFILE_URL)
      with open(TMP_DIR / 'us_states.zip', 'wb') as f:
          f.write(response.content)

    gdf = gpd.read_file(tmp_download_path)
    gdf_simplified = gdf.drop(columns=gdf.columns.difference(RELEVANT_COLUMNS), errors='ignore')
    gdf_simplified.geometry = gdf.geometry.to_crs(US_METERS_CRS).simplify(tolerance).to_crs(WGS84_CRS).set_precision(grid_size=0.0001)
    gdf_simplified.to_file(DATA_DIR / output_filepath, driver='GeoJSON')
    print(f"Simplified state shapes saved to {output_filepath}")


def download_and_simplify_county_shapes(output_filepath='us_counties_simplified.geojson', tolerance=1000):
    tmp_download_path = TMP_DIR / 'us_counties.zip'

    if not tmp_download_path.exists():
        response = requests.get(COUNTY_SHAPEFILE_URL)
        with open(tmp_download_path, 'wb') as f:
            f.write(response.content)

    gdf = gpd.read_file(tmp_download_path)
    gdf_simplified = gdf.drop(columns=gdf.columns.difference(RELEVANT_COLUMNS))
    gdf_simplified.geometry = gdf.geometry.to_crs(US_METERS_CRS).simplify(tolerance).to_crs(WGS84_CRS).set_precision(grid_size=0.0001)
    gdf_simplified.to_file(DATA_DIR / output_filepath, driver='GeoJSON')
    print(f"Simplified county shapes saved to {output_filepath}")


def download_and_simplify_tract_shapes(output_filepath_t='state_{state_fips_code}_tracts_simplified.geojson', tolerance=500):
    for state_fips_code in STATE_FIPS_CODES:
        url = TRACT_SHAPEFILE_URL_T.format(state_fips_code=state_fips_code)
        output_filepath = output_filepath_t.format(state_fips_code=state_fips_code)
        tmp_download_path = TMP_DIR / f'state_{state_fips_code}_tracts.zip'

        if not tmp_download_path.exists():
            response = requests.get(url)
            with open(tmp_download_path, 'wb') as f:
                f.write(response.content)

        gdf_state = gpd.read_file(tmp_download_path)
        gdf_state_simplified = gdf_state.drop(columns=gdf_state.columns.difference(RELEVANT_COLUMNS), errors='ignore')
        gdf_state_simplified.geometry = gdf_state.geometry.to_crs(US_METERS_CRS).simplify(tolerance).to_crs(WGS84_CRS).set_precision(grid_size=0.0001)
        gdf_state_simplified.to_file(DATA_DIR / output_filepath, driver='GeoJSON')
        print(f"Downloaded and simplified tracts for state FIPS {state_fips_code}")


if __name__ == "__main__":
    download_and_simplify_state_shapes()
    download_and_simplify_county_shapes()
    download_and_simplify_tract_shapes()
