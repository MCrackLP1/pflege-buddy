/**
 * performance.ts
 * Utilities zur Optimierung der App-Performance
 */

import { InteractionManager } from 'react-native';
import { memo } from 'react';

/**
 * Führt einen Task aus, nachdem alle Interaktionen und Animationen abgeschlossen sind
 * Verbessert die Wahrnehmungsgeschwindigkeit der App
 */
export const runAfterInteractions = (task: () => any): ReturnType<typeof InteractionManager.runAfterInteractions> => {
  return InteractionManager.runAfterInteractions(() => {
    return task();
  });
};

/**
 * Function Memoizer um redundante Berechnungen zu vermeiden
 * 
 * @param func Die zu memoizierende Funktion
 * @returns Das memoizierte Ergebnis
 */
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map();
  
  return ((...args: any[]) => {
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
 * Optimiert eine Komponente für die Performance mittels React.memo
 * 
 * @param Component Die zu optimierende Komponente
 * @returns Die memoizierte Komponente
 */
export const optimizeComponent = <T extends React.ComponentType<any>>(Component: T): T => {
  return memo(Component) as unknown as T;
};

/**
 * Verzögert die Ausführung eines Tasks um einen bestimmten Zeitraum
 * Nützlich, wenn nicht kritische Aufgaben verschoben werden sollen
 * 
 * @param task Die auszuführende Funktion
 * @param delay Verzögerung in Millisekunden
 */
export const deferTask = (task: () => void, delay: number = 300): void => {
  setTimeout(task, delay);
};

/**
 * Cache für bereits berechnete Werte
 */
const computeCache = new Map<string, any>();

/**
 * Speichert berechnete Werte zwischen, um Wiederholungen zu vermeiden
 * 
 * @param key Ein eindeutiger Schlüssel für die Berechnung
 * @param compute Die Berechnungsfunktion
 * @param expireAfter Optional, Zeit in ms nach der der Cache-Eintrag verfällt
 */
export const cachedComputation = <T>(
  key: string,
  compute: () => T,
  expireAfter?: number
): T => {
  if (computeCache.has(key)) {
    return computeCache.get(key);
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
 * Bereinigt den Cache
 */
export const clearComputeCache = (): void => {
  computeCache.clear();
}; 