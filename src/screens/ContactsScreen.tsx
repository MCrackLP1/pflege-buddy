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
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Typen
import { RootStackParamList } from '../types/types';

// Import Hooks
import { useSettings } from '../context/SettingsContext';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';

// Import Services
import ContactsSyncService, { Contact as SyncContact, SyncStatus } from '../services/ContactsSyncService';
import { GoogleAuthService, GoogleUser } from '../services/GoogleAuthService';

type ContactsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Kontakt Interface
interface Contact {
  id: string;
  name: string;
  number: string;
  description?: string;
  category: string;
}

// Kategorie-Optionen (als Funktion für Übersetzungen)
const getCategories = (t: any) => [
  { id: 'emergency', label: t('emergency'), icon: 'alert-circle-outline' },
  { id: 'hospital', label: t('hospital'), icon: 'medical-outline' },
  { id: 'colleague', label: t('colleagues'), icon: 'people-outline' },
  { id: 'other', label: t('other'), icon: 'call-outline' },
];

const STORAGE_KEY = 'pflege_app_contacts';
const CONTACTS_INITIALIZED_KEY = 'pflege_app_contacts_initialized';

// Vordefinierte Kontakte als Funktion für Übersetzungen
const getDefaultContacts = (t: any): Omit<Contact, 'id'>[] => [
  // Klinikleitung / Verwaltung
  {
    name: t('ceo_clinical_director'),
    number: '',
    description: t('clinic_management'),
    category: 'hospital',
  },
  { name: t('nursing_service_management'), number: '', description: t('clinic_management'), category: 'hospital' },
  { name: t('department_management'), number: '', description: t('clinic_management'), category: 'hospital' },
  {
    name: t('quality_management_officer'),
    number: '',
    description: t('clinic_management'),
    category: 'hospital',
  },
  { name: t('hygiene_officer'), number: '', description: t('clinic_management'), category: 'hospital' },
  {
    name: t('data_protection_officer'),
    number: '',
    description: t('clinic_management'),
    category: 'hospital',
  },
  { name: t('it_service_helpdesk'), number: '', description: t('clinic_management'), category: 'hospital' },
  { name: t('human_resources'), number: '', description: t('clinic_management'), category: 'hospital' },
  {
    name: t('patient_management_admission'),
    number: '',
    description: t('clinic_management'),
    category: 'hospital',
  },

  // Medizinische Bereiche
  {
    name: t('chief_physician_internal_medicine'),
    number: '',
    description: t('medical_departments'),
    category: 'hospital',
  },
  {
    name: t('chief_physician_surgery'),
    number: '',
    description: t('medical_departments'),
    category: 'hospital',
  },
  {
    name: t('chief_physician_anesthesia_intensive'),
    number: '',
    description: t('medical_departments'),
    category: 'hospital',
  },
  {
    name: t('chief_physician_neurology'),
    number: '',
    description: t('medical_departments'),
    category: 'hospital',
  },
  {
    name: t('chief_physician_pediatrics'),
    number: '',
    description: t('medical_departments'),
    category: 'hospital',
  },
  {
    name: t('chief_physician_radiology'),
    number: '',
    description: t('medical_departments'),
    category: 'hospital',
  },
  {
    name: t('chief_physician_orthopedics_trauma'),
    number: '',
    description: t('medical_departments'),
    category: 'hospital',
  },
  {
    name: t('chief_physician_gynecology_obstetrics'),
    number: '',
    description: t('medical_departments'),
    category: 'hospital',
  },
  {
    name: t('senior_physicians_wards'),
    number: '',
    description: t('medical_departments'),
    category: 'hospital',
  },
  {
    name: t('emergency_department_management'),
    number: '',
    description: t('medical_departments'),
    category: 'hospital',
  },

  // Pflege / Funktionsdienste
  {
    name: t('ward_management_icu'),
    number: '',
    description: t('nursing_functional_services'),
    category: 'colleague',
  },
  {
    name: t('or_nursing_management'),
    number: '',
    description: t('nursing_functional_services'),
    category: 'colleague',
  },
  {
    name: t('anesthesia_nursing_management'),
    number: '',
    description: t('nursing_functional_services'),
    category: 'colleague',
  },
  {
    name: t('emergency_nursing_management'),
    number: '',
    description: t('nursing_functional_services'),
    category: 'colleague',
  },
  {
    name: t('wound_manager'),
    number: '',
    description: t('nursing_functional_services'),
    category: 'colleague',
  },
  {
    name: t('stoma_therapist'),
    number: '',
    description: t('nursing_functional_services'),
    category: 'colleague',
  },
  {
    name: t('pain_manager'),
    number: '',
    description: t('nursing_functional_services'),
    category: 'colleague',
  },
  {
    name: t('breast_care_nurse'),
    number: '',
    description: t('nursing_functional_services'),
    category: 'colleague',
  },
  {
    name: t('diabetes_counselor'),
    number: '',
    description: t('nursing_functional_services'),
    category: 'colleague',
  },

  // Therapie & Soziale Dienste
  {
    name: t('physiotherapy_management'),
    number: '',
    description: t('therapy_social_services'),
    category: 'hospital',
  },
  {
    name: t('occupational_therapy_management'),
    number: '',
    description: t('therapy_social_services'),
    category: 'hospital',
  },
  {
    name: t('speech_therapy_management'),
    number: '',
    description: t('therapy_social_services'),
    category: 'hospital',
  },
  {
    name: t('social_service'),
    number: '',
    description: t('therapy_social_services'),
    category: 'hospital',
  },
  {
    name: t('discharge_management'),
    number: '',
    description: t('therapy_social_services'),
    category: 'hospital',
  },
  {
    name: t('psychological_service'),
    number: '',
    description: t('therapy_social_services'),
    category: 'hospital',
  },

  // Apotheke, Labor, Technik
  {
    name: t('hospital_pharmacy_management'),
    number: '',
    description: t('pharmacy_lab_technology'),
    category: 'hospital',
  },
  {
    name: t('central_lab_management'),
    number: '',
    description: t('pharmacy_lab_technology'),
    category: 'hospital',
  },
  {
    name: t('radiology_ct_mri_management'),
    number: '',
    description: t('pharmacy_lab_technology'),
    category: 'hospital',
  },
  {
    name: t('medical_technology'),
    number: '',
    description: t('pharmacy_lab_technology'),
    category: 'hospital',
  },
  {
    name: t('facility_management'),
    number: '',
    description: t('pharmacy_lab_technology'),
    category: 'hospital',
  },
  {
    name: t('housekeeping_team'),
    number: '',
    description: t('pharmacy_lab_technology'),
    category: 'hospital',
  },

  // Weitere wichtige Kontakte
  {
    name: t('data_protection_it_security'),
    number: '',
    description: t('other_important_contacts'),
    category: 'hospital',
  },
  {
    name: t('works_council'),
    number: '',
    description: t('other_important_contacts'),
    category: 'hospital',
  },
  {
    name: t('hospital_chaplaincy_protestant'),
    number: '',
    description: t('other_important_contacts'),
    category: 'other',
  },
  {
    name: t('hospital_chaplaincy_catholic'),
    number: '',
    description: t('other_important_contacts'),
    category: 'other',
  },
  {
    name: t('patient_advocate_complaints'),
    number: '',
    description: t('other_important_contacts'),
    category: 'hospital',
  },
  {
    name: t('cafeteria_supply_team'),
    number: '',
    description: t('other_important_contacts'),
    category: 'other',
  },
  {
    name: t('security_service'),
    number: '',
    description: t('other_important_contacts'),
    category: 'other',
  },
  {
    name: t('external_emergency_contacts'),
    number: '',
    description: t('fire_police_etc'),
    category: 'emergency',
  },
];

