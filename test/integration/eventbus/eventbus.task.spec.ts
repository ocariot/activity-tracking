import { expect } from 'chai'
import { DI } from '../../../src/di/di'
import { Identifier } from '../../../src/di/identifiers'
import { Container } from 'inversify'
import { PhysicalActivityEvent } from '../../../src/application/integration-event/event/physical.activity.event'
import { EventBusTask } from '../../../src/background/task/eventbus.task'
import { IIntegrationEventRepository } from '../../../src/application/port/integration.event.repository.interface'
import { PhysicalActivityMock } from '../../mocks/physical.activity.mock'
import { SleepEvent } from '../../../src/application/integration-event/event/sleep.event'
import { SleepMock } from '../../mocks/sleep.mock'
import { IntegrationEventRepoModel } from '../../../src/infrastructure/database/schema/integration.event.schema'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { IConnectionDB } from '../../../src/infrastructure/port/connection.db.interface'
import { EnvironmentEvent } from '../../../src/application/integration-event/event/environment.event'
import { EnvironmentMock } from '../../mocks/environment.mock'

const container: Container = DI.getInstance().getContainer()
const eventBusTask: EventBusTask = container.get(Identifier.EVENT_BUS_TASK)
const integrationRepository: IIntegrationEventRepository = container.get(Identifier.INTEGRATION_EVENT_REPOSITORY)
const mongoDBConnection: IConnectionDB = container.get(Identifier.MONGODB_CONNECTION)

describe('EVENT BUS TASK', () => {
    before(async () => {
        await mongoDBConnection.tryConnect(0, 500)
        deleteAllIntegrationEvents()
    })

    afterEach(async () => {
        deleteAllIntegrationEvents()
        await eventBusTask.stop()
    })

    describe('PUBLISH SAVED EVENTS', () => {
        context('when all events are valid and there is a connection with RabbitMQ', () => {
            it('should return an empty array', async () => {
                try {
                    await createActivityIntegrationEvents()
                    await createSleepIntegrationEvents()
                    await createEnvironmentIntegrationEvents()

                    eventBusTask.run()

                    // Wait for 1000 milliseconds for the task to be executed
                    const sleep = (milliseconds) => {
                        return new Promise(resolve => setTimeout(resolve, milliseconds))
                    }

                    await sleep(1000)

                    const result: Array<any> = await integrationRepository.find(new Query())    // Search in repository
                    expect(result.length).to.eql(0)
                } catch (err) {
                    console.log(err)
                }
            })
        })

        context('when the event name does not match any of the expected', () => {
            it('should return an array of the same size as the number of events sent', async () => {
                const event: SleepEvent = new SleepEvent('WrongSleepSaveEvent', new Date(), new SleepMock())
                const saveEvent: any = event.toJSON()
                saveEvent.__operation = 'publish'
                saveEvent.__routing_key = 'sleep.save'

                try {
                    await integrationRepository.create(JSON.parse(JSON.stringify(saveEvent)))

                    eventBusTask.run()

                    // Wait for 1000 milliseconds for the task to be executed
                    const sleep = (milliseconds) => {
                        return new Promise(resolve => setTimeout(resolve, milliseconds))
                    }
                    await sleep(1000)

                    const result: Array<any> = await integrationRepository.find(new Query())
                    expect(result.length).to.eql(1)
                } catch (err) {
                    console.log(err)
                }
            })
        })

        context('when there is some wrong parameter in the event', () => {
            it('should throw an Exception', async () => {
                const event: SleepEvent = new SleepEvent('SleepSaveEvent', new Date(), new SleepMock())
                const saveEvent: any = event.toJSON()
                saveEvent.__operation = 'publish'
                saveEvent.__routing_key = 'sleep.save'

                try {
                    // Mock throw an exception (not parse the JSON)
                    await integrationRepository.create(JSON.stringify(saveEvent))

                    eventBusTask.run()

                    // Wait for 1000 milliseconds for the task to be executed
                    const sleep = (milliseconds) => {
                        return new Promise(resolve => setTimeout(resolve, milliseconds))
                    }
                    await sleep(1000)

                    const result: Array<any> = await integrationRepository.find(new Query())
                    expect(result.length).to.eql(1)
                } catch (err) {
                    expect(err).to.have.property('message')
                }
            })
        })

        // Before running this test, the connection to the RabbitMQ must be dropped manually
        // context('when there is no connection to RabbitMQ', () => {
        //     it('should return a non-empty array', async () => {
        //         try {
        //             await createActivityIntegrationEvents()
        //             await createSleepIntegrationEvents()
        //             await createEnvironmentIntegrationEvents()
        //
        //             eventBusTask.run()
        //
        //             // Wait for 1000 milliseconds for the task to be executed
        //             const sleep = (milliseconds) => {
        //                 return new Promise(resolve => setTimeout(resolve, milliseconds))
        //             }
        //
        //             await sleep(1000)
        //
        //             const result: Array<any> = await integrationRepository.find(new Query())
        //             expect(result.length).to.eql(8)
        //         } catch (err) {
        //             console.log(err)
        //         }
        //     })
        // })
    })
})

