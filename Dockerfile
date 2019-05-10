FROM node:10.15.3

# create and set app directory
RUN mkdir -p /usr/src/ts/
WORKDIR /usr/src/ts/

# install app dependencies
COPY package.json /usr/src/ts
RUN npm install
COPY . /usr/src/ts

EXPOSE 4000
EXPOSE 4001

ENTRYPOINT npm run build && npm start
