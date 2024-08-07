# Builder image
FROM node:20-alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY ./ ./

RUN npm run build


# Final image
FROM nginx

# NGINX conf file
COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/build /usr/share/nginx/html

EXPOSE 80