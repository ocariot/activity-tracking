import sinon from 'sinon'
import { assert } from 'chai'
import { IntegrationEventRepository } from '../../../src/infrastructure/repository/integration.event.repository'
import { IntegrationEventRepoModel } from '../../../src/infrastructure/database/schema/integration.event.schema'
import { IntegrationEvent } from '../../../src/application/integration-event/event/integration.event'
import { IQuery } from '../../../src/application/port/query.interface'
import { Query } from '../../../src/infrastructure/repository/query/query'
import { PhysicalActivityEvent } from '../../../src/application/integration-event/event/physical.activity.event'
import { PhysicalActivityMock } from '../../mocks/physical.activity.mock'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'

require('sinon-mongoose')

describe('Repositories: IntegrationEventRepository', () => {
    // Mock events
    const activitySaveEvent: PhysicalActivityEvent = new PhysicalActivityEvent('PhysicalActivitySaveEvent',
        new Date(), new PhysicalActivityMock())
    const activityUpdateEvent = new PhysicalActivityEvent('PhysicalActivityUpdateEvent', new Date(), new PhysicalActivityMock())

    const eventsArr: Array<IntegrationEvent<PhysicalActivity>> = [activitySaveEvent, activityUpdateEvent]

    const integrationEventModelFake: any = IntegrationEventRepoModel
    const integrationRepo = new IntegrationEventRepository(integrationEventModelFake)

    // Mock query
    const queryMock: IQuery = new Query()
    queryMock.addOrdination('created_at', 'desc')

    afterEach(() => {
        sinon.restore()
    })

    describe('create(item: any)', () => {
        context('when create a IntegrationEvent successfully', () => {
            it('should return the IntegrationEvent created', () => {
                sinon
                    .mock(integrationEventModelFake)
                    .expects('create')
                    .withArgs(activitySaveEvent)
                    .chain('exec')
                    .resolves(activitySaveEvent)

                return integrationRepo.create(activitySaveEvent)
                    .then(result => {
                        assert.propertyVal(result, 'event_name', activitySaveEvent.event_name)
                        assert.propertyVal(result, 'type', activitySaveEvent.type)
                        assert.propertyVal(result, 'timestamp', activitySaveEvent.timestamp)
                        assert.propertyVal(result, 'physicalactivity', activitySaveEvent.physicalactivity)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(integrationEventModelFake)
                    .expects('create')
                    .withArgs(activitySaveEvent)
                    .chain('exec')
                    .rejects({ name: 'Error' })

                return integrationRepo.create(activitySaveEvent)
                    .catch(err => {
                        assert.propertyVal(err, 'name', 'Error')
                        assert.propertyVal(err, 'message', err.message)
                    })
            })
        })
    })

    describe('find(query: IQuery)', () => {
        context('when there is at least one IntegrationEvent in the database', () => {
            it('should return an IntegrationEvent array', () => {
                sinon
                    .mock(integrationEventModelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('sort')
                    .withArgs(queryMock.toJSON().ordination)
                    .chain('exec')
                    .resolves(eventsArr)

                return integrationRepo.find(queryMock)
                    .then(result => {
                        assert.isArray(result)
                        assert.isNotEmpty(result)
                    })
            })
        })

        context('when there is no IntegrationEvent in the database', () => {
            it('should return an empty array', () => {
                sinon
                    .mock(integrationEventModelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('sort')
                    .withArgs(queryMock.toJSON().ordination)
                    .chain('exec')
                    .resolves(new Array<IntegrationEvent<PhysicalActivity>>())

                return integrationRepo.find(queryMock)
                    .then(result => {
                        assert.isArray(result)
                        assert.isEmpty(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(integrationEventModelFake)
                    .expects('find')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('sort')
                    .withArgs(queryMock.toJSON().ordination)
                    .chain('exec')
                    .rejects({ name: 'Error' })

                return integrationRepo.find(queryMock)
                    .catch(err => {
                        assert.propertyVal(err, 'name', 'Error')
                        assert.propertyVal(err, 'message', err.message)
                    })
            })
        })
    })

    describe('delete(id: string)', () => {
        context('when there is a IntegrationEvent with the received id', () => {
            it('should return true', () => {
                sinon
                    .mock(integrationEventModelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ _id: activitySaveEvent.physicalactivity!.id })
                    .chain('exec')
                    .resolves(true)

                return integrationRepo.delete(activitySaveEvent.physicalactivity!.id!)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when there is no IntegrationEvent with the received id', () => {
            it('should return false', () => {
                sinon
                    .mock(integrationEventModelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ _id: activitySaveEvent.physicalactivity!.id })
                    .chain('exec')
                    .resolves(false)

                return integrationRepo.delete(activitySaveEvent.physicalactivity!.id!)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(integrationEventModelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ _id: activitySaveEvent.physicalactivity!.id })
                    .chain('exec')
                    .rejects({ name: 'Error' })

                return integrationRepo.delete(activitySaveEvent.physicalactivity!.id!)
                    .catch(err => {
                        assert.propertyVal(err, 'name', 'Error')
                        assert.propertyVal(err, 'message', err.message)
                    })
            })
        })
    })
})
