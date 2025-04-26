/**
 * DocumentationScreen.tsx
 * Vorlagen und Hilfen für die Pflegedokumentation
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import Hooks
import { useSettings } from '../context/SettingsContext';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';

// Dummy-Daten für Vorlagen
const templateCategories = [
  {
    id: '1',
    title: 'Pflegevisiten',
    templates: [
      { id: '1-1', name: 'Routinevisite', content: 'Allgemeinzustand:\nVitalzeichen:\nErnährungszustand:\nPsychischer Zustand:\nBeobachtungen:\nMaßnahmen:' },
      { id: '1-2', name: 'Übergabevisite', content: 'Datum/Uhrzeit:\nName Patient:\nStation/Zimmer:\nHauptdiagnose:\nAktuelle Medikation:\nBehandlungsplan:\nBesonderheiten zur Beachtung:' }
    ]
  },
  {
    id: '2',
    title: 'Pflegeberichte',
    templates: [
      { id: '2-1', name: 'Tagesbericht', content: 'Datum:\nPflegerische Maßnahmen:\nBeobachtungen:\nTherapien:\nMedikation:\nBesonderheiten:' },
      { id: '2-2', name: 'Wochenbericht', content: 'Zeitraum:\nAllgemeinzustand:\nPflegerische Entwicklung:\nTherapiefortschritte:\nVerhaltensbeobachtungen:\nEmpfehlungen:' }
    ]
  },
  {
    id: '3',
    title: 'Pflegeanamnese',
    templates: [
      { id: '3-1', name: 'Erstgespräch', content: 'Name Patient:\nGeburtsdatum:\nBiografische Informationen:\nBisherige Erkrankungen:\nSelbstpflegefähigkeiten:\nGewohnheiten:\nWünsche/Bedürfnisse:' },
      { id: '3-2', name: 'Pflegeassessment', content: 'Name Patient:\nDatum:\nMobilität:\nKognition:\nErnährungszustand:\nKontinenz:\nPsychosoziale Situation:\nHautbeschaffenheit:' }
    ]
  },
  {
    id: '4',
    title: 'Übergabeprotokolle',
    templates: [
      { id: '4-1', name: 'Schichtübergabe', content: 'Datum:\nStation:\nSchicht:\nPatienten mit besonderen Vorkommnissen:\nAufnahmen:\nEntlassungen:\nAusstehende Tätigkeiten:' },
      { id: '4-2', name: 'Verlegungsbericht', content: 'Name Patient:\nGeburtsdatum:\nEntlassungsdiagnose:\nAktuelle Medikation:\nPflegerischer Status:\nTherapeutischer Status:\nEmpfehlungen für weiterbehandelnde Einrichtung:' }
    ]
  }
];

const DocumentationScreen: React.FC = () => {
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [templateText, setTemplateText] = useState<string>('');
  
  // Finde die ausgewählte Kategorie
  const currentCategory = templateCategories.find(cat => cat.id === selectedCategory);
  
  // Template-Text kopieren
  const copyTemplateText = () => {
    Alert.alert(
      "Text kopiert",
      "Der Vorlagentext wurde in die Zwischenablage kopiert. Sie können ihn nun in Ihrer Dokumentationssoftware einfügen.",
      [{ text: "OK" }]
    );
  };
  
  // Reset-Funktion
  const resetSelection = () => {
    setSelectedTemplate(null);
    setTemplateText('');
  };
  
  // Zurück-Funktion
  const goBack = () => {
    if (selectedTemplate) {
      resetSelection();
    } else {
      setSelectedCategory(null);
    }
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {!selectedCategory ? (
        // Kategorien-Ansicht
        <ScrollView>
          {templateCategories.map(category => (
            <TouchableOpacity 
              key={category.id}
              style={styles.card}
              onPress={() => setSelectedCategory(category.id)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="document-text-outline" size={28} 
                  color={theme === 'dark' ? '#32b8ca' : '#32b8ca'} 
                  style={{ marginRight: 12 }} 
                />
                <View>
                  <Text style={styles.itemTitle}>{category.title}</Text>
                  <Text style={styles.itemSubtitle}>{category.templates.length} Vorlagen verfügbar</Text>
                </View>
                <Icon 
                  name="chevron-forward" 
                  size={24} 
                  color={theme === 'dark' ? '#999' : '#666'} 
                  style={{ marginLeft: 'auto' }} 
                />
              </View>
            </TouchableOpacity>
          ))}
          
          <View style={styles.card}>
            <Text style={[styles.itemSubtitle, { fontStyle: 'italic' }]}>
              Hinweis: Diese Vorlagen dienen als Hilfestellung. Passen Sie die Inhalte 
              an Ihre spezifischen Anforderungen und die Standards Ihrer Einrichtung an.
            </Text>
          </View>
        </ScrollView>
      ) : selectedTemplate ? (
        // Template-Editor Ansicht
        <View style={{ flex: 1 }}>
          <View style={[styles.card, { marginHorizontal: 16, marginBottom: 8 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TouchableOpacity onPress={goBack} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="arrow-back" size={20} color={theme === 'dark' ? '#fff' : '#000'} />
                <Text style={{ marginLeft: 8, color: theme === 'dark' ? '#fff' : '#000' }}>Zurück</Text>
              </TouchableOpacity>
              <Text style={[styles.itemTitle, { textAlign: 'center' }]}>{selectedTemplate.name}</Text>
              <TouchableOpacity onPress={copyTemplateText}>
                <Icon name="copy-outline" size={20} color={theme === 'dark' ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView style={{ flex: 1, padding: 16 }}>
            <TextInput
              style={{
                backgroundColor: theme === 'dark' ? '#333' : '#f5f5f5',
                color: theme === 'dark' ? '#fff' : '#000',
                borderRadius: 8,
                padding: 16,
                minHeight: 300,
                textAlignVertical: 'top'
              }}
              multiline
              value={templateText}
              onChangeText={setTemplateText}
              placeholder="Bearbeiten Sie die Vorlage nach Ihren Bedürfnissen..."
              placeholderTextColor={theme === 'dark' ? '#999' : '#777'}
            />
          </ScrollView>
        </View>
      ) : (
        // Templates-Liste für ausgewählte Kategorie
        <ScrollView>
          <View style={[styles.card, { marginHorizontal: 16, marginBottom: 8 }]}>
            <TouchableOpacity onPress={goBack} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="arrow-back" size={20} color={theme === 'dark' ? '#fff' : '#000'} />
              <Text style={{ marginLeft: 8, color: theme === 'dark' ? '#fff' : '#000' }}>Alle Kategorien</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.headerTitle, { marginHorizontal: 16, marginBottom: 8 }]}>
            {currentCategory?.title}
          </Text>
          
          {currentCategory?.templates.map(template => (
            <TouchableOpacity 
              key={template.id}
              style={styles.card}
              onPress={() => {
                setSelectedTemplate(template);
                setTemplateText(template.content);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="document-outline" size={24} 
                  color={theme === 'dark' ? '#32b8ca' : '#32b8ca'} 
                  style={{ marginRight: 12 }} 
                />
                <Text style={styles.itemTitle}>{template.name}</Text>
                <Icon 
                  name="chevron-forward" 
                  size={24} 
                  color={theme === 'dark' ? '#999' : '#666'} 
                  style={{ marginLeft: 'auto' }} 
                />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default DocumentationScreen; 