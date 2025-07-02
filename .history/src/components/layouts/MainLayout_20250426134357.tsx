import { ReactNode } from "react";
import Navbar from "../navigation/Navbar";
import Footer from "../navigation/Footer";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/auth";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className={`flex-1 ${isAuthPage ? "pt-16 md:pt-0" : ""}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
