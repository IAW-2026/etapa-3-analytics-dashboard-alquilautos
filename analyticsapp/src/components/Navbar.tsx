"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/seller", label: "Seller" },
  { href: "/buyer", label: "Buyer" },
  { href: "/shipping", label: "Shipping" },
  { href: "/payments", label: "Payments" },
  { href: "/feedback", label: "Feedback" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/60">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="size-7 bg-primary rounded-md flex items-center justify-center">
                <div className="size-3 bg-white rounded-full" />
              </div>
              <span className="font-semibold tracking-tight">
                AlquilAutos <span className="text-muted-foreground font-normal">Analytics</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      active ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              <span className="size-1.5 rounded-full bg-success" />
              Sync hace 5 min
            </div>
            <div className="h-8 w-px bg-border mx-2" />
            <button className="py-2 pr-3 pl-2 bg-neutral-900 text-white rounded-md text-sm font-medium flex items-center gap-2 hover:bg-neutral-800 transition-colors">
              <Plus className="size-4 shrink-0" />
              Exportar
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}