// Package main contém geradores de documentos válidos
package main

import (
	"fmt"
	"math/rand"
	"strings"
	"time"
	"regexp"
)

func init() {
	rand.Seed(time.Now().UnixNano())
}

// DocumentResult representa o resultado de um documento gerado/formatado
type DocumentResult struct {
	Raw       string `json:"raw"`       // Apenas dígitos
	Formatted string `json:"formatted"` // Com máscara
	Valid     bool   `json:"valid"`     // Se é válido
}

// GenerateCPF gera um CPF válido aleatório
func (a *App) GenerateCPF() DocumentResult {
	// Gerar 9 dígitos aleatórios
	digits := make([]int, 9)
	for i := 0; i < 9; i++ {
		digits[i] = rand.Intn(10)
	}

	// Calcular primeiro dígito verificador
	d1 := calculateCPFDigit(digits, []int{10, 9, 8, 7, 6, 5, 4, 3, 2})
	digits = append(digits, d1)

	// Calcular segundo dígito verificador
	d2 := calculateCPFDigit(digits, []int{11, 10, 9, 8, 7, 6, 5, 4, 3, 2})
	digits = append(digits, d2)

	// Montar string
	raw := ""
	for _, d := range digits {
		raw += fmt.Sprintf("%d", d)
	}

	return DocumentResult{
		Raw:       raw,
		Formatted: formatCPF(raw),
		Valid:     true,
	}
}

// ValidateCPF valida e formata um CPF
func (a *App) ValidateCPF(cpf string) DocumentResult {
	// Remover caracteres não numéricos
	raw := extractDigits(cpf)

	// Validar tamanho
	if len(raw) != 11 {
		return DocumentResult{
			Raw:       raw,
			Formatted: "",
			Valid:     false,
		}
	}

	// Verificar se todos os dígitos são iguais (CPF inválido)
	allEqual := true
	for i := 1; i < len(raw); i++ {
		if raw[i] != raw[0] {
			allEqual = false
			break
		}
	}
	if allEqual {
		return DocumentResult{
			Raw:       raw,
			Formatted: formatCPF(raw),
			Valid:     false,
		}
	}

	// Converter para slice de inteiros
	digits := make([]int, 11)
	for i, c := range raw {
		digits[i] = int(c - '0')
	}

	// Validar primeiro dígito
	d1 := calculateCPFDigit(digits[:9], []int{10, 9, 8, 7, 6, 5, 4, 3, 2})
	if d1 != digits[9] {
		return DocumentResult{
			Raw:       raw,
			Formatted: formatCPF(raw),
			Valid:     false,
		}
	}

	// Validar segundo dígito
	d2 := calculateCPFDigit(digits[:10], []int{11, 10, 9, 8, 7, 6, 5, 4, 3, 2})
	if d2 != digits[10] {
		return DocumentResult{
			Raw:       raw,
			Formatted: formatCPF(raw),
			Valid:     false,
		}
	}

	return DocumentResult{
		Raw:       raw,
		Formatted: formatCPF(raw),
		Valid:     true,
	}
}

// GenerateCNPJ gera um CNPJ válido aleatório
func (a *App) GenerateCNPJ() DocumentResult {
	// Gerar 8 dígitos da base + 4 dígitos da filial (geralmente 0001)
	digits := make([]int, 12)
	for i := 0; i < 8; i++ {
		digits[i] = rand.Intn(10)
	}
	// Filial padrão: 0001
	digits[8] = 0
	digits[9] = 0
	digits[10] = 0
	digits[11] = 1

	// Calcular primeiro dígito verificador
	d1 := calculateCNPJDigit(digits, []int{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2})
	digits = append(digits, d1)

	// Calcular segundo dígito verificador
	d2 := calculateCNPJDigit(digits, []int{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2})
	digits = append(digits, d2)

	// Montar string
	raw := ""
	for _, d := range digits {
		raw += fmt.Sprintf("%d", d)
	}

	return DocumentResult{
		Raw:       raw,
		Formatted: formatCNPJ(raw),
		Valid:     true,
	}
}

// ValidateCNPJ valida e formata um CNPJ
func (a *App) ValidateCNPJ(cnpj string) DocumentResult {
	// Remover caracteres não numéricos
	raw := extractDigits(cnpj)

	// Validar tamanho
	if len(raw) != 14 {
		return DocumentResult{
			Raw:       raw,
			Formatted: "",
			Valid:     false,
		}
	}

	// Verificar se todos os dígitos são iguais (CNPJ inválido)
	allEqual := true
	for i := 1; i < len(raw); i++ {
		if raw[i] != raw[0] {
			allEqual = false
			break
		}
	}
	if allEqual {
		return DocumentResult{
			Raw:       raw,
			Formatted: formatCNPJ(raw),
			Valid:     false,
		}
	}

	// Converter para slice de inteiros
	digits := make([]int, 14)
	for i, c := range raw {
		digits[i] = int(c - '0')
	}

	// Validar primeiro dígito
	d1 := calculateCNPJDigit(digits[:12], []int{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2})
	if d1 != digits[12] {
		return DocumentResult{
			Raw:       raw,
			Formatted: formatCNPJ(raw),
			Valid:     false,
		}
	}

	// Validar segundo dígito
	d2 := calculateCNPJDigit(digits[:13], []int{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2})
	if d2 != digits[13] {
		return DocumentResult{
			Raw:       raw,
			Formatted: formatCNPJ(raw),
			Valid:     false,
		}
	}

	return DocumentResult{
		Raw:       raw,
		Formatted: formatCNPJ(raw),
		Valid:     true,
	}
}

