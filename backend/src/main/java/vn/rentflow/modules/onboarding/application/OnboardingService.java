package vn.rentflow.modules.onboarding.application;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.rentflow.modules.audit.application.AuditService;
import vn.rentflow.modules.identity.api.dto.UserProfileResponse;
import vn.rentflow.modules.onboarding.api.dto.*;
import vn.rentflow.modules.onboarding.domain.Invitation;
import vn.rentflow.modules.onboarding.domain.OnboardingStatus;
import vn.rentflow.modules.onboarding.domain.Tenancy;
import vn.rentflow.modules.onboarding.infrastructure.persistence.InvitationRepository;
import vn.rentflow.modules.onboarding.infrastructure.persistence.TenancyRepository;
import vn.rentflow.modules.properties.domain.Property;
import vn.rentflow.modules.properties.infrastructure.persistence.PropertyRepository;
import vn.rentflow.modules.rooms.domain.Room;
import vn.rentflow.modules.rooms.infrastructure.persistence.RoomRepository;
import vn.rentflow.modules.users.domain.User;
import vn.rentflow.modules.users.domain.UserRole;
import vn.rentflow.modules.users.infrastructure.persistence.UserRepository;
import vn.rentflow.security.JwtTokenProvider;
import vn.rentflow.shared.exception.BusinessException;
import vn.rentflow.shared.exception.ResourceNotFoundException;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class OnboardingService {

    private static final String CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final RoomRepository roomRepository;
    private final InvitationRepository invitationRepository;
    private final TenancyRepository tenancyRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditService auditService;

    public OnboardingService(
            UserRepository userRepository,
            PropertyRepository propertyRepository,
            RoomRepository roomRepository,
            InvitationRepository invitationRepository,
            TenancyRepository tenancyRepository,
            JwtTokenProvider jwtTokenProvider,
            AuditService auditService) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.roomRepository = roomRepository;
        this.invitationRepository = invitationRepository;
        this.tenancyRepository = tenancyRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public OnboardingStatusResponse getOnboardingStatus(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        OnboardingStatusResponse response = new OnboardingStatusResponse(
                user.getOnboardingStatus(),
                user.getOnboardingStep(),
                user.getRole(),
                UserProfileResponse.from(user)
        );

        if (user.getRole() == UserRole.LANDLORD) {
            Optional<Property> prop = propertyRepository.findFirstByLandlordIdOrderByCreatedAtDesc(userId);
            if (prop.isPresent()) {
                response.setPropertyId(prop.get().getId());
                response.setPropertyName(prop.get().getName());

                Optional<Room> room = roomRepository.findFirstByPropertyIdOrderByCreatedAtDesc(prop.get().getId());
                if (room.isPresent()) {
                    response.setRoomId(room.get().getId());
                    response.setRoomNumber(room.get().getRoomNumber());
                }

                invitationRepository.findFirstByPropertyIdOrderByCreatedAtDesc(prop.get().getId())
                        .ifPresent(inv -> response.setInviteCode(inv.getInviteCode()));
            }
        } else if (user.getRole() == UserRole.TENANT) {
            Optional<Tenancy> tenancy = tenancyRepository.findFirstByTenantIdOrderByCreatedAtDesc(userId);
            if (tenancy.isPresent()) {
                response.setPropertyId(tenancy.get().getPropertyId());
                propertyRepository.findById(tenancy.get().getPropertyId())
                        .ifPresent(p -> response.setPropertyName(p.getName()));

                if (tenancy.get().getRoomId() != null) {
                    response.setRoomId(tenancy.get().getRoomId());
                    roomRepository.findById(tenancy.get().getRoomId())
                            .ifPresent(r -> response.setRoomNumber(r.getRoomNumber()));
                }
            }
        }

        return response;
    }

    public OnboardingStatusResponse selectRole(UUID userId, SelectRoleRequest request) {
        if (request.getRole() == UserRole.ADMIN) {
            throw new BusinessException("INVALID_ROLE", "Không được phép tự gán vai trò Quản trị viên hệ thống");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        user.selectRole(request.getRole());
        user = userRepository.save(user);

        // Generate updated JWT with new role authority
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);

        auditService.record(userId, user.getEmail(), "ONBOARDING_ROLE_SELECTED", "User",
                userId.toString(), "SUCCESS", "Đã chọn vai trò: " + request.getRole());

        OnboardingStatusResponse response = getOnboardingStatus(userId);
        response.setAccessToken(newAccessToken);
        return response;
    }

    public OnboardingStatusResponse updateProfile(UUID userId, OnboardingProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        user.updateProfile(request.getFullName(), request.getPhoneNumber(), user.getAvatarUrl());

        if (user.getRole() == UserRole.LANDLORD) {
            user.updateOnboardingProgress(OnboardingStatus.IN_PROGRESS, "PROPERTY");
        } else if (user.getRole() == UserRole.TENANT) {
            user.updateOnboardingProgress(OnboardingStatus.IN_PROGRESS, "CONNECT");
        }

        user = userRepository.save(user);

        auditService.record(userId, user.getEmail(), "ONBOARDING_PROFILE_UPDATED", "User",
                userId.toString(), "SUCCESS", "Cập nhật hồ sơ thành công");

        return getOnboardingStatus(userId);
    }

    public OnboardingStatusResponse setupLandlordProperty(UUID userId, LandlordPropertySetupRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (user.getRole() != UserRole.LANDLORD) {
            throw new BusinessException("FORBIDDEN_ROLE", "Chỉ chủ nhà mới có thể tạo thông tin bất động sản");
        }

        Property property = new Property(
                UUID.randomUUID(),
                userId,
                request.getName(),
                request.getAddress(),
                request.getCity(),
                request.getTotalFloors(),
                request.getDescription()
        );
        propertyRepository.save(property);

        user.updateOnboardingProgress(OnboardingStatus.IN_PROGRESS, "MANAGEMENT_CONFIG");
        userRepository.save(user);

        auditService.record(userId, user.getEmail(), "ONBOARDING_PROPERTY_CREATED", "Property",
                property.getId().toString(), "SUCCESS", "Tạo tòa nhà ban đầu: " + property.getName());

        OnboardingStatusResponse response = getOnboardingStatus(userId);
        response.setPropertyId(property.getId());
        response.setPropertyName(property.getName());
        return response;
    }

    public OnboardingStatusResponse setupLandlordManagementConfig(UUID userId, LandlordManagementConfigRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property", request.getPropertyId()));

        if (!property.getLandlordId().equals(userId)) {
            throw new BusinessException("ACCESS_DENIED", "Bạn không có quyền cấu hình bất động sản này");
        }

        property.updateManagementConfig(request.getBillingDay(), request.getPaymentCycle());
        propertyRepository.save(property);

        user.updateOnboardingProgress(OnboardingStatus.IN_PROGRESS, "FIRST_ROOM");
        userRepository.save(user);

        auditService.record(userId, user.getEmail(), "ONBOARDING_MANAGEMENT_CONFIGURED", "Property",
                property.getId().toString(), "SUCCESS", "Cấu hình chu kỳ thanh toán cho tòa nhà");

        return getOnboardingStatus(userId);
    }

    public OnboardingStatusResponse setupLandlordFirstRoom(UUID userId, LandlordFirstRoomRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property", request.getPropertyId()));

        if (!property.getLandlordId().equals(userId)) {
            throw new BusinessException("ACCESS_DENIED", "Bạn không có quyền quản lý bất động sản này");
        }

        if (roomRepository.existsByPropertyIdAndRoomNumber(property.getId(), request.getRoomNumber())) {
            throw new BusinessException("ROOM_NUMBER_EXISTS", "Số phòng '" + request.getRoomNumber() + "' đã tồn tại trong tòa nhà này");
        }

        Room room = new Room(
                UUID.randomUUID(),
                property.getId(),
                request.getRoomNumber(),
                request.getFloor(),
                request.getBasePrice(),
                request.getAreaSqm()
        );
        roomRepository.save(room);

        // Generate invitation code for this initial room
        String inviteCode = generateUniqueInviteCode();
        Invitation invitation = new Invitation(
                UUID.randomUUID(),
                userId,
                property.getId(),
                room.getId(),
                inviteCode,
                null,
                Instant.now().plus(60, ChronoUnit.DAYS)
        );
        invitationRepository.save(invitation);

        user.updateOnboardingProgress(OnboardingStatus.IN_PROGRESS, "CONFIRMATION");
        userRepository.save(user);

        auditService.record(userId, user.getEmail(), "ONBOARDING_FIRST_ROOM_CREATED", "Room",
                room.getId().toString(), "SUCCESS", "Khởi tạo phòng đầu tiên và mã mời: " + inviteCode);

        OnboardingStatusResponse response = getOnboardingStatus(userId);
        response.setRoomId(room.getId());
        response.setRoomNumber(room.getRoomNumber());
        response.setInviteCode(inviteCode);
        return response;
    }

    public OnboardingStatusResponse completeLandlordOnboarding(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        user.completeOnboarding();
        userRepository.save(user);

        auditService.record(userId, user.getEmail(), "ONBOARDING_LANDLORD_COMPLETED", "User",
                userId.toString(), "SUCCESS", "Hoàn tất toàn bộ quy trình Onboarding Chủ nhà");

        return getOnboardingStatus(userId);
    }

    @Transactional(readOnly = true)
    public InvitationDetailsResponse verifyInviteCode(String inviteCode) {
        if (inviteCode == null || inviteCode.isBlank()) {
            throw new BusinessException("INVALID_INVITE_CODE", "Mã mời không được để trống");
        }

        Invitation invitation = invitationRepository.findByInviteCode(inviteCode.trim().toUpperCase())
                .orElseThrow(() -> new BusinessException("INVITATION_NOT_FOUND", "Không tìm thấy lời mời với mã: " + inviteCode));

        if (!invitation.isValid()) {
            throw new BusinessException("INVITATION_EXPIRED_OR_USED", "Mã lời mời đã hết hạn hoặc đã được sử dụng");
        }

        Property property = propertyRepository.findById(invitation.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property", invitation.getPropertyId()));

        String roomNumber = null;
        if (invitation.getRoomId() != null) {
            roomNumber = roomRepository.findById(invitation.getRoomId())
                    .map(Room::getRoomNumber)
                    .orElse(null);
        }

        User landlord = userRepository.findById(invitation.getLandlordId()).orElse(null);
        String landlordName = landlord != null ? landlord.getFullName() : "Chủ nhà";

        return new InvitationDetailsResponse(
                invitation.getId(),
                invitation.getInviteCode(),
                property.getId(),
                property.getName(),
                property.getAddress(),
                invitation.getRoomId(),
                roomNumber,
                landlordName,
                invitation.getExpiresAt(),
                invitation.isValid()
        );
    }

    public OnboardingStatusResponse acceptInvite(UUID userId, VerifyInviteCodeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (user.getRole() != UserRole.TENANT) {
            throw new BusinessException("FORBIDDEN_ROLE", "Chỉ tài khoản Người thuê mới có thể tham gia vào phòng trọ qua mã mời");
        }

        Invitation invitation = invitationRepository.findByInviteCode(request.getInviteCode().trim().toUpperCase())
                .orElseThrow(() -> new BusinessException("INVITATION_NOT_FOUND", "Không tìm thấy lời mời với mã đã nhập"));

        if (!invitation.isValid()) {
            throw new BusinessException("INVITATION_EXPIRED_OR_USED", "Mã mời đã hết hạn hoặc đã được sử dụng");
        }

        invitation.accept(userId);
        invitationRepository.save(invitation);

        Tenancy tenancy = new Tenancy(
                UUID.randomUUID(),
                userId,
                invitation.getPropertyId(),
                invitation.getRoomId()
        );
        tenancyRepository.save(tenancy);

        user.updateOnboardingProgress(OnboardingStatus.IN_PROGRESS, "CONFIRMATION");
        userRepository.save(user);

        auditService.record(userId, user.getEmail(), "ONBOARDING_TENANT_INVITE_ACCEPTED", "Tenancy",
                tenancy.getId().toString(), "SUCCESS", "Đã chấp nhận mã mời và gia nhập phòng trọ");

        return getOnboardingStatus(userId);
    }

    public OnboardingStatusResponse skipTenantInvite(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        user.updateOnboardingProgress(OnboardingStatus.IN_PROGRESS, "CONFIRMATION");
        userRepository.save(user);

        auditService.record(userId, user.getEmail(), "ONBOARDING_TENANT_INVITE_SKIPPED", "User",
                userId.toString(), "SUCCESS", "Bỏ qua bước nhập mã mời và tiếp tục");

        return getOnboardingStatus(userId);
    }

    public OnboardingStatusResponse completeTenantOnboarding(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        user.completeOnboarding();
        userRepository.save(user);

        auditService.record(userId, user.getEmail(), "ONBOARDING_TENANT_COMPLETED", "User",
                userId.toString(), "SUCCESS", "Hoàn tất toàn bộ quy trình Onboarding Khách thuê");

        return getOnboardingStatus(userId);
    }

    private String generateUniqueInviteCode() {
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder("RF-");
            for (int i = 0; i < 6; i++) {
                sb.append(CODE_ALPHABET.charAt(RANDOM.nextInt(CODE_ALPHABET.length())));
            }
            String code = sb.toString();
            if (!invitationRepository.existsByInviteCode(code)) {
                return code;
            }
        }
        return "RF-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
