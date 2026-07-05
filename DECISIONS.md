# DECISIONS.md — Registro de Decisiones de Arquitectura (ADR)

**Proyecto:** Desafío Técnico Frontend Developer — PinApp / InFinanceXP
**Stack base exigido:** Angular 15 + Firebase (Firestore, Hosting, Auth)
**Objetivo de este documento:** dejar registrada CADA decisión técnica no trivial, con las opciones evaluadas y el motivo de la elección, para poder defenderlas en la entrevista técnica sin depender de la memoria ni de la IA.

**Regla de uso:** ninguna decisión de arquitectura se toma "en el camino" mientras se codea. Si durante el desarrollo con Antigravity surge una decisión nueva no contemplada acá, se PAUSA, se discute, se agrega una entrada nueva a este documento, y recién ahí se continúa.

---

## Índice

| ID | Decisión |
|----|----------|
| ADR-001 | Standalone Components vs NgModules |
| ADR-002 | Acceso a Firestore: AngularFire vs SDK modular |
| ADR-003 | Reactive Forms vs Template-driven Forms |
| ADR-004 | Estructura de carpetas |
| ADR-005 | Manejo de estado |
| ADR-006 | Pipe personalizado de fecha |
| ADR-007 | Filtro y orden de la lista de clientes |
| ADR-008 | Cálculo de estadísticas (promedio y desvío estándar) |
| ADR-009 | Autenticación |
| ADR-010 | Librería de UI |
| ADR-011 | Testing |
| ADR-012 | Estrategia de branching y commits |
| ADR-013 | Manejo de credenciales de Firebase |
| ADR-014 | Cálculo de edad al guardar/editar |
| ADR-015 | Alcance de rutas protegidas |
| ADR-016 | Firestore Security Rules |

---

## ADR-001: Standalone Components vs NgModules

- **Contexto:** Angular 15 soporta standalone components de forma estable (desde v14), pero el patrón "clásico" con NgModules sigue siendo válido y muy usado en proyectos legacy.
- **Opciones consideradas:**
  - A) Standalone Components
  - B) NgModules tradicionales
- **Decisión:** A) Standalone Components
- **Justificación:** reduce boilerplate (no hace falta declarar cada componente en un módulo), simplifica el lazy loading de rutas, y demuestra conocimiento actualizado del framework, algo que un evaluador técnico en 2026 va a valorar.
- **Trade-off aceptado:** es un patrón más nuevo, con menos ejemplos "clásicos" dando vueltas; si el entrevistador viene de un stack más viejo, puede requerir una breve explicación de cómo reemplaza a los NgModules.
- **Cómo defenderlo:** "Elegí standalone porque es hacia donde va el ecosistema Angular y porque para un proyecto de este tamaño, mantener un `AppModule` + módulos de feature es complejidad innecesaria."

---

## ADR-002: Acceso a Firestore — AngularFire vs SDK modular directo

- **Contexto:** hay que leer/escribir en Firestore. Se puede hacer con el SDK de Firebase "a pelo" o con la librería oficial de Angular.
- **Opciones consideradas:**
  - A) `@angular/fire` (AngularFire)
  - B) Firebase SDK modular (`firebase/firestore`) directo, sin wrapper
- **Decisión:** A) `@angular/fire`
- **Justificación:** expone Observables idiomáticos (`collectionData`, `docData`) que se integran naturalmente con RxJS y el `async` pipe, en vez de manejar Promesas o listeners sueltos. Es lo que un evaluador de Angular espera ver en un proyecto "hecho como corresponde".
- **Trade-off aceptado:** una capa de abstracción extra sobre el SDK nativo; para un proyecto muy chico podría considerarse "de más", pero el beneficio en legibilidad e integración con Angular lo justifica.
- **Cómo defenderlo:** "Usé AngularFire porque me da Observables nativos de RxJS en vez de tener que envolver Promesas yo mismo, y porque es el approach recomendado por el propio equipo de Angular/Firebase."

---

