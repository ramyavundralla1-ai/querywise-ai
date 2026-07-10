import { useEffect, useState } from "react";
import {
  BrainIcon,
  DatabaseIcon,
  SparklesIcon,
  DollarIcon,
  TrendingUpIcon,
  ClockIcon,
  LightbulbIcon,
  ChevronRightIcon,
  RouteIcon,
  MessageIcon,
  HistoryIcon,
} from "./Icons";
import { api, type SchemaResponse, type UploadResponse } from "../services/api";

interface DashboardHomeProps {
  uploadedDataset: UploadResponse | null;
  uploadVersion: number;
  uploadCount: number;
  queryCount: number;
  onUploadClick: () => void;
  onNavigateToChat: () => void;
}

export default function DashboardHome({
  uploadedDataset,
  uploadVersion,
  uploadCount,
  queryCount,
  onUploadClick,
  onNavigateToChat,
}: DashboardHomeProps) {
  const [schema, setSchema] = useState<SchemaResponse | null>(null);
  const [backendStatus, setBackendStatus] = useState<string>("checking…");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const [health, schemaData] = await Promise.all([
          api.health(),
          api.getSchema().catch(() => null),
        ]);
        if (cancelled) return;
        setBackendStatus(health.status);
        setSchema(schemaData);
      } catch {
        if (!cancelled) setBackendStatus("offline");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [uploadVersion]);

  const totalColumns = schema?.tables.reduce(
    (acc, t) => acc + t.columns.length,
    0,
  ) ?? 0;

  const hasData = schema && schema.tables.length > 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in">
      {/* ─── Header ─── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            Backend:{" "}
            <span
              className={
                backendStatus === "running" ? "text-success" : "text-warning"
              }
            >
              {backendStatus}
            </span>
          </span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span className="flex items-center gap-1">
            <DatabaseIcon className="w-3 h-3" />
            {uploadCount} dataset{uploadCount !== 1 ? "s" : ""}
          </span>
          {queryCount > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="flex items-center gap-1">
                <HistoryIcon className="w-3 h-3" />
                {queryCount} query{queryCount !== 1 ? "s" : ""}
              </span>
            </>
          )}
        </div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Welcome back to{" "}
          <span className="gradient-text">QueryWise AI</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-xl">
          Ask questions about your data in plain English and let AI generate
          SQL automatically.
        </p>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={BrainIcon}
          label="SQL Engine"
          value="QueryWise"
          accent="primary"
          subtext="Dynamic routing"
          trend="up"
        />
        <StatCard
          icon={DatabaseIcon}
          label="Datasets"
          value={loading ? "—" : String(schema?.total_tables ?? 0)}
          accent="info"
          subtext={
            loading
              ? "Loading…"
              : `${totalColumns} columns across ${schema?.total_tables ?? 0} tables`
          }
        />
        <StatCard
          icon={DollarIcon}
          label="Cost Saved"
          value="~82%"
          accent="success"
          subtext="vs. traditional analytics"
          trend="up"
        />
        <StatCard
          icon={SparklesIcon}
          label="Status"
          value={backendStatus === "running" ? "Active" : "Offline"}
          accent={backendStatus === "running" ? "success" : "warning"}
          subtext={
            backendStatus === "running"
              ? "Ready to query"
              : "Backend unavailable"
          }
        />
      </div>

      {/* ─── Main Content ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Schema / Datasets panel */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-heading font-semibold text-foreground">
              Loaded Datasets
            </h2>
            {hasData && (
              <button
                onClick={onNavigateToChat}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors cursor-pointer"
              >
                Start querying
                <ChevronRightIcon className="w-3 h-3" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : hasData ? (
            <div className="space-y-3">
              {schema.tables.map((table, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-surface-card/50 hover:bg-surface-card transition-colors duration-150"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <DatabaseIcon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground">
                      {table.table_name}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 ml-auto">
                      {table.columns.length} columns
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {table.columns.slice(0, 8).map((col, ci) => (
                      <span
                        key={ci}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-surface-card text-muted-foreground border border-border"
                      >
                        {col.name}: {col.dtype}
                      </span>
                    ))}
                    {table.columns.length > 8 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-card text-muted-foreground border border-border">
                        +{table.columns.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── Empty state ── */
            <div className="text-center py-10">
              <DatabaseIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">
                No datasets yet
              </p>
              <p className="text-xs text-muted-foreground mt-1 mb-5">
                Upload a CSV or TSV and start asking questions in plain
                English.
              </p>
              <button
                onClick={onUploadClick}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover transition-all active:scale-[0.97] cursor-pointer"
              >
                <DatabaseIcon className="w-3.5 h-3.5" />
                Upload your first dataset
              </button>
            </div>
          )}
        </div>

        {/* ─── Insights / Quick actions ─── */}
        <div className="flex flex-col gap-4">
          <div className="glass-card rounded-xl p-5 flex-1">
            <div className="flex items-center gap-2 mb-4">
              <LightbulbIcon className="w-4 h-4 text-warning" />
              <h2 className="text-sm font-heading font-semibold text-foreground">
                AI Insights
              </h2>
            </div>

            <div className="space-y-3">
              <InsightCard
                title="Query Routing"
                desc="Intelligently routes natural-language queries through the QueryWise SQL engine for optimal performance."
                accent="primary"
              />
              <InsightCard
                title="Cost Optimization"
                desc="Intelligent query processing reduces analytical overhead by up to 82% compared to traditional workflows."
                accent="success"
              />
              <InsightCard
                title="Powered by DuckDB"
                desc="In-process analytical SQL engine — no external database infrastructure required."
                accent="muted"
              />
            </div>

            <div className="mt-5 pt-4 border-t border-border space-y-2.5">
              <StatusRow label="AI Engine" value="QueryWise" />
              <StatusRow
                label="Status"
                value={backendStatus === "running" ? "Online" : "Offline"}
                valueColor={
                  backendStatus === "running" ? "text-success" : "text-warning"
                }
              />
              <StatusRow label="SQL Generation" value="Active" valueColor="text-success" />
              <StatusRow label="Query Routing" value="Enabled" valueColor="text-success" />
            </div>
          </div>

          {/* ── Quick action — Chat ── */}
          {hasData && (
            <button
              onClick={onNavigateToChat}
              className="glass-card rounded-xl p-4 flex items-center gap-3 hover:border-primary/30 transition-all active:scale-[0.98] cursor-pointer text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MessageIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Ask a question
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Try &ldquo;Show me total sales by month&rdquo;
                </p>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-primary shrink-0 ml-auto" />
            </button>
          )}
        </div>
      </div>

      {/* ─── Upload prompt ─── */}
      <button
        onClick={onUploadClick}
        className="w-full glass-card rounded-xl p-6 border-dashed border-2 border-border hover:border-primary/30 transition-all duration-300 cursor-pointer group text-left active:scale-[0.99]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300 shrink-0">
            <DatabaseIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-heading font-semibold text-foreground">
              Upload a new dataset
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Drop a CSV or TSV file to start querying with natural language
            </p>
          </div>
          <div className="ml-auto shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <ChevronRightIcon className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

/* ─── Sub-components ─── */

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: "primary" | "info" | "success" | "warning" | "destructive";
  subtext?: string;
  trend?: "up" | "neutral";
}

function StatCard({ icon: Icon, label, value, accent, subtext, trend }: StatCardProps) {
  const accentVar = `var(--color-${accent})`;
  return (
    <div
      style={{ "--accent": accentVar } as React.CSSProperties}
      className="glass-card rounded-xl p-5 transition-all duration-200 hover:border-[var(--accent)]/30 hover:shadow-lg hover:shadow-[var(--accent)]/5 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accentVar}1a` }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color: accentVar }} />
        </div>
        {trend === "up" && (
          <div className="flex items-center gap-1 text-xs text-success">
            <TrendingUpIcon className="w-3 h-3" />
            <span>+12%</span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-1 font-medium">{label}</p>
      <p className="text-xl font-heading font-semibold text-foreground">
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-muted-foreground/70 mt-1">{subtext}</p>
      )}
    </div>
  );
}

function InsightCard({
  title,
  desc,
  accent,
}: {
  title: string;
  desc: string;
  accent: "primary" | "success" | "muted";
}) {
  const borderMap = {
    primary: "border-primary/10",
    success: "border-success/10",
    muted: "border-border/50",
  };
  const bgMap = {
    primary: "bg-primary/5",
    success: "bg-success/5",
    muted: "bg-surface-elevated/50",
  };
  const textMap = {
    primary: "text-primary",
    success: "text-success",
    muted: "text-foreground",
  };

  return (
    <div
      className={`p-3 rounded-lg ${bgMap[accent]} border ${borderMap[accent]}`}
    >
      <p className={`text-xs font-medium ${textMap[accent]} mb-1`}>{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}

function StatusRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-xs font-mono font-medium ${
          valueColor ?? "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}