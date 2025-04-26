/**
 * WissenScreen.tsx
 * Übersichtsseite für den Wissensbereich
 */

import React from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import types
import { RootStackParamList } from '../types/types';

// Import hooks
import { useSettings } from '../context/SettingsContext';

// Import style utilities
import { getDynamicStyles } from '../utils/styleUtils';

// Import components
import PageHeader from '../components/PageHeader';
import ListItem from '../components/ListItem';

type WissenScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WissenLanding'>;

const WissenScreen: React.FC = () => {
  const navigation = useNavigation<WissenScreenNavigationProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <PageHeader 
        title="Pflegewissen" 
        subtitle="Nachschlagewerke und Informationen" 
      />

      <ScrollView>
        <ListItem
          title="Krankheitsbilder"
          subtitle="Umfangreiches Verzeichnis von Erkrankungen"
          iconName="fitness-outline"
          onPress={() => {
            // @ts-ignore - Typprobleme mit der Navigation ignorieren
            navigation.navigate('WissenListen');
          }}
        />
        
        <ListItem
          title="Pflegestandards"
          subtitle="Standardisierte Pflegeprozesse"
          iconName="list-outline"
          onPress={() => {
            // @ts-ignore - Typprobleme mit der Navigation ignorieren
            navigation.navigate('StandardsLanding');
          }}
        />
        
        <ListItem
          title="Pflegelexikon"
          subtitle="Fachbegriffe und Definitionen"
          iconName="book-outline"
          onPress={() => {
            // @ts-ignore - Typprobleme mit der Navigation ignorieren
            navigation.navigate('LexikonListen');
          }}
        />
        
        <ListItem
          title="Medizin-Wikisearch"
          subtitle="Online-Medizinwissen durchsuchen"
          iconName="search-outline"
          onPress={() => {
            // @ts-ignore - Typprobleme mit der Navigation ignorieren
            navigation.navigate('MedizinSearch');
          }}
        />
        
        <ListItem
          title="Medikamentensuche"
          subtitle="Informationen zu Medikamenten"
          iconName="medical"
          onPress={() => {
            // @ts-ignore - Typprobleme mit der Navigation ignorieren
            navigation.navigate('MedicationSearch');
          }}
        />
        
        <ListItem
          title="Laborparameter"
          subtitle="Wichtige Laborwerte und deren Bedeutung"
          iconName="flask-outline"
          onPress={() => {
            // @ts-ignore
            navigation.navigate('LaborparameterScreen');
          }}
        />
      </ScrollView>
    </View>
  );
};

export default WissenScreen; 