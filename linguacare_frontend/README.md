# LinguaCare

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**LinguaCare** is an open-source, intelligent health-tech platform designed to bridge language barriers in healthcare and assist in speech-language pathology tracking. By combining advanced digital audio signal processing (DSP) with modern natural language processing (NLP), LinguaCare provides clinicians, speech therapists, and care teams with tools to analyze speech metrics, log patient sessions, and facilitate seamless multilingual interactions.

---

### 🏗️ Architectural Overview (Updated)

LinguaCare utilizes a high-performance **Frontend Interaction Layer** built with React 19 and Tailwind CSS, serving as the bridge between the user and the multi-model backend.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      Intelligent Interaction Layer                     │
│     [React 19 / Vite / Tailwind] ◄──► [Gemini SDK / Agentic API]       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (xAPI Event Stream)
┌───────────────────────────────────▼────────────────────────────────────┐
│                        Automated ETL Pipeline                          │
│                                                                        │
│   [User Trace] ──► xAPI Streaming  ──► [AKT Inference Layer] ──┐       │
│   [Web Source] ──► OpenClaw Crawler ─► [SLM Labeler / Embed] ──┼─┐     │
└─────────────────────────────────────────────────────────────────│─│────┘
                                                                  │ │
                    ┌─────────────────────────────────────────────┘ │
                    ▼                                               ▼
┌───────────────────────┐       ┌───────────────────────┐       ┌───────────────────────┐
│  PostgreSQL/Supabase  │       │     Neo4j Database    │       │     DuckDB/Parquet    │
│  ───────────────────  │       │  ───────────────────  │       │  ───────────────────  │
│  • Administrative DB  │       │  • Prerequisite Graph │       │  • Analytical Log OLAP│
│  • Identity & Auth    │       │  • Mastery Overlay    │       │  • Columnar Aggregates│
│  • Raw Event Store    │       │  • Dynamic Edges      │       │  • Zero-ETL Lakehouse │
└───────────────────────┘       └───────────────────────┘       └───────────────────────┘

```

### Key Subsystems (Expanded)

1. **React 19 Intelligent Frontend**: A modern SPA built with **Vite 6** and **Tailwind CSS v4**. It acts as the primary "Learning OS" interface.

- **Agentic Integration**: Direct integration with Google GenAI SDK for real-time interaction with the reasoning agents.
- **Experience Tracking**: Automatically dispatches xAPI-compliant events (clickstreams, keystrokes, focus metrics) to the backend ETL pipeline during session runtime.
- **Data Visualization**: Uses declarative components to render Neo4j-derived knowledge graphs and DuckDB-processed analytical dashboards for students and tutors.

2. **Automated Event-Driven ETL**: (Existing description) ...
3. **Hybrid Vector-Graph Memory Layer**: (Existing description) ...
4. **Deep Knowledge Tracing Engine**: (Existing description) ...
5. **Local Federated Analytical Warehouse**: (Existing description) ...

---

## 🛠️ System Requirements

Before setting up, ensure your execution environment meets the following specifications. The stack is heavily optimized for consumer hardware utilizing local 4-bit Quantization (`bitsandbytes`) and `Unsloth` acceleration frameworks.

- **Operating System**: Linux (Ubuntu 22.04 LTS recommended) / macOS / Windows 11 (WSL2 mandatory)
- **CPU**: Minimum 8 Cores (Intel Core i5-14700K or equivalent preferred)
- **GPU**: NVIDIA RTX 3050 (or any CUDA-capable GPU with $\ge$ 8GB VRAM)
- **RAM**: 16 GB DDR4/DDR5 system memory minimum
- **Software Containers**: Docker Engine v24.0+ & Docker Compose v2.20+
- **Runtime**: Python 3.11 / 3.12 environment

---

## ✨ Features

- **🎙️ Speech & Audio Signal Analysis:** Real-time processing of vocal signals to evaluate articulation, phonetic accuracy, frequency variations, and tremors.
- **🌐 Translation Engine:** Context-aware, AI-driven translation of students' mixed language stories to handle multi-lingual inputs from students to improve their learning experience.
- **📊 Session Logging & Progress Tracking:** Interactive dashboards for tutors to track student developmental metrics and clinical history over time.
- **Dockerized Architecture:** Highly scalable backend and frontend pipelines ready for containerized deployment.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS v4, Zustand, React-i18next
- **Backend (Core API & ML Sidecar):** Python 3.11+, FastAPI, Uvicorn
- **AI & NLP:** Google Gemini 3.5 Flash API
- **Databases:** SQLite (Relational State), Neo4j (Knowledge Graph)

---

## 🚀 Getting Started (Fullstack Local Deployment)

Follow these instructions to set up a local development environment for testing the fullstack application, including the GenAI LLM API integration.

### Prerequisites

- Node.js (v18.0 or higher)
- Python (v3.11 or higher)
- A valid **Gemini API Key** (from Google AI Studio)

### 1. ML Sidecar Setup (GenAI LLM Integration)

The ML Sidecar is responsible for processing narrative-based stories and communicating with the Gemini API.

```bash
cd ../linguacare_ml_sidecar
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Set up your environment variables by creating a `.env` file in the `linguacare_ml_sidecar` directory:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

Start the ML Sidecar:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Core API Setup (Knowledge Tracing & DB)

The Core API manages the database and knowledge graph.

```bash
cd ../linguacare_core_api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Start the Core API (running on port 8001 to avoid conflicts):
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 3. Frontend Setup

The frontend consumes both the Core API and the ML Sidecar.

```bash
cd ../linguacare_frontend
npm install
```

Start the local development server:
```bash
npm run dev
```

### 4. Testing the Application

1. Open your browser and navigate to `http://localhost:5173`.
2. Use the **Login Simulator** to log in as a **Learner**.
3. Write a short story in English or Vietnamese in the provided text area.
4. Click **Start Story**. The frontend will send the narrative to the ML Sidecar, which will invoke the Gemini LLM.
5. Watch as the AI dynamically polishes the story, extracts CEFR-ranked vocabulary, and generates a personalized practice quiz!

---

## 🌍 Internationalization (i18n) & Theming

- The application fully supports both **English** and **Vietnamese**. You can toggle the language instantly from the navigation header.
- Custom **Theming** (Light, Dark, Pastel) is available globally, persisting independently of the logged-in role.

---

## 🤝 Contributing

Contributions are welcome! Please create a feature branch, commit your changes, and open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
