import React from 'react';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';
import { Agentation } from 'agentation';

export const App: React.FC = () => {
  return (
    <AppProviders>
      <AppRouter />
      <Agentation />
    </AppProviders>
  );
};
