#!/bin/bash
cd /Users/daibao/Memoir-Novelist-Project/memoir-novelist-backend
gcloud run deploy memoir-novelist-backend --source . --region asia-east1 --allow-unauthenticated --set-env-vars GEMINI_API_KEY=AIzaSyC3kcGD2GICy2SJ6uDxIsnGdYJpceo6Wvk --project pristine-nebula-491106-e8
