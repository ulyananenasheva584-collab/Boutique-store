    import { useRef, useEffect } from 'react';

    export default function PieChart({ data, title, options = {} }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !data) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Очищаем canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 40;

        if (!data.labels || !data.datasets || data.datasets.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '14px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Нет данных для отображения', centerX, centerY);
        return;
        }

        const dataset = data.datasets[0];
        const total = dataset.data.reduce((sum, value) => sum + value, 0);
        
        // Черно-белая палитра с градациями
        const colors = [
        '#000000', // Чёрный
        '#333333', // Тёмно-серый
        '#666666', // Серый
        '#999999', // Средне-серый
        '#CCCCCC', // Светло-серый
        '#E5E5E5', // Очень светлый серый
        ];

        let startAngle = 0;

        // Рисуем секторы круговой диаграммы
        dataset.data.forEach((value, index) => {
        const sliceAngle = (2 * Math.PI * value) / total;
        const endAngle = startAngle + sliceAngle;

        // Сектор
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        // Градиент для сектора
        const gradient = ctx.createLinearGradient(
            centerX + Math.cos(startAngle) * radius,
            centerY + Math.sin(startAngle) * radius,
            centerX + Math.cos(endAngle) * radius,
            centerY + Math.sin(endAngle) * radius
        );
        gradient.addColorStop(0, colors[index % colors.length]);
        gradient.addColorStop(1, '#555555');

        ctx.fillStyle = gradient;
        ctx.fill();

        // Обводка сектора
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Подписи снаружи диаграммы
        const labelAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
        const labelY = centerY + Math.sin(labelAngle) * (radius + 20);

        // Линия к подписи
        ctx.beginPath();
        ctx.moveTo(centerX + Math.cos(labelAngle) * radius, centerY + Math.sin(labelAngle) * radius);
        ctx.lineTo(labelX, labelY);
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Текст подписи
        ctx.fillStyle = '#000000';
        ctx.font = '500 12px "Inter", sans-serif';
        ctx.textAlign = Math.cos(labelAngle) > 0 ? 'left' : 'right';
        
        const percentage = ((value / total) * 100).toFixed(1);
        const labelText = `${data.labels[index]} (${percentage}%)`;
        
        ctx.fillText(labelText, labelX + (Math.cos(labelAngle) > 0 ? 5 : -5), labelY);

        startAngle = endAngle;
        });

        // Центральный круг (дырка для пончика) - если указана опция cutout
        if (options.cutout) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        
        // Текст в центре
        ctx.fillStyle = '#000000';
        ctx.font = '600 14px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Всего', centerX, centerY - 10);
        
        ctx.fillStyle = '#666666';
        ctx.font = '500 12px "Inter", sans-serif';
        ctx.fillText(total.toString(), centerX, centerY + 10);
        }

        // Заголовок
        if (title) {
        ctx.fillStyle = '#000000';
        ctx.font = '600 16px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(title, centerX, 20);
        }

    }, [data, title, options]);

    return (
        <div className="w-full h-full bg-white rounded-lg">
        <canvas 
            ref={canvasRef}
            width={500}
            height={350}
            className="w-full h-full rounded-lg"
        />
        </div>
    );
    }