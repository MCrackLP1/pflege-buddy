# Google OAuth Setup für Pflege-Buddy

## 🔧 **Benötigte Schritte**

### 1. **Google Cloud Console konfigurieren**

#### a) SHA1-Fingerprint hinzufügen
Gehe zu [Google Cloud Console](https://console.cloud.google.com/) → Dein Projekt → APIs & Services → Credentials

Füge diese SHA1-Fingerprints hinzu:
- **Debug**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- **Release**: `D3:A3:0E:9D:74:E4:21:0F:5E:5F:72:00:56:33:51:5C:7C:6E:A1:A4`

#### b) OAuth 2.0 Client IDs
Stelle sicher, dass du diese Client-IDs hast:
- **Android**: `89302045591-m0m45if2grallu6ups7ih92gekp919as.apps.googleusercontent.com`
- **Web**: Wird für die Konfiguration benötigt

### 2. **google-services.json herunterladen**

1. Gehe zu Project Settings in der Firebase Console
2. Lade die `google-services.json` Datei herunter
3. **Ersetze die Platzhalter-Datei** `android/app/google-services.json` mit deiner echten Datei

### 3. **App testen**

```bash
# App neu builden
npm run android

# Oder für Clean Build
cd android
./gradlew clean
cd ..
npm run android
```

## 🎯 **Verwendung in der App**

### Basic Usage
```typescript
import GoogleLoginButton from '../components/GoogleLoginButton';
import { GoogleUser } from '../services/GoogleAuthService';

const handleSuccess = (user: GoogleUser) => {
  console.log('Angemeldet als:', user.name, user.email);
};

const handleError = (error: string) => {
  console.error('Login fehler:', error);
};

return (
  <GoogleLoginButton
    onSuccess={handleSuccess}
    onError={handleError}
  />
);
```

### Advanced Usage
```typescript
import GoogleAuthService from '../services/GoogleAuthService';

// Prüfe Anmeldestatus
const isSignedIn = await GoogleAuthService.isSignedIn();

// Hole aktuellen Benutzer
const currentUser = await GoogleAuthService.getCurrentUser();

// Abmelden
await GoogleAuthService.signOut();

// Zugang komplett widerrufen
await GoogleAuthService.revokeAccess();
```

## 🛠️ **API-Methoden**

### GoogleAuthService

| Methode | Beschreibung |
|---------|-------------|
| `initialize()` | Initialisiert Google Sign-In |
| `isSignInAvailable()` | Prüft Play Services Verfügbarkeit |
| `signIn()` | Meldet Benutzer an |
| `signOut()` | Meldet Benutzer ab |
| `isSignedIn()` | Prüft Anmeldestatus |
| `getCurrentUser()` | Holt aktuellen Benutzer |
| `revokeAccess()` | Widerruft Zugang komplett |

### GoogleUser Interface
```typescript
interface GoogleUser {
  id: string;
  name: string;
  email: string;
  photo?: string;
  givenName?: string;
  familyName?: string;
}
```

## 🔐 **Sicherheit**

- Die App verwendet nur die notwendigen Berechtigungen
- Client-ID ist öffentlich (das ist normal für OAuth)
- Echte Authentifizierung erfolgt über Google's Server
- Keine Passwörter werden in der App gespeichert

## 🚀 **Bereitstellung**

### Für Release-Build
1. Stelle sicher, dass der Release-SHA1-Fingerprint in Google Console eingetragen ist
2. Verwende die echte `google-services.json` (nicht die Platzhalter-Version)
3. Teste mit Release-Build vor Veröffentlichung

### Für Play Store
Der Release-Keystore ist bereits konfiguriert mit:
- **Package**: `com.pflegebuddy.gbr`
- **SHA1**: `D3:A3:0E:9D:74:E4:21:0F:5E:5F:72:00:56:33:51:5C:7C:6E:A1:A4`

## 🔧 **Problembehandlung**

### Häufige Fehler

1. **"Google Play Services nicht verfügbar"**
   - Stelle sicher, dass Google Play Services auf dem Gerät installiert sind
   - Teste auf einem echten Android-Gerät

2. **"Ungültiger SHA1-Fingerprint"**
   - Überprüfe, ob der SHA1-Fingerprint in Google Console korrekt eingetragen ist
   - Verwende den korrekten Fingerprint für Debug/Release

3. **"google-services.json nicht gefunden"**
   - Stelle sicher, dass die Datei in `android/app/google-services.json` liegt
   - Ersetze die Platzhalter-Datei mit deiner echten Datei

4. **"Client-ID nicht gefunden"**
   - Überprüfe die Client-ID in `GoogleAuthService.ts`
   - Stelle sicher, dass sie mit der in Google Console übereinstimmt

### Debug-Tipps
```bash
# Prüfe SHA1-Fingerprint
keytool -keystore android/app/debug.keystore -list -v -storepass android

# Prüfe Release-Fingerprint
keytool -keystore android/app/release.keystore -list -v -storepass "Killingyou11!"

# Clean Build
cd android && ./gradlew clean && cd .. && npm run android
```

## 📱 **Wo zu finden**

Die Google Login-Funktionalität ist bereits im **Einstellungen-Screen** integriert:
- Navigiere zu "Einstellungen"
- Scrolle zum "Google Account" Bereich
- Klicke "Mit Google anmelden"

## 🎨 **Anpassung**

### GoogleLoginButton anpassen
```typescript
<GoogleLoginButton
  onSuccess={handleSuccess}
  onError={handleError}
  style={{ marginTop: 20 }}
  disabled={loading}
/>
```

### Eigene Login-UI erstellen
```typescript
const handleLogin = async () => {
  try {
    const user = await GoogleAuthService.signIn();
    // Deine eigene Logik hier
  } catch (error) {
    // Fehlerbehandlung
  }
};
```

---

**Hinweis**: Diese Implementierung ist produktionsbereit und folgt den Google-Richtlinien für OAuth 2.0. 