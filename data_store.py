import networkx as nx
import numpy as np

def generate_embeddings(text, dim=128):
    # Mock embedding by hashing text to a deterministic unit vector
    np.random.seed(abs(hash(text)) % (2**32))
    vec = np.random.randn(dim)
    return vec / np.linalg.norm(vec)

class MockDatastores:
    def __init__(self):
        # 1. Spanner Graph Mock (Products)
        self.spanner_graph = nx.DiGraph()
        
        # Populate Products
        products = [
            ("P1", "Alpha Laptop", "High-end laptop for professionals", "C1", "S1"),
            ("P2", "Beta Laptop", "Premium laptop with great battery", "C1", "S2"),
            ("P3", "Gamma Phone", "Smartphone with excellent camera", "C2", "S1"),
            ("P4", "Delta Earbuds", "Wireless noise-cancelling earbuds", "C3", "S3")
        ]
        
        for p_id, p_name, p_desc, c_id, s_id in products:
            emb = generate_embeddings(p_name + " " + p_desc)
            self.spanner_graph.add_node(p_id, type="Product", name=p_name, description=p_desc, embedding=emb)
            self.spanner_graph.add_node(c_id, type="Category", name=f"Category {c_id}")
            self.spanner_graph.add_node(s_id, type="Supplier", name=f"Supplier {s_id}")
            self.spanner_graph.add_edge(p_id, c_id, relationship="BELONGS_TO")
            self.spanner_graph.add_edge(p_id, s_id, relationship="SUPPLIED_BY")

        # 2. Neo4j Mock (Brands)
        self.neo4j_graph = nx.DiGraph()
        brands = [
            ("B1", "TechNova", "Summer Blast Campaign", "I1", "TechJane"),
            ("B2", "StyleSync", "Winter Fashion 2025", "I2", "FashionDave"),
        ]
        
        for b_id, b_name, camp_name, i_id, i_name in brands:
            self.neo4j_graph.add_node(b_id, type="Brand", name=b_name)
            camp_id = f"C_{b_name}"
            self.neo4j_graph.add_node(camp_id, type="Campaign", name=camp_name)
            self.neo4j_graph.add_node(i_id, type="Influencer", name=i_name)
            self.neo4j_graph.add_edge(b_id, camp_id, relationship="RUNS")
            self.neo4j_graph.add_edge(camp_id, i_id, relationship="FEATURES")
            self.neo4j_graph.add_edge(i_id, b_id, relationship="ENDORSES")

        # 3. BigQuery Customer Mock
        self.bq_graph = nx.DiGraph()
        customers = [
            ("U1", "Alice", 1500.0),
            ("U2", "Bob", 300.0),
            ("U3", "Charlie", 12000.0) # High risk
        ]
        
        for u_id, name, balance in customers:
            emb = generate_embeddings(name)
            self.bq_graph.add_node(u_id, type="Customer", name=name, embedding=emb)
            acc_id = f"A_{u_id}"
            self.bq_graph.add_node(acc_id, type="Account", balance=balance)
            self.bq_graph.add_edge(u_id, acc_id, relationship="OWNS")

        # Add some transactions
        self.bq_graph.add_edge("A_U1", "A_U3", relationship="TRANSFERS_TO", amount=500)
        self.bq_graph.add_edge("A_U2", "A_U3", relationship="TRANSFERS_TO", amount=150)

    def query_spanner(self, text_query):
        query_emb = generate_embeddings(text_query)
        results = []
        for node, data in self.spanner_graph.nodes(data=True):
            if data.get("type") == "Product":
                dist = np.dot(query_emb, data["embedding"]) # Cosine sim since normalized
                if dist > 0.0: # lenient for mock
                    # Find category
                    category = [n for n in self.spanner_graph.successors(node) if self.spanner_graph.nodes[n].get("type") == "Category"]
                    c_name = self.spanner_graph.nodes[category[0]]["name"] if category else "Unknown"
                    results.append({"score": float(dist), "name": data["name"], "category": c_name})
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:3]

    def query_neo4j(self, brand_name):
        results = []
        for node, data in self.neo4j_graph.nodes(data=True):
            if data.get("type") == "Brand" and brand_name.lower() in data.get("name", "").lower():
                campaigns = [n for n in self.neo4j_graph.successors(node) if self.neo4j_graph.nodes[n].get("type") == "Campaign"]
                for c in campaigns:
                    influencers = [n for n in self.neo4j_graph.successors(c) if self.neo4j_graph.nodes[n].get("type") == "Influencer"]
                    c_name = self.neo4j_graph.nodes[c]["name"]
                    i_names = [self.neo4j_graph.nodes[i]["name"] for i in influencers]
                    results.append({"brand": data["name"], "campaign": c_name, "influencers": ", ".join(i_names)})
        return results

    def query_bigquery(self, query):
        q_emb = generate_embeddings(query)
        results = []
        for node, data in self.bq_graph.nodes(data=True):
            if data.get("type") == "Customer":
                dist = np.dot(q_emb, data["embedding"])
                
                # Get accounts
                accounts = [n for n in self.bq_graph.successors(node) if self.bq_graph.nodes[n].get("type") == "Account"]
                for acc in accounts:
                    bal = self.bq_graph.nodes[acc].get("balance")
                    # Check transfers
                    transfers_out = [n for n in self.bq_graph.successors(acc)]
                    results.append({"score": float(dist), "customer": data["name"], "balance": bal, "transfers_out": len(transfers_out)})
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:3]

mock_db = MockDatastores()
