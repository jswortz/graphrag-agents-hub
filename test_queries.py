import os
import agent_orchestrator
from data_store import mock_db

def run_tests():
    print("--- Testing RAG Engine Integrations ---")
    
    print("\n🟢 TEST 1: Spanner Graph (Products)")
    res_spanner = agent_orchestrator.route_request("Find high-end laptops")
    print("Query Route:", res_spanner['agent'])
    print("Graph Query Generated:\n", res_spanner['query_generated'])
    print("Results:", res_spanner['results'])
    assert res_spanner['db_name'] == "Spanner Graph"
    assert len(res_spanner['results']) > 0

    print("\n🟢 TEST 2: Neo4j (Brands)")
    res_neo4j = agent_orchestrator.route_request("What campaign is TechNova running?")
    print("Query Route:", res_neo4j['agent'])
    print("Graph Query Generated:\n", res_neo4j['query_generated'])
    print("Results:", res_neo4j['results'])
    assert res_neo4j['db_name'] == "Neo4j"
    assert len(res_neo4j['results']) > 0

    print("\n🟢 TEST 3: BigQuery (Customers)")
    res_bq = agent_orchestrator.route_request("Show customer network for Alice")
    print("Query Route:", res_bq['agent'])
    print("Graph Query Generated:\n", res_bq['query_generated'])
    print("Results:", res_bq['results'])
    assert res_bq['db_name'] == "BigQuery"
    assert len(res_bq['results']) > 0

    print("\n✅ ALL 3 QUERY PATTERNS EXECUTED SUCCESSFULLY.")

if __name__ == "__main__":
    run_tests()
