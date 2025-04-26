/**
 * EmergencyChecklistScreen.tsx
 * Zeigt eine Checkliste für den ausgewählten Notfall an oder eine Übersicht aller Notfallchecklisten
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Vibration,
  StyleSheet,
  ScrollView
} from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

// Import types
import { RootStackParamList, EmergencyId, EmergencyStep, EmergencyChecklistData } from '../types/types';

// Import hooks
import { useSettings } from '../context/SettingsContext';

// Import data
import { emergencyData } from '../utils/data';

// Import styles
import { getDynamicStyles } from '../utils/styleUtils';

type EmergencyChecklistScreenProps = {
  route: RouteProp<RootStackParamList, 'EmergencyChecklist'>;
};

type EmergencyChecklistNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EmergencyChecklistScreen: React.FC<EmergencyChecklistScreenProps> = ({ route }) => {
  const emergencyId = route.params?.emergencyId as EmergencyId | undefined;
  const navigation = useNavigation<EmergencyChecklistNavigationProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  
  // Wenn keine spezifische emergencyId angegeben ist, zeigen wir die Übersicht aller Notfallchecklisten
  if (!emergencyId) {
    return (
      <EmergencyOverview 
        navigation={navigation} 
        theme={theme}
        fontSizeScale={fontSizeScale}
        baseFontSize={baseFontSize}
        styles={styles}
      />
    );
  }
  
  // Andernfalls zeigen wir die spezifische Notfallcheckliste
  const checklistData = emergencyData[emergencyId];
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const handleStepPress = (stepId: string) => {
    Vibration.vibrate(50); // Kurze Vibration beim Abhaken
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        // Optional: Erneutes Tippen könnte Häkchen entfernen
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  // Header-Komponente separat definieren
  const ChecklistHeader = () => {
    if (!checklistData) return null;
    
    // Farbe je nach Notfallkategorie bestimmen
    const getEmergencyIconColor = (id: EmergencyId): string => {
      const categoryColors: Record<string, string> = {
        atemnot: theme === 'dark' ? '#64b5f6' : '#2196f3', // Blau
        brustschmerz: theme === 'dark' ? '#e57373' : '#f44336', // Rot
        hypoglykaemie: theme === 'dark' ? '#ffb74d' : '#ff9800', // Orange
        sturz: theme === 'dark' ? '#90a4ae' : '#607d8b', // Blau-Grau
        fieber_sepsis: theme === 'dark' ? '#f06292' : '#e91e63', // Pink
        allergie_anaphylaxie: theme === 'dark' ? '#ba68c8' : '#9c27b0', // Violett
        schlaganfallverdacht: theme === 'dark' ? '#4db6ac' : '#009688', // Türkis
        dehydratation: theme === 'dark' ? '#4fc3f7' : '#03a9f4', // Hellblau
        synkope_kollaps: theme === 'dark' ? '#9575cd' : '#673ab7', // Lila
        lungenembolie_verdacht: theme === 'dark' ? '#f48fb1' : '#d81b60', // Rosa
      };
      
      return categoryColors[id] || (theme === 'dark' ? '#aaaaaa' : '#555555');
    };

    const iconColor = getEmergencyIconColor(checklistData.id);
    
    return (
      <View style={[styles.card, { marginBottom: 16 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 32, marginRight: 12 }}>{checklistData.icon}</Text>
          <Text style={[styles.itemTitle, { fontSize: baseFontSize * fontSizeScale * 1.3 }]}>
            {checklistData.title}
          </Text>
        </View>
        <Text style={styles.itemSubtitle}>
          Checken Sie jeden Punkt ab, sobald er erledigt ist
        </Text>
      </View>
    );
  };

  const renderChecklistItem = ({ item }: { item: EmergencyStep }) => {
    const isCompleted = completedSteps.has(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.card, 
          isCompleted && { 
            backgroundColor: theme === 'dark' ? '#1b3a1c' : '#e8f5e9',
            borderColor: theme === 'dark' ? '#388e3c' : '#a5d6a7', 
            borderWidth: 1 
          },
          { marginVertical: 4 }
        ]}
        onPress={() => handleStepPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[
            styles.itemTitle, 
            isCompleted && { color: theme === 'dark' ? '#aed581' : '#2e7d32' }
          ]}>
            {item.text}
          </Text>
          {isCompleted && (
            <Icon 
              name="checkmark-circle" 
              size={24} 
              color={theme === 'dark' ? '#4caf50' : '#43a047'} 
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!checklistData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Notfall nicht gefunden!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={checklistData.steps}
        renderItem={renderChecklistItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={ChecklistHeader}
      />
    </View>
  );
};

// Komponente für die Übersicht aller Notfallchecklisten
const EmergencyOverview: React.FC<{
  navigation: EmergencyChecklistNavigationProp,
  theme: 'light' | 'dark',
  fontSizeScale: number,
  baseFontSize: number,
  styles: any
}> = ({ navigation, theme, fontSizeScale, baseFontSize, styles }) => {
  // Konvertierung der EmergencyData vom Objekt in ein Array für die FlatList
  const emergencyItems = Object.values(emergencyData);
  
  // Funktion für Farbe der Emergency-Icons basierend auf Kategorie
  const getEmergencyIconColor = (id: EmergencyId): string => {
    const categoryColors: Record<string, string> = {
      atemnot: theme === 'dark' ? '#64b5f6' : '#2196f3', // Blau
      brustschmerz: theme === 'dark' ? '#e57373' : '#f44336', // Rot
      hypoglykaemie: theme === 'dark' ? '#ffb74d' : '#ff9800', // Orange
      sturz: theme === 'dark' ? '#90a4ae' : '#607d8b', // Blau-Grau
      fieber_sepsis: theme === 'dark' ? '#f06292' : '#e91e63', // Pink
      allergie_anaphylaxie: theme === 'dark' ? '#ba68c8' : '#9c27b0', // Violett
      schlaganfallverdacht: theme === 'dark' ? '#4db6ac' : '#009688', // Türkis
      dehydratation: theme === 'dark' ? '#4fc3f7' : '#03a9f4', // Hellblau
      synkope_kollaps: theme === 'dark' ? '#9575cd' : '#673ab7', // Lila
      lungenembolie_verdacht: theme === 'dark' ? '#f48fb1' : '#d81b60', // Rosa
    };
    
    return categoryColors[id] || (theme === 'dark' ? '#aaaaaa' : '#555555');
  };
  
  // Render-Funktion für Emergency-Button
  const renderEmergencyButton = (item: EmergencyChecklistData) => {
    const iconColor = getEmergencyIconColor(item.id);
    
    // Prüfen, ob das Icon ein Emoji ist
    const isEmoji = /\p{Emoji}/u.test(item.icon);
    
    return (
      <TouchableOpacity
        style={[styles.card, {
          width: '100%',
          height: 130,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 12,
          marginVertical: 4,
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
          borderRadius: 16,
          borderWidth: 0,
          elevation: 0,
          shadowColor: iconColor,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: theme === 'dark' ? 0.5 : 0.2,
          shadowRadius: 3,
          // Farbakzent am linken Rand für ein moderneres Design
          borderLeftWidth: 5,
          borderLeftColor: iconColor,
        }]}
        onPress={() => {
          Vibration.vibrate(30);
          navigation.navigate('EmergencyChecklist', { emergencyId: item.id });
        }}
      >
        <View style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme === 'dark' ? `${iconColor}25` : `${iconColor}15`,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 12
        }}>
          {isEmoji ? (
            <Text style={{ 
              fontSize: 32,
              color: iconColor,
              textShadowColor: 'rgba(0,0,0,0.1)',
              textShadowOffset: {width: 1, height: 1},
              textShadowRadius: 1
            }}>{item.icon}</Text>
          ) : (
            <Icon name={item.icon} size={30} color={iconColor} />
          )}
        </View>
        <Text style={[styles.itemTitle, { 
          textAlign: 'center', 
          fontSize: baseFontSize * fontSizeScale * 0.9,
          fontWeight: 'bold',
          color: theme === 'dark' ? '#ffffff' : '#333333',
          paddingHorizontal: 5
        }]}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingVertical: 16 }}>
        <Text style={[styles.sectionTitle, { marginBottom: 16, marginLeft: 16 }]}>
          🚨 Notfall-Checklisten
        </Text>
        
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 8,
          width: '100%',
          maxWidth: 400,
          alignSelf: 'center',
        }}>
          {emergencyItems.map((item) => (
            <View key={item.id} style={{ 
              width: '50%',
              maxWidth: 180,
              padding: 5,
              alignItems: 'center'
            }}>
              {renderEmergencyButton(item)}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default EmergencyChecklistScreen; 