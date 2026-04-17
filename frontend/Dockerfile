FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

# Copy all local files
COPY . .

# Run Vite dev server, which supports HMR
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
