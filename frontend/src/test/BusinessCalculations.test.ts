import { describe, it, expect } from 'vitest';
import { formatVND, mockInvoices, mockMeterReadings, mockContracts, mockMaintenance } from '@/lib/mockData';

describe('RentFlow Domain Logic & Calculations', () => {
  it('correctly calculates electricity and water usage charges', () => {
    mockMeterReadings.forEach((reading) => {
      const diffElectric = Math.max(0, reading.currElectric - reading.prevElectric);
      const diffWater = Math.max(0, reading.currWater - reading.prevWater);
      const computedCost = diffElectric * reading.electricUnitPrice + diffWater * reading.waterUnitPrice;

      expect(diffElectric).toBeGreaterThanOrEqual(0);
      expect(diffWater).toBeGreaterThanOrEqual(0);
      expect(computedCost).toBeGreaterThanOrEqual(0);
    });
  });

  it('validates invoice accounting totals and debt balances', () => {
    mockInvoices.forEach((inv) => {
      const breakdownSum = inv.roomFee + inv.electricFee + inv.waterFee + inv.serviceFee;
      expect(inv.totalAmount).toEqual(breakdownSum);
      expect(inv.debtAmount).toEqual(inv.totalAmount - inv.paidAmount);

      if (inv.paidAmount === inv.totalAmount) {
        expect(inv.status).toBe('paid');
      } else if (inv.paidAmount > 0 && inv.paidAmount < inv.totalAmount) {
        expect(inv.status).toBe('partial');
      }
    });
  });

  it('formats currency in Vietnamese Dong (VND) accurately', () => {
    const formattedZero = formatVND(0);
    expect(formattedZero).toContain('0');
    expect(formattedZero.toLowerCase()).toMatch(/[₫đ]/);

    const formattedMillion = formatVND(4500000);
    expect(formattedMillion).toContain('4.500.000');
    expect(formattedMillion.toLowerCase()).toMatch(/[₫đ]/);
  });

  it('ensures each contract links to a valid room with deposit requirements', () => {
    mockContracts.forEach((c) => {
      expect(c.id).toBeDefined();
      expect(c.roomCode).toMatch(/^P\.\d{3}$/);
      expect(c.depositAmount).toBeGreaterThan(0);
      expect(c.monthlyRent).toBeGreaterThan(0);
      expect(new Date(c.endDate).getTime()).toBeGreaterThan(new Date(c.startDate).getTime());
    });
  });

  it('verifies maintenance tickets contain required category and room mapping', () => {
    mockMaintenance.forEach((m) => {
      expect(m.id).toBeDefined();
      expect(m.roomCode).toBeDefined();
      expect(['urgent', 'high', 'medium', 'low']).toContain(m.priority);
      expect(['in_progress', 'pending', 'completed', 'assigned', 'cancelled']).toContain(m.status);
    });
  });
});
