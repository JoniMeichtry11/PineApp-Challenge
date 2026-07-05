# PROMPTS.md — Prompts tipo para Antigravity

Plantillas reutilizables para cada momento del flujo de trabajo. Reemplazá lo que está entre `[corchetes]` según la fase en la que estés (ver `SPEC.md` para el nombre exacto de cada fase).

---

## 1. Prompt de inicio de fase

Usar al arrancar cada fase nueva (1 a 8), una vez que la fase anterior ya fue mergeada a `main`.

```
Arrancamos la Fase [N]: [nombre de la fase según SPEC.md, ej. "Autenticación"].

1. Releé la sección "FASE [N]" de SPEC.md y los ADRs que menciona en
   DECISIONS.md antes de proponer nada.

2. Creá la rama feature/fase-[N]-[nombre-corto] desde main.

3. Presentame el PLAN de esta fase: qué archivos vas a crear/modificar,
   qué ADRs aplicás en cada uno, y en qué orden. NO ejecutes nada todavía.

4. Si encontrás algo en esta fase que no está resuelto en DECISIONS.md
   o SPEC.md, aplicá el protocolo de no-silent-decisions.md antes de
   asumir un criterio propio.

Esperá mi aprobación explícita antes de pasar a Execute.
```

---

## 2. Prompt de cierre de fase (merge a `main`)

Usar una vez que ya revisaste el código de la fase y el "Gate" definido en `SPEC.md` está superado.

```
La Fase [N] queda aprobada. Antes de mergear:

1. Revisá que todos los commits de esta rama sigan el formato definido
   en architecture-rules.md ([Fase N] Descripción + referencia a ADR).

2. Si durante esta fase se agregó alguna entrada nueva en la sección
   "Decisiones pendientes" de DECISIONS.md, convertila en un ADR formal
   numerado (ADR-01X) con el mismo formato que las anteriores.

3. Escribime la descripción del Pull Request de
   feature/fase-[N]-[nombre-corto] hacia main: qué se hizo, qué ADRs se
   aplicaron, y qué quedó pendiente (si algo quedó afuera del alcance
   de esta fase).

4. Marcá en el checklist de la sección 3 de SPEC.md los ítems de la
   consigna que esta fase ya cubre.

Yo hago el merge manualmente en GitHub una vez que revise el PR.
```

---

## 3. Prompt para retomar sesión

Usar si volvés a trabajar en el proyecto en una sesión nueva de Antigravity (contexto reiniciado) o después de un corte largo.

```
Estamos retomando este proyecto. Antes de seguir:

1. Releé DECISIONS.md, SPEC.md y los tres archivos de .agent/skills/
   completos — no asumas nada de una sesión anterior.

2. Revisá en qué rama estamos y qué fase de SPEC.md corresponde según
   el nombre de la rama y el estado actual del código.

3. Decime en 3-4 líneas: en qué fase estamos, qué está hecho, y qué
   sería lo siguiente a hacer según el plan.

No ejecutes nada todavía — quiero confirmar que el contexto quedó bien
reconstruido antes de seguir.
```

---

## Notas de uso

- El prompt de "inicio de fase" y el de "cierre de fase" son los dos que más vas a repetir — conviene tenerlos a mano (ej. en notas o en un snippet manager) durante todo el desarrollo del challenge.
- Si en algún momento el agente arranca a ejecutar sin haber presentado el plan primero, es una señal de que hay que recordarle explícitamente el protocolo de `architecture-rules.md` (Regla 2) antes de seguir — no dejarlo pasar aunque el resultado "se vea bien", porque rompe la trazabilidad que necesitás para la entrevista.
