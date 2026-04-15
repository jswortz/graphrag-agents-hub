import os
import sys
import agent_orchestrator

def run_coverage_report():
    print("🚀 STARTING GRAPHRAG COVERAGE RUN...")
    failures = []

    # --- TEST 1: SPANNER ---
    print("\n🔍 Path 1: Spanner Graph (Product Catalog)")
    try:
        res = agent_orchestrator.route_request("Find high-end laptops")
        query = res['query_generated']
        print(f"Agent: {res['agent']}")
        
        # Verify Vector Function Usage
        if "ML.DISTANCE" not in query:
            failures.append("Spanner path failed to use ML.DISTANCE vector function.")
        
        if not res['results']:
            failures.append("Spanner path returned no results.")
            
        print("✅ Spanner coverage pass.")
    except Exception as e:
        failures.append(f"Spanner path exception: {str(e)}")

    # --- TEST 2: BIGQUERY ---
    print("\n🔍 Path 2: BigQuery Graph (Customer FSI)")
    try:
        res = agent_orchestrator.route_request("Show customer network for money laundering analysis")
        query = res['query_generated']
        print(f"Agent: {res['agent']}")
        
        # Verify Vector Function Usage
        if "VECTOR_SEARCH" not in query:
            failures.append("BigQuery path failed to use VECTOR_SEARCH vector function.")
        
        if not res['results']:
            failures.append("BigQuery path returned no results.")
            
        print("✅ BigQuery coverage pass.")
    except Exception as e:
        failures.append(f"BigQuery path exception: {str(e)}")

    # --- TEST 3: NEO4J ---
    print("\n🔍 Path 3: Neo4j Graph (Brand Marketing)")
    try:
        res = agent_orchestrator.route_request("Which influencers are best for a tech campaign?")
        query = res['query_generated']
        print(f"Agent: {res['agent']}")
        
        # Verify Vector Function Usage
        if "db.index.vector.queryNodes" not in query:
            failures.append("Neo4j path failed to use vector index query function.")
        
        if not res['results']:
            failures.append("Neo4j path returned no results.")
            
        print("✅ Neo4j coverage pass.")
    except Exception as e:
        failures.append(f"Neo4j path exception: {str(e)}")

    # --- SUMMARY ---
    print("\n" + "="*50)
    if failures:
        print("❌ CRITICAL: Coverage Failure")
        for f in failures:
            print(f"  - {f}")
        print("="*50)
        sys.exit(1)
    else:
        print("🎉 ALL GRAPHRAG PATHS VERIFIED WITH NATIVE VECTOR SEARCH!")
        print("="*50)
        sys.exit(0)

if __name__ == "__main__":
    run_coverage_report()
