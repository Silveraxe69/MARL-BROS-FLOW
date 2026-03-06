const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add platform-specific extensions
config.resolver.sourceExts.push('cjs');

// Configure platform-specific module resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
