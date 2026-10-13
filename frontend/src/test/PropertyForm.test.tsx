import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropertyForm } from '@/features/properties/components/PropertyForm';

// Mock hook
vi.mock('@/features/properties/hooks/useProperties', () => ({
  useCreateProperty: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

describe('PropertyForm Validation', () => {
  const queryClient = new QueryClient();

  it('validates required fields on submission', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PropertyForm />
      </QueryClientProvider>,
    );

    const submitBtn = screen.getByRole('button', { name: /save property/i });
    await userEvent.click(submitBtn);

    expect(
      await screen.findByText(/property name must be at least 2 characters/i),
    ).toBeInTheDocument();
    expect(await screen.findByText(/address must be at least 3 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/city is required/i)).toBeInTheDocument();
  });
});
