package vn.rentflow.modules.rooms;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.rentflow.modules.audit.application.AuditService;
import vn.rentflow.modules.properties.infrastructure.persistence.PropertyRepository;
import vn.rentflow.modules.rooms.api.dto.CreateRoomRequest;
import vn.rentflow.modules.rooms.api.dto.RoomResponse;
import vn.rentflow.modules.rooms.api.dto.UpdateRoomRequest;
import vn.rentflow.modules.rooms.application.RoomService;
import vn.rentflow.modules.rooms.domain.Room;
import vn.rentflow.modules.rooms.domain.RoomStatus;
import vn.rentflow.modules.rooms.infrastructure.persistence.RoomRepository;
import vn.rentflow.shared.exception.BusinessException;
import vn.rentflow.shared.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private RoomService roomService;

    private UUID propertyId;
    private UUID roomId;

    @BeforeEach
    void setUp() {
        propertyId = UUID.randomUUID();
        roomId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Tạo phòng mới thành công khi số phòng chưa tồn tại trong cơ sở")
    void createRoom_success() {
        CreateRoomRequest request = new CreateRoomRequest(
                propertyId, "P.101", 1, BigDecimal.valueOf(3500000), BigDecimal.valueOf(25.0)
        );

        when(roomRepository.existsByPropertyIdAndRoomNumber(propertyId, "P.101")).thenReturn(false);
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RoomResponse response = roomService.createRoom(request);

        assertThat(response).isNotNull();
        assertThat(response.getRoomNumber()).isEqualTo("P.101");
        assertThat(response.getPropertyId()).isEqualTo(propertyId);
        assertThat(response.getStatus()).isEqualTo(RoomStatus.AVAILABLE);
        verify(roomRepository).save(any(Room.class));
    }

    @Test
    @DisplayName("Ném BusinessException khi tạo phòng với số phòng đã tồn tại")
    void createRoom_duplicateRoomNumber_throwsBusinessException() {
        CreateRoomRequest request = new CreateRoomRequest(
                propertyId, "P.101", 1, BigDecimal.valueOf(3500000), BigDecimal.valueOf(25.0)
        );

        when(roomRepository.existsByPropertyIdAndRoomNumber(propertyId, "P.101")).thenReturn(true);

        assertThatThrownBy(() -> roomService.createRoom(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("P.101");

        verify(roomRepository, never()).save(any(Room.class));
    }

    @Test
    @DisplayName("Tìm phòng theo ID thành công")
    void getRoomById_success() {
        Room room = new Room(roomId, propertyId, "P.202", 2, BigDecimal.valueOf(4000000), BigDecimal.valueOf(28.0));
        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));

        RoomResponse response = roomService.getRoomById(roomId);

        assertThat(response.getId()).isEqualTo(roomId);
        assertThat(response.getRoomNumber()).isEqualTo("P.202");
    }

    @Test
    @DisplayName("Ném ResourceNotFoundException khi không tìm thấy phòng")
    void getRoomById_notFound_throwsException() {
        when(roomRepository.findById(roomId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.getRoomById(roomId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Cập nhật phòng thành công")
    void updateRoom_success() {
        Room room = new Room(roomId, propertyId, "P.202", 2, BigDecimal.valueOf(4000000), BigDecimal.valueOf(28.0));
        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateRoomRequest request = new UpdateRoomRequest();
        request.setBasePrice(BigDecimal.valueOf(4500000));
        request.setStatus(RoomStatus.OCCUPIED);

        RoomResponse updated = roomService.updateRoom(roomId, request);

        assertThat(updated.getBasePrice()).isEqualByComparingTo(BigDecimal.valueOf(4500000));
        assertThat(updated.getStatus()).isEqualTo(RoomStatus.OCCUPIED);
    }

    @Test
    @DisplayName("Xóa phòng thành công")
    void deleteRoom_success() {
        Room room = new Room(roomId, propertyId, "P.202", 2, BigDecimal.valueOf(4000000), BigDecimal.valueOf(28.0));
        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));

        roomService.deleteRoom(roomId);

        verify(roomRepository).delete(room);
    }
}
