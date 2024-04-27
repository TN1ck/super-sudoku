FROM node:20.12.2-slim as build

WORKDIR /app

COPY package.json package-lock.json /app/
RUN npm install

ADD . /app/

RUN npm run build

FROM nginx:1.25.3-alpine-slim
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
