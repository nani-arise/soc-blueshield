import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Users, Globe, Layers, Tag } from 'lucide-react';

interface ChartData {
  alertsOverTime: Array<{ hour: string; alerts: number; critical: number }>;
  alertsBySeverity: Array<{ name: string; value: number; color: string }>;
  authActivity: Array<{ day: string; successful: number; failed: number }>;
  topIPs: Array<{ ip: string; count: number }>;
  mitre: Array<{ technique: string; value: number }>;
  alertsByCategory: Array<{ name: string; value: number; color: string }>;
}

interface ChartsSectionProps {
  chartData: ChartData;
  isLoading: boolean;
}

const tooltipStyle = {
  contentStyle: { background: '#111827', border: '1px solid #1e3a5f', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#94a3b8' },
  itemStyle: { color: '#e2e8f0' },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#111827', border: '1px solid #1e3a5f', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#e2e8f0', marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color || p.fill }} />
          <span style={{ color: '#94a3b8' }}>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const ChartCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, icon, children, style }) => (
  <motion.div
    className="glass-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 200, damping: 22 }}
    style={{ padding: 20, ...style }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
      <span style={{ color: '#3B82F6' }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{title}</span>
    </div>
    {children}
  </motion.div>
);

export const ChartsSection: React.FC<ChartsSectionProps> = ({ chartData, isLoading }) => {
  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="glass-card skeleton" style={{ height: 280, padding: 20 }} />
        ))}
      </div>
    );
  }

  const maxIpCount = Math.max(...chartData.topIPs.map(d => d.count));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Row 1: Line chart + Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <ChartCard title="Alerts Over Time (Last 24h)" icon={<TrendingUp size={16} />}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData.alertsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Line type="monotone" dataKey="alerts" stroke="#3B82F6" strokeWidth={2} dot={false} name="Total Alerts" />
              <Line type="monotone" dataKey="critical" stroke="#EF4444" strokeWidth={2} dot={false} strokeDasharray="4 2" name="Critical" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Alerts by Severity" icon={<Layers size={16} />}>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={chartData.alertsBySeverity} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {chartData.alertsBySeverity.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {chartData.alertsBySeverity.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#94a3b8', flex: 1 }}>{s.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Row 2: Stacked Bar + Top IPs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ChartCard title="Authentication Activity (7 Days)" icon={<Users size={16} />}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData.authActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="successful" name="Successful" stackId="a" fill="#22C55E" radius={[0, 0, 0, 0]} />
              <Bar dataKey="failed" name="Failed" stackId="a" fill="#EF4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top Source IP Addresses" icon={<Globe size={16} />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chartData.topIPs.map((item, i) => (
              <div key={item.ip} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: '#64748b', width: 16, textAlign: 'right' }}>{i + 1}</span>
                <span className="mono" style={{ width: 130, color: '#94a3b8', fontSize: 12 }}>{item.ip}</span>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <motion.div
                    className="progress-fill"
                    style={{ background: `hsl(${220 - i * 15}, 80%, 60%)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / maxIpCount) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.6 }}
                  />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', width: 30, textAlign: 'right' }}>{item.count}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Row 3: MITRE Radar + Alert Categories Pie */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ChartCard title="MITRE ATT&CK Coverage" icon={<Target size={16} />}>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={chartData.mitre}>
              <PolarGrid stroke="#1e3a5f" />
              <PolarAngleAxis dataKey="technique" tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="Coverage %" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip contentStyle={tooltipStyle.contentStyle} labelStyle={tooltipStyle.labelStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Alert Categories" icon={<Tag size={16} />}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie data={chartData.alertsByCategory} cx="50%" cy="50%" outerRadius={85} dataKey="value" paddingAngle={2}>
                  {chartData.alertsByCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {chartData.alertsByCategory.map(cat => (
                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: cat.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#94a3b8', flex: 1 }}>{cat.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};
