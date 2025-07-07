import { create } from 'zustand';
import { MedicalTerm } from '../utils/medTermUtils';
import { loadAsset } from '../utils/assetManager';

interface SearchResultItem extends MedicalTerm {
  category: string;
}

interface MedicalTermState {
  // State
  medicalTerms: MedicalTerm[];
  searchResults: SearchResultItem[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: string | null;

  // Actions
  setMedicalTerms: (terms: MedicalTerm[]) => void;
  setSearchResults: (results: SearchResultItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedCategory: (category: string | null) => void;

  // Async Actions
  loadMedicalTerms: () => Promise<void>;
  searchTerms: (query: string) => Promise<void>;
}

export const useMedicalTermStore = create<MedicalTermState>((set, get) => ({
  // Initial State
  medicalTerms: [],
  searchResults: [],
  isLoading: false,
  error: null,
  selectedCategory: null,

  // Actions
  setMedicalTerms: terms => set({ medicalTerms: terms }),
  setSearchResults: results => set({ searchResults: results }),
  setLoading: loading => set({ isLoading: loading }),
  setError: error => set({ error }),
  setSelectedCategory: category => set({ selectedCategory: category }),

  // Async Actions
  loadMedicalTerms: async () => {
    try {
      set({ isLoading: true, error: null });
      const terms = await loadAsset('medizinische_abkuerzungen_bereinigt');
      set({ medicalTerms: terms, isLoading: false });
    } catch (error) {
      set({
        error: 'Fehler beim Laden der medizinischen Begriffe',
        isLoading: false,
      });
    }
  },

  searchTerms: async (query: string) => {
    try {
      set({ isLoading: true, error: null });

      if (query.length < 2) {
        set({ searchResults: [], isLoading: false });
        return;
      }

      const { medicalTerms, selectedCategory } = get();

      // Filtere nach Kategorie, falls eine ausgewählt ist
      let filteredTerms = medicalTerms;
      if (selectedCategory) {
        filteredTerms = medicalTerms.filter(term => term.category === selectedCategory);
      }

      // Suche in den gefilterten Begriffen
      const results = filteredTerms
        .filter(
          term =>
            term.term.toLowerCase().includes(query.toLowerCase()) ||
            term.definition.toLowerCase().includes(query.toLowerCase()) ||
            term.synonyms?.some(synonym => synonym.toLowerCase().includes(query.toLowerCase()))
        )
        .map(term => ({
          ...term,
          category: term.category || 'Allgemein',
        }));

      set({ searchResults: results, isLoading: false });
    } catch (error) {
      set({
        error: 'Fehler bei der Suche',
        isLoading: false,
      });
    }
  },
}));
