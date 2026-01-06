// Package main é o ponto de entrada da aplicação VKC Tools
// Esta aplicação desktop usa Wails para fornecer uma interface React
// com backend Go para automação de workflows do GitHub.
package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Criar instância da aplicação
	app := NewApp()

	// Criar a aplicação Wails com configurações otimizadas para performance
	err := wails.Run(&options.App{
		Title:     "VKC Tools",
		Width:     1280,
		Height:    800,
		MinWidth:  1024,
		MinHeight: 700,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 15, G: 15, B: 20, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
		// Configurações específicas para Windows
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			DisableWindowIcon:    false,
		},
	})

	if err != nil {
		println("Erro ao iniciar aplicação:", err.Error())
	}
}

