# Local and Render Setup

Swasthya Sathi now runs without AWS services in the normal app path.

## What The Project Is

Swasthya Sathi is a healthcare support web app:

- Static HTML/CSS/JavaScript frontend in `frontend/`
- Node/Express backend in `backend/`
- JWT auth with bcrypt password hashing
- Lab report parsing plus local OCR through Tesseract/pdf-parse
- Health chat with clinician review workflow
- Medication reminders, notifications, doctors, and consultations

The old deployment used AWS App Runner, DynamoDB, Bedrock, and related setup scripts. The active runtime now uses:

- Local JSON data store at `backend/data/local-db.json` by default
- Ollama-compatible local Llama 3 API for AI
- Express serving both API routes and the frontend

## Run Locally

1. Install dependencies:

```bash
npm install
npm --prefix backend install
```

2. Create `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

On Windows PowerShell:

```powershell
Copy-Item backend\.env.example backend\.env
```

3. (Optional) Start Ollama for AI:

If you have Ollama installed and want full Llama 3 generation:

```bash
ollama pull llama3
ollama serve
```

If Ollama is NOT installed on the device:
No worries! Swasthya Sathi includes a built-in safe offline assistant fallback. The entire app (Auth, Lab OCR, Biomarker Analysis, Medications, Consultations, and Chat) will run out of the box without requiring Ollama.

4. Start the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/health
```

## Render Notes

Render can run this Node app with the included `render.yaml`.

Use these commands if creating the service manually:

```text
Build Command: npm --prefix backend install
Start Command: npm start
```

Set these environment variables on Render:

```text
NODE_ENV=production
JWT_SECRET=<generate a strong secret>
OLLAMA_MODEL=llama3
OLLAMA_BASE_URL=<an Ollama-compatible endpoint Render can reach>
```

Important: `http://127.0.0.1:11434` on Render means the Render container itself, not your laptop. For deployed AI you need either a hosted Ollama-compatible endpoint or a separate service reachable from Render. Without a persistent Render disk, `backend/data/local-db.json` is ephemeral and can reset on deploy/restart.
