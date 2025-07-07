/**
 * @fileoverview Context für App-Einstellungen
 * @module SettingsContext
 * @description
 * Dieser Context verwaltet die globalen Einstellungen der App wie Theme und Schriftgröße.
 * Die Einstellungen werden persistent im AsyncStorage gespeichert.
 *
 * @requires react
 * @requires @react-native-async-storage/async-storage
 * @requires ../types/types
 * @requires react-native
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SettingsContextProps } from '../types/types';
import { View, Text } from 'react-native';

/**
 * Konstanten für die Schriftgrößenanpassung
 * @constant {Object}
 * @property {number} MIN_FONT_SCALE - Minimale Schriftgröße (70%)
 * @property {number} MAX_FONT_SCALE - Maximale Schriftgröße (140%)
 * @property {number} FONT_SCALE_STEP - Schrittweite für Anpassungen (10%)
 * @property {number} BASE_FONT_SIZE - Basis-Schriftgröße in Pixel
 */
const MIN_FONT_SCALE = 0.7;
const MAX_FONT_SCALE = 1.4;
const FONT_SCALE_STEP = 0.1;
const BASE_FONT_SIZE = 16;

/**
 * Erstellt den SettingsContext
 * @constant {React.Context<SettingsContextProps | null>}
 */
const SettingsContext = createContext<SettingsContextProps | null>(null);

/**
 * SettingsProvider Komponente
 * @component
 * @param {Object} props - Komponenten-Props
 * @param {React.ReactNode} props.children - Child-Komponenten
 * @returns {React.ReactElement} Der gerenderte Provider
 *
 * @example
 * ```jsx
 * <SettingsProvider>
 *   <App />
 * </SettingsProvider>
 * ```
 */
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [fontSizeScale, setFontSizeScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Lädt gespeicherte Einstellungen beim Start der App
   * @function loadSettings
   * @async
   * @returns {Promise<void>}
   */
  const loadSettings = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('theme');
      const storedFontSizeScale = await AsyncStorage.getItem('fontSizeScale');

      if (storedTheme) {
        setTheme(storedTheme as 'light' | 'dark');
      }

      if (storedFontSizeScale) {
        setFontSizeScale(parseFloat(storedFontSizeScale));
      }
    } catch (error) {
      console.error('Error loading settings', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Ändert das aktuelle Theme der App
   * @function handleSetTheme
   * @param {'light' | 'dark'} newTheme - Das neue Theme
   * @returns {void}
   */
  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    AsyncStorage.setItem('theme', newTheme).catch(error =>
      console.error('Error saving theme', error)
    );
  };

  /**
   * Erhöht die Schriftgröße um einen Schritt
   * @function increaseFontSize
   * @returns {void}
   */
  const increaseFontSize = () => {
    if (fontSizeScale < MAX_FONT_SCALE) {
      const newScale = Math.min(fontSizeScale + FONT_SCALE_STEP, MAX_FONT_SCALE);
      setFontSizeScale(newScale);
      AsyncStorage.setItem('fontSizeScale', newScale.toString()).catch(error =>
        console.error('Error saving font size', error)
      );
    }
  };

  /**
   * Verringert die Schriftgröße um einen Schritt
   * @function decreaseFontSize
   * @returns {void}
   */
  const decreaseFontSize = () => {
    if (fontSizeScale > MIN_FONT_SCALE) {
      const newScale = Math.max(fontSizeScale - FONT_SCALE_STEP, MIN_FONT_SCALE);
      setFontSizeScale(newScale);
      AsyncStorage.setItem('fontSizeScale', newScale.toString()).catch(error =>
        console.error('Error saving font size', error)
      );
    }
  };

  // Einstellungen beim Start laden
  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Context-Werte für den Provider
   * @type {SettingsContextProps}
   */
  const contextValue: SettingsContextProps = {
    theme: isLoading ? 'light' : theme,
    setTheme: handleSetTheme,
    fontSizeScale: isLoading ? 1.0 : fontSizeScale,
    increaseFontSize,
    decreaseFontSize,
    baseFontSize: BASE_FONT_SIZE,
  };

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
};

/**
 * Hook zum Zugriff auf die SettingsContext-Werte
 * @function useSettings
 * @returns {SettingsContextProps} Die aktuellen Einstellungen und Funktionen
 * @throws {Error} Wenn der Hook außerhalb des SettingsProvider verwendet wird
 *
 * @example
 * ```jsx
 * const { theme, setTheme } = useSettings();
 * ```
 */
export const useSettings = (): SettingsContextProps => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
