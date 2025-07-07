# Changelog-System

Das Changelog-System zeigt automatisch nach App-Updates ein Modal mit den Änderungen der neuen Version an.

## Funktionalität

- **Automatische Erkennung**: Erkennt App-Updates durch Versionsverwaltung
- **Schöne Anzeige**: Ansprechendes Modal mit strukturierten Änderungen
- **Kategorisierung**: Unterscheidet zwischen Features, Verbesserungen und Bugfixes
- **Persistenz**: Merkt sich, welche Changelogs bereits angezeigt wurden
- **Mehrsprachigkeit**: Unterstützt Internationalisierung

## Komponenten

### 1. ChangelogService (`src/services/ChangelogService.ts`)
- Verwaltet Versionsverfolgung mit `react-native-device-info`
- Speichert letzte Version in AsyncStorage
- Erkennt Updates und gibt relevante Changelog-Einträge zurück

### 2. ChangelogModal (`src/components/ChangelogModal.tsx`)
- Zeigt Changelog-Einträge in einem schönen Modal an
- Gruppiert Änderungen nach Typ (Feature, Verbesserung, Bugfix)
- Responsive Design mit Dark/Light-Theme-Unterstützung

### 3. Changelog-Daten (`src/data/changelog.ts`)
- Strukturierte Datei mit allen Changelog-Einträgen
- Unterstützt Versionierung, Highlights und kategorisierte Änderungen

## Usage

### Neuen Changelog-Eintrag hinzufügen

1. **package.json Version erhöhen**:
   ```json
   {
     "version": "1.0.2"
   }
   ```

2. **Changelog-Eintrag zu `src/data/changelog.ts` hinzufügen**:
   ```typescript
   {
     version: '1.0.2',
     date: '2024-01-20',
     changes: [
       {
         type: 'feature',
         description: 'Neue Push-Benachrichtigungen'
       },
       {
         type: 'improvement',
         description: 'Verbesserte Performance'
       },
       {
         type: 'bugfix',
         description: 'Crash beim App-Start behoben'
       }
     ],
     highlights: [
       'Push-Benachrichtigungen halten dich auf dem Laufenden',
       'Schnellere App-Performance'
     ]
   }
   ```

3. **Build und Release**: Das System erkennt automatisch die neue Version

## Changelog-Typen

- **`feature`** ✨: Neue Funktionen
- **`improvement`** ⚡: Verbesserungen bestehender Features
- **`bugfix`** 🐛: Fehlerbehebungen
- **`breaking`** ⚠️: Breaking Changes

## Anpassungen

### Übersetzungen hinzufügen
Neue Übersetzungen zu `src/utils/locales/[language].json` hinzufügen:

```json
{
  "changelog_title": "What's new?",
  "changelog_subtitle": "We've improved the app for you!",
  "changelog_highlights": "Highlights",
  "changelog_changes": "Changes",
  "changelog_close": "Got it",
  "changelog_closing": "Closing..."
}
```

### Styling anpassen
Das Modal-Design kann in `src/components/ChangelogModal.tsx` angepasst werden:

```typescript
const getScaledStyles = (fontSize: number, isDarkMode: boolean) => {
  // Styling hier anpassen
};
```

## Testen

1. **Locale Entwicklung**: 
   - AsyncStorage leeren: `await AsyncStorage.clear()`
   - App neu starten

2. **Versionssimulation**:
   - `package.json` Version ändern
   - Changelog-Eintrag hinzufügen
   - App neu starten

## Technische Details

- **Versionserkennung**: `react-native-device-info` für App-Version
- **Persistenz**: AsyncStorage für letzte Version
- **Anzeige**: Modal nur bei tatsächlichen Updates
- **Performance**: Lazy loading der Changelog-Daten

## Deployment

Das System funktioniert automatisch:
1. Bei App-Update im Play Store wird neue Version erkannt
2. Modal erscheint beim ersten Start der neuen Version
3. Nutzer kann Changelog lesen und schließen
4. Modal wird nicht mehr angezeigt, bis zum nächsten Update

## Erweiterte Funktionen

- **Conditional Changelogs**: Basierend auf User-Typ oder Features
- **Remote Changelogs**: Laden von Server statt lokaler Datei
- **Analytics**: Tracking von Changelog-Ansichten
- **A/B Testing**: Verschiedene Changelog-Designs testen 