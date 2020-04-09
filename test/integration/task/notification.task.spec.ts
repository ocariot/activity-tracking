import { expect } from 'chai'
import { DIContainer } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { IBackgroundTask } from '../../../src/application/port/background.task.interface'
import { IEventBus } from '../../../src/infrastructure/port/eventbus.interface'
import { Default } from '../../../src/utils/default'
import { IDatabase } from '../../../src/infrastructure/port/database.interface'
import { NotificationTask } from '../../../src/background/task/notification.task'
import { ILogger } from '../../../src/utils/custom.logger'
import { EnvironmentRepoModel } from '../../../src/infrastructure/database/schema/environment.schema'
import { IEnvironmentRepository } from '../../../src/application/port/environment.repository.interface'
import { Environment } from '../../../src/application/domain/model/environment'
import { EnvironmentMock } from '../../mocks/environment.mock'

const dbConnection: IDatabase = DIContainer.get(Identifier.MONGODB_CONNECTION)
const rabbitmq: IEventBus = DIContainer.get(Identifier.RABBITMQ_EVENT_BUS)
const environmentRepository: IEnvironmentRepository = DIContainer.get(Identifier.ENVIRONMENT_REPOSITORY)
const logger: ILogger = DIContainer.get(Identifier.LOGGER)
// The notification task will run the job to check the environments inactivity for 10 days or more,
// in the 0 second of each minute.
const notificationTask: IBackgroundTask = new NotificationTask(
    rabbitmq, environmentRepository, logger, 10, '0 * * * * *'
)

