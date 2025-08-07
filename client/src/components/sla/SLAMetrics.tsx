import React from 'react';
import Icon from '../AppIcon';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: 'blue' | 'green' | 'red' | 'yellow';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
  };

  const changeColor = changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
                     changeType === 'negative' ? 'text-red-600 dark:text-red-400' :
                     'text-slate-500 dark:text-slate-400';

  const changeIcon = changeType === 'positive' ? 'TrendingUp' :
                    changeType === 'negative' ? 'TrendingDown' :
                    'Minus';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon name={icon as any} size={24} />
        </div>
        <div className={`flex items-center space-x-1 text-sm ${changeColor}`}>
          <Icon name={changeIcon as any} size={14} />
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </h3>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
          {value}
        </p>
      </div>
    </div>
  );
};

export default function SLAMetrics() {
  const metrics = [
    {
      title: 'Cumprimento SLA',
      value: '94.2%',
      change: 2.1,
      changeType: 'positive' as const,
      icon: 'Target',
      color: 'green' as const
    },
    {
      title: 'Tempo Médio Resposta',
      value: '2.4h',
      change: -15.3,
      changeType: 'positive' as const,
      icon: 'Clock',
      color: 'blue' as const
    },
    {
      title: 'Violações SLA',
      value: '8',
      change: 12.5,
      changeType: 'negative' as const,
      icon: 'AlertTriangle',
      color: 'red' as const
    },
    {
      title: 'Tickets Escalados',
      value: '5',
      change: -20.0,
      changeType: 'positive' as const,
      icon: 'ArrowUp',
      color: 'yellow' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}