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
  PermissionStatus,
} from 'react-native-permissions';

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
        showPermissionBlockedDialog: () => void;
      };

      // Erstelle ein Mock-Objekt mit den öffentlichen Methoden
      const mockService: PermissionsServicePublicAPI = {
        showPermissionBlockedDialog: () => {},
      };

      // Setze die Singleton-Instanz auf unser Mock-Objekt
      // @ts-ignore - Wir ignorieren den TypeScript-Fehler, da wir wissen, dass wir nur die öffentlichen Methoden benötigen
      PermissionsService.instance = mockService;
      return PermissionsService.instance;
    }
  }

  public showPermissionBlockedDialog = (): void => {
    Alert.alert(
      'Berechtigung blockiert',
      'Die erforderliche Berechtigung wurde dauerhaft blockiert. Bitte aktivieren Sie sie in den App-Einstellungen.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Einstellungen öffnen',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  };
}

export default PermissionsService;
