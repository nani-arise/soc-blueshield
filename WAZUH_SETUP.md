# BlueShield SOC — Wazuh Real-Time Integration

## Setup

Copy this file to `.env.local` and fill in your Wazuh details:

```
VITE_WAZUH_HOST=https://YOUR_WAZUH_MANAGER_IP
VITE_WAZUH_PORT=55000
VITE_WAZUH_USER=wazuh
VITE_WAZUH_PASS=YOUR_WAZUH_API_PASSWORD
```

Find your Wazuh API password:
- Open Wazuh Dashboard → Settings → API → check the configured credentials
- Or check /etc/filebeat/wazuh-template.json on the Wazuh Manager
- Default user is usually "wazuh" or "wazuh-wui"

The Wazuh API runs on port 55000 by default.
