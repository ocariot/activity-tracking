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

describe('NOTIFICATION TASK', () => {

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
        } catch (err) {
            throw new Error('Failure on NotificationTask test: ' + err.message)
        }
    })

    describe('SUBSCRIBE SendNotificationEvent', () => {
        /**
         * Creating environments with different dates on timestamp and subscribing to the SendNotificationEvent event
         */
        context('when the notification task is executed', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()

                    await createEnvironmentsToNotify()
                } catch (err) {
                    throw new Error('Failure on Subscribe SendNotificationEvent test: ' + err.message)
                }
            })

            after(async () => {
                try {
                    await deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on Subscribe SendNotificationEvent test: ' + err.message)
                }
            })

            // Each environment mock has three measurements, so there are twelve notifications
            it('should receive twelve SendNotificationEvent objects successfully when there are four environments ' +
                'with outdated timestamp',
                (done) => {
                    // The notification task will run the job to check the environment's inactivity for 10 days or more.
                    // Without using a cron expression to provide the necessary freedom for the test, since the functioning
                    // of the cron lib is not the object of the test.
                    const notificationTask: IBackgroundTask = new NotificationTask(
                        rabbitmq, environmentRepository, logger, 10
                    )

                    notificationTask.run()

                    // Subscribing SendNotificationEvent events
                    let count = 0
                    rabbitmq.bus
                        .subSendNotification(() => count++)
                        .then()
                        .catch(done)

                    // Performing the test
                    setTimeout(async () => {
                        try {
                            expect(count).to.eql(12)
                            await notificationTask.stop()
                            done()
                        } catch (err) {
                            done(err)
                        }
                    }, 5000)
                })

            // Each environment mock has three measurements, so there are twenty one notifications
            it('should receive twenty one SendNotificationEvent objects successfully when there are seven ' +
                'environments with outdated timestamp', (done) => {
                // This time it runs the task checking environment's inactivity for 7 days or more.
                const notificationTask: IBackgroundTask = new NotificationTask(
                    rabbitmq, environmentRepository, logger, 7
                )

                notificationTask.run()

                let count = 0
                rabbitmq.bus
                    .subSendNotification(() => count++)
                    .then()
                    .catch(done)

                setTimeout(async () => {
                    try {
                        expect(count).to.eql(21)
                        await notificationTask.stop()
                        done()
                    } catch (err) {
                        done(err)
                    }
                }, 5000)
            })
        })

        context('when the notification task is executed but no notification is sent', () => {
            before(async () => {
                try {
                    await deleteAllEnvironments()
                    await createEnvironmentsToNotNotify()
                } catch (err) {
                    throw new Error('Failure on Subscribe SendNotificationEvent test: ' + err.message)
                }
            })

            afterEach(async () => {
                try {
                    await deleteAllEnvironments()
                } catch (err) {
                    throw new Error('Failure on Subscribe SendNotificationEvent test: ' + err.message)
                }
            })

            it('should not receive any SendNotificationEvent object since all environments have the timestamp ' +
                'updated', (done) => {
                const notificationTask: IBackgroundTask = new NotificationTask(
                    rabbitmq, environmentRepository, logger, 10
                )

                notificationTask.run()

                // Subscribing SendNotificationEvent events
                let count = 0
                rabbitmq.bus
                    .subSendNotification(() => count++)
                    .then()
                    .catch(done)

                // Performing the test
                setTimeout(async () => {
                    try {
                        expect(count).to.eql(0)
                        await notificationTask.stop()
                        done()
                    } catch (err) {
                        done(err)
                    }
                }, 4000)
            })

            it('should not receive any SendNotificationEvent object as there are no environments in the repository',
                (done) => {
                    const notificationTask: IBackgroundTask = new NotificationTask(
                        rabbitmq, environmentRepository, logger, 7
                    )

                    notificationTask.run()

                    let count = 0
                    rabbitmq.bus
                        .subSendNotification(() => count++)
                        .then()
                        .catch(done)

                    setTimeout(async () => {
                        try {
                            expect(count).to.eql(0)
                            await notificationTask.stop()
                            done()
                        } catch (err) {
                            done(err)
                        }
                    }, 4000)
                })
        })
    })
})

async function deleteAllEnvironments() {
    return EnvironmentRepoModel.deleteMany({})
}

async function createEnvironmentsToNotify() {
    const environment1: Environment = new EnvironmentMock()
    environment1.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 3))

    const environment2: Environment = new EnvironmentMock()
    environment2.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 5))

    const environment3: Environment = new EnvironmentMock()
    environment3.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 17))

    const environment4: Environment = new EnvironmentMock()
    environment4.timestamp = new Date(new Date().getTime() - ((1000 * 60 * 60 * 24) * 9))

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

    await environmentRepository.create(environment1)
    await environmentRepository.create(environment2)
    await environmentRepository.create(environment3)
    await environmentRepository.create(environment4)
    await environmentRepository.create(environment5)
    await environmentRepository.create(environment6)
    await environmentRepository.create(environment7)
    await environmentRepository.create(environment8)
    await environmentRepository.create(environment9)
    await environmentRepository.create(environment10)
}

async function createEnvironmentsToNotNotify() {
    const environment1: Environment = new EnvironmentMock()
    environment1.timestamp = new Date(new Date().getTime() - 60000)

    const environment2: Environment = new EnvironmentMock()
    environment2.timestamp = new Date(new Date().getTime() - 120000)

    const environment3: Environment = new EnvironmentMock()
    environment3.timestamp = new Date(new Date().getTime() - 180000)

    const environment4: Environment = new EnvironmentMock()
    environment4.timestamp = new Date(new Date().getTime() - 240000)

    const environment5: Environment = new EnvironmentMock()
    environment5.timestamp = new Date(new Date().getTime() - 300000)

    const environment6: Environment = new EnvironmentMock()
    environment6.timestamp = new Date(new Date().getTime() - 360000)

    const environment7: Environment = new EnvironmentMock()
    environment7.timestamp = new Date(new Date().getTime() - 420000)

    const environment8: Environment = new EnvironmentMock()
    environment8.timestamp = new Date(new Date().getTime() - 480000)

    const environment9: Environment = new EnvironmentMock()
    environment9.timestamp = new Date(new Date().getTime() - 540000)

    const environment10: Environment = new EnvironmentMock()
    environment10.timestamp = new Date(new Date().getTime() - 600000)

    await environmentRepository.create(environment1)
    await environmentRepository.create(environment2)
    await environmentRepository.create(environment3)
    await environmentRepository.create(environment4)
    await environmentRepository.create(environment5)
    await environmentRepository.create(environment6)
    await environmentRepository.create(environment7)
    await environmentRepository.create(environment8)
    await environmentRepository.create(environment9)
    await environmentRepository.create(environment10)
}
