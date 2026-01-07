// Package main contém a estrutura principal da aplicação VKC Tools
package main

import (
	"bytes"
	"compress/gzip"
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
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

// DecompressGzip descomprime um Gzip que está codificado em base64
// Retorna o conteúdo descomprimido como string
func (a *App) DecompressGzip(base64Gzip string) (string, error) {
	// Remover espaços em branco
	base64Gzip = strings.TrimSpace(base64Gzip)
	
	// Decodificar base64
	gzipData, err := base64.StdEncoding.DecodeString(base64Gzip)
	if err != nil {
		return "", fmt.Errorf("erro ao decodificar base64: %v", err)
	}

	// Criar um reader para o gzip
	gzipReader, err := gzip.NewReader(bytes.NewReader(gzipData))
	if err != nil {
		return "", fmt.Errorf("erro ao criar reader gzip: %v", err)
	}
	defer gzipReader.Close()

	// Ler o conteúdo descomprimido
	decompressedData, err := io.ReadAll(gzipReader)
	if err != nil {
		return "", fmt.Errorf("erro ao descomprimir gzip: %v", err)
	}

	return string(decompressedData), nil
}


