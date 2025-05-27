FROM node:24-alpine AS build

WORKDIR /app

# Copy server and common code, plus package.json and lockfile
COPY yarn.lock ./yarn.lock
COPY packages/server ./
COPY packages/common ../common


RUN yarn install
RUN yarn build
RUN yarn swc src -d dist

# --- Production image ---
FROM node:24-alpine AS prod
WORKDIR /app

# Copy built code and common (for runtime relative imports)
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /common ../common
COPY --from=build /app/node_modules ./node_modules

EXPOSE 4000

# Start the server
CMD ["node", "dist/index.js"]
