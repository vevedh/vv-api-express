FROM node:16-lts-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json ./
COPY tsconfig.json ./

COPY . .

RUN npm install

EXPOSE 9090

CMD ["npm", "run", "dev"]
