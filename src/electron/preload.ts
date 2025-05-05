import { contextBridge, ipcRenderer } from 'electron';

// Exponha apenas o necessário para o frontend
contextBridge.exposeInMainWorld('electron', {
  // API para leitura de arquivo
  readConfigFile: async (path: string) => {
    console.log(`[Preload] Chamando readConfigFile com caminho: ${path}`);
    try {
      return await ipcRenderer.invoke('read-config-file', path);
    } catch (error) {
      console.error('[Preload] Erro ao ler arquivo:', error);
      return { success: false, error: String(error) };
    }
  },
  
  // API para escrita de arquivo
  writeConfigFile: async (path: string, content: string) => {
    console.log(`[Preload] Chamando writeConfigFile para: ${path}`);
    try {
      return await ipcRenderer.invoke('write-config-file', path, content);
    } catch (error) {
      console.error('[Preload] Erro ao escrever arquivo:', error);
      return { success: false, error: String(error) };
    }
  },
  
  // Método opcional para obter caminhos
  getFilePath: (name: string) => {
    console.log(`[Preload] Obtendo caminho para: ${name}`);
    try {
      return ipcRenderer.sendSync('get-file-path', name);
    } catch (error) {
      console.error('[Preload] Erro ao obter caminho:', error);
      return '';
    }
  }
});

console.log('[Preload] Script de preload carregado com sucesso!');