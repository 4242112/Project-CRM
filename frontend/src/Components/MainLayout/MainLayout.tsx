import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './HeaderComponents/Header';
import Sidebar from './SidebarComponents/Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';


const MainLayout: React.FC = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="d-flex flex-grow-1">
        <div style={{ width: '200px', flexShrink: 0 }}>
          <Sidebar />
        </div>
        <main className="flex-grow-1 p-3" style={{ 
          backgroundColor: '#f5f7fa',
          minHeight: 'calc(100vh - 56px)'
        }}>
          <div className="container-fluid">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
