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

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const providerEventBusTask: IBackgroundTask = DIContainer.get(Identifier.PROVIDER_EVENT_BUS_TASK)
const activityRepository: IPhysicalActivityRepository = DIContainer.get(Identifier.ACTIVITY_REPOSITORY)
const sleepRepository: ISleepRepository = DIContainer.get(Identifier.SLEEP_REPOSITORY)

describe('PROVIDER EVENT BUS TASK', () => {
    // Start DB connection, RabbitMQ connection and ProviderEventBusTask
    before(async () => {
        try {
            await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)

            await deleteAllActivities()
            await deleteAllSleep()
            await deleteAllBodyFats()
            await deleteAllWeights()
            await deleteAllLogs()
            await deleteAllEnvironments()

            await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                { receiveFromYourself: true, sslOptions: { ca: [] }, rpcTimeout: 500 })

            await providerEventBusTask.run()
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

                activityRepository.create(activity).then(() => {
                    rabbitmq.bus.getPhysicalActivities('?child_id=5a62be07d6f33400146c9b61').then(result => {
                        expect(result.length).to.eql(1)
                        // As a new resource saved in the database always has a new id,
                        // this is necessary before comparing the saved resource in the
                        // database with the one sent to the bus.
                        result[0].child_id = result[0].child_id.toString()
                        activity.id = result[0].id
                        // Comparing the resources
                        expect(result[0].id).to.eql(activity.id)
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
                })
            })
        })

        context('when retrieving physical activities through a query successfully when there is at least ' +
            'one matching activity (regardless of association with a child)', () => {
            before(async () => {
                try {
                    const activity1: PhysicalActivity = new PhysicalActivityMock()
                    activity1.child_id = '5a62be07d6f33400146c9b61'
                    const activity2: PhysicalActivity = new PhysicalActivityMock()
                    activity2.child_id = '5a62be07de34500146d9c544'
                    const activity3: PhysicalActivity = new PhysicalActivityMock()
                    activity3.child_id = '5a62be07d6f33400146c9b61'
                    const activity4: PhysicalActivity = new PhysicalActivityMock()
                    activity4.child_id = '5a62be07de34500146d9c544'
                    const activity5: PhysicalActivity = new PhysicalActivityMock()
                    activity5.child_id = '5a62be07d6f33400146c9b61'

                    await activityRepository.create(activity1)
                    await activityRepository.create(activity2)
                    await activityRepository.create(activity3)
                    await activityRepository.create(activity4)
                    await activityRepository.create(activity5)
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
            it('should return an array with five physical activities', (done) => {
                rabbitmq.bus.getPhysicalActivities('').then(result => {
                    expect(result.length).to.eql(5)
                    done()
                })
            })
        })

        context('when retrieving physical activities through a query successfully when there is at least ' +
            'one matching activity', () => {
            before(async () => {
                try {
                    const activity1: PhysicalActivity = new PhysicalActivityMock()
                    activity1.duration = 900000
                    activity1.child_id = '5a62be07d6f33400146c9b61'
                    activity1.name = ActivityTypeMock.WALK
                    activity1.calories = 90
                    activity1.steps = 500
                    activity1.heart_rate!.average = 80

                    const activity2: PhysicalActivity = new PhysicalActivityMock()
                    activity2.duration = 899999
                    activity2.child_id = '5a62be07d6f33400146c9b61'
                    activity2.name = ActivityTypeMock.RUN
                    activity2.calories = 300
                    activity2.steps = 2100
                    activity2.heart_rate!.average = 90

                    const activity3: PhysicalActivity = new PhysicalActivityMock()
                    activity3.duration = 899999
                    activity3.child_id = '5a62be07de34500146d9c544'
                    activity3.name = ActivityTypeMock.WALK
                    activity3.calories = 120
                    activity3.steps = 700
                    activity3.heart_rate!.average = 78

                    const activity4: PhysicalActivity = new PhysicalActivityMock()
                    activity4.start_time = new Date(1547953200000 + Math.floor((Math.random() * 1000)))
                    activity4.end_time = new Date(new Date(activity4.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000)) // 10-45min in milliseconds
                    activity4.duration = 920000
                    activity4.child_id = '5a62be07de34500146d9c544'
                    activity4.name = ActivityTypeMock.RUN
                    activity4.calories = 230
                    activity4.steps = 1700
                    activity4.heart_rate!.average = 105

                    const activity5: PhysicalActivity = new PhysicalActivityMock()
                    activity5.start_time = new Date(1547953200000 + Math.floor((Math.random() * 1000)))
                    activity5.end_time = new Date(new Date(activity5.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000)) // 10-45min in milliseconds
                    activity5.duration = 930000
                    activity5.child_id = '5a62be07d6f33400146c9b61'
                    activity5.name = ActivityTypeMock.WALK
                    activity5.calories = 100
                    activity5.steps = 550
                    activity5.heart_rate!.average = 115

                    const activity6: PhysicalActivity = new PhysicalActivityMock()
                    activity6.start_time = new Date(1547953200000 + Math.floor((Math.random() * 1000)))
                    activity6.end_time = new Date(new Date(activity6.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000)) // 10-45min in milliseconds
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
            it('should return an empty array', (done) => {
                rabbitmq.bus.getPhysicalActivities('?child_id=5a62be07d6f33400146c9b64').then(result => {
                    expect(result.length).to.eql(0)
                    done()
                })
            })

            it('should return an array with three physical activities', (done) => {
                rabbitmq.bus.getPhysicalActivities('?name=walk').then(result => {
                    expect(result.length).to.eql(3)
                    done()
                })
            })

            it('should return an array with two physical activities', (done) => {
                rabbitmq.bus.getPhysicalActivities('?name=walk&child_id=5a62be07d6f33400146c9b61').then(result => {
                    expect(result.length).to.eql(2)
                    done()
                })
            })

            it('should return an array with three physical activities', (done) => {
                rabbitmq.bus.getPhysicalActivities('?start_time=gte:2019-01-20T00:00:00.000Z&start_time=lt:2019-01-20T23:59:59.999Z')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
            })

            it('should return an array with two physical activities', (done) => {
                rabbitmq.bus.getPhysicalActivities('?start_time=gte:2019-01-20T00:00:00.000Z' +
                                                          '&start_time=lt:2019-01-20T23:59:59.999Z' +
                                                          '&child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(2)
                        done()
                    })
            })

            it('should return an array with three physical activities', (done) => {
                rabbitmq.bus.getPhysicalActivities('?start_at=2019-01-20T00:00:00.000Z&period=1w')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
            })

            it('should return an array with two physical activities', (done) => {
                rabbitmq.bus.getPhysicalActivities('?start_at=2019-01-20T00:00:00.000Z&period=1w&child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(2)
                        done()
                    })
            })

            it('should return an array with five physical activities', (done) => {
                rabbitmq.bus.getPhysicalActivities('?calories=gte:100')
                    .then(result => {
                        expect(result.length).to.eql(5)
                        done()
                    })
            })

            it('should return an array with three physical activities', (done) => {
                rabbitmq.bus.getPhysicalActivities('?calories=gte:100&child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
            })

            it('should return an array with four physical activities', (done) => {
                rabbitmq.bus.getPhysicalActivities('?steps=gte:700')
                    .then(result => {
                        expect(result.length).to.eql(4)
                        done()
                    })
            })

            it('should return an array with three physical activities', (done) => {
                rabbitmq.bus.getPhysicalActivities('?steps=gte:700&child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
            })

            it('should return an array with three physical activities', (done) => {
                rabbitmq.bus.getPhysicalActivities('?heart_rate.average=gte:100')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
            })

            it('should return an array with two physical activities', (done) => {
                rabbitmq.bus.getPhysicalActivities('?heart_rate.average=gte:100&child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(2)
                        done()
                    })
            })

            it('should return an array with three physical activities', (done) => {
                rabbitmq.bus.getPhysicalActivities('?duration=gte:900000')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
            })

            it('should return an array with one physical activity', (done) => {
                rabbitmq.bus.getPhysicalActivities('?duration=gte:900000&child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(1)
                        done()
                    })
            })
        })

        context('when trying to recover physical activities through a query unsuccessful (without MongoDB connection)',
            () => {
            before(async () => {
                try {
                    const activity1: PhysicalActivity = new PhysicalActivityMock()
                    activity1.child_id = '5a62be07d6f33400146c9b61'
                    const activity2: PhysicalActivity = new PhysicalActivityMock()
                    activity2.child_id = '5a62be07d6f33400146c9b61'

                    await activityRepository.create(activity1)
                    await activityRepository.create(activity2)
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
            it('should return an rpc timeout error', (done) => {
                dbConnection.dispose().then(() => {
                    rabbitmq.bus.getPhysicalActivities('?child_id=5a62be07d6f33400146c9b61')
                        .then(result => {
                            expect(result.length).to.eql(2)
                        })
                        .catch(err => {
                            expect(err.message).to.eql('rpc timed out')
                            dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST).then(() => {
                                done()
                            })
                        })
                })
            })
        })
    })

    describe('Provider Sleep', () => {
        context('when retrieving sleep objects through a query successfully when there is at least ' +
            'one matching sleep associated with the child_id passed in the query', () => {
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

                sleepRepository.create(sleep).then(() => {
                    rabbitmq.bus.getSleep('?child_id=5a62be07d6f33400146c9b61').then(result => {
                        expect(result.length).to.eql(1)
                        // As a new resource saved in the database always has a new id,
                        // this is necessary before comparing the saved resource in the
                        // database with the one sent to the bus.
                        result[0].child_id = result[0].child_id.toString()
                        sleep.id = result[0].id
                        // Comparing the resources
                        expect(result[0].id).to.eql(sleep.id)
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
                })
            })
        })

        context('when retrieving sleep objects through a query successfully when there is at least ' +
            'one matching sleep (regardless of association with a child)', () => {
            before(async () => {
                try {
                    const sleep1: Sleep = new SleepMock()
                    sleep1.child_id = '5a62be07d6f33400146c9b61'
                    const sleep2: Sleep = new SleepMock()
                    sleep2.child_id = '5a62be07de34500146d9c544'
                    const sleep3: Sleep = new SleepMock()
                    sleep3.child_id = '5a62be07d6f33400146c9b61'
                    const sleep4: Sleep = new SleepMock()
                    sleep4.child_id = '5a62be07de34500146d9c544'
                    const sleep5: Sleep = new SleepMock()
                    sleep5.child_id = '5a62be07d6f33400146c9b61'

                    await sleepRepository.create(sleep1)
                    await sleepRepository.create(sleep2)
                    await sleepRepository.create(sleep3)
                    await sleepRepository.create(sleep4)
                    await sleepRepository.create(sleep5)
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
            it('should return an array with five sleep objects', (done) => {
                rabbitmq.bus.getSleep('').then(result => {
                    expect(result.length).to.eql(5)
                    done()
                })
            })
        })

        context('when retrieving sleep objects through a query successfully when there is at least ' +
            'one matching sleep', () => {
            before(async () => {
                try {
                    const sleep1: Sleep = new SleepMock()
                    sleep1.duration = 28800000
                    sleep1.child_id = '5a62be07d6f33400146c9b61'

                    const sleep2: Sleep = new SleepMock()
                    sleep2.duration = 27800000
                    sleep2.child_id = '5a62be07d6f33400146c9b61'

                    const sleep3: Sleep = new SleepMock()
                    sleep3.duration = 28810000
                    sleep3.child_id = '5a62be07de34500146d9c544'

                    const sleep4: Sleep = new SleepMock()
                    sleep4.start_time = new Date(1547953200000 + Math.floor((Math.random() * 1000)))
                    sleep4.end_time = new Date(new Date(sleep4.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000)) // 10-45min in milliseconds
                    sleep4.duration = 27900000
                    sleep4.child_id = '5a62be07de34500146d9c544'

                    const sleep5: Sleep = new SleepMock()
                    sleep5.start_time = new Date(1547953200000 + Math.floor((Math.random() * 1000)))
                    sleep5.end_time = new Date(new Date(sleep5.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000)) // 10-45min in milliseconds
                    sleep5.duration = 27895000
                    sleep5.child_id = '5a62be07d6f33400146c9b61'

                    const sleep6: Sleep = new SleepMock()
                    sleep6.start_time = new Date(1547953200000 + Math.floor((Math.random() * 1000)))
                    sleep6.end_time = new Date(new Date(sleep6.start_time)
                        .setMilliseconds(Math.floor(Math.random() * 35 + 10) * 60000)) // 10-45min in milliseconds
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
            it('should return an empty array', (done) => {
                rabbitmq.bus.getSleep('?child_id=5a62be07d6f33400146c9b64').then(result => {
                    expect(result.length).to.eql(0)
                    done()
                })
            })

            it('should return an array with three sleep objects', (done) => {
                rabbitmq.bus.getSleep('?start_time=gte:2019-01-20T00:00:00.000Z&start_time=lt:2019-01-20T23:59:59.999Z')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
            })

            it('should return an array with two sleep objects', (done) => {
                rabbitmq.bus.getSleep('?start_time=gte:2019-01-20T00:00:00.000Z' +
                    '&start_time=lt:2019-01-20T23:59:59.999Z' +
                    '&child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(2)
                        done()
                    })
            })

            it('should return an array with three sleep objects', (done) => {
                rabbitmq.bus.getSleep('?start_at=2019-01-20T00:00:00.000Z&period=1w')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
            })

            it('should return an array with two sleep objects', (done) => {
                rabbitmq.bus.getSleep('?start_at=2019-01-20T00:00:00.000Z&period=1w&child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(2)
                        done()
                    })
            })

            it('should return an array with three sleep objects', (done) => {
                rabbitmq.bus.getSleep('?duration=gte:28800000')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
            })

            it('should return an array with three sleep objects', (done) => {
                rabbitmq.bus.getSleep('?duration=lt:28800000')
                    .then(result => {
                        expect(result.length).to.eql(3)
                        done()
                    })
            })

            it('should return an array with two sleep objects', (done) => {
                rabbitmq.bus.getSleep('?duration=gte:28800000&child_id=5a62be07de34500146d9c544')
                    .then(result => {
                        expect(result.length).to.eql(2)
                        done()
                    })
            })
        })

        context('when trying to recover sleep objects through a query unsuccessful (without MongoDB connection)',
            () => {
                before(async () => {
                    try {
                        const sleep1: Sleep = new SleepMock()
                        sleep1.child_id = '5a62be07d6f33400146c9b61'
                        const sleep2: Sleep = new SleepMock()
                        sleep2.child_id = '5a62be07d6f33400146c9b61'

                        await sleepRepository.create(sleep1)
                        await sleepRepository.create(sleep2)
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
                it('should return an rpc timeout error', (done) => {
                    dbConnection.dispose().then(() => {
                        rabbitmq.bus.getSleep('?child_id=5a62be07d6f33400146c9b61')
                            .then(result => {
                                expect(result.length).to.eql(2)
                            })
                            .catch(err => {
                                expect(err.message).to.eql('rpc timed out')
                                dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST).then(() => {
                                    done()
                                })
                            })
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
