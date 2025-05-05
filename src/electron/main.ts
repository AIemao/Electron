import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { isDev } from './utils.js';
import { installExtension, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Criar equivalentes para __dirname e __filename em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow: BrowserWindow | null = null;

// Verifica se o app já está rodando (evita abrir mais de uma instância):
const isRunning = app.requestSingleInstanceLock();
if (!isRunning) {
  app.quit(); // Exit if this is a second instance
} else {
  // Handle second instance attempts
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Handlers para leitura e escrita de arquivos config.json
ipcMain.handle('read-config-file', async (_, filePath: string) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    console.error('Erro ao ler arquivo:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
});

ipcMain.handle('write-config-file', async (_, filePath: string, content: string) => {
  try {
    // Cria um backup antes de salvar
    const backupPath = `${filePath}.backup-${Date.now()}`;
    try {
      const originalContent = await fs.readFile(filePath, 'utf-8');
      await fs.writeFile(backupPath, originalContent);
    } catch (err) {
      console.warn('Não foi possível criar backup:', err);
    }
    
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Erro ao escrever arquivo:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // IMPORTANTE: Configurar o preload script
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev()) {
    // Instala o React DevTools no modo de desenvolvimento:
    installExtension(REACT_DEVELOPER_TOOLS)
    .then((extension) =>
      console.log(`Extensão adicionada: ${extension.name || extension}`)
    )
    .catch((err: Error) =>
      console.error('Erro ao adicionar extensão:', err)
    ); 
    mainWindow.loadURL('http://localhost:5123');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(
      path.join(app.getAppPath(), 'dist-react', 'index.html')
    );
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

// Em macOS costuma-se recriar janela ao re-clicar no ícone do dock:
app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

// Fechar o app quando todas as janelas forem fechadas (exceto no macOS):
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});