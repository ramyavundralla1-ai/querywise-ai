import { useState, useMemo } from "react";
import { ClockIcon, SearchIcon, FileIcon, MessageIcon, ChevronRightIcon } from "./Icons";
import type { QueryHistoryItem } from "../App";

interface HistoryPageProps {
  history: QueryHistoryItem[];
  onSelectQuery: (question: string) => void;
  onNavigateToChat: () => void;
}

export default function HistoryPage({ history, onSelectQuery, onNavigateToChat }: HistoryPageProps) {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const filtered = useMemo(() => {
    if (!search.trim()) return history;
    const q = search.toLowerCase();
    return history.filter(
      (h) =>
        h.question.toLowerCase().includes(q) ||
        h.sql.toLowerCase().includes(q) ||
        h.engine.toLowerCase().includes(q)
    );
  }, [history, search]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sortOrder === "newest") copy.sort((a, b) => b.timestamp - a.timestamp);
    else copy.sort((a, b) => a.timestamp - b.timestamp);
    return copy;
  }, [filtered, sortOrder]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (history.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-card border border-border flex items-center justify-center">
            <ClockIcon className="w-8 h-8 text-foreground-muted" />
          </div>
          <h2 className="text-xl font-heading font-semibold text-foreground mb-2">No query history yet</h2>
          <p className="text-foreground-muted mb-6">
            Every question you ask the QueryWise Intelligent SQL Engine will appear here. Start exploring your data!
          </p>
          <button
            onClick={onNavigateToChat}
            className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-medium text-sm hover:bg-primary-hover transition-all duration-150 active:scale-[0.97]"
          >
            Ask a question
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Query History</h1>
            <p className="text-foreground-muted text-sm mt-1">
              {history.length} query{history.length !== 1 ? "ies" : "y"} executed
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
              <input
                type="text"
                placeholder="Search queries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 lg:w-64 pl-9 pr-3 py-2 bg-surface-card border border-border rounded-lg text-sm text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>
            {/* Sort */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
              className="py-2 px-3 bg-surface-card border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {/* History list */}
        <div className="space-y-3">
          {sorted.length === 0 ? (
            <div className="text-center py-12">
              <SearchIcon className="w-8 h-8 text-muted mx-auto mb-3" />
              <p className="text-foreground-muted">No queries match your search</p>
            </div>
          ) : (
            sorted.map((entry) => (
              <div
                key={entry.id}
                className="glass-card rounded-xl p-4 hover:bg-surface-elevated/80 transition-all duration-150 cursor-pointer group"
                onClick={() => {
                  onSelectQuery(entry.question);
                  onNavigateToChat();
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageIcon className="w-4 h-4 text-primary flex-shrink-0" />
                      <p className="text-foreground font-medium truncate">{entry.question}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-foreground-muted">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {formatTime(entry.timestamp)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileIcon className="w-3 h-3" />
                        {entry.rowsReturned} row{entry.rowsReturned !== 1 ? "s" : ""}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {entry.engine}
                      </span>
                      {entry.executionTime !== undefined && (
                        <span>{parseFloat(entry.executionTime).toFixed(1)}s</span>
                      )}
                    </div>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-muted group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

