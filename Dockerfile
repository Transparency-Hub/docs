# Stage 1: Build the docs
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npx mintlify build

# Stage 2: Serve with lightweight server
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/.mintlify/output ./build

EXPOSE 3000

CMD ["serve", "build", "-l", "3000", "--single"]
