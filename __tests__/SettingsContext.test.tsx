import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingsProvider, useSettings } from '../src/context/SettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock für AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('SettingsContext', () => {
  const TestComponent = () => {
    const { theme, fontSizeScale, baseFontSize, setTheme, setFontSizeScale } = useSettings();
    
    return (
      <>
        <div data-testid="theme">{theme}</div>
        <div data-testid="fontSizeScale">{fontSizeScale}</div>
        <div data-testid="baseFontSize">{baseFontSize}</div>
        <button
          data-testid="toggleTheme"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          Toggle Theme
        </button>
        <button
          data-testid="increaseFontSize"
          onClick={() => setFontSizeScale(fontSizeScale + 0.1)}
        >
          Increase Font Size
        </button>
      </>
    );
  };

  beforeEach(() => {
    // AsyncStorage leeren
    AsyncStorage.clear();
  });

  it('provides default settings', () => {
    const { getByTestId } = render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    expect(getByTestId('theme').textContent).toBe('light');
    expect(getByTestId('fontSizeScale').textContent).toBe('1');
    expect(getByTestId('baseFontSize').textContent).toBe('16');
  });

  it('updates theme when toggleTheme is clicked', () => {
    const { getByTestId } = render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    fireEvent.press(getByTestId('toggleTheme'));
    expect(getByTestId('theme').textContent).toBe('dark');
  });

  it('updates fontSizeScale when increaseFontSize is clicked', () => {
    const { getByTestId } = render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    fireEvent.press(getByTestId('increaseFontSize'));
    expect(getByTestId('fontSizeScale').textContent).toBe('1.1');
  });

  it('persists settings in AsyncStorage', async () => {
    const { getByTestId } = render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    fireEvent.press(getByTestId('toggleTheme'));
    fireEvent.press(getByTestId('increaseFontSize'));

    // Überprüfen Sie, ob die Einstellungen in AsyncStorage gespeichert wurden
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('fontSizeScale', '1.1');
  });
}); 