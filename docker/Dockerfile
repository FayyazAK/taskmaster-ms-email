# Use Node.js base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose app port (change if needed)
EXPOSE 4009

# Start the app
CMD ["npm", "run", "dev"]
