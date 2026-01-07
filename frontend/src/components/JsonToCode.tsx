/**
 * JsonToCode - Conversor de JSON para Código
 * 
 * Converte JSON em classes Java (com Lombok e Jackson) ou interfaces TypeScript
 */

import { useState, useCallback, useEffect, useRef } from 'react';

interface JsonToCodeProps {
  onToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

interface ClassInfo {
  name: string;
  properties: Array<{ name: string; originalName: string; type: string; isComplexType: boolean }>;
  dependencies: Set<string>;
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
  download: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  clear: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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

export default function JsonToCode({ onToast }: JsonToCodeProps) {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [className, setClassName] = useState<string>('');
  const [suffix, setSuffix] = useState<string>('');
  const [language, setLanguage] = useState<'typescript' | 'java'>('typescript');
  const [javaType, setJavaType] = useState<'lombok' | 'record'>('lombok');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [editedCode, setEditedCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const classRegistry = useRef<Map<string, ClassInfo>>(new Map());

  const capitalizeFirst = useCallback((str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }, []);

  const toCamelCase = useCallback((str: string): string => {
    return str.replace(/[-_](.)/g, (_, char) => char.toUpperCase());
  }, []);

  const isInteger = useCallback((value: number): boolean => {
    return Number.isInteger(value);
  }, []);

  const processObjectForTypeScript = useCallback((obj: any, className: string, propertyKey: string, suffix: string = ''): string => {
    if (obj === null || obj === undefined) {
      return 'any';
    }

    if (Array.isArray(obj)) {
      if (obj.length > 0) {
        const suffixPart = suffix ? capitalizeFirst(suffix) : '';
        const itemClassName = propertyKey ? `I${capitalizeFirst(propertyKey)}${suffixPart}` : `${className}Item`;
        const itemType = processObjectForTypeScript(obj[0], itemClassName, '', suffix);
        return `${itemType}[]`;
      }
      return 'any[]';
    }

    if (typeof obj === 'object') {
      const interfaceName = className.startsWith('I') ? className : `I${className}`;

      if (classRegistry.current.has(interfaceName)) {
        return interfaceName;
      }

      const properties: Array<{ name: string; originalName: string; type: string; isComplexType: boolean }> = [];
      const dependencies = new Set<string>();

      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        const originalName = key;
        const propertyName = toCamelCase(key);
        const suffixPart = suffix ? capitalizeFirst(suffix) : '';
        const propertyClassName = `I${capitalizeFirst(key)}${suffixPart}`;
        const type = processObjectForTypeScript(value, propertyClassName, key, suffix);

        const isComplexType = type.startsWith('I') && type !== interfaceName && !type.endsWith('[]');

        if (isComplexType && type !== 'any' && type !== 'any[]') {
          dependencies.add(type.replace('[]', ''));
        }

        properties.push({ name: propertyName, originalName, type, isComplexType });
      });

      classRegistry.current.set(interfaceName, {
        name: interfaceName,
        properties,
        dependencies
      });

      return interfaceName;
    }

    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean'
    };

    return typeMap[typeof obj] || 'any';
  }, [capitalizeFirst, toCamelCase]);

