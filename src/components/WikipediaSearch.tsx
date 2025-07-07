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
  StatusBar,
} from 'react-native';
import {
  searchWikipedia,
  searchMedicalWikipedia,
  getWikipediaArticle,
  WikipediaLanguage,
  WikipediaSearchResult,
  WikipediaArticle,
} from '../services/WikipediaService';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from 'react-i18next';

type MedizinSearchRouteProp = RouteProp<RootStackParamList, 'MedizinSearch'>;

const MedizinSearch: React.FC = () => {
  const route = useRoute<MedizinSearchRouteProp>();
  const initialSearch = route.params?.initialSearch || '';
  const { theme, fontSizeScale } = useSettings();
  const { t } = useTranslation();
  
  const isDark = theme === 'dark';
  const baseFontSize = 16;
  const fontSize = baseFontSize * fontSizeScale;

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<WikipediaSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [language] = useState<WikipediaLanguage>('de'); // Sprache fest auf Deutsch gesetzt
  const [selectedArticle, setSelectedArticle] = useState<WikipediaArticle | null>(null);
  const [isArticleModalVisible, setIsArticleModalVisible] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Führe die Suche automatisch mit dem initialen Suchbegriff aus
  useEffect(() => {
    if (initialSearch) {
      performSearch(initialSearch);
    }
  }, [initialSearch]);

  // Debounced Search Function
  const debouncedSearch = useCallback(
    (query: string) => {
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
    },
    [language]
  );

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
        console.log('Kann den Link nicht öffnen: ' + url);
        setError('Kann den Link nicht öffnen');
      }
    });
  };

  const closeArticleModal = () => {
    setIsArticleModalVisible(false);
    setSelectedArticle(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      <View style={[styles.searchContainer, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
        <View
          style={[
            styles.searchInputContainer,
            { 
              backgroundColor: isDark ? '#252525' : '#f0f0f0',
            },
          ]}
        >
          <Icon 
            name="search" 
            size={22} 
            color={isDark ? '#03dac6' : '#00acc1'} 
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={[
              styles.searchInput,
              { 
                color: isDark ? '#ffffff' : '#000000',
                fontSize,
              }
            ]}
            placeholder="Suchbegriff eingeben..."
            placeholderTextColor={isDark ? '#888888' : '#999999'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon 
                name="close-circle" 
                size={20} 
                color={isDark ? '#aaaaaa' : '#777777'} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error && (
        <Text style={[styles.errorText, { color: isDark ? '#cf6679' : '#e53935', fontSize }]}>
          {error}
        </Text>
      )}

      {isLoading ? (
        <View style={[styles.centered, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
          <ActivityIndicator size="large" color={isDark ? '#03dac6' : '#00acc1'} />
          <Text style={[styles.loadingText, { color: isDark ? '#e1e1e1' : '#333333', fontSize }]}>
            Informationen werden geladen...
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#f5f5f5' }}>
          <FlatList
            data={results}
            keyExtractor={item => item.pageid.toString()}
            style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#f5f5f5' }}
            contentContainerStyle={{ 
              padding: 16, 
              paddingBottom: 20, 
              backgroundColor: isDark ? '#121212' : '#f5f5f5' 
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.resultItem,
                  { 
                    backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                    borderLeftColor: isDark ? '#03dac6' : '#00acc1',
                    shadowOpacity: isDark ? 0.3 : 0.1,
                  }
                ]}
                onPress={() => viewArticleDetails(item.pageid)}
              >
                <Text
                  style={[
                    styles.resultTitle, 
                    { color: isDark ? '#ffffff' : '#333333', fontSize: fontSize * 1.1 }
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.resultSnippet, 
                    { color: isDark ? '#b0b0b0' : '#666666', fontSize: fontSize * 0.9 }
                  ]}
                  numberOfLines={3}
                >
                  {item.snippet.replace(/<[^>]*>/g, '')}
                </Text>
                <Text
                  style={[
                    styles.resultMoreLink,
                    { color: isDark ? '#03dac6' : '#00acc1', fontSize: fontSize * 0.9 }
                  ]}
                >
                  Mehr anzeigen
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !error && !isLoading && searchQuery.trim() ? (
                <View style={[styles.centered, { 
                  backgroundColor: isDark ? '#121212' : '#f5f5f5', 
                  padding: 40 
                }]}>
                  <Icon 
                    name="search-outline" 
                    size={50} 
                    color={isDark ? '#666666' : '#999999'} 
                    style={{ marginBottom: 16, opacity: 0.7 }}
                  />
                  <Text style={[{ 
                    color: isDark ? '#b0b0b0' : '#666666',
                    fontSize,
                    textAlign: 'center'
                  }]}>
                    {t('no_results_found')}
                  </Text>
                </View>
              ) : searchQuery.trim() === '' ? (
                <View style={[styles.centered, { 
                  backgroundColor: isDark ? '#121212' : '#f5f5f5', 
                  padding: 40 
                }]}>
                  <Icon 
                    name="search-outline" 
                    size={50} 
                    color={isDark ? '#666666' : '#999999'} 
                    style={{ marginBottom: 16, opacity: 0.7 }}
                  />
                  <Text style={[{
                    color: isDark ? '#b0b0b0' : '#666666',
                    fontSize,
                    textAlign: 'center'
                  }]}>
                    {t('enter_search_term')}
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
          <View style={[{
            flex: 1,
            backgroundColor: isDark ? '#121212' : '#f5f5f5'
          }]}>
            <View
              style={[
                styles.modalHeader,
                {
                  backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                  borderBottomColor: isDark ? '#333333' : '#dddddd',
                }
              ]}
            >
              <TouchableOpacity onPress={closeArticleModal} style={{ padding: 8 }}>
                <Icon name="arrow-back" size={24} color={isDark ? '#03dac6' : '#00acc1'} />
              </TouchableOpacity>
              <Text
                style={[
                  styles.modalTitle, 
                  { 
                    color: isDark ? '#ffffff' : '#333333', 
                    fontSize: fontSize * 1.1,
                  }
                ]}
                numberOfLines={1}
              >
                {selectedArticle.title}
              </Text>
              <TouchableOpacity
                onPress={() => openArticleInBrowser(selectedArticle.url)}
                style={{ padding: 8 }}
              >
                <Icon name="open-outline" size={24} color={isDark ? '#03dac6' : '#00acc1'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ 
              flex: 1, 
              backgroundColor: isDark ? '#121212' : '#f5f5f5',
              padding: 16 
            }}>
              {selectedArticle.thumbnail && (
                <View style={[
                  styles.thumbnailContainer,
                  {
                    backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                    shadowOpacity: isDark ? 0.3 : 0.1,
                  }
                ]}>
                  <Image
                    source={{ uri: selectedArticle.thumbnail }}
                    style={{ width: '100%', height: 200, borderRadius: 8 }}
                    resizeMode="contain"
                  />
                </View>
              )}
              
              <View style={[
                styles.articleContainer,
                {
                  backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                  borderLeftColor: isDark ? '#03dac6' : '#00acc1',
                  shadowOpacity: isDark ? 0.3 : 0.1,
                }
              ]}>
                <Text style={[
                  styles.articleTitle,
                  { color: isDark ? '#ffffff' : '#333333', fontSize: fontSize * 1.3 }
                ]}>
                  {selectedArticle.title}
                </Text>
                <Text style={[
                  styles.articleText,
                  { color: isDark ? '#b0b0b0' : '#666666', fontSize }
                ]}>
                  {selectedArticle.extract}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.browserButton,
                  { backgroundColor: isDark ? '#03dac6' : '#00acc1' }
                ]}
                onPress={() => openArticleInBrowser(selectedArticle.url)}
              >
                <Icon name="earth" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.browserButtonText}>
                  Im Browser öffnen
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        ) : (
          <View style={[styles.centered, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
            <ActivityIndicator size="large" color={isDark ? '#03dac6' : '#00acc1'} />
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    borderRadius: 16,
    borderWidth: 0,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 48,
    paddingVertical: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    padding: 16,
    textAlign: 'center',
  },
  resultItem: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 8
  },
  resultSnippet: {
    marginBottom: 8,
    lineHeight: 22
  },
  resultMoreLink: {
    textAlign: 'right'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    marginHorizontal: 16
  },
  thumbnailContainer: {
    alignItems: 'center',
    marginVertical: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  articleContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  articleTitle: {
    fontWeight: 'bold',
    marginBottom: 16
  },
  articleText: {
    lineHeight: 24
  },
  browserButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  browserButtonText: {
    color: '#ffffff', 
    fontWeight: 'bold'
  }
});

export default MedizinSearch;
