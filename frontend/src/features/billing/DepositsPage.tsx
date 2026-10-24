import React from 'react';
import { FinancialLedgerPage } from '@/features/payments/FinancialLedgerPage';

export const DepositsPage: React.FC = () => {
  return <FinancialLedgerPage defaultTab="deposits" />;
};
