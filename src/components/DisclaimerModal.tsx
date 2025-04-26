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
  SafeAreaView
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useDisclaimer } from '../context/DisclaimerContext';

interface DisclaimerModalProps {
  forceVisible?: boolean;
  onRequestClose?: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ forceVisible = false, onRequestClose }) => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  let disclaimerAccepted = false;
  let setDisclaimerAccepted = () => {};
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
            <Text style={scaledStyles.title}>Rechtlicher Hinweis</Text>
            {/* Apple-konformer Haftungshinweis */}
            <View style={{ marginBottom: 16, backgroundColor: '#fffbe6', borderRadius: 6, padding: 10, borderWidth: 1, borderColor: '#ffd700' }}>
              <Text style={{ fontWeight: 'bold', color: '#b8860b', fontSize: scaledFontSize * 1.1, textAlign: 'center' }}>
                Wichtiger Hinweis:
              </Text>
              <Text style={{ fontWeight: 'bold', color: '#b8860b', marginTop: 4, textAlign: 'center' }}>
                Diese App ersetzt keinesfalls die professionelle Beratung, Diagnose oder Behandlung durch approbierte Ärzt:innen oder medizinisches Fachpersonal. Bei gesundheitlichen Fragen oder Beschwerden wenden Sie sich bitte immer an eine qualifizierte Fachkraft. Im Notfall wählen Sie den Notruf (112).
              </Text>
            </View>
            {/* Hinweis, wenn bereits akzeptiert */}
            {alreadyAccepted && (
              <View style={{ marginBottom: 10 }}>
                <Text style={[scaledStyles.paragraph, { color: '#32b8ca', fontWeight: 'bold' }]}>Haftungsausschluss wurde bereits akzeptiert{acceptedDate ? ` am ${new Date(acceptedDate).toLocaleDateString()}` : ''}.</Text>
              </View>
            )}
            
            <ScrollView style={scaledStyles.scrollView}>
              <Text style={scaledStyles.paragraphTitle}>Haftungsbeschränkung</Text>
              <Text style={scaledStyles.paragraph}>
                Die Inhalte der Pflegebuddy-App werden mit größtmöglicher Sorgfalt erstellt und regelmäßig aktualisiert. Dennoch übernimmt Pflegebuddy keine Gewähr für die Richtigkeit, Vollständigkeit oder Aktualität der bereitgestellten Informationen. Die Nutzung erfolgt auf eigenes Risiko. Durch die Nutzung der App entsteht kein rechtsverbindliches Vertragsverhältnis zwischen dem Nutzer und dem Anbieter.
              </Text>
              <Text style={scaledStyles.paragraph}>
                Alle Inhalte der App dienen ausschließlich zu Informations- und Lernzwecken im pflegerischen Kontext. Pflegebuddy stellt keine Diagnosen, gibt keine medizinischen Empfehlungen und ersetzt keinesfalls ärztlichen oder therapeutischen Rat. Die Anwendung der Inhalte – insbesondere von Rechenhilfen, Handlungsempfehlungen oder allgemeinen Informationen – erfolgt eigenverantwortlich und unterliegt der Pflicht des Nutzers, diese vor Anwendung auf Richtigkeit und Angemessenheit zu prüfen. Die App richtet sich ausschließlich an geschultes Fachpersonal.
              </Text>
              <Text style={scaledStyles.paragraph}>
                Soweit Behandlungs- oder Pflegestandards, Dosierungen oder Scores angegeben werden, dienen diese nur der allgemeinen Orientierung. Sie ersetzen keine individuelle Bewertung im konkreten Einzelfall. Angaben zu Gesetzen, Richtlinien oder Normen können veraltet oder unvollständig sein – es wird empfohlen, stets die offiziellen Quellen heranzuziehen.
              </Text>
              <Text style={scaledStyles.paragraph}>
                Die integrierten Rechner, Scores und Tools basieren auf bekannten Fachquellen und wurden mit Sorgfalt implementiert. Dennoch kann keine Haftung für deren Ergebnisse übernommen werden. Sie dienen ausschließlich der Weiterbildung und nicht der direkten Anwendung am Patienten.
              </Text>
              <Text style={scaledStyles.paragraph}>
                Pflegebuddy ist als ergänzendes digitales Hilfsmittel konzipiert, nicht als Ersatz für fundiertes Fachwissen, praktische Erfahrung oder institutionelle Schulungen.
              </Text>

              <Text style={scaledStyles.paragraphTitle}>Notfallmaßnahmen</Text>
              <Text style={scaledStyles.paragraph}>
                Die in der App beschriebenen Notfallmaßnahmen ersetzen nicht die Ausbildung in Erster Hilfe oder medizinischer Notfallversorgung. Im Notfall wählen Sie umgehend den Notruf (112) und/oder konsultieren Sie sofort medizinisches Fachpersonal.
              </Text>

              <Text style={scaledStyles.paragraphTitle}>Externe Links</Text>
              <Text style={scaledStyles.paragraph}>
                Falls Pflegebuddy externe Inhalte (z. B. Wikipedia, ICD-10, Herstellerinformationen) verlinkt oder einbettet, übernehmen wir keine Verantwortung für deren Inhalt. Für den Inhalt externer Seiten sind ausschließlich deren Betreiber verantwortlich.
              </Text>

              <Text style={scaledStyles.paragraphTitle}>Urheber- und Schutzrechte</Text>
              <Text style={scaledStyles.paragraph}>
                Alle innerhalb der App veröffentlichten Inhalte unterliegen dem deutschen Urheberrecht. Eine Vervielfältigung, Verbreitung oder sonstige Nutzung außerhalb der engen Schranken des Urheberrechts ist ohne vorherige schriftliche Zustimmung unzulässig. Die Darstellung von Pflegebuddy-Inhalten in externen Frames oder Anwendungen ist nur mit ausdrücklicher Genehmigung erlaubt.
              </Text>

              <Text style={scaledStyles.paragraphTitle}>Datenschutz</Text>
              <Text style={scaledStyles.paragraph}>
                Durch die Nutzung dieser App akzeptieren Sie unsere Datenschutzbestimmungen. Weitere Informationen finden Sie in der Datenschutzerklärung in den Einstellungen.
              </Text>
            </ScrollView>
            
            <View style={scaledStyles.buttonContainer}>
              <TouchableOpacity 
                style={scaledStyles.acceptButton}
                onPress={handleAccept}
              >
                <Text style={scaledStyles.buttonText}>{alreadyAccepted ? 'Schließen' : 'Ich habe verstanden und akzeptiere'}</Text>
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
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
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