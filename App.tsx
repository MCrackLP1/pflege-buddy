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
 * @requires ./src/context/DisclaimerContext
 * @requires ./src/components/DisclaimerModal
 * @requires ./src/components/ErrorBoundary
 */

import React, { ErrorInfo, useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, LogBox, View, Text, Platform } from 'react-native';
import ImmersiveModeService from './src/services/ImmersiveModeService';

// Navigation und Screens
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';

// Context Provider
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { DisclaimerProvider } from './src/context/DisclaimerContext';
import { AIChatConsentProvider } from './src/context/AIChatConsentContext';
import { SimulationProgressProvider } from './src/context/SimulationProgressContext';

// Components
import DisclaimerModal from './src/components/DisclaimerModal';
import ChangelogModal from './src/components/ChangelogModal';
import ErrorBoundary from './src/components/ErrorBoundary';

// Services
import ChangelogService from './src/services/ChangelogService';

// Utils
import Logger from './src/utils/logger';
import './src/utils/i18n';

// Types
import { ChangelogEntry } from './src/data/changelog';



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
 * Fehlerbehandlungsfunktion für globale unbehandelte Fehler
 * @param {Error} error - Der aufgetretene Fehler
 * @param {ErrorInfo} errorInfo - Zusätzliche Fehlerinformationen
 */
const handleError = (error: Error, errorInfo: ErrorInfo): void => {
  // Fehler an den zentralen Logger senden
  Logger.exception(error, 'App Root');
  
  // Hier könnte eine Fehlerberichterstattung an einen Remote-Server implementiert werden
  // z.B. crashlytics.recordError(error);
};

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
  
  // Changelog-State
  const [changelogEntries, setChangelogEntries] = useState<ChangelogEntry[]>([]);
  const [showChangelog, setShowChangelog] = useState(false);
  
  // Configure immersive mode for edge-to-edge experience
  useEffect(() => {
    const configureImmersiveMode = async () => {
      const immersiveService = ImmersiveModeService.getInstance();
      await immersiveService.configureImmersiveMode({
        theme,
        transparentNavigationBar: true,
        statusBarStyle: barStyle,
      });
    };
    
    configureImmersiveMode();
  }, [theme, barStyle]);
  
  // Prüfe auf App-Updates beim Start
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const changelogService = ChangelogService.getInstance();
        const newEntries = await changelogService.checkForUpdates();
        
        if (newEntries.length > 0) {
          setChangelogEntries(newEntries);
          setShowChangelog(true);
          Logger.info('App', `Found ${newEntries.length} new changelog entries`);
        }
      } catch (error) {
        Logger.error('App', 'Failed to check for updates', error);
      }
    };
    
    checkForUpdates();
  }, []);
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }} edges={['top']}>
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle={barStyle}
        hidden={false}
      />
      <AppNavigator />
      <DisclaimerModal />
      <ChangelogModal 
        visible={showChangelog}
        onClose={() => setShowChangelog(false)}
        changelogEntries={changelogEntries}
      />
    </SafeAreaView>
  );
}

function App(): React.JSX.Element {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Fallback-Timer für den Fall, dass das Video nicht abgespielt werden kann oder fehlschlägt
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000); // 5 Sekunden Timeout

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary onError={handleError}>
      <SettingsProvider>
        <DisclaimerProvider>
          <AIChatConsentProvider>
            <SimulationProgressProvider>
              {showSplash ? (
                <SplashScreen onComplete={() => setShowSplash(false)} />
              ) : (
                <AppContent />
              )}
            </SimulationProgressProvider>
          </AIChatConsentProvider>
        </DisclaimerProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}

export default App;
