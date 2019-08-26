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

describe('Repositories: PhysicalActivityRepository', () => {
    const defaultActivity: PhysicalActivity = new PhysicalActivityMock()

    const modelFake: any = ActivityRepoModel
    const activityRepo: IPhysicalActivityRepository =
        new PhysicalActivityRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())

    const queryMock: any = {
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

    afterEach(() => {
        sinon.restore()
    })

    describe('checkExist(activity: PhysicalActivity)', () => {
        context('when the physical activity is found', () => {
            it('should return true if exists in search by the filters bellow', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(true)

                return activityRepo.checkExist(defaultActivity)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when the physical activity is not found in search without filters', () => {
            it('should return false', () => {
                const otherActivity: PhysicalActivity = new PhysicalActivityMock()
                otherActivity.start_time = undefined
                otherActivity.child_id = ''
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs()
                    .chain('exec')
                    .resolves(false)

                return activityRepo.checkExist(otherActivity)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when the physical activity is not found', () => {
            it('should return false', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(false)

                return activityRepo.checkExist(defaultActivity)
                    .then(result => {
                        assert.isFalse(result)
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

                return activityRepo.checkExist(defaultActivity)
                    .catch((err: any) => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('updateByChild(activity: PhysicalActivity)', () => {

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

        context('when the physical activity is found and the update operation is done successfully', () => {
            it('should return the updated physical activity', () => {
                defaultActivity.id = `${new ObjectID()}`

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultActivity)

                return activityRepo.updateByChild(defaultActivity)
                    .then(activity => {
                        activity = activity.toJSON()

                        assert.propertyVal(activity, 'id', activity.id)
                        assert.propertyVal(activity, 'start_time', activity.start_time)
                        assert.propertyVal(activity, 'end_time', activity.end_time)
                        assert.propertyVal(activity, 'duration', activity.duration)
                        assert.propertyVal(activity, 'name', activity.name)
                        assert.propertyVal(activity, 'calories', activity.calories)
                        assert.propertyVal(activity, 'levels', activity.levels)
                        assert.propertyVal(activity, 'steps', activity.steps)
                        assert.propertyVal(activity, 'child_id', activity.child_id)
                        assert.propertyVal(activity, 'heart_rate', activity.heart_rate)
                    })
            })
        })

        context('when the physical activity is not found', () => {
            it('should return undefined representing that physical activity was not found', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return activityRepo.updateByChild(defaultActivity)
                    .then((result: any) => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return activityRepo.updateByChild(defaultActivity)
                    .catch((err) => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
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

                return activityRepo.removeByChild(defaultActivity.id!, defaultActivity.child_id)
                    .then((result: boolean) => {
                        assert.isTrue(result)
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

                return activityRepo.removeByChild(randomId, randomChildId)
                    .then((result: boolean) => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                defaultActivity.id = '1a2b3c'

                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ child_id: defaultActivity.child_id, _id: defaultActivity.id })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return activityRepo.removeByChild(defaultActivity.id, defaultActivity.child_id)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('removeAllActivitiesFromChild(childId: string)', () => {
        context('when there is at least one physical activity associated with that childID and the delete operation is ' +
            'done successfully', () => {
            it('should return true for confirm delete', () => {
                sinon
                    .mock(modelFake)
                    .expects('deleteMany')
                    .withArgs({ child_id: defaultActivity.child_id })
                    .resolves(true)

                return activityRepo.removeAllActivitiesFromChild(defaultActivity.child_id)
                    .then((result: boolean) => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when there is no physical activity associated with that childId', () => {
            it('should return false', () => {
                const randomChildId: any = new ObjectID()

                sinon
                    .mock(modelFake)
                    .expects('deleteMany')
                    .withArgs({ child_id: randomChildId })
                    .resolves(false)

                return activityRepo.removeAllActivitiesFromChild(randomChildId)
                    .then((result: boolean) => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('deleteMany')
                    .withArgs({ child_id: defaultActivity.child_id })
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return activityRepo.removeAllActivitiesFromChild(defaultActivity.child_id)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('countActivities(childId: string)', () => {
        context('when there is at least one physical activity associated with the child received', () => {
            it('should return how many physical activities are associated with such child in the database', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs({ child_id: defaultActivity.child_id })
                    .chain('exec')
                    .resolves(2)

                return activityRepo.countActivities(defaultActivity.child_id)
                    .then((countActivities: number) => {
                        assert.equal(countActivities, 2)
                    })
            })
        })

        context('when there are no physical activities associated with the child received', () => {
            it('should return 0', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs({ child_id: defaultActivity.child_id })
                    .chain('exec')
                    .resolves(0)

                return activityRepo.countActivities(defaultActivity.child_id)
                    .then((countActivities: number) => {
                        assert.equal(countActivities, 0)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs({ child_id: defaultActivity.child_id })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return activityRepo.countActivities(defaultActivity.child_id)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
