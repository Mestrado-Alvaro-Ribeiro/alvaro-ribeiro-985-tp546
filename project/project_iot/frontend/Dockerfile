FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG DEVICE_ID=room01
ARG TOPIC_PREFIX=iot/environment
ARG PUBLISH_INTERVAL=5
ENV DEVICE_ID=$DEVICE_ID TOPIC_PREFIX=$TOPIC_PREFIX PUBLISH_INTERVAL=$PUBLISH_INTERVAL
RUN npm run build

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
