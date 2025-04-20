FROM node:20-alpine AS build
WORKDIR /app-backend
COPY package*.json ./
COPY tsconfig.json ./tsconfig.json
COPY . .
RUN npm install
RUN npm run build
EXPOSE 5010

FROM node:20-alpine
WORKDIR /app-backend
COPY --from=build /app-backend/dist ./dist
COPY --from=build /app-backend/package*.json ./
RUN npm install -production
EXPOSE 5010

CMD ["npm", "run", "start:prod"]