/**
 * Wikipedia API Service
 * Dokumentation: https://www.mediawiki.org/wiki/API:Main_page/de
 */

// Basis-URL für die Wikipedia API
const BASE_URL = 'https://de.wikipedia.org/w/api.php';

// Unterstützte Sprachen für die Wikipedia-Abfrage
export type WikipediaLanguage = 'de' | 'en' | 'es' | 'fr' | 'it';

// Interface für die Wikipedia-Suchresultate
export interface WikipediaSearchResult {
  title: string;
  snippet: string;
  pageid: number;
}

// Interface für den Wikipedia-Artikel
export interface WikipediaArticle {
  title: string;
  extract: string;
  pageid: number;
  url: string; 
  thumbnail?: string;
}

/**
 * Sucht nach Artikeln in Wikipedia
 * @param searchTerm Suchbegriff (z.B. "Diabetes", "Hypertonie")
 * @param language Sprache für die Ergebnisse (Standard: Deutsch)
 * @param limit Maximale Anzahl an Ergebnissen (Standard: 5)
 * @returns Promise mit den gefundenen Artikeln
 */
export const searchWikipedia = async (
  searchTerm: string,
  language: WikipediaLanguage = 'de',
  limit: number = 5
): Promise<WikipediaSearchResult[]> => {
  try {
    // Bestimme die korrekte Domain basierend auf der Sprache
    const domain = `${language}.wikipedia.org`;
    
    // Erstelle die URL für die Suche
    const url = new URL(`https://${domain}/w/api.php`);
    
    // Füge die Parameter hinzu
    url.searchParams.append('action', 'query');
    url.searchParams.append('list', 'search');
    url.searchParams.append('srsearch', searchTerm);
    url.searchParams.append('format', 'json');
    url.searchParams.append('srlimit', limit.toString());
    url.searchParams.append('origin', '*'); // Für CORS
    
    // Führe die Anfrage aus
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP Fehler! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Überprüfe, ob Suchergebnisse vorhanden sind
    if (!data.query || !data.query.search || data.query.search.length === 0) {
      return [];
    }
    
    // Transformiere die Ergebnisse in unser Format
    return data.query.search.map((item: any) => ({
      title: item.title,
      snippet: item.snippet.replace(/<[^>]+>/g, ''), // HTML-Tags entfernen
      pageid: item.pageid
    }));
  } catch (error) {
    console.error('Fehler bei der Wikipedia-Suche:', error);
    throw error;
  }
};

/**
 * Holt detaillierte Informationen zu einem Wikipedia-Artikel
 * @param pageid ID der Wikipedia-Seite
 * @param language Sprache des Artikels (Standard: Deutsch)
 * @returns Promise mit den Artikeldetails
 */
export const getWikipediaArticle = async (
  pageid: number,
  language: WikipediaLanguage = 'de'
): Promise<WikipediaArticle> => {
  try {
    // Bestimme die korrekte Domain basierend auf der Sprache
    const domain = `${language}.wikipedia.org`;
    
    // Erstelle die URL für die Artikelabfrage
    const url = new URL(`https://${domain}/w/api.php`);
    
    // Füge die Parameter hinzu
    url.searchParams.append('action', 'query');
    url.searchParams.append('prop', 'extracts|info|pageimages');
    url.searchParams.append('pageids', pageid.toString());
    url.searchParams.append('exintro', '1'); // Nur die Einleitung
    url.searchParams.append('explaintext', '1'); // Als Text, nicht HTML
    url.searchParams.append('inprop', 'url'); // URL inkludieren
    url.searchParams.append('pithumbsize', '300'); // Thumbnail-Größe
    url.searchParams.append('format', 'json');
    url.searchParams.append('origin', '*'); // Für CORS
    
    // Führe die Anfrage aus
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP Fehler! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Überprüfe, ob die Seite existiert
    if (!data.query || !data.query.pages || !data.query.pages[pageid]) {
      throw new Error('Artikel nicht gefunden');
    }
    
    const page = data.query.pages[pageid];
    
    // Transformiere in unser Format
    return {
      title: page.title,
      extract: page.extract || 'Keine Beschreibung verfügbar',
      pageid: page.pageid,
      url: page.fullurl || `https://${domain}/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
      thumbnail: page.thumbnail ? page.thumbnail.source : undefined
    };
  } catch (error) {
    console.error('Fehler beim Abrufen des Wikipedia-Artikels:', error);
    throw error;
  }
};

/**
 * Sucht nach medizinischen Artikeln in Wikipedia durch Hinzufügen medizinischer Suchbegriffe
 * @param searchTerm Suchbegriff (z.B. "Diabetes", "Herzinfarkt")
 * @param language Sprache für die Ergebnisse (Standard: Deutsch)
 * @param limit Maximale Anzahl an Ergebnissen (Standard: 5)
 * @returns Promise mit den gefundenen Artikeln
 */
export const searchMedicalWikipedia = async (
  searchTerm: string,
  language: WikipediaLanguage = 'de',
  limit: number = 5
): Promise<WikipediaSearchResult[]> => {
  // Füge medizinische Qualifikatoren hinzu, um die Suche zu verbessern
  const medicalQualifiers = {
    de: ['Krankheit', 'Medizin', 'Symptom', 'Therapie', 'Pflege'],
    en: ['disease', 'medicine', 'symptom', 'therapy', 'nursing'],
    es: ['enfermedad', 'medicina', 'síntoma', 'terapia', 'enfermería'],
    fr: ['maladie', 'médecine', 'symptôme', 'thérapie', 'soins infirmiers'],
    it: ['malattia', 'medicina', 'sintomo', 'terapia', 'assistenza infermieristica']
  };
  
  // Wähle den Qualifikator basierend auf der Sprache
  const qualifiers = medicalQualifiers[language];
  
  // Erweitere den Suchbegriff mit dem ersten Qualifikator
  const enhancedSearchTerm = `${searchTerm} ${qualifiers[0]}`;
  
  return searchWikipedia(enhancedSearchTerm, language, limit);
}; 