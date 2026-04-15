# 🤖 GraphRAG Multi-Agent Hub

A sophisticated, multi-agent architecture that routes natural language (NL) queries to specialized backend graph databases (Cloud Spanner, BigQuery, and Neo4j) to execute **GraphRAG** pipelines natively.

## 🚀 Overview

The **GraphRAG Multi-Agent Hub** is designed to demonstrate advanced retrieval patterns using the `NL Query -> Graph Embedding -> NQL Query` execution loop. It seamlessly orchestrates multiple subagents, each optimized for a specific domain and database technology, all managed by a central **Vertex AI Orchestrator**.

### Key Features
- **Multi-Agent Orchestration:** Intelligently routes queries to the most relevant domain expert agent.
- **Tabbed Interface:** A modern UI with dedicated tabs for **Chat**, **Architecture**, and **Project Documentation**.
- **Interactive Architecture:** Dynamic visualization of the system architecture that highlights active data paths during query execution.
- **Unified GraphRAG:** Combines semantic vector search with structural graph traversals.

## 🧠 GraphRAG Methodology: Semantic vs. Structural

This project implements a sophisticated two-stage retrieval strategy to maximize relevance and accuracy:

1.  **Stage 1: Semantic RAG (Node Discovery)**
    - **Purpose:** Use Vertex AI Embeddings for semantic node discovery.
    - **Mechanism:** The NL query is converted into a vector via **Vertex AI (text-embedding-004)**. The database uses native vector search to identify "seed" nodes with high semantic similarity.
2.  **Stage 2: Generative Graph Queries (Topology Discovery)**
    - **Purpose:** Use native graph query languages for structural topology discovery.
    - **Mechanism:** Using Graph Query Languages (GQL, SQL+Graph, or Cypher), the agents traverse multi-hop relationships to identify clusters, risk networks, or product hierarchies from the seed nodes.

## 📊 Technical Matrix

| Domain | Database | Query Language | Vector Integration (Stage 1 RAG) |
| :--- | :--- | :--- | :--- |
| **E-Commerce** | Cloud Spanner | GQL | ML.DISTANCE |
| **FSI & Risk** | BigQuery | SQL + Graph | VECTOR_SEARCH |
| **Marketing** | Neo4j | Cypher | Vector Index |

## 🧪 Verification & Coverage

The system includes automated **coverage runs** in the startup sequence. These runs execute a battery of predefined queries against every major GraphRAG path (Spanner, BigQuery, and Neo4j) to verify connectivity, query synthesis, and data integrity before the orchestrator accepts traffic.

## ⚡ Quick Start (One-Liner)

Run this command to install dependencies, build the frontend, and deploy to Cloud Run automatically:
```bash
uv sync && cd frontend && npm install && npm run build && cd .. && ./deploy.sh
```

## 💻 Running Locally

1. **Install Dependencies:**
   ```bash
   uv sync
   cd frontend && npm install && npm run build
   ```
2. **Start the FastAPI Server:**
   ```bash
   python -m uvicorn server:app --reload --port 8080
   ```
3. **Access the Hub:** Open `http://localhost:8080` in your browser.

## ☁️ Deployment

The project is optimized for deployment on **Google Cloud Run**.

```bash
# Provision all databases and data
./provision_all_data.sh

# Deploy the orchestrator hub
gcloud run deploy graphrag-agents-hub --source .
```

## 📝 Documentation
- [AGENTS.md](AGENTS.md) - Deep dive into specialized agent roles.
- [GEMINI.md](GEMINI.md) - Technical guide for AI agents working in this repo.
