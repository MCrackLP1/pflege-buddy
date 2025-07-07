/**
 * HomeScreen.tsx
 * Hauptbildschirm der App mit Notfallchecklisten und Suchfunktion
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Vibration,
  ScrollView,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  Platform,
  Animated,
  PanResponder,
  Easing,
  Linking,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XMLParser } from 'fast-xml-parser';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';

// Import Typen
import {
  RootStackParamList,
  EmergencyId,
  Disease,
  NursingStandard,
  LexikonEntry,
} from '../types/types';

// Import Hooks
import { useSettings } from '../context/SettingsContext';
import { useAIChatConsent } from '../context/AIChatConsentContext';
import AIChatConsentModal from '../components/AIChatConsentModal';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';

// Import data
import { emergencyData, nursingStandardsData, lexikonEntries } from '../utils/data';

// Import Wikipedia Service
import { searchMedicalWikipedia, WikipediaSearchResult } from '../services/WikipediaService';

// Lokale Daten importieren
import localDiseasesData from '../../data/german_icd10_data.json';
import laborparameterData from '../../data/laborparameter.json';

// Navigationstyp definieren
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const { t } = useTranslation();

  // App-Farben definieren basierend auf dem Theme
  const appColors = {
    primary: theme === 'dark' ? '#bb86fc' : '#0066cc',
    secondary: theme === 'dark' ? '#03dac6' : '#00acc1',
    error: theme === 'dark' ? '#cf6679' : '#e53935',
    background: theme === 'dark' ? '#121212' : '#f5f5f5',
    card: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    text: theme === 'dark' ? '#e1e1e1' : '#333333',
    subText: theme === 'dark' ? '#b0b0b0' : '#666666',
  };

  // Füge die Chat-Button-Styles zu den dynamischen Styles hinzu
  const chatStyles = {
    chatButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: '#4CAF50',
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 14,
      marginBottom: 14,
      justifyContent: 'center' as const,
    },
    chatButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold' as const,
      marginLeft: 8,
    },
  };

  // Animationen für Karten-Skalierung
  const cardScale1 = useRef(new Animated.Value(1)).current;
  const cardScale2 = useRef(new Animated.Value(1)).current;
  const cardScale3 = useRef(new Animated.Value(1)).current;
  const cardScale4 = useRef(new Animated.Value(1)).current;

  // State für die rotierenden Pflege-Tipps
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const tipTranslateX = useRef(new Animated.Value(0)).current;
  const tipOpacity = useRef(new Animated.Value(1)).current;

  // State für die globale Suche
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [wikiResults, setWikiResults] = useState<WikipediaSearchResult[]>([]);
  const searchInputRef = useRef<TextInput>(null);

  // Animation für das 💡-Icon (blinken)
  const lightbulbAnim = useRef(new Animated.Value(1)).current;
  
  // Card Animation beim Laden
  useEffect(() => {
    // Sequenz von Animationen für die Karten beim Start
    Animated.stagger(150, [
      Animated.spring(cardScale1, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale2, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale3, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale4, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Reset initial values
    cardScale1.setValue(0.8);
    cardScale2.setValue(0.8);
    cardScale3.setValue(0.8);
    cardScale4.setValue(0.8);
  }, []);
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(lightbulbAnim, {
          toValue: 0.4,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(lightbulbAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [lightbulbAnim]);

  // Swipe für die Info-Karte mit verbesserter Animation
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20,
      onPanResponderGrant: () => {
        tipOpacity.setValue(1);
        tipTranslateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        tipTranslateX.setValue(gestureState.dx);
        // Fade out when swiping
        if (Math.abs(gestureState.dx) > 50) {
          const opacityValue = Math.max(0, 1 - Math.abs(gestureState.dx) / 200);
          tipOpacity.setValue(opacityValue);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50) {
          // Swipe left
          Animated.timing(tipTranslateX, {
            toValue: -screenWidth,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            setCurrentTipIndex(prev => (prev + 1) % pflegeTipps.length);
            tipTranslateX.setValue(screenWidth);
            Animated.timing(tipTranslateX, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }).start();
          });
        } else if (gestureState.dx > 50) {
          // Swipe right
          Animated.timing(tipTranslateX, {
            toValue: screenWidth,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            setCurrentTipIndex(prev => (prev - 1 + pflegeTipps.length) % pflegeTipps.length);
            tipTranslateX.setValue(-screenWidth);
            Animated.timing(tipTranslateX, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }).start();
          });
        } else {
          // Reset to center if swipe not far enough
          Animated.spring(tipTranslateX, {
            toValue: 0,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }).start();
          Animated.spring(tipOpacity, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Tipps aus der Übersetzungsdatei laden
  const pflegeTipps = t('tips', { returnObjects: true }) as string[];

  // Rotierender Tipp mit besserer Animation
  useEffect(() => {
    const interval = setInterval(() => {
      // Animate out current tip
      Animated.parallel([
        Animated.timing(tipOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(tipTranslateX, {
          toValue: -100,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Change tip index
        setCurrentTipIndex(prevIndex => (prevIndex + 1) % pflegeTipps.length);
        // Reset animation values for entrance
        tipTranslateX.setValue(100);
        // Animate in new tip
        Animated.parallel([
          Animated.timing(tipOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(tipTranslateX, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // State für Laborparameter
  const [laborparameter, setLaborparameter] = useState<any[]>([]);

  useEffect(() => {
    // Laborparameter laden
    if (laborparameterData && Array.isArray(laborparameterData.parameter)) {
      setLaborparameter(laborparameterData.parameter);
    }
  }, []);

  // Suchfunktion implementieren
  useEffect(() => {
    if (searchText.trim().length < 2) {
      setSearchResults([]);
      setWikiResults([]);
      return;
    }

    setIsSearching(true);

    // App-weite Suche durchführen
    performSearch(searchText);
  }, [searchText]);

  // App-weite Suche implementieren
  const performSearch = async (query: string) => {
    const lowercaseQuery = query.toLowerCase().trim();

    // Notfälle durchsuchen
    const emergencyResults = Object.values(emergencyData)
      .filter(item => item.title.toLowerCase().includes(lowercaseQuery))
      .map(item => ({ ...item, type: 'emergency' }));

    // Krankheiten durchsuchen
    const diseasesResults = localDiseasesData
      .filter(
        (item: Disease) =>
          item.name.toLowerCase().includes(lowercaseQuery) ||
          item.code.toLowerCase().includes(lowercaseQuery) ||
          item.fachgebiet.toLowerCase().includes(lowercaseQuery)
      )
      .slice(0, 5) // Begrenze auf 5 Ergebnisse
      .map(item => ({ ...item, type: 'disease' }));

    // Standards durchsuchen
    const standardsResults = nursingStandardsData
      .filter(
        item =>
          item.title.toLowerCase().includes(lowercaseQuery) ||
          item.ziel.toLowerCase().includes(lowercaseQuery)
      )
      .map(item => ({ ...item, type: 'standard' }));

    // Lexikon-Einträge durchsuchen
    const lexikonResults = lexikonEntries
      .filter(
        item =>
          item.term.toLowerCase().includes(lowercaseQuery) ||
          item.definition.toLowerCase().includes(lowercaseQuery)
      )
      .map(item => ({ ...item, type: 'lexikon' }));

    // Laborparameter durchsuchen
    const laborResults = laborparameter
      .filter(
        item =>
          item.name?.toLowerCase().includes(lowercaseQuery) ||
          item.kuerzel?.toLowerCase().includes(lowercaseQuery)
      )
      .map(item => ({ ...item, type: 'labor' }));

    // Alle Ergebnisse zusammenführen
    const allResults = [
      ...emergencyResults,
      ...diseasesResults,
      ...standardsResults,
      ...lexikonResults,
      ...laborResults,
    ];

    setSearchResults(allResults);

    // Wikipedia-Suche nach medizinischen Informationen
    if (lowercaseQuery.length >= 3) {
      try {
        const wiki = await searchMedicalWikipedia(lowercaseQuery, 'de', 3);
        setWikiResults(wiki);
      } catch (error) {
        console.error('Fehler bei der Wikipedia-Suche:', error);
      }
    }

    setIsSearching(false);
  };

  // Funktion zum Navigieren zur Notfall-Checklisten-Übersicht
  const openEmergencyChecklists = () => {
    Vibration.vibrate(30);
    navigation.navigate('EmergencyChecklist', {});
  };

  // Funktion zum Öffnen der App-weiten Suche
  const openSearch = () => {
    Vibration.vibrate(30);
    setSearchModalVisible(true);
    // Mit setTimeout wird der Fokus gesetzt, nachdem die Modal-Animation abgeschlossen ist
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 300);
  };

  // Funktion zum Navigieren zum Pflegewissen
  const openPflegewissen = () => {
    Vibration.vibrate(30);
    navigation.navigate('WissenStack', {
      screen: 'WissenLanding',
    });
  };

  // Funktion zum Navigieren zu den Tools
  const openTools = () => {
    Vibration.vibrate(30);
    navigation.navigate('ToolsStack', {
      screen: 'ToolsLanding',
    });
  };

  const { hasConsentedToAIChat, setHasConsentedToAIChat, isLoadingConsent } = useAIChatConsent();
  const [aiConsentModalVisible, setAiConsentModalVisible] = useState(false);

  const openChat = async () => {
    Vibration.vibrate(30);
    if (isLoadingConsent) {
      return;
    }
    if (hasConsentedToAIChat) {
      navigation.navigate('Chat');
    } else {
      setAiConsentModalVisible(true);
    }
  };

  const handleConfirmAIConsent = async () => {
    await setHasConsentedToAIChat(true);
    setAiConsentModalVisible(false);
    navigation.navigate('Chat');
  };

  const handlePrivacyPolicyLink = () => {
    setAiConsentModalVisible(false);
    navigation.navigate('Datenschutz');
  };

  // Funktion um auf ein Suchergebnis zu reagieren
  const handleSearchResultPress = (item: any) => {
    setSearchModalVisible(false);
    setSearchText('');

    switch (item.type) {
      case 'emergency':
        navigation.navigate('EmergencyChecklist', { emergencyId: item.id });
        break;
      case 'disease':
        navigation.navigate('WissenStack', { screen: 'WissenListen' });
        break;
      case 'standard':
        navigation.navigate('ToolsStack', {
          screen: 'StandardDetail',
          params: { standardId: item.id },
        });
        break;
      case 'lexikon':
        navigation.navigate('WissenStack', {
          screen: 'LexikonDetail',
          params: { termId: item.id },
        });
        break;
      case 'wiki':
        navigation.navigate('MedizinSearch', { initialSearch: item.title });
        break;
      case 'labor':
        navigation.navigate('WissenStack', {
          screen: 'LaborparameterDetail',
          params: { labor: item },
        });
        break;
    }
  };

  // Render-Funktionen für Suchergebnisse
  const renderEmergencyResult = (item: any) => (
    <TouchableOpacity style={styles.listItem} onPress={() => handleSearchResultPress(item)}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, marginRight: 10 }}>{item.icon}</Text>
        <Text style={styles.itemTitle}>{item.title}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={theme === 'dark' ? '#aaaaaa' : '#666666'} />
    </TouchableOpacity>
  );

  const renderDiseaseResult = (item: any) => (
    <TouchableOpacity style={styles.listItem} onPress={() => handleSearchResultPress(item)}>
      <View>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemSubtitle}>
          {item.code} | {item.fachgebiet}
        </Text>
      </View>
      <Icon name="chevron-forward" size={20} color={theme === 'dark' ? '#aaaaaa' : '#666666'} />
    </TouchableOpacity>
  );

  const renderStandardResult = (item: any) => (
    <TouchableOpacity style={styles.listItem} onPress={() => handleSearchResultPress(item)}>
      <View>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemSubtitle} numberOfLines={1}>
          {item.ziel}
        </Text>
      </View>
      <Icon name="chevron-forward" size={20} color={theme === 'dark' ? '#aaaaaa' : '#666666'} />
    </TouchableOpacity>
  );

  const renderLexikonResult = (item: any) => (
    <TouchableOpacity style={styles.listItem} onPress={() => handleSearchResultPress(item)}>
      <View>
        <Text style={styles.itemTitle}>{item.term}</Text>
        <Text style={styles.itemSubtitle} numberOfLines={1}>
          {item.definition.length > 50 ? `${item.definition.substring(0, 50)}...` : item.definition}
        </Text>
      </View>
      <Icon name="chevron-forward" size={20} color={theme === 'dark' ? '#aaaaaa' : '#666666'} />
    </TouchableOpacity>
  );

  const renderLaborResult = (item: any) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => {
        setSearchModalVisible(false);
        navigation.navigate('WissenStack', {
          screen: 'LaborparameterDetail',
          params: { labor: item },
        });
      }}
    >
      <Icon
        name="flask-outline"
        size={24}
        color={theme === 'dark' ? '#32b8ca' : '#32b8ca'}
        style={{ marginRight: 12 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemTitle, { fontSize: baseFontSize * fontSizeScale * 1.05 }]}>
          {item.name}
        </Text>
        <Text style={[styles.itemSubtitle, { color: theme === 'dark' ? '#aaa' : '#666' }]}>
          {item.kuerzel}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderWikiResult = (item: WikipediaSearchResult) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleSearchResultPress({ ...item, type: 'wiki' })}
    >
      <View>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemSubtitle} numberOfLines={1}>
          {item.snippet.replace(/<[^>]*>/g, '')}
        </Text>
      </View>
      <Icon name="open-outline" size={20} color={theme === 'dark' ? '#03dac6' : '#00acc1'} />
    </TouchableOpacity>
  );

  // Such-Modal rendern
  const renderSearchModal = () => (
    <Modal
      visible={searchModalVisible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {
        setSearchModalVisible(false);
        setSearchText('');
      }}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => {
              setSearchModalVisible(false);
              setSearchText('');
            }}
            style={{ padding: 8 }}
          >
            <Icon name="arrow-back" size={24} color={theme === 'dark' ? '#ffffff' : '#333333'} />
          </TouchableOpacity>

          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { flex: 1, marginHorizontal: 10, height: 40 }]}
            placeholder={t('search_icd10_placeholder')}
            placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />

          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} style={{ padding: 8 }}>
              <Icon
                name="close-circle"
                size={24}
                color={theme === 'dark' ? '#aaaaaa' : '#666666'}
              />
            </TouchableOpacity>
          )}
        </View>

        {isSearching ? (
          <View style={styles.centeredContent}>
            <ActivityIndicator size="large" color={theme === 'dark' ? '#03dac6' : '#00acc1'} />
            <Text style={[styles.itemSubtitle, { marginTop: 16 }]}>{t('searching')}</Text>
          </View>
        ) : searchText.length < 2 ? (
          <View style={styles.centeredContent}>
            <Icon name="search" size={64} color={theme === 'dark' ? '#666666' : '#cccccc'} />
            <Text style={[styles.itemSubtitle, { marginTop: 16 }]}>
              {t('enter_at_least_2_characters')}
            </Text>
          </View>
        ) : searchResults.length === 0 && wikiResults.length === 0 ? (
          <View style={styles.centeredContent}>
            <Icon
              name="alert-circle-outline"
              size={64}
              color={theme === 'dark' ? '#666666' : '#cccccc'}
            />
            <Text style={[styles.itemSubtitle, { marginTop: 16 }]}>{t('no_results')}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {/* Notfälle */}
            {searchResults.filter(item => item.type === 'emergency').length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>{t('emergencies')}</Text>
                {searchResults
                  .filter(item => item.type === 'emergency')
                  .map((item, index) => (
                    <View key={item.id}>{renderEmergencyResult(item)}</View>
                  ))}
              </View>
            )}

            {/* Krankheiten */}
            {searchResults.filter(item => item.type === 'disease').length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>{t('diseases')}</Text>
                {searchResults
                  .filter(item => item.type === 'disease')
                  .map((item, index) => (
                    <View key={item.code}>{renderDiseaseResult(item)}</View>
                  ))}
              </View>
            )}

            {/* Standards */}
            {searchResults.filter(item => item.type === 'standard').length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>{t('care_standards_section')}</Text>
                {searchResults
                  .filter(item => item.type === 'standard')
                  .map((item, index) => (
                    <View key={item.id}>{renderStandardResult(item)}</View>
                  ))}
              </View>
            )}

            {/* Lexikon */}
            {searchResults.filter(item => item.type === 'lexikon').length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>{t('lexicon')}</Text>
                {searchResults
                  .filter(item => item.type === 'lexikon')
                  .map((item, index) => (
                    <View key={item.id}>{renderLexikonResult(item)}</View>
                  ))}
              </View>
            )}

            {/* Laborparameter */}
            {searchResults.filter(item => item.type === 'labor').length > 0 && (
              <View style={{ marginTop: 18 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 6 }]}>{t('lab_parameters')}</Text>
                {searchResults
                  .filter(item => item.type === 'labor')
                  .map(item => (
                    <View key={item.id || item.kuerzel}>{renderLaborResult(item)}</View>
                  ))}
              </View>
            )}

            {/* Wikipedia */}
            {wikiResults.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>
                  {t('medical_information')}
                </Text>
                {wikiResults.map((item, index) => (
                  <View key={item.pageid}>{renderWikiResult(item)}</View>
                ))}
                <TouchableOpacity
                  style={[styles.button, { marginTop: 8 }]}
                  onPress={() => {
                    setSearchModalVisible(false);
                    navigation.navigate('MedizinSearch', { initialSearch: searchText });
                  }}
                >
                  <Text style={styles.buttonText}>{t('more_medical_info')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  const [blogArticles, setBlogArticles] = useState<any[]>([]);
  const [currentBlogIndex, setCurrentBlogIndex] = useState(0);

  // Blogartikel laden
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        console.log('Versuche Blog-Artikel zu laden von: https://plegebuddy.care/blog/rss.xml');
        const res = await fetch('https://plegebuddy.care/blog/rss.xml');
        console.log('Blog API Antwort Status:', res.status);
        const text = await res.text();
        console.log('Blog API Antwort Länge:', text.length);
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_"
        });
        const xml = parser.parse(text);
        console.log('Geparste XML Daten:', JSON.stringify(xml).slice(0, 200) + '...');
        const items = (xml.rss?.channel?.item || []).map((item: any) => {
          console.log('Blog Item Enclosure (nach Parser-Anpassung):', JSON.stringify(item.enclosure)); 
          return {
            title: item.title,
            link: item.link,
            description: item.description,
            pubDate: item.pubDate,
            image: item.enclosure?.['@_url'] || '',
          };
        });
        console.log(`${items.length} Blog-Artikel geladen`);
        setBlogArticles(items);
        setCurrentBlogIndex(Math.floor(Math.random() * items.length));
      } catch (e) {
        // Fehler loggen statt ignorieren
        console.error('Fehler beim Laden der Blog-Artikel:', e);
        
        // Fallback-Artikel setzen, wenn API fehlschlägt
        const fallbackArticles = [
          {
            title: 'Tipps zur Pflegedokumentation',
            link: 'https://pflegebuddy.care/blog/pflegedokumentation-tipps',
            description: 'Eine gute Pflegedokumentation ist wichtig für die Qualitätssicherung und rechtliche Absicherung. Hier sind einige Tipps für eine effektive Dokumentation.',
            pubDate: new Date().toISOString(),
            image: '',
          }
        ];
        setBlogArticles(fallbackArticles);
        setCurrentBlogIndex(0);
      }
    };
    fetchBlog();
  }, []);

  // Alle 5 Minuten zufälligen Artikel wählen
  useEffect(() => {
    if (blogArticles.length === 0) return;
    const interval = setInterval(
      () => {
        setCurrentBlogIndex(Math.floor(Math.random() * blogArticles.length));
      },
      5 * 60 * 1000
    );
    return () => clearInterval(interval);
  }, [blogArticles]);

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Header mit dynamischem Gradient */}
      <LinearGradient
        colors={
          theme === 'dark' 
            ? ['#1a1a2e', '#121212', '#121212'] 
            : ['#32b8ca', '#f5f5f5', '#f5f5f5']
        }
        locations={[0, 0.85, 1]}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={{
          paddingTop: insets.top,
          paddingBottom: 25,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          marginBottom: 0,
          elevation: 0,
          shadowColor: "transparent",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
        }}
      >
        <Text
          style={{
            fontSize: baseFontSize * fontSizeScale * 1.4,
            fontWeight: 'bold',
            color: theme === 'dark' ? '#ffffff' : '#ffffff',
            marginTop: 10,
            textAlign: 'center',
            textShadowColor: 'rgba(0, 0, 0, 0.2)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          }}
        >
          {t('app_title')}
        </Text>
        <Text
          style={{
            fontSize: baseFontSize * fontSizeScale * 0.9,
            color: theme === 'dark' ? '#e1e1e1' : '#ffffff',
            marginTop: 5,
            textAlign: 'center',
            opacity: 0.9,
          }}
        >
          {t('home_subtitle')}
        </Text>
        
        {/* Suchleiste */}
        <TouchableOpacity
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
            borderRadius: 25,
            paddingHorizontal: 15,
            paddingVertical: 12,
            marginTop: 15,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          }}
          onPress={openSearch}
          activeOpacity={0.8}
        >
          <Icon 
            name="search" 
            size={20} 
            color={theme === 'dark' ? '#e1e1e1' : '#333333'} 
          />
          <Text
            style={{
              marginLeft: 10,
              color: theme === 'dark' ? '#b0b0b0' : '#666666',
              fontSize: baseFontSize * fontSizeScale,
            }}
          >
            {t('home_search_placeholder')}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={{ 
          padding: 16,
          paddingTop: 8 
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Notfall-Button */}
        <TouchableOpacity
          style={[
            {
              borderRadius: 16,
              padding: 20,
              borderLeftWidth: 5,
              borderLeftColor: theme === 'dark' ? '#e53935' : '#e53935',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 90,
              borderWidth: 0,
              marginHorizontal: 0,
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
              shadowColor: '#e53935',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 12,
              marginBottom: 20,
              marginTop: 8,
              overflow: 'hidden',
            },
          ]}
          onPress={openEmergencyChecklists}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: baseFontSize * fontSizeScale * 1.1,
                fontWeight: 'bold',
                color: theme === 'dark' ? '#ffffff' : '#333333',
              }}
            >
              {t('emergency_checklists')}
            </Text>
          </View>
          <Icon
            name="chevron-forward-circle"
            size={30}
            color={theme === 'dark' ? '#e53935' : '#e53935'}
          />
        </TouchableOpacity>

        {/* Haupt-Funktionen Grid */}
        <View style={{ marginBottom: 20 }}>
          <View 
            style={{
              flexDirection: 'row', 
              justifyContent: 'space-between',
              marginBottom: 12,
              gap: 12
            }}
          >
            {/* Pflegewissen */}
            <TouchableOpacity
              style={{
                flex: 1,
                height: 110,
                padding: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                borderRadius: 16,
                borderWidth: 0,
                borderLeftWidth: 5,
                borderLeftColor: theme === 'dark' ? '#03dac6' : '#00acc1',
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2
              }}
              onPress={openPflegewissen}
            >
              <View 
                style={{
                  width: 60, 
                  height: 60, 
                  borderRadius: 30,
                  backgroundColor: theme === 'dark' ? 'rgba(3, 218, 198, 0.15)' : 'rgba(0, 172, 193, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10
                }}
              >
                <Icon name="book" size={30} color={theme === 'dark' ? '#03dac6' : '#00acc1'} />
              </View>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: baseFontSize * fontSizeScale * 0.9,
                  fontWeight: '500',
                  color: theme === 'dark' ? '#ffffff' : '#333333',
                }}
              >
                {t('knowledge')}
              </Text>
            </TouchableOpacity>

            {/* Tools */}
            <TouchableOpacity
              style={{
                flex: 1,
                height: 110,
                padding: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                borderRadius: 16,
                borderWidth: 0,
                borderLeftWidth: 5,
                borderLeftColor: theme === 'dark' ? '#03dac6' : '#00acc1',
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2
              }}
              onPress={openTools}
            >
              <View 
                style={{
                  width: 60, 
                  height: 60, 
                  borderRadius: 30,
                  backgroundColor: theme === 'dark' ? 'rgba(3, 218, 198, 0.15)' : 'rgba(0, 172, 193, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10
                }}
              >
                <Icon name="build" size={30} color={theme === 'dark' ? '#03dac6' : '#00acc1'} />
              </View>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: baseFontSize * fontSizeScale * 0.9,
                  fontWeight: '500',
                  color: theme === 'dark' ? '#ffffff' : '#333333',
                }}
              >
                {t('tools')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Chat-Button */}
          <TouchableOpacity 
            style={{
              backgroundColor: '#4CAF50',
              padding: 16,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 0,
              borderLeftWidth: 5,
              borderLeftColor: '#378a3c',
              shadowColor: "rgba(76, 175, 80, 0.4)",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 3,
              opacity: isLoadingConsent ? 0.5 : 1
            }} 
            onPress={openChat}
            disabled={isLoadingConsent}
          >
            <View 
              style={{
                width: 36, 
                height: 36, 
                borderRadius: 18,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12
              }}
            >
              <Icon name="chatbubble-ellipses" size={20} color="#fff" />
            </View>
            <Text 
              style={{
                color: '#fff',
                fontSize: baseFontSize * fontSizeScale * 1.1,
                fontWeight: '600',
              }}
            >
              {t('ai_chat_button')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Wusstest du schon? Info-Karte mit Swipe und animiertem Icon */}
        <View
          {...panResponder.panHandlers}
          style={{
            backgroundColor: theme === 'dark' ? '#252525' : '#f0f7fa',
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            borderLeftWidth: 5,
            borderLeftColor: theme === 'dark' ? '#03dac6' : '#00acc1',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
              justifyContent: 'center',
            }}
          >
            <Animated.Text
              style={{
                fontSize: baseFontSize * fontSizeScale * 1.1,
                marginRight: 8,
                opacity: lightbulbAnim,
              }}
            >
              💡
            </Animated.Text>
            <Text
              style={{
                fontSize: baseFontSize * fontSizeScale * 1.1,
                fontWeight: 'bold',
                color: theme === 'dark' ? '#ffffff' : '#333333',
              }}
            >
              {t('did_you_know')}
            </Text>
          </View>
          <Text
            style={{
              fontSize: baseFontSize * fontSizeScale,
              color: theme === 'dark' ? '#e1e1e1' : '#333333',
              lineHeight: baseFontSize * fontSizeScale * 1.4,
              textAlign: 'center',
            }}
          >
            {pflegeTipps[currentTipIndex]}
          </Text>
          <View 
            style={{
              flexDirection: 'row', 
              justifyContent: 'center',
              marginTop: 12,
              opacity: 0.6
            }}
          >
            <Text style={{ color: theme === 'dark' ? '#aaaaaa' : '#666666', fontSize: 12 }}>
              ← {t('swipe_left_for_more_tips')}
            </Text>
          </View>
        </View>

        {blogArticles.length > 0 && (
          <TouchableOpacity
            style={{
              backgroundColor: theme === 'dark' ? '#252525' : '#ffffff',
              borderRadius: 16,
              padding: 0,
              marginBottom: 20,
              overflow: 'hidden',
              borderWidth: 0,
              borderLeftWidth: 5,
              borderLeftColor: theme === 'dark' ? '#03dac6' : '#00acc1',
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2
            }}
            onPress={() => {
              let url = blogArticles[currentBlogIndex].link;
              if (url && !url.startsWith('http')) {
                url = 'https://plegebuddy.care' + (url.startsWith('/') ? '' : '/') + url;
              } else if (url && url.match(/pflegebuddy\.de/)) {
                url = url.replace(
                  /https?:\/\/(www\.)?pflegebuddy\.de/,
                  'https://plegebuddy.care'
                );
              } else if (url && url.match(/pflegebuddy\.vercel\.app/)) {
                url = url.replace(
                  /https?:\/\/(www\.)?pflegebuddy\.vercel\.app/,
                  'https://plegebuddy.care'
                );
              } else if (url && url.match(/pflegebuddy\.care/)) {
                url = url.replace(
                  /https?:\/\/(www\.)?pflegebuddy\.care/,
                  'https://plegebuddy.care'
                );
              }
              Linking.openURL(url);
            }}
            activeOpacity={0.85}
          >
            {blogArticles[currentBlogIndex].image ? (
              <Image
                source={{ uri: blogArticles[currentBlogIndex].image }}
                style={{ 
                  width: '100%', 
                  height: 160, 
                  backgroundColor: '#f0f0f0' 
                }}
                resizeMode="cover"
              />
            ) : null}
            
            <View style={{ padding: 16 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: baseFontSize * fontSizeScale * 0.9,
                    color: theme === 'dark' ? '#03dac6' : '#00acc1',
                    fontWeight: '600',
                    marginRight: 8,
                  }}
                >
                  {t('blog_article_label')}
                </Text>
                <View 
                  style={{ 
                    height: 4, 
                    width: 4, 
                    borderRadius: 2, 
                    backgroundColor: theme === 'dark' ? '#555555' : '#cccccc',
                    marginRight: 8 
                  }}
                />
                <Text
                  style={{
                    fontSize: baseFontSize * fontSizeScale * 0.8,
                    color: theme === 'dark' ? '#888888' : '#888888',
                  }}
                >
                  {new Date(blogArticles[currentBlogIndex].pubDate).toLocaleDateString()}
                </Text>
              </View>
              
              <Text
                style={{
                  color: theme === 'dark' ? '#ffffff' : '#333333',
                  fontWeight: 'bold',
                  fontSize: baseFontSize * fontSizeScale * 1.1,
                  marginBottom: 8,
                }}
              >
                {blogArticles[currentBlogIndex].title}
              </Text>
              
              <Text
                style={{
                  color: theme === 'dark' ? '#e1e1e1' : '#333333',
                  fontSize: baseFontSize * fontSizeScale * 0.9,
                  lineHeight: baseFontSize * fontSizeScale * 1.3,
                  marginBottom: 12
                }}
                numberOfLines={3}
              >
                {blogArticles[currentBlogIndex].description.replace(/<[^>]+>/g, '')}
              </Text>
              
              <Text
                style={{
                  color: theme === 'dark' ? '#03dac6' : '#00acc1',
                  fontSize: baseFontSize * fontSizeScale * 0.9,
                  fontWeight: '600',
                }}
              >
                {t('read_more')} →
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      {renderSearchModal()}

      {isLoadingConsent && (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="large" color={theme === 'dark' ? '#bb86fc' : '#0066cc'} />
            <Text style={{color: theme === 'dark' ? '#fff' : '#000', marginTop: 10}}>{t('loading_settings')}</Text>
        </View>
      )}

      <AIChatConsentModal
        visible={aiConsentModalVisible}
        onClose={() => setAiConsentModalVisible(false)}
        onConfirm={handleConfirmAIConsent}
        onPrivacyPolicyPress={handlePrivacyPolicyLink}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  logo: {
    width: 100,
    height: 50,
  },
  searchButton: {
    padding: 8,
  },
  scrollView: {
    padding: 14,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e53935',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 14,
    marginBottom: 14,
    justifyContent: 'center',
  },
  emergencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 14,
    marginBottom: 14,
    justifyContent: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  section: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  searchInput: {
    flex: 1,
    padding: 8,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#03dac6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
