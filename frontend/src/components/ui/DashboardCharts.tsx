import React, { useState } from 'react';

// ============================================================================
// 1. GROUPED BAR CHART
// ============================================================================
export interface GroupedBarSeries {
  name: string;
  value: number;
  color: string;
}

export interface GroupedBarItem {
  label: string;
  series: GroupedBarSeries[];
}

interface GroupedBarChartProps {
  data: GroupedBarItem[];
  height?: number;
  valueFormatter?: (value: number) => string;
  yAxisTitle?: string;
  emptyMessage?: string;
}

export const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
  data,
  height = 240,
  valueFormatter = (val) => val.toLocaleString('vi-VN'),
  yAxisTitle,
  emptyMessage = 'Chưa có dữ liệu thống kê trong kỳ này',
}) => {
  const [hoveredGroupIdx, setHoveredGroupIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '13px' }}>
        {emptyMessage}
      </div>
    );
  }

  // Calculate Max Value for Scaling
  const allValues = data.flatMap((d) => d.series.map((s) => s.value));
  const rawMax = Math.max(...allValues, 1);
  const stepMagnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const yMax = Math.ceil(rawMax / stepMagnitude) * stepMagnitude;

  // Chart dimensions & padding
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartWidth = 560; // viewBox width
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const yTicks = [0, yMax * 0.33, yMax * 0.66, yMax];
  const groupWidth = plotWidth / data.length;
  const firstItem = data[0];
  const seriesCount = firstItem?.series.length ?? 1;
  const barWidth = Math.min(22, (groupWidth * 0.62) / Math.max(1, seriesCount));

  // Legend list from first entry
  const legend = firstItem ? firstItem.series.map((s) => ({ name: s.name, color: s.color })) : [];
  const hoveredGroup = hoveredGroupIdx !== null ? data[hoveredGroupIdx] : undefined;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Legend Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', fontSize: '12px' }}>
        {yAxisTitle && <span style={{ color: '#64748B', fontWeight: 600 }}>{yAxisTitle}</span>}
        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
          {legend.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
              }}
            >
              <span
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '3px',
                  backgroundColor: item.color,
                  boxShadow: `0 0 0 2px ${item.color}25`,
                }}
              />
              <span style={{ color: '#334155', fontWeight: 600 }}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Container */}
      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible', userSelect: 'none' }}
      >
        <defs>
          {legend.map((item, idx) => (
            <linearGradient key={idx} id={`bar-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={item.color} stopOpacity="0.95" />
              <stop offset="100%" stopColor={item.color} stopOpacity="1" />
            </linearGradient>
          ))}
          <filter id="bar-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Horizontal Grid lines */}
        {yTicks.map((tick, i) => {
          const y = paddingTop + plotHeight - (tick / yMax) * plotHeight;
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke={i === 0 ? '#CBD5E1' : '#F1F5F9'}
                strokeDasharray={i === 0 ? undefined : '4 4'}
                strokeWidth={i === 0 ? 1.5 : 1}
              />
              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fontWeight="500"
                fill="#94A3B8"
                fontFamily="inherit"
              >
                {valueFormatter(tick)}
              </text>
            </g>
          );
        })}

        {/* Bar Groups */}
        {data.map((group, gIdx) => {
          const groupCenterX = paddingLeft + gIdx * groupWidth + groupWidth / 2;
          const totalBarsWidth = seriesCount * barWidth + (seriesCount - 1) * 4;
          const startX = groupCenterX - totalBarsWidth / 2;
          const isHovered = hoveredGroupIdx === gIdx;
          const isCurrent = group.label.includes('(Nay)');

          return (
            <g
              key={gIdx}
              onMouseEnter={() => setHoveredGroupIdx(gIdx)}
              onMouseLeave={() => setHoveredGroupIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Subtle hover background column */}
              {isHovered && (
                <rect
                  x={paddingLeft + gIdx * groupWidth + 3}
                  y={paddingTop}
                  width={groupWidth - 6}
                  height={plotHeight}
                  fill="rgba(0, 89, 76, 0.05)"
                  rx="6"
                />
              )}

              {/* Individual series bars with rounded top corners */}
              {group.series.map((series, sIdx) => {
                const barX = startX + sIdx * (barWidth + 4);
                const barHeight = Math.max(4, (series.value / yMax) * plotHeight);
                const barY = paddingTop + plotHeight - barHeight;
                const r = Math.min(5, barWidth / 2, barHeight / 2);

                const pathD = `
                  M ${barX},${barY + barHeight}
                  L ${barX},${barY + r}
                  Q ${barX},${barY} ${barX + r},${barY}
                  L ${barX + barWidth - r},${barY}
                  Q ${barX + barWidth},${barY} ${barX + barWidth},${barY + r}
                  L ${barX + barWidth},${barY + barHeight}
                  Z
                `;

                return (
                  <path
                    key={sIdx}
                    d={pathD}
                    fill={`url(#bar-grad-${sIdx})`}
                    style={{
                      transition: 'all 0.2s ease',
                      filter: isHovered ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' : undefined,
                      opacity: hoveredGroupIdx !== null && !isHovered ? 0.65 : 1,
                    }}
                  />
                );
              })}

              {/* Current Month Accent Badge under Label */}
              {isCurrent && (
                <rect
                  x={groupCenterX - 28}
                  y={paddingTop + plotHeight + 9}
                  width={56}
                  height={18}
                  rx="9"
                  fill="#E6F4EA"
                />
              )}

              {/* X Axis Label */}
              <text
                x={groupCenterX}
                y={paddingTop + plotHeight + 22}
                textAnchor="middle"
                fontSize="11"
                fontWeight={isHovered || isCurrent ? 700 : 500}
                fill={isCurrent ? '#00594C' : isHovered ? '#0F172A' : '#64748B'}
                fontFamily="inherit"
              >
                {group.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Dynamic Tooltip Card */}
      {hoveredGroup && (
        <div
          style={{
            position: 'absolute',
            left: `${Math.min(84, Math.max(16, ((paddingLeft + (hoveredGroupIdx ?? 0) * groupWidth + groupWidth / 2) / chartWidth) * 100))}%`,
            top: '-6px',
            transform: 'translate(-50%, -100%)',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '9px 13px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 30,
            minWidth: '155px',
          }}
        >
          <div style={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '5px', marginBottom: '6px', color: '#F8FAFC' }}>
            {hoveredGroup.label}
          </div>
          {hoveredGroup.series.map((s, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '3px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }} />
                {s.name}:
              </span>
              <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>{valueFormatter(s.value)}</strong>
            </div>
          ))}
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: '8px',
              height: '8px',
              backgroundColor: '#0F172A',
            }}
          />
        </div>
      )}
    </div>
  );
};


