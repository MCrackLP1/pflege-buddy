/**
 * MedizinSearch.tsx
 * Komponente zur Suche und Anzeige von medizinischen Informationen
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  Linking,
  Image,
  SafeAreaView,
  Dimensions,
  Modal,
  ScrollView,
  useColorScheme,
  StatusBar
} from 'react-native';
import { 
  searchWikipedia,
  searchMedicalWikipedia,
  getWikipediaArticle,
  WikipediaLanguage,
  WikipediaSearchResult,
  WikipediaArticle
} from '../services/WikipediaService';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';

type MedizinSearchRouteProp = RouteProp<RootStackParamList, 'MedizinSearch'>;

const MedizinSearch: React.FC = () => {
  const route = useRoute<MedizinSearchRouteProp>();
  const initialSearch = route.params?.initialSearch || '';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<WikipediaSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<WikipediaLanguage>('de');
  const [selectedArticle, setSelectedArticle] = useState<WikipediaArticle | null>(null);
  const [isArticleModalVisible, setIsArticleModalVisible] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // System-Theme verwenden
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Standard-Schriftgröße für mobile Anwendungen
  const baseFontSize = 16;
  const fontSizeScale = 1.0;
  const fontSize = baseFontSize * fontSizeScale;

  // Führe die Suche automatisch mit dem initialen Suchbegriff aus
  useEffect(() => {
    if (initialSearch) {
      performSearch(initialSearch);
    }
  }, [initialSearch]);

  // Debounced Search Function
  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 500); // 500ms Verzögerung

    setDebounceTimeout(timeoutId);
  }, [language]);

  useEffect(() => {
    // Bereinige Timeout beim Unmounten
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  // Führe Suche bei Änderung der Eingabe aus
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);
    
    try {
      // Immer die medizinische Suche verwenden
      const searchResults = await searchMedicalWikipedia(query.trim(), language);
      
      if (searchResults.length > 0) {
        setResults(searchResults);
      } else {
        setError(`Keine Ergebnisse für "${query}" gefunden.`);
      }
    } catch (err) {
      console.error('Fehler bei der Suche:', err);
      setError('Fehler bei der Suche. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const viewArticleDetails = async (pageid: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const article = await getWikipediaArticle(pageid, language);
      setSelectedArticle(article);
      setIsArticleModalVisible(true);
    } catch (err) {
      console.error('Fehler beim Laden des Artikels:', err);
      setError('Fehler beim Laden des Artikels. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const openArticleInBrowser = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Kann den Link nicht öffnen: " + url);
        setError("Kann den Link nicht öffnen");
      }
    });
  };

  const closeArticleModal = () => {
    setIsArticleModalVisible(false);
    setSelectedArticle(null);
  };

  const cycleLanguage = () => {
    const languageOrder: WikipediaLanguage[] = ['de', 'en', 'es', 'fr', 'it'];
    const currentIndex = languageOrder.indexOf(language);
    const nextIndex = (currentIndex + 1) % languageOrder.length;
    setLanguage(languageOrder[nextIndex]);
  };

  const getLanguageName = (code: WikipediaLanguage): string => {
    const names: Record<WikipediaLanguage, string> = {
      de: 'Deutsch',
      en: 'Englisch',
      es: 'Spanisch',
      fr: 'Französisch',
      it: 'Italienisch'
    };
    return names[code];
  };

  const colors = isDark 
    ? {
        background: '#121212',
        card: '#1e1e1e',
        text: '#e1e1e1',
        subText: '#b0b0b0',
        border: '#333333',
        input: '#2a2a2a',
        button: '#0066cc',
        buttonText: '#ffffff',
        accent: '#bb86fc',
        error: '#cf6679',
      }
    : {
        background: '#f5f5f5',
        card: '#ffffff',
        text: '#333333',
        subText: '#666666',
        border: '#dddddd',
        input: '#ffffff',
        button: '#0066cc',
        buttonText: '#ffffff',
        accent: '#0066cc',
        error: '#e53935',
      };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text, fontSize: fontSize * 1.2 }]}>Medizinsuche</Text>
        
        <TouchableOpacity 
          style={[styles.languageButton, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={cycleLanguage}
        >
          <Text style={[styles.languageButtonText, { color: colors.accent, fontSize: fontSize * 0.9 }]}>
            Sprache: {getLanguageName(language)}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: colors.input, 
            borderColor: colors.border,
            color: colors.text,
            fontSize: fontSize 
          }]}
          placeholder="Suchbegriff eingeben..."
          placeholderTextColor={colors.subText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
      
      {error && <Text style={[styles.errorText, { color: colors.error, fontSize: fontSize }]}>{error}</Text>}
      
      {isLoading ? (
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.text, fontSize: fontSize }]}>Informationen werden geladen...</Text>
        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <FlatList
            data={results}
            keyExtractor={(item) => item.pageid.toString()}
            style={{ flex: 1, backgroundColor: colors.background }}
            contentContainerStyle={{ paddingBottom: 20, backgroundColor: colors.background }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.resultItem, { backgroundColor: colors.card, shadowColor: isDark ? '#000000' : '#000000' }]}
                onPress={() => viewArticleDetails(item.pageid)}
              >
                <Text style={[styles.resultTitle, { color: colors.text, fontSize: fontSize * 1.1 }]}>{item.title}</Text>
                <Text style={[styles.resultSnippet, { color: colors.subText, fontSize: fontSize * 0.9 }]} numberOfLines={3}>
                  {item.snippet}
                </Text>
                <Text style={[styles.viewMoreText, { color: colors.accent, fontSize: fontSize * 0.9 }]}>Mehr anzeigen</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !error && !isLoading && searchQuery.trim() ? (
                <View style={[styles.centered, { backgroundColor: colors.background }]}>
                  <Text style={[styles.emptyText, { color: colors.subText, fontSize: fontSize }]}>
                    Keine Ergebnisse gefunden.
                  </Text>
                </View>
              ) : searchQuery.trim() === '' ? (
                <View style={[styles.centered, { backgroundColor: colors.background }]}>
                  <Text style={[styles.emptyText, { color: colors.subText, fontSize: fontSize }]}>
                    Geben Sie einen Suchbegriff ein, um Informationen zu finden.
                  </Text>
                </View>
              ) : null
            }
          />
        </View>
      )}
      
      <Modal
        visible={isArticleModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeArticleModal}
        statusBarTranslucent={false}
      >
        {selectedArticle ? (
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeArticleModal}
              >
                <Text style={[styles.closeButtonText, { color: colors.accent, fontSize: fontSize }]}>Schließen</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text, fontSize: fontSize * 1.1 }]} numberOfLines={1}>
                {selectedArticle.title}
              </Text>
              <TouchableOpacity 
                style={styles.openBrowserButton}
                onPress={() => openArticleInBrowser(selectedArticle.url)}
              >
                <Text style={[styles.openBrowserText, { color: colors.accent, fontSize: fontSize }]}>Im Browser</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={[styles.modalContent, { backgroundColor: colors.background }]}>
              {selectedArticle.thumbnail && (
                <Image 
                  source={{ uri: selectedArticle.thumbnail }} 
                  style={styles.articleImage}
                  resizeMode="contain"
                />
              )}
              <Text style={[styles.articleTitle, { color: colors.text, fontSize: fontSize * 1.3 }]}>
                {selectedArticle.title}
              </Text>
              <Text style={[styles.articleText, { color: colors.text, fontSize: fontSize, lineHeight: fontSize * 1.5 }]}>
                {selectedArticle.extract}
              </Text>
              <TouchableOpacity 
                style={[styles.readMoreButton, { 
                  backgroundColor: isDark ? '#1a3a5a' : '#e6f0ff', 
                  borderColor: colors.accent 
                }]}
                onPress={() => openArticleInBrowser(selectedArticle.url)}
              >
                <Text style={[styles.readMoreText, { color: colors.accent, fontSize: fontSize }]}>
                  Vollständigen Artikel lesen
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        ) : (
          <View style={[styles.centered, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        )}
      </Modal>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  searchTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  searchTypeText: {
    fontWeight: '500',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchInput: {
    height: 46,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  resultItem: {
    padding: 16,
    borderRadius: 8,
    margin: 8,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultSnippet: {
    marginBottom: 10,
    lineHeight: 20,
  },
  viewMoreText: {
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
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    marginVertical: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  languageButton: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  languageButtonText: {
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  closeButtonText: {
  },
  openBrowserButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  openBrowserText: {
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  articleImage: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  articleTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  articleText: {
    marginBottom: 20,
  },
  readMoreButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 30,
  },
  readMoreText: {
    fontWeight: '500',
  },
});

export default MedizinSearch; 