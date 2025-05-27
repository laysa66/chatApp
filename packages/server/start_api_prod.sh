#!/bin/bash

echo "Building server..."
yarn swc src -d dist

echo "Starting server..."
DOTENV_CONFIG_PATH=config/prod.env NODE_ENV=production NODE_PATH=dist node -r dotenv/config dist/index.js
