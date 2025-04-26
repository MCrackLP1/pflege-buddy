/**
 * Type declarations for react-native-permissions
 */
declare module 'react-native-permissions' {
  export type Permission =
    | 'android.permission.ACCESS_BACKGROUND_LOCATION'
    | 'android.permission.ACCESS_COARSE_LOCATION'
    | 'android.permission.ACCESS_FINE_LOCATION'
    | 'ios.permission.LOCATION_ALWAYS'
    | 'ios.permission.LOCATION_WHEN_IN_USE';

  export type PermissionStatus =
    | 'unavailable'
    | 'denied'
    | 'limited'
    | 'granted'
    | 'blocked';

  export const PERMISSIONS: {
    ANDROID: {
      ACCESS_BACKGROUND_LOCATION: 'android.permission.ACCESS_BACKGROUND_LOCATION';
      ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION';
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION';
    };
    IOS: {
      LOCATION_ALWAYS: 'ios.permission.LOCATION_ALWAYS';
      LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE';
    };
  };

  export const RESULTS: {
    UNAVAILABLE: 'unavailable';
    DENIED: 'denied';
    GRANTED: 'granted';
    BLOCKED: 'blocked';
  };

  export function check(permission: Permission): Promise<PermissionStatus>;
  export function request(permission: Permission): Promise<PermissionStatus>;
  export function requestMultiple(permissions: Permission[]): Promise<Record<Permission, PermissionStatus>>;
  export function openSettings(): Promise<void>;
} 