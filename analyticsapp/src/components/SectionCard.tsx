import type { ReactNode } from "react";

export function SectionCard({
  title,
  description,
  right,
  children,
  padded = true,
}: {
  title: string;
  description?: string;
  right?: ReactNode;
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <section className="bg-card rounded-xl ring-1 ring-black/5 dark:ring-white/5 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border/60">
        <div className="flex items-center justify-between gap-4 mb-1">
          <h2 className="text-sm font-medium text-foreground">{title}</h2>
          {right}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className={padded ? "p-6" : ""}>{children}</div>
    </section>
  );
}