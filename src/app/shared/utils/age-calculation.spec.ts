import { calculateAge } from './age-calculation';

describe('calculateAge', () => {

  it('should calculate correct age for a person who has already had their birthday this year', () => {
    const today = new Date(2024, 5, 15); // 15 Jun 2024
    const birthDate = new Date(1990, 2, 10); // 10 Mar 1990 — ya cumplió en 2024
    expect(calculateAge(birthDate, today)).toBe(34);
  });

  it('should calculate correct age for a person who has NOT yet had their birthday this year', () => {
    const today = new Date(2024, 1, 1); // 1 Feb 2024
    const birthDate = new Date(1990, 5, 15); // 15 Jun 1990 — todavía no cumplió en 2024
    expect(calculateAge(birthDate, today)).toBe(33);
  });

  it('should calculate correct age for a person whose birthday is TODAY', () => {
    const today = new Date(2024, 5, 15); // 15 Jun 2024
    const birthDate = new Date(1990, 5, 15); // 15 Jun 1990 — cumple hoy
    expect(calculateAge(birthDate, today)).toBe(34);
  });

  it('should not return negative ages', () => {
    const today = new Date(2000, 0, 1);
    const birthDate = new Date(2005, 0, 1); // fecha futura (edge case)
    expect(calculateAge(birthDate, today)).toBe(0);
  });
});
