import React, { useState, useEffect } from 'react';
import {
  Zap,
  FileText,
  MessageSquare,
  Receipt,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Phone,
  QrCode,
  Check,
  Plus,
  Trash2,
  Lock,
  Unlock,
  AlertCircle,
} from 'lucide-react';
import {
  RoomItem,
  PropertyItem,
  RoomOccupant,
  mockContracts,
  mockMeterReadings,
  formatVND,
  ContractItem,
  MeterReadingItem,
} from '@/lib/mockData';
import { useToast } from '@/components/feedback/ToastSystem';

export interface RoomOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomItem | null;
  property?: PropertyItem | null;
  initialTab?: 'meter' | 'contract' | 'message' | 'invoice' | 'occupants';
  allRooms?: RoomItem[];
  onSelectRoom?: (room: RoomItem) => void;
  onRoomUpdated?: (updatedRoom: RoomItem) => void;
}

const RoomOperationsModalDialog: React.FC<RoomOperationsModalProps & { room: RoomItem }> = ({
  isOpen: _isOpen,
  onClose,
  room,
  property,
  initialTab = 'meter',
  allRooms = [],
  onSelectRoom,
  onRoomUpdated,
}) => {
  const { success, error, info } = useToast();
  const [activeTab, setActiveTab] = useState<'meter' | 'contract' | 'message' | 'invoice' | 'occupants'>(initialTab);

  // Sync initial tab when opening
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Local state for current room data
  const currentOccupants = room.occupants || (room.tenantName ? [{
    id: 'occ-primary',
    name: room.tenantName,
    phone: room.tenantPhone || '0901 234 567',
    idCard: '079201004567',
    isPrimary: true,
    joinedAt: '01/01/2026',
  }] : []);

  const primaryTenant = currentOccupants.find((o) => o.isPrimary) || currentOccupants[0];
  const tenantPhone = primaryTenant?.phone || room.tenantPhone || '0901 234 567';
  const tenantName = primaryTenant?.name || room.tenantName || 'Khách thuê';

  // Find contract or default
  const existingContract: ContractItem = mockContracts.find((c) => c.roomCode === room.code) || {
    id: `CT-2026-${room.code.replace(/\D/g, '') || '101'}`,
    roomCode: room.code,
    tenantName,
    tenantPhone,
    startDate: '01/05/2026',
    endDate: room.leaseEnd || '31/10/2026',
    depositAmount: room.price,
    monthlyRent: room.price,
    paymentCycle: 'Hàng tháng (mùng 1 - mùng 5)',
    status: 'active',
  };

  // Find recent meter readings or default
  const recentReadings: MeterReadingItem[] = mockMeterReadings.filter((m) => m.roomCode === room.code);
  const lastReading = recentReadings[0] || {
    id: 'mr-default',
    roomCode: room.code,
    tenantName,
    prevElectric: 1420,
    currElectric: 1530,
    prevWater: 85,
    currWater: 92,
    electricUnitPrice: room.electricUnitPrice || 3800,
    waterUnitPrice: room.waterUnitPrice || 20000,
    updatedAt: '01/10/2026',
  };

  // ================= 1. GHI ĐIỆN NƯỚC STATE =================
  const [currElectric, setCurrElectric] = useState<number>(lastReading.currElectric + 110);
  const [prevElectric, setPrevElectric] = useState<number>(lastReading.currElectric);
  const [currWater, setCurrWater] = useState<number>(lastReading.currWater + 7);
  const [prevWater, setPrevWater] = useState<number>(lastReading.currWater);
  const [isPrevLocked, setIsPrevLocked] = useState<boolean>(false);
  const electricPrice = room.electricUnitPrice || 3800;
  const waterPrice = room.waterUnitPrice || 20000;

  const isElectricInvalid = currElectric < prevElectric;
  const isWaterInvalid = currWater < prevWater;

  const electricUsage = Math.max(0, currElectric - prevElectric);
  const waterUsage = Math.max(0, currWater - prevWater);
  const electricCost = electricUsage * electricPrice;
  const waterCost = waterUsage * waterPrice;
  const totalUtilityCost = electricCost + waterCost;

  const handleSaveMeterReading = (e: React.FormEvent) => {
    e.preventDefault();

    if (currElectric < prevElectric) {
      error(
        'Chỉ số điện không hợp lệ',
        `Chỉ số điện mới (${currElectric.toLocaleString('vi-VN')} kWh) không được nhỏ hơn chỉ số cũ (${prevElectric.toLocaleString('vi-VN')} kWh).`
      );
      return;
    }

    if (currWater < prevWater) {
      error(
        'Chỉ số nước không hợp lệ',
        `Chỉ số nước mới (${currWater.toLocaleString('vi-VN')} m³) không được nhỏ hơn chỉ số cũ (${prevWater.toLocaleString('vi-VN')} m³).`
      );
      return;
    }

    // Fix cứng chỉ số cũ sau khi bấm Lưu
    setIsPrevLocked(true);

    success(
      `Đã ghi điện nước phòng ${room.code} thành công!`,
      `Chỉ số cũ (${prevElectric} kWh / ${prevWater} m³) đã được cố định. Điện tiêu thụ: ${electricUsage} kWh (${formatVND(electricCost)}) • Nước tiêu thụ: ${waterUsage} m³ (${formatVND(waterCost)})`
    );
  };

  // ================= 2. GIA HẠN HỢP ĐỒNG STATE =================
  const [extendMonths, setExtendMonths] = useState<number>(6);
  const [newRentPrice, setNewRentPrice] = useState<number>(room.price);
  const [contractNote, setContractNote] = useState<string>('Gia hạn kỳ thuê tiếp theo, giữ nguyên điều khoản cọc ban đầu.');

  const calculateNewEndDate = (months: number) => {
    const endDateStr = existingContract.endDate || '31/10/2026';
    const parts = endDateStr.split('/');
    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      const targetDate = new Date(y, m + months, d);
      return `${String(targetDate.getDate()).padStart(2, '0')}/${String(targetDate.getMonth() + 1).padStart(2, '0')}/${targetDate.getFullYear()}`;
    }
    return '30/04/2027';
  };

  const handleExtendContract = (e: React.FormEvent) => {
    e.preventDefault();
    const newEnd = calculateNewEndDate(extendMonths);
    if (onRoomUpdated) {
      onRoomUpdated({
        ...room,
        leaseEnd: newEnd,
        price: newRentPrice,
      });
    }
    success(
      `Gia hạn hợp đồng ${existingContract.id} thành công!`,
      `Thời hạn mới đến ngày ${newEnd} (+${extendMonths} tháng). Giá thuê: ${formatVND(newRentPrice)}/tháng.`
    );
  };

  // ================= 3. NHẮN TIN NGƯỜI Ở STATE =================
  const [messageTemplate, setMessageTemplate] = useState<'debt' | 'utility' | 'contract' | 'maintenance'>('debt');
  const [customMessage, setCustomMessage] = useState<string>(
    `Chào ${tenantName}, BQL ${property?.name || room.propertyName} xin gửi thông báo tiền phòng & điện nước kỳ này cho ${room.code}. Tổng số tiền cần thanh toán là ${formatVND(room.price + totalUtilityCost)}. Vui lòng thanh toán trước ngày 05 hàng tháng. Xin cảm ơn!`
  );

  const applyTemplate = (type: 'debt' | 'utility' | 'contract' | 'maintenance') => {
    setMessageTemplate(type);
    switch (type) {
      case 'debt':
        setCustomMessage(
          `Chào ${tenantName}, BQL ${property?.name || room.propertyName} gửi thông báo thu tiền phòng kỳ này cho phòng ${room.code}. Tổng tiền: ${formatVND(room.price + totalUtilityCost)} (bao gồm tiền phòng + điện nước). Bạn thanh toán qua STK Techcombank 190345678901 - NGUYEN AN nhé!`
        );
        break;
      case 'utility':
        setCustomMessage(
          `Chào ${tenantName}, chỉ số điện nước tháng này của phòng ${room.code} đã được chốt: Điện tiêu thụ ${electricUsage} kWh (${formatVND(electricCost)}), Nước tiêu thụ ${waterUsage} m³ (${formatVND(waterCost)}). Tổng tiền dịch vụ: ${formatVND(totalUtilityCost)}.`
        );
        break;
      case 'contract':
        setCustomMessage(
          `Chào ${tenantName}, hợp đồng thuê phòng ${room.code} tại ${property?.name || room.propertyName} sẽ hết hạn vào ngày ${existingContract.endDate}. Bạn có dự định tiếp tục gia hạn hợp đồng không? Vui lòng phản hồi sớm để BQL chuẩn bị thủ tục nhé!`
        );
        break;
      case 'maintenance':
        setCustomMessage(
          `Chào ${tenantName}, BQL ${property?.name || room.propertyName} thông báo kiểm tra định kỳ an toàn PCCC và hệ thống điện nước phòng ${room.code} vào sáng thứ Bảy tuần này. Vui lòng hỗ trợ mở cửa. Xin cảm ơn!`
        );
        break;
    }
  };

  const handleSendZalo = () => {
    const cleanPhone = tenantPhone.replace(/\D/g, '');
    window.open(`https://zalo.me/${cleanPhone}`, '_blank');
    info('Đang mở Zalo', `Đang kết nối đến người thuê ${tenantName} (${tenantPhone}).`);
  };

  const handleSendSMS = () => {
    const cleanPhone = tenantPhone.replace(/\D/g, '');
    window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(customMessage)}`;
  };

  const handleSendInApp = () => {
    success('Đã gửi thông báo ứng dụng', `Thông báo đã được chuyển thẳng tới tài khoản Cổng cư dân của ${tenantName}.`);
  };

  // ================= 4. LẬP HÓA ĐƠN & QR STATE =================
  const serviceFee = 150000;
  const invoiceTotal = room.price + totalUtilityCost + serviceFee;

  // ================= 5. QUẢN LÝ NGƯỜI Ở STATE =================
  const [occupantsList, setOccupantsList] = useState<RoomOccupant[]>(currentOccupants);
  const [newOccName, setNewOccName] = useState('');
  const [newOccPhone, setNewOccPhone] = useState('');
  const [newOccIdCard, setNewOccIdCard] = useState('');

  const handleAddOccupant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOccName.trim() || !newOccPhone.trim()) return;
    const newOcc: RoomOccupant = {
      id: `occ-${Date.now()}`,
      name: newOccName.trim(),
      phone: newOccPhone.trim(),
      idCard: newOccIdCard.trim() || 'Chưa cập nhật',
      isPrimary: occupantsList.length === 0,
      joinedAt: new Date().toLocaleDateString('vi-VN'),
    };
    const updated = [...occupantsList, newOcc];
    setOccupantsList(updated);
    if (onRoomUpdated) {
      onRoomUpdated({
        ...room,
        occupants: updated,
        tenantName: room.tenantName || newOcc.name,
        tenantPhone: room.tenantPhone || newOcc.phone,
        status: 'occupied',
      });
    }
    setNewOccName('');
    setNewOccPhone('');
    setNewOccIdCard('');
    success('Đã thêm người ở mới', `Đã ghi nhận ${newOcc.name} vào phòng ${room.code}.`);
  };

  const handleRemoveOccupant = (occId: string, name: string) => {
    const updated = occupantsList.filter((o) => o.id !== occId);
    setOccupantsList(updated);
    if (onRoomUpdated) {
      onRoomUpdated({
        ...room,
        occupants: updated,
        tenantName: updated[0]?.name,
        tenantPhone: updated[0]?.phone,
        status: updated.length > 0 ? 'occupied' : 'vacant',
      });
    }
    info('Đã xóa thành viên', `Đã xóa ${name} khỏi phòng ${room.code}.`);
  };

  // Navigation between rooms in the same property
  const currentRoomIndex = allRooms.findIndex((r) => r.id === room.id);
  const prevRoom = currentRoomIndex > 0 ? allRooms[currentRoomIndex - 1] : null;
  const nextRoom = currentRoomIndex >= 0 && currentRoomIndex < allRooms.length - 1 ? allRooms[currentRoomIndex + 1] : null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#00594C',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.3px', color: '#FFFFFF' }}>
                  {room.code}
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: room.status === 'occupied' ? '#0A362C' : '#1F2937',
                    border: '1px solid #34D399',
                    color: '#A7F3D0',
                  }}
                >
                  {room.status === 'occupied' ? 'ĐANG THUÊ' : room.status === 'vacant' ? 'CÒN TRỐNG' : 'BẢO TRÌ'}
                </span>
                <span style={{ fontSize: '13px', color: '#D1FAE5' }}>
                  • {property?.name || room.propertyName} (Tầng {room.floor})
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#A7F3D0' }}>
                Khách thuê: <strong>{tenantName}</strong> ({tenantPhone}) • Giá phòng: <strong>{formatVND(room.price)}/tháng</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Quick Room Switcher */}
            {allRooms.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '10px' }}>
                <button
                  type="button"
                  disabled={!prevRoom}
                  onClick={() => prevRoom && onSelectRoom && onSelectRoom(prevRoom)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    color: '#FFFFFF',
                    width: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: prevRoom ? 'pointer' : 'not-allowed',
                    opacity: prevRoom ? 1 : 0.4,
                  }}
                  title={prevRoom ? `Chuyển sang ${prevRoom.code}` : 'Đầu danh sách'}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: '12px', color: '#D1FAE5', padding: '0 4px', fontWeight: 600 }}>
                  {currentRoomIndex + 1}/{allRooms.length}
                </span>
                <button
                  type="button"
                  disabled={!nextRoom}
                  onClick={() => nextRoom && onSelectRoom && onSelectRoom(nextRoom)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    color: '#FFFFFF',
                    width: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: nextRoom ? 'pointer' : 'not-allowed',
                    opacity: nextRoom ? 1 : 0.4,
                  }}
                  title={nextRoom ? `Chuyển sang ${nextRoom.code}` : 'Cuối danh sách'}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#FFFFFF',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Đóng thao tác"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Action Tabs Bar */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#F9FAFB',
            borderBottom: '1px solid #E5E7EB',
            padding: '0 16px',
            gap: '6px',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('meter')}
            style={{
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '13px',
              fontWeight: activeTab === 'meter' ? 700 : 500,
              color: activeTab === 'meter' ? '#00594C' : '#4B5563',
              borderBottom: activeTab === 'meter' ? '3px solid #00594C' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Zap size={16} color={activeTab === 'meter' ? '#00594C' : '#6B7280'} />
            <span>Ghi điện nước</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contract')}
            style={{
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '13px',
              fontWeight: activeTab === 'contract' ? 700 : 500,
              color: activeTab === 'contract' ? '#00594C' : '#4B5563',
              borderBottom: activeTab === 'contract' ? '3px solid #00594C' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FileText size={16} color={activeTab === 'contract' ? '#00594C' : '#6B7280'} />
            <span>Hợp đồng & Gia hạn</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('message')}
            style={{
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '13px',
              fontWeight: activeTab === 'message' ? 700 : 500,
              color: activeTab === 'message' ? '#00594C' : '#4B5563',
              borderBottom: activeTab === 'message' ? '3px solid #00594C' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <MessageSquare size={16} color={activeTab === 'message' ? '#00594C' : '#6B7280'} />
            <span>Nhắn tin người ở</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invoice')}
            style={{
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '13px',
              fontWeight: activeTab === 'invoice' ? 700 : 500,
              color: activeTab === 'invoice' ? '#00594C' : '#4B5563',
              borderBottom: activeTab === 'invoice' ? '3px solid #00594C' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Receipt size={16} color={activeTab === 'invoice' ? '#00594C' : '#6B7280'} />
            <span>Lập hóa đơn & QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('occupants')}
            style={{
              padding: '12px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              fontSize: '13px',
              fontWeight: activeTab === 'occupants' ? 700 : 500,
              color: activeTab === 'occupants' ? '#00594C' : '#4B5563',
              borderBottom: activeTab === 'occupants' ? '3px solid #00594C' : '3px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Users size={16} color={activeTab === 'occupants' ? '#00594C' : '#6B7280'} />
            <span>Người ở ({occupantsList.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#FFFFFF' }}>
          {/* ================= TAB 1: GHI ĐIỆN NƯỚC ================= */}
          {activeTab === 'meter' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                    Chốt chỉ số điện & nước tháng này
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
                    Ghi trực tiếp chỉ số công tơ cho phòng {room.code}. Hệ thống tự động tính thành tiền.
                  </p>
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', backgroundColor: '#F3F4F6', padding: '4px 10px', borderRadius: '4px' }}>
                  Kỳ chốt: <strong>Tháng 10/2026</strong>
                </div>
              </div>

              <form onSubmit={handleSaveMeterReading} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Điện */}
                  <div style={{ border: '1px solid #FED7AA', borderRadius: '8px', padding: '16px', backgroundColor: '#FFFBEB' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#B45309' }}>
                        <Zap size={16} /> Chỉ số Điện (kWh)
                      </div>
                      {isPrevLocked ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: '#065F46',
                              backgroundColor: '#D1FAE5',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 700,
                            }}
                            title="Chỉ số cũ đã chốt cố định"
                          >
                            <Lock size={11} /> Đã khóa chỉ số cũ
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsPrevLocked(false)}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: '#B45309',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              textDecoration: 'underline',
                            }}
                            title="Bấm để mở khóa chỉ số cũ nếu cần sửa"
                          >
                            <Unlock size={11} /> Mở khóa
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Sẽ fix cứng sau khi bấm Lưu</span>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label htmlFor="prevElectricInput" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#6B7280', marginBottom: '4px', fontWeight: 600 }}>
                          <span>Chỉ số cũ (kWh)</span>
                          {isPrevLocked && <Lock size={10} color="#059669" />}
                        </label>
                        <input
                          id="prevElectricInput"
                          type="number"
                          value={prevElectric}
                          readOnly={isPrevLocked}
                          disabled={isPrevLocked}
                          onChange={(e) => setPrevElectric(Number(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: '1px solid #D1D5DB',
                            fontSize: '14px',
                            fontWeight: 600,
                            backgroundColor: isPrevLocked ? '#F3F4F6' : '#FFFFFF',
                            color: isPrevLocked ? '#4B5563' : '#111827',
                            cursor: isPrevLocked ? 'not-allowed' : 'text',
                          }}
                          title={isPrevLocked ? 'Chỉ số cũ đã được cố định' : 'Chỉ số điện kỳ trước'}
                        />
                      </div>
                      <div>
                        <label htmlFor="currElectricInput" style={{ display: 'block', fontSize: '11px', color: '#111827', marginBottom: '4px', fontWeight: 700 }}>
                          Chỉ số mới (kWh) *
                        </label>
                        <input
                          id="currElectricInput"
                          type="number"
                          value={currElectric}
                          min={prevElectric}
                          onChange={(e) => setCurrElectric(Number(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: isElectricInvalid ? '2px solid #DC2626' : '2px solid #F59E0B',
                            fontSize: '14px',
                            fontWeight: 700,
                            backgroundColor: isElectricInvalid ? '#FEF2F2' : '#FFFFFF',
                          }}
                          required
                        />
                        {isElectricInvalid && (
                          <div style={{ color: '#DC2626', fontSize: '11px', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <AlertCircle size={12} />
                            Không được nhỏ hơn số cũ ({prevElectric.toLocaleString('vi-VN')})
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #FDE68A', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#6B7280' }}>Tiêu thụ: <strong>{electricUsage} kWh</strong> × {electricPrice.toLocaleString('vi-VN')} đ</span>
                      <strong style={{ color: '#B45309', fontSize: '13px' }}>{formatVND(electricCost)}</strong>
                    </div>
                  </div>

                  {/* Nước */}
                  <div style={{ border: '1px solid #BAE6FD', borderRadius: '8px', padding: '16px', backgroundColor: '#F0F9FF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0369A1' }}>
                        💧 Chỉ số Nước (m³)
                      </div>
                      {isPrevLocked ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: '#0369A1',
                              backgroundColor: '#E0F2FE',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 700,
                            }}
                            title="Chỉ số cũ đã chốt cố định"
                          >
                            <Lock size={11} /> Đã khóa chỉ số cũ
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsPrevLocked(false)}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: '#0369A1',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              textDecoration: 'underline',
                            }}
                            title="Bấm để mở khóa chỉ số cũ nếu cần sửa"
                          >
                            <Unlock size={11} /> Mở khóa
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Sẽ fix cứng sau khi bấm Lưu</span>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label htmlFor="prevWaterInput" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#6B7280', marginBottom: '4px', fontWeight: 600 }}>
                          <span>Chỉ số cũ (m³)</span>
                          {isPrevLocked && <Lock size={10} color="#0284C7" />}
                        </label>
                        <input
                          id="prevWaterInput"
                          type="number"
                          value={prevWater}
                          readOnly={isPrevLocked}
                          disabled={isPrevLocked}
                          onChange={(e) => setPrevWater(Number(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: '1px solid #D1D5DB',
                            fontSize: '14px',
                            fontWeight: 600,
                            backgroundColor: isPrevLocked ? '#F3F4F6' : '#FFFFFF',
                            color: isPrevLocked ? '#4B5563' : '#111827',
                            cursor: isPrevLocked ? 'not-allowed' : 'text',
                          }}
                          title={isPrevLocked ? 'Chỉ số cũ đã được cố định' : 'Chỉ số nước kỳ trước'}
                        />
                      </div>
                      <div>
                        <label htmlFor="currWaterInput" style={{ display: 'block', fontSize: '11px', color: '#111827', marginBottom: '4px', fontWeight: 700 }}>
                          Chỉ số mới (m³) *
                        </label>
                        <input
                          id="currWaterInput"
                          type="number"
                          value={currWater}
                          min={prevWater}
                          onChange={(e) => setCurrWater(Number(e.target.value))}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: isWaterInvalid ? '2px solid #DC2626' : '2px solid #0284C7',
                            fontSize: '14px',
                            fontWeight: 700,
                            backgroundColor: isWaterInvalid ? '#FEF2F2' : '#FFFFFF',
                          }}
                          required
                        />
                        {isWaterInvalid && (
                          <div style={{ color: '#DC2626', fontSize: '11px', marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <AlertCircle size={12} />
                            Không được nhỏ hơn số cũ ({prevWater.toLocaleString('vi-VN')})
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #BAE6FD', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#6B7280' }}>Tiêu thụ: <strong>{waterUsage} m³</strong> × {waterPrice.toLocaleString('vi-VN')} đ</span>
                      <strong style={{ color: '#0369A1', fontSize: '13px' }}>{formatVND(waterCost)}</strong>
                    </div>
                  </div>
                </div>

                {/* Total utility highlight */}
                <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>
                    Tổng tiền điện & nước kỳ này ({room.code}):
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#15803D' }}>
                    {formatVND(totalUtilityCost)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="submit" className="rf-btn rf-btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
                    <Check size={15} /> Lưu chỉ số điện nước
                  </button>
                </div>
              </form>

              {/* Recent History Table */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#374151', margin: '0 0 8px 0' }}>
                  Lịch sử chỉ số các tháng trước
                </h4>
                <div style={{ overflowX: 'auto', border: '1px solid #E5E7EB', borderRadius: '6px' }}>
                  <table className="rf-table" style={{ fontSize: '12px', width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Kỳ</th>
                        <th>Điện (Cũ → Mới)</th>
                        <th>Tiêu thụ</th>
                        <th>Nước (Cũ → Mới)</th>
                        <th>Tiêu thụ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Tháng 09/2026</td>
                        <td>1,310 → 1,420 kWh</td>
                        <td style={{ fontWeight: 600, color: '#B45309' }}>110 kWh ({formatVND(110 * electricPrice)})</td>
                        <td>78 → 85 m³</td>
                        <td style={{ fontWeight: 600, color: '#0369A1' }}>7 m³ ({formatVND(7 * waterPrice)})</td>
                      </tr>
                      <tr>
                        <td>Tháng 08/2026</td>
                        <td>1,190 → 1,310 kWh</td>
                        <td style={{ fontWeight: 600, color: '#B45309' }}>120 kWh ({formatVND(120 * electricPrice)})</td>
                        <td>71 → 78 m³</td>
                        <td style={{ fontWeight: 600, color: '#0369A1' }}>7 m³ ({formatVND(7 * waterPrice)})</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: HỢP ĐỒNG & GIA HẠN ================= */}
          {activeTab === 'contract' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                  Hợp đồng thuê & Gia hạn phòng {room.code}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
                  Gia hạn kỳ thuê tiếp theo, cập nhật giá thuê hoặc ghi nhận phụ lục hợp đồng.
                </p>
              </div>

              {/* Current Contract Card */}
              <div style={{ padding: '16px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#F9FAFB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 700, color: '#00594C', fontSize: '14px' }}>
                    {existingContract.id} (Đang hiệu lực)
                  </span>
                  <span className="rf-badge rf-badge-active">HỢP ĐỒNG HIỆN HÀNH</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#6B7280', fontSize: '11px', display: 'block' }}>Khách thuê đại diện:</span>
                    <strong>{tenantName}</strong> ({tenantPhone})
                  </div>
                  <div>
                    <span style={{ color: '#6B7280', fontSize: '11px', display: 'block' }}>Thời hạn hiện tại:</span>
                    <span>{existingContract.startDate} → <strong style={{ color: '#C5221F' }}>{existingContract.endDate}</strong></span>
                  </div>
                  <div>
                    <span style={{ color: '#6B7280', fontSize: '11px', display: 'block' }}>Tiền cọc đang giữ:</span>
                    <strong style={{ color: '#15803D' }}>{formatVND(existingContract.depositAmount)}</strong>
                  </div>
                </div>
              </div>

              {/* Extend Contract Form */}
              <form onSubmit={handleExtendContract} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                    1. Chọn thời gian muốn gia hạn thêm:
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {[3, 6, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setExtendMonths(m)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '8px',
                          border: extendMonths === m ? '2px solid #00594C' : '1px solid #D1D5DB',
                          backgroundColor: extendMonths === m ? '#E6F4F1' : '#FFFFFF',
                          color: extendMonths === m ? '#00594C' : '#374151',
                          fontWeight: extendMonths === m ? 700 : 500,
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        +{m} Tháng
                        <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                          Đến {calculateNewEndDate(m)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      2. Giá thuê mỗi tháng cho kỳ mới (VNĐ):
                    </label>
                    <input
                      type="number"
                      value={newRentPrice}
                      onChange={(e) => setNewRentPrice(Number(e.target.value))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px', fontWeight: 700 }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      Ngày hết hạn mới sau gia hạn:
                    </label>
                    <div style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', fontSize: '14px', fontWeight: 700, color: '#00594C' }}>
                      {calculateNewEndDate(extendMonths)}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                    Ghi chú phụ lục gia hạn:
                  </label>
                  <input
                    type="text"
                    value={contractNote}
                    onChange={(e) => setContractNote(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="submit" className="rf-btn rf-btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
                    <Check size={15} /> Xác nhận gia hạn hợp đồng
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 3: NHẮN TIN NGƯỜI Ở ================= */}
          {activeTab === 'message' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                  Gửi thông báo & Nhắn tin người ở phòng {room.code}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
                  Gửi tin nhắn Zalo, SMS hoặc thông báo đẩy đến khách thuê: <strong>{tenantName}</strong> ({tenantPhone}).
                </p>
              </div>

              {/* Template Buttons */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Chọn mẫu tin nhắn nhanh:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => applyTemplate('debt')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: messageTemplate === 'debt' ? '1px solid #C5221F' : '1px solid #E5E7EB',
                      backgroundColor: messageTemplate === 'debt' ? '#FCE8E6' : '#FFFFFF',
                      color: messageTemplate === 'debt' ? '#C5221F' : '#374151',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    💰 Nhắc đóng tiền phòng
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('utility')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: messageTemplate === 'utility' ? '1px solid #0284C7' : '1px solid #E5E7EB',
                      backgroundColor: messageTemplate === 'utility' ? '#E0F2FE' : '#FFFFFF',
                      color: messageTemplate === 'utility' ? '#0369A1' : '#374151',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ⚡ Báo số điện nước
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('contract')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: messageTemplate === 'contract' ? '1px solid #D97706' : '1px solid #E5E7EB',
                      backgroundColor: messageTemplate === 'contract' ? '#FEF3C7' : '#FFFFFF',
                      color: messageTemplate === 'contract' ? '#B45309' : '#374151',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    📄 Nhắc gia hạn hợp đồng
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('maintenance')}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: messageTemplate === 'maintenance' ? '1px solid #4B5563' : '1px solid #E5E7EB',
                      backgroundColor: messageTemplate === 'maintenance' ? '#F3F4F6' : '#FFFFFF',
                      color: messageTemplate === 'maintenance' ? '#1F2937' : '#374151',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    🔧 Lịch bảo trì / PCCC
                  </button>
                </div>
              </div>

              {/* Message Content Box */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Nội dung tin nhắn:
                </label>
                <textarea
                  rows={5}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Send Channels */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleSendZalo}
                  className="rf-btn"
                  style={{
                    backgroundColor: '#0068FF',
                    color: '#FFFFFF',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    padding: '8px 16px',
                  }}
                >
                  <Send size={15} /> Nhắn tin qua Zalo
                </button>

                <button
                  type="button"
                  onClick={handleSendSMS}
                  className="rf-btn rf-btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}
                >
                  <Phone size={15} /> Gửi SMS
                </button>

                <button
                  type="button"
                  onClick={handleSendInApp}
                  className="rf-btn rf-btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}
                >
                  <MessageSquare size={15} /> Gửi thông báo Cổng cư dân
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 4: LẬP HÓA ĐƠN & QR ================= */}
          {activeTab === 'invoice' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                  Bảng kê hóa đơn & Mã thanh toán QR phòng {room.code}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
                  Tổng hợp tiền phòng, tiền điện, tiền nước và phí dịch vụ tháng 10/2026.
                </p>
              </div>

              <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#111827' }}>Hóa đơn kỳ Tháng 10/2026</strong>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Hạn thanh toán: 05/10/2026</div>
                  </div>
                  <span className="rf-badge rf-badge-warning">CHỜ THANH TOÁN</span>
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px dashed #E5E7EB' }}>
                    <span>1. Tiền phòng ({room.code})</span>
                    <strong>{formatVND(room.price)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px dashed #E5E7EB' }}>
                    <span>2. Tiền điện ({electricUsage} kWh × {electricPrice.toLocaleString('vi-VN')} đ)</span>
                    <strong style={{ color: '#B45309' }}>{formatVND(electricCost)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px dashed #E5E7EB' }}>
                    <span>3. Tiền nước ({waterUsage} m³ × {waterPrice.toLocaleString('vi-VN')} đ)</span>
                    <strong style={{ color: '#0369A1' }}>{formatVND(waterCost)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px dashed #E5E7EB' }}>
                    <span>4. Phí dịch vụ (Rác, wifi, vệ sinh)</span>
                    <strong>{formatVND(serviceFee)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', fontSize: '16px', fontWeight: 800 }}>
                    <span style={{ color: '#00594C' }}>Tổng cộng kỳ này:</span>
                    <span style={{ color: '#00594C' }}>{formatVND(invoiceTotal)}</span>
                  </div>
                </div>
              </div>

              {/* VietQR Section */}
              <div style={{ padding: '18px', border: '1px solid #BBF7D0', borderRadius: '8px', backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '64px', height: '64px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <QrCode size={44} color="#00594C" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#166534' }}>
                      Mã thanh toán VietQR chuyển khoản nhanh
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#15803D' }}>
                      Techcombank • 190345678901 • NGUYEN AN • Nội dung: <strong>{room.code.replace(/\D/g, '')} TIEN PHONG T10</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendZalo}
                  className="rf-btn"
                  style={{
                    backgroundColor: '#0068FF',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12px',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Send size={13} /> Gửi QR qua Zalo cho khách
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 5: QUẢN LÝ NGƯỜI Ở ================= */}
          {activeTab === 'occupants' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                    Hồ sơ cư dân sinh sống phòng {room.code}
                  </h3>
                  <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
                    Quản lý các thành viên, người đại diện hợp đồng và thông tin tạm trú.
                  </p>
                </div>
              </div>

              {/* Occupants List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {occupantsList.map((occ, idx) => (
                  <div
                    key={occ.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: occ.isPrimary ? '#F0FDF4' : '#F9FAFB',
                      borderRadius: '8px',
                      border: `1px solid ${occ.isPrimary ? '#86EFAC' : '#E5E7EB'}`,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>
                          {occ.name}
                        </span>
                        {occ.isPrimary && (
                          <span className="rf-badge rf-badge-active" style={{ fontSize: '10px' }}>
                            Đại diện hợp đồng
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#4B5563', marginTop: '3px' }}>
                        <span>SĐT: <strong>{occ.phone}</strong></span>
                        <span>CCCD: <strong>{occ.idCard}</strong></span>
                        {occ.joinedAt && <span>Vào ở: {occ.joinedAt}</span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleRemoveOccupant(occ.id, occ.name)}
                        className="rf-btn rf-btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '11px', color: '#DC2626' }}
                        title="Xóa người này khỏi phòng"
                      >
                        <Trash2 size={13} /> Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Occupant Form */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', backgroundColor: '#F9FAFB' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                  + Thêm thành viên mới vào phòng
                </h4>
                <form onSubmit={handleAddOccupant} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#4B5563', marginBottom: '4px', fontWeight: 600 }}>
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn B"
                      value={newOccName}
                      onChange={(e) => setNewOccName(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#4B5563', marginBottom: '4px', fontWeight: 600 }}>
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      placeholder="09xx xxx xxx"
                      value={newOccPhone}
                      onChange={(e) => setNewOccPhone(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: '#4B5563', marginBottom: '4px', fontWeight: 600 }}>
                      Số CCCD
                    </label>
                    <input
                      type="text"
                      placeholder="12 chữ số"
                      value={newOccIdCard}
                      onChange={(e) => setNewOccIdCard(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '13px' }}
                    />
                  </div>
                  <button type="submit" className="rf-btn rf-btn-primary" style={{ padding: '7px 16px', fontSize: '13px' }}>
                    <Plus size={14} /> Thêm
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const RoomOperationsModal: React.FC<RoomOperationsModalProps> = (props) => {
  if (!props.isOpen || !props.room) return null;
  return <RoomOperationsModalDialog key={props.room.id} {...props} room={props.room} />;
};

