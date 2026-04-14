import streamlit as st
import agent_orchestrator

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
            background-color: #FFF9E6; /* Light yellow paperbanana feel */
            background-image: radial-gradient(#F0E6D2 1px, transparent 1px);
            background-size: 20px 20px;
        }

        h1, h2, h3 {
            font-family: 'Space Mono', monospace;
            font-weight: 700;
            color: #FF5A5F; /* Coral red accents */
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
            transition: all 0.2s ease;
        }

        .stButton>button:hover {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0px #1a1a1a;
        }
        
        .stButton>button:active {
            transform: translate(2px, 2px);
            box-shadow: 0px 0px 0px #1a1a1a;
        }

        .stTextInput>div>div>input {
            border: 3px solid #1a1a1a;
            border-radius: 8px;
            box-shadow: 4px 4px 0px #1a1a1a;
            padding: 10px;
            font-family: 'Space Mono', monospace;
        }
        
        .stChatMessage {
            border: 3px solid #1a1a1a;
            border-radius: 12px;
            box-shadow: 4px 4px 0px #1a1a1a;
            margin-bottom: 1rem;
            background-color: #FFFFFF;
        }
        
        .stMarkdown code {
            background-color: #E6F3FF;
            color: #0066CC;
            border: 2px solid #0066CC;
            border-radius: 4px;
            padding: 2px 6px;
        }
        
        </style>
        """,
        unsafe_allow_html=True
    )

def main():
    apply_paperbanana_styles()
    
    st.title("🍌 GraphRAG Multi-Agent Hub")
    st.markdown("### NL Query -> Graph Embedding -> NQL/GQL Execution")
    
    st.markdown("""
    **Ontologies Hosted:**
    * **Spanner (Products)** - `Nodes: Product, Category` | `Edges: BELONGS_TO`
    * **Neo4j (Brands)** - `Nodes: Brand, Campaign` | `Edges: RUNS, FEATURES`
    * **BigQuery (Customers)** - `Nodes: Customer, Account` | `Edges: TRANSFERS_TO` (w/ Vector Search)
    """)

    if "messages" not in st.session_state:
        st.session_state.messages = []

    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    if prompt := st.chat_input("Query the GraphRAG System... (e.g., 'Find products similar to X', 'Show campaigns for brand Y')"):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            with st.spinner("Routing task to appropriate subagent..."):
                response_data = agent_orchestrator.route_request(prompt)
                
                st.markdown(response_data["synthesis"])
                st.session_state.messages.append({"role": "assistant", "content": response_data["synthesis"]})

if __name__ == "__main__":
    main()
