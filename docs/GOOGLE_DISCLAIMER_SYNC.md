# Google-Haftungsausschluss-Synchronisation

Das Google-Haftungsausschluss-Synchronisation-Feature stellt sicher, dass der Haftungsausschluss-Status des Benutzers mit seinem Google-Konto synchronisiert wird.

## Funktionalität

### 🔄 Automatische Synchronisation
- **Bei Google-Anmeldung**: Der Haftungsausschluss-Status wird automatisch synchronisiert
- **Bei App-Start**: Wenn bereits ein Google-Konto angemeldet ist, wird der Status abgeglichen
- **Bidirektional**: Lokale und Cloud-Daten werden verglichen und der neueste Status übernommen

### 📱 Hybride Speicherung
- **Lokal**: AsyncStorage für Offline-Verfügbarkeit
- **Cloud**: CloudBackendService für Synchronisation zwischen Geräten
- **Fallback**: Funktioniert auch ohne Internet-Verbindung

## Implementierung

### 1. DisclaimerContext Erweiterung
```typescript
// Neue Funktionen im DisclaimerContext
interface DisclaimerContextProps {
  // ... bestehende Properties
  syncWithGoogle: (googleUser: any) => Promise<void>;
  isSyncing?: boolean;
  lastSyncAt?: string | null;
}
```

### 2. CloudBackendService Erweiterung
```typescript
// Neue Interfaces für Disclaimer-Daten
interface DisclaimerData {
  accepted: boolean;
  acceptedAt: string | null;
  version: string;
  userAgent: string;
  ipAddress?: string;
  lastModified: string;
  deviceId: string;
}

// Neue Sync-Methoden
async syncDisclaimer(disclaimerData: DisclaimerData): Promise<CloudBackendResponse<DisclaimerData>>
async loadDisclaimer(): Promise<CloudBackendResponse<DisclaimerData>>
```

### 3. Automatische Integration
- **EinstellungenScreen**: Zeigt Sync-Status an
- **Google Login**: Löst automatisch Synchronisation aus
- **App-Start**: Prüft und synchronisiert bei bestehender Anmeldung

## Benutzerfreundlichkeit

### 📊 Sync-Status Anzeige
In den Einstellungen wird der aktuelle Synchronisations-Status angezeigt:
- 🔄 **Wird synchronisiert...** (während Sync-Vorgang)
- ✅ **Zuletzt synchronisiert: DD.MM.YYYY HH:MM** (erfolgreich)
- ⏳ **Noch nicht synchronisiert** (noch kein Sync durchgeführt)

### 🔒 Datenschutz & Sicherheit
- **GDPR-konform**: Verknüpfung mit Google-Konto
- **Verschlüsselung**: Daten werden verschlüsselt übertragen
- **Minimale Daten**: Nur notwendige Informationen werden gespeichert
- **Lokale Kontrolle**: Benutzer kann weiterhin lokal den Status ändern

## Konfliktlösung

### 📅 Zeitbasierte Priorisierung
Wenn sowohl lokale als auch Cloud-Daten vorhanden sind:
1. **Akzeptiert vs. Nicht-Akzeptiert**: Akzeptiert hat Priorität
2. **Zeitstempel**: Neuester `lastModified` Timestamp gewinnt
3. **Fallback**: Bei gleichen Zeitstempeln wird Cloud-Version bevorzugt

### 🔄 Sync-Strategien
- **Erste Anmeldung**: Lokale Daten werden zur Cloud übertragen
- **Bestehendes Konto**: Cloud- und lokale Daten werden verglichen
- **Neueste Version**: Der neueste Status wird auf allen Geräten angewendet

## Integration mit bestehenden Features

### 🔗 Kompatibilität
- **Changelog-System**: Funktioniert weiterhin unabhängig
- **Disclaimer-Modal**: Löst automatisch Sync aus nach Akzeptierung
- **Offline-Modus**: Lokale Funktionalität bleibt erhalten
- **Kontakt-Sync**: Läuft parallel zur Disclaimer-Synchronisation

### 🛠️ Entwicklung
- **Logging**: Umfangreiches Logging für Debugging
- **Error Handling**: Graceful Degradation bei Netzwerkproblemen
- **Testing**: Unit Tests für alle Sync-Funktionen
- **Performance**: Minimale Auswirkung auf App-Performance

## Verwendung

### Für Entwickler
```typescript
// Disclaimer-Synchronisation manuell auslösen
const { syncWithGoogle } = useDisclaimer();
await syncWithGoogle(googleUser);
```

### Für Benutzer
1. **Google-Anmeldung**: In Einstellungen mit Google-Konto anmelden
2. **Automatisch**: Haftungsausschluss wird automatisch synchronisiert
3. **Status prüfen**: Sync-Status in Einstellungen einsehen
4. **Gerätewechsel**: Status wird auf neuen Geräten wiederhergestellt

## Vorteile

✅ **Geräteübergreifend**: Status ist auf allen Geräten verfügbar
✅ **Rechtssicher**: Verknüpfung mit Google-Konto für Nachverfolgung
✅ **Benutzerfreundlich**: Automatische Synchronisation ohne manuelle Eingriffe
✅ **Robust**: Funktioniert auch bei Netzwerkproblemen
✅ **Transparent**: Benutzer sieht Sync-Status in Einstellungen
✅ **Sicher**: Verschlüsselte Übertragung und minimale Datensammlung

## Technische Details

### Backend-Integration
- **Endpoint**: `/api/sync/disclaimer`
- **Authentifizierung**: Google ID Token
- **Payload**: DisclaimerData Interface
- **Response**: CloudBackendResponse<DisclaimerData>

### Speicherung
- **Lokal**: AsyncStorage mit Versionierung
- **Cloud**: Verknüpft mit Google User ID
- **Backup**: Lokale Daten als Fallback

### Fehlerbehandlung
- **Netzwerkfehler**: Lokale Daten werden verwendet
- **Authentifizierungsfehler**: Sync wird übersprungen
- **Dateninkompatibilität**: Fallback auf lokale Daten
- **Retry-Mechanismus**: Automatischer Wiederholungsversuch

Das System ist darauf ausgelegt, nahtlos zu funktionieren und den Benutzer nicht mit technischen Details zu belasten, während es gleichzeitig rechtssichere Nachverfolgung des Haftungsausschlusses ermöglicht. 