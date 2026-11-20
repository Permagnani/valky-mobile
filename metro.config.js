const { getDefaultConfig } = require('expo/metro-config');
const http = require('http');
const https = require('https');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const TARGET_CANDIDATES = [
  { protocol: 'https:', host: 'localhost', port: 54300 },
  { protocol: 'http:', host: 'localhost', port: 54300 },
  { protocol: 'http:', host: 'localhost', port: 54301 },
];

function proxyToValkyBackend(req, res, targetIndex, bodyBuffer, subPath) {
  if (targetIndex >= TARGET_CANDIDATES.length) {
    res.writeHead(502, {
      'Content-Type': 'application/problem+json',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(
      JSON.stringify({
        title: 'Servidor da API inacessível',
        status: 502,
        detail:
          'Não foi possível conectar à Valky.Api local nas portas 54300 ou 54301.',
        codigoErro: 'FALHA_CONEXAO_REDE',
      })
    );
    return;
  }

  const target = TARGET_CANDIDATES[targetIndex];
  const client = target.protocol === 'https:' ? https : http;

  const forwardHeaders = { ...req.headers };
  delete forwardHeaders.host;
  delete forwardHeaders.origin;
  delete forwardHeaders.referer;

  const proxyReq = client.request(
    {
      hostname: target.host,
      port: target.port,
      path: subPath || '/',
      method: req.method,
      headers: forwardHeaders,
      rejectUnauthorized: false,
      timeout: 12000,
    },
    (proxyRes) => {
      const responseHeaders = {
        ...proxyRes.headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Authorization, X-Client-Id, Accept',
      };
      res.writeHead(proxyRes.statusCode || 200, responseHeaders);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', () => {
    proxyToValkyBackend(req, res, targetIndex + 1, bodyBuffer, subPath);
  });

  if (bodyBuffer && bodyBuffer.length > 0) {
    proxyReq.write(bodyBuffer);
  }
  proxyReq.end();
}

const originalEnhanceMiddleware = config.server?.enhanceMiddleware;

config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware, metroServer) => {
    const baseMiddleware =
      typeof originalEnhanceMiddleware === 'function'
        ? originalEnhanceMiddleware(metroMiddleware, metroServer)
        : metroMiddleware;

    return (req, res, next) => {
      if (req.url && req.url.startsWith('/__valky_proxy')) {
        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods':
              'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers':
              'Content-Type, Authorization, X-Client-Id, Accept',
          });
          res.end();
          return;
        }

        const subPath = req.url.replace(/^\/__valky_proxy/, '') || '/';
        const chunks = [];
        req.on('data', (chunk) => chunks.push(chunk));
        req.on('end', () => {
          const bodyBuffer = Buffer.concat(chunks);
          proxyToValkyBackend(req, res, 0, bodyBuffer, subPath);
        });
        return;
      }

      return baseMiddleware(req, res, next);
    };
  },
};

module.exports = config;
