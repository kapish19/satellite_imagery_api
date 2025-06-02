from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class GeoTIFFMetadata(BaseModel):
    width: int
    height: int
    count: int
    crs: str
    transform: List[float]
    bounds: Dict[str, float]
    driver: str
    dtype: str
    nodata: Optional[float]

class NDVIRequest(BaseModel):
    red_band: int = 3
    nir_band: int = 4

class NDVIResponse(BaseModel):
    min: float
    max: float
    mean: float
    median: float
    output_path: str

class ChangeDetectionRequest(BaseModel):
    band: int = 1
    threshold: float = 0.1

from pydantic import BaseModel

class ChangeDetectionResponse(BaseModel):
    changed_area_pixels: int
    changed_area_percentage: float
    output_tiff: str
    output_png: str
    threshold_used: float
    dimensions: str
