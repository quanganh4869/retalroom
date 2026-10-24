package vn.rentflow.modules.onboarding.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.rentflow.modules.onboarding.domain.Tenancy;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenancyRepository extends JpaRepository<Tenancy, UUID> {

    List<Tenancy> findByTenantId(UUID tenantId);

    Optional<Tenancy> findFirstByTenantIdOrderByCreatedAtDesc(UUID tenantId);

    boolean existsByTenantIdAndRoomId(UUID tenantId, UUID roomId);
}
