/**
 * LocationTrackingService.ts
 * Service für kontinuierliches Standort-Tracking
 */

import { AppState, Platform, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Typen importieren
import { WorkLocation } from '../types/types';
import NotificationService from './NotificationService';
import permissionsService from './PermissionsService';

// Schnittstelle für Callback-Funktionen
type LocationCallback = ((status: 'inside' | 'outside' | 'error', coordinates?: {latitude: number, longitude: number}) => void) | null;
type StatusChangeCallback = ((isTracking: boolean) => void) | null;

class LocationTrackingService {
  private static instance: LocationTrackingService;
  private locationCallback: LocationCallback = null;
  private statusChangeCallback: StatusChangeCallback = null;
  private workLocation: WorkLocation | null = null;
  private trackingEnabled = false;
  private checkInterval = 60000; // 1 Minute
  private lastCheckTime: Date | null = null;
  private appStateListener: any = null;
  private trackingIntervalId: NodeJS.Timeout | null = null;
  private notificationService: NotificationService;
  private readonly LOCATION_BUFFER = 50; // Increased to 50 meters buffer
  private readonly MIN_ACCURACY = 100; // Minimum required accuracy in meters
  private lastInsideStatus: boolean | null = null;
  private readonly GRACE_PERIOD = 5; // 5 minutes grace period

  private constructor() {
    // Singleton-Pattern
    this.setupAppStateListener();
    this.notificationService = NotificationService.getInstance();
  }

  /**
   * Gibt die Singleton-Instanz des Services zurück
   */
  public static getInstance(): LocationTrackingService {
    if (!LocationTrackingService.instance) {
      LocationTrackingService.instance = new LocationTrackingService();
    }
    return LocationTrackingService.instance;
  }

  /**
   * Überwacht den App-Status (Vordergrund/Hintergrund)
   */
  private setupAppStateListener(): void {
    this.appStateListener = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && this.trackingEnabled) {
        // App ist im Vordergrund, Standort sofort prüfen
        this.checkLocation();
      }
    });
  }

  /**
   * Speichert die aktuellen Tracking-Informationen im AsyncStorage
   */
  private async saveTrackingState(): Promise<void> {
    try {
      const state = {
        trackingEnabled: this.trackingEnabled,
        workLocation: this.workLocation,
        lastCheckTime: this.lastCheckTime?.toISOString(),
      };
      await AsyncStorage.setItem('locationTrackingState', JSON.stringify(state));
    } catch (error) {
      console.error('Fehler beim Speichern des Tracking-Status:', error);
    }
  }

  /**
   * Stellt den Tracking-Status aus dem AsyncStorage wieder her
   */
  public async restoreTrackingState(): Promise<void> {
    try {
      const stateStr = await AsyncStorage.getItem('locationTrackingState');
      if (stateStr) {
        const state = JSON.parse(stateStr);
        this.workLocation = state.workLocation;
        this.lastCheckTime = state.lastCheckTime ? new Date(state.lastCheckTime) : null;
        
        // Wenn Tracking aktiv war, neu starten
        if (state.trackingEnabled && this.workLocation) {
          this.startLocationTracking(this.workLocation);
        }
      }
    } catch (error) {
      console.error('Fehler beim Wiederherstellen des Tracking-Status:', error);
    }
  }

  /**
   * Berechnet die Entfernung zwischen zwei Koordinaten (Haversine-Formel)
   */
  private calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    console.log('Berechne Entfernung zwischen:');
    console.log(`Standort 1: ${lat1}, ${lon1}`);
    console.log(`Standort 2: ${lat2}, ${lon2}`);
    
    const R = 6371e3; // Erdradius in Metern
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = 
      Math.sin(Δφ/2) * Math.sin(Δφ/2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ/2) * Math.sin(Δλ/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Entfernung in Metern
    
    console.log(`Roh-Entfernung: ${distance}m`);
    console.log(`Puffer: ${this.LOCATION_BUFFER}m`);
    const finalDistance = Math.max(0, distance - this.LOCATION_BUFFER);
    console.log(`Endgültige Entfernung: ${finalDistance}m`);
    
    return finalDistance;
  }

  /**
   * Überprüft den aktuellen Standort
   */
  public async checkLocation(): Promise<void> {
    if (!this.workLocation) {
      console.log('Kein Arbeitsort gesetzt, überspringe Standortprüfung');
      return;
    }
    
    try {
      console.log('Starte Standortprüfung...');
      console.log('Arbeitsort:', this.workLocation);
      
      // Prüfe zuerst, ob die Berechtigungen erteilt sind
      const hasPermission = await permissionsService.checkAndRequestLocationPermissions();
      if (!hasPermission) {
        console.log('Keine Standortberechtigung, überspringe Standortprüfung');
        if (this.locationCallback) {
          this.locationCallback('error');
        }
        return;
      }

      // Starte die Standortabfrage mit einem Timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Standortabfrage timeout')), 30000);
      });

      const locationPromise = new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => reject(error),
          { 
            enableHighAccuracy: true, 
            timeout: 30000,
            maximumAge: 30000,
            distanceFilter: 5
          }
        );
      });

      const position = await Promise.race([locationPromise, timeoutPromise]) as any;
      
      // Aktuelle Koordinaten
      const currentLat = position.coords.latitude;
      const currentLng = position.coords.longitude;
      
      // Arbeitsort-Koordinaten
      const workLat = this.workLocation.latitude;
      const workLng = this.workLocation.longitude;
      
      // Detaillierter Koordinatenvergleich
      console.log('Koordinatenvergleich:');
      console.log('Arbeitsort:', {
        latitude: workLat,
        longitude: workLng,
        formatted: `${workLat.toFixed(6)}, ${workLng.toFixed(6)}`
      });
      console.log('Aktueller Standort:', {
        latitude: currentLat,
        longitude: currentLng,
        formatted: `${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}`
      });
      
      // Entfernung berechnen
      const distance = this.calculateDistance(
        currentLat, 
        currentLng, 
        workLat, 
        workLng
      );
      
      // Berücksichtige die Genauigkeit der Standortbestimmung
      const effectiveRadius = this.workLocation.radius + position.coords.accuracy;
      console.log('Effektiver Radius:', {
        baseRadius: this.workLocation.radius,
        accuracy: position.coords.accuracy,
        effectiveRadius: effectiveRadius
      });
      
      // Status aktualisieren
      this.lastCheckTime = new Date();
      
      // Überprüfen, ob innerhalb des effektiven Radius
      let isInside = distance <= effectiveRadius;
      
      console.log('Standortprüfung Ergebnis:', {
        distance: distance,
        effectiveRadius: effectiveRadius,
        accuracy: position.coords.accuracy,
        isInside: isInside,
        lastInsideStatus: this.lastInsideStatus
      });
      
      // Wenn die Genauigkeit zu niedrig ist, behalte den letzten Status bei
      if (position.coords.accuracy > this.MIN_ACCURACY) {
        console.log(`Standortgenauigkeit zu niedrig: ${position.coords.accuracy}m > ${this.MIN_ACCURACY}m`);
        if (this.lastInsideStatus !== null) {
          isInside = this.lastInsideStatus;
          console.log('Verwende letzten bekannten Status:', this.lastInsideStatus);
        }
      }
      
      // Speichere den Status für die nächste Prüfung
      this.lastInsideStatus = isInside;
      
      // Callback aufrufen, wenn verfügbar
      if (this.locationCallback) {
        this.locationCallback(
          isInside ? 'inside' : 'outside',
          { latitude: currentLat, longitude: currentLng }
        );
      }

      // Benachrichtigung aktualisieren, wenn Tracking aktiv
      if (this.trackingEnabled) {
        this.notificationService.updateTrackingNotification(
          isInside ? 'innerhalb des Arbeitsortes' : 'außerhalb des Arbeitsortes'
        );
      }

      console.log(`Standort geprüft: ${isInside ? 'innerhalb' : 'außerhalb'} (${distance.toFixed(0)}m / ${effectiveRadius.toFixed(0)}m, Genauigkeit: ${position.coords.accuracy}m)`);
    } catch (error) {
      console.error('Fehler bei der Standortüberprüfung:', error);
      if (this.locationCallback) {
        this.locationCallback('error');
      }
      
      // Benachrichtigung über Fehler
      if (this.trackingEnabled) {
        this.notificationService.updateTrackingNotification('Fehler bei der Standortbestimmung');
      }
    }
  }

  /**
   * Startet das Standort-Tracking
   */
  public async startLocationTracking(workLocation: WorkLocation): Promise<boolean> {
    try {
      this.workLocation = workLocation;
      this.trackingEnabled = true;
      
      // Status-Callback benachrichtigen
      if (this.statusChangeCallback) {
        this.statusChangeCallback(true);
      }
      
      // Benachrichtigung anzeigen
      this.notificationService.showTrackingNotification();
      
      // Initiale Standortprüfung durchführen
      await this.checkLocation();
      
      // Regelmäßige Standortprüfung über setInterval
      if (this.trackingIntervalId) {
        clearInterval(this.trackingIntervalId);
      }
      
      this.trackingIntervalId = setInterval(() => {
        if (this.trackingEnabled) {
          this.checkLocation();
        }
      }, this.checkInterval);
      
      // Zustand speichern
      await this.saveTrackingState();
      
      return true;
    } catch (error) {
      console.error('Fehler beim Starten des Trackings:', error);
      return false;
    }
  }

  /**
   * Stoppt das Standort-Tracking
   */
  public async stopLocationTracking(): Promise<void> {
    try {
      this.trackingEnabled = false;
      
      // Status-Callback benachrichtigen
      if (this.statusChangeCallback) {
        this.statusChangeCallback(false);
      }
      
      // Tracking-Interval stoppen
      if (this.trackingIntervalId) {
        clearInterval(this.trackingIntervalId);
        this.trackingIntervalId = null;
      }
      
      // Benachrichtigung entfernen
      this.notificationService.cancelTrackingNotification();
      
      // Zustand speichern
      await this.saveTrackingState();
      
    } catch (error) {
      console.error('Fehler beim Stoppen des Trackings:', error);
    }
  }

  /**
   * Registriert einen Callback für Standortaktualisierungen
   */
  public setLocationCallback(callback: LocationCallback): void {
    this.locationCallback = callback;
  }

  /**
   * Registriert einen Callback für Statusänderungen
   */
  public setStatusChangeCallback(callback: StatusChangeCallback): void {
    this.statusChangeCallback = callback;
  }

  /**
   * Gibt zurück, ob das Tracking aktiv ist
   */
  public isTrackingEnabled(): boolean {
    return this.trackingEnabled;
  }

  /**
   * Gibt den aktuellen Arbeitsort zurück
   */
  public getWorkLocation(): WorkLocation | null {
    return this.workLocation;
  }

  /**
   * Gibt den Zeitpunkt der letzten Standortprüfung zurück
   */
  public getLastCheckTime(): Date | null {
    return this.lastCheckTime;
  }

  /**
   * Service-Cleanup
   */
  public cleanup(): void {
    if (this.appStateListener) {
      this.appStateListener.remove();
    }
    
    if (this.trackingIntervalId) {
      clearInterval(this.trackingIntervalId);
      this.trackingIntervalId = null;
    }
    
    // Benachrichtigung entfernen
    if (this.trackingEnabled) {
      this.notificationService.cancelTrackingNotification();
    }
    
    this.trackingEnabled = false;
  }
}

export default LocationTrackingService; 