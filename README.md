# Tesorería Curso 1°B — Escuela Hermano Leovigildo Kley

Aplicación web de gestión de tesorería para el curso 1°B de la Escuela Hermano Leovigildo Kley, Cunco, Chile. Desarrollada y desplegada en producción durante el año escolar 2026.

🔗 **Demo en vivo:** [tesoreria-curso-nahx.vercel.app](https://tesoreria-curso-nahx.vercel.app/)

---

## Descripción

Sistema de tesorería escolar con cuatro niveles de acceso, diseñado para gestionar las cuotas mensuales, gastos, donaciones y comunicaciones del curso. La aplicación permite a los apoderados consultar su estado de pago de forma autónoma, sin necesidad de contactar al tesorero.

---

## Funcionalidades

### Panel público (sin login)
- Saldo disponible, total ingresos y gastos
- Gráfico de ingresos vs gastos por mes
- Registro de movimientos
- Próxima reunión de apoderados
- Avisos del curso
- Última reunión con acta y decisiones
- Información de pago (Mercado Pago)
- Registro de donaciones para convivencias
- Consulta individual de estado de cuotas por código de apoderado

### Panel Tesorero
- Registro de movimientos (ingresos y gastos por categoría)
- Registro de cuotas con soporte de pagos parciales y saldo a favor
- Estado de cuotas por alumno con detalle visual por mes
- Gestión de alumnos (agregar, editar, desactivar, eliminar)
- Gestión de donaciones para convivencias (agregar, editar, eliminar)
- Edición y eliminación de movimientos

### Panel Presidente
- Tabla de alumnos con estado de cuotas
- Comparativa mensual de recaudación
- Resumen imprimible

### Panel Secretaria
- Gestión de reuniones (crear, editar, eliminar)
- Actas editables por reunión
- Decisiones con estado y responsable
- Gestión de avisos
- Próxima reunión editable
- Generación de texto para WhatsApp

---

## Stack tecnológico

- **Framework:** Next.js 15 (App Router)
- **Base de datos:** Supabase (PostgreSQL)
- **Autenticación:** JWT con `jose` + cookies httpOnly
- **Deploy:** Vercel (plan gratuito)
- **Lenguaje:** TypeScript
- **Estilos:** CSS custom con variables (sin framework CSS)
- **Fuentes:** Fraunces (display) + DM Sans (body)

---

## Estructura de la base de datos

```sql
alumnos         -- id, nombre, codigo_apoderado, activo
movimientos     -- id, fecha, categoria, descripcion, monto, alumno_id, mes_cuota
donaciones      -- id, convivencia, alumno_id, descripcion, fecha
reuniones       -- id, fecha, hora, tipo, lugar, asistentes_count, resumen
actas           -- id, reunion_id, contenido
decisiones      -- id, reunion_id, descripcion, responsable, estado, fecha_limite
avisos          -- id, titulo, contenido, destacado
config          -- clave/valor (cuota_mensual, proxima_reunion, info_pago_*)
```

---

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
PASSWORD_PRESIDENTE=tu_password
PASSWORD_TESORERO=tu_password
PASSWORD_SECRETARIA=tu_password
SESSION_SECRET=una_cadena_larga_y_aleatoria
```

Ver `.env.local.example` para referencia.

---

## Instalación local

```bash
git clone https://github.com/RojoBlack/tesoreria-curso.git
cd tesoreria-curso
npm install
# Configura .env.local
npm run dev
```

---

## Autor

**René Alarcón Sandoval** — Técnico Superior en Programación  
[github.com/RojoBlack](https://github.com/RojoBlack) · [linkedin.com/in/rene-alarcon-sandoval](https://linkedin.com/in/rene-alarcon-sandoval)
