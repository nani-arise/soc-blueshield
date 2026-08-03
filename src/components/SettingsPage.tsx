import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Database, Eye, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {[
        {
          title: 'Notification Settings', icon: <Bell size={16} />, items: [
            { label: 'Critical Alert Emails', value: true, type: 'toggle' },
            { label: 'Slack Integration', value: true, type: 'toggle' },
            { label: 'SMS for Critical Alerts', value: false, type: 'toggle' },
            { label: 'Daily Summary Report', value: true, type: 'toggle' },
            { label: 'Alert Cooldown (mins)', value: '5', type: 'input' },
          ]
        },
        {
          title: 'Security Settings', icon: <Shield size={16} />, items: [
            { label: 'Two-Factor Authentication', value: true, type: 'toggle' },
            { label: 'Session Timeout (mins)', value: '30', type: 'input' },
            { label: 'IP Whitelist Only', value: false, type: 'toggle' },
            { label: 'Audit Logging', value: true, type: 'toggle' },
            { label: 'API Rate Limiting', value: true, type: 'toggle' },
          ]
        },
        {
          title: 'Data Retention', icon: <Database size={16} />, items: [
            { label: 'Event Retention (days)', value: '90', type: 'input' },
            { label: 'Log Archive Enabled', value: true, type: 'toggle' },
            { label: 'Alert Retention (days)', value: '180', type: 'input' },
            { label: 'Auto-Archive Events', value: true, type: 'toggle' },
            { label: 'Compressed Storage', value: true, type: 'toggle' },
          ]
        },
        {
          title: 'Display Settings', icon: <Eye size={16} />, items: [
            { label: 'Dark Mode', value: true, type: 'toggle' },
            { label: 'Compact Table View', value: false, type: 'toggle' },
            { label: 'Auto-Refresh Interval (s)', value: '30', type: 'input' },
            { label: 'Show Resolved Events', value: false, type: 'toggle' },
            { label: 'Animate Charts', value: true, type: 'toggle' },
          ]
        },
      ].map((section, si) => (
        <motion.div
          key={section.title}
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.08 }}
          style={{ padding: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <span style={{ color: '#3B82F6' }}>{section.icon}</span>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{section.title}</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {section.items.map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid rgba(30,58,95,0.5)' }}>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>{item.label}</span>
                {item.type === 'toggle' ? (
                  <button
                    style={{
                      width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: item.value ? '#3B82F6' : '#1e3a5f',
                      position: 'relative', transition: 'background 0.3s',
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: 'white',
                      position: 'absolute', top: 3,
                      left: item.value ? 23 : 3,
                      transition: 'left 0.3s',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    }} />
                  </button>
                ) : (
                  <input
                    className="soc-input"
                    defaultValue={item.value as string}
                    style={{ width: 80, textAlign: 'right' }}
                  />
                )}
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
            <Save size={13} /> Save Changes
          </button>
        </motion.div>
      ))}
    </div>
  );
};
