import React, { useState, useEffect } from 'react';
// Add Cell to your imports
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LabelList,
    Cell  // Add this line
} from 'recharts';
import {
    Card,
    Typography,
    Select,
    Spin,
    Alert,
    Radio,
    Space,
    Divider,
    Row,
    Col
} from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const BarCharts = () => {
    const [sensorData, setSensorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMetric, setSelectedMetric] = useState('temperature');
    const [chartType, setChartType] = useState('comparison');

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
                    // Reverse data to show oldest to newest for time series
                    setSensorData(result.data.reverse());
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
    }, []);

    // Format time for display
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const metricOptions = [
        { label: 'Temperature (°C)', value: 'temperature' },
        { label: 'Humidity (%)', value: 'humidity' },
        { label: 'PM2.5 (μg/m³)', value: 'pm25' },
        { label: 'CO2 (ppm)', value: 'co2' },
        { label: 'CO (ppm)', value: 'co' }
    ];

    // Prepare data for comparison chart (latest reading)
    const getComparisonData = () => {
        if (sensorData.length === 0) return [];

        const latestReading = sensorData[sensorData.length - 1];
        return [
            { name: 'Temperature', value: latestReading.temperature, unit: '°C', fill: '#8884d8' },
            { name: 'Humidity', value: latestReading.humidity, unit: '%', fill: '#82ca9d' },
            { name: 'PM2.5', value: latestReading.pm25, unit: 'μg/m³', fill: '#ffc658' },
            { name: 'CO2', value: latestReading.co2, unit: 'ppm', fill: '#ff8042' },
            { name: 'CO', value: latestReading.co, unit: 'ppm', fill: '#a4de6c' }
        ];
    };

    // Prepare data for time series (single metric over time)
    const getTimeSeriesData = () => {
        return sensorData.map(reading => ({
            name: formatTime(reading.timestamp),
            [selectedMetric]: reading[selectedMetric],
            fullDate: formatDate(reading.timestamp)
        }));
    };

    const getMetricColor = () => {
        switch (selectedMetric) {
            case 'temperature': return '#8884d8';
            case 'humidity': return '#82ca9d';
            case 'pm25': return '#ffc658';
            case 'co2': return '#ff8042';
            case 'co': return '#a4de6c';
            default: return '#8884d8';
        }
    };

    const getMetricUnit = () => {
        switch (selectedMetric) {
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
            if (chartType === 'comparison') {
                return (
                    <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
                        <p className="label">{`${payload[0].payload.name}: ${payload[0].value} ${payload[0].payload.unit}`}</p>
                    </div>
                );
            } else {
                return (
                    <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
                        <p className="label">{`Time: ${payload[0].payload.fullDate}`}</p>
                        <p className="desc">{`${selectedMetric}: ${payload[0].value} ${getMetricUnit()}`}</p>
                    </div>
                );
            }
        }
        return null;
    };

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
                description={`Failed to load chart data: ${error}`}
                type="error"
                showIcon
            />
        );
    }

    return (
        <div>
            <Title level={2}>Sensor Data Analysis</Title>
            <Text type="secondary">Visualize sensor readings with interactive bar charts</Text>

            <Divider />

            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col span={24}>
                    <Card>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Radio.Group
                                value={chartType}
                                onChange={(e) => setChartType(e.target.value)}
                                buttonStyle="solid"
                                style={{ marginBottom: 16 }}
                            >
                                <Radio.Button value="comparison">Metric Comparison</Radio.Button>
                                <Radio.Button value="timeSeries">Time Series</Radio.Button>
                            </Radio.Group>

                            {chartType === 'timeSeries' && (
                                <Select
                                    style={{ width: 200, marginBottom: 16 }}
                                    value={selectedMetric}
                                    onChange={setSelectedMetric}
                                >
                                    {metricOptions.map(option => (
                                        <Option key={option.value} value={option.value}>{option.label}</Option>
                                    ))}
                                </Select>
                            )}

                            <ResponsiveContainer width="100%" height={400}>
                                {chartType === 'comparison' ? (
                                    <BarChart
                                        data={getComparisonData()}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="value" name="Value" fill="#8884d8">
                                            <LabelList dataKey="value" position="top" />
                                            {getComparisonData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                ) : (
                                    <BarChart
                                        data={getTimeSeriesData()}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar
                                            dataKey={selectedMetric}
                                            name={metricOptions.find(option => option.value === selectedMetric)?.label || selectedMetric}
                                            fill={getMetricColor()}>
                                            <LabelList dataKey={selectedMetric} position="top" />
                                        </Bar>
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title="About This Chart">
                        <Typography.Paragraph>
                            This chart visualizes sensor data collected from environmental sensors. You can view either:
                        </Typography.Paragraph>
                        <ul>
                            <li><strong>Metric Comparison</strong> - Compare different metrics from the latest reading</li>
                            <li><strong>Time Series</strong> - Track a single metric over time</li>
                        </ul>
                        <Typography.Paragraph>
                            Use the controls above the chart to switch between views and select different metrics.
                        </Typography.Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default BarCharts;