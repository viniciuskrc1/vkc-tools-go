/**
 * SumValues - Somar Valores
 *
 * Recebe uma lista de valores (um por linha), soma e exibe o resultado.
 */

import { useState, useCallback, useMemo } from 'react';

interface SumValuesProps {
  onToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
}

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
  clear: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  sum: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
};

function parseLine(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const normalized = trimmed.replace(',', '.');
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

export default function SumValues({ onToast }: SumValuesProps) {
  const [input, setInput] = useState<string>('');

  const { sum, count, invalidLines } = useMemo(() => {
    const lines = input.split(/\r?\n/);
    let total = 0;
    let validCount = 0;
    const invalid: number[] = [];

    lines.forEach((line, index) => {
      const parsed = parseLine(line);
      if (parsed !== null) {
        total += parsed;
        validCount += 1;
      } else if (line.trim() !== '') {
        invalid.push(index + 1);
      }
    });

    return { sum: total, count: validCount, invalidLines: invalid };
  }, [input]);

  const handleCopy = useCallback(() => {
    const text = String(sum);
    navigator.clipboard.writeText(text).then(
      () => {
        onToast('success', 'Copiado!', 'Resultado copiado para a área de transferência');
      },
      () => onToast('error', 'Erro', 'Falha ao copiar')
    );
  }, [sum, onToast]);

  const handleClear = useCallback(() => {
    setInput('');
    onToast('info', 'Limpo', 'Campo limpo');
  }, [onToast]);

  const resultText = count === 0 && input.trim() === ''
    ? '—'
    : count === 0
      ? 'Nenhum valor válido'
      : String(sum);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Somar Valores</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Um valor por linha. Aceita vírgula ou ponto como decimal.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="form-label">Valores (um por linha)</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="10&#10;20.5&#10;30,25&#10;..."
            rows={12}
            style={{
              width: '100%',
              padding: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              color: 'var(--text-primary)',
              resize: 'vertical',
              minHeight: '120px',
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
        </div>

        <div style={{
          padding: '16px',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ width: '20px', height: '20px', color: 'var(--accent-cyan)' }}>
              {Icons.sum}
            </span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Resultado</span>
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '24px',
            color: count > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)',
            marginBottom: '8px',
          }}>
            {resultText}
          </div>
          {count > 0 && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {count} valor(es) somado(s).
            </div>
          )}
          {invalidLines.length > 0 && (
            <div style={{ fontSize: '12px', color: 'var(--accent-orange, #f59e0b)', marginTop: '4px' }}>
              Linhas ignoradas (não numéricas): {invalidLines.slice(0, 10).join(', ')}
              {invalidLines.length > 10 ? ` ... +${invalidLines.length - 10}` : ''}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-success"
            disabled={count === 0}
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ width: '18px', height: '18px' }}>{Icons.copy}</span>
            Copiar resultado
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClear}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ width: '18px', height: '18px' }}>{Icons.clear}</span>
            Limpar
          </button>
        </div>
      </div>
    </div>
  );
}
