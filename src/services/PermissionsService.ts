/**
 * PermissionsService.ts
 * Verwaltet die Standort- und andere Berechtigungen in der App
 */

import { Platform, Alert, Linking, NativeModules, PermissionsAndroid } from 'react-native';
import { 
  PERMISSIONS, 
  RESULTS, 
  request, 
  check, 
  openSettings,
  requestMultiple,
  Permission,
  PermissionStatus
} from 'react-native-permissions';

// Definieren der Berechtigungstypen je nach Plattform
const LOCATION_PERMISSIONS = Platform.select({
  android: [
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
  ],
  ios: [PERMISSIONS.IOS.LOCATION_WHEN_IN_USE],
  default: [],
}) as Permission[];

const BACKGROUND_LOCATION_PERMISSION = Platform.select({
  android: PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
  ios: PERMISSIONS.IOS.LOCATION_ALWAYS,
  default: null,
}) as Permission | null;

class PermissionsService {
  private static instance: PermissionsService;
  private isRequesting = false;

  private constructor() {}

  public static getInstance(): PermissionsService {
    try {
      if (!PermissionsService.instance) {
        PermissionsService.instance = new PermissionsService();
      }
      return PermissionsService.instance;
    } catch (error) {
      console.error('Kritischer Fehler bei PermissionsService.getInstance:', error);
      
      // Fehlgeschlagen - wir erstellen eine Mock-Implementierung
      console.warn('Verwende Fallback-Mock im getInstance für PermissionsService');
      
      // Definiere eine Schnittstelle für die öffentlichen Methoden
      type PermissionsServicePublicAPI = {
        checkAndRequestLocationPermissions: () => Promise<boolean>;
        checkAndRequestBackgroundLocationPermission: () => Promise<boolean>;
        showBackgroundPermissionDialog: () => void;
        showPermissionBlockedDialog: () => void;
        checkAllLocationPermissions: () => Promise<{
          basicLocationPermission: boolean;
          backgroundLocationPermission: boolean;
        }>;
      };
      
      // Erstelle ein Mock-Objekt mit den öffentlichen Methoden
      const mockService: PermissionsServicePublicAPI = {
        checkAndRequestLocationPermissions: async () => false,
        checkAndRequestBackgroundLocationPermission: async () => false,
        showBackgroundPermissionDialog: () => {},
        showPermissionBlockedDialog: () => {},
        checkAllLocationPermissions: async () => ({
          basicLocationPermission: false,
          backgroundLocationPermission: false
        })
      };
      
      // Setze die Singleton-Instanz auf unser Mock-Objekt
      // @ts-ignore - Wir ignorieren den TypeScript-Fehler, da wir wissen, dass wir nur die öffentlichen Methoden benötigen
      PermissionsService.instance = mockService;
      return PermissionsService.instance;
    }
  }

