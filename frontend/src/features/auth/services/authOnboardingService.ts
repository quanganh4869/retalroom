import { apiClient } from '@/shared/api/client';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: 'ADMIN' | 'LANDLORD' | 'TENANT' | null;
  status: string;
  avatarUrl?: string;
  provider: string;
  onboardingStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  onboardingStep?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: UserProfile;
}

export interface OnboardingStatusResponse {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  step: string;
  role: 'ADMIN' | 'LANDLORD' | 'TENANT' | null;
  profile: UserProfile;
  propertyId?: string;
  propertyName?: string;
  roomId?: string;
  roomNumber?: string;
  inviteCode?: string;
  accessToken?: string;
}

export interface InvitationDetails {
  invitationId: string;
  inviteCode: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  roomId?: string;
  roomNumber?: string;
  landlordName: string;
  expiresAt: string;
  valid: boolean;
}

export const authService = {
  loginWithGoogle: async (idToken: string): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/api/v1/auth/google', {
      method: 'POST',
      body: { idToken },
    });
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    return apiClient<UserProfile>('/api/v1/auth/me', {
      method: 'GET',
    });
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    return apiClient<AuthResponse>('/api/v1/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    });
  },

  logout: async (refreshToken?: string): Promise<void> => {
    try {
      await apiClient<void>('/api/v1/auth/logout', {
        method: 'POST',
        body: { refreshToken },
      });
    } catch (e) {
      // Ignore network errors on logout
    }
  },
};

export const onboardingService = {
  getStatus: async (): Promise<OnboardingStatusResponse> => {
    return apiClient<OnboardingStatusResponse>('/api/v1/onboarding/status', {
      method: 'GET',
    });
  },

  selectRole: async (role: 'LANDLORD' | 'TENANT'): Promise<OnboardingStatusResponse> => {
    return apiClient<OnboardingStatusResponse>('/api/v1/onboarding/role', {
      method: 'POST',
      body: { role },
    });
  },

  updateProfile: async (data: { fullName: string; phoneNumber?: string }): Promise<OnboardingStatusResponse> => {
    return apiClient<OnboardingStatusResponse>('/api/v1/onboarding/profile', {
      method: 'POST',
      body: data,
    });
  },

  // Landlord steps
  setupLandlordProperty: async (data: {
    name: string;
    address: string;
    city?: string;
    totalFloors?: number;
    description?: string;
  }): Promise<OnboardingStatusResponse> => {
    return apiClient<OnboardingStatusResponse>('/api/v1/onboarding/landlord/property', {
      method: 'POST',
      body: data,
    });
  },

  setupLandlordManagementConfig: async (data: {
    propertyId: string;
    billingDay: number;
    paymentCycle: string;
  }): Promise<OnboardingStatusResponse> => {
    return apiClient<OnboardingStatusResponse>('/api/v1/onboarding/landlord/management-config', {
      method: 'POST',
      body: data,
    });
  },

  setupLandlordFirstRoom: async (data: {
    propertyId: string;
    roomNumber: string;
    floor: number;
    basePrice: number;
    areaSqm?: number;
  }): Promise<OnboardingStatusResponse> => {
    return apiClient<OnboardingStatusResponse>('/api/v1/onboarding/landlord/first-room', {
      method: 'POST',
      body: data,
    });
  },

  completeLandlord: async (): Promise<OnboardingStatusResponse> => {
    return apiClient<OnboardingStatusResponse>('/api/v1/onboarding/landlord/complete', {
      method: 'POST',
    });
  },

  // Tenant steps
  getInviteDetails: async (code: string): Promise<InvitationDetails> => {
    return apiClient<InvitationDetails>('/api/v1/onboarding/tenant/invite-details', {
      method: 'GET',
      params: { code },
    });
  },

  acceptInvite: async (inviteCode: string): Promise<OnboardingStatusResponse> => {
    return apiClient<OnboardingStatusResponse>('/api/v1/onboarding/tenant/accept-invite', {
      method: 'POST',
      body: { inviteCode },
    });
  },

  skipInvite: async (): Promise<OnboardingStatusResponse> => {
    return apiClient<OnboardingStatusResponse>('/api/v1/onboarding/tenant/skip-invite', {
      method: 'POST',
    });
  },

  completeTenant: async (): Promise<OnboardingStatusResponse> => {
    return apiClient<OnboardingStatusResponse>('/api/v1/onboarding/tenant/complete', {
      method: 'POST',
    });
  },
};
