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
  readonly title: string;
  readonly ziel: string;
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
 * @property {string} definition - Definition des Begriffs
 */
export interface LexikonEntry {
  readonly id: string;
  readonly term: string;
  readonly definition: string;
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
  WelcomeTab: { screen?: string; params?: any } | undefined;
  HomeTab: { screen?: string; params?: any } | undefined;
  WissenTab: { screen?: string; params?: any } | undefined;
  ToolsTab: { screen?: string; params?: any } | undefined;
  EinstellungenTab: { screen?: string; params?: any } | undefined;
};

// Das NavigationParams-Interface erlaubt flexible Parameter für alle Screens
export interface NavigationParams {
  screen?: string;
  params?: any;
}

// Arbeitszeiterfassung
export interface WorkLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number; // Radius für Geofencing in Metern
}

export interface WorkTime {
  id: string;
  locationId: string;
  startTime: string; // ISO-String
  endTime: string | null; // ISO-String, null wenn noch aktiv
  breakDuration: number; // in Minuten
  isComplete: boolean;
  notes?: string;
}

// RootStackParamList enthält alle Routen für die App
export type RootStackParamList = {
  // Home-Stack
  Welcome: undefined;
  Home: undefined;
  EmergencyChecklist: EmergencyChecklistParams;
  
  // Wissen-Stack
  WissenLanding: undefined;
  WissenListen: undefined;
  LexikonListen: undefined;
  LexikonDetail: LexikonDetailParams;
  MedicationSearch: undefined;
  
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
  WorkTimeTracker: undefined;
  Documentation: undefined;
  WorkLocationMap: {
    initialLocation?: {latitude: number, longitude: number};
    editLocationId?: string;
  };
  
  // Einstellungen-Stack
  EinstellungenLanding: undefined;
  Impressum: undefined;
  Datenschutz: undefined;
  MedicalTermsAdmin: undefined;
  LocationTest: undefined;
  
  // Gemeinsame Screens
  MedizinSearch: MedizinSearchParams;
  MedicalTermSearch: MedicalTermSearchParams;
  
  // Tab-Navigation
  HomeTab: NavigationParams | undefined;
  WissenTab: NavigationParams | undefined;
  ToolsTab: NavigationParams | undefined;
  EinstellungenTab: NavigationParams | undefined;
  
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
} 