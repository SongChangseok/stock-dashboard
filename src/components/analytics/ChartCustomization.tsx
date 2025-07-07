import React from 'react';
import { Settings, Download, Maximize2, RefreshCw, Palette } from 'lucide-react';

export interface ChartSettings {
  showGrid: boolean;
  showLegend: boolean;
  animationEnabled: boolean;
  colorScheme: 'default' | 'blue' | 'green' | 'purple';
  chartSize: 'small' | 'medium' | 'large';
}

interface ChartCustomizationProps {
  settings: ChartSettings;
  onSettingsChange: (settings: ChartSettings) => void;
  onExportChart: () => void;
  onRefreshData: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const colorSchemes = {
  default: {
    name: 'Spotify Green',
    primary: '#1DB954',
    colors: ['#1DB954', '#1ED760', '#1AA34A', '#16803C', '#10B981', '#06B6D4', '#6366F1', '#8B5CF6']
  },
  blue: {
    name: 'Ocean Blue',
    primary: '#0EA5E9',
    colors: ['#0EA5E9', '#06B6D4', '#0284C7', '#0369A1', '#075985', '#0C4A6E', '#164E63', '#155E75']
  },
  green: {
    name: 'Forest Green',
    primary: '#10B981',
    colors: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B', '#22C55E', '#16A34A', '#15803D']
  },
  purple: {
    name: 'Royal Purple',
    primary: '#8B5CF6',
    colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#A855F7', '#9333EA', '#7E22CE']
  }
};

const ChartCustomization: React.FC<ChartCustomizationProps> = React.memo(({
  settings,
  onSettingsChange,
  onExportChart,
  onRefreshData,
  isVisible,
  onToggleVisibility
}) => {
  const handleSettingChange = (key: keyof ChartSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="mb-6">
      {/* Control Bar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Chart Analytics</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefreshData}
            className="p-2 bg-spotify-gray hover:bg-gray-600 text-white rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onExportChart}
            className="p-2 bg-spotify-gray hover:bg-gray-600 text-white rounded-lg transition-colors"
            title="Export Chart"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleVisibility}
            className={`p-2 rounded-lg transition-colors ${
              isVisible 
                ? 'bg-spotify-green text-white' 
                : 'bg-spotify-gray hover:bg-gray-600 text-white'
            }`}
            title="Chart Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {isVisible && (
        <div className="bg-spotify-gray/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Chart Customization</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Display Options */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Display Options</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.showGrid}
                    onChange={(e) => handleSettingChange('showGrid', e.target.checked)}
                    className="rounded bg-spotify-gray border-gray-600 text-spotify-green focus:ring-spotify-green focus:ring-offset-0"
                  />
                  <span className="ml-2 text-gray-300">Show Grid</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.showLegend}
                    onChange={(e) => handleSettingChange('showLegend', e.target.checked)}
                    className="rounded bg-spotify-gray border-gray-600 text-spotify-green focus:ring-spotify-green focus:ring-offset-0"
                  />
                  <span className="ml-2 text-gray-300">Show Legend</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.animationEnabled}
                    onChange={(e) => handleSettingChange('animationEnabled', e.target.checked)}
                    className="rounded bg-spotify-gray border-gray-600 text-spotify-green focus:ring-spotify-green focus:ring-offset-0"
                  />
                  <span className="ml-2 text-gray-300">Enable Animations</span>
                </label>
              </div>
            </div>

            {/* Color Scheme */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Color Scheme</h4>
              <div className="space-y-2">
                {Object.entries(colorSchemes).map(([key, scheme]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="radio"
                      name="colorScheme"
                      value={key}
                      checked={settings.colorScheme === key}
                      onChange={(e) => handleSettingChange('colorScheme', e.target.value)}
                      className="text-spotify-green focus:ring-spotify-green focus:ring-offset-0"
                    />
                    <div className="ml-2 flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: scheme.primary }}
                      />
                      <span className="text-gray-300">{scheme.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Chart Size */}
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Chart Size</h4>
              <select
                value={settings.chartSize}
                onChange={(e) => handleSettingChange('chartSize', e.target.value)}
                className="w-full bg-spotify-gray/50 text-white rounded border border-gray-600 px-3 py-2 focus:border-spotify-green focus:outline-none"
              >
                <option value="small">Small (300px)</option>
                <option value="medium">Medium (400px)</option>
                <option value="large">Large (500px)</option>
              </select>
            </div>
          </div>

          {/* Color Preview */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Color Preview</h4>
            <div className="flex space-x-2">
              {colorSchemes[settings.colorScheme].colors.map((color, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ChartCustomization.displayName = 'ChartCustomization';

export default ChartCustomization;