FROM node:20-alpine AS development
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 1337
CMD ["npm","run","develop","--","--host","0.0.0.0","--port","1337"]

FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/config ./config
COPY --from=build /app/database ./database
COPY --from=build /app/public ./public
COPY --from=build /app/src ./src
COPY --from=build /app/dist ./dist
COPY --from=build /app/.strapi ./.strapi
COPY --from=build /app/tsconfig.json ./tsconfig.json
EXPOSE 1337
CMD ["npm","run","start","--","--host","0.0.0.0","--port","1337"]
