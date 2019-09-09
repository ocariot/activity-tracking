import sinon from 'sinon'
import { assert } from 'chai'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { ObjectID } from 'bson'
import { BodyFat } from '../../../src/application/domain/model/body.fat'
import { BodyFatMock } from '../../mocks/body.fat.mock'
import { MeasurementRepoModel } from '../../../src/infrastructure/database/schema/measurement.schema'
import { IBodyFatRepository } from '../../../src/application/port/body.fat.repository.interface'
import { BodyFatRepository } from '../../../src/infrastructure/repository/body.fat.repository'
import { MeasurementType } from '../../../src/application/domain/model/measurement'

require('sinon-mongoose')

describe('Repositories: BodyFatRepository', () => {
    const defaultBodyFat: BodyFat = new BodyFatMock()

    const modelFake: any = MeasurementRepoModel
    const bodyFatRepo: IBodyFatRepository = new BodyFatRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())

    const queryMock: any = {
        toJSON: () => {
            return {
                fields: {},
                ordination: {},
                pagination: { page: 1, limit: 100, skip: 0 },
                filters: {  timestamp: defaultBodyFat.timestamp,
                            child_id: defaultBodyFat.child_id,
                            type: defaultBodyFat.type }
            }
        }
    }

    afterEach(() => {
        sinon.restore()
    })

    describe('checkExist(bodyFat: BodyFat)', () => {
        context('when the BodyFat is found', () => {
            it('should return true if exists in search by the filters bellow', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(true)

                return bodyFatRepo.checkExist(defaultBodyFat)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when the BodyFat is not found in search without filters', () => {
            it('should return false', () => {
                const otherBodyFat: BodyFat = new BodyFatMock()
                otherBodyFat.type = undefined
                otherBodyFat.timestamp = undefined
                otherBodyFat.child_id = undefined
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs()
                    .chain('exec')
                    .resolves(false)

                return bodyFatRepo.checkExist(otherBodyFat)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when the BodyFat is not found', () => {
            it('should return false', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(false)

                return bodyFatRepo.checkExist(defaultBodyFat)
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

                return bodyFatRepo.checkExist(defaultBodyFat)
                    .catch((err: any) => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('selectByChild(bodyFatTimestamp: Date, childId: string, bodyFatType: string)', () => {
        context('when the BodyFat is found', () => {
            it('should return the BodyFat found', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(defaultBodyFat)

                return bodyFatRepo.selectByChild(defaultBodyFat.timestamp!, defaultBodyFat.child_id!, defaultBodyFat.type!)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultBodyFat.id)
                        assert.propertyVal(result, 'type', defaultBodyFat.type)
                        assert.propertyVal(result, 'timestamp', defaultBodyFat.timestamp)
                        assert.propertyVal(result, 'value', defaultBodyFat.value)
                        assert.propertyVal(result, 'unit', defaultBodyFat.unit)
                        assert.propertyVal(result, 'child_id', defaultBodyFat.child_id)
                    })
            })
        })

        context('when the BodyFat is not found', () => {
            it('should return undefined', () => {
                queryMock.toJSON().filters.timestamp = new Date()

                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(undefined)

                return bodyFatRepo.selectByChild(defaultBodyFat.timestamp!, defaultBodyFat.child_id!, defaultBodyFat.type!)
                    .then(result => {
                        assert.equal(result, undefined)
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

                return bodyFatRepo.selectByChild(defaultBodyFat.timestamp!, defaultBodyFat.child_id!, defaultBodyFat.type!)
                    .catch((err: any) => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('removeByChild(bodyFatId: string, childId: string, measurementType: string)', () => {
        context('when the BodyFat is found and the delete operation is done successfully', () => {
            it('should return true for confirm delete', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ child_id: defaultBodyFat.child_id, _id: defaultBodyFat.id, type: defaultBodyFat.type })
                    .chain('exec')
                    .resolves(true)

                return bodyFatRepo.removeByChild(defaultBodyFat.id!, defaultBodyFat.child_id!, defaultBodyFat.type!)
                    .then((result: boolean) => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when the BodyFat is not found', () => {
            it('should return false for confirm that the BodyFat was not found', () => {
                const randomChildId: any = new ObjectID()

                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ child_id: randomChildId, _id: defaultBodyFat.id, type: defaultBodyFat.type })
                    .chain('exec')
                    .resolves(false)

                return bodyFatRepo.removeByChild(defaultBodyFat.id!, randomChildId, defaultBodyFat.type!)
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
                    .withArgs({ child_id: defaultBodyFat.child_id, _id: defaultBodyFat.id, type: defaultBodyFat.type })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return bodyFatRepo.removeByChild(defaultBodyFat.id!, defaultBodyFat.child_id!, defaultBodyFat.type!)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('removeAllBodyFatFromChild(childId: string)', () => {
        context('when there is at least one BodyFat associated with that childId and the delete operation is done successfully', () => {
            it('should return true for confirm delete', () => {
                sinon
                    .mock(modelFake)
                    .expects('deleteMany')
                    .withArgs({ child_id: defaultBodyFat.child_id })
                    .resolves(true)

                return bodyFatRepo.removeAllBodyFatFromChild(defaultBodyFat.child_id!)
                    .then((result: boolean) => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when there is no BodyFat associated with that childId', () => {
            it('should return false', () => {
                const randomChildId: any = new ObjectID()

                sinon
                    .mock(modelFake)
                    .expects('deleteMany')
                    .withArgs({ child_id: randomChildId })
                    .resolves(false)

                return bodyFatRepo.removeAllBodyFatFromChild(randomChildId)
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
                    .withArgs({ child_id: defaultBodyFat.child_id })
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return bodyFatRepo.removeAllBodyFatFromChild(defaultBodyFat.child_id!)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('countBodyFats(childId: string)', () => {
        context('when there is at least one body fat associated with the child received', () => {
            it('should return how many body fats are associated with such child in the database', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs({ child_id: defaultBodyFat.child_id, type: MeasurementType.BODY_FAT })
                    .chain('exec')
                    .resolves(2)

                return bodyFatRepo.countBodyFats(defaultBodyFat.child_id!)
                    .then((countBodyFats: number) => {
                        assert.equal(countBodyFats, 2)
                    })
            })
        })

        context('when there are no body fats associated with the child received', () => {
            it('should return 0', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs({ child_id: defaultBodyFat.child_id, type: MeasurementType.BODY_FAT })
                    .chain('exec')
                    .resolves(0)

                return bodyFatRepo.countBodyFats(defaultBodyFat.child_id!)
                    .then((countBodyFats: number) => {
                        assert.equal(countBodyFats, 0)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs({ child_id: defaultBodyFat.child_id, type: MeasurementType.BODY_FAT })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return bodyFatRepo.countBodyFats(defaultBodyFat.child_id!)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
