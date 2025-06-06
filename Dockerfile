FROM osgeo/gdal:ubuntu-full-3.6.2

# Install Python and pip
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy app code
COPY ./app ./app
COPY .env .

# Create folders
RUN mkdir -p /app/data/input /app/data/output /app/data/temp

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