// GenerateUUID gera um UUID v4 aleatório
func (a *App) GenerateUUID() string {
	uuid := make([]byte, 16)
	rand.Read(uuid)

	// Definir versão 4
	uuid[6] = (uuid[6] & 0x0f) | 0x40
	// Definir variante
	uuid[8] = (uuid[8] & 0x3f) | 0x80

	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		uuid[0:4],
		uuid[4:6],
		uuid[6:8],
		uuid[8:10],
		uuid[10:16])
}

// Funções auxiliares

func calculateCPFDigit(digits []int, weights []int) int {
	sum := 0
	for i, d := range digits {
		sum += d * weights[i]
	}
	remainder := sum % 11
	if remainder < 2 {
		return 0
	}
	return 11 - remainder
}

func calculateCNPJDigit(digits []int, weights []int) int {
	sum := 0
	for i, d := range digits {
		sum += d * weights[i]
	}
	remainder := sum % 11
	if remainder < 2 {
		return 0
	}
	return 11 - remainder
}

func formatCPF(raw string) string {
	if len(raw) != 11 {
		return raw
	}
	return fmt.Sprintf("%s.%s.%s-%s", raw[0:3], raw[3:6], raw[6:9], raw[9:11])
}

func formatCNPJ(raw string) string {
	if len(raw) != 14 {
		return raw
	}
	return fmt.Sprintf("%s.%s.%s/%s-%s", raw[0:2], raw[2:5], raw[5:8], raw[8:12], raw[12:14])
}

func extractDigits(s string) string {
	reg := regexp.MustCompile(`[^0-9]`)
	return reg.ReplaceAllString(s, "")
}

// FormatOnlyDigits remove tudo exceto dígitos de uma string
func (a *App) FormatOnlyDigits(input string) string {
	return extractDigits(input)
}

// ApplyCPFMask aplica máscara de CPF a uma string de dígitos
func (a *App) ApplyCPFMask(digits string) string {
	clean := extractDigits(digits)
	if len(clean) != 11 {
		return digits
	}
	return formatCPF(clean)
}

// ApplyCNPJMask aplica máscara de CNPJ a uma string de dígitos
func (a *App) ApplyCNPJMask(digits string) string {
	clean := extractDigits(digits)
	if len(clean) != 14 {
		return digits
	}
	return formatCNPJ(clean)
}

// GenerateLoremIpsum gera texto Lorem Ipsum
func (a *App) GenerateLoremIpsum(paragraphs int) string {
	loremParagraphs := []string{
		"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
		"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
		"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
		"Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
		"Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
	}

	if paragraphs <= 0 {
		paragraphs = 1
	}
	if paragraphs > 10 {
		paragraphs = 10
	}

	result := make([]string, paragraphs)
	for i := 0; i < paragraphs; i++ {
		result[i] = loremParagraphs[i%len(loremParagraphs)]
	}

	return strings.Join(result, "\n\n")
}

// GenerateRandomName gera um nome aleatório brasileiro
func (a *App) GenerateRandomName() string {
	firstNames := []string{
		"Maria", "Ana", "Fernanda", "Juliana", "Patricia", "Mariana", "Amanda", "Bruna", "Camila", "Carla",
		"João", "Pedro", "Carlos", "Lucas", "Gabriel", "Rafael", "Felipe", "Bruno", "André", "Ricardo",
		"Paulo", "Marcos", "Thiago", "Daniel", "Rodrigo", "Gustavo", "Eduardo", "Marcelo", "Fábio", "Leonardo",
		"Beatriz", "Isabela", "Larissa", "Vanessa", "Renata", "Tatiana", "Priscila", "Monique", "Débora", "Luciana",
		"Roberto", "Antonio", "José", "Francisco", "Paulo", "Marcelo", "Maurício", "Vinicius", "Henrique", "Diego",
	}

	secondNames := []string{
		"Joana", "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima",
		"James", "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Gomes",
		"Rocha", "Dias", "Moreira", "Araújo", "Mendes", "Freitas", "Barbosa", "Nunes", "Teixeira", "Monteiro",
		"Cardoso", "Reis", "Machado", "Ramos", "Azevedo", "Cavalcanti", "Nascimento", "Moraes", "Campos", "Duarte",
	}

	surnames := []string{
		"Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Costa",
		"Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Gomes", "Rocha", "Dias",
		"Moreira", "Araújo", "Mendes", "Freitas", "Barbosa", "Nunes", "Teixeira", "Monteiro", "Cardoso", "Reis",
		"Machado", "Ramos", "Azevedo", "Cavalcanti", "Nascimento", "Moraes", "Campos", "Duarte", "Correia", "Cunha",
		"Pires", "Vieira", "Mendes", "Barros", "Castro", "Dantas", "Farias", "Guedes", "Leite", "Macedo",
	}

	// Escolher primeiro nome
	firstName := firstNames[rand.Intn(len(firstNames))]

	// 70% de chance de ter um segundo nome
	hasSecondName := rand.Float32() < 0.7
	var secondName string
	if hasSecondName {
		secondName = secondNames[rand.Intn(len(secondNames))]
	}

	// Escolher sobrenome
	surname := surnames[rand.Intn(len(surnames))]

	// Montar nome completo
	if hasSecondName {
		return fmt.Sprintf("%s %s %s", firstName, secondName, surname)
	}
	return fmt.Sprintf("%s %s", firstName, surname)
}

