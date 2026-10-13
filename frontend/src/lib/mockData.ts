// Mock Data mirroring the downloaded PNG screens for RentFlow

export interface PropertyItem {
  id: string;
  name: string;
  address: string;
  totalRooms: number;
  rentedRooms: number;
  monthlyRevenue: number;
  manager: string;
}

export interface RoomOccupant {
  id: string;
  name: string;
  phone: string;
  idCard: string;
  isPrimary?: boolean; // Người đại diện hợp đồng
  joinedAt?: string;
}

export interface RoomItem {
  id: string;
  code: string; // e.g. "P.101"
  propertyId: string;
  propertyName: string;
  floor: number;
  type: string; // "Studio", "1PN", "2PN", "Duplex", "Ký túc xá"
  area: number; // m2
  price: number;
  status: 'occupied' | 'vacant' | 'reserved' | 'maintenance';
  tenantName?: string;
  tenantPhone?: string;
  leaseEnd?: string;
  debt?: number;
  electricUnitPrice?: number; // VND / kWh
  waterUnitPrice?: number; // VND / m3
  maxOccupants?: number; // Số người ở tối đa cho phép
  occupants?: RoomOccupant[]; // Danh sách các thành viên đang ở cùng phòng
}

export interface InvoiceItem {
  id: string; // "inv-1"
  code: string; // "INV-2403-01"
  roomCode: string;
  propertyId?: string;
  propertyName?: string;
  tenantName: string;
  tenantPhone?: string;
  period: string; // "Tháng 03/2024"
  periodKey?: string; // "2024-03"
  issueDate?: string;
  roomFee: number;
  electricFee: number;
  waterFee: number;
  serviceFee: number;
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  dueDate: string;
}

export interface PaymentItem {
  id: string;
  code: string;
  invoiceCode: string;
  roomCode: string;
  propertyId?: string;
  propertyName?: string;
  tenantName: string;
  amount: number;
  method: 'Chuyển khoản' | 'Tiền mặt' | 'VNPay' | 'MoMo';
  date: string;
  period?: string;
  status?: 'confirmed' | 'pending' | 'rejected';
  recordedBy: string;
  note?: string;
}

export interface ExpenseItem {
  id: string;
  code: string;
  date: string;
  propertyId: string;
  propertyName: string;
  category: 'Sửa chữa điện nước' | 'Vệ sinh môi trường' | 'Bảo trì thang máy' | 'Internet & Truyền hình' | 'An ninh & PCCC' | 'Khác';
  description: string;
  amount: number;
  status: 'paid' | 'pending';
  payer: string;
  relatedMaintenanceId?: string;
}

export interface MaintenanceItem {
  id: string; // "REQ-0241"
  roomCode: string;
  propertyName: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  category: 'Điện' | 'Nước' | 'Nội thất' | 'Điều hòa' | 'Khác';
  assignee?: string;
  cost?: number;
  createdAt: string;
  tenantName: string;
  tenantPhone: string;
}

export interface ContractItem {
  id: string; // "CT-2023-041"
  roomCode: string;
  tenantName: string;
  tenantPhone: string;
  startDate: string;
  endDate: string;
  depositAmount: number;
  monthlyRent: number;
  paymentCycle: string;
  status: 'active' | 'expiring' | 'expired' | 'terminated';
}

export interface MeterReadingItem {
  id: string;
  roomCode: string;
  propertyId?: string;
  propertyName?: string;
  tenantName: string;
  period?: string;
  periodKey?: string;
  prevElectric: number;
  currElectric: number;
  prevWater: number;
  currWater: number;
  electricUnitPrice: number;
  waterUnitPrice: number;
  updatedAt: string;
  status?: 'confirmed' | 'pending' | 'disputed';
  invoiceCode?: string;
  meterPhoto?: string;
  note?: string;
}

export interface DepositItem {
  id: string;
  contractCode: string;
  roomCode: string;
  tenantName: string;
  amount: number;
  depositDate: string;
  refundStatus: 'holding' | 'refunded' | 'settlement_pending' | 'deducted';
  refundAmount?: number;
}

export interface TenantItem {
  id: string;
  name: string;
  phone: string;
  idCard: string;
  roomCode: string;
  propertyName: string;
  leaseStart: string;
  leaseEnd: string;
  deposit: number;
  status: 'active' | 'inactive';
  isPrimary?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'payment' | 'contract' | 'maintenance' | 'system';
  createdAt: string;
  read: boolean;
}

