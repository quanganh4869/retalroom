package vn.rentflow.modules.rooms.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.rentflow.modules.rooms.api.dto.CreateRoomRequest;
import vn.rentflow.modules.rooms.api.dto.RoomResponse;
import vn.rentflow.modules.rooms.api.dto.UpdateRoomRequest;
import vn.rentflow.modules.rooms.application.RoomService;
import vn.rentflow.modules.rooms.domain.RoomStatus;
import vn.rentflow.shared.dto.ApiResponse;
import vn.rentflow.shared.dto.PagedResponse;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rooms")
@Tag(name = "Rooms", description = "Các API quản lý danh mục phòng trọ thuộc cơ sở / toà nhà")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
    @Operation(summary = "Tạo phòng mới", description = "Thêm một phòng trọ mới vào khu trọ (Yêu cầu quyền Chủ trọ hoặc Admin)")
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(@Valid @RequestBody CreateRoomRequest request) {
        RoomResponse created = roomService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo phòng trọ thành công", created));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy chi tiết phòng", description = "Xem thông tin chi tiết của một phòng theo mã định danh UUID")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoomById(@PathVariable UUID id) {
        RoomResponse room = roomService.getRoomById(id);
        return ResponseEntity.ok(ApiResponse.success(room));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Danh sách phòng trọ", description = "Tra cứu danh sách phòng có phân trang và lọc theo khu trọ, trạng thái")
    public ResponseEntity<ApiResponse<PagedResponse<RoomResponse>>> listRooms(
            @RequestParam(required = false) UUID propertyId,
            @RequestParam(required = false) RoomStatus status,
            @PageableDefault(size = 20, sort = "roomNumber", direction = Sort.Direction.ASC) Pageable pageable) {
        PagedResponse<RoomResponse> rooms = roomService.listRooms(propertyId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(rooms));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
    @Operation(summary = "Cập nhật phòng", description = "Chỉnh sửa thông số diện tích, giá thuê, trạng thái phòng")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoom(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRoomRequest request) {
        RoomResponse updated = roomService.updateRoom(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật phòng thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LANDLORD', 'ADMIN')")
    @Operation(summary = "Xóa phòng", description = "Xóa một phòng trọ khỏi hệ thống")
    public ResponseEntity<Void> deleteRoom(@PathVariable UUID id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}
