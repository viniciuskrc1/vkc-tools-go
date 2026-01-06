/**
 * AuthOnvio - Tela de autenticação Onvio
 * 
 * Permite gerar LongToken usando:
 * - Login e Senha (com credenciais salvas)
 * - CompanyID (com CompanyIDs salvos)
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  AuthenticateWithCredentials, 
  AuthenticateWithCompanyID,
  GetSavedLogins,
  GetSavedCompanyIDs,
  SaveLogin,
  SaveCompanyID,
  DeleteLogin,
  DeleteCompanyID,
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
  save: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  key: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
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

interface AuthOnvioProps {
  onToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

export default function AuthOnvio({ onToast }: AuthOnvioProps) {
  // Estado do formulário
  const [environment, setEnvironment] = useState('lab01');
  const [authType, setAuthType] = useState<AuthType>('credentials');
  
  // Campos de login/senha
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginName, setLoginName] = useState('');
  
  // Campo de CompanyID
  const [companyId, setCompanyId] = useState('');
  const [companyIdName, setCompanyIdName] = useState('');
  
  // Credenciais salvas
  const [savedLogins, setSavedLogins] = useState<SavedLogin[]>([]);
  const [savedCompanyIds, setSavedCompanyIds] = useState<SavedCompanyID[]>([]);
  const [selectedLoginId, setSelectedLoginId] = useState<string | null>(null);
  const [selectedCompanyIdRecord, setSelectedCompanyIdRecord] = useState<string | null>(null);
  
  // Estado de execução
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; token?: string; error?: string } | null>(null);
  
  // Modal de salvar credencial
  const [showSaveModal, setShowSaveModal] = useState(false);

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
    setLoginName(login.name);
  }, []);

  // Selecionar um CompanyID salvo
  const handleSelectCompanyId = useCallback((record: SavedCompanyID) => {
    setSelectedCompanyIdRecord(record.id);
    setCompanyId(record.companyId);
    setCompanyIdName(record.name);
  }, []);

  // Limpar seleção
  const handleClearSelection = useCallback(() => {
    if (authType === 'credentials') {
      setSelectedLoginId(null);
      setUsername('');
      setPassword('');
      setLoginName('');
    } else {
      setSelectedCompanyIdRecord(null);
      setCompanyId('');
      setCompanyIdName('');
    }
  }, [authType]);

  // Validação do formulário
  const isFormValid = authType === 'credentials' 
    ? username.trim() !== '' && password.trim() !== ''
    : companyId.trim() !== '';

  // Salvar credencial atual
  const handleSaveCredential = useCallback(async () => {
    if (!isFormValid) return;
    
    setIsSaving(true);
    try {
      if (authType === 'credentials') {
        const name = loginName.trim() || username;
        await SaveLogin(environment, name, username, password);
        onToast('success', 'Login salvo!', `Credencial "${name}" salva para ${environment}`);
      } else {
        const name = companyIdName.trim() || companyId.substring(0, 8) + '...';
        await SaveCompanyID(environment, name, companyId);
        onToast('success', 'CompanyID salvo!', `CompanyID "${name}" salvo para ${environment}`);
      }
      await loadSavedCredentials();
      setShowSaveModal(false);
    } catch (error) {
      onToast('error', 'Erro ao salvar', String(error));
    } finally {
      setIsSaving(false);
    }
  }, [authType, environment, username, password, loginName, companyId, companyIdName, isFormValid, onToast]);

  // Deletar credencial
  const handleDeleteCredential = useCallback(async (id: string, type: 'login' | 'companyId') => {
    try {
      if (type === 'login') {
        await DeleteLogin(environment, id);
        if (selectedLoginId === id) handleClearSelection();
      } else {
        await DeleteCompanyID(environment, id);
        if (selectedCompanyIdRecord === id) handleClearSelection();
      }
      await loadSavedCredentials();
      onToast('info', 'Removido', 'Credencial removida');
    } catch (error) {
      onToast('error', 'Erro ao remover', String(error));
    }
  }, [environment, selectedLoginId, selectedCompanyIdRecord, handleClearSelection, onToast]);

  // Handler para submissão
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setResult(null);

    try {
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

      setResult({
        success: authResult.success,
        token: authResult.token,
        error: authResult.error
      });

      if (authResult.success) {
        onToast('success', 'Token gerado!', 'LongToken obtido com sucesso');
      } else {
        onToast('error', 'Erro na autenticação', authResult.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao autenticar:', error);
      setResult({ success: false, error: String(error) });
      onToast('error', 'Erro', 'Falha ao gerar token');
    } finally {
      setIsLoading(false);
    }
  }, [authType, environment, username, password, companyId, selectedLoginId, selectedCompanyIdRecord, isFormValid, onToast]);

  // Copiar token
  const handleCopyToken = useCallback(() => {
    if (result?.token) {
      navigator.clipboard.writeText(result.token);
      onToast('success', 'Copiado!', 'Token copiado para a área de transferência');
    }
  }, [result, onToast]);

  // Limpar resultado
  const handleReset = useCallback(() => {
    setResult(null);
  }, []);

  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Autenticação Onvio - Gerar LongToken</h1>
        <p className="page-subtitle">
          Gera um LongToken para autenticação nos serviços Onvio
        </p>
      </header>

      <div className="page-body">
        <form onSubmit={handleSubmit}>
          {/* Card de Configuração */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Configuração</h2>
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
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteCredential(login.id, 'login'); }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          opacity: 0.5,
                          transition: 'opacity 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                        title="Remover"
                      >
                        <span style={{ width: '16px', height: '16px', display: 'block' }}>{Icons.trash}</span>
                      </button>
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
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteCredential(record.id, 'companyId'); }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          opacity: 0.5,
                          transition: 'opacity 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                        title="Remover"
                      >
                        <span style={{ width: '16px', height: '16px', display: 'block' }}>{Icons.trash}</span>
                      </button>
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
                {isFormValid && (
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(true)}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ width: '14px', height: '14px' }}>{Icons.save}</span>
                    Salvar
                  </button>
                )}
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

              <div style={{ 
                marginTop: '12px', 
                padding: '12px', 
                background: 'var(--bg-tertiary)', 
                borderRadius: 'var(--border-radius)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                <strong>Endpoint:</strong><br />
                POST {environment === 'prod' ? 'https://onvio.com.br' : `https://${environment}.onvio.com.br`}/api/security/v2/sessions
              </div>
            </div>
          )}

          {/* Card de Input - CompanyID */}
          {authType === 'companyId' && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">CompanyID</h2>
                {isFormValid && (
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(true)}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{ width: '14px', height: '14px' }}>{Icons.save}</span>
                    Salvar
                  </button>
                )}
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

              <div style={{ 
                marginTop: '12px', 
                padding: '12px', 
                background: 'var(--bg-tertiary)', 
                borderRadius: 'var(--border-radius)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                <strong>Endpoint:</strong><br />
                POST {environment === 'prod' ? 'https://int.onvio.com.br' : `https://${environment}.int.onvio.com.br`}/api/internalcompanymapping/v1/sessions/session/{'{companyId}'}
              </div>
            </div>
          )}

          {/* Resultado */}
          {result && (
            <div 
              className="card" 
              style={{ 
                borderColor: result.success ? 'var(--accent-green)' : 'var(--accent-red)',
                background: result.success 
                  ? 'rgba(0, 255, 136, 0.05)' 
                  : 'rgba(255, 68, 68, 0.05)'
              }}
            >
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px',
                    color: result.success ? 'var(--accent-green)' : 'var(--accent-red)'
                  }}>
                    {result.success ? Icons.check : Icons.x}
                  </div>
                  <h2 className="card-title" style={{ 
                    margin: 0,
                    color: result.success ? 'var(--accent-green)' : 'var(--accent-red)'
                  }}>
                    {result.success ? 'Token Gerado com Sucesso!' : 'Erro na Autenticação'}
                  </h2>
                </div>
                {result.success && (
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '12px' }}
                  >
                    <span style={{ width: '14px', height: '14px' }}>{Icons.copy}</span>
                    Copiar Token
                  </button>
                )}
              </div>

              {result.success && result.token ? (
                <div style={{ marginTop: '16px' }}>
                  <label className="form-label">LongToken</label>
                  <div style={{
                    padding: '16px',
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    color: 'var(--accent-cyan)',
                    wordBreak: 'break-all',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    lineHeight: 1.6
                  }}>
                    {result.token}
                  </div>
                  <div style={{ 
                    marginTop: '8px', 
                    fontSize: '12px', 
                    color: 'var(--text-muted)' 
                  }}>
                    Tamanho: {result.token.length} caracteres
                  </div>
                </div>
              ) : result.error && (
                <div style={{ 
                  marginTop: '16px',
                  padding: '12px',
                  background: 'rgba(255, 68, 68, 0.1)',
                  borderRadius: 'var(--border-radius)',
                  color: 'var(--accent-red)',
                  fontSize: '13px'
                }}>
                  {result.error}
                </div>
              )}
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
                  Gerando Token...
                </>
              ) : (
                <>
                  <span style={{ width: '18px', height: '18px' }}>{Icons.key}</span>
                  Gerar LongToken
                </>
              )}
            </button>

            {result && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
              >
                Nova Autenticação
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Modal de Salvar Credencial */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon warning" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>
                {Icons.save}
              </div>
              <h2 className="modal-title">Salvar Credencial</h2>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nome (opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={authType === 'credentials' ? 'Ex: Meu Login de Teste' : 'Ex: Empresa XYZ'}
                  value={authType === 'credentials' ? loginName : companyIdName}
                  onChange={(e) => authType === 'credentials' ? setLoginName(e.target.value) : setCompanyIdName(e.target.value)}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Se não informar, será usado o {authType === 'credentials' ? 'username' : 'CompanyID'} como nome
                </div>
              </div>

              <div style={{ 
                marginTop: '16px',
                padding: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--border-radius)',
                fontSize: '12px'
              }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Será salvo para:</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ 
                    background: 'var(--accent-cyan)', 
                    color: 'var(--bg-primary)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 500
                  }}>
                    {environment}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {authType === 'credentials' ? username : companyId}
                  </span>
                </div>
              </div>

              <div style={{ 
                marginTop: '12px',
                padding: '10px',
                background: 'rgba(255, 149, 0, 0.1)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid rgba(255, 149, 0, 0.3)',
                fontSize: '11px',
                color: 'var(--accent-orange)'
              }}>
                ⚠️ As credenciais são salvas localmente no seu computador.
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowSaveModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveCredential}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="spinner" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <span style={{ width: '16px', height: '16px' }}>{Icons.save}</span>
                    Salvar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
