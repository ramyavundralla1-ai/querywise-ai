import { useState } from "react";
import Sidebar from "./components/Sidebar";
import DashboardHome from "./components/DashboardHome";
import ChatInterface from "./components/ChatInterface";

type View = "dashboard" | "chat";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");

  return (
    <div className="flex h-dvh bg-background text-foreground antialiased">
      <Sidebar activePage={currentView} onNavigate={setCurrentView} onUploadClick={() => setCurrentView("chat")} />
      <main className="flex-1 flex flex-col min-w-0 relative">
        {currentView === "dashboard" && <DashboardHome />}
        {currentView === "chat" && <ChatInterface />}
      </main>
    </div>
  );
}