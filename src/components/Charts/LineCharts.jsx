import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    Brush
} from 'recharts';
import {
    Card,
    Typography,
    Select,
    Spin,
    Alert,
    Checkbox,
    Space,
    Divider,
    Row,
    Col
} from 'antd';

const { Title, Text } = Typography;
const { Option } = Select;

const LineCharts = () => {
    const [sensorData, setSensorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMetrics, setSelectedMetrics] = useState(['temperature']);
    const [showGrid, setShowGrid] = useState(true);
    const [showBrush, setShowBrush] = useState(false);

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
                    // Process data - we want oldest to newest for time series
                    const processedData = result.data
                        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                        .map(item => ({
                            ...item,
                            formattedTime: formatTime(item.timestamp),
                            fullDate: formatDate(item.timestamp)
                        }));

                    setSensorData(processedData);
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
        { label: 'Temperature (°C)', value: 'temperature', color: '#FF5733' },
        { label: 'Humidity (%)', value: 'humidity', color: '#33A1FF' },
        { label: 'PM2.5 (μg/m³)', value: 'pm25', color: '#E633FF' },
        { label: 'CO2 (ppm)', value: 'co2', color: '#33FF57' },
        { label: 'CO (ppm)', value: 'co', color: '#FFB733' }
    ];

    const getMetricColor = (metric) => {
        const option = metricOptions.find(opt => opt.value === metric);
        return option ? option.color : '#8884d8';
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

    const handleMetricChange = (value) => {
        setSelectedMetrics(value);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                }}>
                    <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>{payload[0].payload.fullDate}</p>
                    {payload.map((entry, index) => {
                        const metric = entry.dataKey;
                        const option = metricOptions.find(opt => opt.value === metric);
                        const label = option ? option.label : metric;

                        return (
                            <p key={index} style={{ margin: '0', color: entry.color }}>
                                {`${label}: ${entry.value} ${getMetricUnit(metric)}`}
                            </p>
                        );
                    })}
                </div>
            );
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

    // Find min and max values for each metric for better visualization
    const getYDomain = (metric) => {
        const values = sensorData.map(item => parseFloat(item[metric]));
        const min = Math.min(...values);
        const max = Math.max(...values);
        // Add some padding
        const padding = (max - min) * 0.1;
        return [Math.max(0, min - padding), max + padding];
    };

    return (
        <div>
            <Title level={2}>Sensor Data Trends</Title>
            <Text type="secondary">Visualize sensor data changes over time with interactive line charts</Text>

            <Divider />

            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col span={24}>
                    <Card>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Space>
                                <div>
                                    <Text strong>Select Metrics:</Text>
                                    <Select
                                        mode="multiple"
                                        style={{ width: 500, marginLeft: 16 }}
                                        placeholder="Select metrics to display"
                                        value={selectedMetrics}
                                        onChange={handleMetricChange}
                                        optionLabelProp="label"
                                    >
                                        {metricOptions.map(option => (
                                            <Option key={option.value} value={option.value} label={option.label}>
                                                <Space>
                                                    <span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: option.color, borderRadius: '50%' }}></span>
                                                    <span>{option.label}</span>
                                                </Space>
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            </Space>

                            <Space style={{ marginTop: 8 }}>
                                <Checkbox checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)}>
                                    Show Grid
                                </Checkbox>
                                <Checkbox checked={showBrush} onChange={(e) => setShowBrush(e.target.checked)}>
                                    Enable Time Slider
                                </Checkbox>
                            </Space>

                            <ResponsiveContainer width="100%" height={450}>
                                <LineChart
                                    data={sensorData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                >
                                    {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                                    <XAxis
                                        dataKey="formattedTime"
                                        label={{ value: 'Time', position: 'insideBottomRight', offset: -10 }}
                                    />

                                    {selectedMetrics.length > 0 && (
                                        <YAxis
                                            yAxisId="left"
                                            domain={getYDomain(selectedMetrics[0])}
                                            label={{
                                                value: metricOptions.find(opt => opt.value === selectedMetrics[0])?.label || '',
                                                angle: -90,
                                                position: 'insideLeft'
                                            }}
                                        />
                                    )}

                                    {selectedMetrics.length > 1 && (
                                        <YAxis
                                            yAxisId="right"
                                            orientation="right"
                                            domain={getYDomain(selectedMetrics[1])}
                                            label={{
                                                value: metricOptions.find(opt => opt.value === selectedMetrics[1])?.label || '',
                                                angle: 90,
                                                position: 'insideRight'
                                            }}
                                        />
                                    )}

                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />

                                    {selectedMetrics.map((metric, index) => {
                                        const yAxisId = index === 0 || (index > 1 && index % 2 === 0) ? "left" : "right";
                                        return (
                                            <Line
                                                key={metric}
                                                type="monotone"
                                                dataKey={metric}
                                                name={metricOptions.find(opt => opt.value === metric)?.label || metric}
                                                stroke={getMetricColor(metric)}
                                                activeDot={{ r: 6 }}
                                                yAxisId={yAxisId}
                                                strokeWidth={2}
                                                dot={{ strokeWidth: 2 }}
                                            />
                                        );
                                    })}

                                    {showBrush && (
                                        <Brush
                                            dataKey="formattedTime"
                                            height={30}
                                            stroke="#8884d8"
                                            startIndex={Math.max(0, sensorData.length - 5)}
                                        />
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title="About This Chart">
                        <Typography.Paragraph>
                            This line chart visualizes sensor data trends over time. You can:
                        </Typography.Paragraph>
                        <ul>
                            <li><strong>Select multiple metrics</strong> to compare different measurements simultaneously</li>
                            <li><strong>View detailed information</strong> by hovering over data points</li>
                            <li><strong>Enable the time slider</strong> to focus on specific time periods</li>
                            <li><strong>Toggle the grid</strong> for clearer visualization</li>
                        </ul>
                        <Typography.Paragraph>
                            The first two metrics selected will use separate Y-axes (left and right) for clearer comparison
                            when the scales differ significantly.
                        </Typography.Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default LineCharts;