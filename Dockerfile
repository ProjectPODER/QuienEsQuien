FROM mhart/alpine-node:4.8.4
MAINTAINER Kevin Brown <kevin@rindecuentas.org>

ENV BUILD_PACKAGES="make gcc g++ curl python"
ENV PORT=${PORT:-8080}
ENV NODE_ENV=production

RUN apk --no-cache add fontconfig tini ${BUILD_PACKAGES} \
  && npm install -g node-gyp \
  && node-gyp install \
  && addgroup -S node \
  && adduser -S -G node node

COPY ./dist/bundle /home/node

WORKDIR /home/node

EXPOSE $PORT

RUN (cd programs/server && npm install --unsafe-perm)

RUN apk del ${BUILD_PACKAGES} \
  && npm uninstall -g node-gyp \
  && chown -R node:node /home/node

USER node

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/usr/bin/node", "main.js"]
