FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src
COPY scripts/seed.js scripts/create-admin.js ./scripts/

# Machi root: ila t-exploita l-app, ma y9derch ybeddel l-container
USER node
EXPOSE 8000
CMD ["node", "src/server.js"]
