import { describe, it, expect } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PropertyDetailPage } from '@/features/properties/components/PropertyDetailPage';
import { RoomDetailPage } from '@/features/rooms/RoomDetailPage';
import { AppShell } from '@/components/layout/AppShell';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ToastProvider } from '@/components/feedback/ToastSystem';
import { ActionModalProvider } from '@/components/ui/ActionModal';

describe('Test with Landlord user logged in', () => {
  it('navigates from PropertyDetailPage to dedicated RoomDetailPage and switches tabs', async () => {
    localStorage.setItem(
      'rentflow_auth_user',
      JSON.stringify({
        id: 'usr_landlord',
        name: 'Nguyễn An',
        email: 'nguyenan.property@gmail.com',
        phone: '0988 123 456',
        role: 'LANDLORD',
        organizationName: 'Nguyễn An Property',
      })
    );

    const { getByText, getByTitle } = render(
      <AuthProvider>
        <ToastProvider>
          <ActionModalProvider>
            <MemoryRouter initialEntries={['/properties/1']}>
              <Routes>
                <Route
                  path="/properties/:id"
                  element={
                    <AppShell>
                      <PropertyDetailPage />
                    </AppShell>
                  }
                />
                <Route
                  path="/rooms/:id"
                  element={
                    <AppShell>
                      <RoomDetailPage />
                    </AppShell>
                  }
                />
              </Routes>
            </MemoryRouter>
          </ActionModalProvider>
        </ToastProvider>
      </AuthProvider>
    );

    // Verify property name rendered
    expect(getByText('Nhà trọ Hưng Phát')).toBeTruthy();

    // Click on room card P.101 to navigate directly to dedicated room page
    const roomCard = getByTitle('Bấm để mở trang chi tiết phòng P.101');
    fireEvent.click(roomCard);

    // Verify RoomDetailPage is rendered for this room
    await waitFor(() => {
      expect(getByText('Chốt chỉ số điện & nước tháng này')).toBeTruthy();
    });

    // Switch to Hợp đồng tab
    const contractTab = getByText('Hợp đồng & Gia hạn');
    fireEvent.click(contractTab);
    await waitFor(() => {
      expect(getByText(/Hợp đồng thuê hiện hành/)).toBeTruthy();
    });

    // Switch to Nhắn tin tab
    const msgTab = getByText('Nhắn tin người ở');
    fireEvent.click(msgTab);
    await waitFor(() => {
      expect(getByText(/Nội dung gửi khách thuê/)).toBeTruthy();
    });

    // Switch to Hóa đơn tab
    const invTab = getByText('Lập hóa đơn & QR');
    fireEvent.click(invTab);
    await waitFor(() => {
      expect(getByText(/Bảng kê hóa đơn phòng P.101/)).toBeTruthy();
    });

    // Switch to Người ở tab
    const occTab = getByText(/Người ở \(\d+\)/);
    fireEvent.click(occTab);
    await waitFor(() => {
      expect(getByText(/Danh sách người đang ở/)).toBeTruthy();
    });
  });

  it('renders RoomDetailPage directly with room r1', () => {
    localStorage.setItem(
      'rentflow_auth_user',
      JSON.stringify({
        id: 'usr_landlord',
        name: 'Nguyễn An',
        email: 'nguyenan.property@gmail.com',
        phone: '0988 123 456',
        role: 'LANDLORD',
        organizationName: 'Nguyễn An Property',
      })
    );

    // Test RoomDetailPage directly
    const { getByText } = render(
      <AuthProvider>
        <ToastProvider>
          <ActionModalProvider>
            <MemoryRouter initialEntries={['/rooms/r1']}>
              <Routes>
                <Route
                  path="/rooms/:id"
                  element={
                    <AppShell>
                      <RoomDetailPage />
                    </AppShell>
                  }
                />
              </Routes>
            </MemoryRouter>
          </ActionModalProvider>
        </ToastProvider>
      </AuthProvider>
    );

    expect(getByText('Chốt chỉ số điện & nước tháng này')).toBeTruthy();
  });

  it('locks old reading upon save and rejects new reading smaller than old reading', async () => {
    localStorage.setItem(
      'rentflow_auth_user',
      JSON.stringify({
        id: 'usr_landlord',
        name: 'Nguyễn An',
        email: 'nguyenan.property@gmail.com',
        phone: '0988 123 456',
        role: 'LANDLORD',
        organizationName: 'Nguyễn An Property',
      })
    );

    const { getByTitle, getByText, getAllByText, getByRole } = render(
      <AuthProvider>
        <ToastProvider>
          <ActionModalProvider>
            <MemoryRouter initialEntries={['/rooms/r1']}>
              <Routes>
                <Route
                  path="/rooms/:id"
                  element={
                    <AppShell>
                      <RoomDetailPage />
                    </AppShell>
                  }
                />
              </Routes>
            </MemoryRouter>
          </ActionModalProvider>
        </ToastProvider>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByText('Chốt chỉ số điện & nước tháng này')).toBeTruthy();
    });

    // Old readings should initially be editable (before save)
    const prevElecInput = getByTitle('Chỉ số điện kỳ trước') as HTMLInputElement;
    expect(prevElecInput.readOnly).toBe(false);
    const oldElecValue = Number(prevElecInput.value);

    // Enter a new reading smaller than old reading
    const newElecInput = document.getElementById('currElectricInput') as HTMLInputElement;
    fireEvent.change(newElecInput, { target: { value: String(oldElecValue - 50) } });

    // Warning message should be visible
    await waitFor(() => {
      expect(getByText(/Không được nhỏ hơn số cũ/)).toBeTruthy();
    });

    // Clicking save should be rejected (validation error, not locked)
    const saveBtn = getByRole('button', { name: /Lưu chỉ số điện nước/ });
    fireEvent.click(saveBtn);

    // Still not locked because invalid
    expect(prevElecInput.readOnly).toBe(false);

    // Now enter a valid new reading (>= old reading)
    fireEvent.change(newElecInput, { target: { value: String(oldElecValue + 100) } });

    // Warning message should disappear
    await waitFor(() => {
      expect(newElecInput.value).toBe(String(oldElecValue + 100));
    });

    // Save valid reading
    fireEvent.click(saveBtn);

    // Once saved, old reading MUST BE FIXED/LOCKED (readOnly + disabled)
    await waitFor(() => {
      const lockedBadges = getAllByText('Đã khóa chỉ số cũ');
      expect(lockedBadges.length).toBeGreaterThanOrEqual(1);
    });
    expect(prevElecInput.readOnly).toBe(true);

    // Clicking unlock should unlock it
    const unlockBtns = getAllByText('Mở khóa');
    fireEvent.click(unlockBtns[0]!);
    await waitFor(() => {
      expect(prevElecInput.readOnly).toBe(false);
    });
  });
});