  public async checkAndRequestLocationPermissions(): Promise<boolean> {
    // Sicherheitsprüfung für Plattformerkennung
    if (typeof Platform === 'undefined' || typeof Platform.OS === 'undefined') {
      console.error('Platform ist undefiniert, Standardwert zurückgeben');
      return false;
    }

    // Lokale Kopie des isRequesting Flags erstellen
    let localIsRequesting = false;

    try {
      // Atomare Prüfung und Setzen des Flags
      if (this.isRequesting) {
        console.log('Berechtigungsanfrage läuft bereits, überspringe...');
        return false;
      }
      this.isRequesting = true;
      localIsRequesting = true;
      
      console.log('Prüfe Standortberechtigungen...');

      if (Platform.OS === 'android') {
        try {
          // Sicherheitsprüfung PermissionsAndroid
          if (!PermissionsAndroid) {
            console.error('PermissionsAndroid ist nicht verfügbar');
            return false;
          }

          // Prüfe zuerst, ob die Berechtigung bereits erteilt ist
          let hasPermission = false;
          try {
            hasPermission = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
          } catch (checkError) {
            console.error('Fehler beim Prüfen der Standortberechtigung:', checkError);
            hasPermission = false;
          }

          if (hasPermission) {
            console.log('Standortberechtigung bereits erteilt');
            return true;
          }

          // Wenn nicht erteilt, frage an
          let granted = PermissionsAndroid.RESULTS.DENIED;
          try {
            granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              {
                title: 'Standortberechtigung',
                message: 'Die App benötigt Zugriff auf Ihren Standort für die Arbeitszeiterfassung.',
                buttonNeutral: 'Später fragen',
                buttonNegative: 'Abbrechen',
                buttonPositive: 'OK',
              }
            );
          } catch (requestError) {
            console.error('Fehler bei der Berechtigungsanfrage:', requestError);
            granted = PermissionsAndroid.RESULTS.DENIED;
          }

          console.log('Standortberechtigung Ergebnis:', granted);
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (error) {
          console.error('Fehler bei Android-Berechtigungsanfrage:', error);
          // Keine Exception weitergeben, sondern nur false zurückgeben
          return false;
        }
      } else {
        // iOS
        try {
          // Sicherheitsprüfung für react-native-permissions
          if (!PERMISSIONS || !PERMISSIONS.IOS || !RESULTS || !check || !request) {
            console.error('react-native-permissions Module nicht vollständig verfügbar');
            return false;
          }

          const permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
          let status: PermissionStatus = RESULTS.DENIED;
          
          try {
            status = await check(permission);
          } catch (checkError) {
            console.error('Fehler beim Prüfen der iOS-Berechtigung:', checkError);
            status = RESULTS.DENIED;
          }
          
          if (status === RESULTS.GRANTED) {
            console.log('Standortberechtigung bereits erteilt');
            return true;
          }

          let result: PermissionStatus = RESULTS.DENIED;
          try {
            result = await request(permission);
          } catch (requestError) {
            console.error('Fehler bei der iOS-Berechtigungsanfrage:', requestError);
            result = RESULTS.DENIED;
          }
          
          console.log('Standortberechtigung Ergebnis:', result);
          return result === RESULTS.GRANTED;
        } catch (error) {
          console.error('Fehler bei iOS-Berechtigungsanfrage:', error);
          // Keine Exception weitergeben, sondern nur false zurückgeben
          return false;
        }
      }
    } catch (error) {
      console.error('Kritischer Fehler bei der Standortberechtigungsanfrage:', error);
      return false;
    } finally {
      // Nur zurücksetzen, wenn wir es gesetzt haben
      if (localIsRequesting) {
        this.isRequesting = false;
      }
    }
  }

