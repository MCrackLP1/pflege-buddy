/**
 * DisclaimerModal.tsx
 * Haftungsausschluss-Modal, das beim ersten Start der App angezeigt wird
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useDisclaimer } from '../context/DisclaimerContext';
import { useTranslation } from 'react-i18next';

interface DisclaimerModalProps {
  forceVisible?: boolean;
  onRequestClose?: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  forceVisible = false,
  onRequestClose,
}) => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const { t } = useTranslation();
  let disclaimerAccepted = false;
  let setDisclaimerAccepted: (accepted: boolean) => void = () => {};
  let acceptedAt: string | null = null;
  try {
    // Context nur verwenden, wenn forceVisible nicht aktiv ist
    if (!forceVisible) {
      const context = useDisclaimer();
      disclaimerAccepted = context.disclaimerAccepted;
      setDisclaimerAccepted = context.setDisclaimerAccepted;
      acceptedAt = context.acceptedAt || null;
    }
  } catch (e) {
    // Context nicht verfügbar, z.B. in Einstellungen
  }

  // Wenn forceVisible: Hole Akzeptanzstatus und Datum aus AsyncStorage
  const [localAccepted, setLocalAccepted] = useState(false);
  const [localAcceptedAt, setLocalAcceptedAt] = useState<string | null>(null);
  useEffect(() => {
    if (forceVisible) {
      import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
        AsyncStorage.getItem('disclaimerAccepted').then(val => setLocalAccepted(val === 'true'));
        AsyncStorage.getItem('disclaimerAcceptedAt').then(val => setLocalAcceptedAt(val));
      });
    }
  }, [forceVisible]);

  const isDarkMode = theme === 'dark';
  const scaledFontSize = baseFontSize * fontSizeScale;
  const scaledStyles = getScaledStyles(scaledFontSize, isDarkMode);

  const handleAccept = () => {
    if (forceVisible && onRequestClose) {
      onRequestClose();
    } else {
      setDisclaimerAccepted(true);
    }
  };

  // Anzeige-Logik für Button und Hinweis
  const alreadyAccepted = forceVisible ? localAccepted : disclaimerAccepted;
  const acceptedDate = forceVisible ? localAcceptedAt : acceptedAt;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={forceVisible ? true : !disclaimerAccepted}
      onRequestClose={forceVisible && onRequestClose ? onRequestClose : () => {}}
    >
      <SafeAreaView style={scaledStyles.safeArea}>
        <View style={scaledStyles.modalContainer}>
          <View style={scaledStyles.modalContent}>
            <Text style={scaledStyles.title}>{t('disclaimer_title')}</Text>
            {/* Apple-konformer Haftungshinweis */}
            <View
              style={{
                marginBottom: 16,
                backgroundColor: '#fffbe6',
                borderRadius: 6,
                padding: 10,
                borderWidth: 1,
                borderColor: '#ffd700',
              }}
            >
              <Text
                style={{
                  fontWeight: 'bold',
                  color: '#b8860b',
                  fontSize: scaledFontSize * 1.1,
                  textAlign: 'center',
                }}
              >
                {t('disclaimer_important_note_title')}
              </Text>
              <Text
                style={{ fontWeight: 'bold', color: '#b8860b', marginTop: 4, textAlign: 'center' }}
              >
                {t('disclaimer_important_note')}
              </Text>
            </View>
            {/* Hinweis, wenn bereits akzeptiert */}
            {alreadyAccepted && (
              <View style={{ marginBottom: 10 }}>
                <Text style={[scaledStyles.paragraph, { color: '#32b8ca', fontWeight: 'bold' }]}>
                  {t('disclaimer_already_accepted', { date: acceptedDate ? new Date(acceptedDate).toLocaleDateString() : '' })}
                </Text>
              </View>
            )}

            <ScrollView style={scaledStyles.scrollView}>
              <Text style={scaledStyles.paragraphTitle}>{t('disclaimer_liability_title')}</Text>
              <Text style={scaledStyles.paragraph}>{t('disclaimer_liability_1')}</Text>
              <Text style={scaledStyles.paragraph}>{t('disclaimer_liability_2')}</Text>
              <Text style={scaledStyles.paragraph}>{t('disclaimer_liability_3')}</Text>
              <Text style={scaledStyles.paragraph}>{t('disclaimer_liability_4')}</Text>
              <Text style={scaledStyles.paragraph}>{t('disclaimer_liability_5')}</Text>

              <Text style={scaledStyles.paragraphTitle}>{t('disclaimer_ai_title')}</Text>
              <Text style={scaledStyles.paragraph}>{t('disclaimer_ai_1')}</Text>
              <Text style={scaledStyles.paragraph}>{t('disclaimer_ai_2')}</Text>

              <Text style={scaledStyles.paragraphTitle}>{t('disclaimer_emergency_title')}</Text>
              <Text style={scaledStyles.paragraph}>{t('disclaimer_emergency')}</Text>

              <Text style={scaledStyles.paragraphTitle}>{t('disclaimer_links_title')}</Text>
              <Text style={scaledStyles.paragraph}>{t('disclaimer_links')}</Text>

              <Text style={scaledStyles.paragraphTitle}>{t('disclaimer_copyright_title')}</Text>
              <Text style={scaledStyles.paragraph}>{t('disclaimer_copyright')}</Text>

              <Text style={scaledStyles.paragraphTitle}>{t('disclaimer_privacy_title')}</Text>
              <Text style={scaledStyles.paragraph}>{t('disclaimer_privacy')}</Text>
            </ScrollView>

            <View style={scaledStyles.buttonContainer}>
              <TouchableOpacity style={scaledStyles.acceptButton} onPress={handleAccept}>
                <Text style={scaledStyles.buttonText}>
                  {alreadyAccepted ? 'Schließen' : 'Ich habe verstanden und akzeptiere'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Styles mit Skalierungsfaktor für Schriftgröße
const getScaledStyles = (fontSize: number, isDarkMode: boolean) => {
  const { width, height } = Dimensions.get('window');

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      width: width * 0.9,
      maxHeight: height * 0.8,
      backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
      borderRadius: 10,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    title: {
      fontSize: fontSize * 1.5,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
      color: isDarkMode ? '#32b8ca' : '#32b8ca',
    },
    scrollView: {
      maxHeight: height * 0.5,
    },
    paragraphTitle: {
      fontSize: fontSize * 1.2,
      fontWeight: 'bold',
      marginTop: 15,
      marginBottom: 8,
      color: isDarkMode ? '#ffffff' : '#000000',
    },
    paragraph: {
      fontSize: fontSize,
      marginBottom: 10,
      lineHeight: fontSize * 1.4,
      color: isDarkMode ? '#dddddd' : '#333333',
    },
    buttonContainer: {
      marginTop: 20,
      alignItems: 'center',
    },
    acceptButton: {
      backgroundColor: '#32b8ca',
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 5,
      width: '100%',
    },
    buttonText: {
      color: '#ffffff',
      fontSize: fontSize * 1.1,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });
};

export default DisclaimerModal;
