// ============================================================
// useWazuhData — Real-time Wazuh SIEM data hook
// Replaces useSOCData's mock data with live Wazuh API calls.
// Auto-refreshes every 30 seconds.
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchAlerts, fetchAgents, fetchOverview, fetchRules,
  testWazuhConnection, buildChartsFromAlerts,
} from '../api/wazuhApi';
import type { SecurityEvent, Agent, Incident, IncidentStatus } from '../data/mockData';
import { incidents as mockIncidents } from '../data/mockData';

export type NavItem =
  | 'dashboard' | 'events' | 'incidents' | 'threat-intel'
  | 'auth' | 'agents' | 'reports' | 'settings';

export interface Toast {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'info' | 'success' | 'error';
  title: string;
  message: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'unconfigured';

const REFRESH_INTERVAL_MS = 30_000; // 30 seconds
const PAGE_SIZE = 20;

export function useWazuhData() {
  // ---- Navigation ----
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard');

  // ---- Connection ----
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [connectionError, setConnectionError] = useState<string>('');
  const [wazuhVersion, setWazuhVersion] = useState<string>('');

  // ---- Data ----
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);

  // ---- UI State ----
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity'>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const prevEventIds = useRef<Set<string>>(new Set());

  // ---- Check if Wazuh is configured ----
  const isConfigured = () => {
    const host = import.meta.env.VITE_WAZUH_HOST || '';
    return host && !host.includes('YOUR_WAZUH');
  };

  // ---- Toast helpers ----
  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = String(Date.now() + Math.random());
    setToasts(prev => [...prev.slice(-4), { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 6000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ---- Live clock ----
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ---- Core data fetch ----
  const fetchAll = useCallback(async (showRefreshToast = false) => {
    if (!isConfigured()) {
      setConnectionStatus('unconfigured');
      setIsLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);

      // 1. Test connection first
      const conn = await testWazuhConnection();
      if (!conn.ok) {
        setConnectionStatus('error');
        setConnectionError(conn.error || 'Cannot reach Wazuh API');
        addToast({ type: 'error', title: 'Wazuh Unreachable', message: conn.error || 'Check your Wazuh IP and credentials in .env.local' });
        return;
      }
      setConnectionStatus('connected');
      setWazuhVersion(conn.version || '');

      // 2. Fetch data in parallel
      const [alertsResult, agentsResult, overviewResult, rulesResult] = await Promise.allSettled([
        fetchAlerts(500),
        fetchAgents(),
        fetchOverview(),
        fetchRules(100),
      ]);

      // Process alerts
      if (alertsResult.status === 'fulfilled') {
        const { events: newEvents, total } = alertsResult.value;
        setTotalEvents(total);

        // Detect NEW events since last refresh and toast them
        if (prevEventIds.current.size > 0) {
          const newOnes = newEvents.filter(e => !prevEventIds.current.has(e.id));
          newOnes.slice(0, 3).forEach(e => {
            if (e.severity === 'critical' || e.severity === 'high') {
              addToast({
                type: e.severity,
                title: `🔴 New ${e.severity.toUpperCase()} Alert`,
                message: `${e.event} — ${e.agent}`,
              });
            }
          });
        }
        prevEventIds.current = new Set(newEvents.map(e => e.id));

        setEvents(newEvents);
        setChartData(buildChartsFromAlerts(newEvents));
      }

      // Process agents
      if (agentsResult.status === 'fulfilled') {
        setAgents(agentsResult.value);
      }

      // Process overview
      if (overviewResult.status === 'fulfilled') {
        setOverview(overviewResult.value);
      }

      // Process rules
      if (rulesResult.status === 'fulfilled') {
        setRules(rulesResult.value);
      }

      setLastRefresh(new Date());
      if (showRefreshToast) {
        addToast({ type: 'success', title: 'Data Refreshed', message: `Fetched ${totalEvents} alerts from Wazuh` });
      }

    } catch (err: any) {
      setConnectionStatus('error');
      const msg = err?.message || 'Unknown error';
      setConnectionError(msg);
      addToast({ type: 'error', title: 'Wazuh Error', message: msg });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [addToast, totalEvents]);

  // ---- Initial load ----
  useEffect(() => {
    fetchAll(false);
  }, []);

  // ---- Auto-refresh every 30 seconds ----
  useEffect(() => {
    if (connectionStatus === 'unconfigured') return;
    const t = setInterval(() => fetchAll(false), REFRESH_INTERVAL_MS);
    return () => clearInterval(t);
  }, [fetchAll, connectionStatus]);

  // ---- Incident management (local state — can be extended to a backend) ----
  const updateIncidentStatus = useCallback((id: string, status: IncidentStatus) => {
    setIncidents(prev => prev.map(inc =>
      inc.id === id ? { ...inc, status, updatedAt: new Date().toISOString() } : inc
    ));
    addToast({ type: 'info', title: 'Incident Updated', message: `${id} → ${status}` });
  }, [addToast]);

  const updateIncidentStage = useCallback((id: string, stage: number) => {
    setIncidents(prev => prev.map(inc =>
      inc.id === id ? { ...inc, stage } : inc
    ));
  }, []);

  // ---- Filtering and sorting ----
  const sevOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };

  const filteredEvents = events
    .filter(e => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        e.event.toLowerCase().includes(q) ||
        e.username.toLowerCase().includes(q) ||
        e.sourceIp.includes(q) ||
        e.agent.toLowerCase().includes(q) ||
        e.ruleId.toLowerCase().includes(q);
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

  // ---- KPIs from real data ----
  const kpis = {
    totalEvents: totalEvents || events.length,
    totalAlerts: events.filter(e => e.status === 'new').length,
    criticalAlerts: events.filter(e => e.severity === 'critical').length,
    activeAgents: agents.filter(a => a.status === 'online').length || overview?.active || 0,
    failedLoginsToday: events.filter(e =>
      e.category === 'Authentication' &&
      e.event.toLowerCase().includes('fail') &&
      new Date(e.timestamp).toDateString() === new Date().toDateString()
    ).length,
    openIncidents: incidents.filter(i => i.status === 'open' || i.status === 'investigating').length,
  };

  return {
    // Navigation
    activeNav, setActiveNav,

    // Data
    events, pagedEvents, filteredEvents,
    incidents, updateIncidentStatus, updateIncidentStage,
    agents,
    rules,
    overview,
    chartData,
    kpis,

    // Status
    connectionStatus,
    connectionError,
    wazuhVersion,
    isLoading,
    isRefreshing,
    lastRefresh,

    // Toast
    toasts, addToast, removeToast,

    // Filters / Sort / Pagination
    searchQuery, setSearchQuery,
    filterSeverity, setFilterSeverity,
    filterCategory, setFilterCategory,
    currentPage, setCurrentPage,
    totalPages, PAGE_SIZE,
    sortBy, setSortBy,
    sortDir, setSortDir,

    // Clock
    clock,

    // Manual refresh
    refresh: () => fetchAll(true),
  };
}
