import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AlquilAutos Analytics",
  description: "Panel consolidado de métricas del ecosistema AlquilAutos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="es" className={inter.variable}>
        <body>
          <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px]">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}