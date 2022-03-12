FROM node:17.7.1

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn run build

CMD ["yarn", "run", "start"]