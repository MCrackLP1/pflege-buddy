import { NativeModules, Platform, ToastAndroid, NativeEventEmitter } from 'react-native';
import { WorkLocation } from '../types/types';
import { serviceEventEmitter } from './serviceEmitter';
import permissionsService from './PermissionsService';

/**
 * Interface for the Native Location Tracking Module
 */
interface LocationTrackingInterface {
  startTracking(workLocation: WorkLocation): void;
  stopTracking(): void;
  isTracking(options: {}): Promise<boolean>;
}

// Event-Typdefinitionen
interface LocationStatusEvent {
  status?: string;
  latitude?: number;
  longitude?: number;
  isAtWorkLocation?: boolean;
}

interface GeofenceEvent {
  type?: string;
  latitude?: number;
  longitude?: number;
  identifier?: string;
}

// Sichereren Fallback implementieren
type NullableModule = any | null;

// Erstelle einen Logger für konsistente Logging-Nachrichten
const log = (message: string, error?: any) => {
  try {
    if (error) {
      console.warn(`NativeLocationTrackingService: ${message}`, error);
    } else {
      console.log(`NativeLocationTrackingService: ${message}`);
    }
  } catch (e) {
    // Ignoriere Logging-Fehler
  }
};

// Safe-getter für native Module
const getNativeModule = (): NullableModule => {
  try {
    if (Platform.OS === 'android') {
      const module = NativeModules.LocationTracking || null;
      
      // Überprüfe, ob das Modul die erwarteten Methoden enthält
      if (module && 
          typeof module.startTracking === 'function' && 
          typeof module.stopTracking === 'function' && 
          typeof module.isTracking === 'function') {
        log('Natives LocationTracking Modul gefunden und validiert');
        return module;
      }
      
      log('Natives LocationTracking Modul nicht vollständig - verwende Dummy');
      return null;
    }
    log('Nicht auf Android - natives Modul nicht verfügbar');
    return null;
  } catch (error) {
    log('Fehler beim Zugriff auf das native Modul', error);
    return null;
  }
};

// Sichere Erstellung des Event Emitters
const createSafeEventEmitter = () => {
  try {
    const nativeModule = getNativeModule();
    if (nativeModule) {
      try {
        const emitter = new NativeEventEmitter(nativeModule);
        log('EventEmitter erfolgreich erstellt');
        return emitter;
      } catch (error) {
        log('Fehler beim Erstellen des EventEmitters', error);
      }
    }
    
    // Erstelle einen Dummy-EventEmitter als Fallback
    log('Erstelle Dummy-EventEmitter');
    return {
      addListener: () => ({ remove: () => {} }),
      removeAllListeners: () => {},
    };
  } catch (error) {
    log('Kritischer Fehler bei der EventEmitter-Initialisierung', error);
    // Erstelle einen Dummy-EventEmitter als Fallback
    return {
      addListener: () => ({ remove: () => {} }),
      removeAllListeners: () => {},
    };
  }
};

// Erstelle den EventEmitter
const eventEmitter = createSafeEventEmitter();

/**
 * Service zur Kommunikation mit dem nativen Android Location Service
 */
class NativeLocationTrackingService {
  private static instance: NativeLocationTrackingService;
  private _module: any | null = null;
  private _eventEmitter: any = null;
  private _isTracking: boolean = false;
  private _isInitialized: boolean = false;
  private _mockMode: boolean = false;
  private _workLocation: WorkLocation | null = null;

  // Timer-ID für regelmäßige Standortabfragen
  private _periodicCheckTimerId: number | null = null;

  private constructor() {
    this._initialize();
  }

