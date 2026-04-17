# NeuralRAG: Multimodal Agentic RAG

![Agentic RAG](https://img.shields.io/badge/Agentic%20Loop-Supported-success)
![Multimodal](https://img.shields.io/badge/Multimodal-PDF%20%7C%20Image%20%7C%20Audio-blue)
![Local LLMs](https://img.shields.io/badge/Ollama-Offline%20Privacy-orange)

A completely offline, fully private **Multimodal Retrieval-Augmented Generation** system designed to turn your heterogeneous data (Text, Images, Audio) into an intelligent, queryable AI companion natively without ever communicating with a cloud API.

Unlike standard RAG pipelines, this system operates on an **Agentic Loop**. The Large Language Model autonomously evaluates its needs and repeatedly calls internal tools (chunk search, optical character recognition, transcript indexing) as many times as necessary to thoroughly answer the user's prompt. 

## ⚙️ Core Architectures & Technologies

* **Vector Knowledge Engine:** FAISS paired with HuggingFace Sentence Transformers (`all-MiniLM-L6-v2`) on CPU threads.
* **Brain / Reasoning Engine:** Ollama (Llama 3.2: 3B) heavily accelerated through GPU mappings.
* **API Backend:** Python FastAPI acting as an asynchronous broker and agent executor.
* **Modern Interface:** React, Vite, and TailwindCSS orchestrating a premium Glassmorphism aesthetic.
* **Parsers:** PyMuPDF (Documents), PyTesseract (Images / OCR), OpenAI Whisper (Audio Encoding).

---

## 🚀 Quickstart & Installation

The entire micro-architecture is orchestrated and contained securely with Docker Compose.

### Prerequisites
- Docker Engine & Docker Compose installed.
- NVIDIA Container Toolkit initialized (required for accelerating Ollama).

### Running Locally
Navigate to the root directory and boot up the orchestrated environment:
```bash
docker compose up --build -d
```
*Note: Booting up the very first time will take a few minutes as the containers securely download the necessary local LLaMA models, Whisper binaries, and SentenceTransformer assets to run your environment completely offline!*

### Endpoints
Once the containers are successfully launched, access the modules here:
- **Web User Interface (Chat):** http://localhost:3000
- **Internal API Backend:** http://localhost:8000
- **Ollama Proxy Node:** http://localhost:11434

---

## 🛠️ Usage

1. **Upload Documents:** Use the left UI panel to seamlessly upload documents. 
2. **Knowledge Base Chunking:** The FastAPI Backend instantly slices texts into 400-word blocks.
3. **Question Formulation:** Ask complex, iterative questions! The Copilot recognizes gaps using its agent-reasoning loop and actively queries the FAISS database recursively up to 7 times.
4. **Tool Visualizations:** Observe the real-time background "thought-process" in the interface as it traces down resources!
