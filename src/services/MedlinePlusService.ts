import { mockSearchResults, mockMedicationResults } from './MedlinePlusMockData';

/**
 * MedlinePlus Connect API Service
 * Dokumentation: https://medlineplus.gov/connect/service.html
 */

// Basis-URL für die MedlinePlus Connect API
const BASE_URL = 'https://connect.medlineplus.gov/service';

// Flag zur Steuerung, ob Mock-Daten oder echte API-Anfragen verwendet werden
const USE_MOCK_DATA = true; // Für die Entwicklung auf true setzen

// Unterstützte Sprachen
export type Language = 'en' | 'es' | 'de';

// Interface für die API-Antwort
export interface MedlinePlusResponse {
  feed: {
    entry?: Array<{
      title: string;
      link: Array<{
        href: string;
        title?: string;
      }>;
      summary: string;
      category?: Array<{
        term: string;
        label: string;
      }>;
    }>;
    title: string;
  };
}

/**
 * Holt Gesundheitsinformationen basierend auf ICD-10 Code
 * @param icdCode ICD-10 Code (z.B. "E11" für Diabetes Typ 2)
 * @param language Sprache für die Ergebnisse (Standard: Englisch)
 * @returns Promise mit den gefundenen Informationen
 */
export const getMedicalInfoByICD = async (
  icdCode: string, 
  language: Language = 'en'
): Promise<MedlinePlusResponse> => {
  // Wenn Mock-Daten verwendet werden sollen
  if (USE_MOCK_DATA) {
    // Für Mock-Daten auf Basis des ICD-Codes
    const normalizedCode = icdCode.toUpperCase().trim();
    const mockData = mockSearchResults.icd[normalizedCode as keyof typeof mockSearchResults.icd];

    if (mockData) {
      return mockData;
    }
    
    // Fallback-Antwort, wenn keine Daten für diesen Code vorhanden sind
    return {
      feed: {
        title: `Keine Ergebnisse für ICD-Code ${icdCode}`,
        entry: []
      }
    };
  } 
  
  // Echter API-Aufruf mit fetch
  try {
    const url = new URL(BASE_URL);
    url.searchParams.append('mainSearchCriteria', `ICD10CM^${icdCode}`);
    url.searchParams.append('knowledgeResponseType', 'application/json');
    url.searchParams.append('lang', language === 'de' ? 'en' : language); // Da MedlinePlus kein Deutsch unterstützt

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP Fehler! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Abrufen von MedlinePlus-Daten:', error);
    throw error;
  }
};

/**
 * Sucht nach medizinischen Informationen basierend auf Suchbegriff
 * @param searchTerm Suchbegriff (z.B. "Diabetes", "Hypertonie")
 * @param language Sprache für die Ergebnisse (Standard: Englisch)
 * @returns Promise mit den gefundenen Informationen
 */
export const searchMedicalInfo = async (
  searchTerm: string,
  language: Language = 'en'
): Promise<MedlinePlusResponse> => {
  // Wenn Mock-Daten verwendet werden sollen
  if (USE_MOCK_DATA) {
    // Für Mock-Daten auf Basis des Suchbegriffs
    const normalizedTerm = searchTerm.toLowerCase().trim();
    const mockData = mockSearchResults.term[normalizedTerm as keyof typeof mockSearchResults.term];

    if (mockData) {
      return mockData;
    }
    
    // Fallback-Antwort, wenn keine Daten für diesen Suchbegriff vorhanden sind
    return {
      feed: {
        title: `Keine Ergebnisse für "${searchTerm}"`,
        entry: []
      }
    };
  }
  
  // Echter API-Aufruf mit fetch
  try {
    const url = new URL(BASE_URL);
    url.searchParams.append('mainSearchCriteria', `text^${searchTerm}`);
    url.searchParams.append('knowledgeResponseType', 'application/json');
    url.searchParams.append('lang', language === 'de' ? 'en' : language); // Da MedlinePlus kein Deutsch unterstützt
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP Fehler! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Suchen in MedlinePlus:', error);
    throw error;
  }
};

/**
 * Holt Gesundheitsinformationen basierend auf Medikamenten-Namen
 * @param medication Medikamentenname (z.B. "Metformin")
 * @param language Sprache für die Ergebnisse (Standard: Englisch)
 * @returns Promise mit den gefundenen Informationen
 */
export const getMedicationInfo = async (
  medication: string,
  language: Language = 'en'
): Promise<MedlinePlusResponse> => {
  // Wenn Mock-Daten verwendet werden sollen
  if (USE_MOCK_DATA) {
    // Für Mock-Daten auf Basis des Medikamentennamens
    const normalizedMed = medication.toLowerCase().trim();
    const mockData = mockMedicationResults[normalizedMed as keyof typeof mockMedicationResults];

    if (mockData) {
      return mockData;
    }
    
    // Fallback-Antwort, wenn keine Daten für dieses Medikament vorhanden sind
    return {
      feed: {
        title: `Keine Ergebnisse für Medikament "${medication}"`,
        entry: []
      }
    };
  }
  
  // Echter API-Aufruf mit fetch
  try {
    const url = new URL(BASE_URL);
    url.searchParams.append('mainSearchCriteria', `rxcui^${medication}`);
    url.searchParams.append('knowledgeResponseType', 'application/json');
    url.searchParams.append('lang', language === 'de' ? 'en' : language); // Da MedlinePlus kein Deutsch unterstützt
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP Fehler! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Abrufen von Medikamenteninformationen:', error);
    throw error;
  }
}; 