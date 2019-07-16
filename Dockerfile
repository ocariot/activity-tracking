FROM node

# Create app directory
RUN mkdir -p /usr/src/ts/
WORKDIR /usr/src/ts/

# Install app dependencies
COPY package.json /usr/src/ts
RUN npm install

# Copy app source
COPY . /usr/src/ts

# Create self-signed certificates
RUN chmod +x ./create-self-signed-certs.sh
RUN ./create-self-signed-certs.sh

# Build app
RUN npm run build

EXPOSE 4000
EXPOSE 4001

CMD ["npm", "start"]
