import axios from 'axios';
import {
  Genre,
  RevenueData,
  UserData,
  RatingData,
  VersionData,
  CountData,
  HHIData,
  StabilityData,
  CountryRankData
} from '../types/data';

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
});

export const fetchGenres = async (): Promise<Genre[]> => {
  const response = await api.get('/genre');
  return response.data.data;
};

export const fetchRevenue = async (year: number, month: number): Promise<RevenueData[]> => {
  const response = await api.get(`/genre/${year}/${month}/revenue`);
  return response.data.data;
};

export const fetchUsers = async (year: number, month: number): Promise<UserData[]> => {
  const response = await api.get(`/genre/${year}/${month}/user`);
  return response.data.data;
};

export const fetchRatings = async (year: number, month: number): Promise<RatingData[]> => {
  const response = await api.get(`/genre/${year}/${month}/rating`);
  return response.data.data;
};

export const fetchVersions = async (year: number, month: number): Promise<VersionData[]> => {
  const response = await api.get(`/genre/${year}/${month}/version`);
  return response.data.data;
};

export const fetchCounts = async (year: number, month: number): Promise<CountData[]> => {
  const response = await api.get(`/genre/${year}/${month}/count`);
  return response.data.data;
};

export const fetchHHI = async (year: number, month: number): Promise<HHIData[]> => {
  const response = await api.get(`/genre/${year}/${month}/hhi`);
  return response.data.data;
};

export const fetchStability = async (year: number, month: number): Promise<StabilityData[]> => {
  const response = await api.get(`/genre/${year}/${month}/stability`);
  return response.data.data;
};

export const fetchCountryRanks = async (year: number, month: number): Promise<CountryRankData[]> => {
  const response = await api.get(`/genre/${year}/${month}/country_rank`);
  return response.data.data;
}; 