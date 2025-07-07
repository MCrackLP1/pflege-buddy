/**
 * @fileoverview Changelog-Daten für App-Updates
 * @module Changelog
 * @description
 * Diese Datei enthält alle Changelog-Einträge für App-Updates.
 * Jeder Eintrag beschreibt die Änderungen einer bestimmten Version.
 */

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: 'feature' | 'improvement' | 'bugfix' | 'breaking';
    description: string;
  }[];
  highlights?: string[];
}

/**
 * Changelog-Einträge sortiert nach Version (neueste zuerst)
 * @constant {ChangelogEntry[]}
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.0.3',
    date: '2024-01-17',
    changes: [
      {
        type: 'feature',
        description: 'Google OAuth Integration mit vollständiger Authentifizierung'
      },
      {
        type: 'feature',
        description: 'Changelog-System mit automatischer Update-Erkennung'
      },
      {
        type: 'feature',
        description: 'Cloud Backend Service für Google-Synchronisation'
      },
      {
        type: 'feature',
        description: 'Internationalisierung mit 9 Sprachen (DE, EN, FR, ES, IT, PL, RU, TR, AR)'
      },
      {
        type: 'feature',
        description: 'AI-Chat-System mit Einverständniserklärung'
      },
      {
        type: 'feature',
        description: 'Interaktives Simulationssystem (Decision Tree & Skill Trainer)'
      },
      {
        type: 'feature',
        description: 'Immersive Mode für Android Edge-to-Edge Experience'
      },
      {
        type: 'feature',
        description: 'Professioneller Splash Screen mit Video-Support'
      },
      {
        type: 'feature',
        description: 'Statistiken und Fortschritts-Tracking'
      },
      {
        type: 'feature',
        description: 'Erweiterte Kontakte-Synchronisation mit Google'
      },
      {
        type: 'improvement',
        description: 'Error Boundary für bessere Fehlerbehandlung'
      },
      {
        type: 'improvement',
        description: 'Professionelles Logger-System'
      },
      {
        type: 'improvement',
        description: 'Erweiterte UI-Komponenten (StyledComponents, ProgressComponents)'
      },
      {
        type: 'improvement',
        description: 'Umfassende Dokumentation für alle neuen Features'
      },
      {
        type: 'breaking',
        description: 'iOS-Unterstützung entfernt (Android-Only App)'
      },
      {
        type: 'breaking',
        description: 'Location/Work-Time-Tracking Features entfernt'
      }
    ],
    highlights: [
      'Vollständige Google-Integration mit OAuth und Cloud-Sync',
      'Mehrsprachige Benutzeroberfläche (9 Sprachen)',
      'AI-Chat-System für intelligente Pflegeberatung',
      'Interaktive Lern-Simulationen für Pflegekräfte',
      'Moderne Android-App mit Edge-to-Edge Design',
      'Professionelles Changelog- und Update-System'
    ]
  },
  {
    version: '1.0.2',
    date: '2024-01-16',
    changes: [
      {
        type: 'feature',
        description: 'Google-Haftungsausschluss-Synchronisation implementiert'
      },
      {
        type: 'improvement',
        description: 'Google Login Button für Dark Mode optimiert'
      },
      {
        type: 'improvement',
        description: 'Sync-Status Anzeige in Einstellungen hinzugefügt'
      }
    ],
    highlights: [
      'Haftungsausschluss wird jetzt mit Google-Konto synchronisiert',
      'Verbesserte Dark Mode Unterstützung'
    ]
  },
  {
    version: '1.0.1',
    date: '2024-01-15',
    changes: [
      {
        type: 'feature',
        description: 'Neues Changelog-System für App-Updates'
      },
      {
        type: 'improvement',
        description: 'Verbesserte Performance der Medikamentensuche'
      },
      {
        type: 'bugfix',
        description: 'Behebung eines Fehlers bei der Datensynchronisation'
      }
    ],
    highlights: [
      'Automatische Changelog-Anzeige nach Updates',
      'Bessere Benutzererfahrung'
    ]
  },
  {
    version: '1.0.0',
    date: '2024-01-01',
    changes: [
      {
        type: 'feature',
        description: 'Erste stabile Version der PflegeApp'
      },
      {
        type: 'feature',
        description: 'Vollständige Medikamentendatenbank'
      },
      {
        type: 'feature',
        description: 'Interaktive Fallsimulationen'
      }
    ],
    highlights: [
      'Komplette Pflege-App mit allen Grundfunktionen',
      'Offline-Funktionalität'
    ]
  }
];

/**
 * Hilfsfunktion um Changelog-Eintrag für eine bestimmte Version zu finden
 * @param version - Die gesuchte Version
 * @returns Der Changelog-Eintrag oder undefined
 */
export const getChangelogForVersion = (version: string): ChangelogEntry | undefined => {
  return CHANGELOG.find(entry => entry.version === version);
};

/**
 * Hilfsfunktion um alle Changelog-Einträge seit einer bestimmten Version zu erhalten
 * @param sinceVersion - Die Basisversion
 * @returns Array von Changelog-Einträgen
 */
export const getChangelogSince = (sinceVersion: string): ChangelogEntry[] => {
  const sinceIndex = CHANGELOG.findIndex(entry => entry.version === sinceVersion);
  if (sinceIndex === -1) return CHANGELOG;
  return CHANGELOG.slice(0, sinceIndex);
}; 