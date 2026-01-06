// Package main contém a estrutura principal da aplicação VKC Tools
package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
)

// App representa a estrutura principal da aplicação
type App struct {
	ctx    context.Context
	ghPath string // Caminho completo do GitHub CLI
}

// NewApp cria uma nova instância da aplicação
func NewApp() *App {
	return &App{}
}

// startup é chamado quando a aplicação inicia
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	// Tentar encontrar o gh na inicialização
	a.ghPath = findGitHubCLI()
	fmt.Printf("[INFO] GitHub CLI path: %s\n", a.ghPath)
}

// Lista de caminhos permitidos para o GitHub CLI (hardcoded por segurança)
var allowedGHPaths = []string{
	"gh",
	"gh.exe",
}

// findGitHubCLI procura o executável do GitHub CLI em locais seguros
func findGitHubCLI() string {
	// Primeiro, tentar o LookPath padrão (usa PATH do sistema)
	if path, err := exec.LookPath("gh"); err == nil {
		return path
	}

	// No Windows, verificar locais conhecidos e seguros
	if runtime.GOOS == "windows" {
		// Lista fixa de caminhos conhecidos e confiáveis (sem busca dinâmica)
		programFiles := os.Getenv("ProgramFiles")
		programFilesX86 := os.Getenv("ProgramFiles(x86)")
		localAppData := os.Getenv("LOCALAPPDATA")

		knownPaths := []string{
			filepath.Join(programFiles, "GitHub CLI", "gh.exe"),
			filepath.Join(programFilesX86, "GitHub CLI", "gh.exe"),
			filepath.Join(localAppData, "Programs", "GitHub CLI", "gh.exe"),
		}

		for _, p := range knownPaths {
			// Verificar se o caminho é absoluto e existe
			if filepath.IsAbs(p) {
				if info, err := os.Stat(p); err == nil && !info.IsDir() {
					// Validar que é um executável verificando a extensão
					if strings.ToLower(filepath.Ext(p)) == ".exe" {
						return p
					}
				}
			}
		}
	}

	return "gh" // Fallback para o nome simples (depende do PATH)
}

