import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function BarChart({ data, title }) {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'black',
                borderWidth: 1,
                cornerRadius: 4,
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
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
        scales: {
            x: {
                grid: {
                    display: false
                },
                border: {
                    color: 'black'
                },
                ticks: {
                    font: {
                        family: 'Inter',
                        size: 12
                    }
                }
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                border: {
                    color: 'black'
                },
                ticks: {
                    font: {
                        family: 'Inter',
                        size: 12
                    },
                    callback: function(value) {
                        return value.toLocaleString();
                    }
                }
            }
        },
        onClick: (event, elements) => {
            if (elements.length > 0 && data.onBarClick) {
                const element = elements[0];
                const datasetIndex = element.datasetIndex;
                const index = element.index;
                
                data.onBarClick({
                    index,
                    label: data.labels[index],
                    value: data.datasets[datasetIndex].data[index],
                    dataset: data.datasets[datasetIndex].label
                });
            }
        },
        onHover: (event, elements) => {
            event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
        },
        interaction: {
            mode: 'nearest',
            intersect: false
        }
    };

    // Обрабатываем цвета для Chart.js
    const chartData = {
        labels: data.labels,
        datasets: data.datasets.map(dataset => ({
            ...dataset,
            backgroundColor: Array.isArray(dataset.backgroundColor) 
                ? dataset.backgroundColor 
                : [dataset.backgroundColor],
            borderColor: dataset.borderColor || dataset.backgroundColor,
            borderWidth: dataset.borderWidth || 1,
            borderRadius: dataset.borderRadius || 0,
            hoverBackgroundColor: dataset.hoverBackgroundColor || 'rgba(0, 0, 0, 0.7)',
            hoverBorderColor: dataset.hoverBorderColor || '#000000',
        }))
    };

    return (
        <div className="w-full h-full">
            <Bar data={chartData} options={options} />
        </div>
    );
}