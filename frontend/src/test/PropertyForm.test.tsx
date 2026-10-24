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

  it('validates required fields on submission in Vietnamese', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PropertyForm />
      </QueryClientProvider>,
    );

    const submitBtn = screen.getByRole('button', { name: /lưu cơ sở/i });
    await userEvent.click(submitBtn);

    expect(
      await screen.findByText(/tên cơ sở phải có ít nhất 2 ký tự/i),
    ).toBeInTheDocument();
    expect(await screen.findByText(/địa chỉ phải có ít nhất 3 ký tự/i)).toBeInTheDocument();
    expect(await screen.findByText(/vui lòng chọn tỉnh \/ thành phố/i)).toBeInTheDocument();
  });

  it('increments and decrements total floors using stepper buttons', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PropertyForm />
      </QueryClientProvider>,
    );

    const floorsInput = screen.getByLabelText(/số tầng/i) as HTMLInputElement;
    expect(floorsInput.value).toBe('1');

    const incBtn = screen.getByTitle('Tăng 1 tầng');
    await userEvent.click(incBtn);
    expect(floorsInput.value).toBe('2');

    await userEvent.click(incBtn);
    expect(floorsInput.value).toBe('3');

    const decBtn = screen.getByTitle('Giảm 1 tầng');
    await userEvent.click(decBtn);
    expect(floorsInput.value).toBe('2');
  });

  it('provides Vietnamese provinces in city dropdown list', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <PropertyForm />
      </QueryClientProvider>,
    );

    const citySelect = screen.getByLabelText(/tỉnh \/ thành phố/i) as HTMLSelectElement;
    expect(citySelect).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /hà nội/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /tp\. hồ chí minh/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /đà nẵng/i })).toBeInTheDocument();

    await userEvent.selectOptions(citySelect, 'Hà Nội');
    expect(citySelect.value).toBe('Hà Nội');
  });

  it('requires confirmation checkbox (ô xác nhận) and confirms submission', async () => {
    const onSuccess = vi.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <PropertyForm onSuccess={onSuccess} />
      </QueryClientProvider>,
    );

    const nameInput = screen.getByLabelText(/tên cơ sở/i);
    const addressInput = screen.getByLabelText(/địa chỉ cơ sở/i);
    const citySelect = screen.getByLabelText(/tỉnh \/ thành phố/i);
    const confirmCheckbox = screen.getByLabelText(/tôi xác nhận các thông tin cơ sở/i);
    const confirmBtn = screen.getByRole('button', { name: /xác nhận lưu cơ sở/i });

    await userEvent.type(nameInput, 'Căn hộ Sunrise');
    await userEvent.type(addressInput, '123 Đường Số 1');
    await userEvent.selectOptions(citySelect, 'TP. Hồ Chí Minh');

    // Click without confirmation checkbox checked
    await userEvent.click(confirmBtn);
    expect(await screen.findByText(/vui lòng đánh dấu vào ô xác nhận/i)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();

    // Check confirmation checkbox and submit
    await userEvent.click(confirmCheckbox);
    expect(confirmCheckbox).toBeChecked();
    await userEvent.click(confirmBtn);

    expect(screen.queryByText(/vui lòng đánh dấu vào ô xác nhận/i)).not.toBeInTheDocument();
  });
});
