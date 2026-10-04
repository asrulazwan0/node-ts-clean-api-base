# Pinned Node 24 base; update digest through dependency maintenance.
FROM node:24-alpine@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM dependencies AS development
COPY --chown=node:node . .
RUN chown -R node:node /app
USER node
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM dependencies AS test
COPY --chown=node:node . .
RUN chown -R node:node /app
USER node
CMD ["npm", "run", "test:coverage"]

FROM dependencies AS builder
COPY . .
RUN npm run build

FROM dependencies AS production-dependencies
RUN npm prune --omit=dev --no-audit --no-fund

FROM node:24-alpine@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json LICENSE ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health/ready',{signal:AbortSignal.timeout(3000)}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]
