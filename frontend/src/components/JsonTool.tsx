/**
 * JsonTool - Ferramenta de JSON
 * 
 * Formatador e minificador de JSON
 */

import { useState, useCallback } from 'react';

interface JsonToolProps {
  onToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

// Ícones
const Icons = {
  format: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  minify: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  ),
  clear: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
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
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
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

export default function JsonTool({ onToast }: JsonToolProps) {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonIndent, setJsonIndent] = useState<number>(2);

  const handleFormatJSON = useCallback(() => {
    if (!jsonInput.trim()) {
      setJsonError('Digite um JSON para formatar');
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, jsonIndent);
      setJsonOutput(formatted);
      setJsonError(null);
      onToast('success', 'JSON Formatado!', 'Beautify aplicado com sucesso');
    } catch (error) {
      setJsonError(`JSON inválido: ${(error as Error).message}`);
      setJsonOutput('');
      onToast('error', 'Erro', 'JSON inválido');
    }
  }, [jsonInput, jsonIndent, onToast]);

  const handleMinifyJSON = useCallback(() => {
    if (!jsonInput.trim()) {
      setJsonError('Digite um JSON para minificar');
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      const minified = JSON.stringify(parsed);
      setJsonOutput(minified);
      setJsonError(null);
      onToast('success', 'JSON Minificado!', 'Minify aplicado com sucesso');
    } catch (error) {
      setJsonError(`JSON inválido: ${(error as Error).message}`);
      setJsonOutput('');
      onToast('error', 'Erro', 'JSON inválido');
    }
  }, [jsonInput, onToast]);

  const handleClearJSON = useCallback(() => {
    setJsonInput('');
    setJsonOutput('');
    setJsonError(null);
  }, []);

  const handleCopyNotify = useCallback(() => {
    onToast('info', 'Copiado!', 'Conteúdo copiado para a área de transferência');
  }, [onToast]);

  const handleDownloadJSON = useCallback(() => {
    if (!jsonOutput) return;
    
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formatted.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    onToast('success', 'Download iniciado!', 'Arquivo JSON baixado com sucesso');
  }, [jsonOutput, onToast]);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">JSON Formatter</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Indentação:</span>
          <select
            value={jsonIndent}
            onChange={(e) => setJsonIndent(Number(e.target.value))}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '4px 8px',
              color: 'var(--text-primary)',
              fontSize: '12px'
            }}
          >
            <option value={2}>2 espaços</option>
            <option value={4}>4 espaços</option>
            <option value={1}>1 tab</option>
          </select>
        </div>
      </div>
      
      {/* Input Area */}
      <div className="form-group">
        <label className="form-label">JSON de Entrada</label>
        <textarea
          className="form-input font-mono"
          placeholder='Cole seu JSON aqui... Ex: {"nome": "teste", "valor": 123}'
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            setJsonError(null);
          }}
          style={{
            minHeight: '150px',
            resize: 'vertical',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
            lineHeight: 1.5
          }}
        />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={handleFormatJSON}
          className="btn btn-primary"
          disabled={!jsonInput.trim()}
        >
          <span style={{ width: '18px', height: '18px' }}>{Icons.format}</span>
          Beautify (Formatar)
        </button>
        <button
          onClick={handleMinifyJSON}
          className="btn btn-secondary"
          disabled={!jsonInput.trim()}
        >
          <span style={{ width: '18px', height: '18px' }}>{Icons.minify}</span>
          Minify (Compactar)
        </button>
        <button
          onClick={handleClearJSON}
          className="btn btn-secondary"
          disabled={!jsonInput.trim() && !jsonOutput}
        >
          <span style={{ width: '18px', height: '18px' }}>{Icons.clear}</span>
          Limpar
        </button>
      </div>

      {/* Error */}
      {jsonError && (
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
            {jsonError}
          </span>
        </div>
      )}

      {/* Output Area */}
      {jsonOutput && (
        <div style={{ position: 'relative' }}>
          <label className="form-label">JSON Formatado</label>
          <div style={{
            padding: '16px',
            background: 'var(--bg-primary)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--accent-green)',
            maxHeight: '400px',
            overflowY: 'auto',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
            lineHeight: 1.6,
            color: 'var(--accent-cyan)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {jsonOutput}
          </div>
          <div style={{ 
            position: 'absolute', 
            top: '32px', 
            right: '12px',
            display: 'flex',
            gap: '8px'
          }}>
            <CopyButton value={jsonOutput} label="Copiar JSON" onCopy={handleCopyNotify} />
            <button
              type="button"
              onClick={handleDownloadJSON}
              disabled={!jsonOutput}
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: jsonOutput ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: jsonOutput ? 'var(--text-secondary)' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                opacity: jsonOutput ? 1 : 0.5
              }}
            >
              <span style={{ width: '14px', height: '14px' }}>
                {Icons.download}
              </span>
              Baixar JSON
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div style={{ 
        marginTop: '16px',
        padding: '12px',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--border-radius)',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        <strong>Dicas:</strong>
        <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
          <li><strong>Beautify:</strong> Formata o JSON com indentação para melhor leitura</li>
          <li><strong>Minify:</strong> Remove espaços e quebras de linha para reduzir tamanho</li>
          <li>O validador identifica erros de sintaxe no seu JSON</li>
        </ul>
      </div>
    </div>
  );
}

