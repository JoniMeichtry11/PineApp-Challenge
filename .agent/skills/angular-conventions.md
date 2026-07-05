# angular-conventions.md

Convenciones de código a seguir de forma consistente en todo el proyecto. El objetivo es que cualquier archivo del repo "se sienta" escrito por la misma persona con el mismo criterio.

## Idioma

- **Identificadores de código** (variables, métodos, clases, interfaces): en **inglés**. Ej. `customerService`, `getCustomers()`, `Customer`.
- **Texto de UI** (labels, mensajes de error, textos visibles al usuario): en **español**, porque el producto está pensado para un usuario de habla hispana.
- **Nombres de archivo**: en inglés, en kebab-case (ver abajo).
- **Comentarios/JSDoc**: en español, porque es el idioma en el que Jonathan va a defender el proyecto y necesita que el código "hable" en el mismo idioma que la explicación oral.

> Esta convención es una propuesta razonable pero está abierta a cambio — si Jonathan prefiere todo en inglés (código + comentarios) para que el repo se vea más "internacional" de cara a InFinanceXP, se ajusta acá y se aplica de forma retroactiva antes de la entrega.

## Nomenclatura de archivos

| Tipo | Convención | Ejemplo |
|---|---|---|
| Componente | `nombre.component.ts` | `customer-form.component.ts` |
| Servicio | `nombre.service.ts` | `customer.service.ts` |
| Guard | `nombre.guard.ts` | `auth.guard.ts` |
| Pipe | `nombre.pipe.ts` | `fecha-personalizada.pipe.ts` |
| Modelo/Interfaz | `nombre.model.ts` | `customer.model.ts` |
| Validador custom | `nombre.validator.ts` | `age-range.validator.ts` |

Todo en **kebab-case**. Sin abreviaturas crípticas (`cust.service.ts` no, `customer.service.ts` sí).

## Nomenclatura de código

- Clases e interfaces: `PascalCase` (`CustomerService`, `Customer`).
- Variables, métodos, propiedades: `camelCase` (`getCustomers()`, `isLoading`).
- Selectores de componentes: prefijo `app-` (`app-customer-form`), consistente con el default de Angular CLI.
- Observables: sufijo `$` (`customers$`, `isLoggedIn$`), para distinguirlos a simple vista de valores planos.
- Signals (si se usan en algún punto): sin sufijo `$`, ya que no son streams (`customersCount()` en vez de `customersCount$`).

## Standalone Components (ADR-001)

- Cada componente declara explícitamente sus `imports` en el decorador `@Component`. No se crean "módulos de conveniencia" que agrupen imports para evitar declarar todo — eso reintroduce el problema que standalone busca evitar.
- Rutas con `loadComponent()` para lazy loading de features, no `loadChildren()` apuntando a módulos.

## Reactive Forms (ADR-003)

- Un `FormGroup` por formulario, construido con `FormBuilder`, tipado con `NonNullableFormBuilder` cuando sea posible (Angular 15 ya lo soporta) para evitar `| null` innecesarios en los tipos.
- Validadores custom reutilizables van en `shared/validators/`, nunca definidos inline dentro del componente si se van a repetir en más de un lugar.
- Mensajes de error de validación centralizados en un objeto/mapa por campo, no hardcodeados dispersos en el template.

## Servicios y estado (ADR-005)

- Un servicio expone su estado como `Observable` de solo lectura hacia afuera (`asObservable()`), nunca el `BehaviorSubject` crudo, para evitar que un componente lo mute desde afuera sin pasar por los métodos del servicio.

## Estilo general

- Métodos cortos, con una sola responsabilidad. Si un método supera ~20-25 líneas, es señal de que probablemente haya que extraer algo.
- Se prioriza legibilidad sobre "cleverness" — este código lo tiene que poder explicar Jonathan en una entrevista técnica, no solo compilar.
