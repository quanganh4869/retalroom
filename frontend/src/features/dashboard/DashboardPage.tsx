import React from 'react';
import {
  TrendingUp,
  AlertCircle,
  FileCheck,
  Wrench,
  Clock,
  ArrowRight,
  Plus,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { formatVND, mockProperties } from '@/lib/mockData';
import { NavLink } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Banner / Welcome */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
        }}
      >
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>
            Chào buổi sáng, Nguyễn An 👋
          </h1>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
            Đây là tình hình tổng quan danh mục 3 tòa nhà hôm nay, ngày 11/10/2026.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <NavLink to="/meter-readings" className="rf-btn rf-btn-secondary">
            <Zap size={15} color="#D97706" />
            <span>Ghi điện nước</span>
          </NavLink>
          <NavLink to="/invoices" className="rf-btn rf-btn-primary">
            <Plus size={15} />
            <span>Tạo hóa đơn tháng</span>
          </NavLink>
        </div>
      </div>

      {/* Metric Cards Grid - Fully Clickable to Filtered Views */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {/* Tỷ lệ lấp đầy -> /rooms?status=vacant */}
        <NavLink
          to="/rooms?status=vacant"
          className="rf-card"
          style={{ padding: '18px 20px', textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00594C')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280' }}>Tỷ lệ lấp đầy</span>
            <span style={{ fontSize: '11px', color: '#137333', backgroundColor: '#E6F4EA', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
              +4.2%
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#111827', marginTop: '8px', letterSpacing: '-0.5px' }}>
            79.2%
          </div>
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>
              <span>52/66 phòng có khách</span>
              <span style={{ color: '#00594C', fontWeight: 600 }}>14 phòng trống →</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '79.2%', height: '100%', backgroundColor: '#00594C' }} />
            </div>
          </div>
        </NavLink>

        {/* Doanh thu tháng dự kiến -> /invoices */}
        <NavLink
          to="/invoices"
          className="rf-card"
          style={{ padding: '18px 20px', textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00594C')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280' }}>Doanh thu tháng (dự kiến)</span>
            <TrendingUp size={16} color="#00594C" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#111827', marginTop: '8px', letterSpacing: '-0.5px' }}>
            {formatVND(86400000)}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Đã thu:</span>
            <span style={{ fontWeight: 600, color: '#137333' }}>{formatVND(68200000)}</span>
            <span style={{ color: '#9CA3AF' }}>(78.9%)</span>
          </div>
        </NavLink>

        {/* Nợ cần thu -> /invoices?status=overdue */}
        <NavLink
          to="/invoices?status=overdue"
          className="rf-card"
          style={{ padding: '18px 20px', textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#C5221F')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280' }}>Nợ tiền phòng & dịch vụ</span>
            <AlertCircle size={16} color="#C5221F" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#C5221F', marginTop: '8px', letterSpacing: '-0.5px' }}>
            {formatVND(18200000)}
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '10px' }}>
            <span style={{ color: '#C5221F', fontWeight: 600 }}>Từ 4 hóa đơn quá hạn →</span>
          </div>
        </NavLink>

        {/* Yêu cầu bảo trì -> /maintenance?status=pending */}
        <NavLink
          to="/maintenance?status=pending"
          className="rf-card"
          style={{ padding: '18px 20px', textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'all 0.15s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#D97706')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280' }}>Yêu cầu bảo trì đang mở</span>
            <Wrench size={16} color="#D97706" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#111827', marginTop: '8px', letterSpacing: '-0.5px' }}>
            3
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '10px', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#C5221F', fontWeight: 600 }}>1 việc khẩn</span>
            <span>• 2 đang xử lý →</span>
          </div>
        </NavLink>
      </div>

      {/* Main 2-Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
        {/* Left Column: Tình hình thu tiền & Bất động sản */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Tình hình thu tiền 6 tháng qua */}
          <div className="rf-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  Tình hình thu tiền theo tháng
                </h3>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0 0' }}>
                  So sánh doanh thu thực thu so với mục tiêu 6 tháng gần nhất
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#00594C' }} />
                  Đã thu
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#E5E7EB' }} />
                  Kế hoạch
                </span>
              </div>
            </div>

            {/* Simulated Chart Bars */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', padding: '0 10px 10px 10px', borderBottom: '1px solid #E5E7EB' }}>
              {[
                { month: 'T10', target: 80, actual: 76 },
                { month: 'T11', target: 82, actual: 80 },
                { month: 'T12', target: 85, actual: 85 },
                { month: 'T01', target: 85, actual: 81 },
                { month: 'T02', target: 86, actual: 83 },
                { month: 'T03', target: 88, actual: 68 },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '48px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '140px' }}>
                    <div
                      style={{
                        width: '16px',
                        height: `${(item.actual / 100) * 140}px`,
                        backgroundColor: '#00594C',
                        borderRadius: '3px 3px 0 0',
                      }}
                      title={`Đã thu: ${item.actual}tr`}
                    />
                    <div
                      style={{
                        width: '16px',
                        height: `${(item.target / 100) * 140}px`,
                        backgroundColor: '#E5E7EB',
                        borderRadius: '3px 3px 0 0',
                      }}
                      title={`Kế hoạch: ${item.target}tr`}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Danh sách cơ sở / Bất động sản */}
          <div className="rf-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Hiệu suất theo cơ sở
              </h3>
              <NavLink to="/properties" style={{ fontSize: '12px', color: '#00594C', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '2px' }}>
                Xem tất cả <ArrowRight size={13} />
              </NavLink>
            </div>

            <table className="rf-table">
              <thead>
                <tr>
                  <th>Tòa nhà / Cơ sở</th>
                  <th>Phòng trống</th>
                  <th>Tỷ lệ lấp đầy</th>
                  <th>Doanh thu tháng</th>
                </tr>
              </thead>
              <tbody>
                {mockProperties.map((p) => {
                  const vacant = p.totalRooms - p.rentedRooms;
                  const rate = Math.round((p.rentedRooms / p.totalRooms) * 100);
                  return (
                    <tr
                      key={p.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => window.location.assign(`/rooms?propertyId=${p.id}`)}
                      title={`Nhấn để xem sơ đồ phòng của ${p.name}`}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: '#00594C' }}>{p.name} →</div>
                        <div style={{ fontSize: '11px', color: '#6B7280' }}>{p.address}</div>
                      </td>
                      <td>
                        <span className={`rf-badge ${vacant > 0 ? 'rf-badge-warning' : 'rf-badge-active'}`}>
                          {vacant} phòng
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600 }}>{rate}%</span>
                          <div style={{ width: '60px', height: '4px', backgroundColor: '#F3F4F6', borderRadius: '2px' }}>
                            <div style={{ width: `${rate}%`, height: '100%', backgroundColor: '#00594C', borderRadius: '2px' }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#111827' }}>
                        {formatVND(p.monthlyRevenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Cần xử lý ngay & Hoạt động gần đây */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Cần xử lý ngay */}
          <div className="rf-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#C5221F' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
                Cần xử lý ngay (3)
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '10px', backgroundColor: '#FCE8E6', borderRadius: '6px', fontSize: '12px' }}>
                <div style={{ fontWeight: 600, color: '#C5221F', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Hóa đơn quá hạn 6 ngày</span>
                  <span>4.900.000đ</span>
                </div>
                <div style={{ color: '#6B7280', marginTop: '2px' }}>P.201 - Nguyễn Văn Đạt</div>
                <div style={{ marginTop: '6px' }}>
                  <NavLink to="/invoices?status=overdue" style={{ color: '#C5221F', fontWeight: 600, textDecoration: 'underline' }}>
                    Xem chi tiết hóa đơn quá hạn →
                  </NavLink>
                </div>
              </div>

              <div style={{ padding: '10px', backgroundColor: '#FEF7E0', borderRadius: '6px', fontSize: '12px' }}>
                <div style={{ fontWeight: 600, color: '#B06000' }}>
                  Hỏng vòi sen nhà tắm (REQ-0241)
                </div>
                <div style={{ color: '#6B7280', marginTop: '2px' }}>P.203 - Rò rỉ nước liên tục</div>
                <div style={{ marginTop: '6px' }}>
                  <NavLink to="/maintenance?id=m1" style={{ color: '#B06000', fontWeight: 600, textDecoration: 'underline' }}>
                    Phân công thợ sửa phiếu REQ-0241 →
                  </NavLink>
                </div>
              </div>

              <div style={{ padding: '10px', backgroundColor: '#F1F3F4', borderRadius: '6px', fontSize: '12px' }}>
                <div style={{ fontWeight: 600, color: '#111827' }}>
                  Hợp đồng sắp hết hạn (CT-2023-039)
                </div>
                <div style={{ color: '#6B7280', marginTop: '2px' }}>P.102 - Trần Thị Mai (còn 18 ngày)</div>
                <div style={{ marginTop: '6px' }}>
                  <NavLink to="/contracts?status=expiring" style={{ color: '#00594C', fontWeight: 600, textDecoration: 'underline' }}>
                    Liên hệ gia hạn hợp đồng →
                  </NavLink>
                </div>
              </div>
            </div>
          </div>

          {/* Hoạt động gần đây */}
          <div className="rf-card">
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '14px' }}>
              Hoạt động gần đây
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={16} color="#137333" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 500, color: '#111827' }}>Thanh toán hóa đơn P.101</div>
                  <div style={{ color: '#6B7280' }}>Lê Hoàng Nam chuyển 4.830.000đ</div>
                  <div style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '2px' }}>15 phút trước</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Clock size={16} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 500, color: '#111827' }}>Đã ghi chỉ số điện nước T3</div>
                  <div style={{ color: '#6B7280' }}>24/24 phòng tại Hưng Phát</div>
                  <div style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '2px' }}>2 giờ trước</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <FileCheck size={16} color="#00594C" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 500, color: '#111827' }}>Ký hợp đồng mới P.301</div>
                  <div style={{ color: '#6B7280' }}>Võ Thanh Tùng - Cọc 15.000.000đ</div>
                  <div style={{ color: '#9CA3AF', fontSize: '11px', marginTop: '2px' }}>Hôm qua</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
