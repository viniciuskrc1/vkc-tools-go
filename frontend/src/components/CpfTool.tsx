/**
 * CpfTool - Ferramenta de CPF
 * 
 * Gerar, validar e formatar CPF
 */

import { useState, useCallback } from 'react';
import { GenerateCPF, ValidateCPF } from '../wailsjs/go/main/App';

interface CpfToolProps {
  onToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

// Ícones
const Icons = {
  generate: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
};

interface CopyButtonProps {
  value: string;
  label?: string;
  onCopy: () => void;
}

function CopyButton({ value, label = 'Copiar', onCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  }, [value, onCopy]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!value}
      style={{
        background: copied ? 'var(--accent-green)' : 'var(--bg-tertiary)',
        border: `1px solid ${copied ? 'var(--accent-green)' : 'var(--border-color)'}`,
        borderRadius: '6px',
        padding: '8px 12px',
        cursor: value ? 'pointer' : 'not-allowed',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: copied ? 'var(--bg-primary)' : value ? 'var(--text-secondary)' : 'var(--text-muted)',
        fontSize: '12px',
        fontWeight: 500,
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        opacity: value ? 1 : 0.5
      }}
    >
      <span style={{ width: '14px', height: '14px' }}>
        {copied ? Icons.check : Icons.copy}
      </span>
      {copied ? 'Copiado!' : label}
    </button>
  );
}

export default function CpfTool({ onToast }: CpfToolProps) {
  const [cpfResult, setCpfResult] = useState<{ raw: string; formatted: string; valid: boolean } | null>(null);
  const [cpfInput, setCpfInput] = useState('');
  const [cpfValidation, setCpfValidation] = useState<{ raw: string; formatted: string; valid: boolean } | null>(null);

  const handleGenerateCPF = useCallback(async () => {
    try {
      const result = await GenerateCPF();
      setCpfResult(result);
      onToast('success', 'CPF Gerado!', result.formatted);
    } catch (error) {
      onToast('error', 'Erro', 'Falha ao gerar CPF');
    }
  }, [onToast]);

  const handleValidateCPF = useCallback(async () => {
    if (!cpfInput.trim()) return;
    try {
      const result = await ValidateCPF(cpfInput);
      setCpfValidation(result);
      if (result.valid) {
        onToast('success', 'CPF Válido!', result.formatted);
      } else {
        onToast('error', 'CPF Inválido', 'O CPF informado não é válido');
      }
    } catch (error) {
      onToast('error', 'Erro', 'Falha ao validar CPF');
    }
  }, [cpfInput, onToast]);

  const handleCopyNotify = useCallback(() => {
    onToast('info', 'Copiado!', 'Conteúdo copiado para a área de transferência');
  }, [onToast]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Gerar CPF */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Gerar CPF Válido</h2>
        </div>
        
        <button
          onClick={handleGenerateCPF}
          className="btn btn-primary"
          style={{ marginBottom: '16px' }}
        >
          <span style={{ width: '18px', height: '18px' }}>{Icons.generate}</span>
          Gerar CPF
        </button>

        {cpfResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  COM MÁSCARA
                </div>
                <div style={{ 
                  fontFamily: 'JetBrains Mono', 
                  fontSize: '18px', 
                  color: 'var(--accent-cyan)',
                  letterSpacing: '1px'
                }}>
                  {cpfResult.formatted}
                </div>
              </div>
              <CopyButton value={cpfResult.formatted} label="Copiar" onCopy={handleCopyNotify} />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  APENAS NÚMEROS
                </div>
                <div style={{ 
                  fontFamily: 'JetBrains Mono', 
                  fontSize: '18px', 
                  color: 'var(--text-primary)',
                  letterSpacing: '2px'
                }}>
                  {cpfResult.raw}
                </div>
              </div>
              <CopyButton value={cpfResult.raw} label="Copiar" onCopy={handleCopyNotify} />
            </div>
          </div>
        )}
      </div>

      {/* Validar/Formatar CPF */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Validar / Formatar CPF</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            className="form-input font-mono"
            placeholder="Digite um CPF (com ou sem máscara)"
            value={cpfInput}
            onChange={(e) => setCpfInput(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            onClick={handleValidateCPF}
            className="btn btn-secondary"
            disabled={!cpfInput.trim()}
          >
            Validar
          </button>
        </div>

        {cpfValidation && (
          <div style={{
            padding: '16px',
            background: cpfValidation.valid ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 68, 68, 0.05)',
            border: `1px solid ${cpfValidation.valid ? 'var(--accent-green)' : 'var(--accent-red)'}`,
            borderRadius: 'var(--border-radius)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '12px',
              color: cpfValidation.valid ? 'var(--accent-green)' : 'var(--accent-red)'
            }}>
              <span style={{ width: '18px', height: '18px' }}>
                {cpfValidation.valid ? Icons.check : Icons.x}
              </span>
              <span style={{ fontWeight: 600 }}>
                {cpfValidation.valid ? 'CPF Válido' : 'CPF Inválido'}
              </span>
            </div>

            {cpfValidation.valid && cpfValidation.formatted && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  flex: 1,
                  padding: '12px',
                  background: 'var(--bg-primary)',
                  borderRadius: '6px'
                }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    FORMATADO
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}>
                    {cpfValidation.formatted}
                  </div>
                </div>
                <CopyButton value={cpfValidation.formatted} label="Com máscara" onCopy={handleCopyNotify} />
                <CopyButton value={cpfValidation.raw} label="Só números" onCopy={handleCopyNotify} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

