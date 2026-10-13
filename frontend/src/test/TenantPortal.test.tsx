import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '@/components/feedback/ToastSystem';
import { TenantPortalPage } from '@/features/auth/TenantPortalPage';

// Mock AuthContext
vi.mock('@/features/auth/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'tenant-1',
      name: 'Lê Hoàng Nam',
      email: 'nam.le@gmail.com',
      role: 'TENANT',
      phone: '0905123456',
      roomCode: 'P.101',
    },
    isAuthenticated: true,
  }),
}));

describe('TenantPortalPage Flow Validation', () => {
  const renderPortal = () => {
    return render(
      <ToastProvider>
        <BrowserRouter>
          <TenantPortalPage />
        </BrowserRouter>
      </ToastProvider>,
    );
  };

  it('renders tenant active room badge and quick metrics', () => {
    renderPortal();
    expect(screen.getByText(/P\.101/i)).toBeInTheDocument();
    expect(screen.getByText(/Lê Hoàng Nam/i)).toBeInTheDocument();
  });

  it('allows tenant to switch to maintenance tab and fill out a ticket', async () => {
    renderPortal();

    // Click maintenance tab
    const maintTab = screen.getByRole('button', { name: /yêu cầu bảo trì/i });
    await userEvent.click(maintTab);

    // Form inputs should be visible
    expect(screen.getByPlaceholderText(/máy lạnh chảy nước/i)).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/máy lạnh chảy nước/i);
    const submitBtn = screen.getByRole('button', { name: /gửi yêu cầu tới chủ nhà/i });

    await userEvent.type(titleInput, 'Vòi sen bị rò nước');
    await userEvent.click(submitBtn);

    // Confirmation banner appears
    expect(await screen.findByText(/đã gửi báo hỏng/i)).toBeInTheDocument();
  });
});
