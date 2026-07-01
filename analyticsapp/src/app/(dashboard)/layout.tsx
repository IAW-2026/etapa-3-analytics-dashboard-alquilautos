import { Navbar } from "@/components/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1400px]">
        {children}
      </main>
    </>
  );
}
