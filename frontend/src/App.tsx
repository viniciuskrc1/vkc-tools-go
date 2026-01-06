/**
 * VKC Tools - Aplicação Desktop para Automação de Workflows
 * 
 * Esta aplicação fornece uma interface moderna e performática para
 * disparar workflows do GitHub Actions para o projeto OnvioBR.
 */

import { useState, useEffect, useCallback } from 'react';
import { CheckGitHubCLI } from './wailsjs/go/main/App';
import type { GHStatus } from './wailsjs/go/main/App';

// Componentes
import Sidebar, { type PageType } from './components/Sidebar';
import CreateAMI from './components/CreateAMI';
import PromotionAMI from './components/PromotionAMI';
import AuthOnvio from './components/AuthOnvio';
import SessionInfo from './components/SessionInfo';
import DevTools from './components/DevTools';
import ToastContainer, { useToast } from './components/Toast';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('create-ami');
  const [ghStatus, setGhStatus] = useState<GHStatus | null>(null);
  const [isCheckingGh, setIsCheckingGh] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  // Verificar status do GitHub CLI ao iniciar
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await CheckGitHubCLI();
        setGhStatus(status);
        
        if (!status.installed) {
          addToast({
            type: 'error',
            title: 'GitHub CLI não instalado',
            message: 'Instale em: cli.github.com'
          });
        } else if (!status.authenticated) {
          addToast({
            type: 'error',
            title: 'GitHub CLI não autenticado',
            message: 'Execute: gh auth login'
          });
        } else {
          addToast({
            type: 'success',
            title: 'GitHub CLI conectado',
            message: `Logado como ${status.user || 'usuário'}`
          });
        }
      } catch (error) {
        console.error('Erro ao verificar GitHub CLI:', error);
        addToast({
          type: 'error',
          title: 'Erro',
          message: 'Falha ao verificar GitHub CLI'
        });
      } finally {
        setIsCheckingGh(false);
      }
    };

    checkStatus();
  }, []);

  // Handler para mostrar toasts
  const showToast = useCallback((type: 'success' | 'error' | 'info', title: string, message: string) => {
    addToast({ type, title, message });
  }, [addToast]);

  // Renderizar página atual
  const renderPage = () => {
    switch (currentPage) {
      case 'create-ami':
        return <CreateAMI onToast={showToast} ghReady={ghStatus?.authenticated ?? false} />;
      case 'promotion-ami':
        return <PromotionAMI onToast={showToast} ghReady={ghStatus?.authenticated ?? false} />;
      case 'auth-longtoken':
        return <AuthOnvio onToast={showToast} />;
      case 'session-info':
        return <SessionInfo onToast={showToast} />;
      case 'dev-tools':
        return <DevTools onToast={showToast} />;
      default:
        return <CreateAMI onToast={showToast} ghReady={ghStatus?.authenticated ?? false} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        ghStatus={ghStatus}
        isCheckingGh={isCheckingGh}
      />
      <main className="main-content">
        {renderPage()}
      </main>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;

