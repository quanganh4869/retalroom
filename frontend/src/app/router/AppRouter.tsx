import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/features/auth/AuthContext';
import { ToastProvider } from '@/components/feedback/ToastSystem';
import { AppShell } from '@/components/layout/AppShell';
import { RentFlowChatbot } from '@/components/ui/RentFlowChatbot';

// Pages
import { LandingPage } from '@/features/landing/LandingPage';
import { RolesSelectionPage, LoginPage, PlatformLoginPage, RegisterPage, ForgotPasswordPage } from '@/features/auth/AuthPages';
import { GoogleLoginPage } from '@/features/auth/GoogleLoginPage';
import { ChooseRolePage } from '@/features/auth/ChooseRolePage';
import { LandlordOnboardingPage } from '@/features/auth/LandlordOnboardingPage';
import { TenantOnboardingPage } from '@/features/auth/TenantOnboardingPage';
import { OnboardingWizardPage } from '@/features/auth/OnboardingWizardPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PropertyListPage } from '@/features/properties/components/PropertyListPage';
import { RoomsPage } from '@/features/rooms/RoomsPage';
import { InvoicesPage } from '@/features/billing/InvoicesPage';
import { PaymentsPage } from '@/features/payments/PaymentsPage';
import { MaintenancePage } from '@/features/maintenance/MaintenancePage';
import { ContractsPage } from '@/features/leases/ContractsPage';
import { CreateContractPage } from '@/features/leases/CreateContractPage';
import { MeterReadingsPage } from '@/features/billing/MeterReadingsPage';
import { DepositsPage } from '@/features/billing/DepositsPage';
import { TenantsPage } from '@/features/tenants/TenantsPage';
import { HandoverPage } from '@/features/rooms/HandoverPage';
import { NotificationsPage } from '@/features/notifications/NotificationsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { AdminOverviewPage } from '@/features/admin/AdminOverviewPage';
import { AdminAccountsPage } from '@/features/admin/AdminAccountsPage';
import { AdminOrganizationsPage } from '@/features/admin/AdminOrganizationsPage';
import { AdminSubscriptionPlansPage } from '@/features/admin/AdminSubscriptionPlansPage';
import { AdminConfigurePlansPage } from '@/features/admin/AdminConfigurePlansPage';
import { AdminSupportPage } from '@/features/admin/AdminSupportPage';
import { AdminAnnouncementsPage } from '@/features/admin/AdminAnnouncementsPage';
import { AdminAuditLogsPage } from '@/features/admin/AdminAuditLogsPage';
import { AdminSystemHealthPage } from '@/features/admin/AdminSystemHealthPage';
import { AdminSettingsPage } from '@/features/admin/AdminSettingsPage';
import {
  AdminLoginLogsPage,
  AdminLoginAnalyticsPage,
  AdminSecurityAlertsPage,
  AdminBlockedIPsPage,
  AdminLoginEventDetailPage,
} from '@/features/admin/security';
import { AdminActiveSessionsPage } from '@/features/admin/AdminActiveSessionsPage';
import { AdminAccessControlPage } from '@/features/admin/AdminAccessControlPage';
import { AdminSystemLogsPage } from '@/features/admin/AdminSystemLogsPage';
import { AdminIntegrationsPage } from '@/features/admin/AdminIntegrationsPage';
import { AdminTransactionsPage } from '@/features/admin/AdminTransactionsPage';
import { AdminBackgroundJobsPage } from '@/features/admin/AdminBackgroundJobsPage';
import { AdminBackupsPage } from '@/features/admin/AdminBackupsPage';
import { PlatformAdminProvider } from '@/features/admin/PlatformAdminContext';
import { PropertyDetailPage } from '@/features/properties/components/PropertyDetailPage';
import { RoomDetailPage } from '@/features/rooms/RoomDetailPage';
import { CreateRoomPage } from '@/features/rooms/CreateRoomPage';
import { InvoiceDetailPage } from '@/features/billing/InvoiceDetailPage';
import { MeterReadingDetailPage } from '@/features/billing/MeterReadingDetailPage';
import { PaymentDetailPage } from '@/features/payments/PaymentDetailPage';
import { ExpensesPage } from '@/features/expenses/ExpensesPage';
import { ContractDetailPage } from '@/features/leases/ContractDetailPage';
import { DepositDetailPage } from '@/features/billing/DepositDetailPage';
import { MaintenanceDetailPage } from '@/features/maintenance/MaintenanceDetailPage';
import { ActionModalProvider } from '@/components/ui/ActionModal';
import { TenantOverviewPage } from '@/features/tenant/TenantOverviewPage';
import { TenantInvoicesPage } from '@/features/tenant/TenantInvoicesPage';
import { TenantInvoiceDetailPage } from '@/features/tenant/TenantInvoiceDetailPage';
import { TenantUtilitiesPage } from '@/features/tenant/TenantUtilitiesPage';
import { TenantUtilityDetailPage } from '@/features/tenant/TenantUtilityDetailPage';
import { TenantMaintenancePage } from '@/features/tenant/TenantMaintenancePage';
import { TenantLeasePage } from '@/features/tenant/TenantLeasePage';
import { TenantPaymentsPage } from '@/features/tenant/TenantPaymentsPage';
import { AccessDeniedPage, NotFoundPage } from '@/features/feedback/ErrorPages';

