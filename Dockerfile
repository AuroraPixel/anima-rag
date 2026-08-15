FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8787

COPY package*.json ./
COPY patches ./patches
RUN npm ci --omit=dev

COPY . .

VOLUME ["/app/vectors", "/app/data"]
EXPOSE 8787

CMD ["node", "server.js"]
