    import { useRef, useEffect } from 'react';

    export default function BarChart({ data, title }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !data) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Очищаем canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Устанавливаем размеры
        const width = canvas.width;
        const height = canvas.height;
        const padding = { top: 50, right: 30, bottom: 60, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        if (!data.labels || !data.datasets || data.datasets.length === 0) {
        // Стильное сообщение об отсутствии данных
        ctx.fillStyle = '#666';
        ctx.font = '14px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Нет данных для отображения', width / 2, height / 2);
        return;
        }

        const maxValue = Math.max(...data.datasets[0].data);
        const barWidth = chartWidth / data.labels.length * 0.7;
        const spacing = chartWidth / data.labels.length * 0.3;

        // Фон графика
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Сетка
        ctx.strokeStyle = '#F0F0F0';
        ctx.lineWidth = 1;
        
        // Горизонтальные линии сетки
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (chartHeight / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
        }

        // Оси
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        // Y ось
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.stroke();

        // X ось
        ctx.beginPath();
        ctx.moveTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();

        // Рисуем столбцы с современным дизайном
        data.datasets.forEach((dataset, datasetIndex) => {
        const baseColor = dataset.backgroundColor || '#000000';
        
        dataset.data.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = padding.left + index * (barWidth + spacing) + spacing / 2;
            const y = height - padding.bottom - barHeight;
            
            // Градиент для столбца
            const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(1, '#333333');
            
            // Тень столбца
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            // Столбец
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Сброс тени для обводки
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // Тонкая обводка
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, barWidth, barHeight);
            
            // Значения над столбцами
            ctx.fillStyle = '#000000';
            ctx.font = '600 11px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(
            value.toLocaleString(), 
            x + barWidth / 2, 
            y - 8
            );
            
            // Подписи категорий
            ctx.fillStyle = '#666666';
            ctx.font = '500 12px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(
            data.labels[index], 
            x + barWidth / 2, 
            height - padding.bottom + 15
            );
        });
        });

        // Заголовок графика
        if (title) {
        ctx.fillStyle = '#000000';
        ctx.font = '600 16px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(title, width / 2, 20);
        }

        // Подпись оси Y
        ctx.save();
        ctx.translate(20, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#666666';
        ctx.font = '500 12px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Значения', 0, 0);
        ctx.restore();

        // Легенда (если несколько datasets)
        if (data.datasets.length > 1) {
        const legendX = width - padding.right;
        const legendY = padding.top - 10;
        
        data.datasets.forEach((dataset, index) => {
            const legendItemY = legendY + index * 20;
            
            // Цвет легенды
            ctx.fillStyle = dataset.backgroundColor || '#000000';
            ctx.fillRect(legendX - 60, legendItemY, 12, 12);
            
            // Текст легенды
            ctx.fillStyle = '#000000';
            ctx.font = '500 11px "Inter", sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            ctx.fillText(dataset.label, legendX - 45, legendItemY);
        });
        }

    }, [data, title]);

    return (
        <div className="w-full h-full bg-white rounded-lg">
        <canvas 
            ref={canvasRef}
            width={600}
            height={320}
            className="w-full h-full rounded-lg"
        />
        </div>
    );
    }