/**
 * ContactsSyncService.ts
 * Service für die Synchronisation von Kontakten zwischen lokaler und Cloud-Speicherung
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleUser } from './GoogleAuthService';
import CloudBackendService, { ContactsData, CloudBackendResponse } from './CloudBackendService';
import { Alert } from 'react-native';

// Storage Keys
const CONTACTS_STORAGE_KEY = 'pflege_app_contacts';
const CONTACTS_SYNC_METADATA_KEY = 'pflege_app_contacts_sync_metadata';
const CONTACTS_LAST_SYNC_KEY = 'pflege_app_contacts_last_sync';

export interface Contact {
  id: string;
  name: string;
  number: string;
  description?: string;
  category: string;
}

export interface ContactsSyncMetadata {
  lastSyncTimestamp: string;
  version: number;
  deviceId: string;
  hasUnsyncedChanges: boolean;
}

export interface SyncResult {
  success: boolean;
  conflicts?: Contact[];
  syncedContacts?: Contact[];
  error?: string;
  timestamp?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  hasUnsyncedChanges: boolean;
  lastSyncTimestamp?: string;
  syncInProgress: boolean;
}

export class ContactsSyncService {
  private static instance: ContactsSyncService;
  private cloudService: CloudBackendService;
  private deviceId: string;
  private syncInProgress: boolean = false;
  private syncCallbacks: Array<(status: SyncStatus) => void> = [];

  private constructor() {
    this.cloudService = CloudBackendService.getInstance();
    this.deviceId = this.generateDeviceId();
  }

  public static getInstance(): ContactsSyncService {
    if (!ContactsSyncService.instance) {
      ContactsSyncService.instance = new ContactsSyncService();
    }
    return ContactsSyncService.instance;
  }

  /**
   * Initialisiert den Sync-Service mit Google Auth
   */
  async initialize(googleUser: GoogleUser): Promise<void> {
    await this.cloudService.initialize(googleUser);
    
    // Automatische Synchronisation beim Login
    setTimeout(() => {
      this.syncContacts();
    }, 1000);
  }

  /**
   * Registriert einen Callback für Sync-Status Updates
   */
  onSyncStatusChange(callback: (status: SyncStatus) => void): void {
    this.syncCallbacks.push(callback);
  }

  /**
   * Entfernt einen Sync-Status Callback
   */
  removeSyncStatusCallback(callback: (status: SyncStatus) => void): void {
    this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Benachrichtigt alle Callbacks über Status-Änderungen
   */
  private notifyStatusChange(status: SyncStatus): void {
    this.syncCallbacks.forEach(callback => callback(status));
  }

  /**
   * Lädt Kontakte aus dem lokalen Storage
   */
  async loadLocalContacts(): Promise<Contact[]> {
    try {
      const contactsData = await AsyncStorage.getItem(CONTACTS_STORAGE_KEY);
      if (contactsData) {
        return JSON.parse(contactsData);
      }
      return [];
    } catch (error) {
      console.error('Error loading local contacts:', error);
      return [];
    }
  }

  /**
   * Speichert Kontakte im lokalen Storage
   */
  async saveLocalContacts(contacts: Contact[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
      await this.updateSyncMetadata({ hasUnsyncedChanges: true });
      
      // Automatische Synchronisation nach Änderungen
      if (this.cloudService.isReady()) {
        setTimeout(() => {
          this.syncContacts();
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving local contacts:', error);
      throw error;
    }
  }

  /**
   * Lädt Sync-Metadaten
   */
  async loadSyncMetadata(): Promise<ContactsSyncMetadata> {
    try {
      const metadata = await AsyncStorage.getItem(CONTACTS_SYNC_METADATA_KEY);
      if (metadata) {
        return JSON.parse(metadata);
      }
      return {
        lastSyncTimestamp: new Date().toISOString(),
        version: 1,
        deviceId: this.deviceId,
        hasUnsyncedChanges: false,
      };
    } catch (error) {
      console.error('Error loading sync metadata:', error);
      return {
        lastSyncTimestamp: new Date().toISOString(),
        version: 1,
        deviceId: this.deviceId,
        hasUnsyncedChanges: false,
      };
    }
  }

  /**
   * Aktualisiert Sync-Metadaten
   */
  async updateSyncMetadata(updates: Partial<ContactsSyncMetadata>): Promise<void> {
    try {
      const currentMetadata = await this.loadSyncMetadata();
      const newMetadata = { ...currentMetadata, ...updates };
      await AsyncStorage.setItem(CONTACTS_SYNC_METADATA_KEY, JSON.stringify(newMetadata));
    } catch (error) {
      console.error('Error updating sync metadata:', error);
    }
  }

  /**
   * Synchronisiert Kontakte mit der Cloud
   */
  async syncContacts(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return { success: false, error: 'Sync already in progress' };
    }

    if (!this.cloudService.isReady()) {
      return { success: false, error: 'Cloud service not available' };
    }

    this.syncInProgress = true;
    this.notifyStatusChange({
      isOnline: true,
      hasUnsyncedChanges: false,
      syncInProgress: true,
    });

    try {
      const localContacts = await this.loadLocalContacts();
      const metadata = await this.loadSyncMetadata();
      
      const contactsData: ContactsData = {
        contacts: localContacts,
        defaultContactsVersion: '1.0',
        lastModified: new Date().toISOString(),
        version: metadata.version,
      };

      // Synchronisation mit Cloud
      const syncResponse = await this.cloudService.syncContacts(contactsData);

      if (syncResponse.success && syncResponse.data) {
        // Merge lokale und Cloud-Kontakte
        const mergedContacts = this.mergeContacts(localContacts, syncResponse.data.contacts);
        
        // Speichere gemergete Kontakte
        await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(mergedContacts));
        
        // Aktualisiere Metadaten
        await this.updateSyncMetadata({
          lastSyncTimestamp: new Date().toISOString(),
          version: syncResponse.data.version,
          hasUnsyncedChanges: false,
        });

        this.notifyStatusChange({
          isOnline: true,
          hasUnsyncedChanges: false,
          syncInProgress: false,
          lastSyncTimestamp: new Date().toISOString(),
        });

        return {
          success: true,
          syncedContacts: mergedContacts,
          timestamp: new Date().toISOString(),
        };
      } else {
        throw new Error(syncResponse.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      
      this.notifyStatusChange({
        isOnline: false,
        hasUnsyncedChanges: true,
        syncInProgress: false,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown sync error',
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Lädt Kontakte aus der Cloud
   */
  async loadFromCloud(): Promise<SyncResult> {
    if (!this.cloudService.isReady()) {
      return { success: false, error: 'Cloud service not available' };
    }

    try {
      const cloudResponse = await this.cloudService.loadContacts();
      
      if (cloudResponse.success && cloudResponse.data) {
        const localContacts = await this.loadLocalContacts();
        const mergedContacts = this.mergeContacts(localContacts, cloudResponse.data.contacts);
        
        await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(mergedContacts));
        await this.updateSyncMetadata({
          lastSyncTimestamp: new Date().toISOString(),
          version: cloudResponse.data.version,
          hasUnsyncedChanges: false,
        });

        return {
          success: true,
          syncedContacts: mergedContacts,
          timestamp: new Date().toISOString(),
        };
      } else {
        return { success: false, error: cloudResponse.error || 'Failed to load from cloud' };
      }
    } catch (error) {
      console.error('Load from cloud error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Merged lokale und Cloud-Kontakte intelligent
   */
  private mergeContacts(localContacts: Contact[], cloudContacts: Contact[]): Contact[] {
    const mergedMap = new Map<string, Contact>();
    
    // Füge lokale Kontakte hinzu
    localContacts.forEach(contact => {
      mergedMap.set(contact.id, contact);
    });
    
    // Merge Cloud-Kontakte
    cloudContacts.forEach(cloudContact => {
      const localContact = mergedMap.get(cloudContact.id);
      
      if (!localContact) {
        // Neuer Kontakt aus der Cloud
        mergedMap.set(cloudContact.id, cloudContact);
      } else {
        // Bestehender Kontakt - verwende die neueste Version
        // Hier könnten wir eine komplexere Merge-Logik implementieren
        mergedMap.set(cloudContact.id, cloudContact);
      }
    });
    
    return Array.from(mergedMap.values());
  }

  /**
   * Prüft den aktuellen Sync-Status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const metadata = await this.loadSyncMetadata();
    const isOnline = await this.cloudService.checkConnection();
    
    return {
      isOnline,
      hasUnsyncedChanges: metadata.hasUnsyncedChanges,
      lastSyncTimestamp: metadata.lastSyncTimestamp,
      syncInProgress: this.syncInProgress,
    };
  }

  /**
   * Erzwingt eine vollständige Synchronisation
   */
  async forceSyncContacts(): Promise<SyncResult> {
    // Zurücksetzen der Metadaten für vollständigen Sync
    await this.updateSyncMetadata({
      hasUnsyncedChanges: true,
      version: 1,
    });
    
    return this.syncContacts();
  }

  /**
   * Bereinigt lokale Sync-Daten
   */
  async clearSyncData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CONTACTS_SYNC_METADATA_KEY);
      await AsyncStorage.removeItem(CONTACTS_LAST_SYNC_KEY);
    } catch (error) {
      console.error('Error clearing sync data:', error);
    }
  }

  /**
   * Loggt den Benutzer aus und bereinigt Sync-Daten
   */
  async logout(): Promise<void> {
    await this.cloudService.logout();
    await this.clearSyncData();
    this.syncCallbacks = [];
  }

  /**
   * Generiert eine eindeutige Geräte-ID
   */
  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default ContactsSyncService; 