describe('NOTIFICATION TASK', () => {
    // Timeout function for control of execution
    const timeout = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    // Start DB connection, RabbitMQ connection and NotificationTask
    before(async () => {
        try {
            await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)

            await deleteAllEnvironments()

            await rabbitmq.initialize(process.env.RABBITMQ_URI || Default.RABBITMQ_URI,
                { interval: 100, receiveFromYourself: true, sslOptions: { ca: [] }, rpcTimeout: 5000 })
        } catch (err) {
            throw new Error('Failure on NotificationTask test: ' + err.message)
        }
    })

    // Stop DB connection and NotificationTask
    after(async () => {
        try {
            await deleteAllEnvironments()

            await dbConnection.dispose()

            await notificationTask.stop()
        } catch (err) {
            throw new Error('Failure on NotificationTask test: ' + err.message)
        }
    })

    /**
     * Creating environments with different dates on timestamp and subscribing to the SendNotificationEvent event
     */
    describe('SUBSCRIBE SendNotificationEvent', () => {
        context('when receiving multiple SendNotificationEvent successfully', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()

                    const environment1: Environment = new EnvironmentMock()
                    environment1.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 3))

                    const environment2: Environment = new EnvironmentMock()
                    environment2.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 5))

                    const environment3: Environment = new EnvironmentMock()
                    environment3.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 17))

                    const environment4: Environment = new EnvironmentMock()
                    environment4.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 7))

                    const environment5: Environment = new EnvironmentMock()
                    environment5.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 11))

                    const environment6: Environment = new EnvironmentMock()
                    environment6.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 14))

                    const environment7: Environment = new EnvironmentMock()
                    environment7.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 8))

                    const environment8: Environment = new EnvironmentMock()
                    environment8.timestamp = new Date()

                    const environment9: Environment = new EnvironmentMock()
                    environment9.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 10) + (300000))

                    const environment10: Environment = new EnvironmentMock()
                    environment10.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 15))

                    await environmentRepository.create(environment1) // Does not generate notification
                    await environmentRepository.create(environment2) // The same as above
                    await environmentRepository.create(environment3)
                    await environmentRepository.create(environment4) // Does not generate notification
                    await environmentRepository.create(environment5)
                    await environmentRepository.create(environment6)
                    await environmentRepository.create(environment7) // Does not generate notification
                    await environmentRepository.create(environment8) // The same as above (last_sync equal to current date)
                    await environmentRepository.create(environment9) // The same as above (last_sync at the limit to not notify)
                    await environmentRepository.create(environment10)

                    // Wait a while after registering environments
                    await timeout(1000)

                    notificationTask.run()

                    // Wait at least 59,999 seconds to be able to execute the first test case because the notification
                    // will always be executed only in the second 0 of every minute
                    await timeout(59999)
                } catch (err) {
                    throw new Error('Failure on Subscribe SendNotificationEvent test: ' + err.message)
                }
            })
            after(async () => {
                try {
                    await deleteAllEnvironments()

                    await notificationTask.stop()
                } catch (err) {
                    throw new Error('Failure on Subscribe SendNotificationEvent test: ' + err.message)
                }
            })
            it('should receive four SendNotificationEvent objects', (done) => {
                let count = 0
                rabbitmq.bus
                    .subSendNotification(() => count++)
                    .then(() => {
                        expect(count).to.eql(4)
                        done()
                    })
                    .catch(done)
            })
        })


        context('when receiving multiple SendNotificationEvent successfully (without MongoDB connection, at first)',
            () => {
                before(async () => {
                    try {
                        await deleteAllEnvironments()

                        const environment1: Environment = new EnvironmentMock()
                        environment1.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 3))

                        const environment2: Environment = new EnvironmentMock()
                        environment2.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 5))

                        const environment3: Environment = new EnvironmentMock()
                        environment3.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 17))

                        const environment4: Environment = new EnvironmentMock()
                        environment4.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 7))

                        const environment5: Environment = new EnvironmentMock()
                        environment5.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 11))

                        const environment6: Environment = new EnvironmentMock()
                        environment6.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 14))

                        const environment7: Environment = new EnvironmentMock()
                        environment7.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 8))

                        const environment8: Environment = new EnvironmentMock()
                        environment8.timestamp = new Date()

                        const environment9: Environment = new EnvironmentMock()
                        environment9.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 10) + (300000))

                        const environment10: Environment = new EnvironmentMock()
                        environment10.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 15))

                        await environmentRepository.create(environment1) // Does not generate notification
                        await environmentRepository.create(environment2) // The same as above
                        await environmentRepository.create(environment3)
                        await environmentRepository.create(environment4) // Does not generate notification
                        await environmentRepository.create(environment5)
                        await environmentRepository.create(environment6)
                        await environmentRepository.create(environment7) // Does not generate notification
                        await environmentRepository.create(environment8) // The same as above (last_sync equal to current date)
                        await environmentRepository.create(environment9) // The same as above (last_sync at the limit to not notify)
                        await environmentRepository.create(environment10)

                        // Wait a while after registering environments
                        await timeout(1000)

                        // Taking down MongoDB
                        await dbConnection.dispose()

                        // Run the Notification task
                        notificationTask.run()

                        // Wait at least 58,999 seconds to be able to execute the first test case because the notification
                        // will always be executed only in the second 0 of every minute
                        await timeout(58999)

                        await dbConnection.connect(process.env.MONGODB_URI_TEST || Default.MONGODB_URI_TEST)

                        await timeout(1000)
                    } catch (err) {
                        throw new Error('Failure on Subscribe SendNotificationEvent test: ' + err.message)
                    }
                })
                after(async () => {
                    try {
                        await deleteAllEnvironments()

                        await notificationTask.stop()
                    } catch (err) {
                        throw new Error('Failure on Subscribe SendNotificationEvent test: ' + err.message)
                    }
                })
                it('should receive four SendNotificationEvent objects', (done) => {
                    let count = 0
                    rabbitmq.bus
                        .subSendNotification(() => count++)
                        .then(() => {
                            expect(count).to.eql(4)
                            done()
                        })
                        .catch(done)
                })
            })
    })
})

async function deleteAllEnvironments() {
    return EnvironmentRepoModel.deleteMany({})
}
