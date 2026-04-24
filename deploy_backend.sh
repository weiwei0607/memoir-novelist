#!/bin/bash
cd "$(dirname "$0")/memoir-novelist-backend"
gcloud run deploy memoir-novelist-backend --source . --region asia-east1 --allow-unauthenticated --set-env-vars GEMINI_API_KEY=${GEMINI_API_KEY} --project pristine-nebula-491106-e8
