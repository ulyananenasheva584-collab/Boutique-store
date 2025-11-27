// TestCharts.jsx
import BarChart from './components/Charts/BarChart';

const testData = {
  labels: ['Янв', 'Фев', 'Мар'],
  datasets: [{
    label: 'Тест',
    data: [10, 20, 30],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  }]
};

export default function TestCharts() {
  return (
    <div className="h-64 w-full">
      <BarChart data={testData} title="Тестовый график" />
    </div>
  );
}