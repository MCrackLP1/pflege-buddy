/**
 * NotificationService.ts
 * Service für die Verwaltung von Benachrichtigungen (temporärer Ersatz)
 * 
 * Hinweis: Dies ist eine vereinfachte Version, die keine tatsächlichen Benachrichtigungen sendet,
 * um Abhängigkeitskonflikte zu vermeiden. In einer produktiven Umgebung würde hier
 * react-native-push-notification verwendet werden.
 */

import { Platform, ToastAndroid } from 'react-native';

class NotificationService {
  private static instance: NotificationService;

  private constructor() {
    console.log('NotificationService initialisiert (Platzhalter-Version)');
  }

  /**
   * Gibt die Singleton-Instanz des Services zurück
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Zeigt eine temporäre Nachricht an (nur für Android)
   */
  private showToast(message: string): void {
    // Toast-Nachricht deaktiviert, um Pop-up-Meldungen zu vermeiden
  }

  /**
   * Zeigt eine Tracking-Benachrichtigung an
   */
  public showTrackingNotification(at: string = ''): void {
    // Benachrichtigung deaktiviert
  }

  /**
   * Aktualisiert die Tracking-Benachrichtigung
   */
  public updateTrackingNotification(at: string): void {
    // Aktualisierung deaktiviert
  }

  /**
   * Entfernt die Tracking-Benachrichtigung
   */
  public cancelTrackingNotification(): void {
    // Entfernen deaktiviert
  }
}

export default NotificationService; 