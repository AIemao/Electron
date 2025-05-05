/**
 * Definição de tipos para a API Electron exposta pelo preload
 */
interface ElectronAPI {
    /**
     * Lê o conteúdo de um arquivo config.json
     * @param filePath Caminho do arquivo a ser lido
     * @returns Objeto com status de sucesso, conteúdo e possível erro
     */
    readConfigFile: (filePath: string) => Promise<{
      success: boolean;
      content?: string;
      error?: string;
    }>;
  
    /**
     * Escreve conteúdo em um arquivo config.json
     * @param filePath Caminho do arquivo a ser escrito
     * @param content Conteúdo a ser escrito no arquivo
     * @returns Objeto com status de sucesso e possível erro
     */
    writeConfigFile: (filePath: string, content: string) => Promise<{
      success: boolean;
      error?: string;
    }>;
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }
  
  export {};