## ADR-003: Reactive Forms vs Template-driven Forms

- **Contexto:** la consigna pide "validaciones avanzadas" en los formularios.
- **Opciones consideradas:**
  - A) Reactive Forms
  - B) Template-driven Forms
- **Decisión:** A) Reactive Forms
- **Justificación:** permite validadores síncronos y asíncronos personalizados (`Validators`, `AsyncValidators`), testeo unitario del formulario sin necesidad de renderizar el DOM, y mejor manejo de formularios dinámicos o complejos.
- **Trade-off aceptado:** requiere más código de configuración inicial (`FormBuilder`, `FormGroup`) comparado con `ngModel`, pero es más mantenible a mediano plazo.
- **Cómo defenderlo:** "Con Template-driven, las validaciones avanzadas y los validadores custom son más difíciles de testear de forma aislada. Reactive Forms me permite separar la lógica de validación del template."

---

## ADR-004: Estructura de carpetas

- **Contexto:** hay que organizar componentes, servicios, pipes, guards, etc. de forma que el código sea "modular, reutilizable y fácil de mantener" (requisito explícito de la consigna).
- **Opciones consideradas:**
  - A) Feature-based (por dominio funcional)
  - B) Type-based (carpetas por tipo: `components/`, `services/`, `pipes/` planas)
- **Decisión:** A) Feature-based
- **Justificación:** es el estándar de facto en proyectos Angular medianos/grandes; agrupa todo lo relacionado a una funcionalidad (ej. clientes) en un mismo lugar, facilitando el lazy loading y la escalabilidad.
- **Estructura propuesta:**
  ```
  src/app/
    core/              → guards, interceptors, servicios singleton
    shared/            → pipes, componentes UI reutilizables, modelos comunes
    features/
      customers/       → formulario alta, listado, lógica de clientes
      auth/             → login, guard de autenticación
      statistics/       → cálculo y visualización de estadísticas
  ```
- **Trade-off aceptado:** para un proyecto tan chico como este challenge, podría percibirse como "sobre-estructurado", pero demuestra que se piensa en escalabilidad.
- **Cómo defenderlo:** "Organicé por feature para que si mañana el proyecto crece, cada dominio funcional sea autocontenido y no haya que rastrear archivos relacionados en 5 carpetas distintas."

---

## ADR-005: Manejo de estado

- **Contexto:** hay que compartir la lista de clientes entre el formulario de alta, el listado y el módulo de estadísticas.
- **Opciones consideradas:**
  - A) NgRx (state management completo)
  - B) Servicio con `BehaviorSubject` / Signals + patrón de Store simple
- **Decisión:** B) Servicio (`CustomerService`) con estado reactivo simple
- **Justificación:** NgRx agrega una complejidad (actions, reducers, effects, selectors) que no se justifica para un CRUD de una sola entidad. Un servicio con `BehaviorSubject` (o Signals, disponibles como developer preview en Angular 15) resuelve el mismo problema con muchísimo menos código.
- **Trade-off aceptado:** si el evaluador pregunta por qué no NgRx, hay que estar preparado para explicar el criterio de "cuándo sí y cuándo no" usar una librería de estado.
- **Cómo defenderlo:** "NgRx resuelve problemas de estado complejo compartido entre muchas features con múltiples fuentes de verdad. Acá tenemos una sola entidad y un flujo simple: hubiera sido sobre-ingeniería."

---

## ADR-006: Pipe personalizado de fecha

- **Contexto:** la consigna pide explícitamente un pipe personalizado para formatear la fecha de nacimiento (no usar directamente `DatePipe` nativo).
- **Opciones consideradas:**
  - A) Pipe custom que envuelve y extiende `DatePipe`
  - B) Pipe custom con lógica de formateo propia desde cero
