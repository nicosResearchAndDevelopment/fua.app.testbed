FROM node:lts-alpine AS builder

# 1. Set default arguments and environment for the builder.

ARG NRD_REGISTRY="https://git02.int.nsc.ag/api/v4/projects/1015/packages/npm/"
ARG NPM_TOKEN="[...]"

ENV NODE_ENV="production"

# 2. Create the working directory for the application and the necessary files for the installation, e.g. npmrc file.

RUN mkdir -p /opt/fua
WORKDIR /opt/fua
RUN echo -e "@nrd:registry=${NRD_REGISTRY}\n${NRD_REGISTRY#http*:}:_authToken=${NPM_TOKEN}" >> .npmrc

# 3. Install the application via npm.

RUN npm install @fua/app.testbed

# 4. use lts-alpine as runner to reduce image size.

FROM node:lts-alpine AS runner

# 5. Set default arguments and environment for the runner.

ENV NODE_ENV="production"

# 6. Copy application from builder and setup environment.

RUN mkdir -p /opt/fua
COPY --from=builder /opt/fua/node_modules /opt/fua/node_modules
ENV PATH="$PATH:/opt/fua/node_modules/.bin"

# 7. Install additionally required system packages.

RUN apk add nmap

# 8. Define image setup and application entrypoint.

EXPOSE 3000
ENTRYPOINT node --inspect-brk=0.0.0.0 ./src/launch.js

# docker build --tag debug-testbed --file lab/debug.Dockerfile .
# docker run -p 3000:3000 -p 9229:9229 -it --rm debug-testbed
