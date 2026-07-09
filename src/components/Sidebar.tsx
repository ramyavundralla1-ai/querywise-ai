import { BrainIcon, HomeIcon, MessageIcon, HistoryIcon, UploadIcon, DatabaseIcon, SparklesIcon, DollarIcon, ChevronRightIcon, RouteIcon } from "./Icons";

type NavPage = "dashboard" | "chat";

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  onUploadClick: () => void;
}

export default function Sidebar({ activePage, onNavigate, onUploadClick }: SidebarProps) {
  const navItems = [
    { id: "dashboard" as NavPage, label: "Dashboard", icon: HomeIcon },
    { id: "chat" as NavPage, label: "Chat Assistant", icon: MessageIcon },
  ];

  const modelInfo = {
    name: "GPT-4o",
    provider: "OpenAI",
    tokensUsed: 128_432,
    estimatedCost: 0.64,
    costSavings: 82,
    complexity: "Medium",
  };

  return (
    <aside className="w-[260px] min-h-screen bg-surface border-r border-border flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-heading font-semibold text-foreground">QueryWise</h1>
            <p className="text-[10px] text-foreground-muted tracking-wider uppercase">AI Data Copilot</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 pt-4 pb-2">
        <p className="text-[10px] text-foreground-muted uppercase tracking-wider px-2 mb-2 font-medium">Navigation</p>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-foreground-muted hover:text-foreground hover:bg-surface-card"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? "text-primary" : ""}`} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Upload Button */}
      <div className="px-3 pt-3">
        <button
          onClick={onUploadClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-all duration-200 active:scale-[0.97] cursor-pointer shadow-lg shadow-primary/20"
        >
          <UploadIcon className="w-4 h-4" />
          Upload Dataset
        </button>
      </div>

      {/* Model Info */}
      <div className="flex-1 px-3 pt-6 pb-3 overflow-y-auto">
        <p className="text-[10px] text-foreground-muted uppercase tracking-wider px-2 mb-2 font-medium">Session Info</p>
        <div className="glass-card rounded-xl p-4 space-y-3.5">
          {/* Model */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <BrainIcon className="w-3.5 h-3.5" />
              <span>AI Model</span>
            </div>
            <span className="text-xs font-medium text-foreground">{modelInfo.name}</span>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Token Usage */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <DatabaseIcon className="w-3.5 h-3.5" />
              <span>Tokens Used</span>
            </div>
            <span className="text-xs font-mono text-foreground">{modelInfo.tokensUsed.toLocaleString()}</span>
          </div>

          {/* Cost */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <DollarIcon className="w-3.5 h-3.5" />
              <span>Est. Cost</span>
            </div>
            <span className="text-xs font-mono font-medium text-foreground">${modelInfo.estimatedCost.toFixed(2)}</span>
          </div>

          {/* Savings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <ChevronRightIcon className="w-3.5 h-3.5" />
              <span>Cost Savings</span>
            </div>
            <span className="text-xs font-mono font-medium text-success">{modelInfo.costSavings}%</span>
          </div>

          {/* Complexity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <RouteIcon className="w-3.5 h-3.5" />
              <span>Complexity</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {modelInfo.complexity}
            </span>
          </div>
        </div>

        {/* History Button */}
        <button className="w-full mt-3 flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs text-foreground-muted hover:text-foreground hover:bg-surface-card transition-all duration-200 cursor-pointer">
          <HistoryIcon className="w-3.5 h-3.5" />
          <span>View Chat History</span>
          <ChevronRightIcon className="w-3 h-3 ml-auto" />
        </button>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border">
        <p className="text-[10px] text-foreground-muted/60 text-center">
          QueryWise AI v1.0 · Powered by AI
        </p>
      </div>
    </aside>
  );
}