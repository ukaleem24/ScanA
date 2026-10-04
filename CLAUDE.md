# BriefScanner Project Conventions

## Product scope

BriefScanner helps people in Germany understand official letters and other formal correspondence. The application must be mobile-first, accessible, privacy-preserving, and clear about uncertainty.

## Repository layout

- `backend/`: FastAPI service, Pydantic models, Anthropic integration, image/PDF preparation, and pytest tests.
- `frontend/`: Angular standalone application, Angular Material UI, PWA configuration, and frontend tests.
- `samples/`: Explicitly non-sensitive sample letters used for local development and tests.
- `docker-compose.yml`: Local orchestration for the backend and frontend.
- `README.md`: Setup, environment variables, development, testing, and privacy notes.

## Backend conventions

- Use Python 3.12.
- Keep the HTTP layer, domain schemas, document preparation, and Claude client integration separate.
- Validate all Claude output with Pydantic before returning it from the API.
- Read `ANTHROPIC_API_KEY` from the environment only; never commit or expose secrets.
- Keep processing in memory. Do not add a database, file persistence, analytics, or request-body/content logging.
- Enforce the documented upload limits: images or PDF, at most 10 pages, and at most 10 MB.
- Resize and compress images before sending them to Claude.
- Treat unreadable text as uncertainty and expose confidence notes rather than inventing content.
- Mock the Anthropic client in pytest; tests must not make network calls.
- Errors returned to the client are generic (`{"detail": "<code>"}` with a stable code such as `too_many_pages`, `file_too_large`, `unsupported_type`, `analysis_failed`); never echo letter text in errors, exceptions, or logs.

## API contract

- `POST /api/analyze`, `multipart/form-data`:
  - `files`: one PDF, or 1–10 images (JPEG/PNG/WebP/HEIC-from-browser-as-JPEG), in page order.
  - `language`: one of `en`, `de`, `ar`, `tr`, `uk`, `ru`, `fa`, `es`, `fr` (default `en`).
  - `full_translation`: boolean (default `false`).
- Response: the `LetterAnalysis` Pydantic model serialized as JSON. All free-text fields are written in the requested language; `key_terms[].term` stays in German.
- `GET /api/health` for container health checks only.
- Total upload ≤ 10 MB, ≤ 10 pages (images counted per file, PDF counted per page).

## Claude integration

- Model `claude-opus-5-5` via the official `anthropic` Python SDK, configured in one module (`backend/app/claude_client.py`); model name overridable by `CLAUDE_MODEL` env var.
- Use structured outputs (`client.messages.parse(..., output_format=LetterAnalysis)`) so the response is schema-constrained, then still treat Pydantic validation failure as `analysis_failed`.
- Images go in as base64 `image` blocks after server-side resize (long edge ≤ 1568 px, JPEG quality ~85, EXIF orientation applied and metadata stripped). PDFs go in as a base64 `document` block.
- Check `stop_reason` before reading output (`refusal`, `max_tokens` → `analysis_failed`).
- The system prompt lives in `backend/app/prompts.py`; it instructs: plain language, no legal advice, never invent unreadable content, put doubts in `confidence_notes`.
- Dates in the schema are ISO `YYYY-MM-DD` strings or `null`; amounts are decimal EUR numbers.

- Provider selection lives in `backend/app/analyzer.py` (`LLM_PROVIDER`). Claude is the production provider. `gemini_client.py` is a free-tier development adapter using `httpx`; free-tier inputs may be used by Google, so it is for non-sensitive sample letters only and must never be recommended for real users.

## Internationalisation

- UI language and analysis language are one setting (`I18n` service, `frontend/src/app/core/i18n.ts`). Dictionaries are typed TypeScript objects in `core/i18n/<code>.ts` and must have exactly the keys of `en.ts` (compile-time checked; a spec also checks placeholders). English is the source of truth: add a key to `en.ts` first, then to all eight other files.
- Set `lang` and `dir` on `<html>` and on the root `[dir]` (CDK Directionality) when the language changes; use CSS logical properties (`margin-inline-start`, etc.) rather than left/right. Arabic and Persian are RTL.
- Changing language on the result screen re-runs the analysis on the pages still held in memory.
- Keep German terms and reference numbers `dir="ltr"` inside RTL pages; Arabic/Persian numbers use Western digits.
- Non-English texts are AI-written and need native-speaker review before launch.

## Privacy, PWA and delivery

- Fonts and icons are self-hosted (`frontend/public/fonts`, system font stack); do not add third-party requests.
- The service worker (`ngsw-config.json`) must never cache or intercept `/api`.
- The only thing persisted on the device is the chosen language (localStorage, wrapped in try/catch).
- Rate limit: in-memory per-IP sliding window (`backend/app/ratelimit.py`, `RATE_LIMIT_PER_HOUR`); `TRUST_PROXY=1` only behind the bundled nginx.
- nginx access logs stay off.

## Commands

- Backend dev: `cd backend && uvicorn app.main:app --reload`
- Backend tests: `cd backend && pytest`
- Frontend dev: `cd frontend && npm start` (proxies `/api` to `localhost:8000`)
- Frontend tests: `cd frontend && npx ng test --watch=false` (Vitest; Angular 22)
- Full stack: `docker compose up --build` (frontend on :8080, backend on :8000)

## Frontend conventions

- Use Angular standalone components and the current Angular application patterns.
- Use Angular Material for controls and accessible interaction states.
- Keep the primary workflow usable on a small phone screen first.
- Use `input[type=file]` with `capture="environment"` for camera capture, while supporting image/PDF upload.
- Keep multi-page capture state in memory only; allow reorder and delete before submission.
- Default to English, with German, Arabic, Turkish, Ukrainian, Russian, Persian, Spanish, and French available.
- Apply RTL layout for Arabic and Persian, including direction-sensitive result presentation.
- Do not retain letter data or analysis results after the active session.
- Add focused unit tests for upload/capture state, page management, language direction, and result rendering.

## UX and content

- Explain official German terms in plain language without giving legal advice.
- Show urgency, deadlines, amounts, required actions, key terms, and confidence notes as distinct scannable sections.
- Include a short privacy notice before document submission.
- Make uncertainty visible whenever the source is unreadable or Claude reports low confidence.
- Use accessible labels, keyboard support, sufficient contrast, and responsive layouts.

## Dependency policy

- Use only the dependencies explicitly named in the project request unless the user approves an additional dependency first.
- Before installing or adding any unlisted dependency, ask for approval and explain why it is needed.
- Prefer platform APIs and the existing Angular Material/Angular PWA tooling where they cover the requirement.

## Change and validation policy

- Keep changes focused and preserve public interfaces unless the task requires otherwise.
- Add or update tests with behavioral changes.
- Run backend tests and frontend unit tests for affected phases.
- Do not commit secrets, real letters, personal data, or generated credentials.