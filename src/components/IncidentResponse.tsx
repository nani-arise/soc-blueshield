import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Clock, CheckCircle, XCircle, Search, ArrowUpCircle, ChevronRight } from 'lucide-react';
import type { Incident, IncidentStatus, Severity } from '../data/mockData';

interface IncidentResponseProps {
  incidents: Incident[];
  onUpdateStatus: (id: string, status: IncidentStatus) => void;
  onUpdateStage: (id: string, stage: number) => void;
}

const stages = ['Detection', 'Alert', 'Investigation', 'Containment', 'Eradication', 'Recovery', 'Closure'];

const sevGradient: Record<Severity, string> = {
  critical: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
  high: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))',
  medium: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(234,179,8,0.05))',
  low: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
};

const sevColor: Record<Severity, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#22C55E',
};

const statusColor: Record<string, string> = {
  open: '#3B82F6',
  investigating: '#EAB308',
  contained: '#F97316',
  resolved: '#22C55E',
  closed: '#64748b',
};

export const IncidentResponse: React.FC<IncidentResponseProps> = ({ incidents, onUpdateStatus, onUpdateStage }) => {
  const [selected, setSelected] = useState<Incident | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = incidents.filter(i => filterStatus === 'all' || i.status === filterStatus);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 20 }}>
      {/* List */}
      <div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {['all', 'open', 'investigating', 'contained', 'resolved', 'closed'].map(s => (
            <button
              key={s}
              className={`btn ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterStatus(s)}
              style={{ fontSize: 11, padding: '5px 12px', textTransform: 'capitalize' }}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((inc, i) => (
            <motion.div
              key={inc.id}
              className={`incident-card incident-card-${inc.severity}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{
                background: sevGradient[inc.severity],
                cursor: 'pointer',
                border: `1px solid ${sevColor[inc.severity]}40`,
                outline: selected?.id === inc.id ? `2px solid ${sevColor[inc.severity]}` : 'none',
              }}
              onClick={() => setSelected(selected?.id === inc.id ? null : inc)}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="mono" style={{ fontSize: 11, color: '#64748b' }}>{inc.id}</span>
                    <span className={`badge badge-${inc.severity}`}>{inc.severity}</span>
                    <span className="badge" style={{ background: `${statusColor[inc.status]}15`, color: statusColor[inc.status], border: `1px solid ${statusColor[inc.status]}40` }}>
                      {inc.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3 }}>{inc.title}</h4>
                </div>
                <ChevronRight size={16} color="#64748b" style={{ flexShrink: 0, marginTop: 2 }} />
              </div>

              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 12 }}>{inc.description}</p>

              {/* Stage progress */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  {stages.map((stage, si) => (
                    <React.Fragment key={stage}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: si < inc.stage ? sevColor[inc.severity] : 'rgba(255,255,255,0.08)',
                        fontSize: 9, fontWeight: 700,
                        color: si < inc.stage ? 'white' : '#64748b',
                        transition: 'all 0.3s',
                        flexShrink: 0,
                      }}>
                        {si + 1}
                      </div>
                      {si < stages.length - 1 && (
                        <div style={{ flex: 1, height: 2, background: si < inc.stage - 1 ? sevColor[inc.severity] : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>
                  Stage {inc.stage}/{stages.length}: <span style={{ color: sevColor[inc.severity] }}>{stages[inc.stage - 1] || stages[stages.length - 1]}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={12} color="#64748b" />
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>{inc.assignedTo}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} color="#64748b" />
                  <span style={{ fontSize: 11, color: '#64748b' }}>{new Date(inc.updatedAt).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={e => { e.stopPropagation(); setSelected(inc); }} style={{ fontSize: 11 }}>
                  <Search size={11} /> Investigate
                </button>
                <button className="btn btn-ghost" onClick={e => { e.stopPropagation(); onUpdateStatus(inc.id, 'investigating'); }} style={{ fontSize: 11 }}>
                  <User size={11} /> Assign
                </button>
                {inc.severity === 'critical' || inc.severity === 'high' ? (
                  <button className="btn btn-warning" onClick={e => { e.stopPropagation(); onUpdateStatus(inc.id, 'contained'); }} style={{ fontSize: 11 }}>
                    <ArrowUpCircle size={11} /> Escalate
                  </button>
                ) : null}
                <button className="btn btn-success" onClick={e => { e.stopPropagation(); onUpdateStatus(inc.id, 'resolved'); onUpdateStage(inc.id, 7); }} style={{ fontSize: 11 }}>
                  <CheckCircle size={11} /> Close
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ padding: 24, position: 'sticky', top: 0, alignSelf: 'flex-start', border: `1px solid ${sevColor[selected.severity]}40` }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: 12, color: '#64748b' }}>{selected.id}</span>
                <span className={`badge badge-${selected.severity}`}>{selected.severity}</span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>{selected.title}</h3>
            </div>
            <button className="btn btn-ghost" onClick={() => setSelected(null)} style={{ padding: '4px 8px' }}>
              <XCircle size={14} />
            </button>
          </div>

          <div style={{ marginBottom: 16, padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: '1px solid #1e3a5f' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Description</div>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{selected.description}</p>
          </div>

          <div style={{ marginBottom: 16, padding: 14, background: 'rgba(34,197,94,0.05)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)' }}>
            <div style={{ fontSize: 11, color: '#22C55E', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Recommended Response</div>
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{selected.recommendedResponse}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Assigned To', value: selected.assignedTo },
              { label: 'Status', value: selected.status },
              { label: 'Created', value: new Date(selected.createdAt).toLocaleString() },
              { label: 'Updated', value: new Date(selected.updatedAt).toLocaleString() },
            ].map(f => (
              <div key={f.label} style={{ padding: 10, background: 'rgba(0,0,0,0.15)', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{f.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onUpdateStatus(selected.id, 'investigating')}>
              Mark Investigating
            </button>
            <button className="btn btn-danger" onClick={() => onUpdateStatus(selected.id, 'closed')}>
              <XCircle size={13} /> Close
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
