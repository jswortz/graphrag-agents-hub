import os
from neo4j import GraphDatabase

# You would supply these env vars in a real run against your instance (e.g. AuraDB)
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASS = os.getenv("NEO4J_PASS", "password")

def provision_neo4j():
    print(f"Connecting to Neo4j instance at {NEO4J_URI}...")
    try:
        driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASS))
        # Verify connectivity
        driver.verify_connectivity()
    except Exception as e:
        print(f"Skipping actual insert since {NEO4J_URI} is not responsive: {e}")
        print("Note: In production, configure NEO4J_URI and credentials to run this.")
        return

    # Delete existing nodes to reset
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")
        
        # Insert Brands and Campaigns
        print("Populating Neo4j knowledge graph with Brands...")
        cypher = """
        CREATE (b1:Brand {name: 'TechNova', industry: 'Consumer Electronics'})
        CREATE (c1:Campaign {name: 'Summer Blast', budget: 50000})
        CREATE (i1:Influencer {name: 'TechJane', platform: 'YouTube', followers: 1200000})
        CREATE (b1)-[:RUNS]->(c1)
        CREATE (c1)-[:FEATURES]->(i1)
        CREATE (i1)-[:ENDORSES]->(b1)
        
        CREATE (b2:Brand {name: 'StyleSync', industry: 'Fashion'})
        CREATE (c2:Campaign {name: 'Winter Fashion 2025', budget: 75000})
        CREATE (i2:Influencer {name: 'FashionDave', platform: 'Instagram', followers: 3000000})
        CREATE (b2)-[:RUNS]->(c2)
        CREATE (c2)-[:FEATURES]->(i2)
        CREATE (i2)-[:ENDORSES]->(b2)
        """
        session.run(cypher)
        print("Neo4j data successfully populated.")

    driver.close()

if __name__ == "__main__":
    provision_neo4j()
