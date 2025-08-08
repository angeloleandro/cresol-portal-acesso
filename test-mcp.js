// Script de teste simples para o servidor MCP Supabase
// Requisitos:
//  1. Node >= 18
//  2. Variável SUPABASE_ACCESS_TOKEN_CRESOL exportada
//  3. Acesso à internet
// Uso:
//  node test-mcp.js
//  (Opcional) DEBUG=1 node test-mcp.js para logs verbosos de frames

import { spawn } from 'node:child_process';

const PROJECT_REF = 'taodkzafqgoparihaljx';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN_CRESOL;
if (!ACCESS_TOKEN) {
  console.error('ERRO: defina SUPABASE_ACCESS_TOKEN_CRESOL antes de rodar.');
  process.exit(1);
}

function buildFrame(obj) {
  const json = JSON.stringify(obj);
  return `Content-Length: ${Buffer.byteLength(json, 'utf8')}` + "\r\n" + "\r\n" + json;
}

class FrameParser {
  constructor(onMessage) {
    this.buffer = Buffer.alloc(0);
    this.onMessage = onMessage;
  }
  push(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    while (true) {
      const sepIndex = this.buffer.indexOf('\r\n\r\n');
      if (sepIndex === -1) break;
      const headerPart = this.buffer.slice(0, sepIndex).toString('utf8');
      const match = /Content-Length:\s*(\d+)/i.exec(headerPart);
      if (!match) {
        console.error('Cabeçalho sem Content-Length. Abortando.');
        return;
      }
      const len = parseInt(match[1], 10);
      const startBody = sepIndex + 4;
      if (this.buffer.length < startBody + len) break;
      const body = this.buffer.slice(startBody, startBody + len).toString('utf8');
      this.buffer = this.buffer.slice(startBody + len);
      try {
        const json = JSON.parse(body);
        this.onMessage(json);
      } catch (e) {
        console.error('Falha ao parsear JSON do frame', e);
      }
    }
  }
}

let nextId = 1;
function rpc(method, params = {}) { return { jsonrpc: '2.0', id: nextId++, method, params }; }

const server = spawn('npx', [
  '-y',
  '@supabase/mcp-server-supabase@latest',
  `--project-ref=${PROJECT_REF}`,
  `--access-token=${ACCESS_TOKEN}`
], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

server.on('error', (e) => console.error('Falha ao iniciar servidor MCP:', e));

if (process.env.DEBUG) {
  server.stderr.on('data', d => process.stderr.write('[STDERR] ' + d.toString()));
} else {
  server.stderr.on('data', d => {
    const txt = d.toString();
    if (/error/i.test(txt)) process.stderr.write('[STDERR] ' + txt);
  });
}

const parser = new FrameParser(onMessage);
server.stdout.on('data', chunk => {
  if (process.env.DEBUG) process.stdout.write('[RAW] ' + chunk.toString());
  parser.push(chunk);
});

let toolsCache = [];

function send(obj) {
  const frame = buildFrame(obj);
  if (process.env.DEBUG) {
    console.log('\n>> ENVIANDO', obj);
  }
  server.stdin.write(frame);
}

function onMessage(msg) {
  if (process.env.DEBUG) console.log('\n<< RECEBIDO', msg);
  if (msg.id === 1 && (msg.result || msg.error)) {
    console.log('Inicialização OK');
    send(rpc('tools/list'));
  } else if (msg.id === 2 && msg.result) {
    toolsCache = msg.result.tools || [];
    console.log('Ferramentas disponíveis:', toolsCache.map(t => t.name).join(', '));
    const execTool = toolsCache.find(t => /execute_sql/i.test(t.name));
    if (execTool) {
      send(rpc('tools/execute', {
        name: execTool.name,
        arguments: { sql: 'select 1 as ok;' }
      }));
    } else {
      finalizar();
    }
  } else if (msg.id && msg.result && msg.result.output) {
    console.log('Resultado execute_sql:', msg.result.output);
    finalizar();
  }
}

function finalizar() {
  console.log('Teste concluído. Encerrando servidor.');
  server.stdin.end();
  setTimeout(() => server.kill(), 200);
}

send(rpc('initialize', {
  clientInfo: { name: 'cresol-mcp-local-tester', version: '0.1.0' },
  capabilities: {}
}));

setTimeout(() => {
  console.error('Timeout atingido sem concluir teste.');
  finalizar();
}, 20000);