- **Decisión:** A) Pipe custom (`FechaPersonalizadaPipe`) que usa `DatePipe` internamente pero agrega lógica propia (ej. formato configurable por parámetro, manejo de edge cases como fecha inválida o nula)
- **Justificación:** cumple el requisito de "pipe personalizado" sin reinventar el parsing de fechas (que ya resuelve bien `Intl`/`DatePipe`), mostrando que se sabe extender funcionalidad de Angular en vez de duplicar lógica innecesariamente.
- **Ubicación:** `shared/pipes/fecha-personalizada.pipe.ts`
- **Trade-off aceptado:** si el evaluador espera un pipe 100% "desde cero" sin usar `DatePipe` como base, hay que poder justificar por qué reusar es mejor práctica que reinventar.
- **Cómo defenderlo:** "No reinventé el parsing de fechas: extendí `DatePipe` para agregar el formato específico que pedía la consigna. Reusar código probado es mejor práctica que reescribir algo que Angular ya resuelve bien."

---

## ADR-007: Filtro y orden de la lista de clientes

- **Contexto:** la consigna pide filtrar y ordenar la lista según diversos criterios.
- **Opciones consideradas:**
  - A) Filtrado/ordenamiento client-side (en el componente, sobre los datos ya traídos)
  - B) Queries dinámicas a Firestore por cada cambio de filtro/orden
- **Decisión:** A) Client-side
- **Justificación:** el volumen de datos esperado para este challenge es chico; hacer una query nueva a Firestore por cada tecleo o cambio de filtro generaría lecturas innecesarias (con costo en un proyecto real) y latencia percibida por el usuario.
- **Implementación:** lógica de filtrado/orden en el propio componente o en un servicio (`getters`/`computed`), evitando pipes impuros que se re-ejecuten en cada ciclo de detección de cambios.
- **Trade-off aceptado:** no escala a datasets grandes (miles de clientes); en un caso real de producción con mucho volumen, esto se movería a queries paginadas del lado del servidor.
- **Cómo defenderlo:** "Para este volumen de datos, filtrar en el cliente es más eficiente que pegarle a Firestore en cada cambio. Si el dataset creciera mucho, la solución cambiaría a paginación y queries server-side, y así lo aclaro."

---

## ADR-008: Cálculo de estadísticas (promedio y desvío estándar)

- **Contexto:** la consigna pide calcular promedio y desvío estándar de las edades.
- **Opciones consideradas:**
  - A) Lógica de cálculo embebida directamente en el componente
  - B) `StatisticsService` separado, puro, testeable
- **Decisión:** B) `StatisticsService`
- **Justificación:** separa responsabilidades (el componente se encarga de mostrar, el servicio de calcular), permite testear la lógica matemática de forma aislada sin necesidad de renderizar componentes, y es reutilizable si en el futuro se necesitan más estadísticas.
- **Trade-off aceptado:** una capa más de indirección para algo que técnicamente podría ser una función inline; se acepta porque mejora testabilidad y separación de responsabilidades.
- **Cómo defenderlo:** "Separé el cálculo estadístico en un servicio independiente para poder testearlo con datos controlados, sin depender del ciclo de vida de ningún componente."

---

## ADR-009: Autenticación

- **Contexto:** la consigna pide un sistema de autenticación básico para proteger rutas y acciones sensibles.
- **Opciones consideradas:**
  - A) Firebase Authentication (email/password) + `AuthGuard` (`CanActivate`)
  - B) Autenticación simulada/local (sin Firebase Auth real)
- **Decisión:** A) Firebase Authentication + `AuthGuard`
- **Justificación:** ya se está usando Firebase para Firestore y Hosting, así que sumar Auth es consistente con el resto del stack, es gratuito para este volumen, y demuestra manejo de guards y rutas protegidas, tal como pide explícitamente la consigna.
- **Alcance:** login simple con email/password; `AuthGuard` protegiendo las rutas de creación/edición de clientes (no necesariamente el listado en modo lectura, según se defina).
- **Trade-off aceptado:** no se implementa registro de usuarios público ni recuperación de contraseña (fuera del alcance del challenge); se puede aclarar que en un producto real se sumaría.
- **Cómo defenderlo:** "Usé Firebase Auth porque ya estábamos en el ecosistema Firebase por Firestore y Hosting, y porque me permite mostrar guards de ruta reales, no una simulación."

