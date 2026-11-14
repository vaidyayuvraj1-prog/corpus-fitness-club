import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_FILE = path.resolve(__dirname, 'data/cfc_database.json')

function sharedDbPlugin(): Plugin {
  const handleApi = (req: any, res: any, next: any) => {
    if (!req.url?.startsWith('/api/db')) {
      return next()
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.statusCode = 200
      res.end()
      return
    }

    if (req.method === 'GET') {
      try {
        if (fs.existsSync(DB_FILE)) {
          const content = fs.readFileSync(DB_FILE, 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(content || '{}')
        } else {
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end('{}')
        }
      } catch (err: any) {
        res.statusCode = 500
        res.end(JSON.stringify({ error: err.message }))
      }
      return
    }

    if (req.method === 'POST') {
      let body = ''
      req.on('data', (chunk: any) => {
        body += chunk
      })
      req.on('end', () => {
        try {
          const incoming = JSON.parse(body || '{}')
          let currentData: Record<string, any> = {}
          if (fs.existsSync(DB_FILE)) {
            try {
              currentData = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8') || '{}')
            } catch {
              currentData = {}
            }
          }

          if (incoming.updates) {
            Object.assign(currentData, incoming.updates)
          } else if (incoming.key && incoming.value !== undefined) {
            currentData[incoming.key] = incoming.value
          } else {
            Object.assign(currentData, incoming)
          }

          const dir = path.dirname(DB_FILE)
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
          fs.writeFileSync(DB_FILE, JSON.stringify(currentData, null, 2), 'utf-8')
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify({ success: true, timestamp: Date.now() }))
        } catch (err: any) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: err.message }))
        }
      })
      return
    }

    res.statusCode = 404
    res.end(JSON.stringify({ error: 'Not found' }))
  }

  return {
    name: 'cfc-shared-database-sync',
    configureServer(server) {
      server.middlewares.use(handleApi)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleApi)
    },
  }
}

export default defineConfig({
  plugins: [react(), sharedDbPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
