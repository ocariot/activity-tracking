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

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const activityRepository: IPhysicalActivityRepository = DIContainer.get(Identifier.ACTIVITY_REPOSITORY)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const subscribeEventBusTask: IBackgroundTask = DIContainer.get(Identifier.SUB_EVENT_BUS_TASK)

describe('SUBSCRIBE EVENT BUS TASK', () => {
    // Timeout function for control of execution
    const timeout = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    // Start DB connection, RabbitMQ connection and SubscribeEventBusTask
    before(async () => {
        try {
            await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)

            await deleteAllActivity()

            await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                { receiveFromYourself: true, sslOptions: { ca: [] } })

            await subscribeEventBusTask.run()
        } catch (err) {
            throw new Error('Failure on SubscribeEventBusTask test: ' + err.message)
        }
    })

    // Stop DB connection and SubscribeEventBusTask
    after(async () => {
        try {
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
        // Delete all activities from database after each test case
        afterEach(async () => {
            try {
                await deleteAllActivity()
            } catch (err) {
                throw new Error('Failure on SubscribeEventBusTask test: ' + err.message)
            }
        })

        context('when posting a PhysicalActivitySaveEvent with one physical activity successfully', () => {
            const activity: PhysicalActivity = new PhysicalActivityMock()
            it('should return an array with one physical activity', async () => {
                await rabbitmq.bus.pubSavePhysicalActivity(activity)

                // Wait for 1000 milliseconds for the task to be executed
                await timeout(1000)

                const result: Array<any> = await activityRepository.find(new Query())
                expect(result.length).to.eql(1)
                result[0].child_id = result[0].child_id.toString()
                activity.id = result[0].id
                expect(result[0]).to.eql(activity)
            })
        })

        context('when posting a PhysicalActivitySaveEvent with one physical activity successfully ' +
            '(without MongoDB connection)', () => {
            before(async () => {
                await dbConnection.dispose()
            })
            const activity: PhysicalActivity = new PhysicalActivityMock()
            it('should return an array with one physical activity', (done) => {
                rabbitmq.bus.pubSavePhysicalActivity(activity).then(() => {
                    setTimeout(async () => {
                        try {
                            await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)
                        } catch (err) {
                            console.log(err)
                        }
                    }, 1000)

                    setTimeout(async () => {
                        const result: Array<any> = await activityRepository.find(new Query())
                        expect(result.length).to.eql(1)
                        result[0].child_id = result[0].child_id.toString()
                        activity.id = result[0].id
                        expect(result[0]).to.eql(activity)
                        done()
                    }, 2000)
                })
            })
        })

        context('when posting a PhysicalActivitySaveEvent with some correct physical activities successfully', () => {
            const activity1: PhysicalActivity = new PhysicalActivityMock()
            const activity2: PhysicalActivity = new PhysicalActivityMock()
            const activity3: PhysicalActivity = new PhysicalActivityMock()
            it('should return an array with one physical activity', async () => {
                await rabbitmq.bus.pubSavePhysicalActivity([activity1, activity2, activity3])

                await timeout(1000)

                const result: Array<any> = await activityRepository.find(new Query())
                expect(result.length).to.eql(3)
            })
        })

        context('when posting a PhysicalActivitySaveEvent with some incorrect physical activities successfully', () => {
            const activity1: PhysicalActivity = new PhysicalActivityMock()
            const activity2: PhysicalActivity = new PhysicalActivity()
            const activity3: PhysicalActivity = new PhysicalActivityMock()
            it('should return an array with one physical activity', async () => {
                await rabbitmq.bus.pubSavePhysicalActivity([activity1, activity2, activity3])

                await timeout(1000)

                const result: Array<any> = await activityRepository.find(new Query())
                expect(result.length).to.eql(2)
            })
        })
    })
})

async function deleteAllActivity() {
    return ActivityRepoModel.deleteMany({})
}
