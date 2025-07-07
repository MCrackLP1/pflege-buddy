/**
 * @fileoverview Typdefinitionen für die PflegeApp
 * @module types
 * @description
 * Diese Datei enthält alle TypeScript-Typdefinitionen und Interfaces
 * für die PflegeApp. Sie definiert die Datenstrukturen für Krankheiten,
 * Notfälle, Pflegestandards, Navigation und Kontexte.
 */

/**
 * Interface für Krankheiten basierend auf ICD-10
 * @interface Disease
 * @property {string} code - ICD-10 Code
 * @property {string} name - Name der Krankheit
 * @property {string} fachgebiet - Fachgebiet der Krankheit
 */
export interface Disease {
  code: string;
  name: string;
  fachgebiet: string;
}

/**
 * Typ für Notfall-IDs
 * @typedef {string} EmergencyId
 * @description
 * Enthält alle möglichen Notfalltypen in der App
 */
export type EmergencyId =
  | 'atemnot'
  | 'brustschmerz'
  | 'hypoglykaemie'
  | 'sturz'
  | 'fieber_sepsis'
  | 'blutung'
  | 'allergie_anaphylaxie'
  | 'krampfanfall'
  | 'schlaganfallverdacht'
  | 'dehydratation'
  | 'erbrechen_diarrhoe'
  | 'schmerz_akut'
  | 'verwirrtheit_delir'
  | 'schluckstoerung'
  | 'harnverhalt'
  | 'hypertensive_krise'
  | 'wundinfektion'
  | 'synkope_kollaps'
  | 'verhaltensnotfall'
  | 'lungenembolie_verdacht';

/**
 * Interface für einzelne Notfallschritte
 * @interface EmergencyStep
 * @property {string} id - Eindeutige ID des Schritts
 * @property {string} text - Beschreibung des Schritts
 * @property {string} [icon] - Optional: Icon-Name
 * @property {'ionicons' | 'material' | 'fa5'} [iconType] - Optional: Icon-Typ
 */
export interface EmergencyStep {
  readonly id: string;
  readonly text: string;
  readonly icon?: string;
  readonly iconType?: 'ionicons' | 'material' | 'fa5';
}

/**
 * Interface für Notfall-Checklisten
 * @interface EmergencyChecklistData
 * @property {EmergencyId} id - ID des Notfalls
 * @property {string} title - Titel der Checkliste
 * @property {string} icon - Icon für die Checkliste
 * @property {readonly EmergencyStep[]} steps - Schritte der Checkliste
 */
export interface EmergencyChecklistData {
  readonly id: EmergencyId;
  readonly title: string;
  readonly icon: string;
  readonly steps: readonly EmergencyStep[];
}

/**
 * Interface für Pflegestandards
 * @interface NursingStandard
 * @property {string} id - Eindeutige ID des Standards
 * @property {string} title - Titel des Standards
 * @property {string} ziel - Zielsetzung des Standards
 * @property {readonly string[]} [strukturkriterien] - Optional: Strukturkriterien
 * @property {readonly string[]} [prozesskriterien] - Optional: Prozesskriterien
 * @property {readonly string[]} [ergebniskriterien] - Optional: Ergebniskriterien
 * @property {string} [details] - Optional: Zusätzliche Details
 */
export interface NursingStandard {
  readonly id: string;
  readonly title?: string;
  readonly ziel?: string;
  readonly strukturkriterien?: readonly string[];
  readonly prozesskriterien?: readonly string[];
  readonly ergebniskriterien?: readonly string[];
  readonly details?: string;
}

/**
 * Interface für Lexikon-Einträge
 * @interface LexikonEntry
 * @property {string} id - Eindeutige ID des Eintrags
 * @property {string} term - Der Begriff
 * @property {string} definition - Kurze Definition des Begriffs
 * @property {string} [description] - Optional: Ausführliche Beschreibung
 * @property {string} [category] - Optional: Kategorie (z.B. "Medizintechnik", "Diagnostik")
 * @property {string[]} [indications] - Optional: Indikationen/Anwendungsgebiete
 * @property {string[]} [contraindications] - Optional: Kontraindikationen
 * @property {string[]} [nursingConsiderations] - Optional: Pflegehinweise
 * @property {string[]} [complications] - Optional: Mögliche Komplikationen
 * @property {string[]} [materials] - Optional: Benötigte Materialien
 * @property {string} [procedure] - Optional: Durchführung/Ablauf
 * @property {string[]} [monitoring] - Optional: Überwachungsparameter
 * @property {string[]} [keyPoints] - Optional: Wichtige Punkte zu beachten
 */
export interface LexikonEntry {
  readonly id: string;
  readonly term: string;
  readonly definition: string;
  readonly description?: string;
  readonly category?: string;
  readonly indications?: readonly string[];
  readonly contraindications?: readonly string[];
  readonly nursingConsiderations?: readonly string[];
  readonly complications?: readonly string[];
  readonly materials?: readonly string[];
  readonly procedure?: string;
  readonly monitoring?: readonly string[];
  readonly keyPoints?: readonly string[];
}

