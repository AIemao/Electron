import { app, BrowserWindow } from 'electron';
import path from 'path';
import { isDev } from './utils.js';
import { installExtension, REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

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
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      //TODO: adicionar segurança ao app:
      // se você usar preload scripts:
      // preload: path.join(__dirname, 'preload.js'),
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
