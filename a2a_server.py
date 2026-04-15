import os
import json
from google.adk import Agent
from google.adk.a2a.utils.agent_to_a2a import to_a2a
from agent_orchestrator import route_request

def graph_rag_query(query: str) -> str:
    """Query the GraphRAG Multi-Agent Hub.
    
    Args:
        query: The natural language query about products, customers, or brands.
    Returns:
        A JSON string with the agent results and synthesis.
    """
    result = route_request(query)
    return json.dumps(result)

root_agent = Agent(
    name="graphrag_root_agent",
    model="gemini-3-flash-preview",
    instruction="You are the root agent of the GraphRAG Multi-Agent Hub. Route the user query to the appropriate database using the graph_rag_query tool.",
    tools=[graph_rag_query]
)

a2a_app = to_a2a(root_agent, port=8001)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(a2a_app, host="0.0.0.0", port=8001)
