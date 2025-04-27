import { useState } from 'react';
import type { MainProps, DashboardItem } from './types';
import Dashboard from './Dashboard';
import DetailConfig from './Dashboard/DetailConfig';
import DetailEnv from './Dashboard/DetailEnv';
import styles from './MainContent.module.css';

const defaultItems: DashboardItem[] = [
  {
    id: 'config',
    label: 'Config.json',
    path: 'C:/AutoAtendimentoOne/pdv_cloud/config.json',
  },
  {
    id: 'env',
    label: '.env (Back-End)',
    path: 'C:/AutoAtendimentoOne/auto-atendimento-api/.env',
  },
  // … outros se quiser
];

export default function MainContent({ title, description, actions }: MainProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <main className={styles.content}>
      <h1>{title}</h1>
      <p>{description}</p>

      <div className={styles.dashboardContainer}>
        <div className={styles.menu}>
          <h2>Mini Dashboard</h2>
          <Dashboard
            items={defaultItems}
            selectedId={selected}
            onSelect={setSelected}
          />
        </div>

        <div className={styles.detail}>
          {!selected && <p>Selecione um item à esquerda para ver detalhes.</p>}
          {selected === 'config' && <DetailConfig />}
          {selected === 'env'    && <DetailEnv />}
        </div>
      </div>

      <section className="action-buttons">
        {actions.map(({ label, onClick }, idx) => (
          <button key={idx} onClick={onClick}>{label}</button>
        ))}
      </section>
    </main>
  );
}
