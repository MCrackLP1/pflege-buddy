/**
 * @fileoverview Hauptanwendungsdatei der PflegeApp
 * @module App
 * @description
 * Diese Datei ist der Einstiegspunkt der PflegeApp und enthält die Root-Komponente.
 * Sie setzt die grundlegende App-Struktur auf und verbindet alle wichtigen Provider
 * und Navigationskomponenten.
 * 
 * @requires react
 * @requires react-native
 * @requires ./src/navigation/AppNavigator
 * @requires ./src/context/SettingsContext
 * @requires ./src/context/WorkTimeContext
 * @requires ./src/context/DisclaimerContext
 * @requires ./src/components/DisclaimerModal
 */

import React from 'react';
import { SafeAreaView, StatusBar, LogBox, View, Text } from 'react-native';

// Navigation und Screens
import AppNavigator from './src/navigation/AppNavigator';

// Context Provider
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import WorkTimeProvider from './src/context/WorkTimeContext';
import { DisclaimerProvider } from './src/context/DisclaimerContext';

// Components
import DisclaimerModal from './src/components/DisclaimerModal';

/**
 * Liste von LogBox-Warnungen, die ignoriert werden sollen
 * @constant {string[]}
 */
const IGNORED_LOGS = [
  'Require cycle:',
  'VirtualizedLists should never be nested',
  'Non-serializable values were found in the navigation state',
];

LogBox.ignoreLogs(IGNORED_LOGS);

/**
 * Hauptkomponente der PflegeApp
 * @function App
 * @returns {React.JSX.Element} Die gerenderte App-Komponente
 * @description
 * Die App-Komponente ist die Root-Komponente der Anwendung und stellt
 * die grundlegende Struktur bereit. Sie umschließt die Anwendung mit
 * wichtigen Providern und der Navigation.
 * 
 * @example
 * ```jsx
 * <App />
 * ```
 */
function AppContent() {
  const { theme } = useSettings();
  const backgroundColor = theme === 'dark' ? '#121212' : '#f5f5f5';
  const barStyle = theme === 'dark' ? 'light-content' : 'dark-content';
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <StatusBar translucent backgroundColor={backgroundColor} barStyle={barStyle} />
      {/* Zusätzlicher Abstand nach oben (von 10 auf 15) */}
      <View style={{ height: 15, backgroundColor }} />
      <AppNavigator />
      <DisclaimerModal />
    </SafeAreaView>
  );
}

function App(): React.JSX.Element {
  return (
    <SettingsProvider>
      <DisclaimerProvider>
        <WorkTimeProvider>
          <AppContent />
        </WorkTimeProvider>
      </DisclaimerProvider>
    </SettingsProvider>
  );
}

export default App;
