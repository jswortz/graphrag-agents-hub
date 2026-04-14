import os
import json
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_google_vertexai import VertexAI

# We'll use mocked outputs since we don't have real DBs,
# but we will structure it to demonstrate the ADK pattern.

def setup_llm():
    # Use gemini-v1.5-flash since Vertex AI might require real creds
    # In a real environment, we'd use gemini-3-flash-preview per Memory Bank
    # We'll just define a mock LLM interface if real Vertex fails, or try.
    pass

class MockAgent:
    def __init__(self, name, ontology_desc, query_lang, db_name):
        self.name = name
        self.ontology_desc = ontology_desc
        self.query_lang = query_lang
        self.db_name = db_name

    def process(self, query):
        # Mocks the NL -> Graph Embedding -> NQL/GQL -> Result execution
        graph_query = f"// Mock {self.query_lang} Query for {self.db_name}\n"
        if self.db_name == "Spanner Graph":
            graph_query += f"GRAPH ProductsGraph\nMATCH (p:Product)-[:BELONGS_TO]->(c:Category)\nWHERE p.description LIKE '%{query[-10:]}%'\nRETURN p.name, c.name"
            result_data = [{"p.name": "Mock Product A", "c.name": "Mock Category"}]
        elif self.db_name == "Neo4j":
            graph_query += f"MATCH (b:Brand)-[:RUNS]->(c:Campaign)-[:FEATURES]->(i:Influencer)\nWHERE b.name = 'MockBrand'\nRETURN c.name, i.name"
            result_data = [{"c.name": "Summer Blast", "i.name": "John Doe"}]
        elif self.db_name == "BigQuery":
            graph_query += f"SELECT c.name, a.balance FROM GRAPH_TABLE(CustomerGraph, MATCH (c:Customer)-[:TRANSFERS_TO]->(a:Account))\nWHERE ML.DISTANCE(c.embedding, AI.EMBED('{query}')) < 0.2"
            result_data = [{"c.name": "Alice", "a.balance": 1500.00}]

        response = f"**{self.name}** processed your request.\n\n"
        response += f"**Ontology Context:** {self.ontology_desc[:50]}...\n\n"
        response += f"**Generated {self.query_lang}:**\n```sql\n{graph_query}\n```\n\n"
        response += f"**Mock Execution Results:**\n```json\n{json.dumps(result_data, indent=2)}\n```\n\n"
        response += f"**Final Synthesis:** Based on {self.db_name}, we found related items matching your query using {self.query_lang}."
        
        return {
            "agent": self.name,
            "query_generated": graph_query,
            "results": result_data,
            "synthesis": response
        }

# Subagents
spanner_agent = MockAgent(
    name="Spanner Products Agent",
    ontology_desc="Nodes: Products, Categories, Suppliers. Edges: BELONGS_TO, SUPPLIED_BY.",
    query_lang="Spanner GQL",
    db_name="Spanner Graph"
)

neo4j_agent = MockAgent(
    name="Neo4j Brand Agent",
    ontology_desc="Nodes: Brand, Campaign, Influencer. Edges: RUNS, FEATURES.",
    query_lang="Cypher",
    db_name="Neo4j"
)

bigquery_agent = MockAgent(
    name="BigQuery Customer Agent",
    ontology_desc="Nodes: Customer, Account. Edges: TRANSFERS_TO. Uses CREATE PROPERTY GRAPH and vector search.",
    query_lang="BigQuery SQL (Graph_Table)",
    db_name="BigQuery"
)

def route_request(query: str):
    q = query.lower()
    if "product" in q or "supplier" in q or "spanner" in q:
        return spanner_agent.process(query)
    elif "brand" in q or "campaign" in q or "influencer" in q or "neo4j" in q:
        return neo4j_agent.process(query)
    elif "customer" in q or "account" in q or "money" in q or "bigquery" in q:
        return bigquery_agent.process(query)
    else:
        # fallback demo all
        a1 = spanner_agent.process(query)
        a2 = neo4j_agent.process(query)
        res = "No specific routing matched. Delegating to all agents:\n\n"
        return {
            "agent": "Orchestrator",
            "query_generated": a1['query_generated'] + "\n\n" + a2['query_generated'],
            "results": a1['results'] + a2['results'],
            "synthesis": a1['synthesis'] + "\n\n" + a2['synthesis']
        }
