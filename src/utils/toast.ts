import { Platform, ToastAndroid } from 'react-native';

/**
 * Zeigt einen Toast an (nur auf Android)
 * @param message Die anzuzeigende Nachricht
 * @param isError Ob es sich um eine Fehlermeldung handelt (längere Anzeigedauer)
 */
export const showToast = (message: string, isError: boolean = false): void => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, isError ? ToastAndroid.LONG : ToastAndroid.SHORT);
  }
  // iOS: Hier könnte man später eine Alert-Implementierung hinzufügen
};
