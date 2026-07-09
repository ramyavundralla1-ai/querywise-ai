import {
  BrainIcon,
  DatabaseIcon,
  SparklesIcon,
  DollarIcon,
  TrendingUpIcon,
  ShieldIcon,
  ChartIcon,
  ClockIcon,
  LightbulbIcon,
  ChevronRightIcon,
} from "./Icons";

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

export default function DashboardHome() {
  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-foreground-muted mb-2">
          <ClockIcon className="w-3 h-3" />
          <span>Last updated: Just now</span>
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
          label="AI Model Active"
          value="GPT-4o"
          accent="primary"
          subtext="Optimized for SQL generation"
          trend="up"
        />
        <StatCard
          icon={DatabaseIcon}
          label="Queries Analyzed"
          value="1,284"
          accent="secondary"
          subtext="Across 3 datasets"
        />
        <StatCard
          icon={DollarIcon}
          label="Cost Saved"
          value="$328.42"
          accent="success"
          subtext="vs. traditional analytics"
          trend="up"
        />
        <StatCard
          icon={SparklesIcon}
          label="Accuracy Rate"
          value="94.7%"
          accent="warning"
          subtext="SQL generation accuracy"
        />
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-heading font-semibold text-foreground">Recent Queries</h2>
            <button className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors cursor-pointer">
              View all
              <ChevronRightIcon className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { query: "Show me total sales by region for Q4 2024", status: "Success", time: "2 min ago", sql: "SELECT region, SUM(sales) FROM orders WHERE quarter = 'Q4 2024' GROUP BY region" },
              { query: "Which products have the highest return rate?", status: "Success", time: "15 min ago", sql: "SELECT product_name, return_rate FROM products ORDER BY return_rate DESC" },
              { query: "Compare customer retention across subscription tiers", status: "Processing", time: "1 hr ago", sql: "WITH retention AS (SELECT tier, ...)" },
              { query: "What's the average order value by customer segment?", status: "Success", time: "3 hrs ago", sql: "SELECT segment, AVG(order_value) FROM customers GROUP BY segment" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-elevated transition-colors duration-150">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  item.status === "Success" ? "bg-success" : "bg-warning animate-pulse"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{item.query}</p>
                  <p className="text-xs text-foreground-muted/70 mt-0.5 truncate font-mono">{item.sql}</p>
                </div>
                <span className="text-xs text-foreground-muted/50 flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Panel */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <LightbulbIcon className="w-4 h-4 text-warning" />
            <h2 className="text-sm font-heading font-semibold text-foreground">AI Insights</h2>
          </div>

          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs font-medium text-primary mb-1">Routing Decision</p>
              <p className="text-xs text-foreground-muted">90% of queries routed to GPT-4o for optimal SQL generation accuracy.</p>
            </div>
            <div className="p-3 rounded-lg bg-success/5 border border-success/10">
              <p className="text-xs font-medium text-success mb-1">Cost Optimization</p>
              <p className="text-xs text-foreground-muted">Using query caching saved ~$2.40 in token costs this session.</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/5 border border-warning/10">
              <p className="text-xs font-medium text-warning mb-1">Data Freshness</p>
              <p className="text-xs text-foreground-muted">Uploaded datasets are current as of today at 09:00 UTC.</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-foreground-muted">Avg Response Time</span>
              <span className="text-xs font-mono font-medium text-foreground">1.2s</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-foreground-muted">Success Rate</span>
              <span className="text-xs font-mono font-medium text-success">98.3%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-muted">Dataset Size</span>
              <span className="text-xs font-mono font-medium text-foreground">47.2 MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload prompt */}
      <div className="glass-card rounded-xl p-6 border-dashed border-2 border-border hover:border-primary/30 transition-all duration-300 cursor-pointer group" onClick={() => {}}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
            <DatabaseIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-semibold text-foreground">Upload a new dataset</h3>
            <p className="text-xs text-foreground-muted mt-0.5">Drop a CSV or connect a database to start querying with natural language</p>
          </div>
          <div className="ml-auto">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <ChevronRightIcon className="w-4 h-4 text-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-[10px] text-foreground-muted/40">
        QueryWise AI v1.0 — All metrics are simulated for demo purposes
      </div>
    </div>
  );
}