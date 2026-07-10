import { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import DashboardHome from "./components/DashboardHome";
import ChatInterface from "./components/ChatInterface";
import UploadModal from "./components/UploadModal";
import HistoryPage from "./components/HistoryPage";
import AboutPage from "./components/AboutPage";
import HackathonBanner from "./components/HackathonBanner";
import type { UploadResponse } from "./services/api";

export type View = "dashboard" | "chat" | "history" | "about" | "banner";

export interface QueryHistoryItem {
  id: string;
  question: string;
  sql: string;
  executionTime: string;
  rowsReturned: number;
  engine: string;
  timestamp: number;
  costSaved: number;
  complexity: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedDataset, setUploadedDataset] = useState<UploadResponse | null>(null);
  const [uploadVersion, setUploadVersion] = useState(0);
  const [uploadCount, setUploadCount] = useState(0);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [initialQuestion, setInitialQuestion] = useState("");

  const handleUploadClick = useCallback(() => {
    setShowUploadModal(true);
  }, []);

  const handleUploadSuccess = useCallback((result: UploadResponse) => {
    setUploadedDataset(result);
    setUploadVersion((v) => v + 1);
    setUploadCount((c) => c + 1);
    setShowUploadModal(false);
    setCurrentView("chat");
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowUploadModal(false);
  }, []);

  const handleSaveQuery = useCallback((item: QueryHistoryItem) => {
    setQueryHistory((prev) => [item, ...prev]);
  }, []);

  const handleNavigateToChat = useCallback(() => {
    setCurrentView("chat");
  }, []);

  const handleSelectQuery = useCallback((question: string) => {
    setInitialQuestion(question);
    setCurrentView("chat");
  }, []);

  const handleClearInitialQuestion = useCallback(() => {
    setInitialQuestion("");
  }, []);

  return (
    <div className="flex h-dvh bg-surface text-foreground antialiased">
      <Sidebar
        activePage={currentView}
        onNavigate={setCurrentView}
        onUploadClick={handleUploadClick}
      />

      <main className="flex-1 flex flex-col min-w-0 relative">
        {currentView === "dashboard" && (
          <DashboardHome
            uploadedDataset={uploadedDataset}
            uploadVersion={uploadVersion}
            uploadCount={uploadCount}
            queryCount={queryHistory.length}
            onUploadClick={handleUploadClick}
            onNavigateToChat={handleNavigateToChat}
          />
        )}
        {currentView === "chat" && (
          <ChatInterface
            uploadedDataset={uploadedDataset}
            uploadVersion={uploadVersion}
            onSaveQuery={handleSaveQuery}
            initialQuestion={initialQuestion}
            onClearInitialQuestion={handleClearInitialQuestion}
          />
        )}
        {currentView === "history" && (
          <HistoryPage
            history={queryHistory}
            onNavigateToChat={handleNavigateToChat}
            onSelectQuery={handleSelectQuery}
          />
        )}
        {currentView === "about" && <AboutPage />}
        {currentView === "banner" && (
          <div className="flex-1 flex items-center justify-center bg-[#060b1e]">
            <HackathonBanner />
          </div>
        )}
      </main>

      {showUploadModal && (
        <UploadModal
          onClose={handleCloseModal}
          onSuccess={handleUploadSuccess}
          onNavigateToChat={handleNavigateToChat}
        />
      )}
    </div>
  );
}