from fastapi import FastAPI, HTTPException
import clickhouse_driver
from model import GenreResponse, RevenueResponse, UserResponse, RatingResponse, VersionResponse, CountResponse, HHIResponse, StabilityResponse, CountryRankResponse

app = FastAPI()

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
client = clickhouse_driver.Client(host='localhost', port=9000)

@app.get("/api/genre", response_model=GenreResponse)
async def get_genres():
    # TODO: Implement ClickHouse query
    return {"data": []}

@app.get("/api/genre/{year}/{month}/revenue", response_model=RevenueResponse)
async def get_revenue(year: int, month: int):
    DateParams(year, month)  # Validate date range
    # TODO: Implement ClickHouse query
    return {"data": []}

@app.get("/api/genre/{year}/{month}/user", response_model=UserResponse)
async def get_user(year: int, month: int):
    DateParams(year, month)  # Validate date range
    # TODO: Implement ClickHouse query
    return {"data": []}

@app.get("/api/genre/{year}/{month}/rating", response_model=RatingResponse)
async def get_rating(year: int, month: int):
    DateParams(year, month)  # Validate date range
    # TODO: Implement ClickHouse query
    return {"data": []}

@app.get("/api/genre/{year}/{month}/version", response_model=VersionResponse)
async def get_version(year: int, month: int):
    DateParams(year, month)  # Validate date range
    # TODO: Implement ClickHouse query
    return {"data": []}

@app.get("/api/genre/{year}/{month}/count", response_model=CountResponse)
async def get_count(year: int, month: int):
    DateParams(year, month)  # Validate date range
    # TODO: Implement ClickHouse query
    return {"data": []}

@app.get("/api/genre/{year}/{month}/hhi", response_model=HHIResponse)
async def get_hhi(year: int, month: int):
    DateParams(year, month)  # Validate date range
    # TODO: Implement ClickHouse query
    return {"data": []}

@app.get("/api/genre/{year}/{month}/stability", response_model=StabilityResponse)
async def get_stability(year: int, month: int):
    DateParams(year, month)  # Validate date range
    # TODO: Implement ClickHouse query
    return {"data": []}

@app.get("/api/genre/{year}/{month}/country_rank", response_model=CountryRankResponse)
async def get_country_rank(year: int, month: int):
    DateParams(year, month)  # Validate date range
    # TODO: Implement ClickHouse query
    return {"data": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 