// Package main contém as funções de autenticação Onvio
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// AuthResult representa o resultado de uma autenticação
type AuthResult struct {
	Success   bool   `json:"success"`
	Token     string `json:"token,omitempty"`
	Error     string `json:"error,omitempty"`
	ExpiresAt string `json:"expiresAt,omitempty"`
}

// SessionResponse representa a resposta do endpoint de sessão
type SessionResponse struct {
	LongToken string `json:"longToken"`
	ExpiresAt string `json:"expiresAt"`
}

// getBaseURL retorna a URL base para o ambiente selecionado
func getBaseURL(environment string, isInternal bool) string {
	// prod não tem prefixo
	if environment == "prod" {
		if isInternal {
			return "https://int.onvio.com.br"
		}
		return "https://onvio.com.br"
	}

	// Outros ambientes têm prefixo
	if isInternal {
		return fmt.Sprintf("https://%s.int.onvio.com.br", environment)
	}
	return fmt.Sprintf("https://%s.onvio.com.br", environment)
}

// AuthenticateWithCredentials autentica usando login e senha
func (a *App) AuthenticateWithCredentials(environment, username, password string) AuthResult {
	result := AuthResult{}

	// Validações
	if username == "" {
		result.Error = "Username não informado"
		return result
	}
	if password == "" {
		result.Error = "Senha não informada"
		return result
	}

	// Montar URL
	baseURL := getBaseURL(environment, false)
	url := fmt.Sprintf("%s/api/security/v2/sessions", baseURL)

	fmt.Printf("[INFO] Autenticando em: %s\n", url)

	// Montar body
	body := map[string]string{
		"username": username,
		"password": password,
	}
	jsonBody, err := json.Marshal(body)
	if err != nil {
		result.Error = fmt.Sprintf("Erro ao serializar body: %s", err.Error())
		return result
	}

	// Criar request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	if err != nil {
		result.Error = fmt.Sprintf("Erro ao criar request: %s", err.Error())
		return result
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	// Executar request com timeout
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		result.Error = fmt.Sprintf("Erro na requisição: %s", err.Error())
		return result
	}
	defer resp.Body.Close()

	// Ler response
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		result.Error = fmt.Sprintf("Erro ao ler resposta: %s", err.Error())
		return result
	}

	fmt.Printf("[DEBUG] Response status: %d\n", resp.StatusCode)
	fmt.Printf("[DEBUG] Response body: %s\n", string(respBody))

	// Verificar status
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		result.Error = fmt.Sprintf("Erro HTTP %d: %s", resp.StatusCode, string(respBody))
		return result
	}

	// Parse do response
	var sessionResp SessionResponse
	if err := json.Unmarshal(respBody, &sessionResp); err != nil {
		// Tentar parse como objeto genérico para pegar o longToken
		var genericResp map[string]interface{}
		if err := json.Unmarshal(respBody, &genericResp); err != nil {
			result.Error = fmt.Sprintf("Erro ao parsear resposta: %s", err.Error())
			return result
		}

		// Procurar longToken no objeto
		if token, ok := genericResp["longToken"].(string); ok {
			result.Token = token
			result.Success = true
		} else if token, ok := genericResp["LongToken"].(string); ok {
			result.Token = token
			result.Success = true
		} else {
			result.Error = "Campo longToken não encontrado na resposta"
			return result
		}
	} else {
		result.Token = sessionResp.LongToken
		result.ExpiresAt = sessionResp.ExpiresAt
		result.Success = true
	}

	fmt.Printf("[SUCCESS] Token obtido com sucesso (tamanho: %d)\n", len(result.Token))
	return result
}

