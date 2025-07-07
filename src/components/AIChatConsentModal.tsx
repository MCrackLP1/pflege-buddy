import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSettings } from '../context/SettingsContext'; // To adapt to theme

interface AIChatConsentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onPrivacyPolicyPress: () => void; // Function to handle privacy policy link press
}

const AIChatConsentModal: React.FC<AIChatConsentModalProps> = ({
  visible,
  onClose,
  onConfirm,
  onPrivacyPolicyPress,
}) => {
  const { theme, baseFontSize, fontSizeScale } = useSettings();
  const dynamicStyles = getDynamicStyles(theme, baseFontSize * fontSizeScale);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={dynamicStyles.centeredView}>
        <View style={dynamicStyles.modalView}>
          <ScrollView style={{width: '100%'}} contentContainerStyle={{alignItems: 'center'}}>
            <Icon name="shield-checkmark-outline" size={40 * fontSizeScale} color={theme === 'dark' ? '#4CAF50' : '#2E7D32'} style={dynamicStyles.iconStyle} />
            <Text style={dynamicStyles.modalTitle}>Hinweis zur Datenverarbeitung im AI Chat</Text>

            <Text style={dynamicStyles.modalText}>
              Um den Pflege Buddy AI Chat nutzen zu können, werden Ihre Fragen zur Bearbeitung an einen Server von Mark Tietz (Königplatz 3, 87448 Waltenhofen) gesendet.
            </Text>
            <Text style={dynamicStyles.modalText}>
              Auf diesem Server werden Ihre Fragen und die dazugehörigen Antworten gespeichert, um die Antwortzeiten zu verbessern und die Performance zu optimieren. Es erfolgt keine Speicherung dieser Chat-Daten lokal auf Ihrem Gerät (außer zur direkten Anzeige während der Nutzung).
            </Text>
            <Text style={dynamicStyles.modalText}>
              Weitere Informationen finden Sie in unserer{" "}
              <Text style={dynamicStyles.linkText} onPress={() => Linking.openURL('https://www.plegebuddy.care/datenschutz-app.html')}>
                Datenschutzerklärung
              </Text>
              .
            </Text>
          </ScrollView>
          <View style={dynamicStyles.buttonContainer}>
            <TouchableOpacity
              style={[dynamicStyles.button, dynamicStyles.buttonDecline]}
              onPress={onClose}
            >
              <Text style={dynamicStyles.buttonTextDecline}>Ablehnen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.button, dynamicStyles.buttonConfirm]}
              onPress={onConfirm}
            >
              <Text style={dynamicStyles.buttonTextConfirm}>Zustimmen & Fortfahren</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getDynamicStyles = (theme: 'light' | 'dark', scaledFontSize: number) => StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    margin: 20,
    width: '90%',
    maxHeight: '80%',
    backgroundColor: theme === 'dark' ? '#2c2c2e' : '#ffffff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconStyle: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: scaledFontSize * 1.25, // Approx 20 for base 16
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: theme === 'dark' ? '#f0f0f0' : '#333333',
  },
  modalText: {
    fontSize: scaledFontSize * 0.9375, // Approx 15 for base 16
    marginBottom: 12,
    textAlign: 'left',
    lineHeight: scaledFontSize * 1.4, // Approx 22 for base 16
    color: theme === 'dark' ? '#d3d3d3' : '#555555',
    width: '100%'
  },
  linkText: {
    color: theme === 'dark' ? '#58a6ff' : '#007AFF',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    elevation: 2,
    minWidth: '48%',
    alignItems: 'center',
  },
  buttonDecline: {
    backgroundColor: theme === 'dark' ? '#555' : '#e0e0e0',
  },
  buttonTextDecline: {
    color: theme === 'dark' ? '#f0f0f0' : '#333333',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: scaledFontSize * 0.9375,
  },
  buttonConfirm: {
    backgroundColor: theme === 'dark' ? '#4CAF50' : '#2E7D32',
  },
  buttonTextConfirm: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: scaledFontSize * 0.9375,
  },
});

export default AIChatConsentModal; 