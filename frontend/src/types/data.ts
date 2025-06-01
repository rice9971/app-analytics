export interface Genre {
  id: string;
  name: string;
}

export interface RevenueData {
  genre_id: string;
  count_apps: number;
  count_download: number;
  paid_download: number;
  organic_download: number;
  revenue: number;
}

export interface UserData {
  genre_id: string;
  active_users: number;
  install_base: number;
}

export interface RatingData {
  genre_id: string;
  rating: number;
}

export interface VersionData {
  genre_id: string;
  big_version: number;
  small_version: number;
}

export interface CountData {
  genre_id: string;
  new_entrant: number;
  new_exit: number;
}

export interface HHIData {
  genre_id: string;
  hhi: number;
}

export interface StabilityData {
  genre_id: string;
  stability: number;
  stability_5: number;
  stability_10: number;
  stability_20: number;
}

export interface CountryRank {
  rank: number;
  country_code: string;
  count_download: number;
}

export interface CountryRankData {
  genre_id: string;
  rankings: CountryRank[];
} 