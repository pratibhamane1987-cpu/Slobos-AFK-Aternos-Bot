"use strict";

const { addLog, getLogs } = require("./logger");
const mineflayer = require("mineflayer");
const { Movements, pathfinder, goals } = require("mineflayer-pathfinder");
const { GoalBlock } = goals;
const config = require("./settings.json");
const express = require("express");
const http = require("http");
const https = require("https");

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

let botState = {
  connected: false,
  lastActivity: Date.now(),
  reconnectAttempts: 0,
  startTime: Date.now(),
  errors: [],
  wasThrottled: false,
};

// ============================================================
// AUTOMATIC RECOVERY ENGINE
// ============================================================
process.on('uncaughtException', () => {
  setTimeout(() => process.exit(1), 1000);
});
process.on('unhandledRejection', () => {
  setTimeout(() => process.exit(1), 1000);
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>${config.name} Dashboard</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" media="print" onload="this.media='all'"
              href="https://googleapis.com">
        <style>
          *, *::before, *::after { box-sizing: border-box; }
          body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: #0d1117; color: #e6edf3;
            display: flex; justify-content: center; align-items: center;
            min-height: 100vh; margin: 0; padding: 24px;
          }
          main { width: 100%; max-width: 400px; }
          header { margin-bottom: 28px; }
          header h1 { font-size: 26px; font-weight: 700; color: #f0f6fc; margin: 0; line-height: 1.2; }
          header p { font-size: 14px; color: #8b949e; margin: 6px 0 0; line-height: 1.5; }
          .status-section {
            border-radius: 12px; padding: 20px 24px; margin-bottom: 16px;
            display: flex; align-items: center; gap: 16px; transition: background 0.3s, border-color 0.3s;
          }
          .status-section.online  { background: #0d2218; border: 2px solid #238636; }
          .status-section.offline { background: #200d0d; border: 2px solid #da3633; }
          .status-icon {
            width: 44px; height: 44px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 20px; flex-shrink: 0; transition: background 0.3s;
          }
          .status-icon.online  { background: #238636; }
          .status-icon.offline { background: #da3633; }
          .status-label { font-size: 18px; font-weight: 700; line-height: 1.2; transition: color 0.3s; }
          .status-label.online  { color: #3fb950; }
          .status-label.offline { color: #f85149; }
          .status-detail { font-size: 13px; color: #8b949e; margin-top: 3px; }
          dl { margin: 0; }
          .stat-card { background: #161b22; border: 1px solid #21262d; border-radius: 10px; padding: 16px 20px; margin-bottom: 10px; }
          dt { font-size: 12px; color: #8b949e; font-weight: 600; margin-bottom: 4px; }
          dd { margin: 0; font-size: 17px; font-weight: 600; color: #e6edf3; line-height: 1.3; }
          .stat-detail { margin: 4px 0 0; font-size: 11px; color: #6e7681; }
        </style>
      </head>
      <body>
        <main role="main" aria-label="AFK Bot Dashboard">
          <header>
            <h1>AFK Bot Dashboard</h1>
            <p>Minecraft server bot &middot; Live status</p>
          </header>
          <section id="status-section" role="status" aria-live="polite" class="status-section offline">
            <div id="status-icon" aria-hidden="true" class="status-icon offline">&#x2717;</div>
            <div>
              <div id="status-label" class="status-label offline">Connecting…</div>
              <div id="status-detail" class="status-detail">Establishing connection</div>
            </div>
          </section>
          <section aria-label="Bot statistics">
            <dl>
              <div class="stat-card">
                <dt>Server address</dt>
                <dd>${config.server.ip}</dd>
                <p class="stat-detail">Minecraft server hostname</p>
              </div>
            </dl>
          </section>
        </main>
      </body>
    </html>
  `);
});

// Native Ping Implementation without Axios
app.listen(PORT, () => {
  setInterval(() => {
    // Badlein: 'YOUR_SECOND_REPL_URL.username.repl.co' ko apne real target link se replace karein
    https.get('https://YOUR_SECOND_REPL_URL.repl.co', () => {}).on('error', () => {});
  }, 180000); // 3-minute strict loop
});
