#!/usr/bin/env node

/**
 * A stdio bridge to the hosted Supplementscanner MCP server, for clients that
 * can only start a local command. It holds no logic of its own: every message
 * is passed through to the remote endpoint unchanged, and every reply back.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

// The international endpoint answers for every market, so it is the default.
const HUB_ENDPOINT = 'https://mcp.supplementscanner.eu';

// A country's own endpoint answers for that country when a request names none.
const ENDPOINTS = {
    nl: 'https://mcp.supplementenscanner.nl',
    be: 'https://mcp.supplementscanner.be',
    fr: 'https://mcp.supplementscanner.fr',
    gb: 'https://mcp.supplementscanner.co.uk',
    pl: 'https://mcp.supplementscanner.pl',
    dk: 'https://mcp.supplementscanner.dk',
    es: 'https://mcp.suplementoscanner.es',
    at: 'https://mcp.supplementscanner.at',
};

const market = (process.argv[2] ?? process.env.SUPPLEMENTSCANNER_MARKET)?.toLowerCase();
const endpoint = market === undefined || market === '' ? HUB_ENDPOINT : ENDPOINTS[market];

if (endpoint === undefined) {
    console.error(`Unknown market "${market}". Use one of: ${Object.keys(ENDPOINTS).join(', ')}.`);
    process.exit(1);
}

const local = new StdioServerTransport();
const remote = new StreamableHTTPClientTransport(new URL(endpoint));

let closing = false;

async function shutdown(code) {
    if (closing) {
        return;
    }

    closing = true;
    await Promise.allSettled([local.close(), remote.close()]);
    process.exit(code);
}

local.onmessage = (message) => {
    remote.send(message).catch((error) => {
        console.error(`Could not reach ${endpoint}: ${error.message}`);

        // A request that never arrived still needs an answer, or the client waits forever.
        if (message.id !== undefined) {
            local.send({
                jsonrpc: '2.0',
                id: message.id,
                error: { code: -32603, message: `Could not reach ${endpoint}: ${error.message}` },
            });
        }
    });
};

remote.onmessage = (message) => {
    local.send(message);
};

remote.onerror = (error) => {
    console.error(`Remote error: ${error.message}`);
};

local.onclose = () => shutdown(0);
remote.onclose = () => shutdown(0);

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

await remote.start();
await local.start();
