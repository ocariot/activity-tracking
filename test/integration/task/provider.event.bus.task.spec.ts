import { expect } from 'chai'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { IBackgroundTask } from '../../../src/application/port/background.task.interface'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { Default } from '../../../src/utils/default'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { IPhysicalActivityRepository } from '../../../src/application/port/physical.activity.repository.interface'
import { ActivityRepoModel } from '../../../src/infrastructure/database/schema/activity.schema'
import { ActivityTypeMock, PhysicalActivityMock } from '../../mocks/physical.activity.mock'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { SleepRepoModel } from '../../../src/infrastructure/database/schema/sleep.schema'
import { MeasurementRepoModel } from '../../../src/infrastructure/database/schema/measurement.schema'
import { LogRepoModel } from '../../../src/infrastructure/database/schema/log.schema'
import { EnvironmentRepoModel } from '../../../src/infrastructure/database/schema/environment.schema'
import { SleepMock } from '../../mocks/sleep.mock'
import { Sleep } from '../../../src/application/domain/model/sleep'
import { ISleepRepository } from '../../../src/application/port/sleep.repository.interface'
import { Weight } from '../../../src/application/domain/model/weight'
import { WeightMock } from '../../mocks/weight.mock'
import { IWeightService } from '../../../src/application/port/weight.service.interface'
import { ILogRepository } from '../../../src/application/port/log.repository.interface'
import { Log, LogType } from '../../../src/application/domain/model/log'
import { LogMock } from '../../mocks/log.mock'
import { Environment } from '../../../src/application/domain/model/environment'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { IEnvironmentRepository } from '../../../src/application/port/environment.repository.interface'
import { Location } from '../../../src/application/domain/model/location'
import { Strings } from '../../../src/utils/strings'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const providerEventBusTask: IBackgroundTask = DIContainer.get(Identifier.PROVIDER_EVENT_BUS_TASK)
const activityRepository: IPhysicalActivityRepository = DIContainer.get(Identifier.ACTIVITY_REPOSITORY)
const sleepRepository: ISleepRepository = DIContainer.get(Identifier.SLEEP_REPOSITORY)
const weightService: IWeightService = DIContainer.get(Identifier.WEIGHT_SERVICE)
const environmentRepository: IEnvironmentRepository = DIContainer.get(Identifier.ENVIRONMENT_REPOSITORY)
const logRepository: ILogRepository = DIContainer.get(Identifier.LOG_REPOSITORY)

