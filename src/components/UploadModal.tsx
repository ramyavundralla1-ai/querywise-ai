import { useState, useRef, useCallback } from "react";
import { LoaderIcon, CheckIcon, CloseIcon, DatabaseIcon, FileIcon, SparklesIcon } from "./Icons";
import { api, type UploadResponse } from "../services/api";

interface UploadModalProps {
  onClose: () => void;
  onSuccess: (result: UploadResponse) => void;
}

type UploadState = "idle" | "uploading" | "success" | "error";

export default function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFormats = ".csv,.tsv";

  const validateFile = (f: File): string | null => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "tsv") {
      return "Only CSV and TSV files are supported.";
    }
    if (f.size > 50 * 1024 * 1024) {
      return "File size must be under 50 MB.";
    }
    return null;
  };

  const handleFile = useCallback(async (f: File) => {
    const err = validateFile(f);
    if (err) {
      setErrorMsg(err);
      setState("error");
      return;
    }

    setFile(f);
    setState("uploading");
    setErrorMsg("");
    setUploadProgress(0);

    // Simulated progress animation
    const interval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 8, 80));
    }, 200);

    try {
      const res = await api.upload(f);
      clearInterval(interval);
      setUploadProgress(100);
      setResult(res);
      setState("success");
      setTimeout(() => onSuccess(res), 600);
    } catch (err) {
      clearInterval(interval);
      const msg = err instanceof Error ? err.message : "Upload failed. Please try again.";
      setErrorMsg(msg);
      setState("error");
    }
  }, [onSuccess]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const close = () => {
    if (state === "uploading") return; // prevent close during upload
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={close}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-surface-card border border-border rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <DatabaseIcon className="w-5 h-5 text-primary" />
            <h2 className="text-base font-heading font-semibold text-foreground">
              {state === "success" ? "Upload Complete" : "Upload Dataset"}
            </h2>
          </div>
          {state !== "uploading" && (
            <button
              onClick={close}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-all duration-150 cursor-pointer"
              aria-label="Close"
            >
              <CloseIcon className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {state === "idle" && (
            <>
              {/* Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  dragOver
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-border hover:border-primary/40 bg-surface-elevated/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptedFormats}
                  className="hidden"
                  onChange={handleInputChange}
                />

                <div className="flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    dragOver ? "bg-primary/20 scale-110" : "bg-primary/10"
                  }`}>
                    <FileIcon className={`w-7 h-7 transition-colors ${
                      dragOver ? "text-primary" : "text-primary/70"
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {dragOver ? "Drop your file here" : "Drag & drop your dataset"}
                    </p>
                    <p className="text-xs text-foreground-muted mt-1">
                      or{" "}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary hover:text-primary-hover underline underline-offset-2 transition-colors cursor-pointer"
                      >
                        browse files
                      </button>
                    </p>
                  </div>
                </div>

                {/* Requirements */}
                <div className="mt-5 flex justify-center gap-4 text-[10px] text-foreground-muted/60">
                  <span className="flex items-center gap-1">
                    <CheckIcon className="w-3 h-3" /> CSV / TSV
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckIcon className="w-3 h-3" /> Max 50 MB
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckIcon className="w-3 h-3" /> DuckDB native
                  </span>
                </div>
              </div>

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full mt-4 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover active:scale-[0.97] transition-all duration-150 cursor-pointer shadow-lg shadow-primary/20"
              >
                <span className="flex items-center justify-center gap-2">
                  <FileIcon className="w-4 h-4" />
                  Select File to Upload
                </span>
              </button>
            </>
          )}

          {/* Uploading */}
          {state === "uploading" && file && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <LoaderIcon className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Uploading {file.name}</p>
              <p className="text-xs text-foreground-muted/70 mb-4">
                Analyzing structure and creating DuckDB table...
              </p>
              <div className="w-full bg-surface-elevated rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-foreground-muted/50 mt-2">{Math.round(uploadProgress)}%</p>
            </div>
          )}

          {/* Success */}
          {state === "success" && result && (
            <div className="animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-success/15 flex items-center justify-center mx-auto mb-3">
                  <CheckIcon className="w-8 h-8 text-success" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Dataset loaded successfully
                </p>
                <p className="text-xs text-foreground-muted mt-1">
                  {result.table_name} — ready for natural language queries
                </p>
              </div>

              {/* Schema Details */}
              <div className="glass-card rounded-xl p-4 space-y-3">
                {/* File info */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground-muted">File</span>
                  <span className="text-foreground font-medium">{result.filename}</span>
                </div>
                <div className="border-t border-border" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground-muted">Table</span>
                  <span className="text-foreground font-mono font-medium">{result.table_name}</span>
                </div>
                <div className="border-t border-border" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground-muted">Rows</span>
                  <span className="text-foreground font-mono">{result.rows_imported.toLocaleString()}</span>
                </div>
                <div className="border-t border-border" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground-muted">Columns</span>
                  <span className="text-foreground font-mono">{result.columns.length}</span>
                </div>

                {/* Column list from detected_schema */}
                {result.detected_schema && Object.keys(result.detected_schema).length > 0 && (
                  <>
                    <div className="border-t border-border" />
                    <div>
                      <p className="text-xs text-foreground-muted mb-2">Detected Schema</p>
                      <div className="space-y-1.5">
                        {Object.entries(result.detected_schema).map(([colName, dtype], i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 rounded-full bg-primary/60 flex-shrink-0" />
                            <span className="text-foreground font-mono">{colName}</span>
                            <span className="text-foreground-muted/60 text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated">
                              {dtype}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={close}
                className="w-full mt-4 py-3 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover active:scale-[0.97] transition-all duration-150 cursor-pointer shadow-lg shadow-primary/20"
              >
                <span className="flex items-center justify-center gap-2">
                  <SparklesIcon className="w-4 h-4" />
                  Start Querying
                </span>
              </button>
            </div>
          )}

          {/* Error */}
          {state === "error" && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <CloseIcon className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Upload failed</p>
              <p className="text-xs text-foreground-muted mb-6">{errorMsg}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setState("idle"); setFile(null); setErrorMsg(""); }}
                  className="flex-1 py-2.5 bg-surface-elevated text-foreground rounded-xl text-sm font-medium hover:bg-border transition-all duration-150 cursor-pointer"
                >
                  Try Again
                </button>
                <button
                  onClick={close}
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all duration-150 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}