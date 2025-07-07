import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItem,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MedicalTerm } from '../utils/medTermUtils';
import { useMedicalTermStore } from '../store/medicalTermStore';

interface SearchResultItem extends MedicalTerm {
  category: string;
}

interface MedicalTermSearchProps {
  onTermSelect: (term: MedicalTerm) => void;
}

interface Styles {
  container: ViewStyle;
  searchContainer: ViewStyle;
  searchInput: TextStyle;
  searchIcon: TextStyle;
  clearButton: TextStyle;
  resultsList: ViewStyle;
  resultItem: ViewStyle;
  resultHeader: ViewStyle;
  resultTerm: TextStyle;
  resultCategory: TextStyle;
  resultDefinition: TextStyle;
  loadingContainer: ViewStyle;
  noResults: TextStyle;
  errorText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  clearButton: {
    padding: 5,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  resultTerm: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resultDefinition: {
    fontSize: 14,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

const MedicalTermSearch: React.FC<MedicalTermSearchProps> = ({ onTermSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  // Zustand Store
  const { searchResults, isLoading, error, searchTerms, loadMedicalTerms } = useMedicalTermStore();

  // Lade medizinische Begriffe beim ersten Rendern
  useEffect(() => {
    loadMedicalTerms();
  }, [loadMedicalTerms]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      await searchTerms(query);
    },
    [searchTerms]
  );

  const handleTermPress = useCallback(
    (term: SearchResultItem) => {
      onTermSelect(term);
    },
    [onTermSelect]
  );

  const renderItem: ListRenderItem<SearchResultItem> = useCallback(
    ({ item }) => (
      <TouchableOpacity style={styles.resultItem} onPress={() => handleTermPress(item)}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultTerm}>{item.term}</Text>
          <Text style={styles.resultCategory}>{item.category}</Text>
        </View>
        <Text style={styles.resultDefinition}>{item.definition}</Text>
      </TouchableOpacity>
    ),
    [handleTermPress]
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t('medical_term_search_placeholder')}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => handleSearch('')}>
            <Text>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          style={styles.resultsList}
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      ) : searchQuery.length >= 2 ? (
        <Text style={styles.noResults}>{t('no_results_found')}</Text>
      ) : null}
    </View>
  );
};

export default MedicalTermSearch;
