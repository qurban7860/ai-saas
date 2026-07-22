# 🎬 Enterprise Asset Generation Pipeline

> **Zero-ripple** Playwright automation that generates recruiter-grade portfolio assets from your live AI SaaS application — completely external to the Next.js app state.

---

## 📦 What It Generates

| Asset | Path | Description |
|---|---|---|
| 🎬 Demo Video | `output/artifacts/ENTERPRISE_DEMO_VIDEO.mp4` | Cinematic 1366×768 continuous recording with fade transitions |
| 📄 Executive PDF | `output/artifacts/ENTERPRISE_DEMO_REPORT.pdf` | A4 landscape dark-mode case study report |
| 🖼 Screenshots | `output/screenshots/*.png` | ~10 viewport-isolated PNGs across all key routes |

---

## ⚡ Quick Start

### Prerequisites

```bash
# 1. Install Playwright (one-time)
npm install --save-dev playwright --legacy-peer-deps

# 2. Install Chromium browser binary (one-time, ~185 MB)
npx playwright install chromium
# or via the npm script alias:
npm run generate-assets:install
```

### Run the Pipeline

```bash
# Terminal 1 — keep the dev server running
npm run dev

# Terminal 2 — execute the pipeline
npm run generate-assets
```

> ⚠️ **The dev server must be running at `http://localhost:3000` before executing the pipeline.**

---

## 🎥 Recording Flow

The script captures the following scenes in order:

| Phase | Route | What is captured |
|---|---|---|
| 1 | `/` | Landing Hero section |
| 1 | `/` | Feature Grid section (scrolled) |
| 1 | `/` | Pricing Tiers section (scrolled) |
| 2 | `/login` | Glassmorphism login form |
| 2 | *(auth)* | Zero-ripple authentication (JWT injected directly into Playwright) |
| 3 | `/chat` | Authenticated empty-state dashboard |
| 4 | `/chat?sessionId=…` | AI Chat 1 — prompt typed |
| 4 | `/chat?sessionId=…` | AI Chat 1 — streaming response |
| 4 | `/chat?sessionId=…` | AI Chat 2 — prompt typed |
| 4 | `/chat?sessionId=…` | AI Chat 2 — streaming response |
| 5 | `/chat` | Sidebar populated with conversation history |

---

## 📂 Output Structure

```
output/
├── screenshots/
│   ├── 01-landing-hero.png
│   ├── 02-landing-features.png
│   ├── 03-landing-pricing.png
│   ├── 04-login-page.png
│   ├── 05-chat-empty-state.png
│   ├── 06-chat-1-prompt.png
│   ├── 07-chat-1-response.png
│   ├── 08-chat-2-prompt.png
│   ├── 09-chat-2-response.png
│   └── 10-chat-with-history.png
└── artifacts/
    ├── ENTERPRISE_DEMO_VIDEO.mp4
    └── ENTERPRISE_DEMO_REPORT.pdf
```

The `output/` directory is placed at the project root and is **not tracked by git** (add to `.gitignore` if needed).

---

## 🛠 Configuration

All configuration lives at the top of `generate-assets.mjs`:

```js
const BASE_URL = 'http://localhost:3000';  // Change for staging/prod

const CREDENTIALS = {
  email:    'user123@gmail.co',
  password: 'User@123',
};

const AI_PROMPTS = [
  'What are the main benefits of using AI in modern SaaS applications?',
  'Can you help me write a short professional bio for a software engineer portfolio?',
];
```

### Video Settings

- **Resolution**: 1366×768 (16:9 — optimal for portfolio embeds)
- **Device scale factor**: 1.5× (retina-quality rendering)
- **Format**: MP4 via Playwright's built-in `recordVideo`

---

## 🔧 Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `AUTH_SECRET is missing` | `.env` file not found or incomplete | Ensure you have an `AUTH_SECRET` in `.env` |
| `No users found in database` | Empty DB | Run the seed script or manually sign up via the UI first |
| `locator.waitFor: Timeout` on "Start a New Conversation" | Not authenticated (login failed) | Check that your dev server is running |
| Video file not found | Playwright context closed before video flushed | Ensure `videoContext.close()` is awaited — already handled in the script |
| `Cannot find module 'playwright'` | Playwright not installed | Run `npm install --save-dev playwright --legacy-peer-deps` |
| Chromium binary missing | Browser not downloaded | Run `npx playwright install chromium` |
| PDF images are blank | Screenshots not loaded before `page.pdf()` | The script waits for `img.decode()` on all images before generating the PDF |

---

## 🏗 Architecture

```
scripts/
└── generate-assets.mjs    ← This script (ES module, no dependencies beyond playwright)

output/                    ← Generated at runtime, gitignore-safe
├── screenshots/
├── artifacts/
│   └── video-temp/        ← Cleaned up automatically after video is copied
└── ENTERPRISE_DEMO_REPORT.html  ← Intermediate HTML for PDF generation
```

**Zero-ripple design**: The script is a pure `node` ES module that only reads from `localhost:3000`. It never touches your source files, environment, or Next.js state.

---

## 📋 npm Scripts

```bash
npm run generate-assets          # Run the full pipeline
npm run generate-assets:install  # Install Chromium browser binary
```
