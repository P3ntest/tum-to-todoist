FROM oven/bun:canary-alpine
WORKDIR /app
COPY package.json package.json
COPY bun.lockb bun.lockb
RUN bun install
COPY . .
ENTRYPOINT ["bun", "run", "src/index.ts"]