// AuthenticateWithCompanyID autentica usando CompanyID
func (a *App) AuthenticateWithCompanyID(environment, companyID string) AuthResult {
	result := AuthResult{}

	// Validações
	if companyID == "" {
		result.Error = "CompanyID não informado"
		return result
	}

	// Remover espaços e validar formato básico
	companyID = strings.TrimSpace(companyID)

	// Montar URL (usa int.onvio.com.br)
	baseURL := getBaseURL(environment, true)
	url := fmt.Sprintf("%s/api/internalcompanymapping/v1/sessions/session/%s", baseURL, companyID)

	fmt.Printf("[INFO] Obtendo token por CompanyID em: %s\n", url)

	// Criar request POST
	req, err := http.NewRequest("POST", url, nil)
	if err != nil {
		result.Error = fmt.Sprintf("Erro ao criar request: %s", err.Error())
		return result
	}

	req.Header.Set("Accept", "*/*")
	req.Header.Set("Content-Type", "application/json")

	// Executar request com timeout
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		result.Error = fmt.Sprintf("Erro na requisição: %s", err.Error())
		return result
	}
	defer resp.Body.Close()

	// Ler response
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		result.Error = fmt.Sprintf("Erro ao ler resposta: %s", err.Error())
		return result
	}

	fmt.Printf("[DEBUG] Response status: %d\n", resp.StatusCode)
	fmt.Printf("[DEBUG] Response body (primeiros 100 chars): %.100s\n", string(respBody))

	// Verificar status
	if resp.StatusCode != http.StatusOK {
		result.Error = fmt.Sprintf("Erro HTTP %d: %s", resp.StatusCode, string(respBody))
		return result
	}

	// O response é uma string direta (não JSON)
	token := strings.TrimSpace(string(respBody))
	
	// Remover aspas se vieram
	token = strings.Trim(token, "\"")

	if token == "" {
		result.Error = "Token vazio na resposta"
		return result
	}

	result.Token = token
	result.Success = true

	fmt.Printf("[SUCCESS] Token obtido com sucesso (tamanho: %d)\n", len(result.Token))
	return result
}

// SessionInfo representa as informações da sessão/aplicação
type SessionInfo struct {
	Success        bool   `json:"success"`
	Error          string `json:"error,omitempty"`
	CompanyID      string `json:"companyId,omitempty"`
	ContactID      string `json:"contactId,omitempty"`
	ContabilFirmID string `json:"contabilFirmId,omitempty"`
}

// GetSessionInfo obtém as informações da sessão usando o token
func (a *App) GetSessionInfo(environment, longToken string) SessionInfo {
	result := SessionInfo{}

	if longToken == "" {
		result.Error = "Token não informado"
		return result
	}

	// Montar URL
	baseURL := getBaseURL(environment, false)
	url := fmt.Sprintf("%s/api/security/v1/session-bindings", baseURL)

	fmt.Printf("[INFO] Buscando session-bindings em: %s\n", url)

	// Criar request GET
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		result.Error = fmt.Sprintf("Erro ao criar request: %s", err.Error())
		return result
	}

	// Header de autorização
	req.Header.Set("Authorization", fmt.Sprintf("UDSLongToken %s", longToken))
	req.Header.Set("Accept", "application/json")

	// Executar request com timeout
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		result.Error = fmt.Sprintf("Erro na requisição: %s", err.Error())
		return result
	}
	defer resp.Body.Close()

	// Ler response
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		result.Error = fmt.Sprintf("Erro ao ler resposta: %s", err.Error())
		return result
	}

	fmt.Printf("[DEBUG] Response status: %d\n", resp.StatusCode)

	// Verificar status
	if resp.StatusCode != http.StatusOK {
		result.Error = fmt.Sprintf("Erro HTTP %d: %s", resp.StatusCode, string(respBody))
		return result
	}

	// Parse do response
	var sessionBindings map[string]interface{}
	if err := json.Unmarshal(respBody, &sessionBindings); err != nil {
		result.Error = fmt.Sprintf("Erro ao parsear resposta: %s", err.Error())
		return result
	}

	// Extrair ApplicationConfiguration
	if appConfig, ok := sessionBindings["ApplicationConfiguration"].(map[string]interface{}); ok {
		if companyID, ok := appConfig["CompanyId"].(string); ok {
			result.CompanyID = companyID
		}
		if contactID, ok := appConfig["ContactId"].(string); ok {
			result.ContactID = contactID
		}
		if contabilFirmID, ok := appConfig["ContabilFirmId"].(string); ok {
			result.ContabilFirmID = contabilFirmID
		}
	} else {
		result.Error = "ApplicationConfiguration não encontrado na resposta"
		return result
	}

	result.Success = true
	fmt.Printf("[SUCCESS] Informações da sessão obtidas: CompanyID=%s, ContactID=%s, ContabilFirmID=%s\n",
		result.CompanyID, result.ContactID, result.ContabilFirmID)

	return result
}

