export default function NoAutorizadoPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24">
      <h1 className="text-xl font-semibold text-foreground">No autorizado</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        Tu usuario no tiene el rol <code className="font-mono">adminGlobal</code> necesario
        para ver este panel. Iniciá sesión con un usuario administrador.
      </p>
    </div>
  );
}