/**
 * LexikonScreen.tsx
 * Zeigt eine Liste aller Lexikon-Einträge an
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import types
import { RootStackParamList, LexikonEntry } from '../types/types';

// Import hooks
import { useSettings } from '../context/SettingsContext';

// Import data
import { getCombinedLexikonEntries } from '../utils/lexikonRegistration';

// Import styles
import { getDynamicStyles } from '../utils/styleUtils';

type LexikonScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LexikonScreen: React.FC = () => {
  const navigation = useNavigation<LexikonScreenNavigationProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Hole die kombinierten Lexikoneinträge
  const combinedEntries = useMemo(() => {
    return getCombinedLexikonEntries();
  }, []);

  const filteredEntries = useMemo(() => {
    if (!searchTerm) {
      return combinedEntries;
    }
    
    return combinedEntries.filter(
      entry => 
        entry.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.definition.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, combinedEntries]);

  const renderLexikonItem = ({ item }: { item: LexikonEntry }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('LexikonDetail', { termId: item.id })}
    >
      <Text style={styles.itemTitle}>{item.term}</Text>
      <Text 
        style={styles.itemSubtitle} 
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {item.definition}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[localStyles.searchContainer, {
        backgroundColor: theme === 'dark' ? '#333333' : '#f0f0f0'
      }]}>
        <Icon 
          name="search" 
          size={20} 
          color={theme === 'dark' ? '#aaaaaa' : '#777777'}
          style={localStyles.searchIcon}
        />
        <TextInput
          style={[localStyles.searchInput, {
            color: theme === 'dark' ? '#ffffff' : '#000000',
            fontSize: baseFontSize * fontSizeScale
          }]}
          placeholder="Suche nach medizinischen Begriffen..."
          placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity 
            onPress={() => setSearchTerm('')}
            style={localStyles.clearButton}
          >
            <Icon 
              name="close-circle" 
              size={20} 
              color={theme === 'dark' ? '#aaaaaa' : '#777777'}
            />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredEntries}
        renderItem={renderLexikonItem}
        keyExtractor={(item, index) => `lexikon_${item.id}_${index}`}
        contentContainerStyle={{ padding: 8 }}
        ListEmptyComponent={
          <View style={styles.centeredContent}>
            <Text style={styles.itemSubtitle}>Keine passenden Einträge gefunden.</Text>
          </View>
        }
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    height: 48
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingVertical: 8
  },
  clearButton: {
    padding: 8
  }
});

export default LexikonScreen; 