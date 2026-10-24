import React from 'react';
import { FinancialLedgerPage } from './FinancialLedgerPage';

export const PaymentsPage: React.FC = () => {
  return <FinancialLedgerPage defaultTab="payments" />;
};

export { FinancialLedgerPage };
