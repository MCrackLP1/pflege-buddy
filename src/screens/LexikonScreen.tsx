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
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

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
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Optimierte Abstände für die ListItems
  const listItemStyle = {
    marginVertical: 8,
    borderLeftWidth: 5,
    borderLeftColor: theme === 'dark' ? '#03dac6' : '#00acc1',
    borderRadius: 16,
    borderWidth: 0,
    // Leichte Schatten für bessere visuelle Tiefe
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
    shadowRadius: 3,
    elevation: 2,
  };

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
      style={[styles.card, listItemStyle]}
      onPress={() => navigation.navigate('LexikonDetail', { termId: item.id })}
    >
      <Text style={[styles.itemTitle, { marginBottom: 4 }]}>{item.term}</Text>
      <Text style={styles.itemSubtitle} numberOfLines={2} ellipsizeMode="tail">
        {item.definition}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          localStyles.searchContainer,
          {
            backgroundColor: theme === 'dark' ? '#252525' : '#f0f0f0',
            marginHorizontal: 12,
            marginTop: 12,
            marginBottom: 8,
            borderRadius: 16,
            borderWidth: 0,
            paddingHorizontal: 12,
          },
        ]}
      >
        <Icon
          name="search"
          size={22}
          color={theme === 'dark' ? '#03dac6' : '#00acc1'}
          style={localStyles.searchIcon}
        />
        <TextInput
          style={[
            localStyles.searchInput,
            {
              color: theme === 'dark' ? '#ffffff' : '#000000',
              fontSize: baseFontSize * fontSizeScale,
            },
          ]}
          placeholder={t('search_medical_terms')}
          placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')} style={localStyles.clearButton}>
            <Icon name="close-circle" size={20} color={theme === 'dark' ? '#aaaaaa' : '#777777'} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredEntries}
        renderItem={renderLexikonItem}
        keyExtractor={(item, index) => `lexikon_${item.id}_${index}`}
        contentContainerStyle={{ 
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: insets.bottom + 20
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={[styles.centeredContent, { paddingTop: 40 }]}>
            <Icon
              name="search-outline"
              size={50}
              color={theme === 'dark' ? '#666666' : '#999999'}
              style={{ marginBottom: 16, opacity: 0.7 }}
            />
            <Text 
              style={[
                styles.itemSubtitle, 
                { 
                  textAlign: 'center',
                  fontSize: baseFontSize * fontSizeScale * 1.1
                }
              ]}
            >
              {t('no_matching_entries_found')}
            </Text>
            <Text
              style={[
                styles.itemSubtitle,
                {
                  textAlign: 'center',
                  fontSize: baseFontSize * fontSizeScale * 0.9,
                  marginTop: 8,
                  opacity: 0.7,
                }
              ]}
            >
              {t('try_other_search_terms_remove_filters')}
            </Text>
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
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 8,
  },
});

export default LexikonScreen;