  public async checkAndRequestBackgroundLocationPermission(): Promise<boolean> {
    // Sicherheitsprüfung für Plattformerkennung
    if (typeof Platform === 'undefined' || typeof Platform.OS === 'undefined') {
      console.error('Platform ist undefiniert, Standardwert zurückgeben');
      return false;
    }

    // Lokale Kopie des isRequesting Flags erstellen
    let localIsRequesting = false;

    try {
      // Atomare Prüfung und Setzen des Flags
      if (this.isRequesting) {
        console.log('Berechtigungsanfrage läuft bereits, überspringe...');
        return false;
      }
      this.isRequesting = true;
      localIsRequesting = true;
      
      console.log('Prüfe Hintergrund-Standortberechtigung...');

      if (Platform.OS === 'android') {
        try {
          // Sicherheitsprüfung PermissionsAndroid
          if (!PermissionsAndroid) {
            console.error('PermissionsAndroid ist nicht verfügbar');
            return false;
          }

          // Prüfe zuerst, ob die normale Berechtigung erteilt ist
          let hasBasicPermission = false;
          try {
            hasBasicPermission = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
          } catch (checkError) {
            console.error('Fehler beim Prüfen der grundlegenden Standortberechtigung:', checkError);
            hasBasicPermission = false;
          }

          if (!hasBasicPermission) {
            console.log('Grundlegende Standortberechtigung fehlt, kann Hintergrundberechtigung nicht anfordern');
            return false;
          }

          // Prüfe dann, ob die Hintergrundberechtigung bereits erteilt ist
          let hasPermission = false;
          try {
            hasPermission = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
            );
          } catch (checkError) {
            console.error('Fehler beim Prüfen der Hintergrundberechtigung:', checkError);
            hasPermission = false;
          }

          if (hasPermission) {
            console.log('Hintergrund-Standortberechtigung bereits erteilt');
            return true;
          }

          // Wenn nicht erteilt, frage an
          let granted = PermissionsAndroid.RESULTS.DENIED;
          try {
            granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
              {
                title: 'Hintergrund-Standortberechtigung',
                message: 'Die App benötigt Zugriff auf Ihren Standort im Hintergrund für die automatische Arbeitszeiterfassung.',
                buttonNeutral: 'Später fragen',
                buttonNegative: 'Abbrechen',
                buttonPositive: 'OK',
              }
            );
          } catch (requestError) {
            console.error('Fehler bei der Hintergrundberechtigungsanfrage:', requestError);
            granted = PermissionsAndroid.RESULTS.DENIED;
          }

          console.log('Hintergrund-Standortberechtigung Ergebnis:', granted);
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (error) {
          console.error('Fehler bei Android-Hintergrundberechtigungsanfrage:', error);
          // Keine Exception weitergeben, sondern nur false zurückgeben
          return false;
        }
      } else {
        // iOS
        try {
          // Sicherheitsprüfung für react-native-permissions
          if (!PERMISSIONS || !PERMISSIONS.IOS || !RESULTS || !check || !request) {
            console.error('react-native-permissions Module nicht vollständig verfügbar');
            return false;
          }

          // Auf iOS muss zuerst die normale Berechtigung vorhanden sein
          let basicPermissionStatus: PermissionStatus = RESULTS.DENIED;
          try {
            basicPermissionStatus = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
          } catch (checkError) {
            console.error('Fehler beim Prüfen der iOS-Grundberechtigung:', checkError);
            basicPermissionStatus = RESULTS.DENIED;
          }
          
          if (basicPermissionStatus !== RESULTS.GRANTED) {
            console.log('Grundlegende Standortberechtigung fehlt, kann Hintergrundberechtigung nicht anfordern');
            return false;
          }

          // Prüfe, ob die Hintergrundberechtigung bereits erteilt ist
          let backgroundStatus: PermissionStatus = RESULTS.DENIED;
          try {
            backgroundStatus = await check(PERMISSIONS.IOS.LOCATION_ALWAYS);
          } catch (checkError) {
            console.error('Fehler beim Prüfen der iOS-Hintergrundberechtigung:', checkError);
            backgroundStatus = RESULTS.DENIED;
          }
          
          if (backgroundStatus === RESULTS.GRANTED) {
            console.log('Hintergrund-Standortberechtigung bereits erteilt');
            return true;
          }

          // Wenn nicht erteilt, frage an
          let result: PermissionStatus = RESULTS.DENIED;
          try {
            result = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
          } catch (requestError) {
            console.error('Fehler bei der iOS-Hintergrundberechtigungsanfrage:', requestError);
            result = RESULTS.DENIED;
          }
          
          console.log('Hintergrund-Standortberechtigung Ergebnis:', result);
          return result === RESULTS.GRANTED;
        } catch (error) {
          console.error('Fehler bei iOS-Hintergrundberechtigungsanfrage:', error);
          // Keine Exception weitergeben, sondern nur false zurückgeben
          return false;
        }
      }
    } catch (error) {
      console.error('Kritischer Fehler bei der Hintergrundstandortberechtigungsanfrage:', error);
      return false;
    } finally {
      // Nur zurücksetzen, wenn wir es gesetzt haben
      if (localIsRequesting) {
        this.isRequesting = false;
      }
    }
  }

  /**
   * Dialog anzeigen, um den Nutzer über die Notwendigkeit der Hintergrundberechtigung zu informieren
   */
  public showBackgroundPermissionDialog = (): void => {
    try {
      Alert.alert(
        'Hintergrund-Standortverfolgung',
        'Für die automatische Arbeitszeiterfassung benötigt die App Zugriff auf Ihren Standort, auch wenn die App nicht aktiv genutzt wird. Bitte aktivieren Sie "Immer erlauben" in den Einstellungen.',
        [
          { text: 'Später', style: 'cancel' },
          { 
            text: 'Zu Einstellungen', 
            onPress: () => {
              try {
                openSettings();
              } catch (error) {
                console.error('Fehler beim Öffnen der Einstellungen:', error);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Fehler beim Anzeigen des Dialogs:', error);
    }
  };

  /**
   * Dialog anzeigen, wenn die Berechtigung blockiert wurde
   */
  public showPermissionBlockedDialog = (): void => {
    try {
      Alert.alert(
        'Berechtigung erforderlich',
        'Die Standortberechtigung wurde abgelehnt. Bitte aktivieren Sie die Standortverfolgung in den App-Einstellungen, um die automatische Arbeitszeiterfassung nutzen zu können.',
        [
          { text: 'Abbrechen', style: 'cancel' },
          { 
            text: 'Einstellungen öffnen', 
            onPress: () => {
              try {
                openSettings();
              } catch (error) {
                console.error('Fehler beim Öffnen der Einstellungen:', error);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Fehler beim Anzeigen des Dialogs:', error);
    }
  };

  /**
   * Überprüfen aller Berechtigungen, die für die Arbeitszeiterfassung benötigt werden
   */
  public async checkAllLocationPermissions(): Promise<{
    basicLocationPermission: boolean;
    backgroundLocationPermission: boolean;
  }> {
    // Standardwerte
    let result = {
      basicLocationPermission: false,
      backgroundLocationPermission: false
    };

    try {
      console.log('Überprüfe alle Standortberechtigungen...');

      // Sicherheitsprüfung für Plattformerkennung
      if (typeof Platform === 'undefined' || typeof Platform.OS === 'undefined') {
        console.error('Platform ist undefiniert, Standardwert zurückgeben');
        return result;
      }

      if (Platform.OS === 'android') {
        try {
          // Sicherheitsprüfung PermissionsAndroid
          if (!PermissionsAndroid) {
            console.error('PermissionsAndroid ist nicht verfügbar');
            return result;
          }

          // Prüfe grundlegende Berechtigung
          let basicPermission = false;
          try {
            basicPermission = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
          } catch (checkError) {
            console.error('Fehler beim Prüfen der Standortberechtigung:', checkError);
            basicPermission = false;
          }

          // Hintergrundberechtigung nur prüfen, wenn grundlegende Berechtigung vorhanden
          let backgroundPermission = false;
          if (basicPermission) {
            try {
              backgroundPermission = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
              );
            } catch (checkError) {
              console.error('Fehler beim Prüfen der Hintergrundberechtigung:', checkError);
              backgroundPermission = false;
            }
          }

          result = {
            basicLocationPermission: basicPermission,
            backgroundLocationPermission: backgroundPermission
          };
        } catch (error) {
          console.error('Fehler bei Android-Berechtigungsprüfung:', error);
        }
      } else if (Platform.OS === 'ios') {
        try {
          // Sicherheitsprüfung für react-native-permissions
          if (!PERMISSIONS || !PERMISSIONS.IOS || !RESULTS || !check) {
            console.error('react-native-permissions Module nicht vollständig verfügbar');
            return result;
          }

          // Prüfe grundlegende Berechtigung
          let basicStatus: PermissionStatus = RESULTS.DENIED;
          try {
            basicStatus = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
          } catch (checkError) {
            console.error('Fehler beim Prüfen der iOS-Grundberechtigung:', checkError);
            basicStatus = RESULTS.DENIED;
          }

          // Hintergrundberechtigung nur prüfen, wenn grundlegende Berechtigung vorhanden
          let backgroundStatus: PermissionStatus = RESULTS.DENIED;
          if (basicStatus === RESULTS.GRANTED) {
            try {
              backgroundStatus = await check(PERMISSIONS.IOS.LOCATION_ALWAYS);
            } catch (checkError) {
              console.error('Fehler beim Prüfen der iOS-Hintergrundberechtigung:', checkError);
              backgroundStatus = RESULTS.DENIED;
            }
          }

          result = {
            basicLocationPermission: basicStatus === RESULTS.GRANTED,
            backgroundLocationPermission: backgroundStatus === RESULTS.GRANTED
          };
        } catch (error) {
          console.error('Fehler bei iOS-Berechtigungsprüfung:', error);
        }
      }

      console.log('Berechtigungsstatus:', result);
      return result;
    } catch (error) {
      console.error('Kritischer Fehler bei der Berechtigungsprüfung:', error);
      return result;
    }
  }

  /**
   * Führt einen sicheren, schrittweisen Prozess zur Berechtigungsanfrage durch.
   * Diese Methode sollte bevorzugt verwendet werden, um Abstürze zu vermeiden.
   */
  public async safeRequestLocationPermissions(): Promise<{
    basicLocationPermission: boolean;
    backgroundLocationPermission: boolean;
  }> {
    console.log('Starte sicheren Berechtigungsprozess...');
    
    // 1. Prüfe aktuelle Berechtigungen
    const currentPermissions = await this.checkAllLocationPermissions();
    
    // 2. Wenn bereits alles erteilt, nichts weiter tun
    if (currentPermissions.basicLocationPermission && 
        currentPermissions.backgroundLocationPermission) {
      console.log('Alle Berechtigungen bereits erteilt');
      return currentPermissions;
    }
    
    // 3. Wenn keine grundlegende Berechtigung, diese zuerst anfordern
    let basicPermission = currentPermissions.basicLocationPermission;
    if (!basicPermission) {
      console.log('Fordere grundlegende Standortberechtigung an');
      try {
        // Warte kurz, um UI-Updates zu erlauben
        await new Promise<void>(resolve => setTimeout(resolve, 500));
        basicPermission = await this.checkAndRequestLocationPermissions();
      } catch (error) {
        console.error('Fehler bei der Anfrage der grundlegenden Berechtigung:', error);
        basicPermission = false;
      }
    }
    
    // 4. Wenn grundlegende Berechtigung erteilt, Hintergrundberechtigung anfordern
    let backgroundPermission = currentPermissions.backgroundLocationPermission;
    if (basicPermission && !backgroundPermission) {
      console.log('Fordere Hintergrund-Standortberechtigung an');
      try {
        // Warte kurz, um UI-Updates zu erlauben
        await new Promise<void>(resolve => setTimeout(resolve, 500));
        backgroundPermission = await this.checkAndRequestBackgroundLocationPermission();
      } catch (error) {
        console.error('Fehler bei der Anfrage der Hintergrundberechtigung:', error);
        backgroundPermission = false;
      }
    }
    
    // 5. Ergebnis zurückgeben
    const result = {
      basicLocationPermission: basicPermission,
      backgroundLocationPermission: backgroundPermission
    };
    
    console.log('Sicherer Berechtigungsprozess abgeschlossen:', result);
    return result;
  }
}

// Exportiere die Singleton-Instanz
let permissionsService: PermissionsService;
try {
  permissionsService = PermissionsService.getInstance();
} catch (error) {
  console.error('Fehler beim Erstellen der PermissionsService-Instanz:', error);
  
  // Fehlgeschlagen - wir erstellen eine Mock-Implementierung
  console.warn('Verwende Fallback-Mock für PermissionsService');
  
  // Definiere eine Schnittstelle für die öffentlichen Methoden
  type PermissionsServicePublicAPI = {
    checkAndRequestLocationPermissions: () => Promise<boolean>;
    checkAndRequestBackgroundLocationPermission: () => Promise<boolean>;
    showBackgroundPermissionDialog: () => void;
    showPermissionBlockedDialog: () => void;
    checkAllLocationPermissions: () => Promise<{
      basicLocationPermission: boolean;
      backgroundLocationPermission: boolean;
    }>;
  };
  
  // Erstelle ein Mock-Objekt mit den öffentlichen Methoden
  const mockService: PermissionsServicePublicAPI = {
    checkAndRequestLocationPermissions: async () => false,
    checkAndRequestBackgroundLocationPermission: async () => false,
    showBackgroundPermissionDialog: () => {},
    showPermissionBlockedDialog: () => {},
    checkAllLocationPermissions: async () => ({
      basicLocationPermission: false,
      backgroundLocationPermission: false
    })
  };
  
  // Setze die Singleton-Instanz auf unser Mock-Objekt
  // @ts-ignore - Wir ignorieren den TypeScript-Fehler, da wir wissen, dass wir nur die öffentlichen Methoden benötigen
  permissionsService = mockService;
}

export default permissionsService; 