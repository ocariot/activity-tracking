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

describe('Repositories: Base', () => {

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

    // TODO implement test for create method
    describe('create()', () => {
        it('should return a sleep object.', () => {

            sinon
                .mock(modelFake)
                .expects('create')
                .chain('exec')
                .resolves(defaultSleep)

            return repo.create(defaultSleep)
                .then(sleep => {
                    sleep = sleep.toJSON()
                    assert.property(sleep, 'id')
                    assert.propertyVal(sleep, 'id', sleep.id)
                    assert.property(sleep, 'start_time')
                    assert.propertyVal(sleep, 'start_time', sleep.start_time)
                    assert.property(sleep, 'end_time')
                    assert.propertyVal(sleep, 'end_time', sleep.end_time)
                    assert.property(sleep, 'duration')
                    assert.propertyVal(sleep, 'duration', sleep.duration)
                    assert.property(sleep, 'pattern')
                    assert.propertyVal(sleep, 'pattern', sleep.pattern)
                    assert.property(sleep, 'child_id')
                    assert.propertyVal(sleep, 'child_id', sleep.child_id)
                })
        })
    })

    describe('find()', () => {
        it('should return a list of sleep activities', () => {

            const resultExpected = new Array<Sleep>(defaultSleep)

            sinon
                .mock(modelFake)
                .expects('find')
                .chain('select')
                .withArgs(queryMock.toJSON().fields)
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
                    assert.property(sleepArr[0], 'id')
                    assert.propertyVal(sleepArr[0], 'id', defaultSleep.id)
                    assert.property(sleepArr[0], 'start_time')
                    assert.propertyVal(sleepArr[0], 'start_time', (defaultSleep.start_time)!.toISOString())
                    assert.property(sleepArr[0], 'end_time')
                    assert.propertyVal(sleepArr[0], 'end_time', (defaultSleep.end_time)!.toISOString())
                    assert.property(sleepArr[0], 'duration')
                    assert.propertyVal(sleepArr[0], 'duration', defaultSleep.duration)
                    assert.property(sleepArr[0], 'pattern')
                    assert.property(sleepArr[0], 'child_id')
                    assert.propertyVal(sleepArr[0], 'child_id', defaultSleep.child_id)
                })
        })

        context('when there are no sleep activities in database', () => {
            it('should return a empty list', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .chain('select')
                    .withArgs(queryMock.toJSON().fields)
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
                        assert.isEmpty(sleepArr)
                        assert.equal(sleepArr.length, 0)
                    })
            })
        })
    })

    describe('findOne()', () => {
        const customQueryMock: any = {
            toJSON: () => {
                return {
                    fields: {},
                    ordination: {},
                    pagination: { page: 1, limit: 100 },
                    filters: { id: defaultSleep.id }
                }
            }
        }

        it('should return a unique sleep', () => {
            sinon
                .mock(modelFake)
                .expects('findOne')
                .withArgs(customQueryMock.toJSON().filters)
                .chain('select')
                .withArgs(customQueryMock.toJSON().fields)
                .chain('exec')
                .resolves(defaultSleep)

            return repo.findOne(customQueryMock)
                .then(sleep => {
                    sleep = sleep.toJSON()
                    assert.property(sleep, 'id')
                    assert.propertyVal(sleep, 'id', sleep.id)
                    assert.property(sleep, 'start_time')
                    assert.propertyVal(sleep, 'start_time', sleep.start_time)
                    assert.property(sleep, 'end_time')
                    assert.propertyVal(sleep, 'end_time', sleep.end_time)
                    assert.property(sleep, 'duration')
                    assert.propertyVal(sleep, 'duration', sleep.duration)
                    assert.property(sleep, 'pattern')
                    assert.propertyVal(sleep, 'pattern', sleep.pattern)
                    assert.property(sleep, 'child_id')
                    assert.propertyVal(sleep, 'child_id', sleep.child_id)
                })
        })

        context('when the sleep is not found', () => {
            it('should return undefined', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('select')
                    .withArgs(customQueryMock.toJSON().fields)
                    .chain('exec')
                    .resolves()

                return repo.findOne(customQueryMock)
                    .then(sleep => {
                        assert.isNotObject(sleep)
                    })
            })
        })
    })

    describe('update()', () => {
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
                    assert.property(sleep, 'id')
                    assert.propertyVal(sleep, 'id', sleep.id)
                    assert.property(sleep, 'start_time')
                    assert.propertyVal(sleep, 'start_time', sleep.start_time)
                    assert.property(sleep, 'end_time')
                    assert.propertyVal(sleep, 'end_time', sleep.end_time)
                    assert.property(sleep, 'duration')
                    assert.propertyVal(sleep, 'duration', sleep.duration)
                    assert.property(sleep, 'pattern')
                    assert.propertyVal(sleep, 'pattern', sleep.pattern)
                    assert.property(sleep, 'child_id')
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
                        assert.isNotNull(result)
                        assert.isUndefined(result)
                        assert.isNotObject(result)
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
                        assert.isNotNull(err)
                        assert.equal(err.message, 'Some ID provided, does not have a valid format.')
                    })
            })

        })
    })

    describe('delete()', () => {
        it('should return true for confirm delete', () => {

            const sleepId: string = '5a62be07de34500146d9c544' // The defaultSleep id, but only the string

            sinon
                .mock(modelFake)
                .expects('findOneAndDelete')
                .withArgs({ _id: sleepId })
                .chain('exec')
                .resolves(true)

            return repo.delete(sleepId)
                .then((isDeleted: boolean) => {
                    assert.isBoolean(isDeleted)
                    assert.isTrue(isDeleted)
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
                    .then((isDeleted: boolean) => {
                        assert.isBoolean(isDeleted)
                        assert.isFalse(isDeleted)
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
                        assert.isNotNull(err)
                        assert.equal(err.message, 'Some ID provided, does not have a valid format.')
                    })
            })
        })
    })

    describe('count()', () => {
        it('should return how many sleep activities there are in the database for a query', () => {

            const customQueryMock: any = {
                toJSON: () => {
                    return {
                        fields: {},
                        ordination: {},
                        pagination: { page: 1, limit: 100 },
                        filters: { pattern: defaultSleep.pattern }
                    }
                }
            }

            sinon
                .mock(modelFake)
                .expects('countDocuments')
                .withArgs(customQueryMock.toJSON().filters)
                .chain('exec')
                .resolves(1)

            return repo.count(customQueryMock)
                .then((countSleep: number) => {
                    assert.isNumber(countSleep)
                    assert.equal(countSleep, 1)
                })
        })

        context('when there no are sleep activities in database for a query', () => {
            it('should return 0', () => {

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100 },
                            filters: { type: 3 }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(0)

                return repo.count(customQueryMock)
                    .then((countSleep: number) => {
                        assert.isNumber(countSleep)
                        assert.equal(countSleep, 0)
                    })
            })
        })
    })

})
