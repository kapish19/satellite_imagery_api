import os
import numpy as np
import rasterio
import matplotlib.pyplot as plt
from app.core.config import settings
from rasterio.plot import show
from typing import Tuple, List

from app.core.errors import InvalidGeoTIFFError, ProcessingError

def calculate_ndvi(red_band: np.ndarray, nir_band: np.ndarray) -> np.ndarray:
    try:
        denominator = nir_band.astype(float) + red_band.astype(float)
        denominator[denominator == 0] = np.nan
        return (nir_band.astype(float) - red_band.astype(float)) / denominator
    except Exception as e:
        raise ProcessingError(f"NDVI calculation failed: {str(e)}")

def extract_bands(file_path: str, red_band: int, nir_band: int) -> Tuple[np.ndarray, np.ndarray]:
    try:
        with rasterio.open(file_path) as src:
            if red_band > src.count or nir_band > src.count:
                raise InvalidGeoTIFFError("Band index exceeds available bands.")
            return src.read(red_band), src.read(nir_band)
    except rasterio.RasterioIOError as e:
        raise InvalidGeoTIFFError(f"GeoTIFF read failed: {str(e)}")

def save_ndvi_result(ndvi: np.ndarray, input_path: str, output_dir: str) -> Tuple[str, str]:
    try:
        os.makedirs(output_dir, exist_ok=True)
        base = os.path.basename(input_path).replace('.tif', '')

        with rasterio.open(input_path) as src:
            profile = src.profile
            profile.update(dtype=rasterio.float32, count=1, nodata=np.nan)

            tif_path = os.path.join(output_dir, f"{base}_ndvi.tif")
            with rasterio.open(tif_path, 'w', **profile) as dst:
                dst.write(ndvi.astype(rasterio.float32), 1)

        png_path = os.path.join(output_dir, f"{base}_ndvi.png")
        plt.figure(figsize=(10, 10))
        plt.imshow(ndvi, cmap='RdYlGn', vmin=-1, vmax=1)
        plt.colorbar(label='NDVI')
        plt.title('NDVI Visualization')
        plt.axis('off')
        plt.savefig(png_path)
        plt.close()


        return tif_path, png_path
    except Exception as e:
        raise ProcessingError(f"Saving NDVI failed: {str(e)}")

def process_multiple_ndvi(
    file_paths: List[str], red_band: int, nir_band: int, output_dir: str
) -> List[dict]:
    results = []
    for path in file_paths:
        try:
            red, nir = extract_bands(path, red_band, nir_band)
            ndvi = calculate_ndvi(red, nir)
            tif_path, png_path = save_ndvi_result(ndvi, path, output_dir)

            results.append({
                "filename": os.path.basename(path),
                "min": float(np.nanmin(ndvi)),
                "max": float(np.nanmax(ndvi)),
                "mean": float(np.nanmean(ndvi)),
                "median": float(np.nanmedian(ndvi)),
                "ndvi_geotiff": f"{settings.API_V1_STR}/output/{os.path.basename(tif_path)}",
                "ndvi_png": f"{settings.API_V1_STR}/output/{os.path.basename(png_path)}"

            })
        except Exception as e:
            results.append({
                "filename": os.path.basename(path),
                "error": str(e)
            })
    return results
