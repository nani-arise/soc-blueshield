import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, HardDrive, Wifi, WifiOff, AlertTriangle, Monitor } from 'lucide-react';
import type { Agent } from '../data/mockData';

interface ActiveAgentsProps {
  agents: Agent[];
}

const osIcon = (os: string) => {
  if (os.includes('Windows')) return '🪟';
  if (os.includes('Ubuntu') || os.includes('CentOS')) return '🐧';
  if (os.includes('macOS')) return '🍎';
  return '💻';
};

const ProgressBar = ({ value, color }: { value: number; color: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div className="progress-bar" style={{ flex: 1 }}>
      <motion.div
        className="progress-fill"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </div>
    <span style={{ fontSize: 11, fontWeight: 700, color, width: 30, textAlign: 'right' }}>{value}%</span>
  </div>
);

export const ActiveAgents: React.FC<ActiveAgentsProps> = ({ agents }) => {
  const online = agents.filter(a => a.status === 'online').length;
  const offline = agents.filter(a => a.status === 'offline').length;
  const warning = agents.filter(a => a.status === 'warning').length;

  return (
    <div>
      {/* Summary row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Online', count: online, color: '#22C55E', icon: <Wifi size={16} /> },
          { label: 'Warning', count: warning, color: '#EAB308', icon: <AlertTriangle size={16} /> },
          { label: 'Offline', count: offline, color: '#64748b', icon: <WifiOff size={16} /> },
          { label: 'Total', count: agents.length, color: '#3B82F6', icon: <Monitor size={16} /> },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ flex: 1, padding: 16, textAlign: 'center' }}>
            <div style={{ color: s.color, marginBottom: 6, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Agent cards */}
      <div className="grid-3">
        {agents.map((agent, i) => {
          const cpuColor = agent.cpu > 80 ? '#EF4444' : agent.cpu > 60 ? '#F97316' : '#22C55E';
          const memColor = agent.memory > 80 ? '#EF4444' : agent.memory > 60 ? '#F97316' : '#3B82F6';

          return (
            <motion.div
              key={agent.id}
              className="agent-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 8, fontSize: 20,
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid #1e3a5f',
                  }}>
                    {osIcon(agent.os)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{agent.hostname}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{agent.department}</div>
                  </div>
                </div>
                <span className={`badge badge-${agent.status}`}>
                  {agent.status === 'online' ? '● ' : agent.status === 'warning' ? '⚠ ' : '○ '}
                  {agent.status}
                </span>
              </div>

              {/* Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
                {[
                  { label: 'OS', value: agent.os.split(' ')[0] + ' ' + agent.os.split(' ').slice(-1)[0] },
                  { label: 'IP', value: agent.ip },
                  { label: 'Version', value: `v${agent.agentVersion}` },
                  { label: 'Last Seen', value: agent.status === 'offline' ? new Date(agent.lastSeen).toLocaleDateString() : 'Just now' },
                ].map(f => (
                  <div key={f.label} style={{ padding: '6px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
                    <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{f.label}</div>
                    <div className="mono" style={{ fontSize: 11, color: '#94a3b8', fontFamily: f.label === 'IP' ? 'JetBrains Mono, monospace' : 'Inter, sans-serif' }}>{f.value}</div>
                  </div>
                ))}
              </div>

              {/* CPU & Memory */}
              {agent.status !== 'offline' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                      <Cpu size={11} color="#64748b" />
                      <span style={{ fontSize: 11, color: '#64748b' }}>CPU</span>
                    </div>
                    <ProgressBar value={agent.cpu} color={cpuColor} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                      <HardDrive size={11} color="#64748b" />
                      <span style={{ fontSize: 11, color: '#64748b' }}>Memory</span>
                    </div>
                    <ProgressBar value={agent.memory} color={memColor} />
                  </div>
                </div>
              )}

              {agent.status === 'offline' && (
                <div style={{ padding: 10, background: 'rgba(100,116,139,0.1)', borderRadius: 6, border: '1px solid rgba(100,116,139,0.2)', textAlign: 'center', fontSize: 11, color: '#64748b' }}>
                  Agent offline — last seen {new Date(agent.lastSeen).toLocaleString()}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
