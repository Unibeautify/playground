FROM node:16-alpine@sha256:50b33102c307e04f73817dad87cdae145b14782875495ddd950b5a48e4937c70
MAINTAINER Glavin Wiechert <glavin.wiechert@gmail.com>

# Defines our working directory in container
WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY . ./
RUN npm run build

CMD npm run static