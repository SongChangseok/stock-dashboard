import React from 'react';
import { Plus, TrendingUp, History, FileText, Target, Newspaper } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  onAddStock: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = React.memo(({ onAddStock }) => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Add Stock',
      description: 'Add new position to portfolio',
      icon: Plus,
      color: 'bg-spotify-green hover:bg-spotify-green-hover',
      onClick: onAddStock
    },
    {
      title: 'View Analytics',
      description: 'Advanced portfolio analysis',
      icon: TrendingUp,
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => navigate('/analytics')
    },
    {
      title: 'Portfolio History',
      description: 'Track performance over time',
      icon: History,
      color: 'bg-purple-600 hover:bg-purple-700',
      onClick: () => navigate('/history')
    },
    {
      title: 'Manage Portfolio',
      description: 'Edit and organize positions',
      icon: FileText,
      color: 'bg-orange-600 hover:bg-orange-700',
      onClick: () => navigate('/portfolio')
    },
    {
      title: 'Investment Goals',
      description: 'Set and track financial goals',
      icon: Target,
      color: 'bg-pink-600 hover:bg-pink-700',
      onClick: () => navigate('/goals')
    },
    {
      title: 'Market News',
      description: 'Latest financial news',
      icon: Newspaper,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      onClick: () => navigate('/news')
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg`}
          >
            <div className="flex items-center space-x-3">
              <action.icon className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">{action.title}</div>
                <div className="text-sm opacity-90">{action.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

QuickActions.displayName = 'QuickActions';

export default QuickActions;