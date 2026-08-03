import React from 'react';
import { motion } from 'framer-motion';
import { Globe, AlertOctagon, Bug, ShieldAlert, Wifi } from 'lucide-react';
import { topAttackingCountries, maliciousIPs, latestCVEs, malwareFamilies } from '../data/mockData';

const countryFlags: Record<string, string> = {
  CN: '🇨🇳', RU: '🇷🇺', KP: '🇰🇵', IR: '🇮🇷', US: '🇺🇸',
  RO: '🇷🇴', BR: '🇧🇷', IN: '🇮🇳', DE: '🇩🇪', NL: '🇳🇱',
};

const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <motion.div
    className="glass-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{ padding: 20 }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <span style={{ color: '#3B82F6' }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{title}</span>
    </div>
    {children}
  </motion.div>
);

export const ThreatIntel: React.FC = () => {
  const maxAttacks = topAttackingCountries[0].attacks;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* Top Attacking Countries */}
      <Card title="Top Attacking Countries" icon={<Globe size={16} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {topAttackingCountries.map((c, i) => (
            <div key={c.code} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{countryFlags[c.code] || '🌍'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 500 }}>{c.country}</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{c.attacks.toLocaleString()}</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    style={{ background: `hsl(${210 + i * 8}, 80%, 55%)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(c.attacks / maxAttacks) * 100}%` }}
                    transition={{ delay: i * 0.05, duration: 0.6 }}
                  />
                </div>
              </div>
              <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 700, width: 30, textAlign: 'right' }}>{c.percentage}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Malicious IPs */}
      <Card title="Top Malicious IPs" icon={<Wifi size={16} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {maliciousIPs.map((ip, i) => (
            <motion.div
              key={ip.ip}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: '1px solid #1e3a5f' }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: ip.reputation > 90 ? '#EF4444' : '#F97316', flexShrink: 0 }} />
              <span className="mono" style={{ fontSize: 12, color: '#EAB308', flex: 1 }}>{ip.ip}</span>
              <span style={{ fontSize: 10, color: '#64748b' }}>{ip.country}</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#EF4444', fontWeight: 700 }}>{ip.reputation}/100</div>
                <div style={{ fontSize: 9, color: '#64748b' }}>{ip.category}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Latest CVEs */}
      <Card title="Latest CVEs" icon={<AlertOctagon size={16} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {latestCVEs.map((cve, i) => (
            <motion.div
              key={cve.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: `1px solid ${cve.severity === 'critical' ? 'rgba(239,68,68,0.3)' : 'rgba(249,115,22,0.3)'}` }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="mono" style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600 }}>{cve.id}</span>
                <span className={`badge badge-${cve.severity}`}>{cve.severity}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: cve.cvss >= 9 ? '#EF4444' : cve.cvss >= 7 ? '#F97316' : '#EAB308' }}>
                  CVSS {cve.cvss}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4, marginBottom: 4 }}>{cve.description}</p>
              <div style={{ fontSize: 10, color: '#64748b' }}>Affects: {cve.affectedProduct} · Published: {cve.published}</div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Malware Families */}
      <Card title="Recent Malware Families" icon={<Bug size={16} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {malwareFamilies.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: '1px solid #1e3a5f' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `rgba(239,68,68,0.1)`, border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ShieldAlert size={16} color="#EF4444" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{m.name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{m.type}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#EF4444' }}>{m.detections}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>detections</div>
              </div>
              <span className={`badge badge-${m.severity}`}>{m.severity}</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
};
