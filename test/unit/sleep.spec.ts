import supertest from 'supertest'
import { expect } from 'chai'
import { App } from '../../src/app'
import { CustomLogger } from '../../src/utils/custom.logger'
import { BackgroundService } from '../../src/background/background.service'
import { DI } from '../../src/di/di'
import { Identifier } from '../../src/di/identifiers'

const app = new App(new CustomLogger())
const backgroundServices: BackgroundService = DI.getInstance().getContainer().get(Identifier.BACKGROUND_SERVICE)
let request: any

describe('Routes: Users', () => {
    before(() => {
        request = supertest(app.getExpress())
        backgroundServices.startServices()
    })

    // beforeEach(() => {
    // })
    //
    // afterEach(() => {
    // })

    describe('GET /sleep', () => {
        context('when an id is specified', () => {
            it('should return status code 200 with one child', () => {
                return request
                    .get('/api/v1/users/5bc741ebb93071066073560b/sleep/')
                    .expect('Content-Type', /json/)
                    .then(res => {
                        expect(res.statusCode).to.eql(201)
                    })
            })
        })
    })
})
