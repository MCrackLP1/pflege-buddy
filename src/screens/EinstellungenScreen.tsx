/**
 * EinstellungenScreen.tsx
 * Einstellungen der App: Theme, Schriftgröße, etc.
 */

import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch, TouchableOpacity, Button } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import Typen
import { RootStackParamList } from '../types/types';

// Import Hooks
import { useSettings } from '../context/SettingsContext';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';
import DisclaimerModal from '../components/DisclaimerModal';

type EinstellungenScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EinstellungenScreen: React.FC = () => {
  const navigation = useNavigation<EinstellungenScreenNavigationProp>();
  const { theme, setTheme, fontSizeScale, increaseFontSize, decreaseFontSize, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  
  const isDarkMode = theme === 'dark';

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView>
        {/* Dark Mode / Theme */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.itemTitle}>Dark Mode</Text>
              <Text style={styles.itemSubtitle}>Dunkles Design für bessere Lesbarkeit</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
              trackColor={{ false: "#767577", true: theme === 'dark' ? "#32b8ca" : "#32b8ca" }}
              thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Schriftgröße */}
        <View style={styles.card}>
          <Text style={styles.itemTitle}>Schriftgröße</Text>
          <Text style={styles.itemSubtitle}>Passe die Textgröße an deine Bedürfnisse an</Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'space-between' }}>
            <Button 
              title=" - " 
              onPress={decreaseFontSize} 
              disabled={fontSizeScale <= 0.8}
              color={theme === 'dark' ? "#32b8ca" : "#32b8ca"}
            />
            <Text style={[styles.itemTitle, { textAlign: 'center', minWidth: 80 }]}>
              {Math.round(fontSizeScale * 100)}%
            </Text>
            <Button 
              title=" + " 
              onPress={increaseFontSize} 
              disabled={fontSizeScale >= 1.4}
              color={theme === 'dark' ? "#32b8ca" : "#32b8ca"}
            />
          </View>
        </View>

        {/* Rechtliches */}
        <View style={styles.card}>
          <Text style={styles.itemTitle}>Rechtliches</Text>
          
          <TouchableOpacity 
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}
            onPress={() => navigation.navigate('Impressum')}
          >
            <Text style={styles.itemSubtitle}>Impressum</Text>
            <Text>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}
            onPress={() => navigation.navigate('Datenschutz')}
          >
            <Text style={styles.itemSubtitle}>Datenschutzerklärung</Text>
            <Text>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}
            onPress={() => setShowDisclaimerModal(true)}
          >
            <Text style={styles.itemSubtitle}>Haftungsausschluss</Text>
            <Text>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 }}
            onPress={() => navigation.navigate('Sources')}
          >
            <Text style={styles.itemSubtitle}>Quellen & Literatur</Text>
            <Text>›</Text>
          </TouchableOpacity>
        </View>

        {/* App-Info */}
        <View style={styles.card}>
          <Text style={styles.itemTitle}>App-Informationen</Text>
          <Text style={styles.itemSubtitle}>Version: 1.0.5</Text>
          <Text style={styles.itemSubtitle}>© 2025 Pflegebuddy</Text>
        </View>
      </ScrollView>

      {/* Modal für Haftungsausschluss */}
      {showDisclaimerModal && (
        <DisclaimerModal
          // Modal soll unabhängig vom Context geschlossen werden können
          forceVisible={true}
          onRequestClose={() => setShowDisclaimerModal(false)}
        />
      )}
    </View>
  );
};

export default EinstellungenScreen;