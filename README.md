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
| `dev:react` | Inicia o ambiente de desenvolvimento React usando Vite |
| `dev:electron` | Executa o Electron em modo de desenvolvimento |
| `build` | Compila TypeScript e gera build de produção do React (cria pasta `dist-react`) |
| `lint` | Executa ESLint para verificar e corrigir problemas de formatação e estilo no código |
| `preview` | Inicia um servidor para pré-visualizar a versão de produção do React |
| `transpile:electron` | Compila o código TypeScript do processo principal do Electron (cria pasta `dist-electron`) |
| `dist:mac` | Gera o executável para macOS (arm64) |
| `dist:win` | Gera o executável para Windows (x64) |
| `dist:linux` | Gera o executável para Linux (x64) |

### Fluxo de Desenvolvimento
1. Execute `dev:react` e `dev:electron` em terminais separados para desenvolvimento
2. O processo de build completo segue a sequência:
   - `build` - Compila o código React
   - `transpile:electron` - Compila o código Electron
   - Distribuição com comando específico para plataforma (`dist:mac`, `dist:win` ou `dist:linux`)