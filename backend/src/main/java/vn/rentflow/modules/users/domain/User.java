package vn.rentflow.modules.users.domain;

import jakarta.persistence.*;
import vn.rentflow.modules.onboarding.domain.OnboardingStatus;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "ix_users_email", columnList = "email"),
        @Index(name = "ix_users_role", columnList = "role"),
        @Index(name = "ix_users_status", columnList = "status"),
        @Index(name = "ix_users_onboarding_status", columnList = "onboarding_status")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_provider_subject", columnNames = {"provider", "provider_subject"})
})
public class User {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 50)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private UserStatus status;

    @Column(name = "provider", nullable = false, length = 50)
    private String provider = "LOCAL";

    @Column(name = "provider_subject", length = 255)
    private String providerSubject;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "onboarding_status", nullable = false, length = 50)
    private OnboardingStatus onboardingStatus = OnboardingStatus.NOT_STARTED;

    @Column(name = "onboarding_step", length = 50)
    private String onboardingStep = "ROLE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected User() {
    }

    public User(UUID id, String email, String passwordHash, String fullName, String phoneNumber, UserRole role) {
        this.id = id != null ? id : UUID.randomUUID();
        this.email = email.toLowerCase().trim();
        this.passwordHash = passwordHash;
        this.fullName = fullName != null ? fullName.trim() : "";
        this.phoneNumber = phoneNumber != null ? phoneNumber.trim() : null;
        this.role = role;
        this.status = UserStatus.ACTIVE;
        this.provider = "LOCAL";
        this.onboardingStatus = (role == UserRole.ADMIN) ? OnboardingStatus.COMPLETED : OnboardingStatus.NOT_STARTED;
        this.onboardingStep = "ROLE";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public static User createFromGoogle(UUID id, String email, String fullName, String avatarUrl, String providerSubject) {
        User user = new User();
        user.id = id != null ? id : UUID.randomUUID();
        user.email = email.toLowerCase().trim();
        user.fullName = fullName != null ? fullName.trim() : "Google User";
        user.avatarUrl = avatarUrl;
        user.provider = "GOOGLE";
        user.providerSubject = providerSubject;
        user.status = UserStatus.ACTIVE;
        user.role = null; // Unassigned initially; user will choose Landlord or Tenant
        user.onboardingStatus = OnboardingStatus.NOT_STARTED;
        user.onboardingStep = "ROLE";
        user.createdAt = Instant.now();
        user.updatedAt = Instant.now();
        return user;
    }

    public void updateProfile(String fullName, String phoneNumber, String avatarUrl) {
        if (fullName != null && !fullName.isBlank()) {
            this.fullName = fullName.trim();
        }
        if (phoneNumber != null) {
            this.phoneNumber = phoneNumber.trim();
        }
        if (avatarUrl != null && !avatarUrl.isBlank()) {
            this.avatarUrl = avatarUrl.trim();
        }
        this.updatedAt = Instant.now();
    }

    public void selectRole(UserRole role) {
        if (this.role != null && this.role == UserRole.ADMIN) {
            return; // Admin role cannot be overridden
        }
        this.role = role;
        if (this.onboardingStatus == OnboardingStatus.NOT_STARTED) {
            this.onboardingStatus = OnboardingStatus.IN_PROGRESS;
            this.onboardingStep = "PROFILE";
        }
        this.updatedAt = Instant.now();
    }

    public void updateOnboardingProgress(OnboardingStatus status, String step) {
        if (status != null) {
            this.onboardingStatus = status;
        }
        if (step != null) {
            this.onboardingStep = step;
        }
        this.updatedAt = Instant.now();
    }

    public void completeOnboarding() {
        this.onboardingStatus = OnboardingStatus.COMPLETED;
        this.onboardingStep = "COMPLETE";
        this.updatedAt = Instant.now();
    }

    public void changePassword(String newPasswordHash) {
        this.passwordHash = newPasswordHash;
        this.updatedAt = Instant.now();
    }

    public void setStatus(UserStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public boolean isActive() {
        return this.status == UserStatus.ACTIVE;
    }

    public boolean isOnboardingCompleted() {
        return this.onboardingStatus == OnboardingStatus.COMPLETED || this.role == UserRole.ADMIN;
    }

    // Getters & Setters
    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public UserRole getRole() {
        return role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public String getProvider() {
        return provider;
    }

    public String getProviderSubject() {
        return providerSubject;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public OnboardingStatus getOnboardingStatus() {
        return onboardingStatus;
    }

    public String getOnboardingStep() {
        return onboardingStep;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
