import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';

const Charts = ({ data }) => {
    const weeklyData = Array.isArray(data.weekly) ? data.weekly : [];
    const monthlyData = Array.isArray(data.monthly) ? data.monthly : [];
    const quarterlyData = Array.isArray(data.quarterly) ? data.quarterly : [];
    const trendsData = Array.isArray(data.trends) ? data.trends : [];

    return (
        <div>
            <PieChart
                series={[
                    {
                        data: Object.values(data.weekly).map((item, index) => ({
                            id: index,
                            value: item.positive + item.negative,
                            label: `Week ${index + 1}`,
                        })),
                    },
                ]}
                width={400}
                height={200}
                style={{ marginBottom: '50px' }}
            />

            <PieChart
                series={[
                    {
                        data: data.monthly.map((item, index) => ({
                            id: index,
                            value: item.count,
                            label: item.name,
                        })),
                    },
                ]}
                width={400}
                height={200}
                style={{ marginBottom: '50px' }}
            />

            <PieChart
                series={[
                    {
                        data: Object.values(data.quarterly).map((item, index) => ({
                            id: index,
                            value: item.count,
                            label: item.name,
                        })),
                    },
                ]}
                width={400}
                height={200}
                style={{ marginBottom: '50px' }}
            />

            <BarChart
                series={[
                    {
                        data: data.trends.map((item, index) => ({
                            id: index,
                            value: item.positive,
                            label: `${item._id} - Positive`,
                        })),
                    },
                    {
                        data: data.trends.map((item, index) => ({
                            id: index + 100,
                            value: item.negative,
                            label: `${item._id} - Negative`,
                        })),
                    },
                ]}
                width={600}
                height={300}
                style={{ marginBottom: '50px' }}
            />
        </div>
    );
};

export default Charts;
