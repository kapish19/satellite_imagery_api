import pytest
import os
import numpy as np
import rasterio
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings

client = TestClient(app)

TEST_NDVI_IMAGE_PATH = "tests/test_data/ndvi_test.tif"

@pytest.fixture(scope="module")
def ndvi_test_image():
    # Create a test image with red and NIR bands if it doesn't exist
    if not os.path.exists(TEST_NDVI_IMAGE_PATH):
        os.makedirs(os.path.dirname(TEST_NDVI_IMAGE_PATH), exist_ok=True)
        
        # Create a simple 100x100 image with 4 bands (RGBN)
        profile = {
            'driver': 'GTiff',
            'height': 100,
            'width': 100,
            'count': 4,
            'dtype': 'uint16',
            'crs': 'EPSG:4326',
            'transform': rasterio.Affine(0.1, 0.0, 10.0, 0.0, -0.1, 20.0)
        }
        
        with rasterio.open(TEST_NDVI_IMAGE_PATH, 'w', **profile) as dst:
            # Red band (band 3)
            dst.write(np.full((100, 100), 100, dtype='uint16'), 3)
            # NIR band (band 4)
            dst.write(np.full((100, 100), 200, dtype='uint16'), 4)
    
    yield TEST_NDVI_IMAGE_PATH
    
    # Clean up
    if os.path.exists(TEST_NDVI_IMAGE_PATH):
        os.remove(TEST_NDVI_IMAGE_PATH)

def test_ndvi_calculation(ndvi_test_image):
    with open(ndvi_test_image, "rb") as f:
        response = client.post(
            "/api/v1/ndvi",
            files={"file": ("ndvi_test.tif", f, "image/tiff")},
            json={"red_band": 3, "nir_band": 4}
        )
    
    assert response.status_code == 200
    data = response.json()
    
    # Expected NDVI = (NIR - Red) / (NIR + Red) = (200 - 100)/(200 + 100) = 0.333...
    assert pytest.approx(data["mean"], 0.01) == 0.333
    assert data["min"] <= data["mean"] <= data["max"]
    assert "output_path" in data
    
    # Verify the output file exists
    output_path = os.path.join("app/data/output", os.path.basename(data["output_path"]))
    assert os.path.exists(output_path)
    
    # Clean up
    os.remove(output_path)