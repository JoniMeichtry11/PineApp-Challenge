import { Timestamp } from '@angular/fire/firestore';

/**
 * Convierte un valor de fecha que puede venir de Firestore (Timestamp, string, Date, etc.)
 * a una instancia Date válida de JavaScript.
 *
 * @param value Valor a convertir.
 * @returns Instancia de Date de JavaScript (por defecto retorna Date actual en caso de error o nulo).
 */
export function convertToDate(value: any): Date {
  if (!value) {
    return new Date();
  }
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (typeof value.toDate === 'function') {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  return new Date();
}

/**
 * Convierte una fecha (Date, string, number) a un Timestamp compatible con Firestore.
 *
 * @param value Valor a convertir.
 * @returns Instancia de Timestamp de Firestore.
 */
export function convertToTimestamp(value: Date | string | number | null | undefined): Timestamp {
  if (!value) {
    return Timestamp.now();
  }
  if (value instanceof Date) {
    return Timestamp.fromDate(value);
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? Timestamp.now() : Timestamp.fromDate(date);
}
