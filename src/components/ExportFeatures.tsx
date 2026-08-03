import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Table, Image, RefreshCw } from 'lucide-react';
import type { SecurityEvent, Incident } from '../data/mockData';
import { exportEventsToCSV, exportIncidentToPDF, exportDashboardToPNG } from '../utils/exportUtils';

interface ExportFeaturesProps {
  events: SecurityEvent[];
  incidents: Incident[];
  onRefresh: () => void;
}

export const ExportFeatures: React.FC<ExportFeaturesProps> = ({ events, incidents, onRefresh }) => {
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingPng, setExportingPng] = useState(false);

  const handlePDF = async (inc: Incident) => {
    setExportingPdf(true);
    await new Promise(r => setTimeout(r, 300));
    exportIncidentToPDF(inc);
    setExportingPdf(false);
  };

  const handlePNG = async () => {
    setExportingPng(true);
    await new Promise(r => setTimeout(r, 300));
    await exportDashboardToPNG('dashboard-main');
    setExportingPng(false);
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
        {/* CSV Export */}
        <motion.div
          className="glass-card-hover"
          style={{ padding: 24, textAlign: 'center', cursor: 'pointer' }}
          whileHover={{ scale: 1.02 }}
          onClick={() => exportEventsToCSV(events)}
        >
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Table size={24} color="#22C55E" />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>Export Security Events</h3>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16, lineHeight: 1.5 }}>Download all {events.length.toLocaleString()} security events as a CSV file for further analysis.</p>
          <button className="btn btn-success" style={{ width: '100%', justifyContent: 'center' }}>
            <Download size={13} /> Download CSV
          </button>
        </motion.div>

        {/* PNG Export */}
        <motion.div
          className="glass-card-hover"
          style={{ padding: 24, textAlign: 'center', cursor: 'pointer' }}
          whileHover={{ scale: 1.02 }}
          onClick={handlePNG}
        >
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Image size={24} color="#3B82F6" />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>Dashboard Snapshot</h3>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16, lineHeight: 1.5 }}>Capture a PNG screenshot of the dashboard for reports or presentations.</p>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={exportingPng}>
            {exportingPng ? <RefreshCw size={13} className="animate-spin" /> : <Download size={13} />}
            {exportingPng ? 'Capturing...' : 'Download PNG'}
          </button>
        </motion.div>

        {/* Auto-refresh */}
        <motion.div
          className="glass-card-hover"
          style={{ padding: 24, textAlign: 'center', cursor: 'pointer' }}
          whileHover={{ scale: 1.02 }}
          onClick={onRefresh}
        >
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <RefreshCw size={24} color="#EAB308" />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>Refresh Data</h3>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16, lineHeight: 1.5 }}>Manually refresh all dashboard data. Auto-refresh occurs every 30 seconds.</p>
          <button className="btn btn-warning" style={{ width: '100%', justifyContent: 'center' }}>
            <RefreshCw size={13} /> Refresh Now
          </button>
        </motion.div>
      </div>

      {/* Incident PDF exports */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: 20 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <FileText size={16} color="#3B82F6" />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Incident PDF Reports</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {incidents.map(inc => (
            <div key={inc.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderRadius: 8, border: '1px solid #1e3a5f' }}>
              <span className="mono" style={{ fontSize: 11, color: '#64748b', width: 80 }}>{inc.id}</span>
              <span className={`badge badge-${inc.severity}`}>{inc.severity}</span>
              <span style={{ flex: 1, fontSize: 13, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.title}</span>
              <span style={{ fontSize: 11, color: '#64748b' }}>{inc.assignedTo}</span>
              <button
                className="btn btn-primary"
                style={{ fontSize: 11, padding: '5px 12px', flexShrink: 0 }}
                onClick={() => handlePDF(inc)}
                disabled={exportingPdf}
              >
                <Download size={11} /> Export PDF
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
