import { additionalLexikonEntries } from './additionalLexikonEntries';
import { extendedLexikonEntries } from './extendedLexikonEntries';
import { lexikonEntries } from './data';
import { LexikonEntry } from '../types/types';

/**
 * Combines the existing lexicon entries with the additional entries
 * Ensures there are no duplicate IDs by using a Map
 * @returns An array of all lexicon entries
 */
export const getCombinedLexikonEntries = (): LexikonEntry[] => {
  const entriesMap = new Map<string, LexikonEntry>();
  
  // Add original entries first
  lexikonEntries.forEach(entry => {
    entriesMap.set(entry.id, entry);
  });
  
  // Add additional entries, overriding duplicates if they exist
  additionalLexikonEntries.forEach(entry => {
    entriesMap.set(entry.id, entry);
  });
  
  // Add extended entries, also overriding duplicates if they exist
  extendedLexikonEntries.forEach(entry => {
    entriesMap.set(entry.id, entry);
  });
  
  return Array.from(entriesMap.values());
};

/**
 * Gets the total count of all lexicon entries after combining
 * @returns The total number of entries
 */
export const getTotalLexikonEntriesCount = (): number => {
  return getCombinedLexikonEntries().length;
};

/**
 * Finds a lexicon entry by its ID from the combined entries
 * @param id The ID of the entry to find
 * @returns The lexicon entry or undefined if not found
 */
export const findLexikonEntryById = (id: string): LexikonEntry | undefined => {
  return getCombinedLexikonEntries().find(entry => entry.id === id);
}; 