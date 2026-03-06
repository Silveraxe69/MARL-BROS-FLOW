import { Platform } from 'react-native';

/**
 * Inject global styles for web to ensure proper scrolling
 */
export const injectWebStyles = () => {
  if (Platform.OS !== 'web') return;

  // Check if styles already injected
  if (document.getElementById('rn-web-scroll-fix')) return;

  const style = document.createElement('style');
  style.id = 'rn-web-scroll-fix';
  style.textContent = `
    html {
      height: 100%;
    }

    body {
      min-height: 100%;
      margin: 0;
      padding: 0;
      overflow-y: auto;
      overflow-x: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    #root {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Ensure ScrollView works properly */
    [data-focusable="true"]:focus {
      outline: none;
    }

    /* Fix for mobile Safari */
    * {
      -webkit-overflow-scrolling: touch;
    }
  `;
  
  document.head.appendChild(style);
};
