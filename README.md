# Activity Tracking Service
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://opensource.org/licenses/MIT) [![node](https://img.shields.io/badge/node-v8.11.2-red.svg)](https://nodejs.org/) [![npm](https://img.shields.io/badge/npm-v5.5.1-red.svg)](https://nodejs.org/) [![swagger](https://img.shields.io/badge/swagger-v2.0-green.svg)](https://swagger.io/) [![TypeScript](https://badges.frapsoft.com/typescript/love/typescript.png?v=101)](https://www.typescriptlang.org/) 
--
Microservice for activity tracking data acquisition.

## Installation and Development Server
Requires [Node.js](https://nodejs.org/) v8+ and [MongoDB](https://www.mongodb.com) to run.
Install the dependencies, start the local MongoDB, and start the server.

```sh
$ npm install
$ mongod
$ npm run start:dev
```
Navigate to `http://localhost:3000/`.

## Configurations
In `/config/config.ts` modify the values of the variables for your deployment context.
 
## Build
- Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests
- Run `npm run test:unit` to run unit tests by _[Mocha](https://mochajs.org/)._

## Running integration tests
- Run `mongod` 
- Run `npm run test:integration` to run integration tests by _[Mocha](https://mochajs.org/)._

## Running all tests
- Run `mongod` 
- Run `npm run test` to run the unit test and integration by _[Mocha](https://mochajs.org/)._

## Running coverage test
- Run `npm run test:cov` to run code coverage tests by _[Instanbul](https://istanbul.js.org/)._ The other tests will be automatically executed

## Project Structure
![structure](https://i.imgur.com/XSyvG78.jpg)
- `/config`: Directory to save application settings, such as global variables, settings for access to the database...
- `/dist`: Directory where the .js files will be placed after the typescript transpiler.
- `/src`: Application main directory
    - `/controllers`: Responsible for the communication between the Routes and Repository. In this layer, all requests will be received and then sent to the Repository.
    - `/exceptions`: Contains custom exceptions for application.
    - `/models`: Contains the data models to represent the entities.
    - `/repositories`: Responsible for doing data persistence and retrieval.
    - `/routes`: Contains mapping to the resources provided by the application.
    - `/swagger`: Contains the .yaml files that describe the API.
- `/test`: Contains unit and integration tests.