-- ==============================================================================
-- RentFlow SaaS Enterprise Migration
-- Version: V2__create_properties_table.sql
-- Description: Khởi tạo bảng cơ sở / khu nhà trọ (properties)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY,
    landlord_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    address VARCHAR(300) NOT NULL,
    city VARCHAR(100) NOT NULL,
    total_floors INT NOT NULL DEFAULT 1,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_properties_landlord FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_properties_landlord_id ON properties(landlord_id);
CREATE INDEX IF NOT EXISTS ix_properties_name ON properties(name);
