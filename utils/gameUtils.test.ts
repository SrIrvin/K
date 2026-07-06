import { describe, it, expect } from 'vitest';
import { formatGold } from './gameUtils';

describe('formatGold', () => {
  it('should format values under 1000 without changes', () => {
    expect(formatGold(0)).toBe('0');
    expect(formatGold(50)).toBe('50');
    expect(formatGold(999)).toBe('999');
  });

  it('should format thousands using K', () => {
    expect(formatGold(1000)).toBe('1K');
    expect(formatGold(1500)).toBe('1.5K');
    expect(formatGold(10500)).toBe('10.5K');
    expect(formatGold(999900)).toBe('999.9K');
  });

  it('should format millions using M', () => {
    expect(formatGold(1000000)).toBe('1M');
    expect(formatGold(1200000)).toBe('1.2M');
    expect(formatGold(15000000)).toBe('15M');
  });

  it('should support negative numbers', () => {
    expect(formatGold(-50)).toBe('-50');
    expect(formatGold(-1500)).toBe('-1.5K');
    expect(formatGold(-2500000)).toBe('-2.5M');
  });
});
