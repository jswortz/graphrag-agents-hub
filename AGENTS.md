# GraphRAG Subagent Architecture

This document outlines the specialized subagents operating under the Vertex AI Multi-Agent Orchestrator. The orchestrator intercepts the Natural Language (NL) query, identifies the domain intent, and routes it to the corresponding subagent to complete the `NL Query -> Graph Embedding -> NQL Query` execution loop.

## 🧠 Central Orchestrator (Vertex AI)
- **Role:** Intent routing and orchestration.
- **Mechanism:** Analyzes the prompt against agent descriptions and strictly delegates to the correct backend specialized graph agent. Synchronizes the UI animation state and formats the final synthesis.

---

## 🛠️ Specialized Agents

### 1. Spanner Products Agent (`LiveSpannerAgent`)
- **Domain:** E-Commerce, Logistics, and Product Catalogs.
- **Tech Stack:** Google Cloud Spanner (Property Graph).
- **GraphRAG Loop:** 
  - Translates product discovery questions into Spanner GQL.
  - Employs Spanner Property Graph traversal (e.g. `MATCH (p:Product)-[:BELONGS_TO]->(c:Category)`).
  - *Advanced Pattern:* Combines graph traversal with `ML.DISTANCE` using registered Vertex AI embeddings directly inside the database query to find semantically similar products.

### 2. BigQuery Customer Agent (`LiveBigQueryAgent`)
- **Domain:** Financial Services (FSI), Customer Risk, Anti-Money Laundering.
- **Tech Stack:** BigQuery Native Graph (`CREATE PROPERTY GRAPH`) + `AI.EMBED`.
- **GraphRAG Loop:**
  - Routes financial tracking questions (e.g., transfers, suspicious account networks) to BigQuery SQL.
  - Utilizes zero-ETL querying via native BigQuery Graph capabilities (e.g. `MATCH (c:Customers)-[t:TransfersTo]->(a:Accounts)`).
  - Designed to leverage native BigQuery vector search on billions of rows without moving data.

### 3. Neo4j Brand Agent (`LiveNeo4jAgent`)
- **Domain:** Marketing, Influencer Clusters, Campaign Tracking.
- **Tech Stack:** Neo4j Database + Cypher + Model Context Protocol (MCP) via ADK.
- **GraphRAG Loop:**
  - Converts brand-mapping and influencer relationship queries into Cypher NQL queries.
  - Leverages deep, native Neo4j graph algorithms and patterns established through the Agent Development Kit (ADK).
  - Executed via standard `neo4j.GraphDatabase.driver` bindings.
