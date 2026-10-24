import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, CheckSquare } from 'lucide-react';

interface ExportCsvPopoverProps {
  totalFilteredCount: number;
  selectedCount: number;
  onExportAll: () => void;
  onExportSelected: () => void;
  isLoading?: boolean;
}

export const ExportCsvPopover: React.FC<ExportCsvPopoverProps> = ({
  totalFilteredCount,
  selectedCount,
  onExportAll,
  onExportSelected,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div style={{ position: 'relative' }} ref={popoverRef}>
      <button
        type="button"
        className="rf-btn rf-btn-secondary"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
      >
        <Download size={14} />
        <span>Xuất CSV</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            width: '270px',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #E5E7EB',
            padding: '8px',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ padding: '6px 8px 4px 8px', fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
            Tùy chọn xuất dữ liệu
          </div>

          {/* Option 1: Export all filtered records */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onExportAll();
            }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '6px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              width: '100%',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <FileSpreadsheet size={16} color="#00594C" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                Xuất kết quả hiện tại
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                Toàn bộ {totalFilteredCount} bản ghi khớp bộ lọc
              </div>
            </div>
          </button>

          {/* Option 2: Export selected records */}
          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={() => {
              if (selectedCount > 0) {
                setIsOpen(false);
                onExportSelected();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '8px 10px',
              borderRadius: '6px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: selectedCount > 0 ? 'pointer' : 'not-allowed',
              opacity: selectedCount > 0 ? 1 : 0.55,
              width: '100%',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (selectedCount > 0) e.currentTarget.style.backgroundColor = '#F3F4F6';
            }}
            onMouseLeave={(e) => {
              if (selectedCount > 0) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <CheckSquare size={16} color="#0284C7" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                Xuất bản ghi đã chọn ({selectedCount})
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                {selectedCount > 0 ? `Đã chọn ${selectedCount} bản ghi` : 'Chưa chọn bản ghi nào từ bảng'}
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
