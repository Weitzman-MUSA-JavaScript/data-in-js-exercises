import pathlib
import zipfile

import requests

# You can find the latest version of the Global Power Plant Database at:
# https://datasets.wri.org/datasets/global-power-plant-database; click the "API
# Endpoints" button and scroll to the listing for the "raw file".
POWER_PLANTS_DATA_URL = 'https://datasets.wri.org/private-admin/dataset/53623dfd-3df6-4f15-a091-67457cdb571f/resource/66bcdacc-3d0e-46ad-9271-a5a76b1853d2/download/globalpowerplantdatabasev130.zip'

zip_path = pathlib.Path(__file__).parent / 'data' / 'global_power_plants.zip'

zip_path.parent.mkdir(parents=True, exist_ok=True)
response = requests.get(POWER_PLANTS_DATA_URL)
with open(zip_path, 'wb') as f:
    f.write(response.content)

with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    # Find the CSV file within the zip archive
    for file_name in zip_ref.namelist():
        if file_name.endswith('.csv'):
            csv_file_name = file_name
            break
    else:
        raise FileNotFoundError("No CSV file found in the zip archive.")

    zip_ref.extract(csv_file_name, zip_path.parent)


