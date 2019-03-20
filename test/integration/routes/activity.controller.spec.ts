import { Container } from 'inversify'
import { DI } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { BackgroundService } from '../../../src/background/background.service'
import { expect } from 'chai'
import { Strings } from '../../../src/utils/strings'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { PhysicalActivityMock } from '../../mocks/physical.activity.mock'
import { ActivityLevelType } from '../../../src/application/domain/model/physical.activity.level'
// import { ActivityRepoModel } from '../../../src/infrastructure/database/schema/activity.schema'

const container: Container = DI.getInstance().getContainer()
const backgroundServices: BackgroundService = container.get(Identifier.BACKGROUND_SERVICE)
const app: App = container.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: users/children', () => {

    const defaultActivity: PhysicalActivity = new PhysicalActivityMock()

    before(async () => {
        try {
            await backgroundServices.startServices()
        } catch (err) {
            throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
        }
    })
    /**
     * POST route
     */
    describe('POST /users/children/:child_id/physicalactivities', () => {
        context('when posting a new PhysicalActivity with success', () => {
            it('should return status code 201 and the saved PhysicalActivity', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined
                }

                return request
                    .post(`/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body).to.have.property('name')
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body).to.have.property('start_time')
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body).to.have.property('end_time')
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body).to.have.property('duration')
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body).to.have.property('calories')
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        if (defaultActivity.steps) {
                            expect(res.body).to.have.property('steps')
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body).to.have.property('levels')
                        }
                        expect(res.body).to.have.property('child_id')
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                        defaultActivity.id = res.body.id
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and a info message about duplicate items', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined
                }

                return request
                    .post(`/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(409)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Physical Activity is already registered...')
                    })
            })
        })

        context('when a validation error occurs (missing all the activity required fields)', () => {
            it('should return status code 400 and info message about the activity missing fields', () => {
                const body = {}

                return request
                    .post(`/users/children/${defaultActivity.child_id}/physicalactivities`)
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

        context('when a validation error occurs (missing all the physical activity required fields)', () => {
            it('should return status code 400 and info message about the physical activity missing fields', () => {
                const body = {
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined
                }

                return request
                    .post(`/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Required fields were not provided...')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Physical Activity validation failed: name, calories is required!')
                    })
            })
        })

        context('when a validation error occurs (start_time with a date newer than end_time)', () => {
            it('should return status code 400 and info message about the invalid date', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: new Date(2020),
                    end_time: new Date(2019),
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined
                }

                return request
                    .post(`/users/children/${defaultActivity.child_id}/physicalactivities`)
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
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: Math.floor(Math.random() * 180 + 1) * 60000,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined
                }

                return request
                    .post(`/users/children/${defaultActivity.child_id}/physicalactivities`)
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
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: -(defaultActivity.duration!),
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined
                }

                return request
                    .post(`/users/children/${defaultActivity.child_id}/physicalactivities`)
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
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                }

                return request
                    .post(`/users/children/123/physicalactivities`)
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

        context('when a validation error occurs (the calories parameter is negative)', () => {
            it('should return status code 400 and info message about the invalid parameter of calories', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: -(defaultActivity.calories!),
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined
                }

                return request
                    .post(`/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Calories field is invalid...')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Physical Activity validation failed: The value provided has a negative value!')
                    })
            })
        })

        context('when a validation error occurs (the steps parameter is negative)', () => {
            it('should return status code 400 and info message about the invalid parameter of steps', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: -200,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined
                }

                return request
                    .post(`/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Steps field is invalid...')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Physical Activity validation failed: The value provided ' +
                            'has a negative value!')
                    })
            })
        })

        context('when a validation error occurs (the levels array has an item with an invalid type)', () => {
            it('should return status code 400 and info message about the invalid levels array', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: [
                        {
                            name: 'sedentaries',
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.LIGHTLY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.FAIRLY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.VERY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        }
                    ]
                }

                return request
                    .post(`/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('The name of level provided "sedentaries" is not supported...')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('The names of the allowed levels are: sedentary, lightly, fairly, very.')
                    })
            })
        })

        context('when a validation error occurs (the levels array has an item that contains empty fields)', () => {
            it('should return status code 400 and info message about the invalid levels array', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: [
                        {
                            name: '',
                            duration: undefined
                        },
                        {
                            name: ActivityLevelType.LIGHTLY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.FAIRLY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.VERY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        }
                    ]
                }

                return request
                    .post(`/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Level are not in a format that is supported!')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Must have values ​​for the following levels: sedentary, ' +
                            'lightly, fairly, very.')
                    })
            })
        })

        context('when a validation error occurs (the levels array has an item that contains negative duration)', () => {
            it('should return status code 400 and info message about the invalid levels array', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: [
                        {
                            name: ActivityLevelType.SEDENTARY,
                            duration: -(Math.floor((Math.random() * 10) * 60000))
                        },
                        {
                            name: ActivityLevelType.LIGHTLY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.FAIRLY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.VERY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        }
                    ]
                }

                return request
                    .post(`/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body).to.have.property('code')
                        expect(err.body.code).to.eql(400)
                        expect(err.body).to.have.property('message')
                        expect(err.body.message).to.eql('Some (or several) duration field of levels array is invalid...')
                        expect(err.body).to.have.property('description')
                        expect(err.body.description).to.eql('Physical Activity Level validation failed: The value ' +
                            'provided has a negative value!')
                    })
            })
        })
    })
    // /**
    //  * Route GET all
    //  */
    // describe('GET /users/children/physicalactivities', () => {
    //     context('when get all physical activity of the database successfully', () => {
    //         it('should return status code 200 and a list of all physical activity found', () => {
    //             return request
    //                 .get('/users/children/physicalactivities')
    //                 .set('Content-Type', 'application/json')
    //                 .expect(200)
    //                 .then(res => {
    //                     // Check for the existence of properties only in the first element of the array
    //                     // because there is a guarantee that there will be at least one object, which was
    //                     // created in the case of POST route success test
    //                     expect(res.body).is.an.instanceOf(Array)
    //                     expect(res.body.length).to.not.eql(0)
    //                     expect(res.body[0]).to.have.property('id')
    //                     expect(res.body[0]).to.have.property('start_time')
    //                     expect(res.body[0].start_time).to.eql(defaultActivity.start_time!.toISOString())
    //                     expect(res.body[0]).to.have.property('end_time')
    //                     expect(res.body[0].end_time).to.eql(defaultActivity.end_time!.toISOString())
    //                     expect(res.body[0]).to.have.property('duration')
    //                     expect(res.body[0].duration).to.eql(defaultActivity.duration)
    //                     expect(res.body[0]).to.have.property('child_id')
    //                     expect(res.body[0].child_id).to.eql(defaultActivity.child_id)
    //                 })
    //         })
    //     })
    //
    //     context('when there are no physical activity in the database', () => {
    //         it('should return status code 200 and an empty list', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             return request
    //                 .get('/users/children/physicalactivities')
    //                 .set('Content-Type', 'application/json')
    //                 .expect(200)
    //                 .then(res => {
    //                     expect(res.body).is.an.instanceOf(Array)
    //                     expect(res.body.length).to.eql(0)
    //                 })
    //         })
    //     })
    //
    //     context('when get physical activity using the "query-strings-parser" library', () => {
    //         it('should return status code 200 and the result as needed in the query', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             await createActivity({
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //                 child_id: defaultActivity.child_id
    //             })
    //
    //             const url = `/users/children/physicalactivities?child_id=${defaultActivity.child_id}&fields=start_time,end_time,
    //                 duration,child_id&sort=child_id&page=1&limit=3`
    //
    //             return request
    //                 .get(url)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(200)
    //                 .then(res => {
    //                     expect(res.body).is.an.instanceOf(Array)
    //                     expect(res.body.length).to.not.eql(0)
    //                     // Check for the existence of properties only in the first element of the array
    //                     // because there is a guarantee that there will be at least one object with the property
    //                     // 'climatized' = true (the only query filter)
    //                     expect(res.body[0]).to.have.property('id')
    //                     expect(res.body[0]).to.have.property('start_time')
    //                     expect(res.body[0].start_time).to.eql(defaultActivity.start_time!.toISOString())
    //                     expect(res.body[0]).to.have.property('end_time')
    //                     expect(res.body[0].end_time).to.eql(defaultActivity.end_time!.toISOString())
    //                     expect(res.body[0]).to.have.property('duration')
    //                     expect(res.body[0].duration).to.eql(defaultActivity.duration)
    //                     expect(res.body[0]).to.have.property('child_id')
    //                     expect(res.body[0].child_id).to.eql(defaultActivity.child_id)
    //                 })
    //         })
    //     })
    //
    //     context('when there is an attempt to get physical activity using the "query-strings-parser" library but there ' +
    //         'is no physical activity in the database', () => {
    //         it('should return status code 200 and an empty list', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             const url = `/users/children/physicalactivities?child_id=${defaultActivity.child_id}&fields=start_time,end_time,
    //                 duration,child_id&sort=child_id&page=1&limit=3`
    //
    //             return request
    //                 .get(url)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(200)
    //                 .then(res => {
    //                     expect(res.body).is.an.instanceOf(Array)
    //                     expect(res.body.length).to.eql(0)
    //                 })
    //         })
    //     })
    // })
    // /**
    //  * Route GET all physical activity by child
    //  */
    // describe('GET /users/children/:child_id/physicalactivities', () => {
    //     context('when get all physical activity of a specific child of the database successfully', () => {
    //         it('should return status code 200 and a list of all physical activity of that specific child', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             await createActivity({
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //                 child_id: defaultActivity.child_id
    //             })
    //
    //             return request
    //                 .get(`/users/children/${defaultActivity.child_id}/physicalactivities`)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(200)
    //                 .then(res => {
    //                     // Check for the existence of properties only in the first element of the array
    //                     // because there is a guarantee that there will be at least one object, which was
    //                     // created in the case of POST route success test
    //                     expect(res.body).is.an.instanceOf(Array)
    //                     expect(res.body.length).to.not.eql(0)
    //                     expect(res.body[0]).to.have.property('id')
    //                     expect(res.body[0]).to.have.property('start_time')
    //                     expect(res.body[0].start_time).to.eql(defaultActivity.start_time!.toISOString())
    //                     expect(res.body[0]).to.have.property('end_time')
    //                     expect(res.body[0].end_time).to.eql(defaultActivity.end_time!.toISOString())
    //                     expect(res.body[0]).to.have.property('duration')
    //                     expect(res.body[0].duration).to.eql(defaultActivity.duration)
    //                     expect(res.body[0]).to.have.property('child_id')
    //                     expect(res.body[0].child_id).to.eql(defaultActivity.child_id)
    //                 })
    //         })
    //     })
    //
    //     context('when there are no physical activity associated with that specific child in the database', () => {
    //         it('should return status code 200 and an empty list', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             return request
    //                 .get(`/users/children/${defaultActivity.child_id}/physicalactivities`)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(200)
    //                 .then(res => {
    //                     expect(res.body).is.an.instanceOf(Array)
    //                     expect(res.body.length).to.eql(0)
    //                 })
    //         })
    //     })
    //
    //     context('when the child_id is invalid', () => {
    //         it('should return status code 400 and a info message about the invalid child_id', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             await createActivity({
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //                 child_id: defaultActivity.child_id
    //             })
    //
    //             return request
    //                 .get(`/users/children/123/physicalactivities`)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body).to.have.property('code')
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body).to.have.property('message')
    //                     expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
    //                     expect(err.body).to.have.property('description')
    //                     expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
    //                 })
    //         })
    //     })
    //
    //     context('when get physical activity using the "query-strings-parser" library', () => {
    //         it('should return status code 200 and the result as needed in the query', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             await createActivity({
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //                 child_id: defaultActivity.child_id
    //             })
    //
    //             const url = `/users/children/${defaultActivity.child_id}/physicalactivities?child_id=${defaultActivity.child_id}
    //                 &fields=start_time,end_time,duration,child_id&sort=child_id&page=1&limit=3`
    //
    //             return request
    //                 .get(url)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(200)
    //                 .then(res => {
    //                     expect(res.body).is.an.instanceOf(Array)
    //                     expect(res.body.length).to.not.eql(0)
    //                     // Check for the existence of properties only in the first element of the array
    //                     // because there is a guarantee that there will be at least one object with the property
    //                     // 'climatized' = true (the only query filter)
    //                     expect(res.body[0]).to.have.property('id')
    //                     expect(res.body[0]).to.have.property('start_time')
    //                     expect(res.body[0].start_time).to.eql(defaultActivity.start_time!.toISOString())
    //                     expect(res.body[0]).to.have.property('end_time')
    //                     expect(res.body[0].end_time).to.eql(defaultActivity.end_time!.toISOString())
    //                     expect(res.body[0]).to.have.property('duration')
    //                     expect(res.body[0].duration).to.eql(defaultActivity.duration)
    //                     expect(res.body[0]).to.have.property('child_id')
    //                     expect(res.body[0].child_id).to.eql(defaultActivity.child_id)
    //                 })
    //         })
    //     })
    //
    //     context('when there is an attempt to get physical activity of a specific child using the "query-strings-parser" library but ' +
    //         'this physical activity does not exist', () => {
    //         it('should return status code 200 and an empty list', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             const url = `/users/children/${defaultActivity.child_id}/physicalactivities?child_id=${defaultActivity.child_id}
    //                 &fields=start_time,end_time,duration,child_id&sort=child_id&page=1&limit=3`
    //
    //             return request
    //                 .get(url)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(200)
    //                 .then(res => {
    //                     expect(res.body).is.an.instanceOf(Array)
    //                     expect(res.body.length).to.eql(0)
    //                 })
    //         })
    //     })
    //
    //     context('when there is an attempt to get physical activity of a specific child using the "query-strings-parser" library ' +
    //         'but the child_id is invalid', () => {
    //         it('should return status code 400 and a info message about the invalid child_id', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             await createActivity({
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //                 child_id: defaultActivity.child_id
    //             })
    //
    //             const url = `/users/children/123/physicalactivities?child_id=${defaultActivity.child_id}&fields=start_time,end_time,
    //                 duration,child_id&sort=child_id&page=1&limit=3`
    //
    //             return request
    //                 .get(url)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body).to.have.property('code')
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body).to.have.property('message')
    //                     expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
    //                     expect(err.body).to.have.property('description')
    //                     expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
    //                 })
    //         })
    //     })
    // })
    // /**
    //  * Route GET a physical activity by child
    //  */
    // describe('GET /users/children/:child_id/physicalactivities/:physicalactivity_id', () => {
    //     context('when get a specific physical activity of a child of the database successfully', () => {
    //         it('should return status code 200 and that specific physical activity of that child', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             const result = await createActivity({
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //                 child_id: defaultActivity.child_id
    //             })
    //
    //             return request
    //                 .get(`/users/children/${result.child_id}/physicalactivities/${result.id}`)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(200)
    //                 .then(res => {
    //                     // Check for the existence of properties only in the first element of the array
    //                     // because there is a guarantee that there will be at least one object, which was
    //                     // created in the case of POST route success test
    //                     expect(res.body).to.have.property('id')
    //                     expect(res.body.id).to.eql(result.id)
    //                     expect(res.body).to.have.property('start_time')
    //                     expect(res.body.start_time).to.eql(result.start_time!.toISOString())
    //                     expect(res.body).to.have.property('end_time')
    //                     expect(res.body.end_time).to.eql(result.end_time!.toISOString())
    //                     expect(res.body).to.have.property('duration')
    //                     expect(res.body.duration).to.eql(result.duration)
    //                     expect(res.body).to.have.property('child_id')
    //                     expect(res.body.child_id).to.eql(result.child_id.toString())
    //                 })
    //         })
    //     })
    //
    //     context('when there are that specific physical activity associated with that child in the database', () => {
    //         it('should return status code 404 and a info message describing that physical activity was not found', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             return request
    //                 .get(`/users/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(404)
    //                 .then(err => {
    //                     expect(err.body).to.have.property('code')
    //                     expect(err.body.code).to.eql(404)
    //                     expect(err.body).to.have.property('message')
    //                     expect(err.body.message).to.eql('physical activity not found!')
    //                     expect(err.body).to.have.property('description')
    //                     expect(err.body.description).to.eql('physical activity not found or already removed. A new operation for ' +
    //                         'the same resource is not required!')
    //                 })
    //         })
    //     })
    //
    //     context('when the child_id is invalid', () => {
    //         it('should return status code 400 and a info message about the invalid child_id', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             const result = await createActivity({
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //                 child_id: defaultActivity.child_id
    //             })
    //
    //             return request
    //                 .get(`/users/children/123/physicalactivities/${result.id}`)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body).to.have.property('code')
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body).to.have.property('message')
    //                     expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
    //                     expect(err.body).to.have.property('description')
    //                     expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
    //                 })
    //         })
    //     })
    //
    //     context('when the physical activity id is invalid', () => {
    //         it('should return status code 400 and a info message about the invalid physical activity id', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             const result = await createActivity({
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //                 child_id: defaultActivity.child_id
    //             })
    //
    //             return request
    //                 .get(`/users/children/${result.child_id}/physicalactivities/123`)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body).to.have.property('code')
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body).to.have.property('message')
    //                     expect(err.body.message).to.eql(Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
    //                     expect(err.body).to.have.property('description')
    //                     expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
    //                 })
    //         })
    //     })
    //
    //     context('when get a specific physical activity of a child using the "query-strings-parser" library', () => {
    //         it('should return status code 200 and the result as needed in the query', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             const result = await createActivity({
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //                 child_id: defaultActivity.child_id
    //             })
    //
    //             const url = `/users/children/${result.child_id}/physicalactivities/${result.id}?child_id=${result.child_id}
    //                 &fields=start_time,end_time,duration,child_id&sort=child_id&page=1&limit=3`
    //
    //             return request
    //                 .get(url)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(200)
    //                 .then(res => {
    //                     expect(res.body).to.have.property('id')
    //                     expect(res.body.id).to.eql(result.id)
    //                     expect(res.body).to.have.property('start_time')
    //                     expect(res.body.start_time).to.eql(result.start_time!.toISOString())
    //                     expect(res.body).to.have.property('end_time')
    //                     expect(res.body.end_time).to.eql(result.end_time!.toISOString())
    //                     expect(res.body).to.have.property('duration')
    //                     expect(res.body.duration).to.eql(result.duration)
    //                     expect(res.body).to.have.property('child_id')
    //                     expect(res.body.child_id).to.eql(result.child_id.toString())
    //                 })
    //         })
    //     })
    //
    //     context('when there is an attempt to get a specific physical activity using the "query-strings-parser" library ' +
    //         'but this physical activity does not exist', () => {
    //         it('should return status code 404 and a info message describing that physical activity was not found', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             const url = `/users/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}
    //                 ?child_id=${defaultActivity.child_id}&fields=start_time,end_time, duration,child_id
    //                 &sort=child_id&page=1&limit=3`
    //
    //             return request
    //                 .get(url)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(404)
    //                 .then(err => {
    //                     expect(err.body).to.have.property('code')
    //                     expect(err.body.code).to.eql(404)
    //                     expect(err.body).to.have.property('message')
    //                     expect(err.body.message).to.eql('physical activity not found!')
    //                     expect(err.body).to.have.property('description')
    //                     expect(err.body.description).to.eql('physical activity not found or already removed. A new operation for ' +
    //                         'the same resource is not required!')
    //                 })
    //         })
    //     })
    //
    //     context('when there is an attempt to get a specific physical activity using the "query-strings-parser" library but the ' +
    //         'child_id is invalid', () => {
    //         it('should return status code 400 and a info message about the invalid child_id', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             const result = await createActivity({
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //                 child_id: defaultActivity.child_id
    //             })
    //
    //             const url = `/users/children/123/physicalactivities/${result.id}?child_id=${result.child_id}&fields=start_time,end_time,
    //                 duration,child_id&sort=child_id&page=1&limit=3`
    //
    //             return request
    //                 .get(url)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body).to.have.property('code')
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body).to.have.property('message')
    //                     expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
    //                     expect(err.body).to.have.property('description')
    //                     expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
    //                 })
    //         })
    //     })
    //
    //     context('when there is an attempt to get a specific physical activity using the "query-strings-parser" library but the ' +
    //         'physical activity id is invalid', () => {
    //         it('should return status code 400 and a info message about the invalid physical activity id', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             const result = await createActivity({
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //                 child_id: defaultActivity.child_id
    //             })
    //
    //             const url = `/users/children/${result.child_id}/physicalactivities/123?child_id=${result.child_id}
    //                 &fields=start_time,end_time,duration,child_id&sort=child_id&page=1&limit=3`
    //
    //             return request
    //                 .get(url)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body).to.have.property('code')
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body).to.have.property('message')
    //                     expect(err.body.message).to.eql(Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
    //                     expect(err.body).to.have.property('description')
    //                     expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
    //                 })
    //         })
    //     })
    // })
    // /**
    //  * PATCH route
    //  */
    // describe('PATCH /users/children/:child_id/physicalactivities/:physicalactivity_id', () => {
    //     context('when this physical activity exists in the database and is updated successfully', () => {
    //         it('should return status code 200 and the updated physical activity', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             // physical activity to be updated
    //             const result = await createActivityToBeUpdated(defaultActivity)
    //
    //             // physical activity to update
    //             const body = {
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //             }
    //
    //             return request
    //                 .patch(`/users/children/${result.child_id}/physicalactivities/${result.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(200)
    //                 .then(res => {
    //                     expect(res.body).to.have.property('id')
    //                     expect(res.body).to.have.property('start_time')
    //                     expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
    //                     expect(res.body).to.have.property('end_time')
    //                     expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
    //                     expect(res.body).to.have.property('duration')
    //                     expect(res.body.duration).to.eql(defaultActivity.duration)
    //                     expect(res.body).to.have.property('child_id')
    //                     expect(res.body.child_id).to.eql(defaultActivity.child_id)
    //                 })
    //         })
    //     })
    //
    //     context('when physical activity does not exist in the database', () => {
    //         it('should return status code 404 and a info message about the error on the search', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             // physical activity to update
    //             const body = {
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //             }
    //
    //             return request
    //                 .patch(`/users/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(404)
    //                 .then(err => {
    //                     expect(err.body).to.have.property('code')
    //                     expect(err.body.code).to.eql(404)
    //                     expect(err.body).to.have.property('message')
    //                     expect(err.body.message).to.eql('physical activity not found!')
    //                     expect(err.body).to.have.property('description')
    //                     expect(err.body.description).to.eql('physical activity not found or already removed. A new operation for ' +
    //                         'the same resource is not required!')
    //                 })
    //         })
    //     })
    //
    //     context('when the child_id is invalid', () => {
    //         it('should return status code 400 and a info message about the invalid child_id', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             // physical activity to be updated
    //             const result = await createActivityToBeUpdated(defaultActivity)
    //
    //             // physical activity to update
    //             const body = {
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //             }
    //
    //             return request
    //                 .patch(`/users/children/123/physicalactivities/${result.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body).to.have.property('code')
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body).to.have.property('message')
    //                     expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
    //                     expect(err.body).to.have.property('description')
    //                     expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
    //                 })
    //         })
    //     })
    //
    //     context('when the physical activity id is invalid', () => {
    //         it('should return status code 400 and a info message about the invalid physical activity id', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             // physical activity to be updated
    //             const result = await createActivityToBeUpdated(defaultActivity)
    //
    //             // physical activity to update
    //             const body = {
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //             }
    //
    //             return request
    //                 .patch(`/users/children/${result.child_id}/physicalactivities/123`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body).to.have.property('code')
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body).to.have.property('message')
    //                     expect(err.body.message).to.eql(Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
    //                     expect(err.body).to.have.property('description')
    //                     expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
    //                 })
    //         })
    //     })
    //
    //     context('when a validation error occurs (the duration is negative)', () => {
    //         it('should return status code 400 and info message about the invalid duration', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             // physical activity to be updated
    //             const result = await createActivityToBeUpdated(defaultActivity)
    //
    //             // physical activity to update
    //             const body = {
    //                 duration: -(defaultActivity.duration!)
    //             }
    //
    //             return request
    //                 .patch(`/users/children/${result.child_id}/physicalactivities/${result.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body).to.have.property('code')
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body).to.have.property('message')
    //                     expect(err.body.message).to.eql('Duration field is invalid...')
    //                     expect(err.body).to.have.property('description')
    //                     expect(err.body.description).to.eql('physical activity validation failed: The value provided
    //                     has a negative value!')
    //                 })
    //         })
    //     })
    // })
    // /**
    //  * DELETE route
    //  */
    // describe('DELETE /users/children/:child_id/physicalactivities/:physicalactivity_id', () => {
    //     context('when the physical activity was deleted successfully', () => {
    //         it('should return status code 204 and no content for physical activity', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             const result = await createActivity({
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //                 child_id: defaultActivity.child_id
    //             })
    //
    //             return request
    //                 .delete(`/users/children/${result.child_id}/physicalactivities/${result.id}`)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(204)
    //                 .then(res => {
    //                     expect(res.body).to.eql({})
    //                 })
    //         })
    //     })
    //
    //     context('when the physical activity is not found', () => {
    //         it('should return status code 204 and no content for physical activity', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             return request
    //                 .delete(`/users/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(204)
    //                 .then(res => {
    //                     expect(res.body).to.eql({})
    //                 })
    //         })
    //     })
    //
    //     context('when the child_id is invalid', () => {
    //         it('should return status code 400 and a info message about the invalid child_id', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             const result = await createActivity({
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //                 child_id: defaultActivity.child_id
    //             })
    //
    //             return request
    //                 .delete(`/users/children/123/physicalactivities/${result.id}`)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body).to.have.property('code')
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body).to.have.property('message')
    //                     expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
    //                     expect(err.body).to.have.property('description')
    //                     expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
    //                 })
    //         })
    //     })
    //
    //     context('when the physical activity id is invalid', () => {
    //         it('should return status code 400 and a info message about the invalid physical activity id', async () => {
    //             try {
    //                 await deleteAllActivity({})
    //             } catch (err) { //
    //             }
    //
    //             const result = await createActivity({
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //                 child_id: defaultActivity.child_id
    //             })
    //
    //             return request
    //                 .delete(`/users/children/${result.child_id}/physicalactivities/123`)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body).to.have.property('code')
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body).to.have.property('message')
    //                     expect(err.body.message).to.eql(Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
    //                     expect(err.body).to.have.property('description')
    //                     expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
    //                 })
    //         })
    //     })
    // })
})
//
// async function createActivity(item): Promise<any> {
//     return await Promise.resolve(ActivityRepoModel.create(item))
// }
//
// function deleteAllActivity(doc): void {
//     ActivityRepoModel.deleteMany({}, err => {
//         if (err) console.log('err: ' + err)
//     })
// }
//
// async function createActivityToBeUpdated(defaultActivity: PhysicalActivity): Promise<any> {
//     // physical activity to be updated
//     const result =  createActivity({
//         start_time: defaultActivity.start_time,
//         end_time: defaultActivity.end_time,
//         duration: defaultActivity.duration,
//         child_id: defaultActivity.child_id
//     })
//
//     return await Promise.resolve(result)
// }
