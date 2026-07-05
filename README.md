# InFinanceXP — Panel de Gestión de Clientes

Este proyecto es la resolución de la prueba técnica para **Frontend Developer** (Angular + Firebase). Consiste en un panel moderno y seguro para la administración, filtrado y cálculo de KPIs de clientes.

---

## 🚀 Características Principales

* **Seguridad y Autenticación:** Toda la aplicación está protegida por defecto. Requiere autenticación con Firebase Auth (tanto a nivel de enrutamiento web con Guards como a nivel de base de datos con reglas de seguridad en Firestore).
* **Alta de Clientes:** Formulario reactivo controlado con validación de fechas (límite de 120 años) y cálculo automático exacto de edad (por día/mes) a partir de la fecha de nacimiento (campo de solo lectura).
* **Listado Reactivo:** Búsqueda en tiempo real por nombre/apellido y filtrado por rango de edad implementado mediante `combineLatest` sin suscripciones manuales ni memory leaks.
* **Dashboard de KPIs:** Visualización estadística instantánea del promedio de edad y la desviación estándar poblacional de los clientes en base de datos.

---

## 🔑 Credenciales de Acceso (Usuario Reviewer)

Para probar la versión desplegada en producción sin necesidad de registrarse:
* **Email:** `reviewer@example.com`
* **Contraseña:** `Reviewer123!`

---

## 🛠️ Configuración e Instalación Local

### Requisitos Previos
* Node.js (v16+) y npm.
* Angular CLI instalado de forma global (`npm install -g @angular/cli@15`) o usando `npx`.

### Pasos para Ejecutar
1. **Clonar el repositorio.**
2. **Configurar Credenciales de Firebase:**
   Copia el archivo de plantilla para crear tus archivos de configuración local y de producción:
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   cp src/environments/environment.example.ts src/environments/environment.prod.ts
   ```
   Abre `src/environments/environment.ts` y `environment.prod.ts` y completa el objeto `firebase` con las credenciales de tu proyecto.
3. **Instalar dependencias:**
   ```bash
   npm install
   ```
4. **Iniciar Servidor de Desarrollo:**
   ```bash
   npm run start
   ```
   Navega a `http://localhost:4200/`.

---

## 🧪 Pruebas Unitarias

El proyecto cuenta con un set completo de pruebas unitarias cubriendo la lógica crítica (utilidades de fechas, transformaciones de pipes, validadores personalizados y cálculos estadísticos).

Para ejecutar los tests en modo headless:
```bash
npx ng test --watch=false --browsers=ChromeHeadless
```

---

## 📐 Decisiones de Arquitectura (ADR Summary)

Las decisiones clave del desarrollo se encuentran documentadas en el archivo `DECISIONS.md`. A continuación un resumen rápido:

| ID | Decisión | Justificación / Contexto |
|----|----------|--------------------------|
| **ADR-001** | Standalone Components | Simplificación de arquitectura, cargas perezosas directas y eliminación de NgModules redundantes. |
| **ADR-003** | Reactive Forms | Validaciones sincrónicas/asincrónicas complejas y mejor control del ciclo de vida del formulario. |
| **ADR-007** | Flujos con `combineLatest` | Procesamiento reactivo de filtros y ordenamiento en cliente sin fugas de memoria por suscripción manual. |
| **ADR-008** | StatisticsService | Separación de responsabilidades: los cálculos matemáticos viven en un servicio puro aislado de la UI. |
| **ADR-014** | Cálculo de Edad al Guardar | Campo de solo lectura para evitar errores humanos, aceptando el trade-off de drift temporal documentado. |
| **ADR-015** | Acceso Restringido Total | Protección de la información de clientes (datos personales) restringiendo el listado y alta bajo login obligatorio. |
| **ADR-016** | Firestore Security Rules | Exigencia de `request.auth != null` a nivel base de datos para impedir accesos directos fuera de la UI. |
| **ADR-017** | Desviación Estándar Poblacional | Elección de fórmula poblacional para análisis descriptivo directo sin indeterminaciones con un único registro. |
