/**
 * ICDApiService.ts
 * Service für die Abfrage der ICD-10-GM Daten
 */

import { Disease } from '../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importiere die ICD-10-GM Daten aus der JSON-Datei
import ICD10GMData from '../../assets/data/icd10gm.json';

// Cache-Schlüssel für ICD-Suchen
const ICD_CACHE_KEY = 'icd_search_cache_';
const ICD_CACHE_EXPIRY = 604800000; // 1 Woche in Millisekunden

/**
 * Sucht ICD-10 Diagnosen in der lokalen ICD-10-GM Datenbank
 * @param query Suchbegriff (Code oder Text)
 * @returns Array von Disease-Objekten
 */
export const searchICD10 = async (query: string): Promise<Disease[]> => {
  if (query.trim().length < 3) {
    return [];
  }

  try {
    // Zuerst im Cache nachsehen
    const cachedData = await getCachedICDResults(query);
    if (cachedData) {
      console.log('ICD-Daten aus Cache geladen');
      return cachedData;
    }

    console.log(`Durchsuche ICD-10-GM Datenbank nach "${query}"...`);
    
    // Filtern der ICD-10-GM Daten basierend auf der Suchanfrage
    const lowerCaseQuery = query.toLowerCase();
    const results = (ICD10GMData as Disease[]).filter(item => 
      item.code.toLowerCase().includes(lowerCaseQuery) ||
      item.name.toLowerCase().includes(lowerCaseQuery) ||
      item.fachgebiet.toLowerCase().includes(lowerCaseQuery)
    );
    
    // Suchergebnisse begrenzen, um Performance zu optimieren
    const limitedResults = results.slice(0, 100);
    
    // Ergebnisse im Cache speichern
    await cacheICDResults(query, limitedResults);
    
    return limitedResults;
    
  } catch (error) {
    console.error('Fehler bei der ICD-10 Suche:', error);
    
    // Fallback zu leeren Ergebnissen bei Fehler
    return [];
  }
};

/**
 * Speichert ICD-Suchergebnisse im Cache
 */
const cacheICDResults = async (query: string, results: Disease[]): Promise<void> => {
  try {
    const cacheData = {
      timestamp: Date.now(),
      results
    };
    await AsyncStorage.setItem(ICD_CACHE_KEY + query.toLowerCase(), JSON.stringify(cacheData));
  } catch (error) {
    console.error('Fehler beim Caching der ICD-Daten:', error);
  }
};

/**
 * Holt gecachte ICD-Suchergebnisse
 */
const getCachedICDResults = async (query: string): Promise<Disease[] | null> => {
  try {
    const cachedData = await AsyncStorage.getItem(ICD_CACHE_KEY + query.toLowerCase());
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      const now = Date.now();
      
      // Prüfen ob der Cache noch gültig ist
      if (now - parsedData.timestamp < ICD_CACHE_EXPIRY) {
        return parsedData.results;
      }
    }
    return null;
  } catch (error) {
    console.error('Fehler beim Abrufen der gecachten ICD-Daten:', error);
    return null;
  }
}; 