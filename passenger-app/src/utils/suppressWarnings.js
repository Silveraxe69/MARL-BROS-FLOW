// Suppress known non-critical warnings from React Native Web and React Native Paper
// These warnings are from library internals and don't affect functionality

const IGNORED_WARNINGS = [
  'shadow',
  'boxShadow',
  'pointerEvents',
  'useNativeDriver',
  'Animated',
  'Download the React DevTools',
];

const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string') {
    // Check if this is a warning we want to suppress
    const shouldSuppress = IGNORED_WARNINGS.some(warning => 
      message.includes(warning)
    );
    
    if (shouldSuppress) {
      return; // Suppress this warning
    }
  }
  
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  const message = args[0];
  if (typeof message === 'string') {
    // Check if this is a warning disguised as error
    const shouldSuppress = IGNORED_WARNINGS.some(warning => 
      message.includes(warning)
    );
    
    if (shouldSuppress) {
      return; // Suppress this warning
    }
  }
  
  originalError.apply(console, args);
};

export default function suppressKnownWarnings() {
  // Already applied when this module is imported
}
