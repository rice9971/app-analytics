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
  Tab,
  Tabs,
} from '@mui/material';
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

// Constants for date range
const MIN_YEAR = 2021;
const MAX_YEAR = 2024;
const MIN_MONTH = 1;
const MAX_MONTH = 11;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMonth, setSelectedMonth] = useState(11);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);

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
  const { data: versions } = useQuery(
    ['versions', selectedYear, selectedMonth],
    () => fetchVersions(selectedYear, selectedMonth)
  );
  const { data: counts } = useQuery(
    ['counts', selectedYear, selectedMonth],
    () => fetchCounts(selectedYear, selectedMonth)
  );
  const { data: hhi } = useQuery(
    ['hhi', selectedYear, selectedMonth],
    () => fetchHHI(selectedYear, selectedMonth)
  );
  const { data: stability } = useQuery(
    ['stability', selectedYear, selectedMonth],
    () => fetchStability(selectedYear, selectedMonth)
  );

  // Get genre name by ID
  const getGenreName = (genreId: string) => {
    return genres?.find(g => g.id === genreId)?.name || genreId;
  };

  // Filter data based on selected genre
  const filterData = <T extends { genre_id: string }>(data: T[] | undefined): T[] => {
    return data?.filter(item => !selectedGenre || item.genre_id === selectedGenre) || [];
  };

  const filteredRevenue = filterData(revenue);
  const filteredUsers = filterData(users);
  const filteredRatings = filterData(ratings);
  const filteredVersions = filterData(versions);
  const filteredCounts = filterData(counts);
  const filteredHHI = filterData(hhi);
  const filteredStability = filterData(stability);

  // Generate available years and months
  const availableYears = Array.from(
    { length: MAX_YEAR - MIN_YEAR + 1 },
    (_, i) => MIN_YEAR + i
  );

  const getAvailableMonths = () => {
    const months = [];
    const startMonth = selectedYear === MIN_YEAR ? MIN_MONTH : 1;
    const endMonth = selectedYear === MAX_YEAR ? MAX_MONTH : 12;
    for (let i = startMonth; i <= endMonth; i++) {
      months.push(i);
    }
    return months;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => {
                  const newYear = Number(e.target.value);
                  setSelectedYear(newYear);
                  if (newYear === MAX_YEAR && selectedMonth > MAX_MONTH) {
                    setSelectedMonth(MAX_MONTH);
                  } else if (newYear === MIN_YEAR && selectedMonth < MIN_MONTH) {
                    setSelectedMonth(MIN_MONTH);
                  }
                }}
                label="Year"
              >
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                label="Month"
              >
                {getAvailableMonths().map((month) => (
                  <MenuItem key={month} value={month}>
                    {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab label="Market Overview" />
            <Tab label="User Engagement" />
            <Tab label="App Performance" />
            <Tab label="Market Competition" />
          </Tabs>
        </Box>

        {/* Market Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Revenue Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={filteredRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="genre_id" 
                      tickFormatter={getGenreName}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                      labelFormatter={getGenreName}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Market Concentration (HHI)
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={filteredHHI}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="genre_id" 
                      tickFormatter={getGenreName}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [value.toFixed(2), 'HHI']}
                      labelFormatter={getGenreName}
                    />
                    <Legend />
                    <Bar dataKey="hhi" fill="#82ca9d" name="HHI" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* User Engagement Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  User Base
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={filteredUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="genre_id" 
                      tickFormatter={getGenreName}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [value.toLocaleString(), 'Users']}
                      labelFormatter={getGenreName}
                    />
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
                  User Ratings
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={filteredRatings}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 5]} />
                    <YAxis
                      type="category"
                      dataKey="genre_id"
                      tickFormatter={getGenreName}
                      width={100}
                    />
                    <Tooltip
                      formatter={(value: number) => value.toFixed(1)}
                      labelFormatter={getGenreName}
                    />
                    <Legend />
                    <Bar dataKey="rating" fill="#8884d8" name="Rating">
                      {filteredRatings?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* App Performance Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Version Updates
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={filteredVersions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="genre_id" 
                      tickFormatter={getGenreName}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [value.toFixed(1), 'Updates']}
                      labelFormatter={getGenreName}
                    />
                    <Legend />
                    <Bar dataKey="big_version" fill="#8884d8" name="Major Updates" />
                    <Bar dataKey="small_version" fill="#82ca9d" name="Minor Updates" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  App Lifecycle
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={filteredCounts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="genre_id" 
                      tickFormatter={getGenreName}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [value, 'Apps']}
                      labelFormatter={getGenreName}
                    />
                    <Legend />
                    <Bar dataKey="new_entrant" fill="#8884d8" name="New Entrants" />
                    <Bar dataKey="new_exit" fill="#ff8042" name="Exits" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Market Competition Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Market Stability
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={filteredStability}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="genre_id" 
                      tickFormatter={getGenreName}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [value.toFixed(2), 'Stability']}
                      labelFormatter={getGenreName}
                    />
                    <Legend />
                    <Bar dataKey="stability" fill="#8884d8" name="Overall Stability" />
                    <Bar dataKey="stability_5" fill="#82ca9d" name="Top 5 Stability" />
                    <Bar dataKey="stability_10" fill="#ffc658" name="Top 10 Stability" />
                    <Bar dataKey="stability_20" fill="#ff8042" name="Top 20 Stability" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default Dashboard; 