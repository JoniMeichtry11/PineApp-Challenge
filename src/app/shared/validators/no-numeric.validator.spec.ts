import { noNumericValidator } from './no-numeric.validator';
import { FormControl } from '@angular/forms';

describe('noNumericValidator', () => {
  const validator = noNumericValidator();

  it('should return null for an empty value (no error)', () => {
    const control = new FormControl('');
    expect(validator(control)).toBeNull();
  });

  it('should return null for null value (no error)', () => {
    const control = new FormControl(null);
    expect(validator(control)).toBeNull();
  });

  it('should return null for a text without numbers', () => {
    const control = new FormControl('García');
    expect(validator(control)).toBeNull();
  });

  it('should return { hasNumeric: true } for text containing numbers', () => {
    const control = new FormControl('Juan1');
    expect(validator(control)).toEqual({ hasNumeric: true });
  });

  it('should detect numbers embedded in text', () => {
    const control = new FormControl('ab3cd');
    expect(validator(control)).toEqual({ hasNumeric: true });
  });
});
