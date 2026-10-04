import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.MONGODB_URI && !process.env.MONGODB_URI) {
    process.env.MONGODB_URI = env.MONGODB_URI;
  }

  return {
    server: {
      port: 3000,
      open: false
    },
    build: {
      target: 'esnext'
    },
    plugins: [
      {
        name: 'vercel-api-dev-middleware',
        configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const isLeaderboard = req.url && (req.url === '/api/leaderboard' || req.url.startsWith('/api/leaderboard?'));
          const isGameSessions = req.url && (req.url === '/api/gameSessions' || req.url.startsWith('/api/gameSessions?'));

          if (isLeaderboard || isGameSessions) {
            try {
              const handlerModule = isGameSessions
                ? await import('./api/gameSessions.js')
                : await import('./api/leaderboard.js');
              const handler = handlerModule.default;

              // Parse search params into req.query
              const url = new URL(req.url, 'http://localhost');
              req.query = Object.fromEntries(url.searchParams);

              // Read request body if present for POST requests
              let body = undefined;
              if (req.method === 'POST') {
                const chunks = [];
                for await (const chunk of req) {
                  chunks.push(chunk);
                }
                const raw = Buffer.concat(chunks).toString('utf8');
                try {
                  body = JSON.parse(raw);
                } catch {
                  body = raw;
                }
              }

              // Provide standard Vercel response helper methods
              if (!res.status) {
                res.status = function (code) {
                  this.statusCode = code;
                  return this;
                };
              }
              if (!res.json) {
                res.json = function (data) {
                  this.setHeader('Content-Type', 'application/json');
                  this.end(JSON.stringify(data));
                  return this;
                };
              }

              req.body = body;
              await handler(req, res);
              return;
            } catch (err) {
              console.error('Local dev API middleware error:', err);
              if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
              return;
            }
          }
          next();
        });
      }
    }
  ]
};
});
