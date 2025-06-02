from fastapi import Depends, HTTPException, status, UploadFile
from typing import Annotated
import os

from app.core.config import settings
from app.core.errors import FileTooLargeError

def validate_file_size(file: UploadFile):
    """Validate that the uploaded file doesn't exceed size limit"""
    max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024  # Convert MB to bytes
    
    # Check content length header first
    if file.size is not None and file.size > max_size:
        raise FileTooLargeError()
    
    # If content length not available, read first chunk to check
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Rewind
    
    if file_size > max_size:
        raise FileTooLargeError()
    
    return file

ValidUploadFile = Annotated[UploadFile, Depends(validate_file_size)]