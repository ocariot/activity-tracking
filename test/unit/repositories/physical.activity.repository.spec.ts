import sinon from 'sinon'
import { assert } from 'chai'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { PhysicalActivity } from '../../../src/application/domain/model/physical.activity'
import { PhysicalActivityMock } from '../../mocks/physical.activity.mock'
import { ActivityRepoModel } from '../../../src/infrastructure/database/schema/activity.schema'
import { IPhysicalActivityRepository } from '../../../src/application/port/physical.activity.repository.interface'
import { PhysicalActivityRepository } from '../../../src/infrastructure/repository/physical.activity.repository'
import { ObjectID } from 'bson'

require('sinon-mongoose')

describe('Repositories: PhysicalActivity', () => {
    const defaultActivity: PhysicalActivity = new PhysicalActivityMock()

    const modelFake: any = ActivityRepoModel
    const repo: IPhysicalActivityRepository = new PhysicalActivityRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())

    afterEach(() => {
        sinon.restore()
    })

    describe('checkExist(activity: PhysicalActivity)', () => {
        context('when the physical activity is found', () => {
            it('should return true if exists in search by the filters bellow', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: {  start_time: defaultActivity.start_time,
                                        child_id: defaultActivity.child_id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultActivity)

                return repo.checkExist(defaultActivity)
                    .then(result => {
                        assert.isBoolean(result)
                        assert.isTrue(result)
                    })
            })
        })

        context('when the physical activity is not found', () => {
            it('should return false', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: {  start_time: defaultActivity.start_time,
                                        child_id: defaultActivity.child_id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return repo.checkExist(defaultActivity)
                    .then(result => {
                        assert.isBoolean(result)
                        assert.isFalse(result)
                    })
            })
        })

        context('when the physical activity start_time is undefined', () => {
            it('should return false', () => {

                defaultActivity.start_time = undefined

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: {  start_time: defaultActivity.start_time,
                                        child_id: defaultActivity.child_id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ name: 'ValidationError' })

                return repo.checkExist(defaultActivity)
                    .catch((err: any) => {
                        assert.isNotNull(err)
                        assert.equal(err.message, 'An internal error has occurred in the database!')
                    })
            })
        })

        context('when the physical activity id is undefined', () => {
            it('should return false', () => {

                defaultActivity.start_time = new Date()
                defaultActivity.id = undefined

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: {  start_time: defaultActivity.start_time,
                                        child_id: defaultActivity.child_id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ name: 'ValidationError' })

                return repo.checkExist(defaultActivity)
                    .catch((err: any) => {
                        assert.isNotNull(err)
                        assert.equal(err.message, 'An internal error has occurred in the database!')
                    })
            })
        })
    })

    describe('updateByChild(activity: PhysicalActivity)', () => {
        context('when the physical activity is found and the update operation is done successfully', () => {
            it('should return the updated physical activity', () => {

                defaultActivity.id = `${new ObjectID()}`

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: {  _id: defaultActivity.id,
                                        child_id: defaultActivity.child_id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultActivity)

                return repo.updateByChild(defaultActivity)
                    .then(activity => {

                        activity = activity.toJSON()

                        assert.property(activity, 'id')
                        assert.propertyVal(activity, 'id', activity.id)
                        assert.property(activity, 'start_time')
                        assert.propertyVal(activity, 'start_time', activity.start_time)
                        assert.property(activity, 'end_time')
                        assert.propertyVal(activity, 'end_time', activity.end_time)
                        assert.property(activity, 'duration')
                        assert.propertyVal(activity, 'duration', activity.duration)
                        assert.property(activity, 'name')
                        assert.propertyVal(activity, 'name', activity.name)
                        assert.property(activity, 'calories')
                        assert.propertyVal(activity, 'calories', activity.calories)
                        assert.property(activity, 'levels')
                        assert.propertyVal(activity, 'levels', activity.levels)
                        assert.property(activity, 'steps')
                        assert.propertyVal(activity, 'steps', activity.steps)
                        assert.property(activity, 'child_id')
                        assert.propertyVal(activity, 'child_id', activity.child_id)
                    })
            })
        })

        context('when the physical activity is not found', () => {
            it('should return undefined representing that physical activity was not found', () => {
                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: {  _id: defaultActivity.id,
                                        child_id: defaultActivity.child_id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return repo.updateByChild(defaultActivity)
                    .then((result: any) => {
                        assert.isNotNull(result)
                        assert.isUndefined(result)
                        assert.isNotObject(result)
                    })
            })
        })

        context('when the physical activity id is invalid', () => {
            it('should return undefined representing that there is an invalid parameter', () => {

                defaultActivity.id = '5b4b'

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: {  child_id: defaultActivity.child_id,
                                        _id: defaultActivity.id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return repo.updateByChild(defaultActivity)
                    .then((result: any) => {
                        assert.isNotNull(result)
                        assert.isUndefined(result)
                        assert.isNotObject(result)
                    })
            })
        })

        context('when the physical activity child_id is invalid', () => {
            it('should return undefined representing that there is an invalid parameter', () => {

                defaultActivity.id = `${new ObjectID()}`
                defaultActivity.child_id = '5b4b'

                const customQueryMock: any = {
                    toJSON: () => {
                        return {
                            fields: {},
                            ordination: {},
                            pagination: { page: 1, limit: 100, skip: 0 },
                            filters: {  child_id: defaultActivity.child_id,
                                        _id: defaultActivity.id }
                        }
                    }
                }

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return repo.updateByChild(defaultActivity)
                    .then((result: any) => {
                        assert.isNotNull(result)
                        assert.isUndefined(result)
                        assert.isNotObject(result)
                    })
            })
        })
    })

    describe('removeByChild(activityId: string | number, childId: string)', () => {
        context('when the physical activity is found and the delete operation is done successfully', () => {
            it('should return true for confirm delete', () => {

                defaultActivity.child_id = '5a62be07de34500146d9c544'

                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ child_id: defaultActivity.child_id, _id: defaultActivity.id })
                    .chain('exec')
                    .resolves(true)

                return repo.removeByChild(defaultActivity.id!, defaultActivity.child_id)
                    .then((isDeleted: boolean) => {
                        assert.isBoolean(isDeleted)
                        assert.isTrue(isDeleted)
                    })
            })
        })

        context('when the physical activity is not found', () => {
            it('should return false for confirm that the physical activity was not found', () => {

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

        context('when the physical activity id is invalid', () => {
            it('should return false for confirm that there is an invalid parameter', () => {

                defaultActivity.id = '1a2b3c'

                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ child_id: defaultActivity.child_id, _id: defaultActivity.id })
                    .chain('exec')
                    .resolves(false)

                return repo.removeByChild(defaultActivity.id, defaultActivity.child_id)
                    .then((isDeleted: boolean) => {
                        assert.isBoolean(isDeleted)
                        assert.isFalse(isDeleted)
                    })
            })
        })

        context('when the physical activity child_id is invalid', () => {
            it('should return false for confirm that there is an invalid parameter', () => {

                defaultActivity.id = `${new ObjectID()}`
                defaultActivity.child_id = '1a2b3c'

                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ child_id: defaultActivity.child_id, _id: defaultActivity.id })
                    .chain('exec')
                    .resolves(false)

                return repo.removeByChild(defaultActivity.id!, defaultActivity.child_id)
                    .then((isDeleted: boolean) => {
                        assert.isBoolean(isDeleted)
                        assert.isFalse(isDeleted)
                    })
            })
        })
    })
})
