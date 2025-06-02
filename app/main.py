from fastapi import FastAPI, Query,UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List
import os


import numpy as np
from app.core.config import settings
from app.core.errors import APIError, ProcessingError
from app.models.schemas import (
    GeoTIFFMetadata,
    NDVIRequest,
    NDVIResponse,
    ChangeDetectionRequest,
    ChangeDetectionResponse
)
from app.processing.geotiff_processing import process_geotiff, get_geotiff_metadata, reproject_geotiff
from app.processing.change_detection import process_change_detection
from app.dependencies import ValidUploadFile
from app.processing.ndvi_calculation import process_multiple_ndvi, extract_bands, calculate_ndvi,save_ndvi_result

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (output images)
app.mount(
    f"{settings.API_V1_STR}/output",
    StaticFiles(directory="app/data/output"),
    name="output"
)

@app.exception_handler(APIError)
async def api_error_handler(request, exc):
    raise HTTPException(status_code=exc.status_code, detail=exc.detail)

@app.post(f"{settings.API_V1_STR}/geotiff/metadata", response_model=GeoTIFFMetadata)
async def get_metadata(file: ValidUploadFile = File(...)):
    """Get metadata from a GeoTIFF file"""
    try:
        temp_path = f"{settings.TEMP_DIR}/{file.filename}"
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())
        
        metadata = get_geotiff_metadata(temp_path)
        os.remove(temp_path)
        return metadata
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise

@app.post(f"{settings.API_V1_STR}/geotiff/reproject", response_model=dict)
async def reproject_image(file: ValidUploadFile = File(...), target_crs: str = "EPSG:4326"):
    """Reproject a GeoTIFF file to a different CRS"""
    try:
        temp_path = f"{settings.TEMP_DIR}/{file.filename}"
        with open(temp_path, "wb") as buffer:
            buffer.write(await file.read())
        
        output_path = reproject_geotiff(temp_path, target_crs)
        os.remove(temp_path)
        
        return {
            "message": "Reprojection successful",
            "output_path": output_path.replace("app/data/output/", "")
        }
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise



@app.post(f"{settings.API_V1_STR}/ndvi/from-bands")
async def calculate_ndvi_from_band_files(
    red_file: UploadFile = File(...),
    nir_file: UploadFile = File(...)
):
    """Calculate NDVI from two separate single-band GeoTIFF files (e.g., B4 and B5)"""
    try:
        red_path = os.path.join(settings.TEMP_DIR, f"red_{red_file.filename}")
        nir_path = os.path.join(settings.TEMP_DIR, f"nir_{nir_file.filename}")

        with open(red_path, "wb") as f:
            f.write(await red_file.read())
        with open(nir_path, "wb") as f:
            f.write(await nir_file.read())

        # Read the bands
        red_band, _ = extract_bands(red_path, 1, 1)  # get 1st band
        _, nir_band = extract_bands(nir_path, 1, 1)  # get 1st band

        # Calculate NDVI
        ndvi = calculate_ndvi(red_band, nir_band)

        # Save result using red image as base
        tif_path, png_path = save_ndvi_result(ndvi, red_path, settings.OUTPUT_DIR)

        result = {
            "filename_red": red_file.filename,
            "filename_nir": nir_file.filename,
            "min": float(np.nanmin(ndvi)),
            "max": float(np.nanmax(ndvi)),
            "mean": float(np.nanmean(ndvi)),
            "median": float(np.nanmedian(ndvi)),
            "ndvi_geotiff": f"{settings.API_V1_STR}/output/{os.path.basename(tif_path)}",
            "ndvi_png": f"{settings.API_V1_STR}/output/{os.path.basename(png_path)}"
        }

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(red_path):
            os.remove(red_path)
        if os.path.exists(nir_path):
            os.remove(nir_path)


@app.post(f"{settings.API_V1_STR}/change-detection", response_model=ChangeDetectionResponse)
async def detect_changes(
    image1: UploadFile = File(...),
    image2: UploadFile = File(...),
    band: int = Query(1),
    threshold: float = Query(0.1),
):
    """Detect changes between two GeoTIFF images"""
    try:
        result = await process_change_detection(image1, image2, band, threshold)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/")
async def root():
    return {
        "message": "Welcome to the Satellite Imagery Processing API",
        "docs": "/docs",
        "redoc": "/redoc"
    }