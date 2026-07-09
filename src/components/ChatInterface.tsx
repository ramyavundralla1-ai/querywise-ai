import { useState } from "react";
import { SendIcon, SparklesIcon, SqlIcon, DollarIcon, RouteIcon, LightbulbIcon, CheckIcon, LoaderIcon, CloseIcon, MessageIcon, DatabaseIcon, BrainIcon } from "./Icons";

interface QueryResult {
  id: string;
  naturalQuery: string;
  generatedSql: string;
  routingDecision: string;
  costComparison: {
    traditionalCost: number;
    aiCost: number;
  };
  columns: string[];
  rows: Record<string, string>[];
  executionTime: string;
}

const exampleQuestions = [
  "Show total sales by region for last quarter",
  "Which products have the highest return rate?",
  "Compare customer retention across subscription tiers",
  "What's the average order value by customer segment?",
  "List top 10 customers by lifetime value",
  "Show monthly revenue trend for 2024",
];

function generateMockResult(query: string, id: string): QueryResult {
  return {
    id,
    naturalQuery: query,
    generatedSql: query.toLowerCase().includes("sales")
      ? "SELECT region, SUM(sales_amount) AS total_sales\nFROM orders\nWHERE order_date >= DATEADD(month, -3, GETDATE())\nGROUP BY region\nORDER BY total_sales DESC;"
      : query.toLowerCase().includes("product") || query.toLowerCase().includes("return")
      ? "SELECT p.product_name, COUNT(r.return_id) * 1.0 / COUNT(o.order_id) AS return_rate\nFROM products p\nJOIN order_items oi ON p.product_id = oi.product_id\nJOIN orders o ON oi.order_id = o.order_id\nLEFT JOIN returns r ON oi.item_id = r.item_id\nGROUP BY p.product_name\nORDER BY return_rate DESC;"
      : query.toLowerCase().includes("retention") || query.toLowerCase().includes("tier")
      ? "WITH retention_data AS (\n  SELECT tier, \n    COUNT(DISTINCT customer_id) AS total_customers,\n    COUNT(DISTINCT CASE WHEN last_order_date > DATEADD(month, -6, GETDATE()) THEN customer_id END) AS active_customers\n  FROM subscriptions\n  GROUP BY tier\n)\nSELECT tier, total_customers, active_customers,\n  ROUND(active_customers * 100.0 / total_customers, 2) AS retention_rate\nFROM retention_data\nORDER BY retention_rate DESC;"
      : query.toLowerCase().includes("order value") || query.toLowerCase().includes("segment")
      ? "SELECT c.segment, AVG(o.total_amount) AS avg_order_value,\n  COUNT(o.order_id) AS total_orders\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.segment\nORDER BY avg_order_value DESC;"
      : query.toLowerCase().includes("customer")
      ? "SELECT customer_id, customer_name, SUM(total_spent) AS lifetime_value\nFROM (\n  SELECT c.customer_id, c.customer_name, o.total_amount AS total_spent\n  FROM customers c\n  JOIN orders o ON c.customer_id = o.customer_id\n) AS customer_orders\nGROUP BY customer_id, customer_name\nORDER BY lifetime_value DESC\nLIMIT 10;"
      : query.toLowerCase().includes("revenue") || query.toLowerCase().includes("trend")
      ? "SELECT FORMAT(order_date, 'yyyy-MM') AS month, SUM(total_amount) AS revenue\nFROM orders\nWHERE YEAR(order_date) = 2024\nGROUP BY FORMAT(order_date, 'yyyy-MM')\nORDER BY month;"
      : "SELECT * FROM dataset\nWHERE condition = 'example'\nLIMIT 10;",
    routingDecision: Math.random() > 0.3 ? "GPT-4o (high complexity)" : "GPT-4o Mini (low complexity)",
    costComparison: {
      traditionalCost: parseFloat((Math.random() * 5 + 2).toFixed(2)),
      aiCost: parseFloat((Math.random() * 0.8 + 0.05).toFixed(2)),
    },
    columns: ["region", "total_sales", "growth_percent"],
    rows: [
      { region: "North America", total_sales: "$1,284,392", growth_percent: "+12.4%" },
      { region: "Europe", total_sales: "$892,451", growth_percent: "+8.7%" },
      { region: "Asia Pacific", total_sales: "$654,283", growth_percent: "+15.2%" },
      { region: "Latin America", total_sales: "$312,845", growth_percent: "+5.3%" },
      { region: "Middle East", total_sales: "$198,472", growth_percent: "+22.1%" },
    ],
    executionTime: `${(Math.random() * 1.5 + 0.3).toFixed(1)}s`,
  };
}

interface ChatInterfaceProps {}

