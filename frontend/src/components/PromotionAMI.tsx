/**
 * PromotionAMI - Tela para promover AMIs para ambientes
 * 
 * Permite selecionar uma única vertical e promover a AMI
 * para um ambiente específico (lab ou qa).
 */

import { useState, useCallback } from 'react';
import { TriggerPromotionAMI, AddHistoryEntry } from '../wailsjs/go/main/App';
import type { HistoryEntry } from '../wailsjs/go/main/App';
import ServiceSelector from './ServiceSelector';
import ConfirmModal from './ConfirmModal';
import History from './History';

// Opções de ambiente
const ENVIRONMENT_OPTIONS = [
  { value: 'lab-lab01', label: 'lab-lab01 (padrão)' },
  { value: 'qa-qa01', label: 'qa-qa01' },
];

interface PromotionAMIProps {
  onToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  ghReady: boolean;
}

export default function PromotionAMI({ onToast, ghReady }: PromotionAMIProps) {
  // Estado do formulário
  const [environment, setEnvironment] = useState('lab-lab01');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [version, setVersion] = useState('');
  
  // Estado de execução
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Key para forçar reload do histórico
  const [historyKey, setHistoryKey] = useState(0);

  // Validação do formulário
  const isFormValid = selectedServices.length === 1 && version.trim() !== '';

  // Handler para submissão
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !ghReady) return;
    setShowConfirm(true);
  }, [isFormValid, ghReady]);

  // Confirmar e executar
  const handleConfirm = useCallback(async () => {
    setShowConfirm(false);
    setIsLoading(true);
    setLastResult(null);

    const service = selectedServices[0];

    try {
      const result = await TriggerPromotionAMI(environment, service, version.trim());

      // Salvar no histórico
      try {
        await AddHistoryEntry({
          type: 'promotion-ami',
          environment,
          services: [service],
          version: version.trim(),
          succeeded: result.success ? 1 : 0,
          failed: result.success ? 0 : 1,
          total: 1
        } as any);
        setHistoryKey(prev => prev + 1); // Força reload do histórico
      } catch (historyError) {
        console.error('Erro ao salvar histórico:', historyError);
      }

      if (result.success) {
        setLastResult({ success: true, message: result.message });
        onToast('success', 'Promoção iniciada!', 
          `AMI ${service} sendo promovida para ${environment}`);
      } else {
        setLastResult({ success: false, message: result.error || 'Erro desconhecido' });
        onToast('error', 'Falha na promoção', result.error || 'Erro ao disparar workflow');
      }
    } catch (error) {
      console.error('Erro ao disparar workflow:', error);
      setLastResult({ success: false, message: String(error) });
      onToast('error', 'Erro', 'Falha ao disparar workflow de promoção');
    } finally {
      setIsLoading(false);
    }
  }, [environment, selectedServices, version, onToast]);
  
  // Reutilizar valores do histórico
  const handleReuseHistory = useCallback((entry: HistoryEntry) => {
    if (entry.environment) setEnvironment(entry.environment);
    setSelectedServices(entry.services);
    setVersion(entry.version);
    onToast('info', 'Valores carregados', 'Valores do histórico foram preenchidos');
  }, [onToast]);

  // Limpar para nova execução
  const handleReset = useCallback(() => {
    setLastResult(null);
    setSelectedServices([]);
    setVersion('');
  }, []);

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">OnvioBR - Promotion AMI</h1>
        <p className="page-subtitle">
          Promove uma AMI existente para um ambiente específico
        </p>
      </header>

      <div className="page-body">
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Configuração</h2>
            </div>

            <div className="form-grid">
              {/* App (readonly) */}
              <div className="form-group">
                <label className="form-label">App</label>
                <input
                  type="text"
                  className="form-input font-mono"
                  value="onviobr"
                  disabled
                />
              </div>

              {/* Environment */}
              <div className="form-group">
                <label className="form-label">Environment</label>
                <select
                  className="form-select"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  disabled={isLoading}
                >
                  {ENVIRONMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Version */}
              <div className="form-group">
                <label className="form-label">
                  Version <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="Ex: 1.2.3 ou 2024.01.15"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                Serviço (Vertical) <span className="required">*</span>
              </h2>
              <span className="text-muted" style={{ fontSize: '12px' }}>
                Selecione apenas um serviço
              </span>
            </div>

            <ServiceSelector
              mode="single"
              selected={selectedServices}
              onChange={setSelectedServices}
            />
          </div>

          {/* Resultado da última execução */}
          {lastResult && (
            <div 
              className="card" 
              style={{ 
                borderColor: lastResult.success ? 'var(--accent-green)' : 'var(--accent-red)',
                background: lastResult.success 
                  ? 'rgba(0, 255, 136, 0.05)' 
                  : 'rgba(255, 68, 68, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: lastResult.success 
                    ? 'rgba(0, 255, 136, 0.15)' 
                    : 'rgba(255, 68, 68, 0.15)',
                  color: lastResult.success ? 'var(--accent-green)' : 'var(--accent-red)'
                }}>
                  {lastResult.success ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  )}
                </div>
                <div>
                  <div style={{ 
                    fontWeight: 600, 
                    color: lastResult.success ? 'var(--accent-green)' : 'var(--accent-red)',
                    marginBottom: '2px'
                  }}>
                    {lastResult.success ? 'Workflow disparado com sucesso!' : 'Falha ao disparar workflow'}
                  </div>
                  <div className="text-muted" style={{ fontSize: '13px' }}>
                    {lastResult.message}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isFormValid || isLoading || !ghReady}
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  Promovendo...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                  Promote AMI
                </>
              )}
            </button>

            {lastResult && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
              >
                Nova Promoção
              </button>
            )}
          </div>
          
          {/* Histórico de execuções */}
          <History 
            key={historyKey}
            type="promotion-ami" 
            onReuse={handleReuseHistory} 
          />
        </form>
      </div>

      {/* Modal de confirmação */}
      {showConfirm && (
        <ConfirmModal
          title="Confirmar promoção de AMI"
          message={
            <>
              Você está prestes a promover a AMI <strong>{selectedServices[0]}</strong>
              {' '}versão <strong>{version}</strong> para o ambiente <strong>{environment}</strong>.
              <br /><br />
              Deseja continuar?
            </>
          }
          confirmLabel="Promover AMI"
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

