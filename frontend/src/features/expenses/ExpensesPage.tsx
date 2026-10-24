import React from 'react';
import { FinancialLedgerPage } from '@/features/payments/FinancialLedgerPage';

export const ExpensesPage: React.FC = () => {
  return <FinancialLedgerPage defaultTab="expenses" />;
};
