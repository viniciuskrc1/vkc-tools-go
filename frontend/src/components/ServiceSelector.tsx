/**
 * ServiceSelector - Componente de seleção de serviços
 * 
 * Suporta dois modos:
 * - Multi-select: para Create AMI (múltiplas seleções)
 * - Single-select: para Promotion AMI (única seleção)
 * 
 * Inclui busca/filtro em tempo real para os 287 serviços.
 */

import { useState, useMemo, useCallback } from 'react';
import { SERVICES } from '../data/services';

// Ícone de check
const CheckIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface ServiceSelectorProps {
  mode: 'single' | 'multi';
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function ServiceSelector({ mode, selected, onChange }: ServiceSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar serviços baseado na busca (memoizado para performance)
  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return SERVICES;
    const term = searchTerm.toLowerCase();
    return SERVICES.filter((service) => service.includes(term));
  }, [searchTerm]);

  // Handler para toggle de seleção
  const handleToggle = useCallback((service: string) => {
    if (mode === 'single') {
      // Single select: apenas um item pode estar selecionado
      onChange(selected.includes(service) ? [] : [service]);
    } else {
      // Multi select: toggle no item
      if (selected.includes(service)) {
        onChange(selected.filter((s) => s !== service));
      } else {
        onChange([...selected, service]);
      }
    }
  }, [mode, selected, onChange]);

  // Limpar seleção
  const handleClear = useCallback(() => {
    onChange([]);
    setSearchTerm('');
  }, [onChange]);

  // Texto do contador
  const countText = mode === 'multi' 
    ? `${selected.length} selecionado${selected.length !== 1 ? 's' : ''}`
    : selected.length === 1 ? '1 selecionado' : 'Nenhum selecionado';

  return (
    <div className={`service-selector ${mode}`}>
      <div className="service-selector-header">
        <input
          type="text"
          className="service-search"
          placeholder="Buscar serviço..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="service-count">{countText}</span>
        {selected.length > 0 && (
          <button type="button" className="service-clear-btn" onClick={handleClear}>
            Limpar
          </button>
        )}
      </div>
      
      <div className="service-list">
        {filteredServices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-text">
              Nenhum serviço encontrado para "{searchTerm}"
            </div>
          </div>
        ) : (
          filteredServices.map((service) => {
            const isSelected = selected.includes(service);
            return (
              <div
                key={service}
                className={`service-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleToggle(service)}
                role="option"
                aria-selected={isSelected}
              >
                <div className="service-checkbox">
                  {CheckIcon}
                </div>
                <span className="service-name">{service}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

