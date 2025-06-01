import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useQuery } from 'react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  fetchGenres,
  fetchRevenue,
  fetchUsers,
  fetchRatings,
  fetchVersions,
  fetchCounts,
  fetchHHI,
  fetchStability,
  fetchCountryRanks,
} from '../utils/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState(11);
  const [selectedGenre, setSelectedGenre] = useState<string>('');

  const { data: genres } = useQuery('genres', fetchGenres);
  const { data: revenue } = useQuery(
    ['revenue', selectedYear, selectedMonth],
    () => fetchRevenue(selectedYear, selectedMonth)
  );
  const { data: users } = useQuery(
    ['users', selectedYear, selectedMonth],
    () => fetchUsers(selectedYear, selectedMonth)
  );
  const { data: ratings } = useQuery(
    ['ratings', selectedYear, selectedMonth],
    () => fetchRatings(selectedYear, selectedMonth)
  );

  const filteredRevenue = revenue?.filter(r => !selectedGenre || r.genre_id === selectedGenre);
  const filteredUsers = users?.filter(u => !selectedGenre || u.genre_id === selectedGenre);
  const filteredRatings = ratings?.filter(r => !selectedGenre || r.genre_id === selectedGenre);

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          App Analytics Dashboard
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Genre</InputLabel>
              <Select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                label="Genre"
              >
                <MenuItem value="">All Genres</MenuItem>
                {genres?.map((genre) => (
                  <MenuItem key={genre.id} value={genre.id}>
                    {genre.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <DatePicker
              label="Year"
              views={['year']}
              value={new Date(selectedYear, 0)}
              onChange={(date) => date && setSelectedYear(date.getFullYear())}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                label="Month"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <MenuItem key={month} value={month}>
                    {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Revenue by Genre
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="genre_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                User Metrics
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filteredUsers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="genre_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="active_users" stroke="#8884d8" name="Active Users" />
                  <Line type="monotone" dataKey="install_base" stroke="#82ca9d" name="Install Base" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Ratings Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={filteredRatings}
                    dataKey="rating"
                    nameKey="genre_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {filteredRatings?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 