// Sample Collections
export const mockProperties: PropertyItem[] = [
  { id: '1', name: 'Nhà trọ Hưng Phát', address: '123/4 Lê Văn Sỹ, P.13, Q.3, TP.HCM', totalRooms: 24, rentedRooms: 19, monthlyRevenue: 86400000, manager: 'Nguyễn An' },
  { id: '2', name: 'Căn hộ dịch vụ Sen Vàng', address: '45 Nguyễn Thị Minh Khai, P.Bến Nghé, Q.1', totalRooms: 12, rentedRooms: 11, monthlyRevenue: 110000000, manager: 'Nguyễn An' },
  { id: '3', name: 'Ký túc xá Sinh viên Bình An', address: '88 Đường số 7, Linh Trung, TP. Thủ Đức', totalRooms: 30, rentedRooms: 22, monthlyRevenue: 55000000, manager: 'Trần Văn Bình' },
];

export const mockRooms: RoomItem[] = [
  {
    id: 'r1',
    code: 'P.101',
    propertyId: '1',
    propertyName: 'Nhà trọ Hưng Phát',
    floor: 1,
    type: 'Studio',
    area: 25,
    price: 4200000,
    status: 'occupied',
    tenantName: 'Lê Hoàng Nam',
    tenantPhone: '0901234567',
    leaseEnd: '2024-12-31',
    debt: 0,
    electricUnitPrice: 3800,
    waterUnitPrice: 20000,
    maxOccupants: 3,
    occupants: [
      { id: 'oc-1', name: 'Lê Hoàng Nam', phone: '0901234567', idCard: '079201004123', isPrimary: true, joinedAt: '01/12/2023' },
      { id: 'oc-2', name: 'Nguyễn Tiến Dũng', phone: '0902345671', idCard: '079201009876', isPrimary: false, joinedAt: '01/12/2023' },
    ],
  },
  {
    id: 'r2',
    code: 'P.102',
    propertyId: '1',
    propertyName: 'Nhà trọ Hưng Phát',
    floor: 1,
    type: 'Studio',
    area: 24,
    price: 4500000,
    status: 'occupied',
    tenantName: 'Trần Thị Mai',
    tenantPhone: '0912345678',
    leaseEnd: '2024-09-15',
    debt: 0,
    electricUnitPrice: 3800,
    waterUnitPrice: 20000,
    maxOccupants: 2,
    occupants: [
      { id: 'oc-3', name: 'Trần Thị Mai', phone: '0912345678', idCard: '079198008432', isPrimary: true, joinedAt: '15/09/2023' },
    ],
  },
  {
    id: 'r3',
    code: 'P.103',
    propertyId: '1',
    propertyName: 'Nhà trọ Hưng Phát',
    floor: 1,
    type: '1PN',
    area: 28,
    price: 5200000,
    status: 'vacant',
    debt: 0,
    electricUnitPrice: 3800,
    waterUnitPrice: 20000,
    maxOccupants: 4,
    occupants: [],
  },
  {
    id: 'r4',
    code: 'P.201',
    propertyId: '1',
    propertyName: 'Nhà trọ Hưng Phát',
    floor: 2,
    type: 'Studio',
    area: 22,
    price: 4200000,
    status: 'occupied',
    tenantName: 'Nguyễn Văn Đạt',
    tenantPhone: '0933445566',
    leaseEnd: '2024-08-30',
    debt: 4200000,
    electricUnitPrice: 3800,
    waterUnitPrice: 20000,
    maxOccupants: 3,
    occupants: [
      { id: 'oc-4', name: 'Nguyễn Văn Đạt', phone: '0933445566', idCard: '079200003189', isPrimary: true, joinedAt: '30/08/2023' },
      { id: 'oc-5', name: 'Lê Tuấn Kiệt', phone: '0938887711', idCard: '079200008899', isPrimary: false, joinedAt: '01/10/2023' },
      { id: 'oc-6', name: 'Trần Minh Quân', phone: '0939112233', idCard: '079200004455', isPrimary: false, joinedAt: '15/11/2023' },
    ],
  },
  {
    id: 'r5',
    code: 'P.202',
    propertyId: '1',
    propertyName: 'Nhà trọ Hưng Phát',
    floor: 2,
    type: '1PN',
    area: 30,
    price: 5500000,
    status: 'reserved',
    tenantName: 'Phạm Minh Tú',
    tenantPhone: '0988776655',
    leaseEnd: '2025-03-01',
    debt: 0,
    electricUnitPrice: 3800,
    waterUnitPrice: 20000,
    maxOccupants: 4,
    occupants: [
      { id: 'oc-7', name: 'Phạm Minh Tú', phone: '0988776655', idCard: '079194002233', isPrimary: true, joinedAt: '01/03/2024' },
      { id: 'oc-8', name: 'Đỗ Thùy Trang', phone: '0988776611', idCard: '079196005566', isPrimary: false, joinedAt: '01/03/2024' },
    ],
  },
  {
    id: 'r6',
    code: 'P.203',
    propertyId: '1',
    propertyName: 'Nhà trọ Hưng Phát',
    floor: 2,
    type: 'Studio',
    area: 22,
    price: 4200000,
    status: 'maintenance',
    debt: 0,
    electricUnitPrice: 3800,
    waterUnitPrice: 20000,
    maxOccupants: 2,
    occupants: [],
  },
  {
    id: 'r7',
    code: 'P.301',
    propertyId: '1',
    propertyName: 'Nhà trọ Hưng Phát',
    floor: 3,
    type: '2PN',
    area: 45,
    price: 7500000,
    status: 'occupied',
    tenantName: 'Võ Thanh Tùng',
    tenantPhone: '0977112233',
    leaseEnd: '2025-01-15',
    debt: 0,
    electricUnitPrice: 3800,
    waterUnitPrice: 20000,
    maxOccupants: 5,
    occupants: [
      { id: 'oc-9', name: 'Võ Thanh Tùng', phone: '0977112233', idCard: '079195007654', isPrimary: true, joinedAt: '15/01/2024' },
      { id: 'oc-10', name: 'Hoàng Kim Chi', phone: '0977223344', idCard: '079196001122', isPrimary: false, joinedAt: '15/01/2024' },
      { id: 'oc-11', name: 'Võ Quốc Anh', phone: '0977334455', idCard: '079203009988', isPrimary: false, joinedAt: '15/01/2024' },
      { id: 'oc-12', name: 'Võ Thu Hương', phone: '0977445566', idCard: '079205001234', isPrimary: false, joinedAt: '01/02/2024' },
    ],
  },
  {
    id: 'r8',
    code: 'P.302',
    propertyId: '1',
    propertyName: 'Nhà trọ Hưng Phát',
    floor: 3,
    type: '1PN',
    area: 28,
    price: 5000000,
    status: 'occupied',
    tenantName: 'Bùi Lan Anh',
    tenantPhone: '0944556677',
    leaseEnd: '2024-11-20',
    debt: 0,
    electricUnitPrice: 3800,
    waterUnitPrice: 20000,
    maxOccupants: 3,
    occupants: [
      { id: 'oc-13', name: 'Bùi Lan Anh', phone: '0944556677', idCard: '079202009812', isPrimary: true, joinedAt: '20/11/2023' },
      { id: 'oc-14', name: 'Đặng Thanh Thảo', phone: '0944889900', idCard: '079202005544', isPrimary: false, joinedAt: '20/11/2023' },
    ],
  },
  // Rooms for Property 2: Căn hộ dịch vụ Sen Vàng
  {
    id: 'r9',
    code: 'SV.101',
    propertyId: '2',
    propertyName: 'Căn hộ dịch vụ Sen Vàng',
    floor: 1,
    type: 'Duplex',
    area: 50,
    price: 9500000,
    status: 'occupied',
    tenantName: 'Lý Quốc Bảo',
    tenantPhone: '0908123456',
    leaseEnd: '2025-06-30',
    debt: 0,
    electricUnitPrice: 4000,
    waterUnitPrice: 25000,
    maxOccupants: 4,
    occupants: [
      { id: 'oc-15', name: 'Lý Quốc Bảo', phone: '0908123456', idCard: '079192004455', isPrimary: true, joinedAt: '01/06/2024' },
      { id: 'oc-16', name: 'Nguyễn Ánh Nguyệt', phone: '0908654321', idCard: '079194008899', isPrimary: false, joinedAt: '01/06/2024' },
    ],
  },
  {
    id: 'r10',
    code: 'SV.102',
    propertyId: '2',
    propertyName: 'Căn hộ dịch vụ Sen Vàng',
    floor: 1,
    type: '1PN Luxury',
    area: 38,
    price: 8000000,
    status: 'vacant',
    debt: 0,
    electricUnitPrice: 4000,
    waterUnitPrice: 25000,
    maxOccupants: 3,
    occupants: [],
  },
  // Rooms for Property 3: Ký túc xá Sinh viên Bình An (Multi-occupant dorm)
  {
    id: 'r11',
    code: 'KTX.201',
    propertyId: '3',
    propertyName: 'Ký túc xá Sinh viên Bình An',
    floor: 2,
    type: 'Phòng 6 giường KTX',
    area: 40,
    price: 6000000,
    status: 'occupied',
    tenantName: 'Lê Văn Trọng (Trưởng phòng)',
    tenantPhone: '0919998877',
    leaseEnd: '2025-07-31',
    debt: 0,
    electricUnitPrice: 3500,
    waterUnitPrice: 18000,
    maxOccupants: 6,
    occupants: [
      { id: 'oc-17', name: 'Lê Văn Trọng', phone: '0919998877', idCard: '079203001122', isPrimary: true, joinedAt: '01/09/2023' },
      { id: 'oc-18', name: 'Trần Hữu Thắng', phone: '0919998811', idCard: '079203002233', isPrimary: false, joinedAt: '01/09/2023' },
      { id: 'oc-19', name: 'Nguyễn Hải Nam', phone: '0919998822', idCard: '079203003344', isPrimary: false, joinedAt: '01/09/2023' },
      { id: 'oc-20', name: 'Đoàn Nhật Minh', phone: '0919998833', idCard: '079203004455', isPrimary: false, joinedAt: '15/10/2023' },
      { id: 'oc-21', name: 'Phan Văn Hậu', phone: '0919998844', idCard: '079203005566', isPrimary: false, joinedAt: '01/12/2023' },
    ],
  },
  {
    id: 'r12',
    code: 'KTX.202',
    propertyId: '3',
    propertyName: 'Ký túc xá Sinh viên Bình An',
    floor: 2,
    type: 'Phòng 4 giường KTX',
    area: 32,
    price: 4800000,
    status: 'vacant',
    debt: 0,
    electricUnitPrice: 3500,
    waterUnitPrice: 18000,
    maxOccupants: 4,
    occupants: [],
  },
];

