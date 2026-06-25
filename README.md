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


## Sistema de exportación

El botón **Exportar** en la navbar abre un modal que permite descargar los datos de cada app en dos formatos:

- **Excel** — múltiples hojas con tablas estilizadas (colores, bordes, alternado de filas)
- **PDF** — tablas con header de marca, secciones por bloque y pie de página
