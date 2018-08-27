import sinon from 'sinon'
import { Activity, IActivity } from './../../../src/models/activity'
import { ActivityRepository } from '../../../src/repositories/activity.repository'
import { assert } from 'chai'
import { IExceptionError, ApiException } from '../../../src/exceptions/api.exception'
import { callbackify, isBoolean } from 'util';
import { resolve } from 'dns';

const ActivityFake: any = Activity

describe('Repositories: Activity', () => {
    const defaultActivity: any =
    {
        "id": "5a62be07de34500146d9c544",
        "user_id": "5a62be07d6f33400146c9b61",
        "name": "walk",
        "location": "UEPB - Universidade Estadual da Paraíba",
        "start_time": "2018-08-07T08:25:00.000",
        "end_time": "2018-08-07T09:25:00.000",
        "duration": 1075000,
        "intensity_level": "very",
        "distance": 25.8,
        "calories": 123,
        "steps": 1701
    }

    beforeEach(() => {
        sinon.stub(ActivityFake, 'find')
        sinon.stub(ActivityFake, 'findOne')
        sinon.stub(ActivityFake, 'create')

    })

    afterEach(() => {
        ActivityFake.find.restore()
        ActivityFake.findOne.restore()
        ActivityFake.create.restore()

    })

    describe('save()', () => {
        it('should return the saved activity', () => {

            let newActivity: IActivity = new Activity(defaultActivity)

            ActivityFake.create
                .withArgs(newActivity)
                .resolves(newActivity)

            let activityRepository: any = new ActivityRepository(ActivityFake)

            return activityRepository.save(newActivity)
                .then((activity) => {
                    assert.isNotNull(activity)
                    assert.equal(activity._id, newActivity._id)
                    assert.equal(activity.name, newActivity.name)
                })
        })

        context('When there are validation errors', () => {
            it('should return error 400 for the activity with missing required fields', () => {

                let incompleteActivity: IActivity = new Activity({ name: "walk", distance: 25.8, calories: 123, steps: 201 })

                ActivityFake.create
                    .withArgs(incompleteActivity)
                    .rejects({ name: 'ValidationError' })

                let activityRepository = new ActivityRepository(ActivityFake)

                return activityRepository.save(incompleteActivity)
                    .catch((err: IExceptionError) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 400)
                        assert.equal(err.message, 'Required fields were not included!')
                    })
            })

            it('should return error 409 when activity already exists', () => {

                ActivityFake.create
                    .withArgs(defaultActivity)
                    .rejects({ code: 11000 })

                let activityRepository = new ActivityRepository(ActivityFake)

                return activityRepository.save(defaultActivity)
                    .catch((err: IExceptionError) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 409)
                        assert.equal(err.message, 'Duplicate data is not allowed!')
                    })
            })
        })
    })

    describe('getAll()', () => {
        it('should return all activities associated with an user', () => {

            ActivityFake.find
                .withArgs({})
                .resolves([defaultActivity])

            let activityRepository = new ActivityRepository(ActivityFake)
            let resultExpected: Array<IActivity> = [defaultActivity]

            return activityRepository.getAll()
                .then((activities) => {
                    assert.isNotNull(activities)
                    assert.equal(activities.length, resultExpected.length)
                    assert.equal(activities[0], resultExpected[0])
                })
        })

        context('when there are no activities associated with an user', () => {
            it('should return error 404 and message: Activities not found!', () => {

                ActivityFake.find
                    .withArgs({})
                    .resolves([])

                let activityRepository = new ActivityRepository(ActivityFake)

                return activityRepository.getAll()
                    .catch((err: IExceptionError) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 404)
                        assert.equal(err.message, "Activities not found!")
                    })
            })
        })
    })

    describe('getById()', () => {
        it('should return a unique activity associated with an user', () => {

            ActivityFake.findOne
                .withArgs({ _id: defaultActivity._id, user_id: defaultActivity.user_id })
                .resolves(defaultActivity)

            let activityRepository = new ActivityRepository(ActivityFake)

            return activityRepository.getById(defaultActivity._id, defaultActivity.user_id)
                .then((activity) => {
                    assert.isNotNull(activity)
                    assert.equal(activity._id, defaultActivity._id)
                    assert.equal(activity.user_id, defaultActivity.user_id)
                })
        })

        context('when activity is not found', () => {
            it('should return error 404 and message: Activities not found!', () => {

                ActivityFake.findOne
                    .withArgs({ _id: defaultActivity._id, user_id: defaultActivity.user_id })
                    .resolves()

                let activityRepository = new ActivityRepository(ActivityFake)

                return activityRepository.getById(defaultActivity._id, defaultActivity.user_id)
                    .catch((err: IExceptionError) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 404)
                        assert.equal(err.message, 'Activity not found!')
                    })
            })
        })

        context('when activity id is not the valid format', () => {
            it('should return error 400 and message: Invalid parameter!', () => {

                ActivityFake.findOne
                    .withArgs({ _id: "784", user_id: defaultActivity.user_id })
                    .rejects({ name: 'CastError' })

                let activityRepository = new ActivityRepository(ActivityFake);

                return activityRepository.getById("784", defaultActivity.user_id)
                    .catch((err: IExceptionError) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 400)
                        assert.equal(err.message, "Invalid parameter!")
                    })
            })
        })
    })

    describe('update()', () => {
        it('should return the updated activity', () => {
            let updatedActivity: any =
            {
                "id": "5a62be07de34500146d9c544",
                "user_id": "5a62be07d6f33400146c9b61",
                "name": "run",
                "location": "Parque da Criança",
                "start_time": "2018-08-07T08:25:00.000",
                "end_time": "2018-08-07T09:25:00.000",
                "duration": 1075000,
                "intensity_level": "very",
                "distance": 850.3,
                "calories": 400,
                "steps": 10447
            }

            let mockExec = {
                exec: function (callback) {
                    callback(null, updatedActivity);
                }
            }

            sinon.stub(ActivityFake, "findByIdAndUpdate").returns(mockExec)

            ActivityFake.findByIdAndUpdate
                .withArgs({ _id: updatedActivity._id, updatedActivity })
                .resolves(mockExec)

            let activityRepository: any = new ActivityRepository(ActivityFake)

            return activityRepository.update(updatedActivity)
                .then((activity) => {
                    assert.isNotNull(activity)
                    assert.equal(activity._id, updatedActivity._id)
                    assert.equal(activity.name, updatedActivity.name)
                    ActivityFake.findByIdAndUpdate.restore();
                })
        })

        context('when the update generate a duplicate data', () => {
            it('should return error 409 and message: Duplicate data is not allowed!', () => {

                let updatedActivity: any =
                {
                    "id": "5a62be07de34500146d9c54467",
                    "user_id": "5a62be07d6f33400146c9b61",
                    "name": "run",
                    "location": "Parque da Criança",
                    "distance": 850.3,
                    "calories": 400,
                }

                let mockExec = {
                    exec: function (err) {
                        err({ code: 11000 })
                    }
                }

                sinon.stub(ActivityFake, "findByIdAndUpdate").returns(mockExec)

                ActivityFake.findByIdAndUpdate
                    .withArgs({ _id: updatedActivity._id, updatedActivity })
                    .rejects({ code: 11000 })

                let activityRepository = new ActivityRepository(ActivityFake);

                return activityRepository.update(updatedActivity)
                    .catch((err: IExceptionError) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 409)
                        assert.equal(err.message, "Duplicate data is not allowed!")
                        ActivityFake.findByIdAndUpdate.restore();
                    })
            })
        })


        context('when activity id is not the valid format', () => {
            it('should return error 400 and message: Invalid parameter!', () => {

                let updatedActivity: any =
                {
                    "id": "5a62be07de34500146d9c54467",
                    "user_id": "5a62be07d6f33400146c9b61",
                    "name": "run",
                    "location": "Parque da Criança",
                    "distance": 850.3,
                    "calories": 400,
                }

                let mockExec = {
                    exec: function (err) {
                        err({ name: 'CastError' })
                    }
                }

                sinon.stub(ActivityFake, "findByIdAndUpdate").returns(mockExec)

                ActivityFake.findByIdAndUpdate
                    .withArgs({ _id: updatedActivity._id, updatedActivity })
                    .rejects({ name: 'CastError' })

                let activityRepository = new ActivityRepository(ActivityFake);

                return activityRepository.update(updatedActivity)
                    .catch((err: IExceptionError) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 400)
                        assert.equal(err.message, "Invalid parameter!")
                        ActivityFake.findByIdAndUpdate.restore();
                    })
            })
        })
    })

    describe('delete()', () => {
        it('should return true when activity is deleted', () => {

            let mockExec = {
                exec: function (err) {
                    err(null)
                }
            }

            sinon.stub(ActivityFake, "findByIdAndDelete").returns(mockExec)

            ActivityFake.findByIdAndDelete
                .withArgs(defaultActivity._id)
                .resolves(true)

            let activityRepository: any = new ActivityRepository(ActivityFake)

            return activityRepository.delete(defaultActivity._id)
                .then((isDeleted) => {
                    assert.isBoolean(isDeleted)
                    assert.isTrue(isDeleted)
                    ActivityFake.findByIdAndDelete.restore();
                })
        })

        context('when activity id is not the valid format', () => {
            it('should return error 400 and message: Invalid parameter!', () => {

                let mockExec = {
                    exec: function (err) {
                        err({ name: 'CastError' })
                    }
                }

                sinon.stub(ActivityFake, "findByIdAndDelete").returns(mockExec)

                ActivityFake.findByIdAndDelete
                    .withArgs("784")
                    .rejects({ name: 'CastError' })

                let activityRepository = new ActivityRepository(ActivityFake);
                
                return activityRepository.delete("784")
                    .catch((err: IExceptionError) => {
                        assert.isNotNull(err)
                        assert.equal(err.code, 400)
                        assert.equal(err.message, "Invalid parameter!")
                        ActivityFake.findByIdAndDelete.restore();
                    })
            })
        })
    })
})