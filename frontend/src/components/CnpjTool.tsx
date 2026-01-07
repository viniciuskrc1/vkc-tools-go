/**
 * CnpjTool - Ferramenta de CNPJ
 * 
 * Gerar, validar e formatar CNPJ
 */

import { useState, useCallback } from 'react';
import { GenerateCNPJ, ValidateCNPJ } from '../wailsjs/go/main/App';

interface CnpjToolProps {
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

export default function CnpjTool({ onToast }: CnpjToolProps) {
  const [cnpjResult, setCnpjResult] = useState<{ raw: string; formatted: string; valid: boolean } | null>(null);
  const [cnpjInput, setCnpjInput] = useState('');
  const [cnpjValidation, setCnpjValidation] = useState<{ raw: string; formatted: string; valid: boolean } | null>(null);

  const handleGenerateCNPJ = useCallback(async () => {
    try {
      const result = await GenerateCNPJ();
      setCnpjResult(result);
      onToast('success', 'CNPJ Gerado!', result.formatted);
    } catch (error) {
      onToast('error', 'Erro', 'Falha ao gerar CNPJ');
    }
  }, [onToast]);

  const handleValidateCNPJ = useCallback(async () => {
    if (!cnpjInput.trim()) return;
    try {
      const result = await ValidateCNPJ(cnpjInput);
      setCnpjValidation(result);
      if (result.valid) {
        onToast('success', 'CNPJ Válido!', result.formatted);
      } else {
        onToast('error', 'CNPJ Inválido', 'O CNPJ informado não é válido');
      }
    } catch (error) {
      onToast('error', 'Erro', 'Falha ao validar CNPJ');
    }
  }, [cnpjInput, onToast]);

  const handleCopyNotify = useCallback(() => {
    onToast('info', 'Copiado!', 'Conteúdo copiado para a área de transferência');
  }, [onToast]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Gerar CNPJ */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Gerar CNPJ Válido</h2>
        </div>
        
        <button
          onClick={handleGenerateCNPJ}
          className="btn btn-primary"
          style={{ marginBottom: '16px' }}
        >
          <span style={{ width: '18px', height: '18px' }}>{Icons.generate}</span>
          Gerar CNPJ
        </button>

        {cnpjResult && (
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
                  {cnpjResult.formatted}
                </div>
              </div>
              <CopyButton value={cnpjResult.formatted} label="Copiar" onCopy={handleCopyNotify} />
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
                  {cnpjResult.raw}
                </div>
              </div>
              <CopyButton value={cnpjResult.raw} label="Copiar" onCopy={handleCopyNotify} />
            </div>
          </div>
        )}
      </div>

      {/* Validar/Formatar CNPJ */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Validar / Formatar CNPJ</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            className="form-input font-mono"
            placeholder="Digite um CNPJ (com ou sem máscara)"
            value={cnpjInput}
            onChange={(e) => setCnpjInput(e.target.value)}
            style={{ flex: 1 }}
          />
          <button
            onClick={handleValidateCNPJ}
            className="btn btn-secondary"
            disabled={!cnpjInput.trim()}
          >
            Validar
          </button>
        </div>

        {cnpjValidation && (
          <div style={{
            padding: '16px',
            background: cnpjValidation.valid ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 68, 68, 0.05)',
            border: `1px solid ${cnpjValidation.valid ? 'var(--accent-green)' : 'var(--accent-red)'}`,
            borderRadius: 'var(--border-radius)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '12px',
              color: cnpjValidation.valid ? 'var(--accent-green)' : 'var(--accent-red)'
            }}>
              <span style={{ width: '18px', height: '18px' }}>
                {cnpjValidation.valid ? Icons.check : Icons.x}
              </span>
              <span style={{ fontWeight: 600 }}>
                {cnpjValidation.valid ? 'CNPJ Válido' : 'CNPJ Inválido'}
              </span>
            </div>

            {cnpjValidation.valid && cnpjValidation.formatted && (
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
                    {cnpjValidation.formatted}
                  </div>
                </div>
                <CopyButton value={cnpjValidation.formatted} label="Com máscara" onCopy={handleCopyNotify} />
                <CopyButton value={cnpjValidation.raw} label="Só números" onCopy={handleCopyNotify} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