---

## ADR-010: Librería de UI

- **Contexto:** la consigna sugiere Angular Material u otro framework de UI.
- **Opciones consideradas:**
  - A) Angular Material
  - B) Otra librería (ej. PrimeNG, Tailwind puro)
- **Decisión:** A) Angular Material
- **Justificación:** es la librería oficial del equipo de Angular, tiene integración directa con Reactive Forms (`mat-error`, `matInput`, etc.), y es la opción mencionada explícitamente en la consigna — reduce el riesgo de que se perciba como una elección "rara".
- **Trade-off aceptado:** visualmente más "genérica" que otras opciones más modernas (ej. Tailwind + componentes custom), pero prioriza velocidad de desarrollo y consistencia sobre diseño distintivo para este challenge puntual.
- **Cómo defenderlo:** "Fui con la opción que la propia consigna sugería y que además tiene la mejor integración nativa con Reactive Forms."

---

## ADR-011: Testing

- **Contexto:** no es un requisito explícito de la consigna, pero suma como buena práctica y da píe a mostrar código testeable.
- **Opciones consideradas:**
  - A) Sin tests (foco 100% en features)
  - B) Unit tests acotados en las piezas de lógica pura (`StatisticsService`, pipe de fecha)
- **Decisión:** B) Tests acotados en lógica pura
- **Justificación:** `StatisticsService` y el pipe de fecha son las piezas más fáciles de testear de forma aislada (sin mocks complejos de Firestore) y las que mejor demuestran calidad de código en poco tiempo de desarrollo. Se usa Jasmine/Karma, que viene configurado por default en Angular 15.
- **Trade-off aceptado:** no hay cobertura end-to-end ni tests de integración con Firestore (requeriría emuladores y más tiempo del que probablemente amerite este challenge).
- **Cómo defenderlo:** "Prioricé testear la lógica de negocio pura porque es la que más valor de confiabilidad aporta por el tiempo invertido. Tests de integración con Firestore los dejaría para una siguiente iteración con el emulador de Firebase."

---

## ADR-012: Estrategia de branching y commits

