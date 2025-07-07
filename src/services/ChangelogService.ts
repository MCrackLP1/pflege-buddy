/**
 * @fileoverview Service für Changelog-Verwaltung
 * @module ChangelogService
 * @description
 * Dieser Service verwaltet die App-Versionsverfolgung und erkennt Updates,
 * um entsprechende Changelog-Einträge anzuzeigen.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { CHANGELOG, ChangelogEntry, getChangelogSince } from '../data/changelog';
import Logger from '../utils/logger';

/**
 * Konstanten für AsyncStorage-Schlüssel
 */
const STORAGE_KEYS = {
  LAST_VERSION: 'last_app_version',
  CHANGELOG_SHOWN: 'changelog_shown_versions',
  FIRST_LAUNCH: 'first_launch_completed'
};

/**
 * Interface für Changelog-Service
 */
export interface ChangelogServiceInterface {
  checkForUpdates(): Promise<ChangelogEntry[]>;
  markChangelogAsShown(version: string): Promise<void>;
  isFirstLaunch(): Promise<boolean>;
  setFirstLaunchCompleted(): Promise<void>;
  getCurrentVersion(): string;
  getLastStoredVersion(): Promise<string | null>;
}

/**
 * Service-Klasse für Changelog-Verwaltung
 */
class ChangelogService implements ChangelogServiceInterface {
  private static instance: ChangelogService;
  private currentVersion: string;

  private constructor() {
    this.currentVersion = '';
    this.initializeVersion();
  }

  /**
   * Singleton-Instanz abrufen
   */
  public static getInstance(): ChangelogService {
    if (!ChangelogService.instance) {
      ChangelogService.instance = new ChangelogService();
    }
    return ChangelogService.instance;
  }

  /**
   * Initialisiert die aktuelle App-Version
   */
  private async initializeVersion(): Promise<void> {
    try {
      this.currentVersion = await DeviceInfo.getVersion();
      Logger.info('ChangelogService', `Current app version: ${this.currentVersion}`);
    } catch (error) {
      Logger.error('ChangelogService', 'Failed to get app version', error);
      this.currentVersion = '1.0.0'; // Fallback
    }
  }

  /**
   * Gibt die aktuelle App-Version zurück
   */
  public getCurrentVersion(): string {
    return this.currentVersion;
  }

  /**
   * Gibt die zuletzt gespeicherte Version zurück
   */
  public async getLastStoredVersion(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_VERSION);
    } catch (error) {
      Logger.error('ChangelogService', 'Failed to get last stored version', error);
      return null;
    }
  }

  /**
   * Prüft auf App-Updates und gibt relevante Changelog-Einträge zurück
   */
  public async checkForUpdates(): Promise<ChangelogEntry[]> {
    try {
      await this.initializeVersion();
      const lastVersion = await this.getLastStoredVersion();
      
      // Erste Installation
      if (!lastVersion) {
        await this.storeCurrentVersion();
        return [];
      }

      // Keine Änderung
      if (lastVersion === this.currentVersion) {
        return [];
      }

      // App wurde aktualisiert
      Logger.info('ChangelogService', `App updated from ${lastVersion} to ${this.currentVersion}`);
      
      const changelogEntries = getChangelogSince(lastVersion);
      await this.storeCurrentVersion();
      
      return changelogEntries;
    } catch (error) {
      Logger.error('ChangelogService', 'Failed to check for updates', error);
      return [];
    }
  }

  /**
   * Speichert die aktuelle Version
   */
  private async storeCurrentVersion(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_VERSION, this.currentVersion);
    } catch (error) {
      Logger.error('ChangelogService', 'Failed to store current version', error);
    }
  }

  /**
   * Markiert einen Changelog als angezeigt
   */
  public async markChangelogAsShown(version: string): Promise<void> {
    try {
      const shownVersions = await this.getShownVersions();
      if (!shownVersions.includes(version)) {
        shownVersions.push(version);
        await AsyncStorage.setItem(STORAGE_KEYS.CHANGELOG_SHOWN, JSON.stringify(shownVersions));
      }
    } catch (error) {
      Logger.error('ChangelogService', 'Failed to mark changelog as shown', error);
    }
  }

  /**
   * Gibt die Liste der bereits angezeigten Changelog-Versionen zurück
   */
  private async getShownVersions(): Promise<string[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CHANGELOG_SHOWN);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      Logger.error('ChangelogService', 'Failed to get shown versions', error);
      return [];
    }
  }

  /**
   * Prüft, ob es sich um den ersten App-Start handelt
   */
  public async isFirstLaunch(): Promise<boolean> {
    try {
      const firstLaunch = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
      return firstLaunch === null;
    } catch (error) {
      Logger.error('ChangelogService', 'Failed to check first launch', error);
      return false;
    }
  }

  /**
   * Markiert den ersten App-Start als abgeschlossen
   */
  public async setFirstLaunchCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'true');
    } catch (error) {
      Logger.error('ChangelogService', 'Failed to set first launch completed', error);
    }
  }
}

export default ChangelogService; 