import type { View } from "../App";
import { SiGithub } from "react-icons/si";
import {
  LayoutDashboard,
  MessageSquare,
  History,
  Info,
  Upload,
} from "lucide-react";

interface SidebarProps {
  activePage: View;
  onNavigate: (view: View) => void;
  onUploadClick: () => void;
}

const navItems: { view: View; label: string; icon: typeof LayoutDashboard }[] = [
  { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { view: "chat", label: "Chat Assistant", icon: MessageSquare },
  { view: "history", label: "Query History", icon: History },
  { view: "about", label: "About QueryWise", icon: Info },
];

export default function Sidebar({ activePage, onNavigate, onUploadClick }: SidebarProps) {
  return (
    <aside className="w-60 flex flex-col border-r border-border bg-elevated shrink-0">
      {/* Brand */}
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-border">
        <div className="size-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold">
          QW
        </div>
        <span className="font-semibold text-sm text-foreground">QueryWise AI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 p-3">
        {navItems.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-out active:scale-[0.98] ${
              activePage === view
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted hover:text-foreground hover:bg-surface/60"
            }`}
          >
            <Icon size={18} strokeWidth={activePage === view ? 2.5 : 1.8} />
            {label}
          </button>
        ))}

        {/* Upload */}
        <button
          onClick={onUploadClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-out active:scale-[0.98] text-muted hover:text-foreground hover:bg-surface/60 mt-1"
        >
          <Upload size={18} strokeWidth={1.8} />
          Upload Dataset
        </button>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface/60 transition-colors duration-150"
        >
          <SiGithub size={16} />
          Source
        </a>
      </div>
    </aside>
  );
}