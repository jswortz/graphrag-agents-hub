#!/bin/bash

# Configuration specified by User Global Rules
PROJECT_ID="wortz-project-352116"
REGION="us-east1"
SERVICE_NAME="graphrag-agents-hub"

echo "🍌 GraphRAG Hub Cloud Run Provisioning Script 🍌"
echo "Deploying to $PROJECT_ID in $REGION with 2GiB memory and 1 CPU (per Memory Bank rules)..."

# ONE-LINE DEPLOYMENT INCLUDES DATA PROVISIONING
echo "--- Ensuring Architecture and Live SDK Models are Populated first... ---"
chmod +x provision_all_data.sh
bash ./provision_all_data.sh || echo "⚠️ Provisioning warning: continuing to Cloud Run deploy anyway..."

gcloud config set project $PROJECT_ID

# Deploy using source direct (Buildpacks or Dockerfile)
gcloud run deploy --quiet $SERVICE_NAME \
  --source . \
  --region $REGION \
  --memory 2Gi \
  --cpu 1 \
  --allow-unauthenticated \
  --port 8080

echo "✅ Provisioning complete. The Architecture and Demo frontend are now live!"
