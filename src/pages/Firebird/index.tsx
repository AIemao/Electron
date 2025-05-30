import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FirebirdPage.module.css';

const defaultConfig = {
  host: 'localhost',
  port: 3050,
  database: 'C:\\DegustWin\\Dados\\DEGUST.FDB',
  user: 'SYSDBA',
  password: 'masterkey',
};

const defaultFolder = 'C:\\DegustWin';

const quickActions = [
  {
    label: 'Abrir Caixa (Primeiro Dia)',
    sql: `
      UPDATE CAIXASITUACAO SET CAI_ABERTO = 'N';
      COMMIT WORK;
      UPDATE CAIXA SET CAI_SITUACAO = 'F';
      COMMIT WORK;
      UPDATE CAIXASITUACAOPDV SET CAI_ABERTO = 'N';
      COMMIT WORK;
      INSERT INTO CAIXASITUACAO (LOJ_CODIGO, CAI_DATA, CAI_ABERTO, CAI_SNHEMERG, CAI_EXPORTADO, DPE_CODIGO, CAI_DOTZEXPORTADO) VALUES (1, current_date, 'S', 'N', 'N', NULL, NULL);
      COMMIT WORK;
      INSERT INTO CAIXA (LOJ_CODIGO, PDV_CODIGO, CAI_DATA, CAI_ABERTURA, CAI_SITUACAO, CAI_VLRINICIAL, CAI_HRABERTURA, CAI_HRREDUCAO, CAI_OPERADOR, CAI_GERENTE, CAI_EXPLICACAO) VALUES (1, 1, current_date, 1, 'A', 10, NULL, NULL, 1, 1, NULL);
      COMMIT WORK;
      INSERT INTO CAIXASITUACAOPDV (LOJ_CODIGO, CAI_DATA, PDV_CODIGO, CAI_ABERTO) VALUES (1, current_date, 1, 'S');
      COMMIT WORK;
    `,
  },
  // Adicione outras ações rápidas aqui
];

const FirebirdPage: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState(defaultConfig);
  const [sql, setSql] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [upgradeExists, setUpgradeExists] = useState<boolean | null>(null);
  const [upgradePath, setUpgradePath] = useState<string>(defaultFolder);

  useEffect(() => {
    if (window.electron?.checkUpgradeSQL) {
      window.electron.checkUpgradeSQL(upgradePath)
        .then(res => setUpgradeExists(res.exists))
        .catch(() => setUpgradeExists(false));
    } else {
      setUpgradeExists(false);
    }
  }, [upgradePath]);

  const handleExec = async (sqlToRun: string) => {
    setLoading(true);
    setOutput(null);
    try {
      if (window.electron?.firebirdExec) {
        const res = await window.electron.firebirdExec(config, sqlToRun);
        if (res.success) {
          setOutput('Comando executado com sucesso!');
        } else {
          setOutput('Erro: ' + res.error);
        }
      } else {
        setOutput('API Electron não disponível');
      }
    } catch {
      setOutput('Erro inesperado');
    }
    setLoading(false);
  };

  // Adicione na FirebirdPage um exemplo de como usar a verificação de campo
  const handleCheckField = async () => {
    const result = await window.electron?.firebirdFieldExists?.(config, 'CAIXA', 'CAI_SITUACAO');
    if (result) {
      setOutput(result.exists ? 'Campo existe!' : 'Campo não existe!');
    }
  };

  return (
    <div className={styles.fullScreenContainer}>
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => navigate(-1)}
          title="Voltar"
        >
          ←
        </button>
        <h2 className={styles.title}>Consulta PDV Delphi (Firebird)</h2>
      </header>
      <main className={styles.mainContent}>
        <section className={styles.section}>
          <h3>Configuração da Conexão</h3>
          <div>
            <label>Database File:</label>
            <input
              value={config.database}
              onChange={(e) =>
                setConfig({ ...config, database: e.target.value })
              }
            />
            <label>User:</label>
            <input
              value={config.user}
              onChange={(e) => setConfig({ ...config, user: e.target.value })}
            />
            <label>Password:</label>
            <input
              type="password"
              value={config.password}
              onChange={(e) =>
                setConfig({ ...config, password: e.target.value })
              }
            />
          </div>
        </section>
        <section className={styles.section}>
          <h3>Ações Rápidas</h3>
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleExec(action.sql)}
              disabled={loading}
              style={{ marginRight: 8, marginBottom: 8 }}
            >
              {action.label}
            </button>
          ))}
        </section>
        <section className={styles.section}>
          <h3>Executar SQL Livre</h3>
          <textarea
            rows={6}
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            style={{ width: '100%' }}
          />
          <button onClick={() => handleExec(sql)} disabled={loading || !sql.trim()}>
            Executar
          </button>
        </section>
        <section className={styles.section}>
          <h3>UpgradeSQL</h3>
          <div>
            <label>
              Pasta do UpgradeSQL.exe:
              <input
                value={upgradePath}
                onChange={e => setUpgradePath(e.target.value)}
                style={{ width: 300, marginLeft: 8 }}
              />
            </label>
            <span style={{ marginLeft: 16 }}>
              {upgradeExists === null
                ? 'Verificando...'
                : upgradeExists
                  ? 'UpgradeSQL.exe encontrado ✅'
                  : 'UpgradeSQL.exe NÃO encontrado ❌'}
            </span>
          </div>
        </section>
        <section className={styles.section}>
          <h3>Verificação de Campo</h3>
          <button onClick={handleCheckField} disabled={loading}>
            Verificar se campo CAI_SITUACAO existe na tabela CAIXA
          </button>
        </section>
        {output && (
          <section className={styles.section}>
            <h3>Resultado</h3>
            <pre>{output}</pre>
          </section>
        )}
      </main>
    </div>
  );
};

export default FirebirdPage;