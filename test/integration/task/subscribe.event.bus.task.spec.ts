import { expect } from 'chai'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { IBackgroundTask } from '../../../src/application/port/background.task.interface'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { Default } from '../../../src/utils/default'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { IPhysicalActivityRepository } from '../../../src/application/port/physical.activity.repository.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { ActivityRepoModel } from '../../../src/infrastructure/database/schema/activity.schema'
import { PhysicalActivityMock } from '../../mocks/physical.activity.mock'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { SleepRepoModel } from '../../../src/infrastructure/database/schema/sleep.schema'
import { Sleep } from '../../../src/application/domain/model/sleep'
import { SleepMock } from '../../mocks/sleep.mock'
import { ISleepRepository } from '../../../src/application/port/sleep.repository.interface'
import { MeasurementRepoModel } from '../../../src/infrastructure/database/schema/measurement.schema'
import { IWeightRepository } from '../../../src/application/port/weight.repository.interface'
import { Weight } from '../../../src/application/domain/model/weight'
import { WeightMock } from '../../mocks/weight.mock'
import { LogRepoModel } from '../../../src/infrastructure/database/schema/log.schema'
import { Log, LogType } from '../../../src/application/domain/model/log'
import { ILogRepository } from '../../../src/application/port/log.repository.interface'
import { EnvironmentRepoModel } from '../../../src/infrastructure/database/schema/environment.schema'
import { IEnvironmentRepository } from '../../../src/application/port/environment.repository.interface'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { Environment } from '../../../src/application/domain/model/environment'
import { IBodyFatRepository } from '../../../src/application/port/body.fat.repository.interface'
import { MeasurementType } from '../../../src/application/domain/model/measurement'
import { IQuery } from '../../../src/application/port/query.interface'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const subscribeEventBusTask: IBackgroundTask = DIContainer.get(Identifier.SUB_EVENT_BUS_TASK)
const activityRepository: IPhysicalActivityRepository = DIContainer.get(Identifier.ACTIVITY_REPOSITORY)
const sleepRepository: ISleepRepository = DIContainer.get(Identifier.SLEEP_REPOSITORY)
const bodyFatRepository: IBodyFatRepository = DIContainer.get(Identifier.BODY_FAT_REPOSITORY)
const weightRepository: IWeightRepository = DIContainer.get(Identifier.WEIGHT_REPOSITORY)
const logRepository: ILogRepository = DIContainer.get(Identifier.LOG_REPOSITORY)
const environmentRepository: IEnvironmentRepository = DIContainer.get(Identifier.ENVIRONMENT_REPOSITORY)

