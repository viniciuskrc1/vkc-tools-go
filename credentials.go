// Package main contém o sistema de gerenciamento de credenciais
package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// SavedLogin representa um login salvo
type SavedLogin struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Username  string `json:"username"`
	Password  string `json:"password"` // Base64 encoded
	CreatedAt string `json:"createdAt"`
	LastUsed  string `json:"lastUsed,omitempty"`
}

// SavedCompanyID representa um CompanyID salvo
type SavedCompanyID struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	CompanyID string `json:"companyId"`
	CreatedAt string `json:"createdAt"`
	LastUsed  string `json:"lastUsed,omitempty"`
}

// EnvironmentCredentials representa as credenciais de um ambiente
type EnvironmentCredentials struct {
	Logins     []SavedLogin     `json:"logins"`
	CompanyIDs []SavedCompanyID `json:"companyIds"`
}

// CredentialsStore representa o armazenamento completo de credenciais
type CredentialsStore struct {
	Environments map[string]*EnvironmentCredentials `json:"environments"`
}

var (
	credentialsMutex sync.RWMutex
	credentialsCache *CredentialsStore
)

// getCredentialsFilePath retorna o caminho do arquivo de credenciais
func getCredentialsFilePath() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", fmt.Errorf("erro ao obter diretório de configuração: %w", err)
	}

	appDir := filepath.Join(configDir, "vkc-tools")
	if err := os.MkdirAll(appDir, 0755); err != nil {
		return "", fmt.Errorf("erro ao criar diretório: %w", err)
	}

	return filepath.Join(appDir, "credentials.json"), nil
}

// loadCredentials carrega as credenciais do arquivo
func loadCredentials() (*CredentialsStore, error) {
	credentialsMutex.RLock()
	if credentialsCache != nil {
		defer credentialsMutex.RUnlock()
		return credentialsCache, nil
	}
	credentialsMutex.RUnlock()

	credentialsMutex.Lock()
	defer credentialsMutex.Unlock()

	if credentialsCache != nil {
		return credentialsCache, nil
	}

	filePath, err := getCredentialsFilePath()
	if err != nil {
		return nil, err
	}

	store := &CredentialsStore{
		Environments: make(map[string]*EnvironmentCredentials),
	}

	data, err := os.ReadFile(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			credentialsCache = store
			return store, nil
		}
		return nil, fmt.Errorf("erro ao ler arquivo: %w", err)
	}

	if err := json.Unmarshal(data, store); err != nil {
		fmt.Printf("[WARN] Credenciais corrompidas, iniciando novo: %v\n", err)
		credentialsCache = &CredentialsStore{Environments: make(map[string]*EnvironmentCredentials)}
		return credentialsCache, nil
	}

	credentialsCache = store
	return store, nil
}

// saveCredentials salva as credenciais no arquivo
func saveCredentials(store *CredentialsStore) error {
	credentialsMutex.Lock()
	defer credentialsMutex.Unlock()

	filePath, err := getCredentialsFilePath()
	if err != nil {
		return err
	}

	data, err := json.MarshalIndent(store, "", "  ")
	if err != nil {
		return fmt.Errorf("erro ao serializar: %w", err)
	}

	if err := os.WriteFile(filePath, data, 0600); err != nil { // 0600 = apenas owner pode ler/escrever
		return fmt.Errorf("erro ao salvar: %w", err)
	}

	credentialsCache = store
	return nil
}

// ensureEnvironment garante que o ambiente existe no store
func ensureEnvironment(store *CredentialsStore, env string) {
	if store.Environments == nil {
		store.Environments = make(map[string]*EnvironmentCredentials)
	}
	if store.Environments[env] == nil {
		store.Environments[env] = &EnvironmentCredentials{
			Logins:     make([]SavedLogin, 0),
			CompanyIDs: make([]SavedCompanyID, 0),
		}
	}
}

// encodePassword codifica a senha em base64
func encodePassword(password string) string {
	return base64.StdEncoding.EncodeToString([]byte(password))
}

// decodePassword decodifica a senha de base64
func decodePassword(encoded string) string {
	decoded, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		return encoded // Retorna original se falhar
	}
	return string(decoded)
}

// GetSavedLogins retorna os logins salvos para um ambiente
func (a *App) GetSavedLogins(environment string) ([]SavedLogin, error) {
	store, err := loadCredentials()
	if err != nil {
		return nil, err
	}

	if store.Environments[environment] == nil {
		return []SavedLogin{}, nil
	}

	// Retornar com senhas decodificadas
	logins := make([]SavedLogin, len(store.Environments[environment].Logins))
	for i, login := range store.Environments[environment].Logins {
		logins[i] = login
		logins[i].Password = decodePassword(login.Password)
	}

	return logins, nil
}

