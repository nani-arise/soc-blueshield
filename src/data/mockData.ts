// ============================================================
// BlueShield SOC Dashboard - Comprehensive Mock Data
// ============================================================

export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type EventStatus = 'new' | 'investigating' | 'resolved' | 'false_positive';
export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';
export type AgentStatus = 'online' | 'offline' | 'warning';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  ruleId: string;
  event: string;
  username: string;
  sourceIp: string;
  agent: string;
  severity: Severity;
  status: EventStatus;
  category: string;
  description: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  assignedTo: string;
  status: IncidentStatus;
  recommendedResponse: string;
  createdAt: string;
  updatedAt: string;
  stage: number;
}

export interface Agent {
  id: string;
  hostname: string;
  os: string;
  agentVersion: string;
  lastSeen: string;
  cpu: number;
  memory: number;
  status: AgentStatus;
  ip: string;
  department: string;
}

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  triggerCount: number;
  lastTriggered: string;
  enabled: boolean;
  category: string;
}

export interface ThreatCountry {
  country: string;
  code: string;
  attacks: number;
  percentage: number;
}

export interface MaliciousIP {
  ip: string;
  country: string;
  reputation: number;
  category: string;
  firstSeen: string;
}

export interface CVE {
  id: string;
  description: string;
  cvss: number;
  severity: Severity;
  published: string;
  affectedProduct: string;
}

export interface MalwareFamily {
  name: string;
  type: string;
  detections: number;
  lastSeen: string;
  severity: Severity;
}

// --- Helpers ---
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const choice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const usernames = [
  'john.doe', 'jane.smith', 'admin', 'root', 'svc_backup', 'svc_deploy',
  'alice.wong', 'bob.martin', 'carol.james', 'david.lee', 'eve.chen',
  'frank.miller', 'SYSTEM', 'administrator', 'guest', 'svc_sql', 'svc_app',
];

const agents = [
  'CORP-PC-001', 'CORP-PC-002', 'CORP-SRV-DB01', 'CORP-SRV-WEB01',
  'CORP-SRV-DC01', 'CORP-PC-003', 'CORP-PC-004', 'CORP-SRV-FILE01',
  'CORP-PC-005', 'CORP-LAPTOP-001', 'CORP-LAPTOP-002', 'CORP-SRV-MAIL01',
];

const ipPool = [
  '192.168.1.55', '10.0.0.23', '203.0.113.45', '198.51.100.12',
  '185.220.101.5', '45.33.32.156', '91.108.4.168', '172.16.0.88',
  '10.10.10.5', '192.0.2.33', '198.18.0.99', '1.1.1.1',
  '8.8.8.8', '66.94.29.130', '104.21.15.23', '185.156.73.12',
  '5.196.75.183', '195.154.244.153', '176.9.37.132', '178.62.101.30',
];

