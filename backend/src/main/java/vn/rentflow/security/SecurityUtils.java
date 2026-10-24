package vn.rentflow.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import vn.rentflow.shared.exception.BusinessException;

import java.util.Optional;
import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static Optional<AuthenticatedUser> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthenticatedUser user) {
            return Optional.of(user);
        }
        return Optional.empty();
    }

    public static AuthenticatedUser getRequiredCurrentUser() {
        return getCurrentUser().orElseThrow(() ->
                new BusinessException("UNAUTHORIZED", "Người dùng chưa được xác thực"));
    }

    public static UUID getCurrentUserId() {
        return getRequiredCurrentUser().id();
    }

    public static String getCurrentUserRole() {
        return getRequiredCurrentUser().role();
    }

    public static boolean hasRole(String role) {
        return getCurrentUser()
                .map(u -> u.role().equalsIgnoreCase(role))
                .orElse(false);
    }

    public static boolean isAdmin() {
        return hasRole("ADMIN");
    }

    public static boolean isLandlord() {
        return hasRole("LANDLORD");
    }

    public static boolean isTenant() {
        return hasRole("TENANT");
    }
}
