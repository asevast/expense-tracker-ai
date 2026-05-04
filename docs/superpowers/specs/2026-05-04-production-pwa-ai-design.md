# Design Spec: Production-Ready PWA with Flexible AI Support

**Date:** 2026-05-04
**Topic:** Transitioning to Production with AI Priority
**Status:** Draft

## 1. Overview
The goal is to move the existing Expense Tracker AI to production as a high-quality Progressive Web App (PWA). The primary focus is on "AI Priority" features using a "Bring Your Own Key" (BYOK) model, supporting both cloud providers and local LLMs.

## 2. Architecture

### 2.1 Pure Client-Side PWA
- **Deployment:** Vercel (or Netlify/Static Hosting).
- **Persistence:** Continue using `localStorage` for privacy and offline-first speed.
- **Service Workers:** Implement basic caching for offline availability.
- **Manifest:** Standard `manifest.json` for installation on mobile/desktop.

### 2.2 AI "Universal Adapter"
- **Format:** Standardize on OpenAI Chat Completions API format.
- **Provider Support:**
    - **Cloud:** OpenAI, Anthropic (via proxy), OpenRouter, Groq.
    - **Local:** Ollama, LM Studio (via `localhost` API).
- **Configuration:** New "Settings" UI to manage:
    - Provider Type (Anthropic, OpenAI-Compatible, Local).
    - API Base URL.
    - API Key (stored in `localStorage`).
    - Model ID.
- **CORS Proxy:** A lightweight Next.js Edge Function to handle CORS for providers that block browser-side requests.

## 3. AI Features

### 3.1 AI Auto-Categorization
- **Trigger:** Debounced input (600ms) on the "Description" field in Add/Edit forms.
- **UI:** A clickable "Suggestion" chip below the category selector.
- **Logic:** Sends the description and the list of valid `CATEGORIES` to the AI. Returns the single most relevant category.

### 3.2 AI Insights
- **UI:** A dedicated card or panel on the Dashboard.
- **Logic:** Aggregates transaction data (e.g., "Food: $450 in April") and sends a summary prompt to the AI.
- **Output:** Human-readable text highlighting spending alerts, trends, and savings opportunities.

## 4. User Experience (UX)

### 4.1 Non-Intrusive Integration
- The app must remain 100% functional without an AI key.
- If no key is set, the "Suggestion" chip and "Insights" panel are hidden or show a "Setup AI" call-to-action.

### 4.2 Privacy & Security
- API keys are NEVER sent to our servers.
- Keys are stored locally and only used for direct (or proxied) AI calls.

## 5. Implementation Roadmap
1. **PWA Scaffolding:** Add manifest, icons, and service worker.
2. **Settings UI:** Build the AI configuration form and persistence logic.
3. **Universal AI Client:** Implement the standardized fetch logic with provider switching.
4. **Auto-Categorization:** Implement the debounced hook and form integration.
5. **AI Insights:** Build the data aggregation logic and dashboard panel.
6. **Deployment:** Setup Vercel project and environment variables for the Edge Proxy.

## 6. Success Criteria
- [ ] App is installable as a PWA.
- [ ] Users can connect to Ollama (local) or OpenRouter (cloud).
- [ ] AI correctly suggests "Food" for "Grocery store".
- [ ] Insights provide meaningful analysis of monthly data.
- [ ] No data/keys are leaked to backend storage.
