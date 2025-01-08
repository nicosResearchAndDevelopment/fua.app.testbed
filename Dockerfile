FROM node:20-alpine

RUN mkdir -p /opt/fua
WORKDIR /opt/fua

ENV NODE_ENV="production"
RUN npm install @fua/app.testbed

RUN apk add nmap

ENV PATH="$PATH:/opt/fua/node_modules/.bin"
EXPOSE 3000

HEALTHCHECK CMD fua.app.testbed.healthcheck
ENTRYPOINT fua.app.testbed