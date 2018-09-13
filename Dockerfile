FROM node:8.11.2 
RUN mkdir -p /usr/src/ts 
WORKDIR /usr/src/ts 

COPY package.json /usr/src/ts/ 
RUN npm install 
COPY . /usr/src/ts 

EXPOSE 3000

ENTRYPOINT  npm run build && npm start 
#ENTRYPOINT  npm run start:dev
