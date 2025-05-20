# Desktop Application with Electron, React, and TypeScript

[![Electron Version](https://img.shields.io/badge/Electron-23.0.0-blue.svg)](https://www.electronjs.org/)
[![React Version](https://img.shields.io/badge/React-18.2.0-%2361DAFB.svg)](https://react.dev/)
[![TypeScript Version](https://img.shields.io/badge/TypeScript-5.0.2-%23007ACC.svg)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

## 📋 Project Overview

Implementação modular de uma aplicação desktop multiplataforma utilizando:

- Arquitetura IPC (Inter-Process Communication)
- Tipagem estática com TypeScript
- Configuração otimizada de empacotamento
- Boas práticas de desenvolvimento de aplicações Electron

**Estado Atual do Desenvolvimento:**  
`Seção: DX Improvements (0:29:07)`

## 🛠️ Technical Implementation

### Configuração Base
- Integração Electron + React com Webpack
- Configuração de scripts para desenvolvimento e produção
- Setup de TypeScript para ambos os processos (main/renderer)
- Implementação de hot-reload para ciclo de desenvolvimento eficiente

### Otimizações Implementadas
- Estrutura de diretórios escalável
- Configuração de aliases para imports absolutos
- Validação de variáveis de ambiente
- Sistema de logging para processos principais

## 📦 Instalação e Execução

**Pré-requisitos:**
- Node.js 18.x
- npm 9.x+

## 🚀 Scripts do Projeto

| Script | Descrição |
|--------|-----------|
| `dev` | **Novo!** Executa dev:react e dev:electron simultaneamente com apenas um comando |
| `dev:react` | Inicia o ambiente de desenvolvimento React usando Vite |
| `dev:electron` | Executa transpile:electron automaticamente e depois inicia o Electron em modo de desenvolvimento |
| `build` | Compila TypeScript e gera build de produção do React (cria pasta `dist-react`) |
| `lint` | Executa ESLint para verificar e corrigir problemas de formatação e estilo no código |
| `preview` | Inicia um servidor para pré-visualizar a versão de produção do React |
| `transpile:electron` | Compila o código TypeScript do processo principal do Electron (cria pasta `dist-electron`) |
| `dist:mac` | Gera o executável para macOS (arm64) |
| `dist:win` | Gera o executável para Windows (x64) |
| `dist:linux` | Gera o executável para Linux (x64) |

### Fluxo de Desenvolvimento
1. Execute `npm run dev` para iniciar todo o ambiente de desenvolvimento com apenas um comando
   - Isso inicia tanto o servidor React quanto o aplicativo Electron em paralelo
   - O `transpile:electron` é executado automaticamente como parte do processo
2. O processo de build completo segue a sequência:
   - `build` - Compila o código React
   - `transpile:electron` - Compila o código Electron
   - Distribuição com comando específico para plataforma (`dist:mac`, `dist:win` ou `dist:linux`)
3. Testes antes de iniciar o build:
   - Antes de criar os instaladores finais com o electron-builder, você pode simular o comportamento de produção da sua aplicação rodando-a direto da pasta empacotada. Para isso: 
     - `build` - Compila o código React
     - `transpile:electron` - Compila o código Electron
     - `npx cross-env NODE_ENV=production electron .`
   - Dessa forma, você valida localmente se tudo está carregando corretamente antes de rodar `electron-builder --mac / --win / --linux` para gerar os instaladores finais.
4. Limpeza de pastas:
   - Utilize o comando `clean` para remover as pastas `dist-electron`, `dist-react` e `out`.
   - Isso é necessário quando códigos importantes ou arquivos são alterados ou movidos, garantindo que os builds sejam gerados corretamente.

## 🔀 Instruções para Desenvolvimento

### Branches Principais
- **master**: Projeto base funcional com a tela padrão do Electron. Completamente funcional e configurado para build automático no GitHub Actions após merge de commits.
- **AAMaster**: Branch de desenvolvimento ativo, com instruções detalhadas no arquivo ROADMAP.MD(Arquivo privado por enquanto).