// ============================================================================
// 2. STACKED BAR CHART (Tenant Expense Breakdown: Room + Utilities)
// ============================================================================
export interface StackedBarSegment {
  name: string;
  value: number;
  color: string;
}

export interface StackedBarItem {
  label: string;
  segments: StackedBarSegment[];
}

interface StackedBarChartProps {
  data: StackedBarItem[];
  height?: number;
  valueFormatter?: (value: number) => string;
  yAxisTitle?: string;
  emptyMessage?: string;
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  height = 240,
  valueFormatter = (val) => val.toLocaleString('vi-VN'),
  yAxisTitle,
  emptyMessage = 'Chưa có dữ liệu chi phí',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '13px' }}>
        {emptyMessage}
      </div>
    );
  }

  // Calculate totals per group
  const totals = data.map((d) => d.segments.reduce((sum, seg) => sum + seg.value, 0));
  const rawMax = Math.max(...totals, 1);
  const stepMagnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const yMax = Math.ceil(rawMax / stepMagnitude) * stepMagnitude;

  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartWidth = 560;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const yTicks = [0, yMax * 0.33, yMax * 0.66, yMax];
  const groupWidth = plotWidth / data.length;
  const barWidth = Math.min(32, groupWidth * 0.55);

  const firstStacked = data[0];
  const legend = firstStacked ? firstStacked.segments.map((s) => ({ name: s.name, color: s.color })) : [];
  const hoveredItem = hoveredIdx !== null ? data[hoveredIdx] : undefined;
  const hoveredTotal = hoveredIdx !== null && totals[hoveredIdx] !== undefined ? totals[hoveredIdx] : 0;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '12px' }}>
        {yAxisTitle && <span style={{ color: '#6B7280', fontWeight: 500 }}>{yAxisTitle}</span>}
        <div style={{ display: 'flex', gap: '14px', marginLeft: 'auto', flexWrap: 'wrap' }}>
          {legend.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: item.color }} />
              <span style={{ color: '#4B5563', fontWeight: 500 }}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        {/* Y Grid lines */}
        {yTicks.map((tick, i) => {
          const y = paddingTop + plotHeight - (tick / yMax) * plotHeight;
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#E5E7EB"
                strokeDasharray={i === 0 ? undefined : '3 3'}
                strokeWidth={1}
              />
              <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#9CA3AF" fontFamily="inherit">
                {valueFormatter(tick)}
              </text>
            </g>
          );
        })}

        {/* Stacked Bars */}
        {data.map((item, idx) => {
          const centerX = paddingLeft + idx * groupWidth + groupWidth / 2;
          const barX = centerX - barWidth / 2;
          const isHovered = hoveredIdx === idx;
          let currentY = paddingTop + plotHeight;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {isHovered && (
                <rect
                  x={paddingLeft + idx * groupWidth + 4}
                  y={paddingTop}
                  width={groupWidth - 8}
                  height={plotHeight}
                  fill="rgba(0, 89, 76, 0.04)"
                  rx="4"
                />
              )}

              {item.segments.map((seg, sIdx) => {
                const segHeight = Math.max(1, (seg.value / yMax) * plotHeight);
                currentY -= segHeight;
                const isTop = sIdx === item.segments.length - 1;

                return (
                  <rect
                    key={sIdx}
                    x={barX}
                    y={currentY}
                    width={barWidth}
                    height={segHeight}
                    fill={seg.color}
                    rx={isTop ? '3' : '0'}
                    style={{
                      transition: 'filter 0.15s ease',
                      filter: isHovered ? 'brightness(1.08)' : undefined,
                    }}
                  />
                );
              })}

              {/* X Axis Label */}
              <text
                x={centerX}
                y={paddingTop + plotHeight + 20}
                textAnchor="middle"
                fontSize="12"
                fontWeight={isHovered ? 700 : 500}
                fill={isHovered ? '#111827' : '#6B7280'}
                fontFamily="inherit"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover Tooltip */}
      {hoveredItem && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '16px',
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            padding: '10px 14px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            minWidth: '170px',
          }}
        >
          <div style={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{hoveredItem.label}</span>
            <span style={{ color: '#34D399' }}>{valueFormatter(hoveredTotal)}</span>
          </div>
          {hoveredItem.segments.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E2E8F0' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }} />
                {s.name}:
              </span>
              <strong style={{ color: '#FFFFFF' }}>{valueFormatter(s.value)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// ============================================================================
// 3. TREND LINE CHART (Platform Growth Trend)
// ============================================================================
export interface TrendLinePoint {
  label: string;
  [seriesKey: string]: number | string;
}

export interface TrendLineSeries {
  key: string;
  name: string;
  color: string;
}

interface TrendLineChartProps {
  data: TrendLinePoint[];
  series: TrendLineSeries[];
  height?: number;
  valueFormatter?: (value: number) => string;
  yAxisTitle?: string;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  series,
  height = 240,
  valueFormatter = (val) => val.toLocaleString('vi-VN'),
  yAxisTitle,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div style={{ height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>Chưa có dữ liệu xu hướng</div>;
  }

  // Calculate Max
  const allValues = data.flatMap((d) => series.map((s) => Number(d[s.key]) || 0));
  const rawMax = Math.max(...allValues, 1);
  const stepMagnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const yMax = Math.ceil(rawMax / stepMagnitude) * stepMagnitude;

  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  const chartWidth = 560;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const yTicks = [0, yMax * 0.33, yMax * 0.66, yMax];
  const stepX = plotWidth / (data.length - 1 || 1);
  const hoveredPoint = hoveredIdx !== null ? data[hoveredIdx] : undefined;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '12px' }}>
        {yAxisTitle && <span style={{ color: '#6B7280', fontWeight: 500 }}>{yAxisTitle}</span>}
        <div style={{ display: 'flex', gap: '14px', marginLeft: 'auto' }}>
          {series.map((s, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', borderRadius: '2px', backgroundColor: s.color }} />
              <span style={{ color: '#4B5563', fontWeight: 500 }}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${chartWidth} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          {series.map((s, idx) => (
            <linearGradient key={idx} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.0" />
            </linearGradient>
          ))}
        </defs>

        {/* Y Grid lines */}
        {yTicks.map((tick, i) => {
          const y = paddingTop + plotHeight - (tick / yMax) * plotHeight;
          return (
            <g key={i}>
              <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="#E5E7EB" strokeDasharray={i === 0 ? undefined : '3 3'} strokeWidth={1} />
              <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#9CA3AF" fontFamily="inherit">
                {valueFormatter(tick)}
              </text>
            </g>
          );
        })}

        {/* Area & Line for each series */}
        {series.map((s) => {
          const points = data.map((d, i) => {
            const val = Number(d[s.key]) || 0;
            const x = paddingLeft + i * stepX;
            const y = paddingTop + plotHeight - (val / yMax) * plotHeight;
            return { x, y, val };
          });

          const firstPt = points[0];
          const lastPt = points[points.length - 1];
          if (!firstPt || !lastPt) return null;

          const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
          const areaD = `${pathD} L ${lastPt.x} ${paddingTop + plotHeight} L ${firstPt.x} ${paddingTop + plotHeight} Z`;

          return (
            <g key={s.key}>
              <path d={areaD} fill={`url(#gradient-${s.key})`} />
              <path d={pathD} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {points.map((p, pIdx) => (
                <circle
                  key={pIdx}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredIdx === pIdx ? 5 : 3.5}
                  fill="#FFFFFF"
                  stroke={s.color}
                  strokeWidth={2}
                  style={{ transition: 'r 0.15s ease' }}
                />
              ))}
            </g>
          );
        })}

        {/* X Axis Labels & Hover Hit-boxes */}
        {data.map((d, i) => {
          const x = paddingLeft + i * stepX;
          const isHovered = hoveredIdx === i;

          return (
            <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} style={{ cursor: 'pointer' }}>
              {isHovered && (
                <line x1={x} y1={paddingTop} x2={x} y2={paddingTop + plotHeight} stroke="#00594C" strokeDasharray="3 3" strokeWidth={1.5} />
              )}
              <rect x={x - stepX / 2} y={paddingTop} width={stepX} height={plotHeight} fill="transparent" />
              <text
                x={x}
                y={paddingTop + plotHeight + 20}
                textAnchor="middle"
                fontSize="12"
                fontWeight={isHovered ? 700 : 500}
                fill={isHovered ? '#111827' : '#6B7280'}
                fontFamily="inherit"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '16px',
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            padding: '8px 12px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            minWidth: '150px',
          }}
        >
          <div style={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '4px' }}>
            {hoveredPoint.label}
          </div>
          {series.map((s, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#E2E8F0' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color }} />
                {s.name}:
              </span>
              <strong style={{ color: '#FFFFFF' }}>{valueFormatter(Number(hoveredPoint[s.key]) || 0)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// ============================================================================
// 4. DONUT DISTRIBUTION CHART (Room status / Subscription Plan Breakdown)
// ============================================================================
export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  subtext?: string;
}

interface DonutDistributionChartProps {
  segments: DonutSegment[];
  centerValue?: string;
  centerLabel?: string;
  size?: number;
}

export const DonutDistributionChart: React.FC<DonutDistributionChartProps> = ({
  segments,
  centerValue,
  centerLabel,
  size = 180,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const hoveredSegment = hoveredIdx !== null ? segments[hoveredIdx] : undefined;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '22px', flexWrap: 'wrap' }}>
      {/* SVG Donut */}
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
          {/* Base track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />

          {total > 0 &&
            segments.map((seg, idx) => {
              const percent = seg.value / total;
              const gap = segments.length > 1 ? 6 : 0;
              const rawDash = percent * circumference;
              const dashLength = Math.max(1, rawDash - gap);
              const dashOffset = -accumulatedPercent * circumference;
              accumulatedPercent += percent;
              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                  strokeDashoffset={dashOffset}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    cursor: 'pointer',
                    transition: 'stroke-width 0.2s ease, filter 0.2s ease',
                    filter: isHovered ? `drop-shadow(0 4px 10px ${seg.color}60)` : undefined,
                  }}
                />
              );
            })}
        </svg>

        {/* Center Circular Badge */}
        <div
          style={{
            position: 'absolute',
            inset: `${strokeWidth - 2}px`,
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            padding: '6px',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
            {hoveredSegment
              ? `${Math.round((hoveredSegment.value / (total || 1)) * 100)}%`
              : centerValue || total.toLocaleString('vi-VN')}
          </span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginTop: '3px', lineHeight: 1.2, maxWidth: '75px' }}>
            {hoveredSegment ? hoveredSegment.label : centerLabel || 'Tổng số'}
          </span>
          {hoveredSegment && (
            <span style={{ fontSize: '10px', color: '#94A3B8', marginTop: '1px' }}>
              {hoveredSegment.value} phòng
            </span>
          )}
        </div>
      </div>

      {/* Segment Legend Cards with Micro Progress Bars */}
      <div style={{ flex: 1, minWidth: '170px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {segments.map((seg, idx) => {
          const percent = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                padding: '7px 10px',
                borderRadius: '8px',
                backgroundColor: isHovered ? '#F8FAFC' : 'transparent',
                border: isHovered ? '1px solid #E2E8F0' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      backgroundColor: seg.color,
                      boxShadow: `0 0 0 3px ${seg.color}25`,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '12.5px', fontWeight: isHovered ? 700 : 500, color: '#1E2937' }}>
                    {seg.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '12px', color: '#0F172A' }}>{seg.value}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: isHovered ? seg.color : '#64748B',
                      backgroundColor: isHovered ? `${seg.color}15` : '#F1F5F9',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      minWidth: '34px',
                      textAlign: 'center',
                    }}
                  >
                    {percent}%
                  </span>
                </div>
              </div>

              {/* Micro Progress Track */}
              <div style={{ marginTop: '5px', height: '3px', backgroundColor: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${percent}%`,
                    height: '100%',
                    backgroundColor: seg.color,
                    borderRadius: '2px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
