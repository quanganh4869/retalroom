import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  DoorOpen,
  DollarSign,
  Zap,
  Droplets,
  Layers,
  Maximize2,
  Users,
  CheckCircle2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { mockProperties, mockRooms, formatVND, RoomItem } from '@/lib/mockData';
import { useToast } from '@/components/feedback/ToastSystem';

export const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const defaultPropertyId = searchParams.get('propertyId') || mockProperties[0]?.id || 'prop-1';

  // Mode: single room or batch create
  const [createMode, setCreateMode] = useState<'single' | 'batch'>('single');

  // Single Room Form State
  const [propertyId, setPropertyId] = useState<string>(defaultPropertyId);
  const [roomCode, setRoomCode] = useState<string>('P.401');
  const [floor, setFloor] = useState<number>(4);
  const [roomType, setRoomType] = useState<string>('Studio');
  const [area, setArea] = useState<number>(25);
  const [price, setPrice] = useState<number>(3800000);
  const [maxOccupants, setMaxOccupants] = useState<number>(2);
  const [electricUnitPrice, setElectricUnitPrice] = useState<number>(3800);
  const [waterUnitPrice, setWaterUnitPrice] = useState<number>(20000);
  const [status, setStatus] = useState<RoomItem['status']>('vacant');
  const [notes, setNotes] = useState<string>('Đầy đủ điều hòa, nóng lạnh, ban công riêng thoáng mát.');

  // Amenities checklist
  const [amenities, setAmenities] = useState<string[]>([
    'Điều hòa không khí',
    'Bình nóng lạnh',
    'Tủ quần áo gỗ',
    'Ban công / Cửa sổ lớn',
    'Khóa từ vân tay',
  ]);

  // Batch Form State
  const [batchPrefix, setBatchPrefix] = useState<string>('P.');
  const [batchFloor, setBatchFloor] = useState<number>(4);
  const [batchStartNumber, setBatchStartNumber] = useState<number>(401);
  const [batchCount, setBatchCount] = useState<number>(5);
  const [batchType, setBatchType] = useState<string>('1PN');
  const [batchArea, setBatchArea] = useState<number>(28);
  const [batchPrice, setBatchPrice] = useState<number>(4200000);
  const [batchMaxOccupants, setBatchMaxOccupants] = useState<number>(3);
  const [batchElectricRate, setBatchElectricRate] = useState<number>(3800);
  const [batchWaterRate, setBatchWaterRate] = useState<number>(20000);

  const selectedProperty = mockProperties.find((p) => p.id === propertyId);

  const availableAmenitiesList = [
    'Điều hòa không khí',
    'Bình nóng lạnh',
    'Tủ lạnh inverter',
    'Máy giặt riêng',
    'Kệ bếp nấu ăn',
    'Giường & Nệm cao su',
    'Tủ quần áo gỗ',
    'Ban công / Cửa sổ lớn',
    'Bàn làm việc & Ghế',
    'Khóa từ vân tay',
    'Wifi tốc độ cao',
    'Camera an ninh tầng',
  ];

  const toggleAmenity = (item: string) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter((a) => a !== item));
    } else {
      setAmenities([...amenities, item]);
    }
  };

  const handleCreateSingle = (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomCode.trim()) {
      toast.error('Thiếu mã phòng', 'Vui lòng nhập mã phòng hợp lệ (ví dụ: P.401).');
      return;
    }

    // Check duplicate code in same property
    const isExisted = mockRooms.some(
      (r) => r.propertyId === propertyId && r.code.toLowerCase() === roomCode.trim().toLowerCase()
    );
    if (isExisted) {
      toast.warning('Trùng mã phòng', `Mã phòng ${roomCode} đã tồn tại trong ${selectedProperty?.name || 'cơ sở này'}.`);
      return;
    }

    const newRoom: RoomItem = {
      id: `room-${Date.now()}`,
      code: roomCode.trim(),
      propertyId,
      propertyName: selectedProperty?.name || 'Khu trọ RentFlow',
      floor,
      type: roomType,
      area,
      price,
      status,
      maxOccupants,
      electricUnitPrice,
      waterUnitPrice,
      debt: 0,
      occupants: [],
    };

    mockRooms.unshift(newRoom);

    toast.success(
      `Tạo phòng ${newRoom.code} thành công!`,
      `Đã thêm vào cơ sở ${newRoom.propertyName} với đơn giá ${formatVND(newRoom.price)}/tháng.`
    );

    navigate(`/rooms/${newRoom.id}`);
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();

    if (batchCount < 1 || batchCount > 30) {
      toast.error('Số lượng không hợp lệ', 'Chỉ được tạo từ 1 đến 30 phòng mỗi đợt.');
      return;
    }

    const createdRooms: RoomItem[] = [];
    for (let i = 0; i < batchCount; i++) {
      const roomNum = batchStartNumber + i;
      const code = `${batchPrefix}${roomNum}`;

      // Check if already exist
      if (!mockRooms.some((r) => r.propertyId === propertyId && r.code === code)) {
        const item: RoomItem = {
          id: `room-batch-${Date.now()}-${i}`,
          code,
          propertyId,
          propertyName: selectedProperty?.name || 'Khu trọ RentFlow',
          floor: batchFloor,
          type: batchType,
          area: batchArea,
          price: batchPrice,
          status: 'vacant',
          maxOccupants: batchMaxOccupants,
          electricUnitPrice: batchElectricRate,
          waterUnitPrice: batchWaterRate,
          debt: 0,
          occupants: [],
        };
        createdRooms.push(item);
        mockRooms.unshift(item);
      }
    }

    toast.success(
      `Đã tạo hàng loạt ${createdRooms.length} phòng!`,
      `Các phòng từ ${batchPrefix}${batchStartNumber} đến ${batchPrefix}${batchStartNumber + batchCount - 1} đã sẵn sàng trong ${selectedProperty?.name}.`
    );

    navigate('/rooms');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      {/* Top Header & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="rf-btn rf-btn-secondary"
            onClick={() => navigate('/rooms')}
            style={{ padding: '6px 12px' }}
          >
            <ArrowLeft size={15} />
            <span>Danh sách phòng</span>
          </button>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Thêm phòng cho thuê mới
            </h1>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '2px 0 0 0' }}>
              Khởi tạo phòng lẻ hoặc sinh dải số phòng hàng loạt cho tòa nhà / dãy trọ.
            </p>
          </div>
        </div>

        {/* Mode Selector Pill */}
        <div style={{ display: 'flex', backgroundColor: '#F3F4F6', padding: '3px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
          <button
            type="button"
            onClick={() => setCreateMode('single')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: createMode === 'single' ? '#FFFFFF' : 'transparent',
              color: createMode === 'single' ? '#00594C' : '#6B7280',
              boxShadow: createMode === 'single' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Thêm 1 phòng lẻ
          </button>
          <button
            type="button"
            onClick={() => setCreateMode('batch')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: createMode === 'batch' ? '#FFFFFF' : 'transparent',
              color: createMode === 'batch' ? '#00594C' : '#6B7280',
              boxShadow: createMode === 'batch' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Sinh hàng loạt dãy phòng
          </button>
        </div>
      </div>

      {/* Target Property Card */}
      <div
        className="rf-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#ECFDF5',
              color: '#00594C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building2 size={20} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
              Chọn dãy trọ / Tòa nhà áp dụng *
            </label>
            <div style={{ marginTop: '4px' }}>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#111827',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  backgroundColor: '#F9FAFB',
                  cursor: 'pointer',
                  minWidth: '280px',
                }}
              >
                {mockProperties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.address})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', fontSize: '12px', color: '#6B7280' }}>
          <div>Địa chỉ: <strong style={{ color: '#374151' }}>{selectedProperty?.address}</strong></div>
          <div>Quản lý: <strong style={{ color: '#00594C' }}>{selectedProperty?.manager}</strong></div>
        </div>
      </div>

      {createMode === 'single' ? (
        /* ================= SINGLE ROOM FORM ================= */
        <form onSubmit={handleCreateSingle} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 1: Basic Info */}
          <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F3F4F6', paddingBottom: '10px' }}>
              <DoorOpen size={18} color="#00594C" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                1. Thông tin định danh & Kết cấu phòng
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Mã / Số phòng *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: P.401, P.A12"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Tầng lầu *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <Layers size={15} color="#9CA3AF" style={{ position: 'absolute', left: '10px' }} />
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={floor}
                    onChange={(e) => setFloor(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Loại phòng *
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="Studio">Studio tiện nghi</option>
                  <option value="1PN">1 Phòng ngủ (1PN)</option>
                  <option value="2PN">2 Phòng ngủ (2PN)</option>
                  <option value="Duplex">Duplex có gác lửng</option>
                  <option value="Ký túc xá">Giường tầng Ký túc xá</option>
                  <option value="Mặt bằng">Mặt bằng kinh doanh</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Diện tích (m²) *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <Maximize2 size={15} color="#9CA3AF" style={{ position: 'absolute', left: '10px' }} />
                  <input
                    type="number"
                    min={5}
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Số người ở tối đa cho phép *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <Users size={15} color="#9CA3AF" style={{ position: 'absolute', left: '10px' }} />
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={maxOccupants}
                    onChange={(e) => setMaxOccupants(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Trạng thái bàn giao ban đầu *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as RoomItem['status'])}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="vacant">Phòng trống (Sẵn sàng cho thuê)</option>
                  <option value="maintenance">Đang sửa chữa / Hoàn thiện</option>
                  <option value="reserved">Đã có khách giữ cọc</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Utilities */}
          <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F3F4F6', paddingBottom: '10px' }}>
              <DollarSign size={18} color="#00594C" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                2. Đơn giá thuê phòng & Biểu phí điện nước
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Giá thuê niêm yết (VNĐ/tháng) *
                </label>
                <input
                  type="number"
                  step={50000}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#00594C',
                  }}
                  required
                />
                <span style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                  = {formatVND(price)} / tháng
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Đơn giá Điện (VNĐ / kWh) *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <Zap size={15} color="#F59E0B" style={{ position: 'absolute', left: '10px' }} />
                  <input
                    type="number"
                    step={100}
                    value={electricUnitPrice}
                    onChange={(e) => setElectricUnitPrice(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                    }}
                    required
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                  Mặc định tòa nhà: 3.800 đ/kWh
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Đơn giá Nước (VNĐ / m³) *
                </label>
                <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                  <Droplets size={15} color="#3B82F6" style={{ position: 'absolute', left: '10px' }} />
                  <input
                    type="number"
                    step={1000}
                    value={waterUnitPrice}
                    onChange={(e) => setWaterUnitPrice(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      borderRadius: '6px',
                      border: '1px solid #D1D5DB',
                      fontSize: '13px',
                    }}
                    required
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', display: 'block' }}>
                  Mặc định tòa nhà: 20.000 đ/m³
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Amenities & Notes */}
          <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F3F4F6', paddingBottom: '10px' }}>
              <Sparkles size={18} color="#00594C" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                3. Tiện nghi phòng & Ghi chú bàn giao
              </h3>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Trang thiết bị sẵn có trong phòng:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {availableAmenitiesList.map((item) => {
                  const isChecked = amenities.includes(item);
                  return (
                    <div
                      key={item}
                      onClick={() => toggleAmenity(item)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: isChecked ? '1px solid #00594C' : '1px solid #E5E7EB',
                        backgroundColor: isChecked ? '#ECFDF5' : '#FFFFFF',
                        color: isChecked ? '#00594C' : '#4B5563',
                        fontSize: '12px',
                        fontWeight: isChecked ? 600 : 400,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        userSelect: 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Controlled by parent div
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Mô tả chi tiết & Ghi chú quản lý
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Phòng góc hướng Đông Nam thoáng mát, ban công phơi đồ riêng..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13px',
                  lineHeight: 1.5,
                }}
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => navigate('/rooms')}
            >
              Hủy bỏ
            </button>
            <button type="submit" className="rf-btn rf-btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>
              <CheckCircle2 size={16} />
              <span>Xác nhận tạo phòng</span>
            </button>
          </div>
        </form>
      ) : (
        /* ================= BATCH CREATE FORM ================= */
        <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="rf-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F3F4F6', paddingBottom: '10px' }}>
              <Sliders size={18} color="#00594C" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: 0 }}>
                Thiết lập quy luật sinh số phòng tự động
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Tiền tố ký tự *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: P. hoặc P"
                  value={batchPrefix}
                  onChange={(e) => setBatchPrefix(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Thuộc tầng lầu *
                </label>
                <input
                  type="number"
                  min={1}
                  value={batchFloor}
                  onChange={(e) => setBatchFloor(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Số phòng bắt đầu *
                </label>
                <input
                  type="number"
                  min={1}
                  value={batchStartNumber}
                  onChange={(e) => setBatchStartNumber(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Số lượng phòng tạo *
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={batchCount}
                  onChange={(e) => setBatchCount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                  required
                />
              </div>
            </div>

            {/* Preview Box */}
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: '#F0FDF4',
                borderRadius: '8px',
                border: '1px solid #BBF7D0',
                fontSize: '13px',
                color: '#166534',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <CheckCircle2 size={16} />
              <div>
                Dải số phòng sẽ sinh ra ({batchCount} phòng):{' '}
                <strong>
                  {Array.from({ length: Math.min(batchCount, 8) })
                    .map((_, i) => `${batchPrefix}${batchStartNumber + i}`)
                    .join(', ')}
                  {batchCount > 8 ? ` ... đến ${batchPrefix}${batchStartNumber + batchCount - 1}` : ''}
                </strong>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '6px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Loại phòng hàng loạt
                </label>
                <select
                  value={batchType}
                  onChange={(e) => setBatchType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                >
                  <option value="Studio">Studio</option>
                  <option value="1PN">1 Phòng ngủ (1PN)</option>
                  <option value="2PN">2 Phòng ngủ (2PN)</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Ký túc xá">Ký túc xá</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Diện tích mỗi phòng (m²)
                </label>
                <input
                  type="number"
                  min={5}
                  value={batchArea}
                  onChange={(e) => setBatchArea(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Đơn giá thuê (VNĐ/tháng)
                </label>
                <input
                  type="number"
                  step={50000}
                  value={batchPrice}
                  onChange={(e) => setBatchPrice(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#00594C',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Số người ở tối đa/phòng
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={batchMaxOccupants}
                  onChange={(e) => setBatchMaxOccupants(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Đơn giá Điện áp dụng (VNĐ/kWh)
                </label>
                <input
                  type="number"
                  step={100}
                  value={batchElectricRate}
                  onChange={(e) => setBatchElectricRate(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Đơn giá Nước áp dụng (VNĐ/m³)
                </label>
                <input
                  type="number"
                  step={1000}
                  value={batchWaterRate}
                  onChange={(e) => setBatchWaterRate(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    fontSize: '13px',
                  }}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="rf-btn rf-btn-secondary"
              onClick={() => navigate('/rooms')}
            >
              Hủy bỏ
            </button>
            <button type="submit" className="rf-btn rf-btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>
              <CheckCircle2 size={16} />
              <span>Khởi tạo {batchCount} phòng ngay</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
