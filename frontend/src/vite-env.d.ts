/// <reference types="vite/client" />

// Extensão do objeto Window para incluir os bindings do Wails
declare global {
  interface Window {
    go: {
      main: {
        App: {
          CheckGitHubCLI: () => Promise<import('./wailsjs/go/main/App').GHStatus>;
          TriggerCreateAMI: (jdkVersion: string, service: string, version: string) => Promise<import('./wailsjs/go/main/App').WorkflowResult>;
          TriggerCreateAMIBatch: (jdkVersion: string, services: string[], version: string) => Promise<import('./wailsjs/go/main/App').BatchResult>;
          TriggerPromotionAMI: (environment: string, service: string, version: string) => Promise<import('./wailsjs/go/main/App').WorkflowResult>;
        };
      };
    };
  }
}

export {};

