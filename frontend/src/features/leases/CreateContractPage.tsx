import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Building2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Info,
} from 'lucide-react';
import {
  mockProperties,
  mockRooms,
  mockContracts,
  formatVND,
  ContractItem,
} from '@/lib/mockData';
import { useToast } from '@/components/feedback/ToastSystem';

export const CreateContractPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error } = useToast();

  const defaultPropId = searchParams.get('propertyId') || mockProperties[0]?.id || '1';
  const defaultRoomCode = searchParams.get('roomCode') || '';

  // Form State
  const [propertyId, setPropertyId] = useState<string>(defaultPropId);
  const [roomCode, setRoomCode] = useState<string>(defaultRoomCode);

  // Tenant State
  const [tenantName, setTenantName] = useState<string>('');
  const [tenantPhone, setTenantPhone] = useState<string>('');
  const [idCard, setIdCard] = useState<string>('');
  const [idIssueDate, setIdIssueDate] = useState<string>('2022-05-10');
  const [idIssuePlace, setIdIssuePlace] = useState<string>('Cục Cảnh sát QLHC về TTXH');
  const [permanentAddress, setPermanentAddress] = useState<string>('');

  // Financial & Lease Term State
  const todayStr = new Date().toISOString().split('T')[0]!;
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [monthlyRent, setMonthlyRent] = useState<number>(4200000);
  const [depositAmount, setDepositAmount] = useState<number>(4200000);
  const [paymentCycle, setPaymentCycle] = useState<string>('Hàng tháng (mùng 1 - mùng 5)');
  const [paymentMethod, setPaymentMethod] = useState<string>('Chuyển khoản VietQR');

  // Utilities State
  const [electricPrice, setElectricPrice] = useState<number>(3800);
  const [waterPrice, setWaterPrice] = useState<number>(20000);
  const [serviceFee, setServiceFee] = useState<number>(120000);
  const [initialElectric, setInitialElectric] = useState<number>(1420);
  const [initialWater, setInitialWater] = useState<number>(85);

  // Agreement Checklist & Notes
  const [agreeRules, setAgreeRules] = useState<boolean>(true);
  const [agreePCCC, setAgreePCCC] = useState<boolean>(true);
  const [agreeNotice30Days, setAgreeNotice30Days] = useState<boolean>(true);
  const [additionalTerms, setAdditionalTerms] = useState<string>(
    'Khách thuê cam kết đăng ký tạm trú đúng hạn, không nuôi động vật gây ồn ào và giữ gìn trật tự chung sau 23h.'
  );

  // Filter available rooms for selected property
  const selectedProperty = mockProperties.find((p) => p.id === propertyId);
  const availableRooms = mockRooms.filter((r) => r.propertyId === propertyId);

  // Auto-select room and sync price when property changes
  useEffect(() => {
    if (availableRooms.length > 0) {
      const match = availableRooms.find((r) => r.code === roomCode);
      const chosenRoom = match || availableRooms[0]!;
      setRoomCode(chosenRoom.code);
      setMonthlyRent(chosenRoom.price);
      setDepositAmount(chosenRoom.price);
      setElectricPrice(chosenRoom.electricUnitPrice || 3800);
      setWaterPrice(chosenRoom.waterUnitPrice || 20000);
    }
  }, [propertyId]);

  // When roomCode changes, update price
  const handleRoomChange = (code: string) => {
    setRoomCode(code);
    const chosenRoom = availableRooms.find((r) => r.code === code);
    if (chosenRoom) {
      setMonthlyRent(chosenRoom.price);
      setDepositAmount(chosenRoom.price);
      setElectricPrice(chosenRoom.electricUnitPrice || 3800);
      setWaterPrice(chosenRoom.waterUnitPrice || 20000);
    }
  };

  // Calculate end date based on start date and duration
  const calculateEndDate = (start: string, months: number): string => {
    try {
      const d = new Date(start);
      d.setMonth(d.getMonth() + months);
      return d.toISOString().split('T')[0]!;
    } catch {
      return '';
    }
  };

  const endDate = calculateEndDate(startDate, durationMonths);
  const generatedContractId = `CT-2026-${roomCode.replace(/\D/g, '') || '01'}`;

  // Initial payment calculation
  const totalInitialPayment = monthlyRent + depositAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenantName.trim()) {
      error('Thiếu thông tin', 'Vui lòng nhập họ và tên người thuê.');
      return;
    }

    if (!tenantPhone.trim()) {
      error('Thiếu thông tin', 'Vui lòng nhập số điện thoại người thuê.');
      return;
    }

    if (!idCard.trim()) {
      error('Thiếu thông tin', 'Vui lòng nhập số CCCD của người đại diện hợp đồng.');
      return;
    }

    const newContract: ContractItem = {
      id: generatedContractId,
      roomCode,
      tenantName: tenantName.trim(),
      tenantPhone: tenantPhone.trim(),
      startDate,
      endDate,
      depositAmount,
      monthlyRent,
      paymentCycle,
      status: 'active',
    };

    // Add to mock contracts collection
    mockContracts.unshift(newContract);

    // Update room status to occupied
    const targetRoom = mockRooms.find((r) => r.code === roomCode);
    if (targetRoom) {
      targetRoom.status = 'occupied';
      targetRoom.tenantName = tenantName.trim();
      targetRoom.tenantPhone = tenantPhone.trim();
      targetRoom.leaseEnd = endDate;
      targetRoom.price = monthlyRent;
    }

    success(
      'Tạo hợp đồng thành công!',
      `Hợp đồng ${newContract.id} cho phòng ${roomCode} (${tenantName}) đã được lập và có hiệu lực từ ngày ${startDate}.`
    );

    navigate(`/contracts/${newContract.id}`);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/contracts"
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
            <ArrowLeft size={14} /> Quay lại danh sách hợp đồng
          </Link>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: 0 }}>
            Tạo mới hợp đồng thuê phòng
          </h1>
        </div>

        <div style={{ fontSize: '13px', color: '#6B7280' }}>
          Mã dự kiến: <strong style={{ color: '#00594C' }}>{generatedContractId}</strong>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 1: Thông tin phòng thuê */}
          <div className="rf-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#E8F5E9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00594C',
                }}
              >
                <Building2 size={18} />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
                1. Thông tin cơ sở & Phòng cho thuê
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Dãy trọ / Tòa nhà *
                </label>
                <select
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  {mockProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.address})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Chọn phòng cho thuê *
                </label>
                <select
                  value={roomCode}
                  onChange={(e) => handleRoomChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                    fontWeight: 700,
                    color: '#00594C',
                  }}
                >
                  {availableRooms.map((r) => (
                    <option key={r.id} value={r.code}>
                      Phòng {r.code} - Tầng {r.floor} ({r.type}, {formatVND(r.price)}/tháng) - {r.status === 'vacant' ? 'Đang trống' : 'Có người ở'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Thông tin khách thuê đại diện */}
          <div className="rf-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1D4ED8',
                }}
              >
                <User size={18} />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
                2. Thông tin khách thuê đại diện hợp đồng
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Họ và tên người thuê *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Lê Hoàng Nam"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Số điện thoại liên hệ *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ví dụ: 0901234567"
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Số CCCD / CMND *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 079201004123"
                    value={idCard}
                    onChange={(e) => setIdCard(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Ngày cấp CCCD
                  </label>
                  <input
                    type="date"
                    value={idIssueDate}
                    onChange={(e) => setIdIssueDate(e.target.value)}
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Nơi cấp CCCD
                  </label>
                  <input
                    type="text"
                    value={idIssuePlace}
                    onChange={(e) => setIdIssuePlace(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Địa chỉ thường trú (theo CCCD / Hộ khẩu)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Số 45, Đường 12, P. Linh Trung, TP. Thủ Đức, TP.HCM"
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Thời hạn thuê & Tài chính */}
          <div className="rf-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#B45309',
                }}
              >
                <Calendar size={18} />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
                3. Thời hạn thuê & Điều khoản tài chính
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Duration Buttons */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Thời hạn hợp đồng
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[3, 6, 12, 24].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDurationMonths(m)}
                      style={{
                        flex: 1,
                        padding: '9px 0',
                        borderRadius: '6px',
                        border: durationMonths === m ? '2px solid #00594C' : '1px solid #D1D5DB',
                        backgroundColor: durationMonths === m ? '#E8F5E9' : '#FFFFFF',
                        color: durationMonths === m ? '#00594C' : '#374151',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      {m} tháng
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Ngày bắt đầu thuê *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Ngày kết thúc hợp đồng (Tự động tính)
                  </label>
                  <input
                    type="date"
                    readOnly
                    value={endDate}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                      backgroundColor: '#F3F4F6',
                      fontWeight: 700,
                      color: '#00594C',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Tiền thuê phòng hàng tháng (VND) *
                  </label>
                  <input
                    type="number"
                    step="50000"
                    required
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#00594C',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Tiền đặt cọc giữ chỗ (VND) *
                  </label>
                  <input
                    type="number"
                    step="50000"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#137333',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Kỳ hạn thanh toán
                  </label>
                  <select
                    value={paymentCycle}
                    onChange={(e) => setPaymentCycle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="Hàng tháng (mùng 1 - mùng 5)">Hàng tháng (mùng 1 - mùng 5)</option>
                    <option value="Hàng tháng (ngày 15 - ngày 20)">Hàng tháng (ngày 15 - ngày 20)</option>
                    <option value="3 tháng / lần">3 tháng / lần</option>
                    <option value="6 tháng / lần">6 tháng / lần</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Phương thức thanh toán ưu tiên
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="Chuyển khoản VietQR">Chuyển khoản VietQR (Tự động nhận diện)</option>
                    <option value="Tiền mặt">Thu tiền mặt trực tiếp</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Đơn giá điện nước & Chỉ số bàn giao ban đầu */}
          <div className="rf-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#F3E8FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7E22CE',
                }}
              >
                <Zap size={18} />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
                4. Đơn giá điện nước & Chỉ số công tơ ban đầu
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Đơn giá điện (đ/kWh)
                </label>
                <input
                  type="number"
                  value={electricPrice}
                  onChange={(e) => setElectricPrice(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Đơn giá nước (đ/m³)
                </label>
                <input
                  type="number"
                  value={waterPrice}
                  onChange={(e) => setWaterPrice(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Phí dịch vụ rác/wifi (đ/tháng)
                </label>
                <input
                  type="number"
                  value={serviceFee}
                  onChange={(e) => setServiceFee(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#B45309', marginBottom: '6px' }}>
                  ⚡ Chỉ số điện công tơ ban đầu (kWh)
                </label>
                <input
                  type="number"
                  value={initialElectric}
                  onChange={(e) => setInitialElectric(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #FCD34D',
                    backgroundColor: '#FFFBEB',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0369A1', marginBottom: '6px' }}>
                  💧 Chỉ số nước đồng hồ ban đầu (m³)
                </label>
                <input
                  type="number"
                  value={initialWater}
                  onChange={(e) => setInitialWater(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #BAE6FD',
                    backgroundColor: '#F0F9FF',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Điều khoản & Cam kết */}
          <div className="rf-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#E8F5E9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00594C',
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
                5. Cam kết quy định & Điều khoản bổ sung
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#374151' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreeRules}
                  onChange={(e) => setAgreeRules(e.target.checked)}
                />
                <span>Khách thuê cam kết nộp đầy đủ CCCD để đăng ký tạm trú với Công an khu vực.</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreePCCC}
                  onChange={(e) => setAgreePCCC(e.target.checked)}
                />
                <span>Tuân thủ an toàn PCCC, không sạc xe máy điện qua đêm không người trông coi, giữ trật tự sau 23h.</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreeNotice30Days}
                  onChange={(e) => setAgreeNotice30Days(e.target.checked)}
                />
                <span>Cam kết thông báo trước tối thiểu 30 ngày khi có ý định kết thúc hợp đồng để được hoàn trả tiền cọc.</span>
              </label>

              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Ghi chú điều khoản bổ sung
                </label>
                <textarea
                  rows={2}
                  value={additionalTerms}
                  onChange={(e) => setAdditionalTerms(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Contract Summary & Confirmation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '20px' }}>
          <div
            className="rf-card"
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #00594C',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#00594C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tóm tắt hợp đồng
              </span>
              <span className="rf-badge rf-badge-active">DỰ THẢO MỚI</span>
            </div>

            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>
                {generatedContractId}
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                Phòng {roomCode} • {selectedProperty?.name}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', borderTop: '1px solid #E5E7EB', paddingTop: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Khách đại diện:</span>
                <strong style={{ color: '#111827' }}>{tenantName || '(Chưa nhập)'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Điện thoại:</span>
                <span>{tenantPhone || '(Chưa nhập)'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Số CCCD:</span>
                <span>{idCard || '(Chưa nhập)'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Thời hạn thuê:</span>
                <span>{durationMonths} tháng</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Từ ngày:</span>
                <span>{startDate} → {endDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Tiền thuê phòng:</span>
                <strong style={{ color: '#00594C' }}>{formatVND(monthlyRent)}/tháng</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Tiền cọc giữ chỗ:</span>
                <strong style={{ color: '#137333' }}>{formatVND(depositAmount)}</strong>
              </div>
            </div>

            {/* Total initial collection */}
            <div
              style={{
                backgroundColor: '#F0FDF4',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #86EFAC',
                marginTop: '4px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                Tổng thu đợt 1 khi ký hợp đồng:
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#00594C', marginTop: '2px' }}>
                {formatVND(totalInitialPayment)}
              </div>
              <div style={{ fontSize: '11px', color: '#4B5563', marginTop: '4px' }}>
                (Bao gồm: {formatVND(depositAmount)} cọc + {formatVND(monthlyRent)} tiền phòng tháng đầu)
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <button
                type="submit"
                className="rf-btn rf-btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle2 size={16} />
                <span>Xác nhận tạo & Lưu hợp đồng</span>
              </button>

              <button
                type="button"
                className="rf-btn rf-btn-secondary"
                onClick={() => navigate('/contracts')}
                style={{ width: '100%', padding: '10px', fontSize: '13px' }}
              >
                Hủy bỏ
              </button>
            </div>
          </div>

          <div
            style={{
              padding: '14px 16px',
              backgroundColor: '#EFF6FF',
              borderRadius: '8px',
              border: '1px solid #BFDBFE',
              fontSize: '12px',
              color: '#1E40AF',
              display: 'flex',
              gap: '8px',
              lineHeight: 1.5,
            }}
          >
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              Sau khi lưu, hợp đồng sẽ có hiệu lực ngay trong hệ thống và bạn có thể in biên bản bàn giao, tải file PDF hoặc gửi hợp đồng qua Zalo cho khách.
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};
