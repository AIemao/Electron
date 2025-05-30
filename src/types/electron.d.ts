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

    /**
     * Executa comandos SQL no Firebird
     * @param config Configuração de conexão com o banco de dados
     * @param sql Comando SQL a ser executado
     * @returns Objeto com status de sucesso, resultado e possível erro
     */
    firebirdExec: (
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
    ) => Promise<{ success: boolean; result?: unknown; error?: string }>;

    /**
     * Verifica se um campo existe em uma tabela do Firebird
     * @param config Configuração de conexão com o banco de dados
     * @param table Nome da tabela a ser verificada
     * @param field Nome do campo a ser verificado
     * @returns Objeto com status de existência e possível erro
     */
    firebirdFieldExists: (
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
    ) => Promise<{ exists: boolean; error?: string }>;

    /**
     * Verifica a existência de um arquivo upgrade.sql
     * @param folderPath Caminho da pasta onde o arquivo pode estar localizado
     * @returns Objeto com status de existência, caminho do arquivo e possível erro
     */
    checkUpgradeSQL: (folderPath?: string) => Promise<{ exists: boolean; path: string; error?: string }>;
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }
  
  export {};