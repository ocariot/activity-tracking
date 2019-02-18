import { expect } from 'chai'
import { DI } from '../../src/di/di'
import { Identifier } from '../../src/di/identifiers'
import { IEventBus } from '../../src/infrastructure/port/event.bus.interface'
import { Container } from 'inversify'
import { PhysicalActivitySaveEvent } from '../../src/application/integration-event/event/physical.activity.save.event'
import { EventBusException } from '../../src/application/domain/exception/eventbus.exception'
import { SleepMock } from '../mocks/sleep.mock'
import { ActivityTypeMock, PhysicalActivityMock } from '../mocks/physical.activity.mock'
import { SleepSaveEvent } from '../../src/application/integration-event/event/sleep.save.event'
import { EnvironmentSaveEvent } from '../../src/application/integration-event/event/environment.save.event'
import { EnvironmentMock } from '../mocks/environment.mock'
import { PhysicalActivitySaveEventHandler } from '../../src/application/integration-event/handler/physical.activity.save.event.handler'
import { IPhysicalActivityRepository } from '../../src/application/port/physical.activity.repository.interface'
import { ILogger } from '../../src/utils/custom.logger'
import { SleepSaveEventHandler } from '../../src/application/integration-event/handler/sleep.save.event.handler'
import { ISleepRepository } from '../../src/application/port/sleep.repository.interface'
import { EnvironmentSaveEventHandler } from '../../src/application/integration-event/handler/environment.save.event.handler'
import { IEnvironmentRepository } from '../../src/application/port/environment.repository.interface'

const container: Container = DI.getInstance().getContainer()
const eventBus: IEventBus = container.get(Identifier.RABBITMQ_EVENT_BUS)
const logger: ILogger = container.get(Identifier.LOGGER)
const pubPhysicalActivityTotal: number = 10
const pubSleepTotal: number = 10
const pubEnvironmentTotal: number = 10

