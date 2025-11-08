FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Use npm ci when package-lock.json exists (reproducible). If missing, fall back to npm install.
RUN sh -c "if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi"
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/build /app/build
CMD ["sh", "-c", "cp -r /app/build/* /app/static || true"]
