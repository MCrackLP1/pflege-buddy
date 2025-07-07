/**
 * DocumentationScreen.tsx
 * Interaktive Dokumentationshilfe mit Schritt-für-Schritt-Erstellung und Spracherkennung
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  SafeAreaView,
  Platform,
  PermissionsAndroid,
  Vibration,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { useTranslation } from 'react-i18next';
import Clipboard from '@react-native-clipboard/clipboard';

// Import Hooks
import { useSettings } from '../context/SettingsContext';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';

// Phrasen-Kategorien für den interaktiven Builder werden jetzt aus Übersetzungen geladen
const getDocumentationSections = (t: any) => {
  const sections = t('documentation_sections', { returnObjects: true });
  return Object.keys(sections).map(key => ({
    id: key,
    title: sections[key].title,
    phrases: sections[key].phrases
  }));
};

const DocumentationScreen: React.FC = () => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [speechError, setSpeechError] = useState<string>('');
  const { t } = useTranslation();
  
  // Get documentation sections with translations
  const documentationSections = getDocumentationSections(t);

  // States
  const [mode, setMode] = useState<'templates'|'builder'>('templates');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedPhrases, setSelectedPhrases] = useState<{[key: string]: string}>({});
  const [freeText, setFreeText] = useState<string>('');
  const [generatedDoc, setGeneratedDoc] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Styling
  const cardStyle = {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
    shadowRadius: 3,
    elevation: 2,
    padding: 16
  };

  const buttonStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: theme === 'dark' ? '#03dac6' : '#00acc1',
    padding: 12,
    borderRadius: 24,
    marginVertical: 8,
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: theme === 'dark' ? '#333333' : '#e0e0e0',
  };

  const activePhrase = {
    backgroundColor: theme === 'dark' ? 'rgba(3, 218, 198, 0.2)' : 'rgba(0, 172, 193, 0.1)',
    borderColor: theme === 'dark' ? '#03dac6' : '#00acc1',
    borderWidth: 1,
  };

  // Voice recognition setup
  useEffect(() => {
    let isMounted = true;
    
    // Voice event listeners mit Null-Checks
    if (Voice) {
      Voice.onSpeechStart = () => {
        if (isMounted) setIsRecording(true);
      };
      Voice.onSpeechEnd = () => {
        if (isMounted) setIsRecording(false);
      };
      Voice.onSpeechResults = (e: SpeechResultsEvent) => {
        if (isMounted) onSpeechResults(e);
      };
      Voice.onSpeechError = (e: SpeechErrorEvent) => {
        if (isMounted) onSpeechError(e);
      };
      
      // Erweiterte Voice-Konfiguration
      checkVoiceAvailability();
    }

    // Cleanup
    return () => {
      isMounted = false;
      if (Voice) {
        Voice.destroy().then(() => {
          Voice.removeAllListeners();
        }).catch((e) => {
          console.warn('Error cleaning up Voice listeners:', e);
        });
      }
    };
  }, []);
  
  // Überprüfe die Verfügbarkeit und unterstützte Sprachen
  const checkVoiceAvailability = async () => {
    try {
      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        Alert.alert(
          t('speech_not_available_title'),
          t('speech_not_available_message'),
          [{ text: 'OK' }]
        );
      }
    } catch (e) {
      console.error("Fehler bei der Überprüfung der Spracherkennungsverfügbarkeit:", e);
    }
  };
  
  // Sprach-zu-Text Funktion mit echter Implementierung
  const toggleRecording = async () => {
    if (isRecording) {
      try {
        await Voice.stop();
        setIsRecording(false);
      } catch (e) {
        console.error(e);
      }
    } else {
      // Überprüfen der Berechtigung vor dem Start
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        Alert.alert(
          t('permission_denied'),
          t('microphone_permission_required'),
          [{ text: 'OK' }]
        );
        return;
      }

      // Zurücksetzen des erkannten Texts
      setRecognizedText('');
      setSpeechError('');

      try {
        // Einfachere Konfiguration ohne erweiterte Optionen, die möglicherweise
        // Probleme verursachen
        console.log("Starte Spracherkennung...");
        
        // Keine erweiterten Optionen verwenden, nur die Sprache
        await Voice.start('de-DE');
        
                  console.log(t('speech_recognition_started'));
        
        // Vibration als taktiles Feedback, dass die Aufnahme begonnen hat
        if (Platform.OS === 'android') {
          try {
            Vibration.vibrate(100);
          } catch (e) {
            console.error(t('vibration_error'), e);
          }
        }
      } catch (e) {
        console.error(t('error_loading_speech_recognition'), e);
        Alert.alert(
          t('error'),
          t('error_starting_speech_recognition', { error: e }),
          [{ text: t('ok') }]
        );
      }
    }
  };

  // Handler for speech recognition results
  const onSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      const recognized = e.value[0]; // Get the most likely result
      setRecognizedText(recognized);
      
      // Füge erkannten Text zum Freitext hinzu
      if (currentStep >= documentationSections.length) {
        setFreeText(prevText => prevText + ' ' + recognized);
      } else {
        // Wenn wir in einem normalen Schritt sind, füge zu selected phrases hinzu
        const currentSection = documentationSections[
          Math.min(currentStep, documentationSections.length - 1)
        ];
        setSelectedPhrases(prev => ({
          ...prev,
          [currentSection.id]: recognized
        }));

        // Nach kurzer Verzögerung zum nächsten Schritt
        setTimeout(() => {
          if (currentStep < documentationSections.length - 1) {
            setCurrentStep(currentStep + 1);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          } else {
            setCurrentStep(documentationSections.length);
          }
        }, 1000);
      }
    }
  };

  // Handler für Spracherkennungsfehler
  const onSpeechError = (e: SpeechErrorEvent) => {
    const errorCode = e.error?.code || '';
    const errorMessage = e.error?.message || t('unknown_error');
    
    setSpeechError(errorMessage);
    setIsRecording(false);
    
    // Spezifische Fehlermeldungen basierend auf dem Fehlercode
    let userFriendlyMessage = t('speech_recognition_error_message', { error: errorMessage });
    
    // Fehlercode 7 ist "No match" - nichts wurde erkannt
    if (errorCode === '7' || errorMessage.includes('No match')) {
      userFriendlyMessage = t('speech_recognition_no_match');
    }
    // Fehlercode 3 ist "Audio recording error"
    else if (errorCode === '3') {
      userFriendlyMessage = t('speech_recognition_audio_error');
    }
    // Fehlercode 5 ist "Client-side error"
    else if (errorCode === '5') {
      userFriendlyMessage = t('speech_recognition_internal_error');
    }
    // Fehlercode 1-2 sind Netzwerkprobleme
    else if (errorCode === '1' || errorCode === '2') {
      userFriendlyMessage = t('speech_recognition_network_error');
    }
    
    Alert.alert(
      t('speech_recognition_error'), 
      userFriendlyMessage,
      [{ 
        text: t('ok'),
        onPress: () => {
          // Automatisch neu versuchen?
          if (errorCode === '7') {
            setTimeout(() => {
              Alert.alert(
                t('tip'),
                t('retry_speech_recognition_question'),
                [
                  { 
                    text: t('no'), 
                    style: "cancel" 
                  },
                  { 
                    text: t('yes'), 
                    onPress: () => {
                      // Kleiner Timeout, damit der Benutzer bereit ist
                      setTimeout(() => toggleRecording(), 500);
                    } 
                  }
                ]
              );
            }, 500);
          }
        }
      }]
    );
  };

  // Prüfe und fordere Mikrofonberechtigung an
  const requestMicrophonePermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: t('microphone_permission_title'),
            message: t('microphone_permission_required'),
            buttonNeutral: t('ask_later'),
            buttonNegative: t('cancel'),
            buttonPositive: t('ok')
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error(err);
        return false;
      }
    } else {
      // Für iOS wird die Berechtigung automatisch angefordert
      return true;
    }
  };

  // Phrase auswählen
  const selectPhrase = (phrase: string) => {
    const currentSection = documentationSections[
      Math.min(currentStep, documentationSections.length - 1)
    ];
    setSelectedPhrases({
      ...selectedPhrases,
      [currentSection.id]: phrase
    });
    
    // Automatisch zum nächsten Schritt
    if (currentStep < documentationSections.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        // Scroll to top
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 300);
    }
  };

  // Dokument generieren
  const generateDocument = () => {
    let docText = '';
    
    // Alle ausgewählten Phrasen
    documentationSections.forEach(section => {
      if (selectedPhrases[section.id]) {
        docText += `**${section.title}:** ${selectedPhrases[section.id]}\n\n`;
      }
    });
    
    // Freitext hinzufügen wenn vorhanden
    if (freeText.trim()) {
      docText += `**${t('additional_information')}:** ${freeText.trim()}\n\n`;
    }
    
    // Datum und Uhrzeit
    const now = new Date();
    docText += `${t('documented_at')} ${now.toLocaleDateString('de-DE')} ${t('at')} ${now.toLocaleTimeString('de-DE')}`;
    
    setGeneratedDoc(docText);
    setShowPreviewModal(true);
  };

  // Dokumentation zurücksetzen
  const resetDocumentation = () => {
    setCurrentStep(0);
    setSelectedPhrases({});
    setFreeText('');
    setGeneratedDoc('');
  };

  // Modal für Dokumentationsvorschau
  const renderPreviewModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPreviewModal}
      onRequestClose={() => setShowPreviewModal(false)}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <View style={{ flex: 1, margin: 16, borderRadius: 12, backgroundColor: theme === 'dark' ? '#121212' : '#f8f8f8', overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme === 'dark' ? '#333' : '#eee' }}>
            <Text style={{ 
              fontSize: baseFontSize * fontSizeScale * 1.2, 
              fontWeight: 'bold',
              color: theme === 'dark' ? '#ffffff' : '#000000'
            }}>{t('doc_preview')}</Text>
            <TouchableOpacity onPress={() => setShowPreviewModal(false)}>
              <Icon name="close-circle" size={30} color={theme === 'dark' ? '#aaa' : '#888'} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 16 }}>
            <Text selectable style={{ 
              color: theme === 'dark' ? '#ffffff' : '#000000',
              fontSize: baseFontSize * fontSizeScale,
              minHeight: 100 
            }}>
              {generatedDoc}
            </Text>
          </ScrollView>
          <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: theme === 'dark' ? '#333' : '#eee' }}>
            <TouchableOpacity style={buttonStyle} onPress={() => {
              Clipboard.setString(generatedDoc);
              setShowPreviewModal(false);
              Alert.alert(t('documentation_copied_title'), t('documentation_copied_message'), [{ text: t('ok') }]);
            }}>
              <Icon name="copy-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('copy_and_close')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={secondaryButtonStyle} onPress={resetDocumentation}>
              <Icon name="refresh-outline" size={20} color={theme === 'dark' ? '#fff' : '#000'} style={{ marginRight: 10 }} />
              <Text style={{ color: theme === 'dark' ? '#fff' : '#000', fontWeight: 'bold' }}>{t('reset_and_start_over')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  // Fortschrittsanzeige
  const renderProgressBar = () => {
    const progress = (currentStep + 1) / (documentationSections.length + 1);
    return (
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ 
          textAlign: 'center', 
          marginBottom: 8,
          color: theme === 'dark' ? '#ffffff' : '#000000',
          fontSize: baseFontSize * fontSizeScale
        }}>
          {t('step_of', { current: currentStep + 1, total: documentationSections.length })}
        </Text>
        <View style={{
          height: 6,
          backgroundColor: theme === 'dark' ? '#333333' : '#e0e0e0',
          borderRadius: 3,
          overflow: 'hidden'
        }}>
          <View style={{
            height: '100%',
            width: `${progress * 100}%`,
            backgroundColor: theme === 'dark' ? '#03dac6' : '#00acc1',
            borderRadius: 3
          }} />
        </View>
      </View>
    );
  };

  // Builder-Modus
  const renderBuilder = () => {
    // Freitext-Eingabe Schritt
    if (currentStep >= documentationSections.length) {
      return (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ 
            fontSize: baseFontSize * fontSizeScale * 1.2,
            fontWeight: 'bold',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            marginBottom: 16,
            textAlign: 'center'
          }}>
            {t('enter_free_text_optional')}
          </Text>
          
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: theme === 'dark' ? '#333' : '#ddd',
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
              color: theme === 'dark' ? '#ffffff' : '#000000',
              borderRadius: 8,
              padding: 16,
              fontSize: baseFontSize * fontSizeScale,
              minHeight: 120,
              textAlignVertical: 'top'
            }}
            placeholder={t('free_text_placeholder')}
            placeholderTextColor={theme === 'dark' ? '#666' : '#999'}
            value={freeText}
            onChangeText={setFreeText}
            multiline
            numberOfLines={6}
          />
          
          <TouchableOpacity style={buttonStyle} onPress={generateDocument}>
            <Icon name="eye-outline" size={20} color="#fff" style={{ marginRight: 10 }} />
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('preview_and_finish')}</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }
    
    const currentSection = documentationSections[currentStep];
    const selectedPhrase = selectedPhrases[currentSection.id] || '';
    
    return (
      <View style={{ flex: 1 }}>
        {renderProgressBar()}
        
        <View style={cardStyle}>
          <Text style={{ 
            fontSize: baseFontSize * fontSizeScale * 1.2,
            fontWeight: 'bold',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            marginBottom: 8
          }}>
            {currentStep + 1}. {currentSection.title}
          </Text>
          
          <Text style={{ 
            color: theme === 'dark' ? '#bbbbbb' : '#666666',
            marginBottom: 16
          }}          >
            {t('select_description')}
          </Text>
          
          <ScrollView 
            ref={scrollViewRef}
            style={{ maxHeight: 400 }} 
            showsVerticalScrollIndicator={false}
          >
            {currentSection.phrases.map((phrase: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
                  padding: 16,
                  marginVertical: 4,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme === 'dark' ? '#333333' : '#e0e0e0',
                  ...(selectedPhrase === phrase ? activePhrase : {})
                }}
                onPress={() => selectPhrase(phrase)}
              >
                <Text style={{
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  fontSize: baseFontSize * fontSizeScale
                }}>
                  {phrase}
                </Text>
              </TouchableOpacity>
            ))}
            
            {/* Option für eigene Eingabe */}
            <TouchableOpacity
              style={{
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: theme === 'dark' ? '#333333' : '#e0e0e0',
                borderStyle: 'dashed'
              }}
              onPress={() => {
                Alert.prompt(
                  t('custom_input_title'),
                  `${t('custom_input_message')} "${currentSection.title}":`,
                  [
                    { text: t('cancel'), style: "cancel" },
                    { text: t('ok'), onPress: text => text && selectPhrase(text) }
                  ]
                );
              }}
            >
              <Text style={{ 
                color: theme === 'dark' ? '#03dac6' : '#00acc1',
                textAlign: 'center'
              }}>
                {t('add_custom_input')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* Navigation und zusätzliche Optionen */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          marginHorizontal: 16,
          marginTop: 16
        }}>
          <TouchableOpacity
            style={{
              ...secondaryButtonStyle,
              flex: 1,
              marginRight: 8
            }}
            onPress={() => {
              if (currentStep > 0) {
                setCurrentStep(currentStep - 1);
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
              }
            }}
            disabled={currentStep === 0}
          >
            <Icon name="arrow-back" size={18} color={theme === 'dark' ? (currentStep === 0 ? '#666666' : '#ffffff') : (currentStep === 0 ? '#999999' : '#000000')} style={{ marginRight: 6 }} />
            <Text style={{ 
              color: theme === 'dark' ? (currentStep === 0 ? '#666666' : '#ffffff') : (currentStep === 0 ? '#999999' : '#000000')
            }}>
              {t('back_button')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              ...buttonStyle,
              flex: 1,
              marginLeft: 8
            }}
            onPress={() => {
              if (currentStep < documentationSections.length - 1) {
                setCurrentStep(currentStep + 1);
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
              } else {
                // Letzter Schritt - Freitext-Eingabe anzeigen
                setCurrentStep(documentationSections.length);
              }
            }}
          >
            <Text style={{ color: '#ffffff' }}>
              {currentStep < documentationSections.length - 1 ? t('next') : t('finish')}
            </Text>
            <Icon name="arrow-forward" size={18} color="#ffffff" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Startseite mit Auswahlmöglichkeiten
  const renderStartScreen = () => (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={cardStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Icon 
            name="clipboard-outline" 
            size={28} 
            color={theme === 'dark' ? '#03dac6' : '#00acc1'} 
            style={{ marginRight: 12 }}
          />
          <Text style={{ 
            fontSize: baseFontSize * fontSizeScale * 1.3,
            fontWeight: 'bold',
            color: theme === 'dark' ? '#ffffff' : '#000000'
          }}>
            {t('interactive_documentation_helper')}
          </Text>
        </View>
        
        <Text style={{ 
          color: theme === 'dark' ? '#bbbbbb' : '#666666',
          marginBottom: 16,
          lineHeight: 20
        }}>
          {t('choose_mode_description')}
        </Text>
        
        <TouchableOpacity
          style={{
            ...buttonStyle,
            marginVertical: 8,
            backgroundColor: theme === 'dark' ? '#03dac6' : '#00acc1'
          }}
          onPress={() => {
            setMode('builder');
            resetDocumentation();
          }}
        >
          <Icon name="create-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>
            {t('create_interactive_documentation')}
          </Text>
        </TouchableOpacity>
        
        <Text style={{ 
          fontSize: baseFontSize * fontSizeScale * 0.9,
          color: theme === 'dark' ? '#999999' : '#666666',
          marginTop: 4,
          marginBottom: 16,
          marginLeft: 8
        }}>
          {t('step_by_step_documentation_description')}
        </Text>
      </View>
      
      <View style={{ 
        marginTop: 20,
        padding: 16,
        borderRadius: 12,
        backgroundColor: theme === 'dark' ? 'rgba(3, 218, 198, 0.1)' : 'rgba(0, 172, 193, 0.05)',
        borderLeftWidth: 4,
        borderLeftColor: theme === 'dark' ? '#03dac6' : '#00acc1'
      }}>
        <Text style={{ 
          fontSize: baseFontSize * fontSizeScale * 0.9,
          color: theme === 'dark' ? '#bbbbbb' : '#666666'
        }}>
          <Text style={{ fontWeight: 'bold' }}>{t('tip')}: </Text>
          {t('documentation_tip_text')}
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <View 
      style={[
        styles.container, 
        { 
          paddingTop: insets.top, 
          paddingBottom: insets.bottom,
          backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5'
        }
      ]}
    >
      {/* Header */}
      {mode === 'builder' && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme === 'dark' ? '#333333' : '#e0e0e0'
        }}>
          <TouchableOpacity 
            onPress={() => {
              if (Object.keys(selectedPhrases).length > 0) {
                Alert.alert(
                  t('back_to_start_title'),
                  t('back_to_start_confirm'),
                  [
                    { text: t('cancel'), style: "cancel" },
                    { text: t('back_button'), onPress: () => setMode('templates') }
                  ]
                );
              } else {
                setMode('templates');
              }
            }}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Icon name="arrow-back" size={20} color={theme === 'dark' ? '#ffffff' : '#000000'} />
            <Text style={{ 
              marginLeft: 8, 
              color: theme === 'dark' ? '#ffffff' : '#000000',
              fontSize: baseFontSize * fontSizeScale
            }}            >
              {t('back_button')}
            </Text>
          </TouchableOpacity>
          
          <Text style={{ 
            color: theme === 'dark' ? '#ffffff' : '#000000',
            fontWeight: 'bold',
            fontSize: baseFontSize * fontSizeScale * 1.1
          }}>
            {t('create_documentation')}
          </Text>
          
          <TouchableOpacity onPress={resetDocumentation}>
            <Icon name="refresh" size={20} color={theme === 'dark' ? '#03dac6' : '#00acc1'} />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Content */}
      {mode === 'templates' ? renderStartScreen() : renderBuilder()}
      
      {/* Modals */}
      {renderPreviewModal()}
    </View>
  );
};

export default DocumentationScreen;
