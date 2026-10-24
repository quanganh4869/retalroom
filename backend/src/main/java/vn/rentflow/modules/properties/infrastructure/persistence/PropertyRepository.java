package vn.rentflow.modules.properties.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.rentflow.modules.properties.domain.Property;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PropertyRepository extends JpaRepository<Property, UUID> {

    Page<Property> findByLandlordId(UUID landlordId, Pageable pageable);

    Optional<Property> findByIdAndLandlordId(UUID id, UUID landlordId);

    boolean existsByIdAndLandlordId(UUID id, UUID landlordId);
}