  /**
   * Registriert Event-Listener für native Ereignisse
   */
  private setupEventListeners() {
    if (!this._eventEmitter) {
      log('EventEmitter nicht verfügbar, überspringe Event-Setup');
      return;
    }

    try {
      // Location Status Änderungen
      try {
        this._eventEmitter.addListener('locationStatusChanged', (event: LocationStatusEvent) => {
          try {
            if (!event) {
              log('Leeres locationStatusChanged Event erhalten');
              return;
            }
            
            serviceEventEmitter.emit('location_status_changed', {
              isAtWorkLocation: event.status === 'at_work_location',
              status: event.status || 'unknown',
              latitude: event.latitude || 0,
              longitude: event.longitude || 0
            });
          } catch (error) {
            log('Fehler im locationStatusChanged Event-Handler', error);
          }
        });
        log('locationStatusChanged Event-Listener registriert');
      } catch (error) {
        log('Fehler beim Registrieren des locationStatusChanged Event-Listeners', error);
      }

      // Geofence-Events
      try {
        this._eventEmitter.addListener('geofenceEvent', (event: GeofenceEvent) => {
          try {
            if (!event) {
              log('Leeres geofenceEvent erhalten');
              return;
            }
            
            log('Geofence Event erhalten:', event);
          } catch (error) {
            log('Fehler im geofenceEvent Event-Handler', error);
          }
        });
        log('geofenceEvent Event-Listener registriert');
      } catch (error) {
        log('Fehler beim Registrieren des geofenceEvent Event-Listeners', error);
      }

      // Tracking Status Änderungen
      try {
        this._eventEmitter.addListener('trackingStatusChanged', (isTracking: boolean) => {
          try {
            // Sicherstellen, dass isTracking ein Boolean ist
            this._isTracking = typeof isTracking === 'boolean' ? isTracking : false;
            log(`Tracking Status geändert: ${this._isTracking}`);
          } catch (error) {
            log('Fehler im trackingStatusChanged Event-Handler', error);
          }
        });
        log('trackingStatusChanged Event-Listener registriert');
      } catch (error) {
        log('Fehler beim Registrieren des trackingStatusChanged Event-Listeners', error);
      }

      log('Alle Event-Listener erfolgreich registriert');
    } catch (error) {
      log('Unerwarteter Fehler beim Einrichten der Event-Listener', error);
    }
  }

  /**
   * Gibt die Singleton-Instanz des Services zurück
   */
  public static getInstance(): NativeLocationTrackingService {
    if (!NativeLocationTrackingService.instance) {
      try {
        NativeLocationTrackingService.instance = new NativeLocationTrackingService();
      } catch (error) {
        log('Fehler beim Erstellen der Instanz', error);
        // Erstelle eine Mock-Instanz als Fallback
        const mockInstance = new NativeLocationTrackingService();
        mockInstance._mockMode = true;
        NativeLocationTrackingService.instance = mockInstance;
      }
    }
    return NativeLocationTrackingService.instance;
  }

  /**
   * Initialisiert den Service
   */
  private async _initialize(): Promise<void> {
    try {
      log('Initialisiere NativeLocationTrackingService...');
      
      // Starte im Mock-Modus und aktiviere das native Modul später
      this._mockMode = true;
      this._isInitialized = true;
      
      // Native Module erst mit Verzögerung initialisieren
      setTimeout(() => {
        try {
          // Initialisiere Native Module und EventEmitter
          this._module = getNativeModule();
          this._eventEmitter = eventEmitter;
          
          // Wenn kein natives Modul verfügbar ist, aktiviere den Mock-Modus
          if (!this._module) {
            log('Natives Modul nicht verfügbar, bleibe im Mock-Modus');
          } else {
            // Setup Event Listener
            this.setupEventListeners();
            // Deaktiviere Mock-Modus, da natives Modul verfügbar
            this._mockMode = false;
          }
          
          log('NativeLocationTrackingService erfolgreich initialisiert');
        } catch (innerError) {
          log('Fehler bei der verzögerten Initialisierung', innerError);
          // Bereits im Mock-Modus, nichts zu tun
        }
      }, 2000); // 2 Sekunden Verzögerung
      
    } catch (error) {
      log('Fehler bei der Initialisierung', error);
      this._mockMode = true;
      this._isInitialized = true; // Trotzdem als initialisiert markieren
    }
  }

  /**
   * Startet die Standortverfolgung
   */
  public async startTracking(workLocation?: WorkLocation): Promise<boolean> {
    try {
      log('Starte Standortverfolgung...');
      
      // Speichere die Arbeitsstätte, falls angegeben
      if (workLocation) {
        this._workLocation = workLocation;
      }
      
      // Im Mock-Modus simulieren wir das Tracking
      if (this._mockMode) {
        log('Mock-Modus: Simuliere Tracking-Start');
        this._isTracking = true;
        
        // Simuliere ein Location-Event nach kurzer Verzögerung
        setTimeout(() => {
          serviceEventEmitter.emit('location_status_changed', {
            isAtWorkLocation: false,
            status: 'outside',
            latitude: 52.520008,
            longitude: 13.404954
          });
        }, 2000);
        
        return true;
      }
      
      // Prüfe, ob das Modul verfügbar ist
      if (!this._module) {
        log('Natives Modul nicht verfügbar, kann Tracking nicht starten');
        return false;
      }
      
      // Starte das Tracking mit dem nativen Modul
      try {
        await this._module.startTracking(this._workLocation);
        this._isTracking = true;
        log('Standortverfolgung erfolgreich gestartet');
        
        // Starte regelmäßige Standortabfragen im Hintergrund
        this.startPeriodicLocationChecks();
        
        return true;
      } catch (error) {
        log('Fehler beim Starten der Standortverfolgung', error);
        return false;
      }
    } catch (error) {
      log('Unerwarteter Fehler beim Starten der Standortverfolgung', error);
      return false;
    }
  }

