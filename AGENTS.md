# 🛠️ Specialized GraphRAG Agents

This document provides a detailed breakdown of the specialized agents operating within the **GraphRAG Multi-Agent Hub**. Each agent is optimized for a specific domain, leveraging unique database capabilities to execute the `NL -> Graph -> Synthesis` loop.

---

## 🏗️ Central Orchestrator
- **Logic:** Located in `agent_orchestrator.py`.
- **Role:** Analyzes the user's Natural Language query using keyword-based intent parsing (upgradable to LLM-based routing) and delegates the task to the appropriate specialized worker agent.

---

## 🛠️ Worker Agents

### 1. Spanner Products Agent (`LiveSpannerAgent`)
- **Domain:** E-Commerce, Logistics, and Product Catalogs.
- **Database:** Google Cloud Spanner (Graph).
- **Implementation Highlights:**
  - **Query Language:** Uses ISO-standard **GQL** via the `GRAPH` keyword.
  - **Pattern:** `GRAPH ProductsGraph MATCH (p:Product)-[:BELONGS_TO]->(c:Category)`.
  - **Hybrid Search:** Combines structural traversal with semantic filtering. In production, this utilizes `ML.DISTANCE` with Vertex AI embeddings registered in the database.
  - **Use Case:** "Find high-end laptops in the electronics category."

### 2. BigQuery Customer Agent (`LiveBigQueryAgent`)
- **Domain:** Financial Services (FSI), Customer Risk, and Anti-Money Laundering (AML).
- **Database:** Google Cloud BigQuery (Property Graph).
- **Implementation Highlights:**
  - **Query Language:** Uses SQL with the `GRAPH_TABLE` operator.
  - **Pattern:** `SELECT * FROM GRAPH_TABLE(CustomerGraph MATCH (a1:Accounts)-[t:TransfersTo]->(a2:Accounts) ...)`.
  - **Hybrid Search:** Leverages BigQuery's native `VECTOR_SEARCH` to find suspicious actors before traversing their transaction networks.
  - **Use Case:** "Identify accounts associated with large money transfers and their downstream connections."

### 3. Neo4j Brand Agent (`LiveNeo4jAgent`)
- **Domain:** Marketing, Influencer Clusters, and Campaign Tracking.
- **Database:** Neo4j.
- **Implementation Highlights:**
  - **Query Language:** **Cypher**.
  - **Pattern:** `MATCH (b:Brand)-[:RUNS]->(c:Campaign)-[:FEATURES]->(i:Influencer)`.
  - **Hybrid Search:** Utilizes Neo4j Vector Indexes to find influencers with specific content styles (e.g., "tech enthusiasts") and maps them to brand campaigns.
  - **Integration:** Uses the official `neo4j` Python driver and follows Agent Development Kit (ADK) patterns.
  - **Use Case:** "Which influencers are associated with TechNova's summer marketing campaigns?"

---

## 🔄 Agent Standard Output
Every agent must return a structured response to ensure frontend compatibility:
- `agent`: The name of the agent.
- `db_name`: Used by the UI for node highlighting.
- `query_generated`: The raw graph query for transparency.
- `results`: The raw data tuples returned from the database.
- `synthesis`: A human-readable summary of the data.
