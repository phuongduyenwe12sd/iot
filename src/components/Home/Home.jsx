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
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, query, limitToLast, orderByKey } from "firebase/database";
import Duyen from './Duyen.jpg';  // Đặt file ute.png trong thư mục layout
// Your Firebase configuration
import Noob from './noob.jpg';  // Đặt file ute.png trong thư mục layout
import { Person as PersonIcon } from '@mui/icons-material';
const firebaseConfig = {
  apiKey: "AIzaSyAzuloKPhOSsoDTKw4Ks4Gx0mvw_h6Sj3s",
  authDomain: "project-3680597276515843100.firebaseapp.com",
  databaseURL: "https://project-3680597276515843100-default-rtdb.firebaseio.com",
  projectId: "project-3680597276515843100",
  storageBucket: "project-3680597276515843100.firebasestorage.app",
  messagingSenderId: "731837625507",
  appId: "1:731837625507:web:796e97dd31c11f88307b16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [latestReading, setLatestReading] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get the latest reading
    const latestRef = ref(database, '/air_quality/latest');
    const latestUnsubscribe = onValue(latestRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          setLatestReading(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error getting latest data:", err);
        setError(err.message);
        setLoading(false);
      }
    }, (err) => {
      console.error("Firebase latest error:", err);
      setError(err.message);
      setLoading(false);
    });

    // Get historical data (last 20 entries)
    const historyRef = query(
      ref(database, '/air_quality'),
      orderByKey(),
      limitToLast(20)
    );

    const historyUnsubscribe = onValue(historyRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          // Convert object to array and filter out 'latest' entry
          const dataArray = Object.entries(data)
            .filter(([key]) => key !== 'latest')
            .map(([key, value]) => ({
              id: key,
              ...value
            }))
            .sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp descending

          setHistoricalData(dataArray);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error getting historical data:", err);
        setError(err.message);
        setLoading(false);
      }
    }, (err) => {
      console.error("Firebase history error:", err);
      setError(err.message);
      setLoading(false);
    });

    // Clean up listeners on unmount
    return () => {
      latestUnsubscribe();
      historyUnsubscribe();
    };
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
  // Replace your current formatTimestamp function with this improved version:

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';

    console.log("Timestamp received:", timestamp, "Type:", typeof timestamp);

    // Handle different timestamp formats
    let date;
    try {
      if (typeof timestamp === 'object' && timestamp.seconds) {
        // Firestore Timestamp object
        date = new Date(timestamp.seconds * 1000);
      } else if (typeof timestamp === 'number') {
        // Unix timestamp (in seconds or milliseconds)
        date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
      } else if (typeof timestamp === 'string') {
        // ISO string or other date string
        date = new Date(timestamp);
      } else {
        // If all else fails, use current time
        date = new Date();
      }
    } catch (err) {
      console.error("Error parsing timestamp:", err);
      date = new Date(); // Fallback to current time
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date created from timestamp:", timestamp);
      date = new Date(); // Fallback to current time
    }

    // Format for Vietnam timezone (UTC+7)
    const options = {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false // Use 24-hour format
    };

    // Return formatted date string
    return new Intl.DateTimeFormat('vi-VN', options).format(date);
  };
  return (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Air Quality Monitor Dashboard
      </Typography>

      {latestReading && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            Latest Reading - {formatTimestamp(latestReading.timestamp)}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card sx={{
                height: '100%',
                bgcolor: theme.palette.background.paper,
                boxShadow: 3
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    Temperature
                  </Typography>
                  <Typography variant="h4" component="div" color="primary.main">
                    {parseFloat(latestReading.temperature).toFixed(1)}°C
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card sx={{
                height: '100%',
                bgcolor: theme.palette.background.paper,
                boxShadow: 3
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    Humidity
                  </Typography>
                  <Typography variant="h4" component="div" color="primary.main">
                    {parseFloat(latestReading.humidity).toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card sx={{
                height: '100%',
                bgcolor: theme.palette.background.paper,
                boxShadow: 3
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    PM2.5
                  </Typography>
                  <Typography variant="h4" component="div" color="primary.main">
                    {parseFloat(latestReading.pm25).toFixed(1)} μg/m³
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card sx={{
                height: '100%',
                bgcolor: theme.palette.background.paper,
                boxShadow: 3
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    CO2
                  </Typography>
                  <Typography variant="h4" component="div" color="primary.main">
                    {parseFloat(latestReading.co2).toFixed(1)} ppm
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Card sx={{
                height: '100%',
                bgcolor: theme.palette.background.paper,
                boxShadow: 3
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography color="text.secondary" gutterBottom>
                    CO
                  </Typography>
                  <Typography variant="h4" component="div" color="primary.main">
                    {parseFloat(latestReading.co_corrected).toFixed(1)} ppm
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}



      {/* Team Members Section */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          Our Team
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {/* Team Member 1 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 8
                }
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '4px solid',
                    borderColor: 'primary.main'
                  }}
                >
                  <PersonIcon sx={{ fontSize: 80, color: 'white' }} />
                </Box>
              </Box>
              <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                <Typography variant="h5" component="div" gutterBottom>
                  Nguyễn Thanh Thuý
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Frontend Developer
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chịu trách nhiệm thiết kế và phát triển giao diện người dùng,
                  và viết báo cáo cho dự án.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Team Member 2 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 8
                }
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    backgroundColor: 'secondary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '4px solid',
                    borderColor: 'secondary.main'
                  }}
                >
                  <PersonIcon sx={{ fontSize: 80, color: 'white' }} />
                </Box>
              </Box>
              <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                <Typography variant="h5" component="div" gutterBottom>
                  Lương Thị Mỹ Duyên
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Project Lead
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chịu trách nhiệm thiết kế và phát triển giao diện người dùng, quản lý và điều phối các hoạt động của nhóm.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Team Member 3 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 8
                }
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    backgroundColor: 'info.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '4px solid',
                    borderColor: 'info.main'
                  }}
                >
                  <PersonIcon sx={{ fontSize: 80, color: 'white' }} />
                </Box>
              </Box>
              <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                <Typography variant="h5" component="div" gutterBottom>
                  Phan Việt Thành Đạt
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Hardware Engineer
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thiết kế và phát triển phần cứng của hệ thống cảm biến, đảm bảo thu thập
                  dữ liệu chính xác từ môi trường xung quanh.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Home;