# 🤖 GraphRAG Multi-Agent Hub

A sophisticated, multi-agent architecture that routes natural language (NL) queries to specialized backend graph databases (Cloud Spanner, BigQuery, and Neo4j) to execute **GraphRAG** pipelines natively.

## 🚀 Overview

The **GraphRAG Multi-Agent Hub** is designed to demonstrate advanced retrieval patterns using the `NL Query -> Graph Embedding -> NQL Query` execution loop. It seamlessly orchestrates multiple subagents, each optimized for a specific domain and database technology, all managed by a central **Vertex AI Orchestrator**.

### Key Features
- **Multi-Agent Orchestration:** Intelligently routes queries to the most relevant domain expert agent.
- **Tabbed Interface:** A modern UI with dedicated tabs for **Chat**, **Architecture**, and **Project Documentation**.
- **Interactive Architecture:** Dynamic visualization of the system architecture that highlights active data paths during query execution.
- **Unified GraphRAG:** Combines semantic vector search with structural graph traversals.

## 🧠 GraphRAG Methodology: Embeddings vs. Traversal

This project implements a two-stage retrieval strategy to maximize relevance and accuracy:

1.  **Stage 1: Graph Embeddings (Semantic Search)**
    - **Purpose:** Find the entry point or "seed" nodes based on conceptual meaning.
    - **Mechanism:** The NL query is converted into a vector via **Vertex AI (text-embedding-004)**. The database uses native vector search (e.g., `ML.DISTANCE` in Spanner or `VECTOR_SEARCH` in BigQuery) to identify nodes with high semantic similarity.
2.  **Stage 2: Graph Traversal (Structural Logic)**
    - **Purpose:** Explore relationships and discover hidden connections from the seed nodes.
    - **Mechanism:** Using Graph Query Languages (GQL for Spanner, SQL+Graph for BigQuery, Cypher for Neo4j), the agents traverse multi-hop relationships to identify clusters, risk networks, or product hierarchies.

## 📊 Technology & Pattern Matrix

| Pattern | Database | Color Code | Language | Embedding Integration |
| :--- | :--- | :--- | :--- | :--- |
| **E-Commerce** | <font color="#3b82f6">Cloud Spanner</font> | **Blue** | GQL (ISO standard) | `ML.DISTANCE` |
| **FSI & Risk** | <font color="#22c55e">BigQuery</font> | **Green** | SQL + Property Graph | `VECTOR_SEARCH` |
| **Marketing** | <font color="#f97316">Neo4j</font> | **Orange** | Cypher | Neo4j Vector Index |

## 🏗️ Architecture Stack

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS + Framer Motion.
- **Backend:** FastAPI (Python 3.13+) + LangChain + Vertex AI Orchestrator.
- **Databases:** Google Cloud Spanner (Graph), BigQuery (Property Graph), Neo4j.
- **Orchestration:** Custom routing logic in `agent_orchestrator.py` leveraging Vertex AI.

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