const ContactsScreen: React.FC = () => {
  const navigation = useNavigation<ContactsScreenNavigationProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const { t } = useTranslation();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  
  // Get categories with translations
  const CATEGORIES = getCategories(t);

  // States
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    number: '',
    description: '',
    category: 'other',
  });
  const [editMode, setEditMode] = useState(false);
  const [editContactId, setEditContactId] = useState<string | null>(null);
  
  // Sync States
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: false,
    hasUnsyncedChanges: false,
    syncInProgress: false,
  });
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
  const [syncService] = useState(() => ContactsSyncService.getInstance());

  // Lade Kontakte beim Start
  useEffect(() => {
    // Zurücksetzen des Flags für Testzwecke
    // AsyncStorage.removeItem(CONTACTS_INITIALIZED_KEY);
    loadContacts();
    initializeSync();
  }, []);

  // Sync-Status Listener
  useEffect(() => {
    const onSyncStatusChange = (status: SyncStatus) => {
      setSyncStatus(status);
    };

    syncService.onSyncStatusChange(onSyncStatusChange);

    return () => {
      syncService.removeSyncStatusCallback(onSyncStatusChange);
    };
  }, [syncService]);

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
      const filtered = contacts.filter(
        contact =>
          contact.name.toLowerCase().includes(searchText.toLowerCase()) ||
          contact.number.includes(searchText) ||
          (contact.description &&
            contact.description.toLowerCase().includes(searchText.toLowerCase()))
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
      const DEFAULT_CONTACTS = getDefaultContacts(t);
      const defaultContactsWithId = DEFAULT_CONTACTS.map(contact => ({
        ...contact,
        id: `default_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      console.error('Error loading contacts:', error);
      Alert.alert(
        t('error'),
        t('contacts_load_error')
      );

      // Im Fehlerfall versuchen, Standard-Kontakte zu laden
      await checkAndInitializeDefaultContacts();
    }
  };

  // Initialisiere Sync-Service
  const initializeSync = async () => {
    try {
      const user = await GoogleAuthService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        await syncService.initialize(user);
        const status = await syncService.getSyncStatus();
        setSyncStatus(status);
      }
    } catch (error) {
      console.log('Kein angemeldeter Benutzer für Sync gefunden');
    }
  };

  // Synchronisiere Kontakte
  const handleSyncContacts = async () => {
    if (!currentUser) {
      Alert.alert(
        t('sync_requires_login'),
        t('please_login_to_sync_contacts'),
        [{ text: t('ok') }]
      );
      return;
    }

    try {
      const result = await syncService.syncContacts();
      if (result.success && result.syncedContacts) {
        const sortedContacts = [...result.syncedContacts].sort((a, b) => {
          if (a.number && !b.number) return -1;
          if (!a.number && b.number) return 1;
          return a.name.localeCompare(b.name);
        });
        
        setContacts(sortedContacts);
        setFilteredContacts(sortedContacts);
        
        Alert.alert(
          t('sync_successful'),
          t('contacts_synced_successfully'),
          [{ text: t('ok') }]
        );
      } else {
        Alert.alert(
          t('sync_failed'),
          result.error || t('unknown_sync_error'),
          [{ text: t('ok') }]
        );
      }
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert(t('error'), t('sync_failed_try_again'));
    }
  };

  // Lade Kontakte aus der Cloud
  const handleLoadFromCloud = async () => {
    if (!currentUser) {
      Alert.alert(
        t('sync_requires_login'),
        t('please_login_to_sync_contacts'),
        [{ text: t('ok') }]
      );
      return;
    }

    Alert.alert(
      t('load_from_cloud'),
      t('load_from_cloud_warning'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('load'),
          onPress: async () => {
            try {
              const result = await syncService.loadFromCloud();
              if (result.success && result.syncedContacts) {
                const sortedContacts = [...result.syncedContacts].sort((a, b) => {
                  if (a.number && !b.number) return -1;
                  if (!a.number && b.number) return 1;
                  return a.name.localeCompare(b.name);
                });
                
                setContacts(sortedContacts);
                setFilteredContacts(sortedContacts);
                
                Alert.alert(
                  t('load_successful'),
                  t('contacts_loaded_from_cloud'),
                  [{ text: t('ok') }]
                );
              } else {
                Alert.alert(
                  t('load_failed'),
                  result.error || t('no_cloud_data_found'),
                  [{ text: t('ok') }]
                );
              }
            } catch (error) {
              console.error('Load from cloud error:', error);
              Alert.alert(t('error'), t('load_failed_try_again'));
            }
          },
        },
      ]
    );
  };

  // Speichere Kontakte in AsyncStorage
  const saveContacts = async (updatedContacts: Contact[]) => {
    try {
      // Verwende Sync-Service wenn angemeldet, sonst direkt AsyncStorage
      if (currentUser) {
        await syncService.saveLocalContacts(updatedContacts);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedContacts));
      }
      
      console.log(`${updatedContacts.length} contacts saved`);

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
      console.error('Error saving contacts:', error);
      Alert.alert(t('error'), t('contactsSaveError'));
    }
  };

  // Füge neuen Kontakt hinzu oder aktualisiere bestehenden
  const handleSaveContact = () => {
    if (!newContact.name || !newContact.number) {
      Alert.alert(t('error'), t('namePhoneRequired'));
      return;
    }

    let updatedContacts: Contact[];

    if (editMode && editContactId) {
      // Aktualisiere bestehenden Kontakt
      updatedContacts = contacts.map(contact =>
        contact.id === editContactId ? ({ ...newContact, id: editContactId } as Contact) : contact
      );
    } else {
      // Füge neuen Kontakt hinzu
      const newId = Date.now().toString();
      updatedContacts = [...contacts, { ...newContact, id: newId } as Contact];
    }

    saveContacts(updatedContacts);
    resetFormAndCloseModal();
  };

  // Lösche Kontakt
  const handleDeleteContact = (contactId: string) => {
    Alert.alert(t('deleteContact'), t('deleteContactConfirm'), [
      {
        text: t('cancel'),
        style: 'cancel',
      },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () => {
          const updatedContacts = contacts.filter(contact => contact.id !== contactId);
          saveContacts(updatedContacts);
        },
      },
    ]);
  };

  // Bearbeite Kontakt
  const handleEditContact = (contact: Contact) => {
    setNewContact({
      name: contact.name,
      number: contact.number,
      description: contact.description || '',
      category: contact.category,
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
      category: 'other',
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
        Alert.alert(t('error'), t('phoneNotSupported'));
      })
      .catch(() => {
        Alert.alert(t('error'), t('numberCallFailed'));
      });
  };

  // Button zum Zurücksetzen der Kontaktliste hinzufügen
  const resetContacts = async () => {
    Alert.alert(
      t('contacts_reset_title'),
      t('contacts_reset_message'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('reset_button'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Kontakt-Daten und Initialisierungs-Flag zurücksetzen
              await AsyncStorage.removeItem(CONTACTS_INITIALIZED_KEY);
              await AsyncStorage.removeItem(STORAGE_KEY);
              await checkAndInitializeDefaultContacts();
            } catch (error) {
              console.error('Error resetting contacts:', error);
              Alert.alert(t('error'), t('contactsResetError'));
            }
          },
        },
      ]
    );
  };

  // Render Kontakt-Eintrag
  const renderContactItem = ({ item }: { item: Contact }) => {
    const categoryInfo = CATEGORIES.find(cat => cat.id === item.category) || CATEGORIES[3];

    return (
      <View style={[styles.card, { marginBottom: 8, padding: 12 }]}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Icon
              name={categoryInfo.icon}
              size={24}
              color={theme === 'dark' ? '#32b8ca' : '#32b8ca'}
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode="tail">
                {item.name}
              </Text>
              <Text
                style={[styles.itemSubtitle, { color: theme === 'dark' ? '#32b8ca' : '#32b8ca' }]}
                onPress={() => handleCallNumber(item.number)}
              >
                {item.number || t('no_number')}
              </Text>
              {item.description ? (
                <Text style={styles.itemSubtitle} numberOfLines={1} ellipsizeMode="tail">
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
              <Icon
                name="call-outline"
                size={20}
                color={item.number ? (theme === 'dark' ? '#32b8ca' : '#32b8ca') : '#999999'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEditContact(item)} style={{ padding: 8 }}>
              <Icon
                name="create-outline"
                size={20}
                color={theme === 'dark' ? '#aaaaaa' : '#666666'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteContact(item.id)} style={{ padding: 8 }}>
              <Icon
                name="trash-outline"
                size={20}
                color={theme === 'dark' ? '#ff6b6b' : '#ff6b6b'}
              />
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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
      elevation: 5,
    },
    input: {
      backgroundColor: theme === 'dark' ? '#333333' : '#f5f5f5',
      borderColor: theme === 'dark' ? '#444444' : '#dddddd',
      borderWidth: 1,
      borderRadius: 5,
      padding: 10,
      marginBottom: 15,
      color: theme === 'dark' ? '#ffffff' : '#333333',
      fontSize: baseFontSize * fontSizeScale,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    categoryRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 15,
    },
    categoryOption: {
      padding: 8,
      borderRadius: 5,
      marginRight: 8,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
  });

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Suchleiste */}
      <View
        style={{ 
          padding: 16,
          backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5'
        }}
      >
        <View
          style={[
            {
              backgroundColor: theme === 'dark' ? '#252525' : '#f0f0f0',
              borderRadius: 16,
              borderWidth: 0,
              paddingHorizontal: 12,
              flexDirection: 'row',
              alignItems: 'center',
              height: 48,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            },
          ]}
        >
          <Icon
            name="search"
            size={22}
            color={theme === 'dark' ? '#03dac6' : '#00acc1'}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={[
              {
                flex: 1,
                height: 48,
                paddingVertical: 8,
                color: theme === 'dark' ? '#ffffff' : '#000000',
                fontSize: baseFontSize * fontSizeScale,
              }
            ]}
            placeholder={t('contact_search_placeholder')}
            placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Icon 
                name="close-circle" 
                size={20} 
                color={theme === 'dark' ? '#aaaaaa' : '#777777'} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Buttons */}
      {/* Sync-Status-Anzeige */}
      {currentUser && (
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: 16,
          marginBottom: 8,
          padding: 8,
          backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
          borderRadius: 8,
        }}>
          <Icon
            name={syncStatus.isOnline ? 'cloud-done' : 'cloud-offline'}
            size={16}
            color={syncStatus.isOnline ? '#4CAF50' : '#FF9800'}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.itemSubtitle, { fontSize: 12, textAlign: 'center' }]}>
            {syncStatus.syncInProgress 
              ? t('syncing_contacts')
              : syncStatus.isOnline 
                ? syncStatus.lastSyncTimestamp 
                  ? t('last_sync') + ': ' + new Date(syncStatus.lastSyncTimestamp).toLocaleTimeString()
                  : t('cloud_connected')
                : t('offline_mode')
            }
          </Text>
          {syncStatus.hasUnsyncedChanges && (
            <Icon
              name="sync"
              size={14}
              color="#FF9800"
              style={{ marginLeft: 6 }}
            />
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', marginHorizontal: 16, marginBottom: 8 }}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme === 'dark' ? '#32b8ca' : '#32b8ca',
              flex: 1,
              marginRight: 4,
            },
          ]}
          onPress={handleAddContact}
        >
          <Text style={styles.buttonText}>{t('addNewContact')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme === 'dark' ? '#ff6b6b' : '#ff6b6b',
              flex: 1,
              marginLeft: 4,
            },
          ]}
          onPress={resetContacts}
        >
          <Text style={styles.buttonText}>{t('loadDefaultContacts')}</Text>
        </TouchableOpacity>
      </View>

      {/* Sync Buttons - Nur anzeigen wenn angemeldet */}
      {currentUser && (
        <View style={{ flexDirection: 'row', marginHorizontal: 16, marginBottom: 16 }}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: syncStatus.syncInProgress 
                  ? (theme === 'dark' ? '#666666' : '#cccccc')
                  : (theme === 'dark' ? '#4CAF50' : '#4CAF50'),
                flex: 1,
                marginRight: 4,
                opacity: syncStatus.syncInProgress ? 0.6 : 1,
              },
            ]}
            onPress={handleSyncContacts}
            disabled={syncStatus.syncInProgress}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              {syncStatus.syncInProgress ? (
                <Icon name="sync" size={16} color="#fff" style={{ marginRight: 4 }} />
              ) : (
                <Icon name="cloud-upload" size={16} color="#fff" style={{ marginRight: 4 }} />
              )}
              <Text style={styles.buttonText}>
                {syncStatus.syncInProgress ? t('syncing') : t('sync_now')}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme === 'dark' ? '#9C27B0' : '#9C27B0',
                flex: 1,
                marginLeft: 4,
              },
            ]}
            onPress={handleLoadFromCloud}
            disabled={syncStatus.syncInProgress}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="cloud-download" size={16} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.buttonText}>{t('load_from_cloud')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Kontaktliste */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContactItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.centeredContent}>
            <Text style={styles.itemSubtitle}>
              {searchText.trim() !== ''
                ? t('no_contacts_found')
                : t('no_contacts_available')}
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
              {editMode ? t('edit_contact') : t('new_contact')}
            </Text>

            <TextInput
              style={modalStyles.input}
              placeholder={t('name_placeholder')}
              placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
              value={newContact.name}
              onChangeText={text => setNewContact({ ...newContact, name: text })}
            />

            <TextInput
              style={modalStyles.input}
              placeholder={t('phone_placeholder')}
              placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
              value={newContact.number}
              onChangeText={text => setNewContact({ ...newContact, number: text })}
              keyboardType="phone-pad"
            />

            <TextInput
              style={modalStyles.input}
              placeholder={t('description_placeholder')}
              placeholderTextColor={theme === 'dark' ? '#888888' : '#999999'}
              value={newContact.description}
              onChangeText={text => setNewContact({ ...newContact, description: text })}
            />

            <Text style={[styles.itemTitle, { marginBottom: 8 }]}>{t('category_label')}</Text>
            <View style={modalStyles.categoryRow}>
              {CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    modalStyles.categoryOption,
                    {
                      backgroundColor:
                        newContact.category === category.id
                          ? theme === 'dark'
                            ? '#32b8ca20'
                            : '#32b8ca10'
                          : theme === 'dark'
                            ? '#333333'
                            : '#f5f5f5',
                      borderWidth: 1,
                      borderColor:
                        newContact.category === category.id
                          ? '#32b8ca'
                          : theme === 'dark'
                            ? '#444444'
                            : '#dddddd',
                    },
                  ]}
                  onPress={() => setNewContact({ ...newContact, category: category.id })}
                >
                  <Icon
                    name={category.icon}
                    size={16}
                    color={
                      newContact.category === category.id
                        ? '#32b8ca'
                        : theme === 'dark'
                          ? '#aaaaaa'
                          : '#666666'
                    }
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[
                      styles.itemSubtitle,
                      {
                        color:
                          newContact.category === category.id
                            ? '#32b8ca'
                            : theme === 'dark'
                              ? '#ffffff'
                              : '#333333',
                      },
                    ]}
                  >
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
                <Text style={styles.buttonText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#32b8ca', flex: 1, marginLeft: 8 }]}
                onPress={handleSaveContact}
              >
                <Text style={styles.buttonText}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ContactsScreen;
