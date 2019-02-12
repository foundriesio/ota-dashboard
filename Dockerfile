# Install development dependencies and build assets.
FROM opensourcefoundries/unode

USER root

RUN apt-get update -q=2 \
    && apt-get upgrade -q=2 -y \
    && apt-get install --no-install-recommends -q -y \
        g++ \
        git \
        libc6 \
        make \
        python

ENV WORKSPACE=/home/node

WORKDIR $WORKSPACE

COPY $PWD $WORKSPACE

RUN npm install

RUN npm run build:clean
RUN npm run build:prod
RUN npm run build:marko

# Install production dependencies.
FROM opensourcefoundries/unode

USER root

RUN apt-get update -q=2 \
    && apt-get upgrade -q=2 -y \
    && apt-get install --no-install-recommends -q -y \
        g++ \
        git \
        libc6 \
        make \
        python

ENV WORKSPACE=/home/node

WORKDIR $WORKSPACE

COPY $PWD $WORKSPACE

RUN npm install --production

# Copy assets and dependencies.
FROM opensourcefoundries/unode

ENV WORKSPACE=/home/node
ENV NODE_CONFIG_DIR=$WORKSPACE/config/

WORKDIR $WORKSPACE

COPY $PWD $WORKSPACE

COPY --from=0 /home/node/assets/dist/ $WORKSPACE/assets/dist/
COPY --from=0 /home/node/src/templates $WORKSPACE/src/templates
COPY --from=0 /home/node/src/pages $WORKSPACE/src/pages
COPY --from=0 /home/node/src/components $WORKSPACE/src/components
COPY --from=1 /home/node/node_modules/ $WORKSPACE/node_modules/

USER root
RUN chown -R node:node .

EXPOSE 3030

USER node
CMD ["npm", "start"]
