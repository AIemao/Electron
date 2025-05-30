import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { isDev } from './utils.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Firebird, { Database } from 'node-firebird';

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

// Função para converter ArrayBuffer para string
function ab2str(buf: ArrayBufferLike) {
  // @ts-expect-error: fromCharCode.apply expects number[] but receives Uint16Array; this is intentional for ArrayBuffer conversion
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

// Função para verificar se é um ArrayBuffer
function isAbv(value: unknown) {
  return (
    value !== null &&
    typeof value === 'object' &&
    'buffer' in value &&
    (value as { buffer: unknown }).buffer instanceof ArrayBuffer &&
    'byteLength' in value &&
    typeof (value as { byteLength: unknown }).byteLength === 'number'
  );
}

// Função para traduzir erros do Firebird
const translatedFbDbError = (aError: Error | { code?: string; message?: string } | unknown) => {
  if (!aError) return 'Erro desconhecido';

  const ERRO_CONEXAO = `
  ### Erro de conexão no banco de dados firebird.
  - Verifique se o serviço do firebird está sendo executado.
  - Verifique se o endereço do banco está configurado corretamente.
  - Verifique o firebird.conf, ele deve conter as seguintes flags com valores:
      WireCrypt = Disabled
      AuthServer = Legacy_Auth, Srp
      AuthClient = Legacy_Auth, Srp
      UserManager = Legacy_UserManager`;

  if (typeof aError === 'object' && aError !== null) {
    const code = (aError as { code?: string }).code;
    const message = (aError as { message?: string }).message;
    switch (code) {
      case 'ECONNREFUSED':
        return ERRO_CONEXAO;
      default:
        return message ? message : 'Erro desconhecido';
    }
  }
  return 'Erro desconhecido';
};

// Handler para executar SQL no Firebird
ipcMain.handle(
  'firebird-exec',
  async (
    _event,
    config: {
      host: string;
      port: number;
      database: string;
      user: string;
      password: string;
      role?: string;
      pageSize?: number;
    },
    sql: string
  ): Promise<{ success: boolean; result?: unknown; error?: string }> => {
    return new Promise((resolve) => {
      const options = {
        host: config.host || 'localhost',
        port: config.port || 3050,
        database: config.database,
        user: config.user || 'SYSDBA',
        password: config.password || 'masterkey',
        lowercase_keys: true,
        role: config.role,
        pageSize: config.pageSize
      };

      Firebird.attach(options, (err: Error | null, db: Database) => {
        if (err) {
          const errorMessage = translatedFbDbError(err);
          console.error('[Firebird] Erro de conexão:', errorMessage);
          return resolve({ success: false, error: errorMessage });
        }

        const queries = sql.split(';').map(q => q.trim()).filter(Boolean);
        let lastResult: unknown = null;
        let lastError: Error | null = null;

        (async () => {
          for (const query of queries) {
            if (!query) continue;
            try {
              lastResult = await new Promise<unknown>((res, rej) =>
                db.query(query, [], (e: Error | null, result: unknown) => {
                  if (e) {
                    rej(e);
                  } else {
                    // Processar ArrayBuffers nos resultados
                    if (result && Array.isArray(result)) {
                      result.forEach(rowQuery => {
                        Object.entries(rowQuery).forEach(([key, value]) => {
                          if (isAbv(value)) {
                            rowQuery[key] = ab2str(value as ArrayBufferLike);
                          }
                        });
                      });
                    }
                    res(result);
                  }
                })
              );
            } catch (e) {
              lastError = e instanceof Error ? e : new Error(String(e));
              break;
            }
          }
          
          db.detach();
          
          if (lastError) {
            const errorMessage = translatedFbDbError(lastError);
            console.error('[Firebird] Erro na execução:', errorMessage);
            return resolve({ success: false, error: errorMessage });
          }
          
          resolve({ success: true, result: lastResult });
        })();
      });
    });
  }
);

// Handler para verificar se campo existe em uma tabela
ipcMain.handle(
  'firebird-field-exists',
  async (
    _event,
    config: {
      host: string;
      port: number;
      database: string;
      user: string;
      password: string;
      role?: string;
      pageSize?: number;
    },
    table: string,
    field: string
  ): Promise<{ exists: boolean; error?: string }> => {
    const sql = `SELECT * FROM
                    rdb$relation_fields
                  WHERE RDB$RELATION_FIELDS.rdb$relation_name = '${table.toUpperCase()}'
                    AND RDB$RELATION_FIELDS.RDB$FIELD_NAME = '${field.toUpperCase()}'`;
    
    try {
      const result = await new Promise<{ success: boolean; result?: unknown; error?: string }>((resolve) => {
        // Reutilizar a lógica do firebird-exec
        const options = {
          host: config.host || 'localhost',
          port: config.port || 3050,
          database: config.database,
          user: config.user || 'SYSDBA',
          password: config.password || 'masterkey',
          lowercase_keys: true,
          role: config.role,
          pageSize: config.pageSize
        };

        Firebird.attach(options, (err: Error | null, db: Database) => {
          if (err) {
            return resolve({ success: false, error: translatedFbDbError(err) });
          }

          db.query(sql, [], (e: Error | null, queryResult: unknown) => {
            db.detach();
            if (e) {
              resolve({ success: false, error: translatedFbDbError(e) });
            } else {
              resolve({ success: true, result: queryResult });
            }
          });
        });
      });

      if (result.success && Array.isArray(result.result)) {
        return { exists: result.result.length > 0 };
      } else {
        return { exists: false, error: result.error };
      }
    } catch {
      return { exists: false, error: 'Erro inesperado ao verificar campo' };
    }
  }
);

async function createWindow() {
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

  try {
    if (isDev()) {
      try {
        // Abordagem mais segura de importação
        const devTools = await import('electron-devtools-installer');
        const installExtension = devTools.default || devTools.installExtension;
        const REACT_DEVELOPER_TOOLS = devTools.REACT_DEVELOPER_TOOLS;
        
        if (typeof installExtension === 'function') {
          const name = await installExtension(REACT_DEVELOPER_TOOLS);
          console.log(`Extensão instalada: ${name}`);
        } else {
          console.warn('installExtension não é uma função. Tipo:', typeof installExtension);
        }
      } catch (err) {
        console.error('Falha ao instalar DevTools:', err);
      }
      
      await mainWindow.loadURL('http://localhost:5123');
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
      await mainWindow.loadFile(
        path.join(app.getAppPath(), 'dist-react', 'index.html')
      );
    }
  } catch (error) {
    console.error('Erro ao carregar a janela:', error);
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