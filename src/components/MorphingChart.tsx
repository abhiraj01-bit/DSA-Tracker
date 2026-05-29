import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface ChartDataPoint {
  label: string;
  value: number; // 0 to 100
}

interface Props {
  data: ChartDataPoint[]; // Must be exactly 6 points
}

export function MorphingChart({ data }: Props) {
  const [mode, setMode] = useState<'line' | 'radar'>('line');

  // SVG Geometry
  const width = 600;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;
  
  // Radar Settings
  const maxRadius = 130;
  
  // Line Settings
  const paddingX = 60;
  const paddingY = 60;
  const lineBottomY = height - paddingY;
  const lineMaxH = height - paddingY * 2;
  const stepX = (width - paddingX * 2) / 5;

  // Generate coordinates for both modes
  const radarPoints: { x: number; y: number }[] = [];
  const radarLabelPoints: { x: number; y: number }[] = [];
  const linePoints: { x: number; y: number }[] = [];
  const lineLabelPoints: { x: number; y: number }[] = [];

  data.forEach((d, i) => {
    // Radar Math (start at -90deg/top, go clockwise)
    const angleDeg = i * 60 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const r = (d.value / 100) * maxRadius;
    radarPoints.push({
      x: cx + Math.cos(angleRad) * r,
      y: cy + Math.sin(angleRad) * r,
    });
    radarLabelPoints.push({
      x: cx + Math.cos(angleRad) * (maxRadius + 40),
      y: cy + Math.sin(angleRad) * (maxRadius + 30),
    });

    // Line Math
    const lx = paddingX + i * stepX;
    const ly = lineBottomY - (d.value / 100) * lineMaxH;
    linePoints.push({ x: lx, y: ly });
    lineLabelPoints.push({ x: lx, y: lineBottomY + 30 });
  });

  // Create SVG path strings
  // We use 8 points for both so framer-motion can morph perfectly.
  // Line: 6 data points + bottom-right corner + bottom-left corner
  // Radar: 6 data points + back to first point + back to first point
  const linePathFill = `M ${linePoints.map(p => `${p.x},${p.y}`).join(' L ')} L ${linePoints[5].x},${lineBottomY} L ${linePoints[0].x},${lineBottomY} Z`;
  const radarPathFill = `M ${radarPoints.map(p => `${p.x},${p.y}`).join(' L ')} L ${radarPoints[0].x},${radarPoints[0].y} L ${radarPoints[0].x},${radarPoints[0].y} Z`;

  const linePathStroke = `M ${linePoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
  const radarPathStroke = `M ${radarPoints.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

  // Radar Background Hexagons (for the grid)
  const hexRadiusLevels = [1, 0.75, 0.5, 0.25].map(m => m * maxRadius);
  
  return (
    <div className="w-full flex flex-col items-center bg-gradient-to-b from-[#0a152d] to-[#040a18] rounded-[32px] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-800/60 overflow-hidden relative group">
      
      {/* Premium Glass Header */}
      <div className="w-full flex justify-between items-center z-20 mb-8">
        <div>
          <h3 className="text-white font-display text-[20px] font-semibold tracking-tight">Proficiency Chart</h3>
          <p className="text-blue-200/60 text-[13px] font-medium mt-1">Morphing performance analysis</p>
        </div>
        
        {/* Toggle Switch */}
        <div className="flex bg-[#0a152d] border border-blue-900/50 p-1 rounded-full shadow-inner relative">
          <motion.div 
            className="absolute top-1 bottom-1 w-[80px] bg-blue-500 rounded-full shadow-sm"
            animate={{ left: mode === 'line' ? 4 : 84 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
          <button 
            onClick={() => setMode('line')}
            className={`relative z-10 w-[80px] py-1.5 text-[12px] font-semibold transition-colors ${mode === 'line' ? 'text-white' : 'text-slate-400 hover:text-slate-300'}`}
          >
            History
          </button>
          <button 
            onClick={() => setMode('radar')}
            className={`relative z-10 w-[80px] py-1.5 text-[12px] font-semibold transition-colors ${mode === 'radar' ? 'text-white' : 'text-slate-400 hover:text-slate-300'}`}
          >
            Radar
          </button>
        </div>
      </div>

      <div className="relative w-full max-w-[600px] aspect-[3/2] flex justify-center items-center">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          <defs>
            <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="radarFillGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* BACKGROUND GRIDS */}
          <AnimatePresence>
            {/* LINE CHART GRID */}
            {mode === 'line' && (
              <motion.g
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                {[0, 0.25, 0.5, 0.75, 1].map((level, i) => (
                  <line 
                    key={`hline-${i}`}
                    x1={paddingX} 
                    y1={lineBottomY - level * lineMaxH} 
                    x2={width - paddingX} 
                    y2={lineBottomY - level * lineMaxH} 
                    stroke="#1e293b" 
                    strokeWidth="1" 
                    strokeDasharray="4 4"
                  />
                ))}
              </motion.g>
            )}

            {/* RADAR CHART GRID */}
            {mode === 'radar' && (
              <motion.g
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
              >
                {hexRadiusLevels.map((rLevel, idx) => {
                  const pts = Array.from({ length: 6 }).map((_, i) => {
                    const ang = (i * 60 - 90) * Math.PI / 180;
                    return `${cx + Math.cos(ang) * rLevel},${cy + Math.sin(ang) * rLevel}`;
                  }).join(' L ');
                  return (
                    <polygon 
                      key={`hex-${idx}`}
                      points={pts} 
                      fill="none" 
                      stroke="#1e293b" 
                      strokeWidth="1" 
                    />
                  );
                })}
                {/* Radial Spokes */}
                {Array.from({ length: 6 }).map((_, i) => {
                  const ang = (i * 60 - 90) * Math.PI / 180;
                  return (
                    <line 
                      key={`spoke-${i}`}
                      x1={cx} y1={cy} 
                      x2={cx + Math.cos(ang) * maxRadius} 
                      y2={cy + Math.sin(ang) * maxRadius} 
                      stroke="#1e293b" strokeWidth="1"
                    />
                  );
                })}
              </motion.g>
            )}
          </AnimatePresence>

          {/* MAIN MORPHING SHAPE */}
          <motion.path
            animate={{ 
              d: mode === 'line' ? linePathFill : radarPathFill,
              fill: mode === 'line' ? "url(#fillGradient)" : "url(#radarFillGradient)"
            }}
            transition={{ type: "spring", stiffness: 60, damping: 14 }}
          />
          
          <motion.path
            animate={{ 
              d: mode === 'line' ? linePathStroke : radarPathStroke,
            }}
            fill="none"
            stroke={mode === 'line' ? "#60a5fa" : "#8b5cf6"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            transition={{ type: "spring", stiffness: 60, damping: 14 }}
          />

          {/* DATA POINTS (CIRCLES) */}
          {data.map((d, i) => (
            <motion.circle
              key={`dot-${i}`}
              r={5}
              animate={{
                cx: mode === 'line' ? linePoints[i].x : radarPoints[i].x,
                cy: mode === 'line' ? linePoints[i].y : radarPoints[i].y,
                fill: mode === 'line' ? "#ffffff" : "#c4b5fd",
                stroke: mode === 'line' ? "#3b82f6" : "#6d28d9"
              }}
              strokeWidth="2"
              transition={{ type: "spring", stiffness: 60, damping: 14 }}
            />
          ))}

          {/* LABELS */}
          {data.map((d, i) => {
            const isRadar = mode === 'radar';
            return (
              <motion.text
                key={`label-${i}`}
                animate={{
                  x: mode === 'line' ? lineLabelPoints[i].x : radarLabelPoints[i].x,
                  y: mode === 'line' ? lineLabelPoints[i].y : radarLabelPoints[i].y,
                }}
                transition={{ type: "spring", stiffness: 60, damping: 14 }}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[12px] font-semibold fill-slate-300 font-sans"
              >
                {d.label}
              </motion.text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
