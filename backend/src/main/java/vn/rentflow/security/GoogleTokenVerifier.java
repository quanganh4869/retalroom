package vn.rentflow.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import vn.rentflow.shared.exception.BusinessException;

import java.util.Collections;

@Component
public class GoogleTokenVerifier {

    private static final Logger log = LoggerFactory.getLogger(GoogleTokenVerifier.class);

    @Value("${rentflow.security.google.client-id:}")
    private String googleClientId;

    public GoogleUserInfo verify(String idTokenString) {
        if (idTokenString == null || idTokenString.isBlank()) {
            throw new BusinessException("INVALID_GOOGLE_TOKEN", "Google ID Token không được để trống");
        }

        // 1. Support development / testing token
        if (idTokenString.startsWith("dev-google-token:")) {
            String[] parts = idTokenString.split(":");
            String email = parts.length > 1 ? parts[1] : "user@gmail.com";
            String name = parts.length > 2 ? parts[2] : "Google User";
            String sub = "dev-google-sub-" + email.hashCode();
            log.info("Verified dev Google token for: {}", email);
            return new GoogleUserInfo(sub, email, name, "https://lh3.googleusercontent.com/a/default-user");
        }

        // 2. Real Google OAuth ID Token verification
        try {
            GoogleIdTokenVerifier.Builder verifierBuilder = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance());

            if (googleClientId != null && !googleClientId.isBlank()) {
                verifierBuilder.setAudience(Collections.singletonList(googleClientId));
            }

            GoogleIdTokenVerifier verifier = verifierBuilder.build();
            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                boolean emailVerified = Boolean.TRUE.equals(payload.getEmailVerified());
                if (!emailVerified) {
                    throw new BusinessException("EMAIL_NOT_VERIFIED", "Email Google chưa được xác minh.");
                }

                String userId = payload.getSubject();
                String email = payload.getEmail();
                String name = (String) payload.get("name");
                String pictureUrl = (String) payload.get("picture");

                return new GoogleUserInfo(userId, email, name != null ? name : "Google User", pictureUrl);
            } else {
                log.warn("Google ID Token verification failed: token is null");
                throw new BusinessException("INVALID_GOOGLE_TOKEN", "Xác thực tài khoản Google không thành công");
            }
        } catch (BusinessException be) {
            throw be;
        } catch (Exception e) {
            log.error("Error verifying Google ID token: {}", e.getMessage(), e);
            throw new BusinessException("INVALID_GOOGLE_TOKEN", "Không thể xác minh token Google: " + e.getMessage());
        }
    }

    public record GoogleUserInfo(String sub, String email, String name, String pictureUrl) {
    }
}
