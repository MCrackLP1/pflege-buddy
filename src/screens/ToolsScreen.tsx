/**
 * ToolsScreen.tsx
 * Zeigt verschiedene Tools für den Pflegealltag
 */

import React from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import Typen
import { RootStackParamList } from '../types/types';

// Import Hooks
import { useSettings } from '../context/SettingsContext';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';

// Import Components
import PageHeader from '../components/PageHeader';
import ListItem from '../components/ListItem';

type ToolsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ToolsLanding'>;

const ToolsScreen: React.FC = () => {
  const navigation = useNavigation<ToolsScreenNavigationProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <PageHeader 
        title="Pflege-Tools" 
        subtitle="Nützliche Werkzeuge für den Pflegealltag" 
      />

      <ScrollView>
        <ListItem
          title="Wundbeurteilung"
          subtitle="Systematische Beurteilung von Wunden mit Ampelsystem"
          iconName="bandage-outline"
          onPress={() => {
            // @ts-ignore - Ignoriere Typprobleme mit der Navigation
            navigation.navigate('WoundAssessment');
          }}
        />
        
        <ListItem
          title="Frequenzzähler"
          subtitle="Herzschlag, Atem und andere Vitalparameter"
          iconName="stopwatch-outline"
          onPress={() => {
            // @ts-ignore - Ignoriere Typprobleme mit der Navigation
            navigation.navigate('FrequencyCounter');
          }}
        />
        
        <ListItem
          title="Kontakte"
          subtitle="Wichtige Telefonnummern verwalten"
          iconName="call-outline"
          onPress={() => {
            // @ts-ignore - Ignoriere Typprobleme mit der Navigation
            navigation.navigate('Contacts');
          }}
        />
        
        <ListItem
          title="Ernährungsrechner"
          subtitle="BMI, Energiebedarf und Nährstoffverteilung"
          iconName="nutrition-outline"
          onPress={() => {
            // @ts-ignore - Ignoriere Typprobleme mit der Navigation
            navigation.navigate('NutritionCalculator');
          }}
        />
        
        <ListItem
          title="Infusions- & Medikationsrechner"
          subtitle="Tropfenzahl, ml/h, Medikamentenkonzentration"
          iconName="medical-outline"
          onPress={() => {
            // @ts-ignore - Ignoriere Typprobleme mit der Navigation
            navigation.navigate('MedicationCalculator');
          }}
        />
        
        <ListItem
          title="Arbeitszeiterfassung"
          subtitle="Automatische Zeiterfassung mit GPS und Geofencing"
          iconName="time-outline"
          onPress={() => {
            // @ts-ignore - Ignoriere Typprobleme mit der Navigation
            navigation.navigate('WorkTimeTracker');
          }}
        />
        
        <ListItem
          title="Dokumentationshilfen"
          subtitle="Vorlagen für die Pflegedokumentation"
          iconName="clipboard-outline"
          onPress={() => {
            // @ts-ignore - Ignoriere Typprobleme mit der Navigation
            navigation.navigate('Documentation');
          }}
        />
      </ScrollView>
    </View>
  );
};

export default ToolsScreen; 