"use client";

import { useState } from "react";
import { X, FileText, Sheet, Loader2, Check } from "lucide-react";
import { EXPORT_APPS, type AppId, type ExportFormat } from "./export-config";
import { exportBuyer } from "./buyer-export";
import { exportPayments } from "./payments-export";

const EXPORTERS: Partial<Record<AppId, (format: ExportFormat) => Promise<void>>> = {
  buyer: exportBuyer,
  payments: exportPayments,
};

interface ExportModalProps {
  onClose: () => void;
}

export function ExportModal({ onClose }: ExportModalProps) {
  const [selectedApp, setSelectedApp] = useState<AppId | null>(null);
  const [format, setFormat] = useState<ExportFormat>("excel");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleExport() {
    if (!selectedApp) return;
    const exporter = EXPORTERS[selectedApp];
    if (!exporter) return;

    setLoading(true);
    try {
      await exporter(format);
      setDone(true);
      setTimeout(() => {
        setDone(false);
        onClose();
      }, 1200);
    } finally {
      setLoading(false);
    }
  }

  const canExport = selectedApp !== null && !!EXPORTERS[selectedApp];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl ring-1 ring-black/10 dark:ring-white/10 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/60">
          <div>
            <h2 className="text-base font-semibold text-foreground">Exportar datos</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Elegí la app y el formato de exportación</p>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* App selection */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              App
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EXPORT_APPS.map((app) => {
                const isSelected = selectedApp === app.id;
                return (
                  <button
                    key={app.id}
                    onClick={() => app.available && setSelectedApp(app.id)}
                    disabled={!app.available}
                    className={`relative text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10"
                        : app.available
                          ? "border-border hover:border-violet-300 hover:bg-muted/50"
                          : "border-border/50 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 size-4 bg-violet-500 rounded-full flex items-center justify-center">
                        <Check className="size-2.5 text-white" />
                      </span>
                    )}
                    <p className={`text-xs font-semibold ${isSelected ? "text-violet-600 dark:text-violet-400" : "text-foreground"}`}>
                      {app.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                      {app.available ? app.description : "Próximamente"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format selection */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Formato
            </p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "excel", icon: Sheet, label: "Excel", desc: "Archivo .csv" },
                { value: "pdf", icon: FileText, label: "PDF", desc: "Listo para imprimir" },
              ] as const).map(({ value, icon: Icon, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setFormat(value)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                    format === value
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10"
                      : "border-border hover:border-violet-300 hover:bg-muted/50"
                  }`}
                >
                  <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${
                    format === value ? "bg-violet-500 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    <Icon className="size-4" />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-medium ${format === value ? "text-violet-600 dark:text-violet-400" : "text-foreground"}`}>
                      {label}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/60 flex items-center justify-between gap-3">
          {!canExport && selectedApp && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Esta app aún no tiene exportación disponible.
            </p>
          )}
          {!selectedApp && (
            <p className="text-xs text-muted-foreground">Seleccioná una app para continuar.</p>
          )}
          {canExport && <span />}

          <button
            onClick={handleExport}
            disabled={!canExport || loading || done}
            className={`ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              done
                ? "bg-emerald-500 text-white"
                : canExport
                  ? "bg-neutral-900 text-white hover:bg-neutral-700"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {done ? (
              <><Check className="size-4" /> Exportado</>
            ) : loading ? (
              <><Loader2 className="size-4 animate-spin" /> Exportando…</>
            ) : (
              "Exportar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
