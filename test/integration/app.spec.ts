import { DIContainer } from '../../src/di/di'
import { Identifier } from '../../src/di/identifiers'
import { App } from '../../src/app'
import { expect } from 'chai'
import { PhysicalActivity } from '../../src/application/domain/model/physical.activity'
import { PhysicalActivityMock } from '../mocks/physical.activity.mock'

const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('App', () => {

    // Mock objects for POST attempts
    const defaultActivity: PhysicalActivity = new PhysicalActivityMock()

    /**
     * setupErrorsHandler()
     */
    describe('setupErrorsHandler()', () => {
        context('when post on a route that does not exist', () => {
            it('should return status code 404 and an info message about the lack of the route', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivitie`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(res => {
                        expect(res.body.code).to.eql(404)
                        expect(res.body.message)
                            .to.eql('/v1/children/5a62be07de34500146d9c544/physicalactivitie not found.')
                        expect(res.body.description)
                            .to.eql('Specified resource: /v1/children/5a62be07de34500146d9c544/physicalactivitie ' +
                            'was not found or does not exist.')
                    })
            })
        })

        context('when there is a POST attempt with an invalid body', () => {
            it('should return status code 400 and an info message about the invalid body', () => {
                const wrongBody: string = 'wrong body'

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(wrongBody)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Unable to process request body.')
                        expect(err.body.description).to.eql('Please verify that the JSON provided in the request ' +
                            'body has a valid format and try again.')
                    })
            })
        })
    })
})
