import React, { useState, useRef, useCallback, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import styles from './ConfigJsonPage.module.css';
import { useNavigate } from 'react-router-dom';

// Constantes para as chaves no sessionStorage
const SS_CONFIG_JSON_CONTENT = 'config_json_content';
const SS_CONFIG_JSON_PATH = 'config_json_path';

// Tipo para o editor Monaco
type MonacoEditorType = Parameters<OnMount>[0];

// Interface para o JSON de configuração
interface ConfigJson {
  // Propriedades básicas
  url?: string;
  __url?: string;
  
  // Configurações de ambiente e endpoints
  REACT_APP_BFF_ENDPOINT?: string;
  REACT_APP_API_ENDPOINT_PRODUCTSALL?: string;
  REACT_APP_CASHDESK_ENDPOINT?: string;
  REACT_APP_DEGUST_ONE_ORDER_ENDPOINT?: string;
  REACT_APP_ROUTING_ENDPOINT?: string;
  REACT_APP_SOCKETMANAGER_ENDPOINT?: string;
  REACT_APP_RESHOP_ENDPOINT?: string;
  
  // Configurações de terminal e loja
  REACT_APP_TERMINALID?: number;
  retailerId?: string;
  posId?: number;
  posType?: number;
  REACT_APP_STORE_SERVER_ID?: number;
  REACT_APP_STORE_FRANCHISE_ID?: number;
  REACT_APP_STORE_ID?: number;
  
  // Configurações de layout
  FRONT_APP_LAYOUT?: string;
  REACT_APP_LAYOUT_STYLE?: string;
  REACT_APP_PISTA_DRIVE?: number;
  REACT_APP_VAGA_DRIVE?: number;
  
  // Configurações de impressora
  printer?: {
    name?: string;
    port?: string;
  };
  
  // Configurações de TEF
  tef?: {
    pinpadPort?: string;
  };
  
  // Configurações de DANFE
  danfe?: Record<string, unknown>;
  
  // Permite propriedades adicionais que não conhecemos
  [key: string]: unknown;
}

// Constante para o caminho padrão
const DEFAULT_CONFIG_PATH = 'C:\\AutoAtendimentoOne\\pdv_cloud\\config.json';

// Mensagem de aviso inicial em formato JSON
const DEFAULT_WARNING_MESSAGE = JSON.stringify({
  "AVISO_IMPORTANTE": "Este editor é apenas para uso interno e controlado.",
  "NUNCA_USE": "Em ambiente de produção ou em lojas.",
  "INSTRUCOES": "Por favor, selecione um arquivo config.json existente usando o botão 'Procurar'.",
}, null, 2);

// Lista de opções para portas COM
const COM_PORT_OPTIONS = Array.from({ length: 10 }, (_, i) => `COM${i + 1}`);

// Senha para desbloquear alteração de ambiente
const ENVIRONMENT_UNLOCK_PASSWORD = '123';

const ConfigJsonPage = (): React.ReactElement => {
  const navigate = useNavigate();
  const [jsonContent, setJsonContent] = useState<string>(DEFAULT_WARNING_MESSAGE);
  const [parsedJson, setParsedJson] = useState<ConfigJson>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<MonacoEditorType | null>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string>('');
  
  // Estados para configurações específicas
  const [ambiente, setAmbiente] = useState<'ONLINE' | 'OFFLINE'>('OFFLINE');
  const [ambienteDetectado, setAmbienteDetectado] = useState<'ONLINE' | 'OFFLINE' | null>(null);
  const [ambienteDesbloqueado, setAmbienteDesbloqueado] = useState<boolean>(false);
  const [mostrarDialogoSenha, setMostrarDialogoSenha] = useState<boolean>(false);
  const [senhaTentativa, setSenhaTentativa] = useState<string>('');
  const [senhaErro, setSenhaErro] = useState<string | null>(null);
  const [terminalId, setTerminalId] = useState<number>(1);
  const [retailerId, setRetailerId] = useState<string>("");
  const [storeServerId, setStoreServerId] = useState<number>(1);
  const [storeFranchiseId, setStoreFranchiseId] = useState<number>(1);
  const [storeId, setStoreId] = useState<number>(1);
  const [layoutApp, setLayoutApp] = useState<string>('AAONE');
  const [layoutStyle, setLayoutStyle] = useState<string>('SHOP');
  const [printerName, setPrinterName] = useState<string>('Microsoft Print To PDF');
  const [printerPort, setPrinterPort] = useState<string>('COM5');
  const [pinpadPort, setPinpadPort] = useState<string>('COM1');
  const [baseApiUrl, setBaseApiUrl] = useState<string>('[url].com.br');
  const [offlineIp, setOfflineIp] = useState<string>('localhost');
  const [pistaDrive, setPistaDrive] = useState<number>(1);
  const [vagaDrive, setVagaDrive] = useState<number>(1);

  // Função para salvar no sessionStorage
  const saveToSessionStorage = useCallback((filePath: string, content: string) => {
    try {
      console.log("Salvando conteúdo no sessionStorage para:", filePath);
      sessionStorage.setItem(SS_CONFIG_JSON_CONTENT, content);
      sessionStorage.setItem(SS_CONFIG_JSON_PATH, filePath);
    } catch (e) {
      console.error('Erro ao salvar no sessionStorage:', e);
      setError('Não foi possível salvar no armazenamento de sessão. O arquivo pode ser muito grande.');
    }
  }, []);

  // Efeito para analisar o JSON quando o conteúdo muda
  useEffect(() => {
    try {
      if (jsonContent && jsonContent !== DEFAULT_WARNING_MESSAGE) {
        const parsed = JSON.parse(jsonContent) as ConfigJson;
        setParsedJson(parsed);
        
        // Detectar ambiente com base nos endpoints
        const detectadoComoOffline = 
          parsed.REACT_APP_BFF_ENDPOINT?.includes('http:') ||
          parsed.REACT_APP_API_ENDPOINT_PRODUCTSALL?.includes('http:');
        
        const ambDetectado = detectadoComoOffline ? 'OFFLINE' : 'ONLINE';
        setAmbienteDetectado(ambDetectado);
        setAmbiente(ambDetectado);
        
        // Extrair valores do JSON para os estados
        setTerminalId(Number(parsed.REACT_APP_TERMINALID) || 1);
        setRetailerId(parsed.retailerId || "");
        setStoreServerId(Number(parsed.REACT_APP_STORE_SERVER_ID) || 1);
        setStoreFranchiseId(Number(parsed.REACT_APP_STORE_FRANCHISE_ID) || 1);
        setStoreId(Number(parsed.REACT_APP_STORE_ID) || 1);
        setLayoutApp(parsed.FRONT_APP_LAYOUT || 'AAONE');
        setLayoutStyle(parsed.REACT_APP_LAYOUT_STYLE || 'SHOP');
        setPrinterName(parsed.printer?.name || 'Microsoft Print To PDF');
        
        // Normalizar portas COM
        const pPrinter = parsed.printer?.port || 'COM5';
        setPrinterPort(COM_PORT_OPTIONS.includes(pPrinter) ? pPrinter : 'COM5');
        
        const pPinpad = parsed.tef?.pinpadPort || 'COM1';
        setPinpadPort(COM_PORT_OPTIONS.includes(pPinpad) ? pPinpad : 'COM1');
        
        // Extrair URL base dos endpoints
        if (parsed.REACT_APP_BFF_ENDPOINT) {
          const url = parsed.REACT_APP_BFF_ENDPOINT;
          if (url.includes('//')) {
            const baseUrl = url.split('//')[1].split('/')[0];
            setBaseApiUrl(baseUrl);
          }
        }
        
        // Extrair IP offline
        if (parsed.REACT_APP_BFF_ENDPOINT && parsed.REACT_APP_BFF_ENDPOINT.includes('http:')) {
          const url = parsed.REACT_APP_BFF_ENDPOINT;
          const ip = url.split('//')[1].split(':')[0];
          setOfflineIp(ip);
        }
        
        setPistaDrive(Number(parsed.REACT_APP_PISTA_DRIVE) || 1);
        setVagaDrive(Number(parsed.REACT_APP_VAGA_DRIVE) || 1);
      }
    } catch (e) {
      console.error("Erro ao analisar JSON:", e);
    }
  }, [jsonContent]);

  // Carregar dados salvos no sessionStorage quando o componente montar
  useEffect(() => {
    console.log("Verificando dados na sessão...");
    
    const savedContent = sessionStorage.getItem(SS_CONFIG_JSON_CONTENT);
    const savedPath = sessionStorage.getItem(SS_CONFIG_JSON_PATH);

    if (savedContent) {
      setJsonContent(savedContent);
      console.log("Conteúdo carregado do sessionStorage");
    }

    if (savedPath) {
      setCurrentFilePath(savedPath);
    }
  }, []);

  // Função para abrir o diálogo de senha
  const handleUnlockEnvironment = () => {
    setSenhaTentativa('');
    setSenhaErro(null);
    setMostrarDialogoSenha(true);
  };

  // Função para verificar a senha e desbloquear o ambiente
  const handleVerificarSenha = () => {
    if (senhaTentativa === ENVIRONMENT_UNLOCK_PASSWORD) {
      setAmbienteDesbloqueado(true);
      setMostrarDialogoSenha(false);
      setSenhaErro(null);
      setSuccessMessage('Ambiente desbloqueado! Agora você pode alterar manualmente.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setSenhaErro('Senha incorreta. Tente novamente.');
    }
  };

  // Função para atualizar o JSON com as configurações do form
  const updateJsonFromForm = useCallback(() => {
    try {
      const updatedJson = { ...parsedJson };
      
      // URL e ambiente
      if (ambiente === 'ONLINE') {
        updatedJson.url = `https://${baseApiUrl}/aaone`;
        updatedJson.__url = "http://localhost:3000";
      } else {
        updatedJson.__url = `https://${baseApiUrl}/aaone`;
        updatedJson.url = "http://localhost:3000";
      }
      
      // Configurações de terminal e loja
      updatedJson.REACT_APP_TERMINALID = terminalId;
      updatedJson.retailerId = retailerId;
      
      // Manter os valores de posId e posType se já existirem
      updatedJson.posId = updatedJson.posId || 1;
      updatedJson.posType = updatedJson.posType || 1;
      
      // Configurações de loja (apenas para ambiente online)
      if (ambiente === 'ONLINE') {
        updatedJson.REACT_APP_STORE_SERVER_ID = storeServerId;
        updatedJson.REACT_APP_STORE_FRANCHISE_ID = storeFranchiseId;
        updatedJson.REACT_APP_STORE_ID = storeId;
      }
      
      // Configurações de layout
      updatedJson.FRONT_APP_LAYOUT = layoutApp;
      updatedJson.REACT_APP_LAYOUT_STYLE = layoutStyle;
      
      // Configurações de impressora
      if (!updatedJson.printer) updatedJson.printer = {};
      updatedJson.printer.name = printerName;
      updatedJson.printer.port = printerPort;
      
      // Configurações de TEF
      if (!updatedJson.tef) updatedJson.tef = {};
      updatedJson.tef.pinpadPort = pinpadPort;
      
      // Manter configurações de DANFE se já existirem
      if (!updatedJson.danfe) updatedJson.danfe = {};
      
      // URLs dos serviços
      if (ambiente === 'ONLINE') {
        updatedJson.REACT_APP_BFF_ENDPOINT = `https://${baseApiUrl}/bff`;
        updatedJson.REACT_APP_API_ENDPOINT_PRODUCTSALL = `https://${baseApiUrl}/api`;
        updatedJson.REACT_APP_CASHDESK_ENDPOINT = `https://${baseApiUrl}/cashdesk`;
        updatedJson.REACT_APP_DEGUST_ONE_ORDER_ENDPOINT = `https://${baseApiUrl}/order`;
        updatedJson.REACT_APP_ROUTING_ENDPOINT = `https://${baseApiUrl}/routing`;
        updatedJson.REACT_APP_SOCKETMANAGER_ENDPOINT = `https://${baseApiUrl}/socketmanager`;
        updatedJson.REACT_APP_RESHOP_ENDPOINT = `https://${baseApiUrl}`;
      } else {
        updatedJson.REACT_APP_BFF_ENDPOINT = `http://${offlineIp}:3334`;
        updatedJson.REACT_APP_API_ENDPOINT_PRODUCTSALL = `http://${offlineIp}:3333`;
        updatedJson.REACT_APP_RESHOP_ENDPOINT = `https://${baseApiUrl}`;
      }
      
      // Configurações de Drive
      updatedJson.REACT_APP_PISTA_DRIVE = pistaDrive;
      updatedJson.REACT_APP_VAGA_DRIVE = vagaDrive;
      
      // Atualizar o conteúdo JSON
      const newJsonContent = JSON.stringify(updatedJson, null, 2);
      setJsonContent(newJsonContent);
      setParsedJson(updatedJson);
      
      return newJsonContent;
    } catch (e) {
      console.error("Erro ao atualizar JSON:", e);
      setError("Erro ao atualizar configurações. Verifique o console para detalhes.");
      return null;
    }
  }, [
    parsedJson, ambiente, terminalId, retailerId,
    storeServerId, storeFranchiseId, storeId, layoutApp, layoutStyle,
    printerName, printerPort, pinpadPort,
    baseApiUrl, offlineIp, pistaDrive, vagaDrive
  ]);

  // Tratamento para seleção de arquivo via input (Procurar)
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      if (!file.name.toLowerCase().endsWith('.json')) {
        setError('Por favor, selecione um arquivo JSON');
        return;
      }
      
      console.log("Arquivo selecionado:", file.name);
      
      // Usar FileReader para ler o conteúdo do arquivo
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          // Verificar se é um JSON válido
          JSON.parse(content);
          
          // Determinar o caminho completo do arquivo
          let fullPath = '';
          
          // Tentar obter o caminho completo do arquivo usando a API do File System
          const fileWithPath = file as File & { path?: string };
          if (fileWithPath.path) {
            fullPath = fileWithPath.path;
          } else {
            // Se não conseguirmos o caminho completo, usar pelo menos o nome do arquivo
            fullPath = file.name;
            
            // Se estiver no Firefox ou em outros navegadores que não suportam a propriedade path,
            // tente construir um caminho baseado no caminho padrão
            if (!fullPath.includes('\\') && !fullPath.includes('/')) {
              fullPath = `${DEFAULT_CONFIG_PATH.substring(0, DEFAULT_CONFIG_PATH.lastIndexOf('\\') + 1)}${file.name}`;
            }
          }
          
          setCurrentFilePath(fullPath);
          setJsonContent(content);
          saveToSessionStorage(fullPath, content);
          setSuccessMessage('Arquivo carregado com sucesso!');
          setTimeout(() => setSuccessMessage(null), 3000);
          
          // Resetar o desbloqueio do ambiente ao carregar novo arquivo
          setAmbienteDesbloqueado(false);
        } catch (error) {
          setError('O arquivo não contém um JSON válido.');
          console.error('Erro ao processar JSON:', error);
        }
      };
      reader.onerror = () => {
        setError('Erro ao ler o arquivo.');
      };
      reader.readAsText(file);
    }
  }, [saveToSessionStorage]);

  // Copiar para área de transferência
  const handleCopyToClipboard = useCallback(() => {
    try {
      // Atualizar JSON com as configurações do formulário
      const updatedJson = updateJsonFromForm();
      if (!updatedJson) return;
      
      // Tenta copiar para a área de transferência
      navigator.clipboard.writeText(updatedJson)
        .then(() => {
          setSuccessMessage('JSON copiado para a área de transferência!');
          setTimeout(() => setSuccessMessage(null), 3000);
          
          // Se temos um caminho de arquivo, salvar no histórico
          if (currentFilePath) {
            saveToSessionStorage(currentFilePath, updatedJson);
          } else {
            saveToSessionStorage('config.json (sem caminho)', updatedJson);
          }
        })
        .catch(err => {
          console.error('Erro ao copiar para área de transferência:', err);
          setError('Não foi possível copiar para a área de transferência. Selecione todo o texto manualmente e use CTRL+C.');
        });
      
    } catch (error) {
      console.error('Erro ao copiar JSON:', error);
      setError('JSON inválido. Verifique a sintaxe antes de copiar.');
    }
  }, [updateJsonFromForm, currentFilePath, saveToSessionStorage]);

  // Limpar sessionStorage
  const handleClearSessionStorage = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados da sessão atual? Você perderá todas as alterações não salvas.')) {
      sessionStorage.clear();
      setJsonContent(DEFAULT_WARNING_MESSAGE);
      setCurrentFilePath('');
      setSuccessMessage('SessionStorage foi limpo com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Referência do editor Monaco
  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  // Trata a abertura do diálogo de seleção de arquivo
  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Voltar para a página inicial
  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className={styles.fullScreenContainer}>
      <div className={styles.header}>
        <button 
          onClick={handleBackToHome} 
          className={styles.backButton}
          title="Voltar para página inicial"
        >
          ← Voltar
        </button>
        <h1 className={styles.title}>Editor de Config.json</h1>
      </div>

      {/* Painel de seleção de ambiente fixo */}
      <div className={styles.environmentBar}>
        <div className={styles.environmentSection}>
          <span className={styles.environmentLabel}>Ambiente:</span>
          <div className={styles.radioGroup}>
            <label className={ambiente === 'ONLINE' ? styles.activeEnvironment : ''}>
              <input 
                type="radio" 
                name="ambiente" 
                checked={ambiente === 'ONLINE'} 
                onChange={() => ambienteDesbloqueado && setAmbiente('ONLINE')} 
                disabled={!ambienteDesbloqueado}
              />
              ONLINE {ambienteDetectado === 'ONLINE' && '(Ambiente selecionado)'}
            </label>
            <label className={ambiente === 'OFFLINE' ? styles.activeEnvironment : ''}>
              <input 
                type="radio" 
                name="ambiente" 
                checked={ambiente === 'OFFLINE'} 
                onChange={() => ambienteDesbloqueado && setAmbiente('OFFLINE')} 
                disabled={!ambienteDesbloqueado}
              />
              OFFLINE {ambienteDetectado === 'OFFLINE' && '(Ambiente selecionado)'}
            </label>
          </div>
          <button 
            onClick={handleUnlockEnvironment}
            className={styles.lockButton}
            title={ambienteDesbloqueado ? "Ambiente desbloqueado" : "Clique para desbloquear alteração de ambiente"}
          >
            {ambienteDesbloqueado ? '🔓' : '🔒'}
          </button>
          <button
            onClick={handleOpenFileDialog}
            className={styles.browseButton}
            style={{ marginLeft: 12 }}
          >
            Carregar JSON
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className={styles.hiddenInput}
          />
        </div>
      </div>
      
      <div className={styles.mainContent}>
        <div className={styles.configPanel}>
          <div className={styles.sectionsRow}>
            <div className={styles.configSection}>
              <h3>Configurações de Terminal</h3>
              <div className={styles.formGroup}>
                <label htmlFor="terminalId">REACT_APP_TERMINALID:</label>
                <input 
                  type="number" 
                  id="terminalId"
                  value={terminalId} 
                  onChange={(e) => setTerminalId(Number(e.target.value))} 
                />
              </div>
            </div>
            <div className={styles.configSection}>
              <h3>Configurações de Layout</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="layoutApp">FRONT_APP_LAYOUT:</label>
                  <select 
                    id="layoutApp"
                    value={layoutApp} 
                    onChange={(e) => setLayoutApp(e.target.value)}
                  >
                    <option value="AAONE">AAONE</option>
                    <option value="BOBS">BOBS</option>
                    <option value="HABIBS">HABIBS</option>
                    <option value="RAGAZZO">RAGAZZO</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="layoutStyle">REACT_APP_LAYOUT_STYLE:</label>
                  <select 
                    id="layoutStyle"
                    value={layoutStyle} 
                    onChange={(e) => setLayoutStyle(e.target.value)}
                  >
                    <option value="SHOP">SHOP</option>
                    <option value="DRIVE">DRIVE</option>
                  </select>
                </div>
              </div>
              
              {layoutStyle === 'DRIVE' && (
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="pistaDrive">REACT_APP_PISTA_DRIVE:</label>
                    <input 
                      type="number" 
                      id="pistaDrive"
                      value={pistaDrive} 
                      onChange={(e) => setPistaDrive(Number(e.target.value))} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="vagaDrive">REACT_APP_VAGA_DRIVE:</label>
                    <input 
                      type="number" 
                      id="vagaDrive"
                      value={vagaDrive} 
                      onChange={(e) => setVagaDrive(Number(e.target.value))} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.sectionsRow}>
            <div className={styles.configSection}>
              <h3>Impressora</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="printerName">Nome da Impressora:</label>
                  <input 
                    type="text" 
                    id="printerName"
                    value={printerName} 
                    onChange={(e) => setPrinterName(e.target.value)} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="printerPort">Porta da Impressora:</label>
                  <select 
                    id="printerPort"
                    value={printerPort} 
                    onChange={(e) => setPrinterPort(e.target.value)}
                  >
                    {COM_PORT_OPTIONS.map(port => (
                      <option key={port} value={port}>{port}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.configSection}>
              <h3>Fiscal e TEF/Pinpad</h3>
              <div className={styles.formGroup}>
                <label htmlFor="pinpadPort">Porta do Pinpad:</label>
                <select 
                  id="pinpadPort"
                  value={pinpadPort} 
                  onChange={(e) => setPinpadPort(e.target.value)}
                >
                  {COM_PORT_OPTIONS.map(port => (
                    <option key={port} value={port}>{port}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className={styles.configSection}>
            <h3>Configurações de Loja</h3>
            <div className={styles.formGroup}>
              <label htmlFor="retailerId">retailerId:</label>
              <input 
                type="text" 
                id="retailerId"
                value={retailerId} 
                onChange={(e) => setRetailerId(e.target.value)} 
              />
            </div>
            
            {ambiente === 'ONLINE' && (
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="storeServerId">REACT_APP_STORE_SERVER_ID:</label>
                  <input 
                    type="number" 
                    id="storeServerId"
                    value={storeServerId} 
                    onChange={(e) => setStoreServerId(Number(e.target.value))} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="storeFranchiseId">REACT_APP_STORE_FRANCHISE_ID:</label>
                  <input 
                    type="number" 
                    id="storeFranchiseId"
                    value={storeFranchiseId} 
                    onChange={(e) => setStoreFranchiseId(Number(e.target.value))} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="storeId">REACT_APP_STORE_ID:</label>
                  <input 
                    type="number" 
                    id="storeId"
                    value={storeId} 
                    onChange={(e) => setStoreId(Number(e.target.value))} 
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.configSection}>
            <h3>Configurações de URLs</h3>
            {ambiente === 'ONLINE' ? (
              <div className={styles.formGroup}>
                <label htmlFor="baseApiUrl">Base URL (Ex: api.autoatendimentoone.com):</label>
                <input 
                  type="text" 
                  id="baseApiUrl"
                  value={baseApiUrl} 
                  onChange={(e) => setBaseApiUrl(e.target.value)} 
                />
              </div>
            ) : (
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="offlineIp">IP/Hostname do servidor offline:</label>
                  <input 
                    type="text" 
                    id="offlineIp"
                    value={offlineIp} 
                    onChange={(e) => setOfflineIp(e.target.value)} 
                  />
                </div>
              </div>
            )}
            
            <div className={styles.urlPreviewBox}>
              <h4>Preview dos endpoints:</h4>
              <ul>
                {ambiente === 'ONLINE' ? (
                  <>
                    <li><strong>REACT_APP_BFF_ENDPOINT:</strong> https://{baseApiUrl}/bff</li>
                    <li><strong>REACT_APP_API_ENDPOINT_PRODUCTSALL:</strong> https://{baseApiUrl}/api</li>
                    <li><strong>REACT_APP_CASHDESK_ENDPOINT:</strong> https://{baseApiUrl}/cashdesk</li>
                    <li><strong>REACT_APP_DEGUST_ONE_ORDER_ENDPOINT:</strong> https://{baseApiUrl}/order</li>
                    <li><strong>REACT_APP_ROUTING_ENDPOINT:</strong> https://{baseApiUrl}/routing</li>
                    <li><strong>REACT_APP_SOCKETMANAGER_ENDPOINT:</strong> https://{baseApiUrl}/socketmanager</li>
                  </>
                ) : (
                  <>
                    <li><strong>REACT_APP_BFF_ENDPOINT:</strong> http://{offlineIp}:3334</li>
                    <li><strong>REACT_APP_API_ENDPOINT_PRODUCTSALL:</strong> http://{offlineIp}:3333</li>
                  </>
                )}
                <li><strong>REACT_APP_RESHOP_ENDPOINT:</strong> https://{baseApiUrl}</li>
              </ul>
            </div>
          </div>
          
          <div className={styles.actionButtons}>
            <button 
              onClick={handleCopyToClipboard} 
              className={styles.copyButton}
            >
              Copiar para Área de Transferência
            </button>
            <button 
              onClick={handleClearSessionStorage} 
              className={styles.clearButton}
            >
              Limpar Sessão
            </button>
          </div>
        </div>
        
        <div className={styles.jsonEditorPanel}>
          <h3>Editor JSON</h3>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
          
          <div className={styles.editorContainer}>
            <Editor
              height="100%"
              language="json"
              value={jsonContent}
              onChange={(value) => setJsonContent(value || '')}
              options={{
                minimap: { enabled: false },
                formatOnPaste: true,
                formatOnType: true,
                automaticLayout: true,
                wordWrap: 'on'
              }}
              onMount={handleEditorDidMount}
            />
          </div>
        </div>
      </div>
      
      {/* Modal de senha */}
      {mostrarDialogoSenha && (
        <div className={styles.passwordModal}>
          <div className={styles.passwordModalContent}>
            <h3>Desbloquear Alteração de Ambiente</h3>
            <p>Para alterar manualmente o ambiente, digite a senha:</p>
            <input
              type="password"
              value={senhaTentativa}
              onChange={(e) => setSenhaTentativa(e.target.value)}
              placeholder="Digite a senha"
              className={styles.passwordInput}
            />
            {senhaErro && <div className={styles.passwordError}>{senhaErro}</div>}
            <div className={styles.passwordModalButtons}>
              <button 
                onClick={() => setMostrarDialogoSenha(false)}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button 
                onClick={handleVerificarSenha}
                className={styles.confirmButton}
              >
                Desbloquear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigJsonPage;