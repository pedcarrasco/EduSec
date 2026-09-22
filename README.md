# EduSec - Plataforma Académica y Telemetría SOC

EduSec es una plataforma académica de ciberseguridad con gestión de cursos, asignación docente, seguimiento de inscripciones y un centro de operaciones de seguridad (SOC) integrado con telemetría en tiempo real y detección MITRE ATT&CK.

---

## 🚀 Despliegue en Vercel (Recomendado)

El proyecto está 100% adecuado para desplegarse en **Vercel** con frontend Vite (SPA) y backend Serverless (`/api`):

1. **Importar desde GitHub**:
   - Conecta tu cuenta de GitHub en [Vercel](https://vercel.com).
   - Haz clic en **"Add New Project"** y selecciona el repositorio de **EduSec**.
   - El archivo `vercel.json` preconfigura automáticamente el comando de build (`vite build`), la carpeta de salida (`dist`) y las rutas de API serverless.
2. **Hacer clic en "Deploy"**:
   - Vercel construirá el frontend y creará las funciones Serverless para `/api/*`.

### Despliegue mediante Vercel CLI (Opcional):
```bash
npm install -g vercel
vercel
```

---

## 🐙 Subir a GitHub

### Opción A: Desde el Menú de AI Studio
Puedes exportar el repositorio directamente a tu cuenta de GitHub desde el menú superior de **Settings / Export to GitHub** en Google AI Studio.

### Opción B: Conectar a tu repositorio remoto por consola
Si creaste un repositorio vacío en GitHub (por ejemplo `https://github.com/tu-usuario/edusec-lms.git`), ejecuta los siguientes comandos:

```bash
# Vincular el repositorio remoto de GitHub
git remote add origin https://github.com/tu-usuario/edusec-lms.git

# Subir la rama principal
git branch -M main
git push -u origin main
```

---

## 💻 Ejecución en Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (Frontend + Backend en puerto 3000)
npm run dev

# Compilar para producción
npm run build
```

---

## 👥 Cuentas y Credenciales de Prueba

| Rol | Usuario | Email | Contraseña |
|---|---|---|---|
| **Administrador** | Ing. Rodrigo Paz | `admin@edusec.local` | `admin123` |
| **Auditor SOC** | Lic. Tomás Méndez | `auditor.soc@edusec.local` | `soc2026!` |
| **Profesor SOC-101** | Dr. Carlos García | `prof.garcia@edusec.local` | `profe123` |
| **Profesor FOR-201** | MSc. Elena Valenzuela | `prof.valenzuela@edusec.local` | `profe123` |
| **Profesor SEC-305** | Dr. Fernando Alarcón | `prof.alarcon@edusec.local` | `profe123` |
| **Profesor SIEM-402** | Dra. Gabriela Miranda | `prof.miranda@edusec.local` | `profe123` |
| **Alumno (SOC-101)** | Martín Silva | `alumno.martin@edusec.local` | `alumno123` |
| **Alumno (FOR-201)** | Santiago Morales | `alumno.santiago@edusec.local` | `alumno123` |
| **Alumno (SEC-305)** | Benjamín Torres | `alumno.benjamin@edusec.local` | `alumno123` |
| **Alumno (SIEM-402)** | Joaquín Paredes | `alumno.joaquin@edusec.local` | `alumno123` |

---

## 🛡️ Endpoints de la API

- `GET /api/health` - Estado del servicio y tiempo de actividad.
- `GET /api/courses` - Catálogo de cursos académicos y alumnos asignados.
- `GET /api/users` - Directorio institucional de profesores, alumnos y administradores.
- `POST /api/auth/login` - Autenticación con telemetría de eventos para el SOC.
- `GET /api/events` - Registro de eventos de seguridad (SIEM) mapeados a MITRE ATT&CK.
- `POST /api/scenarios/trigger` - Inyección de escenarios de simulación de amenazas cibernéticas.
"# EduSec" 
