import React, { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Brush
} from 'recharts';
import { Card, Typography, Select, Radio, Spin, Alert, DatePicker, Space, Row, Col } from 'antd';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, query, limitToLast, orderByKey } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAzuloKPhOSsoDTKw4Ks4Gx0mvw_h6Sj3s",
    authDomain: "project-3680597276515843100.firebaseapp.com",
    databaseURL: "https://project-3680597276515843100-default-rtdb.firebaseio.com",
    projectId: "project-3680597276515843100",
    storageBucket: "project-3680597276515843100.firebasestorage.app",
    messagingSenderId: "731837625507",
    appId: "1:731837625507:web:796e97dd31c11f88307b16"
};

// Initialize Firebase if not already initialized
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    // App already initialized
    app = initializeApp(firebaseConfig, "area-charts");
}

const database = getDatabase(app);
const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AreaCharts = () => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMetrics, setSelectedMetrics] = useState(['temperature', 'humidity']);
    const [timeRange, setTimeRange] = useState('24h'); // '24h', '7d', '30d', 'custom'
    const [dateRange, setDateRange] = useState(null);
    const [chartType, setChartType] = useState('stacked'); // 'stacked', 'overlay'

    useEffect(() => {
        fetchSensorData();
    }, [timeRange, dateRange]);

    const fetchSensorData = async () => {
        setLoading(true);
        try {
            // Set limit based on time range
            let limit = 100; // Default
            switch (timeRange) {
                case '24h':
                    limit = 150; // Assuming readings every 10 minutes
                    break;
                case '7d':
                    limit = 200; // Enough samples for a week
                    break;
                case '30d':
                    limit = 300; // Enough samples for a month
                    break;
                case 'custom':
                    limit = 500; // For custom range, get more data then filter
                    break;
                default:
                    limit = 150;
            }

            // Query Firebase for sensor data
            const historyRef = query(
                ref(database, '/air_quality'),
                orderByKey(),
                limitToLast(limit)
            );

            const unsubscribe = onValue(historyRef, (snapshot) => {
                try {
                    const data = snapshot.val();
                    if (data) {
                        // Convert object to array and filter out 'latest' entry
                        let dataArray = Object.entries(data)
                            .filter(([key]) => key !== 'latest')
                            .map(([key, value]) => ({
                                id: key,
                                ...value,
                                // Create a date object for filtering
                                dateObject: new Date(
                                    typeof value.timestamp === 'number'
                                        ? value.timestamp * (value.timestamp < 10000000000 ? 1000 : 1)
                                        : value.timestamp
                                ),
                                // Use co_corrected for CO values
                                co: value.co_corrected
                            }))
                            .sort((a, b) => a.dateObject - b.dateObject);

                        // Filter by date range if custom
                        if (timeRange === 'custom' && dateRange && dateRange.length === 2) {
                            const startDate = dateRange[0].startOf('day');
                            const endDate = dateRange[1].endOf('day');

                            dataArray = dataArray.filter(item => {
                                const itemDate = item.dateObject;
                                return itemDate >= startDate && itemDate <= endDate;
                            });
                        }

                        setChartData(dataArray);
                        console.log("Loaded area chart data:", dataArray.length, "entries");
                    }
                } catch (err) {
                    console.error("Error processing historical data:", err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }, (err) => {
                console.error("Firebase error:", err);
                setError(err.message);
                setLoading(false);
            });

            // Clean up listener
            return () => unsubscribe();
        } catch (err) {
            console.error('Error fetching sensor data:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';

        // Handle different timestamp formats
        let date;
        if (typeof timestamp === 'object' && timestamp instanceof Date) {
            date = timestamp;
        } else if (typeof timestamp === 'number') {
            // Unix timestamp (in seconds or milliseconds)
            date = new Date(timestamp * (timestamp < 10000000000 ? 1000 : 1));
        } else if (typeof timestamp === 'string') {
            // ISO string or other date string
            date = new Date(timestamp);
        } else {
            return 'Invalid date';
        }

        // Check if date is valid
        if (isNaN(date.getTime())) return 'Invalid date';

        // Format for Vietnam timezone (UTC+7)
        return new Intl.DateTimeFormat('vi-VN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const handleMetricsChange = (value) => {
        setSelectedMetrics(value);
    };

    const handleTimeRangeChange = (e) => {
        setTimeRange(e.target.value);
        // Reset date range when switching to non-custom ranges
        if (e.target.value !== 'custom') {
            setDateRange(null);
        }
    };

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
        // Switch to custom time range when dates are selected
        if (dates) {
            setTimeRange('custom');
        }
    };

    const handleChartTypeChange = (e) => {
        setChartType(e.target.value);
    };

    const getMetricColor = (metric) => {
        switch (metric) {
            case 'temperature': return '#FF5733';
            case 'humidity': return '#33A1FF';
            case 'pm25': return '#E633FF';
            case 'co2': return '#33FF57';
            case 'co': return '#FFB733';
            default: return '#000000';
        }
    };

    const getMetricUnit = (metric) => {
        switch (metric) {
            case 'temperature': return '°C';
            case 'humidity': return '%';
            case 'pm25': return 'μg/m³';
            case 'co2': return 'ppm';
            case 'co': return 'ppm';
            default: return '';
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Card style={{ padding: '10px', border: '1px solid #ccc', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{formatDate(label)}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ margin: '5px 0', color: entry.color }}>
                            {`${entry.name}: ${parseFloat(entry.value).toFixed(1)} ${getMetricUnit(entry.dataKey)}`}
                        </p>
                    ))}
                </Card>
            );
        }
        return null;
    };

    // For metric display names
    const getMetricDisplayName = (metric) => {
        switch (metric) {
            case 'temperature': return 'Temperature';
            case 'humidity': return 'Humidity';
            case 'pm25': return 'PM2.5';
            case 'co2': return 'CO2';
            case 'co': return 'CO';
            default: return metric;
        }
    };

    // Don't render anything until data is loaded
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Error Loading Chart Data"
                description={error}
                type="error"
                showIcon
            />
        );
    }

    return (
        <Card>
            <Title level={4}>Sensor Data Trends</Title>

            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col xs={24} md={8}>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Metrics:</label>
                        <Select
                            mode="multiple"
                            placeholder="Select metrics"
                            value={selectedMetrics}
                            onChange={handleMetricsChange}
                            style={{ width: '100%' }}
                        >
                            <Option value="temperature">Temperature (°C)</Option>
                            <Option value="humidity">Humidity (%)</Option>
                            <Option value="pm25">PM2.5 (μg/m³)</Option>
                            <Option value="co2">CO2 (ppm)</Option>
                            <Option value="co">CO (ppm)</Option>
                        </Select>
                    </div>
                </Col>
                <Col xs={24} md={8}>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Time Range:</label>
                        <Radio.Group value={timeRange} onChange={handleTimeRangeChange}>
                            <Radio.Button value="24h">24h</Radio.Button>
                            <Radio.Button value="7d">7d</Radio.Button>
                            <Radio.Button value="30d">30d</Radio.Button>
                            <Radio.Button value="custom">Custom</Radio.Button>
                        </Radio.Group>
                    </div>
                    {timeRange === 'custom' && (
                        <div style={{ marginBottom: '10px' }}>
                            <RangePicker onChange={handleDateRangeChange} value={dateRange} />
                        </div>
                    )}
                </Col>
                <Col xs={24} md={8}>
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Chart Type:</label>
                        <Radio.Group value={chartType} onChange={handleChartTypeChange}>
                            <Radio.Button value="stacked">Stacked</Radio.Button>
                            <Radio.Button value="overlay">Overlay</Radio.Button>
                        </Radio.Group>
                    </div>
                </Col>
            </Row>

            <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="dateObject"
                        tickFormatter={formatDate}
                        padding={{ left: 20, right: 20 }}
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Brush dataKey="dateObject" height={30} stroke="#8884d8" tickFormatter={formatDate} />

                    {/* Render selected metrics as area charts */}
                    {selectedMetrics.map((metric) => (
                        <Area
                            key={metric}
                            type="monotone"
                            dataKey={metric}
                            name={getMetricDisplayName(metric)}
                            stroke={getMetricColor(metric)}
                            fill={getMetricColor(metric)}
                            fillOpacity={chartType === 'stacked' ? 0.8 : 0.3}
                            stackId={chartType === 'stacked' ? 'stack' : metric}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>

            <div style={{ marginTop: 20, textAlign: 'center', color: '#666' }}>
                <p>
                    {chartData.length} data points displayed.
                    {timeRange !== 'custom' ? ` Showing last ${timeRange === '24h' ? '24 hours' : timeRange === '7d' ? '7 days' : '30 days'}.` : ''}
                    {timeRange === 'custom' && dateRange ?
                        ` Showing data from ${dateRange[0].format('YYYY-MM-DD')} to ${dateRange[1].format('YYYY-MM-DD')}.` : ''}
                </p>
            </div>
        </Card>
    );
};

export default AreaCharts;