# SPEC.md — Especificación Técnica del Proyecto

**Proyecto:** Desafío Técnico Frontend Developer — PinApp / InFinanceXP
**Documento de referencia obligatorio:** `DECISIONS.md` (todas las decisiones de arquitectura ya están tomadas ahí; este documento las ejecuta, no las redefine)

---

## 0. Instrucciones para el agente (Antigravity)

Estas reglas tienen prioridad sobre cualquier otra consideración de "mejor práctica genérica" que el agente pueda traer de su entrenamiento:

1. **Ninguna decisión de arquitectura nueva sin aprobación.** Si para resolver una tarea hay más de una forma razonable de hacerla y esa disyuntiva no está resuelta en `DECISIONS.md`, el agente PARA, presenta las opciones con sus pros/contras, y espera la decisión de Jonathan antes de escribir código.
2. **Cada fase se ejecuta en modo Plan → Review → Execute:**
   - **Plan:** el agente lista los archivos que va a crear/modificar y por qué, citando el/los ADR aplicable(s).
   - **Review:** Jonathan lee el plan, pregunta lo que no entienda, aprueba o pide cambios.
   - **Execute:** recién ahí el agente escribe el código.
   - Al terminar, el agente NO avanza solo a la fase siguiente: espera confirmación explícita.
3. **Cero comentarios de código generados "porque sí".** Se documenta con JSDoc donde el propósito de una función/clase no sea obvio a simple vista (requisito de la consigna), no se satura el código de comentarios redundantes.
4. Si durante una fase surge una decisión no contemplada, se agrega como entrada nueva en la sección **"Decisiones pendientes"** de `DECISIONS.md` antes de seguir.
5. Cada fase debe cerrar con una explicación breve en lenguaje simple de qué se hizo y por qué, como si se la fuera a explicar a un entrevistador.

---

## 1. Resumen del stack (ver `DECISIONS.md` para el detalle)

| Aspecto | Elección | ADR |
|---|---|---|
| Arquitectura de componentes | Standalone Components | ADR-001 |
| Acceso a Firestore | `@angular/fire` | ADR-002 |
| Formularios | Reactive Forms | ADR-003 |
| Estructura de carpetas | Feature-based | ADR-004 |
| Estado | Servicio + BehaviorSubject/Signals | ADR-005 |
| Pipe de fecha | Custom, extiende `DatePipe` | ADR-006 |
| Filtro/orden | Client-side | ADR-007 |
| Estadísticas | `StatisticsService` puro | ADR-008 |
| Autenticación | Firebase Auth + `AuthGuard` | ADR-009 |
| UI | Angular Material | ADR-010 |
| Testing | Jasmine/Karma, lógica pura | ADR-011 |

---

## 2. Modelo de datos

```typescript
interface Customer {
  id?: string;          // generado por Firestore
  nombre: string;
  apellido: string;
  edad: number;
  fechaNacimiento: Date | string;  // Timestamp de Firestore al leer, Date al escribir
  createdAt?: Date;
  createdBy?: string;   // uid del usuario autenticado que lo creó
}
```

> **Nota para discutir en Fase 1:** `edad` podría derivarse de `fechaNacimiento` en vez de guardarse como campo independiente (evita inconsistencias si pasa el tiempo). Se deja como pregunta abierta a resolver antes de escribir el modelo — no asumir de antemano.

---

## FASE 0 — Setup del proyecto

**Objetivo:** tener el proyecto Angular 15 corriendo, conectado a Firebase, con Angular Material instalado.

**Tareas:**
- Generar proyecto con Angular CLI 15, standalone (`ng new --standalone`).
- Configurar proyecto en Firebase Console (Firestore, Auth, Hosting).
- Instalar `@angular/fire` y configurar `environment.ts` / `environment.prod.ts` con las credenciales reales de Firebase (nunca hardcodeadas dentro del código de features). Ambos archivos van a `.gitignore`; se commitea en su lugar `environment.example.ts` con placeholders, según ADR-013.
- Instalar y configurar Angular Material (tema, `BrowserAnimationsModule`).
- Crear estructura de carpetas según ADR-004 (`core/`, `shared/`, `features/`).
- Inicializar repositorio Git y primer commit.

**ADRs aplicables:** ADR-001, ADR-002, ADR-004, ADR-010

**Definición de "Hecho":**
- `ng serve` levanta sin errores.
- Conexión a Firestore verificada con una lectura/escritura de prueba (después se borra el dato de prueba).
- Estructura de carpetas creada y vacía, lista para las siguientes fases.

