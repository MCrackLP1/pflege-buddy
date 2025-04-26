/**
 * WissenListenScreen.tsx
 * Zeigt eine Liste von Krankheiten basierend auf der ICD-API Suche an
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  ToastAndroid,
  Platform,
  Alert,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

// Import types
import { RootStackParamList, Disease } from '../types/types';

// Import hooks
import { useSettings } from '../context/SettingsContext';

// Import styles
import { getDynamicStyles } from '../utils/styleUtils';

// Import the ICD API service
import { searchICD10 } from '../services/ICDApiService';

type WissenScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WissenListenScreen: React.FC = () => {
  const navigation = useNavigation<WissenScreenNavigationProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Disease[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [initialView, setInitialView] = useState(true);

  // Zeige Benachrichtigung
  const showNotification = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Information', message);
    }
  };

  // Führe die Suche durch
  const performSearch = async (query: string) => {
    if (query.trim().length < 3) {
      setInitialView(true);
      setSearchResults([]);
      return;
    }

    setInitialView(false);
    setSearching(true);
    setError(null);
    
    try {
      const results = await searchICD10(query);
      setSearchResults(results);
      if (results.length === 0) {
        showNotification("Keine passenden Diagnosen gefunden.");
      } else if (results.length > 0) {
        showNotification(`${results.length} Diagnosen gefunden.`);
      }
    } catch (e) {
      console.error("Fehler bei der API-Suche:", e);
      setError("Fehler bei der Suche. Bitte überprüfen Sie Ihre Internetverbindung.");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Debounce-Funktion für die Suche
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchTerm.trim().length >= 3) {
        performSearch(searchTerm);
      } else if (searchTerm.trim() === '') {
        setInitialView(true);
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  const renderDiseaseItem = ({ item }: { item: Disease }) => (
    <View 
      style={[
        styles.card, 
        { borderLeftWidth: 3, borderLeftColor: theme === 'dark' ? '#32b8ca' : '#32b8ca' }
      ]}
    >
      <Text style={[styles.itemTitle, { marginBottom: 4 }]}>{item.code}</Text>
      <Text style={styles.itemSubtitle}>{item.name}</Text>
      <Text style={[styles.itemSubtitle, { fontStyle: 'italic', marginTop: 4 }]}>
        {item.fachgebiet}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={{ 
        paddingTop: Math.max(insets.top + 10, 20), 
        paddingBottom: 15,
        paddingHorizontal: 16
      }}>
        <TextInput
          style={styles.searchInput}
          placeholder="Suche nach Diagnose oder ICD-10 Code..."
          placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity 
            style={{ position: 'absolute', right: 28, top: Math.max(insets.top + 22, 32) }}
            onPress={() => setSearchTerm('')}
          >
            <Icon name="close-circle" size={20} color={theme === 'dark' ? '#999' : '#666'} />
          </TouchableOpacity>
        )}
      </View>

      {searching && (
        <View style={{ paddingVertical: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
          <ActivityIndicator size="small" color={theme === 'dark' ? '#32b8ca' : '#32b8ca'} />
          <Text style={[styles.itemSubtitle, { marginLeft: 8 }]}>Suche ICD-10 Einträge...</Text>
        </View>
      )}

      {initialView ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Icon name="medkit-outline" size={50} color={theme === 'dark' ? '#32b8ca' : '#32b8ca'} style={{ marginBottom: 16, opacity: 0.8 }} />
          <Text style={[styles.itemTitle, { textAlign: 'center', marginBottom: 6, fontSize: baseFontSize * fontSizeScale * 1.1 }]}>
            ICD-10-GM Diagnosesuche
          </Text>
          <Text style={[styles.itemSubtitle, { textAlign: 'center', maxWidth: 280 }]}>
            Geben Sie mindestens 3 Zeichen ein, um nach Diagnosen oder ICD-10 Codes zu suchen.
          </Text>
          <Text style={[styles.itemSubtitle, { textAlign: 'center', maxWidth: 280, marginTop: 12, color: theme === 'dark' ? '#aaa' : '#777', fontSize: 12 }]}>
            Die Suche nutzt die offizielle ICD-10-GM Klassifikation (über 12.000 Diagnosen).
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centeredContent}>
          <Icon name="alert-circle-outline" size={50} color={theme === 'dark' ? '#ff6b6b' : '#ff4757'} style={{ marginBottom: 10 }} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderDiseaseItem}
          keyExtractor={(item, index) => item.code + "_" + index}
          contentContainerStyle={{ padding: 16 }}
          ListHeaderComponent={
            !searching && searchResults.length > 0 ? (
            <View style={{ marginBottom: 10 }}>
              <Text style={{ 
                textAlign: 'center', 
                color: theme === 'dark' ? '#32b8ca' : '#32b8ca', 
                fontSize: 13,
                opacity: 0.9
              }}>
                {searchResults.length} Ergebnisse gefunden
              </Text>
              <Text style={{ 
                textAlign: 'center', 
                color: theme === 'dark' ? '#aaa' : '#777', 
                fontSize: 11, 
                marginTop: 2 
              }}>
                Offizielle ICD-10-GM Klassifikation
              </Text>
            </View>
          ) : null}
          ListEmptyComponent={
            !searching && searchTerm.length >= 3 ? (
            <View style={styles.centeredContent}>
              <Icon name="search-outline" size={50} color={theme === 'dark' ? '#aaa' : '#999'} style={{ marginBottom: 10 }} />
              <Text style={[styles.itemSubtitle, { textAlign: 'center' }]}>
                Keine passenden Diagnosen gefunden.{'\n'}
                Versuchen Sie andere Suchbegriffe.
              </Text>
            </View>
          ) : null}
        />
      )}
    </View>
  );
};

export default WissenListenScreen; 