  const processObjectForJava = useCallback((obj: any, className: string, propertyKey: string, suffix: string = ''): string => {
    if (obj === null || obj === undefined) {
      return 'Object';
    }

    if (Array.isArray(obj)) {
      if (obj.length > 0) {
        const suffixPart = suffix ? capitalizeFirst(suffix) : '';
        const itemClassName = propertyKey ? `${capitalizeFirst(propertyKey)}${suffixPart}Dto` : `${className}ItemDto`;
        const itemType = processObjectForJava(obj[0], itemClassName, '', suffix);
        if (itemType === 'Object') {
          return 'List<Object>';
        }
        return `List<${itemType}>`;
      }
      return 'List<Object>';
    }

    if (typeof obj === 'object') {
      const classDtoName = className.endsWith('Dto') ? className : `${className}Dto`;

      if (classRegistry.current.has(classDtoName)) {
        return classDtoName;
      }

      const properties: Array<{ name: string; originalName: string; type: string; isComplexType: boolean }> = [];
      const dependencies = new Set<string>();

      Object.keys(obj).forEach((key) => {
        const value = obj[key];
        const originalName = key;
        const propertyName = toCamelCase(key);
        const suffixPart = suffix ? capitalizeFirst(suffix) : '';
        const propertyClassName = `${capitalizeFirst(key)}${suffixPart}Dto`;
        const type = processObjectForJava(value, propertyClassName, key, suffix);

        const isComplexType = type.endsWith('Dto') && type !== classDtoName && !type.startsWith('List<');

        if (isComplexType) {
          dependencies.add(type);
        } else if (type.startsWith('List<') && type !== 'List<Object>') {
          const innerType = type.replace('List<', '').replace('>', '');
          if (innerType.endsWith('Dto')) {
            dependencies.add(innerType);
          }
        }

        properties.push({ name: propertyName, originalName, type, isComplexType });
      });

      classRegistry.current.set(classDtoName, {
        name: classDtoName,
        properties,
        dependencies
      });

      return classDtoName;
    }

    const typeMap: Record<string, string> = {
      'string': 'String',
      'number': isInteger(obj) ? 'Long' : 'Double',
      'boolean': 'Boolean'
    };

    return typeMap[typeof obj] || 'Object';
  }, [capitalizeFirst, toCamelCase, isInteger]);

