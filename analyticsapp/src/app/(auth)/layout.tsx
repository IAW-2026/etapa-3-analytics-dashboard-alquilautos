export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A1628] px-4">
      {/* fondo con puntos sutiles */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(26,92,255,0.12) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* branding */}
      <div className="relative z-10 flex flex-col items-center gap-2 mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1A5CFF] shadow-lg shadow-[#1A5CFF]/30">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 17h4v-7H3v7zm7 0h4V7h-4v10zm7 0h4v-4h-4v4z" fill="white" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          AlquilAutos <span className="text-[#1A5CFF]">Analytics</span>
        </h1>
        <p className="text-sm text-[#8094B4]">Panel de métricas del ecosistema</p>
      </div>

      {/* clerk widget */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