- **Contexto:** hace falta un flujo de control de versiones que se pueda defender en la entrevista y que además ayude a mantener un historial claro por decisión/fase.
- **Opciones consideradas:**
  - A) GitFlow completo (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`)
  - B) Trunk-based con commits directos a `main`
  - C) Una rama por fase de `SPEC.md` (`feature/fase-0-setup`, `feature/fase-1-firestore-service`, etc.), mergeada a `main` vía Pull Request al cerrar cada fase
- **Decisión:** C) Una rama por fase, mergeada por PR
- **Justificación:** GitFlow completo está pensado para equipos con releases paralelos y mantenimiento de versiones en producción — total sobre-ingeniería para un proyecto de un solo desarrollador en unos pocos días. Trunk-based directo a `main` es válido pero no deja tanta evidencia de proceso. Una rama por fase da un historial de PRs en GitHub que muestra organización del trabajo sin la complejidad de GitFlow.
- **Convención de nombres de rama:** `feature/fase-N-nombre-corto` (ej. `feature/fase-3-formulario-alta`).
- **Convención de commits dentro de cada rama:** commits atómicos por tarea, formato `[Fase X] Descripción corta` + referencia a ADR si aplica (definido en `architecture-rules.md`, Regla 5).
- **Trade-off aceptado:** más pasos que trabajar directo sobre `main`; para un proyecto de esta escala es un costo mínimo comparado con el valor de mostrar un historial de PRs prolijo.
- **Cómo defenderlo:** "Usé una rama por fase en vez de GitFlow completo porque GitFlow resuelve problemas de releases paralelos en equipo que acá no existen. Elegí el nivel de proceso que el tamaño del proyecto justifica, ni más ni menos."

---

## ADR-013: Manejo de credenciales de Firebase

- **Contexto:** la consigna exige subir el código completo a un repositorio **público** en GitHub. Hay que decidir cómo manejar el archivo de configuración de Firebase (`apiKey`, `authDomain`, etc.) que usa `@angular/fire`.
- **Aclaración conceptual previa:** la configuración web de Firebase no es un secreto — se expone inevitablemente en el bundle de JS que corre en el navegador de cualquier usuario. La seguridad real de la app depende de las **Firestore Security Rules** y de **Firebase Auth**, no de ocultar estas claves.
- **Opciones consideradas:**
  - A) Commitear `environment.ts` con las claves reales directamente (justificado en que "no son secretas")
  - B) Usar el mecanismo nativo de Angular (`environment.ts`/`environment.prod.ts` + `fileReplacements`), pero excluir el archivo real del control de versiones vía `.gitignore`, commiteando en su lugar un `environment.example.ts` como plantilla
  - C) Usar `.env` con un builder custom (ej. `@ngx-env/builder`) para inyectar variables de entorno reales en build time
- **Decisión:** B) Mecanismo nativo de Angular + archivo real gitignoreado + plantilla de ejemplo commiteada
- **Justificación:** aunque las claves no son secretas en sentido estricto, sacarlas del repo es buena higiene (no atar el repo público a un proyecto Firebase específico, evitar arrastrar credenciales viejas si el código se reutiliza). La Opción C agrega tooling no estándar de Angular sin beneficio real, dado que el problema que resuelve `.env` en otros contextos (ocultar secretos reales de backend) no aplica acá.
- **Implementación:**
  - `src/environments/environment.ts` y `environment.prod.ts` (con claves reales) → agregados a `.gitignore`.
  - `src/environments/environment.example.ts` → commiteado, con la misma estructura pero valores placeholder (`"TU_API_KEY_ACA"`).
  - Documentado en el `README.md` (Fase 8): "copiar `environment.example.ts` a `environment.ts` y completar con tus propias credenciales de Firebase antes de correr el proyecto localmente".
- **Trade-off aceptado:** quien clone el repo no puede correrlo out-of-the-box sin crear su propio proyecto de Firebase; se acepta porque es el comportamiento esperado y documentado.
- **Cómo defenderlo:** "El `apiKey` de Firebase no es secreto — termina en el bundle del cliente igual. Lo saqué del repo por higiene, no por seguridad; la seguridad real la dan las Security Rules de Firestore y Firebase Auth, que es donde realmente hay que poner el foco."

---

## ADR-014: Cálculo de edad al guardar/editar

- **Contexto:** la consigna pide `Edad` como campo propio del formulario (además de `Fecha de nacimiento`), pero calcularla manualmente arriesga inconsistencia o error de tipeo.
- **Decisión:** se guarda `edad` como campo explícito en Firestore (cumple la letra de la consigna), pero se **calcula automáticamente a partir de `fechaNacimiento`** en el momento de alta/edición, en vez de dejar que el usuario la tipee.
- **Campo en el formulario (Fase 3):** `Edad` se muestra como campo de **solo lectura**, auto-completado al cargar la fecha de nacimiento — no editable manualmente.
- **Trade-off aceptado (importante, no ocultarlo):** este approach elimina el error de tipeo, pero **no elimina el drift temporal** — si un registro no se edita durante años, la edad guardada queda desactualizada igual que si se hubiera tipeado a mano. Se acepta conscientemente porque resolver el drift completo requeriría recalcular en cada lectura (Cloud Function programada o cálculo en el cliente al listar), que excede el alcance de este challenge.
- **Cómo defenderlo:** "Elegí calcular la edad al guardar en vez de dejarla puramente derivada, porque la consigna pide el campo explícito en base de datos. Soy consciente de que esto no resuelve el drift si un registro queda años sin tocarse — es un trade-off aceptado, no un descuido."

---

## ADR-015: Alcance de rutas protegidas

- **Contexto:** `SPEC.md` (Fase 2) dejaba abierto si el listado de clientes requiere sesión o es de acceso libre.
- **Opciones consideradas:**
  - A) Solo alta/edición requieren login; el listado es público
  - B) Toda la app (incluido el listado) requiere login
- **Decisión:** B) Toda la app requiere login
- **Justificación:** los datos de un cliente (nombre, apellido, fecha de nacimiento) son datos personales; "proteger por defecto" es el criterio más defendible para una app que gestiona ese tipo de información, más allá de que la consigna no lo exija explícitamente para el listado.
- **Consecuencia práctica a resolver:** quien evalúe el challenge (PinApp/InFinanceXP) necesita poder acceder a la app desplegada para revisarla. Se crea un **usuario de prueba (demo/reviewer)** en Firebase Auth y sus credenciales se documentan en el `README.md` (Fase 8), separado de cualquier dato real.
- **Trade-off aceptado:** menos "demostrable" a primera vista que tener el listado abierto, pero es el comportamiento correcto para datos personales y se compensa documentando bien el acceso de revisión.
- **Cómo defenderlo:** "Protegí toda la app porque son datos personales, no solo por seguir la consigna al pie de la letra. Para que se pueda revisar sin fricción, dejé documentadas credenciales de un usuario de prueba en el README."

---

## ADR-016: Firestore Security Rules

*(Resuelve el pendiente marcado en ADR-013)*

- **Contexto:** el `AuthGuard` de Angular controla la navegación dentro de la app, pero no impide que alguien llame a Firestore directamente sin pasar por la UI. La seguridad real depende de las Security Rules configuradas en Firestore, y deben reflejar la misma decisión que ADR-015.
- **Opciones consideradas:**
  - A) Modo test (reglas abiertas, con fecha de expiración) — **inaceptable para la entrega final**
  - B) `allow read, write: if request.auth != null;` — cualquier usuario autenticado puede leer y escribir cualquier registro
  - C) Igual que B, pero además solo el usuario que creó un registro (`request.auth.uid == resource.data.createdBy`) puede editarlo/borrarlo; lectura abierta a cualquier autenticado
- **Decisión:** B) para el alcance de este challenge, con C marcada como mejora opcional si el tiempo lo permite
- **Justificación:** la consigna no plantea un modelo multi-usuario con propiedad de registros (es una app de gestión, no un sistema con roles); exigir autenticación alcanza para cumplir "proteger rutas y acciones sensibles". La Opción C es más completa pero agrega complejidad de reglas que no está pedida — se dokumenta como posible extensión, no como bloqueo de la entrega.
- **Trade-off aceptado:** cualquier usuario autenticado (incluido el usuario de prueba del ADR-015) puede editar/borrar cualquier cliente, no solo los propios. Aceptable para el alcance del challenge.
- **Cómo defenderlo:** "Los guards de Angular son solo UX — la seguridad real vive en las Firestore Rules, por eso exigí `request.auth != null` también ahí. Consideré agregar ownership por usuario (`createdBy`), pero la consigna no plantea un modelo multi-usuario, así que lo dejé como posible mejora, no como requisito."

---

## Decisiones pendientes / a definir durante el desarrollo

- (vacío — el pendiente de Firestore Security Rules quedó resuelto en ADR-016)

> Esta sección se va completando a medida que surgen decisiones nuevas durante el loop Plan → Review → Execute con Antigravity. Ninguna decisión nueva se toma sin agregarse acá primero.

- (vacío por ahora)

---

## Registro de cambios

| Fecha | Cambio |
|-------|--------|
| 2026-07-04 | Creación inicial del documento con ADR-001 a ADR-011 |
| 2026-07-04 | Agregado ADR-012 (estrategia de branching y commits) |
| 2026-07-05 | Agregado ADR-013 (manejo de credenciales de Firebase) y nota pendiente sobre Firestore Security Rules |
| 2026-07-05 | Agregado ADR-014 (cálculo de edad), ADR-015 (alcance de rutas protegidas) y ADR-016 (Firestore Security Rules, resuelve el pendiente de ADR-013) |
