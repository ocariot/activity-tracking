import { expect } from 'chai'
import { DI } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { Container } from 'inversify'
import { PhysicalActivityEvent } from '../../../src/application/integration-event/event/physical.activity.event'
import { EventBusException } from '../../../src/application/domain/exception/eventbus.exception'
import { SleepMock } from '../../mocks/sleep.mock'
import { ActivityTypeMock, PhysicalActivityMock } from '../../mocks/physical.activity.mock'
import { SleepEvent } from '../../../src/application/integration-event/event/sleep.event'
import { EnvironmentEvent } from '../../../src/application/integration-event/event/environment.event'
import { EnvironmentMock } from '../../mocks/environment.mock'
import { PhysicalActivitySaveEventHandler } from '../../../src/application/integration-event/handler/physical.activity.save.event.handler'
import { IPhysicalActivityRepository } from '../../../src/application/port/physical.activity.repository.interface'
import { ILogger } from '../../../src/utils/custom.logger'
import { SleepSaveEventHandler } from '../../../src/application/integration-event/handler/sleep.save.event.handler'
import { ISleepRepository } from '../../../src/application/port/sleep.repository.interface'
import { EnvironmentSaveEventHandler } from '../../../src/application/integration-event/handler/environment.save.event.handler'
import { IEnvironmentRepository } from '../../../src/application/port/environment.repository.interface'
import { EventBusRabbitMQ } from '../../../src/infrastructure/eventbus/rabbitmq/eventbus.rabbitmq'
import { UserEvent } from '../../../src/application/integration-event/event/user.event'
import { UserDeleteEventHandler } from '../../../src/application/integration-event/handler/user.delete.event.handler'
import { InstitutionEvent } from '../../../src/application/integration-event/event/institution.event'
import { InstitutionDeleteEventHandler } from '../../../src/application/integration-event/handler/institution.delete.event.handler'

const container: Container = DI.getInstance().getContainer()
const eventBus: EventBusRabbitMQ = container.get(Identifier.RABBITMQ_EVENT_BUS)
const logger: ILogger = container.get(Identifier.LOGGER)
const pubPhysicalActivityTotal: number = 10
const pubSleepTotal: number = 10
const pubEnvironmentTotal: number = 10

