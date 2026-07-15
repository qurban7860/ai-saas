/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║              AI SAAS — ENTERPRISE ASSET GENERATION PIPELINE              ║
 * ║  Generates: Cinematic Demo Video · Executive PDF · Full-Page Screenshots  ║
 * ║  Zero-ripple: operates completely external to the Next.js app state.     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * PREREQUISITES
 *   npm install --save-dev playwright
 *   npx playwright install chromium
 *
 * USAGE
 *   1. Start the dev server in a separate terminal:  npm run dev
 *   2. Run this script:  node scripts/generate-assets.mjs
 *
 * CREDENTIALS (for auth-gated routes)
 *   Email:    user123@gmail.co
 *   Password: User@123
 *
 * OUTPUT
 *   output/screenshots/   — Viewport PNG screenshots per route/section
 *   output/artifacts/     — ENTERPRISE_DEMO_REPORT.pdf · ENTERPRISE_DEMO_VIDEO.mp4
 */

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { encode } from '@auth/core/jwt';
import dotenv from 'dotenv';

/* ─── CONFIGURATION ─────────────────────────────────────────────────────── */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars for Prisma and Auth Secret
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const BASE_URL = 'http://localhost:3000';

const CREDENTIALS = {
  email: 'user123@gmail.co',
};

// Two prompts for the live AI conversations captured in the video
const AI_PROMPTS = [
  'What are the main benefits of using AI in modern SaaS applications?',
  'Can you help me write a short professional bio for a software engineer portfolio?',
];

const outputRoot = path.resolve(__dirname, '..', 'output');
const screenshotsDir = path.join(outputRoot, 'screenshots');
const artifactsDir = path.join(outputRoot, 'artifacts');
const videoTempDir = path.join(artifactsDir, 'video-temp');

const reportHtmlPath = path.join(outputRoot, 'ENTERPRISE_DEMO_REPORT.html');
const reportPdfPath = path.join(artifactsDir, 'ENTERPRISE_DEMO_REPORT.pdf');
const finalVideoPath = path.join(artifactsDir, 'ENTERPRISE_DEMO_VIDEO.mp4');

/* ─── HELPERS ───────────────────────────────────────────────────────────── */
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };
const cleanFile = (fp) => { if (fs.existsSync(fp)) fs.unlinkSync(fp); };

async function gotoStable(page, url, extraMs = 1400) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await wait(extraMs);
}

async function injectOverlay(page) {
  await page.evaluate(() => {
    if (document.getElementById('__ag-overlay')) return;
    const el = document.createElement('div');
    el.id = '__ag-overlay';
    el.style.cssText =
      'position:fixed;inset:0;z-index:2147483647;background:#050608;opacity:1;pointer-events:none;transition:opacity 0.85s cubic-bezier(0.25,1,0.5,1)';
    document.documentElement.appendChild(el);
  });
}

async function fadeIn(page) {
  await injectOverlay(page);
  await page.evaluate(() => {
    const el = document.getElementById('__ag-overlay');
    if (el) { void el.offsetWidth; el.style.opacity = '0'; }
  });
  await wait(950);
}

async function fadeOut(page) {
  await page.evaluate(() => {
    let el = document.getElementById('__ag-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = '__ag-overlay';
      el.style.cssText =
        'position:fixed;inset:0;z-index:2147483647;background:#050608;opacity:0;pointer-events:none;transition:opacity 0.65s cubic-bezier(0.25,1,0.5,1)';
      document.documentElement.appendChild(el);
    }
    void el.offsetWidth;
    el.style.opacity = '1';
  });
  await wait(750);
}

async function captureViewport(page, filePath) {
  await page.screenshot({ path: filePath, fullPage: false, animations: 'disabled' });
}

