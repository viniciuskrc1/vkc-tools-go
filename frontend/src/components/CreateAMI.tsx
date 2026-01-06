/**
 * CreateAMI - Tela para criar novas AMIs
 * 
 * Permite selecionar múltiplas verticais e disparar o workflow
 * "OnvioBR - Create AMI" para cada uma delas em paralelo.
 */

import { useState, useCallback } from 'react';
import { TriggerCreateAMIBatch, AddHistoryEntry } from '../wailsjs/go/main/App';
import type { BatchResult, WorkflowResult, HistoryEntry } from '../wailsjs/go/main/App';
import ServiceSelector from './ServiceSelector';
import ConfirmModal from './ConfirmModal';
import History from './History';

// Ícones inline
const Icons = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  pending: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
};

// Opções de JDK
const JDK_OPTIONS = [
  { value: 'corretto8', label: 'Corretto 8' },
  { value: 'corretto11', label: 'Corretto 11 (padrão)' },
  { value: 'corretto17', label: 'Corretto 17' },
  { value: 'corretto21', label: 'Corretto 21' },
];

interface CreateAMIProps {
  onToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  ghReady: boolean;
}

export default function CreateAMI({ onToast, ghReady }: CreateAMIProps) {
  // Estado do formulário
  const [jdkVersion, setJdkVersion] = useState('corretto11');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [version, setVersion] = useState('');
  
  // Estado de execução
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  
  // Key para forçar reload do histórico
  const [historyKey, setHistoryKey] = useState(0);

  // Validação do formulário
  const isFormValid = selectedServices.length > 0 && version.trim() !== '';

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
    setBatchResult(null);

    try {
      const result = await TriggerCreateAMIBatch(jdkVersion, selectedServices, version.trim());
      setBatchResult(result);

      // Salvar no histórico
      try {
        await AddHistoryEntry({
          type: 'create-ami',
          jdkVersion,
          services: selectedServices,
          version: version.trim(),
          succeeded: result.succeeded,
          failed: result.failed,
          total: result.total
        } as any);
        setHistoryKey(prev => prev + 1); // Força reload do histórico
      } catch (historyError) {
        console.error('Erro ao salvar histórico:', historyError);
      }

      if (result.failed === 0) {
        onToast('success', 'Workflows disparados!', 
          `${result.succeeded} AMI${result.succeeded > 1 ? 's' : ''} sendo criada${result.succeeded > 1 ? 's' : ''}`);
      } else if (result.succeeded === 0) {
        onToast('error', 'Falha nos workflows', 
          `Todos os ${result.failed} workflows falharam`);
      } else {
        onToast('info', 'Execução parcial', 
          `${result.succeeded} sucesso, ${result.failed} falha${result.failed > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Erro ao disparar workflows:', error);
      onToast('error', 'Erro', 'Falha ao disparar workflows');
    } finally {
      setIsLoading(false);
    }
  }, [jdkVersion, selectedServices, version, onToast]);
  
  // Reutilizar valores do histórico
  const handleReuseHistory = useCallback((entry: HistoryEntry) => {
    if (entry.jdkVersion) setJdkVersion(entry.jdkVersion);
    setSelectedServices(entry.services);
    setVersion(entry.version);
    onToast('info', 'Valores carregados', 'Valores do histórico foram preenchidos');
  }, [onToast]);

  // Limpar resultados para nova execução
  const handleReset = useCallback(() => {
    setBatchResult(null);
    setSelectedServices([]);
    setVersion('');
  }, []);

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">OnvioBR - Create AMI</h1>
        <p className="page-subtitle">
          Cria novas AMIs para os serviços selecionados
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

              {/* JDK Version */}
              <div className="form-group">
                <label className="form-label">JDK Version</label>
                <select
                  className="form-select"
                  value={jdkVersion}
                  onChange={(e) => setJdkVersion(e.target.value)}
                  disabled={isLoading}
                >
                  {JDK_OPTIONS.map((opt) => (
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
                Serviços (Verticais) <span className="required">*</span>
              </h2>
            </div>

            <ServiceSelector
              mode="multi"
              selected={selectedServices}
              onChange={setSelectedServices}
            />
          </div>

          {/* Botão de submit */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isFormValid || isLoading || !ghReady}
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  Criando AMIs...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                  Create AMI{selectedServices.length > 1 ? `s (${selectedServices.length})` : ''}
                </>
              )}
            </button>

            {batchResult && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
              >
                Nova Execução
              </button>
            )}
          </div>

          {/* Progresso e resultados */}
          {batchResult && (
            <div className="progress-container">
              <div className="progress-header">
                <span className="progress-title">Resultado da Execução</span>
                <span className="progress-stats">
                  <span className="text-green">{batchResult.succeeded} sucesso</span>
                  {batchResult.failed > 0 && (
                    <> • <span className="text-red">{batchResult.failed} falha{batchResult.failed > 1 ? 's' : ''}</span></>
                  )}
                </span>
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${(batchResult.succeeded / batchResult.total) * 100}%`,
                    background: batchResult.failed > 0 
                      ? `linear-gradient(90deg, var(--accent-green) ${(batchResult.succeeded / batchResult.total) * 100}%, var(--accent-red) 0%)`
                      : undefined
                  }} 
                />
              </div>

              <div className="progress-results">
                {batchResult.results.map((result: WorkflowResult, index: number) => (
                  <div 
                    key={`${result.service}-${index}`}
                    className={`progress-item ${result.success ? 'success' : 'error'}`}
                  >
                    <div className="progress-item-icon">
                      {result.success ? Icons.success : Icons.error}
                    </div>
                    <span>{result.service}</span>
                    {result.error && (
                      <span className="text-muted" style={{ marginLeft: 'auto', fontSize: '11px' }}>
                        {result.error.slice(0, 50)}...
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Histórico de execuções */}
          <History 
            key={historyKey}
            type="create-ami" 
            onReuse={handleReuseHistory} 
          />
        </form>
      </div>

      {/* Modal de confirmação */}
      {showConfirm && (
        <ConfirmModal
          title="Confirmar criação de AMIs"
          message={
            <>
              Você está prestes a disparar <strong>{selectedServices.length}</strong> workflow{selectedServices.length > 1 ? 's' : ''} 
              {' '}para criar AMIs com a versão <strong>{version}</strong>.
              <br /><br />
              Deseja continuar?
            </>
          }
          confirmLabel="Criar AMIs"
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

