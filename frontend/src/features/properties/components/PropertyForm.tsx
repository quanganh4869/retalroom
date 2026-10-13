import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/feedback/Alert';
import { PropertyFormValues, propertySchema } from '@/features/properties/schemas/propertySchema';
import { useCreateProperty } from '@/features/properties/hooks/useProperties';

interface PropertyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ onSuccess, onCancel }) => {
  const { mutateAsync: createProp, isPending } = useCreateProperty();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
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

  const onSubmit = async (values: PropertyFormValues) => {
    setServerError(null);
    try {
      await createProp(values);
      reset();
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred while saving property.');
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        marginBottom: '24px',
      }}
    >
      <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>Add New Property</h3>

      {serverError && <Alert type="error" message={serverError} />}

      <Input
        label="Property Name *"
        placeholder="e.g. Sunrise Apartments"
        {...register('name')}
        error={errors.name?.message}
      />

      <Input
        label="Street Address *"
        placeholder="e.g. 123 Nguyen Trai Street"
        {...register('address')}
        error={errors.address?.message}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Input
          label="City *"
          placeholder="e.g. Hanoi"
          {...register('city')}
          error={errors.city?.message}
        />

        <Input
          label="Total Floors *"
          type="number"
          placeholder="e.g. 5"
          {...register('total_floors')}
          error={errors.total_floors?.message}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
        <label
          htmlFor="description"
          style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}
        >
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Optional notes or property amenities..."
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '14px',
            outline: 'none',
          }}
          {...register('description')}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isPending}>
          Save Property
        </Button>
      </div>
    </form>
  );
};