async function scrollPass(page) {
  const landmarks = await page.locator('header, section, main, footer').all();
  if (landmarks.length > 0) {
    for (const lm of landmarks) {
      await lm.scrollIntoViewIfNeeded().catch(() => { });
      await wait(380);
    }
  } else {
    const h = await page.evaluate(() => document.body.scrollHeight);
    for (let s = 0; s <= 3; s++) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), (h / 3) * s);
      await wait(500);
    }
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await wait(900);
}

/* ─── AUTH ──────────────────────────────────────────────────────────────── */
/**
 * Zero-Ripple Headless Auth:
 * Completely bypasses the UI and NextAuth endpoints.
 * We fetch the target user from the DB using Prisma, mint a valid NextAuth
 * session JWT locally, and inject it as a cookie directly into Playwright.
 */
async function injectSessionCookie(context, page) {
  console.log('  → Injecting authenticated session (Zero-Ripple bypass)...');
  
  if (!process.env.AUTH_SECRET) {
    throw new Error('AUTH_SECRET is missing from .env');
  }

  const prisma = new PrismaClient();
  let user = await prisma.user.findUnique({
    where: { email: CREDENTIALS.email },
  });

  // Fallback to first user if credentials don't match
  if (!user) {
    console.log(`  ⚠ User ${CREDENTIALS.email} not found. Falling back to first user in DB...`);
    user = await prisma.user.findFirst();
  }
  await prisma.$disconnect();

  if (!user) {
    throw new Error('No users found in database. Please run seed script or sign up manually first.');
  }

  // Generate a valid NextAuth v5 JWT session token
  const token = await encode({
    token: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    secret: process.env.AUTH_SECRET,
    salt: 'authjs.session-token',
  });

  // Inject the cookie directly into the browser context
  await context.addCookies([
    {
      name: 'authjs.session-token',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);

  // Navigate directly to /chat — we should bypass login completely
  await gotoStable(page, `${BASE_URL}/chat`, 1500);

  const finalUrl = page.url();
  if (finalUrl.includes('/login') || finalUrl.includes('error=')) {
    throw new Error(`Direct cookie injection failed. Redirected to: ${finalUrl}`);
  }

  console.log(`  ✔ Successfully authenticated as ${user.email}.`);
}

/* ─── AI CHAT INTERACTION ───────────────────────────────────────────────── */
/**
 * Creates a new chat session, sends a prompt, waits for the AI response,
 * and captures before/after screenshots.
 * Returns { preFile, postFile } relative filenames.
 */
async function performAiChat(page, promptText, chatIndex) {
  console.log(`  → Chat ${chatIndex}: Navigating to /chat to create new session...`);

  // Navigate to base /chat to trigger the empty-state view
  await gotoStable(page, `${BASE_URL}/chat`, 2000);

  // Verify we're authenticated (if we land on /login the session was lost)
  if (page.url().includes('/login')) {
    throw new Error(`Chat ${chatIndex}: Auth session expired — redirected to login. Please check credentials.`);
  }

  await injectOverlay(page);
  await fadeIn(page);

  // ── Create a new chat session ──
  // The empty-state renders "Start a New Conversation" button
  const newChatBtn = page.locator('button:has-text("Start a New Conversation")').first();
  await newChatBtn.waitFor({ state: 'visible', timeout: 20000 });
  await newChatBtn.click();

  // Wait for the router to push ?sessionId=... into the URL
  await page.waitForURL(`${BASE_URL}/chat?sessionId=**`, { timeout: 15000 }).catch(() => {});
  await wait(1500);

  console.log(`  → Chat ${chatIndex}: Session URL: ${page.url()}`);

  // ── Locate the chat input ──
  // The ChatInterface uses shadcn <Input> which renders as <input> (not textarea)
  // Placeholder: "Ask anything using DEFAULT mode..."
  const chatInput = page.locator(
    'input[placeholder*="Ask anything"], input[placeholder*="anything"], input[class*="rounded-full"]'
  ).first();

  await chatInput.waitFor({ state: 'visible', timeout: 15000 });
  await chatInput.click();
  await wait(300);
  await chatInput.fill(promptText);
  await wait(600);

  // Capture pre-send screenshot (prompt typed, not yet sent)
  const preFile = `0${(chatIndex - 1) * 2 + 6}-chat-${chatIndex}-prompt.png`;
  await captureViewport(page, path.join(screenshotsDir, preFile));
  console.log(`     Screenshot saved: ${preFile}`);

  // ── Send the message ──
  // Submit button is button[type="submit"] inside the form
  const sendBtn = page.locator('form button[type="submit"]').first();
  const sendEnabled = await sendBtn.isEnabled().catch(() => false);
  if (sendEnabled) {
    await sendBtn.click();
  } else {
    await chatInput.press('Enter');
  }

  console.log(`  → Chat ${chatIndex}: Waiting for AI response to stream...`);

  // ── Wait for AI response ──
  // Strategy: wait for the loading spinner to appear then disappear (most reliable)
  // The spinner is a Loader2 inside the submit button when isLoading=true
  const spinner = page.locator('form button[type="submit"] svg.animate-spin, [class*="animate-spin"]').first();

  // Wait for spinner to appear (indicates streaming started)
  await spinner.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

  // Wait for spinner to disappear (indicates streaming finished)
  await spinner.waitFor({ state: 'hidden', timeout: 60000 }).catch(() => {});

  // Extra visual buffer
  await wait(2500);

  // Capture post-response screenshot
  const postFile = `0${(chatIndex - 1) * 2 + 7}-chat-${chatIndex}-response.png`;
  await captureViewport(page, path.join(screenshotsDir, postFile));
  console.log(`     Screenshot saved: ${postFile}`);

  return { preFile, postFile };
}

/* ─── REPORT HTML BUILDER ───────────────────────────────────────────────── */
function buildReportHtml(shots) {
  const total = shots.length + 1;

  const slides = shots.map((s, idx) => `
    <div class="pdf-page">
      <div class="page-header">
        <div class="header-brand">
          <span class="header-logo">AI</span>
          <div>
            <h1>AI SaaS Platform</h1>
            <p class="header-subtitle">Enterprise Platform Showcase</p>
          </div>
        </div>
        <div class="header-layer">
          <span class="layer-label">Layer ${String(idx + 1).padStart(2, '0')}</span>
          <span class="layer-title">${s.title}</span>
        </div>
      </div>
      <section class="slide-card">
        <div class="img-wrapper"><img src="./screenshots/${s.file}" alt="${s.title}" /></div>
        <div class="slide-info">
          <h2>${s.title}</h2>
          <p>${s.detail}</p>
          <div class="slide-pills">
            <span class="pill pill-blue">Next.js 16</span>
            <span class="pill pill-purple">React 19</span>
            <span class="pill pill-indigo">TypeScript</span>
            <span class="pill pill-green">AI SDK</span>
            <span class="pill pill-orange">Tailwind CSS</span>
          </div>
        </div>
      </section>
      <div class="page-footer">
        <span>Confidential Technical Showcase &middot; AI SaaS Platform</span>
        <span>Page ${idx + 1} of ${total}</span>
      </div>
    </div>`).join('');

  const execPage = `
    <div class="pdf-page exec-page">
      <div class="page-header">
        <div class="header-brand">
          <span class="header-logo">AI</span>
          <div>
            <h1>AI SaaS Platform</h1>
            <p class="header-subtitle">Enterprise Platform Showcase</p>
          </div>
        </div>
        <div class="header-layer">
          <span class="layer-label">Layer ${String(total).padStart(2, '0')}</span>
          <span class="layer-title">Architect Overview</span>
        </div>
      </div>
      <div class="exec-body">
        <div class="exec-lead">
          <p>I help startups, businesses, and founders build <strong>scalable SaaS platforms</strong>, AI-powered applications, enterprise software, and modern web products — shipped at production quality from day one.</p>
          <p>With <strong>3+ years</strong> as a Full Stack Software Engineer, I specialise in React, Next.js, Angular, TypeScript, Node.js, NestJS, PostgreSQL, MongoDB, and modern cloud technologies.</p>
        </div>
        <div class="exec-grid">
          <div class="exec-col">
            <h3>Core Expertise</h3>
            <ul class="check-list">
              <li>Full Stack Development (React, Next.js, Node.js, NestJS)</li>
              <li>SaaS Product Development &amp; Multi-Tenant Architecture</li>
              <li>AI Applications, LLM Integrations &amp; RAG Systems</li>
              <li>Enterprise Software &amp; Business Platforms</li>
              <li>REST APIs, WebSockets &amp; Backend Engineering</li>
              <li>PostgreSQL, MongoDB, Prisma &amp; Database Design</li>
              <li>Workflow Automation &amp; Business Process Solutions</li>
              <li>Performance Optimisation &amp; Scalable Architecture</li>
            </ul>
          </div>
          <div class="exec-col">
            <h3>AI SaaS Platform Highlights</h3>
            <ul class="bullet-list">
              <li>Real-time AI chat with streaming responses via AI SDK</li>
              <li>Multi-session conversation management with sidebar history</li>
              <li>Secure authentication (NextAuth v5, credentials + Google OAuth)</li>
              <li>Prisma ORM with SQLite (dev) / PostgreSQL (prod) support</li>
              <li>Responsive glassmorphism UI with dark mode &amp; micro-animations</li>
              <li>Server Actions for type-safe, form-validated data mutations</li>
              <li>TanStack Query for intelligent client-side caching &amp; sync</li>
            </ul>
          </div>
        </div>
        <div class="exec-closing">
          Whether you need an MVP, SaaS platform, AI-powered product, CRM, internal business tool, or a complete full-stack application — I can help turn your idea into a secure, scalable, production-ready solution.
        </div>
      </div>
      <div class="page-footer">
        <span>Confidential Technical Showcase &middot; AI SaaS Platform</span>
        <span>Page ${total} of ${total}</span>
      </div>
    </div>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>AI SaaS Platform - Enterprise Showcase</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
@page{size:A4 landscape;margin:0}
*,*::before,*::after{box-sizing:border-box}
body{font-family:'Inter',system-ui,sans-serif;margin:0;background:#08090f;color:#F8FAFC;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
.pdf-page{width:297mm;min-height:210mm;max-height:210mm;padding:12mm 18mm;display:flex;flex-direction:column;page-break-after:always;break-after:page;overflow:hidden;position:relative;background:#08090f;background-image:radial-gradient(at 0% 0%,rgba(99,102,241,.09) 0px,transparent 55%),radial-gradient(at 100% 0%,rgba(167,139,250,.07) 0px,transparent 55%),radial-gradient(at 50% 100%,rgba(56,189,248,.05) 0px,transparent 55%)}
.page-header{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.07);padding-bottom:8px;margin-bottom:12px;flex-shrink:0}
.header-brand{display:flex;align-items:center;gap:10px}
.header-logo{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899);text-align:center;line-height:34px;font-weight:900;font-size:13px;color:#fff;flex-shrink:0}
.page-header h1{margin:0;font-size:17px;font-weight:900;letter-spacing:-.03em;background:linear-gradient(90deg,#a78bfa,#38bdf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.header-subtitle{margin:0;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b}
.header-layer{text-align:right}
.layer-label{display:block;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#38bdf8}
.layer-title{font-size:11px;font-weight:700;color:#94a3b8}
.slide-card{flex:1;background:rgba(30,41,59,.28);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:14px;display:grid;grid-template-columns:1fr auto;gap:16px;align-items:start;overflow:hidden;box-shadow:0 24px 48px -12px rgba(0,0,0,.65)}
.img-wrapper{border-radius:8px;overflow:hidden;border:1px solid rgba(0,0,0,.5);background:#020617;aspect-ratio:16/9}
.img-wrapper img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
.slide-info{width:220px;flex-shrink:0;padding-top:4px}
.slide-info h2{margin:0 0 6px;font-size:15px;font-weight:800;color:#f1f5f9;line-height:1.2}
.slide-info p{margin:0 0 12px;font-size:11px;line-height:1.55;color:#94a3b8}
.slide-pills{display:flex;flex-wrap:wrap;gap:5px}
.pill{padding:2px 8px;border-radius:999px;font-size:9px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
.pill-blue{background:rgba(56,189,248,.12);color:#38bdf8;border:1px solid rgba(56,189,248,.25)}
.pill-purple{background:rgba(167,139,250,.12);color:#a78bfa;border:1px solid rgba(167,139,250,.25)}
.pill-indigo{background:rgba(99,102,241,.12);color:#818cf8;border:1px solid rgba(99,102,241,.25)}
.pill-green{background:rgba(16,185,129,.12);color:#34d399;border:1px solid rgba(16,185,129,.25)}
.pill-orange{background:rgba(251,146,60,.12);color:#fb923c;border:1px solid rgba(251,146,60,.25)}
.page-footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,.06);padding-top:7px;margin-top:10px;font-size:10px;color:#475569;flex-shrink:0}
.exec-body{flex:1;display:flex;flex-direction:column;gap:14px;overflow:hidden}
.exec-lead p{margin:0 0 8px;font-size:12.5px;line-height:1.58;color:#cbd5e1}
.exec-lead strong{color:#f8fafc}
.exec-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;background:rgba(15,23,42,.6);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:16px 18px}
.exec-col h3{margin:0 0 10px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#38bdf8}
.check-list,.bullet-list{list-style:none;padding:0;margin:0}
.check-list li,.bullet-list li{font-size:11px;color:#94a3b8;margin-bottom:7px;line-height:1.4;padding-left:16px;position:relative}
.check-list li::before{content:'✔';position:absolute;left:0;color:#10b981;font-size:10px;font-weight:700}
.bullet-list li::before{content:'•';position:absolute;left:0;color:#a78bfa;font-size:14px;line-height:.85}
.exec-closing{background:linear-gradient(90deg,rgba(56,189,248,.08),rgba(167,139,250,.08));border-left:3px solid #38bdf8;padding:12px 14px;font-size:12px;font-weight:500;color:#e2e8f0;line-height:1.6;border-radius:0 8px 8px 0}
</style>
</head>
<body>
${slides}
${execPage}
</body>
</html>`;
}

/* ─── MAIN ──────────────────────────────────────────────────────────────── */
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║        AI SAAS — ENTERPRISE ASSET PIPELINE               ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  ensureDir(screenshotsDir);
  ensureDir(artifactsDir);
  ensureDir(videoTempDir);
  cleanFile(finalVideoPath);
  cleanFile(reportPdfPath);
  cleanFile(reportHtmlPath);

  console.log('Launching Chromium...');
  const browser = await chromium.launch({ headless: true });

  /* ── VIDEO CONTEXT (all phases recorded here) ── */
  const videoContext = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    deviceScaleFactor: 1.5,
    recordVideo: { dir: videoTempDir, size: { width: 1366, height: 768 } },
  });

  const page = await videoContext.newPage();
  const video = page.video();
  const shots = [];

  /* ══════════════════════════════════════════════════════════════════════ */
  /* PHASE 1 — LANDING PAGE (public, unauthenticated)                     */
  /* ══════════════════════════════════════════════════════════════════════ */
  console.log('\n[Phase 1] Landing Page\n');

  // ── Hero ──
  await gotoStable(page, BASE_URL, 1800);
  await injectOverlay(page);
  await fadeIn(page);

  let file = '01-landing-hero.png';
  await captureViewport(page, path.join(screenshotsDir, file));
  console.log(`  Screenshot saved: ${file}`);
  shots.push({
    title: 'Landing Hero',
    detail: 'Primary hero CTA — AI-powered SaaS platform with real-time streaming chat, secure auth, and beautiful premium dashboard experience.',
    file,
  });
  await scrollPass(page);

  // ── Features ──
  console.log('  Scrolling to Features section...');
  await fadeOut(page);
  await wait(300);
  await page.evaluate(() => {
    const sections = document.querySelectorAll('section');
    if (sections.length > 1) sections[1].scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await wait(900);
  await fadeIn(page);

  file = '02-landing-features.png';
  await captureViewport(page, path.join(screenshotsDir, file));
  console.log(`  Screenshot saved: ${file}`);
  shots.push({
    title: 'Feature Grid',
    detail: 'Six-module feature matrix: Advanced AI Models, Lightning Fast responses, Secure & Private auth, Real-time Chat, Conversation Management, and Multi-session Support.',
    file,
  });
  await wait(600);

  // ── Pricing ──
  console.log('  Scrolling to Pricing section...');
  await fadeOut(page);
  await wait(300);
  await page.evaluate(() => {
    const sections = document.querySelectorAll('section');
    if (sections.length > 2) sections[2].scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await wait(900);
  await fadeIn(page);

  file = '03-landing-pricing.png';
  await captureViewport(page, path.join(screenshotsDir, file));
  console.log(`  Screenshot saved: ${file}`);
  shots.push({
    title: 'Pricing Tiers',
    detail: 'Transparent SaaS tier architecture: Free ($0/mo), Pro ($19/mo) with unlimited chats & advanced AI, and Enterprise (custom) with dedicated SLA & on-premise deployment.',
    file,
  });

  /* ══════════════════════════════════════════════════════════════════════ */
  /* PHASE 2 — LOGIN PAGE + AUTH                                           */
  /* ══════════════════════════════════════════════════════════════════════ */
  console.log('\n[Phase 2] Authentication');
  await gotoStable(page, `${BASE_URL}/login`, 1800);
  await fadeIn(page);
  await captureViewport(page, path.join(screenshotsDir, '04-login-page.png'));
  console.log('  Screenshot saved: 04-login-page.png');
  shots.push({
    title: 'Login Page',
    detail: 'Glassmorphism login UI with credentials & Google OAuth. Secure NextAuth v5 session management with JWT tokens and encrypted cookie storage.',
    file: '04-login-page.png',
  });

  // Actually authenticate (bypass UI by injecting JWT cookie)
  await injectSessionCookie(videoContext, page);
  await wait(300);

  /* ══════════════════════════════════════════════════════════════════════ */
  /* PHASE 3 — CHAT DASHBOARD (empty state after login)                   */
  /* ══════════════════════════════════════════════════════════════════════ */
  console.log('\n[Phase 3] Chat Dashboard — Empty State\n');

  // Ensure we land on the no-session empty state
  if (!page.url().includes('/chat') || page.url().includes('sessionId')) {
    await gotoStable(page, `${BASE_URL}/chat`, 2000);
  } else {
    await wait(1200);
  }

  await injectOverlay(page);
  await fadeIn(page);

  file = '05-chat-empty-state.png';
  await captureViewport(page, path.join(screenshotsDir, file));
  console.log(`  Screenshot saved: ${file}`);
  shots.push({
    title: 'Chat Dashboard — Empty State',
    detail: 'Authenticated chat workspace: collapsible conversation sidebar, "Start a New Conversation" CTA, and glassmorphism layout with dark gradient background.',
    file,
  });

  /* ══════════════════════════════════════════════════════════════════════ */
  /* PHASE 4 — TWO LIVE AI CONVERSATIONS                                  */
  /* ══════════════════════════════════════════════════════════════════════ */
  console.log('\n[Phase 4] Live AI Conversations\n');

  for (let i = 0; i < AI_PROMPTS.length; i++) {
    await fadeOut(page);
    await wait(400);

    console.log(`\n  --- AI Chat ${i + 1} of ${AI_PROMPTS.length} ---`);
    console.log(`  Prompt: "${AI_PROMPTS[i]}"`);

    const { preFile, postFile } = await performAiChat(page, AI_PROMPTS[i], i + 1);

    shots.push({
      title: `AI Chat ${i + 1} — Prompt`,
      detail: `User sends: "${AI_PROMPTS[i]}" — real-time streaming chat interface with markdown-rendered responses.`,
      file: preFile,
    });

    await wait(600);
    await fadeOut(page);
    await wait(300);
    await fadeIn(page);

    shots.push({
      title: `AI Chat ${i + 1} — AI Response`,
      detail: `Streaming AI response with full markdown rendering, code highlighting and automatic sidebar session title update.`,
      file: postFile,
    });

    await scrollPass(page);
  }

  /* ══════════════════════════════════════════════════════════════════════ */
  /* PHASE 5 — CHAT WITH POPULATED SIDEBAR HISTORY                        */
  /* ══════════════════════════════════════════════════════════════════════ */
  console.log('\n[Phase 5] Chat — Conversation History Sidebar\n');

  await fadeOut(page);
  await wait(300);
  await gotoStable(page, `${BASE_URL}/chat`, 2000);
  await injectOverlay(page);
  await fadeIn(page);

  file = '10-chat-with-history.png';
  await captureViewport(page, path.join(screenshotsDir, file));
  console.log(`  Screenshot saved: ${file}`);
  shots.push({
    title: 'Chat — Conversation History',
    detail: 'Sidebar populated with completed AI sessions after interactions — demonstrating multi-session management with titles derived from conversation context.',
    file,
  });

  await scrollPass(page);

  /* ── END VIDEO ── */
  console.log('\n  Ending video recording...');
  await fadeOut(page);
  await wait(500);
  await videoContext.close();

  const rawVideo = await video.path();
  if (rawVideo && fs.existsSync(rawVideo)) {
    fs.copyFileSync(rawVideo, finalVideoPath);
    console.log(`\n✔ Video saved: ${finalVideoPath}`);
  } else {
    console.warn('\n⚠ Warning: Video file not found after context close.');
  }

  // Remove temp video dir
  if (fs.existsSync(videoTempDir)) fs.rmSync(videoTempDir, { recursive: true, force: true });

  /* ══════════════════════════════════════════════════════════════════════ */
  /* PHASE 6 — EXECUTIVE PDF REPORT                                        */
  /* ══════════════════════════════════════════════════════════════════════ */
  console.log('\nGenerating executive PDF report...');
  const html = buildReportHtml(shots);
  fs.writeFileSync(reportHtmlPath, html, 'utf8');

  const pdfContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const pdfPage = await pdfContext.newPage();
  const fileUrl = `file:///${reportHtmlPath.replace(/\\/g, '/')}`;

  await pdfPage.goto(fileUrl, { waitUntil: 'networkidle', timeout: 30000 });

  // Wait for fonts + all images to fully decode before calling page.pdf()
  await pdfPage.evaluate(async () => {
    await document.fonts.ready;
    const imgs = Array.from(document.querySelectorAll('img'));
    await Promise.all(imgs.map(img => {
      if (img.complete && img.naturalHeight > 0) {
        return img.decode ? img.decode().catch(() => { }) : Promise.resolve();
      }
      return new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    }));
  });

  await pdfPage.pdf({
    path: reportPdfPath,
    format: 'A4',
    landscape: true,
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: true,
  });

  await pdfContext.close();
  await browser.close();

  /* ── SUMMARY ── */
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║        ENTERPRISE ASSETS GENERATED SUCCESSFULLY          ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`  Video       -> output/artifacts/ENTERPRISE_DEMO_VIDEO.mp4`);
  console.log(`  PDF         -> output/artifacts/ENTERPRISE_DEMO_REPORT.pdf`);
  console.log(`  Screenshots -> output/screenshots/ (${shots.length} files)`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');
}

main().catch(err => {
  console.error('\n✗ Pipeline failed:', err.message || err);
  process.exit(1);
});
