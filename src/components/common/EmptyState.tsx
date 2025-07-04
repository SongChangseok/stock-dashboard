import React from 'react';
import { Plus } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  onAction?: () => void;
  actionText?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, onAction, actionText }) => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-spotify-gray rounded-full flex items-center justify-center mb-4">
        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
          <Plus size={24} className="text-gray-400" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-sm mx-auto">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="bg-spotify-green text-white px-6 py-2 rounded-lg hover:bg-spotify-green-hover transition-colors font-medium"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;