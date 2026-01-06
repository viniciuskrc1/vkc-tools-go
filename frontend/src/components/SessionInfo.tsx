/**
 * SessionInfo - Informações da Aplicação (Sessão)
 * 
 * Autentica e exibe informações da sessão:
 * - CompanyId
 * - ContactId
 * - ContabilFirmId
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  AuthenticateWithCredentials, 
  AuthenticateWithCompanyID,
  GetSessionInfo,
  GetSavedLogins,
  GetSavedCompanyIDs,
  UpdateLoginLastUsed,
  UpdateCompanyIDLastUsed
} from '../wailsjs/go/main/App';
import type { SavedLogin, SavedCompanyID } from '../wailsjs/go/main/App';

// Ícones
const Icons = {
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  company: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9h6v6H9z" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
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
  key: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
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
  )
};

// Ambientes disponíveis
const ENVIRONMENTS = [
  { value: 'lab01', label: 'lab01 (padrão)' },
  { value: 'qa01', label: 'qa01' },
  { value: 'sat01', label: 'sat01' },
  { value: 'prod', label: 'prod' },
];

type AuthType = 'credentials' | 'companyId';

interface SessionInfoProps {
  onToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

interface InfoField {
  label: string;
  value: string;
  copied: boolean;
}

export default function SessionInfoComponent({ onToast }: SessionInfoProps) {
  // Estado do formulário
  const [environment, setEnvironment] = useState('lab01');
  const [authType, setAuthType] = useState<AuthType>('credentials');
  
  // Campos de login/senha
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Campo de CompanyID
  const [companyId, setCompanyId] = useState('');
  
  // Credenciais salvas
  const [savedLogins, setSavedLogins] = useState<SavedLogin[]>([]);
  const [savedCompanyIds, setSavedCompanyIds] = useState<SavedCompanyID[]>([]);
  const [selectedLoginId, setSelectedLoginId] = useState<string | null>(null);
  const [selectedCompanyIdRecord, setSelectedCompanyIdRecord] = useState<string | null>(null);
  
  // Estado de execução
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'fetching' | 'done'>('auth');
  
  // Resultado
  const [sessionInfo, setSessionInfo] = useState<InfoField[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Carregar credenciais salvas quando ambiente muda
  useEffect(() => {
    loadSavedCredentials();
  }, [environment]);

  const loadSavedCredentials = async () => {
    try {
      const [logins, companyIds] = await Promise.all([
        GetSavedLogins(environment),
        GetSavedCompanyIDs(environment)
      ]);
      setSavedLogins(logins || []);
      setSavedCompanyIds(companyIds || []);
    } catch (error) {
      console.error('Erro ao carregar credenciais:', error);
    }
  };

  // Selecionar um login salvo
  const handleSelectLogin = useCallback((login: SavedLogin) => {
    setSelectedLoginId(login.id);
    setUsername(login.username);
    setPassword(login.password);
  }, []);

  // Selecionar um CompanyID salvo
  const handleSelectCompanyId = useCallback((record: SavedCompanyID) => {
    setSelectedCompanyIdRecord(record.id);
    setCompanyId(record.companyId);
  }, []);

  // Limpar seleção
  const handleClearSelection = useCallback(() => {
    if (authType === 'credentials') {
      setSelectedLoginId(null);
      setUsername('');
      setPassword('');
    } else {
      setSelectedCompanyIdRecord(null);
      setCompanyId('');
    }
  }, [authType]);

  // Validação do formulário
  const isFormValid = authType === 'credentials' 
    ? username.trim() !== '' && password.trim() !== ''
    : companyId.trim() !== '';

  // Handler para submissão
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError(null);
    setSessionInfo(null);
    setStep('auth');

    try {
      // Passo 1: Autenticar
      let authResult;
      
      if (authType === 'credentials') {
        authResult = await AuthenticateWithCredentials(environment, username, password);
        if (authResult.success && selectedLoginId) {
          await UpdateLoginLastUsed(environment, selectedLoginId);
        }
      } else {
        authResult = await AuthenticateWithCompanyID(environment, companyId);
        if (authResult.success && selectedCompanyIdRecord) {
          await UpdateCompanyIDLastUsed(environment, selectedCompanyIdRecord);
        }
      }

      if (!authResult.success || !authResult.token) {
        setError(authResult.error || 'Erro na autenticação');
        onToast('error', 'Erro na autenticação', authResult.error || 'Erro desconhecido');
        setIsLoading(false);
        return;
      }

      // Passo 2: Buscar informações da sessão
      setStep('fetching');
      
      const infoResult = await GetSessionInfo(environment, authResult.token);

      if (!infoResult.success) {
        setError(infoResult.error || 'Erro ao buscar informações');
        onToast('error', 'Erro', infoResult.error || 'Erro ao buscar informações da sessão');
        setIsLoading(false);
        return;
      }

      // Sucesso - montar campos
      setSessionInfo([
        { label: 'CompanyId', value: infoResult.companyId || '', copied: false },
        { label: 'ContactId', value: infoResult.contactId || '', copied: false },
        { label: 'ContabilFirmId', value: infoResult.contabilFirmId || '', copied: false },
      ]);
      setStep('done');
      onToast('success', 'Sucesso!', 'Informações da sessão obtidas');

    } catch (error) {
      console.error('Erro:', error);
      setError(String(error));
      onToast('error', 'Erro', 'Falha ao obter informações');
    } finally {
      setIsLoading(false);
    }
  }, [authType, environment, username, password, companyId, selectedLoginId, selectedCompanyIdRecord, isFormValid, onToast]);

  // Copiar valor
  const handleCopy = useCallback((index: number) => {
    if (!sessionInfo) return;
    
    const field = sessionInfo[index];
    navigator.clipboard.writeText(field.value);
    
    // Marcar como copiado temporariamente
    setSessionInfo(prev => prev?.map((f, i) => 
      i === index ? { ...f, copied: true } : f
    ) || null);
    
    setTimeout(() => {
      setSessionInfo(prev => prev?.map((f, i) => 
        i === index ? { ...f, copied: false } : f
      ) || null);
    }, 2000);
    
    onToast('success', 'Copiado!', `${field.label} copiado para a área de transferência`);
  }, [sessionInfo, onToast]);

  // Limpar resultado
  const handleReset = useCallback(() => {
    setSessionInfo(null);
    setError(null);
    setStep('auth');
  }, []);

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Informações da Aplicação (Sessão)</h1>
        <p className="page-subtitle">
          Autentica e obtém informações do session-bindings
        </p>
      </header>

      <div className="page-body">
        <form onSubmit={handleSubmit}>
          {/* Card de Configuração */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Autenticação</h2>
            </div>

            {/* Seletor de Ambiente */}
            <div className="form-group">
              <label className="form-label">Ambiente</label>
              <select
                className="form-select"
                value={environment}
                onChange={(e) => {
                  setEnvironment(e.target.value);
                  handleClearSelection();
                }}
                disabled={isLoading}
              >
                {ENVIRONMENTS.map((env) => (
                  <option key={env.value} value={env.value}>
                    {env.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tabs de tipo de autenticação */}
            <div className="form-group">
              <label className="form-label">Tipo de Autenticação</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setAuthType('credentials'); handleClearSelection(); }}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: authType === 'credentials' ? 'rgba(0, 217, 255, 0.15)' : 'var(--bg-tertiary)',
                    border: `1px solid ${authType === 'credentials' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--border-radius)',
                    color: authType === 'credentials' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '14px',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ width: '18px', height: '18px' }}>{Icons.user}</span>
                  Login e Senha
                  {savedLogins.length > 0 && (
                    <span style={{
                      background: 'var(--accent-purple)',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>
                      {savedLogins.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthType('companyId'); handleClearSelection(); }}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: authType === 'companyId' ? 'rgba(0, 217, 255, 0.15)' : 'var(--bg-tertiary)',
                    border: `1px solid ${authType === 'companyId' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--border-radius)',
                    color: authType === 'companyId' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '14px',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ width: '18px', height: '18px' }}>{Icons.company}</span>
                  CompanyID
                  {savedCompanyIds.length > 0 && (
                    <span style={{
                      background: 'var(--accent-purple)',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>
                      {savedCompanyIds.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Card de Credenciais Salvas */}
          {((authType === 'credentials' && savedLogins.length > 0) || 
            (authType === 'companyId' && savedCompanyIds.length > 0)) && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '18px', height: '18px', color: 'var(--accent-purple)' }}>{Icons.key}</span>
                  Credenciais Salvas ({environment})
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {authType === 'credentials' ? (
                  savedLogins.map((login) => (
                    <div
                      key={login.id}
                      onClick={() => handleSelectLogin(login)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: selectedLoginId === login.id ? 'rgba(0, 217, 255, 0.1)' : 'var(--bg-tertiary)',
                        border: `1px solid ${selectedLoginId === login.id ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--border-radius)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        background: 'var(--bg-secondary)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: selectedLoginId === login.id ? 'var(--accent-cyan)' : 'var(--text-muted)'
                      }}>
                        {Icons.user}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
                          {login.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                          {login.username}
                        </div>
                      </div>
                      {selectedLoginId === login.id && (
                        <span style={{ width: '18px', height: '18px', color: 'var(--accent-cyan)' }}>
                          {Icons.check}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  savedCompanyIds.map((record) => (
                    <div
                      key={record.id}
                      onClick={() => handleSelectCompanyId(record)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        background: selectedCompanyIdRecord === record.id ? 'rgba(0, 217, 255, 0.1)' : 'var(--bg-tertiary)',
                        border: `1px solid ${selectedCompanyIdRecord === record.id ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--border-radius)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        background: 'var(--bg-secondary)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: selectedCompanyIdRecord === record.id ? 'var(--accent-cyan)' : 'var(--text-muted)'
                      }}>
                        {Icons.company}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>
                          {record.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                          {record.companyId}
                        </div>
                      </div>
                      {selectedCompanyIdRecord === record.id && (
                        <span style={{ width: '18px', height: '18px', color: 'var(--accent-cyan)' }}>
                          {Icons.check}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Card de Input - Login/Senha */}
          {authType === 'credentials' && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Credenciais</h2>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Username <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Digite o username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setSelectedLoginId(null); }}
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Digite a senha"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setSelectedLoginId(null); }}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Card de Input - CompanyID */}
          {authType === 'companyId' && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">CompanyID</h2>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Company ID <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="Ex: 29c532ff-8baf-4522-a480-e8ddd6e71aa0"
                  value={companyId}
                  onChange={(e) => { setCompanyId(e.target.value); setSelectedCompanyIdRecord(null); }}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Indicador de progresso */}
          {isLoading && (
            <div className="card" style={{ background: 'rgba(0, 217, 255, 0.05)', borderColor: 'var(--accent-cyan)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                <span className="spinner" />
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 500 }}>
                  {step === 'auth' ? 'Autenticando...' : 'Buscando informações da sessão...'}
                </span>
              </div>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div 
              className="card" 
              style={{ 
                borderColor: 'var(--accent-red)',
                background: 'rgba(255, 68, 68, 0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '24px', height: '24px', color: 'var(--accent-red)' }}>
                  {Icons.x}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--accent-red)', marginBottom: '4px' }}>
                    Erro
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resultado */}
          {sessionInfo && (
            <div 
              className="card" 
              style={{ 
                borderColor: 'var(--accent-green)',
                background: 'rgba(0, 255, 136, 0.05)'
              }}
            >
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', color: 'var(--accent-green)' }}>
                    {Icons.building}
                  </div>
                  <h2 className="card-title" style={{ margin: 0, color: 'var(--accent-green)' }}>
                    Informações da Aplicação
                  </h2>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {sessionInfo.map((field, index) => (
                  <div
                    key={field.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--border-radius)'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '11px', 
                        color: 'var(--text-muted)', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '6px'
                      }}>
                        {field.label}
                      </div>
                      <div style={{ 
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '14px',
                        color: 'var(--accent-cyan)',
                        wordBreak: 'break-all'
                      }}>
                        {field.value || '-'}
                      </div>
                    </div>
                    {field.value && (
                      <button
                        type="button"
                        onClick={() => handleCopy(index)}
                        style={{
                          background: field.copied ? 'var(--accent-green)' : 'var(--bg-tertiary)',
                          border: `1px solid ${field.copied ? 'var(--accent-green)' : 'var(--border-color)'}`,
                          borderRadius: '6px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: field.copied ? 'var(--bg-primary)' : 'var(--text-secondary)',
                          fontSize: '12px',
                          fontWeight: 500,
                          transition: 'all 0.15s ease',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span style={{ width: '14px', height: '14px' }}>
                          {field.copied ? Icons.check : Icons.copy}
                        </span>
                        {field.copied ? 'Copiado!' : 'Copiar'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botões */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  Processando...
                </>
              ) : (
                <>
                  <span style={{ width: '18px', height: '18px' }}>{Icons.info}</span>
                  Obter Informações
                </>
              )}
            </button>

            {(sessionInfo || error) && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
              >
                Nova Consulta
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}