**Gate:** Jonathan confirma que el proyecto levanta y la estructura de carpetas es la esperada antes de pasar a Fase 1.

---

## FASE 1 — Modelo de datos y servicio Firestore

**Objetivo:** capa de acceso a datos de clientes, aislada del resto de la app.

**Tareas:**
- Definir la interfaz `Customer` en `shared/models/customer.model.ts` (resolver primero la nota abierta sobre `edad` vs `fechaNacimiento`).
- Crear `CustomerService` en `core/services/` con métodos: `getCustomers()`, `addCustomer()`, `updateCustomer()`, `deleteCustomer()`, usando `@angular/fire/firestore`.
- Exponer el listado como Observable (o Signal) reactivo, según ADR-005.

**ADRs aplicables:** ADR-002, ADR-005

**Definición de "Hecho":**
- El servicio puede crear y leer clientes de Firestore, verificado manualmente o con un test simple.
- No hay lógica de UI dentro del servicio (separación estricta de responsabilidades).

**Gate:** revisar juntos la interfaz `Customer` final y la firma de los métodos del servicio antes de seguir.

---

## FASE 2 — Autenticación

**Objetivo:** login básico y rutas protegidas.

**Tareas:**
- Crear `features/auth/` con componente de login (email/password contra Firebase Auth).
- Crear `AuthService` en `core/services/` que exponga el estado de sesión actual.
- Crear `AuthGuard` (`CanActivate`) en `core/guards/` que proteja las rutas de alta/edición de clientes.
- Definir (a confirmar con Jonathan) si el listado de clientes también requiere sesión o es de acceso libre.

**ADRs aplicables:** ADR-009

**Definición de "Hecho":**
- Un usuario no autenticado no puede acceder a la ruta de creación de clientes (redirige a login).
- Login funcional contra un usuario de prueba creado manualmente en Firebase Auth.

**Gate:** confirmar con Jonathan qué rutas exactas quedan protegidas antes de codear el guard.

---

## FASE 3 — Formulario de alta de cliente

**Objetivo:** formulario reactivo con validaciones avanzadas y pipe de fecha personalizado.

**Tareas:**
- Crear `features/customers/customer-form/` con Reactive Form: `nombre`, `apellido`, `edad`, `fechaNacimiento`.
- Validaciones: campos requeridos, `edad` numérica dentro de un rango razonable (a definir: ej. 0-120), `fechaNacimiento` no futura, nombre/apellido sin caracteres numéricos.
- Crear el pipe `FechaPersonalizadaPipe` en `shared/pipes/` (ADR-006) y usarlo donde corresponda mostrar la fecha ya formateada (ej. en confirmación o en el listado, no dentro del propio input de formulario).
- Conectar el submit del formulario a `CustomerService.addCustomer()`.

**ADRs aplicables:** ADR-003, ADR-006

**Definición de "Hecho":**
- El formulario no permite submit con datos inválidos y muestra mensajes de error claros (`mat-error`).
- El cliente se guarda correctamente en Firestore al enviar el formulario válido.
- El pipe de fecha tiene al menos un test unitario (adelanto de Fase 7, se puede escribir acá mismo).

**Gate:** revisar juntos las reglas de validación exactas (rangos de edad, formato de fecha aceptado) antes de darlas por definitivas.

---

## FASE 4 — Listado de clientes (filtro y orden)

**Objetivo:** vista de todos los clientes con filtro y ordenamiento client-side.

**Tareas:**
- Crear `features/customers/customer-list/` que consuma `CustomerService.getCustomers()`.
- Implementar filtro por texto (nombre/apellido) y por rango de edad.
- Implementar ordenamiento por nombre, apellido, edad y fecha de nacimiento (asc/desc).
- Definir dónde vive la lógica de filtro/orden (getter/computed en el componente, o método en un servicio auxiliar) — evitar pipes impuros mal usados, según ADR-007.

**ADRs aplicables:** ADR-007, ADR-006 (reutiliza el pipe de fecha para mostrar `fechaNacimiento`)

**Definición de "Hecho":**
- Filtrar y ordenar no dispara nuevas lecturas a Firestore (todo sobre los datos ya cargados en memoria).
- La UI refleja los cambios de filtro/orden de forma inmediata.

**Gate:** confirmar con Jonathan la lista final de criterios de filtro/orden antes de implementar (la consigna dice "diversos criterios" sin especificar cuáles).