// Role-Protected Guard Route
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  allowPendingOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  allowPendingOnboarding = false,
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPERADMIN';

  // If user has not completed onboarding and is trying to access regular app pages
  if (!allowPendingOnboarding && !isAdmin && user.onboardingStatus !== 'COMPLETED') {
    if (!user.role) {
      return <Navigate to="/onboarding/role" replace />;
    }
    if (user.role === 'LANDLORD') {
      return <Navigate to="/onboarding/landlord" replace />;
    }
    if (user.role === 'TENANT') {
      return <Navigate to="/onboarding/tenant" replace />;
    }
  }

  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <ActionModalProvider>
          <PlatformAdminProvider>
            <BrowserRouter>
            <Routes>
            {/* 1. Public Journeys */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/roles" element={<RolesSelectionPage />} />
            <Route path="/auth/login" element={<GoogleLoginPage />} />
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/platform/login" element={<PlatformLoginPage />} />

            {/* 2. Onboarding Journeys (Google auth users) */}
            <Route
              path="/onboarding/role"
              element={
                <ProtectedRoute allowPendingOnboarding={true}>
                  <ChooseRolePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/landlord"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD']} allowPendingOnboarding={true}>
                  <LandlordOnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/tenant"
              element={
                <ProtectedRoute allowedRoles={['TENANT']} allowPendingOnboarding={true}>
                  <TenantOnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute allowPendingOnboarding={true}>
                  <Navigate to="/onboarding/role" replace />
                </ProtectedRoute>
              }
            />

            {/* 3. Tenant Dedicated Journey */}
            <Route
              path="/tenant/dashboard"
              element={
                <ProtectedRoute allowedRoles={['TENANT']}>
                  <AppShell>
                    <TenantOverviewPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/invoices"
              element={
                <ProtectedRoute allowedRoles={['TENANT']}>
                  <AppShell>
                    <TenantInvoicesPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/invoices/:invoiceId"
              element={
                <ProtectedRoute allowedRoles={['TENANT']}>
                  <AppShell>
                    <TenantInvoiceDetailPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/utilities"
              element={
                <ProtectedRoute allowedRoles={['TENANT']}>
                  <AppShell>
                    <TenantUtilitiesPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/utilities/:readingId"
              element={
                <ProtectedRoute allowedRoles={['TENANT']}>
                  <AppShell>
                    <TenantUtilityDetailPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/payments"
              element={
                <ProtectedRoute allowedRoles={['TENANT']}>
                  <AppShell>
                    <TenantPaymentsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/maintenance"
              element={
                <ProtectedRoute allowedRoles={['TENANT']}>
                  <AppShell>
                    <TenantMaintenancePage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/maintenance/:id"
              element={
                <ProtectedRoute allowedRoles={['TENANT']}>
                  <AppShell>
                    <MaintenanceDetailPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/lease"
              element={
                <ProtectedRoute allowedRoles={['TENANT']}>
                  <AppShell>
                    <TenantLeasePage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route path="/tenant" element={<Navigate to="/tenant/dashboard" replace />} />
            <Route path="/portal" element={<Navigate to="/tenant/dashboard" replace />} />

            {/* 4. Platform SuperAdmin Journey (Master Admin Routes) */}
            <Route
              path="/platform/dashboard"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminOverviewPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/accounts"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminAccountsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/organizations"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminOrganizationsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/access-control"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminAccessControlPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/subscription-plans"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminSubscriptionPlansPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/subscription-plans/configure"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminConfigurePlansPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/subscription-plans/configure/:planId"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminConfigurePlansPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/subscriptions"
              element={<Navigate to="/platform/subscription-plans?tab=subscriptions" replace />}
            />
            <Route
              path="/platform/transactions"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminTransactionsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/support"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminSupportPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/announcements"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminAnnouncementsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            {/* Security: Multi-tier Login Logs & Threat Admin Module */}
            <Route
              path="/platform/security/login-logs"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminLoginLogsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/security/login-logs/analytics"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminLoginAnalyticsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/security/login-logs/alerts"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminSecurityAlertsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/security/login-logs/blocked-ips"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminBlockedIPsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/security/login-logs/events/:eventId"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminLoginEventDetailPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />

            {/* Legacy & Route Aliases for Login Logs */}
            <Route
              path="/platform/security/login-history"
              element={<Navigate to="/platform/security/login-logs" replace />}
            />
            <Route
              path="/admin/security/login-logs"
              element={<Navigate to="/platform/security/login-logs" replace />}
            />
            <Route
              path="/admin/security/login-logs/analytics"
              element={<Navigate to="/platform/security/login-logs/analytics" replace />}
            />
            <Route
              path="/admin/security/login-logs/alerts"
              element={<Navigate to="/platform/security/login-logs/alerts" replace />}
            />
            <Route
              path="/admin/security/login-logs/blocked-ips"
              element={<Navigate to="/platform/security/login-logs/blocked-ips" replace />}
            />
            <Route
              path="/admin/security/login-logs/events/:eventId"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminLoginEventDetailPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />

            <Route
              path="/platform/security/sessions"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminActiveSessionsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/security/events"
              element={<Navigate to="/platform/security/login-logs/alerts" replace />}
            />
            <Route
              path="/platform/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminAuditLogsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/system-health"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminSystemHealthPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/system-logs"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminSystemLogsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/integrations"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminIntegrationsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/jobs"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminBackgroundJobsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/operations/backups"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminBackupsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/platform/settings"
              element={
                <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                  <AppShell>
                    <AdminSettingsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={<Navigate to="/platform/dashboard" replace />} />

            {/* 5. Landlord & SuperAdmin Operations */}
            <Route
              path="/landlord/dashboard"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <DashboardPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/properties"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <PropertyListPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/properties/:id"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <PropertyDetailPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <RoomsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms/new"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <CreateRoomPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/rooms/create"
              element={<Navigate to="/rooms/new" replace />}
            />
            <Route
              path="/rooms/:id"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <RoomDetailPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenants"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <TenantsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contracts"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <ContractsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contracts/new"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <CreateContractPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contracts/create"
              element={<Navigate to="/contracts/new" replace />}
            />
            <Route
              path="/contracts/:id"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <ContractDetailPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/contracts/:id/handover"
              element={<Navigate to="/handover" replace />}
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <InvoicesPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices/:id"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <InvoiceDetailPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/meter-readings"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <MeterReadingsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/utilities/readings/:readingId"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <MeterReadingDetailPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <PaymentsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/payments/:paymentId"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <PaymentDetailPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments/:paymentId"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <PaymentDetailPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/landlord/expenses"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <ExpensesPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <ExpensesPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/deposits"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <DepositsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/deposits/:id"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <DepositDetailPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <MaintenancePage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance/:id"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <MaintenanceDetailPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/handover"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <HandoverPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <AppShell>
                    <NotificationsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['LANDLORD', 'SUPERADMIN']}>
                  <AppShell>
                    <SettingsPage />
                  </AppShell>
                </ProtectedRoute>
              }
            />

            {/* 6. Fallback routes */}
            <Route path="/403" element={<AccessDeniedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <RentFlowChatbot />
        </BrowserRouter>
      </PlatformAdminProvider>
      </ActionModalProvider>
    </ToastProvider>
  </AuthProvider>
);
};
