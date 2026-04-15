# GraphRAG Multi-Agent Hub

A unified, multi-agent architecture that routes natural language queries to specialized backend graph databases (Spanner, BigQuery, and Neo4j) to execute GraphRAG pipelines natively.

## 🚀 Overview

The goal of this project is to spin up subagents that demonstrate GraphRAG capability via the `NL Query -> Graph Embedding -> NQL Query` execution loop, all seamlessly managed by a central Vertex AI Orchestrator. 

This repository encapsulates building a modern GraphRAG application leveraging three distinct, robust database architectures under one unified React (Vite) + FastAPI frontend layer:

### 1. Cloud Spanner GraphRAG
- **Use Case:** Large Product Ontologies
- **Functionality:** High-availability HTAP querying using Spanner Graph. Demonstrates Spanner Property Graph execution combined with embeddings.
- **Reference Architecture:** [Gen AI with Spanner Graph](https://docs.cloud.google.com/architecture/gen-ai-graphrag-spanner)
- **Internal Resources:** [go/spanner-graph](http://go/spanner-graph) | [go/spanner-graph-codelab](http://go/spanner-graph-codelab) | [Multimodal Graph RAG Agent Codelab](https://codelabs.developers.google.com/codelabs/survivor-network/instructions)

### 2. BigQuery Native Graph + Vector Search
- **Use Case:** Customer & Risk Ontologies (e.g., Money Laundering / Account Networks)
- **Functionality:** Built entirely within BigQuery utilizing `CREATE PROPERTY GRAPH`. By merging this natively with `AI.EMBED` and vector distance functions, users can run zero-ETL Graph RAG pipelines directly over massive data warehouses synchronized via Vertex AI and LangChain.
- **Internal Demo:** [go/demos/demo/1691](http://go/demos/demo/1691)

### 3. Neo4j + Vertex AI ADK
- **Use Case:** Brand, Campaign, and Influencer Ontologies
- **Functionality:** Through the Agent Development Kit (ADK), this path leverages established patterns for building undirected / directed graph cluster mappings leveraging Vertex AI, Neo4j, and the Model Context Protocol (MCP).
- **Codelab:** [Vertex AI & Neo4j ADK Codelab](https://codelabs.developers.google.com/neo4j-adk-graphrag-agents)

## 🏗️ Architecture Stack

- **Frontend:** React + TypeScript + Vite + TailwindCSS + Framer Motion
- **Backend:** FastAPI (Python 3.11) + LangChain + Vertex AI Orchestrator
- **Databases:** Google Cloud Spanner, Google Cloud BigQuery, Neo4j
- **Deployment:** Serverless deployment via Google Cloud Run

## 💻 Running Locally

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   cd frontend && npm install && npm run build
   ```
2. Start the FastAPI server (which mounts the frontend):
   ```bash
   python -m uvicorn server:app --reload --port 8080
   ```

## ☁️ Deployment

Automatic one-click deployment to Cloud Run is available via the bash scripts:
```bash
# Provision instances and tables
./provision_all_data.sh

# Deploy to Cloud Run
gcloud run deploy graphrag-agents-hub --source .
```
