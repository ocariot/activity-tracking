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

describe('Repositories: SleepRepository', () => {
    const defaultSleep: Sleep = new SleepMock()

    const modelFake: any = SleepRepoModel
    const sleepRepo: ISleepRepository = new SleepRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())

    const queryMock: any = {
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

    afterEach(() => {
        sinon.restore()
    })

    describe('checkExist(sleep: Sleep)', () => {
        context('when the sleep is found', () => {
            it('should return true if exists in search by the filters bellow', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(true)

                return sleepRepo.checkExist(defaultSleep)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when the sleep is not found in search without filters', () => {
            it('should return false', () => {
                const otherSleep: Sleep = new SleepMock()
                otherSleep.start_time = undefined
                otherSleep.child_id = ''
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs()
                    .chain('exec')
                    .resolves(false)

                return sleepRepo.checkExist(otherSleep)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when the sleep is not found', () => {
            it('should return false', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(false)

                return sleepRepo.checkExist(defaultSleep)
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

                return sleepRepo.checkExist(defaultSleep)
                    .catch((err: any) => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('updateByChild(sleep: Sleep)', () => {

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

        context('when the sleep is found and the update operation is done successfully', () => {
            it('should return the updated sleep', () => {
                defaultSleep.id = `${new ObjectID()}`

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultSleep)

                return sleepRepo.updateByChild(defaultSleep)
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

        context('when the sleep is not found', () => {
            it('should return undefined representing that sleep was not found', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs(customQueryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return sleepRepo.updateByChild(defaultSleep)
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

                return sleepRepo.updateByChild(defaultSleep)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('removeByChild(sleepId: string, childId: string)', () => {
        context('when the sleep is found and the delete operation is done successfully', () => {
            it('should return true for confirm delete', () => {
                defaultSleep.child_id = '5a62be07de34500146d9c544'

                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ child_id: defaultSleep.child_id, _id: defaultSleep.id })
                    .chain('exec')
                    .resolves(true)

                return sleepRepo.removeByChild(defaultSleep.id!, defaultSleep.child_id)
                    .then((result: boolean) => {
                        assert.isTrue(result)
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

                return sleepRepo.removeByChild(randomId, randomChildId)
                    .then((result: boolean) => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ child_id: defaultSleep.child_id, _id: defaultSleep.id })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return sleepRepo.removeByChild(defaultSleep.id!, defaultSleep.child_id)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('removeAllSleepFromChild(childId: string)', () => {
        context('when there is at least one sleep associated with that childId and the delete operation is done successfully', () => {
            it('should return true for confirm delete', () => {
                defaultSleep.child_id = '5a62be07de34500146d9c544'

                sinon
                    .mock(modelFake)
                    .expects('deleteMany')
                    .withArgs({ child_id: defaultSleep.child_id })
                    .resolves(true)

                return sleepRepo.removeAllSleepFromChild(defaultSleep.child_id)
                    .then((result: boolean) => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when there is no sleep associated with that childId', () => {
            it('should return false', () => {
                const randomChildId: any = new ObjectID()

                sinon
                    .mock(modelFake)
                    .expects('deleteMany')
                    .withArgs({ child_id: randomChildId })
                    .resolves(false)

                return sleepRepo.removeAllSleepFromChild(randomChildId)
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
                    .withArgs({ child_id: defaultSleep.child_id })
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return sleepRepo.removeAllSleepFromChild(defaultSleep.child_id)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('countSleep(childId: string)', () => {
        context('when there is at least one sleep object associated with the child received', () => {
            it('should return how many sleep objects are associated with such child in the database', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs({ child_id: defaultSleep.child_id })
                    .chain('exec')
                    .resolves(2)

                return sleepRepo.countSleep(defaultSleep.child_id)
                    .then((countSleep: number) => {
                        assert.equal(countSleep, 2)
                    })
            })
        })

        context('when there are no sleep objects associated with the child received', () => {
            it('should return 0', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs({ child_id: defaultSleep.child_id })
                    .chain('exec')
                    .resolves(0)

                return sleepRepo.countSleep(defaultSleep.child_id)
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
                    .withArgs({ child_id: defaultSleep.child_id })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return sleepRepo.countSleep(defaultSleep.child_id)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
