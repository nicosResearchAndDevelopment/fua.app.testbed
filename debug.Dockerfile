FROM node:lts AS builder

# 1. Set default arguments and environment for the builder.

ARG NRD_REGISTRY="https://git02.int.nsc.ag/api/v4/projects/1015/packages/npm/"
ARG NPM_TOKEN="[...]"

ENV NODE_ENV="production"

# 2. Create the working directory for the application and the necessary files for the installation, e.g. npmrc file.

RUN mkdir -p /opt/gbx
WORKDIR /opt/gbx
RUN echo "@nrd:registry=${NRD_REGISTRY}\n${NRD_REGISTRY#http*:}:_authToken=${NPM_TOKEN}" >> .npmrc

# 3. Install the application via npm.

COPY . .
RUN npm install

# 4. use lts-alpine as runner to reduce image size.

FROM node:lts-alpine AS runner

# 5. Set default arguments and environment for the runner.

ENV NODE_ENV="production"
ENV SERVER_HOST="localhost"
ENV SERVER_PORT="8080"

# 6. Copy application from builder and setup environment.

RUN mkdir -p /opt/gbx
WORKDIR /opt/gbx
COPY --from=builder /opt/gbx /opt/gbx
ENV PATH="$PATH:/opt/gbx/node_modules/.bin"

# 7. Install additionally required system packages.

RUN apk add nmap

# 8. Define image setup and application entrypoint.

EXPOSE $SERVER_PORT
ENTRYPOINT node --inspect-brk=0.0.0.0 ./src/launch.testbed.js

# docker build --tag debug-testbed --file debug.Dockerfile .
# docker run -p 8080:8080 -p 9229:9229 -it --rm debug-testbed
