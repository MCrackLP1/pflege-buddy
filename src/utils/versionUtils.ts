/**
 * @fileoverview Version-Utilities für App-Versionsverwaltung
 * @module VersionUtils
 * @description
 * Hilfsfunktionen für Versionsverwaltung und -vergleich
 */

/**
 * Vergleicht zwei Versionsstrings im Format "x.y.z"
 * @param version1 - Erste Version
 * @param version2 - Zweite Version
 * @returns -1 wenn version1 < version2, 0 wenn gleich, 1 wenn version1 > version2
 */
export const compareVersions = (version1: string, version2: string): number => {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  
  const maxLength = Math.max(v1Parts.length, v2Parts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part < v2Part) return -1;
    if (v1Part > v2Part) return 1;
  }
  
  return 0;
};

/**
 * Prüft ob eine Version neuer ist als eine andere
 * @param currentVersion - Aktuelle Version
 * @param lastVersion - Letzte Version
 * @returns true wenn currentVersion neuer ist
 */
export const isNewerVersion = (currentVersion: string, lastVersion: string): boolean => {
  return compareVersions(currentVersion, lastVersion) > 0;
};

/**
 * Formatiert eine Version für die Anzeige
 * @param version - Version string
 * @returns Formatierte Version
 */
export const formatVersion = (version: string): string => {
  return `v${version}`;
};

/**
 * Validiert einen Versionstring
 * @param version - Zu validierender Version string
 * @returns true wenn valid
 */
export const isValidVersion = (version: string): boolean => {
  const versionRegex = /^\d+\.\d+\.\d+$/;
  return versionRegex.test(version);
}; 