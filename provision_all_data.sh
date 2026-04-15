#!/bin/bash

echo "🍌 Starting GraphRAG Cloud Provisioning Process 🍌"
echo "Target Project: wortz-project-352116"

# Ensure gcloud identity
gcloud config set project wortz-project-352116 || true
uv pip install -r requirements.txt || true

echo "\n--- 1. Provisioning Spanner Instance and Database ---"
uv run python deployment_scripts/provision_spanner.py

echo "\n--- 2. Provisioning BigQuery Dataset and Property Graph ---"
uv run python deployment_scripts/provision_bigquery.py

echo "\n--- 3. Provisioning Neo4j Graph ---"
uv run python deployment_scripts/provision_neo4j.py

echo "\n✅ All persistent datastores fully populated via live connections!"

echo "\n--- 4. Executing GraphRAG Coverage Runs ---"
uv run python test_queries.py

if [ $? -eq 0 ]; then
    echo "\n🏆 PROVISIONING & COVERAGE SUCCESSFUL!"
else
    echo "\n💥 CRITICAL: Coverage Failure detected during startup."
    exit 1
fi
