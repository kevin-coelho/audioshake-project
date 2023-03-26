# apt get and update. install pnpm
FROM node:18.9.0 AS build1
RUN npm i -g npm@9.2.0
RUN npm i -g pnpm@7.22.0

# load user, group, log dir, and chown
FROM build1 AS build2
RUN groupadd -g 500 container && useradd -r -u 500 -d /apps -g container container
RUN mkdir -p /apps/server
WORKDIR /apps/server

# add package files & tsconfig, pnpm
FROM build2 AS build3
COPY --chown=500:500 ./apps/server/package.json ./apps/server/tsconfig.json ./apps/server/pnpm-lock.yaml /apps/server/

# install dev dependencies from lockfile only
FROM build3 AS dev-install
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
  pnpm fetch;

# install source, build, and run
FROM dev-install AS development
RUN pnpm install --recursive --frozen-lockfile

# node/express API dev runner
FROM development AS api-dev
USER 500:500
CMD ["pnpm", "run", "api"]

# test image runner
FROM development as api-test
ENV NODE_ENV=test
USER 500:500
CMD ["pnpm", "run", "test"]

# production node/express API runner
FROM development as api-prod
ENV NODE_ENV=production
RUN pnpm run build
USER 500:500
CMD ["pnpm", "run", "api-prod"]
