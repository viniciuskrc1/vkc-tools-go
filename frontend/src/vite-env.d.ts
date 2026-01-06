/// <reference types="vite/client" />

// Extensão do objeto Window para incluir os bindings do Wails
declare global {
  interface Window {
    go: {
      main: {
        App: {
          CheckGitHubCLI: () => Promise<import('./wailsjs/go/main/App').GHStatus>;
        };
      };
    };
  }
}

export {};

