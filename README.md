# Satellite Imagery Processing API

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![FastAPI](https://img.shields.io/badge/Framework-FastAPI-green)
![GDAL](https://img.shields.io/badge/Powered_By-GDAL-yellow)
![Rasterio](https://img.shields.io/badge/Powered_By-Rasterio-orange)
![React](https://img.shields.io/badge/Frontend-React-blue)
![Material-UI](https://img.shields.io/badge/UI-Material--UI-blueviolet)

Satellite Imagery Processing API is a FastAPI-powered solution for geospatial analysis, offering three core functionalities: GeoTIFF metadata extraction, NDVI vegetation index calculation, and change detection between images. It supports both multi-band and separate single-band file processing, with robust error handling and configurable parameters. The API handles key geospatial operations like coordinate system transformations and produces quantitative results with visual outputs, making it ideal for environmental monitoring, agricultural assessment, and urban development tracking.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Development Setup](#development-setup)
- [Troubleshooting](#troubleshooting)
- [Frontend Setup](#frontend-setup)

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

### 4. Frontend Features
- **Interactive Map**: View and interact with satellite imagery using Leaflet
- **Modern UI**: Clean and responsive interface built with Material-UI
- **Real-time Updates**: Dynamic data visualization and processing status
- **Cross-platform**: Works on all major operating systems

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- GDAL system libraries
- npm or yarn

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

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
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

# Frontend configuration
REACT_APP_API_URL=http://localhost:8000
```

## API Endpoints

Base URL: `http://localhost:8000/api/v1`

### 1. GeoTIFF Processing

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

#### Reproject Image

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

### 2. NDVI Calculation

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

### 3. Change Detection

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

### 4. Health Check

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

### Running the Backend Server
```bash
uvicorn app.main:app --reload
```

### Running the Frontend Server
```bash
cd frontend
npm start
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

#### Frontend Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules
npm install
```

