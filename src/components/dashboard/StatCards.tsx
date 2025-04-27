import React from 'react';
import { AlertTriangle, CheckCircle, Clock, Layers } from 'lucide-react';
import { ComplaintStats } from '../../types';

interface StatCardsProps {
  stats: ComplaintStats;
}

const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  const { total, byStatus, bySeverity } = stats;
  
  const cards = [
    {
      title: 'Total Issues',
      value: total,
      icon: <Layers className="text-blue-500" size={24} />,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Critical Issues',
      value: bySeverity.critical,
      icon: <AlertTriangle className="text-red-500" size={24} />,
      color: 'bg-red-50 border-red-200'
    },
    {
      title: 'In Progress',
      value: byStatus['in-progress'],
      icon: <Clock className="text-yellow-500" size={24} />,
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      title: 'Resolved',
      value: byStatus.resolved,
      icon: <CheckCircle className="text-green-500" size={24} />,
      color: 'bg-green-50 border-green-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className={`${card.color} border rounded-lg p-4 flex items-center transition-all duration-300 hover:shadow-md`}
        >
          <div className="mr-4">
            {card.icon}
          </div>
          <div>
            <h3 className="text-gray-600 text-sm font-medium">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;