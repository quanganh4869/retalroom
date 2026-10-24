import React from 'react';

export interface PropertyFlowNavProps {
  activeStep?: 'properties' | 'rooms' | 'tenants' | 'contracts';
  propertyId?: string;
  propertyName?: string;
}

export const PropertyFlowNav: React.FC<PropertyFlowNavProps> = () => {
  return null;
};

