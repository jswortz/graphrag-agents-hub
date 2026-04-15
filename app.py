import streamlit as st
import agent_orchestrator
import matplotlib.pyplot as plt
import networkx as nx
import pandas as pd

st.set_page_config(page_title="GraphRAG Multi-Agent Hub", layout="wide")

def apply_paperbanana_styles():
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Work+Sans:wght@400;600;800&display=swap');

        html, body, [class*="css"]  {
            font-family: 'Work Sans', sans-serif;
            background-color: #FAFAFA;
            color: #1a1a1a;
        }

        .stApp {
            background-color: #FFF9E6;
            background-image: radial-gradient(#F0E6D2 1px, transparent 1px);
            background-size: 20px 20px;
        }

        h1, h2, h3 {
            font-family: 'Space Mono', monospace;
            font-weight: 700;
            color: #FF5A5F; 
            text-shadow: 2px 2px 0px #F9A826;
        }

        .stButton>button {
            background-color: #F9A826;
            color: #1a1a1a;
            border: 3px solid #1a1a1a;
            border-radius: 8px;
            box-shadow: 4px 4px 0px #1a1a1a;
            font-family: 'Space Mono', monospace;
            font-weight: bold;
        }
        
        .stChatMessage {
            border: 3px solid #1a1a1a;
            border-radius: 12px;
            box-shadow: 4px 4px 0px #1a1a1a;
            margin-bottom: 1rem;
            background-color: #FFFFFF;
        }
        </style>
        """,
        unsafe_allow_html=True
    )

def main():
    apply_paperbanana_styles()
    
    st.title("🍌 GraphRAG Multi-Agent Hub")
    
    # ---------------------------------------------------------
    # NEW ARCHITECTURE DOCUMENTATION & VISUALIZATION
    # ---------------------------------------------------------
    with st.expander("📚 View System Architecture & Documentation", expanded=True):
        col_img, col_text = st.columns([1, 1.2])
        
        with col_img:
            st.image(
                "architecture_diagram.png", 
                caption="Multi-Agent Orchestration & Enterprise Data Topologies",
                use_container_width=True
            )
            
        with col_text:
            st.markdown("""
            ### Use Case Matrix
            
            Our multi-agent reasoning system dynamically routes user questions to specific backend architectures based on graph domain suitability:
            
            1. **Google Cloud Spanner Graph ➔ E-Commerce & Logistics** 
               * **Why:** Horizontally scalable HTAP for operational data.
               * **Use Case:** "Products & Suppliers". Discovering product similarities (`ML.DISTANCE`) combined with exact relational joins for categories and highly available inventory tracking.
            
            2. **Native BigQuery (Property Graph + Vector Search) ➔ FSI & Risk**
               * **Why:** Serverless zero-ETL data warehouse petabyte-scale analytics.
               * **Use Case:** "Customer Anti-Money Laundering (AML)". Uncovering multi-hop financial transfers and identifying concentrated risk networks natively where the transactional data already lives.
            
            3. **Neo4j + LangChain ADK ➔ Marketing & Network Theory**
               * **Why:** Exceptional depth for complex undirected networks and rich topological algorithms.
               * **Use Case:** "Brands & Influencers". Determining target demographic overlap, campaign resonance, and identifying key opinion leader clusters mapping endorsements.
            """)
    
    st.divider()

    st.markdown("### NL Query -> Graph Embedding -> Live API Execution")

    if "messages" not in st.session_state:
        st.session_state.messages = []

    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    if prompt := st.chat_input("Query the Live RAG System... (e.g., 'Find products similar to X', 'Show campaigns for brand Y')"):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            with st.spinner("Routing task to live subagent API..."):
                # Call live orchestrator
                response_data = agent_orchestrator.route_request(prompt)
                
                st.markdown(response_data["synthesis"])
                if response_data.get("results"):
                    st.dataframe(pd.DataFrame(response_data["results"]), use_container_width=True)
                
                st.session_state.messages.append({
                    "role": "assistant", 
                    "content": response_data["synthesis"],
                    "results": response_data.get("results")
                })

if __name__ == "__main__":
    main()
