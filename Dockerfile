FROM node:11.3.0

# create and set app directory
RUN mkdir -p /usr/src/ts/
WORKDIR /usr/src/ts/

# install app dependencies
COPY package.json /usr/src/ts
RUN npm install
COPY . /usr/src/ts

EXPOSE 3000

ENTRYPOINT npm run build && npm start
