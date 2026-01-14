#!/bin/bash
echo "Starting LMS Platform..."
# Ensure we are in the script directory
cd "$(dirname "$0")"
npm run dev
