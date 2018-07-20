FROM node:7-alpine@sha256:af5c2c6ac8bc3fa372ac031ef60c45a285eeba7bce9ee9ed66dad3a01e29ab8d
MAINTAINER Glavin Wiechert <glavin.wiechert@gmail.com>

# Defines our working directory in container
WORKDIR /usr/src/app

COPY package.json ./
RUN npm install

COPY . ./
RUN npm run build

CMD npm run static