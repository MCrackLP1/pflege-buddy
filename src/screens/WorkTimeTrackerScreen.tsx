/**
 * WorkTimeTrackerScreen.tsx
 * Arbeitszeiterfassung mit GPS-Tracking und Geofencing
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  PERMISSIONS, 
  RESULTS, 
  request, 
  check, 
  openSettings,
  requestMultiple,
  Permission
} from 'react-native-permissions';

// Import Typen
import { RootStackParamList, WorkTime } from '../types/types';

// Interface für Standortkoordinaten
interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

// Import Hooks
import { useSettings } from '../context/SettingsContext';
import { useWorkTime } from '../context/WorkTimeContext';

// Import Services
import PermissionsService from '../services/PermissionsService';
import LocationTrackingService from '../services/LocationTrackingService';
import NativeLocationTrackingService from '../services/NativeLocationTrackingService';
import { serviceEventEmitter } from '../services/serviceEmitter';

// Import Style-Utilities
import { getDynamicStyles } from '../utils/styleUtils';

type WorkTimeTrackerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WorkTimeTracker'>;

const WorkTimeTrackerScreen: React.FC = () => {
  const navigation = useNavigation<WorkTimeTrackerScreenNavigationProp>();
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  const styles = getDynamicStyles(theme, baseFontSize * fontSizeScale);
  const insets = useSafeAreaInsets();
  const locationTrackingService = useRef(LocationTrackingService.getInstance());

  // Definiere Theme-abhängige Farben
  const backgroundColor = theme === 'dark' ? '#1e1e1e' : '#f9f9f9';
  const activeTrackingBgColor = theme === 'dark' ? '#0d2e13' : '#E8F5E9'; 
  const borderColor = theme === 'dark' ? '#333333' : '#e0e0e0';

  const { 
    workLocation,
    workTimes,
    activeWorkTime,
    trackingEnabled,
    setTrackingEnabled,
    startWorkTime,
    endWorkTime,
    deleteWorkTime,
    deleteWorkLocation,
  } = useWorkTime();

  // Zustand für die Pausenzeit
  const [selectedBreakDuration, setSelectedBreakDuration] = useState<number>(30);
  const [selectedBreakOption, setSelectedBreakOption] = useState<'none' | '30min' | '60min' | 'custom'>('30min');
  const [customBreakDuration, setCustomBreakDuration] = useState<string>('');
  const [locationStatus, setLocationStatus] = useState<'checking' | 'inside' | 'outside' | 'error'>('checking');
  const [lastLocationCheck, setLastLocationCheck] = useState<Date | null>(null);
  const [lastLocation, setLastLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [lastLocationAddress, setLastLocationAddress] = useState<string | null>(null);
  const [permissionsStatus, setPermissionsStatus] = useState<{
    basic: boolean;
    background: boolean;
  }>({ basic: false, background: false });
  const [checkingPermissions, setCheckingPermissions] = useState<boolean>(false);
  const [trackingInBackground, setTrackingInBackground] = useState<boolean>(false);

  // Komponente initialisieren
  useEffect(() => {
    let isInitializing = true;
    
    // Keine Arbeitsorte vorhanden, zeige Warnung
    if (!workLocation) {
      // Alert deaktiviert, solange Feature nicht verfügbar
      // Alert.alert(
      //   "Initialisierungsfehler",
      //   "Bitte legen Sie zuerst einen Arbeitsort fest."
      // );
      return;
    }
    
    // Tracking-Service Status wiederherstellen
    const restoreTrackingState = async () => {
      try {
        // Lade gespeicherte Pausenzeit-Einstellungen
        try {
          const savedBreakOption = await AsyncStorage.getItem('selectedBreakOption');
          const savedBreakDuration = await AsyncStorage.getItem('selectedBreakDuration');
          
          if (savedBreakOption) {
            setSelectedBreakOption(savedBreakOption as 'none' | '30min' | '60min' | 'custom');
          }
          
          if (savedBreakDuration) {
            const duration = parseInt(savedBreakDuration, 10);
            setSelectedBreakDuration(duration);
            
            if (savedBreakOption === 'custom') {
              setCustomBreakDuration(savedBreakDuration);
            }
          }
        } catch (error) {
          console.error('Fehler beim Laden der Pausenzeit-Einstellungen:', error);
        }

        // Überprüfe, ob natives Tracking aktiv ist
        if (Platform.OS === 'android') {
          try {
            // Verzögerte Initialisierung mit verbesserter Fehlerbehandlung
            console.log('Versuche verzögerte Initialisierung des nativen Trackings...');
            
            // Warte 5 Sekunden nach dem Start, bevor das native Modul geladen wird
            setTimeout(async () => {
              try {
                console.log('Starte verzögerte native Tracking-Initialisierung');
                
                // Verzögerte Aktivierung mit Try-Catch
                try {
                  const trackingService = require('../services/NativeLocationTrackingService').default;
                  const isNativeTracking = await trackingService.isTracking().catch(() => false);
                  console.log('Native Tracking-Status überprüft:', isNativeTracking);
                  
                  if (isNativeTracking) {
                    setTrackingEnabled(true);
                    setTrackingInBackground(true);
                  } else {
                    if (locationTrackingService.current) {
                      await locationTrackingService.current.restoreTrackingState();
                      setTrackingEnabled(locationTrackingService.current.isTrackingEnabled());
                      setTrackingInBackground(locationTrackingService.current.isTrackingEnabled());
                    }
                  }
                } catch (innerError) {
                  console.error('Fehler beim verzögerten Laden des nativen Trackings:', innerError);
                  setTrackingEnabled(false);
                  setTrackingInBackground(false);
                }
              } catch (delayedError) {
                console.error('Fehler bei verzögertem Initialisierungsversuch:', delayedError);
                setTrackingEnabled(false);
                setTrackingInBackground(false);
              }
            }, 5000);
            
          } catch (trackingError) {
            console.error('Fehler beim Überprüfen des nativen Trackings:', trackingError);
            // Fallback: Tracking als deaktiviert annehmen
            setTrackingEnabled(false);
            setTrackingInBackground(false);
          }
        } else {
          if (locationTrackingService.current) {
            try {
              await locationTrackingService.current.restoreTrackingState();
              setTrackingEnabled(locationTrackingService.current.isTrackingEnabled());
              setTrackingInBackground(locationTrackingService.current.isTrackingEnabled());
            } catch (restoreError) {
              console.error('Fehler beim Wiederherstellen des Tracking-Status:', restoreError);
              // Fallback: Tracking als deaktiviert annehmen
              setTrackingEnabled(false);
              setTrackingInBackground(false);
            }
          }
        }
      } catch (error) {
        console.error('Fehler beim Wiederherstellen des Tracking-Status:', error);
        
        if (isInitializing) {
          // Bei Fehlern während der Initialisierung, Fehler anzeigen
          Alert.alert(
            "Fehler",
            "Die Arbeitszeiterfassung konnte nicht geladen werden. Bitte starten Sie die App neu."
          );
        }
      }
    };
    
    // Status wiederherstellen
    restoreTrackingState();
    
    // Initialisierung abgeschlossen
    isInitializing = false;
    
    return () => {
      // Aufräumen bei Unmount
    };
  }, []);

  // Überprüfe Berechtigungen beim Laden und Ändern des Tracking-Status
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        console.log('Starte Berechtigungsüberprüfung...');
        setCheckingPermissions(true);

        // Aktuelle Berechtigungen abrufen statt direkt anzufragen
        try {
          const permissions = await PermissionsService.checkAllLocationPermissions();
          console.log('Aktuelle Berechtigungen:', permissions);
          
          // Aktualisiere den Status im UI
          setPermissionsStatus({
            basic: permissions.basicLocationPermission,
            background: permissions.backgroundLocationPermission
          });

          // Wenn wir keine Grundberechtigung haben und Tracking aktivieren werden soll
          if (!permissions.basicLocationPermission && trackingEnabled) {
            console.log('Grundlegende Standortberechtigung fehlt und Tracking aktiviert');
            
            // Sicherheitshalber das Tracking stoppen
            try {
              await locationTrackingService.current.stopLocationTracking();
              // Deaktiviere Tracking-Status
              setTrackingEnabled(false);
            } catch (trackingError) {
              console.error('Fehler beim Stoppen des Trackings:', trackingError);
            }
            
            // Zeige Dialog nur an, wenn das Tracking aktiviert werden sollte
            try {
              return new Promise<void>((resolve) => {
                Alert.alert(
                  'Standortberechtigung erforderlich',
                  'Für die automatische Arbeitszeiterfassung benötigt die App Zugriff auf Ihren Standort.',
                  [
                    { 
                      text: 'Berechtigung erteilen', 
                      onPress: async () => {
                        try {
                          // Frage Berechtigung an
                          const result = await PermissionsService.checkAndRequestLocationPermissions();
                          
                          // Prüfe Ergebnis
                          if (!result) {
                            try {
                              Alert.alert(
                                'Berechtigung erforderlich',
                                'Bitte erlauben Sie den Standortzugriff in den Einstellungen.',
                                [
                                  { text: 'Später', style: 'cancel', onPress: () => resolve() },
                                  { 
                                    text: 'Zu Einstellungen', 
                                    onPress: () => {
                                      try {
                                        openSettings();
                                        resolve();
                                      } catch (e) {
                                        console.error('Fehler beim Öffnen der Einstellungen:', e);
                                        resolve();
                                      }
                                    }
                                  }
                                ]
                              );
                            } catch (alertError) {
                              console.error('Fehler beim Anzeigen des Einstellungsdialogs:', alertError);
                              resolve();
                            }
                          } else {
                            resolve();
                          }
                        } catch (error) {
                          console.error('Fehler bei der Berechtigungsanfrage:', error);
                          try {
                            Alert.alert(
                              'Fehler',
                              'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.',
                              [{ text: 'OK', onPress: () => resolve() }]
                            );
                          } catch (alertError) {
                            console.error('Fehler beim Anzeigen der Fehlermeldung:', alertError);
                            resolve();
                          }
                        }
                      }
                    },
                    { text: 'Später', style: 'cancel', onPress: () => resolve() }
                  ],
                  { cancelable: true, onDismiss: () => resolve() }
                );
              });
            } catch (alertError) {
              console.error('Fehler beim Anzeigen des Berechtigungsdialogs:', alertError);
            }
            return;
          }

          // Wenn wir die Grundberechtigung haben, aber keine Hintergrundberechtigung und Tracking aktiviert werden soll
          if (permissions.basicLocationPermission && !permissions.backgroundLocationPermission && trackingEnabled) {
            console.log('Hintergrundberechtigung fehlt und Tracking aktiviert');
            
            try {
              return new Promise<void>((resolve) => {
                Alert.alert(
                  'Hintergrundberechtigung erforderlich',
                  'Für die automatische Arbeitszeiterfassung benötigt die App Zugriff auf Ihren Standort, auch wenn die App nicht aktiv genutzt wird.',
                  [
                    { 
                      text: 'Berechtigung erteilen', 
                      onPress: async () => {
                        try {
                          // Frage Hintergrundberechtigung an
                          const result = await PermissionsService.checkAndRequestBackgroundLocationPermission();
                          
                          // Prüfe Ergebnis
                          if (!result) {
                            try {
                              Alert.alert(
                                'Berechtigung erforderlich',
                                'Bitte erlauben Sie die Hintergrund-Standortverfolgung in den Einstellungen.',
                                [
                                  { text: 'Später', style: 'cancel', onPress: () => resolve() },
                                  { 
                                    text: 'Zu Einstellungen', 
                                    onPress: () => {
                                      try {
                                        openSettings();
                                        resolve();
                                      } catch (e) {
                                        console.error('Fehler beim Öffnen der Einstellungen:', e);
                                        resolve();
                                      }
                                    }
                                  }
                                ]
                              );
                            } catch (alertError) {
                              console.error('Fehler beim Anzeigen des Einstellungsdialogs:', alertError);
                              resolve();
                            }
                          } else {
                            // Aktualisiere den Berechtigungsstatus im UI
                            setPermissionsStatus(prevState => ({
                              ...prevState,
                              background: true
                            }));
                            resolve();
                          }
                        } catch (error) {
                          console.error('Fehler bei der Hintergrundberechtigungsanfrage:', error);
                          try {
                            Alert.alert(
                              'Fehler',
                              'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.',
                              [{ text: 'OK', onPress: () => resolve() }]
                            );
                          } catch (alertError) {
                            console.error('Fehler beim Anzeigen der Fehlermeldung:', alertError);
                            resolve();
                          }
                        }
                      }
                    },
                    { text: 'Später', style: 'cancel', onPress: () => resolve() }
                  ],
                  { cancelable: true, onDismiss: () => resolve() }
                );
              });
            } catch (alertError) {
              console.error('Fehler beim Anzeigen des Hintergrundberechtigungsdialogs:', alertError);
            }
            return;
          }

          // Wenn alle Berechtigungen erteilt sind und Tracking aktiviert werden soll
          if (permissions.basicLocationPermission && trackingEnabled && workLocation) {
            console.log('Alle Berechtigungen vorhanden, starte Standort-Tracking...');
            
            // Starte das Tracking in einem separaten try-catch
            try {
              const success = await locationTrackingService.current.startLocationTracking(workLocation);
              if (!success) {
                console.error('Fehler beim Starten des Standort-Trackings');
                setTrackingEnabled(false);
                try {
                  Alert.alert(
                    'Fehler',
                    'Das Standort-Tracking konnte nicht gestartet werden. Bitte versuchen Sie es später erneut.'
                  );
                } catch (alertError) {
                  console.error('Fehler beim Anzeigen der Fehlermeldung:', alertError);
                }
              }
            } catch (error) {
              console.error('Fehler beim Starten des Standort-Trackings:', error);
              setTrackingEnabled(false);
              try {
                Alert.alert(
                  'Fehler',
                  'Es ist ein Fehler aufgetreten. Bitte starten Sie die App neu.'
                );
              } catch (alertError) {
                console.error('Fehler beim Anzeigen der Fehlermeldung:', alertError);
              }
            }
          }
        } catch (permissionsError) {
          console.error('Fehler beim Abrufen der Standortberechtigungen:', permissionsError);
          // Setze Standardwerte im Fehlerfall
          setPermissionsStatus({
            basic: false,
            background: false
          });
          if (trackingEnabled) {
            setTrackingEnabled(false);
            try {
              Alert.alert(
                'Fehler bei Standortberechtigungen',
                'Die Standortberechtigungen konnten nicht überprüft werden. Die automatische Arbeitszeiterfassung wurde deaktiviert.'
              );
            } catch (alertError) {
              console.error('Fehler beim Anzeigen der Fehlermeldung:', alertError);
            }
          }
        }
      } catch (error) {
        console.error('Kritischer Fehler bei der Berechtigungsüberprüfung:', error);
        // Setze Standardwerte im Fehlerfall
        setPermissionsStatus({
          basic: false,
          background: false
        });
        setTrackingEnabled(false);
        try {
          Alert.alert(
            'Fehler',
            'Es ist ein Fehler aufgetreten. Bitte starten Sie die App neu.'
          );
        } catch (alertError) {
          console.error('Fehler beim Anzeigen der Fehlermeldung:', alertError);
        }
      } finally {
        setCheckingPermissions(false);
      }
    };

    // Berechtigungen überprüfen, wenn die Komponente geladen wird
    checkPermissions();
  }, [trackingEnabled, workLocation]);

  // Reagiere auf Änderungen des Tracking-Status und des Arbeitsortes
  useEffect(() => {
    console.log('Tracking-Status geändert:', { trackingEnabled, workLocation });
    const updateTrackingStatus = async () => {
      if (trackingEnabled && workLocation && permissionsStatus.basic) {
        console.log('Starte Tracking-Service');
        if (Platform.OS === 'android') {
          // Nutze nativen Service auf Android für Hintergrund-Tracking
          try {
            // Verbesserte Fehlerbehandlung
            console.log('Versuche natives Tracking zu starten mit verbesserter Fehlerbehandlung');
            
            // Extra Timeout für verzögerten Start
            setTimeout(async () => {
              try {
                const trackingService = require('../services/NativeLocationTrackingService').default;
                await trackingService.startTracking().catch((e: Error) => {
                  console.error('Fehler beim Starten des nativen Trackings mit Catch:', e);
                  throw e;
                });
                console.log('Natives Tracking erfolgreich gestartet');
              } catch (innerError) {
                console.error('Fehler beim Starten des nativen Trackings im Timeout:', innerError);
                setTrackingEnabled(false);
                
                Alert.alert(
                  "Eingeschränkter Modus",
                  "Das native Tracking konnte nicht gestartet werden. Die App läuft im eingeschränkten Modus.",
                  [{ text: "OK" }]
                );
              }
            }, 1000);
          } catch (error) {
            console.error('Fehler beim Starten des nativen Trackings:', error);
            setTrackingEnabled(false);
            
            Alert.alert(
              "Fehler",
              "Das Standort-Tracking konnte nicht gestartet werden. Bitte versuchen Sie es später erneut.",
              [{ text: "OK" }]
            );
          }
        } else {
          // Nutze JS-basierten Service für andere Plattformen
          const success = await locationTrackingService.current.startLocationTracking(workLocation);
          if (!success) {
            setTrackingEnabled(false);
            Alert.alert(
              "Fehler beim Starten des Trackings",
              "Das Standort-Tracking konnte nicht gestartet werden. Bitte überprüfen Sie Ihre Berechtigungen.",
              [{ text: "OK" }]
            );
          }
        }
      } else if (!trackingEnabled) {
        console.log('Stoppe Tracking-Service');
        // Stoppe Tracking-Service
        if (Platform.OS === 'android') {
          try {
            console.log('Versuche natives Tracking zu stoppen');
            const trackingService = require('../services/NativeLocationTrackingService').default;
            await trackingService.stopTracking().catch((e: Error) => {
              console.error('Fehler beim Stoppen des nativen Trackings mit Catch:', e);
            });
            console.log('Natives Tracking erfolgreich gestoppt');
          } catch (error) {
            console.error('Fehler beim Stoppen des nativen Trackings:', error);
          }
        }
        await locationTrackingService.current.stopLocationTracking();
      }
    };

    updateTrackingStatus();
  }, [trackingEnabled, workLocation, permissionsStatus.basic]);

  // Handler für das Ein- und Ausschalten des Trackings
  const handleTrackingToggle = async (value: boolean) => {
    // Funktion deaktiviert, solange Feature nicht verfügbar
    return;
    /*
    console.log('Tracking-Toggle:', value);
    if (value) {
      if (!workLocation) {
        Alert.alert(
          'Arbeitsort fehlt',
          'Bitte legen Sie zuerst einen Arbeitsort fest, um das automatische Tracking zu verwenden.'
        );
        return;
      }
      
      try {
        setCheckingPermissions(true);
        
        // Nutze die sichere Berechtigungsabfrage
        const permissions = await PermissionsService.safeRequestLocationPermissions();
        console.log('Berechtigungen nach sicherer Anfrage:', permissions);
        
        // Aktualisiere den Status im UI
        setPermissionsStatus({
          basic: permissions.basicLocationPermission,
          background: permissions.backgroundLocationPermission
        });
        
        // Wenn wir die grundlegende Berechtigung haben, aktiviere Tracking
        if (permissions.basicLocationPermission) {
          setTrackingEnabled(true);
        } else {
          // Wenn nicht, zeige eine Meldung
          Alert.alert(
            'Berechtigung erforderlich',
            'Die Standortberechtigung ist erforderlich, um die automatische Arbeitszeiterfassung zu nutzen.'
          );
        }
      } catch (error) {
        console.error('Fehler bei der sicheren Berechtigungsanfrage:', error);
        Alert.alert(
          'Fehler',
          'Bei der Überprüfung der Berechtigungen ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.'
        );
      } finally {
        setCheckingPermissions(false);
      }
    } else {
      // Tracking deaktivieren
      setTrackingEnabled(false);
    }
    */
  };

  // Funktion zum Formatieren des Datums
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Berechnung der Arbeitszeit in Stunden
  const calculateWorkHours = (workTime: WorkTime): string => {
    if (!workTime.endTime) return "Aktiv";

    const start = new Date(workTime.startTime).getTime();
    const end = new Date(workTime.endTime).getTime();
    const diffMs = end - start;
    const diffMinutes = diffMs / 1000 / 60;
    
    // Ziehe die Pausenzeit ab
    const workMinutes = diffMinutes - workTime.breakDuration;
    
    // Formatiere in Stunden und Minuten
    const hours = Math.floor(workMinutes / 60);
    const minutes = Math.floor(workMinutes % 60);
    
    return `${hours}h ${minutes}m`;
  };

  // Arbeitsort löschen
  const handleDeleteLocation = () => {
    Alert.alert(
      "Arbeitsort löschen",
      "Sind Sie sicher, dass Sie Ihren Arbeitsort löschen möchten? Das Tracking wird deaktiviert.",
      [
        { text: "Abbrechen", style: "cancel" },
        { 
          text: "Löschen", 
          style: "destructive", 
          onPress: () => {
            // Tracking deaktivieren
            setTrackingEnabled(false);
            // Arbeitsort löschen
            deleteWorkLocation();
          }
        }
      ]
    );
  };

  // Arbeitszeit starten
  const handleStartWorkTime = () => {
    // Funktion deaktiviert, solange Feature nicht verfügbar
    return;
    /*
    if (!workLocation) {
      Alert.alert(
        "Kein Arbeitsort vorhanden",
        "Bitte legen Sie zuerst einen Arbeitsort fest.",
        [{ text: "OK" }]
      );
      return;
    }
    startWorkTime();
    */
  };

  // Pausenzeit-Option auswählen
  const handleSelectBreakOption = async (option: 'none' | '30min' | '60min' | 'custom') => {
    setSelectedBreakOption(option);
    
    let duration = 0;
    if (option === 'none') {
      duration = 0;
      setSelectedBreakDuration(duration);
      setCustomBreakDuration('');
    } else if (option === '30min') {
      duration = 30;
      setSelectedBreakDuration(duration);
      setCustomBreakDuration('30');
    } else if (option === '60min') {
      duration = 60;
      setSelectedBreakDuration(duration);
      setCustomBreakDuration('60');
    } else if (option === 'custom' && customBreakDuration !== '') {
      duration = parseInt(customBreakDuration, 10);
      setSelectedBreakDuration(duration);
    }
    
    // Speichere die Einstellungen
    try {
      await AsyncStorage.setItem('selectedBreakOption', option);
      await AsyncStorage.setItem('selectedBreakDuration', duration.toString());
    } catch (error) {
      console.error('Fehler beim Speichern der Pausenzeit-Einstellungen:', error);
    }
  };

  // Aktualisiere die ausgewählte Pausenzeit basierend auf der benutzerdefinierten Eingabe
  const handleCustomBreakDurationChange = async (value: string) => {
    // Nur Zahlen zulassen
    const numericValue = value.replace(/[^0-9]/g, '');
    setCustomBreakDuration(numericValue);
    
    if (numericValue === '') {
      setSelectedBreakDuration(0);
    } else {
      const minutes = parseInt(numericValue, 10);
      setSelectedBreakDuration(minutes);
      
      // Speichere die benutzerdefinierte Pausenzeit
      try {
        await AsyncStorage.setItem('selectedBreakDuration', minutes.toString());
      } catch (error) {
        console.error('Fehler beim Speichern der benutzerdefinierten Pausenzeit:', error);
      }
    }
  };

  // Arbeitszeit beenden
  const handleEndWorkTime = () => {
    if (activeWorkTime) {
      if (selectedBreakOption === 'custom' && customBreakDuration === '') {
        Alert.alert(
          "Pausenzeit fehlt",
          "Bitte geben Sie eine Pausenzeit ein oder wählen Sie 'Keine Pause'.",
          [{ text: "OK" }]
        );
        return;
      }
      
      // Stelle sicher, dass eine Pausenzeit gesetzt ist
      let finalBreakDuration = selectedBreakDuration;
      
      endWorkTime(finalBreakDuration);
      setSelectedBreakOption('none');
      setSelectedBreakDuration(0);
      setCustomBreakDuration('');
    }
  };

  // Arbeitszeit löschen
  const handleDeleteWorkTime = (id: string) => {
    Alert.alert(
      "Arbeitszeit löschen",
      "Sind Sie sicher, dass Sie diese Arbeitszeit löschen möchten?",
      [
        { text: "Abbrechen", style: "cancel" },
        { text: "Löschen", style: "destructive", onPress: () => deleteWorkTime(id) }
      ]
    );
  };

  // Render-Funktionen für die Statusanzeige
  const renderLocationStatusIcon = () => {
    switch (locationStatus) {
      case 'checking':
        return <ActivityIndicator size="small" color="#32b8ca" />;
      case 'inside':
        return <Icon name="checkmark-circle" size={24} color="#4CAF50" />;
      case 'outside':
        return <Icon name="alert-circle" size={24} color="#FFC107" />;
      case 'error':
        return <Icon name="close-circle" size={24} color="#F44336" />;
    }
  };

  const getLocationStatusText = () => {
    switch (locationStatus) {
      case 'checking':
        return "Überprüfe Standort...";
      case 'inside':
        return "Sie befinden sich am Arbeitsort";
      case 'outside':
        return "Sie befinden sich außerhalb des Arbeitsortes";
      case 'error':
        return "Fehler bei der Standortermittlung";
    }
  };

  const getLastCheckTimeText = () => {
    if (!lastLocationCheck) return "";
    
    return `Letzte Überprüfung: ${lastLocationCheck.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })} Uhr`;
  };

  // Öffnet die App-Einstellungen
  const openAppSettings = () => {
    openSettings();
    
    // Nach kurzer Verzögerung Hinweis anzeigen
    setTimeout(() => {
      Alert.alert(
        'Standortberechtigung einrichten',
        'Bitte wählen Sie:\n\n1. Berechtigungen\n2. Standort\n3. "Während der Nutzung und im Hintergrund" oder "Immer zulassen"',
        [{ text: 'OK' }]
      );
    }, 1000);
  };

  // Rendere Warnung für fehlende Berechtigungen
  const renderPermissionWarning = () => {
    if (!permissionsStatus.basic || !permissionsStatus.background) {
      return (
        <TouchableOpacity 
          style={[localStyles.permissionWarning, { backgroundColor: '#FFF3CD', borderColor: '#FFECB5' }]}
          onPress={openAppSettings}
        >
          <Icon name="alert-circle" size={20} color="#856404" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#856404', fontWeight: 'bold', marginBottom: 2 }}>
              Berechtigungen fehlen
            </Text>
            <Text style={{ color: '#856404', fontSize: 12 }}>
              Für die automatische Arbeitszeiterfassung benötigt die App Standortzugriff, auch wenn sie im Hintergrund läuft.
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#856404" />
        </TouchableOpacity>
      );
    }
    return null;
  };

  // Reverse Geocoding - umwandeln von Koordinaten in Adresse
  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCUHxcN5GINYKlQu43YXucFlhf_PDixp7A`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        // Finde die am besten passende Adresse
        const result = data.results[0];
        let address = '';
        
        // Versuche, eine strukturierte Adresse zu erstellen
        const streetNumber = result.address_components.find((comp: any) => comp.types.includes('street_number'))?.short_name;
        const street = result.address_components.find((comp: any) => comp.types.includes('route'))?.long_name;
        const locality = result.address_components.find((comp: any) => comp.types.includes('locality'))?.long_name;
        const postalCode = result.address_components.find((comp: any) => comp.types.includes('postal_code'))?.short_name;
        
        if (street) {
          address = street;
          if (streetNumber) address = `${address} ${streetNumber}`;
        }
        
        if (locality) {
          if (address) address = `${address}, ${locality}`;
          else address = locality;
          
          if (postalCode) address = `${address} (${postalCode})`;
        }
        
        // Fallback auf formatierte Adresse von Google
        if (!address) {
          address = result.formatted_address || 'Unbekannte Adresse';
        }
        
        setLastLocationAddress(address);
        return address;
      } else {
        console.error('Fehler beim Geocoding:', data.status);
        setLastLocationAddress('Adresse konnte nicht ermittelt werden');
        return null;
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Adresse:', error);
      setLastLocationAddress('Fehler bei der Adressermittlung');
      return null;
    }
  };

  // Event-Listener für native Tracking-Ereignisse
  useEffect(() => {
    console.log('Registriere Event-Listener für Standort-Updates');
    
    try {
      const locationStatusSubscription = serviceEventEmitter.on(
        'location_status_changed',
        (event) => {
          try {
            if (!event) {
              console.warn('Leeres location_status_changed Event erhalten');
              return;
            }
            
            const isAtWorkLocation = event.isAtWorkLocation || event.status === 'at_work_location';
            setLocationStatus(isAtWorkLocation ? 'inside' : 'outside');
            setLastLocationCheck(new Date());
            
            if (event.latitude && event.longitude) {
              const coords = {
                latitude: event.latitude,
                longitude: event.longitude
              };
              setLastLocation(coords);
              
              // Verzögerte Verarbeitung der Adressdaten
              setTimeout(() => {
                getAddressFromCoordinates(coords.latitude, coords.longitude)
                  .catch(error => {
                    console.error('Fehler bei Adressumwandlung:', error);
                  });
              }, 500);
            }
          } catch (eventError) {
            console.error('Fehler bei der Verarbeitung des location_status_changed Events:', eventError);
          }
        }
      );
      
      return () => {
        try {
          serviceEventEmitter.removeListener('location_status_changed', locationStatusSubscription);
          console.log('Event-Listener für Standort-Updates entfernt');
        } catch (cleanupError) {
          console.error('Fehler beim Entfernen des Event-Listeners:', cleanupError);
        }
      };
    } catch (setupError) {
      console.error('Fehler beim Einrichten des Event-Listeners:', setupError);
      return () => {
        // Nichts zu bereinigen
      };
    }
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={{ flex: 1 }}>
        {/* Hinweis auf kommende Verbesserungen */}
        <View style={{ alignItems: 'center', marginTop: 32, marginBottom: 16 }}>
          <Icon name="construct-outline" size={70} color={theme === 'dark' ? '#32b8ca' : '#32b8ca'} style={{ marginBottom: 16 }} />
          <Text style={[styles.headerTitle, { marginBottom: 8 }]}>Neue Arbeitszeiterfassung in Arbeit</Text>
          <View style={[styles.card, { width: '90%' }]}> 
            <Text style={styles.itemTitle}>Was Sie erwarten können:</Text>
            <View style={{ marginTop: 8 }}>
              <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                <Icon name="checkmark-circle" size={22} color={theme === 'dark' ? '#32b8ca' : '#32b8ca'} style={{ marginRight: 8 }} />
                <Text style={styles.itemSubtitle}>Intuitivere Zeiterfassung</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                <Icon name="checkmark-circle" size={22} color={theme === 'dark' ? '#32b8ca' : '#32b8ca'} style={{ marginRight: 8 }} />
                <Text style={styles.itemSubtitle}>Bessere Übersicht über Arbeitszeiten</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                <Icon name="checkmark-circle" size={22} color={theme === 'dark' ? '#32b8ca' : '#32b8ca'} style={{ marginRight: 8 }} />
                <Text style={styles.itemSubtitle}>Erweiterte Auswertungen</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Icon name="checkmark-circle" size={22} color={theme === 'dark' ? '#32b8ca' : '#32b8ca'} style={{ marginRight: 8 }} />
                <Text style={styles.itemSubtitle}>Export- und Berichtsfunktionen</Text>
              </View>
            </View>
          </View>
          <Text style={[styles.errorText, { color: theme === 'dark' ? '#bbbbbb' : '#666666', marginTop: 24 }]}>Wir arbeiten intensiv an der Verbesserung dieser Funktion. Vielen Dank für Ihre Geduld!</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const localStyles = StyleSheet.create({
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  locationButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  addButton: {
    backgroundColor: '#32b8ca',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#32b8ca',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  breakOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  breakOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  selectedBreakOption: {
    backgroundColor: '#32b8ca',
    borderColor: '#32b8ca',
  },
  breakOptionText: {
    fontWeight: '500',
  },
  selectedBreakOptionText: {
    color: '#ffffff',
  },
  customBreakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  customBreakInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
  },
  customBreakUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  actionSection: {
    padding: 16,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#32b8ca',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  workTimeItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  workTimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  workTimeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  workTimeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  workTimeDetailText: {
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  statusIconContainer: {
    marginRight: 12,
    width: 30,
    alignItems: 'center',
  },
  statusTextContainer: {
    flex: 1,
  },
  activeTrackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 8,
  },
  permissionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFECB5',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  keepAwakeWarning: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10
  },
});

export default WorkTimeTrackerScreen; 