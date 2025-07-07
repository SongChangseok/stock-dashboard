import React, { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import Modal from '../common/Modal';

interface ImportExportManagerProps {
  isImportModalOpen: boolean;
  onCloseImportModal: () => void;
  onImportData: (file: File) => void;
  onExportData: () => void;
  importError: string;
}

const ImportExportManager: React.FC<ImportExportManagerProps> = React.memo(({
  isImportModalOpen,
  onCloseImportModal,
  onImportData,
  onExportData,
  importError
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        onImportData(file);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
    }
  };

  const handleExport = () => {
    onExportData();
    // You could add a success message here if needed
  };

  return (
    <Modal
      isOpen={isImportModalOpen}
      onClose={onCloseImportModal}
      title="Import/Export Portfolio Data"
    >
      <div className="space-y-6">
        {/* Export Section */}
        <div className="border border-gray-600 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Download className="w-5 h-5 text-spotify-green" />
            <h3 className="text-lg font-semibold text-white">Export Data</h3>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Download your portfolio data as a JSON file for backup or sharing
          </p>
          <button
            onClick={handleExport}
            className="bg-spotify-green hover:bg-spotify-green-hover text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Portfolio
          </button>
        </div>

        {/* Import Section */}
        <div className="border border-gray-600 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Upload className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Import Data</h3>
          </div>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-spotify-green bg-spotify-green/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center">
              <div className="mb-4">
                {importSuccess ? (
                  <CheckCircle className="w-12 h-12 text-spotify-green" />
                ) : (
                  <FileText className="w-12 h-12 text-gray-400" />
                )}
              </div>
              
              {importSuccess ? (
                <div className="text-center">
                  <p className="text-spotify-green font-semibold mb-2">Import Successful!</p>
                  <p className="text-sm text-gray-400">Your portfolio data has been imported</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-300 mb-4">
                    Drag & drop your JSON file here, or{' '}
                    <label className="text-spotify-green cursor-pointer hover:text-spotify-green-hover">
                      browse files
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JSON files exported from this application
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {importError && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-400 text-sm font-medium mb-1">Import Error</p>
                <p className="text-red-300 text-sm">{importError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
          <button
            onClick={onCloseImportModal}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
});

ImportExportManager.displayName = 'ImportExportManager';

export default ImportExportManager;