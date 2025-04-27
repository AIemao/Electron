import { app, BrowserWindow } from 'electron';
import path from 'path';
import { isDev } from './utils.js';

let mainWindow: BrowserWindow | null = null;

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
