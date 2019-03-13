import sinon from 'sinon'
import { assert } from 'chai'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { ObjectID } from 'bson'
import { Sleep } from '../../../src/application/domain/model/sleep'
import { SleepMock } from '../../mocks/sleep.mock'
import { SleepRepoModel } from '../../../src/infrastructure/database/schema/sleep.schema'
import { ISleepRepository } from '../../../src/application/port/sleep.repository.interface'
import { SleepRepository } from '../../../src/infrastructure/repository/sleep.repository'

require('sinon-mongoose')

describe('Repositories: Sleep', () => {
    const defaultSleep: Sleep = new SleepMock()

    const modelFake: any = SleepRepoModel
    const repo: ISleepRepository = new SleepRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())

    afterEach(() => {
        sinon.restore()
    })

    describe('checkExist()', () => {
        context('when the sleep is found', () => {
            it('should return true if exists in search by the filters bellow', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: {  start_time: defaultSleep.start_time,
                                        child_id: defaultSleep.child_id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultSleep)

                return repo.checkExist(defaultSleep)
                    .then(result => {
                        assert.isBoolean(result)
                        assert.isTrue(result)
                    })
            })
        })

        context('when the sleep is not found', () => {
            it('should return false', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: {  start_time: defaultSleep.start_time,
                                        child_id: defaultSleep.child_id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return repo.checkExist(defaultSleep)
                    .then(result => {
                        assert.isBoolean(result)
                        assert.isFalse(result)
                    })
            })
        })

        context('when the sleep start_time is undefined', () => {
            it('should return false', () => {

                defaultSleep.start_time = undefined

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: {  start_time: defaultSleep.start_time,
                                        child_id: defaultSleep.child_id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ name: 'ValidationError' })

                return repo.checkExist(defaultSleep)
                    .catch((err: any) => {
                        assert.isNotNull(err)
                        assert.equal(err.message, 'An internal error has occurred in the database!')
                    })
            })
        })

        context('when the sleep id is undefined', () => {
            it('should return false', () => {

                defaultSleep.start_time = new Date()
                defaultSleep.id = undefined

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: {  start_time: defaultSleep.start_time,
                                        child_id: defaultSleep.child_id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ name: 'ValidationError' })

                return repo.checkExist(defaultSleep)
                    .catch((err: any) => {
                        assert.isNotNull(err)
                        assert.equal(err.message, 'An internal error has occurred in the database!')
                    })
            })
        })
    })

    describe('updateByChild()', () => {
        context('when the sleep is found and the update operation is done successfully', () => {
            it('should return the updated sleep', () => {

                defaultSleep.id = `${new ObjectID()}`

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: {  _id: defaultSleep.id,
                                        child_id: defaultSleep.child_id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultSleep)

                return repo.updateByChild(defaultSleep)
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

        context('when the sleep is not found', () => {
            it('should return undefined representing that sleep was not found', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: {  _id: defaultSleep.id,
                                        child_id: defaultSleep.child_id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return repo.updateByChild(defaultSleep)
                    .then((result: any) => {
                        assert.isNotNull(result)
                        assert.isUndefined(result)
                        assert.isNotObject(result)
                    })
            })
        })

        context('when the sleep id is invalid', () => {
            it('should return undefined representing that there is an invalid parameter', () => {

                defaultSleep.id = '5b4b'

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: {  child_id: defaultSleep.child_id,
                                        _id: defaultSleep.id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return repo.updateByChild(defaultSleep)
                    .then((result: any) => {
                        assert.isNotNull(result)
                        assert.isUndefined(result)
                        assert.isNotObject(result)
                    })
            })
        })

        context('when the sleep child_id is invalid', () => {
            it('should return undefined representing that there is an invalid parameter', () => {

                defaultSleep.id = `${new ObjectID()}`
                defaultSleep.child_id = '5b4b'

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: {  child_id: defaultSleep.child_id,
                                        _id: defaultSleep.id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return repo.updateByChild(defaultSleep)
                    .then((result: any) => {
                        assert.isNotNull(result)
                        assert.isUndefined(result)
                        assert.isNotObject(result)
                    })
            })
        })
    })

    describe('removeByChild()', () => {
        context('when the sleep is found and the delete operation is done successfully', () => {
            it('should return true for confirm delete', () => {

                defaultSleep.child_id = '5a62be07de34500146d9c544'

                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ child_id: defaultSleep.child_id, _id: defaultSleep.id })
                    .chain('exec')
                    .resolves(true)

                return repo.removeByChild(defaultSleep.id!, defaultSleep.child_id)
                    .then((isDeleted: boolean) => {
                        assert.isBoolean(isDeleted)
                        assert.isTrue(isDeleted)
                    })
            })
        })

        context('when the sleep is not found', () => {
            it('should return false for confirm that the sleep was not found', () => {

                const randomChildId: any = new ObjectID()
                const randomId: any = new ObjectID()

                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ child_id: randomChildId, _id: randomId })
                    .chain('exec')
                    .resolves(false)

                return repo.removeByChild(randomId, randomChildId)
                    .then((isDeleted: boolean) => {
                        assert.isBoolean(isDeleted)
                        assert.isFalse(isDeleted)
                    })
            })
        })

        context('when the sleep id is invalid', () => {
            it('should return false for confirm that there is an invalid parameter', () => {

                defaultSleep.id = '1a2b3c'

                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ child_id: defaultSleep.child_id, _id: defaultSleep.id })
                    .chain('exec')
                    .resolves(false)

                return repo.removeByChild(defaultSleep.id, defaultSleep.child_id)
                    .then((isDeleted: boolean) => {
                        assert.isBoolean(isDeleted)
                        assert.isFalse(isDeleted)
                    })
            })
        })

        context('when the sleep child_id is invalid', () => {
            it('should return false for confirm that there is an invalid parameter', () => {

                defaultSleep.id = `${new ObjectID()}`
                defaultSleep.child_id = '1a2b3c'

                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ child_id: defaultSleep.child_id, _id: defaultSleep.id })
                    .chain('exec')
                    .resolves(false)

                return repo.removeByChild(defaultSleep.id!, defaultSleep.child_id)
                    .then((isDeleted: boolean) => {
                        assert.isBoolean(isDeleted)
                        assert.isFalse(isDeleted)
                    })
            })
        })
    })
})
