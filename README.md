# 🛡️ BlueShield SOC Dashboard

### Security Operations Center Dashboard for Blue Team Monitoring

A modern, interactive Security Operations Center (SOC) dashboard designed to visualize security events, monitor endpoints, support incident response workflows, and provide threat intelligence insights.

Built with React and TypeScript, BlueShield supports simulated security data for demonstration and a Wazuh SIEM integration for live security monitoring.

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Wazuh](https://img.shields.io/badge/Wazuh-SIEM_Integration-00BCD4?style=flat-square&logo=linux&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)

</div>

---

Designed to demonstrate security monitoring, alert visualization, endpoint awareness, threat investigation, and incident handling in a unified dashboard.
---

## 📸 Dashboard Preview

| Dashboard Overview | Security Events |
|---|---|
| Real-time KPI cards, 6 interactive charts, attack timeline | Full events table with search, filter, sort, pagination |

| Incident Response | Threat Intelligence |
|---|---|
| 7-stage lifecycle workflow + active incident cards | Global threat map, CVEs, malware families, IOCs |

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph CLIENT["🖥️ BlueShield Frontend (React + Vite)"]
        UI["Dashboard UI\n(8 Pages)"]
        HOOK["useSOCData Hook\n(State Management)"]
        CHARTS["Recharts\n(6 Chart Types)"]
        EXPORT["Export Engine\njsPDF / html2canvas"]
        UI --> HOOK
        HOOK --> CHARTS
        HOOK --> EXPORT
    end

    subgraph DATA["📊 Data Layer"]
        MOCK["Mock Data Engine\n(500+ Events)"]
        WAZUH_API["Wazuh REST API\nService Layer"]
        PROXY["Vite Dev Proxy\n/wazuh-api/*"]
    end

    subgraph SIEM["🔒 Wazuh SIEM Stack (Production)"]
        MANAGER["Wazuh Manager\nPort 55000"]
        INDEXER["Wazuh Indexer\n(OpenSearch)"]
        AGENTS["Wazuh Agents\n(Windows / Linux)"]
        AGENTS -->|"Beats Port 1514"| MANAGER
        MANAGER --> INDEXER
    end

    HOOK -->|"Development"| MOCK
    HOOK -->|"Production"| WAZUH_API
    WAZUH_API --> PROXY
    PROXY -->|"HTTPS + JWT Auth"| MANAGER

    style CLIENT fill:#0f172a,stroke:#3B82F6,color:#e2e8f0
    style DATA fill:#0f172a,stroke:#22C55E,color:#e2e8f0
    style SIEM fill:#0f172a,stroke:#EF4444,color:#e2e8f0
```

---

## 🔄 Real-Time Data Flow

```mermaid
sequenceDiagram
    participant A as 🪟 Windows Agent
    participant M as 🖧 Wazuh Manager
    participant API as 🔌 Wazuh REST API
    participant P as 🔀 Vite Proxy
    participant D as 🖥️ BlueShield Dashboard

    Note over A,D: Agent Registration & Event Streaming

    A->>M: Register agent (port 1514)
    M-->>A: Agent ID confirmed ✅

    loop Every 30 seconds (auto-refresh)
        D->>P: GET /wazuh-api/security/user/authenticate
        P->>API: POST /security/user/authenticate (Basic Auth)
        API-->>P: JWT Token (15 min expiry)
        P-->>D: JWT Token ✅

        D->>P: GET /wazuh-api/alerts?limit=500
        P->>API: Forwarded + Bearer Token
        API->>M: Query alert database
        M-->>API: Raw alert JSON
        API-->>P: Alert data
        P-->>D: Processed events

        D->>D: Update KPI cards, charts, timeline
        D->>D: 🔔 Toast new Critical/High alerts
    end

    Note over A,M: Live threat detection
    A->>M: Failed login detected (rule 60122)
    M->>M: Rule match → Alert generated
    M-->>API: Alert indexed
    D->>D: Next refresh picks up new alert
```

---

## 🚨 Incident Response Workflow

```mermaid
flowchart LR
    A([🔍 Detection]) -->|IOC Identified| B([🚨 Alert])
    B -->|Triaged| C([🔬 Investigation])
    C -->|RCA Complete| D([🛡️ Containment])
    D -->|Spread Stopped| E([🗑️ Eradication])
    E -->|Artifacts Removed| F([🔄 Recovery])
    F -->|Systems Restored| G([📋 Closure])

    A:::done
    B:::done
    C:::active
    D:::pending
    E:::pending
    F:::pending
    G:::pending

    classDef done fill:#22C55E,stroke:#16a34a,color:#fff
    classDef active fill:#3B82F6,stroke:#1d4ed8,color:#fff,stroke-width:3px
    classDef pending fill:#1e3a5f,stroke:#334155,color:#94a3b8
```

---

## 🔐 Authentication & Authorization Flow

```mermaid
flowchart TD
    START([User Opens Dashboard]) --> CHECK{Wazuh\nConfigured?}

    CHECK -->|No .env.local| MOCK[📊 Load Mock Data\n500 Simulated Events]
    CHECK -->|Yes| AUTH[🔑 JWT Authentication\nPOST /security/user/authenticate]

    AUTH --> TOKEN{Token\nReceived?}
    TOKEN -->|❌ 401| RETRY[Try next user\nadmin → wazuh → wazuh-wui]
    RETRY --> TOKEN

    TOKEN -->|✅ Success| FETCH[📥 Fetch Live Data]
    FETCH --> PARALLEL[["⚡ Parallel Requests"]]
    PARALLEL --> ALERTS[GET /alerts\nlimit=500]
    PARALLEL --> AGENTS[GET /agents]
    PARALLEL --> RULES[GET /rules]
    PARALLEL --> OVERVIEW[GET /overview/agents]

    ALERTS --> PROCESS[🔄 Process & Normalize Data]
    AGENTS --> PROCESS
    RULES --> PROCESS
    OVERVIEW --> PROCESS

    PROCESS --> UI[🖥️ Update Dashboard UI]
    MOCK --> UI

    UI --> TIMER[⏱️ Wait 30 seconds]
    TIMER --> REFRESH[🔄 Auto-Refresh]
    REFRESH --> DIFF{New events\nsince last fetch?}
    DIFF -->|Yes| TOAST[🔔 Toast Notification\nCritical / High alerts]
    DIFF -->|No| UI2[🖥️ Silent Update]
    TOAST --> UI
    UI2 --> UI

    style MOCK fill:#1e3a5f,stroke:#3B82F6,color:#e2e8f0
    style AUTH fill:#0f172a,stroke:#22C55E,color:#e2e8f0
    style PROCESS fill:#0f172a,stroke:#EAB308,color:#e2e8f0
    style UI fill:#0f172a,stroke:#3B82F6,color:#e2e8f0
```

---

## 🗂️ Project Structure

```
soc-blueshield/
│
├── 📁 src/
│   ├── 📁 api/
│   │   └── wazuhApi.ts          # Wazuh REST API client + JWT auth
│   │
│   ├── 📁 components/           # All UI components
│   │   ├── Sidebar.tsx           # Navigation + system status
│   │   ├── Topbar.tsx            # Clock, search, notifications
│   │   ├── KPICards.tsx          # 6 animated KPI cards
│   │   ├── ChartsSection.tsx     # 6 interactive Recharts
│   │   ├── EventsTable.tsx       # Events grid (search/filter/sort)
│   │   ├── IncidentResponse.tsx  # Incident management cards
│   │   ├── IncidentWorkflow.tsx  # 7-stage lifecycle visualizer
│   │   ├── ThreatIntel.tsx       # IOCs, CVEs, malware families
│   │   ├── ActiveAgents.tsx      # Endpoint health monitoring
│   │   ├── AttackTimeline.tsx    # Chronological event timeline
│   │   ├── DetectionRules.tsx    # Rule management with toggles
│   │   ├── AuthMonitoring.tsx    # Auth activity & failed logins
│   │   ├── ExportFeatures.tsx    # CSV / PDF / PNG export
│   │   ├── SettingsPage.tsx      # Dashboard configuration
│   │   └── ToastContainer.tsx    # Animated alert notifications
│   │
│   ├── 📁 data/
│   │   └── mockData.ts           # 500+ realistic security events
│   │
│   ├── 📁 hooks/
│   │   ├── useSOCData.ts         # Mock data state + auto-refresh
│   │   └── useWazuhData.ts       # Live Wazuh API state
│   │
│   └── 📁 utils/
│       └── exportUtils.ts        # jsPDF + html2canvas exports
│
├── .env.local                    # Wazuh credentials (not committed)
├── vite.config.ts                # Vite + Wazuh proxy config
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | React 19 + TypeScript | Component UI |
| **Build Tool** | Vite 8 | Fast dev server + HMR |
| **Styling** | Tailwind CSS v4 + Custom CSS | Dark SOC theme |
| **Charts** | Recharts | Line, Bar, Donut, Radar, Pie |
| **Animations** | Framer Motion | Page transitions, micro-animations |
| **Icons** | Lucide React | 50+ security icons |
| **PDF Export** | jsPDF | Incident report generation |
| **PNG Export** | html2canvas | Dashboard snapshot |
| **SIEM** | Wazuh REST API | Live security events (production) |

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/nani-arise/soc-blueshield.git
cd soc-blueshield
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

Open your browser and navigate to:

```text
http://localhost:5173
```

The dashboard starts in **Mock Data Mode**, allowing you to explore the interface without configuring a Wazuh server.

### 4. Connect to Wazuh (Optional)

To enable live security monitoring, configure your Wazuh connection using the environment variables supported by the project.

```env
VITE_WAZUH_HOST=https://YOUR_WAZUH_MANAGER_IP
VITE_WAZUH_PORT=55000
VITE_WAZUH_USER=your_username
VITE_WAZUH_PASS=your_password
```

> **Security:** Never commit real credentials or environment files containing secrets to GitHub.

## 📊 Dashboard Modules

| Module | Description | Capabilities |
|---|---|---|
| **Dashboard Overview** | Centralized security overview | KPI cards, charts, attack timeline |
| **Security Events** | Security event investigation | Search, filtering, sorting, pagination |
| **Incident Response** | Incident tracking and investigation | Incident status management, 7-stage workflow |
| **Threat Intelligence** | Threat data visualization | IOCs, IP intelligence, CVEs, malware insights |
| **Authentication Monitoring** | Login activity analysis | Failed logins, authentication activity |
| **Endpoint Monitoring** | Wazuh agent visibility | Agent status, OS information, resource monitoring |
| **Reports & Export** | Security data reporting | CSV, PDF, PNG exports |
| **Settings** | Dashboard configuration | Notification and display preferences |



## 🔗 Wazuh Integration Map

```mermaid
graph LR
    subgraph WINDOWS["🪟 Windows Endpoint"]
        WA["Wazuh Agent\n(Installed)"]
    end

    subgraph WAZUH["🖧 Wazuh Manager (Linux VM)"]
        MGR["wazuh-manager\nservice"]
        IDX["wazuh-indexer\n(OpenSearch)"]
        DASH["wazuh-dashboard\n(Port 443)"]
        API["wazuh-api\n(Port 55000)"]
        MGR --> IDX
        IDX --> DASH
        MGR --> API
    end

    subgraph BLUESHIELD["🛡️ BlueShield Dashboard"]
        BS["React App\nlocalhost:5173"]
        PROXY["Vite Proxy\n/wazuh-api/*"]
        BS --> PROXY
    end

    WA -->|"Syslog / Events\nPort 1514"| MGR
    PROXY -->|"JWT Auth\nREST API"| API

    style WINDOWS fill:#1e3a5f,stroke:#3B82F6,color:#e2e8f0
    style WAZUH fill:#0f172a,stroke:#22C55E,color:#e2e8f0
    style BLUESHIELD fill:#0f172a,stroke:#EAB308,color:#e2e8f0
```

---

## 📈 Data Pipeline

```mermaid
flowchart LR
    RAW["📡 Raw Wazuh Alert\nJSON from API"]
    --> PARSE["🔄 Parse & Normalize\nwazuhApi.ts"]
    --> MAP["🗺️ Map to SecurityEvent\ntimestamp, severity, category"]
    --> FILTER["🔍 Apply Filters\nseverity, category, search"]
    --> SORT["↕️ Sort\ntimestamp / severity"]
    --> PAGE["📄 Paginate\n20 per page"]
    --> RENDER["🖥️ Render Table\nEventTable.tsx"]

    RAW2["📡 Raw Alert Array"]
    --> AGG["📊 Aggregate\nbuildChartsFromAlerts()"]
    --> CHART["📈 Render Charts\nChartsSection.tsx"]
```

---

## 🔒 Security & Credential Management

BlueShield uses environment variables to configure its Wazuh integration.

### Security Guidelines

- Never commit `.env.local` or files containing credentials to GitHub.
- Store API usernames and passwords securely.
- Use dedicated credentials for integrations whenever possible.
- Avoid exposing Wazuh API access to untrusted networks.
- Restrict access to your Wazuh Manager according to your environment's security requirements.

### Configuration

The `.env.local` file is intended for local configuration and should remain excluded from version control.

> This project is intended for educational purposes and security monitoring demonstrations. Always configure integrations securely before connecting to a real infrastructure.

## ✨ Key Features

### 📊 Security Monitoring & Dashboard
- Security overview with 6 KPI cards
- Interactive charts for security event visualization
- Attack activity timeline
- Automated dashboard refresh every 30 seconds

### 🚨 Security Event Management
- Centralized view of security events
- Search, filtering, sorting, and pagination
- Monitoring of 500+ simulated events
- Severity-based event visualization

### 🔍 Incident Response
- Interactive 7-stage incident response workflow
- Incident investigation and status tracking
- Visual incident lifecycle management

### 🌍 Threat Intelligence
- Threat indicators and malicious IP visualization
- CVE information and malware family insights
- Geographic threat visualization

### 🖥️ Endpoint Monitoring
- Wazuh agent health and connection status
- Endpoint OS information
- CPU, memory, and last-seen monitoring

### 🔐 Authentication Monitoring
- Login activity visualization
- Failed authentication tracking
- Authentication event analysis

### 📥 Reporting & Export
- Export security events to CSV
- Generate incident reports in PDF
- Export dashboard snapshots in PNG

### 🔔 Notifications & UI
- Severity-based alert notifications
- Animated page transitions
- Responsive dark-themed interface

### 🔗 SIEM Integration
- Wazuh REST API integration
- JWT-based API authentication
- Simulated data mode for demonstrations
- Live monitoring mode when Wazuh is configured


## 👨‍💻 Author

**Y S Nandish**  
Cybersecurity Engineering Student | Blue Team & Security Monitoring

Interested in SIEM, SOC operations, threat detection, incident response, Linux, and cybersecurity research.

- GitHub: [@nani-arise](https://github.com/nani-arise)

---

<div align="center">

*Built with ❤️ for cybersecurity learning and defensive security.*

</div>
