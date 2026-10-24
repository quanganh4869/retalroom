package vn.rentflow.modules.onboarding.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.rentflow.modules.onboarding.domain.Invitation;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, UUID> {

    Optional<Invitation> findByInviteCode(String inviteCode);

    boolean existsByInviteCode(String inviteCode);

    Optional<Invitation> findFirstByPropertyIdOrderByCreatedAtDesc(UUID propertyId);

    Optional<Invitation> findFirstByLandlordIdOrderByCreatedAtDesc(UUID landlordId);
}
