// Bindings para a aplicação Go
export interface WorkflowResult {
  service: string;
  success: boolean;
  message: string;
  error?: string;
}

export interface BatchResult {
  total: number;
  succeeded: number;
  failed: number;
  results: WorkflowResult[];
}

export interface GHStatus {
  installed: boolean;
  authenticated: boolean;
  user?: string;
  error?: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  type: 'create-ami' | 'promotion-ami';
  jdkVersion?: string;
  environment?: string;
  services: string[];
  version: string;
  succeeded: number;
  failed: number;
  total: number;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  error?: string;
  expiresAt?: string;
}

export function CheckGitHubCLI(): Promise<GHStatus>;
export function TriggerCreateAMI(jdkVersion: string, service: string, version: string): Promise<WorkflowResult>;
export function TriggerCreateAMIBatch(jdkVersion: string, services: string[], version: string): Promise<BatchResult>;
export function TriggerPromotionAMI(environment: string, service: string, version: string): Promise<WorkflowResult>;

// Histórico
export function GetHistory(): Promise<HistoryEntry[]>;
export function GetHistoryByType(historyType: string): Promise<HistoryEntry[]>;
export function AddHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): Promise<void>;
export function ClearHistory(): Promise<void>;
export function DeleteHistoryEntry(id: string): Promise<void>;

// Autenticação Onvio
export function AuthenticateWithCredentials(environment: string, username: string, password: string): Promise<AuthResult>;
export function AuthenticateWithCompanyID(environment: string, companyID: string): Promise<AuthResult>;

// Gerenciamento de Credenciais
export interface SavedLogin {
  id: string;
  name: string;
  username: string;
  password: string;
  createdAt: string;
  lastUsed?: string;
}

export interface SavedCompanyID {
  id: string;
  name: string;
  companyId: string;
  createdAt: string;
  lastUsed?: string;
}

export function GetSavedLogins(environment: string): Promise<SavedLogin[]>;
export function GetSavedCompanyIDs(environment: string): Promise<SavedCompanyID[]>;
export function SaveLogin(environment: string, name: string, username: string, password: string): Promise<void>;
export function SaveCompanyID(environment: string, name: string, companyID: string): Promise<void>;
export function DeleteLogin(environment: string, loginID: string): Promise<void>;
export function DeleteCompanyID(environment: string, companyIDRecordID: string): Promise<void>;
export function UpdateLoginLastUsed(environment: string, loginID: string): Promise<void>;
export function UpdateCompanyIDLastUsed(environment: string, companyIDRecordID: string): Promise<void>;

// Informações da Sessão
export interface SessionInfo {
  success: boolean;
  error?: string;
  companyId?: string;
  contactId?: string;
  contabilFirmId?: string;
}

export function GetSessionInfo(environment: string, longToken: string): Promise<SessionInfo>;

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
export function ApplyCPFMask(digits: string): Promise<string>;
export function ApplyCNPJMask(digits: string): Promise<string>;
export function FormatOnlyDigits(input: string): Promise<string>;
