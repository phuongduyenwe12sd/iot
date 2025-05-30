import React, { useState, useEffect, useRef } from 'react';
import {
    Row,
    Col,
    Card,
    Typography,
    Spin,
    Alert,
    Statistic,
    Badge,
    Space,
    Button,
    Divider,
    Switch,
    Progress,
    Tooltip
} from 'antd';
import {
    SyncOutlined,
    CheckCircleFilled,
    ExclamationCircleFilled,
    CloseCircleFilled,
    ReloadOutlined,
    DashboardOutlined
} from '@ant-design/icons';
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip as RechartsTooltip
} from 'recharts';

const { Title, Text } = Typography;

const Monitoring = () => {
    const [sensorData, setSensorData] = useState([]);
    const [latestReading, setLatestReading] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const timerRef = useRef(null);

    // Fetch data on component mount and set up auto-refresh
    useEffect(() => {
        fetchData();

        return () => {
            // Clean up timer on component unmount
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Set up or clear the auto-refresh timer when autoRefresh state changes
    useEffect(() => {
        if (autoRefresh) {
            timerRef.current = setInterval(fetchData, 30000); // Refresh every 30 seconds
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [autoRefresh]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost/sht30/test_data.php');

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();

            if (result.success) {
                const sortedData = result.data.sort(
                    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                );

                setSensorData(sortedData);
                setLatestReading(sortedData.length > 0 ? sortedData[0] : null);
                setLastUpdated(new Date());
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

    const formatTime = (date) => {
        if (!date) return '';
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Get status indicator for a sensor reading
    const getSensorStatus = (value, metric) => {
        // Define thresholds for each metric
        const thresholds = {
            temperature: { warning: [15, 30], danger: [10, 35] },
            humidity: { warning: [30, 70], danger: [20, 80] },
            pm25: { warning: [10, 15], danger: [0, 20] },
            co2: { warning: [600, 1000], danger: [0, 1500] },
            co: { warning: [0.5, 1], danger: [0, 2] }
        };

        const threshold = thresholds[metric];

        if (!threshold) return { status: 'normal', icon: <CheckCircleFilled style={{ color: '#52c41a' }} /> };

        if (value < threshold.danger[0] || value > threshold.danger[1]) {
            return { status: 'danger', icon: <CloseCircleFilled style={{ color: '#f5222d' }} /> };
        }

        if (value < threshold.warning[0] || value > threshold.warning[1]) {
            return { status: 'warning', icon: <ExclamationCircleFilled style={{ color: '#faad14' }} /> };
        }

        return { status: 'normal', icon: <CheckCircleFilled style={{ color: '#52c41a' }} /> };
    };

    // Calculate a percentage for gauge visualization
    const calculateGaugePercentage = (value, metric) => {
        const ranges = {
            temperature: { min: 0, max: 50 },
            humidity: { min: 0, max: 100 },
            pm25: { min: 0, max: 50 },
            co2: { min: 300, max: 2000 },
            co: { min: 0, max: 5 }
        };

        const range = ranges[metric];
        if (!range) return 0;

        const percentage = ((value - range.min) / (range.max - range.min)) * 100;
        return Math.max(0, Math.min(100, percentage));
    };

    // Get color for gauge based on sensor status
    const getGaugeColor = (status) => {
        switch (status) {
            case 'danger':
                return '#f5222d';
            case 'warning':
                return '#faad14';
            default:
                return '#52c41a';
        }
    };

    // Get recent data for mini charts (last 5 readings)
    const getRecentData = () => {
        if (sensorData.length <= 1) return [];
        return sensorData.slice(0, 5).reverse();
    };

    if (loading && !latestReading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error && !latestReading) {
        return (
            <Alert
                message="Error"
                description={`Failed to load monitoring data: ${error}`}
                type="error"
                showIcon
            />
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <Title level={2}>Real-time Sensor Monitoring</Title>
                    <Text type="secondary">
                        Monitor current environmental conditions from all sensors
                    </Text>
                </div>
                <Space>
                    <Text>Auto-refresh:</Text>
                    <Switch
                        checked={autoRefresh}
                        onChange={setAutoRefresh}
                        checkedChildren="ON"
                        unCheckedChildren="OFF"
                    />
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchData}
                        loading={loading}
                    >
                        Refresh Now
                    </Button>
                </Space>
            </div>

            {loading && (
                <Alert
                    message="Updating data..."
                    type="info"
                    showIcon
                    icon={<SyncOutlined spin />}
                    style={{ marginBottom: 16 }}
                />
            )}

            <div style={{ marginBottom: 16 }}>
                <Text type="secondary">
                    Last updated: {lastUpdated ? formatTime(lastUpdated) : 'Never'}
                    {latestReading && ` • Latest reading: ${formatDate(latestReading.timestamp)}`}
                </Text>
            </div>

            <Divider />

            <Row gutter={[16, 16]}>
                {latestReading && (
                    <>
                        {/* Temperature */}
                        <Col xs={24} sm={12} lg={8} xl={6}>
                            <Card hoverable>
                                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                    <DashboardOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                                    <Title level={4}>Temperature</Title>
                                </div>

                                <Progress
                                    type="dashboard"
                                    percent={calculateGaugePercentage(latestReading.temperature, 'temperature')}
                                    format={() => `${latestReading.temperature}°C`}
                                    width={150}
                                    strokeColor={getGaugeColor(getSensorStatus(latestReading.temperature, 'temperature').status)}
                                />

                                <div style={{ textAlign: 'center', marginTop: 16 }}>
                                    <Badge
                                        status={getSensorStatus(latestReading.temperature, 'temperature').status === 'normal' ? 'success' :
                                            getSensorStatus(latestReading.temperature, 'temperature').status === 'warning' ? 'warning' : 'error'}
                                        text={getSensorStatus(latestReading.temperature, 'temperature').status.toUpperCase()}
                                    />
                                </div>

                                <Divider style={{ margin: '16px 0' }} />

                                <ResponsiveContainer width="100%" height={60}>
                                    <AreaChart data={getRecentData()}>
                                        <RechartsTooltip
                                            formatter={(value) => [`${value}°C`, 'Temperature']}
                                            labelFormatter={(label) => formatDate(label)}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="temperature"
                                            stroke="#1890ff"
                                            fill="#e6f7ff"
                                            dot={{ stroke: '#1890ff', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>

                        {/* Humidity */}
                        <Col xs={24} sm={12} lg={8} xl={6}>
                            <Card hoverable>
                                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                    <DashboardOutlined style={{ fontSize: 24, color: '#13c2c2', marginBottom: 8 }} />
                                    <Title level={4}>Humidity</Title>
                                </div>

                                <Progress
                                    type="dashboard"
                                    percent={calculateGaugePercentage(latestReading.humidity, 'humidity')}
                                    format={() => `${latestReading.humidity}%`}
                                    width={150}
                                    strokeColor={getGaugeColor(getSensorStatus(latestReading.humidity, 'humidity').status)}
                                />

                                <div style={{ textAlign: 'center', marginTop: 16 }}>
                                    <Badge
                                        status={getSensorStatus(latestReading.humidity, 'humidity').status === 'normal' ? 'success' :
                                            getSensorStatus(latestReading.humidity, 'humidity').status === 'warning' ? 'warning' : 'error'}
                                        text={getSensorStatus(latestReading.humidity, 'humidity').status.toUpperCase()}
                                    />
                                </div>

                                <Divider style={{ margin: '16px 0' }} />

                                <ResponsiveContainer width="100%" height={60}>
                                    <AreaChart data={getRecentData()}>
                                        <RechartsTooltip
                                            formatter={(value) => [`${value}%`, 'Humidity']}
                                            labelFormatter={(label) => formatDate(label)}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="humidity"
                                            stroke="#13c2c2"
                                            fill="#e6fffb"
                                            dot={{ stroke: '#13c2c2', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>

                        {/* PM2.5 */}
                        <Col xs={24} sm={12} lg={8} xl={6}>
                            <Card hoverable>
                                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                    <DashboardOutlined style={{ fontSize: 24, color: '#722ed1', marginBottom: 8 }} />
                                    <Title level={4}>PM2.5</Title>
                                </div>

                                <Progress
                                    type="dashboard"
                                    percent={calculateGaugePercentage(latestReading.pm25, 'pm25')}
                                    format={() => `${latestReading.pm25}`}
                                    width={150}
                                    strokeColor={getGaugeColor(getSensorStatus(latestReading.pm25, 'pm25').status)}
                                />

                                <div style={{ textAlign: 'center', marginTop: 16 }}>
                                    <Badge
                                        status={getSensorStatus(latestReading.pm25, 'pm25').status === 'normal' ? 'success' :
                                            getSensorStatus(latestReading.pm25, 'pm25').status === 'warning' ? 'warning' : 'error'}
                                        text={getSensorStatus(latestReading.pm25, 'pm25').status.toUpperCase()}
                                    />
                                    <div style={{ marginTop: 4 }}>
                                        <Text type="secondary">μg/m³</Text>
                                    </div>
                                </div>

                                <Divider style={{ margin: '16px 0' }} />

                                <ResponsiveContainer width="100%" height={60}>
                                    <AreaChart data={getRecentData()}>
                                        <RechartsTooltip
                                            formatter={(value) => [`${value} μg/m³`, 'PM2.5']}
                                            labelFormatter={(label) => formatDate(label)}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="pm25"
                                            stroke="#722ed1"
                                            fill="#f9f0ff"
                                            dot={{ stroke: '#722ed1', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>

                        {/* CO2 */}
                        <Col xs={24} sm={12} lg={8} xl={6}>
                            <Card hoverable>
                                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                    <DashboardOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                                    <Title level={4}>CO2</Title>
                                </div>

                                <Progress
                                    type="dashboard"
                                    percent={calculateGaugePercentage(latestReading.co2, 'co2')}
                                    format={() => `${latestReading.co2}`}
                                    width={150}
                                    strokeColor={getGaugeColor(getSensorStatus(latestReading.co2, 'co2').status)}
                                />

                                <div style={{ textAlign: 'center', marginTop: 16 }}>
                                    <Badge
                                        status={getSensorStatus(latestReading.co2, 'co2').status === 'normal' ? 'success' :
                                            getSensorStatus(latestReading.co2, 'co2').status === 'warning' ? 'warning' : 'error'}
                                        text={getSensorStatus(latestReading.co2, 'co2').status.toUpperCase()}
                                    />
                                    <div style={{ marginTop: 4 }}>
                                        <Text type="secondary">ppm</Text>
                                    </div>
                                </div>

                                <Divider style={{ margin: '16px 0' }} />

                                <ResponsiveContainer width="100%" height={60}>
                                    <AreaChart data={getRecentData()}>
                                        <RechartsTooltip
                                            formatter={(value) => [`${value} ppm`, 'CO2']}
                                            labelFormatter={(label) => formatDate(label)}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="co2"
                                            stroke="#52c41a"
                                            fill="#f6ffed"
                                            dot={{ stroke: '#52c41a', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>

                        {/* CO */}
                        <Col xs={24} sm={12} lg={8} xl={6}>
                            <Card hoverable>
                                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                    <DashboardOutlined style={{ fontSize: 24, color: '#fa541c', marginBottom: 8 }} />
                                    <Title level={4}>Carbon Monoxide</Title>
                                </div>

                                <Progress
                                    type="dashboard"
                                    percent={calculateGaugePercentage(latestReading.co, 'co')}
                                    format={() => `${latestReading.co}`}
                                    width={150}
                                    strokeColor={getGaugeColor(getSensorStatus(latestReading.co, 'co').status)}
                                />

                                <div style={{ textAlign: 'center', marginTop: 16 }}>
                                    <Badge
                                        status={getSensorStatus(latestReading.co, 'co').status === 'normal' ? 'success' :
                                            getSensorStatus(latestReading.co, 'co').status === 'warning' ? 'warning' : 'error'}
                                        text={getSensorStatus(latestReading.co, 'co').status.toUpperCase()}
                                    />
                                    <div style={{ marginTop: 4 }}>
                                        <Text type="secondary">ppm</Text>
                                    </div>
                                </div>

                                <Divider style={{ margin: '16px 0' }} />

                                <ResponsiveContainer width="100%" height={60}>
                                    <AreaChart data={getRecentData()}>
                                        <RechartsTooltip
                                            formatter={(value) => [`${value} ppm`, 'CO']}
                                            labelFormatter={(label) => formatDate(label)}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="co"
                                            stroke="#fa541c"
                                            fill="#fff2e8"
                                            dot={{ stroke: '#fa541c', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>
                    </>
                )}
            </Row>

            {latestReading && (
                <>
                    <Divider orientation="left">Recent Trends</Divider>

                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card>
                                <Title level={4}>All Sensors - Last 5 Readings</Title>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart
                                        data={getRecentData()}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="timestamp"
                                            tickFormatter={(timestamp) => {
                                                const date = new Date(timestamp);
                                                return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                                            }}
                                        />
                                        <YAxis yAxisId="temp" orientation="left" domain={['auto', 'auto']} />
                                        <YAxis yAxisId="humidity" orientation="right" domain={[0, 100]} />
                                        <RechartsTooltip
                                            formatter={(value, name) => {
                                                switch (name) {
                                                    case 'temperature': return [`${value}°C`, 'Temperature'];
                                                    case 'humidity': return [`${value}%`, 'Humidity'];
                                                    case 'pm25': return [`${value} μg/m³`, 'PM2.5'];
                                                    case 'co2': return [`${value} ppm`, 'CO2'];
                                                    case 'co': return [`${value} ppm`, 'CO'];
                                                    default: return [value, name];
                                                }
                                            }}
                                            labelFormatter={(label) => formatDate(label)}
                                        />
                                        <Line yAxisId="temp" type="monotone" dataKey="temperature" stroke="#1890ff" dot={{ strokeWidth: 2 }} activeDot={{ r: 8 }} />
                                        <Line yAxisId="humidity" type="monotone" dataKey="humidity" stroke="#13c2c2" dot={{ strokeWidth: 2 }} activeDot={{ r: 8 }} />
                                        <Line yAxisId="temp" type="monotone" dataKey="pm25" stroke="#722ed1" dot={{ strokeWidth: 2 }} activeDot={{ r: 8 }} />
                                        <Line yAxisId="temp" type="monotone" dataKey="co2" stroke="#52c41a" dot={{ strokeWidth: 2 }} activeDot={{ r: 8 }} />
                                        <Line yAxisId="temp" type="monotone" dataKey="co" stroke="#fa541c" dot={{ strokeWidth: 2 }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default Monitoring;