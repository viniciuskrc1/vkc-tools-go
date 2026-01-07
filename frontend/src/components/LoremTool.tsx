/**
 * LoremTool - Ferramenta de Lorem Ipsum
 * 
 * Gerar texto Lorem Ipsum
 */

import { useState, useCallback } from 'react';
import { GenerateLoremIpsum } from '../wailsjs/go/main/App';

interface LoremToolProps {
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

export default function LoremTool({ onToast }: LoremToolProps) {
  const [loremParagraphs, setLoremParagraphs] = useState(3);
  const [loremResult, setLoremResult] = useState<string>('');

  const handleGenerateLorem = useCallback(async () => {
    try {
      const result = await GenerateLoremIpsum(loremParagraphs);
      setLoremResult(result);
      onToast('success', 'Lorem Ipsum Gerado!', `${loremParagraphs} parágrafo(s)`);
    } catch (error) {
      onToast('error', 'Erro', 'Falha ao gerar Lorem Ipsum');
    }
  }, [loremParagraphs, onToast]);

  const handleCopyNotify = useCallback(() => {
    onToast('info', 'Copiado!', 'Conteúdo copiado para a área de transferência');
  }, [onToast]);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Gerar Lorem Ipsum</h2>
      </div>
      
      <div className="form-group" style={{ marginBottom: '16px' }}>
        <label className="form-label">Número de parágrafos</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="range"
            min="1"
            max="10"
            value={loremParagraphs}
            onChange={(e) => setLoremParagraphs(Number(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--accent-cyan)' }}
          />
          <span style={{ 
            fontFamily: 'JetBrains Mono',
            background: 'var(--bg-tertiary)',
            padding: '4px 12px',
            borderRadius: '6px',
            minWidth: '40px',
            textAlign: 'center'
          }}>
            {loremParagraphs}
          </span>
        </div>
      </div>

      <button
        onClick={handleGenerateLorem}
        className="btn btn-primary"
        style={{ marginBottom: '16px' }}
      >
        <span style={{ width: '18px', height: '18px' }}>{Icons.generate}</span>
        Gerar Lorem Ipsum
      </button>

      {loremResult && (
        <div style={{ position: 'relative' }}>
          <div style={{
            padding: '20px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border-color)',
            maxHeight: '300px',
            overflowY: 'auto',
            fontSize: '14px',
            lineHeight: 1.8,
            color: 'var(--text-secondary)',
            whiteSpace: 'pre-wrap'
          }}>
            {loremResult}
          </div>
          <div style={{ 
            position: 'absolute', 
            top: '12px', 
            right: '12px' 
          }}>
            <CopyButton value={loremResult} label="Copiar texto" onCopy={handleCopyNotify} />
          </div>
        </div>
      )}
    </div>
  );
}

