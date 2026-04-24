#!/bin/bash
cd "$(dirname "$0")/memoir-novelist-frontend"
firebase target:apply hosting memoir-novelist memoir-novelist
firebase deploy --only hosting:memoir-novelist
