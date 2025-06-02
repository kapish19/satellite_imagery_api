import os
import numpy as np
import rasterio
import matplotlib.pyplot as plt
from fastapi import UploadFile
from app.core.config import settings
from app.core.errors import InvalidGeoTIFFError, ProcessingError
from rasterio.enums import Resampling
import numpy as np
from app.core.errors import InvalidGeoTIFFError
import tempfile
import os
from typing import Tuple



def validate_images(image1_path: str, image2_path: str) -> Tuple[rasterio.DatasetReader, rasterio.DatasetReader]:
    """Validate two images have compatible properties. Auto-resample image2 to match image1 if needed."""
    try:
        img1 = rasterio.open(image1_path)
        img2 = rasterio.open(image2_path)

        # Check CRS match
        if img1.crs != img2.crs:
            raise InvalidGeoTIFFError("Images must have the same CRS")

        # Check shape and transform
        if img1.shape != img2.shape or not np.allclose(img1.transform, img2.transform):
            # Resample img2 to match img1
            data_resampled = img2.read(
                out_shape=(
                    img2.count,
                    img1.height,
                    img1.width
                ),
                resampling=Resampling.bilinear
            )

            transform_resampled = img1.transform
            meta = img2.meta.copy()
            meta.update({
                "height": img1.height,
                "width": img1.width,
                "transform": transform_resampled
            })

            # Save resampled to temporary file
            resampled_path = os.path.join(tempfile.gettempdir(), f"resampled_{os.path.basename(image2_path)}")
            with rasterio.open(resampled_path, 'w', **meta) as dst:
                dst.write(data_resampled)

            img2.close()  # Close old reference
            img2 = rasterio.open(resampled_path)

        return img1, img2

    except rasterio.RasterioIOError as e:
        raise InvalidGeoTIFFError(f"File read error: {str(e)}")


def calculate_change(
    img1: rasterio.DatasetReader,
    img2: rasterio.DatasetReader,
    band: int = 1,
    threshold: float = 0.1
) -> np.ndarray:
    """Calculate absolute change between corresponding bands with thresholding."""
    try:
        band1 = img1.read(band).astype(np.float32)
        band2 = img2.read(band).astype(np.float32)

        # Normalize both bands to 0–1
        band1_norm = (band1 - np.nanmin(band1)) / (np.nanmax(band1) - np.nanmin(band1) + 1e-10)
        band2_norm = (band2 - np.nanmin(band2)) / (np.nanmax(band2) - np.nanmin(band2) + 1e-10)

        # Compute absolute difference and threshold
        diff = np.abs(band1_norm - band2_norm)
        change_mask = (diff > threshold).astype(np.uint8) * 255

        return change_mask

    except Exception as e:
        raise ProcessingError(f"Change calculation failed: {str(e)}")

def save_change_map(change_mask, reference_img, filename):
    os.makedirs(settings.OUTPUT_DIR, exist_ok=True)
    output_tiff = os.path.join(settings.OUTPUT_DIR, f"change_{filename}")
    output_png = output_tiff.replace(".tif", ".png")

    meta = reference_img.meta.copy()
    meta.update({
        "count": 1,
        "dtype": "uint8",
        "nodata": 0
    })

    with rasterio.open(output_tiff, "w", **meta) as dst:
        dst.write(change_mask, 1)

    plt.imsave(output_png, change_mask, cmap="gray")

    return output_tiff, output_png

async def process_change_detection(image1: UploadFile, image2: UploadFile, band: int, threshold: float):
    temp_dir = settings.TEMP_DIR
    os.makedirs(temp_dir, exist_ok=True)

    path1 = os.path.join(temp_dir, image1.filename)
    path2 = os.path.join(temp_dir, image2.filename)

    with open(path1, "wb") as f:
        f.write(await image1.read())
    with open(path2, "wb") as f:
        f.write(await image2.read())

    try:
        img1, img2 = validate_images(path1, path2)
        mask = calculate_change(img1, img2, band, threshold)
        tiff_path, png_path = save_change_map(mask, img1, image1.filename)

        changed_pixels = int(np.sum(mask == 255))
        total_pixels = mask.size
        changed_percent = (changed_pixels / total_pixels) * 100

        return {
            "changed_area_pixels": changed_pixels,
            "changed_area_percentage": round(changed_percent, 2),
            "output_tiff": tiff_path,
            "output_png": png_path,
            "threshold_used": threshold,
            "dimensions": f"{img1.height}x{img1.width}"
        }
    finally:
        for path in [path1, path2]:
            if os.path.exists(path):
                os.remove(path)
