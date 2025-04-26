/**
 * DisclaimerContext.tsx
 * Context für den rechtlichen Haftungsausschluss
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DisclaimerContextProps } from '../types/types';

// Context erstellen
const DisclaimerContext = createContext<DisclaimerContextProps | null>(null);

// AsyncStorage key
const DISCLAIMER_STORAGE_KEY = 'disclaimerAccepted';
const DISCLAIMER_ACCEPTED_AT_KEY = 'disclaimerAcceptedAt';

export const DisclaimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(false);
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Disclaimer-Status beim Start laden
  useEffect(() => {
    loadDisclaimerStatus();
  }, []);

  const loadDisclaimerStatus = async () => {
    try {
      const storedStatus = await AsyncStorage.getItem(DISCLAIMER_STORAGE_KEY);
      const storedAt = await AsyncStorage.getItem(DISCLAIMER_ACCEPTED_AT_KEY);
      if (storedStatus === 'true') {
        setDisclaimerAccepted(true);
        if (storedAt) setAcceptedAt(storedAt);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Disclaimer-Status', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Disclaimer-Status ändern
  const handleSetDisclaimerAccepted = (accepted: boolean) => {
    setDisclaimerAccepted(accepted);
    if (accepted) {
      const now = new Date().toISOString();
      setAcceptedAt(now);
      AsyncStorage.setItem(DISCLAIMER_ACCEPTED_AT_KEY, now).catch(error =>
        console.error('Fehler beim Speichern des Disclaimer-Akzeptanzdatums', error)
      );
    }
    AsyncStorage.setItem(DISCLAIMER_STORAGE_KEY, accepted.toString()).catch(error => 
      console.error('Fehler beim Speichern des Disclaimer-Status', error)
    );
  };

  // Werte, die vom Context bereitgestellt werden
  const contextValue: DisclaimerContextProps = {
    disclaimerAccepted,
    setDisclaimerAccepted: handleSetDisclaimerAccepted,
    acceptedAt,
  };

  // Während des Ladens geben wir die Kinder trotzdem zurück, da der Disclaimer
  // in einer übergeordneten Komponente angezeigt wird
  return (
    <DisclaimerContext.Provider value={contextValue}>
      {children}
    </DisclaimerContext.Provider>
  );
};

// Hook für den einfachen Zugriff auf den DisclaimerContext
export const useDisclaimer = (): DisclaimerContextProps => {
  const context = useContext(DisclaimerContext);
  if (!context) {
    throw new Error('useDisclaimer muss innerhalb eines DisclaimerProvider verwendet werden');
  }
  return context;
}; 