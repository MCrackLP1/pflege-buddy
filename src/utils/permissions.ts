import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

/**
 * Fragt nach der Standortberechtigung
 * @returns Promise mit Boolean, ob die Berechtigung erteilt wurde
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    try {
      const granted = await Geolocation.requestAuthorization('whenInUse');
      return granted === 'granted';
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  }

  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Standortberechtigung',
          message: 'Diese App benötigt Zugriff auf Ihren Standort, um Arbeitsplätze zu lokalisieren.',
          buttonNeutral: 'Später fragen',
          buttonNegative: 'Abbrechen',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Location permission error:', err);
      return false;
    }
  }

  return false;
}; 