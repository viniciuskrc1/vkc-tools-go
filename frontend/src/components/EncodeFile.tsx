/**
 * EncodeFile - Codificador de Arquivo para Base64
 * 
 * Converte arquivos para formato Base64 com suporte a drag & drop
 */

import { useState, useCallback } from 'react';

interface EncodeFileProps {
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

export default function EncodeFile({ onToast }: EncodeFileProps) {
  const [base64Output, setBase64Output] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const getFileTypeFromName = useCallback((fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'pdf': 'application/pdf',
      'xml': 'application/xml',
      'txt': 'text/plain',
      'json': 'application/json'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }, []);

  const handleEncodeFile = useCallback((file: File) => {
    setIsLoading(true);
    setError(null);
    setBase64Output('');
    setFileName(file.name);
    setFileType(file.type || getFileTypeFromName(file.name));

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = reader.result as string;
        setBase64Output(result);
        setIsLoading(false);
        onToast('success', 'Arquivo codificado!', 'Base64 gerado com sucesso');
      } catch (error) {
        setError('Erro ao codificar o arquivo. Tente novamente.');
        setIsLoading(false);
        onToast('error', 'Erro', 'Falha ao codificar arquivo');
      }
    };
    reader.onerror = () => {
      setError('Erro ao ler o arquivo. Verifique se o arquivo está válido.');
      setIsLoading(false);
      onToast('error', 'Erro', 'Falha ao ler arquivo');
    };
    reader.readAsDataURL(file);
  }, [getFileTypeFromName, onToast]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleEncodeFile(file);
    }
  }, [handleEncodeFile]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer?.files[0];
    if (file) {
      handleEncodeFile(file);
    }
  }, [handleEncodeFile]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleClear = useCallback(() => {
    setBase64Output('');
    setFileName('');
    setFileType('');
    setError(null);
    const fileInput = document.getElementById('encodeFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  const handleCopyNotify = useCallback(() => {
    onToast('info', 'Copiado!', 'Conteúdo copiado para a área de transferência');
  }, [onToast]);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Encode File to Base64</h2>
      </div>

      {/* Upload Area */}
      <div style={{ marginBottom: '16px' }}>
        <label className="form-label">Selecionar Arquivo</label>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: `2px dashed ${isDragging ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
            borderRadius: 'var(--border-radius)',
            padding: '40px 20px',
            textAlign: 'center',
            background: isDragging ? 'rgba(0, 217, 255, 0.05)' : 'var(--bg-tertiary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
        >
          <input
            type="file"
            id="encodeFileInput"
            accept="*/*"
            disabled={isLoading}
            onChange={handleFileSelect}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              opacity: 0,
              cursor: 'pointer'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '48px' }}>📁</span>
            <div>
              <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>
                Clique para selecionar ou arraste um arquivo aqui
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Suporta imagens, PDFs, XMLs e outros arquivos
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Info */}
      {fileName && (
        <div style={{
          padding: '12px',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--border-radius)',
          marginBottom: '16px',
          display: 'flex',
          gap: '16px',
          fontSize: '13px'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Arquivo: </span>
            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{fileName}</span>
          </div>
          {fileType && (
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Tipo: </span>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{fileType}</span>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div style={{
          padding: '16px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          marginBottom: '16px'
        }}>
          Codificando arquivo...
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
      {base64Output && (
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="form-label">Base64 Gerado</label>
            <CopyButton value={base64Output} label="Copiar Base64" onCopy={handleCopyNotify} />
          </div>
          <div style={{ position: 'relative' }}>
            <textarea
              readOnly
              value={base64Output}
              style={{
                width: '100%',
                minHeight: '200px',
                padding: '16px',
                paddingRight: '40px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--accent-green)',
                borderRadius: 'var(--border-radius)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12px',
                lineHeight: 1.5,
                color: 'var(--accent-cyan)',
                resize: 'vertical'
              }}
            />
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
          </div>
        </div>
      )}
    </div>
  );
}

