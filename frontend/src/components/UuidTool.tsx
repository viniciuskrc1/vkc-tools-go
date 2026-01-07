/**
 * UuidTool - Ferramenta de UUID
 * 
 * Gerar UUID v4 e formatar strings para UUID
 */

import { useState, useCallback } from 'react';
import { GenerateUUID } from '../wailsjs/go/main/App';

interface UuidToolProps {
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

export default function UuidTool({ onToast }: UuidToolProps) {
  const [uuidResult, setUuidResult] = useState<string>('');
  const [uuidInput, setUuidInput] = useState<string>('');
  const [uuidFormatted, setUuidFormatted] = useState<string>('');
  const [uuidError, setUuidError] = useState<string | null>(null);

  const handleGenerateUUID = useCallback(async () => {
    try {
      const result = await GenerateUUID();
      setUuidResult(result);
      onToast('success', 'UUID Gerado!', result);
    } catch (error) {
      onToast('error', 'Erro', 'Falha ao gerar UUID');
    }
  }, [onToast]);

  const handleFormatToUUID = useCallback(() => {
    // Remove caracteres não hexadecimais
    const hex = uuidInput.replace(/[^a-fA-F0-9]/g, '');
    
    if (hex.length !== 32) {
      setUuidError(`String deve ter 32 caracteres hexadecimais (atual: ${hex.length})`);
      setUuidFormatted('');
      return;
    }
    
    // Formatar como UUID: 8-4-4-4-12
    const formatted = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`.toLowerCase();
    setUuidFormatted(formatted);
    setUuidError(null);
    onToast('success', 'UUID Formatado!', formatted);
  }, [uuidInput, onToast]);

  const handleCopyNotify = useCallback(() => {
    onToast('info', 'Copiado!', 'Conteúdo copiado para a área de transferência');
  }, [onToast]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Gerar UUID */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Gerar UUID v4</h2>
        </div>
        
        <button
          onClick={handleGenerateUUID}
          className="btn btn-primary"
          style={{ marginBottom: '16px' }}
        >
          <span style={{ width: '18px', height: '18px' }}>{Icons.generate}</span>
          Gerar UUID
        </button>

        {uuidResult && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '20px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                UUID v4
              </div>
              <div style={{ 
                fontFamily: 'JetBrains Mono', 
                fontSize: '16px', 
                color: 'var(--accent-cyan)',
                letterSpacing: '0.5px'
              }}>
                {uuidResult}
              </div>
            </div>
            <CopyButton value={uuidResult} label="Copiar" onCopy={handleCopyNotify} />
          </div>
        )}

        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--border-radius)',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <strong>Formato:</strong> xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
          <br />
          <span style={{ fontSize: '11px' }}>
            Onde 4 indica a versão e y é 8, 9, A ou B
          </span>
        </div>
      </div>

      {/* Converter String para UUID */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Converter String para UUID</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            type="text"
            className="form-input font-mono"
            placeholder="Ex: AE640E0F5B644D23A6EF036AA110B07B"
            value={uuidInput}
            onChange={(e) => {
              setUuidInput(e.target.value);
              setUuidError(null);
            }}
            style={{ flex: 1 }}
          />
          <button
            onClick={handleFormatToUUID}
            className="btn btn-secondary"
            disabled={!uuidInput.trim()}
          >
            Converter
          </button>
        </div>

        {uuidError && (
          <div style={{
            padding: '12px 16px',
            background: 'rgba(255, 68, 68, 0.1)',
            border: '1px solid var(--accent-red)',
            borderRadius: 'var(--border-radius)',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ width: '18px', height: '18px', color: 'var(--accent-red)' }}>
              {Icons.x}
            </span>
            <span style={{ color: 'var(--accent-red)', fontSize: '13px' }}>
              {uuidError}
            </span>
          </div>
        )}

        {uuidFormatted && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '20px',
            background: 'rgba(0, 255, 136, 0.05)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--accent-green)'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                UUID FORMATADO
              </div>
              <div style={{ 
                fontFamily: 'JetBrains Mono', 
                fontSize: '16px', 
                color: 'var(--accent-cyan)',
                letterSpacing: '0.5px'
              }}>
                {uuidFormatted}
              </div>
            </div>
            <CopyButton value={uuidFormatted} label="Copiar" onCopy={handleCopyNotify} />
          </div>
        )}

        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--border-radius)',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <strong>Entrada aceita:</strong> String hexadecimal de 32 caracteres
          <br />
          <span style={{ fontSize: '11px' }}>
            Hífens e espaços são ignorados automaticamente
          </span>
        </div>
      </div>
    </div>
  );
}

