# architecture-rules.md

Reglas de comportamiento para cualquier agente (Antigravity) que trabaje en este repositorio. Estas reglas tienen prioridad sobre cualquier "buena práctica genérica" que el agente traiga por defecto.

## Regla 1 — Las fuentes de verdad son `DECISIONS.md` y `SPEC.md`

- Toda decisión de arquitectura ya tomada está en `DECISIONS.md`, identificada por un ID de ADR (ej. ADR-003).
- Todo el plan de trabajo fase por fase está en `SPEC.md`.
- Si una tarea contradice o no está contemplada en alguno de los dos documentos, el agente NO improvisa: se detiene y pregunta.
- El agente puede (y debe) citar el ADR correspondiente cuando implementa algo relacionado a esa decisión (ej. en el mensaje de plan: "Según ADR-002, esto se implementa con `@angular/fire`").

## Regla 2 — No se avanza de fase sin aprobación explícita

- Cada fase de `SPEC.md` tiene un "Gate" definido. El agente no empieza la fase siguiente hasta que Jonathan confirme explícitamente que el Gate de la fase actual está superado.
- Frases como "dale", "OK", "seguí", "aprobado" cuentan como aprobación. El silencio o un cambio de tema NO cuenta como aprobación.
- Si Jonathan pide algo fuera de orden (ej. "che, arranquemos por el listado antes que el formulario"), el agente lo puede hacer, pero primero confirma el cambio de orden en voz alta antes de ejecutar.

## Regla 3 — No se agregan dependencias/librerías nuevas sin avisar

- Cualquier paquete npm que no esté ya mencionado en `DECISIONS.md` o `SPEC.md` (ej. una librería de utilidades, un helper de fechas como `date-fns`, etc.) se propone antes de instalarse, indicando:
  - Qué problema resuelve.
  - Por qué no alcanza con lo que ya está en el stack (Angular, RxJS, Angular Material, Firebase).
  - Tamaño/impacto aproximado en el bundle si es relevante.

## Regla 4 — Estructura de carpetas fija (ADR-004)

- Todo archivo nuevo va en una de estas tres carpetas, sin excepción:
  - `core/` → servicios singleton, guards, interceptors.
  - `shared/` → pipes, validadores, modelos, componentes UI reutilizables entre features.
  - `features/<nombre-feature>/` → todo lo específico de una funcionalidad (customers, auth, statistics).
- Si el agente no está seguro de dónde va un archivo nuevo, pregunta antes de crearlo. No se crean carpetas nuevas de primer nivel sin aprobación.

## Regla 5 — Branching y commits (ADR-012)

- Cada fase de `SPEC.md` se trabaja en su propia rama: `feature/fase-N-nombre-corto` (ej. `feature/fase-2-auth`), creada desde `main` al arrancar la fase.
- No se hacen commits gigantes que mezclen varias tareas dentro de la misma fase.
- Formato de mensaje de commit:
  ```
  [Fase X] Descripción corta de la tarea

  Referencia: ADR-00Y (si aplica)
  ```
- Al cerrar una fase (Gate superado y aprobado por Jonathan), se abre un Pull Request de `feature/fase-N-...` hacia `main`. El agente redacta la descripción del PR resumiendo qué se hizo y qué ADRs aplicó; Jonathan lo revisa y mergea manualmente en GitHub.
- No se usa GitFlow completo (`develop`, `release/*`, `hotfix/*`): es un proyecto de un solo desarrollador y esa complejidad no se justifica (ver ADR-012).
- Esto es clave para poder reconstruir cronológicamente el "por qué" de cada cambio si en la entrevista técnica preguntan por el historial de Git.

## Regla 6 — Documentación mínima obligatoria

- Todo servicio, guard, pipe y validador custom lleva un bloque JSDoc explicando qué hace y por qué existe (no qué hace línea por línea — eso ya lo dice el código).
- No se agregan comentarios redundantes que solo repiten lo que el código ya dice de forma obvia.

## Regla 7 — Ante la duda, se para

- Si en cualquier momento el agente detecta que está por tomar una decisión que tiene más de un camino razonable y ese camino no está resuelto en `DECISIONS.md`, aplica el protocolo de `no-silent-decisions.md` antes de seguir.
