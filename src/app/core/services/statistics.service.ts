import { Injectable } from '@angular/core';

/**
 * Servicio encargado de realizar cálculos estadísticos sobre los datos de los clientes (ADR-008).
 */
@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  /**
   * Calcula el promedio de un conjunto de números.
   *
   * @param values Lista de valores numéricos.
   * @returns El promedio de los valores o 0 si la lista está vacía.
   */
  calculateAverage(values: number[]): number {
    if (!values || values.length === 0) {
      return 0;
    }
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  /**
   * Calcula la desviación estándar poblacional de un conjunto de números (ADR-017).
   *
   * @param values Lista de valores numéricos.
   * @returns La desviación estándar poblacional o 0 si hay menos de 2 valores.
   */
  calculatePopulationStdDev(values: number[]): number {
    if (!values || values.length < 2) {
      return 0;
    }

    const average = this.calculateAverage(values);
    const squaredDifferencesSum = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0);
    return Math.sqrt(squaredDifferencesSum / values.length);
  }

  /**
   * Calcula la desviación estándar muestral de un conjunto de números.
   *
   * @param values Lista de valores numéricos.
   * @returns La desviación estándar muestral o 0 si hay menos de 2 valores.
   */
  calculateSampleStdDev(values: number[]): number {
    if (!values || values.length < 2) {
      return 0;
    }

    const average = this.calculateAverage(values);
    const squaredDifferencesSum = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0);
    return Math.sqrt(squaredDifferencesSum / (values.length - 1));
  }
}
