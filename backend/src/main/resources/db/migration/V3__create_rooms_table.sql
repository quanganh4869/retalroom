-- ==============================================================================
-- RentFlow SaaS Enterprise Migration
-- Version: V3__create_rooms_table.sql
-- Description: Khởi tạo bảng danh mục phòng trọ (rooms)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    floor INT NOT NULL DEFAULT 1,
    base_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    area_sqm NUMERIC(6, 2) NOT NULL DEFAULT 20.00,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rooms_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT uk_rooms_property_number UNIQUE (property_id, room_number)
);

CREATE INDEX IF NOT EXISTS ix_rooms_property_id ON rooms(property_id);
CREATE INDEX IF NOT EXISTS ix_rooms_status ON rooms(status);
