    import { Line } from 'react-chartjs-2'
    import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    } from 'chart.js'

    ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
    )

    export default function LineChart({ data, options, title }) {
    const defaultOptions = {
        responsive: true,
        plugins: {
        legend: {
            position: 'top',
        },
        },
        maintainAspectRatio: false,
        ...options
    }

    return (
        <div className="w-full h-full">
        {title && <h4 className="text-lg font-normal mb-4 tracking-wide">{title}</h4>}
        <Line data={data} options={defaultOptions} />
        </div>
    )
    }