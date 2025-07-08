import React from 'react';
import { Plus, Upload, Download, Edit, Trash2, CheckSquare, Square } from 'lucide-react';

interface PortfolioActionsProps {
  onAddStock: () => void;
  onImport: () => void;
  onExport: () => void;
  onBulkDelete?: () => void;
  onBulkExport?: () => void;
  onToggleBulkMode?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  bulkMode?: boolean;
  selectedCount?: number;
  totalCount?: number;
  className?: string;
}

const PortfolioActions: React.FC<PortfolioActionsProps> = React.memo(({
  onAddStock,
  onImport,
  onExport,
  onBulkDelete,
  onBulkExport,
  onToggleBulkMode,
  onSelectAll,
  onDeselectAll,
  bulkMode = false,
  selectedCount = 0,
  totalCount = 0,
  className = ''
}) => {
  const allSelected = selectedCount === totalCount && totalCount > 0;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  if (bulkMode) {
    return (
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        {/* Selection Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-spotify-gray hover:bg-gray-600 text-white transition-colors"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-sm text-gray-400">
            {selectedCount} of {totalCount} selected
          </span>
        </div>

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={onBulkExport}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-spotify-gray hover:bg-gray-600 text-white transition-colors"
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
          </div>
        )}

        {/* Exit Bulk Mode */}
        <button
          onClick={onToggleBulkMode}
          className="ml-auto px-3 py-2 rounded-lg bg-spotify-gray hover:bg-gray-600 text-white transition-colors"
        >
          Exit Bulk Mode
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Primary Actions */}
      <button
        onClick={onAddStock}
        className="bg-spotify-green hover:bg-spotify-green-hover text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Stock
      </button>

      {/* Secondary Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onImport}
          className="bg-spotify-gray hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
        <button
          onClick={onExport}
          className="bg-spotify-gray hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Bulk Mode Toggle */}
      {totalCount > 0 && (
        <button
          onClick={onToggleBulkMode}
          className="bg-spotify-gray hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Bulk Actions
        </button>
      )}
    </div>
  );
});

PortfolioActions.displayName = 'PortfolioActions';

export default PortfolioActions;