const eventTemplates: Array<{ event: string; ruleId: string; category: string; severity: Severity; description: string }> = [
  { event: 'Multiple Failed Login Attempts', ruleId: 'AUTH-001', category: 'Authentication', severity: 'high', description: 'More than 5 failed login attempts within 60 seconds detected from the same source IP.' },
  { event: 'Successful Login After Multiple Failures', ruleId: 'AUTH-002', category: 'Authentication', severity: 'medium', description: 'A user successfully authenticated after multiple prior failed attempts, indicating possible credential brute-force.' },
  { event: 'Malware Signature Detected', ruleId: 'MAL-001', category: 'Malware', severity: 'critical', description: 'A known malware signature was detected in a running process. Immediate isolation recommended.' },
  { event: 'Suspicious PowerShell Execution', ruleId: 'EXE-001', category: 'Endpoint', severity: 'high', description: 'PowerShell executed with encoded command or bypass flags, indicative of malicious scripting activity.' },
  { event: 'File Integrity Change Detected', ruleId: 'FIM-001', category: 'File Integrity', severity: 'medium', description: 'Modification to a monitored system file detected. Hash mismatch confirmed.' },
  { event: 'Privilege Escalation Attempt', ruleId: 'PRIV-001', category: 'Endpoint', severity: 'critical', description: 'A process attempted to escalate privileges via token impersonation or UAC bypass.' },
  { event: 'Network Port Scan Detected', ruleId: 'NET-001', category: 'Network', severity: 'medium', description: 'Systematic connection attempts across multiple ports detected from a single source IP.' },
  { event: 'New Local User Account Created', ruleId: 'SYS-001', category: 'System Events', severity: 'high', description: 'A new local user account was created outside of the provisioning workflow.' },
  { event: 'Firewall Rule Violated', ruleId: 'NET-002', category: 'Network', severity: 'low', description: 'Outbound connection attempt blocked by firewall policy to a restricted destination.' },
  { event: 'Successful Admin Login', ruleId: 'AUTH-003', category: 'Authentication', severity: 'low', description: 'An administrative account successfully logged in. Verify this is an authorized session.' },
  { event: 'Ransomware Behavior Detected', ruleId: 'MAL-002', category: 'Malware', severity: 'critical', description: 'Mass file encryption activity detected. Possible ransomware execution in progress.' },
  { event: 'Lateral Movement via SMB', ruleId: 'NET-003', category: 'Network', severity: 'critical', description: 'Authentication and file access attempts detected across multiple hosts via SMB protocol.' },
  { event: 'Data Exfiltration Attempt', ruleId: 'EXF-001', category: 'Network', severity: 'critical', description: 'Large volume of data being transferred to an external IP address outside business hours.' },
  { event: 'Credential Dump Attempt', ruleId: 'CRED-001', category: 'Endpoint', severity: 'critical', description: 'Process attempted to access LSASS memory, indicative of credential harvesting.' },
  { event: 'Suspicious Scheduled Task Created', ruleId: 'PERS-001', category: 'Endpoint', severity: 'high', description: 'A new scheduled task was created pointing to a non-standard or suspicious executable.' },
  { event: 'SSH Brute-Force Detected', ruleId: 'AUTH-004', category: 'Authentication', severity: 'high', description: 'SSH login brute-force attempt detected from an external IP address.' },
  { event: 'Log Clearing Event', ruleId: 'SYS-002', category: 'System Events', severity: 'high', description: 'Windows Security Event Log was cleared. This may indicate an attempt to cover tracks.' },
  { event: 'DNS Tunneling Suspected', ruleId: 'NET-004', category: 'Network', severity: 'high', description: 'Unusually large or frequent DNS requests detected, possible covert channel activity.' },
  { event: 'USB Device Inserted', ruleId: 'SYS-003', category: 'System Events', severity: 'low', description: 'An unauthorized USB storage device was connected to a monitored endpoint.' },
  { event: 'Process Injection Detected', ruleId: 'EXE-002', category: 'Endpoint', severity: 'critical', description: 'A process attempted to inject code into another process memory space.' },
];

const statuses: EventStatus[] = ['new', 'investigating', 'resolved', 'false_positive'];

function generateTimestamp(daysAgo: number, offsetHours = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - offsetHours);
  d.setMinutes(rand(0, 59));
  d.setSeconds(rand(0, 59));
  return d.toISOString();
}

// Generate 500 security events spread over 7 days
export const securityEvents: SecurityEvent[] = Array.from({ length: 500 }, (_, i) => {
  const template = choice(eventTemplates);
  const daysAgo = rand(0, 6);
  const hoursOffset = rand(0, 23);
  return {
    id: `EVT-${String(i + 1).padStart(5, '0')}`,
    timestamp: generateTimestamp(daysAgo, hoursOffset),
    ruleId: template.ruleId,
    event: template.event,
    username: choice(usernames),
    sourceIp: choice(ipPool),
    agent: choice(agents),
    severity: template.severity,
    status: choice(statuses),
    category: template.category,
    description: template.description,
  };
}).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

