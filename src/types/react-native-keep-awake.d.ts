/**
 * Type declarations for react-native-keep-awake
 */
declare module 'react-native-keep-awake' {
  // Statische Methoden als eigenständige Exporte
  export function activate(): void;
  export function deactivate(): void;
  
  // Default export als React-Komponente
  import * as React from 'react';
  const KeepAwake: React.ComponentType<{}> & {
    activate: typeof activate;
    deactivate: typeof deactivate;
  };
  export default KeepAwake;
} 