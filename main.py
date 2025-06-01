from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import clickhouse_driver
import os
from dotenv import load_dotenv
from model import GenreResponse, RevenueResponse, UserResponse, RatingResponse, VersionResponse, CountResponse, HHIResponse, StabilityResponse, CountryRankResponse
from query import (
    get_genres, get_revenue, get_user, get_rating, get_version,
    get_count, get_hhi, get_stability, get_country_rank
)

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants for date validation
MIN_YEAR = 2021
MIN_MONTH = 1
MAX_YEAR = 2024
MAX_MONTH = 11

# Date validation model
class DateParams:
    def __init__(self, year: int, month: int):
        self.year = year
        self.month = month
        self._validate_date()

    def _validate_date(self):
        if not (MIN_YEAR <= self.year <= MAX_YEAR):
            raise HTTPException(
                status_code=400,
                detail=f"Year must be between {MIN_YEAR} and {MAX_YEAR}"
            )
        
        if self.year == MIN_YEAR and self.month < MIN_MONTH:
            raise HTTPException(
                status_code=400,
                detail=f"For year {MIN_YEAR}, month must be between {MIN_MONTH} and 12"
            )
        
        if self.year == MAX_YEAR and self.month > MAX_MONTH:
            raise HTTPException(
                status_code=400,
                detail=f"For year {MAX_YEAR}, month must be between 1 and {MAX_MONTH}"
            )
        
        if not (1 <= self.month <= 12):
            raise HTTPException(
                status_code=400,
                detail="Month must be between 1 and 12"
            )

# ClickHouse connection
client = clickhouse_driver.Client(
    host=os.getenv('clickhouse_host', 'localhost'),
    port=int(os.getenv('clickhouse_port', 9000)),
    database=os.getenv('clickhouse_database', 'default'),
    user=os.getenv('clickhouse_user', 'default'),
    password=os.getenv('clickhouse_password', '')
)

@app.get("/api/genre", response_model=GenreResponse)
async def get_genres_endpoint():
    """Get all genre definitions."""
    return {"data": get_genres(client)}

@app.get("/api/genre/{year}/{month}/revenue", response_model=RevenueResponse)
async def get_revenue_endpoint(year: int, month: int):
    """Get revenue data for a specific month."""
    DateParams(year, month)  # Validate date range
    return {"data": get_revenue(client, year, month)}

@app.get("/api/genre/{year}/{month}/user", response_model=UserResponse)
async def get_user_endpoint(year: int, month: int):
    """Get user data for a specific month."""
    DateParams(year, month)  # Validate date range
    return {"data": get_user(client, year, month)}

@app.get("/api/genre/{year}/{month}/rating", response_model=RatingResponse)
async def get_rating_endpoint(year: int, month: int):
    """Get rating data for a specific month."""
    DateParams(year, month)  # Validate date range
    return {"data": get_rating(client, year, month)}

@app.get("/api/genre/{year}/{month}/version", response_model=VersionResponse)
async def get_version_endpoint(year: int, month: int):
    """Get version data for a specific month."""
    DateParams(year, month)  # Validate date range
    return {"data": get_version(client, year, month)}

@app.get("/api/genre/{year}/{month}/count", response_model=CountResponse)
async def get_count_endpoint(year: int, month: int):
    """Get count data for a specific month."""
    DateParams(year, month)  # Validate date range
    return {"data": get_count(client, year, month)}

@app.get("/api/genre/{year}/{month}/hhi", response_model=HHIResponse)
async def get_hhi_endpoint(year: int, month: int):
    """Get HHI data for a specific month."""
    DateParams(year, month)  # Validate date range
    return {"data": get_hhi(client, year, month)}

@app.get("/api/genre/{year}/{month}/stability", response_model=StabilityResponse)
async def get_stability_endpoint(year: int, month: int):
    """Get stability data for a specific month."""
    DateParams(year, month)  # Validate date range
    return {"data": get_stability(client, year, month)}

@app.get("/api/genre/{year}/{month}/country_rank", response_model=CountryRankResponse)
async def get_country_rank_endpoint(year: int, month: int):
    """Get country rank data for a specific month."""
    DateParams(year, month)  # Validate date range
    return {"data": get_country_rank(client, year, month)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 