  const getOrderedClasses = useCallback((): ClassInfo[] => {
    const ordered: ClassInfo[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (className: string): void => {
      if (visiting.has(className)) {
        return;
      }
      if (visited.has(className)) {
        return;
      }

      const classInfo = classRegistry.current.get(className);
      if (!classInfo) {
        return;
      }

      visiting.add(className);

      classInfo.dependencies.forEach(dep => {
        visit(dep);
      });

      visiting.delete(className);
      visited.add(className);
      ordered.push(classInfo);
    };

    classRegistry.current.forEach((_, className) => {
      visit(className);
    });

    return ordered;
  }, []);

  const generateTypeScriptInterface = useCallback((classInfo: ClassInfo): string => {
    const interfaceName = classInfo.name;

    if (classInfo.properties.length === 0) {
      return `export interface ${interfaceName} {\n}`;
    }

    let code = `export interface ${interfaceName} {\n`;

    classInfo.properties.forEach((prop) => {
      code += `  ${prop.name}: ${prop.type};\n`;
    });

    code += '}';

    return code;
  }, []);

  const generateJavaRecord = useCallback((classInfo: ClassInfo, needsListImport: boolean): string => {
    const recordName = classInfo.name;
    
    let code = 'package com.example.dto;\n\n';
    code += 'import com.fasterxml.jackson.annotation.JsonInclude;\n';
    code += 'import com.fasterxml.jackson.annotation.JsonInclude.Include;\n';
    code += 'import com.fasterxml.jackson.annotation.JsonProperty;\n';

    if (needsListImport) {
      code += 'import java.util.List;\n';
    }

    code += '\n';
    code += '@JsonInclude(Include.NON_NULL)\n';
    code += `public record ${recordName}(\n`;

    if (classInfo.properties.length === 0) {
      code += ') {}';
      return code;
    }

    classInfo.properties.forEach((prop, index) => {
      const isLast = index === classInfo.properties.length - 1;
      code += `  @JsonProperty("${prop.originalName}")\n`;
      code += `  ${prop.type} ${prop.name}${isLast ? '' : ','}\n`;
    });

    code += ') {}';

    return code;
  }, []);

  const generateJavaClass = useCallback((classInfo: ClassInfo, javaType: 'lombok' | 'record'): string => {
    const className = classInfo.name;
    const needsListImport = classInfo.properties.some(prop => prop.type.startsWith('List<'));

    if (javaType === 'record') {
      return generateJavaRecord(classInfo, needsListImport);
    }

    // Lombok (comportamento original)
    let code = 'package com.example.dto;\n\n';
    code += 'import com.fasterxml.jackson.annotation.JsonInclude;\n';
    code += 'import com.fasterxml.jackson.annotation.JsonInclude.Include;\n';
    code += 'import com.fasterxml.jackson.annotation.JsonProperty;\n';
    code += 'import lombok.AllArgsConstructor;\n';
    code += 'import lombok.Builder;\n';
    code += 'import lombok.Data;\n';
    code += 'import lombok.NoArgsConstructor;\n';

    if (needsListImport) {
      code += 'import java.util.List;\n';
    }

    code += '\n';
    code += '@Data\n';
    code += '@AllArgsConstructor\n';
    code += '@NoArgsConstructor\n';
    code += '@Builder\n';
    code += '@JsonInclude(Include.NON_NULL)\n';
    code += `public class ${className} {\n\n`;

    if (classInfo.properties.length === 0) {
      code += '}';
      return code;
    }

    classInfo.properties.forEach((prop) => {
      code += `  @JsonProperty("${prop.originalName}")\n`;
      code += `  private ${prop.type} ${prop.name};\n`;
    });

    code += '}';

    return code;
  }, [generateJavaRecord]);

  const generateCode = useCallback(() => {
    if (!jsonInput.trim() || !className.trim()) {
      setGeneratedCode('');
      setEditedCode('');
      setError(null);
      return;
    }

    try {
      const jsonObject = JSON.parse(jsonInput);
      classRegistry.current.clear();

      let generated = '';

      if (language === 'typescript') {
        const suffixPart = suffix ? capitalizeFirst(suffix) : '';
        const rootInterfaceName = `I${capitalizeFirst(className)}${suffixPart}`;
        processObjectForTypeScript(jsonObject, rootInterfaceName, '', suffix);
        const orderedClasses = getOrderedClasses();
        const interfaces: string[] = [];
        orderedClasses.forEach(classInfo => {
          interfaces.push(generateTypeScriptInterface(classInfo));
        });
        generated = interfaces.join('\n\n');
      } else {
        const suffixPart = suffix ? capitalizeFirst(suffix) : '';
        const rootClassName = `${capitalizeFirst(className)}${suffixPart}Dto`;
        processObjectForJava(jsonObject, rootClassName, '', suffix);
        const orderedClasses = getOrderedClasses();
        const classes: string[] = [];
        orderedClasses.forEach(classInfo => {
          classes.push(generateJavaClass(classInfo, javaType));
        });
        generated = classes.join('\n\n');
      }

      setGeneratedCode(generated);
      setEditedCode(generated);
      setError(null);
      onToast('success', 'Código gerado!', 'Código gerado com sucesso');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'JSON inválido. Por favor, verifique o formato.';
      setError(errorMessage);
      setGeneratedCode('');
      setEditedCode('');
      onToast('error', 'Erro', 'Falha ao gerar código');
    }
  }, [jsonInput, className, suffix, language, javaType, capitalizeFirst, processObjectForTypeScript, processObjectForJava, getOrderedClasses, generateTypeScriptInterface, generateJavaClass, onToast]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(event.target.value);
    setError(null);
  }, []);

