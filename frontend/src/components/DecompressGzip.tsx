/**
 * DecompressGzip - Descompressor de Gzip em Base64
 * 
 * Descomprime um Gzip que está codificado em base64 e exibe o conteúdo
 */

import { useState, useCallback, useEffect } from 'react';
import { DecompressGzip as decompressGzipBackend } from '../wailsjs/go/main/App';

interface DecompressGzipProps {
  onToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

// Ícones
const Icons = {
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

export default function DecompressGzip({ onToast }: DecompressGzipProps) {
  const [base64Input, setBase64Input] = useState<string>('');
  const [decompressedContent, setDecompressedContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isValidBase64 = useCallback((str: string): boolean => {
    try {
      const cleanStr = str.replace(/\s/g, '');
      return /^[A-Za-z0-9+/]*={0,2}$/.test(cleanStr);
    } catch {
      return false;
    }
  }, []);

  const handleDecompress = useCallback(async () => {
    setError(null);
    setDecompressedContent('');
    
    if (!base64Input.trim()) {
      return;
    }

    try {
      let base64Data = base64Input.trim();
      
      // Remover data:...;base64, se existir
      const base64Match = base64Data.match(/^data:(.+?);base64,(.+)$/);
      if (base64Match) {
        base64Data = base64Match[2];
      }

      // Validar se é base64 válido
      if (!isValidBase64(base64Data)) {
        setError('Base64 inválido. Por favor, verifique o formato.');
        return;
      }

      setIsLoading(true);
      
      // Chamar a função do backend
      const result = await decompressGzipBackend(base64Data);
      
      setDecompressedContent(result);
      setIsLoading(false);
      onToast('success', 'Gzip descomprimido!', 'Conteúdo extraído com sucesso');
    } catch (error: any) {
      setIsLoading(false);
      const errorMessage = error?.message || 'Erro ao descomprimir Gzip. Verifique se o base64 contém um Gzip válido.';
      setError(errorMessage);
      onToast('error', 'Erro', errorMessage);
    }
  }, [base64Input, isValidBase64, onToast]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBase64Input(event.target.value);
    setError(null);
  }, []);

  // Auto-decompress quando o input mudar (com debounce)
  useEffect(() => {
    if (!base64Input.trim()) {
      setDecompressedContent('');
      setError(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleDecompress();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [base64Input, handleDecompress]);

  const handleClear = useCallback(() => {
    setBase64Input('');
    setDecompressedContent('');
    setError(null);
  }, []);

  const handleCopyNotify = useCallback(() => {
    onToast('info', 'Copiado!', 'Conteúdo copiado para a área de transferência');
  }, [onToast]);

  // Detectar tipo de conteúdo
  const detectContentType = useCallback((content: string): string => {
    const trimmed = content.trim();
    if (trimmed.startsWith('<?xml') || trimmed.startsWith('<')) {
      return 'XML';
    }
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return 'JSON';
    }
    if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
      return 'HTML';
    }
    return 'Texto';
  }, []);

  const contentType = decompressedContent ? detectContentType(decompressedContent) : '';

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Descomprimir Gzip (Base64)</h2>
      </div>

      {/* Input Area */}
      <div className="form-group">
        <label className="form-label">Base64 do Gzip</label>
        <div style={{ position: 'relative' }}>
          <textarea
            className="form-input font-mono"
            placeholder="Cole aqui o base64 de um arquivo Gzip (ex: H4sIAAAAAAAAAKVX25aySLK+...)"
            value={base64Input}
            onChange={handleInputChange}
            style={{
              minHeight: '150px',
              resize: 'vertical',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              lineHeight: 1.5,
              paddingRight: '40px'
            }}
          />
          {base64Input && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontSize: '18px',
                lineHeight: 1
              }}
              title="Limpar"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{
          padding: '16px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          marginBottom: '16px'
        }}>
          Descomprimindo Gzip...
        </div>
      )}

      {/* Error */}
      {error && (
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
            {error}
          </span>
        </div>
      )}

      {/* Output */}
      {decompressedContent && (
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label className="form-label">Conteúdo Descomprimido</label>
              {contentType && (
                <span style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  padding: '2px 8px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '10px'
                }}>
                  {contentType}
                </span>
              )}
            </div>
            <CopyButton value={decompressedContent} label="Copiar Conteúdo" onCopy={handleCopyNotify} />
          </div>
          <div style={{ position: 'relative' }}>
            <textarea
              readOnly
              value={decompressedContent}
              style={{
                width: '100%',
                minHeight: '300px',
                padding: '16px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--accent-green)',
                borderRadius: 'var(--border-radius)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12px',
                lineHeight: 1.5,
                color: 'var(--accent-cyan)',
                resize: 'vertical',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

