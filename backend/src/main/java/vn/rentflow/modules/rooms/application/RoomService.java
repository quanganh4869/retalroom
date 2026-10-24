package vn.rentflow.modules.rooms.application;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.rentflow.modules.audit.application.AuditService;
import vn.rentflow.modules.properties.domain.Property;
import vn.rentflow.modules.properties.infrastructure.persistence.PropertyRepository;
import vn.rentflow.modules.rooms.api.dto.CreateRoomRequest;
import vn.rentflow.modules.rooms.api.dto.RoomResponse;
import vn.rentflow.modules.rooms.api.dto.UpdateRoomRequest;
import vn.rentflow.modules.rooms.domain.Room;
import vn.rentflow.modules.rooms.domain.RoomStatus;
import vn.rentflow.modules.rooms.infrastructure.persistence.RoomRepository;
import vn.rentflow.security.SecurityUtils;
import vn.rentflow.shared.dto.PagedResponse;
import vn.rentflow.shared.exception.BusinessException;
import vn.rentflow.shared.exception.ResourceNotFoundException;

import java.util.UUID;

@Service
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final PropertyRepository propertyRepository;
    private final AuditService auditService;

    public RoomService(RoomRepository roomRepository,
                       PropertyRepository propertyRepository,
                       AuditService auditService) {
        this.roomRepository = roomRepository;
        this.propertyRepository = propertyRepository;
        this.auditService = auditService;
    }

    public RoomResponse createRoom(CreateRoomRequest request) {
        // Enforce ownership: caller must own property unless ADMIN
        verifyPropertyOwnership(request.getPropertyId());

        if (roomRepository.existsByPropertyIdAndRoomNumber(request.getPropertyId(), request.getRoomNumber().trim())) {
            throw new BusinessException("ROOM_ALREADY_EXISTS",
                    String.format("Số phòng '%s' đã tồn tại trong khu trọ này", request.getRoomNumber()));
        }

        Room room = new Room(
                UUID.randomUUID(),
                request.getPropertyId(),
                request.getRoomNumber().trim(),
                request.getFloor(),
                request.getBasePrice(),
                request.getAreaSqm()
        );

        Room saved = roomRepository.save(room);

        auditService.record(
                SecurityUtils.getCurrentUser().map(u -> u.id()).orElse(null),
                SecurityUtils.getCurrentUser().map(u -> u.email()).orElse(null),
                "ROOM_CREATED",
                "Room",
                saved.getId().toString(),
                "SUCCESS",
                String.format("Tạo phòng %s tại khu trọ %s", saved.getRoomNumber(), saved.getPropertyId())
        );

        return RoomResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoomById(UUID id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", id));
        return RoomResponse.from(room);
    }

    @Transactional(readOnly = true)
    public PagedResponse<RoomResponse> listRooms(UUID propertyId, RoomStatus status, Pageable pageable) {
        Page<Room> page;
        if (propertyId != null && status != null) {
            page = roomRepository.findByPropertyIdAndStatus(propertyId, status, pageable);
        } else if (propertyId != null) {
            page = roomRepository.findByPropertyId(propertyId, pageable);
        } else {
            page = roomRepository.findAll(pageable);
        }

        return PagedResponse.from(page.map(RoomResponse::from));
    }

    public RoomResponse updateRoom(UUID id, UpdateRoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", id));

        // Enforce ownership
        verifyPropertyOwnership(room.getPropertyId());

        if (request.getRoomNumber() != null && !request.getRoomNumber().trim().equalsIgnoreCase(room.getRoomNumber())) {
            boolean exists = roomRepository.existsByPropertyIdAndRoomNumber(room.getPropertyId(), request.getRoomNumber().trim());
            if (exists) {
                throw new BusinessException("ROOM_ALREADY_EXISTS",
                        String.format("Số phòng '%s' đã tồn tại trong khu trọ này", request.getRoomNumber()));
            }
        }

        room.updateDetails(
                request.getRoomNumber(),
                request.getFloor(),
                request.getBasePrice(),
                request.getAreaSqm(),
                request.getStatus()
        );

        Room saved = roomRepository.save(room);

        auditService.record(
                SecurityUtils.getCurrentUser().map(u -> u.id()).orElse(null),
                SecurityUtils.getCurrentUser().map(u -> u.email()).orElse(null),
                "ROOM_UPDATED",
                "Room",
                saved.getId().toString(),
                "SUCCESS",
                String.format("Cập nhật phòng %s", saved.getRoomNumber())
        );

        return RoomResponse.from(saved);
    }

    public void deleteRoom(UUID id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", id));

        verifyPropertyOwnership(room.getPropertyId());

        roomRepository.delete(room);

        auditService.record(
                SecurityUtils.getCurrentUser().map(u -> u.id()).orElse(null),
                SecurityUtils.getCurrentUser().map(u -> u.email()).orElse(null),
                "ROOM_DELETED",
                "Room",
                id.toString(),
                "SUCCESS",
                String.format("Xóa phòng %s", room.getRoomNumber())
        );
    }

    private void verifyPropertyOwnership(UUID propertyId) {
        // If not authenticated in context (e.g. some internal background tasks), let it pass or check
        if (SecurityUtils.getCurrentUser().isEmpty() || SecurityUtils.isAdmin()) {
            return;
        }

        UUID currentUserId = SecurityUtils.getCurrentUserId();
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property", propertyId));

        if (!property.getLandlordId().equals(currentUserId)) {
            throw new AccessDeniedException("Bạn không có quyền quản lý khu trọ này");
        }
    }
}
