import type { ReactNode } from "react";

export function SectionCard({
  title,
  right,
  children,
  padded = true,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <section className="bg-card rounded-xl ring-1 ring-black/5 dark:ring-white/5 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border/60 flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-foreground">{title}</h2>
        {right}
      </div>
      <div className={padded ? "p-6" : ""}>{children}</div>
    </section>
  );
}