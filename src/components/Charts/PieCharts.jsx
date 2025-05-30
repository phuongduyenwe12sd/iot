import React, { useState, useEffect } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    Sector
} from 'recharts';
import {
    Card,
    Typography,
    Radio,
    Select,
    Spin,
    Alert,
    Space,
    Divider,
    Row,
    Col,
    Statistic
} from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const PieCharts = () => {
    const [sensorData, setSensorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartMode, setChartMode] = useState('latest');
    const [selectedMetric, setSelectedMetric] = useState('temperature');
    const [activeIndex, setActiveIndex] = useState(0);

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
    }, []);

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

    // Colors for pie chart segments
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    // Get latest reading data for all metrics
    const getLatestData = () => {
        if (sensorData.length === 0) return [];

        const latestReading = sensorData[0];
        return [
            { name: 'Temperature', value: latestReading.temperature, unit: '°C', color: '#0088FE' },
            { name: 'Humidity', value: latestReading.humidity, unit: '%', color: '#00C49F' },
            { name: 'PM2.5', value: latestReading.pm25, unit: 'μg/m³', color: '#FFBB28' },
            { name: 'CO2', value: latestReading.co2, unit: 'ppm', color: '#FF8042' },
            { name: 'CO', value: latestReading.co, unit: 'ppm', color: '#8884d8' }
        ];
    };

    // Get distribution of a specific metric across time periods
    const getDistributionData = () => {
        if (sensorData.length === 0) return [];

        return sensorData.map((reading, index) => ({
            name: formatDate(reading.timestamp),
            value: reading[selectedMetric],
            unit: getMetricUnit(selectedMetric),
            color: COLORS[index % COLORS.length]
        }));
    };

    // Get relative proportions for comparison
    const getProportionsData = () => {
        if (sensorData.length === 0) return [];

        // Calculate total for normalization
        const latestReading = sensorData[0];
        const total = latestReading.temperature + latestReading.humidity +
            latestReading.pm25 + latestReading.co2 + latestReading.co;

        return [
            { name: 'Temperature', value: (latestReading.temperature / total) * 100, unit: '%', color: '#0088FE' },
            { name: 'Humidity', value: (latestReading.humidity / total) * 100, unit: '%', color: '#00C49F' },
            { name: 'PM2.5', value: (latestReading.pm25 / total) * 100, unit: '%', color: '#FFBB28' },
            { name: 'CO2', value: (latestReading.co2 / total) * 100, unit: '%', color: '#FF8042' },
            { name: 'CO', value: (latestReading.co / total) * 100, unit: '%', color: '#8884d8' }
        ];
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

    const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    // Animated active sector rendering
    const renderActiveShape = (props) => {
        const RADIAN = Math.PI / 180;
        const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
            fill, payload, percent, value } = props;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius + 10) * cos;
        const sy = cy + (outerRadius + 10) * sin;
        const mx = cx + (outerRadius + 30) * cos;
        const my = cy + (outerRadius + 30) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 22;
        const ey = my;
        const textAnchor = cos >= 0 ? 'start' : 'end';

        return (
            <g>
                <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
                    {payload.name}
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 6}
                    outerRadius={outerRadius + 10}
                    fill={fill}
                />
                <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">
                    {`${value} ${payload.unit}`}
                </text>
                <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                    {`(${(percent * 100).toFixed(2)}%)`}
                </text>
            </g>
        );
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                }}>
                    <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>{payload[0].name}</p>
                    <p style={{ margin: '0', color: payload[0].payload.color }}>
                        {`Value: ${payload[0].value} ${payload[0].payload.unit}`}
                    </p>
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

    // Get the appropriate data based on chart mode
    const getPieData = () => {
        switch (chartMode) {
            case 'latest':
                return getLatestData();
            case 'distribution':
                return getDistributionData();
            case 'proportions':
                return getProportionsData();
            default:
                return getLatestData();
        }
    };

    const pieData = getPieData();
    const latestReading = sensorData.length > 0 ? sensorData[0] : null;

    return (
        <div>
            <Title level={2}>Sensor Data Visualization</Title>
            <Text type="secondary">Analyze sensor data with interactive pie charts</Text>

            <Divider />

            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col span={24}>
                    <Card>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Radio.Group
                                value={chartMode}
                                onChange={(e) => setChartMode(e.target.value)}
                                buttonStyle="solid"
                                style={{ marginBottom: 16 }}
                            >
                                <Radio.Button value="latest">Latest Reading</Radio.Button>
                                <Radio.Button value="distribution">Time Distribution</Radio.Button>
                                <Radio.Button value="proportions">Relative Proportions</Radio.Button>
                            </Radio.Group>

                            {chartMode === 'distribution' && (
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

                            <Row gutter={16}>
                                <Col xs={24} md={16}>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <PieChart>
                                            <Pie
                                                activeIndex={activeIndex}
                                                activeShape={renderActiveShape}
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={chartMode === 'latest' ? 60 : 0}
                                                outerRadius={120}
                                                dataKey="value"
                                                onMouseEnter={onPieEnter}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Col>
                                <Col xs={24} md={8}>
                                    {latestReading && (
                                        <Card title="Latest Readings" style={{ height: '100%' }}>
                                            <Statistic
                                                title="Temperature"
                                                value={latestReading.temperature}
                                                suffix="°C"
                                                valueStyle={{ color: '#0088FE' }}
                                            />
                                            <Statistic
                                                title="Humidity"
                                                value={latestReading.humidity}
                                                suffix="%"
                                                valueStyle={{ color: '#00C49F' }}
                                            />
                                            <Statistic
                                                title="PM2.5"
                                                value={latestReading.pm25}
                                                suffix="μg/m³"
                                                valueStyle={{ color: '#FFBB28' }}
                                            />
                                            <Statistic
                                                title="CO2"
                                                value={latestReading.co2}
                                                suffix="ppm"
                                                valueStyle={{ color: '#FF8042' }}
                                            />
                                            <Statistic
                                                title="CO"
                                                value={latestReading.co}
                                                suffix="ppm"
                                                valueStyle={{ color: '#8884d8' }}
                                            />
                                            <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
                                                Timestamp: {formatDate(latestReading.timestamp)}
                                            </Text>
                                        </Card>
                                    )}
                                </Col>
                            </Row>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title="About This Chart">
                        <Paragraph>
                            This pie chart provides three visualization modes:
                        </Paragraph>
                        <ul>
                            <li><strong>Latest Reading</strong> - Shows all metrics from the most recent sensor reading</li>
                            <li><strong>Time Distribution</strong> - Displays how a selected metric varies across different time periods</li>
                            <li><strong>Relative Proportions</strong> - Visualizes the relative proportions of all metrics in percentage</li>
                        </ul>
                        <Paragraph>
                            Hover over or click on pie segments for detailed information. The side panel shows the latest readings for quick reference.
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default PieCharts;