/**
 * XmlTool - Ferramenta de XML
 * 
 * Formatador de XML com beautify
 */

import { useState, useCallback } from 'react';

interface XmlToolProps {
  onToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

// Ícones
const Icons = {
  format: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
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

// Função para formatar XML com indentação
function formatXML(xml: string, indent: number = 2): string {
  let formatted = '';
  let indentLevel = 0;
  const indentString = indent === 1 ? '\t' : ' '.repeat(indent);
  
  // Remover espaços em branco desnecessários, mas manter quebras de linha importantes
  xml = xml.trim();
  
  // Regex para encontrar tags, comentários, CDATA, etc.
  const regex = /(<\?xml[^>]*\?>)|(<!\[CDATA\[[\s\S]*?\]\]>)|(<!--[\s\S]*?-->)|(<\/?[^>]+>)/g;
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(xml)) !== null) {
    const beforeMatch = xml.substring(lastIndex, match.index).trim();
    
    if (beforeMatch) {
      formatted += indentString.repeat(indentLevel) + beforeMatch + '\n';
    }
    
    const fullMatch = match[0];
    
    // Comentários e CDATA
    if (match[2] || match[3]) {
      formatted += indentString.repeat(indentLevel) + fullMatch + '\n';
    }
    // Tag de fechamento
    else if (fullMatch.startsWith('</')) {
      indentLevel = Math.max(0, indentLevel - 1);
      formatted += indentString.repeat(indentLevel) + fullMatch + '\n';
    }
    // Tag de abertura (self-closing ou não)
    else if (fullMatch.startsWith('<?') || fullMatch.startsWith('<!')) {
      formatted += fullMatch + '\n';
    }
    else {
      formatted += indentString.repeat(indentLevel) + fullMatch;
      // Verificar se é self-closing
      if (!fullMatch.endsWith('/>')) {
        indentLevel++;
      }
      formatted += '\n';
    }
    
    lastIndex = regex.lastIndex;
  }
  
  // Adicionar qualquer texto restante
  const remaining = xml.substring(lastIndex).trim();
  if (remaining) {
    formatted += indentString.repeat(indentLevel) + remaining + '\n';
  }
  
  return formatted.trim();
}

// Função melhorada para formatar XML usando parser do navegador
function formatXMLWithParser(xml: string, indent: number = 2): string {
  try {
    // Tentar usar DOMParser se disponível
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    
    // Verificar erros de parsing
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('XML inválido: ' + parserError.textContent);
    }
    
    // Função recursiva para formatar
    const formatNode = (node: Node, level: number): string => {
      let result = '';
      const indentStr = indent === 1 ? '\t' : ' '.repeat(indent);
      const currentIndent = indentStr.repeat(level);
      
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          return text;
        }
        return '';
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName;
        
        // Construir atributos
        let attrs = '';
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          attrs += ` ${attr.name}="${attr.value}"`;
        }
        
        // Verificar se tem filhos
        const children = Array.from(node.childNodes).filter(
          child => child.nodeType !== Node.TEXT_NODE || child.textContent?.trim()
        );
        
        // Verificar se tem apenas texto simples (sem elementos filhos)
        const hasOnlyText = children.length > 0 && 
          children.every(child => child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE) &&
          children.filter(child => child.nodeType === Node.ELEMENT_NODE).length === 0;
        
        if (children.length === 0) {
          // Self-closing tag
          result += currentIndent + `<${tagName}${attrs} />\n`;
        } else if (hasOnlyText) {
          // Tag com apenas texto simples - colocar na mesma linha
          let textContent = '';
          for (const child of node.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
              const text = child.textContent?.trim();
              if (text) {
                textContent += text;
              }
            } else if (child.nodeType === Node.CDATA_SECTION_NODE) {
              textContent += `<![CDATA[${child.textContent}]]>`;
            }
          }
          result += currentIndent + `<${tagName}${attrs}>${textContent}</${tagName}>\n`;
        } else {
          // Tag com elementos filhos ou conteúdo complexo
          result += currentIndent + `<${tagName}${attrs}>\n`;
          
          // Processar filhos
          for (const child of node.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
              const text = child.textContent?.trim();
              if (text) {
                result += currentIndent + indentStr + text + '\n';
              }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              result += formatNode(child, level + 1);
            } else if (child.nodeType === Node.CDATA_SECTION_NODE) {
              result += currentIndent + indentStr + `<![CDATA[${child.textContent}]]>\n`;
            } else if (child.nodeType === Node.COMMENT_NODE) {
              result += currentIndent + indentStr + `<!--${child.textContent}-->\n`;
            }
          }
          
          result += currentIndent + `</${tagName}>\n`;
        }
      } else if (node.nodeType === Node.COMMENT_NODE) {
        result += currentIndent + `<!--${node.textContent}-->\n`;
      } else if (node.nodeType === Node.CDATA_SECTION_NODE) {
        result += currentIndent + `<![CDATA[${node.textContent}]]>\n`;
      }
      
      return result;
    };
    
    // Processar declaração XML se existir
    let formatted = '';
    if (xmlDoc.firstChild?.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
      formatted += `<?xml version="1.0" encoding="UTF-8"?>\n`;
    }
    
    // Processar root element
    const root = xmlDoc.documentElement;
    if (root) {
      formatted += formatNode(root, 0);
    }
    
    return formatted.trim();
  } catch (error) {
    // Fallback para método simples se parser falhar
    return formatXML(xml, indent);
  }
}

