import { RouteObject } from 'react-router-dom';
import PagesLayout from './pages';
import Main from './pages/Main';
// import Logs from './pages/Logs';
// import ConfigJson from './pages/ConfigJson';
// import EnvBack from './pages/EnvBack';
// import Firebird from './pages/Firebird';

const routes: RouteObject[] = [
  {
    element: <PagesLayout />,
    children: [
      { path: '/', element: <Main /> },
      // { path: 'logs', element: <Logs /> },
      // { path: 'config', element: <ConfigJson /> },
      // { path: 'env', element: <EnvBack /> },
      // { path: 'firebird', element: <Firebird /> },
    ],
  },
];

export default routes;