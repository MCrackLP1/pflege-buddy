import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../src/screens/HomeScreen';
import { useSettings } from '../src/context/SettingsContext';

// Mock für den SettingsContext
jest.mock('../src/context/SettingsContext', () => ({
  useSettings: jest.fn(),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    // Standardwerte für den SettingsContext
    (useSettings as jest.Mock).mockReturnValue({
      theme: 'light',
      fontSizeScale: 1,
      baseFontSize: 16,
    });
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<HomeScreen />);
    expect(getByTestId('home-screen')).toBeTruthy();
  });

  it('displays emergency checklists by default', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('🚨 Notfall-Checklisten')).toBeTruthy();
  });

  it('shows search results when typing in search bar', async () => {
    const { getByPlaceholderText, getByText } = render(<HomeScreen />);
    const searchInput = getByPlaceholderText('Notfall, Krankheit oder Begriff suchen...');
    
    fireEvent.changeText(searchInput, 'Atemnot');
    
    await waitFor(() => {
      expect(getByText('Atemnot')).toBeTruthy();
    });
  });

  it('handles theme changes correctly', () => {
    (useSettings as jest.Mock).mockReturnValue({
      theme: 'dark',
      fontSizeScale: 1,
      baseFontSize: 16,
    });

    const { getByTestId } = render(<HomeScreen />);
    const container = getByTestId('home-screen');
    
    // Überprüfen Sie, ob die dunklen Theme-Styles angewendet werden
    expect(container.props.style.backgroundColor).toBe('#121212');
  });

  it('navigates to emergency checklist when pressing an emergency button', () => {
    const { getByText } = render(<HomeScreen />);
    const emergencyButton = getByText('Atemnot');
    
    fireEvent.press(emergencyButton);
    
    // Überprüfen Sie, ob die Navigation aufgerufen wurde
    // (Dies erfordert einen Mock für die Navigation)
  });
}); 