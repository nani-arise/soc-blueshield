import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { SecurityEvent, Severity } from '../data/mockData';

interface AttackTimelineProps {
  events: SecurityEvent[];
}

const sevDot: Record<Severity, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#22C55E',
};

export const AttackTimeline: React.FC<AttackTimelineProps> = ({ events }) => {
  // Group by day, show top 30
  const timelineEvents = events.slice(0, 30);

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: 24 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <Clock size={16} color="#3B82F6" />
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>Attack Timeline</h3>
        <span style={{ fontSize: 11, color: '#64748b', marginLeft: 8 }}>Last 30 events chronologically</span>
      </div>

      <div style={{ position: 'relative', paddingLeft: 30 }}>
        {/* Vertical line */}
        <div style={{ position: 'absolute', left: 10, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg, #3B82F6, #1e3a5f)' }} />

        {timelineEvents.map((evt, i) => (
          <motion.div
            key={evt.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, type: 'spring', stiffness: 200 }}
            style={{ position: 'relative', marginBottom: 16, paddingLeft: 20 }}
          >
            {/* Dot */}
            <div style={{
              position: 'absolute',
              left: -26,
              top: 6,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: sevDot[evt.severity],
              border: `2px solid ${sevDot[evt.severity]}40`,
              boxShadow: `0 0 8px ${sevDot[evt.severity]}60`,
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: `1px solid ${sevDot[evt.severity]}20` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="mono" style={{ fontSize: 11, color: '#64748b' }}>
                  {new Date(evt.timestamp).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className={`badge badge-${evt.severity}`}>{evt.severity}</span>
                <span className="mono" style={{ fontSize: 10, color: '#3B82F6' }}>{evt.ruleId}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{evt.event}</div>
              <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#64748b', flexWrap: 'wrap' }}>
                <span>👤 {evt.username}</span>
                <span>🌐 {evt.sourceIp}</span>
                <span>🖥️ {evt.agent}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
