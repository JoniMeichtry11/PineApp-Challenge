import { TestBed } from '@angular/core/testing';
import { StatisticsService } from './statistics.service';

describe('StatisticsService', () => {
  let service: StatisticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateAverage', () => {
    it('should return 0 for an empty array', () => {
      expect(service.calculateAverage([])).toBe(0);
    });

    it('should calculate the average correctly', () => {
      expect(service.calculateAverage([10, 20, 30, 40])).toBe(25);
    });
  });

  describe('calculatePopulationStdDev', () => {
    it('should return 0 for arrays with less than 2 items', () => {
      expect(service.calculatePopulationStdDev([])).toBe(0);
      expect(service.calculatePopulationStdDev([10])).toBe(0);
    });

    it('should calculate the population standard deviation correctly', () => {
      // Para [10, 20, 30, 40], promedio = 25
      // sqDiff = (10-25)^2 + (20-25)^2 + (30-25)^2 + (40-25)^2 = 225 + 25 + 25 + 225 = 500
      // var = 500 / 4 = 125
      // stdDev = sqrt(125) = 11.18...
      expect(service.calculatePopulationStdDev([10, 20, 30, 40])).toBeCloseTo(11.18, 2);
    });
  });

  describe('calculateSampleStdDev', () => {
    it('should return 0 for arrays with less than 2 items', () => {
      expect(service.calculateSampleStdDev([])).toBe(0);
      expect(service.calculateSampleStdDev([10])).toBe(0);
    });

    it('should calculate the sample standard deviation correctly', () => {
      // Para [10, 20, 30, 40], promedio = 25, sqDiff = 500
      // var = 500 / (4-1) = 500 / 3 = 166.66...
      // stdDev = sqrt(166.66...) = 12.91...
      expect(service.calculateSampleStdDev([10, 20, 30, 40])).toBeCloseTo(12.91, 2);
    });
  });
});
