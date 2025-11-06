// src/components/Layout.tsx
import { useState } from "react";
import Sidebar from "./Sidebar";
import Headers from "./Headers";
import "../index.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[var(--bg-main-dark)] text-gray-900 dark:text-gray-100 transition-colors">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-60" : "w-20"
        } hidden md:flex transition-all duration-300`}
      >
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Headers toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[var(--bg-main-dark)] transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
