import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Platform,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {
  searchMedicalInfo,
  getMedicalInfoByICD,
  getMedicationInfo,
  Language,
  MedlinePlusResponse,
} from '../services/MedlinePlusService';

interface SearchResult {
  title: string;
  summary: string;
  link: string;
}

type SearchType = 'term' | 'icd' | 'medication';

const MedicalInfoSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<SearchType>('term');
  const [language, setLanguage] = useState<Language>('de');

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Bitte geben Sie einen Suchbegriff ein');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let response: MedlinePlusResponse;

      switch (searchType) {
        case 'term':
          response = await searchMedicalInfo(searchQuery.trim(), language);
          break;
        case 'icd':
          response = await getMedicalInfoByICD(searchQuery.trim(), language);
          break;
        case 'medication':
          response = await getMedicationInfo(searchQuery.trim(), language);
          break;
        default:
          response = await searchMedicalInfo(searchQuery.trim(), language);
      }

      if (response.feed.entry && response.feed.entry.length > 0) {
        const formattedResults = response.feed.entry.map(entry => ({
          title: entry.title,
          summary: entry.summary,
          link: entry.link[0].href,
        }));
        setResults(formattedResults);
      } else {
        setResults([]);
        setError('Keine Ergebnisse gefunden');
      }
    } catch (err) {
      console.error('Fehler bei der Suche:', err);
      setError('Fehler bei der Suche. Bitte versuchen Sie es später erneut.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openLink = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log('Kann den Link nicht öffnen: ' + url);
        setError('Kann den Link nicht öffnen');
      }
    });
  };

  const getPlaceholderText = () => {
    switch (searchType) {
      case 'term':
        return 'z.B. Diabetes, Hypertonie, Dekubitus...';
      case 'icd':
        return 'z.B. E11, I10, L89...';
      case 'medication':
        return 'z.B. Metformin, Aspirin, Insulin...';
      default:
        return 'Suchbegriff eingeben...';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Medizinische Informationen</Text>

        <View style={styles.toggleContainer}>
          <ScrollableToggle
            options={[
              { id: 'term', label: 'Begriff' },
              { id: 'icd', label: 'ICD-10' },
              { id: 'medication', label: 'Medikament' },
            ]}
            selectedValue={searchType}
            onSelect={value => {
              setSearchType(value as SearchType);
              setResults([]);
              setError(null);
            }}
          />
        </View>

        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => {
            setLanguage(prevLang => {
              if (prevLang === 'en') return 'de';
              if (prevLang === 'de') return 'es';
              return 'en';
            });
          }}
        >
          <Text style={styles.languageButtonText}>
            Sprache: {language === 'de' ? 'Deutsch' : language === 'en' ? 'Englisch' : 'Spanisch'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={getPlaceholderText()}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={performSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={performSearch}>
          <Text style={styles.searchButtonText}>Suchen</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Informationen werden geladen...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.title}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.resultItem}>
              <Text style={styles.resultTitle}>{item.title}</Text>
              <Text style={styles.resultSummary} numberOfLines={4}>
                {item.summary}
              </Text>
              <TouchableOpacity style={styles.linkButton} onPress={() => openLink(item.link)}>
                <Text style={styles.linkText}>Mehr erfahren</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            !error && !isLoading ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>
                  {searchQuery.trim()
                    ? 'Keine Ergebnisse gefunden.'
                    : 'Geben Sie einen Suchbegriff ein, um Informationen zu finden.'}
                </Text>
                {searchQuery.trim() && (
                  <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsTitle}>Vorschläge:</Text>
                    <Text style={styles.suggestion}>• Überprüfen Sie die Schreibweise</Text>
                    <Text style={styles.suggestion}>• Versuchen Sie allgemeinere Begriffe</Text>
                    <Text style={styles.suggestion}>
                      • Wechseln Sie zur {searchType === 'term' ? 'ICD-10' : 'Begriff'}-Suche
                    </Text>
                  </View>
                )}
              </View>
            ) : null
          }
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Daten bereitgestellt von MedlinePlus® - U.S. National Library of Medicine
        </Text>
      </View>
    </SafeAreaView>
  );
};

// Hilfskomponente für die Tabs
const ScrollableToggle = ({
  options,
  selectedValue,
  onSelect,
}: {
  options: Array<{ id: string; label: string }>;
  selectedValue: string;
  onSelect: (value: string) => void;
}) => {
  return (
    <View style={toggleStyles.container}>
      {options.map(option => (
        <TouchableOpacity
          key={option.id}
          style={[toggleStyles.option, selectedValue === option.id && toggleStyles.selectedOption]}
          onPress={() => onSelect(option.id)}
        >
          <Text
            style={[
              toggleStyles.optionText,
              selectedValue === option.id && toggleStyles.selectedOptionText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const toggleStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: '#0066cc',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#fff',
  },
});

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  toggleContainer: {
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    marginRight: 10,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#0066cc',
    borderRadius: 8,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    margin: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  resultSummary: {
    fontSize: 14,
    color: '#666',
    marginBottom: 14,
    lineHeight: 20,
  },
  linkButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f7ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#cce0ff',
  },
  linkText: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: '#e53935',
    marginVertical: 16,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  languageButton: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#444',
  },
  suggestionsContainer: {
    width: width * 0.8,
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  suggestion: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    lineHeight: 20,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  footerText: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  },
});

export default MedicalInfoSearch;
