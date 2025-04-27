import React, { useEffect, useRef } from 'react';
import { ComplaintStats, IssueType, Severity } from '../../types';

interface ComplaintChartsProps {
  stats: ComplaintStats;
}

const ComplaintCharts: React.FC<ComplaintChartsProps> = ({ stats }) => {
  const typeChartRef = useRef<HTMLDivElement>(null);
  const severityChartRef = useRef<HTMLDivElement>(null);
  
  // Generate bar charts using simple DOM manipulation
  // In a real app, you'd use a library like Chart.js or D3.js
  useEffect(() => {
    const createChart = (ref: React.RefObject<HTMLDivElement>, data: Record<string, number>, labels: Record<string, string>, colors: Record<string, string>) => {
      if (!ref.current) return;
      
      const chartContainer = ref.current;
      chartContainer.innerHTML = '';
      
      // Find the maximum value for scaling
      const maxValue = Math.max(...Object.values(data));
      
      // Create bars
      Object.entries(data).forEach(([key, value]) => {
        const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
        
        const barContainer = document.createElement('div');
        barContainer.className = 'flex items-center mb-2';
        
        const labelEl = document.createElement('div');
        labelEl.className = 'w-24 text-sm text-gray-600';
        labelEl.textContent = labels[key] || key;
        
        const barWrap = document.createElement('div');
        barWrap.className = 'flex-1 bg-gray-100 rounded-full h-4';
        
        const bar = document.createElement('div');
        bar.className = `h-4 rounded-full transition-all duration-500 ${colors[key] || 'bg-blue-500'}`;
        bar.style.width = '0%';
        
        const valueEl = document.createElement('div');
        valueEl.className = 'ml-2 text-sm font-medium text-gray-700';
        valueEl.textContent = value.toString();
        
        barWrap.appendChild(bar);
        barContainer.appendChild(labelEl);
        barContainer.appendChild(barWrap);
        barContainer.appendChild(valueEl);
        chartContainer.appendChild(barContainer);
        
        // Animate the bar width after a small delay
        setTimeout(() => {
          bar.style.width = `${percentage}%`;
        }, 100);
      });
    };
    
    // Chart configurations
    const typeLabels: Record<string, string> = {
      road: 'Road',
      water: 'Water',
      electricity: 'Electricity',
      sanitation: 'Sanitation',
      other: 'Other'
    };
    
    const typeColors: Record<string, string> = {
      road: 'bg-orange-500',
      water: 'bg-blue-500',
      electricity: 'bg-yellow-500',
      sanitation: 'bg-green-500',
      other: 'bg-gray-500'
    };
    
    const severityLabels: Record<string, string> = {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical'
    };
    
    const severityColors: Record<string, string> = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500'
    };
    
    // Create the charts
    createChart(typeChartRef, stats.byType, typeLabels, typeColors);
    createChart(severityChartRef, stats.bySeverity, severityLabels, severityColors);
  }, [stats]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Issues by Type</h3>
        <div ref={typeChartRef} className="space-y-2">
          {/* Chart will be rendered here */}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Issues by Severity</h3>
        <div ref={severityChartRef} className="space-y-2">
          {/* Chart will be rendered here */}
        </div>
      </div>
    </div>
  );
};

export default ComplaintCharts;