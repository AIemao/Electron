import React from 'react';
import { Outlet } from 'react-router-dom';
// import Header from '../components/Header';   // caminho ajustado
// import Footer from '../components/Footer';   // caminho ajustado

const PagesLayout = (): React.ReactElement => {
  return (
    <div className="pages-container">
      {/* <Header />                              Aparece em todas as páginas */}
      <main className="content-area">
        <Outlet />                            {/* Onde cada página será injetada */}
      </main>
      {/* <Footer />                              Aparece em todas as páginas */}
    </div>
  );
};

export default PagesLayout;
