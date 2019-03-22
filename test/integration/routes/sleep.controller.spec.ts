import { Container } from 'inversify'
import { DI } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { BackgroundService } from '../../../src/background/background.service'
import { expect } from 'chai'
import { SleepMock } from '../../mocks/sleep.mock'
import { Sleep } from '../../../src/application/domain/model/sleep'
import { Strings } from '../../../src/utils/strings'
import { SleepPattern, SleepPatternType } from '../../../src/application/domain/model/sleep.pattern'
import { SleepRepoModel } from '../../../src/infrastructure/database/schema/sleep.schema'
import { SleepEntityMapper } from '../../../src/infrastructure/entity/mapper/sleep.entity.mapper'
import { ObjectID } from 'bson'

const container: Container = DI.getInstance().getContainer()
const backgroundServices: BackgroundService = container.get(Identifier.BACKGROUND_SERVICE)
const app: App = container.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: users.children.sleep', () => {

    const defaultSleep: Sleep = new SleepMock()
    const otherSleep: Sleep = new SleepMock()
    otherSleep.child_id = '5a62be07de34500146d9c542'

    // Start services
    before(async () => {
        try {
            await deleteAllSleep()
            await backgroundServices.startServices()
        } catch (err) {
            throw new Error('Failure on users.children.sleep routes test: ' + err.message)
        }
    })

    // Delete all database sleep objects
    after(async () => {
        try {
            await deleteAllSleep()
        } catch (err) {
            throw new Error('Failure on users.children.sleep routes test: ' + err.message)
        }
    })
    /**
     * POST route
     */
    describe('POST /users/children/:child_id/sleep', () => {
        context('when posting a new Sleep with success', () => {
            it('should return status code 201 and the saved Sleep', () => {
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: defaultSleep.pattern
                }

                return request
                    .post(`/users/children/${defaultSleep.child_id}/sleep`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('start_time')
                        expect(res.body.start_time).to.eql(defaultSleep.start_time!.toISOString())
                        expect(res.body).to.have.property('end_time')
                        expect(res.body.end_time).to.eql(defaultSleep.end_time!.toISOString())
                        expect(res.body).to.have.property('duration')
                        expect(res.body.duration).to.eql(defaultSleep.duration)
                        expect(res.body).to.have.property('pattern')
                        expect(res.body).to.have.property('child_id')
                        expect(res.body.child_id).to.eql(defaultSleep.child_id)
                        defaultSleep.id = res.body.id
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and an info message about duplicate items', () => {
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: defaultSleep.pattern
                }

                return request
                    .post(`/users/children/${defaultSleep.child_id}/sleep`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(409)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Sleep is already registered...')
                    })
            })
        })

        context('when a validation error occurs (missing all required fields)', () => {
            it('should return status code 400 and info message about the missing fields', () => {
                const body = {}

                return request
                    .post(`/users/children/${defaultSleep.child_id}/sleep`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Activity validation failed: start_time, end_time, duration is required!')
                    })
            })
        })

        context('when a validation error occurs (missing required field of sleep)', () => {
            it('should return status code 400 and info message about the missing fields', () => {
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration
                }

                return request
                    .post(`/users/children/${defaultSleep.child_id}/sleep`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Sleep validation failed: pattern is required!')
                    })
            })
        })

        context('when a validation error occurs (start_time with a date newer than end_time)', () => {
            it('should return status code 400 and info message about the invalid date', () => {
                const body = {
                    start_time: new Date(2020),
                    end_time: new Date(2019),
                    duration: defaultSleep.duration,
                    pattern: defaultSleep.pattern
                }

                return request
                    .post(`/users/children/${defaultSleep.child_id}/sleep`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Date field is invalid...')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Date validation failed: The end_time parameter can not ' +
                            'contain a older date than that the start_time parameter!')
                    })
            })
        })

        context('when a validation error occurs (the duration is incompatible with the start_time and end_time parameters)', () => {
            it('should return status code 400 and info message about the invalid duration', () => {
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: Math.floor(Math.random() * 180 + 1) * 60000,
                    pattern: defaultSleep.pattern
                }

                return request
                    .post(`/users/children/${defaultSleep.child_id}/sleep`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Duration field is invalid...')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Duration validation failed: Activity duration value does ' +
                            'not match values passed in start_time and end_time parameters!')
                    })
            })
        })

        context('when a validation error occurs (the duration is negative)', () => {
            it('should return status code 400 and info message about the invalid duration', () => {
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: -(defaultSleep.duration!),
                    pattern: defaultSleep.pattern
                }

                return request
                    .post(`/users/children/${defaultSleep.child_id}/sleep`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Duration field is invalid...')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Activity validation failed: The value provided has a negative value!')
                    })
            })
        })

        context('when a validation error occurs (child_id is invalid)', () => {
            it('should return status code 400 and info message about the invalid child_id', () => {
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: defaultSleep.pattern
                }

                return request
                    .post(`/users/children/123/sleep`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when a validation error occurs (missing data_set of pattern)', () => {
            it('should return status code 400 and info message about the invalid pattern', () => {
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: new SleepPattern()
                }

                return request
                    .post(`/users/children/${defaultSleep.child_id}/sleep`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Pattern are not in a format that is supported...')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Validation of the standard of sleep failed: data_set is required!')
                    })
            })
        })

        context('when a validation error occurs (the pattern has an empty data_set array)', () => {
            it('should return status code 400 and info message about the invalid data_set array of pattern', () => {
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: {
                        data_set: []
                    }
                }

                return request
                    .post(`/users/children/${defaultSleep.child_id}/sleep`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Dataset are not in a format that is supported!')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('The data_set collection must not be empty!')
                    })
            })
        })

        context('when a validation error occurs (missing fields of some item from the data_set array of pattern)', () => {
            it('should return status code 400 and info message about the invalid data_set array of pattern', () => {
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: {
                        data_set: [
                            {}
                        ]
                    }
                }

                return request
                    .post(`/users/children/${defaultSleep.child_id}/sleep`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Dataset are not in a format that is supported!')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Validation of the sleep pattern dataset failed: data_set ' +
                            'start_time, data_set name, data_set duration is required!')
                    })
            })
        })

        context('when a validation error occurs (there is a negative duration on some item from the data_set array of pattern)', () => {
            it('should return status code 400 and info message about the invalid data_set array of pattern', () => {
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: {
                        data_set: [
                            {
                                start_time: '2018-08-18T01:40:30.00Z',
                                name: 'restless',
                                duration: -(Math.floor(Math.random() * 5 + 1) * 60000)
                            }
                        ]
                    }
                }

                return request
                    .post(`/users/children/${defaultSleep.child_id}/sleep`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Some (or several) duration field of sleep pattern is invalid...')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Sleep Pattern dataset validation failed: The value provided ' +
                            'has a negative value!')
                    })
            })
        })
    })
    /**
     * Route GET all
     */
    describe('GET /users/children/sleep', () => {
        context('when get all sleep of the database successfully', () => {
            it('should return status code 200 and a list of all sleep found', async () => {
                return request
                    .get('/users/children/sleep')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object, which was
                        // created in the case of POST route success test
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('start_time')
                        expect(res.body[0].start_time).to.eql(defaultSleep.start_time!.toISOString())
                        expect(res.body[0]).to.have.property('end_time')
                        expect(res.body[0].end_time).to.eql(defaultSleep.end_time!.toISOString())
                        expect(res.body[0]).to.have.property('duration')
                        expect(res.body[0].duration).to.eql(defaultSleep.duration)
                        expect(res.body[0]).to.have.property('pattern')
                        expect(res.body[0]).to.have.property('child_id')
                        expect(res.body[0].child_id).to.eql(defaultSleep.child_id)
                    })
            })
        })

        context('when there are no sleep in the database', () => {
            it('should return status code 200 and an empty list', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                return request
                    .get('/users/children/sleep')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(0)
                    })
            })
        })
        /**
         * query-strings-parser library test
         */
        context('when get sleep using the "query-strings-parser" library', () => {
            it('should return status code 200 and the result as needed in the query', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                await createSleep({
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: [
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.RESTLESS,
                            duration: Math.floor(Math.random() * 5 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.ASLEEP,
                            duration: Math.floor(Math.random() * 120 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.AWAKE,
                            duration: Math.floor(Math.random() * 3 + 1) * 60000
                        }
                    ],
                    child_id: defaultSleep.child_id
                })

                await createSleep({
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: [
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.RESTLESS,
                            duration: Math.floor(Math.random() * 5 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.ASLEEP,
                            duration: Math.floor(Math.random() * 120 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.AWAKE,
                            duration: Math.floor(Math.random() * 3 + 1) * 60000
                        }
                    ],
                    child_id: new ObjectID()
                })

                const url = `/users/children/sleep?child_id=${defaultSleep.child_id}&fields=start_time,end_time,
                    duration,pattern,child_id&sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object with the property
                        // 'climatized' = true (the only query filter)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('start_time')
                        expect(res.body[0].start_time).to.eql(defaultSleep.start_time!.toISOString())
                        expect(res.body[0]).to.have.property('end_time')
                        expect(res.body[0].end_time).to.eql(defaultSleep.end_time!.toISOString())
                        expect(res.body[0]).to.have.property('duration')
                        expect(res.body[0].duration).to.eql(defaultSleep.duration)
                        expect(res.body[0]).to.have.property('pattern')
                        expect(res.body[0]).to.have.property('child_id')
                        expect(res.body[0].child_id).to.eql(defaultSleep.child_id)
                    })
            })
        })

        context('when there is an attempt to get sleep using the "query-strings-parser" library but there is no sleep ' +
            'in the database', () => {
            it('should return status code 200 and an empty list', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                const url = `/users/children/sleep?child_id=${defaultSleep.child_id}&fields=start_time,end_time,
                    duration,pattern,child_id&sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(0)
                    })
            })
        })
    })
    /**
     * Route GET all sleep by child
     */
    describe('GET /users/children/:child_id/sleep', () => {
        context('when get all sleep of a specific child of the database successfully', () => {
            it('should return status code 200 and a list of all sleep of that specific child', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                await createSleep({
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: [
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.RESTLESS,
                            duration: Math.floor(Math.random() * 5 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.ASLEEP,
                            duration: Math.floor(Math.random() * 120 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.AWAKE,
                            duration: Math.floor(Math.random() * 3 + 1) * 60000
                        }
                    ],
                    child_id: defaultSleep.child_id
                })

                return request
                    .get(`/users/children/${defaultSleep.child_id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object, which was
                        // created in the case of POST route success test
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('start_time')
                        expect(res.body[0].start_time).to.eql(defaultSleep.start_time!.toISOString())
                        expect(res.body[0]).to.have.property('end_time')
                        expect(res.body[0].end_time).to.eql(defaultSleep.end_time!.toISOString())
                        expect(res.body[0]).to.have.property('duration')
                        expect(res.body[0].duration).to.eql(defaultSleep.duration)
                        expect(res.body[0]).to.have.property('pattern')
                        expect(res.body[0]).to.have.property('child_id')
                        expect(res.body[0].child_id).to.eql(defaultSleep.child_id)
                    })
            })
        })

        context('when there are no sleep associated with that specific child in the database', () => {
            it('should return status code 200 and an empty list', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                return request
                    .get(`/users/children/${defaultSleep.child_id}/sleep`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(0)
                    })
            })
        })

        context('when the child_id is invalid', () => {
            it('should return status code 400 and an info message about the invalid child_id', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                await createSleep({
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: [
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.RESTLESS,
                            duration: Math.floor(Math.random() * 5 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.ASLEEP,
                            duration: Math.floor(Math.random() * 120 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.AWAKE,
                            duration: Math.floor(Math.random() * 3 + 1) * 60000
                        }
                    ],
                    child_id: defaultSleep.child_id
                })

                return request
                    .get(`/users/children/123/sleep`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
        /**
         * query-strings-parser library test
         */
        context('when get sleep using the "query-strings-parser" library', () => {
            it('should return status code 200 and the result as needed in the query', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                await createSleep({
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: [
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.RESTLESS,
                            duration: Math.floor(Math.random() * 5 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.ASLEEP,
                            duration: Math.floor(Math.random() * 120 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.AWAKE,
                            duration: Math.floor(Math.random() * 3 + 1) * 60000
                        }
                    ],
                    child_id: defaultSleep.child_id
                })

                const url = `/users/children/${defaultSleep.child_id}/sleep?child_id=${defaultSleep.child_id}&fields=start_time,end_time,
                    duration,pattern,child_id&sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object with the property
                        // 'climatized' = true (the only query filter)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0]).to.have.property('start_time')
                        expect(res.body[0].start_time).to.eql(defaultSleep.start_time!.toISOString())
                        expect(res.body[0]).to.have.property('end_time')
                        expect(res.body[0].end_time).to.eql(defaultSleep.end_time!.toISOString())
                        expect(res.body[0]).to.have.property('duration')
                        expect(res.body[0].duration).to.eql(defaultSleep.duration)
                        expect(res.body[0]).to.have.property('pattern')
                        expect(res.body[0]).to.have.property('child_id')
                        expect(res.body[0].child_id).to.eql(defaultSleep.child_id)
                    })
            })
        })

        context('when there is an attempt to get sleep of a specific child using the "query-strings-parser" library but ' +
            'this sleep does not exist', () => {
            it('should return status code 200 and an empty list', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                const url = `/users/children/${defaultSleep.child_id}/sleep?child_id=${defaultSleep.child_id}&fields=start_time,end_time,
                    duration,pattern,child_id&sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(0)
                    })
            })
        })

        context('when there is an attempt to get sleep of a specific child using the "query-strings-parser" library ' +
            'but the child_id is invalid', () => {
            it('should return status code 400 and an info message about the invalid child_id', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                await createSleep({
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: [
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.RESTLESS,
                            duration: Math.floor(Math.random() * 5 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.ASLEEP,
                            duration: Math.floor(Math.random() * 120 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.AWAKE,
                            duration: Math.floor(Math.random() * 3 + 1) * 60000
                        }
                    ],
                    child_id: defaultSleep.child_id
                })

                const url = `/users/children/123/sleep?child_id=${defaultSleep.child_id}&fields=start_time,end_time,
                    duration,pattern,child_id&sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
    /**
     * Route GET a sleep by child
     */
    describe('GET /users/children/:child_id/sleep/:sleep_id', () => {
        context('when get a specific sleep of a child of the database successfully', () => {
            it('should return status code 200 and that specific sleep of that child', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                const result = await createSleep({
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: [
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.RESTLESS,
                            duration: Math.floor(Math.random() * 5 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.ASLEEP,
                            duration: Math.floor(Math.random() * 120 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.AWAKE,
                            duration: Math.floor(Math.random() * 3 + 1) * 60000
                        }
                    ],
                    child_id: defaultSleep.child_id
                })

                return request
                    .get(`/users/children/${result.child_id}/sleep/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object, which was
                        // created in the case of POST route success test
                        expect(res.body).to.have.property('id')
                        expect(res.body.id).to.eql(result.id)
                        expect(res.body).to.have.property('start_time')
                        expect(res.body.start_time).to.eql(result.start_time!.toISOString())
                        expect(res.body).to.have.property('end_time')
                        expect(res.body.end_time).to.eql(result.end_time!.toISOString())
                        expect(res.body).to.have.property('duration')
                        expect(res.body.duration).to.eql(result.duration)
                        expect(res.body).to.have.property('pattern')
                        expect(res.body).to.have.property('child_id')
                        expect(res.body.child_id).to.eql(result.child_id.toString())
                    })
            })
        })

        context('when there is no that specific sleep associated with that child in the database', () => {
            it('should return status code 404 and an info message describing that sleep was not found', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                return request
                    .get(`/users/children/${defaultSleep.child_id}/sleep/${defaultSleep.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(404)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Sleep not found!')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Sleep not found or already removed. A new operation for ' +
                            'the same resource is not required!')
                    })
            })
        })

        context('when the child_id is invalid', () => {
            it('should return status code 400 and an info message about the invalid child_id', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                const result = await createSleep({
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: [
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.RESTLESS,
                            duration: Math.floor(Math.random() * 5 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.ASLEEP,
                            duration: Math.floor(Math.random() * 120 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.AWAKE,
                            duration: Math.floor(Math.random() * 3 + 1) * 60000
                        }
                    ],
                    child_id: defaultSleep.child_id
                })

                return request
                    .get(`/users/children/123/sleep/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the sleep id is invalid', () => {
            it('should return status code 400 and an info message about the invalid sleep id', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                const result = await createSleep({
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: [
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.RESTLESS,
                            duration: Math.floor(Math.random() * 5 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.ASLEEP,
                            duration: Math.floor(Math.random() * 120 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.AWAKE,
                            duration: Math.floor(Math.random() * 3 + 1) * 60000
                        }
                    ],
                    child_id: defaultSleep.child_id
                })

                return request
                    .get(`/users/children/${result.child_id}/sleep/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql(Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
        /**
         * query-strings-parser library test
         */
        context('when get a specific sleep of a child using the "query-strings-parser" library', () => {
            it('should return status code 200 and the result as needed in the query', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                const result = await createSleep({
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: [
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.RESTLESS,
                            duration: Math.floor(Math.random() * 5 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.ASLEEP,
                            duration: Math.floor(Math.random() * 120 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.AWAKE,
                            duration: Math.floor(Math.random() * 3 + 1) * 60000
                        }
                    ],
                    child_id: defaultSleep.child_id
                })

                const url = `/users/children/${result.child_id}/sleep/${result.id}?child_id=${result.child_id}&fields=start_time,end_time,
                    duration,pattern,child_id&sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.id).to.eql(result.id)
                        expect(res.body).to.have.property('start_time')
                        expect(res.body.start_time).to.eql(result.start_time!.toISOString())
                        expect(res.body).to.have.property('end_time')
                        expect(res.body.end_time).to.eql(result.end_time!.toISOString())
                        expect(res.body).to.have.property('duration')
                        expect(res.body.duration).to.eql(result.duration)
                        expect(res.body).to.have.property('pattern')
                        expect(res.body).to.have.property('child_id')
                        expect(res.body.child_id).to.eql(result.child_id.toString())
                    })
            })
        })

        context('when there is an attempt to get a specific sleep using the "query-strings-parser" library but this sleep ' +
            'does not exist', () => {
            it('should return status code 404 and an info message describing that sleep was not found', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                const url = `/users/children/${defaultSleep.child_id}/sleep/${defaultSleep.id}?child_id=${defaultSleep.child_id}
                    &fields=start_time,end_time, duration,pattern,child_id&sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(404)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Sleep not found!')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Sleep not found or already removed. A new operation for ' +
                            'the same resource is not required!')
                    })
            })
        })

        context('when there is an attempt to get a specific sleep using the "query-strings-parser" library but the ' +
            'child_id is invalid', () => {
            it('should return status code 400 and an info message about the invalid child_id', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                const result = await createSleep({
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: [
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.RESTLESS,
                            duration: Math.floor(Math.random() * 5 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.ASLEEP,
                            duration: Math.floor(Math.random() * 120 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.AWAKE,
                            duration: Math.floor(Math.random() * 3 + 1) * 60000
                        }
                    ],
                    child_id: defaultSleep.child_id
                })

                const url = `/users/children/123/sleep/${result.id}?child_id=${result.child_id}&fields=start_time,end_time,
                    duration,pattern,child_id&sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when there is an attempt to get a specific sleep using the "query-strings-parser" library but the ' +
            'sleep id is invalid', () => {
            it('should return status code 400 and an info message about the invalid sleep id', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                const result = await createSleep({
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: [
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.RESTLESS,
                            duration: Math.floor(Math.random() * 5 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.ASLEEP,
                            duration: Math.floor(Math.random() * 120 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.AWAKE,
                            duration: Math.floor(Math.random() * 3 + 1) * 60000
                        }
                    ],
                    child_id: defaultSleep.child_id
                })

                const url = `/users/children/${result.child_id}/sleep/123?child_id=${result.child_id}&fields=start_time,end_time,
                    duration,pattern,child_id&sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql(Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
    /**
     * PATCH route
     */
    describe('PATCH /users/children/:child_id/sleep/:sleep_id', () => {
        context('when this sleep exists in the database and is updated successfully', () => {
            it('should return status code 200 and the updated Sleep', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                // Sleep to be updated
                const result = await createSleepToBeUpdated(defaultSleep)

                // Sleep to update
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: defaultSleep.pattern
                }

                return request
                    .patch(`/users/children/${result.child_id}/sleep/${result.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('start_time')
                        expect(res.body.start_time).to.eql(defaultSleep.start_time!.toISOString())
                        expect(res.body).to.have.property('end_time')
                        expect(res.body.end_time).to.eql(defaultSleep.end_time!.toISOString())
                        expect(res.body).to.have.property('duration')
                        expect(res.body.duration).to.eql(defaultSleep.duration)
                        expect(res.body).to.have.property('pattern')
                        expect(res.body).to.have.property('child_id')
                        expect(res.body.child_id).to.eql(defaultSleep.child_id)
                    })
            })
        })

        context('when sleep does not exist in the database', () => {
            it('should return status code 404 and an info message about the error on the search', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                // Sleep to update
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: defaultSleep.pattern
                }

                return request
                    .patch(`/users/children/${defaultSleep.child_id}/sleep/${defaultSleep.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(404)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Sleep not found!')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Sleep not found or already removed. A new operation for ' +
                            'the same resource is not required!')
                    })
            })
        })

        context('when the child_id is invalid', () => {
            it('should return status code 400 and an info message about the invalid child_id', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                // Sleep to be updated
                const result = await createSleepToBeUpdated(defaultSleep)

                // Sleep to update
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: defaultSleep.pattern
                }

                return request
                    .patch(`/users/children/123/sleep/${result.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the sleep id is invalid', () => {
            it('should return status code 400 and an info message about the invalid sleep id', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                // Sleep to be updated
                const result = await createSleepToBeUpdated(defaultSleep)

                // Sleep to update
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: defaultSleep.pattern
                }

                return request
                    .patch(`/users/children/${result.child_id}/sleep/123`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql(Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when a validation error occurs (the duration is negative)', () => {
            it('should return status code 400 and info message about the invalid duration', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                // Sleep to be updated
                const result = await createSleepToBeUpdated(defaultSleep)

                // Sleep to update
                const body = {
                    duration: -(defaultSleep.duration!)
                }

                return request
                    .patch(`/users/children/${result.child_id}/sleep/${result.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Duration field is invalid...')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Sleep validation failed: The value provided has a negative value!')
                    })
            })
        })

        context('when a validation error occurs (missing data_set of pattern)', () => {
            it('should return status code 400 and info message about the invalid pattern', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                // Sleep to be updated
                const result = await createSleepToBeUpdated(defaultSleep)

                // Sleep to update
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: new SleepPattern()
                }

                return request
                    .patch(`/users/children/${result.child_id}/sleep/${result.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Pattern are not in a format that is supported...')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Validation of the standard of sleep failed: data_set is required!')
                    })
            })
        })

        context('when a validation error occurs (the pattern has an empty data_set array)', () => {
            it('should return status code 400 and info message about the invalid data_set array of pattern', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                // Sleep to be updated
                const result = await createSleepToBeUpdated(defaultSleep)

                // Sleep to update
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: {
                        data_set: []
                    }
                }

                return request
                    .patch(`/users/children/${result.child_id}/sleep/${result.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Dataset are not in a format that is supported!')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('The data_set collection must not be empty!')
                    })
            })
        })

        context('when a validation error occurs (missing fields of some item from the data_set array of pattern)', () => {
            it('should return status code 400 and info message about the invalid data_set array of pattern', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                // Sleep to be updated
                const result = await createSleepToBeUpdated(defaultSleep)

                // Sleep to update
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: {
                        data_set: [
                            {}
                        ]
                    }
                }

                return request
                    .patch(`/users/children/${result.child_id}/sleep/${result.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Dataset are not in a format that is supported!')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Validation of the sleep pattern dataset failed: data_set ' +
                            'start_time, data_set name, data_set duration is required!')
                    })
            })
        })

        context('when a validation error occurs (there is a negative duration on some item from the data_set array of pattern)', () => {
            it('should return status code 400 and info message about the invalid data_set array of pattern', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                // Sleep to be updated
                const result = await createSleepToBeUpdated(defaultSleep)

                // Sleep to update
                const body = {
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: {
                        data_set: [
                            {
                                start_time: '2018-08-18T01:40:30.00Z',
                                name: 'restless',
                                duration: -(Math.floor(Math.random() * 5 + 1) * 60000)
                            }
                        ]
                    }
                }

                return request
                    .patch(`/users/children/${result.child_id}/sleep/${result.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Some (or several) duration field of sleep pattern is invalid...')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Sleep Pattern dataset validation failed: The value provided ' +
                            'has a negative value!')
                    })
            })
        })
    })
    /**
     * DELETE route
     */
    describe('DELETE /users/children/:child_id/sleep/:sleep_id', () => {
        context('when the sleep was deleted successfully', () => {
            it('should return status code 204 and no content for sleep', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                const result = await createSleep({
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: [
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.RESTLESS,
                            duration: Math.floor(Math.random() * 5 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.ASLEEP,
                            duration: Math.floor(Math.random() * 120 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.AWAKE,
                            duration: Math.floor(Math.random() * 3 + 1) * 60000
                        }
                    ],
                    child_id: defaultSleep.child_id
                })

                return request
                    .delete(`/users/children/${result.child_id}/sleep/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the sleep is not found', () => {
            it('should return status code 204 and no content for sleep', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                return request
                    .delete(`/users/children/${defaultSleep.child_id}/sleep/${defaultSleep.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the child_id is invalid', () => {
            it('should return status code 400 and an info message about the invalid child_id', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                const result = await createSleep({
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: [
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.RESTLESS,
                            duration: Math.floor(Math.random() * 5 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.ASLEEP,
                            duration: Math.floor(Math.random() * 120 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.AWAKE,
                            duration: Math.floor(Math.random() * 3 + 1) * 60000
                        }
                    ],
                    child_id: defaultSleep.child_id
                })

                return request
                    .delete(`/users/children/123/sleep/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the sleep id is invalid', () => {
            it('should return status code 400 and an info message about the invalid sleep id', async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    console.log(err)
                }

                const result = await createSleep({
                    start_time: defaultSleep.start_time,
                    end_time: defaultSleep.end_time,
                    duration: defaultSleep.duration,
                    pattern: [
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.RESTLESS,
                            duration: Math.floor(Math.random() * 5 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.ASLEEP,
                            duration: Math.floor(Math.random() * 120 + 1) * 60000
                        },
                        {
                            start_time: defaultSleep.start_time,
                            name: SleepPatternType.AWAKE,
                            duration: Math.floor(Math.random() * 3 + 1) * 60000
                        }
                    ],
                    child_id: defaultSleep.child_id
                })

                return request
                    .delete(`/users/children/${result.child_id}/sleep/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql(Strings.SLEEP.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
})
async function createSleep(item): Promise<any> {
    const sleepMapper: SleepEntityMapper = new SleepEntityMapper()
    const resultModel = sleepMapper.transform(item)
    const resultModelEntity = sleepMapper.transform(resultModel)
    return await Promise.resolve(SleepRepoModel.create(resultModelEntity))
}

async function createSleepToBeUpdated(defaultSleep: Sleep): Promise<any> {
    // Sleep to be updated
    const result =  createSleep({
        start_time: defaultSleep.start_time,
        end_time: defaultSleep.end_time,
        duration: defaultSleep.duration,
        pattern: [
            {
                start_time: defaultSleep.start_time,
                name: SleepPatternType.RESTLESS,
                duration: Math.floor(Math.random() * 5 + 1) * 60000
            },
            {
                start_time: defaultSleep.start_time,
                name: SleepPatternType.ASLEEP,
                duration: Math.floor(Math.random() * 120 + 1) * 60000
            },
            {
                start_time: defaultSleep.start_time,
                name: SleepPatternType.AWAKE,
                duration: Math.floor(Math.random() * 3 + 1) * 60000
            }
        ],
        child_id: defaultSleep.child_id
    })

    return await Promise.resolve(result)
}

function deleteAllSleep(): void {
    SleepRepoModel.deleteMany({}, err => {
        if (err) console.log('err: ' + err)
    })
}
