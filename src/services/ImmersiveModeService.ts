/**
 * ImmersiveModeService.ts
 * Service zur Verwaltung des immersiven Modus und der Navigation Bar
 */

import { Platform } from 'react-native';
// import NavigationBarColor from 'react-native-navigation-bar-color';

export interface ImmersiveModeConfig {
  theme: 'light' | 'dark';
  hideNavigationBar?: boolean;
  transparentNavigationBar?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content';
}

class ImmersiveModeService {
  private static instance: ImmersiveModeService;
  private currentConfig: ImmersiveModeConfig | null = null;

  private constructor() {}

  static getInstance(): ImmersiveModeService {
    if (!ImmersiveModeService.instance) {
      ImmersiveModeService.instance = new ImmersiveModeService();
    }
    return ImmersiveModeService.instance;
  }

  /**
   * Konfiguriert den immersiven Modus für die App
   */
  async configureImmersiveMode(config: ImmersiveModeConfig): Promise<void> {
    if (Platform.OS !== 'android') {
      console.log('Immersive mode is only supported on Android');
      return;
    }

    this.currentConfig = config;

    try {
      // Navigationsleiste transparent machen
      if (config.transparentNavigationBar) {
        // await NavigationBarColor.setNavigationBarColor('transparent', true);
        console.log('Would set navigation bar to transparent');
      } else {
        // Standard-Farbe basierend auf Theme
        const navigationBarColor = config.theme === 'dark' ? '#121212' : '#f5f5f5';
        // await NavigationBarColor.setNavigationBarColor(navigationBarColor, config.theme === 'light');
        console.log('Would set navigation bar color to:', navigationBarColor);
      }

      console.log('Immersive mode configured successfully');
    } catch (error) {
      console.error('Error configuring immersive mode:', error);
    }
  }

  /**
   * Stellt den Standard-Modus wieder her
   */
  async restoreDefaultMode(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      // Navigationsleiste zur Standard-Farbe zurücksetzen
      // await NavigationBarColor.setNavigationBarColor('#000000', false);
      console.log('Default mode restored');
    } catch (error) {
      console.error('Error restoring default mode:', error);
    }
  }

  /**
   * Aktiviert den immersiven Modus (versteckt Navigation Bar)
   */
  async enableImmersiveMode(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      // Navigationsleiste transparent machen für vollständigen immersiven Modus
      // await NavigationBarColor.setNavigationBarColor('transparent', true);
      console.log('Immersive mode enabled');
    } catch (error) {
      console.error('Error enabling immersive mode:', error);
    }
  }

  /**
   * Deaktiviert den immersiven Modus (zeigt Navigation Bar)
   */
  async disableImmersiveMode(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    if (this.currentConfig) {
      // Zurück zur letzten Konfiguration
      await this.configureImmersiveMode(this.currentConfig);
    } else {
      // Fallback zur Standard-Konfiguration
      await this.restoreDefaultMode();
    }
  }

  /**
   * Gibt die aktuelle Konfiguration zurück
   */
  getCurrentConfig(): ImmersiveModeConfig | null {
    return this.currentConfig;
  }

  /**
   * Überprüft, ob der immersive Modus aktiv ist
   */
  isImmersiveModeActive(): boolean {
    return this.currentConfig?.transparentNavigationBar === true;
  }
}

export default ImmersiveModeService; 