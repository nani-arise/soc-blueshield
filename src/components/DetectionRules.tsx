import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import { detectionRules } from '../data/mockData';
import type { DetectionRule } from '../data/mockData';

export const DetectionRules: React.FC = () => {
  const [rules, setRules] = useState<DetectionRule[]>(detectionRules);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const totalTriggers = rules.reduce((acc, r) => acc + r.triggerCount, 0);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Rules', value: rules.length, color: '#3B82F6' },
          { label: 'Enabled', value: rules.filter(r => r.enabled).length, color: '#22C55E' },
          { label: 'Disabled', value: rules.filter(r => !r.enabled).length, color: '#64748b' },
          { label: 'Total Triggers', value: totalTriggers.toLocaleString(), color: '#EF4444' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ flex: 1, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ overflow: 'hidden' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="soc-table">
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Description</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Trigger Count</th>
                <th>Last Triggered</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule, i) => (
                <motion.tr
                  key={rule.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Shield size={13} color="#3B82F6" />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{rule.name}</div>
                        <div className="mono" style={{ fontSize: 10, color: '#64748b' }}>{rule.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ maxWidth: 280 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={rule.description}>
                      {rule.description}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4 }}>
                      {rule.category}
                    </span>
                  </td>
                  <td><span className={`badge badge-${rule.severity}`}>{rule.severity}</span></td>
                  <td>
                    <span style={{ fontSize: 14, fontWeight: 800, color: rule.triggerCount > 100 ? '#EF4444' : rule.triggerCount > 20 ? '#F97316' : '#94a3b8' }}>
                      {rule.triggerCount.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} color="#64748b" />
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        {new Date(rule.lastTriggered).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleRule(rule.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {rule.enabled
                        ? <ToggleRight size={22} color="#22C55E" />
                        : <ToggleLeft size={22} color="#64748b" />
                      }
                      <span style={{ fontSize: 11, color: rule.enabled ? '#22C55E' : '#64748b', fontWeight: 600 }}>
                        {rule.enabled ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
