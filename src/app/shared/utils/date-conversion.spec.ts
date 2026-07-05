import { convertToDate } from './date-conversion';

describe('convertToDate', () => {

  it('should return current date for null or undefined', () => {
    const before = new Date();
    const result = convertToDate(null);
    const after = new Date();
    expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(result.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should convert an object with toDate() method (Firestore Timestamp simulado)', () => {
    const targetDate = new Date(1990, 4, 15); // 15 de mayo de 1990
    const fakeTimestamp = { toDate: () => targetDate };
    const result = convertToDate(fakeTimestamp);
    expect(result).toEqual(targetDate);
  });

  it('should return the same Date instance when passed a Date object', () => {
    const date = new Date(2000, 0, 1);
    const result = convertToDate(date);
    expect(result).toEqual(date);
  });

  it('should parse a valid ISO date string', () => {
    const result = convertToDate('1990-05-15');
    expect(result.getFullYear()).toBe(1990);
    expect(result.getMonth()).toBe(4); // Mayo = 4 (0-indexed)
  });

  it('should return current date for invalid string input', () => {
    const before = new Date();
    const result = convertToDate('not-a-date');
    const after = new Date();
    expect(result.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(result.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
