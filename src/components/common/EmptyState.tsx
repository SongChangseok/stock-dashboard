import React from 'react';
import { BarChart3 } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionText, onAction }) => {
  return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-50">
        <BarChart3 size={28} className="text-white" />
      </div>
      <p className="text-slate-400 mb-6 text-lg">{title}</p>
      <p className="text-slate-500 mb-6">{description}</p>
      <button
        onClick={onAction}
        className="glass-button bg-gradient-primary text-white font-semibold px-8 py-3 rounded-xl hover:scale-105 transition-all duration-300"
      >
        {actionText}
      </button>
    </div>
  );
};

export default EmptyState;
