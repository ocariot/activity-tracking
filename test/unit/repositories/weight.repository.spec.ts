import sinon from 'sinon'
import { assert } from 'chai'
import { EntityMapperMock } from '../../mocks/entity.mapper.mock'
import { CustomLoggerMock } from '../../mocks/custom.logger.mock'
import { ObjectID } from 'bson'
import { MeasurementRepoModel } from '../../../src/infrastructure/database/schema/measurement.schema'
import { Weight } from '../../../src/application/domain/model/weight'
import { WeightMock } from '../../mocks/weight.mock'
import { IWeightRepository } from '../../../src/application/port/weight.repository.interface'
import { WeightRepository } from '../../../src/infrastructure/repository/weight.repository'
import { MeasurementType } from '../../../src/application/domain/model/measurement'
import { Query } from '../../../src/infrastructure/repository/query/query'

require('sinon-mongoose')

describe('Repositories: WeightRepository', () => {
    const defaultWeight: Weight = new WeightMock()

    const modelFake: any = MeasurementRepoModel
    const weightRepo: IWeightRepository = new WeightRepository(modelFake, new EntityMapperMock(), new CustomLoggerMock())

    const queryMock: any = {
        toJSON: () => {
            return {
                fields: {},
                ordination: {},
                pagination: { page: 1, limit: 100, skip: 0 },
                filters: {  timestamp: defaultWeight.timestamp,
                            child_id: defaultWeight.child_id,
                            type: defaultWeight.type }
            }
        }
    }

    afterEach(() => {
        sinon.restore()
    })

    describe('create(item: Weight)', () => {
        context('when create a Weight with success', () => {
            it('should return a Weight object', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(defaultWeight)
                    .chain('exec')
                    .resolves(defaultWeight)
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ _id: defaultWeight.id })
                    .chain('exec')
                    .resolves(defaultWeight)

                return weightRepo.create(defaultWeight)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultWeight.id)
                        assert.propertyVal(result, 'type', defaultWeight.type)
                        assert.propertyVal(result, 'timestamp', defaultWeight.timestamp)
                        assert.propertyVal(result, 'value', defaultWeight.value)
                        assert.propertyVal(result, 'unit', defaultWeight.unit)
                        assert.propertyVal(result, 'child_id', defaultWeight.child_id)
                        assert.propertyVal(result, 'body_fat', defaultWeight.body_fat)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('create')
                    .withArgs(defaultWeight)
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...' })
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs({ _id: defaultWeight.id })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                        description: 'Please try again later...' })

                return weightRepo.create(defaultWeight)
                    .catch(err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('checkExist(weight: Weight)', () => {
        context('when the Weight is found', () => {
            it('should return true if exists in search by the filters bellow', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(true)

                return weightRepo.checkExist(defaultWeight)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when the Weight is not found in search without filters', () => {
            it('should return false', () => {
                const otherWeight: Weight = new WeightMock()
                otherWeight.type = undefined
                otherWeight.timestamp = undefined
                otherWeight.child_id = undefined
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs()
                    .chain('exec')
                    .resolves(false)

                return weightRepo.checkExist(otherWeight)
                    .then(result => {
                        assert.isFalse(result)
                    })
            })
        })

        context('when the Weight is not found', () => {
            it('should return false', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('exec')
                    .resolves(false)

                return weightRepo.checkExist(defaultWeight)
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

                return weightRepo.checkExist(defaultWeight)
                    .catch((err: any) => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('find(query: IQuery)', () => {
        const query: Query = new Query()
        query.ordination = new Map()
        query.filters = { child_id: defaultWeight.child_id }
        context('when there are Weight objects associated with the query parameters', () => {
            it('should return a list of Weight objects', () => {
                const resultExpected = new Array<Weight>(defaultWeight)

                sinon
                    .mock(modelFake)
                    .expects('find')
                    .chain('sort')
                    .withArgs({})
                    .chain('skip')
                    .withArgs(0)
                    .chain('limit')
                    .withArgs(100)
                    .chain('populate')
                    .withArgs('body_fat')
                    .chain('exec')
                    .resolves(resultExpected)

                return weightRepo.find(query)
                    .then((weightArr: Array<Weight>) => {
                        assert.isNotEmpty(weightArr)
                        assert.propertyVal(weightArr[0], 'id', defaultWeight.id)
                        assert.propertyVal(weightArr[0], 'type', defaultWeight.type)
                        assert.propertyVal(weightArr[0], 'timestamp', defaultWeight.timestamp)
                        assert.propertyVal(weightArr[0], 'value', defaultWeight.value)
                        assert.propertyVal(weightArr[0], 'unit', defaultWeight.unit)
                        assert.propertyVal(weightArr[0], 'child_id', defaultWeight.child_id)
                        assert.propertyVal(weightArr[0], 'body_fat', defaultWeight.body_fat)
                    })
            })
        })

        context('when there are no Weight objects in database', () => {
            it('should return a empty list', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .chain('sort')
                    .withArgs({})
                    .chain('skip')
                    .withArgs(0)
                    .chain('limit')
                    .withArgs(100)
                    .chain('populate')
                    .withArgs('body_fat')
                    .chain('exec')
                    .resolves([])

                return weightRepo.find(query)
                    .then(weightArr => {
                        assert.equal(weightArr.length, 0)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('find')
                    .chain('sort')
                    .withArgs({})
                    .chain('skip')
                    .withArgs(0)
                    .chain('limit')
                    .withArgs(100)
                    .chain('populate')
                    .withArgs('body_fat')
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return weightRepo.find(query)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('findOne(query: IQuery)', () => {
        context('when there is a Weight object associated with that id', () => {
            it('should return the Weight', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('populate')
                    .withArgs('body_fat')
                    .chain('exec')
                    .resolves(defaultWeight)

                return weightRepo.findOne(queryMock)
                    .then(result => {
                        assert.propertyVal(result, 'id', defaultWeight.id)
                        assert.propertyVal(result, 'type', defaultWeight.type)
                        assert.propertyVal(result, 'timestamp', defaultWeight.timestamp)
                        assert.propertyVal(result, 'value', defaultWeight.value)
                        assert.propertyVal(result, 'unit', defaultWeight.unit)
                        assert.propertyVal(result, 'child_id', defaultWeight.child_id)
                        assert.propertyVal(result, 'body_fat', defaultWeight.body_fat)
                    })
            })
        })

        context('when there is no Weight with this id in the database', () => {
            it('should return undefined', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('populate')
                    .withArgs('body_fat')
                    .chain('exec')
                    .resolves(undefined)

                return weightRepo.findOne(queryMock)
                    .then(result => {
                        assert.isUndefined(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOne')
                    .withArgs(queryMock.toJSON().filters)
                    .chain('populate')
                    .withArgs('body_fat')
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return weightRepo.findOne(queryMock)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('removeByChild(weightId: string, childId: string, measurementType: string)', () => {
        context('when the Weight is found and the delete operation is done successfully', () => {
            it('should return true for confirm delete', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ child_id: defaultWeight.child_id, _id: defaultWeight.id, type: defaultWeight.type })
                    .chain('exec')
                    .resolves(true)

                return weightRepo.removeByChild(defaultWeight.id!, defaultWeight.child_id!, defaultWeight.type!)
                    .then((result: boolean) => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when the Weight is not found', () => {
            it('should return false for confirm that the Weight was not found', () => {
                const randomChildId: any = new ObjectID()

                sinon
                    .mock(modelFake)
                    .expects('findOneAndDelete')
                    .withArgs({ child_id: randomChildId, _id: defaultWeight.id, type: defaultWeight.type })
                    .chain('exec')
                    .resolves(false)

                return weightRepo.removeByChild(defaultWeight.id!, randomChildId, defaultWeight.type!)
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
                    .withArgs({ child_id: defaultWeight.child_id, _id: defaultWeight.id, type: defaultWeight.type })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return weightRepo.removeByChild(defaultWeight.id!, defaultWeight.child_id!, defaultWeight.type!)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('removeAllWeightFromChild(childId: string)', () => {
        context('when there is at least one Weight associated with that childId and the delete operation is done successfully', () => {
            it('should return true for confirm delete', () => {
                sinon
                    .mock(modelFake)
                    .expects('deleteMany')
                    .withArgs({ child_id: defaultWeight.child_id })
                    .resolves(true)

                return weightRepo.removeAllWeightFromChild(defaultWeight.child_id!)
                    .then((result: boolean) => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when there is no Weight associated with that childId', () => {
            it('should return false', () => {
                const randomChildId: any = new ObjectID()

                sinon
                    .mock(modelFake)
                    .expects('deleteMany')
                    .withArgs({ child_id: randomChildId })
                    .resolves(false)

                return weightRepo.removeAllWeightFromChild(randomChildId)
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
                    .withArgs({ child_id: defaultWeight.child_id })
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return weightRepo.removeAllWeightFromChild(defaultWeight.child_id!)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('disassociateBodyFat(bodyFatId: string)', () => {
        context('when the BodyFat is found and successfully disassociated from the Weight', () => {
            it('should return true representing the success of the operation', () => {

                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ body_fat: defaultWeight.body_fat!.id, type: MeasurementType.WEIGHT })
                    .chain('exec')
                    .resolves(true)

                return weightRepo.disassociateBodyFat(defaultWeight.body_fat!.id!)
                    .then(result => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when there is no BodyFat with this id associated with the Weight', () => {
            it('should return true representing the success of the operation even though there is no BodyFat associated ' +
                'with the Weight', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ body_fat: defaultWeight.body_fat!.id, type: MeasurementType.WEIGHT })
                    .chain('exec')
                    .resolves(true)

                return weightRepo.disassociateBodyFat(defaultWeight.body_fat!.id!)
                    .then((result: any) => {
                        assert.isTrue(result)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('findOneAndUpdate')
                    .withArgs({ body_fat: defaultWeight.body_fat!.id, type: MeasurementType.WEIGHT })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return weightRepo.disassociateBodyFat(defaultWeight.body_fat!.id!)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })

    describe('countWeights(childId: string)', () => {
        context('when there is at least one weight associated with the child received', () => {
            it('should return how many weights are associated with such child in the database', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs({ child_id: defaultWeight.child_id, type: MeasurementType.WEIGHT })
                    .chain('exec')
                    .resolves(2)

                return weightRepo.countWeights(defaultWeight.child_id!)
                    .then((countWeights: number) => {
                        assert.equal(countWeights, 2)
                    })
            })
        })

        context('when there are no weights associated with the child received', () => {
            it('should return 0', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs({ child_id: defaultWeight.child_id, type: MeasurementType.WEIGHT })
                    .chain('exec')
                    .resolves(0)

                return weightRepo.countWeights(defaultWeight.child_id!)
                    .then((countWeights: number) => {
                        assert.equal(countWeights, 0)
                    })
            })
        })

        context('when a database error occurs', () => {
            it('should throw a RepositoryException', () => {
                sinon
                    .mock(modelFake)
                    .expects('countDocuments')
                    .withArgs({ child_id: defaultWeight.child_id, type: MeasurementType.WEIGHT })
                    .chain('exec')
                    .rejects({ message: 'An internal error has occurred in the database!',
                               description: 'Please try again later...' })

                return weightRepo.countWeights(defaultWeight.child_id!)
                    .catch (err => {
                        assert.propertyVal(err, 'message', 'An internal error has occurred in the database!')
                        assert.propertyVal(err, 'description', 'Please try again later...')
                    })
            })
        })
    })
})
