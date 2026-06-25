"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Menu, X } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { ExportModal } from "@/components/export/ExportModal";

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
  const [exportOpen, setExportOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">

            {/* Logo + nav links desktop */}
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

            {/* Derecha desktop */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                <span className="size-1.5 rounded-full bg-success" />
                Sync hace 5 min
              </div>
              <div className="hidden sm:block h-8 w-px bg-border mx-2" />
              <button
                onClick={() => setExportOpen(true)}
                className="hidden md:flex py-2 pr-3 pl-2 bg-neutral-900 text-white rounded-md text-sm font-medium items-center gap-2 hover:bg-neutral-800 transition-colors"
              >
                <Plus className="size-4 shrink-0" />
                Exportar
              </button>
              <UserButton />

              {/* Hamburguesa mobile */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden flex items-center justify-center size-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Menu className="size-5" />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${sidebarOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer */}
          <aside className={`absolute right-0 top-0 h-full w-72 bg-background shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 h-14 border-b border-border/60 shrink-0">
              <Link href="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-2">
                <div className="size-7 bg-primary rounded-md flex items-center justify-center">
                  <div className="size-3 bg-white rounded-full" />
                </div>
                <span className="font-semibold tracking-tight text-sm">
                  AlquilAutos <span className="text-muted-foreground font-normal">Analytics</span>
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="size-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-3 py-4 border-t border-border/60 space-y-3 shrink-0">
              <button
                onClick={() => { setSidebarOpen(false); setExportOpen(true); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                <Plus className="size-4 shrink-0" />
                Exportar
              </button>
              <div className="flex items-center gap-3 px-1">
                <UserButton />
                <span className="text-sm text-muted-foreground">Mi cuenta</span>
              </div>
            </div>

          </aside>
        </div>

      {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}
    </>
  );
}
