// 사용자 설정 관리 컨텍스트

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

interface SettingsState {
  realTimePriceUpdates: boolean;
  updateInterval: number; // milliseconds
  showPriceChangeAnimations: boolean;
  enableNotifications: boolean;
  theme: 'dark' | 'light';
}

interface SettingsContextType {
  settings: SettingsState;
  updateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

const DEFAULT_SETTINGS: SettingsState = {
  realTimePriceUpdates: true,
  updateInterval: 60000, // 1 minute
  showPriceChangeAnimations: true,
  enableNotifications: true,
  theme: 'dark',
};

const SETTINGS_STORAGE_KEY = 'stock-dashboard-settings';

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    // localStorage에서 설정 로드
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
    return DEFAULT_SETTINGS;
  });

  // 설정 변경 시 localStorage에 자동 저장
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }, [settings]);

  // 개별 설정 업데이트
  const updateSetting = useCallback(
    <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
      setSettings(prev => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  // 설정 초기화
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // 설정 내보내기
  const exportSettings = useCallback((): string => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  // 설정 가져오기
  const importSettings = useCallback((settingsJson: string): boolean => {
    try {
      const parsed = JSON.parse(settingsJson);

      // 기본 검증
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid settings format');
      }

      // 유효한 설정만 적용
      const validSettings: Partial<SettingsState> = {};

      if (typeof parsed.realTimePriceUpdates === 'boolean') {
        validSettings.realTimePriceUpdates = parsed.realTimePriceUpdates;
      }

      if (
        typeof parsed.updateInterval === 'number' &&
        parsed.updateInterval >= 10000
      ) {
        validSettings.updateInterval = parsed.updateInterval;
      }

      if (typeof parsed.showPriceChangeAnimations === 'boolean') {
        validSettings.showPriceChangeAnimations =
          parsed.showPriceChangeAnimations;
      }

      if (typeof parsed.enableNotifications === 'boolean') {
        validSettings.enableNotifications = parsed.enableNotifications;
      }

      if (parsed.theme === 'dark' || parsed.theme === 'light') {
        validSettings.theme = parsed.theme;
      }

      setSettings(prev => ({ ...prev, ...validSettings }));
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }, []);

  const value: SettingsContextType = {
    settings,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
