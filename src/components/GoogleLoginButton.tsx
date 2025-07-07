import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  View,
  Image,
} from 'react-native';
import GoogleAuthService, { GoogleUser } from '../services/GoogleAuthService';
import { useSettings } from '../context/SettingsContext';

interface GoogleLoginButtonProps {
  onSuccess: (user: GoogleUser) => void;
  onError?: (error: string) => void;
  style?: object;
  disabled?: boolean;
  loading?: boolean;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  style,
  disabled = false,
  loading = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { theme, fontSizeScale, baseFontSize } = useSettings();
  
  const isDarkMode = theme === 'dark';
  const scaledFontSize = baseFontSize * fontSizeScale;
  const dynamicStyles = getDynamicStyles(isDarkMode, scaledFontSize);

  const handleGoogleSignIn = async () => {
    if (disabled || loading || isLoading) return;

    setIsLoading(true);
    
    try {
      const user = await GoogleAuthService.signIn();
      onSuccess(user);
    } catch (error: any) {
      const errorMessage = error.message || 'Anmeldefehler';
      console.error('Google Login Fehler:', errorMessage);
      
      if (onError) {
        onError(errorMessage);
      } else {
        Alert.alert('Anmeldefehler', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = disabled || loading || isLoading;

  return (
    <TouchableOpacity
      style={[
        dynamicStyles.googleButton,
        style,
        isButtonDisabled && dynamicStyles.disabledButton,
      ]}
      onPress={handleGoogleSignIn}
      disabled={isButtonDisabled}
      activeOpacity={0.8}
    >
      <View style={dynamicStyles.buttonContent}>
        {!isLoading && (
          <View style={dynamicStyles.googleIcon}>
            <Text style={dynamicStyles.googleIconText}>G</Text>
          </View>
        )}
        
        {(isLoading || loading) ? (
          <ActivityIndicator 
            size="small" 
            color={isDarkMode ? '#9ca3af' : '#757575'} 
            style={dynamicStyles.loader}
          />
        ) : null}
        
        <Text style={[
          dynamicStyles.buttonText,
          isButtonDisabled && dynamicStyles.disabledText
        ]}>
          {isLoading ? 'Anmeldung läuft...' : 'Mit Google anmelden'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const getDynamicStyles = (isDarkMode: boolean, fontSize: number) => {
  return StyleSheet.create({
    googleButton: {
      backgroundColor: isDarkMode ? '#2d3748' : '#ffffff',
      borderWidth: 1,
      borderColor: isDarkMode ? '#4a5568' : '#dadce0',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: isDarkMode ? '#000' : '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 1,
      elevation: isDarkMode ? 3 : 1,
    },
    disabledButton: {
      opacity: 0.6,
      backgroundColor: isDarkMode ? '#1a202c' : '#f5f5f5',
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    googleIcon: {
      width: 20,
      height: 20,
      backgroundColor: '#4285f4',
      borderRadius: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    googleIconText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: 'bold',
    },
    buttonText: {
      color: isDarkMode ? '#e2e8f0' : '#3c4043',
      fontSize: fontSize,
      fontWeight: '500',
    },
    disabledText: {
      color: isDarkMode ? '#718096' : '#9aa0a6',
    },
    loader: {
      marginRight: 12,
    },
  });
};

export default GoogleLoginButton; 