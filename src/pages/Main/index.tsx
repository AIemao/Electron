import React from 'react';
import MainContent from './MainContent';
import type { Action } from './types';
import { useNavigate } from 'react-router-dom';

const Main = (): React.ReactElement => {
  const navigate = useNavigate();
  const actions: Action[] = [
    { label: 'Verificar Configurações', onClick: () => navigate('/config') },
    { label: 'Editar Config.json', onClick: () => navigate('/config-json') }, // Nova ação
    { label: 'Limpar Cache',               onClick: () => {/* … */} },
    { label: 'Executar Migration',         onClick: () => {/* … */} },
  ];

  return (
    <div className="main-container">
      <MainContent
        title="Bem-vindo ao Assistente de Desenvolvimento"
        description="Ferramenta de produtividade para gerenciamento de ambientes AAONE"
        actions={actions}
      />
    </div>
  );
};

export default Main;
