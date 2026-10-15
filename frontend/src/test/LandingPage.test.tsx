import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '@/features/landing/LandingPage';

describe('LandingPage Comprehensive Tests', () => {
  const renderLandingPage = () => {
    return render(
      <MemoryRouter initialEntries={['/']}>
        <LandingPage />
      </MemoryRouter>,
    );
  };

  it('renders brand hero section, key metrics, and headlines', () => {
    renderLandingPage();

    // Verify main headline and description
    expect(screen.getByRole('heading', { level: 1, name: /quản lý nhà cho thuê gọn gàng hơn/i })).toBeInTheDocument();
    expect(screen.getByText(/hợp nhất quản lý danh mục phòng/i)).toBeInTheDocument();

    // Verify floating operational badges
    expect(screen.getByText(/79\.2%/i)).toBeInTheDocument();
    expect(screen.getByText(/86\.400\.000 đ/i)).toBeInTheDocument();
  });

  it('provides accessible primary call-to-actions linking to registration and role selection', () => {
    renderLandingPage();

    // Hero CTA button
    const heroCta = screen.getByRole('button', { name: /bắt đầu quản lý/i });
    expect(heroCta).toBeInTheDocument();

    // Header Login button
    const loginBtn = screen.getByRole('button', { name: /^đăng nhập$/i });
    expect(loginBtn).toBeInTheDocument();

    // Footer CTA button
    const footerCta = screen.getByRole('button', { name: /đăng ký dùng thử/i });
    expect(footerCta).toBeInTheDocument();

    // Footer contact info
    expect(screen.getByText(/1900 8866/i)).toBeInTheDocument();
  });

  it('allows switching between interactive product showcase tabs', async () => {
    const user = userEvent.setup();
    renderLandingPage();

    // Initially in overview tab
    expect(screen.getByText('https://app.rentflow.vn/landlord/dashboard')).toBeInTheDocument();

    // Click on 'Chốt số điện nước' tab
    const meterTab = screen.getByRole('button', { name: /chốt số điện nước/i });
    await user.click(meterTab);
    expect(screen.getByText('https://app.rentflow.vn/meter-readings')).toBeInTheDocument();

    // Click on 'Sơ đồ phòng' tab
    const roomGridTab = screen.getByRole('button', { name: /sơ đồ phòng/i });
    await user.click(roomGridTab);
    expect(screen.getByText('https://app.rentflow.vn/rooms')).toBeInTheDocument();

    // Click on 'Cổng cư dân' tab
    const tenantPortalTab = screen.getByRole('button', { name: /^cổng cư dân$/i });
    await user.click(tenantPortalTab);
    expect(screen.getByText('https://app.rentflow.vn/tenant/dashboard')).toBeInTheDocument();
  });

  it('allows toggling between landlord and tenant persona descriptions', async () => {
    const user = userEvent.setup();
    renderLandingPage();

    // Landlord is default active
    expect(screen.getByText(/không gian điều hành tập trung cho chủ sở hữu/i)).toBeInTheDocument();

    // Toggle to Tenant tab
    const tenantTabBtn = screen.getByRole('button', { name: /dành cho người thuê/i });
    await user.click(tenantTabBtn);

    // Tenant persona view should now be active
    expect(screen.getByText(/cổng thông tin cư dân minh bạch và thuận tiện/i)).toBeInTheDocument();

    // Toggle back to Landlord tab
    const landlordTabBtn = screen.getByRole('button', { name: /dành cho chủ nhà & quản lý/i });
    await user.click(landlordTabBtn);
    expect(screen.getByText(/không gian điều hành tập trung cho chủ sở hữu/i)).toBeInTheDocument();
  });

  it('expands and collapses FAQ accordion items on click', async () => {
    const user = userEvent.setup();
    renderLandingPage();

    // The first FAQ question is open by default
    const firstFaqBtn = screen.getByRole('button', { name: /rentflow phù hợp với mô hình nhà trọ hay căn hộ nào/i });
    expect(firstFaqBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/rentflow tối ưu cho mọi quy mô/i)).toBeInTheDocument();

    // Click to collapse
    await user.click(firstFaqBtn);
    expect(firstFaqBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/rentflow tối ưu cho mọi quy mô/i)).not.toBeInTheDocument();

    // Click again to re-expand
    await user.click(firstFaqBtn);
    expect(firstFaqBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/rentflow tối ưu cho mọi quy mô/i)).toBeInTheDocument();
  });

  it('toggles mobile menu drawer when mobile button is clicked', async () => {
    const user = userEvent.setup();
    renderLandingPage();

    const mobileToggleBtn = screen.getByRole('button', { name: /toggle mobile menu/i });
    expect(mobileToggleBtn).toBeInTheDocument();

    // Initially drawer is not visible
    expect(screen.queryByRole('dialog', { name: /menu điều hướng rentflow/i })).not.toBeInTheDocument();

    // Click to open
    await user.click(mobileToggleBtn);
    expect(screen.getByRole('dialog', { name: /menu điều hướng rentflow/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bắt đầu dùng thử miễn phí/i })).toBeInTheDocument();

    // Click to close
    await user.click(mobileToggleBtn);
    expect(screen.queryByRole('dialog', { name: /menu điều hướng rentflow/i })).not.toBeInTheDocument();
  });
});
