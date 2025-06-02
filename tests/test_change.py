import pytest
import os
import numpy as np
import rasterio
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings

client = TestClient(app)

TEST_CHANGE_IMAGE1_PATH = "tests/test_data/change_test1.tif"
TEST_CHANGE_IMAGE2_PATH = "tests/test_data/change_test2.tif"

@pytest.fixture(scope="module")
def change_test_images():
    # Create two test images for change detection if they don't exist
    os.makedirs(os.path.dirname(TEST_CHANGE_IMAGE1_PATH), exist_ok=True)
    
    # Create first image
    profile = {
        'driver': 'GTiff',
        'height': 100,
        'width': 100,
        'count': 1,
        'dtype': 'uint16',
        'crs': 'EPSG:4326',
        'transform': rasterio.Affine(0.1, 0.0, 10.0, 0.0, -0.1, 20.0)
    }
    
    with rasterio.open(TEST_CHANGE_IMAGE1_PATH, 'w', **profile) as dst:
        dst.write(np.full((100, 100), 100, dtype='uint16'), 1)
    
    # Create second image with some changes
    with rasterio.open(TEST_CHANGE_IMAGE2_PATH, 'w', **profile) as dst:
        data = np.full((100, 100), 100, dtype='uint16')
        data[40:60, 40:60] = 200  # Create a changed area
        dst.write(data, 1)
    
    yield (TEST_CHANGE_IMAGE1_PATH, TEST_CHANGE_IMAGE2_PATH)
    
    # Clean up
    if os.path.exists(TEST_CHANGE_IMAGE1_PATH):
        os.remove(TEST_CHANGE_IMAGE1_PATH)
    if os.path.exists(TEST_CHANGE_IMAGE2_PATH):
        os.remove(TEST_CHANGE_IMAGE2_PATH)

def test_change_detection(change_test_images):
    image1_path, image2_path = change_test_images
    
    with open(image1_path, "rb") as f1, open(image2_path, "rb") as f2:
        response = client.post(
            "/api/v1/change-detection",
            files=[
                ("image1", ("change_test1.tif", f1, "image/tiff")),
                ("image2", ("change_test2.tif", f2, "image/tiff"))
            ],
            json={"band": 1, "threshold": 0.2}
        )
    
    assert response.status_code == 200
    data = response.json()
    
    # We changed a 20x20 area (400 pixels) out of 10000 (1%)
    assert data["changed_area_pixels"] == 400
    assert pytest.approx(data["changed_area_percentage"], 0.1) == 4.0
    assert "output_path" in data
    
    # Verify the output file exists
    output_path = os.path.join("app/data/output", os.path.basename(data["output_path"]))
    assert os.path.exists(output_path)
    
    # Clean up
    os.remove(output_path)