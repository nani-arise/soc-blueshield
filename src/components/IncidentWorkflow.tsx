import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface IncidentWorkflowProps {
  currentStage?: number;
}

const stages = [
  { label: 'Detection', desc: 'IOC identified by SIEM rule or analyst', color: '#3B82F6' },
  { label: 'Alert', desc: 'Alert generated and triaged', color: '#EAB308' },
  { label: 'Investigation', desc: 'Root cause analysis underway', color: '#F97316' },
  { label: 'Containment', desc: 'Threat contained, spread prevented', color: '#EF4444' },
  { label: 'Eradication', desc: 'Malicious artifacts removed', color: '#8B5CF6' },
  { label: 'Recovery', desc: 'Systems restored to normal', color: '#22C55E' },
  { label: 'Closure', desc: 'Incident documented and closed', color: '#64748b' },
];

export const IncidentWorkflow: React.FC<IncidentWorkflowProps> = ({ currentStage = 3 }) => {
  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: 28 }}
    >
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>Incident Response Lifecycle</h3>
        <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Standard SOC incident response workflow — current stage highlighted</p>
      </div>

      {/* Desktop: horizontal */}
      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', overflowX: 'auto', paddingBottom: 12 }}>
        {stages.map((stage, i) => {
          const isComplete = i + 1 < currentStage;
          const isCurrent = i + 1 === currentStage;

          return (
            <React.Fragment key={stage.label}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minWidth: 100, flex: 1 }}
              >
                {/* Circle */}
                <motion.div
                  animate={isCurrent ? { scale: [1, 1.1, 1], boxShadow: [`0 0 0px ${stage.color}`, `0 0 20px ${stage.color}60`, `0 0 0px ${stage.color}`] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: isComplete ? stage.color : isCurrent ? `linear-gradient(135deg, ${stage.color}, ${stage.color}aa)` : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${isComplete || isCurrent ? stage.color : '#1e3a5f'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isComplete || isCurrent ? 'white' : '#64748b',
                    fontSize: 15, fontWeight: 800,
                    transition: 'all 0.3s',
                    position: 'relative', zIndex: 1,
                  }}
                >
                  {isComplete ? <CheckCircle2 size={20} /> : <span>{i + 1}</span>}
                </motion.div>

                {/* Label */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: isComplete ? stage.color : isCurrent ? '#e2e8f0' : '#64748b', marginBottom: 4 }}>
                    {stage.label}
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b', maxWidth: 90, lineHeight: 1.3, textAlign: 'center' }}>
                    {stage.desc}
                  </div>
                  {isCurrent && (
                    <motion.div
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      style={{ marginTop: 6, fontSize: 9, fontWeight: 700, color: stage.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    >
                      ● Active
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Connector */}
              {i < stages.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: 14, flex: 0.4, minWidth: 20 }}>
                  <div style={{
                    flex: 1, height: 2,
                    background: i + 1 < currentStage ? `linear-gradient(90deg, ${stages[i].color}, ${stages[i + 1].color})` : '#1e3a5f',
                    transition: 'background 0.5s',
                  }} />
                  <ArrowRight size={12} color={i + 1 < currentStage ? stages[i + 1].color : '#1e3a5f'} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Stage legend */}
      <div style={{ marginTop: 24, padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: '1px solid #1e3a5f' }}>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>Stage {currentStage} of {stages.length}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: stages[currentStage - 1]?.color }}>
          Currently in: {stages[currentStage - 1]?.label}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{stages[currentStage - 1]?.desc}</div>
      </div>
    </motion.div>
  );
};