// WorkflowResult representa o resultado de um disparo de workflow
type WorkflowResult struct {
	Service string `json:"service"`
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// BatchResult representa o resultado de múltiplos disparos
type BatchResult struct {
	Total     int              `json:"total"`
	Succeeded int              `json:"succeeded"`
	Failed    int              `json:"failed"`
	Results   []WorkflowResult `json:"results"`
}

// GHStatus representa o status do GitHub CLI
type GHStatus struct {
	Installed     bool   `json:"installed"`
	Authenticated bool   `json:"authenticated"`
	User          string `json:"user,omitempty"`
	Error         string `json:"error,omitempty"`
}

// CheckGitHubCLI verifica se o GitHub CLI está instalado e autenticado
func (a *App) CheckGitHubCLI() GHStatus {
	status := GHStatus{}

	// Atualizar caminho do gh se necessário
	if a.ghPath == "" || a.ghPath == "gh" {
		a.ghPath = findGitHubCLI()
	}

	// Verificar se gh está instalado
	if a.ghPath == "gh" {
		// Tentar executar mesmo assim para ver se está no PATH
		cmd := exec.Command("gh", "--version")
		if err := cmd.Run(); err != nil {
			status.Error = "GitHub CLI (gh) não encontrado. Por favor, instale em: https://cli.github.com/"
			fmt.Printf("[ERROR] GitHub CLI não encontrado\n")
			return status
		}
	}

	status.Installed = true
	fmt.Printf("[INFO] GitHub CLI encontrado em: %s\n", a.ghPath)

	// Verificar autenticação
	cmd := exec.Command(a.ghPath, "auth", "status")
	output, err := cmd.CombinedOutput()
	outputStr := string(output)

	fmt.Printf("[DEBUG] gh auth status output: %s\n", outputStr)

	if err != nil {
		status.Error = fmt.Sprintf("GitHub CLI não está autenticado. Execute: gh auth login (Erro: %s)", outputStr)
		fmt.Printf("[WARN] GitHub CLI não autenticado: %s\n", outputStr)
		return status
	}

	status.Authenticated = true

	// Extrair nome do usuário da saída
	// Formato pode ser: "Logged in to github.com account username (keyring)"
	// ou "✓ Logged in to github.com account username"
	lines := strings.Split(outputStr, "\n")
	for _, line := range lines {
		lineLower := strings.ToLower(line)
		
		// Tentar vários padrões
		if strings.Contains(lineLower, "logged in to") && strings.Contains(lineLower, "account") {
			// Formato: "Logged in to github.com account USERNAME"
			parts := strings.Split(line, "account ")
			if len(parts) > 1 {
				// Pegar a primeira palavra após "account"
				userPart := strings.TrimSpace(parts[1])
				userPart = strings.Split(userPart, " ")[0]
				userPart = strings.Split(userPart, "(")[0] // Remover "(keyring)" se existir
				status.User = strings.TrimSpace(userPart)
				break
			}
		} else if strings.Contains(lineLower, " as ") {
			// Formato antigo: "Logged in to github.com as USERNAME"
			parts := strings.Split(line, " as ")
			if len(parts) > 1 {
				status.User = strings.TrimSpace(strings.Split(parts[1], " ")[0])
				break
			}
		}
	}

	// Se ainda não encontrou, tentar pegar via gh api
	if status.User == "" {
		cmd := exec.Command(a.ghPath, "api", "user", "--jq", ".login")
		if userOutput, err := cmd.Output(); err == nil {
			status.User = strings.TrimSpace(string(userOutput))
		}
	}

	fmt.Printf("[INFO] GitHub CLI autenticado como: %s\n", status.User)
	return status
}

// TriggerCreateAMI dispara o workflow "OnvioBR - Create AMI" para um único serviço
func (a *App) TriggerCreateAMI(jdkVersion, service, version string) WorkflowResult {
	result := WorkflowResult{
		Service: service,
	}

	// Validação de campos
	if service == "" {
		result.Error = "Serviço não informado"
		return result
	}
	if version == "" {
		result.Error = "Versão não informada"
		return result
	}

	// Montar comando gh
	args := []string{
		"workflow", "run", "OnvioBR - Create AMI",
		"--repo", "tr/onviobr-automacao",
		"-f", "app=onviobr",
		"-f", fmt.Sprintf("jdk_version=%s", jdkVersion),
		"-f", fmt.Sprintf("service=%s", service),
		"-f", fmt.Sprintf("version=%s", version),
	}

	fmt.Printf("[INFO] Executando: %s %s\n", a.ghPath, strings.Join(args, " "))

	cmd := exec.Command(a.ghPath, args...)
	output, err := cmd.CombinedOutput()

	if err != nil {
		result.Error = fmt.Sprintf("Erro ao executar workflow: %s - %s", err.Error(), string(output))
		fmt.Printf("[ERROR] %s\n", result.Error)
		return result
	}

	result.Success = true
	result.Message = fmt.Sprintf("Workflow disparado com sucesso para %s", service)
	fmt.Printf("[SUCCESS] %s\n", result.Message)

	return result
}

// TriggerCreateAMIBatch dispara o workflow para múltiplos serviços em paralelo
func (a *App) TriggerCreateAMIBatch(jdkVersion string, services []string, version string) BatchResult {
	result := BatchResult{
		Total:   len(services),
		Results: make([]WorkflowResult, 0, len(services)),
	}

	if len(services) == 0 {
		return result
	}

	// Limitar concorrência para não sobrecarregar a API do GitHub
	maxConcurrency := 3
	if runtime.NumCPU() > 3 {
		maxConcurrency = runtime.NumCPU()
	}

	// Canal para controlar concorrência
	semaphore := make(chan struct{}, maxConcurrency)
	var wg sync.WaitGroup
	var mu sync.Mutex

	for _, service := range services {
		wg.Add(1)
		go func(svc string) {
			defer wg.Done()

			// Adquirir slot de concorrência
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			// Disparar workflow
			res := a.TriggerCreateAMI(jdkVersion, svc, version)

			// Adicionar resultado de forma thread-safe
			mu.Lock()
			result.Results = append(result.Results, res)
			if res.Success {
				result.Succeeded++
			} else {
				result.Failed++
			}
			mu.Unlock()
		}(service)
	}

	wg.Wait()

	return result
}

// TriggerPromotionAMI dispara o workflow "OnvioBR - Promotion AMI"
func (a *App) TriggerPromotionAMI(environment, service, version string) WorkflowResult {
	result := WorkflowResult{
		Service: service,
	}

	// Validação de campos
	if environment == "" {
		result.Error = "Ambiente não informado"
		return result
	}
	if service == "" {
		result.Error = "Serviço não informado"
		return result
	}
	if version == "" {
		result.Error = "Versão não informada"
		return result
	}

	// Montar comando gh
	args := []string{
		"workflow", "run", "OnvioBR - Promotion AMI",
		"--repo", "tr/onviobr-automacao",
		"-f", "app=onviobr",
		"-f", fmt.Sprintf("environment=%s", environment),
		"-f", fmt.Sprintf("service=%s", service),
		"-f", fmt.Sprintf("version=%s", version),
	}

	fmt.Printf("[INFO] Executando: %s %s\n", a.ghPath, strings.Join(args, " "))

	cmd := exec.Command(a.ghPath, args...)
	output, err := cmd.CombinedOutput()

	if err != nil {
		result.Error = fmt.Sprintf("Erro ao executar workflow: %s - %s", err.Error(), string(output))
		fmt.Printf("[ERROR] %s\n", result.Error)
		return result
	}

	result.Success = true
	result.Message = fmt.Sprintf("Workflow de promoção disparado com sucesso para %s em %s", service, environment)
	fmt.Printf("[SUCCESS] %s\n", result.Message)

	return result
}

