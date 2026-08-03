import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Shield, AlertTriangle, Brain, Lock,
  Monitor, FileText, Settings, ChevronRight, Wifi, Activity,
} from 'lucide-react';
import type { NavItem } from '../hooks/useSOCData';

interface SidebarProps {
  active: NavItem;
  onNav: (n: NavItem) => void;
}

const navItems: Array<{ id: NavItem; label: string; icon: React.ReactNode; badge?: number }> = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'events', label: 'Security Events', icon: <Shield size={18} />, badge: 12 },
  { id: 'incidents', label: 'Incident Response', icon: <AlertTriangle size={18} />, badge: 4 },
  { id: 'threat-intel', label: 'Threat Intelligence', icon: <Brain size={18} /> },
  { id: 'auth', label: 'Auth Monitoring', icon: <Lock size={18} /> },
  { id: 'agents', label: 'Agents', icon: <Monitor size={18} /> },
  { id: 'reports', label: 'Reports', icon: <FileText size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ active, onNav }) => {
  return (
    <div className="sidebar">
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1e3a5f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #3B82F6, #1d4ed8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
          }}>
            <Shield size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.01em' }}>BlueShield</div>
            <div style={{ fontSize: 10, color: '#3B82F6', fontWeight: 600, letterSpacing: '0.08em' }}>SOC PLATFORM</div>
          </div>
        </div>

        {/* Live status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 6, padding: '5px 10px' }}>
          <span className="pulse-dot pulse-dot-green" />
          <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 600 }}>LIVE MONITORING</span>
          <Activity size={12} color="#22C55E" style={{ marginLeft: 'auto' }} />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.1em', padding: '0 8px 8px', textTransform: 'uppercase' }}>
          Navigation
        </div>
        {navItems.map((item, i) => {
          const isActive = active === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNav(item.id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, marginBottom: 2, border: 'none',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.15))'
                  : 'transparent',
                color: isActive ? '#3B82F6' : '#94a3b8',
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? '2px solid #3B82F6' : '2px solid transparent',
              }}
              whileHover={{ x: 2 }}
            >
              <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{ background: '#EF4444', color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, minWidth: 18, textAlign: 'center' }}>
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
            </motion.button>
          );
        })}
      </nav>

      {/* System Status */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #1e3a5f' }}>
        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>System Health</div>
        {[
          { label: 'SIEM Engine', color: '#22C55E', status: 'Running' },
          { label: 'Threat Intel Feed', color: '#22C55E', status: 'Active' },
          { label: 'Log Ingestion', color: '#EAB308', status: 'Degraded' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <Wifi size={11} color={s.color} />
            <span style={{ fontSize: 11, color: '#94a3b8', flex: 1 }}>{s.label}</span>
            <span style={{ fontSize: 10, color: s.color, fontWeight: 600 }}>{s.status}</span>
          </div>
        ))}
        <div style={{ marginTop: 10, fontSize: 10, color: '#64748b', textAlign: 'center' }}>
          v4.8.2 · BlueShield SOC
        </div>
      </div>
    </div>
  );
};
