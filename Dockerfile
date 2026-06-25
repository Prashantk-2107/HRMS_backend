# Use Node.js 20 Alpine as the base image
FROM node:20-alpine

# Install openssl for Prisma engine to work correctly on Alpine
RUN apk add --no-cache openssl

# Set working directory inside the container
WORKDIR /app

# Copy package lists first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma configuration and schema files
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