describe('EVENT BUS', () => {
    after(async () => {
        await eventBus.dispose()
    })

    describe('CONNECTION', () => {
        it('should return EventBusException with message without connection when publishing.', () => {
            return eventBus
                .publish(new PhysicalActivitySaveEvent(''), '')
                .catch((err: EventBusException) => {
                    expect(err).instanceOf(EventBusException)
                })
        })

        it('should return EventBusException with message without connection when subscription.', () => {
            return eventBus
                .subscribe(
                    new PhysicalActivitySaveEvent(''),
                    new PhysicalActivitySaveEventHandler(
                        container.get<IPhysicalActivityRepository>(Identifier.ACTIVITY_REPOSITORY),
                        logger
                    ),
                    ''
                )
                .catch(err => {
                    expect(err).instanceOf(EventBusException)
                })
        })

        it('should connect successfully to publish.', async () => {
            await eventBus.connectionPub.tryConnect(1, 500)
        })

        it('should connect successfully to subscribe.', async () => {
            await eventBus.connectionSub.tryConnect(1, 500)
        })
    })

    describe('PUBLISH', () => {
        context('Physical Activity', () => {
            it('should return true for published RUN physical activity.', async () => {
                await eventBus.connectionPub.tryConnect(1, 500)
                return eventBus.publish(
                    new PhysicalActivitySaveEvent('PhysicalActivitySaveEvent', new Date(),
                        new PhysicalActivityMock(ActivityTypeMock.RUN)),
                    'activities.save')
                    .then((result: boolean) => {
                        expect(result).to.equal(true)
                    })
            })

            it('should return true for published WALK physical activity.', async () => {
                await eventBus.connectionPub.tryConnect(1, 500)
                return eventBus.publish(
                    new PhysicalActivitySaveEvent('PhysicalActivitySaveEvent', new Date(),
                        new PhysicalActivityMock(ActivityTypeMock.WALK)),
                    'activities.save')
                    .then((result: boolean) => {
                        expect(result).to.equal(true)
                    })
            })

            it('should return true for published BIKE physical activity.', async () => {
                await eventBus.connectionPub.tryConnect(1, 500)
                return eventBus.publish(
                    new PhysicalActivitySaveEvent('PhysicalActivitySaveEvent', new Date(),
                        new PhysicalActivityMock(ActivityTypeMock.BIKE)),
                    'activities.save')
                    .then((result: boolean) => {
                        expect(result).to.equal(true)
                    })
            })

            it('should return true for published SWIM physical activity.', async () => {
                await eventBus.connectionPub.tryConnect(1, 500)
                return eventBus.publish(
                    new PhysicalActivitySaveEvent('PhysicalActivitySaveEvent', new Date(),
                        new PhysicalActivityMock(ActivityTypeMock.SWIM)),
                    'activities.save')
                    .then((result: boolean) => {
                        expect(result).to.equal(true)
                    })
            })

            it(`should return true to ${pubPhysicalActivityTotal} published physical activities.`, async () => {
                await eventBus.connectionPub.tryConnect(1, 500)
                let count: number = 0

                // Save in file
                // require('fs').writeFileSync('./physical.activity.data.json',
                //     JSON.stringify(new PhysicalActivityMock().toJSON()), 'utf-8')

                for (let i = 0; i < pubPhysicalActivityTotal; i++) {
                    const result = await eventBus.publish(
                        new PhysicalActivitySaveEvent('PhysicalActivitySaveEvent', new Date(),
                            new PhysicalActivityMock()),
                        'activities.save')
                    expect(result).to.equal(true)
                    count++
                }
                expect(count).equals(pubPhysicalActivityTotal)
            })
        })

        context('Sleep', () => {
            it(`should return true to ${pubSleepTotal} published sleep records.`, async () => {
                await eventBus.connectionPub.tryConnect(1, 500)
                let count: number = 0

                // Save in file
                // require('fs').writeFileSync('./sleep.data.json', JSON.stringify(new SleepMock().toJSON()), 'utf-8')

                for (let i = 0; i < pubSleepTotal; i++) {
                    const result = await eventBus.publish(
                        new SleepSaveEvent('SleepSaveEvent', new Date(),
                            new SleepMock()),
                        'sleep.save')
                    expect(result).to.equal(true)
                    count++
                }
                expect(count).equals(pubSleepTotal)
            })
        })

        context('Environment', () => {
            it(`should return true to ${pubEnvironmentTotal} published environments.`, async () => {
                await eventBus.connectionPub.tryConnect(1, 500)
                let count: number = 0

                // Save in file
                // require('fs').writeFileSync('./sleep.data.json', JSON.stringify(new EnvironmentMock().toJSON()), 'utf-8')

                for (let i = 0; i < pubEnvironmentTotal; i++) {
                    const result = await eventBus.publish(
                        new EnvironmentSaveEvent('EnvironmentSaveEvent', new Date(),
                            new EnvironmentMock()),
                        'environments.save')
                    expect(result).to.equal(true)
                    count++
                }
                expect(count).equals(pubEnvironmentTotal)
            })
        })
    })

    describe('SUBSCRIBE', () => {
        it('should return true to subscribe in PhysicalActivitySaveEvent', async () => {
            await eventBus.connectionSub.tryConnect(1, 500)

            const activitySaveEvent = new PhysicalActivitySaveEvent('PhysicalActivitySaveEvent', new Date())
            const activityEventSaveHandler = new PhysicalActivitySaveEventHandler(
                container.get<IPhysicalActivityRepository>(Identifier.ACTIVITY_REPOSITORY), logger)
            return eventBus
                .subscribe(activitySaveEvent, activityEventSaveHandler, 'activities.save')
                .then(result => {
                    expect(result).to.equal(true)
                })
        })

        it('should return true to subscribe in SleepSaveEvent', async () => {
            await eventBus.connectionSub.tryConnect(1, 500)

            const sleepSaveEvent = new SleepSaveEvent('SleepSaveEvent', new Date())
            const sleepEventSaveHandler = new SleepSaveEventHandler(
                container.get<ISleepRepository>(Identifier.SLEEP_REPOSITORY), logger)
            return eventBus
                .subscribe(sleepSaveEvent, sleepEventSaveHandler, 'sleep.save')
                .then(result => {
                    expect(result).to.equal(true)
                })
        })

        it('should return true to subscribe in EnvironmentSaveEvent', async () => {
            await eventBus.connectionSub.tryConnect(1, 500)

            const environmentSaveEvent = new EnvironmentSaveEvent('EnvironmentSaveEvent', new Date())
            const environmentSaveEventHandler = new EnvironmentSaveEventHandler(
                container.get<IEnvironmentRepository>(Identifier.ENVIRONMENT_REPOSITORY), logger)
            return eventBus
                .subscribe(environmentSaveEvent, environmentSaveEventHandler, 'environments.save')
                .then(result => {
                    expect(result).to.equal(true)
                })
        })
    })
})
