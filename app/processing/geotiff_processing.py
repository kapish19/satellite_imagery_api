import os
import rasterio
from rasterio.crs import CRS
from rasterio.warp import calculate_default_transform, reproject, Resampling
from fastapi import UploadFile
import numpy as np
from typing import Dict, Any
import tempfile
import shutil

from app.core.config import settings
from app.core.errors import InvalidGeoTIFFError, ProcessingError

def save_upload_file(upload_file: UploadFile, destination: str) -> None:
    try:
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    except Exception as e:
        raise ProcessingError(f"Failed to save file: {str(e)}")

def get_geotiff_metadata(file_path: str) -> Dict[str, Any]:
    try:
        with rasterio.open(file_path) as src:
            return {
                "width": src.width,
                "height": src.height,
                "count": src.count,
                "crs": str(src.crs),
                "transform": list(src.transform),
                "bounds": {
                    "left": src.bounds.left,
                    "right": src.bounds.right,
                    "bottom": src.bounds.bottom,
                    "top": src.bounds.top
                },
                "driver": src.driver,
                "dtype": src.dtypes[0],
                "nodata": src.nodata
            }
    except rasterio.RasterioIOError as e:
        raise InvalidGeoTIFFError(f"Could not read GeoTIFF file: {str(e)}")

def reproject_geotiff(input_path: str, target_crs: str = "EPSG:4326") -> str:
    try:
        with rasterio.open(input_path) as src:
            transform, width, height = calculate_default_transform(
                src.crs, target_crs, src.width, src.height, *src.bounds
            )
            metadata = src.meta.copy()
            metadata.update({
                'crs': target_crs,
                'transform': transform,
                'width': width,
                'height': height
            })

            output_path = os.path.join(settings.OUTPUT_DIR, os.path.basename(input_path).replace('.tif', '_reprojected.tif'))
            
            with rasterio.open(output_path, 'w', **metadata) as dst:
                for i in range(1, src.count + 1):
                    reproject(
                        source=rasterio.band(src, i),
                        destination=rasterio.band(dst, i),
                        src_transform=src.transform,
                        src_crs=src.crs,
                        dst_transform=transform,
                        dst_crs=target_crs,
                        resampling=Resampling.nearest
                    )
            
            return output_path
    except Exception as e:
        raise ProcessingError(f"Reprojection failed: {str(e)}")

def process_geotiff(file: UploadFile) -> Dict[str, Any]:
    try:
        # Create temp file
        temp_dir = settings.TEMP_DIR
        os.makedirs(temp_dir, exist_ok=True)
        os.makedirs(settings.OUTPUT_DIR, exist_ok=True)
        
        temp_path = os.path.join(temp_dir, file.filename)
        save_upload_file(file, temp_path)
        
        # Get metadata
        metadata = get_geotiff_metadata(temp_path)
        
        # Reproject to WGS84 (common format for web mapping)
        reprojected_path = reproject_geotiff(temp_path)
        
        # Clean up temp file
        os.remove(temp_path)
        
        return {
            "metadata": metadata,
            "reprojected_path": reprojected_path
        }
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise