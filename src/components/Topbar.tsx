import React, { useState } from 'react';
import { Search, Bell, User, RefreshCw, ChevronDown, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TopbarProps {
  clock: Date;
  searchQuery: string;
  onSearch: (q: string) => void;
  onRefresh: () => void;
  onNavEvents: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ clock, searchQuery, onSearch, onRefresh, onNavEvents }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const notifications = [
    { id: 1, text: 'Critical: Ransomware activity on CORP-PC-003', time: '2m ago', color: '#EF4444' },
    { id: 2, text: 'High: SSH Brute-force from 185.220.101.5', time: '8m ago', color: '#F97316' },
    { id: 3, text: 'New CVE published: CVE-2024-6387 (CVSS 8.1)', time: '1h ago', color: '#EAB308' },
    { id: 4, text: 'Agent CORP-PC-006 went offline', time: '2h ago', color: '#94a3b8' },
  ];

  return (
    <div className="topbar" style={{ position: 'relative', zIndex: 20 }}>
      {/* Search */}
      <div style={{ flex: 1, position: 'relative', maxWidth: 420 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
        <input
          className="soc-input"
          placeholder="Search events, IPs, users, rules..."
          value={searchQuery}
          onChange={e => onSearch(e.target.value)}
          onFocus={onNavEvents}
          style={{ width: '100%', paddingLeft: 36 }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Clock */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: 8 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.05em' }}>
          {clock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div style={{ fontSize: 11, color: '#64748b' }}>
          {clock.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Refresh */}
      <motion.button
        className="btn btn-ghost"
        onClick={onRefresh}
        whileTap={{ rotate: 360 }}
        transition={{ duration: 0.4 }}
        style={{ padding: '7px 10px' }}
        title="Refresh data"
      >
        <RefreshCw size={14} />
      </motion.button>

      {/* Alert indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '5px 12px' }}>
        <Zap size={13} color="#EF4444" />
        <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>4 Critical</span>
      </div>

      {/* Notifications */}
      <div style={{ position: 'relative' }}>
        <motion.button
          className="btn btn-ghost"
          onClick={() => { setShowNotifs(p => !p); setShowProfile(false); }}
          style={{ padding: '7px 10px', position: 'relative' }}
          whileHover={{ scale: 1.05 }}
        >
          <Bell size={16} />
          <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: '#EF4444', borderRadius: '50%', border: '2px solid #0B1220' }} />
        </motion.button>
        <AnimatePresence>
          {showNotifs && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              style={{ position: 'absolute', right: 0, top: '110%', width: 340, background: '#111827', border: '1px solid #1e3a5f', borderRadius: 12, padding: 8, boxShadow: '0 16px 48px rgba(0,0,0,0.6)', zIndex: 200 }}
            >
              <div style={{ padding: '6px 10px 10px', fontSize: 12, fontWeight: 700, color: '#94a3b8', borderBottom: '1px solid #1e3a5f', marginBottom: 6 }}>NOTIFICATIONS</div>
              {notifications.map(n => (
                <div key={n.id} style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1a2b47')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: n.color, marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.4 }}>{n.text}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{n.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile */}
      <div style={{ position: 'relative' }}>
        <motion.button
          onClick={() => { setShowProfile(p => !p); setShowNotifs(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid #1e3a5f', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}
          whileHover={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={14} color="white" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>SOC Analyst</div>
            <div style={{ fontSize: 10, color: '#22C55E' }}>● Online</div>
          </div>
          <ChevronDown size={12} color="#64748b" />
        </motion.button>
        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              style={{ position: 'absolute', right: 0, top: '110%', width: 200, background: '#111827', border: '1px solid #1e3a5f', borderRadius: 12, padding: 8, boxShadow: '0 16px 48px rgba(0,0,0,0.6)', zIndex: 200 }}
            >
              {['Profile Settings', 'Preferences', 'Change Password', 'Sign Out'].map(item => (
                <div key={item} style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#94a3b8', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1a2b47'; e.currentTarget.style.color = '#e2e8f0'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                  {item}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
