import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

/**
 * Pipe personalizado para formatear fechas de nacimiento y registro.
 * Extiende el comportamiento básico de DatePipe (ADR-006).
 */
@Pipe({
  name: 'fechaPersonalizada',
  standalone: true
})
export class FechaPersonalizadaPipe implements PipeTransform {
  private readonly datePipe = new DatePipe('en-US');

  /**
   * Transforma una fecha (Date, string, number, o Timestamp) a una cadena formateada.
   *
   * @param value El valor de fecha a formatear.
   * @param format El formato deseado (por defecto 'dd/MM/yyyy').
   * @returns La fecha formateada o una cadena indicando error/vacío.
   */
  transform(value: any, format: string = 'dd/MM/yyyy'): string {
    if (value === null || value === undefined) {
      return '';
    }

    let date: Date;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string' || typeof value === 'number') {
      date = new Date(value);
    } else if (value && typeof value.toDate === 'function') {
      // Manejo directo de Firebase Timestamp en caso de escape de conversión
      date = value.toDate();
    } else {
      return 'Fecha Inválida';
    }

    if (isNaN(date.getTime())) {
      return 'Fecha Inválida';
    }

    return this.datePipe.transform(date, format) || '';
  }
}
