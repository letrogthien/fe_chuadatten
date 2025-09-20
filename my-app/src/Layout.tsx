import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./assets/footer/Footer";
import Header from "./assets/header/Header";
import Breadcrumb from "./components/Breadcrumb/Breadcrumb";
import WebSocketStatus from "./components/WebSocketStatus/WebSocketStatus";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Breadcrumb />
      <main className="flex-1">
        {children || <Outlet />}
      </main>
      <Footer />
      <WebSocketStatus />
    </div>
  );
};

export default Layout;