  /**
   * Stoppt die Standortverfolgung
   */
  public async stopTracking(): Promise<boolean> {
    try {
      log('Stoppe Standortverfolgung...');
      
      // Stoppe regelmäßige Standortabfragen
      this.stopPeriodicLocationChecks();
      
      // Im Mock-Modus simulieren wir das Stoppen des Trackings
      if (this._mockMode) {
        log('Mock-Modus: Simuliere Tracking-Stopp');
        this._isTracking = false;
        return true;
      }
      
      // Prüfe, ob das Modul verfügbar ist
      if (!this._module) {
        log('Natives Modul nicht verfügbar, kann Tracking nicht stoppen');
        this._isTracking = false;
        return false;
      }
      
      // Stoppe das Tracking mit dem nativen Modul
      try {
        await this._module.stopTracking();
        this._isTracking = false;
        log('Standortverfolgung erfolgreich gestoppt');
        return true;
      } catch (error) {
        log('Fehler beim Stoppen der Standortverfolgung', error);
        // Trotzdem als gestoppt markieren
        this._isTracking = false;
        return false;
      }
    } catch (error) {
      log('Unerwarteter Fehler beim Stoppen der Standortverfolgung', error);
      this._isTracking = false;
      return false;
    }
  }

  /**
   * Startet regelmäßige Standortabfragen
   */
  private startPeriodicLocationChecks() {
    // Falls schon ein Timer läuft, diesen stoppen
    this.stopPeriodicLocationChecks();
    
    // Sofortige Standortabfrage beim Start
    this.forceLocationCheck();
    
    // Regelmäßige Standortabfragen alle 30 Sekunden
    this._periodicCheckTimerId = setInterval(() => {
      try {
        if (this._isTracking && this._module && !this._mockMode) {
          // Sende FORCE_LOCATION_CHECK Intent an den Service
          log('Erzwinge Standortabfrage...');
          if (this._module.forceLocationCheck) {
            this._module.forceLocationCheck();
          }
        }
      } catch (error) {
        log('Fehler bei erzwungener Standortabfrage', error);
      }
    }, 30000); // Alle 30 Sekunden
    
    log('Regelmäßige Standortabfragen gestartet');
  }

  /**
   * Stoppt regelmäßige Standortabfragen
   */
  private stopPeriodicLocationChecks() {
    if (this._periodicCheckTimerId) {
      clearInterval(this._periodicCheckTimerId);
      this._periodicCheckTimerId = null;
      log('Regelmäßige Standortabfragen gestoppt');
    }
  }

  /**
   * Überprüft, ob die Standortverfolgung aktiv ist
   */
  public async isTracking(): Promise<boolean> {
    try {
      log('Prüfe Tracking-Status...');
      
      // Im Mock-Modus geben wir den gespeicherten Status zurück
      if (this._mockMode) {
        log(`Mock-Modus: Tracking-Status ist ${this._isTracking}`);
        return this._isTracking;
      }
      
      // Prüfe, ob das Modul verfügbar ist
      if (!this._module) {
        log('Natives Modul nicht verfügbar, kann Tracking-Status nicht prüfen');
        return this._isTracking;
      }
      
      // Prüfe den Tracking-Status mit dem nativen Modul
      try {
        const isTracking = await this._module.isTracking();
        this._isTracking = isTracking;
        log(`Tracking-Status ist ${isTracking}`);
        return isTracking;
      } catch (error) {
        log('Fehler beim Prüfen des Tracking-Status', error);
        return this._isTracking;
      }
    } catch (error) {
      log('Unerwarteter Fehler beim Prüfen des Tracking-Status', error);
      return this._isTracking;
    }
  }

  /**
   * Erzwingt eine sofortige Standortüberprüfung
   */
  public forceLocationCheck(): void {
    try {
      log('Erzwinge Standortüberprüfung...');
      if (this._module) {
        if (this._module.forceLocationCheck) {
          this._module.forceLocationCheck();
        }
      }
    } catch (error) {
      log('Fehler beim Erzwingen der Standortüberprüfung', error);
    }
  }
}

// Exportiere eine Singleton-Instanz
let instance: NativeLocationTrackingService;
try {
  instance = NativeLocationTrackingService.getInstance();
} catch (error) {
  console.error('Fehler beim Erstellen der NativeLocationTrackingService-Instanz:', error);
  // Fallback
  instance = NativeLocationTrackingService.getInstance();
}

export default instance; 