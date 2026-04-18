# Build Stage
FROM node:25-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application with adapter-node
ENV ADAPTER=node
RUN npm run build

# Prune devDependencies to keep the image slim
RUN npm prune --production

# Runtime Stage
FROM node:25-alpine

WORKDIR /app

# Copy the build output and production node_modules from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Expose the default SvelteKit port
EXPOSE 3000

# Set default environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV ADAPTER=node

# The origin of the site (used for CSRF protection)
# Should be set to the public URL in production
ENV ORIGIN=http://localhost:3000

# Start the application
CMD ["node", "build/index.js"]
