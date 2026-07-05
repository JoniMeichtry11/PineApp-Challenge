import { FechaPersonalizadaPipe } from './fecha-personalizada.pipe';

describe('FechaPersonalizadaPipe', () => {
  let pipe: FechaPersonalizadaPipe;

  beforeEach(() => {
    pipe = new FechaPersonalizadaPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('should return "Fecha Inválida" for an invalid date string', () => {
    expect(pipe.transform('not-a-real-date')).toBe('Fecha Inválida');
  });

  it('should format a JS Date correctly to dd/MM/yyyy', () => {
    const date = new Date(1990, 4, 15); // 15 de Mayo de 1990
    const result = pipe.transform(date);
    expect(result).toBe('15/05/1990');
  });

  it('should format an object with .toDate() method (Timestamp simulado)', () => {
    const fakeTimestamp = { toDate: () => new Date(1990, 4, 15) };
    const result = pipe.transform(fakeTimestamp);
    expect(result).toBe('15/05/1990');
  });

  it('should use a custom format when provided', () => {
    const date = new Date(2000, 0, 1);
    const result = pipe.transform(date, 'yyyy/MM/dd');
    expect(result).toBe('2000/01/01');
  });
});
