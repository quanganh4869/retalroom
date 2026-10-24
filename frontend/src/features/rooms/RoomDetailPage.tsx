import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Users,
  Zap,
  UserPlus,
  ShieldCheck,
  Phone,
  Trash2,
  ExternalLink,
  MessageSquare,
  FileText,
  Receipt,
  ArrowLeft,
  Lock,
  Unlock,
  AlertCircle,
  Send,
  Copy,
} from 'lucide-react';
import {
  mockRooms,
  mockProperties,
  mockContracts,
  mockMeterReadings,
  formatVND,
  RoomItem,
  RoomOccupant,
  ContractItem,
  MeterReadingItem,
} from '@/lib/mockData';
import { useActionModal } from '@/components/ui/ActionModal';
import { useToast } from '@/components/feedback/ToastSystem';

export const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { confirmAction } = useActionModal();
  const { success, error, info } = useToast();

  // Find room or fallback to first
  const foundRoom = mockRooms.find((r) => r.id === id || r.code === id);
  const initialRoom: RoomItem = foundRoom || mockRooms[0]!;
  const [room, setRoom] = useState<RoomItem>(initialRoom);

  useEffect(() => {
    const found = mockRooms.find((r) => r.id === id || r.code === id);
    if (found) {
      setRoom(found);
    }
  }, [id]);

  // Active tab state from URL or default to 'meter'
  const tabParam = searchParams.get('tab') as 'meter' | 'contract' | 'message' | 'invoice' | 'occupants' | null;
  const [activeTab, setActiveTab] = useState<'meter' | 'contract' | 'message' | 'invoice' | 'occupants'>(tabParam || 'meter');

  useEffect(() => {
    if (tabParam && ['meter', 'contract', 'message', 'invoice', 'occupants'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (newTab: 'meter' | 'contract' | 'message' | 'invoice' | 'occupants') => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Property info
  const property = mockProperties.find((p) => p.id === room.propertyId);

  // Contract info for this room
  const foundContract = mockContracts.find((c) => c.roomCode === room.code);
  const existingContract: ContractItem = foundContract || {
    id: `CT-2026-${room.code.replace(/\D/g, '') || '101'}`,
    roomCode: room.code,
    tenantName: room.tenantName || 'Khách thuê',
    tenantPhone: room.tenantPhone || '0901 234 567',
    startDate: '01/05/2026',
    endDate: room.leaseEnd || '31/10/2026',
    depositAmount: room.price,
    monthlyRent: room.price,
    paymentCycle: 'Hàng tháng (mùng 1 - mùng 5)',
    status: 'active',
  };
  const [contract, setContract] = useState<ContractItem>(existingContract);

  // Meter readings for this room
  const [meterHistory, setMeterHistory] = useState<MeterReadingItem[]>(
    mockMeterReadings.filter((m) => m.roomCode === room.code)
  );

  const lastReading = meterHistory[0] || {
    id: 'mr-default',
    roomCode: room.code,
    tenantName: room.tenantName || 'Khách thuê',
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

    // Fix and lock old reading
    setIsPrevLocked(true);

    const newReading: MeterReadingItem = {
      id: `mr-${Date.now()}`,
      roomCode: room.code,
      tenantName: room.tenantName || 'Khách thuê',
      prevElectric,
      currElectric,
      prevWater,
      currWater,
      electricUnitPrice: electricPrice,
      waterUnitPrice: waterPrice,
      updatedAt: new Date().toLocaleDateString('vi-VN'),
    };

    setMeterHistory((prev) => [newReading, ...prev]);

    success(
      'Ghi chỉ số điện nước thành công',
      `Phòng ${room.code}: Điện +${electricUsage} kWh (${formatVND(electricCost)}), Nước +${waterUsage} m³ (${formatVND(waterCost)}). Chỉ số cũ đã được cố định an toàn!`
    );
  };

  // ================= 2. HỢP ĐỒNG & GIA HẠN STATE =================
  const [extensionMonths, setExtensionMonths] = useState<number>(6);
  const [renewalPrice, setRenewalPrice] = useState<number>(contract.monthlyRent);
  const [renewalNotes, setRenewalNotes] = useState<string>('Gia hạn tiếp theo thỏa thuận giữa chủ nhà và khách thuê.');

  const calculateNewEndDate = (currentEnd: string, monthsToAdd: number): string => {
    try {
      const parts = currentEnd.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]!, 10);
        const month = parseInt(parts[1]!, 10) - 1;
        const year = parseInt(parts[2]!, 10);
        const date = new Date(year, month, day);
        date.setMonth(date.getMonth() + monthsToAdd);
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      }
    } catch {
      // fallback
    }
    return '30/04/2027';
  };

  const newProjectedEndDate = calculateNewEndDate(contract.endDate, extensionMonths);

  const handleRenewContract = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedContract: ContractItem = {
      ...contract,
      endDate: newProjectedEndDate,
      monthlyRent: renewalPrice,
    };
    setContract(updatedContract);

    const updatedRoom: RoomItem = {
      ...room,
      price: renewalPrice,
      leaseEnd: newProjectedEndDate,
    };
    setRoom(updatedRoom);

    success(
      'Gia hạn hợp đồng thành công',
      `Hợp đồng phòng ${room.code} đã gia hạn thêm ${extensionMonths} tháng (đến ngày ${newProjectedEndDate}) với giá thuê ${formatVND(renewalPrice)}/tháng.`
    );
  };

  // ================= 3. NHẮN TIN NGƯỜI Ở STATE =================
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

  const defaultTemplates = [
    {
      id: 'utility',
      title: 'Thông báo điện nước & tiền phòng',
      text: `Xin chào ${tenantName} (Phòng ${room.code} - ${property?.name || 'Nhà trọ'}),\n\nChủ nhà gửi bạn thông báo tiền phòng tháng này:\n- Tiền phòng: ${formatVND(room.price)}\n- Tiền điện (${electricUsage} kWh): ${formatVND(electricCost)}\n- Tiền nước (${waterUsage} m³): ${formatVND(waterCost)}\n- Dịch vụ (rác, wifi): ${formatVND(120000)}\n👉 TỔNG CỘNG: ${formatVND(room.price + totalUtilityCost + 120000)}\n\nVui lòng chuyển khoản trước ngày 05 hàng tháng. Xin cảm ơn!`,
    },
    {
      id: 'reminder',
      title: 'Nhắc nợ / Nhắc thanh toán',
      text: `Xin chào ${tenantName} (Phòng ${room.code}),\n\nHóa đơn tiền phòng tháng này của bạn đến hạn thanh toán. Nhờ bạn sắp xếp thanh toán sớm theo số tài khoản MB Bank: 0988 123 456 (NGUYEN AN) với nội dung: "PHONG ${room.code}". Cảm ơn bạn!`,
    },
    {
      id: 'contract_expire',
      title: 'Báo hết hạn hợp đồng thuê',
      text: `Chào ${tenantName} (Phòng ${room.code}),\n\nHợp đồng thuê phòng của bạn sẽ hết hạn vào ngày ${contract.endDate}. Bạn vui lòng phản hồi xem có nhu cầu gia hạn tiếp để bên mình chuẩn bị phụ lục hợp đồng nhé. Trân trọng!`,
    },
    {
      id: 'pccc',
      title: 'Nhắc nhở an toàn PCCC & Trật tự',
      text: `Thông báo ban quản lý ${property?.name || 'Nhà trọ'}:\nNhắc nhở các bạn cư dân phòng ${room.code} lưu ý kiểm tra tắt thiết bị điện khi ra ngoài, không sạc xe máy điện qua đêm và giữ gìn trật tự chung sau 23h. Xin cảm ơn sự hợp tác của các bạn!`,
    },
  ];

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('utility');
  const [messageContent, setMessageContent] = useState<string>(defaultTemplates[0]!.text);

  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const found = defaultTemplates.find((t) => t.id === tplId);
    if (found) {
      setMessageContent(found.text);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageContent);
    success('Đã sao chép tin nhắn', 'Nội dung tin nhắn đã được lưu vào bộ nhớ tạm.');
  };

  const handleOpenZalo = () => {
    const cleanPhone = tenantPhone.replace(/\D/g, '');
    const zaloUrl = `https://zalo.me/${cleanPhone}`;
    window.open(zaloUrl, '_blank');
    info('Đang mở Zalo', `Đang kết nối tới Zalo của ${tenantName} (${tenantPhone}).`);
  };

  const handleSendSMS = () => {
    const cleanPhone = tenantPhone.replace(/\D/g, '');
    const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(messageContent)}`;
    window.open(smsUrl, '_blank');
  };

  // ================= 4. HÓA ĐƠN & VIETQR STATE =================
  const serviceFee = 120000;
  const invoiceTotal = room.price + totalUtilityCost + serviceFee;
  const qrBankName = 'MB Bank (Quân Đội)';
  const qrAccountNumber = '0988123456';
  const qrAccountName = 'NGUYEN AN';
  const qrContent = `PHONG ${room.code} THANG 10`;
  const qrImageUrl = `https://img.vietqr.io/image/MB-0988123456-compact2.png?amount=${invoiceTotal}&addInfo=${encodeURIComponent(qrContent)}&accountName=${encodeURIComponent(qrAccountName)}`;

  // ================= 5. NGƯỜI Ở STATE =================
  const [showAddOccupant, setShowAddOccupant] = useState(false);
  const [newOccupantName, setNewOccupantName] = useState('');
  const [newOccupantPhone, setNewOccupantPhone] = useState('');
  const [newOccupantIdCard, setNewOccupantIdCard] = useState('');
  const [isPrimaryNew, setIsPrimaryNew] = useState(false);

  const maxOcc = room.maxOccupants || 3;
  const isFull = currentOccupants.length >= maxOcc;

  const handleAddOccupant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOccupantName.trim() || !newOccupantPhone.trim()) return;

    const newOcc: RoomOccupant = {
      id: `oc-${Date.now()}`,
      name: newOccupantName.trim(),
      phone: newOccupantPhone.trim(),
      idCard: newOccupantIdCard.trim() || 'Chưa cập nhật',
      isPrimary: isPrimaryNew || currentOccupants.length === 0,
      joinedAt: new Date().toLocaleDateString('vi-VN'),
    };

    const updatedOccupants = isPrimaryNew
      ? [newOcc, ...currentOccupants.map((o) => ({ ...o, isPrimary: false }))]
      : [...currentOccupants, newOcc];

    const updatedRoom: RoomItem = {
      ...room,
      occupants: updatedOccupants,
      tenantName: isPrimaryNew || !room.tenantName ? newOcc.name : room.tenantName,
      tenantPhone: isPrimaryNew || !room.tenantPhone ? newOcc.phone : room.tenantPhone,
      status: 'occupied',
    };

    setRoom(updatedRoom);
    setShowAddOccupant(false);
    setNewOccupantName('');
    setNewOccupantPhone('');
    setNewOccupantIdCard('');
    setIsPrimaryNew(false);
    success('Thêm người ở thành công', `Đã thêm "${newOcc.name}" vào phòng ${room.code}!`);
  };

  const handleRemoveOccupant = (occupantId: string, occupantName: string) => {
    confirmAction({
      title: `Xóa người ở "${occupantName}"`,
      description: `Bạn có chắc chắn muốn xóa "${occupantName}" khỏi danh sách người ở của phòng ${room.code}? Hồ sơ tạm trú liên quan sẽ được cập nhật.`,
      confirmText: 'Xác nhận xóa',
      confirmVariant: 'danger',
      successTitle: 'Đã xóa người ở thành công!',
      successMessage: `Đã xóa thông tin của "${occupantName}" khỏi phòng ${room.code}.`,
      simulateDelayMs: 500,
      onSuccess: () => {
        const updatedOccupants = currentOccupants.filter((o) => o.id !== occupantId);
        const newPrimary = updatedOccupants.find((o) => o.isPrimary) || updatedOccupants[0];

        const updatedRoom: RoomItem = {
          ...room,
          occupants: updatedOccupants,
          tenantName: newPrimary ? newPrimary.name : undefined,
          tenantPhone: newPrimary ? newPrimary.phone : undefined,
          status: updatedOccupants.length > 0 ? 'occupied' : 'vacant',
        };

        setRoom(updatedRoom);
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'occupied':
        return <span className="rf-badge rf-badge-active">Đang thuê</span>;
      case 'vacant':
        return <span className="rf-badge rf-badge-vacant">Còn trống</span>;
      case 'reserved':
        return <span className="rf-badge rf-badge-warning">Đã cọc giữ chỗ</span>;
      case 'maintenance':
        return <span className="rf-badge rf-badge-overdue">Đang bảo trì</span>;
      default:
        return <span className="rf-badge">{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {property ? (
            <Link
              to={`/properties/${property.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#00594C',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13px',
                backgroundColor: '#E8F5E9',
                padding: '6px 12px',
                borderRadius: '6px',
              }}
            >
              <ArrowLeft size={14} /> Quay lại dãy trọ {property.name}
            </Link>
          ) : (
            <Link
              to="/properties"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#00594C',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '13px',
                backgroundColor: '#E8F5E9',
                padding: '6px 12px',
                borderRadius: '6px',
              }}
            >
              <ArrowLeft size={14} /> Quay lại danh sách dãy trọ
            </Link>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: 0 }}>
              Phòng {room.code}
            </h1>
            {getStatusBadge(room.status)}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#4B5563' }}>
          <span>Tầng {room.floor} • {room.type} ({room.area}m²)</span>
          <span style={{ color: '#D1D5DB' }}>|</span>
          <span style={{ fontWeight: 700, color: '#00594C' }}>{formatVND(room.price)}/tháng</span>
        </div>
      </div>

      {/* Top Room Summary Card */}
      <div
        className="rf-card"
        style={{
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          backgroundColor: '#FFFFFF',
          borderLeft: '4px solid #00594C',
        }}
      >
        <div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Khách thuê đại diện</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
            {tenantName}
          </div>
          <div style={{ fontSize: '12px', color: '#00594C', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Phone size={11} /> {tenantPhone}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Sức chứa & Người ở</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
            {currentOccupants.length}/{maxOcc} người
          </div>
          <div style={{ fontSize: '12px', color: isFull ? '#D97706' : '#137333', marginTop: '2px' }}>
            {isFull ? 'Đã đủ số người tối đa' : `Còn nhận thêm ${maxOcc - currentOccupants.length} người`}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Đơn giá điện & nước</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#D97706', marginTop: '2px' }}>
            ⚡ {electricPrice.toLocaleString('vi-VN')} đ/kWh
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0284C7', marginTop: '2px' }}>
            💧 {waterPrice.toLocaleString('vi-VN')} đ/m³
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Thời hạn hợp đồng</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
            {contract.startDate} → {contract.endDate}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
            Cọc giữ chỗ: {formatVND(contract.depositAmount)}
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid #E5E7EB',
          paddingBottom: '2px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => handleTabChange('meter')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            backgroundColor: activeTab === 'meter' ? '#00594C' : '#F3F4F6',
            color: activeTab === 'meter' ? '#FFFFFF' : '#4B5563',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Zap size={16} color={activeTab === 'meter' ? '#FDE047' : '#D97706'} />
          Ghi điện nước
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('contract')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            backgroundColor: activeTab === 'contract' ? '#00594C' : '#F3F4F6',
            color: activeTab === 'contract' ? '#FFFFFF' : '#4B5563',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <FileText size={16} color={activeTab === 'contract' ? '#FFFFFF' : '#00594C'} />
          Hợp đồng & Gia hạn
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('message')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            backgroundColor: activeTab === 'message' ? '#00594C' : '#F3F4F6',
            color: activeTab === 'message' ? '#FFFFFF' : '#4B5563',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <MessageSquare size={16} color={activeTab === 'message' ? '#FFFFFF' : '#0068FF'} />
          Nhắn tin người ở
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('invoice')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            backgroundColor: activeTab === 'invoice' ? '#00594C' : '#F3F4F6',
            color: activeTab === 'invoice' ? '#FFFFFF' : '#4B5563',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Receipt size={16} color={activeTab === 'invoice' ? '#FFFFFF' : '#15803D'} />
          Lập hóa đơn & QR
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('occupants')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            border: 'none',
            backgroundColor: activeTab === 'occupants' ? '#00594C' : '#F3F4F6',
            color: activeTab === 'occupants' ? '#FFFFFF' : '#4B5563',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Users size={16} color={activeTab === 'occupants' ? '#FFFFFF' : '#6B7280'} />
          Người ở ({currentOccupants.length})
        </button>
      </div>

      {/* Tab 1: Ghi điện nước */}
      {activeTab === 'meter' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="rf-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Chốt chỉ số điện & nước tháng này
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6B7280' }}>
                  Nhập số mới để tự động tính tiền điện nước. Khi bấm lưu, chỉ số cũ sẽ được khóa cố định để đảm bảo tính minh bạch.
                </p>
              </div>

              {isPrevLocked && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className="rf-badge rf-badge-active"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                  >
                    <Lock size={12} /> Đã khóa chỉ số cũ
                  </span>
                  <button
                    type="button"
                    className="rf-btn rf-btn-secondary"
                    style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => {
                      setIsPrevLocked(false);
                      info('Đã mở khóa chỉ số cũ', 'Bạn có thể chỉnh sửa lại chỉ số kỳ trước nếu cần.');
                    }}
                  >
                    <Unlock size={12} /> Mở khóa
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveMeterReading} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Điện (Electricity) Column */}
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '10px',
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FCD34D',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#FDE68A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#B45309',
                        }}
                      >
                        <Zap size={18} />
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: '#92400E' }}>
                        CÔNG TƠ ĐIỆN (kWh)
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#B45309' }}>
                      Đơn giá: {electricPrice.toLocaleString('vi-VN')} đ/kWh
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#4B5563' }}>
                          Số cũ (kỳ trước)
                        </label>
                        {isPrevLocked && (
                          <span style={{ fontSize: '10px', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <Lock size={10} /> Đã khóa
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        title="Chỉ số điện kỳ trước"
                        value={prevElectric}
                        readOnly={isPrevLocked}
                        disabled={isPrevLocked}
                        onChange={(e) => setPrevElectric(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: isPrevLocked ? '1px solid #9CA3AF' : '1px solid #D1D5DB',
                          backgroundColor: isPrevLocked ? '#F3F4F6' : '#FFFFFF',
                          color: isPrevLocked ? '#6B7280' : '#111827',
                          fontWeight: 700,
                          fontSize: '15px',
                          cursor: isPrevLocked ? 'not-allowed' : 'text',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                        Số mới chốt tháng này *
                      </label>
                      <input
                        type="number"
                        id="currElectricInput"
                        required
                        value={currElectric}
                        onChange={(e) => setCurrElectric(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: isElectricInvalid ? '2px solid #EF4444' : '2px solid #D97706',
                          backgroundColor: '#FFFFFF',
                          color: '#111827',
                          fontWeight: 800,
                          fontSize: '16px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Validation Error Message */}
                  {isElectricInvalid && (
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#FEE2E2',
                        border: '1px solid #FCA5A5',
                        color: '#991B1B',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <AlertCircle size={14} />
                      <span>Không được nhỏ hơn số cũ ({prevElectric} kWh)!</span>
                    </div>
                  )}

                  {/* Cost Summary Box */}
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #FDE68A',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>Tiêu thụ kỳ này:</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#D97706' }}>
                        {electricUsage} kWh
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>Thành tiền điện:</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                        {formatVND(electricCost)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nước (Water) Column */}
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '10px',
                    backgroundColor: '#F0F9FF',
                    border: '1px solid #BAE6FD',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#BAE6FD',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0284C7',
                        }}
                      >
                        <Zap size={18} />
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: '#0369A1' }}>
                        ĐỒNG HỒ NƯỚC (m³)
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#0284C7' }}>
                      Đơn giá: {waterPrice.toLocaleString('vi-VN')} đ/m³
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#4B5563' }}>
                          Số cũ (kỳ trước)
                        </label>
                        {isPrevLocked && (
                          <span style={{ fontSize: '10px', color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <Lock size={10} /> Đã khóa
                          </span>
                        )}
                      </div>
                      <input
                        type="number"
                        title="Chỉ số nước kỳ trước"
                        value={prevWater}
                        readOnly={isPrevLocked}
                        disabled={isPrevLocked}
                        onChange={(e) => setPrevWater(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: isPrevLocked ? '1px solid #9CA3AF' : '1px solid #D1D5DB',
                          backgroundColor: isPrevLocked ? '#F3F4F6' : '#FFFFFF',
                          color: isPrevLocked ? '#6B7280' : '#111827',
                          fontWeight: 700,
                          fontSize: '15px',
                          cursor: isPrevLocked ? 'not-allowed' : 'text',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                        Số mới chốt tháng này *
                      </label>
                      <input
                        type="number"
                        id="currWaterInput"
                        required
                        value={currWater}
                        onChange={(e) => setCurrWater(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: isWaterInvalid ? '2px solid #EF4444' : '2px solid #0284C7',
                          backgroundColor: '#FFFFFF',
                          color: '#111827',
                          fontWeight: 800,
                          fontSize: '16px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Validation Error Message */}
                  {isWaterInvalid && (
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#FEE2E2',
                        border: '1px solid #FCA5A5',
                        color: '#991B1B',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <AlertCircle size={14} />
                      <span>Không được nhỏ hơn số cũ ({prevWater} m³)!</span>
                    </div>
                  )}

                  {/* Cost Summary Box */}
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #BAE6FD',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>Tiêu thụ kỳ này:</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0284C7' }}>
                        {waterUsage} m³
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>Thành tiền nước:</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                        {formatVND(waterCost)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Save Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '16px',
                  borderTop: '1px solid #E5E7EB',
                }}
              >
                <div>
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>Tổng cộng tiền điện + nước kỳ này: </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#00594C' }}>
                    {formatVND(totalUtilityCost)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="rf-btn rf-btn-primary"
                  style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 700 }}
                >
                  <Lock size={15} /> Lưu chỉ số điện nước (Khóa cố định số cũ)
                </button>
              </div>
            </form>
          </div>

          {/* Historical Readings Table */}
          <div className="rf-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 14px 0' }}>
              Lịch sử ghi chỉ số các kỳ trước ({meterHistory.length} kỳ)
            </h3>

            {meterHistory.length === 0 ? (
              <p style={{ color: '#6B7280', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>
                Chưa có lịch sử chỉ số cho phòng này.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="rf-table">
                  <thead>
                    <tr>
                      <th>Kỳ chốt</th>
                      <th>Điện (Cũ → Mới)</th>
                      <th>Tiêu thụ điện</th>
                      <th>Nước (Cũ → Mới)</th>
                      <th>Tiêu thụ nước</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meterHistory.map((m) => {
                      const eUsage = m.currElectric - m.prevElectric;
                      const wUsage = m.currWater - m.prevWater;
                      return (
                        <tr key={m.id}>
                          <td style={{ fontWeight: 600 }}>{m.updatedAt}</td>
                          <td>
                            {m.prevElectric} → {m.currElectric} kWh
                          </td>
                          <td style={{ fontWeight: 600, color: '#D97706' }}>
                            {eUsage} kWh ({formatVND(eUsage * m.electricUnitPrice)})
                          </td>
                          <td>
                            {m.prevWater} → {m.currWater} m³
                          </td>
                          <td style={{ fontWeight: 600, color: '#0284C7' }}>
                            {wUsage} m³ ({formatVND(wUsage * m.waterUnitPrice)})
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Hợp đồng & Gia hạn */}
      {activeTab === 'contract' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Current Contract Details */}
          <div className="rf-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                Hợp đồng thuê hiện hành
              </h2>
              <span className="rf-badge rf-badge-active">{contract.status.toUpperCase()}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Mã hợp đồng:</span>
                <strong style={{ color: '#00594C' }}>{contract.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Đại diện thuê:</span>
                <span style={{ fontWeight: 600 }}>{contract.tenantName} ({contract.tenantPhone})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Thời hạn thuê:</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>{contract.startDate} → {contract.endDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Giá thuê hàng tháng:</span>
                <strong style={{ color: '#00594C', fontSize: '15px' }}>{formatVND(contract.monthlyRent)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px dashed #E5E7EB' }}>
                <span style={{ color: '#6B7280' }}>Tiền cọc giữ chỗ:</span>
                <strong style={{ color: '#137333' }}>{formatVND(contract.depositAmount)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                <span style={{ color: '#6B7280' }}>Kỳ hạn thanh toán:</span>
                <span>{contract.paymentCycle}</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '10px' }}>
              <Link
                to={`/contracts/${contract.id}`}
                className="rf-btn rf-btn-secondary"
                style={{ textDecoration: 'none', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                Xem chi tiết bản hợp đồng <ExternalLink size={12} />
              </Link>
              <Link
                to={`/handover?roomCode=${room.code}`}
                className="rf-btn rf-btn-secondary"
                style={{ textDecoration: 'none', fontSize: '12px' }}
              >
                Biên bản bàn giao
              </Link>
            </div>
          </div>

          {/* Renewal Form */}
          <div className="rf-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
              Gia hạn hợp đồng thuê
            </h2>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px 0' }}>
              Thêm thời hạn thuê mới và điều chỉnh giá thuê nếu có thỏa thuận.
            </p>

            <form onSubmit={handleRenewContract} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                  Thời gian gia hạn thêm
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[3, 6, 12].map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => setExtensionMonths(months)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '6px',
                        border: extensionMonths === months ? '2px solid #00594C' : '1px solid #D1D5DB',
                        backgroundColor: extensionMonths === months ? '#E8F5E9' : '#FFFFFF',
                        color: extensionMonths === months ? '#00594C' : '#374151',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      +{months} tháng
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Ngày kết thúc mới sau gia hạn:
                </label>
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '14px',
                    color: '#00594C',
                  }}
                >
                  {newProjectedEndDate} (Thêm {extensionMonths} tháng từ {contract.endDate})
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Giá thuê áp dụng cho kỳ mới (VND/tháng)
                </label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={renewalPrice}
                  onChange={(e) => setRenewalPrice(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Ghi chú phụ lục gia hạn
                </label>
                <textarea
                  rows={2}
                  value={renewalNotes}
                  onChange={(e) => setRenewalNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                />
              </div>

              <button
                type="submit"
                className="rf-btn rf-btn-primary"
                style={{ padding: '10px 20px', fontWeight: 700, marginTop: '8px' }}
              >
                <FileText size={15} /> Xác nhận gia hạn hợp đồng
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Nhắn tin người ở */}
      {activeTab === 'message' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Templates & Contact Card */}
          <div className="rf-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                Người nhận thông báo
              </h2>
              <div
                style={{
                  marginTop: '10px',
                  padding: '12px 16px',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>{tenantName}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Người đại diện hợp đồng</div>
                </div>
                <div style={{ fontWeight: 700, color: '#00594C', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={14} /> {tenantPhone}
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
                Chọn mẫu tin nhắn soạn sẵn
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {defaultTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      border: selectedTemplateId === tpl.id ? '2px solid #00594C' : '1px solid #E5E7EB',
                      backgroundColor: selectedTemplateId === tpl.id ? '#E8F5E9' : '#FFFFFF',
                      color: selectedTemplateId === tpl.id ? '#00594C' : '#374151',
                      fontWeight: selectedTemplateId === tpl.id ? 700 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Message Preview & Sending Options */}
          <div className="rf-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
              Nội dung gửi khách thuê
            </h2>

            <textarea
              rows={9}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                lineHeight: 1.5,
                fontFamily: 'inherit',
              }}
            />

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleOpenZalo}
                className="rf-btn rf-btn-primary"
                style={{
                  backgroundColor: '#0068FF',
                  borderColor: '#0068FF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                }}
              >
                <MessageSquare size={16} /> Mở chat Zalo trực tiếp
              </button>

              <button
                type="button"
                onClick={handleSendSMS}
                className="rf-btn rf-btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Send size={15} /> Gửi tin SMS
              </button>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="rf-btn rf-btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Copy size={15} /> Sao chép tin nhắn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Lập hóa đơn & QR */}
      {activeTab === 'invoice' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          {/* Invoice Itemized Breakdown */}
          <div className="rf-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Bảng kê hóa đơn phòng {room.code}
                </h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Kỳ thanh toán: Tháng 10/2026 • Hạn nộp: 05/11/2026
                </p>
              </div>
              <span className="rf-badge rf-badge-warning">Chờ thanh toán</span>
            </div>

            <table className="rf-table">
              <thead>
                <tr>
                  <th>Khoản mục</th>
                  <th>Chỉ số / Số lượng</th>
                  <th>Đơn giá</th>
                  <th style={{ textAlign: 'right' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 600 }}>1. Tiền thuê phòng</td>
                  <td>1 tháng</td>
                  <td>{formatVND(room.price)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatVND(room.price)}</td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>2. Tiền điện sinh hoạt</td>
                  <td>
                    {electricUsage} kWh ({prevElectric} → {currElectric})
                  </td>
                  <td>{electricPrice.toLocaleString('vi-VN')} đ</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#D97706' }}>
                    {formatVND(electricCost)}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>3. Tiền nước sinh hoạt</td>
                  <td>
                    {waterUsage} m³ ({prevWater} → {currWater})
                  </td>
                  <td>{waterPrice.toLocaleString('vi-VN')} đ</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#0284C7' }}>
                    {formatVND(waterCost)}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 600 }}>4. Dịch vụ (Rác, Wifi, Vệ sinh)</td>
                  <td>1 phòng</td>
                  <td>{formatVND(serviceFee)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatVND(serviceFee)}</td>
                </tr>
              </tbody>
            </table>

            <div
              style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '2px dashed #E5E7EB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#374151' }}>
                TỔNG CỘNG HÓA ĐƠN:
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#00594C' }}>
                {formatVND(invoiceTotal)}
              </div>
            </div>
          </div>

          {/* VietQR Bank Payment Card */}
          <div className="rf-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
              Mã VietQR thanh toán tự động
            </h3>
            <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
              Khách quét mã để thanh toán đúng số tiền và nội dung tự động điền.
            </p>

            <div
              style={{
                padding: '12px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              }}
            >
              <img
                src={qrImageUrl}
                alt="VietQR Payment"
                style={{ width: '220px', height: '220px', objectFit: 'contain' }}
              />
            </div>

            <div style={{ fontSize: '12px', textAlign: 'left', width: '100%', backgroundColor: '#F9FAFB', padding: '10px 14px', borderRadius: '6px' }}>
              <div>Ngân hàng: <strong>{qrBankName}</strong></div>
              <div>Số tài khoản: <strong>{qrAccountNumber}</strong></div>
              <div>Chủ tài khoản: <strong>{qrAccountName}</strong></div>
              <div>Nội dung: <strong>{qrContent}</strong></div>
            </div>

            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`STK: ${qrAccountNumber} - ${qrBankName} - CTK: ${qrAccountName} - Số tiền: ${formatVND(invoiceTotal)} - Nội dung: ${qrContent}`);
                  success('Đã sao chép STK', 'Đã lưu thông tin tài khoản chuyển khoản vào bộ nhớ tạm.');
                }}
                className="rf-btn rf-btn-secondary"
                style={{ flex: 1, fontSize: '12px' }}
              >
                Sao chép STK
              </button>
              <button
                type="button"
                onClick={handleOpenZalo}
                className="rf-btn rf-btn-primary"
                style={{ flex: 1, fontSize: '12px' }}
              >
                Gửi qua Zalo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Người ở & Tạm trú */}
      {activeTab === 'occupants' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="rf-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Danh sách người đang ở ({currentOccupants.length}/{maxOcc} người)
                </h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                  Quản lý đầy đủ các thành viên sinh sống, người đại diện hợp đồng và đăng ký tạm trú CCCD
                </p>
              </div>

              <button
                type="button"
                className="rf-btn rf-btn-primary"
                onClick={() => setShowAddOccupant(true)}
                disabled={isFull}
                style={{ fontSize: '13px' }}
              >
                <UserPlus size={14} /> Thêm người ở
              </button>
            </div>

            {currentOccupants.length === 0 ? (
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '8px',
                  border: '1px dashed #D1D5DB',
                }}
              >
                <Users size={32} color="#9CA3AF" style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '14px', color: '#4B5563', margin: '0 0 8px 0', fontWeight: 500 }}>
                  Phòng hiện tại chưa có người ở nào
                </p>
                <button
                  type="button"
                  className="rf-btn rf-btn-primary"
                  style={{ fontSize: '12px' }}
                  onClick={() => setShowAddOccupant(true)}
                >
                  <UserPlus size={14} /> Thêm người thuê đầu tiên
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentOccupants.map((occ, idx) => (
                  <div
                    key={occ.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      backgroundColor: occ.isPrimary ? '#F0FDF4' : '#F9FAFB',
                      borderRadius: '8px',
                      border: `1px solid ${occ.isPrimary ? '#86EFAC' : '#E5E7EB'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: occ.isPrimary ? '#00594C' : '#E5E7EB',
                          color: occ.isPrimary ? '#FFFFFF' : '#374151',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '15px',
                        }}
                      >
                        {occ.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>
                            {occ.name}
                          </span>
                          {occ.isPrimary && (
                            <span
                              className="rf-badge rf-badge-active"
                              style={{ fontSize: '11px', padding: '2px 8px' }}
                            >
                              <ShieldCheck size={11} /> Đại diện hợp đồng
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: '14px',
                            fontSize: '13px',
                            color: '#4B5563',
                            marginTop: '3px',
                          }}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={12} color="#6B7280" /> {occ.phone}
                          </span>
                          <span>CCCD: {occ.idCard || 'Đang cập nhật'}</span>
                          {occ.joinedAt && <span>Vào ở: {occ.joinedAt}</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        className="rf-btn rf-btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '12px', color: '#DC2626' }}
                        title="Xóa người này khỏi phòng"
                        onClick={() => handleRemoveOccupant(occ.id, occ.name)}
                      >
                        <Trash2 size={14} /> Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Occupant Modal Form */}
      {showAddOccupant && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            className="rf-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                Thêm người ở vào phòng {room.code}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddOccupant(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6B7280' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddOccupant} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Họ và tên người ở *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={newOccupantName}
                  onChange={(e) => setNewOccupantName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 0912345678"
                  value={newOccupantPhone}
                  onChange={(e) => setNewOccupantPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  Số CCCD / CMND (Tạm trú)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 079201004123"
                  value={newOccupantIdCard}
                  onChange={(e) => setNewOccupantIdCard(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="isPrimaryCheck"
                  checked={isPrimaryNew}
                  onChange={(e) => setIsPrimaryNew(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="isPrimaryCheck" style={{ fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                  Đặt người này làm người đại diện hợp đồng chính
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="rf-btn rf-btn-secondary"
                  onClick={() => setShowAddOccupant(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="rf-btn rf-btn-primary">
                  Xác nhận thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
