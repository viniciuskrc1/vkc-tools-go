// Bindings para a aplicação Go
export interface GHStatus {
  installed: boolean;
  authenticated: boolean;
  user?: string;
  error?: string;
}

export function CheckGitHubCLI(): Promise<GHStatus>;

// Geradores e Formatadores
export interface DocumentResult {
  raw: string;
  formatted: string;
  valid: boolean;
}

export function GenerateCPF(): Promise<DocumentResult>;
export function ValidateCPF(cpf: string): Promise<DocumentResult>;
export function GenerateCNPJ(): Promise<DocumentResult>;
export function ValidateCNPJ(cnpj: string): Promise<DocumentResult>;
export function GenerateUUID(): Promise<string>;
export function GenerateLoremIpsum(paragraphs: number): Promise<string>;
export function GenerateRandomName(): Promise<string>;
export function ApplyCPFMask(digits: string): Promise<string>;
export function ApplyCNPJMask(digits: string): Promise<string>;
export function FormatOnlyDigits(input: string): Promise<string>;
export function DecompressGzip(base64Gzip: string): Promise<string>;
