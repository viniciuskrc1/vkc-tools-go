# VKC Tools

Aplicação desktop moderna e performática para automação de workflows do OnvioBR, construída com **Go + Wails + React**.

![VKC Tools Screenshot](docs/screenshot.png)

## 📋 Funcionalidades

### OnvioBR - Create AMI
Cria novas AMIs (Amazon Machine Images) para serviços específicos.
- **Multi-select**: Selecione múltiplas verticais (287 disponíveis)
- **Busca em tempo real**: Filtre rapidamente entre os serviços
- **Execução em paralelo**: Dispara workflows simultaneamente
- **Progresso detalhado**: Acompanhe o status de cada disparo

### OnvioBR - Promotion AMI
Promove AMIs existentes para ambientes de lab ou qa.
- **Single-select**: Selecione uma vertical por vez
- **Ambientes**: lab-lab01 ou qa-qa01
- **Feedback imediato**: Resultado da promoção em tempo real

## 🔧 Pré-requisitos

### 1. Go (1.21+)
```bash
# Windows (usando Chocolatey)
choco install golang

# Ou baixe em: https://go.dev/dl/
```

### 2. Node.js (18+)
```bash
# Windows (usando Chocolatey)
choco install nodejs

# Ou baixe em: https://nodejs.org/
```

### 3. Wails CLI
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### 4. GitHub CLI
```bash
# Windows (usando Chocolatey)
choco install gh

# Ou baixe em: https://cli.github.com/
```

### 5. Autenticação no GitHub
```bash
gh auth login
```

## 🚀 Como Executar

### Desenvolvimento
```bash
# Clone o repositório
cd vkc-tools-go

# Instale as dependências do frontend
cd frontend
npm install
cd ..

# Execute em modo desenvolvimento (hot-reload)
wails dev
```

### Build para Produção
```bash
# Build para Windows
wails build

# O executável será gerado em: build/bin/vkc-tools.exe
```

### Build Otimizado
```bash
# Build otimizado com UPX compression
wails build -upx
```

## 📁 Estrutura do Projeto

```
vkc-tools-go/
├── main.go                 # Entry point da aplicação Wails
├── app.go                  # Estrutura principal e métodos Go
├── go.mod                  # Dependências Go
├── wails.json              # Configuração do Wails
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── App.tsx         # Componente raiz
│   │   ├── main.tsx        # Entry point React
│   │   ├── components/     # Componentes React
│   │   │   ├── Sidebar.tsx
│   │   │   ├── CreateAMI.tsx
│   │   │   ├── PromotionAMI.tsx
│   │   │   ├── ServiceSelector.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ConfirmModal.tsx
│   │   ├── data/
│   │   │   └── services.ts # Lista de 287 serviços
│   │   ├── styles/
│   │   │   └── index.css   # Estilos globais
│   │   └── wailsjs/        # Bindings Go <-> JS
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🎨 Design System

A aplicação usa um design moderno com tema escuro inspirado em terminais cyberpunk:

- **Cores principais**: Cyan (#00d9ff) e Magenta (#ff00aa)
- **Fontes**: Outfit (UI) e JetBrains Mono (código)
- **Animações**: Sutis e performáticas
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

## ⚡ Performance

A aplicação foi otimizada para máxima performance:

- **Frontend mínimo**: Sem bibliotecas UI pesadas
- **CSS puro**: Sem frameworks CSS
- **SVGs inline**: Ícones sem requisições HTTP
- **Memoização**: React.useMemo para listas grandes
- **Concorrência controlada**: Limita requests paralelos

## 🛠️ Adicionando Novas Ferramentas

O menu está preparado para expansão. Para adicionar uma nova ferramenta:

1. Crie um novo componente em `frontend/src/components/`
2. Adicione a rota em `App.tsx`
3. Adicione o item no menu em `Sidebar.tsx`
4. Implemente os métodos necessários em `app.go`

## 📝 Licença

Uso interno - Thomson Reuters

## 🤝 Contribuição

1. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
2. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
3. Push para a branch: `git push origin feature/nova-funcionalidade`
4. Abra um Pull Request