---

## FASE 5 — Estadísticas

**Objetivo:** cálculo de promedio y desvío estándar de las edades.

**Tareas:**
- Crear `StatisticsService` en `core/services/` (o `shared/services/`, a definir) con métodos puros: `calcularPromedio(edades: number[]): number` y `calcularDesviacionEstandar(edades: number[]): number`.
- Crear un componente simple (`features/statistics/`) que consuma el servicio y muestre los resultados, alimentado por el listado de clientes ya cargado.

**ADRs aplicables:** ADR-008

**Definición de "Hecho":**
- El servicio no depende de Angular más que del decorador `@Injectable` (fácilmente testeable con arrays de números fijos).
- Los resultados se recalculan automáticamente si cambia el listado de clientes (alta o baja de un cliente).

**Gate:** ninguno especial — es la fase más autocontenida; revisar el resultado final antes de pasar a Fase 6.

---

## FASE 6 — UI/UX con Angular Material

**Objetivo:** pulir la experiencia visual general.

**Tareas:**
- Aplicar componentes de Angular Material de forma consistente (`mat-toolbar`, `mat-table` o `mat-card` para el listado, `mat-form-field` en los formularios).
- Definir navegación general (a discutir: `mat-sidenav` vs navbar simple, según cuánto tiempo quede disponible).
- Estados de carga (`mat-progress-spinner`) mientras se leen datos de Firestore.
- Mensajes de error/confirmación visibles (`MatSnackBar`) al crear un cliente o al fallar una operación.

**ADRs aplicables:** ADR-010

**Definición de "Hecho":**
- La app se ve y se comporta de forma consistente en las tres vistas principales (login, alta, listado).

**Gate:** revisión visual conjunta antes de considerar cerrada esta fase (es la más subjetiva, conviene que Jonathan vea el resultado en el navegador).

---

## FASE 7 — Testing

**Objetivo:** cobertura de la lógica pura del proyecto.

**Tareas:**
- Unit tests de `StatisticsService` (casos: lista vacía, un solo elemento, varios elementos, valores conocidos para verificar la fórmula).
- Unit tests de `FechaPersonalizadaPipe` (fecha válida, fecha nula/inválida, distintos formatos).
- (Opcional, si el tiempo lo permite) test de validadores custom del formulario de alta.

**ADRs aplicables:** ADR-011

**Definición de "Hecho":**
- `ng test` corre sin fallos.
- Los tests cubren al menos los casos límite mencionados arriba (no solo el "happy path").

**Gate:** ninguno especial.

---

## FASE 8 — Documentación y Deploy

**Objetivo:** entregables finales según lo pedido en la consigna.

**Tareas:**
- Escribir `README.md` con: descripción del proyecto, cómo correrlo localmente, decisiones técnicas (versión resumida de `DECISIONS.md`), y capturas de pantalla si da el tiempo.
- Verificar JSDoc en servicios y pipes (requisito explícito de la consigna).
- `ng build --configuration production` y deploy a Firebase Hosting (`firebase deploy`).
- Subir el repositorio a GitHub como público.
- Verificar que la URL de Hosting funcione end-to-end (login, alta, listado, estadísticas) antes de entregar.

**ADRs aplicables:** todos (el README los resume)

**Definición de "Hecho":**
- URL pública funcionando.
- Repositorio público en GitHub con historial de commits atómico y legible.
- `README.md` completo.

**Gate:** revisión final conjunta de toda la app en producción antes de enviar el entregable.

---

## 3. Checklist de entregables finales (según consigna original)

- [ ] Angular 15
- [ ] Firestore para almacenar clientes
- [ ] Deploy en Firebase Hosting
- [ ] Repositorio en GitHub
- [ ] Formulario de alta: nombre, apellido, edad, fecha de nacimiento con pipe custom
- [ ] Listado de clientes con filtro y orden
- [ ] Promedio de edad
- [ ] Desvío estándar de edad
- [ ] Angular Material u otro framework UI
- [ ] Validaciones avanzadas en formularios
- [ ] Autenticación básica con Firebase Auth protegiendo rutas sensibles
- [ ] Código documentado (JSDoc/comentarios claros)
- [ ] Código modular, reutilizable, mantenible

---

## 4. Registro de cambios

| Fecha | Cambio |
|-------|--------|
| 2026-07-04 | Creación inicial del SPEC.md, fases 0 a 8 |
