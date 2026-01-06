/**
 * DevTools - Ferramentas de Desenvolvimento
 * 
 * Geradores e formatadores úteis:
 * - CPF (gerar válido / validar / formatar)
 * - CNPJ (gerar válido / validar / formatar)
 * - UUID (gerar)
 * - Lorem Ipsum (gerar)
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  GenerateCPF, 
  ValidateCPF, 
  GenerateCNPJ, 
  ValidateCNPJ,
  GenerateUUID,
  GenerateLoremIpsum
} from '../wailsjs/go/main/App';

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
  )
};

type ToolTab = 'cpf' | 'cnpj' | 'uuid' | 'lorem' | 'json' | 'encode-file' | 'decode-file' | 'cep-search';

interface DevToolsProps {
  onToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

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

// Estrutura de categorias
type ToolCategory = 'documentos' | 'identificadores' | 'texto' | 'arquivos';

interface Tool {
  id: ToolTab;
  label: string;
  icon: JSX.Element;
  description: string;
  category: ToolCategory;
}

interface CepResponse {
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean;
}

export default function DevTools({ onToast }: DevToolsProps) {
  const [activeTab, setActiveTab] = useState<ToolTab | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // CPF State
  const [cpfResult, setCpfResult] = useState<{ raw: string; formatted: string; valid: boolean } | null>(null);
  const [cpfInput, setCpfInput] = useState('');
  const [cpfValidation, setCpfValidation] = useState<{ raw: string; formatted: string; valid: boolean } | null>(null);
  
  // CNPJ State
  const [cnpjResult, setCnpjResult] = useState<{ raw: string; formatted: string; valid: boolean } | null>(null);
  const [cnpjInput, setCnpjInput] = useState('');
  const [cnpjValidation, setCnpjValidation] = useState<{ raw: string; formatted: string; valid: boolean } | null>(null);
  
  // UUID State
  const [uuidResult, setUuidResult] = useState<string>('');
  const [uuidInput, setUuidInput] = useState<string>('');
  const [uuidFormatted, setUuidFormatted] = useState<string>('');
  const [uuidError, setUuidError] = useState<string | null>(null);
  
  // Lorem State
  const [loremParagraphs, setLoremParagraphs] = useState(3);
  const [loremResult, setLoremResult] = useState<string>('');

  // JSON State
  const [jsonInput, setJsonInput] = useState<string>('');
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonIndent, setJsonIndent] = useState<number>(2);

  // Encode File State
  const [encodeBase64Output, setEncodeBase64Output] = useState<string>('');
  const [encodeFileName, setEncodeFileName] = useState<string>('');
  const [encodeFileType, setEncodeFileType] = useState<string>('');
  const [encodeIsLoading, setEncodeIsLoading] = useState<boolean>(false);
  const [encodeError, setEncodeError] = useState<string | null>(null);
  const [encodeIsDragging, setEncodeIsDragging] = useState<boolean>(false);

  // Decode File State
  const [decodeBase64Input, setDecodeBase64Input] = useState<string>('');
  const [decodePreview, setDecodePreview] = useState<string | null>(null);
  const [decodeFileName, setDecodeFileName] = useState<string>('decoded-file');
  const [decodeError, setDecodeError] = useState<string | null>(null);

  // CEP Search State
  const [cepInput, setCepInput] = useState<string>('');
  const [cepData, setCepData] = useState<CepResponse | null>(null);
  const [cepLoading, setCepLoading] = useState<boolean>(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [mapsUrl, setMapsUrl] = useState<string | null>(null);

  // CPF Handlers
  const handleGenerateCPF = useCallback(async () => {
    try {
      const result = await GenerateCPF();
      setCpfResult(result);
      onToast('success', 'CPF Gerado!', result.formatted);
    } catch (error) {
      onToast('error', 'Erro', 'Falha ao gerar CPF');
    }
  }, [onToast]);

  const handleValidateCPF = useCallback(async () => {
    if (!cpfInput.trim()) return;
    try {
      const result = await ValidateCPF(cpfInput);
      setCpfValidation(result);
      if (result.valid) {
        onToast('success', 'CPF Válido!', result.formatted);
      } else {
        onToast('error', 'CPF Inválido', 'O CPF informado não é válido');
      }
    } catch (error) {
      onToast('error', 'Erro', 'Falha ao validar CPF');
    }
  }, [cpfInput, onToast]);

  // CNPJ Handlers
  const handleGenerateCNPJ = useCallback(async () => {
    try {
      const result = await GenerateCNPJ();
      setCnpjResult(result);
      onToast('success', 'CNPJ Gerado!', result.formatted);
    } catch (error) {
      onToast('error', 'Erro', 'Falha ao gerar CNPJ');
    }
  }, [onToast]);

  const handleValidateCNPJ = useCallback(async () => {
    if (!cnpjInput.trim()) return;
    try {
      const result = await ValidateCNPJ(cnpjInput);
      setCnpjValidation(result);
      if (result.valid) {
        onToast('success', 'CNPJ Válido!', result.formatted);
      } else {
        onToast('error', 'CNPJ Inválido', 'O CNPJ informado não é válido');
      }
    } catch (error) {
      onToast('error', 'Erro', 'Falha ao validar CNPJ');
    }
  }, [cnpjInput, onToast]);

  // UUID Handlers
  const handleGenerateUUID = useCallback(async () => {
    try {
      const result = await GenerateUUID();
      setUuidResult(result);
      onToast('success', 'UUID Gerado!', result);
    } catch (error) {
      onToast('error', 'Erro', 'Falha ao gerar UUID');
    }
  }, [onToast]);

  const handleFormatToUUID = useCallback(() => {
    // Remove caracteres não hexadecimais
    const hex = uuidInput.replace(/[^a-fA-F0-9]/g, '');
    
    if (hex.length !== 32) {
      setUuidError(`String deve ter 32 caracteres hexadecimais (atual: ${hex.length})`);
      setUuidFormatted('');
      return;
    }
    
    // Formatar como UUID: 8-4-4-4-12
    const formatted = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`.toLowerCase();
    setUuidFormatted(formatted);
    setUuidError(null);
    onToast('success', 'UUID Formatado!', formatted);
  }, [uuidInput, onToast]);

  // Lorem Handler
  const handleGenerateLorem = useCallback(async () => {
    try {
      const result = await GenerateLoremIpsum(loremParagraphs);
      setLoremResult(result);
      onToast('success', 'Lorem Ipsum Gerado!', `${loremParagraphs} parágrafo(s)`);
    } catch (error) {
      onToast('error', 'Erro', 'Falha ao gerar Lorem Ipsum');
    }
  }, [loremParagraphs, onToast]);

  // JSON Handlers
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

  // Encode File Handlers
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
    setEncodeIsLoading(true);
    setEncodeError(null);
    setEncodeBase64Output('');
    setEncodeFileName(file.name);
    setEncodeFileType(file.type || getFileTypeFromName(file.name));

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = reader.result as string;
        setEncodeBase64Output(result);
        setEncodeIsLoading(false);
        onToast('success', 'Arquivo codificado!', 'Base64 gerado com sucesso');
      } catch (error) {
        setEncodeError('Erro ao codificar o arquivo. Tente novamente.');
        setEncodeIsLoading(false);
        onToast('error', 'Erro', 'Falha ao codificar arquivo');
      }
    };
    reader.onerror = () => {
      setEncodeError('Erro ao ler o arquivo. Verifique se o arquivo está válido.');
      setEncodeIsLoading(false);
      onToast('error', 'Erro', 'Falha ao ler arquivo');
    };
    reader.readAsDataURL(file);
  }, [getFileTypeFromName, onToast]);

  const handleEncodeFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleEncodeFile(file);
    }
  }, [handleEncodeFile]);

  const handleEncodeDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setEncodeIsDragging(false);
    const file = event.dataTransfer?.files[0];
    if (file) {
      handleEncodeFile(file);
    }
  }, [handleEncodeFile]);

  const handleEncodeDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setEncodeIsDragging(true);
  }, []);

  const handleEncodeDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setEncodeIsDragging(false);
  }, []);

  const handleClearEncode = useCallback(() => {
    setEncodeBase64Output('');
    setEncodeFileName('');
    setEncodeFileType('');
    setEncodeError(null);
    const fileInput = document.getElementById('encodeFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  // Decode File Handlers
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
    setDecodeError(null);
    setDecodePreview(null);

    if (!decodeBase64Input.trim()) {
      return;
    }

    try {
      let base64Data = decodeBase64Input.trim();
      
      // Remove data:image/...;base64, se existir
      const base64Match = base64Data.match(/^data:(.+?);base64,(.+)$/);
      if (base64Match) {
        base64Data = base64Match[2];
        const mimeType = base64Match[1];
        if (mimeType.startsWith('image/')) {
          const imageType = mimeType.split('/')[1];
          setDecodeFileName(`decoded-file.${imageType}`);
          setDecodePreview(`data:${mimeType};base64,${base64Data}`);
          return;
        }
      }

      // Valida se é base64 válido
      if (!isValidBase64(base64Data)) {
        setDecodeError('Base64 inválido. Por favor, verifique o formato.');
        return;
      }

      // Tenta detectar como imagem
      const imageType = detectImageType(base64Data);
      setDecodeFileName(`decoded-file.${imageType}`);
      setDecodePreview(`data:image/${imageType};base64,${base64Data}`);
      onToast('success', 'Base64 decodificado!', 'Preview gerado com sucesso');
    } catch (error) {
      setDecodeError('Erro ao decodificar. Verifique se o base64 está correto.');
      onToast('error', 'Erro', 'Falha ao decodificar base64');
    }
  }, [decodeBase64Input, isValidBase64, detectImageType, onToast]);

  const handleDecodeInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDecodeBase64Input(event.target.value);
    setDecodeError(null);
  }, []);

  // Auto-decode quando o input mudar (com debounce)
  useEffect(() => {
    if (!decodeBase64Input.trim()) {
      setDecodePreview(null);
      setDecodeError(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleDecodeBase64();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [decodeBase64Input, handleDecodeBase64]);

  const handleDownloadDecoded = useCallback(() => {
    if (!decodePreview) return;
    try {
      const link = document.createElement('a');
      link.href = decodePreview;
      link.download = decodeFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onToast('success', 'Download iniciado!', 'Arquivo baixado com sucesso');
    } catch (error) {
      setDecodeError('Erro ao fazer download do arquivo.');
      onToast('error', 'Erro', 'Falha ao fazer download');
    }
  }, [decodePreview, decodeFileName, onToast]);

  const handleClearDecode = useCallback(() => {
    setDecodeBase64Input('');
    setDecodePreview(null);
    setDecodeError(null);
    setDecodeFileName('decoded-file');
  }, []);

  // CEP Search Handlers
  const formatCEP = useCallback((cep: string): string => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`;
    }
    return cleanCep;
  }, []);

  const handleCepInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '');
    if (value.length <= 8) {
      setCepInput(value);
      setCepError(null);
      if (cepData) {
        setCepData(null);
        setMapsUrl(null);
      }
    }
  }, [cepData]);

  const buildMapsUrl = useCallback((cepData: CepResponse): string => {
    const addressParts: string[] = [];
    if (cepData.logradouro) addressParts.push(cepData.logradouro);
    if (cepData.bairro) addressParts.push(cepData.bairro);
    if (cepData.localidade) addressParts.push(cepData.localidade);
    if (cepData.uf) addressParts.push(cepData.uf);
    if (cepData.cep) addressParts.push(`CEP ${formatCEP(cepData.cep)}`);
    const address = addressParts.join(', ');
    return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  }, [formatCEP]);

  const handleSearchCEP = useCallback(async () => {
    const cleanCep = cepInput.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setCepError('CEP deve conter 8 dígitos');
      setCepData(null);
      return;
    }

    setCepLoading(true);
    setCepError(null);
    setCepData(null);
    setMapsUrl(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data: CepResponse = await response.json();
      
      if (data.erro) {
        setCepError('CEP não encontrado');
        setCepLoading(false);
        return;
      }

      setCepData(data);
      setMapsUrl(buildMapsUrl(data));
      onToast('success', 'CEP encontrado!', 'Informações do endereço carregadas');
    } catch (error) {
      setCepError('Erro ao buscar CEP. Tente novamente.');
      onToast('error', 'Erro', 'Falha ao buscar CEP');
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setCepLoading(false);
    }
  }, [cepInput, buildMapsUrl, onToast]);

  const handleCepKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchCEP();
    }
  }, [handleSearchCEP]);

  const handleClearCEP = useCallback(() => {
    setCepInput('');
    setCepData(null);
    setCepError(null);
    setMapsUrl(null);
  }, []);

  const handleOpenInGoogleMaps = useCallback(() => {
    if (cepData) {
      const addressParts: string[] = [];
      if (cepData.logradouro) addressParts.push(cepData.logradouro);
      if (cepData.bairro) addressParts.push(cepData.bairro);
      if (cepData.localidade) addressParts.push(cepData.localidade);
      if (cepData.uf) addressParts.push(cepData.uf);
      if (cepData.cep) addressParts.push(`CEP ${formatCEP(cepData.cep)}`);
      const address = addressParts.join(', ');
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
      window.open(url, '_blank');
    }
  }, [cepData, formatCEP]);

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

  // Estrutura de ferramentas organizadas por categoria
  const tools: Tool[] = [
    { id: 'cpf', label: 'CPF', icon: Icons.user, description: 'Gerar, validar e formatar CPF', category: 'documentos' },
    { id: 'cnpj', label: 'CNPJ', icon: Icons.building, description: 'Gerar, validar e formatar CNPJ', category: 'documentos' },
    { id: 'uuid', label: 'UUID', icon: Icons.hash, description: 'Gerar UUID v4 e formatar strings', category: 'identificadores' },
    { id: 'lorem', label: 'Lorem Ipsum', icon: Icons.text, description: 'Gerar texto Lorem Ipsum', category: 'texto' },
    { id: 'json', label: 'JSON', icon: Icons.json, description: 'Formatar e minificar JSON', category: 'texto' },
    { id: 'encode-file', label: 'Encode File', icon: Icons.encode, description: 'Converter arquivo para Base64', category: 'arquivos' },
    { id: 'decode-file', label: 'Decode File', icon: Icons.decode, description: 'Decodificar Base64 para imagem', category: 'arquivos' },
    { id: 'cep-search', label: 'Buscar CEP', icon: Icons.map, description: 'Buscar informações de endereço por CEP', category: 'documentos' },
  ];

  const categories: { id: ToolCategory; label: string; icon: JSX.Element }[] = [
    { id: 'documentos', label: 'Documentos', icon: Icons.user },
    { id: 'identificadores', label: 'Identificadores', icon: Icons.hash },
    { id: 'texto', label: 'Texto', icon: Icons.text },
    { id: 'arquivos', label: 'Arquivos', icon: Icons.file },
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Gerar CPF */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Gerar CPF Válido</h2>
              </div>
              
              <button
                onClick={handleGenerateCPF}
                className="btn btn-primary"
                style={{ marginBottom: '16px' }}
              >
                <span style={{ width: '18px', height: '18px' }}>{Icons.generate}</span>
                Gerar CPF
              </button>

              {cpfResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        COM MÁSCARA
                      </div>
                      <div style={{ 
                        fontFamily: 'JetBrains Mono', 
                        fontSize: '18px', 
                        color: 'var(--accent-cyan)',
                        letterSpacing: '1px'
                      }}>
                        {cpfResult.formatted}
                      </div>
                    </div>
                    <CopyButton value={cpfResult.formatted} label="Copiar" onCopy={handleCopyNotify} />
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        APENAS NÚMEROS
                      </div>
                      <div style={{ 
                        fontFamily: 'JetBrains Mono', 
                        fontSize: '18px', 
                        color: 'var(--text-primary)',
                        letterSpacing: '2px'
                      }}>
                        {cpfResult.raw}
                      </div>
                    </div>
                    <CopyButton value={cpfResult.raw} label="Copiar" onCopy={handleCopyNotify} />
                  </div>
                </div>
              )}
            </div>

            {/* Validar/Formatar CPF */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Validar / Formatar CPF</h2>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="Digite um CPF (com ou sem máscara)"
                  value={cpfInput}
                  onChange={(e) => setCpfInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={handleValidateCPF}
                  className="btn btn-secondary"
                  disabled={!cpfInput.trim()}
                >
                  Validar
                </button>
              </div>

              {cpfValidation && (
                <div style={{
                  padding: '16px',
                  background: cpfValidation.valid ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 68, 68, 0.05)',
                  border: `1px solid ${cpfValidation.valid ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                  borderRadius: 'var(--border-radius)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '12px',
                    color: cpfValidation.valid ? 'var(--accent-green)' : 'var(--accent-red)'
                  }}>
                    <span style={{ width: '18px', height: '18px' }}>
                      {cpfValidation.valid ? Icons.check : Icons.x}
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      {cpfValidation.valid ? 'CPF Válido' : 'CPF Inválido'}
                    </span>
                  </div>

                  {cpfValidation.valid && cpfValidation.formatted && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{
                        flex: 1,
                        padding: '12px',
                        background: 'var(--bg-primary)',
                        borderRadius: '6px'
                      }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          FORMATADO
                        </div>
                        <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}>
                          {cpfValidation.formatted}
                        </div>
                      </div>
                      <CopyButton value={cpfValidation.formatted} label="Com máscara" onCopy={handleCopyNotify} />
                      <CopyButton value={cpfValidation.raw} label="Só números" onCopy={handleCopyNotify} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

            {/* CNPJ Tool */}
        {activeTab === 'cnpj' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Gerar CNPJ */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Gerar CNPJ Válido</h2>
              </div>
              
              <button
                onClick={handleGenerateCNPJ}
                className="btn btn-primary"
                style={{ marginBottom: '16px' }}
              >
                <span style={{ width: '18px', height: '18px' }}>{Icons.generate}</span>
                Gerar CNPJ
              </button>

              {cnpjResult && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        COM MÁSCARA
                      </div>
                      <div style={{ 
                        fontFamily: 'JetBrains Mono', 
                        fontSize: '18px', 
                        color: 'var(--accent-cyan)',
                        letterSpacing: '1px'
                      }}>
                        {cnpjResult.formatted}
                      </div>
                    </div>
                    <CopyButton value={cnpjResult.formatted} label="Copiar" onCopy={handleCopyNotify} />
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        APENAS NÚMEROS
                      </div>
                      <div style={{ 
                        fontFamily: 'JetBrains Mono', 
                        fontSize: '18px', 
                        color: 'var(--text-primary)',
                        letterSpacing: '2px'
                      }}>
                        {cnpjResult.raw}
                      </div>
                    </div>
                    <CopyButton value={cnpjResult.raw} label="Copiar" onCopy={handleCopyNotify} />
                  </div>
                </div>
              )}
            </div>

            {/* Validar/Formatar CNPJ */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Validar / Formatar CNPJ</h2>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="Digite um CNPJ (com ou sem máscara)"
                  value={cnpjInput}
                  onChange={(e) => setCnpjInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={handleValidateCNPJ}
                  className="btn btn-secondary"
                  disabled={!cnpjInput.trim()}
                >
                  Validar
                </button>
              </div>

              {cnpjValidation && (
                <div style={{
                  padding: '16px',
                  background: cnpjValidation.valid ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 68, 68, 0.05)',
                  border: `1px solid ${cnpjValidation.valid ? 'var(--accent-green)' : 'var(--accent-red)'}`,
                  borderRadius: 'var(--border-radius)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '12px',
                    color: cnpjValidation.valid ? 'var(--accent-green)' : 'var(--accent-red)'
                  }}>
                    <span style={{ width: '18px', height: '18px' }}>
                      {cnpjValidation.valid ? Icons.check : Icons.x}
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      {cnpjValidation.valid ? 'CNPJ Válido' : 'CNPJ Inválido'}
                    </span>
                  </div>

                  {cnpjValidation.valid && cnpjValidation.formatted && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{
                        flex: 1,
                        padding: '12px',
                        background: 'var(--bg-primary)',
                        borderRadius: '6px'
                      }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          FORMATADO
                        </div>
                        <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}>
                          {cnpjValidation.formatted}
                        </div>
                      </div>
                      <CopyButton value={cnpjValidation.formatted} label="Com máscara" onCopy={handleCopyNotify} />
                      <CopyButton value={cnpjValidation.raw} label="Só números" onCopy={handleCopyNotify} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

            {/* UUID Tool */}
        {activeTab === 'uuid' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Gerar UUID */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Gerar UUID v4</h2>
              </div>
              
              <button
                onClick={handleGenerateUUID}
                className="btn btn-primary"
                style={{ marginBottom: '16px' }}
              >
                <span style={{ width: '18px', height: '18px' }}>{Icons.generate}</span>
                Gerar UUID
              </button>

              {uuidResult && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '20px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      UUID v4
                    </div>
                    <div style={{ 
                      fontFamily: 'JetBrains Mono', 
                      fontSize: '16px', 
                      color: 'var(--accent-cyan)',
                      letterSpacing: '0.5px'
                    }}>
                      {uuidResult}
                    </div>
                  </div>
                  <CopyButton value={uuidResult} label="Copiar" onCopy={handleCopyNotify} />
                </div>
              )}

              <div style={{ 
                marginTop: '16px',
                padding: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--border-radius)',
                fontSize: '12px',
                color: 'var(--text-muted)'
              }}>
                <strong>Formato:</strong> xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
                <br />
                <span style={{ fontSize: '11px' }}>
                  Onde 4 indica a versão e y é 8, 9, A ou B
                </span>
              </div>
            </div>

            {/* Converter String para UUID */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Converter String para UUID</h2>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="Ex: AE640E0F5B644D23A6EF036AA110B07B"
                  value={uuidInput}
                  onChange={(e) => {
                    setUuidInput(e.target.value);
                    setUuidError(null);
                  }}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={handleFormatToUUID}
                  className="btn btn-secondary"
                  disabled={!uuidInput.trim()}
                >
                  Converter
                </button>
              </div>

              {uuidError && (
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
                    {uuidError}
                  </span>
                </div>
              )}

              {uuidFormatted && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '20px',
                  background: 'rgba(0, 255, 136, 0.05)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--accent-green)'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      UUID FORMATADO
                    </div>
                    <div style={{ 
                      fontFamily: 'JetBrains Mono', 
                      fontSize: '16px', 
                      color: 'var(--accent-cyan)',
                      letterSpacing: '0.5px'
                    }}>
                      {uuidFormatted}
                    </div>
                  </div>
                  <CopyButton value={uuidFormatted} label="Copiar" onCopy={handleCopyNotify} />
                </div>
              )}

              <div style={{ 
                marginTop: '16px',
                padding: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--border-radius)',
                fontSize: '12px',
                color: 'var(--text-muted)'
              }}>
                <strong>Entrada aceita:</strong> String hexadecimal de 32 caracteres
                <br />
                <span style={{ fontSize: '11px' }}>
                  Hífens e espaços são ignorados automaticamente
                </span>
              </div>
            </div>
          </div>
        )}

            {/* Lorem Ipsum Tool */}
        {activeTab === 'lorem' && (
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
        )}

            {/* JSON Tool */}
        {activeTab === 'json' && (
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
        )}

            {/* Encode File Tool */}
        {activeTab === 'encode-file' && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Encode File to Base64</h2>
            </div>

            {/* Upload Area */}
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Selecionar Arquivo</label>
              <div
                onDrop={handleEncodeDrop}
                onDragOver={handleEncodeDragOver}
                onDragLeave={handleEncodeDragLeave}
                style={{
                  border: `2px dashed ${encodeIsDragging ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--border-radius)',
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: encodeIsDragging ? 'rgba(0, 217, 255, 0.05)' : 'var(--bg-tertiary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <input
                  type="file"
                  id="encodeFileInput"
                  accept="*/*"
                  disabled={encodeIsLoading}
                  onChange={handleEncodeFileSelect}
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
            {encodeFileName && (
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
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{encodeFileName}</span>
                </div>
                {encodeFileType && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Tipo: </span>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{encodeFileType}</span>
                  </div>
                )}
              </div>
            )}

            {/* Loading */}
            {encodeIsLoading && (
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
            {encodeError && (
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
                  {encodeError}
                </span>
              </div>
            )}

            {/* Output */}
            {encodeBase64Output && (
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label">Base64 Gerado</label>
                  <CopyButton value={encodeBase64Output} label="Copiar Base64" onCopy={handleCopyNotify} />
                </div>
                <div style={{ position: 'relative' }}>
                  <textarea
                    readOnly
                    value={encodeBase64Output}
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
                    onClick={handleClearEncode}
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
        )}

            {/* Decode File Tool */}
        {activeTab === 'decode-file' && (
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
                  value={decodeBase64Input}
                  onChange={handleDecodeInputChange}
                  style={{
                    minHeight: '150px',
                    resize: 'vertical',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    paddingRight: '40px'
                  }}
                />
                {decodeBase64Input && (
                  <button
                    type="button"
                    onClick={handleClearDecode}
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
            {decodeError && (
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
                  {decodeError}
                </span>
              </div>
            )}

            {/* Preview */}
            {decodePreview && (
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
                    src={decodePreview}
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
                    onClick={handleDownloadDecoded}
                    className="btn btn-primary"
                  >
                    <span style={{ width: '18px', height: '18px' }}>{Icons.download}</span>
                    Download da Imagem
                  </button>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {decodeFileName}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

            {/* CEP Search Tool */}
            {activeTab === 'cep-search' && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">Buscar CEP</h2>
                </div>

                {/* Search Input */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <label className="form-label">CEP</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      placeholder="00000000"
                      maxLength={8}
                      value={cepInput}
                      onChange={handleCepInputChange}
                      onKeyDown={handleCepKeyDown}
                      disabled={cepLoading}
                      style={{ paddingRight: cepInput ? '40px' : '14px' }}
                    />
                    {cepInput && (
                      <button
                        type="button"
                        onClick={handleClearCEP}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '38px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          fontSize: '18px',
                          lineHeight: 1,
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Limpar"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={handleSearchCEP}
                      className="btn btn-primary"
                      disabled={cepLoading || cepInput.length !== 8}
                    >
                      {cepLoading ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {cepError && (
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
                      {cepError}
                    </span>
                  </div>
                )}

                {/* Results */}
                {cepData && (
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                      Informações do CEP
                    </h3>

                    {/* CEP Display */}
                    <div style={{
                      padding: '16px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--border-radius)',
                      marginBottom: '16px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>CEP:</span>
                        <span style={{ 
                          fontFamily: 'JetBrains Mono', 
                          fontSize: '18px', 
                          fontWeight: 600,
                          color: 'var(--accent-cyan)'
                        }}>
                          {formatCEP(cepData.cep)}
                        </span>
                      </div>
                    </div>

                    {/* Address Info */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      {[
                        { label: 'Logradouro', value: cepData.logradouro || 'N/A' },
                        { label: 'Complemento', value: cepData.complemento || 'N/A', hideIfNA: true },
                        { label: 'Bairro', value: cepData.bairro || 'N/A' },
                        { label: 'Localidade', value: cepData.localidade || 'N/A' },
                        { label: 'UF', value: cepData.uf || 'N/A' },
                        { label: 'IBGE', value: cepData.ibge || 'N/A' },
                        { label: 'GIA', value: cepData.gia || 'N/A', hideIfNA: true },
                        { label: 'DDD', value: cepData.ddd || 'N/A' },
                        { label: 'SIAFI', value: cepData.siafi || 'N/A' },
                      ].filter(item => !item.hideIfNA || item.value !== 'N/A').map((item) => (
                        <div
                          key={item.label}
                          style={{
                            padding: '12px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--border-radius)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Google Maps */}
                    {mapsUrl && (
                      <div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '12px'
                        }}>
                          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                            Localização no Mapa
                          </h3>
                          <button
                            type="button"
                            onClick={handleOpenInGoogleMaps}
                            className="btn btn-secondary"
                            style={{ fontSize: '13px', padding: '8px 16px' }}
                          >
                            <span style={{ marginRight: '6px' }}>🗺️</span>
                            Abrir no Google Maps
                          </button>
                        </div>
                        <div style={{
                          borderRadius: 'var(--border-radius)',
                          overflow: 'hidden',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-tertiary)'
                        }}>
                          <iframe
                            src={mapsUrl}
                            width="100%"
                            height="450"
                            style={{ border: 0, display: 'block' }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Localização do CEP no Google Maps"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

