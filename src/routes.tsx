import { RouteObject } from 'react-router-dom';
import PagesLayout from './pages';
import Main from './pages/Main';
// import Logs from './pages/Logs';
import ConfigJson from './pages/ConfigJson'; // Importando do caminho correto
// import EnvBack from './pages/EnvBack';
import Firebird from './pages/Firebird';

const routes: RouteObject[] = [
  {
    element: <PagesLayout />,
    children: [
      {  index: true, element: <Main /> },
      // { path: 'logs', element: <Logs /> },
      { path: 'config-json', element: <ConfigJson /> }, // Adicionando a rota config-json
      // { path: 'env', element: <EnvBack /> },
      { path: 'firebird', element: <Firebird /> },
    ],
  },
];

export default routes;
