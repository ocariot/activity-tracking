FROM node:11.12.0
RUN mkdir -p /usr/src/ts
WORKDIR /usr/src/ts

COPY package.json /usr/src/ts
RUN npm install 
COPY . /usr/src/ts

EXPOSE 3000

ENTRYPOINT  npm run build && npm start
