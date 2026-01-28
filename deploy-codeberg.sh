#!/bin/bash
# Deploy built site to Codeberg Pages (synapsis org)
set -e

echo "Building site..."
npx @11ty/eleventy

echo "Deploying to Codeberg Pages..."
cd _site
git init
git checkout -b main
git add .
git commit -m "Deploy to Codeberg Pages"
git remote add origin https://codeberg.org/synapsis/pages.git
git push origin main --force

echo "Cleaning up..."
cd ..
rm -rf _site/.git

echo "Done. Site live at https://synapsis.codeberg.page/"
