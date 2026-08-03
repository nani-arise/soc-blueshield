import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SecurityEvent, Severity } from '../data/mockData';

interface EventsTableProps {
  events: SecurityEvent[];
  total: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  filterSeverity: string;
  filterCategory: string;
  sortBy: 'timestamp' | 'severity';
  sortDir: 'asc' | 'desc';
  onSearch: (q: string) => void;
  onFilterSeverity: (s: string) => void;
  onFilterCategory: (c: string) => void;
  onSort: (col: 'timestamp' | 'severity') => void;
  onPage: (p: number) => void;
  isLoading: boolean;
}

const sevBadge = (sev: Severity) => <span className={`badge badge-${sev}`}>{sev}</span>;
const statusBadge = (s: string) => <span className={`badge status-${s}`}>{s.replace('_', ' ')}</span>;

const categories = ['all', 'Authentication', 'Malware', 'Network', 'Endpoint', 'File Integrity', 'System Events'];

export const EventsTable: React.FC<EventsTableProps> = ({
  events, total, currentPage, totalPages,
  searchQuery, filterSeverity, filterCategory,
  sortBy, sortDir, onSearch, onFilterSeverity, onFilterCategory, onSort, onPage, isLoading,
}) => {
  const SortIcon = ({ col }: { col: string }) => {
    if (sortBy !== col) return <ChevronUp size={12} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc' ? <ChevronUp size={12} color="#3B82F6" /> : <ChevronDown size={12} color="#3B82F6" />;
  };

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ overflow: 'hidden' }}
    >
      {/* Header */}
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #1e3a5f' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>Recent Security Events</h3>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{total.toLocaleString()} events total</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              className="soc-input"
              placeholder="Search events, IPs, users..."
              value={searchQuery}
              onChange={e => onSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 32 }}
            />
          </div>

          <select
            className="soc-input"
            value={filterSeverity}
            onChange={e => onFilterSeverity(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            className="soc-input"
            value={filterCategory}
            onChange={e => onFilterCategory(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>

          <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={13} /> Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="soc-table">
          <thead>
            <tr>
              <th>
                <button onClick={() => onSort('timestamp')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Timestamp <SortIcon col="timestamp" />
                </button>
              </th>
              <th>Rule ID</th>
              <th>Event</th>
              <th>Username</th>
              <th>Source IP</th>
              <th>Agent</th>
              <th>
                <button onClick={() => onSort('severity')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Severity <SortIcon col="severity" />
                </button>
              </th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>
                  ))}
                </tr>
              ))
            ) : (
              <AnimatePresence initial={false}>
                {events.map((evt, i) => (
                  <motion.tr
                    key={evt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    style={{ cursor: 'pointer' }}
                  >
                    <td><span className="mono">{new Date(evt.timestamp).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></td>
                    <td><span className="mono" style={{ color: '#3B82F6' }}>{evt.ruleId}</span></td>
                    <td style={{ maxWidth: 220 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#e2e8f0', fontSize: 13 }} title={evt.event}>{evt.event}</div>
                    </td>
                    <td><span style={{ color: '#94a3b8' }}>{evt.username}</span></td>
                    <td><span className="mono" style={{ color: '#EAB308' }}>{evt.sourceIp}</span></td>
                    <td><span style={{ color: '#94a3b8', fontSize: 12 }}>{evt.agent}</span></td>
                    <td>{sevBadge(evt.severity)}</td>
                    <td>{statusBadge(evt.status)}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          Page {currentPage} of {totalPages} ({total.toLocaleString()} results)
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-ghost" onClick={() => onPage(currentPage - 1)} disabled={currentPage === 1} style={{ padding: '5px 10px', opacity: currentPage === 1 ? 0.4 : 1 }}>
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
            return p <= totalPages ? (
              <button
                key={p}
                className={`btn ${p === currentPage ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => onPage(p)}
                style={{ padding: '5px 10px', minWidth: 32 }}
              >
                {p}
              </button>
            ) : null;
          })}
          <button className="btn btn-ghost" onClick={() => onPage(currentPage + 1)} disabled={currentPage === totalPages} style={{ padding: '5px 10px', opacity: currentPage === totalPages ? 0.4 : 1 }}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