describe('PROVIDER EVENT BUS TASK', () => {
    // Timeout function for control of execution
    const timeout = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    // Start DB connection, RabbitMQ connection and ProviderEventBusTask
    before(async () => {
        try {
            await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                { interval: 100 })

            await deleteAllActivities()
            await deleteAllSleep()
            await deleteAllBodyFats()
            await deleteAllWeights()
            await deleteAllLogs()
            await deleteAllEnvironments()

            await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] }, rpcTimeout: 5000 })

            providerEventBusTask.run()

            await timeout(2000)
        } catch (err) {
            throw new Error('Failure on ProviderEventBusTask test: ' + err.message)
        }
    })

    // Stop DB connection and ProviderEventBusTask
    after(async () => {
        try {
            await deleteAllActivities()
            await deleteAllSleep()
            await deleteAllBodyFats()
            await deleteAllWeights()
            await deleteAllLogs()
            await deleteAllEnvironments()

            await dbConnection.dispose()

            await providerEventBusTask.stop()
        } catch (err) {
            throw new Error('Failure on ProviderEventBusTask test: ' + err.message)
        }
    })

    /**
     * PROVIDERS
     */
    describe('Provider PhysicalActivity', () => {
        context('when retrieving physical activities through a query successfully when there is at least ' +
            'one matching activity associated with the child_id passed in the query', () => {
            before(async () => {
                try {
                    await deleteAllActivities()
                } catch (err) {
                    throw new Error('Failure on Provider PhysicalActivity test: ' + err.message)
                }
            })
            // Delete all activities from database after each test case
            after(async () => {
                try {
                    await deleteAllActivities()
                } catch (err) {
                    throw new Error('Failure on Provider PhysicalActivity test: ' + err.message)
                }
            })
            it('should return an array with one physical activity', (done) => {
                const activity: PhysicalActivity = new PhysicalActivityMock()
                activity.child_id = '5a62be07d6f33400146c9b61'

                activityRepository.create(activity)
                    .then(async () => {
                        const result = await rabbitmq.bus.getPhysicalActivities('?child_id=5a62be07d6f33400146c9b61')
                        expect(result.length).to.eql(1)
                        // Comparing the resources
                        expect(result[0]).to.have.property('id')
                        expect(result[0].start_time).to.eql(activity.start_time!.toISOString())
                        expect(result[0].end_time).to.eql(activity.end_time!.toISOString())
                        expect(result[0].duration).to.eql(activity.duration)
                        expect(result[0].child_id).to.eql(activity.child_id)
                        expect(result[0].name).to.eql(activity.name)
                        expect(result[0].calories).to.eql(activity.calories)
                        expect(result[0].steps).to.eql(activity.steps)
                        expect(result[0].levels).to.eql(activity.levels!.map(item => item.toJSON()))
                        expect(result[0].heart_rate).to.eql(activity.heart_rate!.toJSON())
                        done()
                    })
                    .catch(done)
            })
        })

        context('when retrieving physical activities through a query successfully when there is at least ' +
            'one matching activity', () => {
            before(async () => {
                try {
                    await deleteAllActivities()

                    const activity1: PhysicalActivity = new PhysicalActivityMock()
                    activity1.start_time = new Date(1516417200000)
                    activity1.end_time = new Date(new Date(activity1.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000)) // 10-45min in milliseconds
                    activity1.duration = 900000
                    activity1.child_id = '5a62be07d6f33400146c9b61'
                    activity1.name = ActivityTypeMock.WALK
                    activity1.calories = 90
                    activity1.steps = 500
                    activity1.heart_rate!.average = 80

                    const activity2: PhysicalActivity = new PhysicalActivityMock()
                    activity2.start_time = new Date(1516449600000)
                    activity2.end_time = new Date(new Date(activity2.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000))
                    activity2.duration = 899999
                    activity2.child_id = '5a62be07d6f33400146c9b61'
                    activity2.name = ActivityTypeMock.RUN
                    activity2.calories = 300
                    activity2.steps = 2100
                    activity2.heart_rate!.average = 90

                    const activity3: PhysicalActivity = new PhysicalActivityMock()
                    activity3.start_time = new Date(1516471200000)
                    activity3.end_time = new Date(new Date(activity3.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000))
                    activity3.duration = 899999
                    activity3.child_id = '5a62be07de34500146d9c544'
                    activity3.name = ActivityTypeMock.WALK
                    activity3.calories = 120
                    activity3.steps = 700
                    activity3.heart_rate!.average = 78

                    const activity4: PhysicalActivity = new PhysicalActivityMock()
                    activity4.start_time = new Date(1547953200000)
                    activity4.end_time = new Date(new Date(activity4.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000))
                    activity4.duration = 920000
                    activity4.child_id = '5a62be07de34500146d9c544'
                    activity4.name = ActivityTypeMock.RUN
                    activity4.calories = 230
                    activity4.steps = 1700
                    activity4.heart_rate!.average = 105

                    const activity5: PhysicalActivity = new PhysicalActivityMock()
                    activity5.start_time = new Date(1547985600000)
                    activity5.end_time = new Date(new Date(activity5.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000))
                    activity5.duration = 930000
                    activity5.child_id = '5a62be07d6f33400146c9b61'
                    activity5.name = ActivityTypeMock.WALK
                    activity5.calories = 100
                    activity5.steps = 550
                    activity5.heart_rate!.average = 115

                    const activity6: PhysicalActivity = new PhysicalActivityMock()
                    activity6.start_time = new Date(1548007200000)
                    activity6.end_time = new Date(new Date(activity6.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000))
                    activity6.duration = 820000
                    activity6.child_id = '5a62be07de34500146d9c544'
                    activity6.name = ActivityTypeMock.RUN
                    activity6.calories = 180
                    activity6.steps = 1400
                    activity6.heart_rate!.average = 110

                    await activityRepository.create(activity1)
                    await activityRepository.create(activity2)
                    await activityRepository.create(activity3)
                    await activityRepository.create(activity4)
                    await activityRepository.create(activity5)
                    await activityRepository.create(activity6)
                } catch (err) {
                    throw new Error('Failure on Provider PhysicalActivity test: ' + err.message)
                }
            })
            after(async () => {
                try {
                    await deleteAllActivities()
                } catch (err) {
                    throw new Error('Failure on Provider PhysicalActivity test: ' + err.message)
                }
            })
            it('should return an array with six physical activities (regardless of association with a child)', (done) => {
                rabbitmq.bus.getPhysicalActivities('')
                    .then(result => {
                        expect(result.length).to.eql(6)
                        done()
                    })
                    .catch(done)
            })

            it('should return an empty array (no activity matches query)', (done) => {
                rabbitmq.bus.getPhysicalActivities('?child_id=5a62be07d6f33400146c9b64')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with three physical activities (query all activities by child_id)', (done) => {
                rabbitmq.bus.getPhysicalActivities('?child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with three physical activities (query all activities by name)', (done) => {
                rabbitmq.bus.getPhysicalActivities('?name=walk')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with two physical activities (query all activities by name and child_id)', (done) => {
                rabbitmq.bus.getPhysicalActivities('?name=walk&child_id=5a62be07d6f33400146c9b61')
                    .then(result => {
                        expect(result.length).to.eql(2)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with three physical activities (query all activities performed in one day)',
                (done) => {
                    rabbitmq.bus.getPhysicalActivities('?start_time=gte:2019-01-20T00:00:00.000Z&end_time=lt:2019-01-20T23:59:59.999Z')
                        .then(result => {
                            expect(result.length).to.eql(3)
                            done()
                        })
                        .catch(done)
                })

            it('should return an array with two physical activities (query the activities of a child performed in one day)',
                (done) => {
                    rabbitmq.bus.getPhysicalActivities('?start_time=gte:2019-01-20T00:00:00.000Z' +
                        '&end_time=lt:2019-01-20T23:59:59.999Z' +
                        '&child_id=5a62be07de34500146d9c544')
                        .then(result => {
                            expect(result.length).to.eql(2)
                            done()
                        })
                        .catch(done)
                })

            it('should return an array with three physical activities (query all activities performed in one week)',
                (done) => {
                    rabbitmq.bus.getPhysicalActivities('?start_at=2019-01-20T00:00:00.000Z&period=1w')
                        .then(result => {
                            expect(result.length).to.eql(3)
                            done()
                        })
                        .catch(done)
                })

            it('should return an array with two physical activities (query the activities of a child performed in one week)',
                (done) => {
                    rabbitmq.bus.getPhysicalActivities('?start_at=2019-01-20T00:00:00.000Z&period=1w&child_id=5a62be07de34500146d9c544')
                        .then(result => {
                            expect(result.length).to.eql(2)
                            done()
                        })
                        .catch(done)
                })

            it('should return an array with five physical activities (query all activities that burned 100 calories or more)',
                (done) => {
                    rabbitmq.bus.getPhysicalActivities('?calories=gte:100')
                        .then(result => {
                            expect(result.length).to.eql(5)
                            done()
                        })
                        .catch(done)
                })

            it('should return an array with three physical activities ' +
                '(query all activities of a child that burned 100 calories or more)', (done) => {
                rabbitmq.bus.getPhysicalActivities('?calories=gte:100&child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with four physical activities (query all activities that had 700 steps or more)',
                (done) => {
                    rabbitmq.bus.getPhysicalActivities('?steps=gte:700')
                        .then(result => {
                            expect(result.length).to.eql(4)
                            done()
                        })
                        .catch(done)
                })

            it('should return an array with three physical activities ' +
                '(query all activities of a child that had 700 steps or more)', (done) => {
                rabbitmq.bus.getPhysicalActivities('?steps=gte:700&child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with three physical activities ' +
                '(query all activities that have a heart rate average greater than or equal to 100)', (done) => {
                rabbitmq.bus.getPhysicalActivities('?heart_rate.average=gte:100')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with two physical activities ' +
                '(query all activities of a child that have a heart rate average greater than or equal to 100)', (done) => {
                rabbitmq.bus.getPhysicalActivities('?heart_rate.average=gte:100&child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(2)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with three physical activities (query all activities lasting 15 minutes or more)',
                (done) => {
                    rabbitmq.bus.getPhysicalActivities('?duration=gte:900000')
                        .then(result => {
                            expect(result.length).to.eql(3)
                            done()
                        })
                        .catch(done)
                })

            it('should return an array with one physical activity (query all activities of a child lasting 15 minutes or more)',
                (done) => {
                    rabbitmq.bus.getPhysicalActivities('?duration=gte:900000&child_id=5a62be07de34500146d9c544')
                        .then(result => {
                            expect(result.length).to.eql(1)
                            done()
                        })
                        .catch(done)
                })
        })

        context('when trying to retrieve physical activities through invalid query', () => {
            before(async () => {
                try {
                    await deleteAllActivities()

                    const activity: PhysicalActivity = new PhysicalActivityMock()

                    await activityRepository.create(activity)
                } catch (err) {
                    throw new Error('Failure on Provider PhysicalActivity test: ' + err.message)
                }
            })
            // Delete all physical activities from database after each test case
            after(async () => {
                try {
                    await deleteAllActivities()
                } catch (err) {
                    throw new Error('Failure on Provider PhysicalActivity test: ' + err.message)
                }
            })
            it('should return a ValidationException (query with an invalid date (start_time))', (done) => {
                rabbitmq.bus.getPhysicalActivities('?start_time=invalidStartTime')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '
                                .concat('Datetime: invalidStartTime is not in valid ISO 8601 format.'))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException (query with an invalid date (end_time))', (done) => {
                rabbitmq.bus.getPhysicalActivities('?end_time=invalidEndTime')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '
                                .concat('Datetime: invalidEndTime is not in valid ISO 8601 format.'))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException (query with an invalid number (duration))', (done) => {
                rabbitmq.bus.getPhysicalActivities('?duration=invalidDuration')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '
                                .concat('The value \'invalidDuration\' of duration field is not a number.'))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException (query with an invalid number (calories))', (done) => {
                rabbitmq.bus.getPhysicalActivities('?calories=invalidCalories')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '
                                .concat('The value \'invalidCalories\' of calories field is not a number.'))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException (query with an invalid number (steps))', (done) => {
                rabbitmq.bus.getPhysicalActivities('?steps=invalidSteps')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '
                                .concat('The value \'invalidSteps\' of steps field is not a number.'))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException (query with an invalid child id)', (done) => {
                rabbitmq.bus.getPhysicalActivities('?child_id=invalidChildId')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '.concat(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })
        })

        context('when trying to recover physical activities through a query unsuccessful (without MongoDB connection)',
            () => {
                before(async () => {
                    try {
                        await dbConnection.dispose()
                    } catch (err) {
                        throw new Error('Failure on Provider PhysicalActivity test: ' + err.message)
                    }
                })
                after(async () => {
                    try {
                        await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                            { interval: 100 })
                    } catch (err) {
                        throw new Error('Failure on Provider PhysicalActivity test: ' + err.message)
                    }
                })
                it('should return a rpc timeout error', (done) => {
                    rabbitmq.bus.getPhysicalActivities('?child_id=5a62be07d6f33400146c9b61')
                        .then(() => {
                            done(new Error('RPC should not function normally'))
                        })
                        .catch((err) => {
                            try {
                                expect(err.message).to.eql('rpc timed out')
                                done()
                            } catch (err) {
                                done(err)
                            }
                        })
                })
            })
    })

    describe('Provider Sleep', () => {
        context('when retrieving sleep objects through a query successfully when there is at least ' +
            'one matching sleep associated with the child_id passed in the query', () => {
            before(async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    throw new Error('Failure on Provider Sleep test: ' + err.message)
                }
            })
            // Delete all sleep objects from database after each test case
            after(async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    throw new Error('Failure on Provider Sleep test: ' + err.message)
                }
            })
            it('should return an array with one sleep', (done) => {
                const sleep: Sleep = new SleepMock()
                sleep.child_id = '5a62be07d6f33400146c9b61'

                sleepRepository.create(sleep)
                    .then(async () => {
                        const result = await rabbitmq.bus.getSleep('?child_id=5a62be07d6f33400146c9b61')
                        expect(result.length).to.eql(1)
                        // Comparing the resources
                        expect(result[0]).to.have.property('id')
                        expect(result[0].start_time).to.eql(sleep.start_time!.toISOString())
                        expect(result[0].end_time).to.eql(sleep.end_time!.toISOString())
                        expect(result[0].duration).to.eql(sleep.duration)
                        expect(result[0].child_id).to.eql(sleep.child_id)
                        let index = 0
                        for (const elem of sleep.pattern!.data_set) {
                            expect(result[0].pattern.data_set[index].start_time).to.eql(elem.start_time.toISOString())
                            expect(result[0].pattern.data_set[index].name).to.eql(elem.name)
                            expect(result[0].pattern.data_set[index].duration).to.eql(elem.duration)
                            index++
                        }
                        expect(result[0].pattern).to.have.property('summary')
                        expect(result[0].type).to.eql(sleep.type)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when retrieving sleep objects through a query successfully when there is at least ' +
            'one matching sleep', () => {
            before(async () => {
                try {
                    await deleteAllSleep()

                    const sleep1: Sleep = new SleepMock()
                    sleep1.start_time = new Date(1516417200000)
                    sleep1.end_time = new Date(new Date(sleep1.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000)) // 10-45min in milliseconds
                    sleep1.duration = 28800000
                    sleep1.child_id = '5a62be07d6f33400146c9b61'

                    const sleep2: Sleep = new SleepMock()
                    sleep2.start_time = new Date(1516449600000)
                    sleep2.end_time = new Date(new Date(sleep2.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000))
                    sleep2.duration = 27800000
                    sleep2.child_id = '5a62be07d6f33400146c9b61'

                    const sleep3: Sleep = new SleepMock()
                    sleep3.start_time = new Date(1516471200000)
                    sleep3.end_time = new Date(new Date(sleep3.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000))
                    sleep3.duration = 28810000
                    sleep3.child_id = '5a62be07de34500146d9c544'

                    const sleep4: Sleep = new SleepMock()
                    sleep4.start_time = new Date(1547953200000)
                    sleep4.end_time = new Date(new Date(sleep4.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000))
                    sleep4.duration = 27900000
                    sleep4.child_id = '5a62be07de34500146d9c544'

                    const sleep5: Sleep = new SleepMock()
                    sleep5.start_time = new Date(1547985600000)
                    sleep5.end_time = new Date(new Date(sleep5.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000))
                    sleep5.duration = 27895000
                    sleep5.child_id = '5a62be07d6f33400146c9b61'

                    const sleep6: Sleep = new SleepMock()
                    sleep6.start_time = new Date(1548007200000)
                    sleep6.end_time = new Date(new Date(sleep6.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000))
                    sleep6.duration = 28820000
                    sleep6.child_id = '5a62be07de34500146d9c544'

                    await sleepRepository.create(sleep1)
                    await sleepRepository.create(sleep2)
                    await sleepRepository.create(sleep3)
                    await sleepRepository.create(sleep4)
                    await sleepRepository.create(sleep5)
                    await sleepRepository.create(sleep6)
                } catch (err) {
                    throw new Error('Failure on Provider Sleep test: ' + err.message)
                }
            })
            after(async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    throw new Error('Failure on Provider Sleep test: ' + err.message)
                }
            })
            it('should return an array with six sleep objects (regardless of association with a child)', (done) => {
                rabbitmq.bus.getSleep('')
                    .then(result => {
                        expect(result.length).to.eql(6)
                        done()
                    })
                    .catch(done)
            })

            it('should return an empty array (no sleep matches query)', (done) => {
                rabbitmq.bus.getSleep('?child_id=5a62be07d6f33400146c9b64')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with three sleep objects (query sleep records by child_id)', (done) => {
                rabbitmq.bus.getSleep('?child_id=5a62be07d6f33400146c9b61')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with three sleep objects (query all sleep records in one day)', (done) => {
                rabbitmq.bus.getSleep('?start_time=gte:2019-01-20T00:00:00.000Z&end_time=lt:2019-01-20T23:59:59.999Z')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with two sleep objects (query all sleep records of a child in one day)', (done) => {
                rabbitmq.bus.getSleep('?start_time=gte:2019-01-20T00:00:00.000Z' +
                    '&end_time=lt:2019-01-20T23:59:59.999Z' +
                    '&child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(2)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with three sleep objects (query all sleep records in one week)', (done) => {
                rabbitmq.bus.getSleep('?start_at=2019-01-20T00:00:00.000Z&period=1w')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with two sleep objects (query all sleep records of a child in one week)', (done) => {
                rabbitmq.bus.getSleep('?start_at=2019-01-20T00:00:00.000Z&period=1w&child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(2)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with three sleep objects (query all sleep records that lasted 8 hours or more)',
                (done) => {
                    rabbitmq.bus.getSleep('?duration=gte:28800000')
                        .then(result => {
                            expect(result.length).to.eql(3)
                            done()
                        })
                        .catch(done)
                })

            it('should return an array with three sleep objects (query all sleep records that lasted less than 8 hours)',
                (done) => {
                    rabbitmq.bus.getSleep('?duration=lt:28800000')
                        .then(result => {
                            expect(result.length).to.eql(3)
                            done()
                        })
                        .catch(done)
                })

            it('should return an array with two sleep objects ' +
                '(query all sleep records of a child that lasted 8 hours or more)', (done) => {
                rabbitmq.bus.getSleep('?duration=gte:28800000&child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(2)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when trying to retrieve sleep objects through invalid query', () => {
            before(async () => {
                try {
                    await deleteAllSleep()

                    const sleep: Sleep = new SleepMock()

                    await sleepRepository.create(sleep)
                } catch (err) {
                    throw new Error('Failure on Provider Sleep test: ' + err.message)
                }
            })
            // Delete all sleep objects from database after each test case
            after(async () => {
                try {
                    await deleteAllSleep()
                } catch (err) {
                    throw new Error('Failure on Provider Sleep test: ' + err.message)
                }
            })
            it('should return a ValidationException (query with an invalid date (start_time))', (done) => {
                rabbitmq.bus.getSleep('?start_time=invalidStartTime')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '
                                .concat('Datetime: invalidStartTime is not in valid ISO 8601 format.'))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException (query with an invalid date (end_time))', (done) => {
                rabbitmq.bus.getSleep('?end_time=invalidEndTime')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '
                                .concat('Datetime: invalidEndTime is not in valid ISO 8601 format.'))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException (query with an invalid number (duration))', (done) => {
                rabbitmq.bus.getSleep('?duration=invalidDuration')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '
                                .concat('The value \'invalidDuration\' of duration field is not a number.'))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException (query with an invalid child id)', (done) => {
                rabbitmq.bus.getSleep('?child_id=invalidChildId')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '.concat(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })
        })

        context('when trying to recover sleep objects through a query unsuccessful (without MongoDB connection)',
            () => {
                before(async () => {
                    try {
                        await dbConnection.dispose()
                    } catch (err) {
                        throw new Error('Failure on Provider Sleep test: ' + err.message)
                    }
                })
                after(async () => {
                    try {
                        await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                            { interval: 100 })
                    } catch (err) {
                        throw new Error('Failure on Provider Sleep test: ' + err.message)
                    }
                })
                it('should return a rpc timeout error', (done) => {
                    rabbitmq.bus.getSleep('?child_id=5a62be07d6f33400146c9b61')
                        .then(() => {
                            done(new Error('RPC should not function normally'))
                        })
                        .catch((err) => {
                            try {
                                expect(err.message).to.eql('rpc timed out')
                                done()
                            } catch (err) {
                                done(err)
                            }
                        })
                })
            })
    })

    describe('Provider Weight', () => {
        context('when retrieving weight objects through a query successfully when there is at least ' +
            'one matching weight associated with the child_id passed in the query', () => {
            before(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on Provider Weight test: ' + err.message)
                }
            })
            // Delete all weight objects from database after each test case
            after(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on Provider Weight test: ' + err.message)
                }
            })
            it('should return an array with one weight', (done) => {
                const weight: Weight = new WeightMock()
                weight.child_id = '5a62be07d6f33400146c9b61'

                weightService.add(weight)
                    .then(async () => {
                        const result = await rabbitmq.bus.getWeights('?child_id=5a62be07d6f33400146c9b61')
                        expect(result.length).to.eql(1)
                        // Comparing the resources
                        expect(result[0]).to.have.property('id')
                        expect(result[0].timestamp).to.eql(weight.timestamp!.toISOString())
                        expect(result[0].value).to.eql(weight.value)
                        expect(result[0].unit).to.eql(weight.unit)
                        expect(result[0].child_id).to.eql(weight.child_id)
                        expect(result[0].body_fat).to.eql(weight.body_fat!.value)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when retrieving weight objects through a query successfully when there is at least ' +
            'one matching weight', () => {
            before(async () => {
                try {
                    await deleteAllWeights()

                    const weight1: Weight = new WeightMock()
                    weight1.timestamp = new Date(1516417200000)
                    weight1.value = 60
                    weight1.child_id = '5a62be07d6f33400146c9b61'

                    const weight2: Weight = new WeightMock()
                    weight2.timestamp = new Date(1516449600000)
                    weight2.value = 59
                    weight2.child_id = '5a62be07d6f33400146c9b61'

                    const weight3: Weight = new WeightMock()
                    weight3.timestamp = new Date(1516471200000)
                    weight3.value = 61
                    weight3.child_id = '5a62be07de34500146d9c544'

                    const weight4: Weight = new WeightMock()
                    weight4.timestamp = new Date(1547953200000)
                    weight4.value = 54
                    weight4.child_id = '5a62be07de34500146d9c544'

                    const weight5: Weight = new WeightMock()
                    weight5.timestamp = new Date(1547985600000)
                    weight5.value = 64
                    weight5.child_id = '5a62be07d6f33400146c9b61'

                    const weight6: Weight = new WeightMock()
                    weight6.timestamp = new Date(1548007200000)
                    weight6.value = 55
                    weight6.child_id = '5a62be07de34500146d9c544'

                    await weightService.add(weight1)
                    await weightService.add(weight2)
                    await weightService.add(weight3)
                    await weightService.add(weight4)
                    await weightService.add(weight5)
                    await weightService.add(weight6)
                } catch (err) {
                    throw new Error('Failure on Provider Weight test: ' + err.message)
                }
            })
            after(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on Provider Weight test: ' + err.message)
                }
            })
            it('should return an array with six weight objects (regardless of association with a child)', (done) => {
                rabbitmq.bus.getWeights('')
                    .then(result => {
                        expect(result.length).to.eql(6)
                        done()
                    })
                    .catch(done)
            })

            it('should return an empty array (no weight matches query)', (done) => {
                rabbitmq.bus.getWeights('?child_id=5a62be07d6f33400146c9b64')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with three weight objects (query all weight registers by child_id)', (done) => {
                rabbitmq.bus.getWeights('?child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with three weight objects (query all weight registers in one month)', (done) => {
                rabbitmq.bus.getWeights('?start_at=2019-01-20T00:00:00.000Z&period=1m')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with two weight objects (query all weight registers of a child in one month)', (done) => {
                rabbitmq.bus.getWeights('?start_at=2019-01-20T00:00:00.000Z&period=1m&child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(2)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with two weight objects (query all weight registers over 60 kilos)',
                (done) => {
                    rabbitmq.bus.getWeights('?value=gt:60')
                        .then(result => {
                            expect(result.length).to.eql(2)
                            done()
                        })
                        .catch(done)
                })

            it('should return an array with four weight objects (query all weight registers below or equal to 60 kilos)',
                (done) => {
                    rabbitmq.bus.getWeights('?value=lte:60')
                        .then(result => {
                            expect(result.length).to.eql(4)
                            done()
                        })
                        .catch(done)
                })

            it('should return an array with two weight objects (query all weight registers of a child below or equal to 60 kilos)',
                (done) => {
                    rabbitmq.bus.getWeights('?value=lte:60&child_id=5a62be07de34500146d9c544')
                        .then(result => {
                            expect(result.length).to.eql(2)
                            done()
                        })
                        .catch(done)
                })
        })

        context('when trying to retrieve weight objects through invalid query', () => {
            before(async () => {
                try {
                    await deleteAllWeights()

                    const weight: Weight = new WeightMock()

                    await weightService.add(weight)
                } catch (err) {
                    throw new Error('Failure on Provider Weight test: ' + err.message)
                }
            })
            // Delete all weight objects from database after each test case
            after(async () => {
                try {
                    await deleteAllWeights()
                } catch (err) {
                    throw new Error('Failure on Provider Weight test: ' + err.message)
                }
            })
            it('should return a ValidationException (query with an invalid date (timestamp))', (done) => {
                rabbitmq.bus.getWeights('?timestamp=invalidTimestamp')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '
                                .concat('Datetime: invalidTimestamp is not in valid ISO 8601 format.'))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException (query with an invalid number (value))', (done) => {
                rabbitmq.bus.getWeights('?value=invalidValue')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '
                                .concat('The value \'invalidValue\' of value field is not a number.'))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException (query with an invalid child id)', (done) => {
                rabbitmq.bus.getWeights('?child_id=invalidChildId')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '.concat(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })
        })

        context('when trying to recover weight objects through a query unsuccessful (without MongoDB connection)',
            () => {
                before(async () => {
                    try {
                        await dbConnection.dispose()
                    } catch (err) {
                        throw new Error('Failure on Provider Weight test: ' + err.message)
                    }
                })
                after(async () => {
                    try {
                        await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                            { interval: 100 })
                    } catch (err) {
                        throw new Error('Failure on Provider Weight test: ' + err.message)
                    }
                })
                it('should return a rpc timeout error', (done) => {
                    rabbitmq.bus.getWeights('?child_id=5a62be07d6f33400146c9b61')
                        .then(() => {
                            done(new Error('RPC should not function normally'))
                        })
                        .catch((err) => {
                            try {
                                expect(err.message).to.eql('rpc timed out')
                                done()
                            } catch (err) {
                                done(err)
                            }
                        })
                })
            })
    })

    describe('Provider Environment', () => {
        context('when retrieving environments through a query successfully when there is at least ' +
            'one matching environment associated with the institution_id passed in the query', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on Provider Environment test: ' + err.message)
                }
            })
            // Delete all environments from database after each test case
            after(async () => {
                try {
                    await deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on Provider Environment test: ' + err.message)
                }
            })
            it('should return an array with one environment', (done) => {
                const environment: Environment = new EnvironmentMock()
                environment.institution_id = '5a62be07d6f33400146c9b61'

                environmentRepository.create(environment)
                    .then(async () => {
                        const result = await rabbitmq.bus.getEnvironments('?institution_id=5a62be07d6f33400146c9b61')
                        expect(result.length).to.eql(1)
                        // Comparing the resources
                        expect(result[0]).to.have.property('id')
                        expect(result[0].institution_id).to.eql(environment.institution_id)
                        expect(result[0].location).to.eql(environment.location!.toJSON())
                        let index = 0
                        for (const elem of environment.measurements!) {
                            expect(result[0].measurements[index].type).to.eql(elem.type)
                            expect(result[0].measurements[index].value).to.eql(elem.value)
                            expect(result[0].measurements[index].unit).to.eql(elem.unit)
                            index++
                        }
                        expect(result[0].climatized).to.eql(environment.climatized)
                        expect(result[0].timestamp).to.eql(environment.timestamp.toISOString())
                        done()
                    })
                    .catch(done)
            })
        })

        context('when retrieving environments through a query successfully when there is at least ' +
            'one matching environment', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()

                    const environment1: Environment = new EnvironmentMock()
                    environment1.institution_id = '5a62be07d6f33400146c9b61'
                    environment1.location = new Location('Indoor', 'Room 40')
                    environment1.climatized = true
                    environment1.timestamp = new Date(1547953200000)

                    const environment2: Environment = new EnvironmentMock()
                    environment2.institution_id = '5a62be07d6f33400146c9b61'
                    environment2.location = new Location('Indoor', 'Room 40')
                    environment2.climatized = true
                    environment2.timestamp = new Date(1547985600000)

                    const environment3: Environment = new EnvironmentMock()
                    environment3.institution_id = '5a62be07de34500146d9c544'
                    environment3.climatized = true
                    environment3.timestamp = new Date(1516417200000)

                    const environment4: Environment = new EnvironmentMock()
                    environment4.institution_id = '5a62be07de34500146d9c544'
                    environment4.climatized = false
                    environment4.timestamp = new Date(1516449600000)

                    const environment5: Environment = new EnvironmentMock()
                    environment5.institution_id = '5a62be07d6f33400146c9b61'
                    environment5.location = new Location('Indoor', 'Room 35')
                    environment5.climatized = true
                    environment5.timestamp = new Date(1548007200000)

                    const environment6: Environment = new EnvironmentMock()
                    environment6.institution_id = '5a62be07de34500146d9c544'
                    environment6.climatized = false
                    environment6.timestamp = new Date(1516471200000)

                    await environmentRepository.create(environment1)
                    await environmentRepository.create(environment2)
                    await environmentRepository.create(environment3)
                    await environmentRepository.create(environment4)
                    await environmentRepository.create(environment5)
                    await environmentRepository.create(environment6)
                } catch (err) {
                    throw new Error('Failure on Provider Environment test: ' + err.message)
                }
            })
            after(async () => {
                try {
                    await deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on Provider Environment test: ' + err.message)
                }
            })
            it('should return an array with six environments (regardless of association with an institution)', (done) => {
                rabbitmq.bus.getEnvironments('')
                    .then(result => {
                        expect(result.length).to.eql(6)
                        done()
                    })
                    .catch(done)
            })

            it('should return an empty array (no environment matches query)', (done) => {
                rabbitmq.bus.getEnvironments('?institution_id=5a62be07d6f33400146c9b64')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with three environments (query all environments by institution_id)', (done) => {
                rabbitmq.bus.getEnvironments('?institution_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with four environments (query all environments that are climatized)', (done) => {
                rabbitmq.bus.getEnvironments('?climatized=true')
                    .then(result => {
                        expect(result.length).to.eql(4)
                        done()
                    })
                    .catch(done)
            })

            it('should return an array with one environment (query all environments that are climatized in an institution)',
                (done) => {
                    rabbitmq.bus.getEnvironments('?climatized=true&institution_id=5a62be07de34500146d9c544')
                        .then(result => {
                            expect(result.length).to.eql(1)
                            done()
                        })
                        .catch(done)
                })

            it('should return an array with three environments (query all the environment records of an institution in one day)',
                (done) => {
                    rabbitmq.bus.getEnvironments('?timestamp=gte:2019-01-20T00:00:00.000Z' +
                        '&timestamp=lt:2019-01-20T23:59:59.999Z' +
                        '&institution_id=5a62be07d6f33400146c9b61&climatized=true')
                        .then(result => {
                            expect(result.length).to.eql(3)
                            done()
                        })
                        .catch(done)
                })

            it('should return an array with three environments (query all the environment records of an institution in one month)',
                (done) => {
                    rabbitmq.bus.getEnvironments('?start_at=2019-01-20T00:00:00.000Z&period=1m' +
                        '&institution_id=5a62be07d6f33400146c9b61&climatized=true')
                        .then(result => {
                            expect(result.length).to.eql(3)
                            done()
                        })
                        .catch(done)
                })

            it('should return an array with two environments (query all the environment records of a room in one day)',
                (done) => {
                    rabbitmq.bus.getEnvironments('?location.local=Indoor&location.room=Room 40' +
                        '&timestamp=gte:2019-01-20T00:00:00.000Z' +
                        '&timestamp=lt:2019-01-20T23:59:59.999Z' +
                        '&institution_id=5a62be07d6f33400146c9b61&climatized=true')
                        .then(result => {
                            expect(result.length).to.eql(2)
                            done()
                        })
                        .catch(done)
                })

            it('should return an array with two environments (query all the environment records of a room in one month)',
                (done) => {
                    rabbitmq.bus.getEnvironments('?location.local=Indoor&location.room=Room 40' +
                        '&start_at=2019-01-20T00:00:00.000Z&period=1m' +
                        '&institution_id=5a62be07d6f33400146c9b61&climatized=true')
                        .then(result => {
                            expect(result.length).to.eql(2)
                            done()
                        })
                        .catch(done)
                })
        })

        context('when trying to retrieve environments through invalid query', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()

                    const environment: Environment = new EnvironmentMock()

                    await environmentRepository.create(environment)
                } catch (err) {
                    throw new Error('Failure on Provider Environment test: ' + err.message)
                }
            })
            // Delete all environments from database after each test case
            after(async () => {
                try {
                    await deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on Provider Environment test: ' + err.message)
                }
            })
            it('should return a ValidationException (query with an invalid institution id)', (done) => {
                rabbitmq.bus.getEnvironments('?institution_id=invalidInstitutionId')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '.concat(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException (query with an invalid climatized parameter)', (done) => {
                rabbitmq.bus.getEnvironments('?climatized=invalidClimatized')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '
                                .concat('The value \'invalidClimatized\' of climatized field is not a boolean.'))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException (query with an invalid date (timestamp))', (done) => {
                rabbitmq.bus.getEnvironments('?timestamp=invalidTimestamp')
                    .then(result => {
                        expect(result.length).to.eql(0)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '
                                .concat('Datetime: invalidTimestamp is not in valid ISO 8601 format.'))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })
        })

        context('when trying to recover environments through a query unsuccessful (without MongoDB connection)',
            () => {
                before(async () => {
                    try {
                        await dbConnection.dispose()
                    } catch (err) {
                        throw new Error('Failure on Provider Environment test: ' + err.message)
                    }
                })
                after(async () => {
                    try {
                        await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                            { interval: 100 })
                    } catch (err) {
                        throw new Error('Failure on Provider Environment test: ' + err.message)
                    }
                })
                it('should return a rpc timeout error', (done) => {
                    rabbitmq.bus.getEnvironments('?child_id=5a62be07d6f33400146c9b61')
                        .then(() => {
                            done(new Error('RPC should not function normally'))
                        })
                        .catch((err) => {
                            try {
                                expect(err.message).to.eql('rpc timed out')
                                done()
                            } catch (err) {
                                done(err)
                            }
                        })
                })
            })
    })

    describe('Provider Log', () => {
        context('when retrieving logs through a query successfully when there is at least one matching log ' +
            'associated with the child_id passed in the query', () => {
            before(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on Provider Log test: ' + err.message)
                }
            })
            // Delete all logs from database after each test case
            after(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on Provider Log test: ' + err.message)
                }
            })
            it('should return a ChildLog with one active_minutes log', (done) => {
                const log: Log = new LogMock(LogType.ACTIVE_MINUTES)
                log.child_id = '5a62be07d6f33400146c9b61'

                logRepository.create(log)
                    .then(async () => {
                        const result = await rabbitmq.bus.getLogs(log.child_id, log.date, log.date)
                        expect(result.steps.length).to.eql(1)
                        expect(result.steps[0].date).to.eql(log.date)
                        expect(result.steps[0].value).to.eql(0)
                        expect(result.calories.length).to.eql(1)
                        expect(result.calories[0].date).to.eql(log.date)
                        expect(result.calories[0].value).to.eql(0)
                        expect(result.active_minutes.length).to.eql(1)
                        expect(result.active_minutes[0].date).to.eql(log.date)
                        expect(result.active_minutes[0].value).to.eql(log.value)
                        expect(result.lightly_active_minutes.length).to.eql(1)
                        expect(result.lightly_active_minutes[0].date).to.eql(log.date)
                        expect(result.lightly_active_minutes[0].value).to.eql(0)
                        expect(result.sedentary_minutes.length).to.eql(1)
                        expect(result.sedentary_minutes[0].date).to.eql(log.date)
                        expect(result.sedentary_minutes[0].value).to.eql(0)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when retrieving logs through a query successfully when there is at least one matching log', () => {
            before(async () => {
                try {
                    await deleteAllLogs()

                    const log1: Log = new LogMock(LogType.STEPS)
                    log1.value = 60
                    log1.child_id = '5a62be07d6f33400146c9b61'

                    const log2: Log = new LogMock(LogType.ACTIVE_MINUTES)
                    log2.value = 59
                    log2.child_id = '5a62be07d6f33400146c9b61'

                    const log3: Log = new LogMock(LogType.LIGHTLY_ACTIVE_MINUTES)
                    log3.value = 61
                    log3.child_id = '5a62be07d6f33400146c9b61'

                    const log4: Log = new LogMock(LogType.CALORIES)
                    log4.date = '2019-01-20'
                    log4.value = 54
                    log4.child_id = '5a62be07d6f33400146c9b61'

                    const log5: Log = new LogMock(LogType.SEDENTARY_MINUTES)
                    log5.date = '2019-02-15'
                    log5.value = 64
                    log5.child_id = '5a62be07d6f33400146c9b61'

                    const log6: Log = new LogMock(LogType.STEPS)
                    log6.date = '2019-01-21'
                    log6.value = 60
                    log6.child_id = '5a62be07de34500146d9c544'

                    const log7: Log = new LogMock(LogType.ACTIVE_MINUTES)
                    log7.date = '2019-01-22'
                    log7.value = 59
                    log7.child_id = '5a62be07de34500146d9c544'

                    const log8: Log = new LogMock(LogType.LIGHTLY_ACTIVE_MINUTES)
                    log8.date = '2019-01-23'
                    log8.value = 61
                    log8.child_id = '5a62be07de34500146d9c544'

                    const log9: Log = new LogMock(LogType.CALORIES)
                    log9.date = '2019-01-20'
                    log9.value = 101
                    log9.child_id = '5a62be07de34500146d9c544'

                    const log10: Log = new LogMock(LogType.SEDENTARY_MINUTES)
                    log10.date = '2019-02-15'
                    log10.value = 64
                    log10.child_id = '5a62be07de34500146d9c544'

                    const log11: Log = new LogMock(LogType.SEDENTARY_MINUTES)
                    log11.date = '2019-02-16'
                    log11.value = 64
                    log11.child_id = '5a62be07de34500146d9c544'

                    const log12: Log = new LogMock(LogType.CALORIES)
                    log12.date = '2019-01-25'
                    log12.value = 105
                    log12.child_id = '5a62be07de34500146d9c544'

                    const log13: Log = new LogMock(LogType.CALORIES)
                    log13.date = '2019-01-26'
                    log13.value = 90
                    log13.child_id = '5a62be07de34500146d9c544'

                    await logRepository.create(log1)
                    await logRepository.create(log2)
                    await logRepository.create(log3)
                    await logRepository.create(log4)
                    await logRepository.create(log5)
                    await logRepository.create(log6)
                    await logRepository.create(log7)
                    await logRepository.create(log8)
                    await logRepository.create(log9)
                    await logRepository.create(log10)
                    await logRepository.create(log11)
                    await logRepository.create(log12)
                    await logRepository.create(log13)
                } catch (err) {
                    throw new Error('Failure on Provider Log test: ' + err.message)
                }
            })
            after(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on Provider Log test: ' + err.message)
                }
            })
            it('should return a ChildLog with empty logs (no log matches query)', (done) => {
                rabbitmq.bus.getLogs('5a62be07d6f33400146c9b64', '2019-01-01', '2019-01-01')
                    .then(result => {
                        expect(result.steps.length).to.eql(1)
                        expect(result.steps[0].date).to.eql('2019-01-01')
                        expect(result.steps[0].value).to.eql(0)
                        expect(result.calories.length).to.eql(1)
                        expect(result.calories[0].date).to.eql('2019-01-01')
                        expect(result.calories[0].value).to.eql(0)
                        expect(result.active_minutes.length).to.eql(1)
                        expect(result.active_minutes[0].date).to.eql('2019-01-01')
                        expect(result.active_minutes[0].value).to.eql(0)
                        expect(result.lightly_active_minutes.length).to.eql(1)
                        expect(result.lightly_active_minutes[0].date).to.eql('2019-01-01')
                        expect(result.lightly_active_minutes[0].value).to.eql(0)
                        expect(result.sedentary_minutes.length).to.eql(1)
                        expect(result.sedentary_minutes[0].date).to.eql('2019-01-01')
                        expect(result.sedentary_minutes[0].value).to.eql(0)
                        done()
                    })
                    .catch(done)
            })

            it('should return a ChildLog with some logs (query all logs of a child in one month)', (done) => {
                rabbitmq.bus.getLogs('5a62be07de34500146d9c544', '2019-01-20', '2019-02-18')
                    .then(result => {
                        expect(result.steps.length).to.eql(30)
                        expect(result.calories.length).to.eql(30)
                        expect(result.active_minutes.length).to.eql(30)
                        expect(result.lightly_active_minutes.length).to.eql(30)
                        expect(result.sedentary_minutes.length).to.eql(30)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when trying to retrieve logs through invalid query', () => {
            let log
            before(async () => {
                try {
                    await deleteAllLogs()

                    log = new LogMock(LogType.STEPS)

                    await logRepository.create(log)
                } catch (err) {
                    throw new Error('Failure on Provider Log test: ' + err.message)
                }
            })
            // Delete all logs from database after each test case
            after(async () => {
                try {
                    await deleteAllLogs()
                } catch (err) {
                    throw new Error('Failure on Provider Log test: ' + err.message)
                }
            })
            it('should return a ValidationException (query with an invalid date (date))', (done) => {
                rabbitmq.bus.getLogs('5a62be07d6f33400146c9b64', 'invalidDateStart', 'invalidDateEnd')
                    .then(result => {
                        expect(result.steps.length).to.eql(1)
                        expect(result.calories.length).to.eql(1)
                        expect(result.active_minutes.length).to.eql(1)
                        expect(result.lightly_active_minutes.length).to.eql(1)
                        expect(result.sedentary_minutes.length).to.eql(1)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '
                                .concat('Date parameter: invalidDateStart, is not in valid ISO 8601 format.'))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })

            it('should return a ValidationException (query with an invalid child id)', (done) => {
                rabbitmq.bus.getLogs('invalidChildId', log.date, log.date)
                    .then(result => {
                        expect(result.steps.length).to.eql(1)
                        expect(result.calories.length).to.eql(1)
                        expect(result.active_minutes.length).to.eql(1)
                        expect(result.lightly_active_minutes.length).to.eql(1)
                        expect(result.sedentary_minutes.length).to.eql(1)
                        done(new Error('The find method of the repository should not function normally'))
                    })
                    .catch((err) => {
                        try {
                            expect(err.message).to.eql('Error: '.concat(Strings.ERROR_MESSAGE.UUID_NOT_VALID_FORMAT))
                            done()
                        } catch (err) {
                            done(err)
                        }
                    })
            })
        })

        context('when trying to recover logs through a query unsuccessful (without MongoDB connection)',
            () => {
                before(async () => {
                    try {
                        await dbConnection.dispose()
                    } catch (err) {
                        throw new Error('Failure on Provider Log test: ' + err.message)
                    }
                })
                after(async () => {
                    try {
                        await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                            { interval: 100 })
                    } catch (err) {
                        throw new Error('Failure on Provider Log test: ' + err.message)
                    }
                })
                it('should return a rpc timeout error', (done) => {
                    rabbitmq.bus.getLogs('5a62be07d6f33400146c9b61', '2019-01-01', '2019-01-05')
                        .then(() => {
                            done(new Error('RPC should not function normally'))
                        })
                        .catch((err) => {
                            try {
                                expect(err.message).to.eql('rpc timed out')
                                done()
                            } catch (err) {
                                done(err)
                            }
                        })
                })
            })
    })
})

async function deleteAllActivities() {
    return ActivityRepoModel.deleteMany({})
}

async function deleteAllSleep() {
    return SleepRepoModel.deleteMany({})
}

async function deleteAllBodyFats() {
    return MeasurementRepoModel.deleteMany({})
}

async function deleteAllWeights() {
    return MeasurementRepoModel.deleteMany({})
}

async function deleteAllLogs() {
    return LogRepoModel.deleteMany({})
}

async function deleteAllEnvironments() {
    return EnvironmentRepoModel.deleteMany({})
}
