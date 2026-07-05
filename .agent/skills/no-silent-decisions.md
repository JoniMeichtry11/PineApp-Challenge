# no-silent-decisions.md

Protocolo obligatorio para cuando el agente se encuentra con una ambigüedad o una decisión de diseño no resuelta en `DECISIONS.md` o `SPEC.md`.

## Cuándo se activa este protocolo

Este protocolo se dispara ante cualquiera de estas señales:

- Hay más de una forma razonable de implementar algo y elegir una u otra tiene implicancias a mediano plazo (performance, mantenibilidad, seguridad).
- Se necesita instalar una dependencia nueva no mencionada en `DECISIONS.md`/`SPEC.md`.
- Una regla de negocio no está del todo especificada (ej. "validaciones avanzadas" sin decir cuáles exactamente, "diversos criterios" de filtro sin listarlos).
- El agente está por desviarse del orden de fases definido en `SPEC.md`.
- El agente está por crear un archivo, carpeta o patrón que no está contemplado en `architecture-rules.md` o `angular-conventions.md`.

**Regla general: si el agente se encuentra "completando" un vacío de la consigna con su propio criterio sin decirlo explícitamente, eso es exactamente lo que este protocolo busca evitar.**

## Qué hacer cuando se activa

El agente presenta la situación con este formato fijo, sin avanzar con código hasta recibir respuesta:

```
⏸️ DECISIÓN REQUERIDA

Contexto: [qué se está por hacer y por qué surgió la duda]

Opciones:
  A) [opción 1] — [ventaja principal] / [desventaja principal]
  B) [opción 2] — [ventaja principal] / [desventaja principal]
  (C, si aplica)

Recomendación tentativa: [cuál elegiría el agente y por qué, marcada
explícitamente como "tentativa" — no se ejecuta sola]

¿Con cuál seguimos?
```

## Qué NO hacer nunca

- No elegir la opción "más común" o "más segura" y avanzar sin preguntar, aunque el agente esté muy seguro de cuál es la mejor.
- No mezclar la pregunta con la ejecución (ej. no escribir "voy a hacerlo así, avisame si no te gusta" y ya generar el código en el mismo paso).
- No usar el silencio de un mensaje anterior como aprobación tácita de una decisión distinta a la que se preguntó.

## Después de recibir la respuesta

- Si la decisión es relevante para futuras fases o para la defensa técnica del proyecto, se agrega como entrada nueva en la sección **"Decisiones pendientes"** de `DECISIONS.md`, con el mismo formato que las ADR-001 a ADR-011 (Contexto / Opciones / Decisión / Justificación / Trade-off / Cómo defenderlo), y recién ahí se ejecuta el código.
- Si es una decisión menor sin implicancia futura (ej. el texto exacto de un mensaje de error), no hace falta documentarla formalmente, pero igual se confirma antes de escribir el código si hay ambigüedad real.
