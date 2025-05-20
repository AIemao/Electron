import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FirebirdPage.module.css';

const FirebirdPage: React.FC = () => {
  const navigate = useNavigate();

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
          <h3>Bem-vindo ao módulo de consulta do PDV Delphi</h3>
          <p>
            Aqui você poderá consultar e editar informações do banco Firebird do PDV Delphi, verificar versão, CNPJ, listar PDVs e executar operações específicas conforme o roadmap.
          </p>
        </section>
      </main>
    </div>
  );
};

export default FirebirdPage;