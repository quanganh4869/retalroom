package vn.rentflow.modules.identity.application;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.rentflow.modules.audit.application.AuditService;
import vn.rentflow.modules.identity.api.dto.*;
import vn.rentflow.modules.identity.domain.RefreshToken;
import vn.rentflow.modules.identity.infrastructure.persistence.RefreshTokenRepository;
import vn.rentflow.modules.users.domain.User;
import vn.rentflow.modules.users.domain.UserRole;
import vn.rentflow.modules.users.infrastructure.persistence.UserRepository;
import vn.rentflow.security.JwtTokenProvider;
import vn.rentflow.security.SecurityUtils;
import vn.rentflow.shared.exception.BusinessException;
import vn.rentflow.shared.exception.ResourceNotFoundException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditService auditService;
    private final long refreshTokenExpirationDays;
    private final long accessTokenExpirationMinutes;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            AuditService auditService,
            @Value("${rentflow.security.jwt.refresh-token-expiration-days:14}") long refreshTokenExpirationDays,
            @Value("${rentflow.security.jwt.access-token-expiration-minutes:60}") long accessTokenExpirationMinutes) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.auditService = auditService;
        this.refreshTokenExpirationDays = refreshTokenExpirationDays;
        this.accessTokenExpirationMinutes = accessTokenExpirationMinutes;
    }

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BusinessException("EMAIL_ALREADY_EXISTS", "Địa chỉ email đã được sử dụng");
        }

        UserRole role = request.getRole() == UserRole.ADMIN ? UserRole.LANDLORD : request.getRole();

        User user = new User(
                UUID.randomUUID(),
                normalizedEmail,
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getPhoneNumber(),
                role
        );

        User saved = userRepository.save(user);

        auditService.record(saved.getId(), saved.getEmail(), "USER_REGISTER", "User",
                saved.getId().toString(), "SUCCESS", "Tài khoản mới đăng ký thành công");

        return createAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BusinessException("INVALID_CREDENTIALS", "Email hoặc mật khẩu không chính xác"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            auditService.record(null, normalizedEmail, "USER_LOGIN_FAILED", "User",
                    user.getId().toString(), "FAILURE", "Mật khẩu không đúng");
            throw new BusinessException("INVALID_CREDENTIALS", "Email hoặc mật khẩu không chính xác");
        }

        if (!user.isActive()) {
            throw new BusinessException("ACCOUNT_INACTIVE", "Tài khoản đang bị vô hiệu hóa hoặc chưa kích hoạt");
        }

        auditService.record(user.getId(), user.getEmail(), "USER_LOGIN", "User",
                user.getId().toString(), "SUCCESS", "Đăng nhập thành công");

        return createAuthResponse(user);
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String rawToken = request.getRefreshToken().trim();
        String hash = hashToken(rawToken);

        RefreshToken token = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new BusinessException("INVALID_REFRESH_TOKEN", "Refresh token không hợp lệ hoặc đã bị thu hồi"));

        if (!token.isValid()) {
            throw new BusinessException("INVALID_REFRESH_TOKEN", "Refresh token đã hết hạn hoặc bị thu hồi");
        }

        // Token rotation: revoke old token
        token.revoke();
        refreshTokenRepository.save(token);

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", token.getUserId()));

        if (!user.isActive()) {
            throw new BusinessException("ACCOUNT_INACTIVE", "Tài khoản người dùng đang bị khóa");
        }

        return createAuthResponse(user);
    }

    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            String hash = hashToken(rawRefreshToken.trim());
            refreshTokenRepository.findByTokenHash(hash).ifPresent(token -> {
                token.revoke();
                refreshTokenRepository.save(token);
            });
        }
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile() {
        UUID userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return UserProfileResponse.from(user);
    }

    private AuthResponse createAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(user);

        // Generate opaque refresh token string
        String rawRefreshToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String hash = hashToken(rawRefreshToken);
        Instant expiry = Instant.now().plus(refreshTokenExpirationDays, ChronoUnit.DAYS);

        RefreshToken refreshToken = new RefreshToken(UUID.randomUUID(), user.getId(), hash, expiry);
        refreshTokenRepository.save(refreshToken);

        long expiresInSeconds = accessTokenExpirationMinutes * 60;
        return new AuthResponse(accessToken, rawRefreshToken, expiresInSeconds, UserProfileResponse.from(user));
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
