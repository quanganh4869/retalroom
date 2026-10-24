import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Minus, Plus, Building2, MapPin, Layers, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/feedback/Alert';
import { PropertyFormValues, propertySchema } from '@/features/properties/schemas/propertySchema';
import { useCreateProperty } from '@/features/properties/hooks/useProperties';

interface PropertyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const VIETNAM_PROVINCES = [
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Bình Dương',
  'Đồng Nai',
  'Cần Thơ',
  'Hải Phòng',
  'Bà Rịa - Vũng Tàu',
  'Khánh Hòa',
  'Lâm Đồng',
  'Thừa Thiên Huế',
  'Quảng Nam',
  'Kiên Giang',
  'Bắc Ninh',
  'Hải Dương',
  'Hưng Yên',
  'Nam Định',
  'Thái Nguyên',
  'Vĩnh Phúc',
  'Quảng Ninh',
  'Thanh Hóa',
  'Nghệ An',
  'Bình Định',
  'Đắk Lắk',
  'Long An',
  'Tiền Giang',
  'An Giang',
  'Bình Phước',
  'Tây Ninh',
  'Khác',
];

export const PropertyForm: React.FC<PropertyFormProps> = ({ onSuccess, onCancel }) => {
  const { mutateAsync: createProp, isPending } = useCreateProperty();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [confirmError, setConfirmError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      total_floors: 1,
      description: '',
    },
  });

  const totalFloors = watch('total_floors') || 1;

  const handleDecreaseFloors = () => {
    if (totalFloors > 1) {
      setValue('total_floors', totalFloors - 1, { shouldValidate: true });
    }
  };

  const handleIncreaseFloors = () => {
    if (totalFloors < 150) {
      setValue('total_floors', totalFloors + 1, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: PropertyFormValues) => {
    if (!isConfirmed) {
      setConfirmError('Vui lòng đánh dấu vào ô xác nhận thông tin cơ sở trước khi thực hiện.');
      return;
    }
    setConfirmError(null);
    setServerError(null);
    try {
      await createProp(values);
      reset();
      setIsConfirmed(false);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Đã xảy ra lỗi khi lưu thông tin tòa nhà. Vui lòng thử lại.');
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    if (!isConfirmed) {
      setConfirmError('Vui lòng đánh dấu vào ô xác nhận thông tin cơ sở trước khi thực hiện.');
    } else {
      setConfirmError(null);
    }
    handleSubmit(onSubmit)(e);
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      style={{
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
        <Building2 size={20} color="#00594C" />
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
          Thêm cơ sở / Tòa nhà mới
        </h3>
      </div>

      {serverError && <Alert type="error" message={serverError} />}

      <Input
        label="Tên cơ sở / Tòa nhà *"
        placeholder="VD: Căn hộ Sunshine, Nhà trọ Hưng Phát..."
        {...register('name')}
        error={errors.name?.message}
      />

      <Input
        label="Địa chỉ cơ sở *"
        placeholder="VD: 123/4 Lê Văn Sỹ, Phường 13, Quận 3"
        {...register('address')}
        error={errors.address?.message}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* City Dropdown List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            htmlFor="city-select"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <MapPin size={13} color="#00594C" /> Tỉnh / Thành phố *
          </label>
          <select
            id="city-select"
            {...register('city')}
            style={{
              padding: '9px 12px',
              borderRadius: '6px',
              border: `1px solid ${errors.city ? '#ef4444' : '#cbd5e1'}`,
              fontSize: '14px',
              outline: 'none',
              backgroundColor: '#ffffff',
              color: '#1e293b',
              height: '42px',
              transition: 'border-color 0.15s ease',
            }}
          >
            <option value="">-- Chọn tỉnh / thành phố --</option>
            {VIETNAM_PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
          {errors.city?.message && (
            <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>
              {errors.city.message}
            </span>
          )}
        </div>

        {/* Total Floors with Stepper Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label
            htmlFor="total-floors-input"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Layers size={13} color="#00594C" /> Số tầng *
          </label>
          <div style={{ display: 'flex', alignItems: 'center', height: '42px' }}>
            <button
              type="button"
              onClick={handleDecreaseFloors}
              disabled={totalFloors <= 1}
              style={{
                width: '44px',
                height: '42px',
                border: '1px solid #cbd5e1',
                borderRight: 'none',
                borderRadius: '6px 0 0 6px',
                backgroundColor: totalFloors <= 1 ? '#f8fafc' : '#f1f5f9',
                cursor: totalFloors <= 1 ? 'not-allowed' : 'pointer',
                color: totalFloors <= 1 ? '#94a3b8' : '#00594C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              title="Giảm 1 tầng"
            >
              <Minus size={16} />
            </button>
            <input
              id="total-floors-input"
              type="number"
              min={1}
              max={150}
              {...register('total_floors', { valueAsNumber: true })}
              style={{
                width: '80px',
                height: '42px',
                textAlign: 'center',
                border: `1px solid ${errors.total_floors ? '#ef4444' : '#cbd5e1'}`,
                fontSize: '15px',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
                borderRadius: 0,
              }}
            />
            <button
              type="button"
              onClick={handleIncreaseFloors}
              disabled={totalFloors >= 150}
              style={{
                width: '44px',
                height: '42px',
                border: '1px solid #cbd5e1',
                borderLeft: 'none',
                borderRadius: '0 6px 6px 0',
                backgroundColor: totalFloors >= 150 ? '#f8fafc' : '#f1f5f9',
                cursor: totalFloors >= 150 ? 'not-allowed' : 'pointer',
                color: totalFloors >= 150 ? '#94a3b8' : '#00594C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              title="Tăng 1 tầng"
            >
              <Plus size={16} />
            </button>
            <span style={{ marginLeft: '12px', fontSize: '13px', color: '#64748b' }}>
              tầng
            </span>
          </div>
          {errors.total_floors?.message && (
            <span style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>
              {errors.total_floors.message}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
        <label
          htmlFor="description"
          style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}
        >
          Ghi chú / Mô tả cơ sở
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Ghi chú thêm về cơ sở, tiện ích chung, thang máy, bãi giữ xe... (tùy chọn)"
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '14px',
            outline: 'none',
            fontFamily: 'inherit',
          }}
          {...register('description')}
        />
      </div>

      {/* Ô xác nhận thông tin cơ sở */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '16px 18px',
          backgroundColor: isConfirmed ? '#F0FDF4' : '#F8FAFC',
          borderRadius: '8px',
          border: confirmError
            ? '2px solid #EF4444'
            : isConfirmed
            ? '2px solid #16A34A'
            : '1.5px solid #CBD5E1',
          marginBottom: '20px',
          transition: 'all 0.18s ease',
        }}
      >
        <input
          type="checkbox"
          id="confirm-create-property"
          checked={isConfirmed}
          onChange={(e) => {
            setIsConfirmed(e.target.checked);
            if (e.target.checked) setConfirmError(null);
          }}
          style={{
            marginTop: '3px',
            width: '20px',
            height: '20px',
            accentColor: '#00594C',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                backgroundColor: isConfirmed ? '#DCFCE7' : '#E2E8F0',
                color: isConfirmed ? '#166534' : '#475569',
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.5px',
              }}
            >
              Ô xác nhận
            </span>
            <label
              htmlFor="confirm-create-property"
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: isConfirmed ? '#166534' : '#1E293B',
                cursor: 'pointer',
                userSelect: 'none',
                lineHeight: 1.4,
              }}
            >
              Tôi xác nhận các thông tin cơ sở / tòa nhà trên là chính xác và đồng ý lưu vào hệ thống RentFlow.
            </label>
          </div>
          <span style={{ fontSize: '12px', color: isConfirmed ? '#15803D' : '#64748B' }}>
            Hệ thống sẽ thiết lập cơ sở dữ liệu để bạn tiến hành phân tầng, thêm phòng và quản lý hợp đồng.
          </span>
          {confirmError && (
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#EF4444', marginTop: '4px' }}>
              ⚠️ {confirmError}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isPending}
            style={{ padding: '10px 18px', fontSize: '14px', fontWeight: 500 }}
          >
            Hủy bỏ
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isPending}
          title="Nút xác nhận lưu cơ sở"
          style={{
            backgroundColor: '#00594C',
            color: '#FFFFFF',
            borderColor: '#00594C',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: '0 2px 4px rgba(0, 89, 76, 0.25)',
          }}
        >
          <CheckCircle2 size={16} />
          Xác nhận lưu cơ sở
        </Button>
      </div>
    </form>
  );
};
