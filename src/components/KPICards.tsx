import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Shield, AlertTriangle, Zap, Monitor, LogIn, FolderOpen } from 'lucide-react';

interface KPI {
  totalEvents: number;
  totalAlerts: number;
  criticalAlerts: number;
  activeAgents: number;
  failedLoginsToday: number;
  openIncidents: number;
}

interface KPICardsProps {
  kpis: KPI;
  isLoading: boolean;
}

interface CardConfig {
  key: keyof KPI;
  label: string;
  icon: React.ReactNode;
  color: string;
  glow: string;
  change: number;
  format?: (v: number) => string;
}

const cards: CardConfig[] = [
  { key: 'totalEvents', label: 'Total Events', icon: <Shield size={20} />, color: '#3B82F6', glow: 'rgba(59,130,246,0.2)', change: +12.4 },
  { key: 'totalAlerts', label: 'Total Alerts', icon: <AlertTriangle size={20} />, color: '#F97316', glow: 'rgba(249,115,22,0.2)', change: +8.1 },
  { key: 'criticalAlerts', label: 'Critical Alerts', icon: <Zap size={20} />, color: '#EF4444', glow: 'rgba(239,68,68,0.2)', change: +3.7 },
  { key: 'activeAgents', label: 'Active Agents', icon: <Monitor size={20} />, color: '#22C55E', glow: 'rgba(34,197,94,0.2)', change: -1.2 },
  { key: 'failedLoginsToday', label: 'Failed Logins Today', icon: <LogIn size={20} />, color: '#EAB308', glow: 'rgba(234,179,8,0.2)', change: +21.3 },
  { key: 'openIncidents', label: 'Open Incidents', icon: <FolderOpen size={20} />, color: '#8B5CF6', glow: 'rgba(139,92,246,0.2)', change: -5.0 },
];

function Sparkline({ color }: { color: string }) {
  const bars = Array.from({ length: 12 }, () => Math.floor(Math.random() * 80) + 20);
  const max = Math.max(...bars);
  return (
    <div className="sparkline">
      {bars.map((v, i) => (
        <div
          key={i}
          className="sparkline-bar"
          style={{ height: `${(v / max) * 100}%`, background: color, opacity: 0.6 + (i / bars.length) * 0.4 }}
        />
      ))}
    </div>
  );
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid-6" style={{ marginBottom: 24 }}>
        {cards.map(c => (
          <div key={c.key} className="glass-card" style={{ padding: 20, height: 140 }}>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: '60%', height: 16, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: '40%', height: 28 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid-6" style={{ marginBottom: 24 }}>
      {cards.map((card, i) => {
        const value = kpis[card.key];
        const isUp = card.change > 0;
        return (
          <motion.div
            key={card.key}
            className="glass-card-hover"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
            style={{ padding: 20, boxShadow: `0 4px 24px ${card.glow}` }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: `linear-gradient(135deg, ${card.color}30, ${card.color}15)`,
                border: `1px solid ${card.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: card.color,
              }}>
                {card.icon}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600,
                color: isUp ? '#EF4444' : '#22C55E',
                background: isUp ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                padding: '3px 8px', borderRadius: 6,
              }}>
                {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {Math.abs(card.change)}%
              </div>
            </div>

            {/* Value */}
            <motion.div
              style={{ fontSize: 28, fontWeight: 800, color: '#e2e8f0', lineHeight: 1, marginBottom: 4 }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.08 + 0.1, type: 'spring' }}
            >
              {value.toLocaleString()}
            </motion.div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>{card.label}</div>

            {/* Sparkline */}
            <Sparkline color={card.color} />
          </motion.div>
        );
      })}
    </div>
  );
};
