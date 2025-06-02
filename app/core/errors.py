from fastapi import HTTPException, status

class APIError(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)

class FileTooLargeError(APIError):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum allowed limit"
        )

class InvalidGeoTIFFError(APIError):
    def __init__(self, detail: str = "Invalid GeoTIFF file provided"):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail
        )

class ProcessingError(APIError):
    def __init__(self, detail: str = "Error during processing"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail
        )