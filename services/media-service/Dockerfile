FROM node:18-alpine

# Install sharp dependencies
RUN apk add --no-cache \
    vips-dev \
    python3 \
    make \
    g++

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 3003

CMD ["npm", "start"]
