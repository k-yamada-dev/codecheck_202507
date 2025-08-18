FROM node:18-slim

# Install dependencies
RUN apt-get update && apt-get install -y openssl

# Set working directory
WORKDIR /work

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "dev"]