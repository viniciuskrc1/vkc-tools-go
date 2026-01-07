/**
 * CepSearch - Buscador de CEP
 * 
 * Busca informações de endereço por CEP usando a API ViaCEP
 * e exibe no Google Maps
 */

import { useState, useCallback } from 'react';

interface CepSearchProps {
  onToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
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

// Ícones
const Icons = {
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
};

export default function CepSearch({ onToast }: CepSearchProps) {
  const [cepInput, setCepInput] = useState<string>('');
  const [cepData, setCepData] = useState<CepResponse | null>(null);
  const [cepLoading, setCepLoading] = useState<boolean>(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [mapsUrl, setMapsUrl] = useState<string | null>(null);

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

  return (
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
  );
}