describe('SUBSCRIBE EVENT BUS TASK', () => {
    // Timeout function for control of execution
    const timeout = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    // Start DB connection, RabbitMQ connection and SubscribeEventBusTask
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
                { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] } })

            subscribeEventBusTask.run()

            await timeout(2000)
        } catch (err) {
            throw new Error('Failure on SubscribeEventBusTask test: ' + err.message)
        }
    })

    // Stop DB connection and SubscribeEventBusTask
    after(async () => {
        try {
            await deleteAllActivities()
            await deleteAllSleep()
            await deleteAllBodyFats()
            await deleteAllWeights()
            await deleteAllLogs()
            await deleteAllEnvironments()

            await dbConnection.dispose()

            await subscribeEventBusTask.stop()
        } catch (err) {
            throw new Error('Failure on SubscribeEventBusTask test: ' + err.message)
        }
    })

    /**
     * SUBSCRIBERS
     */
    describe('SUBSCRIBE PhysicalActivitySaveEvent', () => {
        before(async () => {
            try {
                await deleteAllActivities()
            } catch (err) {
                throw new Error('Failure on Subscribe PhysicalActivitySaveEvent test: ' + err.message)
            }
        })
        // Delete all activities from database after each test case
        afterEach(async () => {
            try {
                await deleteAllActivities()
            } catch (err) {
                throw new Error('Failure on Subscribe PhysicalActivitySaveEvent test: ' + err.message)
            }
        })

        context('when posting a PhysicalActivitySaveEvent with one physical activity successfully', () => {
            const activity: PhysicalActivity = new PhysicalActivityMock()
            it('should return an array with one physical activity', (done) => {
                rabbitmq.bus.pubSavePhysicalActivity(activity)
                    .then(async () => {
                        // Wait for 2000 milliseconds for the task to be executed
                        await timeout(2000)

                        const result = await activityRepository.find(new Query())
                        expect(result.length).to.eql(1)
                        // As a new resource saved in the database always has a new id,
                        // this is necessary before comparing the saved resource in the
                        // database with the one sent to the bus.
                        activity.id = result[0].id
                        result[0].child_id = result[0].child_id.toString()
                        // Comparing the resources
                        expect(result[0]).to.eql(activity)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting a PhysicalActivitySaveEvent with one invalid physical activity', () => {
            const activity: PhysicalActivity = new PhysicalActivity()       // Invalid activity
            it('should return an empty array', (done) => {
                rabbitmq.bus.pubSavePhysicalActivity(activity)
                    .then(async () => {
                        await timeout(2000)
                        const result = await activityRepository.find(new Query())
                        expect(result.length).to.eql(0)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting a PhysicalActivitySaveEvent with one physical activity successfully ' +
            '(without MongoDB connection, at first)', () => {
            before(async () => {
                try {
                    await dbConnection.dispose()
                } catch (err) {
                    throw new Error('Failure on Subscribe PhysicalActivitySaveEvent test: ' + err.message)
                }
            })
            const activity: PhysicalActivity = new PhysicalActivityMock()
            it('should return an array with one physical activity', (done) => {
                rabbitmq.bus.pubSavePhysicalActivity(activity)
                    .then(async () => {
                        await timeout(1000)
                        await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                            { interval: 100 })

                        await timeout(2000)
                        const result = await activityRepository.find(new Query())
                        expect(result.length).to.eql(1)

                        activity.id = result[0].id
                        result[0].child_id = result[0].child_id.toString()

                        expect(result[0]).to.eql(activity)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting a PhysicalActivitySaveEvent with some correct physical activities successfully', () => {
            const activity1: PhysicalActivity = new PhysicalActivityMock()
            const activity2: PhysicalActivity = new PhysicalActivityMock()
            const activity3: PhysicalActivity = new PhysicalActivityMock()
            it('should return an array with three physical activities', (done) => {
                rabbitmq.bus.pubSavePhysicalActivity([activity1, activity2, activity3])
                    .then(async () => {
                        await timeout(2000)
                        const result = await activityRepository.find(new Query())
                        expect(result.length).to.eql(3)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting a PhysicalActivitySaveEvent with some incorrect physical activities successfully', () => {
            const activity1: PhysicalActivity = new PhysicalActivityMock()
            const activity2: PhysicalActivity = new PhysicalActivity()
            const activity3: PhysicalActivity = new PhysicalActivityMock()
            it('should return an array with two physical activities', (done) => {
                rabbitmq.bus.pubSavePhysicalActivity([activity1, activity2, activity3])
                    .then(async () => {
                        await timeout(2000)
                        const result = await activityRepository.find(new Query())
                        expect(result.length).to.eql(2)
                        done()
                    })
                    .catch(done)
            })
        })
    })

    describe('SUBSCRIBE SleepSaveEvent', () => {
        before(async () => {
            try {
                await deleteAllSleep()
            } catch (err) {
                throw new Error('Failure on Subscribe SleepSaveEvent test: ' + err.message)
            }
        })
        // Delete all sleep objects from database after each test case
        afterEach(async () => {
            try {
                await deleteAllSleep()
            } catch (err) {
                throw new Error('Failure on Subscribe SleepSaveEvent test: ' + err.message)
            }
        })

        context('when posting a SleepSaveEvent with one sleep object successfully', () => {
            const sleep: Sleep = new SleepMock()
            it('should return an array with one sleep object', (done) => {
                rabbitmq.bus.pubSaveSleep(sleep)
                    .then(async () => {
                        // Wait for 2000 milliseconds for the task to be executed
                        await timeout(2000)

                        const result = await sleepRepository.find(new Query())
                        expect(result.length).to.eql(1)
                        // As a new resource saved in the database always has a new id,
                        // this is necessary before comparing the saved resource in the
                        // database with the one sent to the bus.
                        sleep.id = result[0].id
                        result[0].child_id = result[0].child_id.toString()
                        // Comparing the resources
                        expect(result[0].id).to.eql(sleep.id)
                        expect(result[0].start_time).to.eql(sleep.start_time)
                        expect(result[0].end_time).to.eql(sleep.end_time)
                        expect(result[0].duration).to.eql(sleep.duration)
                        expect(result[0].child_id).to.eql(sleep.child_id)
                        expect(result[0].pattern!.data_set).to.eql(sleep.pattern!.data_set)
                        expect(result[0].pattern).to.have.property('summary')
                        expect(result[0].type).to.eql(sleep.type)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting a SleepSaveEvent with one invalid sleep object', () => {
            const sleep: Sleep = new Sleep()       // Invalid sleep object
            it('should return an empty array', (done) => {
                rabbitmq.bus.pubSaveSleep(sleep)
                    .then(async () => {
                        await timeout(2000)
                        const result = await sleepRepository.find(new Query())
                        expect(result.length).to.eql(0)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting a SleepSaveEvent with one sleep object successfully ' +
            '(without MongoDB connection, at first)', () => {
            before(async () => {
                try {
                    await dbConnection.dispose()
                } catch (err) {
                    throw new Error('Failure on Subscribe SleepSaveEvent test: ' + err.message)
                }
            })
            const sleep: Sleep = new SleepMock()
            it('should return an array with one sleep object', (done) => {
                rabbitmq.bus.pubSaveSleep(sleep)
                    .then(async () => {
                        await timeout(1000)
                        await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                            { interval: 100 })

                        await timeout(2000)
                        const result = await sleepRepository.find(new Query())
                        expect(result.length).to.eql(1)

                        sleep.id = result[0].id
                        result[0].child_id = result[0].child_id.toString()

                        expect(result[0].id).to.eql(sleep.id)
                        expect(result[0].start_time).to.eql(sleep.start_time)
                        expect(result[0].end_time).to.eql(sleep.end_time)
                        expect(result[0].duration).to.eql(sleep.duration)
                        expect(result[0].child_id).to.eql(sleep.child_id)
                        expect(result[0].pattern!.data_set).to.eql(sleep.pattern!.data_set)
                        expect(result[0].pattern).to.have.property('summary')
                        expect(result[0].type).to.eql(sleep.type)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting a SleepSaveEvent with some correct sleep objects successfully', () => {
            const sleep1: Sleep = new SleepMock()
            const sleep2: Sleep = new SleepMock()
            const sleep3: Sleep = new SleepMock()
            it('should return an array with three sleep objects', (done) => {
                rabbitmq.bus.pubSaveSleep([sleep1, sleep2, sleep3])
                    .then(async () => {
                        await timeout(2000)
                        const result = await sleepRepository.find(new Query())
                        expect(result.length).to.eql(3)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting a SleepSaveEvent with some incorrect sleep objects successfully', () => {
            const sleep1: Sleep = new SleepMock()
            const sleep2: Sleep = new Sleep()
            const sleep3: Sleep = new SleepMock()
            it('should return an array with two sleep objects', (done) => {
                rabbitmq.bus.pubSaveSleep([sleep1, sleep2, sleep3])
                    .then(async () => {
                        await timeout(2000)
                        const result = await sleepRepository.find(new Query())
                        expect(result.length).to.eql(2)
                        done()
                    })
                    .catch(done)
            })
        })
    })

    describe('SUBSCRIBE WeightSaveEvent', () => {
        before(async () => {
            try {
                await deleteAllBodyFats()
                await deleteAllWeights()
            } catch (err) {
                throw new Error('Failure on Subscribe WeightSaveEvent test: ' + err.message)
            }
        })
        // Delete all weight objects from database after each test case
        afterEach(async () => {
            try {
                await deleteAllBodyFats()
                await deleteAllWeights()
            } catch (err) {
                throw new Error('Failure on Subscribe WeightSaveEvent test: ' + err.message)
            }
        })
        context('when posting a WeightSaveEvent with one weight object successfully', () => {
            const weight: Weight = new WeightMock()
            it('should return an array with one weight object', (done) => {
                rabbitmq.bus.pubSaveWeight(weight)
                    .then(async () => {
                        // Wait for 2000 milliseconds for the task to be executed
                        await timeout(2000)

                        const result = await weightRepository.find(new Query())
                        expect(result.length).to.eql(1)
                        // As a new resource saved in the database always has a new id,
                        // this is necessary before comparing the saved resource in the
                        // database with the one sent to the bus.
                        weight.id = result[0].id
                        result[0].child_id = result[0].child_id!.toString()
                        // Comparing the resources
                        expect(result[0].id).to.eql(weight.id)
                        expect(result[0].type).to.eql(weight.type)
                        expect(result[0].timestamp).to.eql(weight.timestamp)
                        expect(result[0].value).to.eql(weight.value)
                        expect(result[0].unit).to.eql(weight.unit)
                        expect(result[0].child_id).to.eql(weight.child_id)
                        expect(result[0].body_fat!.value).to.eql(weight.body_fat!.value)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting a WeightSaveEvent with one invalid weight object', () => {
            const weight: Weight = new Weight()       // Invalid weight object
            it('should return an empty array', (done) => {
                rabbitmq.bus.pubSaveWeight(weight)
                    .then(async () => {
                        await timeout(2000)
                        const result = await weightRepository.find(new Query())
                        expect(result.length).to.eql(0)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting a WeightSaveEvent with one weight object successfully ' +
            '(without MongoDB connection, at first)', () => {
            before(async () => {
                try {
                    await dbConnection.dispose()
                } catch (err) {
                    throw new Error('Failure on Subscribe WeightSaveEvent test: ' + err.message)
                }
            })
            const weight: Weight = new WeightMock()
            it('should return an array with one weight object', (done) => {
                rabbitmq.bus.pubSaveWeight(weight)
                    .then(async () => {
                        await timeout(1000)
                        await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                            { interval: 100 })

                        await timeout(2000)
                        const result = await weightRepository.find(new Query())
                        expect(result.length).to.eql(1)

                        weight.id = result[0].id
                        result[0].child_id = result[0].child_id!.toString()

                        expect(result[0].id).to.eql(weight.id)
                        expect(result[0].type).to.eql(weight.type)
                        expect(result[0].timestamp).to.eql(weight.timestamp)
                        expect(result[0].value).to.eql(weight.value)
                        expect(result[0].unit).to.eql(weight.unit)
                        expect(result[0].child_id).to.eql(weight.child_id)
                        expect(result[0].body_fat!.value).to.eql(weight.body_fat!.value)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting a WeightSaveEvent with some correct weight objects successfully', () => {
            const weight1: Weight = new WeightMock()
            const weight2: Weight = new WeightMock()
            const weight3: Weight = new WeightMock()
            it('should return an array with three weight objects', (done) => {
                rabbitmq.bus.pubSaveWeight([weight1, weight2, weight3])
                    .then(async () => {
                        await timeout(2000)
                        const result = await weightRepository.find(new Query())
                        expect(result.length).to.eql(3)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting a WeightSaveEvent with some incorrect weight objects successfully', () => {
            const weight1: Weight = new WeightMock()
            const weight2: Weight = new Weight()
            const weight3: Weight = new WeightMock()
            it('should return an array with two weight objects', (done) => {
                rabbitmq.bus.pubSaveWeight([weight1, weight2, weight3])
                    .then(async () => {
                        await timeout(2000)
                        const result = await weightRepository.find(new Query())
                        expect(result.length).to.eql(2)
                        done()
                    })
                    .catch(done)
            })
        })
    })

    describe('SUBSCRIBE LogSaveEvent', () => {
        before(async () => {
            try {
                await deleteAllLogs()
            } catch (err) {
                throw new Error('Failure on Subscribe LogSaveEvent test: ' + err.message)
            }
        })
        // Delete all logs from database after each test case
        afterEach(async () => {
            try {
                await deleteAllLogs()
            } catch (err) {
                throw new Error('Failure on Subscribe LogSaveEvent test: ' + err.message)
            }
        })
        context('when posting a LogSaveEvent with one log successfully', () => {
            const log: any = {  type: 'steps',
                                value: 20,
                                date: '2019-09-16',
                                child_id: '5d7fb75ae48591c21a793f70' }
            it('should return an array with one log', (done) => {
                rabbitmq.bus.pubSaveLog([ log ])
                    .then(async () => {
                        // Wait for 2000 milliseconds for the task to be executed
                        await timeout(2000)

                        const result = await logRepository.find(new Query())
                        expect(result.length).to.eql(1)
                        // As a new resource saved in the database always has a new id,
                        // this is necessary before comparing the saved resource in the
                        // database with the one sent to the bus.
                        log.id = result[0].id
                        result[0].child_id = result[0].child_id.toString()
                        // Comparing the resources
                        expect(result[0].id).to.eql(log.id)
                        expect(result[0].date).to.eql(log.date)
                        expect(result[0].value).to.eql(log.value)
                        expect(result[0].type).to.eql(log.type)
                        expect(result[0].child_id).to.eql(log.child_id)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting a LogSaveEvent with one invalid log', () => {
            const log: Log = new Log()       // Invalid log
            it('should return an empty array', (done) => {
                rabbitmq.bus.pubSaveLog([ log ])
                    .then(async () => {
                        await timeout(2000)
                        const result = await logRepository.find(new Query())
                        expect(result.length).to.eql(0)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting a LogSaveEvent with one log successfully ' +
            '(without MongoDB connection, at first)', () => {
            before(async () => {
                try {
                    await dbConnection.dispose()
                } catch (err) {
                    throw new Error('Failure on Subscribe LogSaveEvent test: ' + err.message)
                }
            })
            const log: any = {  type: 'steps',
                                value: 20,
                                date: '2019-09-16',
                                child_id: '5d7fb75ae48591c21a793f70' }
            it('should return an array with one log', (done) => {
                rabbitmq.bus.pubSaveLog([ log ])
                    .then(async () => {
                        await timeout(1000)
                        await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                            { interval: 100 })

                        await timeout(2000)
                        const result = await logRepository.find(new Query())
                        expect(result.length).to.eql(1)

                        log.id = result[0].id
                        result[0].child_id = result[0].child_id.toString()

                        expect(result[0].id).to.eql(log.id)
                        expect(result[0].date).to.eql(log.date)
                        expect(result[0].value).to.eql(log.value)
                        expect(result[0].type).to.eql(log.type)
                        expect(result[0].child_id).to.eql(log.child_id)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting a LogSaveEvent with some correct logs successfully', () => {
            const log1: any = {  type: 'active_minutes',
                                 value: 4,
                                 date: '2019-09-16',
                                 child_id: '5d7fb75ae48591c21a793f70' }
            const log2: any = {  type: 'calories',
                                 value: 20,
                                 date: '2019-09-16',
                                 child_id: '5d7fb75ae48591c21a793f70' }
            const log3: any = {  type: 'steps',
                                 value: 15,
                                 date: '2019-09-16',
                                 child_id: '5d7fb75ae48591c21a793f70' }
            it('should return an array with three logs', (done) => {
                rabbitmq.bus.pubSaveLog([log1, log2, log3])
                    .then(async () => {
                        await timeout(2000)
                        const result = await logRepository.find(new Query())
                        expect(result.length).to.eql(3)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting a LogSaveEvent with some incorrect logs successfully', () => {
            const log1: any = {  type: 'active_minutes',
                                 value: 4,
                                 date: '2019-09-16',
                                 child_id: '5d7fb75ae48591c21a793f70' }
            const log2: Log = new Log()
            const log3: any = {  type: 'steps',
                                 value: 15,
                                 date: '2019-09-16',
                                 child_id: '5d7fb75ae48591c21a793f70' }
            it('should return an array with two logs', (done) => {
                rabbitmq.bus.pubSaveLog([log1, log2, log3])
                    .then(async () => {
                        await timeout(2000)
                        const result = await logRepository.find(new Query())
                        expect(result.length).to.eql(2)
                        done()
                    })
                    .catch(done)
            })
        })
    })

    describe('SUBSCRIBE InstitutionDeleteEvent', () => {
        before(async () => {
            try {
                await deleteAllEnvironments()
            } catch (err) {
                throw new Error('Failure on Subscribe InstitutionDeleteEvent test: ' + err.message)
            }
        })
        // Delete all environments from database after each test case
        afterEach(async () => {
            try {
                await deleteAllEnvironments()
            } catch (err) {
                throw new Error('Failure on Subscribe InstitutionDeleteEvent test: ' + err.message)
            }
        })
        context('when posting an InstitutionDeleteEvent with an institution that is associated with two previously ' +
            'saved environments', () => {
            before(async () => {
                try {
                    const institution_id: string = '5d7fb75ae48591c21a793f70'
                    const env1: Environment = new EnvironmentMock()
                    env1.institution_id = institution_id
                    const env2: Environment = new EnvironmentMock()
                    env2.institution_id = '5d7fb75ae48591c21a793f70'
                    await environmentRepository.create(env1)
                    await environmentRepository.create(env2)
                } catch (err) {
                    throw new Error('Failure on Subscribe InstitutionDeleteEvent test: ' + err.message)
                }
            })
            const institution: any = { id: '5d7fb75ae48591c21a793f70',
                                       type: 'Institute of Scientific Research',
                                       name: 'NUTES/UEPB',
                                       address: 'Av. Juvêncio Arruda, S/N - Universitário, Campina Grande - PB, 58429-600',
                                       latitude: -7.2100766,
                                       longitude: -35.9175756 }
            it('should return an empty array', (done) => {
                rabbitmq.bus.pubDeleteInstitution(institution)
                    .then(async () => {
                        // Wait for 2000 milliseconds for the task to be executed
                        await timeout(2000)

                        const result = await environmentRepository.find(new Query())
                        expect(result.length).to.eql(0)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting an InstitutionDeleteEvent with an institution that is associated with one of two previously ' +
            'saved environments', () => {
            before(async () => {
                try {
                    const institution_id: string = '5d7fb75ae48591c21a793f70'
                    const env1: Environment = new EnvironmentMock()
                    env1.institution_id = institution_id
                    const env2: Environment = new EnvironmentMock()
                    env2.institution_id = '5d7fb75ae48591c21a793f72'
                    await environmentRepository.create(env1)
                    await environmentRepository.create(env2)
                } catch (err) {
                    throw new Error('Failure on Subscribe InstitutionDeleteEvent test: ' + err.message)
                }
            })
            const institution: any = { id: '5d7fb75ae48591c21a793f70',
                type: 'Institute of Scientific Research',
                name: 'NUTES/UEPB',
                address: 'Av. Juvêncio Arruda, S/N - Universitário, Campina Grande - PB, 58429-600',
                latitude: -7.2100766,
                longitude: -35.9175756 }
            it('should return an array with one environment (which was not associated with the deleted institution)', (done) => {
                rabbitmq.bus.pubDeleteInstitution(institution)
                    .then(async () => {
                        await timeout(2000)

                        const result = await environmentRepository.find(new Query())
                        expect(result.length).to.eql(1)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting an InstitutionDeleteEvent with an invalid institution (invalid id)', () => {
            const institution: any = { id: '5d7fb75ae48591c21a793f701',      // Invalid institution
                type: 'Institute of Scientific Research',
                name: 'NUTES/UEPB',
                address: 'Av. Juvêncio Arruda, S/N - Universitário, Campina Grande - PB, 58429-600',
                latitude: -7.2100766,
                longitude: -35.9175756 }
            it('should return an empty array and print a log referring to the wrong institution format, ' +
                'in this case the id that is not in the correct format', (done) => {
                rabbitmq.bus.pubDeleteInstitution(institution)
                    .then(async () => {
                        // Wait for 2000 milliseconds for the task to be executed
                        await timeout(2000)

                        const result = await environmentRepository.find(new Query())
                        expect(result.length).to.eql(0)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting an InstitutionDeleteEvent with an institution that is associated with two previously ' +
            'saved environments (without MongoDB connection, at first)', () => {
            before(async () => {
                try {
                    const institution_id: string = '5d7fb75ae48591c21a793f70'
                    const env1: Environment = new EnvironmentMock()
                    env1.institution_id = institution_id
                    const env2: Environment = new EnvironmentMock()
                    env2.institution_id = '5d7fb75ae48591c21a793f70'
                    await environmentRepository.create(env1)
                    await environmentRepository.create(env2)

                    await dbConnection.dispose()
                } catch (err) {
                    throw new Error('Failure on Subscribe InstitutionDeleteEvent test: ' + err.message)
                }
            })
            const institution: any = { id: '5d7fb75ae48591c21a793f70',
                type: 'Institute of Scientific Research',
                name: 'NUTES/UEPB',
                address: 'Av. Juvêncio Arruda, S/N - Universitário, Campina Grande - PB, 58429-600',
                latitude: -7.2100766,
                longitude: -35.9175756 }
            it('should return an empty array', (done) => {
                rabbitmq.bus.pubDeleteInstitution(institution)
                    .then(async () => {
                        await timeout(1000)
                        await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                            { interval: 100 })

                        await timeout(2000)
                        const result = await environmentRepository.find(new Query())
                        expect(result.length).to.eql(0)
                        done()
                    })
                    .catch(done)
            })
        })
    })

    describe('SUBSCRIBE UserDeleteEvent', () => {
        before(async () => {
            try {
                await deleteAllActivities()
                await deleteAllSleep()
                await deleteAllBodyFats()
                await deleteAllWeights()
                await deleteAllLogs()
            } catch (err) {
                throw new Error('Failure on Subscribe UserDeleteEvent test: ' + err.message)
            }
        })
        // Delete all objects associated with the user from database after each test case
        afterEach(async () => {
            try {
                await deleteAllActivities()
                await deleteAllSleep()
                await deleteAllBodyFats()
                await deleteAllWeights()
                await deleteAllLogs()
            } catch (err) {
                throw new Error('Failure on Subscribe UserDeleteEvent test: ' + err.message)
            }
        })
        context('when posting an UserDeleteEvent with an user that is associated with two activities, ' +
            'one sleep object, one bodyfat, one weight and one log', () => {
            before(async () => {
                try {
                    const user_id: string = '5d7fb75ae48591c21a793f70'
                    const activity1: PhysicalActivity = new PhysicalActivityMock()
                    activity1.child_id = user_id
                    const activity2: PhysicalActivity = new PhysicalActivityMock()
                    activity2.child_id = user_id
                    const sleep: Sleep = new SleepMock()
                    sleep.child_id = user_id
                    const weight: Weight = new WeightMock()
                    weight.child_id = user_id
                    weight.body_fat!.child_id = user_id
                    const log: Log = new Log('2019-09-16', 15, LogType.STEPS, user_id)

                    await activityRepository.create(activity1)
                    await activityRepository.create(activity2)
                    await sleepRepository.create(sleep)
                    await bodyFatRepository.create(weight.body_fat!)
                    await weightRepository.create(weight)
                    await logRepository.create(log)
                } catch (err) {
                    throw new Error('Failure on Subscribe UserDeleteEvent test: ' + err.message)
                }
            })
            const user: any = { id: '5d7fb75ae48591c21a793f70',
                                type: 'child',
                                username: 'BR9999',
                                gender: 'male',
                                age: 11,
                                institution_id: '5a62be07de34500146d9c624',
                                last_login: '2018-11-19T14:40:00',
                                last_sync: '2018-11-19T14:40:00' }
            it('should return an empty array for each repository queried', (done) => {
                rabbitmq.bus.pubDeleteUser(user)
                    .then(async () => {
                        // Wait for 2000 milliseconds for the task to be executed
                        await timeout(2000)
                        const query: IQuery = new Query()
                        const activityResult = await activityRepository.find(query)
                        expect(activityResult.length).to.eql(0)

                        const sleepResult = await sleepRepository.find(query)
                        expect(sleepResult.length).to.eql(0)

                        query.addFilter({ type: MeasurementType.BODY_FAT })
                        const bodyFatResult = await bodyFatRepository.find(query)
                        expect(bodyFatResult.length).to.eql(0)

                        query.filters = { type: MeasurementType.WEIGHT }
                        const weightResult = await weightRepository.find(query)
                        expect(weightResult.length).to.eql(0)

                        const logResult = await logRepository.find(new Query())
                        expect(logResult.length).to.eql(0)

                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting an UserDeleteEvent with an user who is not associated with all objects created below', () => {
            before(async () => {
                try {
                    const user_id: string = '5d7fb75ae48591c21a793f70'
                    const activity1: PhysicalActivity = new PhysicalActivityMock()
                    activity1.child_id = user_id
                    const activity2: PhysicalActivity = new PhysicalActivityMock()
                    activity2.child_id = '5d7fb75ae48591c21a793f71'
                    const sleep: Sleep = new SleepMock()
                    sleep.child_id = '5d7fb75ae48591c21a793f71'
                    const weight: Weight = new WeightMock()
                    weight.child_id = user_id
                    weight.body_fat!.child_id = user_id
                    const log: Log = new Log('2019-09-16', 15, LogType.STEPS, user_id)

                    await activityRepository.create(activity1)
                    await activityRepository.create(activity2)
                    await sleepRepository.create(sleep)
                    await bodyFatRepository.create(weight.body_fat!)
                    await weightRepository.create(weight)
                    await logRepository.create(log)
                } catch (err) {
                    throw new Error('Failure on Subscribe UserDeleteEvent test: ' + err.message)
                }
            })
            const user: any = { id: '5d7fb75ae48591c21a793f70',
                type: 'child',
                username: 'BR9999',
                gender: 'male',
                age: 11,
                institution_id: '5a62be07de34500146d9c624',
                last_login: '2018-11-19T14:40:00',
                last_sync: '2018-11-19T14:40:00' }
            it('should return an empty array for the BodyFat, Weight and Log repositories', (done) => {
                rabbitmq.bus.pubDeleteUser(user)
                    .then(async () => {
                        await timeout(2000)
                        const query: IQuery = new Query()
                        const activityResult = await activityRepository.find(query)
                        expect(activityResult.length).to.eql(1)

                        const sleepResult = await sleepRepository.find(query)
                        expect(sleepResult.length).to.eql(1)

                        query.addFilter({ type: MeasurementType.BODY_FAT })
                        const bodyFatResult = await bodyFatRepository.find(query)
                        expect(bodyFatResult.length).to.eql(0)

                        query.filters = { type: MeasurementType.WEIGHT }
                        const weightResult = await weightRepository.find(query)
                        expect(weightResult.length).to.eql(0)

                        const logResult = await logRepository.find(new Query())
                        expect(logResult.length).to.eql(0)

                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting an UserDeleteEvent with an invalid user (invalid id)', () => {
            const user: any = { id: '5d7fb75ae48591c21a793f701',        // Invalid user
                type: 'child',
                username: 'BR9999',
                gender: 'male',
                age: 11,
                institution_id: '5a62be07de34500146d9c624',
                last_login: '2018-11-19T14:40:00',
                last_sync: '2018-11-19T14:40:00' }
            it('should print a log referring to the wrong user format, in this case the id that is not in the ' +
                'correct format', (done) => {
                rabbitmq.bus.pubDeleteUser(user)
                    .then(async () => {
                        await timeout(2000)
                        done()
                    })
                    .catch(done)
            })
        })

        context('when posting an UserDeleteEvent with an user that is associated with two activities, ' +
            'one sleep object, one bodyfat, one weight and one log (without MongoDB connection, at first)', () => {
            before(async () => {
                try {
                    const user_id: string = '5d7fb75ae48591c21a793f70'
                    const activity1: PhysicalActivity = new PhysicalActivityMock()
                    activity1.child_id = user_id
                    const activity2: PhysicalActivity = new PhysicalActivityMock()
                    activity2.child_id = user_id
                    const sleep: Sleep = new SleepMock()
                    sleep.child_id = user_id
                    const weight: Weight = new WeightMock()
                    weight.child_id = user_id
                    weight.body_fat!.child_id = user_id
                    const log: Log = new Log('2019-09-16', 15, LogType.STEPS, user_id)

                    await activityRepository.create(activity1)
                    await activityRepository.create(activity2)
                    await sleepRepository.create(sleep)
                    await bodyFatRepository.create(weight.body_fat!)
                    await weightRepository.create(weight)
                    await logRepository.create(log)

                    await dbConnection.dispose()
                } catch (err) {
                    throw new Error('Failure on Subscribe UserDeleteEvent test: ' + err.message)
                }
            })
            const user: any = { id: '5d7fb75ae48591c21a793f70',
                type: 'child',
                username: 'BR9999',
                gender: 'male',
                age: 11,
                institution_id: '5a62be07de34500146d9c624',
                last_login: '2018-11-19T14:40:00',
                last_sync: '2018-11-19T14:40:00' }
            it('should return an empty array for each repository queried', (done) => {
                rabbitmq.bus.pubDeleteUser(user)
                    .then(async () => {
                        await timeout(1000)
                        await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST,
                            { interval: 100 })

                        await timeout(2000)
                        const query: IQuery = new Query()
                        const activityResult = await activityRepository.find(query)
                        expect(activityResult.length).to.eql(0)

                        const sleepResult = await sleepRepository.find(query)
                        expect(sleepResult.length).to.eql(0)

                        query.addFilter({ type: MeasurementType.BODY_FAT })
                        const bodyFatResult = await bodyFatRepository.find(query)
                        expect(bodyFatResult.length).to.eql(0)

                        query.filters = { type: MeasurementType.WEIGHT }
                        const weightResult = await weightRepository.find(query)
                        expect(weightResult.length).to.eql(0)

                        const logResult = await logRepository.find(new Query())
                        expect(logResult.length).to.eql(0)

                        done()
                    })
                    .catch(done)
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
