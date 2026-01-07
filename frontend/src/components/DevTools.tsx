/**
 * DevTools - Ferramentas de Desenvolvimento
 * 
 * Geradores e formatadores úteis:
 * - CPF (gerar válido / validar / formatar)
 * - CNPJ (gerar válido / validar / formatar)
 * - UUID (gerar)
 * - Lorem Ipsum (gerar)
 */

import { useState } from 'react';
import JsonToCode from './JsonToCode';
import EncodeFile from './EncodeFile';
import DecodeFile from './DecodeFile';
import CepSearch from './CepSearch';
import CpfTool from './CpfTool';
import CnpjTool from './CnpjTool';
import UuidTool from './UuidTool';
import LoremTool from './LoremTool';
import JsonTool from './JsonTool';
import XmlTool from './XmlTool';
import NameGenerator from './NameGenerator';
import DecompressGzip from './DecompressGzip';

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
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  ),
  hash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  ),
  text: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  json: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1" />
      <path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1" />
    </svg>
  ),
  format: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10H3" />
      <path d="M21 6H3" />
      <path d="M21 14H3" />
      <path d="M21 18H3" />
    </svg>
  ),
  minify: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 8h16" />
      <path d="M4 16h16" />
    </svg>
  ),
  clear: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  encode: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  decode: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  compress: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3" />
      <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" />
      <path d="M3 12h18" />
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  xCircle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Chaves JSON à esquerda */}
      <path d="M3 7c0-1.1.9-2 2-2h1.5c.3 0 .6.1.8.3M3 17c0 1.1.9 2 2 2h1.5c.3 0 .6-.1.8-.3" />
      {/* Seta de transformação */}
      <path d="M8 12h8M12 8l4 4-4 4" strokeWidth="2.5" />
      {/* Código à direita - representando classes/interfaces */}
      <path d="M18 6l2 2-2 2M18 14l2 2-2 2" strokeWidth="2" />
      {/* Linha decorativa */}
      <line x1="20" y1="10" x2="20" y2="14" strokeWidth="1.5" opacity="0.6" />
    </svg>
  ),
  xml: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16v16H4z" />
      <path d="M8 8l2 2-2 2M12 8h4M16 8l-2 2 2 2" />
      <path d="M8 16l2-2-2-2M12 16h4M16 16l-2-2 2-2" />
    </svg>
  )
};

type ToolTab = 'cpf' | 'cnpj' | 'uuid' | 'lorem' | 'json' | 'xml' | 'encode-file' | 'decode-file' | 'cep-search' | 'json-to-code' | 'name-generator' | 'decompress-gzip';

interface DevToolsProps {
  onToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}


// Estrutura de categorias
type ToolCategory = 'documentos' | 'identificadores' | 'texto' | 'arquivos' | 'codigo';

interface Tool {
  id: ToolTab;
  label: string;
  icon: JSX.Element;
  description: string;
  category: ToolCategory;
}


