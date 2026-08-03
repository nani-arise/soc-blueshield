import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Strip any trailing slash from the host
  const wazuhHost = (env.VITE_WAZUH_HOST || 'https://localhost').replace(/\/$/, '')
  const wazuhPort = env.VITE_WAZUH_PORT || '55000'
  const proxyTarget = `${wazuhHost}:${wazuhPort}`

  console.log(`[BlueShield] Wazuh proxy target: ${proxyTarget}`)

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        // All /wazuh-api/* requests get proxied to the Wazuh Manager REST API
        // This avoids CORS issues and handles self-signed TLS certificates
        '/wazuh-api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,        // Accept Wazuh self-signed certificates
          ws: false,
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error('[Wazuh Proxy Error]', err.message)
            })
            proxy.on('proxyReq', (_proxyReq, req) => {
              console.log('[Wazuh Proxy →]', req.method, req.url)
            })
          },
          rewrite: (path) => path.replace(/^\/wazuh-api/, ''),
        },
      },
    },
  }
})
