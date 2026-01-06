/**
 * History - Componente de histórico de execuções
 * 
 * Exibe as últimas 10 execuções de Create AMI e Promotion AMI.
 */

import { useState, useEffect, useCallback } from 'react';
import { GetHistoryByType, DeleteHistoryEntry, ClearHistory } from '../wailsjs/go/main/App';
import type { HistoryEntry } from '../wailsjs/go/main/App';

// Ícones
const Icons = {
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  partial: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  )
};

interface HistoryProps {
  type: 'create-ami' | 'promotion-ami';
  onReuse?: (entry: HistoryEntry) => void;
}

export default function History({ type, onReuse }: HistoryProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Carregar histórico
  const loadHistory = useCallback(async () => {
    try {
      const data = await GetHistoryByType(type);
      setEntries(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Deletar entrada
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await DeleteHistoryEntry(id);
      await loadHistory();
    } catch (error) {
      console.error('Erro ao deletar entrada:', error);
    }
  };

  // Limpar todo histórico
  const handleClearAll = async () => {
    if (!confirm('Limpar todo o histórico?')) return;
    try {
      await ClearHistory();
      await loadHistory();
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
    }
  };

  // Formatar data
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determinar status
  const getStatus = (entry: HistoryEntry) => {
    if (entry.failed === 0) return 'success';
    if (entry.succeeded === 0) return 'error';
    return 'partial';
  };

  // Cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'var(--accent-green)';
      case 'error': return 'var(--accent-red)';
      case 'partial': return 'var(--accent-orange)';
      default: return 'var(--text-muted)';
    }
  };

  if (entries.length === 0 && !isLoading) {
    return null; // Não mostrar se não há histórico
  }

  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <div 
        className="card-header" 
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '18px', height: '18px', color: 'var(--accent-purple)' }}>
            {Icons.clock}
          </div>
          <h2 className="card-title" style={{ margin: 0 }}>
            Histórico Recente
          </h2>
          <span style={{ 
            fontSize: '12px', 
            color: 'var(--text-muted)',
            background: 'var(--bg-tertiary)',
            padding: '2px 8px',
            borderRadius: '10px'
          }}>
            {entries.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isExpanded && entries.length > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClearAll(); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px'
              }}
              title="Limpar histórico"
            >
              <span style={{ width: '14px', height: '14px' }}>{Icons.trash}</span>
              Limpar
            </button>
          )}
          <span style={{ 
            color: 'var(--text-muted)',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease'
          }}>
            ▼
          </span>
        </div>
      </div>

      {isExpanded && (
        <div style={{ marginTop: '16px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
              Carregando...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {entries.map((entry) => {
                const status = getStatus(entry);
                const statusColor = getStatusColor(status);
                
                return (
                  <div
                    key={entry.id}
                    onClick={() => onReuse?.(entry)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--border-radius)',
                      cursor: onReuse ? 'pointer' : 'default',
                      transition: 'background 0.15s ease',
                      borderLeft: `3px solid ${statusColor}`
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  >
                    {/* Status icon */}
                    <div style={{ width: '18px', height: '18px', color: statusColor, flexShrink: 0 }}>
                      {status === 'success' ? Icons.success : status === 'error' ? Icons.error : Icons.partial}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{ 
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'var(--accent-cyan)'
                        }}>
                          v{entry.version}
                        </span>
                        {entry.jdkVersion && (
                          <span style={{ 
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            background: 'var(--bg-secondary)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {entry.jdkVersion}
                          </span>
                        )}
                        {entry.environment && (
                          <span style={{ 
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            background: 'var(--bg-secondary)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {entry.environment}
                          </span>
                        )}
                      </div>
                      <div style={{ 
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {entry.services.length === 1 
                          ? entry.services[0]
                          : `${entry.services.length} serviços`
                        }
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {formatDate(entry.timestamp)}
                      </span>
                      {entry.total > 1 && (
                        <span style={{ 
                          fontSize: '11px',
                          color: statusColor
                        }}>
                          {entry.succeeded}/{entry.total}
                        </span>
                      )}
                      <button
                        onClick={(e) => handleDelete(entry.id, e)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          opacity: 0.5,
                          transition: 'opacity 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                        title="Remover do histórico"
                      >
                        <span style={{ width: '14px', height: '14px' }}>{Icons.trash}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {onReuse && entries.length > 0 && (
            <div style={{ 
              marginTop: '12px', 
              fontSize: '11px', 
              color: 'var(--text-muted)',
              textAlign: 'center'
            }}>
              💡 Clique em uma entrada para reutilizar os valores
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Função auxiliar para adicionar ao histórico (exportada para uso nos componentes)
export async function addToHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>) {
  const { AddHistoryEntry } = await import('../wailsjs/go/main/App');
  await AddHistoryEntry(entry as any);
}

