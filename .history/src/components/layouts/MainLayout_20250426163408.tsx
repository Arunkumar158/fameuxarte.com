import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/auth";

  return (
    <div className={`w-full ${isAuthPage ? "pt-16 md:pt-0" : ""}`}>
      {children}
    </div>
  );
};

export default MainLayout;