// GetSavedCompanyIDs retorna os CompanyIDs salvos para um ambiente
func (a *App) GetSavedCompanyIDs(environment string) ([]SavedCompanyID, error) {
	store, err := loadCredentials()
	if err != nil {
		return nil, err
	}

	if store.Environments[environment] == nil {
		return []SavedCompanyID{}, nil
	}

	return store.Environments[environment].CompanyIDs, nil
}

// SaveLogin salva um novo login ou atualiza existente
func (a *App) SaveLogin(environment string, name, username, password string) error {
	store, err := loadCredentials()
	if err != nil {
		return err
	}

	ensureEnvironment(store, environment)

	// Verificar se já existe um login com mesmo username
	for i, login := range store.Environments[environment].Logins {
		if login.Username == username {
			// Atualizar existente
			store.Environments[environment].Logins[i].Name = name
			store.Environments[environment].Logins[i].Password = encodePassword(password)
			store.Environments[environment].Logins[i].LastUsed = time.Now().Format(time.RFC3339)
			return saveCredentials(store)
		}
	}

	// Criar novo
	newLogin := SavedLogin{
		ID:        fmt.Sprintf("login-%d", time.Now().UnixNano()),
		Name:      name,
		Username:  username,
		Password:  encodePassword(password),
		CreatedAt: time.Now().Format(time.RFC3339),
	}

	store.Environments[environment].Logins = append(store.Environments[environment].Logins, newLogin)
	return saveCredentials(store)
}

// SaveCompanyID salva um novo CompanyID ou atualiza existente
func (a *App) SaveCompanyID(environment string, name, companyID string) error {
	store, err := loadCredentials()
	if err != nil {
		return err
	}

	ensureEnvironment(store, environment)

	// Verificar se já existe
	for i, cid := range store.Environments[environment].CompanyIDs {
		if cid.CompanyID == companyID {
			// Atualizar existente
			store.Environments[environment].CompanyIDs[i].Name = name
			store.Environments[environment].CompanyIDs[i].LastUsed = time.Now().Format(time.RFC3339)
			return saveCredentials(store)
		}
	}

	// Criar novo
	newCompanyID := SavedCompanyID{
		ID:        fmt.Sprintf("company-%d", time.Now().UnixNano()),
		Name:      name,
		CompanyID: companyID,
		CreatedAt: time.Now().Format(time.RFC3339),
	}

	store.Environments[environment].CompanyIDs = append(store.Environments[environment].CompanyIDs, newCompanyID)
	return saveCredentials(store)
}

// DeleteLogin remove um login salvo
func (a *App) DeleteLogin(environment, loginID string) error {
	store, err := loadCredentials()
	if err != nil {
		return err
	}

	if store.Environments[environment] == nil {
		return nil
	}

	newLogins := make([]SavedLogin, 0)
	for _, login := range store.Environments[environment].Logins {
		if login.ID != loginID {
			newLogins = append(newLogins, login)
		}
	}

	store.Environments[environment].Logins = newLogins
	return saveCredentials(store)
}

// DeleteCompanyID remove um CompanyID salvo
func (a *App) DeleteCompanyID(environment, companyIDRecordID string) error {
	store, err := loadCredentials()
	if err != nil {
		return err
	}

	if store.Environments[environment] == nil {
		return nil
	}

	newCompanyIDs := make([]SavedCompanyID, 0)
	for _, cid := range store.Environments[environment].CompanyIDs {
		if cid.ID != companyIDRecordID {
			newCompanyIDs = append(newCompanyIDs, cid)
		}
	}

	store.Environments[environment].CompanyIDs = newCompanyIDs
	return saveCredentials(store)
}

// UpdateLoginLastUsed atualiza a data de último uso de um login
func (a *App) UpdateLoginLastUsed(environment, loginID string) error {
	store, err := loadCredentials()
	if err != nil {
		return err
	}

	if store.Environments[environment] == nil {
		return nil
	}

	for i, login := range store.Environments[environment].Logins {
		if login.ID == loginID {
			store.Environments[environment].Logins[i].LastUsed = time.Now().Format(time.RFC3339)
			return saveCredentials(store)
		}
	}

	return nil
}

// UpdateCompanyIDLastUsed atualiza a data de último uso de um CompanyID
func (a *App) UpdateCompanyIDLastUsed(environment, companyIDRecordID string) error {
	store, err := loadCredentials()
	if err != nil {
		return err
	}

	if store.Environments[environment] == nil {
		return nil
	}

	for i, cid := range store.Environments[environment].CompanyIDs {
		if cid.ID == companyIDRecordID {
			store.Environments[environment].CompanyIDs[i].LastUsed = time.Now().Format(time.RFC3339)
			return saveCredentials(store)
		}
	}

	return nil
}

