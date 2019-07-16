import sinon from 'sinon'
import { BaseRepository } from '../../../src/infrastructure/repository/base/base.repository'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { assert } from 'chai'
import { ObjectID } from 'bson'
import { IEntityMapper } from '../../../src/infrastructure/port/entity.mapper.interface'
import { ILogger } from '../../../src/utils/custom.logger'
import { Entity } from '../../../src/application/domain/model/entity'
import { Sleep } from '../../../src/application/domain/model/sleep'
import { SleepMock } from '../../mocks/sleep.mock'
import { SleepRepoModel } from '../../../src/infrastructure/database/schema/sleep.schema'

require('sinon-mongoose')

class TestRepository<T extends Entity, TModel> extends BaseRepository<any, any> {
    constructor(
        readonly sleepModel: any,
        readonly sleepMapper: IEntityMapper<T, TModel>,
        readonly logger: ILogger
    ) {
        super(sleepModel, sleepMapper, logger)
    }
}

describe('Repositories: BaseRepository', () => {

    const defaultSleep: Sleep = new SleepMock()

    const modelFake: any = SleepRepoModel
    const repo = new TestRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())

    const queryMock: any = {
        toJSON: () => {
            return {
                fields: {},
                ordination: {},
                pagination: { page: 1, limit: 100, skip: 0 },
                filters: {}
            }
        }
    }

    afterEach(() => {
        sinon.restore()
    })

    describe('create(item: T)', () => {
        context('when create a item with success', () => {
            it('should return a sleep object.', () => {

                sinon
                    .mock(modelFake)
                    .expects('create')
                    .chain('exec')
                    .resolves(defaultSleep)

                return repo.create(defaultSleep)
                    .then(sleep => {
                        sleep = sleep.toJSON()
                        assert.propertyVal(sleep, 'id', sleep.id)
                        assert.propertyVal(sleep, 'start_time', sleep.start_time)
                        assert.propertyVal(sleep, 'end_time', sleep.end_time)
                        assert.propertyVal(sleep, 'duration', sleep.duration)
                        assert.propertyVal(sleep, 'pattern', sleep.pattern)
                        assert.propertyVal(sleep, 'type', sleep.type)
                        assert.propertyVal(sleep, 'child_id', sleep.child_id)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {

                sinon
                    .mock(modelFake)
                    .expects('create')
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return repo.create(queryMock)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('find(query: IQuery)', () => {
        it('should return a list of sleep activities', () => {

            const resultExpected = new Array<Sleep>(defaultSleep)

            sinon
                .mock(modelFake)
                .expects('find')
                .chain('sort')
                .withArgs(queryMock.toJSON().ordination)
                .chain('skip')
                .withArgs(queryMock.toJSON().pagination.skip)
                .chain('limit')
                .withArgs(queryMock.toJSON().pagination.limit)
                .chain('exec')
                .resolves(resultExpected)

            return repo.find(queryMock)
                .then((sleepArr: Array<Sleep>) => {
                    assert.isNotEmpty(sleepArr)
                    sleepArr[0] = sleepArr[0].toJSON()
                    assert.propertyVal(sleepArr[0], 'id', defaultSleep.id)
                    assert.propertyVal(sleepArr[0], 'start_time', (defaultSleep.start_time)!.toISOString())
                    assert.propertyVal(sleepArr[0], 'end_time', (defaultSleep.end_time)!.toISOString())
                    assert.propertyVal(sleepArr[0], 'duration', defaultSleep.duration)
                    assert.deepPropertyVal(sleepArr[0], 'pattern', defaultSleep.pattern!.toJSON())
                    assert.propertyVal(sleepArr[0], 'type', defaultSleep.type)
                    assert.propertyVal(sleepArr[0], 'child_id', defaultSleep.child_id)
                })
        })

        context('when there are no sleep activities in database', () => {
            it('should return a empty list', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .chain('sort')
                    .withArgs(queryMock.toJSON().ordination)
                    .chain('skip')
                    .withArgs(queryMock.toJSON().pagination.skip)
                    .chain('limit')
                    .withArgs(queryMock.toJSON().pagination.limit)
                    .chain('exec')
                    .resolves([])

                return repo.find(queryMock)
                    .then(sleepArr => {
                        assert.equal(sleepArr.length, 0)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .chain('sort')
                    .withArgs(queryMock.toJSON().ordination)
                    .chain('skip')
                    .withArgs(queryMock.toJSON().pagination.skip)
                    .chain('limit')
                    .withArgs(queryMock.toJSON().pagination.limit)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return repo.find(queryMock)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findOne(query: IQuery)', () => {
        queryMock.filters = { id: defaultSleep.id }

        it('should return a unique sleep', () => {
            sinon
                .mock(modelFake)
                .expects('findOne')
                .withArgs(queryMock.toJSON().filters)
                .chain('exec')
                .resolves(defaultSleep)

            return repo.findOne(queryMock)
                .then(sleep => {
                    sleep = sleep.toJSON()
                    assert.propertyVal(sleep, 'id', sleep.id)
                    assert.propertyVal(sleep, 'start_time', sleep.start_time)
                    assert.propertyVal(sleep, 'end_time', sleep.end_time)
                    assert.propertyVal(sleep, 'duration', sleep.duration)
                    assert.propertyVal(sleep, 'pattern', sleep.pattern)
                    assert.propertyVal(sleep, 'type', sleep.type)
                    assert.propertyVal(sleep, 'child_id', sleep.child_id)
                })
        })

        context('when the sleep is not found', () => {
            it('should return undefined', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return repo.findOne(queryMock)
                    .then(sleep => {
                        assert.isUndefined(sleep)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return repo.findOne(queryMock)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('update(item: T)', () => {
        it('should return the updated sleep', () => {
            sinon
                .mock(modelFake)
                .expects('findOneAndUpdate')
                .withArgs({ _id: defaultSleep.id }, defaultSleep, { new: true })
                .chain('exec')
                .resolves(defaultSleep)

            return repo.update(defaultSleep)
                .then(sleep => {
                    sleep = sleep.toJSON()
                    assert.propertyVal(sleep, 'id', sleep.id)
                    assert.propertyVal(sleep, 'start_time', sleep.start_time)
                    assert.propertyVal(sleep, 'end_time', sleep.end_time)
                    assert.propertyVal(sleep, 'duration', sleep.duration)
                    assert.propertyVal(sleep, 'pattern', sleep.pattern)
                    assert.propertyVal(sleep, 'type', sleep.type)
                    assert.propertyVal(sleep, 'child_id', sleep.child_id)
                })
        })

        context('when the sleep is not found', () => {
            it('should return info message from sleep not found', () => {

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultSleep.id }, defaultSleep, { new: true })
                    .chain('exec')
                    .resolves(undefined)

                return repo.update(defaultSleep)
                    .then((result: any) => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when the user id is invalid', () => {
            it('should return info message about invalid parameter', () => {

                defaultSleep.id = '5b4b'

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultSleep.id }, defaultSleep, { new: true })
                    .chain('exec')
                    .rejects({ name: 'CastError' })

                return repo.update(defaultSleep)
                    .catch((err: any) => {
                        assert.equal(err.message, 'Some ID provided, does not have a valid format.')
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {

                defaultSleep.id = '5a62be07de34500146d9c544'

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ _id: defaultSleep.id }, defaultSleep, { new: true })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return repo.update(defaultSleep)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('delete(id: string | number)', () => {
        it('should return true for confirm delete', () => {

            const sleepId: string = '5a62be07de34500146d9c544' // The defaultSleep id, but only the string

            sinon
                .mock(modelFake)
                .expects('findOneAndDelete')
                .withArgs({ _id: sleepId })
                .chain('exec')
                .resolves(true)

            return repo.delete(sleepId)
                .then((result: boolean) => {
                    assert.isTrue(result)
                })
        })

        context('when the sleep is not found', () => {
            it('should return false for confirm that sleep is not founded', () => {

                const randomId: any = new ObjectID()

                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ _id: randomId })
                    .chain('exec')
                    .resolves(false)

                return repo.delete(randomId)
                    .then((result: boolean) => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when the sleep id is invalid', () => {
            it('should return info message about invalid parameter', () => {

                const invalidId: string = '1a2b3c'

                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ _id: invalidId })
                    .chain('exec')
                    .rejects({ name: 'CastError' })

                return repo.delete(invalidId)
                    .catch((err: any) => {
                        assert.equal(err.message, 'Some ID provided, does not have a valid format.')
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {

                const id: string = '5a62be07de34500146d9c544'

                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ _id: id })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return repo.delete(id)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('count(query: IQuery)', () => {
        it('should return how many sleep activities there are in the database for a query', () => {

            queryMock.filters = { pattern: defaultSleep.pattern }

            sinon
                .mock(modelFake)
                .expects('countDocuments')
                .withArgs(queryMock.toJSON().filters)
                .chain('exec')
                .resolves(1)

            return repo.count(queryMock)
                .then((countSleep: number) => {
                    assert.equal(countSleep, 1)
                })
        })

        context('when there no are sleep activities in database for a query', () => {
            it('should return 0', () => {

                queryMock.filters = { type: 3 }

                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(0)

                return repo.count(queryMock)
                    .then((countSleep: number) => {
                        assert.equal(countSleep, 0)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {

                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return repo.count(queryMock)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
