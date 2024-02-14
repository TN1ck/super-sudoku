FROM node:16.20.2 as build

# Turn off various npm nagging
RUN npm config set audit false
RUN npm config set fund false
RUN npm config set update-notifier false

WORKDIR /app
ADD . /app/

RUN npm ci --legacy-peer-deps
RUN npm run build


FROM nginx:1.25.3-alpine-slim
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
