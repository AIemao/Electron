import { contextBridge, ipcRenderer } from 'electron';

// Tipos auxiliares
type FirebirdConfig = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  role?: string;
  pageSize?: number;
};

type FirebirdExecResult = {
  success: boolean;
  result?: unknown;
  error?: string;
};

type CheckUpgradeSQLResult = {
  exists: boolean;
  path: string;
  error?: string;
};

type FirebirdFieldExistsResult = {
  exists: boolean;
  error?: string;
};

// Exponha apenas o necessário para o frontend
contextBridge.exposeInMainWorld('electron', {
  readConfigFile: async (path: string): Promise<{ success: boolean; content?: string; error?: string }> => {
    try {
      return await ipcRenderer.invoke('read-config-file', path);
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  writeConfigFile: async (path: string, content: string): Promise<{ success: boolean; error?: string }> => {
    try {
      return await ipcRenderer.invoke('write-config-file', path, content);
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  getFilePath: (name: string): string => {
    try {
      return ipcRenderer.sendSync('get-file-path', name);
    } catch {
      return '';
    }
  },

  firebirdExec: async (config: FirebirdConfig, sql: string): Promise<FirebirdExecResult> => {
    try {
      return await ipcRenderer.invoke('firebird-exec', config, sql);
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  firebirdFieldExists: async (config: FirebirdConfig, table: string, field: string): Promise<FirebirdFieldExistsResult> => {
    try {
      return await ipcRenderer.invoke('firebird-field-exists', config, table, field);
    } catch (error) {
      return { exists: false, error: String(error) };
    }
  },

  checkUpgradeSQL: async (folderPath?: string): Promise<CheckUpgradeSQLResult> => {
    try {
      return await ipcRenderer.invoke('check-upgradesql', folderPath);
    } catch (error) {
      return { exists: false, path: '', error: String(error) };
    }
  },
});

console.log('[Preload] Script de preload carregado com sucesso!');