/**
 * Asset Manager for medical terms and other static data
 * Handles versioning, caching, and loading of assets
 */

import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MedicalTerm } from './medTermUtils';

// Asset version for cache invalidation
const ASSET_VERSION = '1.0.0';
const CACHE_KEY_PREFIX = '@medical_terms_cache_';

export interface MedicalTermFile {
  id: string;
  name: string;
}

// List of all medical term files to search in
export const MEDICAL_TERM_FILES: MedicalTermFile[] = [
  { id: 'medizinische_abkuerzungen_bereinigt', name: 'Allgemeine Abkürzungen' },
  { id: 'endokrinologie_begriffe', name: 'Endokrinologie' },
  { id: 'gastroenterologie_begriffe', name: 'Gastroenterologie' },
  { id: 'pneumologie_begriffe', name: 'Pneumologie' },
  { id: 'kardiologie_begriffe', name: 'Kardiologie' },
  { id: 'neurologie_abkuerzungen', name: 'Neurologie' },
];

interface AssetCache<T> {
  version: string;
  timestamp: number;
  data: T;
}

/**
 * Gets the base path for assets based on platform
 * @returns {string} Base path for assets
 */
const getBasePath = (): string => {
  return Platform.OS === 'android'
    ? `${RNFS.DocumentDirectoryPath}/assets/data/`
    : `${RNFS.MainBundlePath}/assets/data/`;
};

/**
 * Loads an asset from cache or file system
 * @param {string} assetId - The ID of the asset to load
 * @returns {Promise<MedicalTerm[]>} The loaded asset data
 */
export const loadAsset = async (assetId: string): Promise<MedicalTerm[]> => {
  try {
    // Try to load from cache first
    const cachedData = await loadFromCache<MedicalTerm[]>(assetId);
    if (cachedData) {
      return cachedData;
    }

    // If not in cache, load from file system
    const filePath = `${getBasePath()}${assetId}.json`;
    const fileContent = await RNFS.readFile(filePath, 'utf8');
    const data: MedicalTerm[] = JSON.parse(fileContent);

    // Validate data structure
    if (!Array.isArray(data) || !data.every(term => typeof term === 'object')) {
      throw new Error(`Invalid data structure in ${assetId}`);
    }

    // Cache the loaded data
    await saveToCache(assetId, data);

    return data;
  } catch (error) {
    console.error(`Error loading asset ${assetId}:`, error);
    throw error;
  }
};

/**
 * Loads data from cache
 * @param {string} assetId - The ID of the asset to load from cache
 * @returns {Promise<T | null>} The cached data or null if not found/invalid
 */
const loadFromCache = async <T>(assetId: string): Promise<T | null> => {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${assetId}`;
    const cachedString = await AsyncStorage.getItem(cacheKey);

    if (!cachedString) {
      return null;
    }

    const cache: AssetCache<T> = JSON.parse(cachedString);

    // Check if cache is valid
    if (cache.version !== ASSET_VERSION) {
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    // Cache is valid for 24 hours
    const now = Date.now();
    if (now - cache.timestamp > 24 * 60 * 60 * 1000) {
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    return cache.data;
  } catch (error) {
    console.error(`Error loading from cache for ${assetId}:`, error);
    return null;
  }
};

/**
 * Saves data to cache
 * @param {string} assetId - The ID of the asset to cache
 * @param {T} data - The data to cache
 */
const saveToCache = async <T>(assetId: string, data: T): Promise<void> => {
  try {
    const cache: AssetCache<T> = {
      version: ASSET_VERSION,
      timestamp: Date.now(),
      data,
    };

    const cacheKey = `${CACHE_KEY_PREFIX}${assetId}`;
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cache));
  } catch (error) {
    console.error(`Error saving to cache for ${assetId}:`, error);
  }
};

/**
 * Clears the cache for a specific asset or all assets
 * @param {string} [assetId] - Optional asset ID to clear specific cache
 */
export const clearCache = async (assetId?: string): Promise<void> => {
  try {
    if (assetId) {
      const cacheKey = `${CACHE_KEY_PREFIX}${assetId}`;
      await AsyncStorage.removeItem(cacheKey);
    } else {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Preloads all medical term assets
 * @returns {Promise<void>}
 */
export const preloadAssets = async (): Promise<void> => {
  try {
    const loadPromises = MEDICAL_TERM_FILES.map(file => loadAsset(file.id));
    await Promise.all(loadPromises);
  } catch (error) {
    console.error('Error preloading assets:', error);
  }
};
