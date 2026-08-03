import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import type { ConnectionStatus } from '../hooks/useWazuhData';

interface ConnectionBannerProps {
  status: ConnectionStatus;
  error: string;
  wazuhVersion: string;
  lastRefresh: Date | null;
  isRefreshing: boolean;
  onRetry: () => void;
}

export const ConnectionBanner: React.FC<ConnectionBannerProps> = ({
  status, error, wazuhVersion, lastRefresh, isRefreshing, onRetry
}) => {
  if (status === 'connected') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 14px', background: 'rgba(34,197,94,0.08)',
        border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8,
        fontSize: 11,
      }}>
        <span className="pulse-dot pulse-dot-green" />
        <span style={{ color: '#22C55E', fontWeight: 600 }}>LIVE</span>
        <span style={{ color: '#64748b' }}>Wazuh {wazuhVersion}</span>
        {lastRefresh && (
          <span style={{ color: '#64748b' }}>· Updated {lastRefresh.toLocaleTimeString()}</span>
        )}
        <motion.button
          onClick={onRetry}
          disabled={isRefreshing}
          whileTap={{ rotate: 360 }}
          transition={{ duration: 0.4 }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 2, display: 'flex' }}
        >
          <RefreshCw size={11} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
        </motion.button>
      </div>
    );
  }

  if (status === 'connecting') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 11 }}>
        <Loader2 size={12} color="#3B82F6" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ color: '#3B82F6' }}>Connecting to Wazuh...</span>
      </div>
    );
  }

  if (status === 'unconfigured') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '10px 18px', background: 'rgba(234,179,8,0.08)',
            border: '1px solid rgba(234,179,8,0.3)', borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 10, fontSize: 12,
          }}
        >
          <AlertTriangle size={14} color="#EAB308" />
          <div>
            <span style={{ color: '#EAB308', fontWeight: 700 }}>Wazuh not configured — </span>
            <span style={{ color: '#94a3b8' }}>Edit </span>
            <code style={{ color: '#EAB308', background: 'rgba(234,179,8,0.1)', padding: '1px 6px', borderRadius: 4 }}>.env.local</code>
            <span style={{ color: '#94a3b8' }}> with your Wazuh IP and credentials. Currently showing mock data.</span>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 12 }}>
        <WifiOff size={13} color="#EF4444" />
        <span style={{ color: '#EF4444', fontWeight: 600 }}>Wazuh Error:</span>
        <span style={{ color: '#94a3b8' }}>{error}</span>
        <button className="btn btn-danger" onClick={onRetry} style={{ fontSize: 10, padding: '3px 10px', marginLeft: 8 }}>
          Retry
        </button>
      </div>
    );
  }

  return null;
};