// Incidents
export const incidents: Incident[] = [
  {
    id: 'INC-0001',
    title: 'Ransomware Activity on CORP-PC-003',
    description: 'Mass file encryption behavior detected on workstation CORP-PC-003. User john.doe reported inability to access files. Logs confirm malicious process active.',
    severity: 'critical',
    assignedTo: 'Sarah Connor',
    status: 'investigating',
    recommendedResponse: 'Immediately isolate endpoint from network. Preserve memory dump. Engage incident response team. Notify management and begin recovery procedures.',
    createdAt: generateTimestamp(1, 3),
    updatedAt: generateTimestamp(0, 1),
    stage: 2,
  },
  {
    id: 'INC-0002',
    title: 'SSH Brute-Force from External IP',
    description: 'Over 300 SSH login attempts recorded from 185.220.101.5 targeting CORP-SRV-WEB01. Account lockouts triggered for multiple users.',
    severity: 'high',
    assignedTo: 'Marcus Rivera',
    status: 'contained',
    recommendedResponse: 'Block IP at perimeter firewall. Reset affected account credentials. Enable IP-based rate limiting on SSH service. Review all recent auth logs.',
    createdAt: generateTimestamp(2, 6),
    updatedAt: generateTimestamp(1, 2),
    stage: 3,
  },
  {
    id: 'INC-0003',
    title: 'Credential Dump via LSASS Access',
    description: 'Process mimikatz.exe detected accessing LSASS memory on CORP-SRV-DC01. Credential theft likely. Active Directory accounts potentially compromised.',
    severity: 'critical',
    assignedTo: 'Emily Zhang',
    status: 'open',
    recommendedResponse: 'Force reset all Active Directory credentials. Enable Protected Users group. Deploy Credential Guard. Conduct forensic analysis of DC01.',
    createdAt: generateTimestamp(0, 5),
    updatedAt: generateTimestamp(0, 0),
    stage: 1,
  },
  {
    id: 'INC-0004',
    title: 'Data Exfiltration to External Server',
    description: 'Approximately 4.2GB of data transferred to IP 5.196.75.183 (Romania) at 02:00 UTC. Source was svc_backup account on CORP-SRV-FILE01.',
    severity: 'critical',
    assignedTo: 'James Okonkwo',
    status: 'investigating',
    recommendedResponse: 'Block destination IP. Disable svc_backup account. Preserve network packet capture. Engage legal team for potential data breach notification.',
    createdAt: generateTimestamp(3, 8),
    updatedAt: generateTimestamp(2, 4),
    stage: 2,
  },
  {
    id: 'INC-0005',
    title: 'New Unauthorized Admin Account Created',
    description: 'Local administrator account "svc_hidden" created on CORP-SRV-DB01 without change ticket. Account used within 10 minutes of creation.',
    severity: 'high',
    assignedTo: 'Priya Nair',
    status: 'open',
    recommendedResponse: 'Disable and remove the account. Investigate who had access to create the account. Review all actions taken under that account.',
    createdAt: generateTimestamp(1, 7),
    updatedAt: generateTimestamp(0, 3),
    stage: 1,
  },
  {
    id: 'INC-0006',
    title: 'Suspicious Lateral Movement via SMB',
    description: 'CORP-PC-002 attempted authentication to 7 different internal hosts via SMB in 5 minutes. Pattern consistent with automated lateral movement.',
    severity: 'high',
    assignedTo: 'Tom Bradley',
    status: 'resolved',
    recommendedResponse: 'Isolate source machine. Review SMB access logs. Check for worm or automated lateral movement tools. Patch and restore clean image.',
    createdAt: generateTimestamp(4, 2),
    updatedAt: generateTimestamp(3, 1),
    stage: 6,
  },
];

