/**
 * Sidebar - Menu lateral de navegação
 * 
 * Exibe as opções de navegação e status do GitHub CLI.
 * Preparado para adicionar novas ferramentas no futuro.
 */

import type { GHStatus } from '../wailsjs/go/main/App';

// Ícones inline SVG para performance
const Icons = {
  devTools: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
};

// Tipos de página disponíveis
export type PageType = 'dev-tools';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: PageType) => void;
  ghStatus: GHStatus | null;
  isCheckingGh: boolean;
}

export default function Sidebar({ currentPage, onNavigate, ghStatus, isCheckingGh }: SidebarProps) {
  // Itens de Ferramentas Dev
  const devToolsItems: { id: PageType; label: string; icon: JSX.Element }[] = [
    { id: 'dev-tools', label: 'Geradores & Formatadores', icon: Icons.devTools },
  ];

  return (
    <aside className="sidebar">
      {/* Header com logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">VK</div>
          <span className="logo-text">VKC Tools</span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="sidebar-nav">
        {/* Seção Ferramentas Dev */}
        <div className="nav-section">
          <div className="nav-section-title">Ferramentas Dev</div>
          {devToolsItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onNavigate(item.id)}
            >
              <div className="nav-item-icon">{item.icon}</div>
              {item.label}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer com status do GitHub */}
      <div className="sidebar-footer">
        <div className="gh-status">
          <div className={`gh-status-dot ${ghStatus?.authenticated ? 'connected' : ''}`} />
          {isCheckingGh ? (
            <span>Verificando GitHub CLI...</span>
          ) : ghStatus?.authenticated ? (
            <span>Conectado como <strong>{ghStatus.user}</strong></span>
          ) : ghStatus?.installed ? (
            <span>GitHub CLI não autenticado</span>
          ) : (
            <span>GitHub CLI não instalado</span>
          )}
        </div>
      </div>
    </aside>
  );
}

