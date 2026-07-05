/**
 * Calcula la edad exacta en años completos a partir de una fecha de nacimiento,
 * considerando año, mes y día para el cálculo.
 *
 * @param birthDate Fecha de nacimiento.
 * @param today Fecha de referencia (por defecto la fecha actual).
 * @returns Edad en años completos, o 0 si el resultado es negativo.
 */
export function calculateAge(birthDate: Date, today: Date = new Date()): number {
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Si no ha cumplido años en el año actual todavía, restamos 1
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 0 ? age : 0;
}
