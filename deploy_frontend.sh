#!/bin/bash
cd /Users/daibao/Memoir-Novelist-Project/memoir-novelist-frontend
firebase target:apply hosting memoir-novelist memoir-novelist
firebase deploy --only hosting:memoir-novelist
