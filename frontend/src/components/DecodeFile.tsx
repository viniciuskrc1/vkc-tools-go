/**
 * DecodeFile - Decodificador de Base64 para Arquivo
 * 
 * Decodifica Base64 e exibe preview de imagens com opção de download
 */

import { useState, useCallback, useEffect } from 'react';

interface DecodeFileProps {
  onToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

// Ícones
const Icons = {
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

export default function DecodeFile({ onToast }: DecodeFileProps) {
  const [base64Input, setBase64Input] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('decoded-file');
  const [error, setError] = useState<string | null>(null);

  const isValidBase64 = useCallback((str: string): boolean => {
    try {
      const cleanStr = str.replace(/\s/g, '');
      return /^[A-Za-z0-9+/]*={0,2}$/.test(cleanStr);
    } catch {
      return false;
    }
  }, []);

  const detectImageType = useCallback((base64: string): string => {
    const signatures: { [key: string]: string } = {
      '/9j/': 'jpg',
      'iVBORw0KGgo': 'png',
      'R0lGODlh': 'gif',
      'UklGR': 'webp',
      'Qk0=': 'bmp'
    };
    for (const [signature, type] of Object.entries(signatures)) {
      if (base64.startsWith(signature)) {
        return type;
      }
    }
    return 'png';
  }, []);

  const handleDecodeBase64 = useCallback(() => {
    setError(null);
    setPreview(null);

    if (!base64Input.trim()) {
      return;
    }

    try {
      let base64Data = base64Input.trim();
      
      // Remove data:image/...;base64, se existir
      const base64Match = base64Data.match(/^data:(.+?);base64,(.+)$/);
      if (base64Match) {
        base64Data = base64Match[2];
        const mimeType = base64Match[1];
        if (mimeType.startsWith('image/')) {
          const imageType = mimeType.split('/')[1];
          setFileName(`decoded-file.${imageType}`);
          setPreview(`data:${mimeType};base64,${base64Data}`);
          return;
        }
      }

      // Valida se é base64 válido
      if (!isValidBase64(base64Data)) {
        setError('Base64 inválido. Por favor, verifique o formato.');
        return;
      }

      // Tenta detectar como imagem
      const imageType = detectImageType(base64Data);
      setFileName(`decoded-file.${imageType}`);
      setPreview(`data:image/${imageType};base64,${base64Data}`);
      onToast('success', 'Base64 decodificado!', 'Preview gerado com sucesso');
    } catch (error) {
      setError('Erro ao decodificar. Verifique se o base64 está correto.');
      onToast('error', 'Erro', 'Falha ao decodificar base64');
    }
  }, [base64Input, isValidBase64, detectImageType, onToast]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBase64Input(event.target.value);
    setError(null);
  }, []);

  // Auto-decode quando o input mudar (com debounce)
  useEffect(() => {
    if (!base64Input.trim()) {
      setPreview(null);
      setError(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleDecodeBase64();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [base64Input, handleDecodeBase64]);

  const handleDownload = useCallback(() => {
    if (!preview) return;
    try {
      const link = document.createElement('a');
      link.href = preview;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onToast('success', 'Download iniciado!', 'Arquivo baixado com sucesso');
    } catch (error) {
      setError('Erro ao fazer download do arquivo.');
      onToast('error', 'Erro', 'Falha ao fazer download');
    }
  }, [preview, fileName, onToast]);

  const handleClear = useCallback(() => {
    setBase64Input('');
    setPreview(null);
    setError(null);
    setFileName('decoded-file');
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Decode Base64 to File</h2>
      </div>

      {/* Input Area */}
      <div className="form-group">
        <label className="form-label">Base64 da Imagem</label>
        <div style={{ position: 'relative' }}>
          <textarea
            className="form-input font-mono"
            placeholder="Cole aqui o base64 da imagem (com ou sem prefixo data:image/...)"
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

      {/* Preview */}
      {preview && (
        <div>
          <label className="form-label">Preview da Imagem</label>
          <div style={{
            padding: '20px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            <img
              src={preview}
              alt="Preview decodificado"
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)'
              }}
            />
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--border-radius)'
          }}>
            <button
              type="button"
              onClick={handleDownload}
              className="btn btn-primary"
            >
              <span style={{ width: '18px', height: '18px' }}>{Icons.download}</span>
              Download da Imagem
            </button>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {fileName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

