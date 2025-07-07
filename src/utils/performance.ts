/**
 * performance.ts
 * Utilities zur Optimierung der App-Performance
 */

import { InteractionManager } from 'react-native';
import { memo } from 'react';

/**
 * Führt eine Aufgabe aus, nachdem die Interaktionen abgeschlossen sind
 * Verbessert die App-Performance, indem UI-Blockierungen vermieden werden
 * @param task Die auszuführende Funktion
 */
export const runAfterInteractions = <T>(
  task: () => T
): ReturnType<typeof InteractionManager.runAfterInteractions> => {
  return InteractionManager.runAfterInteractions(task);
};

/**
 * Memoizing-Funktion für verbesserte Performance
 * Speichert die Ergebnisse von Funktionsaufrufen mit identischen Argumenten
 * @param func Die zu memoizierende Funktion
 */
export function memoize<T extends (...args: unknown[]) => unknown>(func: T): T {
  const cache = new Map();

  return ((...args: unknown[]) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Optimiert eine React-Komponente durch Memoization
 * Verhindert unnötige Rerenders für bessere Performance
 * @param Component Die zu optimierende Komponente
 */
export const optimizeComponent = <T extends React.ComponentType<unknown>>(Component: T): T => {
  return memo(Component) as unknown as T;
};

/**
 * Führt eine Aufgabe verzögert aus, um UI-Thread zu entlasten
 * @param task Die auszuführende Funktion
 * @param delay Die Verzögerungszeit in Millisekunden
 */
export const deferTask = (task: () => void, delay: number = 300): void => {
  setTimeout(task, delay);
};

// Cache für aufwändige Berechnungen
const computeCache = new Map<string, unknown>();

/**
 * Speichert Berechnungsergebnisse im Cache mit optionalem Verfallszeitraum
 * @param key Ein eindeutiger Schlüssel für die Berechnung
 * @param compute Die Berechnungsfunktion
 * @param expireAfter Optionale Verfallszeit in Millisekunden
 */
export const cachedComputation = <T>(key: string, compute: () => T, expireAfter?: number): T => {
  if (computeCache.has(key)) {
    return computeCache.get(key) as T;
  }

  const result = compute();
  computeCache.set(key, result);

  if (expireAfter) {
    setTimeout(() => {
      computeCache.delete(key);
    }, expireAfter);
  }

  return result;
};

/**
 * Löscht alle gespeicherten Berechnungen aus dem Cache
 */
export const clearComputeCache = (): void => {
  computeCache.clear();
};
