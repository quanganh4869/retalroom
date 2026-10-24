package vn.rentflow.security;

import java.io.Serializable;
import java.util.UUID;

public record AuthenticatedUser(UUID id, String email, String role) implements Serializable {
}
