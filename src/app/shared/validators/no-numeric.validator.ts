import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador personalizado que rechaza textos que contengan caracteres numéricos (ADR-003).
 * Útil para campos como nombre y apellido.
 */
export function noNumericValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const hasNumbers = /\d/.test(control.value);
    return hasNumbers ? { hasNumeric: true } : null;
  };
}
