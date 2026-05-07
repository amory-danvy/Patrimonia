FROM node:20-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .

VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV DB_PATH=/app/data/patrimonia.db

EXPOSE 3001

CMD ["node", "server.js"]
