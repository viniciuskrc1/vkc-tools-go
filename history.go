// Package main contém o sistema de histórico de execuções
package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// HistoryEntry representa uma entrada no histórico
type HistoryEntry struct {
	ID          string    `json:"id"`
	Timestamp   time.Time `json:"timestamp"`
	Type        string    `json:"type"` // "create-ami" ou "promotion-ami"
	JDKVersion  string    `json:"jdkVersion,omitempty"`
	Environment string    `json:"environment,omitempty"`
	Services    []string  `json:"services"`
	Version     string    `json:"version"`
	Succeeded   int       `json:"succeeded"`
	Failed      int       `json:"failed"`
	Total       int       `json:"total"`
}

// History representa o histórico completo
type History struct {
	Entries []HistoryEntry `json:"entries"`
}

const maxHistoryEntries = 10

var (
	historyMutex sync.RWMutex
	historyCache *History
)

// getHistoryFilePath retorna o caminho do arquivo de histórico
func getHistoryFilePath() (string, error) {
	// No Windows: %APPDATA%/vkc-tools/history.json
	// No Linux/Mac: ~/.config/vkc-tools/history.json
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", fmt.Errorf("erro ao obter diretório de configuração: %w", err)
	}

	appDir := filepath.Join(configDir, "vkc-tools")

	// Criar diretório se não existir
	if err := os.MkdirAll(appDir, 0755); err != nil {
		return "", fmt.Errorf("erro ao criar diretório: %w", err)
	}

	return filepath.Join(appDir, "history.json"), nil
}

// loadHistory carrega o histórico do arquivo
func loadHistory() (*History, error) {
	historyMutex.RLock()
	if historyCache != nil {
		defer historyMutex.RUnlock()
		return historyCache, nil
	}
	historyMutex.RUnlock()

	historyMutex.Lock()
	defer historyMutex.Unlock()

	// Double-check após adquirir lock de escrita
	if historyCache != nil {
		return historyCache, nil
	}

	filePath, err := getHistoryFilePath()
	if err != nil {
		return nil, err
	}

	history := &History{Entries: make([]HistoryEntry, 0)}

	data, err := os.ReadFile(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			// Arquivo não existe ainda, retornar histórico vazio
			historyCache = history
			return history, nil
		}
		return nil, fmt.Errorf("erro ao ler arquivo de histórico: %w", err)
	}

	if err := json.Unmarshal(data, history); err != nil {
		// Arquivo corrompido, começar do zero
		fmt.Printf("[WARN] Histórico corrompido, iniciando novo: %v\n", err)
		historyCache = &History{Entries: make([]HistoryEntry, 0)}
		return historyCache, nil
	}

	historyCache = history
	return history, nil
}

// saveHistory salva o histórico no arquivo
func saveHistory(history *History) error {
	historyMutex.Lock()
	defer historyMutex.Unlock()

	filePath, err := getHistoryFilePath()
	if err != nil {
		return err
	}

	data, err := json.MarshalIndent(history, "", "  ")
	if err != nil {
		return fmt.Errorf("erro ao serializar histórico: %w", err)
	}

	if err := os.WriteFile(filePath, data, 0644); err != nil {
		return fmt.Errorf("erro ao salvar histórico: %w", err)
	}

	historyCache = history
	return nil
}

// GetHistory retorna o histórico de execuções (chamado pelo frontend)
func (a *App) GetHistory() ([]HistoryEntry, error) {
	history, err := loadHistory()
	if err != nil {
		return nil, err
	}
	return history.Entries, nil
}

// GetHistoryByType retorna o histórico filtrado por tipo
func (a *App) GetHistoryByType(historyType string) ([]HistoryEntry, error) {
	history, err := loadHistory()
	if err != nil {
		return nil, err
	}

	filtered := make([]HistoryEntry, 0)
	for _, entry := range history.Entries {
		if entry.Type == historyType {
			filtered = append(filtered, entry)
		}
	}

	return filtered, nil
}

// AddHistoryEntry adiciona uma nova entrada ao histórico
func (a *App) AddHistoryEntry(entry HistoryEntry) error {
	history, err := loadHistory()
	if err != nil {
		return err
	}

	// Gerar ID único baseado no timestamp
	entry.ID = fmt.Sprintf("%d", time.Now().UnixNano())
	entry.Timestamp = time.Now()

	// Adicionar no início da lista (mais recente primeiro)
	newEntries := make([]HistoryEntry, 0, maxHistoryEntries)
	newEntries = append(newEntries, entry)
	newEntries = append(newEntries, history.Entries...)

	// Limitar a 10 entradas
	if len(newEntries) > maxHistoryEntries {
		newEntries = newEntries[:maxHistoryEntries]
	}

	history.Entries = newEntries

	return saveHistory(history)
}

// ClearHistory limpa todo o histórico
func (a *App) ClearHistory() error {
	history := &History{Entries: make([]HistoryEntry, 0)}
	return saveHistory(history)
}

// DeleteHistoryEntry remove uma entrada específica do histórico
func (a *App) DeleteHistoryEntry(id string) error {
	history, err := loadHistory()
	if err != nil {
		return err
	}

	newEntries := make([]HistoryEntry, 0)
	for _, entry := range history.Entries {
		if entry.ID != id {
			newEntries = append(newEntries, entry)
		}
	}

	history.Entries = newEntries
	return saveHistory(history)
}

