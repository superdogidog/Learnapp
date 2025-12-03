#!/bin/bash

# Script to deploy built frontend to gh-pages branch
# This script builds the frontend and pushes it to the gh-pages branch

set -e

echo "Building frontend..."
npm run build

echo "Checking out gh-pages branch..."
git checkout gh-pages || git checkout -b gh-pages

echo "Removing old files..."
git rm -rf assets index.html .idea 2>/dev/null || true
rm -rf node_modules dist 2>/dev/null || true

echo "Copying new build..."
cp -r dist/* .
rm -rf dist

echo "Staging changes..."
git add -A

echo "Committing..."
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"

echo "Pushing to gh-pages..."
git push origin gh-pages

echo "Switching back to main branch..."
git checkout main || git checkout -

echo "Deployment complete!"
