-- ==============================================================================
-- RentFlow PostgreSQL Initialization Script
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure timezone is set to UTC by default
SET timezone = 'UTC';
