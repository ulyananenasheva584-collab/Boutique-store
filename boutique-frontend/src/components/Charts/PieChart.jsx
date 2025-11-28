import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ data, title }) {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        family: 'Inter',
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'black',
                borderWidth: 1,
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            },
            title: {
                display: !!title,
                text: title,
                font: {
                    size: 16,
                    family: 'Inter',
                    weight: '600'
                },
                color: '#000000'
            }
        },
        onClick: (event, elements) => {
            if (elements.length > 0 && data.onBarClick) {
                const element = elements[0];
                const index = element.index;
                
                data.onBarClick({
                    index,
                    label: data.labels[index],
                    value: data.datasets[0].data[index],
                    dataset: data.datasets[0].label
                });
            }
        },
        onHover: (event, elements) => {
            event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
        }
    };

    const chartData = {
        labels: data.labels,
        datasets: data.datasets.map(dataset => ({
            ...dataset,
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverBorderColor: '#000000',
            hoverBorderWidth: 3,
        }))
    };

    return (
        <div className="w-full h-full">
            <Pie data={chartData} options={options} />
        </div>
    );
}