// Servidor local para testar a API durante desenvolvimento
// Rodar com: node dev-api.js
import { createServer } from 'http'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))

// Carrega o .env manualmente
const envPath = join(__dir, '.env')
try {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && v.length) process.env[k.trim()] = v.join('=').trim().replace(/^"|"$/g, '')
  })
} catch {}

const PORT = 3001

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

  if (req.url === '/api/ai-treino' && req.method === 'POST') {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', async () => {
      try {
        req.body = JSON.parse(body)
        const { default: handler } = await import(`./api/ai-treino.js?t=${Date.now()}`)
        const mockRes = {
          _status: 200, _data: null,
          status(code) { this._status = code; return this },
          json(data) { this._data = data; return this },
        }
        await handler(req, mockRes)
        res.writeHead(mockRes._status, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(mockRes._data))
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: err.message }))
      }
    })
    return
  }

  res.writeHead(404)
  res.end('Not found')
})

server.listen(PORT, () => console.log(`API local rodando em http://localhost:${PORT}`))