export default function ChatInterface({}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; result?: QueryResult }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Simulate AI processing delay
    await new Promise((r) => setTimeout(r, 1500));

    const mockResult = generateMockResult(userMessage, `res-${Date.now()}`);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Here are the results for your query. I've analyzed the dataset and generated the optimal SQL for you.`,
        result: mockResult,
      },
    ]);
    setIsLoading(false);
    setExpandedResult(mockResult.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (q: string) => {
    setInput(q);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-6 lg:px-8 py-4 border-b border-border bg-surface/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <MessageIcon className="w-4 h-4 text-primary" />
          <h1 className="text-base font-heading font-semibold text-foreground">Chat Assistant</h1>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium ml-2">NL-to-SQL</span>
        </div>
        <p className="text-xs text-foreground-muted mt-0.5">
          Ask questions in plain English and get instant SQL-powered answers
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 space-y-6">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
              <SparklesIcon className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-heading font-semibold text-foreground mb-2">
              Ask anything about your data
            </h2>
            <p className="text-sm text-foreground-muted max-w-md mb-6">
              Type a question in natural language and let AI generate the SQL query for you.
            </p>

            {/* Example Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {exampleQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(q)}
                  className="text-left p-3 glass-card rounded-lg text-xs text-foreground-muted hover:text-foreground hover:border-primary/30 transition-all duration-200 cursor-pointer"
                >
                  <LightbulbIcon className="w-3 h-3 text-primary inline mr-1.5 flex-shrink-0" />
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${msg.role === "user" ? "order-1" : "order-1"}`}>
              {/* User message */}
              {msg.role === "user" && (
                <div className="bg-primary text-white px-4 py-2.5 rounded-2xl rounded-br-md text-sm shadow-lg shadow-primary/20">
                  {msg.content}
                </div>
              )}

              {/* Assistant message */}
              {msg.role === "assistant" && msg.result && (
                <div className="space-y-3">
                  <p className="text-sm text-foreground bg-surface-card px-4 py-2.5 rounded-2xl rounded-bl-md">
                    {msg.content}
                  </p>

                  {/* Result Card */}
                  <div className="glass-card rounded-xl overflow-hidden">
                    {/* Generated SQL */}
                    <div className="border-b border-border">
                      <button
                        onClick={() => setExpandedResult(expandedResult === msg.result!.id ? null : msg.result!.id)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-elevated transition-colors duration-150 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <SqlIcon className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">Generated SQL</span>
                        </div>
                        <div className={`transform transition-transform duration-200 ${expandedResult === msg.result.id ? "rotate-180" : ""}`}>
                          <svg className="w-4 h-4 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      {expandedResult === msg.result.id && (
                        <div className="px-4 pb-4">
                          <pre className="text-xs font-mono bg-surface-elevated rounded-lg p-3 overflow-x-auto text-foreground border border-border">
                            <code>{msg.result.generatedSql}</code>
                          </pre>
                          <div className="flex items-center gap-2 mt-2 text-[10px] text-foreground-muted/70">
                            <span>Execution: {msg.result.executionTime}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <CheckIcon className="w-3 h-3 text-success" />
                              Validated
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Results Table */}
                    <div className="px-4 py-3 bg-surface-elevated/30">
                      <div className="flex items-center gap-2 mb-3">
                        <DatabaseIcon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Query Results</span>
                        <span className="text-[10px] text-foreground-muted/70 ml-auto">{msg.result.rows.length} rows</span>
                      </div>
                      <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-surface-card">
                              {msg.result.columns.map((col, ci) => (
                                <th key={ci} className="px-3 py-2 text-left font-medium text-foreground-muted uppercase tracking-wider">
                                  {col.replace(/_/g, " ")}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {msg.result.rows.map((row, ri) => (
                              <tr key={ri} className="border-t border-border hover:bg-surface-elevated/50 transition-colors">
                                {msg.result!.columns.map((col, ci) => (
                                  <td key={ci} className="px-3 py-2 text-foreground whitespace-nowrap">{row[col]}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Routing & Cost Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
                      {/* AI Routing */}
                      <div className="bg-surface p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <RouteIcon className="w-4 h-4 text-secondary" />
                          <span className="text-xs font-medium text-foreground">Routing Decision</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                            <BrainIcon className="w-3 h-3 text-secondary" />
                          </div>
                          <span className="text-xs text-foreground">{msg.result.routingDecision}</span>
                        </div>
                      </div>

                      {/* Cost Comparison */}
                      <div className="bg-surface p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarIcon className="w-4 h-4 text-success" />
                          <span className="text-xs font-medium text-foreground">Cost Comparison</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <p className="text-[10px] text-foreground-muted mb-0.5">Traditional</p>
                            <p className="text-sm font-mono font-semibold text-foreground-muted line-through">
                              ${msg.result.costComparison.traditionalCost.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] text-foreground-muted mb-0.5">AI Cost</p>
                            <p className="text-sm font-mono font-semibold text-success">
                              ${msg.result.costComparison.aiCost.toFixed(2)}
                            </p>
                          </div>
                          <div className="ml-auto text-center">
                            <p className="text-[10px] text-foreground-muted mb-0.5">Savings</p>
                            <p className="text-xs font-semibold text-success">
                              {Math.round((1 - msg.result.costComparison.aiCost / msg.result.costComparison.traditionalCost) * 100)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-card border border-border flex items-center justify-center">
              <LoaderIcon className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="text-xs text-foreground-muted/70">Generating SQL and analyzing data...</p>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 lg:px-8 py-4 border-t border-border bg-surface/50 backdrop-blur-sm">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your data..."
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-surface-card border border-border rounded-xl text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-all duration-200"
              style={{ minHeight: "44px", maxHeight: "120px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "44px";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-hover active:scale-[0.95] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-150 cursor-pointer shadow-lg shadow-primary/20"
          >
            <SendIcon className="w-4.5 h-4.5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-foreground-muted/40 mt-2">
          QueryWise generates SQL from your natural language · Results are simulated for demo
        </p>
      </div>
    </div>
  );
}