export default function DevTools({ onToast }: DevToolsProps) {
  const [activeTab, setActiveTab] = useState<ToolTab | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  












  // Estrutura de ferramentas organizadas por categoria
  const tools: Tool[] = [
    { id: 'cpf', label: 'CPF', icon: Icons.user, description: 'Gerar, validar e formatar CPF', category: 'documentos' },
    { id: 'cnpj', label: 'CNPJ', icon: Icons.building, description: 'Gerar, validar e formatar CNPJ', category: 'documentos' },
    { id: 'uuid', label: 'UUID', icon: Icons.hash, description: 'Gerar UUID v4 e formatar strings', category: 'identificadores' },
    { id: 'lorem', label: 'Lorem Ipsum', icon: Icons.text, description: 'Gerar texto Lorem Ipsum', category: 'texto' },
    { id: 'json', label: 'JSON', icon: Icons.json, description: 'Formatar e minificar JSON', category: 'texto' },
    { id: 'xml', label: 'XML', icon: Icons.xml, description: 'Formatar XML com beautify', category: 'texto' },
    { id: 'name-generator', label: 'Gerador de Nomes', icon: Icons.user, description: 'Gerar nomes brasileiros aleatórios', category: 'texto' },
    { id: 'encode-file', label: 'Encode File', icon: Icons.encode, description: 'Converter arquivo para Base64', category: 'arquivos' },
    { id: 'decode-file', label: 'Decode File', icon: Icons.decode, description: 'Decodificar Base64 para imagem', category: 'arquivos' },
    { id: 'decompress-gzip', label: 'Descomprimir Gzip', icon: Icons.compress, description: 'Descomprimir Gzip codificado em Base64', category: 'arquivos' },
    { id: 'cep-search', label: 'Buscar CEP', icon: Icons.map, description: 'Buscar informações de endereço por CEP', category: 'documentos' },
    { id: 'json-to-code', label: 'JSON para Código', icon: Icons.code, description: 'Converter JSON em classes Java ou interfaces TypeScript', category: 'codigo' },
  ];

  const categories: { id: ToolCategory; label: string; icon: JSX.Element }[] = [
    { id: 'documentos', label: 'Documentos', icon: Icons.user },
    { id: 'identificadores', label: 'Identificadores', icon: Icons.hash },
    { id: 'texto', label: 'Texto', icon: Icons.text },
    { id: 'arquivos', label: 'Arquivos', icon: Icons.file },
    { id: 'codigo', label: 'Código', icon: Icons.code },
  ];

  const getToolsByCategory = (category: ToolCategory) => {
    return tools.filter(tool => tool.category === category);
  };

  // Filtrar ferramentas por busca
  const filteredTools = searchQuery.trim()
    ? tools.filter(tool =>
        tool.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tools;


  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Ferramentas Dev</h1>
        <p className="page-subtitle">
          Geradores e formatadores úteis para desenvolvimento
        </p>
      </header>

      <div className="page-body">
        {!activeTab ? (
          // Tela de seleção por categorias
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Barra de Busca */}
            <div style={{ position: 'relative', marginBottom: '8px' }}>
        <div style={{ 
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }}>
                {Icons.search}
              </div>
              <input
                type="text"
                placeholder="Buscar ferramentas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 44px',
                  fontSize: '14px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.15s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '24px',
                    height: '24px',
          display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <span style={{ width: '16px', height: '16px' }}>
                    {Icons.xCircle}
                  </span>
                </button>
              )}
            </div>

            {/* Resultados da Busca ou Categorias */}
            {searchQuery.trim() ? (
              // Modo busca: mostrar todas as ferramentas filtradas
              filteredTools.length > 0 ? (
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '16px' 
                  }}>
                    <div style={{ width: '24px', height: '24px', color: 'var(--accent-cyan)' }}>
                      {Icons.search}
                    </div>
                    <h2 style={{ 
                      fontSize: '18px', 
                      fontWeight: 600, 
                      color: 'var(--text-primary)',
                      margin: 0 
                    }}>
                      Resultados da Busca
                    </h2>
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
          background: 'var(--bg-tertiary)',
                      padding: '2px 8px',
          borderRadius: '10px'
        }}>
                      {filteredTools.length}
                    </span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '16px'
                  }}>
                    {filteredTools.map((tool) => (
                      <div
                        key={tool.id}
                        onClick={() => setActiveTab(tool.id)}
              style={{
                          padding: '20px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--border-radius-lg)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--bg-secondary)';
                          e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--bg-card)';
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {tool.icon}
                        </div>
                        <div>
                          <div style={{ 
                            fontSize: '16px', 
                            fontWeight: 600, 
                            color: 'var(--text-primary)',
                            marginBottom: '4px'
                          }}>
                            {tool.label}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: 'var(--text-muted)',
                            lineHeight: 1.4
                          }}>
                            {tool.description}
                          </div>
                          <div style={{ 
                            fontSize: '11px', 
                            color: 'var(--text-muted)',
                            marginTop: '6px',
                            padding: '2px 6px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '4px',
                            display: 'inline-block'
                          }}>
                            {categories.find(c => c.id === tool.category)?.label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ 
                    fontSize: '48px', 
                    marginBottom: '16px',
                    opacity: 0.5,
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    {Icons.search}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
                    Nenhuma ferramenta encontrada
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    Tente buscar com outros termos
                  </div>
                </div>
              )
            ) : (
              // Modo normal: mostrar por categorias
              categories.map((category) => {
                const categoryTools = getToolsByCategory(category.id);
                if (categoryTools.length === 0) return null;

              return (
                <div key={category.id}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    marginBottom: '16px' 
                  }}>
                    <div style={{ width: '24px', height: '24px', color: 'var(--accent-cyan)' }}>
                      {category.icon}
                    </div>
                    <h2 style={{ 
                      fontSize: '18px', 
                      fontWeight: 600, 
                      color: 'var(--text-primary)',
                      margin: 0 
                    }}>
                      {category.label}
                    </h2>
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      background: 'var(--bg-tertiary)',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {categoryTools.length}
                    </span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '16px'
                  }}>
                    {categoryTools.map((tool) => (
                      <div
                        key={tool.id}
                        onClick={() => setActiveTab(tool.id)}
                        style={{
                          padding: '20px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--border-radius-lg)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--bg-secondary)';
                          e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--bg-card)';
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          color: 'var(--accent-cyan)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {tool.icon}
                        </div>
                        <div>
                          <div style={{ 
                            fontSize: '16px', 
                            fontWeight: 600, 
                            color: 'var(--text-primary)',
                            marginBottom: '4px'
                          }}>
                            {tool.label}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: 'var(--text-muted)',
                            lineHeight: 1.4
                          }}>
                            {tool.description}
                          </div>
                        </div>
                      </div>
          ))}
        </div>
                </div>
              );
              })
            )}
          </div>
        ) : (
          // Ferramenta ativa
          <div>
            {/* Botão Voltar */}
            <button
              onClick={() => setActiveTab(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                marginBottom: '24px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--accent-cyan)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>

            {/* CPF Tool */}
            {activeTab === 'cpf' && (
              <CpfTool onToast={onToast} />
            )}

            {/* CNPJ Tool */}
            {activeTab === 'cnpj' && (
              <CnpjTool onToast={onToast} />
            )}

            {/* UUID Tool */}
            {/* UUID Tool */}
            {activeTab === 'uuid' && (
              <UuidTool onToast={onToast} />
            )}

            {/* Lorem Ipsum Tool */}
            {activeTab === 'lorem' && (
              <LoremTool onToast={onToast} />
            )}

            {/* JSON Tool */}
            {activeTab === 'json' && (
              <JsonTool onToast={onToast} />
            )}

            {/* XML Tool */}
            {activeTab === 'xml' && (
              <XmlTool onToast={onToast} />
            )}

            {/* Encode File Tool */}
        {activeTab === 'encode-file' && (
          <EncodeFile onToast={onToast} />
        )}

            {/* Decode File Tool */}
        {activeTab === 'decode-file' && (
          <DecodeFile onToast={onToast} />
        )}

            {/* CEP Search Tool */}
            {activeTab === 'cep-search' && (
              <CepSearch onToast={onToast} />
            )}

            {/* JSON to Code Tool */}
            {activeTab === 'json-to-code' && (
              <JsonToCode onToast={onToast} />
            )}

            {/* Name Generator Tool */}
            {activeTab === 'name-generator' && (
              <NameGenerator onToast={onToast} />
            )}

            {/* Decompress Gzip Tool */}
            {activeTab === 'decompress-gzip' && (
              <DecompressGzip onToast={onToast} />
            )}
          </div>
        )}
      </div>
    </>
  );
}

