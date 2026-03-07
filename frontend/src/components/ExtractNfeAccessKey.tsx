/**
 * ExtractNfeAccessKey - Extrator de Chaves de Acesso de NFe
 * 
 * Extrai chaves de acesso de múltiplos arquivos XML de notas fiscais
 * e gera QR codes para cada chave extraída
 */

import { useState, useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ExtractNfeAccessKeyProps {
  onToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

type ViewMode = 'qrcode' | 'lista';

const Icons = {
  file: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  print: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  qrcode: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="3" height="3" />
      <rect x="18" y="14" width="3" height="3" />
      <rect x="14" y="18" width="3" height="3" />
      <rect x="18" y="18" width="3" height="3" />
    </svg>
  ),
  list: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
};

interface AccessKeyItem {
  key: string;
  fileName: string;
}

export default function ExtractNfeAccessKey({ onToast }: ExtractNfeAccessKeyProps) {
  const [accessKeys, setAccessKeys] = useState<AccessKeyItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Selecione os arquivos (XML ou qualquer arquivo com conteúdo XML) ou arraste-os para cá');
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [qrSize, setQrSize] = useState<number>(180);
  const [viewMode, setViewMode] = useState<ViewMode>('qrcode');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const printRef = useRef<HTMLDivElement>(null);

  const extractAccessKeyFromXML = useCallback((xmlContent: string): string | null => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        return null;
      }

      const infNFe = xmlDoc.querySelector('infNFe') || 
                     xmlDoc.querySelector('*[local-name()="infNFe"]');
      
      if (!infNFe) {
        return null;
      }

      const id = infNFe.getAttribute('Id');
      if (!id) {
        return null;
      }

      const accessKey = id.startsWith('NFe') ? id.substring(3) : id;
      
      return accessKey;
    } catch (error) {
      console.error('Erro ao extrair chave de acesso:', error);
      return null;
    }
  }, []);

  const processFiles = useCallback(async (files: File[]) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setAccessKeys([]);
    setStatusMessage('Processando arquivos...');
    setProgressMessage('');

    const extractedKeys: AccessKeyItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgressMessage(`Processando ${i + 1} de ${files.length}: ${file.name}`);

      try {
        const fileContent = await file.text();
        const key = extractAccessKeyFromXML(fileContent);

        if (key && key.length > 0) {
          extractedKeys.push({
            key,
            fileName: file.name
          });
        } else {
          onToast('error', 'Aviso', `Nenhuma chave encontrada em ${file.name}`);
        }
      } catch (error) {
        console.error(`Erro ao processar ${file.name}:`, error);
        onToast('error', 'Erro', `Falha ao processar ${file.name}`);
      }
    }

    setAccessKeys(extractedKeys);
    setIsProcessing(false);
    setProgressMessage('');

    if (extractedKeys.length === 0) {
      setStatusMessage('Nenhuma Chave de Acesso encontrada nos arquivos.');
      onToast('info', 'Aviso', 'Nenhuma chave de acesso encontrada');
    } else {
      setStatusMessage(`Processamento concluído! ${extractedKeys.length} chave(s) encontrada(s).`);
      onToast('success', 'Sucesso', `${extractedKeys.length} chave(s) extraída(s) com sucesso`);
    }
  }, [extractAccessKeyFromXML, isProcessing, onToast]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isProcessing) return;
    const files = event.target.files;
    if (files && files.length > 0) {
      const allFiles = Array.from(files);
      await processFiles(allFiles);
    }
  }, [isProcessing, processFiles]);

  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isProcessing) return;
    setIsDragging(false);

    if (event.dataTransfer?.files) {
      const allFiles = Array.from(event.dataTransfer.files);
      await processFiles(allFiles);
    }
  }, [isProcessing, processFiles]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isProcessing) return;
    setIsDragging(true);
  }, [isProcessing]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isProcessing) return;
    setIsDragging(false);
  }, [isProcessing]);

  const handleCopyKey = useCallback(async (key: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    try {
      await navigator.clipboard.writeText(key);
      setStatusMessage('Chave copiada para a área de transferência!');
      onToast('success', 'Copiado!', 'Chave copiada com sucesso');
    } catch (err) {
      console.error('Erro ao copiar:', err);
      onToast('error', 'Erro', 'Falha ao copiar chave');
    }
  }, [onToast]);

  const handleCopyAll = useCallback(async () => {
    if (accessKeys.length === 0) return;
    const allKeys = accessKeys.map(item => item.key).join('\n');
    try {
      await navigator.clipboard.writeText(allKeys);
      setStatusMessage('Todas as chaves copiadas para a área de transferência!');
      onToast('success', 'Copiado!', 'Todas as chaves copiadas com sucesso');
    } catch (err) {
      console.error('Erro ao copiar:', err);
      onToast('error', 'Erro', 'Falha ao copiar todas as chaves');
    }
  }, [accessKeys, onToast]);

  const handleClear = useCallback(() => {
    setAccessKeys([]);
    setSelectedIndex(-1);
    setStatusMessage('Selecione os arquivos (XML ou qualquer arquivo com conteúdo XML) ou arraste-os para cá');
    setProgressMessage('');
  }, []);

  const handlePrint = useCallback(() => {
    if (!printRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      onToast('error', 'Erro', 'Não foi possível abrir a janela de impressão. Verifique se popups estão permitidos.');
      return;
    }

    const qrItems = printRef.current.querySelectorAll('[data-qr-item]');
    let cardsHtml = '';

    qrItems.forEach((item) => {
      const svg = item.querySelector('svg');
      const fileName = item.getAttribute('data-filename') || '';
      const key = item.getAttribute('data-key') || '';

      if (svg) {
        const svgString = new XMLSerializer().serializeToString(svg);
        cardsHtml += `
          <div class="qr-card">
            <div class="qr-svg">${svgString}</div>
            <div class="qr-key">${key}</div>
            <div class="qr-filename">${fileName}</div>
          </div>
        `;
      }
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Codes - Chaves de Acesso NFe</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; margin-bottom: 20px; font-size: 18px; }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 24px;
            justify-items: center;
          }
          .qr-card {
            text-align: center;
            padding: 16px;
            border: 1px solid #ddd;
            border-radius: 8px;
            page-break-inside: avoid;
          }
          .qr-svg { display: flex; justify-content: center; margin-bottom: 8px; }
          .qr-svg svg { width: 160px; height: 160px; }
          .qr-key {
            font-family: monospace;
            font-size: 9px;
            word-break: break-all;
            color: #333;
            margin-bottom: 4px;
          }
          .qr-filename {
            font-size: 10px;
            color: #888;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 200px;
          }
          @media print {
            body { padding: 10px; }
            .qr-card { border: 1px solid #ccc; }
          }
        </style>
      </head>
      <body>
        <h1>Chaves de Acesso NFe - QR Codes</h1>
        <div class="grid">${cardsHtml}</div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }, [onToast]);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Extrator de Chave de Acesso NFe</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Total: {accessKeys.length} chave(s)
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="file"
          id="nfeFileInput"
          multiple
          disabled={isProcessing}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <label
          htmlFor="nfeFileInput"
          className="btn btn-primary"
          style={{
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            opacity: isProcessing ? 0.7 : 1,
            pointerEvents: isProcessing ? 'none' : 'auto'
          }}
        >
          <span style={{ width: '18px', height: '18px', marginRight: '6px' }}>{Icons.file}</span>
          {isProcessing ? 'Processando...' : 'Selecionar Arquivos'}
        </label>

        {accessKeys.length > 0 && (
          <>
            {viewMode === 'qrcode' && (
              <button
                type="button"
                className="btn btn-success"
                disabled={isProcessing}
                onClick={handlePrint}
              >
                <span style={{ width: '18px', height: '18px', marginRight: '6px' }}>{Icons.print}</span>
                Imprimir QR Codes
              </button>
            )}
            {viewMode === 'lista' && (
              <button
                type="button"
                className="btn btn-success"
                disabled={isProcessing}
                onClick={handleCopyAll}
              >
                <span style={{ width: '18px', height: '18px', marginRight: '6px' }}>{Icons.copy}</span>
                Copiar Todos
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              disabled={isProcessing}
              onClick={handleClear}
            >
              <span style={{ width: '18px', height: '18px', marginRight: '6px' }}>{Icons.x}</span>
              Limpar
            </button>
          </>
        )}
      </div>

      {/* View Mode Toggle + QR Size */}
      {accessKeys.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px',
          padding: '12px',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--border-radius)',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            flexShrink: 0
          }}>
            {([
              { mode: 'qrcode' as ViewMode, icon: Icons.qrcode, label: 'QR Code' },
              { mode: 'lista' as ViewMode, icon: Icons.list, label: 'Lista' }
            ]).map(({ mode, icon, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  fontSize: '13px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: viewMode === mode ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
                  color: viewMode === mode ? '#000' : 'var(--text-secondary)',
                }}
              >
                <span style={{ width: '14px', height: '14px' }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {viewMode === 'qrcode' && (
            <>
              <label style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                Tamanho do QR:
              </label>
              <input
                type="range"
                min={100}
                max={300}
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent-cyan)', minWidth: '100px' }}
              />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '45px', textAlign: 'right' }}>
                {qrSize}px
              </span>
            </>
          )}
        </div>
      )}

      {/* Progress Message */}
      {progressMessage && (
        <div style={{
          padding: '12px',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--border-radius)',
          marginBottom: '16px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          textAlign: 'center'
        }}>
          {progressMessage}
        </div>
      )}

      {/* Drag and Drop Area */}
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
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '48px' }}>📄</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>
              Arraste arquivos aqui
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Aceita arquivos XML ou qualquer arquivo com conteúdo XML (mesmo sem extensão .xml)
            </div>
          </div>
        </div>
      </div>

      {/* QR Codes Grid */}
      {accessKeys.length > 0 && viewMode === 'qrcode' && (
        <div ref={printRef}>
          <label className="form-label">QR Codes das Chaves de Acesso:</label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(${qrSize + 40}px, 1fr))`,
            gap: '20px',
            padding: '16px',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius)',
            background: 'var(--bg-primary)'
          }}>
            {accessKeys.map((item, index) => (
              <div
                key={index}
                data-qr-item
                data-filename={item.fileName}
                data-key={item.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  background: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <QRCodeSVG
                    value={item.key}
                    size={qrSize}
                    level="M"
                    marginSize={2}
                  />
                </div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px',
                  color: 'var(--accent-cyan)',
                  wordBreak: 'break-all',
                  textAlign: 'center',
                  lineHeight: 1.4,
                  maxWidth: `${qrSize + 20}px`
                }}>
                  {item.key}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: `${qrSize + 20}px`,
                  textAlign: 'center'
                }}>
                  {item.fileName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Access Keys List */}
      {accessKeys.length > 0 && viewMode === 'lista' && (
        <div>
          <label className="form-label">Chaves de Acesso Extraídas:</label>
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius)',
            background: 'var(--bg-primary)'
          }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {accessKeys.map((item, index) => (
                <li
                  key={index}
                  onClick={() => setSelectedIndex(index)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    background: selectedIndex === index ? 'var(--bg-secondary)' : 'transparent',
                    transition: 'background 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedIndex !== index) {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedIndex !== index) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '12px',
                      color: 'var(--accent-cyan)',
                      wordBreak: 'break-all',
                      marginBottom: '4px'
                    }}>
                      {item.key}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.fileName}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleCopyKey(item.key, e)}
                    style={{
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-secondary)',
                      fontSize: '12px',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-secondary)';
                      e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                    title="Copiar chave"
                  >
                    <span style={{ width: '14px', height: '14px' }}>{Icons.copy}</span>
                    Copiar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Status Message */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--border-radius)',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        textAlign: 'center'
      }}>
        {statusMessage}
      </div>

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
          <li>Selecione múltiplos arquivos (XML ou qualquer arquivo com conteúdo XML)</li>
          <li>Arquivos sem extensão .xml também são aceitos se tiverem conteúdo XML válido</li>
          <li>Arraste e solte os arquivos na área indicada</li>
          <li>Alterne entre <strong>QR Code</strong> e <strong>Lista</strong> para escolher a forma de visualização</li>
          <li>No modo QR Code, use o controle de tamanho e "Imprimir QR Codes"</li>
          <li>No modo Lista, copie chaves individualmente ou use "Copiar Todos"</li>
        </ul>
      </div>
    </div>
  );
}
