#!/bin/bash

echo "Starting server with nodemon..."
DOTENV_CONFIG_PATH=config/development.env NODE_ENV=development NODE_PATH=dist nodemon --ext ts --exec "yarn swc src -d dist && node -r dotenv/config --inspect dist/index.js"