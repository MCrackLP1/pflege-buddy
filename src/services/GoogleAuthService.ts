import { GoogleSignin, statusCodes, User } from '@react-native-google-signin/google-signin';

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  photo?: string;
  givenName?: string;
  familyName?: string;
  idToken?: string; // Für Cloud-Authentifizierung
}

class GoogleAuthService {
  private initialized = false;

  /**
   * Initialisiert Google Sign-In
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      GoogleSignin.configure({
        webClientId: '89302045591-m0m45if2grallu6ups7ih92gekp919as.apps.googleusercontent.com',
        offlineAccess: false, // Setze auf true, wenn du Refresh Tokens brauchst
        hostedDomain: '', // Leer für alle Google-Accounts
        forceCodeForRefreshToken: true,
        accountName: '',
        iosClientId: '', // Wird später für iOS benötigt
        googleServicePlistPath: '', // Wird später für iOS benötigt
      });

      this.initialized = true;
      console.log('Google Sign-In erfolgreich initialisiert');
    } catch (error) {
      console.error('Fehler bei Google Sign-In Initialisierung:', error);
      throw error;
    }
  }

  /**
   * Prüft, ob Google Sign-In verfügbar ist
   */
  async isSignInAvailable(): Promise<boolean> {
    try {
      return await GoogleSignin.hasPlayServices();
    } catch (error) {
      console.log('Google Play Services nicht verfügbar:', error);
      return false;
    }
  }

  /**
   * Meldet den Benutzer an
   */
  async signIn(): Promise<GoogleUser> {
    try {
      await this.initialize();
      
      const hasPlayServices = await this.isSignInAvailable();
      if (!hasPlayServices) {
        throw new Error('Google Play Services sind nicht verfügbar');
      }

      const userInfo = await GoogleSignin.signIn();
      
      if (userInfo.user) {
        const googleUser: GoogleUser = {
          id: userInfo.user.id,
          name: userInfo.user.name || '',
          email: userInfo.user.email,
          photo: userInfo.user.photo || undefined,
          givenName: userInfo.user.givenName || undefined,
          familyName: userInfo.user.familyName || undefined,
          idToken: userInfo.idToken || undefined, // Für Cloud-Authentifizierung
        };

        console.log('Google Sign-In erfolgreich:', googleUser);
        return googleUser;
      } else {
        throw new Error('Keine Benutzerdaten erhalten');
      }
    } catch (error: any) {
      console.error('Google Sign-In Fehler:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Anmeldung abgebrochen');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Anmeldung bereits in Bearbeitung');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services nicht verfügbar');
      } else {
        throw new Error('Anmeldefehler: ' + (error.message || 'Unbekannter Fehler'));
      }
    }
  }

  /**
   * Meldet den Benutzer ab
   */
  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
      console.log('Google Sign-Out erfolgreich');
    } catch (error) {
      console.error('Google Sign-Out Fehler:', error);
      throw error;
    }
  }

  /**
   * Prüft, ob ein Benutzer bereits angemeldet ist
   */
  async isSignedIn(): Promise<boolean> {
    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      console.error('Fehler bei Anmeldestatus-Prüfung:', error);
      return false;
    }
  }

  /**
   * Holt die aktuellen Benutzerdaten
   */
  async getCurrentUser(): Promise<GoogleUser | null> {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      
      if (userInfo.user) {
        return {
          id: userInfo.user.id,
          name: userInfo.user.name || '',
          email: userInfo.user.email,
          photo: userInfo.user.photo || undefined,
          givenName: userInfo.user.givenName || undefined,
          familyName: userInfo.user.familyName || undefined,
          idToken: userInfo.idToken || undefined,
        };
      }
      
      return null;
    } catch (error) {
      console.log('Kein Benutzer angemeldet oder Fehler:', error);
      return null;
    }
  }

  /**
   * Widerruft den Zugang komplett
   */
  async revokeAccess(): Promise<void> {
    try {
      await GoogleSignin.revokeAccess();
      console.log('Google-Zugang widerrufen');
    } catch (error) {
      console.error('Fehler beim Widerrufen des Zugangs:', error);
      throw error;
    }
  }
}

export default new GoogleAuthService(); 