  const handleClassNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setClassName(event.target.value);
    setError(null);
  }, []);

  const handleSuffixChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSuffix(event.target.value);
    setError(null);
  }, []);

  const handleLanguageChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value as 'typescript' | 'java');
    setError(null);
  }, []);

  const handleJavaTypeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setJavaType(event.target.value as 'lombok' | 'record');
    setError(null);
  }, []);

  const handleCodeEdit = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedCode(event.target.value);
  }, []);

  const handleCopy = useCallback(() => {
    const codeToCopy = editedCode || generatedCode;
    if (!codeToCopy) {
      onToast('info', 'Aviso', 'Nada para copiar. Gere o código primeiro.');
      return;
    }
    navigator.clipboard.writeText(codeToCopy);
    onToast('success', 'Copiado!', 'Código copiado para a área de transferência');
  }, [editedCode, generatedCode, onToast]);

  const handleDownload = useCallback(() => {
    const codeToDownload = editedCode || generatedCode;
    if (!codeToDownload) {
      onToast('info', 'Aviso', 'Nada para baixar. Gere o código primeiro.');
      return;
    }

    const extension = language === 'typescript' ? 'ts' : 'java';
    const suffixPart = suffix ? capitalizeFirst(suffix) : '';
    const fileName = language === 'typescript'
      ? `I${capitalizeFirst(className)}${suffixPart}.${extension}`
      : `${capitalizeFirst(className)}${suffixPart}Dto.${extension}`;

    const blob = new Blob([codeToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onToast('success', 'Download iniciado!', 'Código baixado com sucesso');
  }, [editedCode, generatedCode, language, className, suffix, capitalizeFirst, onToast]);

  const handleClear = useCallback(() => {
    setJsonInput('');
    setClassName('');
    setSuffix('');
    setJavaType('lombok');
    setGeneratedCode('');
    setEditedCode('');
    setError(null);
    classRegistry.current.clear();
  }, []);

  // Auto-generate quando inputs mudarem
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateCode();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [jsonInput, className, suffix, language, javaType, generateCode]);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">JSON para Código</h2>
      </div>

      {/* Configuration */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className="form-group">
          <label className="form-label">Linguagem</label>
          <select
            className="form-select"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="typescript">TypeScript</option>
            <option value="java">Java</option>
          </select>
        </div>

        {language === 'java' && (
          <div className="form-group">
            <label className="form-label">Tipo Java</label>
            <select
              className="form-select"
              value={javaType}
              onChange={handleJavaTypeChange}
            >
              <option value="lombok">Lombok</option>
              <option value="record">Record (Java 17+)</option>
            </select>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Nome da Classe</label>
          <input
            type="text"
            className="form-input"
            placeholder="Ex: Product, User, Order"
            value={className}
            onChange={handleClassNameChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Sufixo (Opcional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="Ex: Omie, Api, Service"
            value={suffix}
            onChange={handleSuffixChange}
          />
        </div>
      </div>

      {/* JSON Input */}
      <div className="form-group">
        <label className="form-label">JSON</label>
        <textarea
          className="form-input font-mono"
          placeholder="Cole aqui o JSON..."
          value={jsonInput}
          onChange={handleInputChange}
          style={{
            minHeight: '200px',
            resize: 'vertical',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
            lineHeight: 1.5
          }}
        />
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

      {/* Generated Code */}
      {(generatedCode || editedCode) && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Preview do Código Gerado
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <CopyButton value={editedCode || generatedCode} label="Copiar" onCopy={handleCopy} />
              <button
                type="button"
                onClick={handleDownload}
                className="btn btn-secondary"
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                <span style={{ width: '16px', height: '16px', marginRight: '6px' }}>{Icons.download}</span>
                Baixar
              </button>
            </div>
          </div>

          <textarea
            className="form-input font-mono"
            value={editedCode}
            onChange={handleCodeEdit}
            style={{
              minHeight: '400px',
              resize: 'vertical',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              lineHeight: 1.5,
              background: 'var(--bg-primary)',
              border: '1px solid var(--accent-green)',
              color: 'var(--accent-cyan)'
            }}
          />
        </div>
      )}

      {/* Clear Button */}
      {(jsonInput || className || generatedCode) && (
        <div style={{ marginTop: '16px' }}>
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-secondary"
          >
            <span style={{ width: '18px', height: '18px' }}>{Icons.clear}</span>
            Limpar
          </button>
        </div>
      )}
    </div>
  );
}

