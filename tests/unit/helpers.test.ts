import { describe, it, expect } from 'vitest';
import { 
  formatCurrency, 
  formatDate, 
  generateParticipantNumber,
  generateOrderId 
} from '../../src/utils/helpers';

describe('Helpers', () => {
  describe('formatCurrency', () => {
    it('should format number to IDR currency', () => {
      expect(formatCurrency(99000)).toBe('Rp 99.000');
      expect(formatCurrency(149000)).toBe('Rp 149.000');
      expect(formatCurrency(0)).toBe('Rp 0');
    });
  });

  describe('formatDate', () => {
    it('should format date to Indonesian format', () => {
      const date = new Date('2027-02-14');
      expect(formatDate(date)).toBe('14 Februari 2027');
    });
  });

  describe('generateParticipantNumber', () => {
    it('should generate correct participant number for 10K', () => {
      const number = generateParticipantNumber('10K', 0);
      expect(number).toBe('100001');
    });

    it('should generate correct participant number for 5K', () => {
      const number = generateParticipantNumber('5K', 0);
      expect(number).toBe('050001');
    });
  });

  describe('generateOrderId', () => {
    it('should generate unique order ID', () => {
      const id1 = generateOrderId();
      const id2 = generateOrderId();
      expect(id1).not.toBe(id2);
      expect(id1.startsWith('WT')).toBe(true);
    });
  });
});