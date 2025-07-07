import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  ScrollView,
  Vibration,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  const { t } = useTranslation();

  const pflegeTipps = t('care_tips', { returnObjects: true }) as string[];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex(prevIndex => (prevIndex + 1) % pflegeTipps.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [pflegeTipps.length]);

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
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >

        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>{t('welcome_title')}</Text>
        <Text style={styles.subtitle}>{t('welcome_subtitle')}</Text>
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>{t('emergency')}</Text>
          <Icon name="chevron-forward" size={28} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
        <View style={styles.introBox}>
          <Text style={styles.introTitle}>{t('what_is_pflegebuddy')}</Text>
          <Text style={styles.introText}>
            {t('pflegebuddy_description')}
          </Text>
        </View>
        <View style={styles.searchBox}>
          <Icon name="search" size={22} color="#32b8ca" style={{ marginRight: 8 }} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder={t('search_entire_app')}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>{t('care_tip')}</Text>
          <Text style={styles.tipText}>{pflegeTipps[currentTipIndex]}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  logo: { width: 120, height: 120, marginBottom: 16, marginTop: 16 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#32b8ca',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: { fontSize: 16, color: '#333', marginBottom: 24, textAlign: 'center' },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#32b8ca',
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 24,
    marginTop: 8,
  },
  startButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  introBox: {
    backgroundColor: '#e0f7fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  introTitle: { fontSize: 18, fontWeight: 'bold', color: '#00796b', marginBottom: 4 },
  introText: { fontSize: 15, color: '#333' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: '#32b8ca',
  },
  searchInput: { flex: 1, fontSize: 16, color: '#333', paddingVertical: 4 },
  tipBox: {
    backgroundColor: '#fffde7',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe082',
  },
  tipTitle: { fontSize: 16, fontWeight: 'bold', color: '#fbc02d', marginBottom: 4 },
  tipText: { fontSize: 15, color: '#333', textAlign: 'center' },
});

export default WelcomeScreen;
