FROM node:24-slim AS build

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm ci

COPY . /app/

RUN npm run build

FROM nginx:1.27-alpine-slim
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
