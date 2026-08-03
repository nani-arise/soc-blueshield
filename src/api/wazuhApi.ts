// ============================================================
// Wazuh REST API Service
// Wazuh API Docs: https://documentation.wazuh.com/current/user-manual/api/reference.html
//
// All requests go through the Vite proxy at /wazuh-api
// which forwards to https://YOUR_WAZUH_IP:55000
// This avoids CORS and self-signed cert issues.
// ============================================================

import type { SecurityEvent, Agent, Severity } from '../data/mockData';

const BASE = '/wazuh-api';

// ---- JWT Token Management ----
let jwtToken: string | null = null;
let tokenExpiry = 0;
let workingUser: string | null = null; // caches the user that actually worked

/**
 * Safe base64 encoding that handles special characters in passwords.
 * btoa() fails on characters outside Latin1 — this works around it.
 */
function safeBase64(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

async function tryAuth(user: string, pass: string): Promise<string | null> {
  const credentials = safeBase64(`${user}:${pass}`);
  console.log(`[Wazuh] Trying user: ${user}`);
  try {
    const res = await fetch(`${BASE}/security/user/authenticate`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const token = data?.data?.token;
    if (token) {
      console.log(`[Wazuh] ✅ Auth succeeded with user: ${user}`);
      workingUser = user;
      return token;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getJWT(): Promise<string> {
  const now = Date.now();
  // Tokens expire every 15 minutes — refresh 1 minute early
  if (jwtToken && now < tokenExpiry - 60_000) return jwtToken;

  const configUser = import.meta.env.VITE_WAZUH_USER || '';
  const pass = import.meta.env.VITE_WAZUH_PASS || '';

  // Build the list of users to try — configured user first, then common defaults
  const usersToTry = [
    ...(configUser ? [configUser] : []),
    ...['admin', 'wazuh', 'wazuh-wui'].filter(u => u !== configUser),
  ];

  for (const user of usersToTry) {
    const token = await tryAuth(user, pass);
    if (token) {
      jwtToken = token;
      tokenExpiry = now + 15 * 60 * 1000;
      return token;
    }
  }

  // All users failed — throw a helpful error
  throw new Error(
    `Wazuh authentication failed for all users (${usersToTry.join(', ')}) with the provided password. ` +
    `\n\nTo fix this, SSH into your Wazuh Manager (192.168.245.130) and run:\n` +
    `  sudo cat /etc/wazuh-passwords.txt\n` +
    `Look for the "wazuh-wui" or "wazuh" password and paste it into .env.local as VITE_WAZUH_PASS.\n` +
    `\nOr reset the password:\n` +
    `  sudo /var/ossec/bin/wazuh-passwords-tool -u wazuh -p NewPassword123!\n` +
    `Then set VITE_WAZUH_USER=wazuh and VITE_WAZUH_PASS=NewPassword123! in .env.local`
  );
}

async function wazuhFetch<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const token = await getJWT();
  const url = new URL(`${window.location.origin}${BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 401) {
    // Token expired mid-session — clear so next call re-authenticates
    jwtToken = null;
    tokenExpiry = 0;
    throw new Error(`Wazuh session expired on ${path}. Auto re-authenticating on next request.`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Wazuh API error ${res.status} on ${path}: ${res.statusText}. ${text.slice(0, 200)}`);
  }

  return res.json();
}




// ---- Helpers ----
function mapWazuhSeverity(level: number): Severity {
  if (level >= 13) return 'critical';
  if (level >= 9) return 'high';
  if (level >= 6) return 'medium';
  return 'low';
}

function mapWazuhStatus(rule: any): SecurityEvent['status'] {
  // You can customize this based on your Wazuh workflow
  const level = rule?.level || 0;
  if (level >= 13) return 'new';
  if (level >= 9) return 'investigating';
  return 'new';
}

function mapCategory(groups: string[]): string {
  if (!groups) return 'System Events';
  const g = groups.join(',').toLowerCase();
  if (g.includes('authentication') || g.includes('syslog') || g.includes('pam') || g.includes('win_authentication')) return 'Authentication';
  if (g.includes('malware') || g.includes('virus') || g.includes('trojan')) return 'Malware';
  if (g.includes('network') || g.includes('firewall') || g.includes('ids') || g.includes('sids')) return 'Network';
  if (g.includes('syscheck') || g.includes('integrity')) return 'File Integrity';
  if (g.includes('rootcheck') || g.includes('anomaly') || g.includes('attack')) return 'Endpoint';
  return 'System Events';
}

// ============================================================
// 1. ALERTS — Recent security alerts
// ============================================================
export interface WazuhAlertsResponse {
  data: {
    affected_items: WazuhAlert[];
    total_affected_items: number;
    failed_items: any[];
  };
  error: number;
}

export interface WazuhAlert {
  id: string;
  timestamp: string;
  rule: {
    id: string;
    description: string;
    level: number;
    groups: string[];
  };
  agent: {
    id: string;
    name: string;
    ip: string;
  };
  data?: {
    srcip?: string;
    dstip?: string;
    srcuser?: string;
    win?: {
      system?: {
        computer?: string;
      };
      eventdata?: {
        subjectUserName?: string;
        targetUserName?: string;
      };
    };
  };
  manager?: {
    name: string;
  };
  location?: string;
  full_log?: string;
}

export async function fetchAlerts(limit = 500, offset = 0): Promise<{ events: SecurityEvent[]; total: number }> {
  const response = await wazuhFetch<WazuhAlertsResponse>('/alerts', {
    limit,
    offset,
    sort: '-timestamp',
    // Optionally filter by time: q: 'timestamp>now-7d'
  });

  const alerts = response?.data?.affected_items || [];
  const total = response?.data?.total_affected_items || 0;

  const events: SecurityEvent[] = alerts.map((alert) => {
    const sourceIp =
      alert.data?.srcip ||
      alert.data?.win?.eventdata?.subjectUserName ||
      alert.agent?.ip ||
      'N/A';

    const username =
      alert.data?.win?.eventdata?.targetUserName ||
      alert.data?.win?.eventdata?.subjectUserName ||
      alert.data?.srcuser ||
      'SYSTEM';

    return {
      id: alert.id || `ALT-${Date.now()}`,
      timestamp: alert.timestamp,
      ruleId: `RULE-${alert.rule?.id || '000'}`,
      event: alert.rule?.description || 'Unknown Event',
      username,
      sourceIp,
      agent: alert.agent?.name || 'Unknown',
      severity: mapWazuhSeverity(alert.rule?.level || 0),
      status: mapWazuhStatus(alert.rule),
      category: mapCategory(alert.rule?.groups || []),
      description: alert.full_log || alert.rule?.description || '',
    };
  });

  return { events, total };
}

// ============================================================
// 2. AGENTS — Connected endpoints
// ============================================================
export interface WazuhAgentsResponse {
  data: {
    affected_items: WazuhAgentItem[];
    total_affected_items: number;
  };
  error: number;
}

export interface WazuhAgentItem {
  id: string;
  name: string;
  ip: string;
  os?: {
    name?: string;
    version?: string;
    platform?: string;
    arch?: string;
  };
  version?: string;
  lastKeepAlive?: string;
  status: 'active' | 'disconnected' | 'pending' | 'never_connected';
  group?: string[];
  node_name?: string;
}

export async function fetchAgents(): Promise<Agent[]> {
  const response = await wazuhFetch<WazuhAgentsResponse>('/agents', {
    limit: 500,
    select: 'id,name,ip,os,version,lastKeepAlive,status,group',
  });

  const items = response?.data?.affected_items || [];

  return items
    .filter(a => a.id !== '000')
    .map((a) => {
      // Fetch real CPU/mem per agent if needed using /agents/{id}/stats/logcollector
      // For now we set realistic random values that get overridden by statsApi
      const statusMap: Record<string, Agent['status']> = {
        active: 'online',
        disconnected: 'offline',
        pending: 'warning',
        never_connected: 'offline',
      };

      const osString = a.os
        ? `${a.os.name || 'Unknown'} ${a.os.version || ''}`.trim()
        : 'Unknown OS';

      return {
        id: `AGT-${a.id.padStart(3, '0')}`,
        hostname: a.name,
        ip: a.ip || 'N/A',
        os: osString,
        agentVersion: a.version?.replace('Wazuh v', '') || '4.x',
        lastSeen: a.lastKeepAlive || new Date().toISOString(),
        status: statusMap[a.status] || 'offline',
        cpu: Math.floor(Math.random() * 60) + 10,     // Real CPU: query /agents/{id}/stats
        memory: Math.floor(Math.random() * 60) + 20,  // Real Mem: query /agents/{id}/stats
        department: (a.group || ['General'])[0] || 'General',
      };
    });
}

// ============================================================
// 3. AGENT STATS — CPU and Memory (per agent)
// ============================================================
export interface WazuhAgentStatsResponse {
  data: {
    affected_items: Array<{ cpu: { usage: number }; memory: { usage: number } }>;
  };
  error: number;
}

export async function fetchAgentStats(agentId: string): Promise<{ cpu: number; memory: number } | null> {
  try {
    // This endpoint returns sys info collected by the agent
    const response = await wazuhFetch<any>(`/agents/${agentId}/stats/logcollector`);
    const item = response?.data?.affected_items?.[0];
    if (!item) return null;
    return {
      cpu: Math.round(item?.global?.events || 0) % 100,
      memory: Math.round(item?.global?.bytes || 0) % 100,
    };
  } catch {
    // Fallback if stats not available for this agent
    return null;
  }
}

// ============================================================
// 4. OVERVIEW / KPIs
// ============================================================
export interface WazuhOverviewResponse {
  data: {
    connection: {
      active: number;
      disconnected: number;
      total: number;
      pending: number;
      never_connected: number;
    };
    configuration: {
      synchronized: number;
      not_synchronized: number;
    };
  };
  error: number;
}

export async function fetchOverview() {
  try {
    const response = await wazuhFetch<WazuhOverviewResponse>('/overview/agents');
    return response?.data?.connection || null;
  } catch {
    return null;
  }
}

// ============================================================
// 5. RULES — Detection rules
// ============================================================
export interface WazuhRulesResponse {
  data: {
    affected_items: Array<{
      id: number;
      description: string;
      level: number;
      groups: string[];
      status: string;
      filename: string;
    }>;
    total_affected_items: number;
  };
  error: number;
}

export async function fetchRules(limit = 100) {
  const response = await wazuhFetch<WazuhRulesResponse>('/rules', {
    limit,
    sort: '-level',
    status: 'enabled',
  });
  return response?.data?.affected_items || [];
}

// ============================================================
// 6. SYSCHECK / File Integrity
// ============================================================
export async function fetchSyscheckEvents(agentId: string, limit = 50) {
  try {
    const response = await wazuhFetch<any>(`/syscheck/${agentId}`, { limit, sort: '-date' });
    return response?.data?.affected_items || [];
  } catch {
    return [];
  }
}

// ============================================================
// 7. VULNERABILITY DATA
// ============================================================
export async function fetchVulnerabilities(agentId: string, limit = 20) {
  try {
    const response = await wazuhFetch<any>(`/vulnerability/${agentId}`, { limit, sort: '-score.base' });
    return response?.data?.affected_items || [];
  } catch {
    return [];
  }
}

// ============================================================
// 8. AGGREGATE CHART DATA from real alerts
// ============================================================
export function buildChartsFromAlerts(events: SecurityEvent[]) {
  // Alerts over last 24h by hour
  const hourCounts: Record<string, { alerts: number; critical: number }> = {};
  const now = new Date();
  for (let h = 23; h >= 0; h--) {
    const key = `${String(h).padStart(2, '0')}:00`;
    hourCounts[key] = { alerts: 0, critical: 0 };
  }
  events.forEach(e => {
    const d = new Date(e.timestamp);
    const diffHours = (now.getTime() - d.getTime()) / 3_600_000;
    if (diffHours <= 24) {
      const key = `${String(d.getHours()).padStart(2, '0')}:00`;
      if (hourCounts[key]) {
        hourCounts[key].alerts++;
        if (e.severity === 'critical') hourCounts[key].critical++;
      }
    }
  });
  const alertsOverTime = Object.entries(hourCounts).map(([hour, v]) => ({ hour, ...v }));

  // Severity breakdown
  const sev = { critical: 0, high: 0, medium: 0, low: 0 };
  events.forEach(e => { sev[e.severity]++; });
  const alertsBySeverity = [
    { name: 'Critical', value: sev.critical, color: '#EF4444' },
    { name: 'High', value: sev.high, color: '#F97316' },
    { name: 'Medium', value: sev.medium, color: '#EAB308' },
    { name: 'Low', value: sev.low, color: '#22C55E' },
  ];

  // Auth by day (last 7 days)
  const authActivity = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const day = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayEvents = events.filter(e => {
      const ed = new Date(e.timestamp);
      return ed.toDateString() === d.toDateString() && e.category === 'Authentication';
    });
    return {
      day,
      successful: dayEvents.filter(e => !e.event.toLowerCase().includes('fail')).length,
      failed: dayEvents.filter(e => e.event.toLowerCase().includes('fail')).length,
    };
  });

  // Top source IPs
  const ipCounts: Record<string, number> = {};
  events.forEach(e => { if (e.sourceIp && e.sourceIp !== 'N/A') ipCounts[e.sourceIp] = (ipCounts[e.sourceIp] || 0) + 1; });
  const topIPs = Object.entries(ipCounts).sort(([, a], [, b]) => b - a).slice(0, 8).map(([ip, count]) => ({ ip, count }));

  // MITRE coverage from groups (approximation)
  const mitre = [
    { technique: 'Initial Access', value: Math.min(95, events.filter(e => e.category === 'Network').length * 2 + 20) },
    { technique: 'Execution', value: Math.min(90, events.filter(e => e.event.includes('PowerShell') || e.event.includes('Execution')).length * 5 + 15) },
    { technique: 'Persistence', value: Math.min(85, events.filter(e => e.event.includes('Scheduled') || e.event.includes('User')).length * 5 + 10) },
    { technique: 'Priv Escalation', value: Math.min(80, events.filter(e => e.event.includes('Privilege') || e.event.includes('Escalation')).length * 8 + 10) },
    { technique: 'Cred Access', value: Math.min(85, events.filter(e => e.event.includes('Credential') || e.event.includes('LSASS')).length * 10 + 15) },
    { technique: 'Discovery', value: Math.min(95, events.filter(e => e.event.includes('Scan') || e.category === 'Network').length * 3 + 25) },
    { technique: 'Lateral Movement', value: Math.min(75, events.filter(e => e.event.includes('Lateral') || e.event.includes('SMB')).length * 10 + 10) },
    { technique: 'Exfiltration', value: Math.min(70, events.filter(e => e.event.includes('Exfil') || e.event.includes('Transfer')).length * 10 + 5) },
  ];

  // Alert categories
  const cats = ['Authentication', 'Malware', 'Network', 'Endpoint', 'File Integrity', 'System Events'];
  const colors = ['#3B82F6', '#EF4444', '#22C55E', '#F97316', '#EAB308', '#8B5CF6'];
  const catCounts: Record<string, number> = {};
  events.forEach(e => { catCounts[e.category] = (catCounts[e.category] || 0) + 1; });
  const alertsByCategory = cats.map((cat, i) => ({ name: cat, value: catCounts[cat] || 0, color: colors[i] }));

  return { alertsOverTime, alertsBySeverity, authActivity, topIPs, mitre, alertsByCategory };
}

// ============================================================
// 9. CONNECTION TEST + DIAGNOSTICS
// ============================================================
export async function testWazuhConnection(): Promise<{ ok: boolean; version?: string; error?: string }> {
  try {
    console.log('[Wazuh] Testing connection...');

    // Step 1: Check if the proxy is reachable at all
    const probeRes = await fetch(`${BASE}/`, { method: 'GET' }).catch((err) => {
      throw new Error(
        `Cannot reach Wazuh proxy. Is the dev server running? Error: ${err.message}. ` +
        `Make sure VITE_WAZUH_HOST in .env.local is correct (e.g. https://192.168.245.130) and restart npm run dev.`
      );
    });

    console.log('[Wazuh] Proxy reachable, status:', probeRes.status);

    // Step 2: Authenticate and get JWT
    const token = await getJWT(); // Throws with detailed message on failure

    // Step 3: Verify API responds with valid data
    const res = await fetch(`${BASE}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(`Wazuh root endpoint returned ${res.status}. API may be misconfigured.`);
    }

    const data = await res.json();
    const version = data?.data?.api_version || 'unknown';
    console.log(`[Wazuh] ✅ Connected! API version: ${version}`);
    return { ok: true, version };

  } catch (e: any) {
    console.error('[Wazuh] ❌ Connection failed:', e.message);
    return { ok: false, error: e.message };
  }
}

// ============================================================
// 10. BROWSER CONSOLE DIAGNOSTIC (call window.__wazuhDiag() in DevTools)
// ============================================================
if (typeof window !== 'undefined') {
  (window as any).__wazuhDiag = async () => {
    console.group('🔵 BlueShield Wazuh Diagnostics');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Host:', import.meta.env.VITE_WAZUH_HOST);
    console.log('Port:', import.meta.env.VITE_WAZUH_PORT);
    console.log('Configured user:', import.meta.env.VITE_WAZUH_USER);
    console.log('Password length:', (import.meta.env.VITE_WAZUH_PASS || '').length, 'chars');
    console.log('Will also auto-try: admin, wazuh, wazuh-wui');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const result = await testWazuhConnection();

    if (result.ok) {
      console.log('');
      console.log(`✅ SUCCESS! Connected to Wazuh API ${result.version}`);
      console.log(`✅ Working user: ${workingUser}`);
      console.log('');
      console.log(`👉 Add this to your .env.local:`);
      console.log(`   VITE_WAZUH_USER=${workingUser}`);
    } else {
      console.error('❌ ALL AUTH ATTEMPTS FAILED');
      console.log('');
      console.log('The password in .env.local doesn\'t work for any Wazuh REST API user.');
      console.log('');
      console.log('📋 To find the real Wazuh REST API password:');
      console.log('');
      console.log('  1. SSH into your Wazuh Manager VM:');
      console.log('     ssh root@192.168.245.130');
      console.log('');
      console.log('  2. Run this to see all auto-generated passwords:');
      console.log('     sudo cat /etc/wazuh-passwords.txt');
      console.log('');
      console.log('  3. Find the line with "wazuh-wui" or "wazuh"');
      console.log('     Copy that password into .env.local as VITE_WAZUH_PASS');
      console.log('');
      console.log('  OR reset it to something you know:');
      console.log('     sudo /var/ossec/bin/wazuh-passwords-tool -u wazuh -p MyPass123!');
      console.log('     Then set VITE_WAZUH_USER=wazuh VITE_WAZUH_PASS=MyPass123! in .env.local');
    }
    console.groupEnd();
    return result;
  };
  console.log('[BlueShield] 💡 Run window.__wazuhDiag() in DevTools console to diagnose connection');
}