// Active Agents
export const agentsList: Agent[] = [
  { id: 'AGT-001', hostname: 'CORP-PC-001', os: 'Windows 11 Pro', agentVersion: '4.8.2', lastSeen: generateTimestamp(0, 0), cpu: 23, memory: 45, status: 'online', ip: '192.168.1.10', department: 'Finance' },
  { id: 'AGT-002', hostname: 'CORP-PC-002', os: 'Windows 10 Pro', agentVersion: '4.8.2', lastSeen: generateTimestamp(0, 0), cpu: 78, memory: 82, status: 'warning', ip: '192.168.1.11', department: 'IT' },
  { id: 'AGT-003', hostname: 'CORP-SRV-DB01', os: 'Ubuntu 22.04 LTS', agentVersion: '4.8.1', lastSeen: generateTimestamp(0, 0), cpu: 55, memory: 71, status: 'online', ip: '10.0.0.10', department: 'Infrastructure' },
  { id: 'AGT-004', hostname: 'CORP-SRV-WEB01', os: 'CentOS 8 Stream', agentVersion: '4.8.2', lastSeen: generateTimestamp(0, 0), cpu: 34, memory: 58, status: 'online', ip: '10.0.0.11', department: 'Infrastructure' },
  { id: 'AGT-005', hostname: 'CORP-SRV-DC01', os: 'Windows Server 2022', agentVersion: '4.8.2', lastSeen: generateTimestamp(0, 1), cpu: 12, memory: 36, status: 'online', ip: '10.0.0.5', department: 'IT' },
  { id: 'AGT-006', hostname: 'CORP-PC-003', os: 'Windows 11 Pro', agentVersion: '4.8.0', lastSeen: generateTimestamp(1, 3), cpu: 0, memory: 0, status: 'offline', ip: '192.168.1.15', department: 'HR' },
  { id: 'AGT-007', hostname: 'CORP-PC-004', os: 'Windows 10 Pro', agentVersion: '4.8.2', lastSeen: generateTimestamp(0, 0), cpu: 45, memory: 62, status: 'online', ip: '192.168.1.20', department: 'Legal' },
  { id: 'AGT-008', hostname: 'CORP-SRV-FILE01', os: 'Windows Server 2019', agentVersion: '4.8.2', lastSeen: generateTimestamp(0, 0), cpu: 18, memory: 44, status: 'online', ip: '10.0.0.20', department: 'Infrastructure' },
  { id: 'AGT-009', hostname: 'CORP-PC-005', os: 'macOS Sonoma 14', agentVersion: '4.8.2', lastSeen: generateTimestamp(0, 0), cpu: 31, memory: 55, status: 'online', ip: '192.168.1.25', department: 'Marketing' },
  { id: 'AGT-010', hostname: 'CORP-LAPTOP-001', os: 'Windows 11 Pro', agentVersion: '4.7.9', lastSeen: generateTimestamp(0, 2), cpu: 89, memory: 91, status: 'warning', ip: '10.10.10.5', department: 'Sales' },
  { id: 'AGT-011', hostname: 'CORP-LAPTOP-002', os: 'Ubuntu 20.04 LTS', agentVersion: '4.8.2', lastSeen: generateTimestamp(0, 0), cpu: 27, memory: 38, status: 'online', ip: '10.10.10.6', department: 'DevOps' },
  { id: 'AGT-012', hostname: 'CORP-SRV-MAIL01', os: 'Windows Server 2019', agentVersion: '4.8.1', lastSeen: generateTimestamp(0, 0), cpu: 42, memory: 67, status: 'online', ip: '10.0.0.25', department: 'Infrastructure' },
];

// Detection Rules
export const detectionRules: DetectionRule[] = [
  { id: 'AUTH-001', name: 'Brute Force Login', description: 'Detects > 5 failed logins within 60 seconds from same IP', severity: 'high', triggerCount: 287, lastTriggered: generateTimestamp(0, 0), enabled: true, category: 'Authentication' },
  { id: 'MAL-001', name: 'Known Malware Signature', description: 'File hash matches known malware signature database', severity: 'critical', triggerCount: 12, lastTriggered: generateTimestamp(1, 2), enabled: true, category: 'Malware' },
  { id: 'EXE-001', name: 'Suspicious PowerShell', description: 'PowerShell with -EncodedCommand, -Bypass, or -NoProfile flags', severity: 'high', triggerCount: 94, lastTriggered: generateTimestamp(0, 1), enabled: true, category: 'Endpoint' },
  { id: 'FIM-001', name: 'File Integrity Violation', description: 'Hash mismatch on monitored system files', severity: 'medium', triggerCount: 56, lastTriggered: generateTimestamp(0, 3), enabled: true, category: 'File Integrity' },
  { id: 'PRIV-001', name: 'Privilege Escalation', description: 'Process attempts token impersonation or UAC bypass', severity: 'critical', triggerCount: 8, lastTriggered: generateTimestamp(0, 5), enabled: true, category: 'Endpoint' },
  { id: 'NET-001', name: 'Network Port Scan', description: 'Connections to > 20 ports in < 30 seconds from same source', severity: 'medium', triggerCount: 43, lastTriggered: generateTimestamp(0, 2), enabled: true, category: 'Network' },
  { id: 'EXF-001', name: 'Data Exfiltration', description: '> 500MB outbound transfer to external IP in 5 minutes', severity: 'critical', triggerCount: 3, lastTriggered: generateTimestamp(3, 8), enabled: true, category: 'Network' },
  { id: 'CRED-001', name: 'LSASS Access', description: 'Process accesses LSASS memory with suspicious permissions', severity: 'critical', triggerCount: 5, lastTriggered: generateTimestamp(0, 5), enabled: true, category: 'Endpoint' },
  { id: 'PERS-001', name: 'Suspicious Scheduled Task', description: 'Scheduled task pointing to non-system executable created', severity: 'high', triggerCount: 21, lastTriggered: generateTimestamp(1, 4), enabled: true, category: 'Endpoint' },
  { id: 'NET-002', name: 'Firewall Policy Violation', description: 'Outbound connection to blocked destination category', severity: 'low', triggerCount: 1042, lastTriggered: generateTimestamp(0, 0), enabled: true, category: 'Network' },
  { id: 'SYS-001', name: 'Unauthorized User Creation', description: 'New local user account created outside provisioning process', severity: 'high', triggerCount: 14, lastTriggered: generateTimestamp(1, 7), enabled: true, category: 'System Events' },
  { id: 'SYS-002', name: 'Security Log Cleared', description: 'Windows Security Event Log cleared', severity: 'high', triggerCount: 2, lastTriggered: generateTimestamp(2, 3), enabled: false, category: 'System Events' },
  { id: 'NET-003', name: 'Lateral Movement via SMB', description: 'Authentication attempts to > 5 hosts via SMB within 5 minutes', severity: 'critical', triggerCount: 7, lastTriggered: generateTimestamp(4, 2), enabled: true, category: 'Network' },
  { id: 'NET-004', name: 'DNS Tunneling', description: 'Anomalous DNS query volume or record length detected', severity: 'high', triggerCount: 16, lastTriggered: generateTimestamp(1, 9), enabled: true, category: 'Network' },
  { id: 'EXE-002', name: 'Process Injection', description: 'Process writes executable code into another process memory', severity: 'critical', triggerCount: 9, lastTriggered: generateTimestamp(0, 6), enabled: true, category: 'Endpoint' },
];

