/**
 * StandardsScreen.tsx
 * Zeigt eine Liste der verfügbaren Pflegestandards
 */

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

// Import Typen
import { RootStackParamList, NursingStandard } from '../types/types';

// Import Hooks
import { useSettings } from '../context/SettingsContext';

// Import Daten
import { nursingStandardsData } from '../utils/data';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';

type StandardsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const StandardsScreen: React.FC = () => {
  const navigation = useNavigation<StandardsScreenNavigationProp>();
  const route = useRoute();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  
  const [searchText, setSearchText] = useState('');
  const [standards, setStandards] = useState<NursingStandard[]>(nursingStandardsData);

  // Custom back handler
  const handleBackPress = () => {
    console.log('Back button pressed');
    
    // Einfach zurück zum letzten Screen navigieren
    navigation.goBack();
    
    // Die vorherige Implementierung nutze ich nur für Debug-Logging
    try {
      const state = navigation.getState();
      console.log('Navigation state:', JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Error getting navigation state:', error);
    }
  };

  // Filter standards based on search text
  const filteredStandards = searchText.trim() === '' 
    ? standards 
    : standards.filter(standard => 
        standard.title.toLowerCase().includes(searchText.toLowerCase()) ||
        standard.ziel.toLowerCase().includes(searchText.toLowerCase())
      );

  const renderStandardItem = ({ item }: { item: NursingStandard }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('StandardDetail', { standardId: item.id })}
    >
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemSubtitle} numberOfLines={2}>{item.ziel}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={[styles.headerContainer, { 
        paddingTop: Math.max(insets.top, 10), 
        paddingBottom: 10,
        paddingHorizontal: 16,
        zIndex: 10
      }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={handleBackPress}
            style={{ marginRight: 10 }}
          >
            <Icon name="arrow-back" size={24} color={theme === 'dark' ? '#ffffff' : '#000000'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pflegestandards</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Standards durchsuchen..."
          placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <FlatList
        data={filteredStandards}
        renderItem={renderStandardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 8 }}
        ListEmptyComponent={
          <View style={styles.centeredContent}>
            <Text style={styles.itemSubtitle}>Keine Standards gefunden</Text>
          </View>
        }
      />
    </View>
  );
};

export default StandardsScreen; 