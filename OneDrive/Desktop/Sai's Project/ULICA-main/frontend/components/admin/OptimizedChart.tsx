'use client';

import { memo, useEffect, useRef, useState, useMemo } from 'react';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

const OptimizedChart = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Mock data - in real app, this would come from props or API
  const chartData: ChartData = useMemo(() => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Orders',
        data: [50, 80, 60, 100, 90, 120],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }
    ]
  }), []);

  useEffect(() => {
    const drawChart = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Chart dimensions
      const padding = 40;
      const chartWidth = rect.width - padding * 2;
      const chartHeight = rect.height - padding * 2;

      // Find min and max values
      const allValues = chartData.datasets.flatMap(dataset => dataset.data);
      const minValue = Math.min(...allValues);
      const maxValue = Math.max(...allValues);
      const valueRange = maxValue - minValue;

      // Draw grid lines
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      
      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
      }

      // Vertical grid lines
      for (let i = 0; i <= chartData.labels.length; i++) {
        const x = padding + (chartWidth / chartData.labels.length) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, padding + chartHeight);
        ctx.stroke();
      }

      // Draw datasets
      chartData.datasets.forEach((dataset, datasetIndex) => {
        ctx.strokeStyle = dataset.borderColor;
        ctx.fillStyle = dataset.backgroundColor;
        ctx.lineWidth = 2;

        // Draw line
        ctx.beginPath();
        dataset.data.forEach((value, index) => {
          const x = padding + (chartWidth / (chartData.labels.length - 1)) * index;
          const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        // Draw area under line
        ctx.beginPath();
        ctx.moveTo(padding, padding + chartHeight);
        dataset.data.forEach((value, index) => {
          const x = padding + (chartWidth / (chartData.labels.length - 1)) * index;
          const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
          ctx.lineTo(x, y);
        });
        ctx.lineTo(padding + chartWidth, padding + chartHeight);
        ctx.closePath();
        ctx.fill();

        // Draw data points
        ctx.fillStyle = dataset.borderColor;
        dataset.data.forEach((value, index) => {
          const x = padding + (chartWidth / (chartData.labels.length - 1)) * index;
          const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
          
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });
      });

      // Draw labels
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      
      chartData.labels.forEach((label, index) => {
        const x = padding + (chartWidth / (chartData.labels.length - 1)) * index;
        ctx.fillText(label, x, padding + chartHeight + 20);
      });

      // Draw legend
      const legendX = padding;
      const legendY = padding - 20;
      
      chartData.datasets.forEach((dataset, index) => {
        const legendItemX = legendX + index * 120;
        
        // Draw legend color
        ctx.fillStyle = dataset.borderColor;
        ctx.fillRect(legendItemX, legendY, 12, 12);
        
        // Draw legend text
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'left';
        ctx.fillText(dataset.label, legendItemX + 16, legendY + 9);
      });

      setIsLoaded(true);
    };

    // Use requestAnimationFrame for smooth rendering
    const animationFrame = requestAnimationFrame(drawChart);

    // Handle resize
    const handleResize = () => {
      drawChart();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [chartData]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-64"
        style={{ maxHeight: '256px' }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
});

OptimizedChart.displayName = 'OptimizedChart';

export default OptimizedChart;