// Threat Intelligence
export const topAttackingCountries: ThreatCountry[] = [
  { country: 'China', code: 'CN', attacks: 3241, percentage: 28 },
  { country: 'Russia', code: 'RU', attacks: 2187, percentage: 19 },
  { country: 'North Korea', code: 'KP', attacks: 1456, percentage: 13 },
  { country: 'Iran', code: 'IR', attacks: 1102, percentage: 10 },
  { country: 'United States', code: 'US', attacks: 987, percentage: 9 },
  { country: 'Romania', code: 'RO', attacks: 754, percentage: 7 },
  { country: 'Brazil', code: 'BR', attacks: 543, percentage: 5 },
  { country: 'India', code: 'IN', attacks: 432, percentage: 4 },
  { country: 'Germany', code: 'DE', attacks: 321, percentage: 3 },
  { country: 'Netherlands', code: 'NL', attacks: 234, percentage: 2 },
];

export const maliciousIPs: MaliciousIP[] = [
  { ip: '185.220.101.5', country: 'Russia', reputation: 98, category: 'Tor Exit Node', firstSeen: '2024-03-12' },
  { ip: '45.33.32.156', country: 'United States', reputation: 91, category: 'Botnet C2', firstSeen: '2024-01-22' },
  { ip: '91.108.4.168', country: 'Netherlands', reputation: 87, category: 'Scanner', firstSeen: '2024-06-01' },
  { ip: '5.196.75.183', country: 'France', reputation: 95, category: 'Malware Host', firstSeen: '2023-11-15' },
  { ip: '66.94.29.130', country: 'Canada', reputation: 79, category: 'Phishing', firstSeen: '2024-07-10' },
  { ip: '195.154.244.153', country: 'France', reputation: 92, category: 'Botnet', firstSeen: '2024-02-28' },
  { ip: '176.9.37.132', country: 'Germany', reputation: 83, category: 'SSH Scanner', firstSeen: '2024-04-15' },
  { ip: '178.62.101.30', country: 'United Kingdom', reputation: 88, category: 'Exploit Kit', firstSeen: '2024-05-20' },
];

export const latestCVEs: CVE[] = [
  { id: 'CVE-2024-6387', description: 'OpenSSH RegreSSHion RCE vulnerability in glibc-based Linux systems', cvss: 8.1, severity: 'high', published: '2024-07-01', affectedProduct: 'OpenSSH < 9.8p1' },
  { id: 'CVE-2024-3400', description: 'Palo Alto Networks PAN-OS command injection in GlobalProtect', cvss: 10.0, severity: 'critical', published: '2024-04-12', affectedProduct: 'PAN-OS 10.2, 11.0, 11.1' },
  { id: 'CVE-2024-21412', description: 'Microsoft Windows SmartScreen Security Feature Bypass', cvss: 8.1, severity: 'high', published: '2024-02-13', affectedProduct: 'Windows 10/11, Server 2019/2022' },
  { id: 'CVE-2024-1709', description: 'ConnectWise ScreenConnect authentication bypass', cvss: 10.0, severity: 'critical', published: '2024-02-21', affectedProduct: 'ConnectWise ScreenConnect < 23.9.8' },
  { id: 'CVE-2024-26169', description: 'Windows Error Reporting Service Elevation of Privilege', cvss: 7.8, severity: 'high', published: '2024-03-12', affectedProduct: 'Windows 10/11, Server 2019/2022' },
  { id: 'CVE-2024-30051', description: 'Windows DWM Core Library Elevation of Privilege', cvss: 7.8, severity: 'high', published: '2024-05-14', affectedProduct: 'Windows 10/11, Server 2016+' },
];

