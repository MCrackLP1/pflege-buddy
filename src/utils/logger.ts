/**
 * Logger-Utilität für konsistentes Logging in der Anwendung
 * Ermöglicht das zentrale Aktivieren/Deaktivieren von Logs je nach Umgebung (dev/prod)
 */

// Definiere die Log-Level
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Konfiguration für den Logger
interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  showTimestamp: boolean;
}

// Standard-Konfiguration: In Produktion deaktiviert, im Entwicklungsmodus aktiviert
const DEFAULT_CONFIG: LoggerConfig = {
  enabled: __DEV__, // __DEV__ ist eine React Native globale Variable
  minLevel: 'debug',
  showTimestamp: true,
};

// Prioritäten der Log-Level
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Aktuelle Logger-Konfiguration
let config: LoggerConfig = { ...DEFAULT_CONFIG };

/**
 * Konfiguriert das Logger-Verhalten
 * @param newConfig Neue Konfiguration, wird mit der aktuellen Konfiguration gemerged
 */
export const configureLogger = (newConfig: Partial<LoggerConfig>): void => {
  config = { ...config, ...newConfig };
};

/**
 * Formatiert eine Log-Nachricht
 * @param level Log-Level
 * @param message Die Log-Nachricht
 * @param args Zusätzliche Argumente
 * @returns Formatierte Log-Nachricht
 */
const formatMessage = (level: LogLevel, message: string, ...args: unknown[]): string => {
  const timestamp = config.showTimestamp ? `[${new Date().toISOString()}] ` : '';
  const prefix = `${timestamp}[${level.toUpperCase()}] `;

  // Wenn args vorhanden sind, formatiere sie sauber
  let formattedArgs = '';
  if (args.length > 0) {
    formattedArgs = args
      .map(arg => {
        if (typeof arg === 'object' && arg !== null) {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(' ');

    return `${prefix}${message} ${formattedArgs}`;
  }

  return `${prefix}${message}`;
};

/**
 * Prüft, ob ein Log mit dem angegebenen Level geloggt werden soll
 * @param level Log-Level
 * @returns true wenn das Logging aktiviert ist
 */
const shouldLog = (level: LogLevel): boolean => {
  if (!config.enabled) return false;
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[config.minLevel];
};

/**
 * Logger-Objekt mit Methoden für verschiedene Log-Level
 */
export const Logger = {
  /**
   * Debug-Level Logging (niedrigste Priorität)
   * @param message Die Log-Nachricht
   * @param args Zusätzliche Argumente für das Logging
   */
  debug: (message: string, ...args: unknown[]): void => {
    if (shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.log(formatMessage('debug', message, ...args));
    }
  },

  /**
   * Info-Level Logging
   * @param message Die Log-Nachricht
   * @param args Zusätzliche Argumente für das Logging
   */
  info: (message: string, ...args: unknown[]): void => {
    if (shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.log(formatMessage('info', message, ...args));
    }
  },

  /**
   * Warn-Level Logging
   * @param message Die Log-Nachricht
   * @param args Zusätzliche Argumente für das Logging
   */
  warn: (message: string, ...args: unknown[]): void => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, ...args));
    }
  },

  /**
   * Error-Level Logging (höchste Priorität)
   * @param message Die Log-Nachricht
   * @param args Zusätzliche Argumente für das Logging
   */
  error: (message: string, ...args: unknown[]): void => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, ...args));
    }
  },

  /**
   * Logt einen Fehler mit Stack-Trace
   * @param error Das Fehlerobjekt
   * @param context Optionaler Kontext, in dem der Fehler aufgetreten ist
   */
  exception: (error: Error | unknown, context?: string): void => {
    if (shouldLog('error')) {
      const errorMessage =
        error instanceof Error ? `${error.name}: ${error.message}\n${error.stack}` : String(error);

      const contextPrefix = context ? `[${context}] ` : '';
      console.error(formatMessage('error', `${contextPrefix}Exception:`, errorMessage));
    }
  },
};

export default Logger;