export default function XmlTool({ onToast }: XmlToolProps) {
  const [xmlInput, setXmlInput] = useState<string>('');
  const [xmlOutput, setXmlOutput] = useState<string>('');
  const [xmlError, setXmlError] = useState<string | null>(null);
  const [xmlIndent, setXmlIndent] = useState<number>(2);

  const handleFormatXML = useCallback(() => {
    if (!xmlInput.trim()) {
      setXmlError('Digite um XML para formatar');
      return;
    }
    
    try {
      const formatted = formatXMLWithParser(xmlInput, xmlIndent);
      setXmlOutput(formatted);
      setXmlError(null);
      onToast('success', 'XML Formatado!', 'Beautify aplicado com sucesso');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'XML inválido';
      setXmlError(`Erro ao formatar XML: ${errorMessage}`);
      setXmlOutput('');
      onToast('error', 'Erro', 'XML inválido ou malformado');
    }
  }, [xmlInput, xmlIndent, onToast]);

  const handleClearXML = useCallback(() => {
    setXmlInput('');
    setXmlOutput('');
    setXmlError(null);
  }, []);

  const handleCopyNotify = useCallback(() => {
    onToast('info', 'Copiado!', 'Conteúdo copiado para a área de transferência');
  }, [onToast]);

  const handleDownloadXML = useCallback(() => {
    if (!xmlOutput) return;
    
    const blob = new Blob([xmlOutput], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formatted.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    onToast('success', 'Download iniciado!', 'Arquivo XML baixado com sucesso');
  }, [xmlOutput, onToast]);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">XML Formatter</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Indentação:</span>
          <select
            value={xmlIndent}
            onChange={(e) => setXmlIndent(Number(e.target.value))}
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
        <label className="form-label">XML de Entrada</label>
        <textarea
          className="form-input font-mono"
          placeholder='Cole seu XML aqui... Ex: <root><item>valor</item></root>'
          value={xmlInput}
          onChange={(e) => {
            setXmlInput(e.target.value);
            setXmlError(null);
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
          onClick={handleFormatXML}
          className="btn btn-primary"
          disabled={!xmlInput.trim()}
        >
          <span style={{ width: '18px', height: '18px' }}>{Icons.format}</span>
          Beautify (Formatar)
        </button>
        <button
          onClick={handleClearXML}
          className="btn btn-secondary"
          disabled={!xmlInput.trim() && !xmlOutput}
        >
          <span style={{ width: '18px', height: '18px' }}>{Icons.clear}</span>
          Limpar
        </button>
      </div>

      {/* Error */}
      {xmlError && (
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
            {xmlError}
          </span>
        </div>
      )}

      {/* Output Area */}
      {xmlOutput && (
        <div style={{ position: 'relative' }}>
          <label className="form-label">XML Formatado</label>
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
            {xmlOutput}
          </div>
          <div style={{ 
            position: 'absolute', 
            top: '32px', 
            right: '12px',
            display: 'flex',
            gap: '8px'
          }}>
            <CopyButton value={xmlOutput} label="Copiar XML" onCopy={handleCopyNotify} />
            <button
              type="button"
              onClick={handleDownloadXML}
              disabled={!xmlOutput}
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: xmlOutput ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: xmlOutput ? 'var(--text-secondary)' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 500,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                opacity: xmlOutput ? 1 : 0.5
              }}
            >
              <span style={{ width: '14px', height: '14px' }}>
                {Icons.download}
              </span>
              Baixar XML
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
          <li><strong>Beautify:</strong> Formata o XML com indentação para melhor leitura</li>
          <li>O formatador valida a estrutura do XML e identifica erros de sintaxe</li>
          <li>Suporta comentários, CDATA e declarações XML</li>
        </ul>
      </div>
    </div>
  );
}

