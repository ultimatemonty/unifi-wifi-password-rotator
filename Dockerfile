FROM node:lts-alpine3.10

COPY . /app

WORKDIR "/app"

ENV NODE_ENV="development"

RUN npm install

CMD ["node", "index.js"];