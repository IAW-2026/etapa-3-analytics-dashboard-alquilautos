import { SectionCard } from "@/components/SectionCard";

export function SoonState({ app, descripcion }: { app: string; descripcion: string }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-card rounded-xl ring-1 ring-black/5 dark:ring-white/5 shadow-sm p-8">
          <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded mb-4">
            <span className="size-1.5 bg-accent rounded-full" />
            Próximamente
          </div>
          <h2 className="text-xl font-semibold mb-2">{app}</h2>
          <p className="text-muted-foreground max-w-prose">{descripcion}</p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-lg bg-muted/40 ring-1 ring-border/40">
                <div className="h-2 bg-muted-foreground/20 rounded-full w-1/2 mb-3" />
                <div className="h-6 bg-muted-foreground/20 rounded w-3/4 mb-2" />
                <div className="h-2 bg-muted-foreground/15 rounded-full w-1/3" />
              </div>
            ))}
          </div>
        </div>
        <SectionCard title="Esquema esperado de endpoints">
          <ul className="space-y-2 font-mono text-xs text-muted-foreground">
            <li><span className="text-primary">GET</span> /api/metricas/resumen-general</li>
            <li><span className="text-primary">GET</span> /api/metricas/actividad-reciente</li>
            <li><span className="text-primary">GET</span> /api/metricas/distribucion</li>
            <li><span className="text-primary">GET</span> /api/metricas/tendencia?desde&hasta</li>
          </ul>
        </SectionCard>
      </div>
      <div className="space-y-6">
        <SectionCard title="Estado de integración">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Endpoint base</dt><dd className="font-mono text-xs">—</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Auth</dt><dd>Clerk JWT</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Cache</dt><dd>5 min</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Estado</dt><dd className="text-accent font-medium">Pendiente</dd></div>
          </dl>
        </SectionCard>
      </div>
    </div>
  );
}