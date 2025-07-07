import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AI_CHAT_CONSENT_KEY = '@PflegeBuddy:AIChatConsent';

interface AIChatConsentContextType {
  hasConsentedToAIChat: boolean | null; // null initially, true/false after loading
  setHasConsentedToAIChat: (consented: boolean) => Promise<void>;
  isLoadingConsent: boolean;
}

const AIChatConsentContext = createContext<AIChatConsentContextType | undefined>(undefined);

export const AIChatConsentProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [hasConsentedToAIChat, setConsentState] = useState<boolean | null>(null);
  const [isLoadingConsent, setIsLoadingConsent] = useState(true);

  useEffect(() => {
    const loadConsent = async () => {
      setIsLoadingConsent(true);
      try {
        const storedConsent = await AsyncStorage.getItem(AI_CHAT_CONSENT_KEY);
        if (storedConsent !== null) {
          setConsentState(JSON.parse(storedConsent));
        } else {
          setConsentState(false); // Default to not consented if nothing is stored
        }
      } catch (e) {
        console.error("Failed to load AI chat consent from AsyncStorage", e);
        setConsentState(false); // Fallback on error
      }
      setIsLoadingConsent(false);
    };

    loadConsent();
  }, []);

  const setHasConsentedToAIChat = async (consented: boolean) => {
    try {
      await AsyncStorage.setItem(AI_CHAT_CONSENT_KEY, JSON.stringify(consented));
      setConsentState(consented);
    } catch (e) {
      console.error("Failed to save AI chat consent to AsyncStorage", e);
    }
  };

  return (
    <AIChatConsentContext.Provider value={{ hasConsentedToAIChat, setHasConsentedToAIChat, isLoadingConsent }}>
      {children}
    </AIChatConsentContext.Provider>
  );
};

export const useAIChatConsent = (): AIChatConsentContextType => {
  const context = useContext(AIChatConsentContext);
  if (context === undefined) {
    throw new Error('useAIChatConsent must be used within an AIChatConsentProvider');
  }
  return context;
}; 