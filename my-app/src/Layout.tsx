import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./assets/footer/Footer";
import Header from "./assets/header/Header";
import Breadcrumb from "./components/Breadcrumb/Breadcrumb";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col">
      <Header />
      <Breadcrumb />
      <main className="flex-1">
        {children || <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
