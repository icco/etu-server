# Use a specific version of Node.js for the build environment
FROM node:25-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock to leverage Docker's caching
COPY package.json yarn.lock ./

# Install dependencies with yarn
RUN yarn install --frozen-lockfile

# Copy the rest of the application's source code
COPY . .

# Build the application
RUN yarn build

# Use a lightweight Nginx image for the final production environment
FROM nginx:1.25-alpine AS final

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the default nginx config
COPY <<EOT /etc/nginx/conf.d/default.conf
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;

    location / {
        root   /usr/share/nginx/html;
        index  index.html;
        try_files $uri $uri/ /index.html;
    }

    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
EOT

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
