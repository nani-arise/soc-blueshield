import React from 'react';
import './index.css';
import { AnimatePresence, motion } from 'framer-motion';
import { useSOCData } from './hooks/useSOCData';

import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { KPICards } from './components/KPICards';
import { ChartsSection } from './components/ChartsSection';
import { EventsTable } from './components/EventsTable';
import { IncidentResponse } from './components/IncidentResponse';
import { ThreatIntel } from './components/ThreatIntel';
import { ActiveAgents } from './components/ActiveAgents';
import { AttackTimeline } from './components/AttackTimeline';
import { DetectionRules } from './components/DetectionRules';
import { IncidentWorkflow } from './components/IncidentWorkflow';
import { ExportFeatures } from './components/ExportFeatures';
import { ToastContainer } from './components/ToastContainer';
import { AuthMonitoring } from './components/AuthMonitoring';
import { SettingsPage } from './components/SettingsPage';

import { Shield, AlertTriangle, Brain, Lock, Monitor, FileText, Settings } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function PageHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'rgba(59,130,246,0.15)',
          border: '1px solid rgba(59,130,246,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#3B82F6',
        }}>
          {icon}
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.01em' }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const {
    activeNav, setActiveNav,
    events, pagedEvents, filteredEvents,
    incidents, updateIncidentStatus, updateIncidentStage,
    agents,
    toasts, addToast, removeToast,
    searchQuery, setSearchQuery,
    filterSeverity, setFilterSeverity,
    filterCategory, setFilterCategory,
    currentPage, setCurrentPage,
    totalPages,
    sortBy, setSortBy,
    sortDir, setSortDir,
    clock,
    isLoading,
    kpis,
    chartData,
  } = useSOCData();

  const handleRefresh = () => {
    addToast({ type: 'success', title: 'Data Refreshed', message: 'Dashboard data updated successfully.' });
  };

  const handleSort = (col: 'timestamp' | 'severity') => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
    setCurrentPage(1);
  };

  const handleSearch = (q: string) => { setSearchQuery(q); setCurrentPage(1); };
  const handleFilterSeverity = (s: string) => { setFilterSeverity(s); setCurrentPage(1); };
  const handleFilterCategory = (c: string) => { setFilterCategory(c); setCurrentPage(1); };

  return (
    <>
      <Sidebar active={activeNav} onNav={setActiveNav} />
      <div className="main-content">
        <Topbar
          clock={clock}
          searchQuery={searchQuery}
          onSearch={q => { handleSearch(q); if (q) setActiveNav('events'); }}
          onRefresh={handleRefresh}
          onNavEvents={() => setActiveNav('events')}
        />

        <div className="page-content" id="dashboard-main">
          <AnimatePresence mode="wait">

            {activeNav === 'dashboard' && (
              <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
                <div style={{ marginBottom: 20 }}>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.01em' }}>
                    Security Overview
                  </h1>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    Real-time security monitoring &nbsp;•&nbsp; Auto-refresh every 30s &nbsp;•&nbsp;
                    <span style={{ color: '#22C55E' }}> ● Live</span>
                  </p>
                </div>
                <KPICards kpis={kpis} isLoading={isLoading} />
                <ChartsSection chartData={chartData} isLoading={isLoading} />
                <div style={{ marginTop: 20 }}>
                  <AttackTimeline events={events} />
                </div>
              </motion.div>
            )}

            {activeNav === 'events' && (
              <motion.div key="events" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
                <PageHeader
                  icon={<Shield size={18} />}
                  title="Security Events"
                  subtitle={`${filteredEvents.length.toLocaleString()} events matching current filters`}
                />
                <EventsTable
                  events={pagedEvents}
                  total={filteredEvents.length}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  searchQuery={searchQuery}
                  filterSeverity={filterSeverity}
                  filterCategory={filterCategory}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSearch={handleSearch}
                  onFilterSeverity={handleFilterSeverity}
                  onFilterCategory={handleFilterCategory}
                  onSort={handleSort}
                  onPage={setCurrentPage}
                  isLoading={isLoading}
                />
              </motion.div>
            )}

            {activeNav === 'incidents' && (
              <motion.div key="incidents" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
                <PageHeader
                  icon={<AlertTriangle size={18} />}
                  title="Incident Response"
                  subtitle="Active incidents and response workflows"
                />
                <IncidentWorkflow currentStage={3} />
                <div style={{ marginTop: 20 }}>
                  <IncidentResponse
                    incidents={incidents}
                    onUpdateStatus={updateIncidentStatus}
                    onUpdateStage={updateIncidentStage}
                  />
                </div>
              </motion.div>
            )}

            {activeNav === 'threat-intel' && (
              <motion.div key="threat-intel" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
                <PageHeader
                  icon={<Brain size={18} />}
                  title="Threat Intelligence"
                  subtitle="Global threat landscape and indicators of compromise"
                />
                <ThreatIntel />
              </motion.div>
            )}

            {activeNav === 'auth' && (
              <motion.div key="auth" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
                <PageHeader
                  icon={<Lock size={18} />}
                  title="Authentication Monitoring"
                  subtitle="Login activities, failed attempts, and account lockouts"
                />
                <AuthMonitoring />
              </motion.div>
            )}

            {activeNav === 'agents' && (
              <motion.div key="agents" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
                <PageHeader
                  icon={<Monitor size={18} />}
                  title="Active Agents"
                  subtitle="Monitored endpoints and their real-time health status"
                />
                <ActiveAgents agents={agents} />
              </motion.div>
            )}

            {activeNav === 'reports' && (
              <motion.div key="reports" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
                <PageHeader
                  icon={<FileText size={18} />}
                  title="Reports & Exports"
                  subtitle="Download security data and generate incident reports"
                />
                <ExportFeatures events={events} incidents={incidents} onRefresh={handleRefresh} />
                <div style={{ marginTop: 20 }}>
                  <DetectionRules />
                </div>
              </motion.div>
            )}

            {activeNav === 'settings' && (
              <motion.div key="settings" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
                <PageHeader
                  icon={<Settings size={18} />}
                  title="Settings"
                  subtitle="Configure dashboard preferences and security policies"
                />
                <SettingsPage />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
