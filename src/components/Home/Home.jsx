import React, { useState, useEffect } from 'react';
import {
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost/sht30/test_data.php');

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();

        if (result.success) {
          setSensorData(result.data);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up polling to refresh data
    const intervalId = setInterval(fetchData, 60000); // Refresh every minute

    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error: {error}
        </Alert>
      </Box>
    );
  }

  // The latest reading is the first item in the array
  const latestReading = sensorData.length > 0 ? sensorData[0] : null;

  return (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Environmental Sensor Data
      </Typography>

      {latestReading && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            Latest Reading - {new Date(latestReading.timestamp).toLocaleString()}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    Temperature
                  </Typography>
                  <Typography variant="h4" component="div" color="primary.main">
                    {latestReading.temperature}°C
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    Humidity
                  </Typography>
                  <Typography variant="h4" component="div" color="primary.main">
                    {latestReading.humidity}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    PM2.5
                  </Typography>
                  <Typography variant="h4" component="div" color="primary.main">
                    {latestReading.pm25} μg/m³
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    CO2
                  </Typography>
                  <Typography variant="h4" component="div" color="primary.main">
                    {latestReading.co2} ppm
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    CO
                  </Typography>
                  <Typography variant="h4" component="div" color="primary.main">
                    {latestReading.co} ppm
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Historical Data
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: isMobile ? 300 : 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Time</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Temperature (°C)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Humidity (%)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>PM2.5 (μg/m³)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>CO2 (ppm)</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>CO (ppm)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sensorData.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{new Date(row.timestamp).toLocaleString()}</TableCell>
                <TableCell>{row.temperature}</TableCell>
                <TableCell>{row.humidity}</TableCell>
                <TableCell>{row.pm25}</TableCell>
                <TableCell>{row.co2}</TableCell>
                <TableCell>{row.co}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Home;