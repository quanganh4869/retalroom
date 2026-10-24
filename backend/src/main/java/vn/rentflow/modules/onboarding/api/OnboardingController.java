package vn.rentflow.modules.onboarding.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.rentflow.modules.onboarding.api.dto.*;
import vn.rentflow.modules.onboarding.application.OnboardingService;
import vn.rentflow.security.SecurityUtils;
import vn.rentflow.shared.dto.ApiResponse;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/onboarding")
@Tag(name = "Onboarding Flow", description = "Các API điều hướng và thu thập dữ liệu khởi tạo ban đầu cho Chủ nhà và Người thuê")
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    @GetMapping("/status")
    @Operation(summary = "Lấy trạng thái Onboarding", description = "Kiểm tra tiến trình và bước hiện tại để điều hướng đúng màn hình")
    public ResponseEntity<ApiResponse<OnboardingStatusResponse>> getStatus() {
        UUID userId = SecurityUtils.getCurrentUserId();
        OnboardingStatusResponse response = onboardingService.getOnboardingStatus(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/role")
    @Operation(summary = "Chọn vai trò (Chủ nhà hoặc Người thuê)", description = "Lưu lựa chọn vai trò lần đầu cho tài khoản mới đăng nhập Google")
    public ResponseEntity<ApiResponse<OnboardingStatusResponse>> selectRole(@Valid @RequestBody SelectRoleRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        OnboardingStatusResponse response = onboardingService.selectRole(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Lựa chọn vai trò thành công", response));
    }

    @PostMapping("/profile")
    @Operation(summary = "Cập nhật hồ sơ cá nhân", description = "Cập nhật họ tên và số điện thoại liên hệ")
    public ResponseEntity<ApiResponse<OnboardingStatusResponse>> updateProfile(@Valid @RequestBody OnboardingProfileRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        OnboardingStatusResponse response = onboardingService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin thành công", response));
    }

    // =========================================================================
    // LANDLORD WIZARD APIS
    // =========================================================================

    @PostMapping("/landlord/property")
    @PreAuthorize("hasAnyRole('LANDLORD', 'PENDING')")
    @Operation(summary = "Khởi tạo bất động sản đầu tiên", description = "Bước 2 trong quy trình Onboarding Chủ nhà")
    public ResponseEntity<ApiResponse<OnboardingStatusResponse>> setupLandlordProperty(
            @Valid @RequestBody LandlordPropertySetupRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        OnboardingStatusResponse response = onboardingService.setupLandlordProperty(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Khởi tạo tòa nhà thành công", response));
    }

    @PostMapping("/landlord/management-config")
    @PreAuthorize("hasAnyRole('LANDLORD', 'PENDING')")
    @Operation(summary = "Cấu hình chu kỳ quản lý", description = "Bước 3 trong quy trình Onboarding Chủ nhà")
    public ResponseEntity<ApiResponse<OnboardingStatusResponse>> setupLandlordManagementConfig(
            @Valid @RequestBody LandlordManagementConfigRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        OnboardingStatusResponse response = onboardingService.setupLandlordManagementConfig(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Lưu cấu hình vận hành thành công", response));
    }

    @PostMapping("/landlord/first-room")
    @PreAuthorize("hasAnyRole('LANDLORD', 'PENDING')")
    @Operation(summary = "Khởi tạo phòng trọ đầu tiên và mã mời", description = "Bước 4 trong quy trình Onboarding Chủ nhà")
    public ResponseEntity<ApiResponse<OnboardingStatusResponse>> setupLandlordFirstRoom(
            @Valid @RequestBody LandlordFirstRoomRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        OnboardingStatusResponse response = onboardingService.setupLandlordFirstRoom(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Khởi tạo phòng trọ đầu tiên thành công", response));
    }

    @PostMapping("/landlord/complete")
    @PreAuthorize("hasAnyRole('LANDLORD', 'PENDING')")
    @Operation(summary = "Hoàn tất Onboarding Chủ nhà", description = "Chuyển trạng thái sang COMPLETED và tiến vào Dashboard")
    public ResponseEntity<ApiResponse<OnboardingStatusResponse>> completeLandlord() {
        UUID userId = SecurityUtils.getCurrentUserId();
        OnboardingStatusResponse response = onboardingService.completeLandlordOnboarding(userId);
        return ResponseEntity.ok(ApiResponse.success("Hoàn tất thiết lập! Chào mừng bạn đến với RentFlow", response));
    }

    // =========================================================================
    // TENANT WIZARD APIS
    // =========================================================================

    @GetMapping("/tenant/invite-details")
    @Operation(summary = "Tra cứu thông tin mã mời", description = "Kiểm tra phòng và chủ nhà liên kết với mã mời")
    public ResponseEntity<ApiResponse<InvitationDetailsResponse>> getInviteDetails(@RequestParam("code") String code) {
        InvitationDetailsResponse response = onboardingService.verifyInviteCode(code);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/tenant/accept-invite")
    @PreAuthorize("hasAnyRole('TENANT', 'PENDING')")
    @Operation(summary = "Chấp nhận mã mời thuê phòng", description = "Liên kết khách thuê với phòng trọ và tòa nhà")
    public ResponseEntity<ApiResponse<OnboardingStatusResponse>> acceptInvite(
            @Valid @RequestBody VerifyInviteCodeRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        OnboardingStatusResponse response = onboardingService.acceptInvite(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Liên kết phòng trọ thành công", response));
    }

    @PostMapping("/tenant/skip-invite")
    @PreAuthorize("hasAnyRole('TENANT', 'PENDING')")
    @Operation(summary = "Bỏ qua liên kết phòng trọ", description = "Khách thuê chưa có mã mời vẫn có thể tiếp tục")
    public ResponseEntity<ApiResponse<OnboardingStatusResponse>> skipInvite() {
        UUID userId = SecurityUtils.getCurrentUserId();
        OnboardingStatusResponse response = onboardingService.skipTenantInvite(userId);
        return ResponseEntity.ok(ApiResponse.success("Đã ghi nhận, bạn có thể nhập mã mời sau trong phần cài đặt", response));
    }

    @PostMapping("/tenant/complete")
    @PreAuthorize("hasAnyRole('TENANT', 'PENDING')")
    @Operation(summary = "Hoàn tất Onboarding Người thuê", description = "Chuyển trạng thái sang COMPLETED và tiến vào Cổng cư dân")
    public ResponseEntity<ApiResponse<OnboardingStatusResponse>> completeTenant() {
        UUID userId = SecurityUtils.getCurrentUserId();
        OnboardingStatusResponse response = onboardingService.completeTenantOnboarding(userId);
        return ResponseEntity.ok(ApiResponse.success("Chào mừng bạn đến với không gian thuê RentFlow", response));
    }
}
