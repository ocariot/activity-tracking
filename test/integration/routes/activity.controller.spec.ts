import HttpStatus from 'http-status-codes'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { expect } from 'chai'
import { Strings } from '../../../src/utils/strings'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { ActivityLevelType, PhysicalActivityLevel } from '../../../src/application/domain/model/physical.activity.level'
import { ActivityRepoModel } from '../../../src/infrastructure/database/schema/activity.schema'
import { PhysicalActivityMock } from '../../mocks/physical.activity.mock'
import { PhysicalActivityEntityMapper } from '../../../src/infrastructure/entity/mapper/physical.activity.entity.mapper'
import { ObjectID } from 'bson'
import { PhysicalActivityHeartRate } from '../../../src/application/domain/model/physical.activity.heart.rate'
import { HeartRateZone } from '../../../src/application/domain/model/heart.rate.zone'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { Default } from '../../../src/utils/default'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const app: App = DIContainer.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: children.physicalactivities', () => {

    // Mock objects for PhysicalActivity routes
    const defaultActivity: PhysicalActivity = new PhysicalActivityMock()
    const otherActivity: PhysicalActivity = new PhysicalActivityMock()
    otherActivity.child_id = '5a62be07de34500146d9c542'

    /**
     * Mock objects for POST route with multiple activities
     */
        // Mock through JSON
    const incorrectActivityJSON: any = {
            id: new ObjectID(),
            start_time: new Date('2018-12-14T12:52:59Z'),
            end_time: new Date('2018-12-14T13:12:37Z'),
            duration: 1178000,
            child_id: '5a62be07de34500146d9c544',
            name: 'walk',
            calories: 200,
            steps: 1000,
            distance: 1000,
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
            ],
            heart_rate: {
                average: 107,
                out_of_range_zone: {
                    min: 30,
                    max: 91,
                    duration: 0
                },
                fat_burn_zone: {
                    min: 91,
                    max: 127,
                    duration: 0
                },
                cardio_zone: {
                    min: 127,
                    max: 154,
                    duration: 0
                },
                peak_zone: {
                    min: 154,
                    max: 220,
                    duration: 0
                },
            }
        }

    // Array with correct activities
    const correctActivitiesArr: Array<PhysicalActivity> = new Array<PhysicalActivityMock>()
    for (let i = 0; i < 3; i++) {
        correctActivitiesArr.push(new PhysicalActivityMock())
    }

    // Incorrect activities
    const incorrectActivity1: PhysicalActivity = new PhysicalActivity()        // Without all required fields

    const incorrectActivity2: PhysicalActivity = new PhysicalActivityMock()    // Without PhysicalActivity fields
    incorrectActivity2.name = undefined
    incorrectActivity2.calories = undefined

    const incorrectActivity3: PhysicalActivity = new PhysicalActivityMock()    // start_time with a date newer than end_time
    incorrectActivity3.start_time = new Date('2018-12-15T12:52:59Z')
    incorrectActivity3.end_time = new Date('2018-12-14T13:12:37Z')

    // The duration is incompatible with the start_time and end_time parameters
    const incorrectActivity4: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivity4.duration = 11780000

    const incorrectActivity5: PhysicalActivity = new PhysicalActivityMock()    // The duration is negative
    incorrectActivity5.duration = -11780000

    const incorrectActivity6: PhysicalActivity = new PhysicalActivityMock()    // The calories parameter is negative
    incorrectActivity6.calories = -200

    const incorrectActivity7: PhysicalActivity = new PhysicalActivityMock()    // The steps parameter is negative
    incorrectActivity7.steps = -1000

    let incorrectActivity8: PhysicalActivity = new PhysicalActivityMock()    // The levels array has an item with an invalid type
    incorrectActivity8 = incorrectActivity8.fromJSON(incorrectActivityJSON)

    let incorrectActivity9: PhysicalActivity = new PhysicalActivityMock()    // The levels array has an item that contains empty fields
    incorrectActivityJSON.levels[0].name = undefined
    incorrectActivityJSON.levels[0].duration = undefined
    incorrectActivity9 = incorrectActivity9.fromJSON(incorrectActivityJSON)

    // The levels array has an item that contains negative duration
    let incorrectActivity10: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivityJSON.levels[0].name = ActivityLevelType.SEDENTARY
    incorrectActivityJSON.levels[0].duration = -(Math.floor((Math.random() * 10 + 1) * 60000))
    incorrectActivity10 = incorrectActivity10.fromJSON(incorrectActivityJSON)

    // The PhysicalActivityHeartRate is empty
    const incorrectActivity11: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivity11.heart_rate = new PhysicalActivityHeartRate()

    // The PhysicalActivityHeartRate average is negative
    const incorrectActivity12: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivity12.heart_rate!.average = -120

    // The PhysicalActivityHeartRate is invalid (the "Fat Burn Zone" parameter is empty)
    const incorrectActivity13: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivity13.heart_rate!.fat_burn_zone = new HeartRateZone()

    // The PhysicalActivityHeartRate is invalid (the "Fat Burn Zone" parameter has a negative duration)
    const incorrectActivity14: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivity14.heart_rate!.fat_burn_zone!.duration = -600000

    const incorrectActivity15: PhysicalActivity = new PhysicalActivityMock()     // The start_time is invalid
    incorrectActivity15.start_time = new Date('2019-12-32T12:52:59Z')
    incorrectActivity15.end_time = new Date('2020-01-01T12:52:59Z')

    // Array with correct and incorrect activities
    const mixedActivitiesArr: Array<PhysicalActivity> = new Array<PhysicalActivityMock>()
    mixedActivitiesArr.push(new PhysicalActivityMock())
    mixedActivitiesArr.push(incorrectActivity1)

    // Array with only incorrect activities
    const incorrectActivitiesArr: Array<PhysicalActivity> = new Array<PhysicalActivityMock>()
    incorrectActivitiesArr.push(incorrectActivity1)
    incorrectActivitiesArr.push(incorrectActivity2)
    incorrectActivitiesArr.push(incorrectActivity3)
    incorrectActivitiesArr.push(incorrectActivity4)
    incorrectActivitiesArr.push(incorrectActivity5)
    incorrectActivitiesArr.push(incorrectActivity6)
    incorrectActivitiesArr.push(incorrectActivity7)
    incorrectActivitiesArr.push(incorrectActivity8)
    incorrectActivitiesArr.push(incorrectActivity9)
    incorrectActivitiesArr.push(incorrectActivity10)
    incorrectActivitiesArr.push(incorrectActivity11)
    incorrectActivitiesArr.push(incorrectActivity12)
    incorrectActivitiesArr.push(incorrectActivity13)
    incorrectActivitiesArr.push(incorrectActivity14)
    incorrectActivitiesArr.push(incorrectActivity15)

    // Start services
    before(async () => {
        try {
            await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)

            await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })

            await deleteAllActivities()
        } catch (err) {
            throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
        }
    })

    // Delete all physical activity objects from the database
    after(async () => {
        try {
            await deleteAllActivities()
            await dbConnection.dispose()
            await rabbitmq.dispose()
        } catch (err) {
            throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
        }
    })
    /**
     * POST route to PhysicalActivity with only one item of this type in the body
     */
    describe('RABBITMQ PUBLISHER -> POST /v1/children/:child_id/physicalactivities with only one PhysicalActivity in the body', () => {
        context('when posting a new PhysicalActivity with success and publishing it to the bus', () => {
            const body = {
                name: defaultActivity.name,
                start_time: defaultActivity.start_time,
                end_time: defaultActivity.end_time,
                duration: defaultActivity.duration,
                calories: defaultActivity.calories,
                steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
            }

            before(async () => {
                try {
                    await deleteAllActivities()

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })

            after(async () => {
                try {
                    await rabbitmq.dispose()
                    await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities test: ' + err.message)
                }
            })

            it('The subscriber should receive a message in the correct format and with the same values as the activity ' +
                'published on the bus', (done) => {
                rabbitmq.bus
                    .subSavePhysicalActivity(message => {
                        try {
                            expect(message.event_name).to.eql('PhysicalActivitySaveEvent')
                            expect(message).to.have.property('timestamp')
                            expect(message).to.have.property('physicalactivity')
                            expect(message.physicalactivity).to.have.property('id')
                            expect(message.physicalactivity.name).to.eql(defaultActivity.name)
                            expect(message.physicalactivity.start_time).to.eql(defaultActivity.start_time!.toISOString().substr(0, 19))
                            expect(message.physicalactivity.end_time).to.eql(defaultActivity.end_time!.toISOString().substr(0, 19))
                            expect(message.physicalactivity.duration).to.eql(defaultActivity.duration)
                            expect(message.physicalactivity.calories).to.eql(defaultActivity.calories)
                            if (message.physicalactivity.steps) {
                                expect(message.physicalactivity.steps).to.eql(defaultActivity.steps)
                            }
                            expect(message.physicalactivity.distance).to.eql(defaultActivity.distance)
                            expect(message.physicalactivity.levels)
                                .to.eql(defaultActivity.levels!.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                            expect(message.physicalactivity.heart_rate).to.eql(defaultActivity.heart_rate!.toJSON())
                            expect(message.physicalactivity.child_id).to.eql(defaultActivity.child_id)
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
                    .then(() => {
                        request
                            .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                            .send(body)
                            .set('Content-Type', 'application/json')
                            .expect(201)
                            .then()
                            .catch(done)
                    })
                    .catch(done)
            })
        })
    })

    describe('POST /v1/children/:child_id/physicalactivities with only one PhysicalActivity in the body', () => {
        context('when posting a new PhysicalActivity with success (there is no connection to RabbitMQ)', () => {
            before(async () => {
                try {
                    await deleteAllActivities()
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })
            it('should return status code 201 and the saved PhysicalActivity (and show an error log about unable to send ' +
                'SavePhysicalActivity event)', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: `${defaultActivity.duration}`,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: [
                        {
                            name: ActivityLevelType.SEDENTARY,
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
                    ],
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString().substr(0, 19))
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString().substr(0, 19))
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        if (res.body.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        expect(res.body.distance).to.eql(defaultActivity.distance)
                        expect(res.body).to.have.property('levels')
                        expect(res.body.heart_rate).to.eql(defaultActivity.heart_rate!.toJSON())
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            before(async () => {
                try {
                    await deleteAllActivities()

                    await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined,
                        child_id: defaultActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })
            it('should return status code 409 and an info message about duplicate items', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.code).to.eql(409)
                        expect(err.body.message).to.eql(Strings.PHYSICAL_ACTIVITY.ALREADY_REGISTERED)
                    })
            })
        })

        context('when a validation error occurs (missing all the activity required fields)', () => {
            it('should return status code 400 and info message about the activity missing fields', () => {
                const body = {}

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'start_time, end_time, duration, name, calories'))
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
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'name, calories'))
                    })
            })
        })

        context('when a validation error occurs (duration does not have a valid number)', () => {
            it('should return status code 400 and info message about the invalid duration', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: `${defaultActivity.duration}a`,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.NEGATIVE_INTEGER
                            .replace('{0}', 'duration'))
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
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_START_TIME)
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
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql('duration value does not match values passed in ' +
                            'start_time and end_time parameters!')
                    })
            })
        })

        context('when a validation error occurs (start_time with an invalid day)', () => {
            it('should return status code 400 and info message about the invalid date', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: '2019-12-35T12:52:59Z',
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATETIME_FORMAT.
                        replace('{0}', '2019-12-35T12:52:59Z'))
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
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.NEGATIVE_INTEGER
                            .replace('{0}', 'duration'))
                    })
            })
        })

        context('when a validation error occurs (child_id is invalid)', () => {
            it('should return status code 400 and info message about the invalid child_id', () => {
                const body = {
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: -(defaultActivity.calories!),
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/123/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when a validation error occurs (the name parameter is empty)', () => {
            it('should return status code 400 and info message about the invalid parameter of name', () => {
                const body = {
                    name: '',
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.EMPTY_STRING.replace('{0}', 'name'))
                    })
            })
        })

        context('when a validation error occurs (the name parameter is invalid)', () => {
            it('should return status code 400 and info message about the invalid parameter of name', () => {
                const body = {
                    name: 123,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INVALID_STRING.replace('{0}', 'name'))
                    })
            })
        })

        context('when a validation error occurs (the calories parameter is invalid)', () => {
            it('should return status code 400 and info message about the invalid parameter of calories', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: `${defaultActivity.calories}a`,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER
                            .replace('{0}', 'calories'))
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
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER
                            .replace('{0}', 'calories'))
                    })
            })
        })

        context('when a validation error occurs (the steps parameter is invalid)', () => {
            it('should return status code 400 and info message about the invalid parameter of steps', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: '200a',
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.NEGATIVE_INTEGER
                            .replace('{0}', 'steps'))
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
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.NEGATIVE_INTEGER
                            .replace('{0}', 'steps'))
                    })
            })
        })

        context('when a validation error occurs (the distance parameter is invalid)', () => {
            it('should return status code 400 and info message about the invalid parameter of distance', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    distance: '1000a',
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER
                            .replace('{0}', 'distance'))
                    })
            })
        })

        context('when a validation error occurs (the distance parameter is negative)', () => {
            it('should return status code 400 and info message about the invalid parameter of distance', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    distance: -1000,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER
                            .replace('{0}', 'distance'))
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
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
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
                    ],
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql('The names of the allowed levels are: ' +
                            'sedentary, lightly, fairly, very.')
                    })
            })
        })

        context('when a validation error occurs (the levels array has an item with an invalid duration)', () => {
            it('should return status code 400 and info message about the invalid levels array', () => {
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: [
                        {
                            name: ActivityLevelType.SEDENTARY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.LIGHTLY,
                            duration: `${Math.floor((Math.random() * 10) * 60000)}a`
                        },
                        {
                            name: ActivityLevelType.FAIRLY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        },
                        {
                            name: ActivityLevelType.VERY,
                            duration: Math.floor((Math.random() * 10) * 60000)
                        }
                    ],
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.NEGATIVE_INTEGER
                            .replace('{0}', 'levels.duration'))
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
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: [
                        {
                            name: undefined,
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
                    ],
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql('The levels array must have values for the following ' +
                            'levels: sedentary, lightly, fairly, very.')
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
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: [
                        {
                            name: ActivityLevelType.SEDENTARY,
                            duration: -(Math.floor((Math.random() * 10 + 1) * 60000))
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
                    ],
                    heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.NEGATIVE_INTEGER
                            .replace('{0}', 'levels.duration'))
                    })
            })
        })

        context('when a validation error occurs (the PhysicalActivityHeartRate is empty)', () => {
            it('should return status code 400 and info message about the invalid PhysicalActivityHeartRate parameter',
                () => {
                const body = {
                    name: incorrectActivity11.name,
                    start_time: incorrectActivity11.start_time,
                    end_time: incorrectActivity11.end_time,
                    duration: incorrectActivity11.duration,
                    calories: incorrectActivity11.calories,
                    steps: incorrectActivity11.steps ? incorrectActivity11.steps : undefined,
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: incorrectActivity11.levels ? incorrectActivity11.levels : undefined,
                    heart_rate: incorrectActivity11.heart_rate ? incorrectActivity11.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${incorrectActivity11.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(err.body.description).to.eql( Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'heart_rate.average, heart_rate.out_of_range_zone, ' +
                                'heart_rate.fat_burn_zone, heart_rate.cardio_zone, heart_rate.peak_zone'))
                    })
            })
        })

        context('when a validation error occurs (the PhysicalActivityHeartRate has an invalid average parameter)', () => {
            before(() => {
                incorrectActivityJSON.heart_rate.average = 'abc'
            })
            after(() => {
                incorrectActivityJSON.heart_rate.average = 107
            })
            it('should return status code 400 and info message about the invalid PhysicalActivityHeartRate parameter',
                () => {
                const body = {
                    name: incorrectActivity12.name,
                    start_time: incorrectActivity12.start_time,
                    end_time: incorrectActivity12.end_time,
                    duration: incorrectActivity12.duration,
                    calories: incorrectActivity12.calories,
                    steps: incorrectActivity12.steps ? incorrectActivity12.steps : undefined,
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: incorrectActivity12.levels ? incorrectActivity12.levels : undefined,
                    heart_rate: incorrectActivityJSON.heart_rate
                }

                return request
                    .post(`/v1/children/${incorrectActivity12.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO
                            .replace('{0}', 'heart_rate.average'))
                    })
            })
        })

        context('when a validation error occurs (the PhysicalActivityHeartRate has a negative average parameter)', () => {
            it('should return status code 400 and info message about the invalid PhysicalActivityHeartRate parameter',
                () => {
                const body = {
                    name: incorrectActivity12.name,
                    start_time: incorrectActivity12.start_time,
                    end_time: incorrectActivity12.end_time,
                    duration: incorrectActivity12.duration,
                    calories: incorrectActivity12.calories,
                    steps: incorrectActivity12.steps ? incorrectActivity12.steps : undefined,
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: incorrectActivity12.levels ? incorrectActivity12.levels : undefined,
                    heart_rate: incorrectActivity12.heart_rate ? incorrectActivity12.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${incorrectActivity12.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO
                            .replace('{0}', 'heart_rate.average'))
                    })
            })
        })

        context('when a validation error occurs (the "Fat Burn Zone" parameter of PhysicalActivityHeartRate is empty)', () => {
            it('should return status code 400 and info message about the invalid PhysicalActivityHeartRate parameter',
                () => {
                const body = {
                    name: incorrectActivity13.name,
                    start_time: incorrectActivity13.start_time,
                    end_time: incorrectActivity13.end_time,
                    duration: incorrectActivity13.duration,
                    calories: incorrectActivity13.calories,
                    steps: incorrectActivity13.steps ? incorrectActivity13.steps : undefined,
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: incorrectActivity13.levels ? incorrectActivity13.levels : undefined,
                    heart_rate: incorrectActivity13.heart_rate ? incorrectActivity13.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${incorrectActivity13.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'heart_rate.fat_burn_zone.min, heart_rate.fat_burn_zone.max, ' +
                                'heart_rate.fat_burn_zone.duration'))
                    })
            })
        })

        context('when a validation error occurs (the "Fat Burn Zone" parameter of PhysicalActivityHeartRate ' +
            'has an invalid min)', () => {
            before(() => {
                incorrectActivityJSON.heart_rate.fat_burn_zone.min = 'abc'
            })
            after(() => {
                incorrectActivityJSON.heart_rate.fat_burn_zone.min = 91
            })
            it('should return status code 400 and info message about the invalid PhysicalActivityHeartRate parameter',
                () => {
                const body = {
                    name: incorrectActivity14.name,
                    start_time: incorrectActivity14.start_time,
                    end_time: incorrectActivity14.end_time,
                    duration: incorrectActivity14.duration,
                    calories: incorrectActivity14.calories,
                    steps: incorrectActivity14.steps ? incorrectActivity14.steps : undefined,
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: incorrectActivity14.levels ? incorrectActivity14.levels : undefined,
                    heart_rate: incorrectActivityJSON.heart_rate
                }

                return request
                    .post(`/v1/children/${incorrectActivity14.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO
                            .replace('{0}', 'heart_rate.fat_burn_zone.min'))
                    })
            })
        })

        context('when a validation error occurs (the "Fat Burn Zone" parameter of PhysicalActivityHeartRate ' +
            'has a negative min)', () => {
            before(() => {
                incorrectActivityJSON.heart_rate.fat_burn_zone.min = -91
            })
            after(() => {
                incorrectActivityJSON.heart_rate.fat_burn_zone.min = 91
            })
            it('should return status code 400 and info message about the invalid PhysicalActivityHeartRate parameter',
                () => {
                    const body = {
                        name: incorrectActivity14.name,
                        start_time: incorrectActivity14.start_time,
                        end_time: incorrectActivity14.end_time,
                        duration: incorrectActivity14.duration,
                        calories: incorrectActivity14.calories,
                        steps: incorrectActivity14.steps ? incorrectActivity14.steps : undefined,
                        distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                        levels: incorrectActivity14.levels ? incorrectActivity14.levels : undefined,
                        heart_rate: incorrectActivityJSON.heart_rate
                    }

                    return request
                        .post(`/v1/children/${incorrectActivity14.child_id}/physicalactivities`)
                        .send(body)
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body.code).to.eql(400)
                            expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                            expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO
                                .replace('{0}', 'heart_rate.fat_burn_zone.min'))
                        })
                })
        })

        context('when a validation error occurs (the "Fat Burn Zone" parameter of PhysicalActivityHeartRate ' +
            'has an invalid max)', () => {
            before(() => {
                incorrectActivityJSON.heart_rate.fat_burn_zone.max = 'abc'
            })
            after(() => {
                incorrectActivityJSON.heart_rate.fat_burn_zone.max = 127
            })
            it('should return status code 400 and info message about the invalid PhysicalActivityHeartRate parameter',
                () => {
                    const body = {
                        name: incorrectActivity14.name,
                        start_time: incorrectActivity14.start_time,
                        end_time: incorrectActivity14.end_time,
                        duration: incorrectActivity14.duration,
                        calories: incorrectActivity14.calories,
                        steps: incorrectActivity14.steps ? incorrectActivity14.steps : undefined,
                        distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                        levels: incorrectActivity14.levels ? incorrectActivity14.levels : undefined,
                        heart_rate: incorrectActivityJSON.heart_rate
                    }

                    return request
                        .post(`/v1/children/${incorrectActivity14.child_id}/physicalactivities`)
                        .send(body)
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body.code).to.eql(400)
                            expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                            expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO
                                .replace('{0}', 'heart_rate.fat_burn_zone.max'))
                        })
                })
        })

        context('when a validation error occurs (the "Fat Burn Zone" parameter of PhysicalActivityHeartRate ' +
            'has a negative max)', () => {
            before(() => {
                incorrectActivityJSON.heart_rate.fat_burn_zone.max = -127
            })
            after(() => {
                incorrectActivityJSON.heart_rate.fat_burn_zone.max = 127
            })
            it('should return status code 400 and info message about the invalid PhysicalActivityHeartRate parameter',
                () => {
                    const body = {
                        name: incorrectActivity14.name,
                        start_time: incorrectActivity14.start_time,
                        end_time: incorrectActivity14.end_time,
                        duration: incorrectActivity14.duration,
                        calories: incorrectActivity14.calories,
                        steps: incorrectActivity14.steps ? incorrectActivity14.steps : undefined,
                        distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                        levels: incorrectActivity14.levels ? incorrectActivity14.levels : undefined,
                        heart_rate: incorrectActivityJSON.heart_rate
                    }

                    return request
                        .post(`/v1/children/${incorrectActivity14.child_id}/physicalactivities`)
                        .send(body)
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body.code).to.eql(400)
                            expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                            expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO
                                .replace('{0}', 'heart_rate.fat_burn_zone.max'))
                        })
                })
        })

        context('when a validation error occurs (the "Fat Burn Zone" parameter of PhysicalActivityHeartRate ' +
            'has an invalid duration)', () => {
            before(() => {
                incorrectActivityJSON.heart_rate.fat_burn_zone.duration = 'abc'
            })
            after(() => {
                incorrectActivityJSON.heart_rate.fat_burn_zone.duration = 0
            })
            it('should return status code 400 and info message about the invalid PhysicalActivityHeartRate parameter',
                () => {
                    const body = {
                        name: incorrectActivity14.name,
                        start_time: incorrectActivity14.start_time,
                        end_time: incorrectActivity14.end_time,
                        duration: incorrectActivity14.duration,
                        calories: incorrectActivity14.calories,
                        steps: incorrectActivity14.steps ? incorrectActivity14.steps : undefined,
                        distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                        levels: incorrectActivity14.levels ? incorrectActivity14.levels : undefined,
                        heart_rate: incorrectActivityJSON.heart_rate
                    }

                    return request
                        .post(`/v1/children/${incorrectActivity14.child_id}/physicalactivities`)
                        .send(body)
                        .set('Content-Type', 'application/json')
                        .expect(400)
                        .then(err => {
                            expect(err.body.code).to.eql(400)
                            expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                            expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.NEGATIVE_INTEGER
                                .replace('{0}', 'heart_rate.fat_burn_zone.duration'))
                        })
                })
        })

        context('when a validation error occurs (the "Fat Burn Zone" parameter of PhysicalActivityHeartRate ' +
            'has a negative duration)', () => {
            it('should return status code 400 and info message about the invalid PhysicalActivityHeartRate parameter',
                () => {
                const body = {
                    name: incorrectActivity14.name,
                    start_time: incorrectActivity14.start_time,
                    end_time: incorrectActivity14.end_time,
                    duration: incorrectActivity14.duration,
                    calories: incorrectActivity14.calories,
                    steps: incorrectActivity14.steps ? incorrectActivity14.steps : undefined,
                    distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                    levels: incorrectActivity14.levels ? incorrectActivity14.levels : undefined,
                    heart_rate: incorrectActivity14.heart_rate ? incorrectActivity14.heart_rate : undefined
                }

                return request
                    .post(`/v1/children/${incorrectActivity14.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.NEGATIVE_INTEGER
                            .replace('{0}', 'heart_rate.fat_burn_zone.duration'))
                    })
            })
        })
    })
    /**
     * POST route to PhysicalActivity with an array of such items in the body
     */
    describe('POST /v1/children/:child_id/physicalactivities with an array of PhysicalActivity in the body', () => {
        context('when all the activities are correct and still do not exist in the repository', () => {
            before(async () => {
                try {
                    await deleteAllActivities()
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 207, create each PhysicalActivity and return a response of type ' +
                'MultiStatus<PhysicalActivity> with the description of success in sending each one of them', () => {
                const body: any = []

                correctActivitiesArr.forEach(activity => {
                    const bodyElem = {
                        name: activity.name,
                        start_time: activity.start_time,
                        end_time: activity.end_time,
                        duration: activity.duration,
                        calories: activity.calories,
                        steps: activity.steps ? activity.steps : undefined,
                        distance: activity.distance ? activity.distance : undefined,
                        levels: activity.levels ? activity.levels : undefined,
                        heart_rate: activity.heart_rate ? activity.heart_rate : undefined
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(HttpStatus.CREATED)
                            expect(res.body.success[i].item).to.have.property('id')
                            expect(res.body.success[i].item.name).to.eql(correctActivitiesArr[i].name)
                            expect(res.body.success[i].item.start_time).to.eql(correctActivitiesArr[i].start_time!.toISOString().substr(0, 19))
                            expect(res.body.success[i].item.end_time).to.eql(correctActivitiesArr[i].end_time!.toISOString().substr(0, 19))
                            expect(res.body.success[i].item.duration).to.eql(correctActivitiesArr[i].duration)
                            expect(res.body.success[i].item.calories).to.eql(correctActivitiesArr[i].calories)
                            if (correctActivitiesArr[i].steps) {
                                expect(res.body.success[i].item.steps).to.eql(correctActivitiesArr[i].steps)
                            }
                            expect(res.body.success[i].item.distance).to.eql(correctActivitiesArr[i].distance)
                            if (correctActivitiesArr[i].levels) {
                                expect(res.body.success[i].item.levels)
                                    .to.eql(correctActivitiesArr[i].levels!.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                            }
                            if (correctActivitiesArr[i].heart_rate) {
                                expect(res.body.success[i].item.heart_rate).to.eql(correctActivitiesArr[i].heart_rate!.toJSON())
                            }
                            expect(res.body.success[i].item.child_id).to.eql(correctActivitiesArr[i].child_id)
                        }

                        expect(res.body.error.length).to.eql(0)
                    })
            })
        })

        context('when all the activities are correct but already exists in the repository', () => {
            before(async () => {
                try {
                    await deleteAllActivities()

                    for (const activity of correctActivitiesArr) {
                        await createActivity({
                            name: activity.name,
                            start_time: activity.start_time,
                            end_time: activity.end_time,
                            duration: activity.duration,
                            calories: activity.calories,
                            steps: activity.steps ? activity.steps : undefined,
                            distance: activity.distance ? activity.distance : undefined,
                            levels: activity.levels ? activity.levels : undefined,
                            heart_rate: activity.heart_rate ? activity.heart_rate : undefined,
                            child_id: activity.child_id
                        })
                    }
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })
            it('should return status code 201 and return a response of type MultiStatus<PhysicalActivity> with the ' +
                'description of conflict in sending each one of them', () => {
                const body: any = []

                correctActivitiesArr.forEach(activity => {
                    const bodyElem = {
                        name: activity.name,
                        start_time: activity.start_time,
                        end_time: activity.end_time,
                        duration: activity.duration,
                        calories: activity.calories,
                        steps: activity.steps ? activity.steps : undefined,
                        distance: activity.distance ? activity.distance : undefined,
                        levels: activity.levels ? activity.levels : undefined,
                        heart_rate: activity.heart_rate ? activity.heart_rate : undefined
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(HttpStatus.CONFLICT)
                            expect(res.body.error[i].message).to.eql(Strings.PHYSICAL_ACTIVITY.ALREADY_REGISTERED)
                            expect(res.body.error[i].item.name).to.eql(correctActivitiesArr[i].name)
                            expect(res.body.error[i].item.start_time).to.eql(correctActivitiesArr[i].start_time!.toISOString().substr(0, 19))
                            expect(res.body.error[i].item.end_time).to.eql(correctActivitiesArr[i].end_time!.toISOString().substr(0, 19))
                            expect(res.body.error[i].item.duration).to.eql(correctActivitiesArr[i].duration)
                            expect(res.body.error[i].item.calories).to.eql(correctActivitiesArr[i].calories)
                            if (correctActivitiesArr[i].steps) {
                                expect(res.body.error[i].item.steps).to.eql(correctActivitiesArr[i].steps)
                            }
                            expect(res.body.error[i].item.distance).to.eql(correctActivitiesArr[i].distance)
                            if (correctActivitiesArr[i].levels) {
                                expect(res.body.error[i].item.levels)
                                    .to.eql(correctActivitiesArr[i].levels!.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                            }
                            if (correctActivitiesArr[i].heart_rate) {
                                expect(res.body.error[i].item.heart_rate).to.eql(correctActivitiesArr[i].heart_rate!.toJSON())
                            }
                            expect(res.body.error[i].item.child_id).to.eql(correctActivitiesArr[i].child_id)
                        }

                        expect(res.body.success.length).to.eql(0)
                    })
            })
        })

        context('when there are correct and incorrect activities in the body', () => {
            before(async () => {
                try {
                    await deleteAllActivities()
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 201 and return a response of type MultiStatus<PhysicalActivity> with the ' +
                'description of success and error in each one of them', () => {
                const body: any = []

                mixedActivitiesArr.forEach(activity => {
                    const bodyElem = {
                        name: activity.name,
                        start_time: activity.start_time,
                        end_time: activity.end_time,
                        duration: activity.duration,
                        calories: activity.calories,
                        steps: activity.steps ? activity.steps : undefined,
                        distance: activity.distance ? activity.distance : undefined,
                        levels: activity.levels ? activity.levels : undefined,
                        heart_rate: activity.heart_rate ? activity.heart_rate : undefined
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        // Success item
                        expect(res.body.success[0].code).to.eql(HttpStatus.CREATED)
                        expect(res.body.success[0].item).to.have.property('id')
                        expect(res.body.success[0].item.name).to.eql(mixedActivitiesArr[0].name)
                        expect(res.body.success[0].item.start_time).to.eql(mixedActivitiesArr[0].start_time!.toISOString().substr(0, 19))
                        expect(res.body.success[0].item.end_time).to.eql(mixedActivitiesArr[0].end_time!.toISOString().substr(0, 19))
                        expect(res.body.success[0].item.duration).to.eql(mixedActivitiesArr[0].duration)
                        expect(res.body.success[0].item.calories).to.eql(mixedActivitiesArr[0].calories)
                        if (mixedActivitiesArr[0].steps) {
                            expect(res.body.success[0].item.steps).to.eql(mixedActivitiesArr[0].steps)
                        }
                        expect(res.body.success[0].item.distance).to.eql(mixedActivitiesArr[0].distance)
                        if (mixedActivitiesArr[0].levels) {
                            expect(res.body.success[0].item.levels)
                                .to.eql(mixedActivitiesArr[0].levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        if (mixedActivitiesArr[0].heart_rate) {
                            expect(res.body.success[0].item.heart_rate).to.eql(mixedActivitiesArr[0].heart_rate.toJSON())
                        }
                        expect(res.body.success[0].item.child_id).to.eql(mixedActivitiesArr[0].child_id)

                        // Error item
                        expect(res.body.error[0].code).to.eql(HttpStatus.BAD_REQUEST)
                        expect(res.body.error[0].message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(res.body.error[0].description).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'start_time, end_time, duration, name, calories'))
                    })
            })
        })

        context('when all the activities are incorrect', () => {
            before(async () => {
                try {
                    await deleteAllActivities()
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 201 and return a response of type MultiStatus<PhysicalActivity> with the ' +
                'description of error in each one of them', () => {
                const body: any = []

                incorrectActivitiesArr.forEach(activity => {
                    const bodyElem = {
                        name: activity.name,
                        start_time: activity.start_time,
                        end_time: activity.end_time,
                        duration: activity.duration,
                        calories: activity.calories,
                        steps: activity.steps ? activity.steps : undefined,
                        distance: activity.distance ? activity.distance : undefined,
                        levels: activity.levels ? activity.levels : undefined,
                        heart_rate: activity.heart_rate ? activity.heart_rate : undefined
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(207)
                    .then(res => {
                        expect(res.body.error[0].message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(res.body.error[0].description).to.eql( Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'start_time, end_time, duration, name, calories'))
                        expect(res.body.error[1].message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(res.body.error[1].description).to.eql( Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'name, calories'))
                        expect(res.body.error[2].message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(res.body.error[2].description).to.eql(Strings.ERROR_MESSAGE.INVALID_START_TIME)
                        expect(res.body.error[3].message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(res.body.error[3].description).to.eql('duration value does not match values passed ' +
                            'in start_time and end_time parameters!')
                        expect(res.body.error[4].message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(res.body.error[4].description).to.eql(Strings.ERROR_MESSAGE.NEGATIVE_INTEGER
                            .replace('{0}', 'duration'))
                        expect(res.body.error[5].message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(res.body.error[5].description).to.eql(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER
                            .replace('{0}', 'calories'))
                        expect(res.body.error[6].message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(res.body.error[6].description).to.eql(Strings.ERROR_MESSAGE.NEGATIVE_INTEGER
                            .replace('{0}', 'steps'))
                        expect(res.body.error[7].message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(res.body.error[7].description).to.eql('The names of the allowed levels are: ' +
                            'sedentary, lightly, fairly, very.')
                        expect(res.body.error[8].message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(res.body.error[8].description).to.eql('The levels array must have values for ' +
                            'the following levels: sedentary, lightly, fairly, very.')
                        expect(res.body.error[9].message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(res.body.error[9].description).to.eql(Strings.ERROR_MESSAGE.NEGATIVE_INTEGER
                            .replace('{0}', 'levels.duration'))
                        expect(res.body.error[10].message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(res.body.error[10].description).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'heart_rate.average, heart_rate.out_of_range_zone, ' +
                                'heart_rate.fat_burn_zone, heart_rate.cardio_zone, heart_rate.peak_zone'))
                        expect(res.body.error[11].message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(res.body.error[11].description).to.eql(Strings.ERROR_MESSAGE.INTEGER_GREATER_ZERO
                            .replace('{0}', 'heart_rate.average'))
                        expect(res.body.error[12].message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
                        expect(res.body.error[12].description).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS_DESC
                            .replace('{0}', 'heart_rate.fat_burn_zone.min, heart_rate.fat_burn_zone.max, ' +
                                'heart_rate.fat_burn_zone.duration'))
                        expect(res.body.error[13].message).to.eql(Strings.ERROR_MESSAGE.INVALID_FIELDS)
                        expect(res.body.error[13].description).to.eql(Strings.ERROR_MESSAGE.NEGATIVE_INTEGER
                            .replace('{0}', 'heart_rate.fat_burn_zone.duration'))
                        expect(res.body.error[14].message).to.eql(Strings.ERROR_MESSAGE.INVALID_DATETIME_FORMAT.
                        replace('{0}', 'null'))
                        expect(res.body.error[14].description).to.eql(Strings.ERROR_MESSAGE.INVALID_DATETIME_FORMAT_DESC)

                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(HttpStatus.BAD_REQUEST)
                            expect(res.body.error[i].item.name).to.eql(incorrectActivitiesArr[i].name)
                            if (res.body.error[i].item.start_time) {
                                expect(res.body.error[i].item.start_time)
                                    .to.eql(incorrectActivitiesArr[i].start_time!.toISOString().substr(0, 19))
                            }
                            if (res.body.error[i].item.end_time) {
                                const dateToBeCompared = i !== 14
                                    ? incorrectActivitiesArr[i].end_time!.toISOString().substr(0, 19)
                                    : incorrectActivitiesArr[i].end_time!.toISOString()
                                expect(res.body.error[i].item.end_time)
                                    .to.eql(dateToBeCompared)
                            }
                            expect(res.body.error[i].item.duration).to.eql(incorrectActivitiesArr[i].duration)
                            expect(res.body.error[i].item.calories).to.eql(incorrectActivitiesArr[i].calories)
                            if (incorrectActivitiesArr[i].steps) {
                                expect(res.body.error[i].item.steps).to.eql(incorrectActivitiesArr[i].steps)
                            }
                            expect(res.body.error[i].item.distance).to.eql(incorrectActivitiesArr[i].distance)
                            if (i !== 8 && incorrectActivitiesArr[i].levels) {
                                expect(res.body.error[i].item.levels)
                                    .to.eql(incorrectActivitiesArr[i].levels!.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                            }
                            if (i !== 0 && i !== 10 && i !== 12 && incorrectActivitiesArr[i].heart_rate) {
                                expect(res.body.error[i].item.heart_rate).to.eql(incorrectActivitiesArr[i].heart_rate!.toJSON())
                            }
                            // The toJSON() method does not work very well to test the "heart_rate.fat_burn_zone" object in this index
                            // (because it is empty and the toJSON() result will not match with the return of the route)
                            if (i === 12) {
                                expect(res.body.error[i].item.heart_rate.average)
                                    .to.eql(incorrectActivitiesArr[i].heart_rate!.average)
                                expect(res.body.error[i].item.heart_rate.out_of_range_zone)
                                    .to.eql(incorrectActivitiesArr[i].heart_rate!.out_of_range_zone!.toJSON())
                                expect(res.body.error[i].item.heart_rate.fat_burn_zone)
                                    .to.eql(incorrectActivitiesArr[i].heart_rate!.fat_burn_zone)
                                expect(res.body.error[i].item.heart_rate.cardio_zone)
                                    .to.eql(incorrectActivitiesArr[i].heart_rate!.cardio_zone!.toJSON())
                                expect(res.body.error[i].item.heart_rate.peak_zone)
                                    .to.eql(incorrectActivitiesArr[i].heart_rate!.peak_zone!.toJSON())
                            }
                            if (i !== 0 && i !== 14)
                                expect(res.body.error[i].item.child_id).to.eql(incorrectActivitiesArr[i].child_id)
                        }

                        expect(res.body.success.length).to.eql(0)
                    })
            })
        })
    })
    /**
     * Route GET all physical activity by child
     */
    describe('GET /v1/children/:child_id/physicalactivities', () => {
        context('when get all physical activity of a specific child of the database successfully', () => {
            before(async () => {
                try {
                    await deleteAllActivities()

                    await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined,
                        child_id: defaultActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 200 and a list of all physical activity of that specific child', () => {
                return request
                    .get(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].name).to.eql(defaultActivity.name)
                        expect(res.body[0].start_time).to.eql(defaultActivity.start_time!.toISOString().substr(0, 19))
                        expect(res.body[0].end_time).to.eql(defaultActivity.end_time!.toISOString().substr(0, 19))
                        expect(res.body[0].duration).to.eql(defaultActivity.duration)
                        expect(res.body[0].calories).to.eql(defaultActivity.calories)
                        if (defaultActivity.steps) {
                            expect(res.body[0].steps).to.eql(defaultActivity.steps)
                        }
                        expect(res.body[0].distance).to.eql(defaultActivity.distance)
                        if (defaultActivity.levels) {
                            expect(res.body[0].levels)
                                .to.eql(defaultActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        if (defaultActivity.heart_rate) {
                            expect(res.body[0].heart_rate).to.eql(defaultActivity.heart_rate.toJSON())
                        }
                        expect(res.body[0].child_id).to.eql(defaultActivity.child_id)
                    })
            })
        })

        context('when there are no physical activity associated with that specific child in the database', () => {
            before(async () => {
                try {
                    await deleteAllActivities()
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 200 and an empty list', () => {
                return request
                    .get(`/v1/children/${defaultActivity.child_id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
                    })
            })
        })

        context('when the child_id is invalid', () => {
            before(async () => {
                try {
                    await deleteAllActivities()
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })
            it('should return status code 400 and an info message about the invalid child_id', () => {
                return request
                    .get(`/v1/children/123/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
        /**
         * query-strings-parser library test
         */
        context('when use "query-strings-parser" library', () => {
            let result1

            before(async () => {
                try {
                    await deleteAllActivities()

                    result1 = await createActivity({
                        name: defaultActivity.name,
                        start_time: new Date(1547953200000),
                        end_time: new Date(new Date(1547953200000)
                            .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000)),
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined,
                        child_id: defaultActivity.child_id
                    })

                    await createActivity({
                        name: defaultActivity.name,
                        start_time: new Date(1516417200000),
                        end_time: new Date(new Date(1516417200000)
                            .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000)),
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined,
                        child_id: new ObjectID()
                    })

                    await createActivity({
                        name: defaultActivity.name,
                        start_time: new Date(1516449600000),
                        end_time: new Date(new Date(1516449600000)
                            .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000)),
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined,
                        child_id: defaultActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })
            it('should return status code 200 and the result as needed in the query ' +
                '(all activities performed in one day)', () => {
                const url = `/v1/children/${defaultActivity.child_id}/physicalactivities`
                    .concat('?start_time=gte:2019-01-20T00:00:00.000Z&end_time=lt:2019-01-20T23:59:59.999Z')
                    .concat('&sort=child_id&page=1&limit=3')

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(1)
                        expect(res.body[0]).to.have.property('id')
                        expect(res.body[0].name).to.eql(defaultActivity.name)
                        expect(res.body[0].start_time).to.eql(result1.start_time.toISOString().substr(0, 19))
                        expect(res.body[0].end_time).to.eql(result1.end_time.toISOString().substr(0, 19))
                        expect(res.body[0].duration).to.eql(defaultActivity.duration)
                        expect(res.body[0].calories).to.eql(defaultActivity.calories)
                        if (defaultActivity.steps) {
                            expect(res.body[0].steps).to.eql(defaultActivity.steps)
                        }
                        expect(res.body[0].distance).to.eql(defaultActivity.distance)
                        if (defaultActivity.levels) {
                            expect(res.body[0].levels)
                                .to.eql(defaultActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        if (defaultActivity.heart_rate) {
                            expect(res.body[0].heart_rate).to.eql(defaultActivity.heart_rate.toJSON())
                        }
                        expect(res.body[0].child_id).to.eql(defaultActivity.child_id)
                    })
            })

            it('should return status code 200 and an empty list (when no physical activity is found)', () => {
                const url = `/v1/children/${defaultActivity.child_id}/physicalactivities`
                    .concat('?start_time=gte:2017-01-20T00:00:00.000Z&end_time=lt:2017-01-20T23:59:59.999Z')
                    .concat('&sort=child_id&page=1&limit=3')

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.length).to.eql(0)
                    })
            })

            it('should return status code 400 and an error message (when child_id is invalid)', () => {
                const url = '/v1/children/123/physicalactivities'
                    .concat('?start_time=gte:2019-01-20T00:00:00.000Z&end_time=lt:2019-01-20T23:59:59.999Z')
                    .concat('&sort=child_id&page=1&limit=3')

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
    /**
     * Route GET a physical activity by child
     */
    describe('GET /v1/children/:child_id/physicalactivities/:physicalactivity_id', () => {
        context('when get a specific physical activity of a child of the database successfully', () => {
            let result

            before(async () => {
                try {
                    await deleteAllActivities()

                    result = await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined,
                        child_id: defaultActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })
            it('should return status code 200 and the specific physical activity of that child', () => {
                return request
                    .get(`/v1/children/${result.child_id}/physicalactivities/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).to.have.property('id')
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString().substr(0, 19))
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString().substr(0, 19))
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        if (defaultActivity.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        expect(res.body.distance).to.eql(defaultActivity.distance)
                        if (defaultActivity.levels) {
                            expect(res.body.levels)
                                .to.eql(defaultActivity.levels.map((elem: PhysicalActivityLevel) => elem.toJSON()))
                        }
                        if (defaultActivity.heart_rate) {
                            expect(res.body.heart_rate).to.eql(defaultActivity.heart_rate.toJSON())
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })
        })

        context('when there is no that specific physical activity associated with that child in the database', () => {
            before(async () => {
                try {
                    await deleteAllActivities()
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 404 and an info message describing that physical activity was not found', () => {
                return request
                    .get(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.code).to.eql(404)
                        expect(err.body.message).to.eql('Physical Activity not found!')
                        expect(err.body.description).to.eql('Physical Activity not found or already removed. A new ' +
                            'operation for the same resource is not required.')
                    })
            })
        })

        context('when the child_id is invalid', () => {
            before(async () => {
                try {
                    await deleteAllActivities()
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', () => {
                return request
                    .get(`/v1/children/123/physicalactivities/${defaultActivity.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the physical activity id is invalid', () => {
            before(async () => {
                try {
                    await deleteAllActivities()
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid physical activity id', () => {
                return request
                    .get(`/v1/children/${defaultActivity.child_id}/physicalactivities/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
    /**
     * PATCH route for PhysicalActivity
     */
    // describe('RABBITMQ PUBLISHER -> PATCH /v1/children/:child_id/physicalactivities/:physicalactivity_id', () => {
    //     context('when this physical activity is updated successfully and published to the bus', () => {
    //         // physical activity to update
    //         const body = {
    //             name: defaultActivity.name,
    //             calories: defaultActivity.calories,
    //             steps: defaultActivity.steps ? defaultActivity.steps : undefined,
    //             distance: defaultActivity.distance ? defaultActivity.distance : undefined,
    //             levels: [],
    //             heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
    //         }
    //
    //         let result
    //
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //
    //                 // physical activity to be updated
    //                 result = await createActivityToBeUpdated(defaultActivity)
    //
    //                 await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
    //                     { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //
    //         after(async () => {
    //             try {
    //                 await rabbitmq.dispose()
    //                 await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities test: ' + err.message)
    //             }
    //         })
    //
    //         it('The subscriber should receive a message in the correct format and with the same values as the activity ' +
    //             'published on the bus', (done) => {
    //             rabbitmq.bus
    //                 .subUpdatePhysicalActivity(message => {
    //                     try {
    //                         expect(message.event_name).to.eql('PhysicalActivityUpdateEvent')
    //                         expect(message).to.have.property('timestamp')
    //                         expect(message).to.have.property('physicalactivity')
    //                         expect(message.physicalactivity).to.have.property('id')
    //                         expect(message.physicalactivity.name).to.eql(defaultActivity.name)
    //                         expect(message.physicalactivity.start_time).to.eql(result.start_time!.toISOString())
    //                         expect(message.physicalactivity.end_time).to.eql(result.end_time!.toISOString())
    //                         expect(message.physicalactivity.duration).to.eql(result.duration)
    //                         expect(message.physicalactivity.calories).to.eql(defaultActivity.calories)
    //                         if (message.physicalactivity.steps) {
    //                             expect(message.physicalactivity.steps).to.eql(defaultActivity.steps)
    //                         }
    //                         expect(message.physicalactivity.distance).to.eql(defaultActivity.distance)
    //                         expect(message.physicalactivity).to.not.have.property('levels')
    //                         expect(message.physicalactivity.heart_rate).to.eql(defaultActivity.heart_rate!.toJSON())
    //                         expect(message.physicalactivity.child_id).to.eql(defaultActivity.child_id)
    //                         done()
    //                     } catch (err) {
    //                         done(err)
    //                     }
    //                 })
    //                 .then(() => {
    //                     request
    //                         .patch(`/v1/children/${result.child_id}/physicalactivities/${result.id}`)
    //                         .send(body)
    //                         .set('Content-Type', 'application/json')
    //                         .expect(200)
    //                         .then()
    //                         .catch(done)
    //                 })
    //                 .catch(done)
    //         })
    //     })
    // })
    //
    // describe('PATCH /v1/children/:child_id/physicalactivities/:physicalactivity_id', () => {
    //     context('when this physical activity is updated successfully (there is no connection to RabbitMQ)', () => {
    //         let result
    //
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //
    //                 // physical activity to be updated
    //                 result = await createActivityToBeUpdated(defaultActivity)
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //
    //         it('should return status code 200 and the updated physical activity (and show an error log about unable to send ' +
    //             'UpdatePhysicalActivity event)', () => {
    //             // physical activity to update
    //             const body = {
    //                 name: defaultActivity.name,
    //                 calories: defaultActivity.calories,
    //                 steps: defaultActivity.steps ? defaultActivity.steps : undefined,
    //                 distance: defaultActivity.distance ? defaultActivity.distance : undefined,
    //                 levels: [],
    //                 heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/${result.child_id}/physicalactivities/${result.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(200)
    //                 .then(res => {
    //                     expect(res.body).to.have.property('id')
    //                     expect(res.body.start_time).to.eql(result.start_time!.toISOString())
    //                     expect(res.body.end_time).to.eql(result.end_time!.toISOString())
    //                     expect(res.body.duration).to.eql(result.duration)
    //                     expect(res.body.name).to.eql(defaultActivity.name)
    //                     expect(res.body.calories).to.eql(defaultActivity.calories)
    //                     if (defaultActivity.steps) {
    //                         expect(res.body.steps).to.eql(defaultActivity.steps)
    //                     }
    //                     expect(res.body.distance).to.eql(defaultActivity.distance)
    //                     expect(res.body).to.not.have.property('levels')
    //                     if (defaultActivity.heart_rate) {
    //                         expect(res.body.heart_rate).to.eql(defaultActivity.heart_rate.toJSON())
    //                     }
    //                     expect(res.body.child_id).to.eql(defaultActivity.child_id)
    //                 })
    //         })
    //     })
    //
    //     context('when physical activity does not exist in the database', () => {
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //
    //         it('should return status code 404 and an info message about the error on the search', () => {
    //             // physical activity to update
    //             const body = {
    //                 name: defaultActivity.name,
    //                 calories: defaultActivity.calories,
    //                 steps: defaultActivity.steps ? defaultActivity.steps : undefined,
    //                 distance: defaultActivity.distance ? defaultActivity.distance : undefined,
    //                 levels: [],
    //                 heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(404)
    //                 .then(err => {
    //                     expect(err.body.code).to.eql(404)
    //                     expect(err.body.message).to.eql('Physical Activity not found!')
    //                     expect(err.body.description).to.eql('Physical Activity not found or already removed. ' +
    //                         'A new operation for the same resource is not required!')
    //                 })
    //         })
    //     })
    //
    //     context('when the child_id is invalid', () => {
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //         it('should return status code 400 and an info message about the invalid child_id', () => {
    //             // physical activity to update
    //             const body = {
    //                 name: defaultActivity.name,
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //                 calories: defaultActivity.calories,
    //                 steps: defaultActivity.steps ? defaultActivity.steps : undefined,
    //                 distance: defaultActivity.distance ? defaultActivity.distance : undefined,
    //                 levels: defaultActivity.levels ? defaultActivity.levels : undefined,
    //                 heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/123/physicalactivities/${defaultActivity.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
    //                     expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
    //                 })
    //         })
    //     })
    //
    //     context('when the physical activity id is invalid', () => {
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //         it('should return status code 400 and an info message about the invalid physical activity id', () => {
    //             // physical activity to update
    //             const body = {
    //                 name: defaultActivity.name,
    //                 start_time: defaultActivity.start_time,
    //                 end_time: defaultActivity.end_time,
    //                 duration: defaultActivity.duration,
    //                 calories: defaultActivity.calories,
    //                 steps: defaultActivity.steps ? defaultActivity.steps : undefined,
    //                 distance: defaultActivity.distance ? defaultActivity.distance : undefined,
    //                 levels: defaultActivity.levels ? defaultActivity.levels : undefined,
    //                 heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/${defaultActivity.child_id}/physicalactivities/123`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body.message).to.eql(Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
    //                     expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
    //                 })
    //         })
    //     })
    //
    //     context('when a validation error occurs (attempt to update start_time)', () => {
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //         it('should return status code 400 and info message about the impossibility of updating', () => {
    //             // physical activity to update
    //             const body = {
    //                 start_time: defaultActivity.start_time
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UNABLE_UPDATE)
    //                     expect(err.body.description).to.eql('Physical Activity validation failed: '
    //                         .concat(Strings.ERROR_MESSAGE.UNABLE_UPDATE_DESC))
    //                 })
    //         })
    //     })
    //
    //     context('when a validation error occurs (attempt to update end_time)', () => {
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //         it('should return status code 400 and info message about the impossibility of updating', () => {
    //             // physical activity to update
    //             const body = {
    //                 end_time: defaultActivity.end_time
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UNABLE_UPDATE)
    //                     expect(err.body.description).to.eql('Physical Activity validation failed: '
    //                         .concat(Strings.ERROR_MESSAGE.UNABLE_UPDATE_DESC))
    //                 })
    //         })
    //     })
    //
    //     context('when a validation error occurs (attempt to update duration)', () => {
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //         it('should return status code 400 and info message about the impossibility of updating', () => {
    //             // physical activity to update
    //             const body = {
    //                 duration: defaultActivity.duration
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UNABLE_UPDATE)
    //                     expect(err.body.description).to.eql('Physical Activity validation failed: '
    //                         .concat(Strings.ERROR_MESSAGE.UNABLE_UPDATE_DESC))
    //                 })
    //         })
    //     })
    //
    //     context('when a validation error occurs (the name parameter does not have a valid value)', () => {
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //         it('should return status code 400 and info message about the invalid name parameter', () => {
    //             // physical activity to update
    //             const body = {
    //                 name: ''
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body.message).to.eql('Name field is invalid...')
    //                     expect(err.body.description).to.eql('Physical Activity validation failed: ' +
    //                         'Name must have at least one character.')
    //                 })
    //         })
    //     })
    //
    //     context('when a validation error occurs (the calories parameter does not have a valid number)', () => {
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //         it('should return status code 400 and info message about the invalid calories parameter', () => {
    //             // physical activity to update
    //             const body = {
    //                 calories: `${defaultActivity.calories}a`
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body.message).to.eql('Calories field is invalid...')
    //                     expect(err.body.description).to.eql('Physical Activity validation failed: '
    //                         .concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
    //                 })
    //         })
    //     })
    //
    //     context('when a validation error occurs (the calories parameter is negative)', () => {
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //         it('should return status code 400 and info message about the invalid calories parameter', () => {
    //             // physical activity to update
    //             const body = {
    //                 calories: -(defaultActivity.calories!)
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body.message).to.eql('Calories field is invalid...')
    //                     expect(err.body.description).to.eql('Physical Activity validation failed: The value provided ' +
    //                         'has a negative value!')
    //                 })
    //         })
    //     })
    //
    //     context('when a validation error occurs (the steps parameter does not have a valid number)', () => {
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //         it('should return status code 400 and info message about the invalid steps parameter', () => {
    //             // physical activity to update
    //             const body = {
    //                 steps: `100a`
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body.message).to.eql('Steps field is invalid...')
    //                     expect(err.body.description).to.eql('Physical Activity validation failed: '
    //                         .concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
    //                 })
    //         })
    //     })
    //
    //     context('when a validation error occurs (the steps parameter is negative)', () => {
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //         it('should return status code 400 and info message about the invalid steps parameter', () => {
    //             // physical activity to update
    //             const body = {
    //                 steps: -200
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body.message).to.eql('Steps field is invalid...')
    //                     expect(err.body.description).to.eql('Physical Activity validation failed: The value provided ' +
    //                         'has a negative value!')
    //                 })
    //         })
    //     })
    //
    //     context('when a validation error occurs (the distance parameter does not have a valid number)', () => {
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //         it('should return status code 400 and info message about the invalid distance parameter', () => {
    //             // physical activity to update
    //             const body = {
    //                 distance: `100a`
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body.message).to.eql('Distance field is invalid...')
    //                     expect(err.body.description).to.eql('Physical Activity validation failed: '
    //                         .concat(Strings.ERROR_MESSAGE.NEGATIVE_NUMBER))
    //                 })
    //         })
    //     })
    //
    //     context('when a validation error occurs (the distance parameter is negative)', () => {
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //         it('should return status code 400 and info message about the invalid distance parameter', () => {
    //             // physical activity to update
    //             const body = {
    //                 distance: -200
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body.message).to.eql('Distance field is invalid...')
    //                     expect(err.body.description).to.eql('Physical Activity validation failed: The value provided ' +
    //                         'has a negative value!')
    //                 })
    //         })
    //     })
    //
    //     context('when a validation error occurs (attempt to update levels with an array containing at least 1 item)',
    //         () => {
    //             before(async () => {
    //                 try {
    //                     await deleteAllActivities()
    //                 } catch (err) {
    //                     throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //                 }
    //             })
    //
    //             it('should return status code 400 and info message about the invalid levels array', () => {
    //                 // physical activity to update
    //                 const body = {
    //                     levels: defaultActivity.levels
    //                 }
    //
    //                 return request
    //                     .patch(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                     .send(body)
    //                     .set('Content-Type', 'application/json')
    //                     .expect(400)
    //                     .then(err => {
    //                         expect(err.body.code).to.eql(400)
    //                         expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.UNABLE_UPDATE)
    //                         expect(err.body.description).to.eql('Physical Activity validation failed: '
    //                             .concat(Strings.ERROR_MESSAGE.UNABLE_UPDATE_DESC))
    //                     })
    //             })
    //         })
    //
    //     context('when a validation error occurs (the PhysicalActivityHeartRate is empty)', () => {
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //         it('should return status code 400 and info message about the invalid levels array', () => {
    //             const body = {
    //                 heart_rate: incorrectActivity11.heart_rate ? incorrectActivity11.heart_rate : undefined
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
    //                     expect(err.body.description).to.eql('PhysicalActivityHeartRate validation failed: ' +
    //                         'average, out_of_range_zone, fat_burn_zone, cardio_zone, peak_zone is required!')
    //                 })
    //         })
    //     })
    //
    //     context('when a validation error occurs (the PhysicalActivityHeartRate has a negative average parameter)', () => {
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //         it('should return status code 400 and info message about the invalid levels array', () => {
    //             const body = {
    //                 heart_rate: incorrectActivity12.heart_rate ? incorrectActivity12.heart_rate : undefined
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body.message).to.eql('Average field is invalid...')
    //                     expect(err.body.description).to.eql('PhysicalActivityHeartRate validation failed: ' +
    //                         'The value provided has a negative value!')
    //                 })
    //         })
    //     })
    //
    //     context('when a validation error occurs (the "Fat Burn Zone" parameter of PhysicalActivityHeartRate is empty)', () => {
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //         it('should return status code 400 and info message about the invalid levels array', () => {
    //             const body = {
    //                 heart_rate: incorrectActivity13.heart_rate ? incorrectActivity13.heart_rate : undefined
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body.message).to.eql(Strings.ERROR_MESSAGE.REQUIRED_FIELDS)
    //                     expect(err.body.description).to.eql('HeartRateZone validation failed: ' +
    //                         'min, max, duration is required!')
    //                 })
    //         })
    //     })
    //
    //     context('when a validation error occurs (the "Fat Burn Zone" parameter of PhysicalActivityHeartRate ' +
    //         'has a negative duration)', () => {
    //         before(async () => {
    //             try {
    //                 await deleteAllActivities()
    //             } catch (err) {
    //                 throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
    //             }
    //         })
    //         it('should return status code 400 and info message about the invalid levels array', () => {
    //             const body = {
    //                 heart_rate: incorrectActivity14.heart_rate ? incorrectActivity14.heart_rate : undefined
    //             }
    //
    //             return request
    //                 .patch(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
    //                 .send(body)
    //                 .set('Content-Type', 'application/json')
    //                 .expect(400)
    //                 .then(err => {
    //                     expect(err.body.code).to.eql(400)
    //                     expect(err.body.message).to.eql('Duration field is invalid...')
    //                     expect(err.body.description).to.eql('HeartRateZone validation failed: ' +
    //                         'The value provided has a negative value!')
    //                 })
    //         })
    //     })
    // })
    /**
     * DELETE route for PhysicalActivity
     */
    describe('RABBITMQ PUBLISHER -> DELETE /v1/children/:child_id/physicalactivities/:physicalactivity_id', () => {
        context('when the physical activity was deleted successfully and your ID is published on the bus', () => {
            let result

            before(async () => {
                try {
                    await deleteAllActivities()

                    result = await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined,
                        child_id: defaultActivity.child_id
                    })

                    await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                        { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })

            after(async () => {
                try {
                    await rabbitmq.dispose()
                    await rabbitmq.initialize('amqp://invalidUser:guest@localhost', { retries: 1, interval: 100 })
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities test: ' + err.message)
                }
            })

            it('The subscriber should receive a message in the correct format and that has the same ID ' +
                'published on the bus', (done) => {
                rabbitmq.bus
                    .subDeletePhysicalActivity(message => {
                        try {
                            expect(message.event_name).to.eql('PhysicalActivityDeleteEvent')
                            expect(message).to.have.property('timestamp')
                            expect(message).to.have.property('physicalactivity')
                            expect(message.physicalactivity).to.have.property('id')
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
                    .then(() => {
                        request
                            .delete(`/v1/children/${result.child_id}/physicalactivities/${result.id}`)
                            .set('Content-Type', 'application/json')
                            .expect(204)
                            .then()
                            .catch(done)
                    })
                    .catch(done)
            })
        })
    })

    describe('DELETE /v1/children/:child_id/physicalactivities/:physicalactivity_id', () => {
        context('when the physical activity was deleted successfully (there is no connection to RabbitMQ)', () => {
            let result

            before(async () => {
                try {
                    await deleteAllActivities()

                    result = await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        distance: defaultActivity.distance ? defaultActivity.distance : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        heart_rate: defaultActivity.heart_rate ? defaultActivity.heart_rate : undefined,
                        child_id: defaultActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 204 and no content for physical activity (and show an error log about unable to send ' +
                'DeletePhysicalActivity event)', () => {
                return request
                    .delete(`/v1/children/${result.child_id}/physicalactivities/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the physical activity is not found', () => {
            before(async () => {
                try {
                    await deleteAllActivities()
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 204 and no content for physical activity', () => {
                return request
                    .delete(`/v1/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the child_id is invalid', () => {
            before(async () => {
                try {
                    await deleteAllActivities()
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', () => {
                return request
                    .delete(`/v1/children/123/physicalactivities/${defaultActivity.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when the physical activity id is invalid', () => {
            before(async () => {
                try {
                    await deleteAllActivities()
                } catch (err) {
                    throw new Error('Failure on children.physicalactivities routes test: ' + err.message)
                }
            })
            it('should return status code 400 and an info message about the invalid physical activity id', () => {
                return request
                    .delete(`/v1/children/${defaultActivity.child_id}/physicalactivities/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
    })
})

async function createActivity(item): Promise<any> {
    const activityMapper: PhysicalActivityEntityMapper = new PhysicalActivityEntityMapper()
    const resultModel = activityMapper.transform(item)
    const resultModelEntity = activityMapper.transform(resultModel)
    return await Promise.resolve(ActivityRepoModel.create(resultModelEntity))
}

// async function createActivityToBeUpdated(activity: PhysicalActivity): Promise<any> {
//     // physical activity to be updated
//     const result = createActivity({
//         name: activity.name,
//         start_time: activity.start_time,
//         end_time: activity.end_time,
//         duration: activity.duration,
//         calories: activity.calories,
//         steps: activity.steps ? activity.steps : undefined,
//         levels: activity.levels ? activity.levels : undefined,
//         heart_rate: activity.heart_rate ? activity.heart_rate : undefined,
//         child_id: activity.child_id
//     })
//
//     return await Promise.resolve(result)
// }

async function deleteAllActivities() {
    return ActivityRepoModel.deleteMany({})
}