// Navigation-Typen
export type FachgebietDetailParams = {
  fachgebietName: string;
};

export type EmergencyChecklistParams = {
  emergencyId?: EmergencyId;
};

export type StandardDetailParams = {
  standardId: string;
};

export type LexikonDetailParams = {
  termId: string;
};

export type MedizinSearchParams = {
  initialSearch?: string;
};

export type MedicalTermSearchParams = {
  initialQuery?: string;
};

export type BottomTabParamList = {
  HomeStack: undefined;
  WissenStack: undefined;
  ToolsStack: undefined;
  EinstellungenStack: undefined;
};

// Das NavigationParams-Interface erlaubt flexible Parameter für alle Screens
export interface NavigationParams {
  screen?: string;
  params?: any;
  WissenListen: undefined;
  LexikonListen: undefined;
  LexikonDetail: LexikonDetailParams;
  MedicationSearch: undefined;
  LaborparameterScreen: undefined;
  LaborparameterDetail: undefined;
}

// RootStackParamList enthält alle Routen für die App
export type RootStackParamList = {
  // Home-Stack
  Welcome: undefined;
  Home: undefined;
  EmergencyChecklist: EmergencyChecklistParams;
  Chat: undefined;

  // Wissen-Stack
  WissenLanding: undefined;
  WissenListen: undefined;
  LexikonListen: undefined;
  LexikonDetail: LexikonDetailParams;
  MedicationSearch: undefined;
  LaborparameterScreen: undefined;
  LaborparameterDetail: undefined;

  // Standards-Stack
  StandardsLanding: undefined;
  StandardDetail: StandardDetailParams;

  // Tools-Stack
  ToolsLanding: undefined;
  WoundAssessment: undefined;
  FrequencyCounter: undefined;
  Contacts: undefined;
  NutritionCalculator: undefined;
  MedicationCalculator: undefined;
  Documentation: undefined;
  InteractiveCasesLanding: undefined;
  DecisionTreeSimulation: { simulationId: string };
  SkillTrainerSimulation: { simulationId: string };
  Statistics: undefined;

  // Einstellungen-Stack
  EinstellungenLanding: undefined;
  Impressum: undefined;
  Datenschutz: undefined;
  MedicalTermsAdmin: undefined;

  // Gemeinsame Screens
  MedizinSearch: MedizinSearchParams;
  MedicalTermSearch: MedicalTermSearchParams;

  // Quellen-Stack
  Quellen?: undefined;
  Sources?: undefined;
};

/**
 * Interface für SettingsContext
 * @interface SettingsContextProps
 * @property {'light' | 'dark'} theme - Aktuelles Theme
 * @property {(theme: 'light' | 'dark') => void} setTheme - Funktion zum Ändern des Themes
 * @property {number} fontSizeScale - Aktuelle Schriftgrößen-Skalierung
 * @property {() => void} increaseFontSize - Funktion zum Erhöhen der Schriftgröße
 * @property {() => void} decreaseFontSize - Funktion zum Verringern der Schriftgröße
 * @property {number} baseFontSize - Basis-Schriftgröße
 */
export interface SettingsContextProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  fontSizeScale: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  baseFontSize: number;
}

/**
 * Interface für DisclaimerContext
 * @interface DisclaimerContextProps
 * @property {boolean} disclaimerAccepted - Status der Disclaimer-Akzeptanz
 * @property {(accepted: boolean) => void} setDisclaimerAccepted - Funktion zum Setzen des Disclaimer-Status
 * @property {string | null} acceptedAt - Akzeptanzdatum des Disclaimers
 */
export interface DisclaimerContextProps {
  disclaimerAccepted: boolean;
  setDisclaimerAccepted: (accepted: boolean) => void;
  acceptedAt?: string | null;
  syncWithGoogle: (googleUser: any) => Promise<void>;
  isSyncing?: boolean;
  lastSyncAt?: string | null;
}

// Simulation Progress Types
export interface SimulationProgress {
  simulationId: string;
  simulationType: 'decision_tree' | 'skill_trainer';
  isCompleted: boolean;
  completedAt?: Date;
  score?: number; // Für skill_trainer: Anzahl richtig beantworteter Fragen
  totalQuestions?: number; // Für skill_trainer: Gesamtanzahl Fragen
  completedNodes?: string[]; // Für decision_tree: Besuchte Knoten
  bestPath?: boolean; // Für decision_tree: Ob der optimale Pfad genommen wurde
  attempts: number;
  lastAttemptAt: Date;
}

export interface SimulationStatistics {
  totalSimulations: number;
  completedSimulations: number;
  completionRate: number;
  totalAttempts: number;
  averageScore: number;
  lastActivity: Date;
}
