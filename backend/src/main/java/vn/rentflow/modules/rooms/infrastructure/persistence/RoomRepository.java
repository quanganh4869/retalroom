package vn.rentflow.modules.rooms.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.rentflow.modules.rooms.domain.Room;
import vn.rentflow.modules.rooms.domain.RoomStatus;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {

    Page<Room> findByPropertyId(UUID propertyId, Pageable pageable);

    Page<Room> findByPropertyIdAndStatus(UUID propertyId, RoomStatus status, Pageable pageable);

    Optional<Room> findByPropertyIdAndRoomNumber(UUID propertyId, String roomNumber);

    boolean existsByPropertyIdAndRoomNumber(UUID propertyId, String roomNumber);
}
