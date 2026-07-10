import { DatabaseIcon, BrainIcon, RouteIcon, BarChartIcon, ShieldIcon, SparklesIcon, LayersIcon, FileIcon } from "./Icons";

export default function AboutPage() {
  const features = [
    {
      icon: <BrainIcon className="w-5 h-5" />,
      title: "Intelligent SQL Engine",
      desc: "Combines advanced LLM reasoning with pattern-based fallback to translate natural language into precise, efficient SQL queries.",
    },
    {
      icon: <DatabaseIcon className="w-5 h-5" />,
      title: "DuckDB Powered",
      desc: "Fast, in-process analytical SQL engine that processes data directly from CSV, TSV, and Parquet files without a separate database server.",
    },
    {
      icon: <SparklesIcon className="w-5 h-5" />,
      title: "Hybrid Query Generation",
      desc: "Routes simple queries to a fast pattern-based engine and complex ones to the full LLM, optimizing for speed and accuracy.",
    },
    {
      icon: <LayersIcon className="w-5 h-5" />,
      title: "Smart Fallback System",
      desc: "When the LLM is unavailable, the Smart Pattern Engine automatically takes over — generating correct SQL using learned patterns.",
    },
    {
      icon: <BarChartIcon className="w-5 h-5" />,
      title: "Instant Visualizations",
      desc: "Query results are rendered as beautiful, sortable, paginated tables ready for export to CSV or JSON.",
    },
    {
      icon: <ShieldIcon className="w-5 h-5" />,
      title: "Privacy First",
      desc: "Data never leaves your environment. All queries execute locally on DuckDB. Your data stays yours.",
    },
  ];

  const workflow = [
    { step: "1", title: "Upload Data", desc: "Drop a CSV, TSV, or Parquet file" },
    { step: "2", title: "Ask in English", desc: "Type a question about your data" },
    { step: "3", title: "AI Generates SQL", desc: "LLM or pattern engine creates the query" },
    { step: "4", title: "Execute & Explore", desc: "Results appear instantly — export or iterate" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-xs font-medium mb-4">
            <SparklesIcon className="w-3.5 h-3.5" />
            v1.0.0 — Hackathon Edition
          </div>
          <h1 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-3">
            QueryWise AI
          </h1>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            An intelligent data copilot that translates natural language into SQL queries
            — powered by the QueryWise Intelligent SQL Engine with DuckDB.
          </p>
        </div>

        {/* Architecture */}
        <div className="glass-card rounded-2xl p-6 lg:p-8 mb-8">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-6 flex items-center gap-2">
            <LayersIcon className="w-5 h-5 text-primary" />
            Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "React Frontend", desc: "Vite + TypeScript + Tailwind CSS", icon: <RouteIcon className="w-5 h-5" /> },
              { title: "FastAPI Backend", desc: "Python server with routing + LLM orchestration", icon: <RouteIcon className="w-5 h-5" /> },
              { title: "DuckDB Engine", desc: "In-process analytical SQL execution", icon: <DatabaseIcon className="w-5 h-5" /> },
            ].map((layer) => (
              <div key={layer.title} className="bg-surface-elevated rounded-xl p-4 border border-border">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                  {layer.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{layer.title}</h3>
                <p className="text-sm text-foreground-muted">{layer.desc}</p>
              </div>
            ))}
          </div>
          {/* Arrow connector */}
          <div className="hidden md:flex items-center justify-center gap-2 mt-4 text-muted text-xs">
            <span>User Input</span>
            <span className="text-primary">→</span>
            <span>API Router</span>
            <span className="text-primary">→</span>
            <span>LLM / Pattern Engine</span>
            <span className="text-primary">→</span>
            <span>DuckDB</span>
            <span className="text-primary">→</span>
            <span>Results</span>
          </div>
        </div>

        {/* Workflow */}
        <div className="glass-card rounded-2xl p-6 lg:p-8 mb-8">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-6">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflow.map((w) => (
              <div key={w.step} className="relative bg-surface-elevated rounded-xl p-4 border border-border">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary text-sm font-bold flex items-center justify-center mb-3">
                  {w.step}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{w.title}</h3>
                <p className="text-sm text-foreground-muted">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="glass-card rounded-2xl p-6 lg:p-8 mb-8">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="flex gap-3 p-3 rounded-lg hover:bg-surface-elevated/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">{f.title}</h3>
                  <p className="text-xs text-foreground-muted mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div className="glass-card rounded-2xl p-6 lg:p-8 mb-8">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Tech Stack</h2>
          <div className="flex flex-wrap gap-3">
            {["React 18", "TypeScript", "Vite", "Tailwind CSS v4", "FastAPI", "Python 3.12", "DuckDB", "LangChain", "Lucide Icons"].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 bg-surface-elevated border border-border rounded-lg text-sm text-foreground-muted font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted pb-8">
          Built with ❤️ for hackathons · Open source under MIT License
        </div>
      </div>
    </div>
  );
}