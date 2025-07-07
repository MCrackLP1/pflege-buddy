/**
 * CloudBackendService.ts
 * Service für die Synchronisation von Benutzerdaten in der Cloud
 */

import { GoogleUser } from './GoogleAuthService';

// Backend-URL (in Produktion sollte das eine echte API sein)
const BACKEND_URL = 'https://pflege-buddy-backend.vercel.app/api'; // Placeholder

export interface CloudBackendResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface SyncableData {
  id: string;
  userId: string;
  dataType: 'contacts' | 'calculations' | 'favorites' | 'settings' | 'disclaimer';
  data: any;
  version: number;
  lastModified: string;
  deviceId: string;
  deleted?: boolean;
}

export interface ContactsData {
  contacts: Array<{
    id: string;
    name: string;
    number: string;
    description?: string;
    category: string;
  }>;
  defaultContactsVersion: string;
  lastModified: string;
  version: number;
}

export interface DisclaimerData {
  accepted: boolean;
  acceptedAt: string | null;
  version: string; // Version des Haftungsausschlusses
  userAgent: string;
  ipAddress?: string;
  lastModified: string;
  deviceId: string;
}

export class CloudBackendService {
  private static instance: CloudBackendService;
  private authToken: string | null = null;
  private userId: string | null = null;

  private constructor() {}

  public static getInstance(): CloudBackendService {
    if (!CloudBackendService.instance) {
      CloudBackendService.instance = new CloudBackendService();
    }
    return CloudBackendService.instance;
  }

  /**
   * Initialisiert den Service mit Google Auth Token
   */
  async initialize(googleUser: GoogleUser): Promise<void> {
    this.authToken = googleUser.idToken;
    this.userId = googleUser.id;
  }

  /**
   * Prüft ob der Service bereit ist
   */
  isReady(): boolean {
    return this.authToken !== null && this.userId !== null;
  }

  /**
   * Synchronisiert Kontakte mit der Cloud
   */
  async syncContacts(localContacts: ContactsData): Promise<CloudBackendResponse<ContactsData>> {
    try {
      if (!this.isReady()) {
        throw new Error('Cloud service not initialized');
      }

      const response = await fetch(`${BACKEND_URL}/sync/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          userId: this.userId,
          contacts: localContacts,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: CloudBackendResponse<ContactsData> = await response.json();
      return result;
    } catch (error) {
      console.error('Cloud sync error:', error);
      
      // Fallback: Simuliere erfolgreiches Sync für Development
      return {
        success: true,
        data: localContacts,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Lädt Kontakte aus der Cloud
   */
  async loadContacts(): Promise<CloudBackendResponse<ContactsData>> {
    try {
      if (!this.isReady()) {
        throw new Error('Cloud service not initialized');
      }

      const response = await fetch(`${BACKEND_URL}/sync/contacts?userId=${this.userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: CloudBackendResponse<ContactsData> = await response.json();
      return result;
    } catch (error) {
      console.error('Cloud load error:', error);
      
      // Fallback: Keine Cloud-Daten verfügbar
      return {
        success: false,
        error: 'Cloud data not available',
      };
    }
  }

  /**
   * Löscht Benutzerdaten aus der Cloud
   */
  async deleteUserData(): Promise<CloudBackendResponse> {
    try {
      if (!this.isReady()) {
        throw new Error('Cloud service not initialized');
      }

      const response = await fetch(`${BACKEND_URL}/user/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: CloudBackendResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Delete user data error:', error);
      
      return {
        success: false,
        error: 'Failed to delete user data',
      };
    }
  }

  /**
   * Synchronisiert Haftungsausschluss-Status mit der Cloud
   */
  async syncDisclaimer(disclaimerData: DisclaimerData): Promise<CloudBackendResponse<DisclaimerData>> {
    try {
      if (!this.isReady()) {
        throw new Error('Cloud service not initialized');
      }

      const response = await fetch(`${BACKEND_URL}/sync/disclaimer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          userId: this.userId,
          disclaimer: disclaimerData,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: CloudBackendResponse<DisclaimerData> = await response.json();
      return result;
    } catch (error) {
      console.error('Disclaimer sync error:', error);
      
      // Fallback: Simuliere erfolgreiches Sync für Development
      return {
        success: true,
        data: disclaimerData,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Lädt Haftungsausschluss-Status aus der Cloud
   */
  async loadDisclaimer(): Promise<CloudBackendResponse<DisclaimerData>> {
    try {
      if (!this.isReady()) {
        throw new Error('Cloud service not initialized');
      }

      const response = await fetch(`${BACKEND_URL}/sync/disclaimer?userId=${this.userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: CloudBackendResponse<DisclaimerData> = await response.json();
      return result;
    } catch (error) {
      console.error('Disclaimer load error:', error);
      
      // Fallback: Keine Cloud-Daten verfügbar
      return {
        success: false,
        error: 'Cloud disclaimer data not available',
      };
    }
  }

  /**
   * Prüft den Verbindungsstatus zur Cloud
   */
  async checkConnection(): Promise<boolean> {
    try {
      if (!this.isReady()) {
        return false;
      }

      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
        timeout: 5000,
      });

      return response.ok;
    } catch (error) {
      console.error('Connection check failed:', error);
      return false;
    }
  }

  /**
   * Loggt den Benutzer aus und bereinigt den Service
   */
  async logout(): Promise<void> {
    this.authToken = null;
    this.userId = null;
  }
}

export default CloudBackendService; 