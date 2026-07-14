import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'
import { handleAi } from '../api/handler'

function apiMiddleware() {
  return {
    name: 'api-middleware',
    configureServer(server: { middlewares: { use: (path: string, handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void } }) {
      server.middlewares.use('/api/ai', async (req: IncomingMessage, res: ServerResponse) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.statusCode = 200
          res.end(JSON.stringify({ ok: true, message: '墨韵 AI API is running (dev)', version: '1.0.0' }))
          return
        }

        if (req.method !== 'POST') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.statusCode = 405
          res.end(JSON.stringify({ error: '仅支持 POST 请求' }))
          return
        }

        try {
          const chunks: Buffer[] = []
          for await (const chunk of req) {
            chunks.push(chunk)
          }
          const raw = Buffer.concat(chunks).toString('utf-8')

          let body: { action?: string; apiKey?: string; provider?: string; params?: Record<string, unknown> }
          try {
            body = JSON.parse(raw)
          } catch {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.statusCode = 400
            res.end(JSON.stringify({ error: '请求体格式错误，需要 JSON' }))
            return
          }

          const result = await handleAi(body as Parameters<typeof handleAi>[0])

          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.statusCode = result.status
          res.end(JSON.stringify(result.body))
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : '未知错误'
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.statusCode = 500
          res.end(JSON.stringify({ error: `服务异常：${message}` }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), apiMiddleware()],
  base: '/',
})
