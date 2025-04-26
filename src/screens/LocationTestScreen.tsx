/**
 * LocationTestScreen.tsx
 * Test-Screen für das Location-Tracking
 */

import React from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import Typen
import { RootStackParamList } from '../types/types';

// Import Hooks
import { useSettings } from '../context/SettingsContext';

// Import Components
import LocationTestComponent from '../components/LocationTestComponent';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';

type LocationTestScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LocationTestScreen: React.FC = () => {
  const navigation = useNavigation<LocationTestScreenNavigationProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView>
        <View style={styles.card}>
          <Text style={styles.itemTitle}>Standort-Tracking Test</Text>
          <Text style={styles.itemSubtitle}>Diese Komponente testet die Funktionalität des Standort-Trackings</Text>
          
          <LocationTestComponent />
        </View>
      </ScrollView>
    </View>
  );
};

export default LocationTestScreen; 