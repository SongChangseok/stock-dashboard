import React from 'react';
import { CheckSquare, Square, Download, Trash2, X, Edit } from 'lucide-react';

interface BulkOperationsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkExport: () => void;
  onBulkDelete: () => void;
  onExitBulkMode: () => void;
  className?: string;
}

const BulkOperationsBar: React.FC<BulkOperationsBarProps> = React.memo(({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onBulkExport,
  onBulkDelete,
  onExitBulkMode,
  className = ''
}) => {
  const allSelected = selectedCount === totalCount && totalCount > 0;
  const someSelected = selectedCount > 0;

  return (
    <div className={`bg-spotify-gray/50 backdrop-blur-sm rounded-lg border border-gray-700 p-4 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Selection Info */}
        <div className="flex items-center gap-4">
          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-spotify-dark-gray hover:bg-gray-600 text-white transition-colors"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
          
          <div className="text-sm text-gray-300">
            <span className="font-medium text-white">{selectedCount}</span> of {totalCount} selected
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center gap-2">
          {someSelected && (
            <>
              <button
                onClick={onBulkExport}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-spotify-dark-gray hover:bg-gray-600 text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Selected
              </button>
              <button
                onClick={onBulkDelete}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </>
          )}
          
          <button
            onClick={onExitBulkMode}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-spotify-dark-gray hover:bg-gray-600 text-white transition-colors"
          >
            <X className="w-4 h-4" />
            Exit Bulk Mode
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-spotify-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${(selectedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
});

BulkOperationsBar.displayName = 'BulkOperationsBar';

export default BulkOperationsBar;