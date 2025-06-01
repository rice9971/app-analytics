from pydantic import BaseModel
from typing import List

# Pydantic models for response validation
class Genre(BaseModel):
    id: int
    name: str

class RevenueData(BaseModel):
    genre_id: int
    count_apps: int
    count_download: int
    paid_download: int
    organic_download: int
    revenue: int

class UserData(BaseModel):
    genre_id: int
    active_users: float
    install_base: float

class RatingData(BaseModel):
    genre_id: int
    rating: float

class VersionData(BaseModel):
    genre_id: int
    big_version: float
    small_version: float

class CountData(BaseModel):
    genre_id: int
    new_entrant: int
    new_exit: int

class HHIData(BaseModel):
    genre_id: int
    hhi: float

class StabilityData(BaseModel):
    genre_id: int
    stability: float
    stability_5: float
    stability_10: float
    stability_20: float

class CountryRankData(BaseModel):
    rank: int
    country_code: str
    count_download: int

# Response models
class GenreResponse(BaseModel):
    data: List[Genre]

class RevenueResponse(BaseModel):
    data: List[RevenueData]

class UserResponse(BaseModel):
    data: List[UserData]

class RatingResponse(BaseModel):
    data: List[RatingData]

class VersionResponse(BaseModel):
    data: List[VersionData]

class CountResponse(BaseModel):
    data: List[CountData]

class HHIResponse(BaseModel):
    data: List[HHIData]

class StabilityResponse(BaseModel):
    data: List[StabilityData]

class CountryRankResponse(BaseModel):
    data: List[CountryRankData]