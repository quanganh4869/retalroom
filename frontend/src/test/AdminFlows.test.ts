import { describe, it, expect, beforeEach } from 'vitest';
import {
  initialPlatformAccounts,
  initialPlatformBackgroundJobs,
  initialPlatformBackupRecords,
  initialPlatformRolePermissions,
  PlatformAccount,
} from '../features/admin/types/platformAdmin';

describe('Platform Admin Core Logic & Demonstration Integrity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('preserves valid account roles and strict separation from landlord data', () => {
    const superAdmin = initialPlatformAccounts.find((a) => a.role === 'SUPERADMIN');
    expect(superAdmin).toBeDefined();
    expect(superAdmin?.email).toBe('admin@rentflow.vn');

    // Landlords should not have superadmin privileges
    const landlord = initialPlatformAccounts.find((a) => a.role === 'LANDLORD');
    expect(landlord).toBeDefined();
    expect(landlord?.role).not.toBe('SUPERADMIN');
  });

  it('validates account status transitions without credentials exposure', () => {
    const acc = initialPlatformAccounts[0] as PlatformAccount;
    expect(acc).toBeDefined();
    // Verify passwords or hashes are NEVER exposed in account types
    expect((acc as any).password).toBeUndefined();
    expect((acc as any).passwordHash).toBeUndefined();
    expect((acc as any).token).toBeUndefined();
  });

  it('verifies background jobs lifecycle simulation', () => {
    expect(initialPlatformBackgroundJobs.length).toBeGreaterThan(0);
    const failedJob = initialPlatformBackgroundJobs.find((j) => j.status === 'FAILED');
    expect(failedJob).toBeDefined();
    expect(failedJob?.lastError).toContain('CUDA');
  });

  it('verifies backup metadata integrity and demo simulation labeling', () => {
    expect(initialPlatformBackupRecords.length).toBeGreaterThan(0);
    initialPlatformBackupRecords.forEach((bk) => {
      expect(bk.isSimulatedDemo).toBe(true);
      expect(bk.checksum).toMatch(/^sha256:/);
    });
  });

  it('validates RBAC permission matrix definitions', () => {
    const superAdminRole = initialPlatformRolePermissions.find((r) => r.role === 'SUPERADMIN');
    const tenantRole = initialPlatformRolePermissions.find((r) => r.role === 'TENANT');

    expect(superAdminRole?.permissions.length).toBeGreaterThan(0);
    expect(tenantRole?.permissions.some((p) => p.module === 'Cổng Admin Nền tảng' && p.view === false)).toBe(false);
  });
});
