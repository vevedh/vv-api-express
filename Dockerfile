FROM node:14-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY src ./src

RUN npm install

EXPOSE 9090

CMD ["npm", "run", "dev"]