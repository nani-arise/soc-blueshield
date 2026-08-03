import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LogIn, LogOut, UserX, ShieldCheck, Clock, TrendingUp } from 'lucide-react';
import { securityEvents } from '../data/mockData';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#111827', border: '1px solid #1e3a5f', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', gap: 6, fontSize: 12, color: '#e2e8f0', marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, marginTop: 3 }} />
          <span style={{ color: '#94a3b8' }}>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function getLast24hAuth() {
  return Array.from({ length: 24 }, (_, i) => {
    const h = i;
    return {
      hour: `${String(h).padStart(2, '0')}:00`,
      successful: Math.floor(Math.random() * 40) + 5,
      failed: Math.floor(Math.random() * 15),
    };
  });
}

const failedLoginEvents = securityEvents.filter(e =>
  e.category === 'Authentication' && e.event.toLowerCase().includes('fail')
).slice(0, 20);

const successfulLoginEvents = securityEvents.filter(e =>
  e.category === 'Authentication' && e.event.toLowerCase().includes('success')
).slice(0, 20);

const topFailedUsers = (() => {
  const counts: Record<string, number> = {};
  failedLoginEvents.forEach(e => { counts[e.username] = (counts[e.username] || 0) + 1; });
  return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 8).map(([username, count]) => ({ username, count }));
})();

export const AuthMonitoring: React.FC = () => {
  const authData = getLast24hAuth();
  const totalFailed = failedLoginEvents.length;
  const totalSuccess = successfulLoginEvents.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI row */}
      <div className="grid-4">
        {[
          { label: 'Successful Logins', value: totalSuccess + 1203, icon: <LogIn size={18} />, color: '#22C55E' },
          { label: 'Failed Logins Today', value: totalFailed + 64, icon: <LogOut size={18} />, color: '#EF4444' },
          { label: 'Locked Accounts', value: 7, icon: <UserX size={18} />, color: '#F97316' },
          { label: 'MFA Challenges', value: 342, icon: <ShieldCheck size={18} />, color: '#3B82F6' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            className="glass-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: `${kpi.color}20`, border: `1px solid ${kpi.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color }}>
                {kpi.icon}
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: kpi.color }}>{kpi.value.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{kpi.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <TrendingUp size={16} color="#3B82F6" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Auth Activity – Last 24 Hours</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={authData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="successful" name="Successful" fill="#22C55E" radius={[3, 3, 0, 0]} />
              <Bar dataKey="failed" name="Failed" fill="#EF4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <UserX size={16} color="#EF4444" />
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Top Failed Users</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topFailedUsers.map((u, i) => (
              <div key={u.username} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#64748b', width: 14 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 12, color: '#94a3b8' }}>{u.username}</span>
                <div className="progress-bar" style={{ width: 60 }}>
                  <div className="progress-fill" style={{ background: '#EF4444', width: `${(u.count / (topFailedUsers[0]?.count || 1)) * 100}%` }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#EF4444', width: 20, textAlign: 'right' }}>{u.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent failed logins */}
      <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={14} color="#3B82F6" />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Recent Failed Login Attempts</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="soc-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Username</th>
                <th>Source IP</th>
                <th>Agent</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {failedLoginEvents.slice(0, 15).map((evt) => (
                <tr key={evt.id}>
                  <td><span className="mono" style={{ fontSize: 11 }}>{new Date(evt.timestamp).toLocaleString()}</span></td>
                  <td><span style={{ color: '#94a3b8' }}>{evt.username}</span></td>
                  <td><span className="mono" style={{ color: '#EAB308' }}>{evt.sourceIp}</span></td>
                  <td><span style={{ fontSize: 11, color: '#94a3b8' }}>{evt.agent}</span></td>
                  <td><span className={`badge badge-${evt.severity}`}>{evt.severity}</span></td>
                  <td><span className={`badge status-${evt.status}`}>{evt.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
