import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatARS } from "@/lib/format";

type AppCard =
  | {
      href: "/seller";
      label: string;
      title: string;
      status: "live";
      stats: { label: string; value: string }[];
    }
  | {
      href: "/buyer" | "/feedback";
      label: string;
      title: string;
      status: "active";
      stats: { label: string; value: string }[];
    }
  | {
      href: "/payments";
      label: string;
      title: string;
      status: "active";
      stats: { label: string; value: string }[];
    }
  | {
      href: "/shipping" | "/payments" | "/payments";
      label: string;
      title: string;
      status: "soon";
    };

export function EcosystemCards({
  sellerStats,
  buyerStats,
  paymentsStats,
  feedbackStats,
}: {
  sellerStats: { propietarios: number; ocupacionPromedio: number };
  buyerStats: { total: number };
  paymentsStats?: { recaudadoHoy: number };
  feedbackStats?: { resenas: number; calificacion: number };
}) {
  const cards: AppCard[] = [
    {
      href: "/seller",
      label: "Seller App",
      title: "Gestión Propietarios",
      status: "live",
      stats: [
        { label: "Propietarios", value: String(sellerStats.propietarios) },
        { label: "Ocupación prom.", value: `${sellerStats.ocupacionPromedio}%` },
      ],
    },
    {
      href: "/buyer",
      label: "Buyer App",
      title: "Alquiladores",
      status: "active",
      stats: [{ label: "Alquiladores", value: String(buyerStats.total) }],
    },
    { href: "/shipping", label: "Shipping App", title: "Logística & Entregas", status: "soon" },
    {
      href: "/payments",
      label: "Payments App",
      title: "Pagos & Payouts",
      status: "active",
      stats: [{ label: "Recaudado hoy", value: paymentsStats ? formatARS(paymentsStats.recaudadoHoy) : "—" }],
    },
    {
      href: "/feedback",
      label: "Feedback App",
      title: "Calificaciones",
      status: "active",
      stats: [
        { label: "Reseñas", value: String(feedbackStats?.resenas ?? "—") },
        { label: "Calif. prom.", value: feedbackStats ? `${feedbackStats.calificacion}★` : "—" },
      ],
    },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
        Ecosistema de Apps
      </h2>
      {cards.map((c) =>
        c.status === "live" ? (
          <Link
            key={c.href}
            href={c.href}
            className="block p-4 bg-primary text-white rounded-xl ring-1 ring-primary-600 shadow-md hover:bg-primary-500 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase opacity-70 tracking-tight">{c.label}</span>
                <h3 className="text-lg font-medium">{c.title}</h3>
              </div>
              <div className="size-2 bg-white rounded-full pulse-ring" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
              {c.stats.map((s) => (
                <div key={s.label}>
                  <p className="text-[10px] opacity-70 uppercase tracking-wide">{s.label}</p>
                  <p className="text-sm font-medium">{s.value}</p>
                </div>
              ))}
            </div>
          </Link>
        ) : c.status === "active" ? (
          <Link
            key={c.href}
            href={c.href}
            className="block p-4 bg-card rounded-xl ring-1 ring-[#1A5CFF]/30 shadow-sm hover:ring-[#1A5CFF]/60 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase text-[#1A5CFF] tracking-tight">{c.label}</span>
                <h3 className="text-lg font-medium text-foreground">{c.title}</h3>
              </div>
              <ArrowRight className="size-4 text-[#5280FF] group-hover:translate-x-0.5 transition-transform mt-1" />
            </div>
            <div className="mt-4 border-t border-border/60 pt-4 flex items-center gap-4">
              {c.stats.map((s) => (
                <div key={s.label}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
                  <p className="text-sm font-semibold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>
          </Link>
        ) : (
          <Link
            key={c.href}
            href={c.href}
            className="block p-4 bg-card rounded-xl ring-1 ring-black/5 dark:ring-white/5 shadow-sm hover:ring-black/10 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground tracking-tight">
                    {c.label}
                  </span>
                  <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-medium">
                    PRÓXIMAMENTE
                  </span>
                </div>
                <h3 className="text-lg font-medium text-muted-foreground">{c.title}</h3>
              </div>
            </div>
            <div className="mt-4 space-y-2 opacity-30">
              <div className="h-2 bg-muted rounded-full w-full" />
              <div className="h-2 bg-muted rounded-full w-2/3" />
            </div>
          </Link>
        ),
      )}
    </section>
  );
}