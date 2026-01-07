/**
 * NameGenerator - Gerador de Nomes Aleatórios
 * 
 * Gera nomes brasileiros aleatórios
 */

import { useState, useCallback } from 'react';
import { GenerateRandomName } from '../wailsjs/go/main/App';

interface NameGeneratorProps {
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
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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

export default function NameGenerator({ onToast }: NameGeneratorProps) {
  const [nameCount, setNameCount] = useState(1);
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);

  const handleGenerateNames = useCallback(async () => {
    try {
      const names: string[] = [];
      for (let i = 0; i < nameCount; i++) {
        const name = await GenerateRandomName();
        names.push(name);
      }
      setGeneratedNames(names);
      onToast('success', 'Nomes Gerados!', `${nameCount} nome(s) gerado(s) com sucesso`);
    } catch (error) {
      onToast('error', 'Erro', 'Falha ao gerar nomes');
      console.error('Erro ao gerar nomes:', error);
    }
  }, [nameCount, onToast]);

  const handleCopyAll = useCallback(() => {
    if (generatedNames.length === 0) return;
    const allNames = generatedNames.join('\n');
    navigator.clipboard.writeText(allNames);
    onToast('info', 'Copiado!', 'Todos os nomes copiados para a área de transferência');
  }, [generatedNames, onToast]);

  const handleCopyNotify = useCallback(() => {
    onToast('info', 'Copiado!', 'Nome copiado para a área de transferência');
  }, [onToast]);

  const handleClear = useCallback(() => {
    setGeneratedNames([]);
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Gerador de Nomes Aleatórios</h2>
      </div>

      {/* Configuração */}
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label">Quantidade de nomes</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="number"
            min="1"
            max="50"
            value={nameCount}
            onChange={(e) => {
              const value = Math.max(1, Math.min(50, parseInt(e.target.value) || 1));
              setNameCount(value);
            }}
            className="form-input"
            style={{ width: '100px', textAlign: 'center' }}
          />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            (máximo: 50)
          </span>
        </div>
      </div>

      {/* Botões de ação */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={handleGenerateNames}
          className="btn btn-primary"
          disabled={nameCount < 1 || nameCount > 50}
        >
          <span style={{ width: '18px', height: '18px' }}>{Icons.generate}</span>
          Gerar {nameCount} Nome{nameCount !== 1 ? 's' : ''}
        </button>
        {generatedNames.length > 0 && (
          <>
            <button
              onClick={handleCopyAll}
              className="btn btn-secondary"
            >
              <span style={{ width: '18px', height: '18px' }}>{Icons.copy}</span>
              Copiar Todos
            </button>
            <button
              onClick={handleClear}
              className="btn btn-secondary"
            >
              Limpar
            </button>
          </>
        )}
      </div>

      {/* Resultados */}
      {generatedNames.length > 0 && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <label className="form-label" style={{ margin: 0 }}>
              Nomes Gerados ({generatedNames.length})
            </label>
          </div>

          <div style={{
            padding: '16px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border-color)',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {generatedNames.map((name, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  marginBottom: index < generatedNames.length - 1 ? '8px' : 0,
                  background: 'var(--bg-primary)',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <span style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--bg-primary)',
                    fontSize: '14px',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    {Icons.user}
                  </span>
                  <span style={{
                    fontSize: '16px',
                    color: 'var(--text-primary)',
                    fontWeight: 500
                  }}>
                    {name}
                  </span>
                </div>
                <CopyButton value={name} label="Copiar" onCopy={handleCopyNotify} />
              </div>
            ))}
          </div>

          {/* Dica */}
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius)',
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}>
            <strong>Dica:</strong> Os nomes são gerados aleatoriamente com primeiro nome, segundo nome (opcional) e sobrenome, seguindo padrões brasileiros comuns.
          </div>
        </div>
      )}
    </div>
  );
}

