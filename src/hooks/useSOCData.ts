import { useState, useEffect, useCallback, useRef } from 'react';
import {
  securityEvents, incidents as initialIncidents, agentsList as initialAgents,
  getKPIs, getAlertsOverTime, getAlertsBySeverity, getAuthActivityByDay,
  getTopSourceIPs, getMitreData, getAlertsByCategory,
} from '../data/mockData';
import type { SecurityEvent, Incident, Agent, IncidentStatus } from '../data/mockData';

export type NavItem =
  | 'dashboard' | 'events' | 'incidents' | 'threat-intel'
  | 'auth' | 'agents' | 'reports' | 'settings';

export interface Toast {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'info' | 'success';
  title: string;
  message: string;
}

const randomNewEvents: SecurityEvent[] = [
  { id: 'EVT-LIVE-001', timestamp: new Date().toISOString(), ruleId: 'AUTH-001', event: 'Multiple Failed Login Attempts', username: 'admin', sourceIp: '185.220.101.5', agent: 'CORP-SRV-DC01', severity: 'high', status: 'new', category: 'Authentication', description: 'Brute-force detected in real-time.' },
  { id: 'EVT-LIVE-002', timestamp: new Date().toISOString(), ruleId: 'MAL-001', event: 'Malware Signature Detected', username: 'john.doe', sourceIp: '192.168.1.55', agent: 'CORP-PC-001', severity: 'critical', status: 'new', category: 'Malware', description: 'Known malware signature detected.' },
  { id: 'EVT-LIVE-003', timestamp: new Date().toISOString(), ruleId: 'EXE-001', event: 'Suspicious PowerShell Execution', username: 'svc_deploy', sourceIp: '10.0.0.23', agent: 'CORP-SRV-WEB01', severity: 'high', status: 'new', category: 'Endpoint', description: 'Encoded PowerShell command detected.' },
  { id: 'EVT-LIVE-004', timestamp: new Date().toISOString(), ruleId: 'NET-001', event: 'Network Port Scan Detected', username: 'SYSTEM', sourceIp: '91.108.4.168', agent: 'CORP-SRV-DB01', severity: 'medium', status: 'new', category: 'Network', description: 'External port scan in progress.' },
  { id: 'EVT-LIVE-005', timestamp: new Date().toISOString(), ruleId: 'CRED-001', event: 'Credential Dump Attempt', username: 'administrator', sourceIp: '10.10.10.5', agent: 'CORP-SRV-DC01', severity: 'critical', status: 'new', category: 'Endpoint', description: 'LSASS memory access attempt detected.' },
];

export function useSOCData() {
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard');
  const [events, setEvents] = useState<SecurityEvent[]>(securityEvents);
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity'>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [clock, setClock] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState({
    alertsOverTime: getAlertsOverTime(),
    alertsBySeverity: getAlertsBySeverity(),
    authActivity: getAuthActivityByDay(),
    topIPs: getTopSourceIPs(),
    mitre: getMitreData(),
    alertsByCategory: getAlertsByCategory(),
  });
  const liveEventIndex = useRef(0);
  const PAGE_SIZE = 20;

  // Loading simulation
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-refresh mock data every 30 seconds
  useEffect(() => {
    const t = setInterval(() => {
      const newEvt = { ...randomNewEvents[liveEventIndex.current % randomNewEvents.length], id: `EVT-LIVE-${Date.now()}`, timestamp: new Date().toISOString() };
      liveEventIndex.current++;
      setEvents(prev => [newEvt, ...prev]);

      // Update agent CPU/Memory dynamically
      setAgents(prev => prev.map(a => a.status === 'online' ? {
        ...a,
        cpu: Math.min(99, Math.max(5, a.cpu + Math.floor(Math.random() * 11) - 5)),
        memory: Math.min(99, Math.max(10, a.memory + Math.floor(Math.random() * 7) - 3)),
      } : a));

      // Refresh chart data
      setChartData({
        alertsOverTime: getAlertsOverTime(),
        alertsBySeverity: getAlertsBySeverity(),
        authActivity: getAuthActivityByDay(),
        topIPs: getTopSourceIPs(),
        mitre: getMitreData(),
        alertsByCategory: getAlertsByCategory(),
      });

      // Show toast
      addToast({
        type: newEvt.severity === 'critical' ? 'critical' : newEvt.severity === 'high' ? 'high' : 'medium',
        title: `🔴 New ${newEvt.severity.toUpperCase()} Alert`,
        message: `${newEvt.event} — ${newEvt.agent}`,
      });
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = String(Date.now());
    setToasts(prev => [...prev.slice(-4), { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Filtered & sorted events
  const sevOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  const filteredEvents = events
    .filter(e => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || e.event.toLowerCase().includes(q) || e.username.toLowerCase().includes(q) || e.sourceIp.includes(q) || e.agent.toLowerCase().includes(q) || e.ruleId.toLowerCase().includes(q);
      const matchSev = filterSeverity === 'all' || e.severity === filterSeverity;
      const matchCat = filterCategory === 'all' || e.category === filterCategory;
      return matchSearch && matchSev && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'severity') {
        const diff = sevOrder[b.severity] - sevOrder[a.severity];
        return sortDir === 'desc' ? diff : -diff;
      }
      const diff = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      return sortDir === 'desc' ? diff : -diff;
    });

  const totalPages = Math.ceil(filteredEvents.length / PAGE_SIZE);
  const pagedEvents = filteredEvents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const kpis = getKPIs();
  kpis.totalEvents = events.length;
  kpis.totalAlerts = events.filter(e => e.status === 'new').length;

  const updateIncidentStatus = useCallback((id: string, status: IncidentStatus) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status, updatedAt: new Date().toISOString() } : inc));
    addToast({ type: 'info', title: 'Incident Updated', message: `${id} status changed to ${status}` });
  }, [addToast]);

  const updateIncidentStage = useCallback((id: string, stage: number) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, stage } : inc));
  }, []);

  return {
    activeNav, setActiveNav,
    events, pagedEvents, filteredEvents,
    incidents, updateIncidentStatus, updateIncidentStage,
    agents,
    toasts, addToast, removeToast,
    searchQuery, setSearchQuery,
    filterSeverity, setFilterSeverity,
    filterCategory, setFilterCategory,
    currentPage, setCurrentPage,
    totalPages, PAGE_SIZE,
    sortBy, setSortBy,
    sortDir, setSortDir,
    clock,
    isLoading,
    kpis,
    chartData,
  };
}
