/**
 * FrequencyCounterScreen.tsx
 * Zählt Frequenzen wie Herzschlag, Atemfrequenz und Puls
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Vibration,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

// Import Typen
import { RootStackParamList } from '../types/types';

// Import Hooks
import { useSettings } from '../context/SettingsContext';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';

type FrequencyCounterNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type FrequencyType = 'heart' | 'breath' | 'pulse' | 'other';

interface FrequencyOption {
  id: FrequencyType;
  label: string;
  icon: string;
  normalRange: string;
}

const FrequencyCounterScreen: React.FC = () => {
  const navigation = useNavigation<FrequencyCounterNavigationProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  // Optionen für verschiedene Frequenztypen
  const frequencyOptions: FrequencyOption[] = [
    {
      id: 'heart',
      label: t('heart_frequency'),
      icon: 'heart-outline',
      normalRange: t('heart_frequency_range'),
    },
    {
      id: 'breath',
      label: t('breath_frequency'),
      icon: 'fitness-outline',
      normalRange: t('breath_frequency_range'),
    },
    {
      id: 'other',
      label: t('other_frequency'),
      icon: 'stopwatch-outline',
      normalRange: t('other_frequency_range'),
    },
  ];

  // States für den Frequenzzähler
  const [selectedType, setSelectedType] = useState<FrequencyType>('heart');
  const [counting, setCounting] = useState(false);
  const [count, setCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [recentBeats, setRecentBeats] = useState<number[]>([]);
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Frequenzinformationen des gewählten Typs
  const currentFrequencyInfo =
    frequencyOptions.find(opt => opt.id === selectedType) || frequencyOptions[0];

  // Funktion zum Zurücksetzen des Zählers
  const resetCounter = () => {
    setCounting(false);
    setCount(0);
    setStartTime(null);
    setRecentBeats([]);
    setFrequency(null);
  };

  // Haupt-Button-Handler: Starten der Zählung oder Zählen
  const handleMainButtonPress = () => {
    const now = Date.now();

    // Erstes Drücken: Starte den Zähler
    if (!counting) {
      setCounting(true);
      setStartTime(now);
      setCount(0);
      setRecentBeats([]);
      setFrequency(null);
      return; // Ersten Schlag nicht mitzählen
    }

    // Vibration als Feedback
    Vibration.vibrate(20);

    // Animation des Buttons
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Zähle einen Schlag
    setCount(prevCount => prevCount + 1);

    if (startTime) {
      // Speichere den Zeitstempel für eine genauere Berechnung
      setRecentBeats(prev => [...prev, now]);

      // Berechne vorläufige Frequenz in Echtzeit
      const secondsElapsed = (now - startTime) / 1000;
      if (secondsElapsed > 0) {
        // Berechnen der Frequenz pro Minute
        const currentFreq = Math.round((count + 1) * (60 / secondsElapsed));
        setFrequency(currentFreq);
      }
    }
  };

  // Lange Druck auf den Hauptbutton stoppt den Zähler und berechnet die Frequenz
  const handleLongPress = () => {
    if (counting) {
      calculateFinalFrequency();
    }
  };

  // Finale Berechnung der Frequenz beim Stoppen
  const calculateFinalFrequency = () => {
    if (startTime && count > 0) {
      // Durchschnittliche Zeit zwischen den Schlägen berechnen, wenn mehr als 1 Schlag vorhanden
      if (recentBeats.length > 1) {
        const intervals: number[] = [];

        // Berechne alle Intervalle zwischen aufeinanderfolgenden Schlägen
        for (let i = 1; i < recentBeats.length; i++) {
          intervals.push(recentBeats[i] - recentBeats[i - 1]);
        }

        // Berechne den Durchschnitt der Intervalle in Millisekunden
        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;

        // Umrechnen in Frequenz pro Minute (60000 ms = 1 Minute)
        const calculatedFreq = Math.round(60000 / avgInterval);
        setFrequency(calculatedFreq);
      } else {
        // Fallback wenn nur ein Schlag registriert wurde
        const secondsElapsed = (Date.now() - startTime) / 1000;
        if (secondsElapsed > 0) {
          setFrequency(Math.round(count * (60 / secondsElapsed)));
        }
      }
      setCounting(false);
    }
  };

  // Custom Style für den großen Zählbutton
  const mainButtonStyle = {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: counting
      ? theme === 'dark'
        ? 'rgba(244, 67, 54, 0.2)'
        : 'rgba(244, 67, 54, 0.1)'
      : theme === 'dark'
        ? '#32b8ca20'
        : '#32b8ca10',
    justifyContent: 'center' as 'center',
    alignItems: 'center' as 'center',
    borderWidth: 2,
    borderColor: counting ? '#f44336' : '#32b8ca',
    alignSelf: 'center' as 'center',
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Haupt-Zählbutton direkt unterhalb des Headers */}
      <Animated.View
        style={{
          transform: [{ scale: buttonScale }],
          alignItems: 'center',
          marginVertical: 20,
        }}
      >
        <TouchableOpacity
          style={mainButtonStyle}
          onPress={handleMainButtonPress}
          onLongPress={handleLongPress}
          delayLongPress={500}
        >
          <Icon
            name={counting ? 'finger-print-outline' : 'play-outline'}
            size={60}
            color={counting ? '#f44336' : '#32b8ca'}
          />
          <Text
            style={[
              styles.headerTitle,
              {
                marginTop: 8,
                fontSize: baseFontSize * fontSizeScale * 1.5,
                color: counting ? '#f44336' : '#32b8ca',
                textAlign: 'center',
              },
            ]}
          >
            {counting ? count : t('start')}
          </Text>
          <Text
            style={[
              styles.itemSubtitle,
              {
                marginTop: 4,
                textAlign: 'center',
                color: counting ? '#f44336' : '#32b8ca',
                maxWidth: 160,
                fontSize: baseFontSize * fontSizeScale * 0.85,
                alignSelf: 'center',
              },
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {counting ? t('tap_to_count_hold_to_stop') : t('tap_to_start')}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 30,
          alignItems: 'center',
        }}
      >
        {/* Frequenztyp-Auswahl */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 16,
            paddingHorizontal: 8,
            width: '100%',
          }}
        >
          {frequencyOptions.map(option => {
            const isActive = selectedType === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.chip,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    marginHorizontal: 6,
                    marginBottom: 10,
                    backgroundColor: isActive
                      ? theme === 'dark'
                        ? '#32b8ca'
                        : '#0066cc'
                      : styles.chip.backgroundColor,
                    shadowColor: isActive ? '#32b8ca' : 'transparent',
                    shadowOpacity: isActive ? 0.18 : 0,
                    shadowRadius: isActive ? 6 : 0,
                    elevation: isActive ? 4 : 0,
                  },
                ]}
                onPress={() => {
                  if (!counting) {
                    setSelectedType(option.id);
                    setCount(0);
                    setFrequency(null);
                    setRecentBeats([]);
                  }
                }}
                activeOpacity={0.85}
              >
                <Icon
                  name={option.icon}
                  size={26}
                  color={isActive ? '#fff' : theme === 'dark' ? '#32b8ca' : '#0066cc'}
                  style={{ marginRight: 10 }}
                />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isActive ? '#fff' : theme === 'dark' ? '#e1e1e1' : '#333',
                      fontWeight: isActive ? 'bold' : '500',
                      fontSize: baseFontSize * fontSizeScale * 1.0,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Ergebnisanzeige */}
        <View
          style={[
            styles.card,
            {
              marginBottom: 16,
              width: 300,
              alignItems: 'center',
              alignSelf: 'center',
            },
          ]}
        >
          <Text style={[styles.headerTitle, { fontSize: baseFontSize * fontSizeScale * 2 }]}>
            {frequency !== null ? `${frequency}` : '--'}
          </Text>
          <Text style={[styles.headerSubtitle, { marginTop: 8 }]}>
            {frequencyOptions.find(opt => opt.id === selectedType)?.label || ''} {t('per_minute')}
          </Text>
          <Text style={[styles.itemSubtitle, { marginTop: 8 }]}>
            {t('normal_range')}: {currentFrequencyInfo.normalRange}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default FrequencyCounterScreen;
