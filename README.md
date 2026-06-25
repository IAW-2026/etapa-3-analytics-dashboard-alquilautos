# AlquilAutos Analytics

Panel consolidado de métricas del ecosistema AlquilAutos. Visualiza en tiempo real los datos de todas las apps del sistema: Buyer, Seller, Payments, Shipping y Feedback.

---

## Cuenta de prueba

| Campo        | Valor                                 |
|--------------|---------------------------------------|
| **Email**    | `adminAlquilautos+clerk_test@iaw.com` |
| **Password** | `iawuser#`                            |
| **Rol**      | `adminGlobal`                         |

> Esta cuenta tiene acceso completo al dashboard. El rol `adminGlobal` es requerido — cualquier usuario sin ese rol es redirigido a `/no-autorizado`.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Auth | Clerk v7 |
| Gráficos | Recharts v3 |
| Exportación | ExcelJS + jsPDF + jspdf-autotable |
| Estilos | Tailwind CSS v4 |
| Lenguaje | TypeScript |

---

## Instalación

```bash
npm install
```

Crear `.env.local` en la raíz con las variables de Clerk y las URLs de las APIs:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
SELLER_METRICS_API_URL=...
BUYER_METRICS_API_URL=...
```

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

---

## Estructura de rutas

```
/                  → Overview general (KPIs + cards del ecosistema)
/buyer             → Métricas de Buyer App (alquiladores + favoritos)
/seller            → Métricas de Seller App (propietarios + vehículos)
/payments          → Próximamente
/shipping          → Próximamente
/feedback          → Próximamente
/sign-in           → Login con Clerk
/sign-up           → Registro con Clerk
/no-autorizado     → Página de acceso denegado
```

---

## Sistema de exportación

El botón **Exportar** en la navbar abre un modal que permite descargar los datos de cada app en dos formatos:

- **Excel** — múltiples hojas con tablas estilizadas (colores, bordes, alternado de filas)
- **PDF** — tablas con header de marca, secciones por bloque y pie de página

Para agregar la exportación de una nueva app, ver `src/components/export/` — los estilos compartidos están en `excel-styles.ts` y `pdf-styles.ts`.
