import { useState } from "react";
import type { View } from "../App";
import { SiGithub } from "react-icons/si";
import {
  LayoutDashboard,
  MessageSquare,
  History,
  Info,
  Upload,
  ChevronLeft,
  ChevronRight,
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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col border-r border-border bg-surface shrink-0 transition-all duration-200 ease-out ${
        collapsed ? "w-[60px]" : "w-60"
      }`}
    >
      {/* Brand */}
      <div
        className={`h-14 flex items-center border-b border-border ${
          collapsed ? "justify-center px-0" : "gap-2.5 px-5"
        }`}
      >
        {collapsed ? (
          <div className="size-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold shadow-glow-sm">
            QW
          </div>
        ) : (
          <>
            <div className="size-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold shadow-glow-sm">
              QW
            </div>
            <span className="font-semibold text-sm text-foreground">QueryWise AI</span>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 p-2">
        {navItems.map(({ view, label, icon: Icon }) => {
          const isActive = activePage === view;
          return (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              title={collapsed ? label : undefined}
              className={`relative flex items-center rounded-lg text-sm font-medium transition-all duration-150 ease-out active:scale-[0.97] cursor-pointer ${
                collapsed ? "justify-center w-full h-10" : "gap-3 px-3 py-2.5"
              } ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-card/60"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full shadow-glow-sm" />
              )}
              <div className="relative">
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                {isActive && (
                  <span className="absolute inset-0 animate-glow-pulse rounded-full opacity-40" />
                )}
              </div>
              {!collapsed && <span>{label}</span>}
            </button>
          );
        })}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex items-center rounded-lg text-sm font-medium transition-all duration-150 ease-out active:scale-[0.97] cursor-pointer text-muted-foreground hover:text-foreground hover:bg-surface-card/60 ${
            collapsed ? "justify-center w-full h-10 mt-auto" : "gap-3 px-3 py-2.5 mt-auto"
          }`}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} strokeWidth={1.8} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </nav>

      {/* Upload */}
      <div className="p-2 border-t border-border">
        <button
          onClick={onUploadClick}
          title="Upload Dataset"
          className={`flex items-center rounded-lg text-sm font-medium transition-all duration-150 ease-out active:scale-[0.97] cursor-pointer bg-primary-10 text-primary hover:bg-primary-20 ${
            collapsed ? "justify-center w-full h-10" : "gap-2.5 px-3 py-2.5"
          }`}
        >
          <Upload size={16} />
          {!collapsed && <span>Upload Dataset</span>}
        </button>

        {/* Footer */}
        {!collapsed && (
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-card/60 transition-colors duration-150 cursor-pointer mt-1"
          >
            <SiGithub size={16} />
            Source
          </a>
        )}
      </div>
    </aside>
  );
}