export const malwareFamilies: MalwareFamily[] = [
  { name: 'LockBit 3.0', type: 'Ransomware', detections: 47, lastSeen: generateTimestamp(0, 2), severity: 'critical' },
  { name: 'Cobalt Strike', type: 'RAT/C2 Framework', detections: 23, lastSeen: generateTimestamp(1, 5), severity: 'critical' },
  { name: 'QakBot', type: 'Banking Trojan', detections: 18, lastSeen: generateTimestamp(0, 8), severity: 'high' },
  { name: 'RedLine Stealer', type: 'Info Stealer', detections: 31, lastSeen: generateTimestamp(0, 1), severity: 'high' },
  { name: 'Emotet', type: 'Dropper/Botnet', detections: 12, lastSeen: generateTimestamp(2, 3), severity: 'high' },
  { name: 'Mimikatz', type: 'Credential Harvester', detections: 8, lastSeen: generateTimestamp(0, 5), severity: 'critical' },
];

// Chart data helpers
export function getAlertsOverTime(): Array<{ hour: string; alerts: number; critical: number }> {
  return Array.from({ length: 24 }, (_, i) => {
    const h = 23 - i;
    return {
      hour: `${String(h).padStart(2, '0')}:00`,
      alerts: rand(10, 85),
      critical: rand(0, 12),
    };
  }).reverse();
}

export function getAlertsBySeverity() {
  return [
    { name: 'Critical', value: securityEvents.filter(e => e.severity === 'critical').length, color: '#EF4444' },
    { name: 'High', value: securityEvents.filter(e => e.severity === 'high').length, color: '#F97316' },
    { name: 'Medium', value: securityEvents.filter(e => e.severity === 'medium').length, color: '#EAB308' },
    { name: 'Low', value: securityEvents.filter(e => e.severity === 'low').length, color: '#22C55E' },
  ];
}

export function getAuthActivityByDay() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      successful: rand(120, 450),
      failed: rand(15, 120),
    };
  });
}

export function getTopSourceIPs() {
  const counts: Record<string, number> = {};
  securityEvents.forEach(e => { counts[e.sourceIp] = (counts[e.sourceIp] || 0) + 1; });
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([ip, count]) => ({ ip, count }));
}

export function getMitreData() {
  return [
    { technique: 'Initial Access', value: rand(60, 95) },
    { technique: 'Execution', value: rand(45, 85) },
    { technique: 'Persistence', value: rand(55, 90) },
    { technique: 'Priv Escalation', value: rand(40, 80) },
    { technique: 'Cred Access', value: rand(50, 85) },
    { technique: 'Discovery', value: rand(65, 95) },
    { technique: 'Lateral Movement', value: rand(35, 75) },
    { technique: 'Exfiltration', value: rand(25, 65) },
  ];
}

export function getAlertsByCategory() {
  const cats = ['Authentication', 'Malware', 'Network', 'Endpoint', 'File Integrity', 'System Events'];
  const colors = ['#3B82F6', '#EF4444', '#22C55E', '#F97316', '#EAB308', '#8B5CF6'];
  const counts: Record<string, number> = {};
  securityEvents.forEach(e => { counts[e.category] = (counts[e.category] || 0) + 1; });
  return cats.map((cat, i) => ({ name: cat, value: counts[cat] || 0, color: colors[i] }));
}

export function getKPIs() {
  const total = securityEvents.length;
  const critical = securityEvents.filter(e => e.severity === 'critical').length;
  const alerts = securityEvents.filter(e => e.status === 'new').length;
  const failedLogins = securityEvents.filter(e =>
    e.category === 'Authentication' &&
    e.event.toLowerCase().includes('fail') &&
    new Date(e.timestamp).toDateString() === new Date().toDateString()
  ).length;
  const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'investigating').length;

  return {
    totalEvents: total,
    totalAlerts: alerts,
    criticalAlerts: critical,
    activeAgents: agentsList.filter(a => a.status === 'online').length,
    failedLoginsToday: failedLogins || rand(38, 72),
    openIncidents,
  };
}
