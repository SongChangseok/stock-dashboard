import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import AppNavigator from './navigation/AppNavigator';
import {theme} from './constants/theme';
import {PortfolioProvider} from '@shared/contexts/PortfolioContext';
import {MultiPortfolioProvider} from '@shared/contexts/MultiPortfolioContext';
import {ToastProvider} from '@shared/contexts/ToastContext';
import {SettingsProvider} from '@shared/contexts/SettingsContext';
import {StockPriceProvider} from '@shared/contexts/StockPriceContext';
import {GoalsProvider} from '@shared/contexts/GoalsContext';
import {PortfolioHistoryProvider} from '@shared/contexts/PortfolioHistoryContext';

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <ToastProvider>
            <SettingsProvider>
              <MultiPortfolioProvider>
                <PortfolioProvider>
                  <StockPriceProvider>
                    <PortfolioHistoryProvider>
                      <GoalsProvider>
                        <NavigationContainer>
                          <StatusBar
                            barStyle="light-content"
                            backgroundColor={theme.colors.background}
                          />
                          <AppNavigator />
                        </NavigationContainer>
                      </GoalsProvider>
                    </PortfolioHistoryProvider>
                  </StockPriceProvider>
                </PortfolioProvider>
              </MultiPortfolioProvider>
            </SettingsProvider>
          </ToastProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;