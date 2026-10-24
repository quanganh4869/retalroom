-- ==============================================================================
-- RentFlow SaaS Enterprise Migration
-- Version: V6__add_google_auth_and_onboarding.sql
-- Description: Bổ sung hỗ trợ xác thực Google OAuth/OIDC, quy trình Onboarding, Lời mời (invitations) & Thuê phòng (tenancies)
-- ==============================================================================

-- 1. Cập nhật bảng users để hỗ trợ Google OAuth & Onboarding
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ALTER COLUMN role DROP NOT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL';
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_subject VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED';
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_step VARCHAR(50) DEFAULT 'ROLE';

CREATE UNIQUE INDEX IF NOT EXISTS uk_users_provider_subject ON users(provider, provider_subject);
CREATE INDEX IF NOT EXISTS ix_users_onboarding_status ON users(onboarding_status);

-- 2. Cập nhật bảng properties để hỗ trợ cấu hình chu kỳ thanh toán ban đầu
ALTER TABLE properties ADD COLUMN IF NOT EXISTS billing_day INT DEFAULT 1;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS payment_cycle VARCHAR(50) DEFAULT 'MONTHLY';

-- 3. Tạo bảng invitations (Lời mời thuê phòng từ Chủ nhà tới Người thuê)
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY,
    landlord_id UUID NOT NULL,
    property_id UUID NOT NULL,
    room_id UUID,
    invite_code VARCHAR(50) NOT NULL,
    tenant_email VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by_user_id UUID,
    CONSTRAINT fk_invitations_landlord FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_invitations_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT fk_invitations_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    CONSTRAINT fk_invitations_accepted_by FOREIGN KEY (accepted_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uk_invitations_code UNIQUE (invite_code)
);

CREATE INDEX IF NOT EXISTS ix_invitations_code ON invitations(invite_code);
CREATE INDEX IF NOT EXISTS ix_invitations_landlord_id ON invitations(landlord_id);
CREATE INDEX IF NOT EXISTS ix_invitations_property_id ON invitations(property_id);
CREATE INDEX IF NOT EXISTS ix_invitations_status ON invitations(status);

-- 4. Tạo bảng tenancies (Mối quan hệ người thuê và phòng trọ)
CREATE TABLE IF NOT EXISTS tenancies (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    property_id UUID NOT NULL,
    room_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenancies_tenant FOREIGN KEY (tenant_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tenancies_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT fk_tenancies_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS ix_tenancies_tenant_id ON tenancies(tenant_id);
CREATE INDEX IF NOT EXISTS ix_tenancies_room_id ON tenancies(room_id);