async function createActivityIntegrationEvents(): Promise<any> {
    // Save
    let event: PhysicalActivityEvent = new PhysicalActivityEvent('PhysicalActivitySaveEvent',
            new Date(), new PhysicalActivityMock())
    let saveEvent: any = event.toJSON()
    saveEvent.__operation = 'publish'
    saveEvent.__routing_key = 'activities.save'
    await integrationRepository.create(JSON.parse(JSON.stringify(saveEvent)))

    // Update
    event = new PhysicalActivityEvent('PhysicalActivityUpdateEvent', new Date(), new PhysicalActivityMock())
    saveEvent = event.toJSON()
    saveEvent.__operation = 'publish'
    saveEvent.__routing_key = 'activities.update'
    await integrationRepository.create(JSON.parse(JSON.stringify(saveEvent)))

    // Delete
    event = new PhysicalActivityEvent('PhysicalActivityDeleteEvent', new Date(), new PhysicalActivityMock())
    saveEvent = event.toJSON()
    saveEvent.__operation = 'publish'
    saveEvent.__routing_key = 'activities.delete'
    await integrationRepository.create(JSON.parse(JSON.stringify(saveEvent)))

    return Promise.resolve()
}

async function createSleepIntegrationEvents(): Promise<any> {
    // Save
    let event: SleepEvent = new SleepEvent('SleepSaveEvent', new Date(), new SleepMock())
    let saveEvent: any = event.toJSON()
    saveEvent.__operation = 'publish'
    saveEvent.__routing_key = 'sleep.save'
    await integrationRepository.create(JSON.parse(JSON.stringify(saveEvent)))

    // Update
    event = new SleepEvent('SleepUpdateEvent', new Date(), new SleepMock())
    saveEvent = event.toJSON()
    saveEvent.__operation = 'publish'
    saveEvent.__routing_key = 'sleep.update'
    await integrationRepository.create(JSON.parse(JSON.stringify(saveEvent)))
    // Delete
    event = new SleepEvent('SleepDeleteEvent', new Date(), new SleepMock())
    saveEvent = event.toJSON()
    saveEvent.__operation = 'publish'
    saveEvent.__routing_key = 'sleep.delete'
    await integrationRepository.create(JSON.parse(JSON.stringify(saveEvent)))

    return Promise.resolve()
}

async function createEnvironmentIntegrationEvents(): Promise<any> {
    let event: EnvironmentEvent = new EnvironmentEvent('EnvironmentSaveEvent', new Date(), new EnvironmentMock())
    let saveEvent: any = event.toJSON()
    saveEvent.__operation = 'publish'
    saveEvent.__routing_key = 'environments.save'
    await integrationRepository.create(JSON.parse(JSON.stringify(saveEvent)))

    event = new EnvironmentEvent('EnvironmentDeleteEvent', new Date(), new EnvironmentMock())
    saveEvent = event.toJSON()
    saveEvent.__operation = 'publish'
    saveEvent.__routing_key = 'environments.delete'
    await integrationRepository.create(JSON.parse(JSON.stringify(saveEvent)))

    return Promise.resolve()
}

function deleteAllIntegrationEvents(): void {
    IntegrationEventRepoModel.deleteMany({}, err => {
        if (err) console.log(err)
    })
}
