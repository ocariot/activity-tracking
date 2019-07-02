import HttpStatus from 'http-status-codes'
import { Container } from 'inversify'
import { DI } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { App } from '../../../src/app'
import { BackgroundService } from '../../../src/background/background.service'
import { expect } from 'chai'
import { Strings } from '../../../src/utils/strings'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { ActivityLevelType } from '../../../src/application/domain/model/physical.activity.level'
import { ActivityRepoModel } from '../../../src/infrastructure/database/schema/activity.schema'
import { PhysicalActivityMock } from '../../mocks/physical.activity.mock'
import { PhysicalActivityEntityMapper } from '../../../src/infrastructure/entity/mapper/physical.activity.entity.mapper'
import { ObjectID } from 'bson'
import { Log, LogType } from '../../../src/application/domain/model/log'
import { LogMock } from '../../mocks/log.mock'
import { ActivityLogRepoModel } from '../../../src/infrastructure/database/schema/activity.log.schema'

const container: Container = DI.getInstance().getContainer()
const backgroundServices: BackgroundService = container.get(Identifier.BACKGROUND_SERVICE)
const app: App = container.get(Identifier.APP)
const request = require('supertest')(app.getExpress())

describe('Routes: users/children', () => {

    // Mock objects for PhysicalActivity routes
    const defaultActivity: PhysicalActivity = new PhysicalActivityMock()
    const otherActivity: PhysicalActivity = new PhysicalActivityMock()
    otherActivity.child_id = '5a62be07de34500146d9c542'

    /**
     * Mock objects for Log routes
     */
    const correctLogsArr: Array<Log> = new Array<Log>()
    for (let i = 0; i < 5; i ++) {
        correctLogsArr.push(new LogMock())
    }

    // Mock correct and incorrect logs array
    const mixedLogsArr: Array<Log> = new Array<Log>()
    for (let i = 0; i < 3; i ++) {
        mixedLogsArr.push(new LogMock())
    }

    // Incorrect log (invalid date)
    const incorrectLog = new Log('20199-03-08', 250, LogType.CALORIES, '5a62be07de34500146d9c544')
    incorrectLog.id = '507f1f77bcf86cd799439011'
    mixedLogsArr.push(incorrectLog)

    // Mock other incorrect log with invalid type
    const logJSON: any = {
        date: '2019-03-18',
        value: -1000,
    }

    let otherLogIncorrect: Log = new Log()
    otherLogIncorrect = otherLogIncorrect.fromJSON(logJSON)
    mixedLogsArr.push(otherLogIncorrect)

    /**
     * Mock objects for POST route with multiple activities
     */
    // Mock through JSON
    const incorrectActivityJSON: any = {
            id: new ObjectID(),
            start_time: new Date('2018-12-14T12:52:59Z').toISOString(),
            end_time: new Date('2018-12-14T13:12:37Z').toISOString(),
            duration: 1178000,
            child_id: '5a62be07de34500146d9c544',
            name: 'walk',
            calories: 200,
            steps: 1000,
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

    // Array with correct activities
    const correctActivitiesArr: Array<PhysicalActivity> = new Array<PhysicalActivityMock>()
    for (let i = 0; i < 3; i++) {
        correctActivitiesArr.push(new PhysicalActivityMock())
    }

    // Incorrect activities
    const incorrectActivity1: PhysicalActivity = new PhysicalActivity()        // Without all required fields

    const incorrectActivity2: PhysicalActivity = new PhysicalActivityMock()    // Without PhysicalActivity fields
    incorrectActivity2.name = ''
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
    incorrectActivityJSON.levels[0].name = ''
    incorrectActivityJSON.levels[0].duration = undefined
    incorrectActivity9 = incorrectActivity9.fromJSON(incorrectActivityJSON)

    // The levels array has an item that contains negative duration
    let incorrectActivity10: PhysicalActivity = new PhysicalActivityMock()
    incorrectActivityJSON.levels[0].name = ActivityLevelType.SEDENTARY
    incorrectActivityJSON.levels[0].duration = -(Math.floor((Math.random() * 10) * 60000))
    incorrectActivity10 = incorrectActivity10.fromJSON(incorrectActivityJSON)

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

    // Start services
    before(async () => {
        try {
            deleteAllActivity()
            deleteAllLogs()
            await backgroundServices.startServices()
        } catch (err) {
            throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
        }
    })

    // Delete all physical activity objects from the database
    after(async () => {
        try {
            deleteAllActivity()
        } catch (err) {
            throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
        }
    })
    /**
     * POST route to PhysicalActivity with only one item of this type in the body
     */
    describe('POST /v1/users/children/:child_id/physicalactivities with only one PhysicalActivity in the body', () => {
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
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        defaultActivity.id = res.body.id
                        expect(res.body.id).to.eql(defaultActivity.id)
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        if (res.body.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body).to.have.property('levels')
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })
        })

        context('when a duplicate error occurs', () => {
            it('should return status code 409 and an info message about duplicate items', () => {
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
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(409)
                    .then(err => {
                        expect(err.body.code).to.eql(409)
                        expect(err.body.message).to.eql('Physical Activity is already registered...')
                    })
            })
        })

        context('when a validation error occurs (missing all the activity required fields)', () => {
            it('should return status code 400 and info message about the activity missing fields', () => {
                const body = {}

                return request
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Required fields were not provided...')
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
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Required fields were not provided...')
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
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Date field is invalid...')
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
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Duration field is invalid...')
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
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Duration field is invalid...')
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
                    .post(`/v1/users/children/123/physicalactivities`)
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
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Calories field is invalid...')
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
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Steps field is invalid...')
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
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('The name of level provided "sedentaries" is not supported...')
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
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Level are not in a format that is supported!')
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
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Some (or several) duration field of levels array is invalid...')
                        expect(err.body.description).to.eql('Physical Activity Level validation failed: The value ' +
                            'provided has a negative value!')
                    })
            })
        })
    })
    /**
     * POST route to PhysicalActivity with an array of such items in the body
     */
    describe('POST /v1/users/children/:child_id/physicalactivities with an array of PhysicalActivity in the body', () => {
        context('when all the activities are correct and still do not exist in the repository', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 201, create each PhysicalActivity and return a response of type ' +
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
                        levels: activity.levels ? activity.levels : undefined
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(HttpStatus.CREATED)
                            expect(res.body.success[i].item.name).to.eql(correctActivitiesArr[i].name)
                            expect(res.body.success[i].item.start_time).to.eql(correctActivitiesArr[i].start_time!.toISOString())
                            expect(res.body.success[i].item.end_time).to.eql(correctActivitiesArr[i].end_time!.toISOString())
                            expect(res.body.success[i].item.duration).to.eql(correctActivitiesArr[i].duration)
                            expect(res.body.success[i].item.calories).to.eql(correctActivitiesArr[i].calories)
                            if (res.body.success[i].item.steps) {
                                expect(res.body.success[i].item.steps).to.eql(correctActivitiesArr[i].steps)
                            }
                            if (correctActivitiesArr[i].levels) {
                                expect(res.body.success[i].item).to.have.property('levels')
                            }
                            expect(res.body.success[i].item.child_id).to.eql(correctActivitiesArr[i].child_id)
                        }

                        expect(res.body.error.length).to.eql(0)
                    })
            })
        })

        context('when all the activities are correct but already exists in the repository', () => {
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
                        levels: activity.levels ? activity.levels : undefined
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(HttpStatus.CONFLICT)
                            expect(res.body.error[i].message).to.eql('Physical Activity is already registered...')
                            expect(res.body.error[i].item.name).to.eql(correctActivitiesArr[i].name)
                            expect(res.body.error[i].item.start_time).to.eql(correctActivitiesArr[i].start_time!.toISOString())
                            expect(res.body.error[i].item.end_time).to.eql(correctActivitiesArr[i].end_time!.toISOString())
                            expect(res.body.error[i].item.duration).to.eql(correctActivitiesArr[i].duration)
                            expect(res.body.error[i].item.calories).to.eql(correctActivitiesArr[i].calories)
                            if (res.body.error[i].item.steps) {
                                expect(res.body.error[i].item.steps).to.eql(correctActivitiesArr[i].steps)
                            }
                            if (correctActivitiesArr[i].levels) {
                                expect(res.body.error[i].item).to.have.property('levels')
                            }
                            expect(res.body.error[i].item.child_id).to.eql(correctActivitiesArr[i].child_id)
                        }

                        expect(res.body.success.length).to.eql(0)
                    })
            })
        })

        context('when there are correct and incorrect activities in the body', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
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
                        levels: activity.levels ? activity.levels : undefined
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        // Success item
                        expect(res.body.success[0].code).to.eql(HttpStatus.CREATED)
                        expect(res.body.success[0].item.name).to.eql(mixedActivitiesArr[0].name)
                        expect(res.body.success[0].item.start_time).to.eql(mixedActivitiesArr[0].start_time!.toISOString())
                        expect(res.body.success[0].item.end_time).to.eql(mixedActivitiesArr[0].end_time!.toISOString())
                        expect(res.body.success[0].item.duration).to.eql(mixedActivitiesArr[0].duration)
                        expect(res.body.success[0].item.calories).to.eql(mixedActivitiesArr[0].calories)
                        if (res.body.success[0].item.steps) {
                            expect(res.body.success[0].item.steps).to.eql(mixedActivitiesArr[0].steps)
                        }
                        if (mixedActivitiesArr[0].levels) {
                            expect(res.body.success[0].item).to.have.property('levels')
                        }
                        expect(res.body.success[0].item.child_id).to.eql(mixedActivitiesArr[0].child_id)

                        // Error item
                        expect(res.body.error[0].code).to.eql(HttpStatus.BAD_REQUEST)
                        expect(res.body.error[0].message).to.eql('Required fields were not provided...')
                        expect(res.body.error[0].description).to.eql('Activity validation failed: start_time, end_time, ' +
                            'duration is required!')
                    })
            })
        })

        context('when all the activities are incorrect', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
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
                        levels: activity.levels ? activity.levels : undefined,
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body.error[0].message).to.eql('Required fields were not provided...')
                        expect(res.body.error[0].description).to.eql('Activity validation failed: start_time, end_time, ' +
                            'duration is required!')
                        expect(res.body.error[1].message).to.eql('Required fields were not provided...')
                        expect(res.body.error[1].description).to.eql('Physical Activity validation failed: name, calories is required!')
                        expect(res.body.error[2].message).to.eql('Date field is invalid...')
                        expect(res.body.error[2].description).to.eql('Date validation failed: The end_time parameter can not contain ' +
                            'a older date than that the start_time parameter!')
                        expect(res.body.error[3].message).to.eql('Duration field is invalid...')
                        expect(res.body.error[3].description).to.eql('Duration validation failed: Activity duration value does not ' +
                            'match values passed in start_time and end_time parameters!')
                        expect(res.body.error[4].message).to.eql('Duration field is invalid...')
                        expect(res.body.error[4].description).to.eql('Activity validation failed: The value provided has a negative value!')
                        expect(res.body.error[5].message).to.eql('Calories field is invalid...')
                        expect(res.body.error[5].description).to.eql('Physical Activity validation failed: The value provided has a ' +
                            'negative value!')
                        expect(res.body.error[6].message).to.eql('Steps field is invalid...')
                        expect(res.body.error[6].description).to.eql('Physical Activity validation failed: The value provided has a ' +
                            'negative value!')
                        expect(res.body.error[7].message).to.eql('The name of level provided "sedentaries" is not supported...')
                        expect(res.body.error[7].description).to.eql('The names of the allowed levels are: sedentary, lightly, fairly, ' +
                            'very.')
                        expect(res.body.error[8].message).to.eql('Level are not in a format that is supported!')
                        expect(res.body.error[8].description).to.eql('Must have values ​​for the following levels: sedentary, lightly, ' +
                            'fairly, very.')
                        expect(res.body.error[9].message).to.eql('Some (or several) duration field of levels array is invalid...')
                        expect(res.body.error[9].description).to.eql('Physical Activity Level validation failed: The value provided has ' +
                            'a negative value!')

                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(HttpStatus.BAD_REQUEST)
                            expect(res.body.error[i].item.name).to.eql(incorrectActivitiesArr[i].name)
                            if (i !== 0)
                                expect(res.body.error[i].item.start_time).to.eql(incorrectActivitiesArr[i].start_time!.toISOString())
                            if (i !== 0)
                                expect(res.body.error[i].item.end_time).to.eql(incorrectActivitiesArr[i].end_time!.toISOString())
                            expect(res.body.error[i].item.duration).to.eql(incorrectActivitiesArr[i].duration)
                            expect(res.body.error[i].item.calories).to.eql(incorrectActivitiesArr[i].calories)
                            if (res.body.error[i].item.steps) {
                                expect(res.body.error[i].item.steps).to.eql(incorrectActivitiesArr[i].steps)
                            }
                            if (incorrectActivitiesArr[i].levels) {
                                expect(res.body.error[i].item).to.have.property('levels')
                            }
                            if (i !== 0)
                                expect(res.body.error[i].item.child_id).to.eql(incorrectActivitiesArr[i].child_id)
                        }

                        expect(res.body.success.length).to.eql(0)
                    })
            })
        })
    })
    /**
     * Route GET all for PhysicalActivity
     */
    describe('GET /v1/users/children/physicalactivities', () => {
        context('when get all physical activities of the database successfully', () => {
            it('should return status code 200 and a list of all physical activity found', async () => {
                try {
                    await createActivity({
                        name: otherActivity.name,
                        start_time: otherActivity.start_time,
                        end_time: otherActivity.end_time,
                        duration: otherActivity.duration,
                        calories: otherActivity.calories,
                        steps: otherActivity.steps ? otherActivity.steps : undefined,
                        levels: otherActivity.levels ? otherActivity.levels : undefined,
                        child_id: otherActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                return request
                    .get('/v1/users/children/physicalactivities')
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        otherActivity.id = res.body[0].id
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object, which was
                        // created in the case of POST route success test
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                        expect(res.body[0].id).to.eql(otherActivity.id)
                        expect(res.body[0].name).to.eql(otherActivity.name)
                        expect(res.body[0].start_time).to.eql(otherActivity.start_time!.toISOString())
                        expect(res.body[0].end_time).to.eql(otherActivity.end_time!.toISOString())
                        expect(res.body[0].duration).to.eql(otherActivity.duration)
                        expect(res.body[0].calories).to.eql(otherActivity.calories)
                        if (otherActivity.steps) {
                            expect(res.body[0].steps).to.eql(otherActivity.steps)
                        }
                        if (otherActivity.levels) {
                            expect(res.body[0]).to.have.property('levels')
                        }
                        expect(res.body[0].child_id).to.eql(otherActivity.child_id)
                    })
            })
        })

        context('when there is no physical activity in the database', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 200 and an empty list', async () => {
                return request
                    .get('/v1/users/children/physicalactivities')
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
        context('when get physical activity using the "query-strings-parser" library', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 200 and the result as needed in the query', async () => {
                try {
                    await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        child_id: defaultActivity.child_id
                    })

                    await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        child_id: new ObjectID()
                    })
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                const url = `/v1/users/children/physicalactivities?child_id=${defaultActivity.child_id}&fields=name,
                    start_time,end_time,duration,calories,steps,levels,child_id&sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        defaultActivity.id = res.body[0].id
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object with the property
                        // 'climatized' = true (the only query filter)
                        expect(res.body[0].id).to.eql(defaultActivity.id)
                        expect(res.body[0].name).to.eql(defaultActivity.name)
                        expect(res.body[0].start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body[0].end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body[0].duration).to.eql(defaultActivity.duration)
                        expect(res.body[0].calories).to.eql(defaultActivity.calories)
                        if (res.body[0].steps) {
                            expect(res.body[0].steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body[0]).to.have.property('levels')
                        }
                        expect(res.body[0].child_id).to.eql(defaultActivity.child_id)
                    })
            })
        })

        context('when there is an attempt to get a physical activity using the "query-strings-parser" library but there ' +
            'is no physical activity in the database', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 200 and an empty list', async () => {
                const url = `/v1/users/children/physicalactivities?child_id=${defaultActivity.child_id}&fields=name,
                    start_time,end_time,duration,calories,steps,levels,child_id&sort=child_id&page=1&limit=3`

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
     * Route GET all physical activity by child
     */
    describe('GET /v1/users/children/:child_id/physicalactivities', () => {
        context('when get all physical activity of a specific child of the database successfully', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 200 and a list of all physical activity of that specific child', async () => {
                try {
                    await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        child_id: defaultActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                return request
                    .get(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        defaultActivity.id = res.body[0].id
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object, which was
                        // created in the case of POST route success test
                        expect(res.body[0].id).to.eql(defaultActivity.id)
                        expect(res.body[0].name).to.eql(defaultActivity.name)
                        expect(res.body[0].start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body[0].end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body[0].duration).to.eql(defaultActivity.duration)
                        expect(res.body[0].calories).to.eql(defaultActivity.calories)
                        if (res.body[0].steps) {
                            expect(res.body[0].steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body[0]).to.have.property('levels')
                        }
                        expect(res.body[0].child_id).to.eql(defaultActivity.child_id)
                    })
            })
        })

        context('when there are no physical activity associated with that specific child in the database', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 200 and an empty list', async () => {
                return request
                    .get(`/v1/users/children/${defaultActivity.child_id}/physicalactivities`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.eql(0)
                    })
            })
        })

        context('when the child_id is invalid', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', async () => {
                try {
                    await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        child_id: defaultActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                return request
                    .get(`/v1/users/children/123/physicalactivities`)
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
        context('when get physical activity using the "query-strings-parser" library', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 200 and the result as needed in the query', async () => {
                try {
                    await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        child_id: defaultActivity.child_id
                    })

                    await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        child_id: new ObjectID()
                    })
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                const url = `/v1/users/children/${defaultActivity.child_id}/physicalactivities?child_id=${defaultActivity.child_id}
                    &fields=name,start_time,end_time,duration,calories,steps,levels,child_id&sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        defaultActivity.id = res.body[0].id
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object with the property
                        // 'climatized' = true (the only query filter)
                        expect(res.body[0].id).to.eql(defaultActivity.id)
                        expect(res.body[0].name).to.eql(defaultActivity.name)
                        expect(res.body[0].start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body[0].end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body[0].duration).to.eql(defaultActivity.duration)
                        expect(res.body[0].calories).to.eql(defaultActivity.calories)
                        if (res.body[0].steps) {
                            expect(res.body[0].steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body[0]).to.have.property('levels')
                        }
                        expect(res.body[0].child_id).to.eql(defaultActivity.child_id)
                    })
            })
        })

        context('when there is an attempt to get physical activity of a specific child using the "query-strings-parser" library but ' +
            'this physical activity does not exist', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 200 and an empty list', async () => {
                const url = `/v1/users/children/${defaultActivity.child_id}/physicalactivities?child_id=${defaultActivity.child_id}
                    &fields=name,start_time,end_time,duration,calories,steps,levels,child_id&sort=child_id&page=1&limit=3`

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

        context('when there is an attempt to get physical activity of a specific child using the "query-strings-parser" library ' +
            'but the child_id is invalid', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', async () => {
                try {
                    await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        child_id: defaultActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                const url = `/v1/users/children/123/physicalactivities?child_id=${defaultActivity.child_id}&fields=start_time,end_time,
                    &fields=name,start_time,end_time,duration,calories,steps,levels,child_id&sort=child_id&page=1&limit=3`

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
    describe('GET /v1/users/children/:child_id/physicalactivities/:physicalactivity_id', () => {
        context('when get a specific physical activity of a child of the database successfully', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 200 and the specific physical activity of that child', async () => {
                let result

                try {
                    result = await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        child_id: defaultActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                return request
                    .get(`/v1/users/children/${result.child_id}/physicalactivities/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        // Check for the existence of properties only in the first element of the array
                        // because there is a guarantee that there will be at least one object, which was
                        // created in the case of POST route success test
                        expect(res.body.id).to.eql(result.id)
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        if (res.body.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body).to.have.property('levels')
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })
        })

        context('when there is no that specific physical activity associated with that child in the database', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 404 and an info message describing that physical activity was not found', async () => {
                return request
                    .get(`/v1/users/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.code).to.eql(404)
                        expect(err.body.message).to.eql('Physical Activity not found!')
                        expect(err.body.description).to.eql('Physical Activity not found or already removed. A new ' +
                            'operation for the same resource is not required!')
                    })
            })
        })

        context('when the child_id is invalid', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', async () => {
                let result

                try {
                    result = await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        child_id: defaultActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                return request
                    .get(`/v1/users/children/123/physicalactivities/${result.id}`)
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
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid physical activity id', async () => {
                let result

                try {
                    result = await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        child_id: defaultActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                return request
                    .get(`/v1/users/children/${result.child_id}/physicalactivities/123`)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })
        /**
         * query-strings-parser library test
         */
        context('when get a specific physical activity of a child using the "query-strings-parser" library', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 200 and the result as needed in the query', async () => {
                let result

                try {
                    result = await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        child_id: defaultActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                const url = `/v1/users/children/${result.child_id}/physicalactivities/${result.id}?child_id=${result.child_id}
                    &fields=name,start_time,end_time,duration,calories,steps,levels,child_id&sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.id).to.eql(result.id)
                        expect(res.body.name).to.eql(defaultActivity.name)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.calories).to.eql(defaultActivity.calories)
                        if (res.body.steps) {
                            expect(res.body.steps).to.eql(defaultActivity.steps)
                        }
                        if (defaultActivity.levels) {
                            expect(res.body).to.have.property('levels')
                        }
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })
        })

        context('when there is an attempt to get a specific physical activity using the "query-strings-parser" library ' +
            'but this physical activity does not exist', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 404 and an info message describing that physical activity was not found', async () => {
                let result

                try {
                    result = await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        child_id: defaultActivity.child_id
                    })

                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                const url = `/v1/users/children/${result.child_id}/physicalactivities/${result.id}?child_id=${result.child_id}
                    &fields=name,start_time,end_time,duration,calories,steps,levels,child_id&sort=child_id&page=1&limit=3`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.code).to.eql(404)
                        expect(err.body.message).to.eql('Physical Activity not found!')
                        expect(err.body.description).to.eql('Physical Activity not found or already removed. A new ' +
                            'operation for the same resource is not required!')
                    })
            })
        })

        context('when there is an attempt to get a specific physical activity using the "query-strings-parser" library but the ' +
            'child_id is invalid', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', async () => {
                let result

                try {
                    result = await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        child_id: defaultActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                const url = `/v1/users/children/123/physicalactivities/${result.id}?child_id=${result.child_id}&fields=name,
                    start_time,end_time,duration,calories,steps,levels,child_id&sort=child_id&page=1&limit=3`

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

        context('when there is an attempt to get a specific physical activity using the "query-strings-parser" library but the ' +
            'physical activity id is invalid', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid physical activity id', async () => {
                let result

                try {
                    result = await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        child_id: defaultActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                const url = `/v1/users/children/${result.child_id}/physicalactivities/123?child_id=${result.child_id}
                    &fields=name,start_time,end_time,duration,calories,steps,levels,child_id&sort=child_id&page=1&limit=3`

                return request
                    .get(url)
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
    describe('PATCH /v1/users/children/:child_id/physicalactivities/:physicalactivity_id', () => {
        context('when this physical activity exists in the database and is updated successfully', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 200 and the updated physical activity', async () => {
                let result

                try {
                    // physical activity to be updated
                    result = await createActivityToBeUpdated(defaultActivity)
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                // physical activity to update
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    child_id: defaultActivity.child_id
                }

                return request
                    .patch(`/v1/users/children/${result.child_id}/physicalactivities/${result.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        defaultActivity.id = res.body.id
                        expect(res.body.id).to.eql(defaultActivity.id)
                        expect(res.body.start_time).to.eql(defaultActivity.start_time!.toISOString())
                        expect(res.body.end_time).to.eql(defaultActivity.end_time!.toISOString())
                        expect(res.body.duration).to.eql(defaultActivity.duration)
                        expect(res.body.child_id).to.eql(defaultActivity.child_id)
                    })
            })
        })

        context('when physical activity does not exist in the database', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 404 and an info message about the error on the search', async () => {
                // physical activity to update
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    child_id: defaultActivity.child_id
                }

                return request
                    .patch(`/v1/users/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(404)
                    .then(err => {
                        expect(err.body.code).to.eql(404)
                        expect(err.body.message).to.eql('Physical Activity not found!')
                        expect(err.body.description).to.eql('Physical Activity not found or already removed. ' +
                            'A new operation for the same resource is not required!')
                    })
            })
        })

        context('when the child_id is invalid', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', async () => {
                let result

                try {
                    // physical activity to be updated
                    result = await createActivityToBeUpdated(defaultActivity)
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                // physical activity to update
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    child_id: defaultActivity.child_id
                }

                return request
                    .patch(`/v1/users/children/123/physicalactivities/${result.id}`)
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

        context('when the physical activity id is invalid', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid physical activity id', async () => {
                let result

                try {
                    // physical activity to be updated
                    result = await createActivityToBeUpdated(defaultActivity)
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                // physical activity to update
                const body = {
                    name: defaultActivity.name,
                    start_time: defaultActivity.start_time,
                    end_time: defaultActivity.end_time,
                    duration: defaultActivity.duration,
                    calories: defaultActivity.calories,
                    steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                    levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                    child_id: defaultActivity.child_id
                }

                return request
                    .patch(`/v1/users/children/${result.child_id}/physicalactivities/123`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql(Strings.PHYSICAL_ACTIVITY.PARAM_ID_NOT_VALID_FORMAT)
                        expect(err.body.description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                    })
            })
        })

        context('when a validation error occurs (the duration is negative)', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and info message about the invalid duration', async () => {
                let result

                try {
                    // physical activity to be updated
                    result = await createActivityToBeUpdated(defaultActivity)
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                // physical activity to update
                const body = {
                    duration: -(defaultActivity.duration!)
                }

                return request
                    .patch(`/v1/users/children/${result.child_id}/physicalactivities/${result.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Duration field is invalid...')
                        expect(err.body.description).to.eql('Physical Activity validation failed: The value provided ' +
                            'has a negative value!')
                    })
            })
        })

        context('when a validation error occurs (the calories parameter is negative)', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and info message about the invalid calories parameter', async () => {
                let result

                try {
                    // physical activity to be updated
                    result = await createActivityToBeUpdated(defaultActivity)
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                // physical activity to update
                const body = {
                    calories: -(defaultActivity.calories!)
                }

                return request
                    .patch(`/v1/users/children/${result.child_id}/physicalactivities/${result.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Calories field is invalid...')
                        expect(err.body.description).to.eql('Physical Activity validation failed: The value provided ' +
                            'has a negative value!')
                    })
            })
        })

        context('when a validation error occurs (the steps parameter is negative)', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and info message about the invalid steps parameter', async () => {
                let result

                try {
                    // physical activity to be updated
                    result = await createActivityToBeUpdated(defaultActivity)
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                // physical activity to update
                const body = {
                    steps: -200
                }

                return request
                    .patch(`/v1/users/children/${result.child_id}/physicalactivities/${result.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Steps field is invalid...')
                        expect(err.body.description).to.eql('Physical Activity validation failed: The value provided ' +
                            'has a negative value!')
                    })
            })
        })

        context('when a validation error occurs (the levels array has an item with an invalid type)', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and info message about the invalid levels array', async () => {
                let result

                try {
                    // physical activity to be updated
                    result = await createActivityToBeUpdated(defaultActivity)
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                // physical activity to update
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
                    ],
                    child_id: defaultActivity.child_id
                }

                return request
                    .patch(`/v1/users/children/${result.child_id}/physicalactivities/${result.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('The name of level provided "sedentaries" is not supported...')
                        expect(err.body.description).to.eql('The names of the allowed levels are: sedentary, lightly, fairly, very.')
                    })
            })
        })

        context('when a validation error occurs (the levels array has an item that contains empty fields)', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and info message about the invalid levels array', async () => {
                let result

                try {
                    // physical activity to be updated
                    result = await createActivityToBeUpdated(defaultActivity)
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                // physical activity to update
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
                    ],
                    child_id: defaultActivity.child_id
                }

                return request
                    .patch(`/v1/users/children/${result.child_id}/physicalactivities/${result.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Level are not in a format that is supported!')
                        expect(err.body.description).to.eql('Must have values ​​for the following levels: sedentary, ' +
                            'lightly, fairly, very.')
                    })
            })
        })

        context('when a validation error occurs (the levels array has an item that contains negative duration)', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and info message about the invalid levels array', async () => {
                let result

                try {
                    // physical activity to be updated
                    result = await createActivityToBeUpdated(defaultActivity)
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                // physical activity to update
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
                    ],
                    child_id: defaultActivity.child_id
                }

                return request
                    .patch(`/v1/users/children/${result.child_id}/physicalactivities/${result.id}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Some (or several) duration field of levels array is invalid...')
                        expect(err.body.description).to.eql('Physical Activity Level validation failed: The value ' +
                            'provided has a negative value!')
                    })
            })
        })
    })
    /**
     * DELETE route for PhysicalActivity
     */
    describe('DELETE /v1/users/children/:child_id/physicalactivities/:physicalactivity_id', () => {
        context('when the physical activity was deleted successfully', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 204 and no content for physical activity', async () => {
                let result

                try {
                    result = await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        child_id: defaultActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                return request
                    .delete(`/v1/users/children/${result.child_id}/physicalactivities/${result.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the physical activity is not found', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 204 and no content for physical activity', async () => {
                return request
                    .delete(`/v1/users/children/${defaultActivity.child_id}/physicalactivities/${defaultActivity.id}`)
                    .set('Content-Type', 'application/json')
                    .expect(204)
                    .then(res => {
                        expect(res.body).to.eql({})
                    })
            })
        })

        context('when the child_id is invalid', () => {
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid child_id', async () => {
                let result

                try {
                    result = await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        child_id: defaultActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                return request
                    .delete(`/v1/users/children/123/physicalactivities/${result.id}`)
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
            before(() => {
                try {
                    deleteAllActivity()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid physical activity id', async () => {
                let result

                try {
                    result = await createActivity({
                        name: defaultActivity.name,
                        start_time: defaultActivity.start_time,
                        end_time: defaultActivity.end_time,
                        duration: defaultActivity.duration,
                        calories: defaultActivity.calories,
                        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
                        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
                        child_id: defaultActivity.child_id
                    })
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }

                return request
                    .delete(`/v1/users/children/${result.child_id}/physicalactivities/123`)
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
     * POST route for Log
     */
    describe('POST /v1/users/children/:child_id/physicalactivities/logs/:resource', () => {
        context('when all the logs in the body are correct and it still does not exist in the repository', () => {
            before(() => {
                try {
                    deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 201 and a response of type MultiStatus<Log> with the description of success in ' +
                'sending each log', async () => {
                const body: any = []

                correctLogsArr.forEach(log => {
                    const bodyElem = {
                        date: log.date,
                        value: log.value
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs/${LogType.STEPS}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body.success).is.an.instanceOf(Array)
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(HttpStatus.CREATED)
                            expect(res.body.success[i].item.date).to.eql(correctLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(correctLogsArr[i].value)
                        }
                        expect(res.body.error).is.an.instanceOf(Array)
                        expect(res.body.error.length).to.eql(0)
                    })
            })
        })

        context('when all the logs in the body are correct and already exist in the repository', () => {
            it('should return status code 201, update the value of items in the repository and return a response of type ' +
                'MultiStatus<Log> with the description of success in sending each log', async () => {
                const body: any = []

                correctLogsArr.forEach(log => {
                    const bodyElem = {
                        date: log.date,
                        value: log.value,
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs/${LogType.STEPS}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body.success).is.an.instanceOf(Array)
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(HttpStatus.CREATED)
                            expect(res.body.success[i].item.date).to.eql(correctLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(correctLogsArr[i].value)
                        }
                        expect(res.body.error).is.an.instanceOf(Array)
                        expect(res.body.error.length).to.eql(0)
                    })
            })
        })

        context('when all the logs in the body are correct and have the same date', () => {
            it('should return status code 201, create or update (if already exists) the first element, update its value ' +
                'with the value of the next logs and return a response of type MultiStatus<Log> with the description of success ' +
                'in sending each log', async () => {
                const body: any = []

                correctLogsArr.forEach(log => {
                    log.date = '2019-04-15'
                })

                correctLogsArr.forEach(log => {
                    const bodyElem = {
                        date: log.date,
                        value: log.value,
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs/${LogType.STEPS}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body.success).is.an.instanceOf(Array)
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(HttpStatus.CREATED)
                            expect(res.body.success[i].item.date).to.eql(correctLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(correctLogsArr[i].value)
                        }
                        expect(res.body.error).is.an.instanceOf(Array)
                        expect(res.body.error.length).to.eql(0)
                    })
            })
        })

        context('when all the logs in the body are correct and some of them already exist in the repository', () => {
            it('should return status code 201, update the value of the items already in the repository, create the new ones, ' +
                'and return a response of type MultiStatus<Log> with the description of success in sending each log', async () => {
                const newLog: Log = new LogMock()
                newLog.date = '2019-10-02'
                correctLogsArr.push(newLog)

                const body: any = []

                correctLogsArr.forEach(log => {
                    const bodyElem = {
                        date: log.date,
                        value: log.value,
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs/${LogType.STEPS}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body.success).is.an.instanceOf(Array)
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(HttpStatus.CREATED)
                            expect(res.body.success[i].item.date).to.eql(correctLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(correctLogsArr[i].value)
                        }
                        expect(res.body.error).is.an.instanceOf(Array)
                        expect(res.body.error.length).to.eql(0)
                    })
            })
        })

        context('when some of the logs in the body are incorrect (the date and value are invalid)', () => {
            it('should return status code 201, perform the operations of creating and updating normally for the correct logs ' +
                'and returning a response of type MultiStatus<Log> with the description of success and error cases of each log',
                async () => {
                const body: any = []

                mixedLogsArr.forEach(log => {
                    const bodyElem = {
                        date: log.date,
                        value: log.value,
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs/${LogType.STEPS}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body.success).is.an.instanceOf(Array)
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(HttpStatus.CREATED)
                            expect(res.body.success[i].item.date).to.eql(mixedLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(mixedLogsArr[i].value)
                        }

                        expect(res.body.error).is.an.instanceOf(Array)

                        expect(res.body.error[0].message).to.eql('Date parameter: 20199-03-08, is not in valid ISO 8601 format.')
                        expect(res.body.error[0].description).to.eql('Date must be in the format: yyyy-MM-dd')
                        expect(res.body.error[1].message).to.eql('Value field is invalid...')
                        expect(res.body.error[1].description).to.eql('Physical Activity log validation failed: The value ' +
                            'provided has a negative value!')

                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(HttpStatus.BAD_REQUEST)
                            expect(res.body.error[i].item.date).to.eql(mixedLogsArr[i + 3].date)
                            expect(res.body.error[i].item.value).to.eql(mixedLogsArr[i + 3].value)
                        }
                    })
            })
        })

        context('when some of the logs in the body are incorrect (the child_id is invalid)', () => {
            it('should return status code 201, perform the operations of creating and updating normally for the correct logs ' +
                'and returning a response of type MultiStatus<Log> with the description of success and error cases of each log',
                async () => {
                const body: any = []

                correctLogsArr.forEach(log => {
                    const bodyElem = {
                        date: log.date,
                        value: log.value,
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/users/children/123/physicalactivities/logs/${LogType.STEPS}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body.success).is.an.instanceOf(Array)
                        expect(res.body.success.length).to.eql(0)
                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(HttpStatus.BAD_REQUEST)
                            expect(res.body.error[i].message).to.eql(Strings.CHILD.PARAM_ID_NOT_VALID_FORMAT)
                            expect(res.body.error[i].description).to.eql(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT_DESC)
                            expect(res.body.error[i].item.date).to.eql(correctLogsArr[i].date)
                            expect(res.body.error[i].item.value).to.eql(correctLogsArr[i].value)
                        }
                    })
            })
        })

        context('when some of the logs in the body are incorrect (the type is invalid)', () => {
            it('should return status code 201, perform the operations of creating and updating normally for the correct logs ' +
                'and returning a response of type MultiStatus<Log> with the description of success and error cases of each log',
                async () => {
                const body: any = []

                correctLogsArr.forEach(log => {
                    const bodyElem = {
                        date: log.date,
                        value: log.value,
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs/step`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body.success).is.an.instanceOf(Array)
                        expect(res.body.success.length).to.eql(0)
                        for (let i = 0; i < res.body.error.length; i++) {
                            expect(res.body.error[i].code).to.eql(HttpStatus.BAD_REQUEST)
                            expect(res.body.error[i].message).to.eql('The name of type provided "step" is not supported...')
                            expect(res.body.error[i].description).to.eql('The names of the allowed types are: steps, calories, ' +
                                'active_minutes.')
                            expect(res.body.error[i].item.date).to.eql(correctLogsArr[i].date)
                            expect(res.body.error[i].item.value).to.eql(correctLogsArr[i].value)
                        }
                    })
            })
        })

        context('when some of the logs in the array are incorrect (missing fields)', () => {
            it('should return status code 201, perform the operations of creating and updating normally for the correct logs ' +
                'and returning a response of type MultiStatus<Log> with the description of success and error cases of each log',
                async () => {
                const emptyLog: Log = new Log()
                correctLogsArr.push(emptyLog)

                const body: any = []

                correctLogsArr.forEach(log => {
                    const bodyElem = {
                        date: log.date,
                        value: log.value,
                    }
                    body.push(bodyElem)
                })

                return request
                    .post(`/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs/${LogType.CALORIES}`)
                    .send(body)
                    .set('Content-Type', 'application/json')
                    .expect(201)
                    .then(res => {
                        expect(res.body.success).is.an.instanceOf(Array)
                        for (let i = 0; i < res.body.success.length; i++) {
                            expect(res.body.success[i].code).to.eql(HttpStatus.CREATED)
                            expect(res.body.success[i].item.date).to.eql(correctLogsArr[i].date)
                            expect(res.body.success[i].item.value).to.eql(correctLogsArr[i].value)
                        }
                        expect(res.body.error).is.an.instanceOf(Array)
                        expect(res.body.error[0].code).to.eql(HttpStatus.BAD_REQUEST)
                        expect(res.body.error[0].message).to.eql('Required fields were not provided...')
                        expect(res.body.error[0].description).to.eql('Physical Activity log validation failed: date, value is required!')
                    })
            })
        })
    })
    /**
     * GET route for Log
     */
    describe('GET /v1/users/children/:child_id/physicalactivities/logs/date/:date_start/:date_end', () => {
        context('when the parameters are correct and there are corresponding logs with the query', () => {
            it('should return status code 200 and a PhysicalActivityLog with steps and/or calories logs', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs`
                const specificPath = `/date/${correctLogsArr[0].date}/${correctLogsArr[0].date}`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.steps).is.an.instanceOf(Array)
                        expect(res.body.calories).is.an.instanceOf(Array)
                    })
            })
        })

        context('when the parameters are correct but there are no corresponding logs with the query', () => {
            it('should return status code 200 and an empty PhysicalActivityLog', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs`
                const specificPath = `/date/2005-10-01/2005-10-10`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.steps).is.an.instanceOf(Array)
                        expect(res.body.steps.length).to.eql(0)
                        expect(res.body.calories).is.an.instanceOf(Array)
                        expect(res.body.calories.length).to.eql(0)
                    })
            })
        })

        context('when the parameters are incorrect (child_id is invalid)', () => {
            it('should return status code 400 and an info message about the invalid child_id', async () => {
                const basePath = `/v1/users/children/123/physicalactivities/logs`
                const specificPath = `/date/${correctLogsArr[0].date}/${correctLogsArr[0].date}`
                const url = `${basePath}${specificPath}`

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

        context('when the parameters are incorrect (date_start is invalid)', () => {
            it('should return status code 400 and an info message about the invalid date_start', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs`
                const specificPath = `/date/20199-10-01/${correctLogsArr[0].date}`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Date parameter: 20199-10-01, is not in valid ISO 8601 format.')
                        expect(err.body.description).to.eql('Date must be in the format: yyyy-MM-dd')
                    })
            })
        })

        context('when the parameters are incorrect (date_end is invalid)', () => {
            it('should return status code 400 and an info message about the invalid date_end', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs`
                const specificPath = `/date/${correctLogsArr[0].date}/20199-10-01`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Date parameter: 20199-10-01, is not in valid ISO 8601 format.')
                        expect(err.body.description).to.eql('Date must be in the format: yyyy-MM-dd')
                    })
            })
        })
        /**
         * query-strings-parser library test
         */
        context('when get all logs in a time interval using the "query-strings-parser" library', () => {
            it('should return status code 200 and the result as needed in the query', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs`
                const specificPath = `/date/${correctLogsArr[0].date}/${correctLogsArr[0].date}`
                let url = `${basePath}${specificPath}?date=${correctLogsArr[0].date}&fields=date,value,type,child_id`
                url += '&sort=date&page=1&limit=2'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.steps).is.an.instanceOf(Array)
                        expect(res.body.calories).is.an.instanceOf(Array)
                    })
            })
        })

        context('when there is an attempt to get all logs in a time interval using the "query-strings-parser" library but there ' +
                'are no corresponding logs with the query in the database', () => {
            it('should return status code 200 and an empty PhysicalActivityLog', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs`
                const specificPath = `/date/2005-10-01/2005-10-10`
                let url = `${basePath}${specificPath}?date=${correctLogsArr[0].date}&fields=date,value,type,child_id`
                url += '&sort=date&page=1&limit=2'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body.steps).is.an.instanceOf(Array)
                        expect(res.body.steps.length).to.eql(0)
                        expect(res.body.calories).is.an.instanceOf(Array)
                        expect(res.body.calories.length).to.eql(0)
                    })
            })
        })

        context('when there is an attempt to get all logs in a time interval using the "query-strings-parser" library ' +
                'but the parameters are incorrect (child_id is invalid)', () => {
            it('should return status code 400 and an info message about the invalid child_id', async () => {
                const basePath = `/v1/users/children/123/physicalactivities/logs`
                const specificPath = `/date/${correctLogsArr[0].date}/${correctLogsArr[0].date}`
                let url = `${basePath}${specificPath}?date=${correctLogsArr[0].date}&fields=date,value,type,child_id`
                url += '&sort=date&page=1&limit=2'

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

        context('when there is an attempt to get all logs in a time interval using the "query-strings-parser" library ' +
                'but the parameters are incorrect (date_start is invalid)', () => {
            it('should return status code 400 and an info message about the invalid date_start', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs`
                const specificPath = `/date/20199-10-01/${correctLogsArr[0].date}`
                let url = `${basePath}${specificPath}?date=${correctLogsArr[0].date}&fields=date,value,type,child_id`
                url += '&sort=date&page=1&limit=2'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Date parameter: 20199-10-01, is not in valid ISO 8601 format.')
                        expect(err.body.description).to.eql('Date must be in the format: yyyy-MM-dd')
                    })
            })
        })

        context('when there is an attempt to get all logs in a time interval using the "query-strings-parser" library ' +
                'but the parameters are incorrect (date_end is invalid)', () => {
            it('should return status code 400 and an info message about the invalid date_end', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs`
                const specificPath = `/date/${correctLogsArr[0].date}/20199-10-01`
                let url = `${basePath}${specificPath}?date=${correctLogsArr[0].date}&fields=date,value,type,child_id`
                url += '&sort=date&page=1&limit=2'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Date parameter: 20199-10-01, is not in valid ISO 8601 format.')
                        expect(err.body.description).to.eql('Date must be in the format: yyyy-MM-dd')
                    })
            })
        })
    })
    /**
     * GET route for Log by resource
     */
    describe('GET /v1/users/children/:child_id/physicalactivities/logs/:resource/date/:date_start/:date_end', () => {
        context('when the parameters are correct and there are corresponding logs with the query', () => {
            it('should return status code 200 and an array of Logs with steps and/or calories logs', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs/${LogType.CALORIES}`
                const specificPath = `/date/${correctLogsArr[0].date}/${correctLogsArr[0].date}`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                    })
            })
        })

        context('when the parameters are correct but there are no corresponding logs with the query', () => {
            it('should return status code 200 and an empty array of logs', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs/${correctLogsArr[0].type}`
                const specificPath = `/date/2005-10-01/2005-10-10`
                const url = `${basePath}${specificPath}`

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

        context('when the parameters are incorrect (child_id is invalid)', () => {
            it('should return status code 400 and an info message about the invalid child_id', async () => {
                const basePath = `/v1/users/children/123/physicalactivities/logs/${correctLogsArr[0].type}`
                const specificPath = `/date/${correctLogsArr[0].date}/${correctLogsArr[0].date}`
                const url = `${basePath}${specificPath}`

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

        context('when the parameters are incorrect (resource is invalid)', () => {
            it('should return status code 400 and an info message about the invalid resource', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs/step`
                const specificPath = `/date/${correctLogsArr[0].date}/${correctLogsArr[0].date}`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('The name of type provided "step" is not supported...')
                        expect(err.body.description).to.eql('The names of the allowed types are: steps, calories, active_minutes.')
                    })
            })
        })

        context('when the parameters are incorrect (date_start is invalid)', () => {
            it('should return status code 400 and an info message about the invalid date_start', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs/${correctLogsArr[0].type}`
                const specificPath = `/date/20199-10-01/${correctLogsArr[0].date}`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Date parameter: 20199-10-01, is not in valid ISO 8601 format.')
                        expect(err.body.description).to.eql('Date must be in the format: yyyy-MM-dd')
                    })
            })
        })

        context('when the parameters are incorrect (date_end is invalid)', () => {
            it('should return status code 400 and an info message about the invalid date_end', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs/${correctLogsArr[0].type}`
                const specificPath = `/date/${correctLogsArr[0].date}/20199-10-01`
                const url = `${basePath}${specificPath}`

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Date parameter: 20199-10-01, is not in valid ISO 8601 format.')
                        expect(err.body.description).to.eql('Date must be in the format: yyyy-MM-dd')
                    })
            })
        })
        /**
         * query-strings-parser library test
         */
        context('when get all logs in a time interval using the "query-strings-parser" library', () => {
            it('should return status code 200 and the result as needed in the query', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs/${LogType.CALORIES}`
                const specificPath = `/date/${correctLogsArr[0].date}/${correctLogsArr[0].date}`
                let url = `${basePath}${specificPath}?date=${correctLogsArr[0].date}&fields=date,value,type,child_id`
                url += '&sort=date&page=1&limit=2'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(200)
                    .then(res => {
                        expect(res.body).is.an.instanceOf(Array)
                        expect(res.body.length).to.not.eql(0)
                    })
            })
        })

        context('when there is an attempt to get all logs in a time interval using the "query-strings-parser" library but there ' +
                'is no corresponding logs with the query in the database', () => {
            it('should return status code 200 and an empty array of logs', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs/${correctLogsArr[0].type}`
                const specificPath = `/date/2005-10-01/2005-10-10`
                let url = `${basePath}${specificPath}?date=${correctLogsArr[0].date}&fields=date,value,type,child_id`
                url += '&sort=date&page=1&limit=2'

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

        context('when there is an attempt to get all logs in a time interval using the "query-strings-parser" library ' +
                'but the parameters are incorrect (child_id is invalid)', () => {
            it('should return status code 400 and an info message about the invalid child_id', async () => {
                const basePath = `/v1/users/children/123/physicalactivities/logs/${correctLogsArr[0].type}`
                const specificPath = `/date/${correctLogsArr[0].date}/${correctLogsArr[0].date}`
                let url = `${basePath}${specificPath}?date=${correctLogsArr[0].date}&fields=date,value,type,child_id`
                url += '&sort=date&page=1&limit=2'

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

        context('when there is an attempt to get all logs in a time interval using the "query-strings-parser" library ' +
                'but the parameters are incorrect (resource is invalid)', () => {
            it('should return status code 400 and an info message about the invalid resource', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs/calorie`
                const specificPath = `/date/${correctLogsArr[0].date}/${correctLogsArr[0].date}`
                let url = `${basePath}${specificPath}?date=${correctLogsArr[0].date}&fields=date,value,type,child_id`
                url += '&sort=date&page=1&limit=2'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('The name of type provided "calorie" is not supported...')
                        expect(err.body.description).to.eql('The names of the allowed types are: steps, calories, active_minutes.')
                    })
            })
        })

        context('when there is an attempt to get all logs in a time interval using the "query-strings-parser" library ' +
                'but the parameters are incorrect (date_start is invalid)', () => {
            it('should return status code 400 and an info message about the invalid date_start', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs/${correctLogsArr[0].type}`
                const specificPath = `/date/20199-10-01/${correctLogsArr[0].date}`
                let url = `${basePath}${specificPath}?date=${correctLogsArr[0].date}&fields=date,value,type,child_id`
                url += '&sort=date&page=1&limit=2'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Date parameter: 20199-10-01, is not in valid ISO 8601 format.')
                        expect(err.body.description).to.eql('Date must be in the format: yyyy-MM-dd')
                    })
            })
        })

        context('when there is an attempt to get all logs in a time interval using the "query-strings-parser" library ' +
                'but the parameters are incorrect (date_end is invalid)', () => {
            before(() => {
                try {
                    deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on users.children.physicalactivities routes test: ' + err.message)
                }
            })

            it('should return status code 400 and an info message about the invalid date_end', async () => {
                const basePath = `/v1/users/children/${defaultActivity.child_id}/physicalactivities/logs/${correctLogsArr[0].type}`
                const specificPath = `/date/${correctLogsArr[0].date}/20199-10-01`
                let url = `${basePath}${specificPath}?date=${correctLogsArr[0].date}&fields=date,value,type,child_id`
                url += '&sort=date&page=1&limit=2'

                return request
                    .get(url)
                    .set('Content-Type', 'application/json')
                    .expect(400)
                    .then(err => {
                        expect(err.body.code).to.eql(400)
                        expect(err.body.message).to.eql('Date parameter: 20199-10-01, is not in valid ISO 8601 format.')
                        expect(err.body.description).to.eql('Date must be in the format: yyyy-MM-dd')
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

async function createActivityToBeUpdated(defaultActivity: PhysicalActivity): Promise<any> {
    // physical activity to be updated
    const result =  createActivity({
        name: defaultActivity.name,
        start_time: defaultActivity.start_time,
        end_time: defaultActivity.end_time,
        duration: defaultActivity.duration,
        calories: defaultActivity.calories,
        steps: defaultActivity.steps ? defaultActivity.steps : undefined,
        levels: defaultActivity.levels ? defaultActivity.levels : undefined,
        child_id: defaultActivity.child_id
    })

    return await Promise.resolve(result)
}

function deleteAllActivity(): void {
    ActivityRepoModel.deleteMany({}, err => {
        if (err) console.log(err)
    })
}

function deleteAllLogs(): void {
    ActivityLogRepoModel.deleteMany({}, err => {
        if (err) console.log(err)
    })
}
