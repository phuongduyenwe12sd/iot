import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Statistic,
    Typography,
    Divider,
    Table,
    Tag,
    Spin,
    Alert,
    DatePicker,
    Space,
    Progress,
    Tooltip
} from 'antd';
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    Legend
} from 'recharts';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const Analytics = () => {
    const [sensorData, setSensorData] = useState([]);
    const [latestReading, setLatestReading] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState(null);
    const [stats, setStats] = useState({
        temperature: { min: 0, max: 0, avg: 0, current: 0, trend: 0 },
        humidity: { min: 0, max: 0, avg: 0, current: 0, trend: 0 },
        pm25: { min: 0, max: 0, avg: 0, current: 0, trend: 0 },
        co2: { min: 0, max: 0, avg: 0, current: 0, trend: 0 },
        co: { min: 0, max: 0, avg: 0, current: 0, trend: 0 }
    });

    useEffect(() => {
        fetchFirebaseData();
    }, []);

    const fetchFirebaseData = () => {
        try {
            setLoading(true);

            // Get the latest reading
            const latestRef = ref(database, '/air_quality/latest');
            const latestUnsubscribe = onValue(latestRef, (snapshot) => {
                try {
                    const data = snapshot.val();
                    if (data) {
                        console.log("Latest Firebase data:", data);
                        setLatestReading(data);

                        // Update current values in stats
                        setStats(prevStats => {
                            const newStats = { ...prevStats };
                            newStats.temperature.current = parseFloat(data.temperature);
                            newStats.humidity.current = parseFloat(data.humidity);
                            newStats.pm25.current = parseFloat(data.pm25);
                            newStats.co2.current = parseFloat(data.co2);
                            newStats.co.current = parseFloat(data.co_corrected);
                            return newStats;
                        });

                        setLoading(false);
                    }
                } catch (err) {
                    console.error("Error getting latest Firebase data:", err);
                    setError(err.message);
                    setLoading(false);
                }
            }, (err) => {
                console.error("Firebase latest error:", err);
                setError(err.message);
                setLoading(false);
            });

            // Get historical data (last 50 entries)
            const historyRef = query(
                ref(database, '/air_quality'),
                orderByKey(),
                limitToLast(50)
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
                            .sort((a, b) => {
                                // Convert timestamps for proper sorting
                                const timestampA = typeof a.timestamp === 'string' ?
                                    Date.parse(a.timestamp) : a.timestamp;
                                const timestampB = typeof b.timestamp === 'string' ?
                                    Date.parse(b.timestamp) : b.timestamp;
                                return timestampA - timestampB;
                            });

                        // Prepare data for display (use co_corrected for CO field)
                        const processedData = dataArray.map(item => ({
                            ...item,
                            co: item.co_corrected // Use co_corrected value for co field
                        }));

                        console.log("Historical Firebase data:", processedData);
                        setSensorData(processedData);
                        calculateStats(processedData);
                        setLoading(false);
                    }
                } catch (err) {
                    console.error("Error getting historical Firebase data:", err);
                    setError(err.message);
                    setLoading(false);
                }
            }, (err) => {
                console.error("Firebase history error:", err);
                setError(err.message);
                setLoading(false);
            });

            // Clean up listeners on component unmount
            return () => {
                latestUnsubscribe();
                historyUnsubscribe();
            };
        } catch (err) {
            console.error('Error setting up Firebase:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        if (!data || data.length === 0) return;

        const metrics = ['temperature', 'humidity', 'pm25', 'co2', 'co'];
        const calculatedStats = {};

        metrics.forEach(metric => {
            // For co, we use co_corrected from the original data
            const actualMetric = metric === 'co' ? 'co_corrected' : metric;

            const values = data.map(item => parseFloat(item[actualMetric]));
            const min = Math.min(...values);
            const max = Math.max(...values);
            const sum = values.reduce((acc, val) => acc + val, 0);
            const avg = sum / values.length;
            const current = values[values.length - 1];

            // Calculate trend (comparing current with average)
            const trend = ((current - avg) / avg) * 100;

            calculatedStats[metric] = { min, max, avg, current, trend };
        });

        setStats(calculatedStats);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';

        // Handle different timestamp formats
        let date;
        if (typeof timestamp === 'number') {
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

    const getStatusTag = (value, metric) => {
        let color = 'green';
        let text = 'Normal';
        let icon = <CheckCircleOutlined />;

        // Set thresholds based on metric
        switch (metric) {
            case 'temperature':
                if (value > 30) {
                    color = 'red';
                    text = 'High';
                    icon = <ExclamationCircleOutlined />;
                } else if (value < 20) {
                    color = 'blue';
                    text = 'Low';
                    icon = <InfoCircleOutlined />;
                }
                break;
            case 'humidity':
                if (value > 70) {
                    color = 'volcano';
                    text = 'Humid';
                    icon = <WarningOutlined />;
                } else if (value < 30) {
                    color = 'orange';
                    text = 'Dry';
                    icon = <WarningOutlined />;
                }
                break;
            case 'pm25':
                if (value > 15) {
                    color = 'red';
                    text = 'Unhealthy';
                    icon = <ExclamationCircleOutlined />;
                } else if (value > 10) {
                    color = 'orange';
                    text = 'Moderate';
                    icon = <WarningOutlined />;
                }
                break;
            case 'co2':
                if (value > 1000) {
                    color = 'red';
                    text = 'High';
                    icon = <ExclamationCircleOutlined />;
                } else if (value > 600) {
                    color = 'orange';
                    text = 'Elevated';
                    icon = <WarningOutlined />;
                }
                break;
            case 'co':
                if (value > 1) {
                    color = 'red';
                    text = 'Warning';
                    icon = <ExclamationCircleOutlined />;
                } else if (value > 0.5) {
                    color = 'orange';
                    text = 'Elevated';
                    icon = <WarningOutlined />;
                }
                break;
            default:
                break;
        }

        return <Tag icon={icon} color={color}>{text}</Tag>;
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

    const getTrendIcon = (trend) => {
        if (trend > 5) return <ArrowUpOutlined style={{ color: '#cf1322' }} />;
        if (trend < -5) return <ArrowDownOutlined style={{ color: '#3f8600' }} />;
        return null;
    };

    const getHealthIndex = () => {
        // Get the latest reading for calculations
        const latest = latestReading || (sensorData.length > 0 ? sensorData[sensorData.length - 1] : null);
        if (!latest) return { score: 0, status: 'Unknown' };

        // Simplified health index calculation based on latest readings
        let score = 100;

        // Reduce score based on pollutants and extreme conditions
        if (latest.pm25 > 15) score -= 20;
        else if (latest.pm25 > 10) score -= 10;

        if (latest.co2 > 1000) score -= 20;
        else if (latest.co2 > 600) score -= 10;

        if (latest.co_corrected > 1) score -= 30;
        else if (latest.co_corrected > 0.5) score -= 15;

        if (latest.temperature > 30 || latest.temperature < 18) score -= 10;
        if (latest.humidity > 70 || latest.humidity < 30) score -= 10;

        // Cap score between 0-100
        score = Math.max(0, Math.min(100, score));

        // Determine status
        let status = 'Excellent';
        let color = '#3f8600';

        if (score < 60) {
            status = 'Poor';
            color = '#cf1322';
        } else if (score < 80) {
            status = 'Moderate';
            color = '#fa8c16';
        } else if (score < 90) {
            status = 'Good';
            color = '#52c41a';
        }

        return { score, status, color };
    };

    const columns = [
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (text) => formatDate(text)
        },
        {
            title: 'Temperature (°C)',
            dataIndex: 'temperature',
            key: 'temperature',
            render: (text) => (
                <Space>
                    {parseFloat(text).toFixed(1)}
                    {getStatusTag(parseFloat(text), 'temperature')}
                </Space>
            )
        },
        {
            title: 'Humidity (%)',
            dataIndex: 'humidity',
            key: 'humidity',
            render: (text) => (
                <Space>
                    {parseFloat(text).toFixed(1)}
                    {getStatusTag(parseFloat(text), 'humidity')}
                </Space>
            )
        },
        {
            title: 'PM2.5 (μg/m³)',
            dataIndex: 'pm25',
            key: 'pm25',
            render: (text) => (
                <Space>
                    {parseFloat(text).toFixed(1)}
                    {getStatusTag(parseFloat(text), 'pm25')}
                </Space>
            )
        },
        {
            title: 'CO2 (ppm)',
            dataIndex: 'co2',
            key: 'co2',
            render: (text) => (
                <Space>
                    {parseFloat(text).toFixed(1)}
                    {getStatusTag(parseFloat(text), 'co2')}
                </Space>
            )
        },
        {
            title: 'CO (ppm)',
            dataIndex: 'co_corrected',
            key: 'co',
            render: (text) => (
                <Space>
                    {parseFloat(text).toFixed(1)}
                    {getStatusTag(parseFloat(text), 'co')}
                </Space>
            )
        }
    ];

    const healthIndex = getHealthIndex();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Error"
                description={`Failed to load analytics data: ${error}`}
                type="error"
                showIcon
            />
        );
    }

    return (
        <div>
            <Title level={2}>Sensor Analytics Dashboard</Title>
            <Text type="secondary">Comprehensive analysis of environmental sensor readings from Firebase</Text>

            <Divider />

            {/* Health Index */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col span={24}>
                    <Card>
                        <Row gutter={16} align="middle">
                            <Col xs={24} md={8}>
                                <Title level={4}>Environmental Health Index</Title>
                                <Paragraph>
                                    A composite score based on all sensor readings, indicating the overall environmental quality.
                                </Paragraph>
                            </Col>
                            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                                <Progress
                                    type="dashboard"
                                    percent={healthIndex.score}
                                    format={() => `${healthIndex.score}`}
                                    strokeColor={healthIndex.color}
                                    width={200}
                                />
                            </Col>
                            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                                <Statistic
                                    title="Status"
                                    value={healthIndex.status}
                                    valueStyle={{ color: healthIndex.color, fontSize: '2rem' }}
                                />
                                <Text>Last updated: {latestReading ? formatDate(latestReading.timestamp) : 'N/A'}</Text>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Key Metrics */}
            <Title level={4}>Key Metrics</Title>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                {Object.entries(stats).map(([metric, data]) => (
                    <Col xs={24} sm={12} md={8} lg={6} xl={4.8} key={metric}>
                        <Card>
                            <Statistic
                                title={
                                    <Tooltip title={`Min: ${data.min.toFixed(1)}, Max: ${data.max.toFixed(1)}, Avg: ${data.avg.toFixed(1)}`}>
                                        <Space>
                                            {metric.charAt(0).toUpperCase() + metric.slice(1)}
                                            <InfoCircleOutlined style={{ fontSize: '14px', cursor: 'pointer' }} />
                                        </Space>
                                    </Tooltip>
                                }
                                value={data.current}
                                precision={1}
                                valueStyle={{ color: getTrendIcon(data.trend) ? (data.trend > 0 ? '#cf1322' : '#3f8600') : undefined }}
                                prefix={getTrendIcon(data.trend)}
                                suffix={getMetricUnit(metric)}
                            />
                            <div style={{ marginTop: 10 }}>
                                {getStatusTag(data.current, metric)}
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Trend Chart */}
            <Title level={4}>Trend Analysis</Title>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col span={24}>
                    <Card>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                                data={sensorData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={formatDate}
                                    label={{ value: 'Time', position: 'insideBottomRight', offset: -10 }}
                                />
                                <YAxis />
                                <RechartsTooltip
                                    formatter={(value, name) => [
                                        `${value} ${getMetricUnit(name)}`,
                                        name.charAt(0).toUpperCase() + name.slice(1)
                                    ]}
                                    labelFormatter={formatDate}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="temperature" stroke="#FF5733" dot={false} />
                                <Line type="monotone" dataKey="humidity" stroke="#33A1FF" dot={false} />
                                <Line type="monotone" dataKey="pm25" stroke="#E633FF" dot={false} />
                                <Line type="monotone" dataKey="co2" stroke="#33FF57" dot={false} />
                                <Line type="monotone" dataKey="co_corrected" name="co" stroke="#FFB733" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Metric Comparison */}
            <Title level={4}>Metric Comparison</Title>
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col xs={24} md={12}>
                    <Card title="CO2 vs Temperature">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                                data={sensorData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="timestamp" tickFormatter={formatDate} />
                                <YAxis yAxisId="left" orientation="left" stroke="#FF5733" />
                                <YAxis yAxisId="right" orientation="right" stroke="#33FF57" />
                                <RechartsTooltip formatter={(value, name) => [
                                    `${value} ${name === 'co2' ? 'ppm' : '°C'}`,
                                    name === 'co2' ? 'CO2' : 'Temperature'
                                ]} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="temperature" fill="#FF5733" name="Temperature" />
                                <Bar yAxisId="right" dataKey="co2" fill="#33FF57" name="CO2" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="PM2.5 vs Humidity">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart
                                data={sensorData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="timestamp" tickFormatter={formatDate} />
                                <YAxis yAxisId="left" orientation="left" stroke="#E633FF" />
                                <YAxis yAxisId="right" orientation="right" stroke="#33A1FF" />
                                <RechartsTooltip formatter={(value, name) => [
                                    `${value} ${name === 'humidity' ? '%' : 'μg/m³'}`,
                                    name === 'humidity' ? 'Humidity' : 'PM2.5'
                                ]} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="pm25" fill="#E633FF" name="PM2.5" />
                                <Bar yAxisId="right" dataKey="humidity" fill="#33A1FF" name="Humidity" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Historical Data Table */}
            <Title level={4}>Historical Data</Title>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card>
                        <Table
                            dataSource={sensorData}
                            columns={columns}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            scroll={{ x: 'max-content' }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Analytics;