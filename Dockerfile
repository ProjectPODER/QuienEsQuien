FROM mhart/alpine-node:4.8.4
MAINTAINER Kevin Brown <kevin@rindecuentas.org>

ENV BUILD_PACKAGES="python make gcc g++ tini"
ENV PORT=${PORT:-8080}
ENV NODE_ENV=production

RUN apk --no-cache add ${BUILD_PACKAGES} \
  && npm install -g node-gyp \
  && node-gyp install \
  && addgroup -S node \
  && adduser -S -G node node

COPY ./dist/bundle /home/node

RUN chown -R node:node /home/node

WORKDIR /home/node

EXPOSE $PORT

USER node
RUN (cd programs/server && npm install)

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/usr/bin/node", "main.js"]
