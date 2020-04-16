FROM node:12.13.1

# Create app directory
RUN mkdir -p /usr/src/it/
WORKDIR /usr/src/it/

# Install app dependencies
COPY package.json /usr/src/it
RUN npm install

# Copy app source
COPY . /usr/src/it

# Build app
RUN npm run build

EXPOSE 4000
EXPOSE 4001

CMD ["npm", "start"]
