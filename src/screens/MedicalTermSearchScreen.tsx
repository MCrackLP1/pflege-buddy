import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import MedicalTermSearch from '../components/MedicalTermSearch';
import { RootStackParamList } from '../types/types';
import { MedicalTerm } from '../utils/medTermUtils';
import { useSettings } from '../context/SettingsContext';

type MedicalTermSearchScreenRouteProp = RouteProp<RootStackParamList, 'MedicalTermSearch'>;
type MedicalTermSearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MedicalTermSearchScreen: React.FC = () => {
  const route = useRoute<MedicalTermSearchScreenRouteProp>();
  const navigation = useNavigation<MedicalTermSearchScreenNavigationProp>();
  const { theme } = useSettings();
  
  const initialQuery = route.params?.initialQuery || '';
  
  const handleTermSelect = (term: MedicalTerm & { category: string }) => {
    // Show details in an alert for now, but could navigate to a detail screen
    Alert.alert(
      term.term,
      `${term.definition}\n\nKategorie: ${term.category}`,
      [
        { text: 'Schließen', style: 'cancel' }
      ]
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, {
      backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5'
    }]}>
      <MedicalTermSearch 
        initialQuery={initialQuery}
        onSelect={handleTermSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MedicalTermSearchScreen; 