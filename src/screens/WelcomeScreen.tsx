import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, StatusBar, ScrollView, Vibration } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % pflegeTipps.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    Vibration.vibrate(30);
    navigation.replace('Home');
  };

  const handleSearch = () => {
    Vibration.vibrate(20);
    navigation.navigate('HomeTab', { screen: 'Home', params: { initialSearch: searchText } });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>  
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{fontSize: 32, color: 'red', marginBottom: 16}}>TEST123</Text>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Willkommen bei Pflegebuddy</Text>
        <Text style={styles.subtitle}>Dein smarter Begleiter für Notfälle & Pflegewissen.</Text>
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Notfall!</Text>
          <Icon name="chevron-forward" size={28} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
        <View style={styles.introBox}>
          <Text style={styles.introTitle}>Was ist Pflegebuddy?</Text>
          <Text style={styles.introText}>
            Pflegebuddy unterstützt dich im Pflegealltag: Notfall-Checklisten, Pflegewissen, Tools und mehr – alles in einer App. Starte jetzt und entdecke, wie einfach Pflege sein kann!
          </Text>
        </View>
        <View style={styles.searchBox}>
          <Icon name="search" size={22} color="#32b8ca" style={{ marginRight: 8 }} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Suche in der gesamten App..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>Pflege-Tipp</Text>
          <Text style={styles.tipText}>{pflegeTipps[currentTipIndex]}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  logo: { width: 120, height: 120, marginBottom: 16, marginTop: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#32b8ca', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#333', marginBottom: 24, textAlign: 'center' },
  startButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#32b8ca', borderRadius: 32, paddingVertical: 16, paddingHorizontal: 32, marginBottom: 24, marginTop: 8 },
  startButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  introBox: { backgroundColor: '#e0f7fa', borderRadius: 16, padding: 16, marginBottom: 24, width: '100%' },
  introTitle: { fontSize: 18, fontWeight: 'bold', color: '#00796b', marginBottom: 4 },
  introText: { fontSize: 15, color: '#333' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 24, width: '100%', borderWidth: 1, borderColor: '#32b8ca' },
  searchInput: { flex: 1, fontSize: 16, color: '#333', paddingVertical: 4 },
  tipBox: { backgroundColor: '#fffde7', borderRadius: 16, padding: 16, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#ffe082' },
  tipTitle: { fontSize: 16, fontWeight: 'bold', color: '#fbc02d', marginBottom: 4 },
  tipText: { fontSize: 15, color: '#333', textAlign: 'center' },
});

export default WelcomeScreen; 