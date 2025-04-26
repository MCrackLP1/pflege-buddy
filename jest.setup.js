import '@testing-library/jest-native/extend-expect';
import { NativeModules } from 'react-native';

// Mock für React Native
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.NativeModules.StatusBarManager = {
    getHeight: jest.fn(() => Promise.resolve({ height: 20 })),
  };
  return rn;
});

// Mock für AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock für React Navigation
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});

// Mock für React Native Vector Icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon'); 