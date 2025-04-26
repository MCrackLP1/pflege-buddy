/**
 * ContactsScreen.tsx
 * Verwaltung wichtiger Telefonnummern für Pflegekräfte
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  FlatList,
  Alert,
  Modal,
  StyleSheet,
  Linking,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Typen
import { RootStackParamList } from '../types/types';

// Import Hooks
import { useSettings } from '../context/SettingsContext';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';

type ContactsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Kontakt Interface
interface Contact {
  id: string;
  name: string;
  number: string;
  description?: string;
  category: string;
}

// Kategorie-Optionen
const CATEGORIES = [
  { id: 'emergency', label: 'Notfall', icon: 'alert-circle-outline' },
  { id: 'hospital', label: 'Krankenhaus', icon: 'medical-outline' },
  { id: 'colleague', label: 'Kollegen', icon: 'people-outline' },
  { id: 'other', label: 'Sonstige', icon: 'call-outline' }
];

const STORAGE_KEY = 'pflege_app_contacts';
const CONTACTS_INITIALIZED_KEY = 'pflege_app_contacts_initialized';

// Vordefinierte Kontakte
const DEFAULT_CONTACTS: Omit<Contact, 'id'>[] = [
  // Klinikleitung / Verwaltung
  { name: 'Geschäftsführer / Klinikdirektor', number: '', description: 'Klinikleitung', category: 'hospital' },
  { name: 'Pflegedienstleitung', number: '', description: 'Klinikleitung', category: 'hospital' },
  { name: 'Bereichsleitung', number: '', description: 'Klinikleitung', category: 'hospital' },
  { name: 'Qualitätsmanagementbeauftragter', number: '', description: 'Klinikleitung', category: 'hospital' },
  { name: 'Hygienebeauftragter', number: '', description: 'Klinikleitung', category: 'hospital' },
  { name: 'Datenschutzbeauftragter', number: '', description: 'Klinikleitung', category: 'hospital' },
  { name: 'IT-Service / Helpdesk', number: '', description: 'Klinikleitung', category: 'hospital' },
  { name: 'Personalabteilung', number: '', description: 'Klinikleitung', category: 'hospital' },
  { name: 'Patientenmanagement / Aufnahmebüro', number: '', description: 'Klinikleitung', category: 'hospital' },
  
  // Medizinische Bereiche
  { name: 'Chefarzt Innere Medizin', number: '', description: 'Medizinische Bereiche', category: 'hospital' },
  { name: 'Chefarzt Chirurgie', number: '', description: 'Medizinische Bereiche', category: 'hospital' },
  { name: 'Chefarzt Anästhesie / Intensivmedizin', number: '', description: 'Medizinische Bereiche', category: 'hospital' },
  { name: 'Chefarzt Neurologie', number: '', description: 'Medizinische Bereiche', category: 'hospital' },
  { name: 'Chefarzt Pädiatrie', number: '', description: 'Medizinische Bereiche', category: 'hospital' },
  { name: 'Chefarzt Radiologie', number: '', description: 'Medizinische Bereiche', category: 'hospital' },
  { name: 'Chefarzt Orthopädie / Unfallchirurgie', number: '', description: 'Medizinische Bereiche', category: 'hospital' },
  { name: 'Chefarzt Gynäkologie / Geburtshilfe', number: '', description: 'Medizinische Bereiche', category: 'hospital' },
  { name: 'Oberärzte der jeweiligen Stationen', number: '', description: 'Medizinische Bereiche', category: 'hospital' },
  { name: 'Notaufnahmeleitung', number: '', description: 'Medizinische Bereiche', category: 'hospital' },
  
  // Pflege / Funktionsdienste
  { name: 'Stationsleitung Intensivstation', number: '', description: 'Pflege / Funktionsdienste', category: 'colleague' },
  { name: 'Leitung OP-Pflege', number: '', description: 'Pflege / Funktionsdienste', category: 'colleague' },
  { name: 'Leitung Anästhesiepflege', number: '', description: 'Pflege / Funktionsdienste', category: 'colleague' },
  { name: 'Leitung Notaufnahme-Pflege', number: '', description: 'Pflege / Funktionsdienste', category: 'colleague' },
  { name: 'Wundmanager', number: '', description: 'Pflege / Funktionsdienste', category: 'colleague' },
  { name: 'Stomatherapeut', number: '', description: 'Pflege / Funktionsdienste', category: 'colleague' },
  { name: 'Schmerzmanager', number: '', description: 'Pflege / Funktionsdienste', category: 'colleague' },
  { name: 'Breast Care Nurse (Brustkrebsberatung)', number: '', description: 'Pflege / Funktionsdienste', category: 'colleague' },
  { name: 'Diabetesberater/in', number: '', description: 'Pflege / Funktionsdienste', category: 'colleague' },
  
  // Therapie & Soziale Dienste
  { name: 'Physiotherapie-Leitung', number: '', description: 'Therapie & Soziale Dienste', category: 'hospital' },
  { name: 'Ergotherapie-Leitung', number: '', description: 'Therapie & Soziale Dienste', category: 'hospital' },
  { name: 'Logopädie-Leitung', number: '', description: 'Therapie & Soziale Dienste', category: 'hospital' },
  { name: 'Sozialdienst', number: '', description: 'Therapie & Soziale Dienste', category: 'hospital' },
  { name: 'Entlassmanagement', number: '', description: 'Therapie & Soziale Dienste', category: 'hospital' },
  { name: 'Psychologischer Dienst', number: '', description: 'Therapie & Soziale Dienste', category: 'hospital' },
  
  // Apotheke, Labor, Technik
  { name: 'Krankenhausapotheke / Apothekenleitung', number: '', description: 'Apotheke, Labor, Technik', category: 'hospital' },
  { name: 'Zentrallaborleitung', number: '', description: 'Apotheke, Labor, Technik', category: 'hospital' },
  { name: 'Leitung Radiologie / CT / MRT', number: '', description: 'Apotheke, Labor, Technik', category: 'hospital' },
  { name: 'Medizintechnik', number: '', description: 'Apotheke, Labor, Technik', category: 'hospital' },
  { name: 'Haustechnik / Gebäudemanagement', number: '', description: 'Apotheke, Labor, Technik', category: 'hospital' },
  { name: 'Reinigungsteam (Housekeeping)', number: '', description: 'Apotheke, Labor, Technik', category: 'hospital' },
  
  // Weitere wichtige Kontakte
  { name: 'Datenschutz / IT-Sicherheit', number: '', description: 'Weitere wichtige Kontakte', category: 'hospital' },
  { name: 'Betriebsrat', number: '', description: 'Weitere wichtige Kontakte', category: 'hospital' },
  { name: 'Krankenhausseelsorge (evangelisch)', number: '', description: 'Weitere wichtige Kontakte', category: 'other' },
  { name: 'Krankenhausseelsorge (katholisch)', number: '', description: 'Weitere wichtige Kontakte', category: 'other' },
  { name: 'Patientenfürsprecher / Beschwerdemanagement', number: '', description: 'Weitere wichtige Kontakte', category: 'hospital' },
  { name: 'Cafeteria / Versorgungsteam', number: '', description: 'Weitere wichtige Kontakte', category: 'other' },
  { name: 'Sicherheitsdienst', number: '', description: 'Weitere wichtige Kontakte', category: 'other' },
  { name: 'Externe Notfallkontakte', number: '', description: 'Feuerwehr, Polizei, etc.', category: 'emergency' },
];

const ContactsScreen: React.FC = () => {
  const navigation = useNavigation<ContactsScreenNavigationProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();

  // States
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    number: '',
    description: '',
    category: 'other'
  });
  const [editMode, setEditMode] = useState(false);
  const [editContactId, setEditContactId] = useState<string | null>(null);

  // Lade Kontakte beim Start
  useEffect(() => {
    // Zurücksetzen des Flags für Testzwecke
    // AsyncStorage.removeItem(CONTACTS_INITIALIZED_KEY);
    loadContacts();
  }, []);

  // Filter Kontakte bei Suche
  useEffect(() => {
    if (searchText.trim() === '') {
      // Sortiere die Kontakte: Kontakte mit Nummer oben, dann alphabetisch
      const sortedContacts = [...contacts].sort((a, b) => {
        // Zuerst nach Vorhandensein einer Nummer sortieren
        if (a.number && !b.number) return -1;
        if (!a.number && b.number) return 1;
        
        // Dann alphabetisch nach Namen
        return a.name.localeCompare(b.name);
      });
      
      setFilteredContacts(sortedContacts);
    } else {
      const filtered = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchText.toLowerCase()) || 
        contact.number.includes(searchText) ||
        (contact.description && contact.description.toLowerCase().includes(searchText.toLowerCase()))
      );
      
      // Sortiere die gefilterten Ergebnisse
      const sortedFiltered = [...filtered].sort((a, b) => {
        // Zuerst nach Vorhandensein einer Nummer sortieren
        if (a.number && !b.number) return -1;
        if (!a.number && b.number) return 1;
        
        // Dann alphabetisch nach Namen
        return a.name.localeCompare(b.name);
      });
      
      setFilteredContacts(sortedFiltered);
    }
  }, [searchText, contacts]);

  // Prüft, ob Standard-Kontakte bereits initialisiert wurden
  const checkAndInitializeDefaultContacts = async () => {
    try {
      console.log('Prüfe und initialisiere Standard-Kontakte...');
      
      // Immer die vordefinierten Kontakte initialisieren, wenn die Liste leer ist
      const defaultContactsWithId = DEFAULT_CONTACTS.map(contact => ({
        ...contact,
        id: `default_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultContactsWithId));
      await AsyncStorage.setItem(CONTACTS_INITIALIZED_KEY, 'true');
      
      console.log(`${defaultContactsWithId.length} Standard-Kontakte wurden initialisiert`);
      
      // Sortiere die Kontakte
      const sortedContacts = [...defaultContactsWithId].sort((a, b) => {
        // Zuerst nach Vorhandensein einer Nummer sortieren
        if (a.number && !b.number) return -1;
        if (!a.number && b.number) return 1;
        
        // Dann alphabetisch nach Namen
        return a.name.localeCompare(b.name);
      });
      
      setContacts(sortedContacts);
      setFilteredContacts(sortedContacts);
      
      return true;
    } catch (error) {
      console.error('Fehler beim Initialisieren der Standard-Kontakte:', error);
      return false;
    }
  };

  // Lade Kontakte aus AsyncStorage
  const loadContacts = async () => {
    try {
      console.log('Lade Kontakte...');
      
      const initialized = await AsyncStorage.getItem(CONTACTS_INITIALIZED_KEY);
      const contactsData = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (contactsData) {
        const parsedContacts = JSON.parse(contactsData);
        console.log(`${parsedContacts.length} Kontakte geladen`);
        
        // Wenn Kontakte existieren aber leer sind, trotzdem Standardkontakte laden
        if (parsedContacts.length === 0) {
          console.log('Kontaktliste ist leer, lade Standard-Kontakte');
          await checkAndInitializeDefaultContacts();
        } else {
          // Sortiere die Kontakte
          const sortedContacts = [...parsedContacts].sort((a, b) => {
            // Zuerst nach Vorhandensein einer Nummer sortieren
            if (a.number && !b.number) return -1;
            if (!a.number && b.number) return 1;
            
            // Dann alphabetisch nach Namen
            return a.name.localeCompare(b.name);
          });
          
          setContacts(sortedContacts);
          setFilteredContacts(sortedContacts);
        }
      } else {
        console.log('Keine Kontakte gefunden, lade Standard-Kontakte');
        // Wenn keine Kontakte existieren, initialisiere Standard-Kontakte
        await checkAndInitializeDefaultContacts();
      }
    } catch (error) {
      console.error('Fehler beim Laden der Kontakte:', error);
      Alert.alert('Fehler', 'Die Kontakte konnten nicht geladen werden. Versuche Standard-Kontakte zu laden...');
      
      // Im Fehlerfall versuchen, Standard-Kontakte zu laden
      await checkAndInitializeDefaultContacts();
    }
  };

  // Speichere Kontakte in AsyncStorage
  const saveContacts = async (updatedContacts: Contact[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedContacts));
      console.log(`${updatedContacts.length} Kontakte gespeichert`);
      
      // Sortiere die Kontakte beim Speichern, damit die Sortierung beibehalten wird
      const sortedContacts = [...updatedContacts].sort((a, b) => {
        // Zuerst nach Vorhandensein einer Nummer sortieren
        if (a.number && !b.number) return -1;
        if (!a.number && b.number) return 1;
        
        // Dann alphabetisch nach Namen
        return a.name.localeCompare(b.name);
      });
      
      setContacts(sortedContacts);
      setFilteredContacts(sortedContacts);
    } catch (error) {
      console.error('Fehler beim Speichern der Kontakte:', error);
      Alert.alert('Fehler', 'Die Kontakte konnten nicht gespeichert werden.');
    }
  };

  // Füge neuen Kontakt hinzu oder aktualisiere bestehenden
  const handleSaveContact = () => {
    if (!newContact.name || !newContact.number) {
      Alert.alert('Fehler', 'Name und Telefonnummer sind erforderlich.');
      return;
    }

    let updatedContacts: Contact[];

    if (editMode && editContactId) {
      // Aktualisiere bestehenden Kontakt
      updatedContacts = contacts.map(contact => 
        contact.id === editContactId 
          ? { ...newContact, id: editContactId } as Contact 
          : contact
      );
    } else {
      // Füge neuen Kontakt hinzu
      const newId = Date.now().toString();
      updatedContacts = [
        ...contacts,
        { ...newContact, id: newId } as Contact
      ];
    }

    saveContacts(updatedContacts);
    resetFormAndCloseModal();
  };

  // Lösche Kontakt
  const handleDeleteContact = (contactId: string) => {
    Alert.alert(
      'Kontakt löschen',
      'Möchten Sie diesen Kontakt wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Löschen', 
          style: 'destructive',
          onPress: () => {
            const updatedContacts = contacts.filter(contact => contact.id !== contactId);
            saveContacts(updatedContacts);
          }
        }
      ]
    );
  };

  // Bearbeite Kontakt
  const handleEditContact = (contact: Contact) => {
    setNewContact({
      name: contact.name,
      number: contact.number,
      description: contact.description || '',
      category: contact.category
    });
    setEditMode(true);
    setEditContactId(contact.id);
    setModalVisible(true);
  };

  // Öffne Dialog für neuen Kontakt
  const handleAddContact = () => {
    resetForm();
    setEditMode(false);
    setEditContactId(null);
    setModalVisible(true);
  };

  // Zurücksetzen des Formulars
  const resetForm = () => {
    setNewContact({
      name: '',
      number: '',
      description: '',
      category: 'other'
    });
  };

  // Zurücksetzen und Modal schließen
  const resetFormAndCloseModal = () => {
    resetForm();
    setModalVisible(false);
  };

  // Wähle die Telefonnummer
  const handleCallNumber = (phoneNumber: string) => {
    const url = Platform.OS === 'android' ? `tel:${phoneNumber}` : `telprompt:${phoneNumber}`;
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        }
        Alert.alert('Fehler', 'Die Telefonfunktion wird auf diesem Gerät nicht unterstützt.');
      })
      .catch(error => {
        console.error('Fehler beim Wählen der Nummer:', error);
        Alert.alert('Fehler', 'Die Nummer konnte nicht gewählt werden.');
      });
  };

  // Button zum Zurücksetzen der Kontaktliste hinzufügen
  const resetContacts = async () => {
    Alert.alert(
      'Kontakte zurücksetzen',
      'Möchten Sie alle Kontakte löschen und die Standard-Kontakte neu laden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        { 
          text: 'Zurücksetzen', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Kontakt-Daten und Initialisierungs-Flag zurücksetzen
              await AsyncStorage.removeItem(CONTACTS_INITIALIZED_KEY);
              await AsyncStorage.removeItem(STORAGE_KEY);
              await checkAndInitializeDefaultContacts();
            } catch (error) {
              console.error('Fehler beim Zurücksetzen der Kontakte:', error);
              Alert.alert('Fehler', 'Die Kontakte konnten nicht zurückgesetzt werden.');
            }
          }
        }
      ]
    );
  };

  // Render Kontakt-Eintrag
  const renderContactItem = ({ item }: { item: Contact }) => {
    const categoryInfo = CATEGORIES.find(cat => cat.id === item.category) || CATEGORIES[3];
    
    return (
      <View style={[
        styles.card, 
        { marginBottom: 8, padding: 12 }
      ]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Icon 
              name={categoryInfo.icon} 
              size={24} 
              color={theme === 'dark' ? '#32b8ca' : '#32b8ca'} 
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text 
                style={styles.itemTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.name}
              </Text>
              <Text 
                style={[styles.itemSubtitle, { color: theme === 'dark' ? '#32b8ca' : '#32b8ca' }]}
                onPress={() => handleCallNumber(item.number)}
              >
                {item.number || 'Keine Nummer'}
              </Text>
              {item.description ? (
                <Text 
                  style={styles.itemSubtitle}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.description}
                </Text>
              ) : null}
            </View>
          </View>
          
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity 
              onPress={() => handleCallNumber(item.number)}
              style={{ padding: 8 }}
              disabled={!item.number}
            >
              <Icon name="call-outline" size={20} color={item.number ? (theme === 'dark' ? '#32b8ca' : '#32b8ca') : '#999999'} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleEditContact(item)}
              style={{ padding: 8 }}
            >
              <Icon name="create-outline" size={20} color={theme === 'dark' ? '#aaaaaa' : '#666666'} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDeleteContact(item.id)}
              style={{ padding: 8 }}
            >
              <Icon name="trash-outline" size={20} color={theme === 'dark' ? '#ff6b6b' : '#ff6b6b'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Inline Styles für Modal
  const modalStyles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalView: {
      width: '90%',
      maxWidth: 400,
      backgroundColor: theme === 'dark' ? '#1e1e1e' : 'white',
      borderRadius: 10,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5
    },
    input: {
      backgroundColor: theme === 'dark' ? '#333333' : '#f5f5f5',
      borderColor: theme === 'dark' ? '#444444' : '#dddddd',
      borderWidth: 1,
      borderRadius: 5,
      padding: 10,
      marginBottom: 15,
      color: theme === 'dark' ? '#ffffff' : '#333333',
      fontSize: baseFontSize * fontSizeScale
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10
    },
    categoryRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 15
    },
    categoryOption: {
      padding: 8,
      borderRadius: 5,
      marginRight: 8,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center'
    }
  });

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Suchleiste */}
      <View style={[styles.searchContainer, { marginHorizontal: 16, marginTop: 16, marginBottom: 16 }]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Kontakt suchen..."
          placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Buttons */}
      <View style={{ flexDirection: 'row', marginHorizontal: 16, marginBottom: 16 }}>
        <TouchableOpacity 
          style={[
            styles.button, 
            { 
              backgroundColor: theme === 'dark' ? '#32b8ca' : '#32b8ca',
              flex: 1,
              marginRight: 8
            }
          ]}
          onPress={handleAddContact}
        >
          <Text style={styles.buttonText}>Neuen Kontakt hinzufügen</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.button, 
            { 
              backgroundColor: theme === 'dark' ? '#ff6b6b' : '#ff6b6b',
              flex: 1,
              marginLeft: 8
            }
          ]}
          onPress={resetContacts}
        >
          <Text style={styles.buttonText}>Standardkontakte laden</Text>
        </TouchableOpacity>
      </View>

      {/* Kontaktliste */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.centeredContent}>
            <Text style={styles.itemSubtitle}>
              {searchText.trim() !== '' 
                ? 'Keine passenden Kontakte gefunden.' 
                : 'Keine Kontakte vorhanden. Fügen Sie einen neuen Kontakt hinzu.'}
            </Text>
          </View>
        }
      />

      {/* Modal für Kontakteingabe */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetFormAndCloseModal}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <Text style={[styles.headerTitle, { marginBottom: 15 }]}>
              {editMode ? 'Kontakt bearbeiten' : 'Neuer Kontakt'}
            </Text>

            <TextInput
              style={modalStyles.input}
              placeholder="Name"
              placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
              value={newContact.name}
              onChangeText={text => setNewContact({...newContact, name: text})}
            />

            <TextInput
              style={modalStyles.input}
              placeholder="Telefonnummer"
              placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
              value={newContact.number}
              onChangeText={text => setNewContact({...newContact, number: text})}
              keyboardType="phone-pad"
            />

            <TextInput
              style={modalStyles.input}
              placeholder="Beschreibung (optional)"
              placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
              value={newContact.description}
              onChangeText={text => setNewContact({...newContact, description: text})}
            />

            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>Kategorie:</Text>
            <View style={modalStyles.categoryRow}>
              {CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    modalStyles.categoryOption,
                    {
                      backgroundColor: newContact.category === category.id 
                        ? theme === 'dark' ? '#32b8ca20' : '#32b8ca10'
                        : theme === 'dark' ? '#333333' : '#f5f5f5',
                      borderWidth: 1,
                      borderColor: newContact.category === category.id 
                        ? '#32b8ca' 
                        : theme === 'dark' ? '#444444' : '#dddddd'
                    }
                  ]}
                  onPress={() => setNewContact({...newContact, category: category.id})}
                >
                  <Icon 
                    name={category.icon} 
                    size={16} 
                    color={newContact.category === category.id ? '#32b8ca' : theme === 'dark' ? '#aaaaaa' : '#666666'} 
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[
                    styles.itemSubtitle,
                    { color: newContact.category === category.id ? '#32b8ca' : theme === 'dark' ? '#ffffff' : '#333333' }
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={modalStyles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#999999', flex: 1, marginRight: 8 }]}
                onPress={resetFormAndCloseModal}
              >
                <Text style={styles.buttonText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#32b8ca', flex: 1, marginLeft: 8 }]}
                onPress={handleSaveContact}
              >
                <Text style={styles.buttonText}>Speichern</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ContactsScreen; 