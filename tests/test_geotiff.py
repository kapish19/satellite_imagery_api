import pytest
import os
import rasterio
from fastapi.testclient import TestClient
from pathlib import Path

from app.main import app
from app.core.config import settings

client = TestClient(app)

TEST_IMAGE_PATH = "tests/test_data/test_image.tif"

@pytest.fixture(scope="module")
def test_image():
    # Create a simple test image if it doesn't exist
    if not os.path.exists(TEST_IMAGE_PATH):
        os.makedirs(os.path.dirname(TEST_IMAGE_PATH), exist_ok=True)
        
        # Create a simple 100x100 RGB image
        profile = {
            'driver': 'GTiff',
            'height': 100,
            'width': 100,
            'count': 3,
            'dtype': 'uint8',
            'crs': 'EPSG:4326',
            'transform': rasterio.Affine(0.1, 0.0, 10.0, 0.0, -0.1, 20.0)
        }
        
        with rasterio.open(TEST_IMAGE_PATH, 'w', **profile) as dst:
            for i in range(1, 4):
                dst.write((i * 50) * np.ones((100, 100), dtype='uint8'), i)
    
    yield TEST_IMAGE_PATH
    
    # Clean up
    if os.path.exists(TEST_IMAGE_PATH):
        os.remove(TEST_IMAGE_PATH)

def test_geotiff_metadata(test_image):
    with open(test_image, "rb") as f:
        response = client.post(
            "/api/v1/geotiff/metadata",
            files={"file": ("test_image.tif", f, "image/tiff")}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert data["width"] == 100
    assert data["height"] == 100
    assert data["count"] == 3
    assert data["crs"] == "EPSG:4326"

def test_geotiff_reproject(test_image):
    with open(test_image, "rb") as f:
        response = client.post(
            "/api/v1/geotiff/reproject",
            files={"file": ("test_image.tif", f, "image/tiff")},
            data={"target_crs": "EPSG:3857"}
        )
    
    assert response.status_code == 200
    data = response.json()
    assert "output_path" in data
    assert data["output_path"].endswith("_reprojected.tif")
    
    # Verify the output file exists
    output_path = os.path.join("app/data/output", os.path.basename(data["output_path"]))
    assert os.path.exists(output_path)
    
    # Verify the CRS was changed
    with rasterio.open(output_path) as src:
        assert str(src.crs) == "EPSG:3857"
    
    # Clean up
    os.remove(output_path)