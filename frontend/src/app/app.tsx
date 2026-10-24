import React from 'react';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRouter } from '@/app/router/AppRouter';
import { Agentation } from 'agentation';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
        <Agentation />
      </AppProviders>
    </ErrorBoundary>
  );
};

