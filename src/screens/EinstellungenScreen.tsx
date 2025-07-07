/**
 * EinstellungenScreen.tsx
 * Einstellungen der App: Theme, Schriftgröße, etc.
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Switch, TouchableOpacity, Button, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import i18n from '../utils/i18n';

// Import Typen
import { RootStackParamList } from '../types/types';

// Import Hooks
import { useSettings } from '../context/SettingsContext';
import { useDisclaimer } from '../context/DisclaimerContext';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';
import DisclaimerModal from '../components/DisclaimerModal';

// Import Google Auth
import GoogleLoginButton from '../components/GoogleLoginButton';
import GoogleAuthService, { GoogleUser } from '../services/GoogleAuthService';
import ContactsSyncService from '../services/ContactsSyncService';

type EinstellungenScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EinstellungenScreen: React.FC = () => {
  const navigation = useNavigation<EinstellungenScreenNavigationProp>();
  const { theme, setTheme, fontSizeScale, increaseFontSize, decreaseFontSize, baseFontSize } =
    useSettings();
  const { syncWithGoogle, isSyncing, lastSyncAt } = useDisclaimer();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { t } = useTranslation();

  const isDarkMode = theme === 'dark';

  // Prüfe beim App-Start, ob bereits ein Benutzer angemeldet ist
  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      const user = await GoogleAuthService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        
        // Initialisiere Sync-Service wenn bereits angemeldet
        try {
          const syncService = ContactsSyncService.getInstance();
          await syncService.initialize(user);
          console.log('ContactsSyncService erfolgreich initialisiert (beim App-Start)');
        } catch (error) {
          console.error('Fehler beim Initialisieren des ContactsSyncService beim App-Start:', error);
        }

        // Synchronisiere Haftungsausschluss-Status
        try {
          await syncWithGoogle(user);
          console.log('Disclaimer-Synchronisation erfolgreich (beim App-Start)');
        } catch (error) {
          console.error('Fehler bei Disclaimer-Synchronisation beim App-Start:', error);
        }
      }
    } catch (error) {
      console.log('Kein angemeldeter Benutzer gefunden');
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleGoogleSignInSuccess = async (user: GoogleUser) => {
    setCurrentUser(user);
    
    // Initialisiere Sync-Service für Kontakte
    try {
      const syncService = ContactsSyncService.getInstance();
      await syncService.initialize(user);
      console.log('ContactsSyncService erfolgreich initialisiert');
    } catch (error) {
      console.error('Fehler beim Initialisieren des ContactsSyncService:', error);
    }

    // Synchronisiere Haftungsausschluss-Status mit Google-Konto
    try {
      await syncWithGoogle(user);
      console.log('Disclaimer-Synchronisation erfolgreich');
    } catch (error) {
      console.error('Fehler bei Disclaimer-Synchronisation:', error);
    }
    
    Alert.alert(
      'Erfolgreich angemeldet!', 
      `Willkommen, ${user.name}!\n\nIhre Daten (Kontakte, Haftungsausschluss) werden jetzt automatisch mit Ihrem Google-Konto synchronisiert.`,
      [{ text: 'OK' }]
    );
  };

  const handleGoogleSignOut = async () => {
    try {
      // Bereinige Sync-Service
      const syncService = ContactsSyncService.getInstance();
      await syncService.logout();
      
      await GoogleAuthService.signOut();
      setCurrentUser(null);
      Alert.alert('Abgemeldet', 'Sie wurden erfolgreich abgemeldet.\n\nIhre lokalen Daten bleiben erhalten.');
    } catch (error: any) {
      Alert.alert('Fehler', 'Fehler beim Abmelden: ' + error.message);
    }
  };

  const handleGoogleSignInError = (error: string) => {
    Alert.alert('Anmeldefehler', error);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView>
        {/* Dark Mode / Theme */}
        <View style={styles.card}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.itemTitle}>{t('dark_mode')}</Text>
              <Text style={styles.itemSubtitle}>{t('dark_mode_desc')}</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={value => setTheme(value ? 'dark' : 'light')}
              trackColor={{ false: '#767577', true: theme === 'dark' ? '#32b8ca' : '#32b8ca' }}
              thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Google Account */}
        <View style={styles.card}>
          <Text style={styles.itemTitle}>Google Account</Text>
          
          {checkingAuth ? (
            <Text style={styles.itemSubtitle}>Lade Account-Status...</Text>
          ) : currentUser ? (
            <View>
              <Text style={styles.itemSubtitle}>Angemeldet als: {currentUser.name}</Text>
              <Text style={[styles.itemSubtitle, { fontSize: 12, marginTop: 4 }]}>
                {currentUser.email}
              </Text>
              
              {/* Sync-Status Anzeige */}
              <View style={{
                backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                padding: 8,
                borderRadius: 6,
                marginTop: 8,
              }}>
                <Text style={[styles.itemSubtitle, { fontSize: 11, fontWeight: 'bold' }]}>
                  📄 Haftungsausschluss-Synchronisation
                </Text>
                {isSyncing ? (
                  <Text style={[styles.itemSubtitle, { fontSize: 10, marginTop: 2, color: theme === 'dark' ? '#32b8ca' : '#2563eb' }]}>
                    🔄 Wird synchronisiert...
                  </Text>
                ) : lastSyncAt ? (
                  <Text style={[styles.itemSubtitle, { fontSize: 10, marginTop: 2, color: theme === 'dark' ? '#4ade80' : '#16a34a' }]}>
                    ✅ Zuletzt synchronisiert: {new Date(lastSyncAt).toLocaleString('de-DE')}
                  </Text>
                ) : (
                  <Text style={[styles.itemSubtitle, { fontSize: 10, marginTop: 2, color: theme === 'dark' ? '#9ca3af' : '#6b7280' }]}>
                    ⏳ Noch nicht synchronisiert
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: theme === 'dark' ? '#444' : '#f5f5f5',
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 12,
                }}
                onPress={handleGoogleSignOut}
              >
                <Text style={[styles.itemSubtitle, { textAlign: 'center' }]}>
                  Abmelden
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.itemSubtitle}>
                Melden Sie sich mit Ihrem Google-Konto an
              </Text>
              <View style={{ marginTop: 12 }}>
                <GoogleLoginButton
                  onSuccess={handleGoogleSignInSuccess}
                  onError={handleGoogleSignInError}
                />
              </View>
            </View>
          )}
        </View>

        {/* Schriftgröße */}
        <View style={styles.card}>
          <Text style={styles.itemTitle}>{t('font_size')}</Text>
          <Text style={styles.itemSubtitle}>{t('font_size_desc')}</Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 12,
              justifyContent: 'space-between',
            }}
          >
            <Button
              title=" - "
              onPress={decreaseFontSize}
              disabled={fontSizeScale <= 0.8}
              color={theme === 'dark' ? '#32b8ca' : '#32b8ca'}
            />
            <Text style={[styles.itemTitle, { textAlign: 'center', minWidth: 80 }]}>
              {Math.round(fontSizeScale * 100)}%
            </Text>
            <Button
              title=" + "
              onPress={increaseFontSize}
              disabled={fontSizeScale >= 1.4}
              color={theme === 'dark' ? '#32b8ca' : '#32b8ca'}
            />
          </View>
        </View>

        {/* Rechtliches */}
        <View style={styles.card}>
          <Text style={styles.itemTitle}>{t('legal')}</Text>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12,
            }}
            onPress={() => navigation.navigate('Impressum')}
          >
            <Text style={styles.itemSubtitle}>{t('imprint')}</Text>
            <Text>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12,
            }}
            onPress={() => navigation.navigate('Datenschutz')}
          >
            <Text style={styles.itemSubtitle}>{t('privacy')}</Text>
            <Text>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12,
            }}
            onPress={() => setShowDisclaimerModal(true)}
          >
            <Text style={styles.itemSubtitle}>{t('disclaimer')}</Text>
            <Text>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 12,
            }}
            onPress={() => navigation.navigate('Sources')}
          >
            <Text style={styles.itemSubtitle}>{t('sources')}</Text>
            <Text>›</Text>
          </TouchableOpacity>
        </View>

        {/* App-Info */}
        <View style={styles.card}>
          <Text style={styles.itemTitle}>{t('app_info')}</Text>
          <Text style={styles.itemSubtitle}>{t('version')}: 1.0.0</Text>
          <Text style={styles.itemSubtitle}>{t('copyright')}</Text>
        </View>

        {/* Sprachauswahl */}
        <View style={styles.card}>
          <Text style={styles.itemTitle}>{t('language')}</Text>
          <Text style={[styles.itemSubtitle, { marginBottom: 12, fontStyle: 'italic' }]}>
            {t('language_coming_soon')}
          </Text>
          
          {/* Deutsch - vollständig verfügbar */}
          <TouchableOpacity onPress={() => i18n.changeLanguage('de')} style={{ marginVertical: 4 }}>
            <Text style={styles.itemSubtitle}>{t('german')}</Text>
          </TouchableOpacity>
          
          {/* Andere Sprachen - Coming Soon */}
          <View style={{ marginVertical: 4, opacity: 0.6 }}>
            <Text style={[styles.itemSubtitle, { color: theme === 'dark' ? '#888' : '#666' }]}>
              {t('english')} - {t('coming_soon')}
            </Text>
          </View>
          <View style={{ marginVertical: 4, opacity: 0.6 }}>
            <Text style={[styles.itemSubtitle, { color: theme === 'dark' ? '#888' : '#666' }]}>
              {t('spanish')} - {t('coming_soon')}
            </Text>
          </View>
          <View style={{ marginVertical: 4, opacity: 0.6 }}>
            <Text style={[styles.itemSubtitle, { color: theme === 'dark' ? '#888' : '#666' }]}>
              {t('french')} - {t('coming_soon')}
            </Text>
          </View>
          <View style={{ marginVertical: 4, opacity: 0.6 }}>
            <Text style={[styles.itemSubtitle, { color: theme === 'dark' ? '#888' : '#666' }]}>
              {t('italian')} - {t('coming_soon')}
            </Text>
          </View>
          <View style={{ marginVertical: 4, opacity: 0.6 }}>
            <Text style={[styles.itemSubtitle, { color: theme === 'dark' ? '#888' : '#666' }]}>
              {t('turkish')} - {t('coming_soon')}
            </Text>
          </View>
          <View style={{ marginVertical: 4, opacity: 0.6 }}>
            <Text style={[styles.itemSubtitle, { color: theme === 'dark' ? '#888' : '#666' }]}>
              {t('russian')} - {t('coming_soon')}
            </Text>
          </View>
          <View style={{ marginVertical: 4, opacity: 0.6 }}>
            <Text style={[styles.itemSubtitle, { color: theme === 'dark' ? '#888' : '#666' }]}>
              {t('arabic')} - {t('coming_soon')}
            </Text>
          </View>
          <View style={{ marginVertical: 4, opacity: 0.6 }}>
            <Text style={[styles.itemSubtitle, { color: theme === 'dark' ? '#888' : '#666' }]}>
              {t('polish')} - {t('coming_soon')}
            </Text>
          </View>
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
