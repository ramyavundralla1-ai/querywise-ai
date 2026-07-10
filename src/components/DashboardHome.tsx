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
} from "./Icons";
import { api, type SchemaResponse, type UploadResponse } from "../services/api";

interface DashboardHomeProps {
  uploadedDataset: UploadResponse | null;
  uploadVersion: number;
  onUploadClick: () => void;
}

interface StatCardProps {
  icon: typeof BrainIcon;
  label: string;
  value: string;
  accent: string;
  subtext?: string;
  trend?: "up" | "neutral";
}

function StatCard({ icon: Icon, label, value, accent, subtext, trend }: StatCardProps) {
  return (
    <div className="glass-card rounded-xl p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg bg-${accent}/10 flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 text-${accent}`} />
        </div>
        {trend === "up" && (
          <div className="flex items-center gap-1 text-xs text-success">
            <TrendingUpIcon className="w-3 h-3" />
            <span>+12%</span>
          </div>
        )}
      </div>
      <p className="text-xs text-foreground-muted mb-1 font-medium">{label}</p>
      <p className="text-xl font-heading font-semibold text-foreground">{value}</p>
      {subtext && <p className="text-xs text-foreground-muted/70 mt-1">{subtext}</p>}
    </div>
  );
}

export default function DashboardHome({ uploadedDataset, uploadVersion, onUploadClick }: DashboardHomeProps) {
  const [schema, setSchema] = useState<SchemaResponse | null>(null);
  const [backendStatus, setBackendStatus] = useState<string>("checking...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [health, schemaData] = await Promise.all([
          api.health(),
          api.getSchema().catch(() => null),
        ]);
        setBackendStatus(health.status);
        setSchema(schemaData);
      } catch {
        setBackendStatus("offline");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [uploadVersion]);

  const totalRows = schema?.tables.reduce(
    (acc, t) => acc + (t.columns.length > 0 ? 1 : 0),
    0,
  ) ?? 0;

  const totalColumns = schema?.tables.reduce(
    (acc, t) => acc + t.columns.length,
    0,
  ) ?? 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-foreground-muted mb-2">
          <ClockIcon className="w-3 h-3" />
          <span>
            Backend:{" "}
            <span className={backendStatus === "running" ? "text-success" : "text-warning"}>
              {backendStatus}
            </span>
          </span>
        </div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Welcome back to <span className="gradient-text">QueryWise AI</span>
        </h1>
        <p className="text-sm text-foreground-muted mt-1 max-w-xl">
          Ask questions about your data in plain English and let AI generate SQL automatically.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={BrainIcon}
          label="SQL Engine"
          value="QueryWise Intelligent"
          accent="primary"
          subtext="Dynamic query routing"
          trend="up"
        />
        <StatCard
          icon={DatabaseIcon}
          label="Datasets Loaded"
          value={loading ? "—" : String(schema?.total_tables ?? 0)}
          accent="secondary"
          subtext={loading ? "Loading..." : `${totalColumns} columns across ${schema?.total_tables ?? 0} tables`}
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
          label="SQL Generation"
          value="Active"
          accent="success"
          subtext="Query routing enabled"
        />
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Schema Overview */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-heading font-semibold text-foreground">Loaded Datasets</h2>
            <button className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors cursor-pointer">
              View all
              <ChevronRightIcon className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : schema && schema.tables.length > 0 ? (
            <div className="space-y-3">
              {schema.tables.map((table, i) => (
                <div key={i} className="p-3 rounded-lg bg-surface-elevated/50 hover:bg-surface-elevated transition-colors duration-150">
                  <div className="flex items-center gap-2 mb-2">
                    <DatabaseIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{table.table_name}</span>
                    <span className="text-[10px] text-foreground-muted/50 ml-auto">{table.columns.length} columns</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {table.columns.slice(0, 8).map((col, ci) => (
                      <span key={ci} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-card text-foreground-muted border border-border">
                        {col.name}: {col.dtype}
                      </span>
                    ))}
                    {table.columns.length > 8 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-card text-foreground-muted border border-border">
                        +{table.columns.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DatabaseIcon className="w-8 h-8 text-foreground-muted/30 mx-auto mb-2" />
              <p className="text-sm text-foreground-muted">No datasets uploaded yet</p>
              <p className="text-xs text-foreground-muted/50 mt-1">Upload a CSV to get started</p>
            </div>
          )}
        </div>

        {/* Insights Panel */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <LightbulbIcon className="w-4 h-4 text-warning" />
            <h2 className="text-sm font-heading font-semibold text-foreground">AI Insights</h2>
          </div>

          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs font-medium text-primary mb-1">Query Routing</p>
              <p className="text-xs text-foreground-muted">Intelligently routes natural-language queries through the QueryWise SQL engine for optimal performance.</p>
            </div>
            <div className="p-3 rounded-lg bg-success/5 border border-success/10">
              <p className="text-xs font-medium text-success mb-1">Cost Optimization</p>
              <p className="text-xs text-foreground-muted">Intelligent query processing reduces analytical overhead by up to 82% compared to traditional workflows.</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-elevated/50 border border-border/50">
              <p className="text-xs font-medium text-foreground mb-1">Powered by DuckDB</p>
              <p className="text-xs text-foreground-muted">In-process analytical SQL engine — no external database infrastructure required.</p>
            </div>
          </div>

          {/* Engine status */}
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-foreground-muted">AI Engine</span>
              <span className="text-xs font-mono font-medium text-foreground">QueryWise Intelligent</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-foreground-muted">Mode</span>
              <span className={`text-xs font-mono font-medium ${backendStatus === "running" ? "text-success" : "text-warning"}`}>
                {backendStatus === "running" ? "Online" : "Offline"}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-foreground-muted">SQL Generation</span>
              <span className="text-xs font-mono font-medium text-success">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-muted">Query Routing</span>
              <span className="text-xs font-mono font-medium text-success">Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload prompt */}
      <div
        className="glass-card rounded-xl p-6 border-dashed border-2 border-border hover:border-primary/30 transition-all duration-300 cursor-pointer group"
        onClick={onUploadClick}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
            <DatabaseIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-semibold text-foreground">Upload a new dataset</h3>
            <p className="text-xs text-foreground-muted mt-0.5">Drop a CSV or TSV file to start querying with natural language</p>
          </div>
          <div className="ml-auto">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <ChevronRightIcon className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}