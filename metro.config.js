/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 */

const { getDefaultConfig } = require('@react-native/metro-config');

/**
 * Erweiterte Metro-Konfiguration, um große JSON-Dateien zu unterstützen
 */
const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
  // Erweitere die Transformer-Optionen, um JSON-Dateien besser zu handhaben
  transformer: {
    ...defaultConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    ...defaultConfig.resolver,
    // Erhöhe die maxWorkers für bessere Performance beim Bundling
    maxWorkers: 4,
  },
  maxWorkers: 4,
  // Erhöhe den Node Max Old Space Size für größere JSON-Dateien
  serializer: {
    ...defaultConfig.serializer,
    // Diese Option hilft bei großen JSON-Dateien
    createModuleIdFactory: require('metro/src/lib/createModuleIdFactory'),
  },
};
