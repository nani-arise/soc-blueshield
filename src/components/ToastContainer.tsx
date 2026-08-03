import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import type { Toast } from '../hooks/useSOCData';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const toastConfig: Record<Toast['type'], { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  critical: { icon: <ShieldAlert size={16} />, color: '#EF4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
  high:     { icon: <AlertTriangle size={16} />, color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' },
  medium:   { icon: <AlertTriangle size={16} />, color: '#EAB308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)' },
  info:     { icon: <Info size={16} />, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
  success:  { icon: <CheckCircle size={16} />, color: '#22C55E', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' },
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map(toast => {
          const cfg = toastConfig[toast.type];
          return (
            <motion.div
              key={toast.id}
              className="toast"
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{ background: cfg.bg, borderColor: cfg.border, borderWidth: 1, borderStyle: 'solid' }}
            >
              <div style={{ color: cfg.color, marginTop: 1, flexShrink: 0 }}>{cfg.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{toast.title}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>{toast.message}</div>
              </div>
              <button
                onClick={() => onRemove(toast.id)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2, flexShrink: 0, marginTop: 1 }}
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
