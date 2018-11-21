import supertest from 'supertest'
import chai from 'chai'
import { App } from '../src/app'
import { CustomLogger } from '../src/utils/custom.logger'

require(`dotenv`).config()

global.app = new App(new CustomLogger()).getExpress()
global.request = supertest(app)
global.expect = chai.expect
global.assert = chai.assert