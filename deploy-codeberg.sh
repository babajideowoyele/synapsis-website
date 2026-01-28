#!/bin/bash
# Deploy built site to Codeberg Pages branch
set -e

echo "Building site..."
npx @11ty/eleventy

echo "Deploying to Codeberg Pages..."
cd _site
git init
git checkout -b pages
git add .
git commit -m "Deploy to Codeberg Pages"
git remote add codeberg https://codeberg.org/babajideowoyele/synapsis-website.git
git push codeberg pages --force

echo "Cleaning up..."
cd ..
rm -rf _site/.git

echo "Done. Site live at https://babajideowoyele.codeberg.page/synapsis-website/"
