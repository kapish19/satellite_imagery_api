# Satellite Imagery Processing API

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![FastAPI](https://img.shields.io/badge/Framework-FastAPI-green)
![GDAL](https://img.shields.io/badge/Powered_By-GDAL%2FRasterio-orange)
![Rasterio](https://img.shields.io/badge/Powered_By-Rasterio-orange)



A robust API for processing satellite imagery with geospatial capabilities, built with FastAPI and GDAL/Rasterio.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)


## Features

### 1. GeoTIFF Processing
- **Metadata Extraction**: Retrieve comprehensive geospatial metadata including CRS, dimensions, and transform
- **Reprojection**: Convert between coordinate reference systems (e.g., WGS84 to UTM)
- **Validation**: Verify image integrity and geospatial properties

### 2. NDVI Calculation
- **Vegetation Analysis**: Compute Normalized Difference Vegetation Index (NDVI)
- **Multi-band Support**: Works with any Red/NIR band combination
- **Statistical Analysis**: Returns min, max, mean, and median NDVI values
- **Visualization**: Generates color-mapped PNG outputs alongside GeoTIFF results

### 3. Change Detection
- **Temporal Analysis**: Identify changes between two time periods
- **Configurable Sensitivity**: Adjustable threshold (0.0-1.0) for change detection
- **Quantitative Results**: Changed area in pixels and percentage
- **Binary Output**: Clear change/no-change classification mask

## Installation

### Prerequisites
- Python 3.12
- GDAL system libraries

### System Setup

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y python3-dev gdal-bin libgdal-dev
```

#### MacOS (Homebrew)
```bash
brew install gdal
```

### Python Environment Setup
```bash
# Clone repository
git clone https://github.com/kapish19/satellite_imagery_api.git
cd satellite_imagery_api

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Docker Setup
```bash
docker build -t satellite-api .
docker run -p 8000:8000 satellite-api
```

## Configuration

Create a `.env` file in the project root:

```ini

# Directory paths
TEMP_DIR=app/data/temp
OUTPUT_DIR=app/data/output

# GDAL configuration (optional)
export GDAL_CONFIG=$(brew --prefix gdal)/bin/gdal-config
export CPLUS_INCLUDE_PATH=$(brew --prefix gdal)/include
export C_INCLUDE_PATH=$(brew --prefix gdal)/include
```

## API Endpoints

Based on your provided `main.py` implementation, here's the **"API Endpoints"** section for your documentation, rewritten to match your current actual endpoints and parameter handling:

---

## API Endpoints

Base URL: `http://localhost:8000/api/v1`

---

###  1. GeoTIFF Processing

#### Get Metadata

`POST /api/v1/geotiff/metadata`

**Description**: Extracts metadata from a GeoTIFF file, such as dimensions, CRS, transform, and more.

**Form Input**:

* `file`: Single GeoTIFF file

**Response** (`application/json`):

```json
{
  "width": 7821,
  "height": 7951,
  "count": 4,
  "crs": "EPSG:32611",
  "transform": [10.0, 0.0, 499980.0, 0.0, -10.0, 5200020.0],
  "bounds": {
    "left": 499980.0,
    "right": 509980.0,
    "bottom": 5190020.0,
    "top": 5200020.0
  },
  "driver": "GTiff",
  "dtype": "uint16"
}
```

---

#### 2. Reproject Image

`POST /api/v1/geotiff/reproject`

**Description**: Reprojects a GeoTIFF to a new Coordinate Reference System.

**Form Input**:

* `file`: GeoTIFF file
* `target_crs`: Target CRS (default is `"EPSG:4326"`)

**Response** (`application/json`):

```json
{
  "message": "Reprojection successful",
  "output_path": "reprojected_image.tif"
}
```

---

### 3. NDVI Calculation

#### NDVI from Separate Red/NIR Bands

`POST /api/v1/ndvi/from-bands`

**Description**: Computes NDVI from two separate single-band GeoTIFFs (e.g., B4 and B5).

**Form Input**:

* `red_file`: Red band image (GeoTIFF)
* `nir_file`: Near Infrared band image (GeoTIFF)

**Response**:

```json
{
  "filename_red": "B04.tif",
  "filename_nir": "B08.tif",
  "min": -0.15,
  "max": 0.84,
  "mean": 0.45,
  "median": 0.48,
  "ndvi_geotiff": "/api/v1/output/ndvi_result.tif",
  "ndvi_png": "/api/v1/output/ndvi_result.png"
}
```

---

### 4. Change Detection

#### Detect Changes Between Two Time Points

`POST /api/v1/change-detection`

**Description**: Compares two images and returns binary change map along with statistics.

**Form Input**:

* `image1`: First GeoTIFF file (older date)
* `image2`: Second GeoTIFF file (newer date)
* `band`: Band index to analyze (default: `1`)
* `threshold`: Sensitivity threshold (range `0.0–1.0`, default: `0.1`)

**Response**:

```json
{
  "changed_area_pixels": 12500,
  "changed_area_percentage": 12.5,
  "output_path": "change_map.tif",
  "threshold_used": 0.1,
  "dimensions": "7821x7951"
}
```
--- 
### 5. Health Check

#### Root Route

`GET /`

**Response**:

```json
{
  "message": "Welcome to the Satellite Imagery Processing API",
  "docs": "/docs",
  "redoc": "/redoc"
}
```


## Development Setup


### Running the Development Server
```bash
uvicorn app.main:app --reload
```

## Testing

Run the complete test suite:
```bash
pytest app/tests/ -v
```

Test specific modules:
```bash
# Test NDVI functionality
pytest app/tests/test_ndvi.py

# Test change detection
pytest app/tests/test_change.py
```

## Troubleshooting

### Common Issues

#### GDAL Installation Problems
```bash
# Verify GDAL installation
gdalinfo --version

# Reinstall Python bindings
pip uninstall gdal
export CPLUS_INCLUDE_PATH=/usr/include/gdal
export C_INCLUDE_PATH=/usr/include/gdal
pip install GDAL==$(gdal-config --version)
```

#### File Format Errors
```bash
# Check file validity
gdalinfo problem_file.tif

# Convert if necessary
gdal_translate -of GTiff input.img output.tif
```

