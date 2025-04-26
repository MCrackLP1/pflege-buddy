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
  Linking
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XMLParser } from 'fast-xml-parser';

// Import Typen
import { RootStackParamList, EmergencyId, Disease, NursingStandard, LexikonEntry } from '../types/types';

// Import Hooks
import { useSettings } from '../context/SettingsContext';

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
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  
  // State für die rotierenden Pflege-Tipps
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  
  // State für die globale Suche
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [wikiResults, setWikiResults] = useState<WikipediaSearchResult[]>([]);
  const searchInputRef = useRef<TextInput>(null);
  
  // Animation für den Notfall-Button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Animation für das 💡-Icon (blinken)
  const lightbulbAnim = useRef(new Animated.Value(1)).current;
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

  // Swipe für die Info-Karte
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 20,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -30) {
          setCurrentTipIndex((prev) => (prev + 1) % pflegeTipps.length);
        } else if (gestureState.dx > 30) {
          setCurrentTipIndex((prev) => (prev - 1 + pflegeTipps.length) % pflegeTipps.length);
        }
      },
    })
  ).current;
  
  // Liste von Pflege-Tipps
  const pflegeTipps = [
    "Bei Atemnot Patienten aufrecht hinsetzen und beruhigen.",
    "Unterzucker zeigt sich oft durch Unruhe, Schwitzen und Zittern.",
    "Bei Schlaganfall zählt jede Minute – 112 rufen, keine Zeit verlieren!",
    "Bei Verdacht auf Allergie oder Anaphylaxie: Notfallset sofort bereitstellen.",
    "Fieber ist ab 38,0 °C messbar – ab 38,5 °C spricht man von hohem Fieber.",
    "Nach einem Sturz immer auf Schmerzen, Hämatome und neurologische Zeichen achten.",
    "Bei Dehydratation zeigen sich oft trockene Lippen und stehende Hautfalten.",
    "Plötzlich einsetzender Brustschmerz kann ein Notfall sein – sofort handeln!",
    "Ein Krampfanfall unter 5 Minuten ist meist harmlos – trotzdem beobachten.",
    "Bei Blutung immer direkten Druck ausüben und Wunde möglichst steril abdecken."
  ];
  
  // Rotierender Tipp alle 10 Sekunden
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % pflegeTipps.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Zurücksetzen des Tipps, wenn der Screen erneut in den Fokus kommt
  useFocusEffect(
    React.useCallback(() => {
      setCurrentTipIndex(Math.floor(Math.random() * pflegeTipps.length));
      return () => {};
    }, [])
  );
  
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
      .filter((item: Disease) => 
        item.name.toLowerCase().includes(lowercaseQuery) || 
        item.code.toLowerCase().includes(lowercaseQuery) ||
        item.fachgebiet.toLowerCase().includes(lowercaseQuery)
      )
      .slice(0, 5) // Begrenze auf 5 Ergebnisse
      .map(item => ({ ...item, type: 'disease' }));
    
    // Standards durchsuchen
    const standardsResults = nursingStandardsData
      .filter(item => 
        item.title.toLowerCase().includes(lowercaseQuery) || 
        item.ziel.toLowerCase().includes(lowercaseQuery)
      )
      .map(item => ({ ...item, type: 'standard' }));
    
    // Lexikon-Einträge durchsuchen
    const lexikonResults = lexikonEntries
      .filter(item => 
        item.term.toLowerCase().includes(lowercaseQuery) || 
        item.definition.toLowerCase().includes(lowercaseQuery)
      )
      .map(item => ({ ...item, type: 'lexikon' }));

    // Laborparameter durchsuchen
    const laborResults = laborparameter
      .filter(item =>
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
      ...laborResults
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
    navigation.navigate('WissenTab', {
      screen: 'WissenLanding'
    });
  };
  
  // Funktion zum Navigieren zu den Tools
  const openTools = () => {
    Vibration.vibrate(30);
    navigation.navigate('ToolsTab', {
      screen: 'ToolsLanding'
    });
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
        navigation.navigate('WissenTab', { screen: 'WissenListen' });
        break;
      case 'standard':
        navigation.navigate('ToolsTab', { 
          screen: 'StandardDetail',
          params: { standardId: item.id }
        });
        break;
      case 'lexikon':
        navigation.navigate('WissenTab', {
          screen: 'LexikonDetail',
          params: { termId: item.id }
        });
        break;
      case 'wiki':
        navigation.navigate('MedizinSearch', { initialSearch: item.title });
        break;
      case 'labor':
        navigation.navigate('WissenTab', {
          screen: 'LaborparameterDetail',
          params: { labor: item }
        });
        break;
    }
  };
  
  // Render-Funktionen für Suchergebnisse
  const renderEmergencyResult = (item: any) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => handleSearchResultPress(item)}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, marginRight: 10 }}>{item.icon}</Text>
        <Text style={styles.itemTitle}>{item.title}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={theme === 'dark' ? '#aaaaaa' : '#666666'} />
    </TouchableOpacity>
  );
  
  const renderDiseaseResult = (item: any) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => handleSearchResultPress(item)}
    >
      <View>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemSubtitle}>{item.code} | {item.fachgebiet}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={theme === 'dark' ? '#aaaaaa' : '#666666'} />
    </TouchableOpacity>
  );
  
  const renderStandardResult = (item: any) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => handleSearchResultPress(item)}
    >
      <View>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemSubtitle} numberOfLines={1}>{item.ziel}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={theme === 'dark' ? '#aaaaaa' : '#666666'} />
    </TouchableOpacity>
  );
  
  const renderLexikonResult = (item: any) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => handleSearchResultPress(item)}
    >
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
      style={styles.searchResultItem}
      onPress={() => {
        setSearchModalVisible(false);
        navigation.navigate('LaborparameterDetail', { labor: item });
      }}
    >
      <Icon name="flask-outline" size={24} color={theme === 'dark' ? '#32b8ca' : '#32b8ca'} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemTitle, { fontSize: baseFontSize * fontSizeScale * 1.05 }]}>{item.name}</Text>
        <Text style={[styles.itemSubtitle, { color: theme === 'dark' ? '#aaa' : '#666' }]}>{item.kuerzel}</Text>
      </View>
    </TouchableOpacity>
  );
  
  const renderWikiResult = (item: WikipediaSearchResult) => (
    <TouchableOpacity 
      style={styles.listItem}
      onPress={() => handleSearchResultPress({...item, type: 'wiki'})}
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
            placeholder="Notfall, Krankheit oder Begriff suchen..."
            placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} style={{ padding: 8 }}>
              <Icon name="close-circle" size={24} color={theme === 'dark' ? '#aaaaaa' : '#666666'} />
            </TouchableOpacity>
          )}
        </View>
        
        {isSearching ? (
          <View style={styles.centeredContent}>
            <ActivityIndicator size="large" color={theme === 'dark' ? '#03dac6' : '#00acc1'} />
            <Text style={[styles.itemSubtitle, { marginTop: 16 }]}>Suche läuft...</Text>
          </View>
        ) : searchText.length < 2 ? (
          <View style={styles.centeredContent}>
            <Icon name="search" size={64} color={theme === 'dark' ? '#666666' : '#cccccc'} />
            <Text style={[styles.itemSubtitle, { marginTop: 16 }]}>
              Geben Sie mindestens 2 Zeichen ein, um die Suche zu starten
            </Text>
          </View>
        ) : searchResults.length === 0 && wikiResults.length === 0 ? (
          <View style={styles.centeredContent}>
            <Icon name="alert-circle-outline" size={64} color={theme === 'dark' ? '#666666' : '#cccccc'} />
            <Text style={[styles.itemSubtitle, { marginTop: 16 }]}>
              Keine Ergebnisse gefunden
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {/* Notfälle */}
            {searchResults.filter(item => item.type === 'emergency').length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Notfälle</Text>
                {searchResults
                  .filter(item => item.type === 'emergency')
                  .map((item, index) => (
                    <View key={item.id}>
                      {renderEmergencyResult(item)}
                    </View>
                  ))}
              </View>
            )}
            
            {/* Krankheiten */}
            {searchResults.filter(item => item.type === 'disease').length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Krankheiten</Text>
                {searchResults
                  .filter(item => item.type === 'disease')
                  .map((item, index) => (
                    <View key={item.code}>
                      {renderDiseaseResult(item)}
                    </View>
                  ))}
              </View>
            )}
            
            {/* Standards */}
            {searchResults.filter(item => item.type === 'standard').length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Pflegestandards</Text>
                {searchResults
                  .filter(item => item.type === 'standard')
                  .map((item, index) => (
                    <View key={item.id}>
                      {renderStandardResult(item)}
                    </View>
                  ))}
              </View>
            )}
            
            {/* Lexikon */}
            {searchResults.filter(item => item.type === 'lexikon').length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Lexikon</Text>
                {searchResults
                  .filter(item => item.type === 'lexikon')
                  .map((item, index) => (
                    <View key={item.id}>
                      {renderLexikonResult(item)}
                    </View>
                  ))}
              </View>
            )}
            
            {/* Laborparameter */}
            {searchResults.filter(item => item.type === 'labor').length > 0 && (
              <View style={{ marginTop: 18 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 6 }]}>Laborparameter</Text>
                {searchResults.filter(item => item.type === 'labor').map(item => (
                  <View key={item.id || item.kuerzel}>
                    {renderLaborResult(item)}
                  </View>
                ))}
              </View>
            )}
            
            {/* Wikipedia */}
            {wikiResults.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Medizinische Informationen</Text>
                {wikiResults.map((item, index) => (
                  <View key={item.pageid}>
                    {renderWikiResult(item)}
                  </View>
                ))}
                <TouchableOpacity 
                  style={[styles.button, { marginTop: 8 }]}
                  onPress={() => {
                    setSearchModalVisible(false);
                    navigation.navigate('MedizinSearch', { initialSearch: searchText });
                  }}
                >
                  <Text style={styles.buttonText}>Weitere medizinische Informationen</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
  
  // Animation für den Notfall-Button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);
  
  const [blogArticles, setBlogArticles] = useState<any[]>([]);
  const [currentBlogIndex, setCurrentBlogIndex] = useState(0);

  // Blogartikel laden
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch('https://pflegebuddy.vercel.app/blog/rss.xml');
        const text = await res.text();
        const parser = new XMLParser();
        const xml = parser.parse(text);
        const items = (xml.rss?.channel?.item || []).map((item: any) => ({
          title: item.title,
          link: item.link,
          description: item.description,
          pubDate: item.pubDate,
          image: item.enclosure?.['@_url'] || '',
        }));
        setBlogArticles(items);
        setCurrentBlogIndex(Math.floor(Math.random() * items.length));
      } catch (e) {
        // Fehler ignorieren
      }
    };
    fetchBlog();
  }, []);

  // Alle 5 Minuten zufälligen Artikel wählen
  useEffect(() => {
    if (blogArticles.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBlogIndex(Math.floor(Math.random() * blogArticles.length));
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [blogArticles]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#121212' : '#f5f5f5'}
      />
      
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Begrüßungstitel mit angepasstem oberen Abstand */}
        <View style={[styles.section, { marginTop: 24 }]}>
          <Text style={[styles.headerTitle, { textAlign: 'center', marginTop: 20 }]}>
            👋 Willkommen bei Pflegebuddy
          </Text>
          <Text style={[styles.headerSubtitle, { textAlign: 'center', marginTop: 4, marginBottom: 24 }]}>
            Dein smarter Begleiter für Notfälle & Pflegewissen.
          </Text>
        </View>
        
        {/* Notfall-Button */}
        <Animated.View style={{
          transform: [{ scale: pulseAnim }],
          shadowColor: '#e53935',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 12,
          marginBottom: 24,
        }}>
          <TouchableOpacity
            style={[styles.card, {
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff8f8',
              borderRadius: 20,
              padding: 24,
              borderLeftWidth: 7,
              borderLeftColor: theme === 'dark' ? '#e53935' : '#e53935',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 110,
              borderWidth: 1,
              borderColor: theme === 'dark' ? '#e53935' : '#ffcdd2',
            }]}
            onPress={openEmergencyChecklists}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { 
                fontSize: baseFontSize * fontSizeScale * 1.2,
                fontWeight: 'bold',
                color: theme === 'dark' ? '#ffffff' : '#333333',
              }]}>
                🛟 Notfall-Checklisten
              </Text>
            </View>
            <Icon 
              name="chevron-forward-circle" 
              size={36} 
              color={theme === 'dark' ? '#e53935' : '#e53935'} 
            />
          </TouchableOpacity>
        </Animated.View>
        
        {/* Drei Quick-Access-Kacheln */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          marginBottom: 24 
        }}>
          {/* Suche starten */}
          <TouchableOpacity
            style={[styles.card, {
              flex: 1,
              margin: 4,
              height: 100,
              padding: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
              borderRadius: 16,
            }]}
            onPress={openSearch}
          >
            <Icon name="search" size={28} color={theme === 'dark' ? '#03dac6' : '#00acc1'} />
            <Text style={[styles.itemTitle, {
              textAlign: 'center',
              marginTop: 8,
              fontSize: baseFontSize * fontSizeScale * 0.85,
              color: theme === 'dark' ? '#03dac6' : '#00acc1',
            }]}>
              Suche
            </Text>
          </TouchableOpacity>
          
          {/* Pflegewissen entdecken */}
          <TouchableOpacity
            style={[styles.card, {
              flex: 1,
              margin: 4,
              height: 100,
              padding: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
              borderRadius: 16,
            }]}
            onPress={openPflegewissen}
          >
            <Icon name="book" size={28} color={theme === 'dark' ? '#03dac6' : '#00acc1'} />
            <Text style={[styles.itemTitle, {
              textAlign: 'center',
              marginTop: 8,
              fontSize: baseFontSize * fontSizeScale * 0.85,
              color: theme === 'dark' ? '#03dac6' : '#00acc1',
            }]}>
              Wissen
            </Text>
          </TouchableOpacity>
          
          {/* Tools */}
          <TouchableOpacity
            style={[styles.card, {
              flex: 1,
              margin: 4,
              height: 100,
              padding: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
              borderRadius: 16,
            }]}
            onPress={openTools}
          >
            <Icon name="build" size={28} color={theme === 'dark' ? '#03dac6' : '#00acc1'} />
            <Text style={[styles.itemTitle, {
              textAlign: 'center',
              marginTop: 8,
              fontSize: baseFontSize * fontSizeScale * 0.85,
              color: theme === 'dark' ? '#03dac6' : '#00acc1',
            }]}>
              Tools
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Wusstest du schon? Info-Karte mit Swipe und animiertem Icon */}
        <View
          {...panResponder.panHandlers}
          style={[styles.card, {
            backgroundColor: theme === 'dark' ? '#252525' : '#f5f9ff',
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            borderLeftWidth: 5,
            borderLeftColor: theme === 'dark' ? '#03dac6' : '#00acc1',
          }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'center' }}>
            <Animated.Text
              style={{
                fontSize: baseFontSize * fontSizeScale * 1.1,
                marginRight: 8,
                opacity: lightbulbAnim,
              }}
            >
              💡
            </Animated.Text>
            <Text style={[styles.itemTitle, {
              fontSize: baseFontSize * fontSizeScale * 1.1,
              fontWeight: 'bold',
              color: theme === 'dark' ? '#ffffff' : '#333333',
            }]}>Wusstest du schon?</Text>
          </View>
          <Text style={[styles.itemSubtitle, {
            fontSize: baseFontSize * fontSizeScale,
            color: theme === 'dark' ? '#e1e1e1' : '#333333',
            lineHeight: baseFontSize * fontSizeScale * 1.4,
            textAlign: 'center',
          }]}> 
            {pflegeTipps[currentTipIndex]}
          </Text>
        </View>
        
        {blogArticles.length > 0 && (
          <TouchableOpacity
            style={[styles.card, {
              backgroundColor: theme === 'dark' ? '#252525' : '#f5f9ff',
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              borderLeftWidth: 5,
              borderLeftColor: theme === 'dark' ? '#03dac6' : '#00acc1',
            }]}
            onPress={() => {
              let url = blogArticles[currentBlogIndex].link;
              if (url && !url.startsWith('http')) {
                url = 'https://pflegebuddy.vercel.app' + (url.startsWith('/') ? '' : '/') + url;
              } else if (url && url.match(/pflegebuddy\.de/)) {
                url = url.replace(/https?:\/\/(www\.)?pflegebuddy\.de/, 'https://pflegebuddy.vercel.app');
              }
              Linking.openURL(url);
            }}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'center' }}>
              <Text
                style={{
                  fontSize: baseFontSize * fontSizeScale * 1.1,
                  marginRight: 8,
                }}
              >
                📰
              </Text>
              <Text style={[styles.itemTitle, {
                fontSize: baseFontSize * fontSizeScale * 1.1,
                fontWeight: 'bold',
                color: theme === 'dark' ? '#ffffff' : '#333333',
              }]}>Blog-Artikel</Text>
            </View>
            <Text style={{ color: theme === 'dark' ? '#7ad1e6' : '#32b8ca', fontWeight: 'bold', fontSize: 18, marginBottom: 6, textAlign: 'center' }}>
              {blogArticles[currentBlogIndex].title}
            </Text>
            {blogArticles[currentBlogIndex].image ? (
              <Image source={{ uri: blogArticles[currentBlogIndex].image }} style={{ width: '100%', height: 140, borderRadius: 12, marginBottom: 8 }} resizeMode="cover" />
            ) : null}
            <Text style={{ color: theme === 'dark' ? '#e1e1e1' : '#333333', fontSize: 15, textAlign: 'center' }} numberOfLines={3}>
              {blogArticles[currentBlogIndex].description.replace(/<[^>]+>/g, '')}
            </Text>
            <Text style={{ color: theme === 'dark' ? '#aaa' : '#666', fontSize: 12, marginTop: 6, textAlign: 'center' }}>
              Zum Blogartikel →
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {/* Such-Modal */}
      {renderSearchModal()}
    </View>
  );
};

export default HomeScreen; 