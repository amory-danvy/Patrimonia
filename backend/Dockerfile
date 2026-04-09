FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .

VOLUME ["/app/data"]

ENV NODE_ENV=production
ENV DB_PATH=/app/data/patrimonia.db

EXPOSE 3001

CMD ["node", "server.js"]
