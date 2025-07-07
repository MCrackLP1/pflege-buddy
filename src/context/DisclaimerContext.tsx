/**
 * DisclaimerContext.tsx
 * Context für den rechtlichen Haftungsausschluss
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DisclaimerContextProps } from '../types/types';
import { CloudBackendService, DisclaimerData } from '../services/CloudBackendService';
import DeviceInfo from 'react-native-device-info';
import Logger from '../utils/logger';

// Context erstellen
const DisclaimerContext = createContext<DisclaimerContextProps | null>(null);

// AsyncStorage keys
const DISCLAIMER_STORAGE_KEY = 'disclaimerAccepted';
const DISCLAIMER_ACCEPTED_AT_KEY = 'disclaimerAcceptedAt';
const DISCLAIMER_LAST_SYNC_KEY = 'disclaimerLastSync';
const DISCLAIMER_VERSION_KEY = 'disclaimerVersion';

// Aktuelle Version des Haftungsausschlusses
const CURRENT_DISCLAIMER_VERSION = '1.0.0';

export const DisclaimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(false);
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  // Disclaimer-Status beim Start laden
  useEffect(() => {
    loadDisclaimerStatus();
  }, []);

  const loadDisclaimerStatus = async () => {
    try {
      const [storedStatus, storedAt, storedLastSync] = await Promise.all([
        AsyncStorage.getItem(DISCLAIMER_STORAGE_KEY),
        AsyncStorage.getItem(DISCLAIMER_ACCEPTED_AT_KEY),
        AsyncStorage.getItem(DISCLAIMER_LAST_SYNC_KEY),
      ]);

      if (storedStatus === 'true') {
        setDisclaimerAccepted(true);
        if (storedAt) setAcceptedAt(storedAt);
      }
      
      if (storedLastSync) setLastSyncAt(storedLastSync);
    } catch (error) {
      Logger.error('DisclaimerContext', 'Fehler beim Laden des Disclaimer-Status', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Disclaimer-Status ändern
  const handleSetDisclaimerAccepted = async (accepted: boolean) => {
    setDisclaimerAccepted(accepted);
    
    let acceptedAtTime: string | null = null;
    if (accepted) {
      acceptedAtTime = new Date().toISOString();
      setAcceptedAt(acceptedAtTime);
    }

    try {
      // Lokale Speicherung
      await Promise.all([
        AsyncStorage.setItem(DISCLAIMER_STORAGE_KEY, accepted.toString()),
        AsyncStorage.setItem(DISCLAIMER_VERSION_KEY, CURRENT_DISCLAIMER_VERSION),
        accepted && acceptedAtTime 
          ? AsyncStorage.setItem(DISCLAIMER_ACCEPTED_AT_KEY, acceptedAtTime)
          : Promise.resolve(),
      ]);

      Logger.info('DisclaimerContext', `Disclaimer ${accepted ? 'accepted' : 'rejected'} and saved locally`);
    } catch (error) {
      Logger.error('DisclaimerContext', 'Fehler beim Speichern des Disclaimer-Status', error);
    }
  };

  // Google-Synchronisation
  const syncWithGoogle = async (googleUser: any) => {
    if (!googleUser) {
      Logger.warn('DisclaimerContext', 'No Google user provided for sync');
      return;
    }

    setIsSyncing(true);
    
    try {
      const cloudService = CloudBackendService.getInstance();
      await cloudService.initialize(googleUser);

      // Versuche Cloud-Daten zu laden
      const cloudResponse = await cloudService.loadDisclaimer();
      
      if (cloudResponse.success && cloudResponse.data) {
        const cloudData = cloudResponse.data;
        const localData = await getLocalDisclaimerData();
        
        // Vergleiche lokale und Cloud-Daten
        const shouldUseCloud = shouldUseCloudData(localData, cloudData);
        
        if (shouldUseCloud) {
          // Cloud-Daten sind neuer - übernehme sie lokal
          await applyCloudData(cloudData);
          Logger.info('DisclaimerContext', 'Applied cloud disclaimer data locally');
        } else {
          // Lokale Daten sind neuer - sync zur Cloud
          await syncLocalDataToCloud(cloudService, localData);
          Logger.info('DisclaimerContext', 'Synced local disclaimer data to cloud');
        }
      } else {
        // Keine Cloud-Daten vorhanden - sync lokale Daten zur Cloud
        const localData = await getLocalDisclaimerData();
        await syncLocalDataToCloud(cloudService, localData);
        Logger.info('DisclaimerContext', 'Initial sync of local disclaimer data to cloud');
      }

      // Update last sync time
      const now = new Date().toISOString();
      setLastSyncAt(now);
      await AsyncStorage.setItem(DISCLAIMER_LAST_SYNC_KEY, now);

    } catch (error) {
      Logger.error('DisclaimerContext', 'Failed to sync disclaimer with Google', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Hilfsfunktionen für Google-Sync
  const getLocalDisclaimerData = async (): Promise<DisclaimerData> => {
    const deviceId = await DeviceInfo.getUniqueId();
    const userAgent = await DeviceInfo.getUserAgent();
    
    return {
      accepted: disclaimerAccepted,
      acceptedAt: acceptedAt,
      version: CURRENT_DISCLAIMER_VERSION,
      userAgent: userAgent,
      lastModified: acceptedAt || new Date().toISOString(),
      deviceId: deviceId,
    };
  };

  const shouldUseCloudData = (localData: DisclaimerData, cloudData: DisclaimerData): boolean => {
    // Cloud-Daten verwenden wenn:
    // 1. Lokal nicht akzeptiert, aber in Cloud akzeptiert
    // 2. Cloud-Version ist neuer
    // 3. Cloud wurde später modifiziert
    
    if (!localData.accepted && cloudData.accepted) return true;
    if (localData.accepted && !cloudData.accepted) return false;
    
    // Vergleiche Zeitstempel
    const localTime = new Date(localData.lastModified);
    const cloudTime = new Date(cloudData.lastModified);
    
    return cloudTime > localTime;
  };

  const applyCloudData = async (cloudData: DisclaimerData) => {
    setDisclaimerAccepted(cloudData.accepted);
    setAcceptedAt(cloudData.acceptedAt);
    
    await Promise.all([
      AsyncStorage.setItem(DISCLAIMER_STORAGE_KEY, cloudData.accepted.toString()),
      AsyncStorage.setItem(DISCLAIMER_VERSION_KEY, cloudData.version),
      cloudData.acceptedAt 
        ? AsyncStorage.setItem(DISCLAIMER_ACCEPTED_AT_KEY, cloudData.acceptedAt)
        : Promise.resolve(),
    ]);
  };

  const syncLocalDataToCloud = async (cloudService: CloudBackendService, localData: DisclaimerData) => {
    await cloudService.syncDisclaimer(localData);
  };

  // Werte, die vom Context bereitgestellt werden
  const contextValue: DisclaimerContextProps = {
    disclaimerAccepted,
    setDisclaimerAccepted: handleSetDisclaimerAccepted,
    acceptedAt,
    syncWithGoogle,
    isSyncing,
    lastSyncAt,
  };

  // Während des Ladens geben wir die Kinder trotzdem zurück, da der Disclaimer
  // in einer übergeordneten Komponente angezeigt wird
  return <DisclaimerContext.Provider value={contextValue}>{children}</DisclaimerContext.Provider>;
};

// Hook für den einfachen Zugriff auf den DisclaimerContext
export const useDisclaimer = (): DisclaimerContextProps => {
  const context = useContext(DisclaimerContext);
  if (!context) {
    throw new Error('useDisclaimer muss innerhalb eines DisclaimerProvider verwendet werden');
  }
  return context;
};