describe('EVENT BUS', () => {
    before(() => {
        eventBus.receive_from_yourself = true
        eventBus.enableLogger(false)
    })

    afterEach(async () => {
        try {
            await eventBus.dispose()
        } catch (err) {
            throw new Error('Failure on EventBus test: ' + err.message)
        }
    })

    describe('CONNECTION', () => {
        it('should return EventBusException with message without connection when publishing.', () => {
            return eventBus
                .publish(new PhysicalActivityEvent(''), '')
                .then((result: boolean) => {
                    expect(result).to.eql(false)
                })
                .catch((err: EventBusException) => {
                    expect(err).instanceOf(EventBusException)
                })
        })

        it('should return EventBusException with message without connection when subscription.', () => {
            return eventBus
                .subscribe(
                    new PhysicalActivityEvent(''),
                    new PhysicalActivitySaveEventHandler(
                        container.get<IPhysicalActivityRepository>(Identifier.ACTIVITY_REPOSITORY),
                        logger
                    ),
                    ''
                )
                .then((result: boolean) => {
                    expect(result).to.eql(false)
                })
                .catch(err => {
                    expect(err).instanceOf(EventBusException)
                })
        })

        it('should connect successfully to publish.', async () => {
            try {
                await eventBus.connectionPub.tryConnect(1, 500)
            } catch (err) {
                throw new Error('Failure on EventBus test: ' + err.message)
            }

            expect(eventBus.connectionPub.isConnected).to.eql(true)
        })

        it('should connect successfully to subscribe.', async () => {
            try {
                await eventBus.connectionSub.tryConnect(1, 500)
            } catch (err) {
                throw new Error('Failure on EventBus test: ' + err.message)
            }

            expect(eventBus.connectionSub.isConnected).to.eql(true)
        })
    })

    // Uncomment the line 109 (this._logger.info (`Bus event message received!`)) from the
    // src/infrastructure/eventbus/rabbitmq/eventbus.rabbitmq.ts file to see receiving messages
    describe('SUBSCRIBE', () => {
        it('should return true to subscribe in PhysicalActivitySaveEvent', async () => {
            try {
                await eventBus.connectionSub.tryConnect(1, 500)

                const activitySaveEvent = new PhysicalActivityEvent('PhysicalActivitySaveEvent', new Date())
                const activitySaveEventHandler = new PhysicalActivitySaveEventHandler(
                    container.get<IPhysicalActivityRepository>(Identifier.ACTIVITY_REPOSITORY), logger)
                return eventBus
                    .subscribe(activitySaveEvent, activitySaveEventHandler, 'activities.save')
                    .then(result => {
                        expect(result).to.equal(true)
                    })
            } catch (err) {
                throw new Error('Failure on EventBus test: ' + err.message)
            }
        })

        it('should return true to subscribe in SleepSaveEvent', async () => {
            try {
                await eventBus.connectionSub.tryConnect(1, 500)

                const sleepSaveEvent = new SleepEvent('SleepSaveEvent', new Date())
                const sleepSaveEventHandler = new SleepSaveEventHandler(
                    container.get<ISleepRepository>(Identifier.SLEEP_REPOSITORY), logger)
                return eventBus
                    .subscribe(sleepSaveEvent, sleepSaveEventHandler, 'sleep.save')
                    .then(result => {
                        expect(result).to.equal(true)
                    })
            } catch (err) {
                throw new Error('Failure on EventBus test: ' + err.message)
            }
        })

        it('should return true to subscribe in EnvironmentSaveEvent', async () => {
            try {
                await eventBus.connectionSub.tryConnect(1, 500)

                const environmentSaveEvent = new EnvironmentEvent('EnvironmentSaveEvent', new Date())
                const environmentSaveEventHandler = new EnvironmentSaveEventHandler(
                    container.get<IEnvironmentRepository>(Identifier.ENVIRONMENT_REPOSITORY), logger)
                return eventBus
                    .subscribe(environmentSaveEvent, environmentSaveEventHandler, 'environments.save')
                    .then(result => {
                        expect(result).to.equal(true)
                    })
            } catch (err) {
                throw new Error('Failure on EventBus test: ' + err.message)
            }
        })

        it('should return true to subscribe in UserDeleteEvent', async () => {
            try {
                await eventBus.connectionSub.tryConnect(1, 500)

                const userDeleteEvent = new UserEvent('UserDeleteEvent', new Date())
                const userDeleteEventHandler = new UserDeleteEventHandler(
                    container.get<IPhysicalActivityRepository>(Identifier.ACTIVITY_REPOSITORY),
                    container.get<ISleepRepository>(Identifier.SLEEP_REPOSITORY), logger)
                return eventBus
                    .subscribe(userDeleteEvent, userDeleteEventHandler, 'users.delete')
                    .then(result => {
                        expect(result).to.equal(true)
                    })
            } catch (err) {
                throw new Error('Failure on EventBus test: ' + err.message)
            }
        })

        it('should return true to subscribe in InstitutionDeleteEvent', async () => {
            try {
                await eventBus.connectionSub.tryConnect(1, 500)

                const institutionDeleteEvent = new InstitutionEvent('InstitutionDeleteEvent', new Date())
                const institutionDeleteEventHandler = new InstitutionDeleteEventHandler(
                    container.get<IEnvironmentRepository>(Identifier.ENVIRONMENT_REPOSITORY), logger)
                return eventBus
                    .subscribe(institutionDeleteEvent, institutionDeleteEventHandler, 'institutions.delete')
                    .then(result => {
                        expect(result).to.equal(true)
                    })
            } catch (err) {
                throw new Error('Failure on EventBus test: ' + err.message)
            }
        })
    })

    describe('PUBLISH', () => {
        context('Physical Activity', () => {

            it('should return true for published RUN physical activity.', async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)

                    return eventBus.publish(
                        new PhysicalActivityEvent('PhysicalActivitySaveEvent', new Date(),
                            new PhysicalActivityMock(ActivityTypeMock.RUN)),
                        'activities.save')
                        .then((result: boolean) => {
                            expect(result).to.equal(true)
                        })
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })

            it('should return true for published WALK physical activity.', async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)
                    return eventBus.publish(
                        new PhysicalActivityEvent('PhysicalActivitySaveEvent', new Date(),
                            new PhysicalActivityMock(ActivityTypeMock.WALK)),
                        'activities.save')
                        .then((result: boolean) => {
                            expect(result).to.equal(true)
                        })
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })

            it('should return true for published BIKE physical activity.', async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)

                    return eventBus.publish(
                        new PhysicalActivityEvent('PhysicalActivitySaveEvent', new Date(),
                            new PhysicalActivityMock(ActivityTypeMock.BIKE)),
                        'activities.save')
                        .then((result: boolean) => {
                            expect(result).to.equal(true)
                        })
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })

            it('should return true for published SWIM physical activity.', async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)

                    return eventBus.publish(
                        new PhysicalActivityEvent('PhysicalActivitySaveEvent', new Date(),
                            new PhysicalActivityMock(ActivityTypeMock.SWIM)),
                        'activities.save')
                        .then((result: boolean) => {
                            expect(result).to.equal(true)
                        })
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })

            it('should return true for publish of updated of SWIM physical activity.', async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)

                    return eventBus.publish(
                        new PhysicalActivityEvent('PhysicalActivityUpdateEvent', new Date(),
                            new PhysicalActivityMock(ActivityTypeMock.SWIM)),
                        'activities.update')
                        .then((result: boolean) => {
                            expect(result).to.equal(true)
                        })
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })

            it('should return true for publish of delete of SWIM physical activity.', async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)

                    return eventBus.publish(
                        new PhysicalActivityEvent('PhysicalActivityDeleteEvent', new Date(),
                            new PhysicalActivityMock(ActivityTypeMock.SWIM)),
                        'activities.delete')
                        .then((result: boolean) => {
                            expect(result).to.equal(true)
                        })
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })

            it(`should return true to ${pubPhysicalActivityTotal} published physical activities.`, async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)
                    let count: number = 0

                    // Save in file
                    // require('fs').writeFileSync('./physical.activity.data.json',
                    //     JSON.stringify(new PhysicalActivityMock().toJSON()), 'utf-8')

                    for (let i = 0; i < pubPhysicalActivityTotal; i++) {
                        const result = await eventBus.publish(
                            new PhysicalActivityEvent('PhysicalActivitySaveEvent', new Date(),
                                new PhysicalActivityMock()),
                            'activities.save')
                        expect(result).to.equal(true)
                        count++
                    }
                    expect(count).equals(pubPhysicalActivityTotal)
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })
        })

        context('Sleep', () => {
            it(`should return true to ${pubSleepTotal} published sleep records.`, async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)
                    let count: number = 0

                    // Save in file
                    // require('fs').writeFileSync('./sleep.data.json', JSON.stringify(new SleepMock().toJSON()), 'utf-8')

                    for (let i = 0; i < pubSleepTotal; i++) {
                        const result = await eventBus.publish(
                            new SleepEvent('SleepSaveEvent', new Date(),
                                new SleepMock()),
                            'sleep.save')
                        expect(result).to.equal(true)
                        count++
                    }
                    expect(count).equals(pubSleepTotal)
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })

            it('should return true for publish of updated of sleep.', async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)

                    return eventBus.publish(
                        new SleepEvent('SleepUpdateEvent', new Date(), new SleepMock()),
                        'sleep.update')
                        .then((result: boolean) => {
                            expect(result).to.equal(true)
                        })
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })

            it('should return true for publish of delete of sleep.', async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)

                    return eventBus.publish(
                        new SleepEvent('SleepDeleteEvent', new Date(), new SleepMock()),
                        'sleep.delete')
                        .then((result: boolean) => {
                            expect(result).to.equal(true)
                        })
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })
        })

        context('Environment', () => {
            it(`should return true to ${pubEnvironmentTotal} published environments.`, async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)
                    let count: number = 0

                    // Save in file
                    // require('fs').writeFileSync('./sleep.data.json', JSON.stringify(new EnvironmentMock().toJSON()), 'utf-8')

                    for (let i = 0; i < pubEnvironmentTotal; i++) {
                        const result = await eventBus.publish(
                            new EnvironmentEvent('EnvironmentSaveEvent', new Date(),
                                new EnvironmentMock()),
                            'environments.save')
                        expect(result).to.equal(true)
                        count++
                    }
                    expect(count).equals(pubEnvironmentTotal)
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })

            it('should return true for publish of delete of environment.', async () => {
                try {
                    await eventBus.connectionPub.tryConnect(1, 500)

                    return eventBus.publish(
                        new EnvironmentEvent('EnvironmentDeleteEvent', new Date(), new EnvironmentMock()),
                        'environments.delete')
                        .then((result: boolean) => {
                            expect(result).to.equal(true)
                        })
                } catch (err) {
                    throw new Error('Failure on EventBus test: ' + err.message)
                }
            })
        })
    })
})
