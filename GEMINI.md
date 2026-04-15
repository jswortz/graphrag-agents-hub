# 🧠 Gemini Developer Guide: GraphRAG Multi-Agent Hub

Welcome to the **GraphRAG Multi-Agent Hub**. This document serves as the primary technical reference for AI agents and developers working on this codebase. It provides the architectural context and implementation standards required to maintain and extend the system.

## 🏗️ Architectural Overview

The project is built on a **Supervisor-Worker** pattern. A central orchestrator (`agent_orchestrator.py`) acts as the supervisor, parsing intent and delegating execution to specialized database agents.

### The GraphRAG Execution Loop
1.  **Intent Parsing:** Extract entities (e.g., brand name, product category) and domain (e.g., FSI, E-Commerce).
2.  **Routing:** Map domain to the correct `LiveAgent`.
3.  **Query Synthesis:** Generate the appropriate Graph Query Language (GQL, SQL, or Cypher).
4.  **Vector Integration:** Inject vector search parameters into the graph query for a hybrid semantic-structural retrieval.
5.  **Synthesis:** Combine graph results into a natural language response.

## 🧠 GraphRAG Methodology: The Two-Stage Retrieval

This project implements a high-fidelity GraphRAG pipeline that bridges the gap between unstructured semantic search and structured relational logic.

### Stage 1: Semantic "Seed" Discovery (Embeddings)
- **Role:** Entry Point Identification.
- **Mechanism:** 
    - The Natural Language query is converted into a high-dimensional vector using **Vertex AI (text-embedding-004)**.
    - **Vector Search:** We use native database vector operations (`ML.DISTANCE` in Spanner, `VECTOR_SEARCH` in BigQuery) to find the most relevant nodes.
    - **Outcome:** This provides the "seeds"—the nodes in the graph that are conceptually closest to the user's intent, even if the exact keywords don't match.

### Stage 2: Structural Network Traversal (GQL/SQL/Cypher)
- **Role:** Context Expansion & Relationship Discovery.
- **Mechanism:**
    - From the seed nodes identified in Stage 1, the system executes **Multi-hop Graph Queries**.
    - It traverses defined edges (e.g., `BELONGS_TO`, `TRANSFERS_TO`, `RUNS_CAMPAIGN`) to gather related entities, metadata, and structural context.
    - **Outcome:** A rich, graph-augmented context that includes not just the matching items, but their operational and relational environment.

## 📊 Domain-Database Mapping

| Domain | Agent | Database | Key Technology |
| :--- | :--- | :--- | :--- |
| **E-Commerce** | `LiveSpannerAgent` | Cloud Spanner | ISO GQL + `ML.DISTANCE` |
| **FSI & Risk** | `LiveBigQueryAgent` | BigQuery | `CREATE PROPERTY GRAPH` + `VECTOR_SEARCH` |
| **Marketing** | `LiveNeo4jAgent` | Neo4j | Neo4j Cypher + ADK Patterns |

## 🛠️ Implementation Standards

### 1. Agent Design
All specialized agents MUST implement a `process(query: str)` method that returns a standard payload:
```json
{
  "agent": "Agent Name",
  "db_name": "Database Type",
  "query_generated": "The raw GQL/Cypher/SQL query",
  "results": [],
  "synthesis": "Natural language summary of findings"
}
```

### 2. Mocking & Local Dev
- Use `data_store.py` for local testing. It provides a `NetworkX` graph fallback that mimics the live database behavior.
- Ensure all live agents have robust exception handling to fall back to mock data or descriptive error messages for UI transparency.

### 3. Frontend Integration
- The frontend expects `db_name` to be one of: `["Spanner Graph", "BigQuery", "Neo4j"]`.
- The `ArchitectureDiagram.tsx` uses these keys to trigger animations and highlight active nodes.

## 📂 Project Structure

- `agent_orchestrator.py`: The "brain" of the system. Handle all routing logic here.
- `server.py`: FastAPI backend that serves the React frontend and handles API requests.
- `deployment_scripts/`: Python scripts for automated database provisioning.
- `frontend/src/`: React source code including `App.tsx` (Chat) and `ArchitectureDiagram.tsx`.

## 📝 Coding Conventions
- **Python:** Use `uv` for dependency management. Target Python 3.13+.
- **Frontend:** Use TailwindCSS for styling and Framer Motion for animations.
- **Documentation:** Keep `AGENTS.md` updated whenever a new domain or database integration is added.
