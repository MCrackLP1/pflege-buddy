/**
 * Type declarations for react-native-permissions
 */
declare module 'react-native-permissions' {
  export type Permission = 
    // Location permissions removed, add other non-location permissions here if used
    // e.g. | 'android.permission.CAMERA' 
    //      | 'ios.permission.MICROPHONE'
    string; // Using string as a fallback if no other permissions are explicitly defined

  export type PermissionStatus = 'unavailable' | 'denied' | 'limited' | 'granted' | 'blocked';

  export const PERMISSIONS: {
    ANDROID: {
      // Location permissions removed
      // Add other non-location android permissions here if used
      // e.g. CAMERA: 'android.permission.CAMERA';
      [key: string]: string; // Allow other permissions
    };
    IOS: {
      // Location permissions removed
      // Add other non-location iOS permissions here if used
      // e.g. MICROPHONE: 'ios.permission.MICROPHONE';
      [key: string]: string; // Allow other permissions
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
  export function requestMultiple(
    permissions: Permission[]
  ): Promise<Record<Permission, PermissionStatus>>;
  export function openSettings(): Promise<void>;
}
