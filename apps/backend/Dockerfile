FROM node:20-alpine AS development
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
COPY node_modules ./node_modules
COPY . .
EXPOSE 3001
CMD ["npm","run","start:dev"]

FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
COPY node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3001
CMD ["node","dist/main"]