export const mockInvoices: InvoiceItem[] = [
  // Tháng 03/2024 (2024-03)
  { id: 'inv-1', code: 'INV-2403-01', roomCode: 'P.101', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Lê Hoàng Nam', tenantPhone: '0901234567', period: 'Tháng 03/2024', periodKey: '2024-03', issueDate: '01/03/2024', roomFee: 4200000, electricFee: 342000, waterFee: 120000, serviceFee: 150000, totalAmount: 4812000, paidAmount: 4812000, debtAmount: 0, status: 'paid', dueDate: '05/03/2024' },
  { id: 'inv-2', code: 'INV-2403-02', roomCode: 'P.201', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Nguyễn Văn Đạt', tenantPhone: '0933445566', period: 'Tháng 03/2024', periodKey: '2024-03', issueDate: '01/03/2024', roomFee: 4200000, electricFee: 410400, waterFee: 140000, serviceFee: 150000, totalAmount: 4900400, paidAmount: 0, debtAmount: 4900400, status: 'overdue', dueDate: '05/03/2024' },
  { id: 'inv-3', code: 'INV-2403-03', roomCode: 'P.301', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Võ Thanh Tùng', tenantPhone: '0977112233', period: 'Tháng 03/2024', periodKey: '2024-03', issueDate: '01/03/2024', roomFee: 7500000, electricFee: 619400, waterFee: 200000, serviceFee: 200000, totalAmount: 8519400, paidAmount: 4000000, debtAmount: 4519400, status: 'partial', dueDate: '05/03/2024' },
  { id: 'inv-4', code: 'INV-2403-04', roomCode: 'P.302', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Bùi Lan Anh', tenantPhone: '0944556677', period: 'Tháng 03/2024', periodKey: '2024-03', issueDate: '01/03/2024', roomFee: 5000000, electricFee: 285000, waterFee: 100000, serviceFee: 150000, totalAmount: 5535000, paidAmount: 0, debtAmount: 5535000, status: 'pending', dueDate: '10/03/2024' },

  // Tháng 02/2024 (2024-02)
  { id: 'inv-5', code: 'INV-2402-01', roomCode: 'P.101', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Lê Hoàng Nam', tenantPhone: '0901234567', period: 'Tháng 02/2024', periodKey: '2024-02', issueDate: '01/02/2024', roomFee: 4200000, electricFee: 323000, waterFee: 100000, serviceFee: 150000, totalAmount: 4773000, paidAmount: 4773000, debtAmount: 0, status: 'paid', dueDate: '05/02/2024' },
  { id: 'inv-6', code: 'INV-2402-02', roomCode: 'P.102', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Trần Thị Mai', tenantPhone: '0912345678', period: 'Tháng 02/2024', periodKey: '2024-02', issueDate: '01/02/2024', roomFee: 4500000, electricFee: 342000, waterFee: 120000, serviceFee: 150000, totalAmount: 5112000, paidAmount: 5112000, debtAmount: 0, status: 'paid', dueDate: '05/02/2024' },
  { id: 'inv-7', code: 'INV-2402-03', roomCode: 'P.201', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Nguyễn Văn Đạt', tenantPhone: '0933445566', period: 'Tháng 02/2024', periodKey: '2024-02', issueDate: '01/02/2024', roomFee: 4200000, electricFee: 380000, waterFee: 120000, serviceFee: 150000, totalAmount: 4850000, paidAmount: 4850000, debtAmount: 0, status: 'paid', dueDate: '05/02/2024' },
  { id: 'inv-8', code: 'INV-2402-04', roomCode: 'P.301', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Võ Thanh Tùng', tenantPhone: '0977112233', period: 'Tháng 02/2024', periodKey: '2024-02', issueDate: '01/02/2024', roomFee: 7500000, electricFee: 570000, waterFee: 180000, serviceFee: 200000, totalAmount: 8450000, paidAmount: 8450000, debtAmount: 0, status: 'paid', dueDate: '05/02/2024' },

  // Tháng 01/2024 (2024-01)
  { id: 'inv-9', code: 'INV-2401-01', roomCode: 'P.101', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Lê Hoàng Nam', tenantPhone: '0901234567', period: 'Tháng 01/2024', periodKey: '2024-01', issueDate: '01/01/2024', roomFee: 4200000, electricFee: 361000, waterFee: 120000, serviceFee: 150000, totalAmount: 4831000, paidAmount: 4831000, debtAmount: 0, status: 'paid', dueDate: '05/01/2024' },
  { id: 'inv-10', code: 'INV-2401-02', roomCode: 'P.102', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Trần Thị Mai', tenantPhone: '0912345678', period: 'Tháng 01/2024', periodKey: '2024-01', issueDate: '01/01/2024', roomFee: 4500000, electricFee: 323000, waterFee: 100000, serviceFee: 150000, totalAmount: 5073000, paidAmount: 5073000, debtAmount: 0, status: 'paid', dueDate: '05/01/2024' },
  { id: 'inv-11', code: 'INV-2401-03', roomCode: 'P.201', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Nguyễn Văn Đạt', tenantPhone: '0933445566', period: 'Tháng 01/2024', periodKey: '2024-01', issueDate: '01/01/2024', roomFee: 4200000, electricFee: 399000, waterFee: 140000, serviceFee: 150000, totalAmount: 4889000, paidAmount: 4889000, debtAmount: 0, status: 'paid', dueDate: '05/01/2024' },

  // Tháng 12/2023 (2023-12)
  { id: 'inv-12', code: 'INV-2312-01', roomCode: 'P.101', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Lê Hoàng Nam', tenantPhone: '0901234567', period: 'Tháng 12/2023', periodKey: '2023-12', issueDate: '01/12/2023', roomFee: 4200000, electricFee: 323000, waterFee: 100000, serviceFee: 150000, totalAmount: 4773000, paidAmount: 4773000, debtAmount: 0, status: 'paid', dueDate: '05/12/2023' },
];

export const mockPayments: PaymentItem[] = [
  { id: 'pay-1', code: 'PAY-2403-01', invoiceCode: 'INV-2403-01', roomCode: 'P.101', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Lê Hoàng Nam', amount: 4812000, method: 'Chuyển khoản', date: '03/03/2024 14:20', period: 'Tháng 03/2024', status: 'confirmed', recordedBy: 'Nguyễn An', note: 'Chuyển khoản qua Techcombank VietQR' },
  { id: 'pay-2', code: 'PAY-2403-02', invoiceCode: 'INV-2403-03', roomCode: 'P.301', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Võ Thanh Tùng', amount: 4000000, method: 'Tiền mặt', date: '04/03/2024 18:30', period: 'Tháng 03/2024', status: 'confirmed', recordedBy: 'Nguyễn An', note: 'Nộp tiền mặt đợt 1' },
  { id: 'pay-3', code: 'PAY-2402-01', invoiceCode: 'INV-2402-01', roomCode: 'P.101', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Lê Hoàng Nam', amount: 4773000, method: 'Chuyển khoản', date: '03/02/2024 11:15', period: 'Tháng 02/2024', status: 'confirmed', recordedBy: 'Nguyễn An', note: 'Thanh toán tiền phòng T2' },
  { id: 'pay-4', code: 'PAY-2402-02', invoiceCode: 'INV-2402-02', roomCode: 'P.102', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Trần Thị Mai', amount: 5112000, method: 'VNPay', date: '04/02/2024 09:12', period: 'Tháng 02/2024', status: 'confirmed', recordedBy: 'Tự động', note: 'Cổng VNPay' },
  { id: 'pay-5', code: 'PAY-2402-03', invoiceCode: 'INV-2402-03', roomCode: 'P.201', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Nguyễn Văn Đạt', amount: 4850000, method: 'Chuyển khoản', date: '05/02/2024 16:40', period: 'Tháng 02/2024', status: 'confirmed', recordedBy: 'Nguyễn An', note: 'Chuyển khoản ngân hàng' },
  { id: 'pay-6', code: 'PAY-2401-01', invoiceCode: 'INV-2401-01', roomCode: 'P.101', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Lê Hoàng Nam', amount: 4831000, method: 'Chuyển khoản', date: '04/01/2024 10:05', period: 'Tháng 01/2024', status: 'confirmed', recordedBy: 'Nguyễn An', note: 'Thanh toán tiền phòng T1' },
  { id: 'pay-7', code: 'PAY-2312-01', invoiceCode: 'INV-2312-01', roomCode: 'P.101', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Lê Hoàng Nam', amount: 4773000, method: 'Chuyển khoản', date: '03/12/2023 15:30', period: 'Tháng 12/2023', status: 'confirmed', recordedBy: 'Nguyễn An', note: 'Thanh toán tiền phòng T12' },
];

export const mockExpenses: ExpenseItem[] = [
  { id: 'exp-1', code: 'EXP-2403-01', date: '08/03/2024', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', category: 'Sửa chữa điện nước', description: 'Thay cụm van vòi sen phòng 203 (Thợ Anh Hùng)', amount: 150000, status: 'paid', payer: 'Nguyễn An', relatedMaintenanceId: 'REQ-0241' },
  { id: 'exp-2', code: 'EXP-2403-02', date: '05/03/2024', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', category: 'Sửa chữa điện nước', description: 'Thay bóng led tuýp hành lang tầng 3', amount: 65000, status: 'paid', payer: 'Nguyễn An', relatedMaintenanceId: 'REQ-0238' },
  { id: 'exp-3', code: 'EXP-2403-03', date: '02/03/2024', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', category: 'Internet & Truyền hình', description: 'Gói cáp quang Viettel F90N khu trọ', amount: 440000, status: 'paid', payer: 'Nguyễn An' },
  { id: 'exp-4', code: 'EXP-2403-04', date: '01/03/2024', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', category: 'Vệ sinh môi trường', description: 'Phí thu gom rác sinh hoạt tháng 3/2024', amount: 350000, status: 'paid', payer: 'Nguyễn An' },
  { id: 'exp-5', code: 'EXP-2402-01', date: '15/02/2024', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', category: 'Bảo trì thang máy', description: 'Bảo dưỡng định kỳ thang máy Fuji', amount: 800000, status: 'paid', payer: 'Nguyễn An' },
  { id: 'exp-6', code: 'EXP-2402-02', date: '01/02/2024', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', category: 'Vệ sinh môi trường', description: 'Phí thu gom rác sinh hoạt tháng 2/2024', amount: 350000, status: 'paid', payer: 'Nguyễn An' },
];

export const mockMaintenance: MaintenanceItem[] = [
  { id: 'REQ-0241', roomCode: 'P.203', propertyName: 'Nhà trọ Hưng Phát', title: 'Hỏng vòi sen nhà tắm bị rò rỉ nước', description: 'Vòi sen tắm bị rỉ nước liên tục vào ban đêm, áp lực nước yếu. Cần thay gioăng hoặc cụm van mở nước.', priority: 'high', status: 'in_progress', category: 'Nước', assignee: 'Thợ sửa nước - Anh Hùng', cost: 150000, createdAt: '2024-03-08 09:15', tenantName: 'Nguyễn Cường', tenantPhone: '0918889999' },
  { id: 'REQ-0240', roomCode: 'P.101', propertyName: 'Nhà trọ Hưng Phát', title: 'Máy lạnh không mát, chớp đèn vàng', description: 'Bật 18 độ nhưng chỉ ra gió quạt, phòng nóng. Có thể hết ga hoặc bẩn màng lọc bụi.', priority: 'medium', status: 'pending', category: 'Điều hòa', createdAt: '2024-03-07 16:40', tenantName: 'Lê Hoàng Nam', tenantPhone: '0901234567' },
  { id: 'REQ-0238', roomCode: 'P.302', propertyName: 'Nhà trọ Hưng Phát', title: 'Bóng đèn hành lang tầng 3 bị chập cháy', description: 'Bóng led tuýp bị chớp nháy liên tục rồi tắt hẳn.', priority: 'low', status: 'completed', category: 'Điện', assignee: 'Nguyễn An (Chủ nhà)', cost: 65000, createdAt: '2024-03-05 10:00', tenantName: 'Bùi Lan Anh', tenantPhone: '0944556677' },
];

export const mockContracts: ContractItem[] = [
  { id: 'CT-2023-041', roomCode: 'P.101', tenantName: 'Lê Hoàng Nam', tenantPhone: '0901234567', startDate: '2023-12-01', endDate: '2024-12-31', depositAmount: 4200000, monthlyRent: 4200000, paymentCycle: '1 tháng/lần', status: 'active' },
  { id: 'CT-2023-039', roomCode: 'P.102', tenantName: 'Trần Thị Mai', tenantPhone: '0912345678', startDate: '2023-09-15', endDate: '2024-09-15', depositAmount: 4500000, monthlyRent: 4500000, paymentCycle: '1 tháng/lần', status: 'expiring' },
  { id: 'CT-2023-035', roomCode: 'P.201', tenantName: 'Nguyễn Văn Đạt', tenantPhone: '0933445566', startDate: '2023-08-30', endDate: '2024-08-30', depositAmount: 4200000, monthlyRent: 4200000, paymentCycle: '1 tháng/lần', status: 'expiring' },
  { id: 'CT-2024-002', roomCode: 'P.301', tenantName: 'Võ Thanh Tùng', tenantPhone: '0977112233', startDate: '2024-01-15', endDate: '2025-01-15', depositAmount: 15000000, monthlyRent: 7500000, paymentCycle: '1 tháng/lần', status: 'active' },
];

export const mockMeterReadings: MeterReadingItem[] = [
  // Tháng 03/2024
  { id: 'm-2403-1', roomCode: 'P.101', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Lê Hoàng Nam', period: 'Tháng 03/2024', periodKey: '2024-03', prevElectric: 1240, currElectric: 1330, prevWater: 42, currWater: 48, electricUnitPrice: 3800, waterUnitPrice: 20000, updatedAt: '01/03/2024', status: 'confirmed', invoiceCode: 'INV-2403-01' },
  { id: 'm-2403-2', roomCode: 'P.102', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Trần Thị Mai', period: 'Tháng 03/2024', periodKey: '2024-03', prevElectric: 890, currElectric: 975, prevWater: 35, currWater: 40, electricUnitPrice: 3800, waterUnitPrice: 20000, updatedAt: '01/03/2024', status: 'confirmed' },
  { id: 'm-2403-3', roomCode: 'P.201', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Nguyễn Văn Đạt', period: 'Tháng 03/2024', periodKey: '2024-03', prevElectric: 1510, currElectric: 1618, prevWater: 58, currWater: 65, electricUnitPrice: 3800, waterUnitPrice: 20000, updatedAt: '01/03/2024', status: 'confirmed', invoiceCode: 'INV-2403-02' },
  { id: 'm-2403-4', roomCode: 'P.301', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Võ Thanh Tùng', period: 'Tháng 03/2024', periodKey: '2024-03', prevElectric: 2150, currElectric: 2313, prevWater: 80, currWater: 90, electricUnitPrice: 3800, waterUnitPrice: 20000, updatedAt: '01/03/2024', status: 'confirmed', invoiceCode: 'INV-2403-03' },
  { id: 'm-2403-5', roomCode: 'P.302', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Bùi Lan Anh', period: 'Tháng 03/2024', periodKey: '2024-03', prevElectric: 760, currElectric: 835, prevWater: 24, currWater: 29, electricUnitPrice: 3800, waterUnitPrice: 20000, updatedAt: '01/03/2024', status: 'confirmed', invoiceCode: 'INV-2403-04' },

  // Tháng 02/2024
  { id: 'm-2402-1', roomCode: 'P.101', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Lê Hoàng Nam', period: 'Tháng 02/2024', periodKey: '2024-02', prevElectric: 1155, currElectric: 1240, prevWater: 37, currWater: 42, electricUnitPrice: 3800, waterUnitPrice: 20000, updatedAt: '01/02/2024', status: 'confirmed', invoiceCode: 'INV-2402-01' },
  { id: 'm-2402-2', roomCode: 'P.102', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Trần Thị Mai', period: 'Tháng 02/2024', periodKey: '2024-02', prevElectric: 800, currElectric: 890, prevWater: 29, currWater: 35, electricUnitPrice: 3800, waterUnitPrice: 20000, updatedAt: '01/02/2024', status: 'confirmed', invoiceCode: 'INV-2402-02' },
  { id: 'm-2402-3', roomCode: 'P.201', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Nguyễn Văn Đạt', period: 'Tháng 02/2024', periodKey: '2024-02', prevElectric: 1410, currElectric: 1510, prevWater: 52, currWater: 58, electricUnitPrice: 3800, waterUnitPrice: 20000, updatedAt: '01/02/2024', status: 'confirmed', invoiceCode: 'INV-2402-03' },
  { id: 'm-2402-4', roomCode: 'P.301', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Võ Thanh Tùng', period: 'Tháng 02/2024', periodKey: '2024-02', prevElectric: 2000, currElectric: 2150, prevWater: 71, currWater: 80, electricUnitPrice: 3800, waterUnitPrice: 20000, updatedAt: '01/02/2024', status: 'confirmed', invoiceCode: 'INV-2402-04' },

  // Tháng 01/2024
  { id: 'm-2401-1', roomCode: 'P.101', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Lê Hoàng Nam', period: 'Tháng 01/2024', periodKey: '2024-01', prevElectric: 1060, currElectric: 1155, prevWater: 31, currWater: 37, electricUnitPrice: 3800, waterUnitPrice: 20000, updatedAt: '01/01/2024', status: 'confirmed', invoiceCode: 'INV-2401-01' },
  { id: 'm-2401-2', roomCode: 'P.102', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Trần Thị Mai', period: 'Tháng 01/2024', periodKey: '2024-01', prevElectric: 715, currElectric: 800, prevWater: 24, currWater: 29, electricUnitPrice: 3800, waterUnitPrice: 20000, updatedAt: '01/01/2024', status: 'confirmed', invoiceCode: 'INV-2401-02' },
  { id: 'm-2401-3', roomCode: 'P.201', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Nguyễn Văn Đạt', period: 'Tháng 01/2024', periodKey: '2024-01', prevElectric: 1305, currElectric: 1410, prevWater: 45, currWater: 52, electricUnitPrice: 3800, waterUnitPrice: 20000, updatedAt: '01/01/2024', status: 'confirmed', invoiceCode: 'INV-2401-03' },

  // Tháng 12/2023
  { id: 'm-2312-1', roomCode: 'P.101', propertyId: '1', propertyName: 'Nhà trọ Hưng Phát', tenantName: 'Lê Hoàng Nam', period: 'Tháng 12/2023', periodKey: '2023-12', prevElectric: 975, currElectric: 1060, prevWater: 26, currWater: 31, electricUnitPrice: 3800, waterUnitPrice: 20000, updatedAt: '01/12/2023', status: 'confirmed', invoiceCode: 'INV-2312-01' },
];

export const mockDeposits: DepositItem[] = [
  { id: 'dep-1', contractCode: 'CT-2023-041', roomCode: 'P.101', tenantName: 'Lê Hoàng Nam', amount: 4200000, depositDate: '2023-11-28', refundStatus: 'holding' },
  { id: 'dep-2', contractCode: 'CT-2023-039', roomCode: 'P.102', tenantName: 'Trần Thị Mai', amount: 4500000, depositDate: '2023-09-10', refundStatus: 'holding' },
  { id: 'dep-3', contractCode: 'CT-2023-035', roomCode: 'P.201', tenantName: 'Nguyễn Văn Đạt', amount: 4200000, depositDate: '2023-08-25', refundStatus: 'holding' },
  { id: 'dep-4', contractCode: 'CT-2024-002', roomCode: 'P.301', tenantName: 'Võ Thanh Tùng', amount: 15000000, depositDate: '2024-01-10', refundStatus: 'holding' },
  { id: 'dep-5', contractCode: 'CT-2023-018', roomCode: 'P.103', tenantName: 'Hoàng Kim Chi', amount: 4200000, depositDate: '2023-02-15', refundStatus: 'settlement_pending', refundAmount: 3850000 },
];

export const mockTenants: TenantItem[] = [
  { id: 't-1', name: 'Lê Hoàng Nam', phone: '0901234567', idCard: '079201004123', roomCode: 'P.101', propertyName: 'Nhà trọ Hưng Phát', leaseStart: '01/12/2023', leaseEnd: '31/12/2024', deposit: 4200000, status: 'active' },
  { id: 't-2', name: 'Trần Thị Mai', phone: '0912345678', idCard: '079198008432', roomCode: 'P.102', propertyName: 'Nhà trọ Hưng Phát', leaseStart: '15/09/2023', leaseEnd: '15/09/2024', deposit: 4500000, status: 'active' },
  { id: 't-3', name: 'Nguyễn Văn Đạt', phone: '0933445566', idCard: '079200003189', roomCode: 'P.201', propertyName: 'Nhà trọ Hưng Phát', leaseStart: '30/08/2023', leaseEnd: '30/08/2024', deposit: 4200000, status: 'active' },
  { id: 't-4', name: 'Võ Thanh Tùng', phone: '0977112233', idCard: '079195007654', roomCode: 'P.301', propertyName: 'Nhà trọ Hưng Phát', leaseStart: '15/01/2024', leaseEnd: '15/01/2025', deposit: 15000000, status: 'active' },
  { id: 't-5', name: 'Bùi Lan Anh', phone: '0944556677', idCard: '079202009812', roomCode: 'P.302', propertyName: 'Nhà trọ Hưng Phát', leaseStart: '20/11/2023', leaseEnd: '20/11/2024', deposit: 5000000, status: 'active' },
];

export const mockNotifications: NotificationItem[] = [
  { id: 'n-1', title: 'Thanh toán mới', message: 'Lê Hoàng Nam (P.101) đã thanh toán 4.830.000đ qua chuyển khoản Techcombank', category: 'payment', createdAt: '10 phút trước', read: false },
  { id: 'n-2', title: 'Yêu cầu bảo trì khẩn', message: 'P.203 báo hỏng vòi sen nhà tắm rò rỉ nước cần xử lý', category: 'maintenance', createdAt: '1 giờ trước', read: false },
  { id: 'n-3', title: 'Hợp đồng sắp hết hạn', message: 'Hợp đồng phòng P.201 (Nguyễn Văn Đạt) sẽ hết hạn trong 30 ngày', category: 'contract', createdAt: '5 giờ trước', read: false },
  { id: 'n-4', title: 'Đã hoàn tất kỳ ghi điện nước', message: 'Kỳ ghi số điện nước tháng 03/2024 cho Nhà trọ Hưng Phát đã được cập nhật', category: 'system', createdAt: '1 ngày trước', read: true },
];

export const formatVND = (num: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};
