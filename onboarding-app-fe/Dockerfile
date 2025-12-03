# Stage 1: Build React app
FROM node:20-alpine AS build

# Build-time ARG (quan trọng)
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_GA_TRACKING_ID

# Export ARG thành ENV để React build đọc được
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
ENV REACT_APP_GA_TRACKING_ID=${REACT_APP_GA_TRACKING_ID}

# Set working directory
WORKDIR /app

# Copy package.json & package-lock.json first to leverage cache
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the React app (READS ENV HERE)
RUN npm run build

# Stage 2: Serve static files with nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built app from previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
